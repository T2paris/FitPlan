class AppControllerClass {
    constructor() {
        this.appEl = document.getElementById('app');
        this.navEl = document.getElementById('bottom-nav');
        this.currentView = 'dash'; // 'dash', number (dayIdx), 'chat'
    }

    async init() {
        if (!UserModel.isLoggedIn()) {
            this.navEl.style.display = 'none';
            this.setView('auth');
            return;
        }

        // Se o utilizador está logado, mas as sessões nos models ainda não foram carregadas
        if (!PlanModel.username) {
            const username = UserModel.getCurrentUser();
            await PlanModel.loadUserSession(username);
            await StatsModel.loadUserSession(username);
        }

        if (!PlanModel.hasPlan()) {
            this.navEl.style.display = 'none';
            this.renderOnboarding();
        } else {
            this.navEl.style.display = 'flex';
            this.renderView();
            this.renderNav();
        }
    }

    setView(viewName) {
        this.currentView = viewName;
        this.renderView();
        if (viewName !== 'auth') {
            this.renderNav();
        }
        window.scrollTo(0, 0);
    }

    renderView() {
        if (!UserModel.isLoggedIn()) {
            AuthView.render(this.appEl);
            return;
        }

        if (this.currentView === 'auth') {
            AuthView.render(this.appEl);
            return;
        }

        if (!PlanModel.hasPlan()) {
            this.renderOnboarding();
            return;
        }

        if (this.currentView === 'dash') {
            DashboardView.render(this.appEl);
        } else if (this.currentView === 'chat') {
            ChatView.render(this.appEl);
        } else if (this.currentView === 'settings') {
            SettingsView.render(this.appEl);
        } else if (typeof this.currentView === 'number') {
            DayView.render(this.appEl, this.currentView);
        }
    }

    renderNav() {
        if (!PlanModel.hasPlan()) return;

        const phase = PlanModel.getPhase();
        const days = (PlanModel.plan.dayPlan ? PlanModel.plan.dayPlan[phase] : PlanModel.plan.days) || [];
        const pColor = DashboardView.getPhaseColor(PlanModel.week);

        let html = '';
        
        // Plano
        html += this._createNavBtn('dash', '⚡', 'Plano', this.currentView === 'dash', pColor);

        // Days
        days.forEach((d, di) => {
            const prog = PlanModel.getDayProgress(di);
            const pv = prog.tot > 0 ? Math.round(prog.done / prog.tot * 100) : null;
            const complete = pv === 100;
            const act = this.currentView === di;
            const icon = (complete && !act) ? '✅' : d.icon;
            html += this._createNavBtn(di, icon, d.day, act, pColor, pv, complete);
        });

        // Chat
        html += this._createNavBtn('chat', '🤖', 'Coach', this.currentView === 'chat', 'var(--color-orange)');

        this.navEl.innerHTML = html;

        // Bind clicks
        const btns = this.navEl.querySelectorAll('.nav-btn');
        btns.forEach((btn, i) => {
            let targetView;
            if (i === 0) targetView = 'dash';
            else if (i === btns.length - 1) targetView = 'chat';
            else targetView = i - 1; // dayIdx

            btn.onclick = () => this.setView(targetView);
        });
    }

    _createNavBtn(id, icon, label, active, color, pct = null, complete = false) {
        let style = active 
            ? `background:color-mix(in srgb, ${color} 12%, transparent);border:1px solid color-mix(in srgb, ${color} 30%, transparent);color:${color};` 
            : `color:${complete ? 'var(--color-green)' : 'var(--text-muted)'};`;
        let pctHtml = '';
        if (pct !== null) {
            const barBg = complete && !active ? 'var(--color-green)' : color;
            pctHtml = `
                <div class="nav-btn-progress">
                    <div class="nav-btn-progress-fill" style="width:${pct}%;background:${barBg}"></div>
                </div>
            `;
        }
        return `
            <button class="nav-btn ${active ? 'active' : ''}" style="${style}">
                <span style="font-size:13px;line-height:1">${icon}</span>
                <span>${label}</span>
                ${pctHtml}
            </button>
        `;
    }

    renderOnboarding() {
        OnboardingView.render(this.appEl, async (profileData, apiKey) => {
            // Show loading
            this.appEl.innerHTML = `
                <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;text-align:center;">
                    <div style="font-size:40px;animation:pulse 2s infinite">⚡</div>
                    <div class="title-2" style="margin-top:20px">A guardar o teu perfil...</div>
                    <div class="title-3">A preparar a ligação ao servidor...</div>
                </div>
            `;

            try {
                AIController.setApiKey(apiKey);
                await PlanModel.saveProfile(profileData);
                
                const title2 = this.appEl.querySelector('.title-2');
                const title3 = this.appEl.querySelector('.title-3');
                if (title2) title2.innerText = "A gerar plano personalizado...";
                if (title3) title3.innerText = "A analisar o teu perfil e objetivos com a IA (20-40s)";

                const plan = await AIController.generatePlan(profileData);
                await PlanModel.savePlan(plan);
                this.navEl.style.display = 'flex';
                this.setView('dash');
            } catch (err) {
                console.error(err);
                this.appEl.innerHTML = `
                    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;text-align:center;padding:20px;">
                        <span style="font-size:44px;margin-bottom:12px">⚠️</span>
                        <div class="title-2" style="color:var(--color-red)">Erro ao gerar o plano</div>
                        <div style="font-size:11px;color:var(--text-dim);background:var(--surface-1);padding:10px;border-radius:8px;margin-bottom:20px;max-width:300px;word-break:break-all;">
                            ${err.message}
                        </div>
                        <button class="main-btn" id="retry-btn">Tentar Novamente</button>
                    </div>
                `;
                document.getElementById('retry-btn').onclick = async () => {
                    await PlanModel.clearPlan();
                    this.init();
                };
            }
        });
    }

    logout() {
        UserModel.logout();
        PlanModel.unloadUserSession();
        StatsModel.unloadUserSession();
        if (window.ChatView) ChatView.clearLocalMessages();
        this.navEl.style.display = 'none';
        this.setView('auth');
    }

    async regeneratePlan(profileData) {
        this.navEl.style.display = 'none';
        this.appEl.innerHTML = `
            <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;text-align:center;">
                <div style="font-size:40px;animation:pulse 2s infinite">⚡</div>
                <div class="title-2" style="margin-top:20px">A regenerar plano personalizado...</div>
                <div class="title-3">A analisar as tuas novas preferências com a IA (20-40s)</div>
            </div>
        `;
        
        try {
            const plan = await AIController.generatePlan(profileData);
            
            // Limpar plano e checks antigos no backend
            await API.clearPlan();
            
            // Gravar novo perfil e plano no backend
            await PlanModel.saveProfile(profileData);
            await PlanModel.savePlan(plan);
            
            // Recarregar os dados na sessão local para consistência na UI
            const username = UserModel.getCurrentUser();
            await PlanModel.loadUserSession(username);
            
            this.navEl.style.display = 'flex';
            this.setView('dash');
        } catch (err) {
            console.error(err);
            this.appEl.innerHTML = `
                <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;text-align:center;padding:20px;">
                    <span style="font-size:44px;margin-bottom:12px">⚠️</span>
                    <div class="title-2" style="color:var(--color-red)">Erro ao regenerar o plano</div>
                    <div style="font-size:11px;color:var(--text-dim);background:var(--surface-1);padding:10px;border-radius:8px;margin-bottom:20px;max-width:300px;word-break:break-all;">
                        ${err.message}
                    </div>
                    <button class="main-btn" id="retry-regen-btn">Voltar para Definições</button>
                </div>
            `;
            document.getElementById('retry-regen-btn').onclick = () => {
                this.setView('settings');
            };
        }
    }
}

window.AppController = new AppControllerClass();
