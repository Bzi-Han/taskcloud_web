let userInfo = null;

const store = {
    get userInfo() {
        if (null === userInfo && localStorage.hasOwnProperty('userInfo'))
            userInfo = JSON.parse(localStorage.getItem('userInfo'));

        return userInfo;
    },

    useUserInfo(lambda) {
        if (null !== this.userInfo)
            return lambda(this.userInfo);

        return false;
    },
};

export default store;