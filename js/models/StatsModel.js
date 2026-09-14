class StatsModelClass {
    constructor() {
        this.username = null;
        this.verts = [];
        this.weights = [];
    }

    async loadUserSession(username) {
        this.username = username;
        try {
            const stats = await API.getStats();
            this.verts = stats.verts;
            this.weights = stats.weights;
        } catch (err) {
            console.error("Erro ao carregar estatísticas do utilizador:", err);
        }
    }

    unloadUserSession() {
        this.username = null;
        this.verts = [];
        this.weights = [];
    }

    async addVert(value) {
        if (!value || value < 20 || value > 130) return false;
        try {
            const res = await API.addStat('verts', value);
            this.verts.push({ date: res.date, value: res.value });
            return true;
        } catch (err) {
            console.error(err);
            return false;
        }
    }

    async addWeight(value) {
        if (!value || value < 40 || value > 200) return false;
        try {
            const res = await API.addStat('weights', value);
            this.weights.push({ date: res.date, value: res.value });
            return true;
        } catch (err) {
            console.error(err);
            return false;
        }
    }

    getLatestVert() {
        if (this.verts.length === 0) return 0;
        return this.verts[this.verts.length - 1].value;
    }

    getLatestWeight() {
        if (this.weights.length === 0) return 0;
        return this.weights[this.weights.length - 1].value;
    }
}

window.StatsModel = new StatsModelClass();
