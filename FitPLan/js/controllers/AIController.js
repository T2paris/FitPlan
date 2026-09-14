class AIControllerClass {
    constructor() {
        this.apiKey = Store.get('apiKey', '');
    }

    setApiKey(key) {
        this.apiKey = key;
        Store.set('apiKey', key);
    }

    hasKey() {
        return !!this.apiKey && this.apiKey.length > 5;
    }

    async generatePlan(profile) {
        return API.generatePlan(profile, this.apiKey);
    }

    async chatStream(profile, historyStr, userText, onChunk) {
        return API.streamCoachChat(profile, historyStr, userText, onChunk, this.apiKey);
    }
}

window.AIController = new AIControllerClass();
