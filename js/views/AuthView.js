const AuthView = {
    activeTab: 'login', // 'login' ou 'register'
    appEl: null,
    errorMessage: '',

    render(appEl) {
        this.appEl = appEl;
        this.updateDOM();
    },

    updateDOM() {
        const isLogin = this.activeTab === 'login';

        const html = `
            <div style="display:flex;flex-direction:column;min-height:100vh;justify-content:center;align-items:center;padding:24px;background:radial-gradient(circle at top,#1F1F35,#0D0D15)">
                
                <div style="text-align:center;margin-bottom:28px">
                    <div style="display:inline-flex;align-items:center;justify-content:center;width:64px;height:64px;border-radius:20px;background:var(--grad-primary);box-shadow:0 8px 30px rgba(255,111,30,0.3);font-size:32px;margin-bottom:12px;animation:pulse 2s infinite">⚡</div>
                    <h1 style="font-family:var(--font-title);font-size:28px;color:var(--text-primary);letter-spacing:-0.5px;margin:0">FitTracker AI</h1>
                    <p style="font-family:var(--font-sans);font-size:13px;color:var(--text-muted);margin:4px 0 0 0">O teu plano de treino gerado por Inteligência Artificial</p>
                </div>

                <div class="card" style="width:100%;max-width:380px;padding:28px;background:var(--surface-1);border:1px solid var(--border-color);border-radius:24px;box-shadow:0 20px 40px rgba(0,0,0,0.3)">
                    
                    <!-- Tabs -->
                    <div style="display:flex;background:var(--surface-2);border-radius:14px;padding:4px;margin-bottom:24px;border:1px solid var(--border-color)">
                        <button id="tab-login" style="flex:1;padding:10px;border-radius:10px;border:none;font-weight:700;font-size:13px;font-family:var(--font-sans);cursor:pointer;transition:all 0.2s;background:${isLogin ? 'var(--surface-1)' : 'transparent'};color:${isLogin ? 'var(--text-primary)' : 'var(--text-dim)'};box-shadow:${isLogin ? '0 2px 8px rgba(0,0,0,0.15)' : 'none'}">Entrar</button>
                        <button id="tab-register" style="flex:1;padding:10px;border-radius:10px;border:none;font-weight:700;font-size:13px;font-family:var(--font-sans);cursor:pointer;transition:all 0.2s;background:${!isLogin ? 'var(--surface-1)' : 'transparent'};color:${!isLogin ? 'var(--text-primary)' : 'var(--text-dim)'};box-shadow:${!isLogin ? '0 2px 8px rgba(0,0,0,0.15)' : 'none'}">Criar Conta</button>
                    </div>

                    <!-- Mensagem de Erro -->
                    ${this.errorMessage ? `
                        <div style="background:rgba(232, 63, 111, 0.08);border:1px solid rgba(232, 63, 111, 0.15);color:var(--color-red);padding:12px;border-radius:12px;font-size:12px;font-weight:600;margin-bottom:16px;display:flex;align-items:center;gap:8px">
                            <span>⚠️</span> ${this.errorMessage}
                        </div>
                    ` : ''}

                    <!-- Form -->
                    <form id="auth-form" onsubmit="event.preventDefault();">
                        <div style="margin-bottom:16px">
                            <label class="label-base" style="margin-bottom:6px">Nome de Utilizador</label>
                            <div style="position:relative">
                                <span style="position:absolute;left:14px;top:50%;transform:translateY(-50%);font-size:14px">👤</span>
                                <input type="text" id="auth-username" class="input-base" style="padding-left:40px;margin:0" placeholder="Ex: joao123" required>
                            </div>
                        </div>

                        <div style="margin-bottom:24px">
                            <label class="label-base" style="margin-bottom:6px">Palavra-passe</label>
                            <div style="position:relative">
                                <span style="position:absolute;left:14px;top:50%;transform:translateY(-50%);font-size:14px">🔑</span>
                                <input type="password" id="auth-password" class="input-base" style="padding-left:40px;margin:0" placeholder="••••••••" required>
                            </div>
                        </div>

                        <button type="submit" class="main-btn" style="width:100%">
                            ${isLogin ? '🚀 Entrar na Conta' : '✨ Criar e Registar'}
                        </button>
                    </form>
                </div>
            </div>
        `;

        this.appEl.innerHTML = html;
        this.bindEvents();
    },

    bindEvents() {
        const tabLogin = document.getElementById('tab-login');
        const tabRegister = document.getElementById('tab-register');
        const authForm = document.getElementById('auth-form');

        if (tabLogin) {
            tabLogin.onclick = () => {
                if (this.activeTab !== 'login') {
                    this.activeTab = 'login';
                    this.errorMessage = '';
                    this.updateDOM();
                }
            };
        }

        if (tabRegister) {
            tabRegister.onclick = () => {
                if (this.activeTab !== 'register') {
                    this.activeTab = 'register';
                    this.errorMessage = '';
                    this.updateDOM();
                }
            };
        }

        if (authForm) {
            authForm.onsubmit = async (e) => {
                e.preventDefault();
                this.errorMessage = '';
                
                const usernameVal = document.getElementById('auth-username').value;
                const passwordVal = document.getElementById('auth-password').value;

                if (this.activeTab === 'login') {
                    const res = await UserModel.login(usernameVal, passwordVal);
                    if (res.success) {
                        // Carregar a sessão de treino do utilizador
                        await PlanModel.loadUserSession(res.username);
                        await StatsModel.loadUserSession(res.username);
                        
                        // Direcionar para a página correta
                        await AppController.init();
                    } else {
                        this.errorMessage = res.message;
                        this.updateDOM();
                    }
                } else {
                    const res = await UserModel.register(usernameVal, passwordVal);
                    if (res.success) {
                        // Faz login automático após registo bem-sucedido
                        const loginRes = await UserModel.login(usernameVal, passwordVal);
                        if (!loginRes.success) {
                            this.errorMessage = loginRes.message || 'Erro ao fazer login automático após registo.';
                            this.updateDOM();
                            return;
                        }
                        
                        // Importação opcional: se houver um plano legatário no browser (sem utilizador logado),
                        // migra-o diretamente para a base de dados MySQL deste utilizador
                        await this.importLegacyPlan(loginRes.username);

                        await PlanModel.loadUserSession(loginRes.username);
                        await StatsModel.loadUserSession(loginRes.username);

                        await AppController.init();
                    } else {
                        this.errorMessage = res.message;
                        this.updateDOM();
                    }
                }
            };
        }
    },

    async importLegacyPlan(username) {
        const oldProfile = Store.get('profile');
        const oldPlan = Store.get('plan');
        const oldChecks = Store.get('checks');
        const oldWeek = Store.get('week');
        const oldVerts = Store.get('verts');
        const oldWeights = Store.get('weights');

        if (oldPlan) {
            try {
                // 1. Gravar perfil antigo no MySQL
                const payload = {
                    age: oldProfile.age,
                    weight: oldProfile.weight,
                    height: oldProfile.height,
                    sport: oldProfile.sport,
                    custom_sport: oldProfile.customSport,
                    experience: oldProfile.experience,
                    goals: oldProfile.goals || [],
                    injuries: oldProfile.injuries || [],
                    injury_details: oldProfile.injuryDetails,
                    days_per_week: oldProfile.daysPerWeek,
                    hours_per_session: oldProfile.hoursPerSession,
                    budget: oldProfile.budget,
                    equipment: oldProfile.equipment,
                    notes: oldProfile.notes,
                    target_vert: oldProfile.targetVert,
                    target_weight: oldProfile.targetWeight
                };
                await API.saveProfile(payload);
                
                // 2. Gravar plano antigo no MySQL
                await API.savePlan({
                    plan: oldPlan,
                    week: oldWeek || 1,
                    openSections: {}
                });

                // 3. Importar checks antigos
                if (oldChecks) {
                    for (const [chkKey, val] of Object.entries(oldChecks)) {
                        if (val) {
                            await API.toggleCheck(chkKey);
                        }
                    }
                }

                // 4. Importar estatísticas
                if (oldVerts) {
                    for (const v of oldVerts) {
                        if (v.date !== "Início") {
                            await API.addStat('verts', v.value);
                        }
                    }
                }
                if (oldWeights) {
                    for (const w of oldWeights) {
                        if (w.date !== "Início") {
                            await API.addStat('weights', w.value);
                        }
                    }
                }

                // Limpar chaves antigas do localStorage
                Store.remove('profile');
                Store.remove('plan');
                Store.remove('checks');
                Store.remove('week');
                Store.remove('verts');
                Store.remove('weights');
                console.log(`Legacy plan successfully migrated to MySQL for user: ${username}`);
            } catch (err) {
                console.error("Erro ao migrar plano legatário local para a BD MySQL:", err);
            }
        }
    }
};

window.AuthView = AuthView;
