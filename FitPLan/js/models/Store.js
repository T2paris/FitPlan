const Store = {
    get: (key, defaultValue = null) => {
        try {
            const item = localStorage.getItem(`ft_${key}`);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            console.error('Error reading from localStorage', e);
            return defaultValue;
        }
    },
    
    set: (key, value) => {
        try {
            localStorage.setItem(`ft_${key}`, JSON.stringify(value));
        } catch (e) {
            console.error('Error saving to localStorage', e);
        }
    },

    remove: (key) => {
        localStorage.removeItem(`ft_${key}`);
    },

    clearAll: () => {
        Object.keys(localStorage).forEach(key => {
            if(key.startsWith('ft_')) localStorage.removeItem(key);
        });
    }
};

window.Store = Store;
