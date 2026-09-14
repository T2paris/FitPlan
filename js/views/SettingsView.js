const SettingsView = {
    tempProfile: {},
    tempApiKey: '',
    appEl: null,

    render(appEl) {
        this.appEl = appEl;
        this.tempProfile = JSON.parse(JSON.stringify(PlanModel.profile || {}));
        this.tempApiKey = AIController.apiKey || '';
        this.updateDOM();
    },

    updateDOM() {
        const DAYS = [2, 3, 4, 5, 6, 7];
        const HOURS = ['1', '1.5', '2', '2.5'];
        const EQUIP = [
            { id: 'ginásio completo', label: 'Ginásio Completo', icon: '🏋️' },
            { id: 'home gym', label: 'Home Gym', icon: '🏠' },
            { id: 'peso corporal', label: 'Peso Corporal', icon: '🤸' },
            { id: 'mínimo', label: 'Equipamento Mínimo', icon: '📦' }
        ];

        const daysHtml = DAYS.map(d => {
            const active = parseInt(this.tempProfile.daysPerWeek) === d;
            return `<button class="card" data-pref="daysPerWeek" data-val="${d}" style="flex:1;padding:10px;font-weight:700;font-size:14px;border-color:${active ? 'transparent' : 'var(--border-color)'} !important;background:${active ? 'var(--grad-primary)' : 'var(--surface-1)'} !important;color:${active ? '#fff' : 'var(--text-primary)'};box-shadow:${active ? '0 4px 14px rgba(255,111,30,0.25)' : 'none'}">${d}</button>`;
        }).join('');

        const hoursHtml = HOURS.map(h => {
            const active = String(this.tempProfile.hoursPerSession) === h;
            return `<button class="card" data-pref="hoursPerSession" data-val="${h}" style="flex:1;padding:10px;font-weight:700;font-size:13px;border-color:${active ? 'transparent' : 'var(--border-color)'} !important;background:${active ? 'var(--grad-sport)' : 'var(--surface-1)'} !important;color:${active ? '#fff' : 'var(--text-primary)'};box-shadow:${active ? '0 4px 14px rgba(91,94,166,0.25)' : 'none'}">${h}h</button>`;
        }).join('');

        const equipHtml = EQUIP.map(e => {
            const active = this.tempProfile.equipment === e.id;
            return `<button class="card" data-pref="equipment" data-val="${e.id}" style="flex-direction:row;gap:8px;padding:10px;border-color:${active ? 'transparent' : 'var(--border-color)'} !important;background:${active ? 'var(--grad-vertical)' : 'var(--surface-1)'} !important;color:${active ? '#fff' : 'var(--text-primary)'};font-weight:600;font-size:11px;box-shadow:${active ? '0 4px 14px rgba(124,58,237,0.25)' : 'none'}"><span style="font-size:16px">${e.icon}</span> ${e.label}</button>`;
        }).join('');

        const html = `
            <div class="app-header">
                <button onclick="AppController.setView('dash')" style="font-size:20px;color:var(--text-muted);padding:6px 10px;line-height:1">←</button>
                <div style="flex:1">
                    <span class="header-tag">FITTRACKER AI</span>
                    <span class="header-title">Definições</span>
                </div>
            </div>

            <div class="padding-view">
                <div class="section-title">PERFIL FÍSICO</div>
                <div style="background:var(--surface-1);border:1px solid var(--border-color);border-radius:var(--radius-md);padding:16px;margin-bottom:16px">
                    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:14px">
                        <div>
                            <span class="label-base">Idade</span>
                            <input type="number" class="input-base" data-setting="age" value="${this.tempProfile.age || ''}">
                        </div>
                        <div>
                            <span class="label-base">Peso atual (kg)</span>
                            <input type="number" class="input-base" data-setting="weight" value="${this.tempProfile.weight || ''}">
                        </div>
                        <div>
                            <span class="label-base">Altura (cm)</span>
                            <input type="number" class="input-base" data-setting="height" value="${this.tempProfile.height || ''}">
                        </div>
                    </div>
                    <div style="font-size:11px;font-weight:700;color:var(--text-muted);font-family:var(--font-mono);letter-spacing:2px;margin-bottom:8px;margin-top:4px">🎯 METAS</div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
                        <div>
                            <span class="label-base">Peso objetivo (kg)</span>
                            <input type="number" class="input-base" data-setting="targetWeight" value="${this.tempProfile.targetWeight || ''}">
                        </div>
                        <div>
                            <span class="label-base">Salto vertical obj. (cm)</span>
                            <input type="number" class="input-base" data-setting="targetVert" value="${this.tempProfile.targetVert || ''}">
                        </div>
                    </div>
                </div>

                <div class="section-title">PREFERÊNCIAS DE TREINO</div>
                <div style="background:var(--surface-1);border:1px solid var(--border-color);border-radius:var(--radius-md);padding:16px;margin-bottom:16px">
                    <div class="label-base">Dias de treino por semana</div>
                    <div style="display:flex;gap:6px;margin-bottom:14px">
                        ${daysHtml}
                    </div>
                    <div class="label-base">Horas por sessão</div>
                    <div style="display:flex;gap:6px;margin-bottom:14px">
                        ${hoursHtml}
                    </div>
                    <div class="label-base">Equipamento disponível</div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">
                        ${equipHtml}
                    </div>
                </div>

                <div class="section-title">CHAVE DE API (ANTHROPIC)</div>
                <div style="background:var(--surface-1);border:1px solid var(--border-color);border-radius:var(--radius-md);padding:16px;margin-bottom:20px">
                    <input type="password" class="input-base" data-setting="apiKey" placeholder="sk-ant-api03..." value="${this.tempApiKey}" style="margin-bottom:8px">
                    <div style="font-size:11px;color:var(--color-orange);font-weight:600;line-height:1.5">⚠️ A chave é guardada localmente no teu dispositivo (localStorage). Para maior segurança em produção, utiliza um proxy/backend para intermediar chamadas à API.</div>
                </div>

                <button class="main-btn" onclick="SettingsView.save()" style="width:100%;margin-bottom:12px">💾 Guardar Alterações</button>

                <button onclick="SettingsView.confirmLogout()" style="width:100%;padding:12px;border-radius:var(--radius-md);background:rgba(255,255,255,0.03);border:1px solid var(--border-color);color:var(--text-muted);font-weight:700;font-size:13px;font-family:var(--font-sans);transition:all 0.2s;cursor:pointer;margin-bottom:12px">🚪 Terminar Sessão</button>

                <button onclick="SettingsView.confirmReset()" style="width:100%;padding:12px;border-radius:var(--radius-md);background:rgba(232,63,111,0.06);border:1px solid rgba(232,63,111,0.15);color:var(--color-red);font-weight:700;font-size:13px;font-family:var(--font-sans);transition:all 0.2s;cursor:pointer">🗑️ Resetar Plano Completo</button>
            </div>
        `;

        this.appEl.innerHTML = html;
        this.bindEvents();
    },

    bindEvents() {
        const inputs = this.appEl.querySelectorAll('[data-setting]');
        inputs.forEach(inp => {
            inp.oninput = (e) => {
                const key = e.target.getAttribute('data-setting');
                if (key === 'apiKey') {
                    this.tempApiKey = e.target.value;
                } else {
                    this.tempProfile[key] = e.target.value;
                }
            };
        });

        const prefBtns = this.appEl.querySelectorAll('[data-pref]');
        prefBtns.forEach(btn => {
            btn.onclick = () => {
                const key = btn.getAttribute('data-pref');
                const val = btn.getAttribute('data-val');
                this.tempProfile[key] = key === 'daysPerWeek' ? parseInt(val) : val;
                this.updateDOM();
            };
        });
    },

    async save() {
        const oldP = PlanModel.profile || {};
        const newP = this.tempProfile;

        const trainingChanged = 
            oldP.sport !== newP.sport ||
            oldP.daysPerWeek !== newP.daysPerWeek ||
            oldP.hoursPerSession !== newP.hoursPerSession ||
            oldP.equipment !== newP.equipment;

        await PlanModel.updateProfile(newP);
        AIController.setApiKey(this.tempApiKey);

        if (trainingChanged) {
            const confirmRegen = confirm("⚠️ Alteraste as tuas preferências de treino (desporto, dias por semana, horas por sessão ou equipamento).\n\nDesejas regenerar o teu plano de treinos para aplicar as alterações? (O teu progresso de checks atual será reiniciado)");
            if (confirmRegen) {
                AppController.regeneratePlan(newP);
                return;
            }
        }

        this.showToast('✅ Definições guardadas!');
        setTimeout(() => AppController.setView('dash'), 800);
    },

    async confirmReset() {
        const confirmed = confirm('⚠️ Tens a certeza que queres resetar o plano completo?\n\nTodo o progresso de treinos será perdido e o histórico do chat será limpo.');
        if (confirmed) {
            try {
                await API.clearChatHistory();
            } catch (err) {
                console.error("Erro ao limpar histórico do chat no reset:", err);
            }
            if (window.ChatView) ChatView.clearLocalMessages();
            await PlanModel.clearPlan();
            AppController.init();
        }
    },

    confirmLogout() {
        const confirmed = confirm('Desejas terminar a sessão?');
        if (confirmed) {
            AppController.logout();
        }
    },

    showToast(msg) {
        const toast = document.createElement('div');
        toast.style.cssText = `
            position:fixed;top:20px;left:50%;transform:translateX(-50%) translateY(-20px);
            background:linear-gradient(135deg,#10B981,#2DD4BF);color:#fff;padding:12px 24px;
            border-radius:14px;font-size:13px;font-weight:700;font-family:var(--font-sans);
            box-shadow:0 10px 30px rgba(16,185,129,0.3);z-index:9999;
            transition:all 0.4s cubic-bezier(0.175,0.885,0.32,1.275);opacity:0;
            display:flex;align-items:center;gap:8px;
        `;
        toast.textContent = msg;
        document.body.appendChild(toast);
        toast.offsetHeight;
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(-50%) translateY(0)';
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(-50%) translateY(-20px)';
            setTimeout(() => toast.remove(), 400);
        }, 2500);
    }
};

window.SettingsView = SettingsView;
