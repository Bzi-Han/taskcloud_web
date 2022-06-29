const LuaTemplate = `local state = {}

function getTaskDomain()
    return 'httpbin.org'
end

-- return a json string of the function list
function getTaskFunctionList()
    return [[
        {
            "template": "模板"
        }
    ]]
end

function setTaskPassport(passport)
    state.passport = passport
end

function template()
    local url = 'http://httpbin.org/get'
    local headers = {
        ['Cookie'] = state.passport
    }

    local result = requests.get(url, headers)
    if 200 == result.code then
        logger.info(result.content)

        return true
    end

    return false
end`;

const JavaScriptTemplate = `const state = {};

function getTaskDomain() {
    return 'httpbin.org';
}

// return a json string of the function list
function getTaskFunctionList() {
    return \`
        {
            "template": "模板"
        }
    \`;
}

function setTaskPassport(passport) {
    state.passport = passport;
}

function template() {
    const url = 'http://httpbin.org/get';
    const headers = {
        Cookie: state.passport
    };

    const result = requests.get(url, headers);
    if (200 === result.code) {
        logger.info(result.content);

        return true;
    }

    return false;
}`;

const PythonTemplate = `state = {}

def getTaskDomain():
    return 'httpbin.org'

# return a json string of the def list
def getTaskdefList():
    return '''
        {
            "template": "模板"
        }
    '''

def setTaskPassport(passport):
    state.passport = passport

def template():
    url = 'http://httpbin.org/get'
    headers = {
        'Cookie': state.passport
    }

    result = requests.get(url, headers)
    if 200 == result.code:
        logger.info(result.content)

        return True
    
    return False`;

export {
    LuaTemplate,
    JavaScriptTemplate,
    PythonTemplate,
};