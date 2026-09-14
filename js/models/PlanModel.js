class PlanModelClass {
    constructor() {
        this.username = null;
        this.profile = null;
        this.plan = null;
        this.checks = {};
        this.week = 1;
        this.openSections = {};
    }

    async loadUserSession(username) {
        this.username = username;
        try {
            const profileData = await API.getProfile();
            if (profileData) {
                this.profile = {
                    sport: profileData.sport,
                    customSport: profileData.custom_sport,
                    goals: profileData.goals ? JSON.parse(profileData.goals) : [],
                    age: profileData.age,
                    weight: profileData.weight,
                    height: profileData.height,
                    experience: profileData.experience,
                    daysPerWeek: profileData.days_per_week,
                    hoursPerSession: parseFloat(profileData.hours_per_session),
                    budget: profileData.budget,
                    equipment: profileData.equipment,
                    notes: profileData.notes,
                    targetVert: profileData.target_vert,
                    targetWeight: profileData.target_weight,
                    injuries: profileData.injuries ? JSON.parse(profileData.injuries) : ['none'],
                    injuryDetails: profileData.injury_details
                };
            }

            const planData = await API.getPlan();
            if (planData) {
                this.plan = planData.plan;
                this.week = planData.week;
                this.openSections = planData.openSections || {};
            } else {
                this.plan = null;
                this.week = 1;
                this.openSections = {};
            }

            this.checks = await API.getChecks();
        } catch (err) {
            console.error("Erro ao carregar a sessão de plano do utilizador:", err);
        }
    }

    unloadUserSession() {
        this.username = null;
        this.profile = null;
        this.plan = null;
        this.checks = {};
        this.week = 1;
        this.openSections = {};
    }

    hasPlan() {
        return !!this.plan;
    }

    async saveProfile(profileData) {
        this.profile = profileData;
        const payload = {
            age: profileData.age,
            weight: profileData.weight,
            height: profileData.height,
            sport: profileData.sport,
            custom_sport: profileData.customSport,
            experience: profileData.experience,
            goals: profileData.goals,
            injuries: profileData.injuries,
            injury_details: profileData.injuryDetails,
            days_per_week: profileData.daysPerWeek,
            hours_per_session: profileData.hoursPerSession,
            budget: profileData.budget,
            equipment: profileData.equipment,
            notes: profileData.notes,
            target_vert: profileData.targetVert,
            target_weight: profileData.targetWeight
        };
        await API.saveProfile(payload);
    }

    async savePlan(planData) {
        this.plan = planData;
        await API.savePlan({
            plan: this.plan,
            week: this.week,
            openSections: this.openSections
        });
    }

    async clearPlan() {
        this.profile = null;
        this.plan = null;
        this.checks = {};
        this.week = 1;
        this.openSections = {};
        await API.clearPlan();
    }

    async updateProfile(newData) {
        this.profile = { ...this.profile, ...newData };
        await this.saveProfile(this.profile);
    }

    async setWeek(w) {
        this.week = w;
        await API.savePlan({
            plan: this.plan,
            week: this.week,
            openSections: this.openSections
        });
    }

    getPhase() {
        return this.week <= 4 ? 1 : this.week <= 8 ? 2 : 3;
    }

    async toggleCheck(dayIdx, cat, exId) {
        const key = `${this.week}:${dayIdx}:${cat}:${exId}`;
        this.checks[key] = !this.checks[key];
        await API.toggleCheck(key);
        return this.checks[key];
    }

    isChecked(dayIdx, cat, exId) {
        return !!this.checks[`${this.week}:${dayIdx}:${cat}:${exId}`];
    }

    async toggleSection(key, defaultOpen = false) {
        const current = this.openSections[key] !== undefined ? this.openSections[key] : defaultOpen;
        this.openSections[key] = !current;
        await API.savePlan({
            plan: this.plan,
            week: this.week,
            openSections: this.openSections
        });
        return this.openSections[key];
    }

    isSectionOpen(key, defaultOpen = false) {
        return this.openSections[key] !== undefined ? this.openSections[key] : defaultOpen;
    }

    getDayProgress(dayIdx) {
        let tot = 0, done = 0;
        if (!this.plan) return { tot, done };
        
        // Suporte para planos antigos se existirem
        if (this.plan.days && !this.plan.dayPlan) {
            const day = this.plan.days[dayIdx];
            if (!day || !day.sections) return { tot, done };
            Object.entries(day.sections).forEach(([cat, items]) => {
                if (!items) return;
                items.forEach(ex => {
                    tot++;
                    if (this.isChecked(dayIdx, cat, ex.id)) done++;
                });
            });
            return { tot, done };
        }

        const phase = this.getPhase();
        const days = this.plan.dayPlan?.[phase];
        if (!days) return { tot, done };
        const d = days[dayIdx];
        if (!d) return { tot, done };

        const gE = d.gym && this.plan.gym ? this.plan.gym[d.gym] : [];
        const sE = d.skill && this.plan.skill ? this.plan.skill[d.skill] : [];
        const vE = d.vert && this.plan.vert ? this.plan.vert[phase] : [];

        if (gE) {
            gE.forEach(ex => {
                tot++;
                if (this.isChecked(dayIdx, "gym", ex.id)) done++;
            });
        }
        if (sE) {
            sE.forEach(ex => {
                tot++;
                if (this.isChecked(dayIdx, "sport", ex.id)) done++;
            });
        }
        if (vE) {
            vE.forEach(ex => {
                tot++;
                if (this.isChecked(dayIdx, "vertical", ex.id)) done++;
            });
        }
        return { tot, done };
    }
}

window.PlanModel = new PlanModelClass();
