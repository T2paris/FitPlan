const UserModel = {
    register: async (username, password) => {
        try {
            await API.register(username, password);
            return { success: true };
        } catch (err) {
            return { success: false, message: err.message };
        }
    },

    login: async (username, password) => {
        try {
            const data = await API.login(username, password);
            Store.set('current_user', data.username);
            return { success: true, username: data.username };
        } catch (err) {
            return { success: false, message: err.message };
        }
    },

    logout: () => {
        API.logout();
        Store.remove('current_user');
    },

    getCurrentUser: () => {
        if (API.getToken()) {
            return Store.get('current_user', null);
        }
        return null;
    },

    isLoggedIn: () => {
        return !!API.getToken() && !!UserModel.getCurrentUser();
    }
};

window.UserModel = UserModel;
