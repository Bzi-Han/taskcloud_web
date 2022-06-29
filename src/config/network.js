import router from './router'
import crypto from './crypto'
import { ElMessage } from 'element-plus'

class Network {
    config = {
        baseUrl: '',
        intercepters: {
            beforeRequest: undefined,
            beforeResponse: undefined,
        },
        jwtToken: '',
        jwtTokenHeaderPrefix: 'Authorization',
        autoProcessJwtToken: true,
    };
    authorized = false;

    constructor(options) {
        const token = localStorage.getItem('token');
        if (this.config.autoProcessJwtToken && this.#hasValue(token)) {
            this.config.jwtToken = localStorage.getItem('token');
            this.authorized = true;
        }

        Object.assign(this.config, options)
    }

    #hasValue(data) {
        return undefined !== data && null !== data;
    }

    #formatData(params, json = true) {
        if ('string' === typeof params)
            return params;
        else if ('object' === typeof params) {
            if (json)
                return JSON.stringify(params);
            
            let result = '';
            Object.keys(params).forEach(key => {
                if ('' !== result)
                    result = `${result}&${key}=${encodeURIComponent(params[key])}`;
                else
                    result = `${key}=${encodeURIComponent(params[key])}`;
            });
            return result;
        } else
            throw `Unsupported parameter type: ${typeof params}`;
    }

    async #sendRequest(url, options) {
        if (this.#hasValue(this.config.intercepters.beforeRequest)) {
            await this.config.intercepters.beforeRequest(options);
            if (url !== options.url)
                url = options.url;

            options.url = undefined;
        }

        const fetchResult = await fetch(url, options);

        if (this.#hasValue(this.config.intercepters.beforeResponse))
            return await this.config.intercepters.beforeResponse(fetchResult);

        return await fetchResult.json();
    }

    async #pushData(method, path, params, headers, json) {
        params = this.#formatData(params, json);

        if (!headers.hasOwnProperty('Content-Type'))
            headers['Content-Type'] = json ? 'application/json' : 'application/x-www-form-urlencoded';

        if (this.config.autoProcessJwtToken && !headers.hasOwnProperty(this.config.jwtTokenHeaderPrefix))
            headers[this.config.jwtTokenHeaderPrefix] = this.config.jwtToken;

        let url = `${this.config.baseUrl}${path}`;
        let options = {
            method: method,
            headers: headers,
            body: params,
            url: url
        };
        
        return await this.#sendRequest(url, options);
    }

    async #pullData(method, path, params, headers) {
        if (this.#hasValue(params)) {
            path += '?' + this.#formatData(params, false);

            if (!headers.hasOwnProperty('Content-Type'))
                headers['Content-Type'] = 'application/x-www-form-urlencoded';
        }

        if (this.config.autoProcessJwtToken && !headers.hasOwnProperty(this.config.jwtTokenHeaderPrefix))
            headers[this.config.jwtTokenHeaderPrefix] = this.config.jwtToken;
            
        let url = `${this.config.baseUrl}${path}`;
        let options = {
            method: method,
            headers: headers,
            url: url
        };

        return await this.#sendRequest(url, options);
    }

    async post(path, params, headers = {}, json = true) {
        return await this.#pushData('POST', path, params, headers, json);
    }

    async put(path, params, headers = {}, json = true) {
        return await this.#pushData('PUT', path, params, headers, json);
    }

    async get(path, params, headers = {}) {
        return await this.#pullData('GET', path, params, headers);
    }

    async delete(path, params, headers = {}) {
        return await this.#pullData('DELETE', path, params, headers);
    }

    reset() {
        localStorage.removeItem('token');
        this.config.jwtToken = '';
        this.authorized = false;
    }
}

const network = new Network({baseUrl: 'http://localhost:8080'});

// 发送内容拦截器
network.config.intercepters.beforeRequest = async request => {
    // 对发送内容加密
    if ('POST' === request.method || 'PUT' === request.method)
        request.body = crypto.encrypt(request.body);
};

// 返回结果拦截器
network.config.intercepters.beforeResponse = async response => {
    // 对接收内容进行解密
    const result = crypto.decrypt(await response.text());

    if (400 === result.code || 401 === result.code || 403 === result.code) {
        ElMessage({
            message: result.message,
            type: 'error',
        });

        // redirect to login page
        if (401 === result.code) {
            if (network.authorized)
                network.reset();

            router.push('/');
        }
        
        throw result;
    }

    if (network.config.autoProcessJwtToken && response.headers.get('Authorization')) {
        network.config.jwtToken = response.headers.get('Authorization');
        localStorage.setItem('token', network.config.jwtToken);
        network.authorized = true;
    }

    return result;
};

export default network;