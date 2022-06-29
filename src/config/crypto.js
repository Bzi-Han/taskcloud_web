import CryptoJS from 'crypto-js'
import JSEncrypt from 'jsencrypt'

const encryptor = new JSEncrypt();
const encryptKeys = {'😂' : '514555364','😘' : '537147534','😍' : '956316553','😊' : '5594d3275','😁' : '4c586c417','😭' : '4b45592d2','😜' : '24c494320','😝' : '454241515','😄' : '570a6e5a6','🤪' : '145437038','🤑' : '269514b42','😑' : '4554d3630','😰' : '4d4947664','🤕' : 'd2d2d2d0a','👿' : '2b4d42765','👽' : '43204b455','😸' : '777705459','😻' : '82f424c6c','💀' : '486a44544','👹' : '6b3379503','🐷' : '92d2d2d2d','🐵' : '1774c7461','🐺' : '541413447','🐹' : '962334451','🐭' : '78514c384','🦁' : '454e44205','🐨' : '84e523372','🐱‍🚀' : 'e2b4e7843','🐱‍👓' : '675143397','😹' : '5141420a2','🐱‍💻' : '336a45786','🐿' : '2d2d2d2d2','🐖' : '151494441','🐇' : '73474a4f4','🐢' : 'd42454749','🐁' : '574397841','🐡' : '530755279','🦉' : '50a37594c','🦀' : '516238696','🐧' : '766779703','🕊' : '2d0a','🦇' : 'd41304743','🦋' : '4e2050554','🐌' : '4367490a3','👨‍👩‍👧‍👦' : '4e4144434','👨‍👨‍👧‍👧' : '6b6f4e4b6','👩‍👩‍👦‍👦' : 'd2d2d2d2d','👨‍👩‍👦' : 'd526c4672','👨‍👨‍👦' : 'c39584231','💏' : '357174475','👩‍👧' : '704c4c666','⛷' : '436a69516','🤺' : '616d777a5','👅' : '362b55464','👄' : '055424c49','🐛' : '446a5a747','👁' : 'b54635172','👣' : 'f544f6e39','🧠' : 'a33317849','👀' : 'f54534e41','👥' : '542476d74'};
const publicKey = ['🐿','🐢','🦋','😜','😭','🤕','😰','🦇','😘','🐹','😝','🐺','👨‍👩‍👧‍👦','🤑','🐱‍👓','🤪','🐛','😻','👩‍👧','🐨','😄','😸','👿','👥','👹','🐁','⛷','🐱‍🚀','💀','🐡','🦀','👀','👨‍👨‍👧‍👧','🧠','🐌','🐵','🐱‍💻','👨‍👩‍👦','🐇','👨‍👨‍👦','👅','👁','😂','👣','😁','😊','🐧','😍','🤺','🦉','🐭','😑','💏','🐖','😹','👩‍👩‍👦‍👦','🦁','👄','👽','🐷','🕊'];

const subKeys = {'😍' : '2','😁' : '2','😭' : '3','😄' : '5','🤪' : 'f','😑' : 'e','🤕' : 'a','👿' : '7','😸' : '4','😻' : '5','👹' : '9','🐭' : '3','🦁' : '4','🐨' : 'c','😹' : '2','🐖' : '2','🦉' : '6','🦀' : 'd','🐧' : '4','🕊' : '7','🦇' : '2','🐌' : '4','👨‍👨‍👧‍👧' : 'e','👩‍👩‍👦‍👦' : '5','👨‍👩‍👦' : 'd','👨‍👨‍👦' : '4','💏' : '7','🤺' : '3','👄' : '6','🐛' : '3','👣' : '3','👥' : '6'};
const aesKey = ['😭','👥','🕊','🤕','😄','🤪','😹','😑','🦁','🦉','👄','😁','😍','🦀','👣','👩‍👩‍👦‍👦','🐌','🐨','😸','🦇','🐭','🐖','👨‍👨‍👦','👨‍👨‍👧‍👧','💏','🤺','👿','👹','😻','🐧','🐛','👨‍👩‍👦'];

const ivs = {'😊' : '2','😭' : 'f','😜' : '9','😝' : '6','😅' : '6','😄' : '2','😑' : '9','😰' : '3','😸' : '3','😻' : '2','💀' : '1','👹' : '6','🐷' : '3','🐺' : '6','🐭' : '1','🦁' : '1','🐱‍👓' : 'a','🐱‍💻' : '0','🐇' : 'd','🐢' : '3','🦉' : 'e','🦀' : '3','🐧' : '5','🕊' : '8','🐌' : '6','👨‍👩‍👧‍👦' : '7','👨‍👨‍👦' : '0','⛷' : '3','🐛' : '3','👁' : '2','👣' : '3','👀' : '3'};
const iv = ['😰','😊','👣','🐭','⛷','💀','👀','👁','🐢','🐱‍💻','🐷','😜','😸','👨‍👨‍👦','🐛','🦀','😻','🐇','😅','😄','👨‍👩‍👧‍👦','🐱‍👓','🐌','😑','🐧','😭','👹','🕊','😝','🦁','🐺','🦉'];

const stringToHex = text => {
    return CryptoJS.enc.Utf8.parse(text).toString();
};

const hexToString = text => {
    return CryptoJS.enc.Utf8.stringify(CryptoJS.enc.Hex.parse(text));
};

const getKey = (keys, from) => {
    let key = '';
    let result = '';

    keys.forEach(v => key = key + from[v]);
    result = hexToString(key);

    return result;
};

const randomString = length => {
    const str = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';

    for (let i = length; i > 0; --i) 
        result += str[Math.floor(Math.random() * str.length)];

    return result;
};

const aesEncrypt = (data, key) => {
    const ivx = CryptoJS.enc.Utf8.parse(getKey(iv, ivs));
    const keyx = CryptoJS.enc.Utf8.parse(key);
    const datax = CryptoJS.enc.Utf8.parse(data);

    const result = CryptoJS.AES.encrypt(datax, keyx, {iv: ivx, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7});

    return result.toString();
};

const aesDecrypt = (data, key) => {
    const ivx = CryptoJS.enc.Utf8.parse(getKey(iv, ivs));
    const keyx = CryptoJS.enc.Utf8.parse(key);

    const result = CryptoJS.AES.decrypt(data, keyx, {iv: ivx, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7});

    return result.toString(CryptoJS.enc.Utf8);
}

const encrypt = json => {
    let randomAesKey = randomString(16);
    encryptor.setKey(getKey(publicKey, encryptKeys));

    if ('object' === typeof(json))
        json = JSON.stringify(json);
    const data = aesEncrypt(json, randomAesKey);
    const hash = encryptor.encrypt(randomAesKey);

    return stringToHex(
        aesEncrypt(
            JSON.stringify({data: data, hash: hash}),
            getKey(aesKey, subKeys)
        )
    );
};

const decrypt = text => {
    return JSON.parse(
        aesDecrypt(
            hexToString(text),
            getKey(aesKey, subKeys)
        )
    );
};

export default {
    encrypt,
    decrypt
};