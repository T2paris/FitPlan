const OnboardingView = {
    step: 0,
    profile: {
        sport: "basketball", customSport: "", goals: ["performance"], age: "22", weight: "80", height: "180",
        experience: "intermediate", injuries: ["none"], injuryDetails: "", daysPerWeek: 5,
        hoursPerSession: 1.5, budget: "medium", equipment: "ginásio completo", notes: "",
        targetVert: "72", targetWeight: "75"
    },
    apiKey: "",
    onDoneCb: null,
    appEl: null,

    render(appEl, onDone) {
        this.appEl = appEl;
        this.onDoneCb = onDone;
        this.step = 0;
        this.apiKey = AIController.apiKey || '';
        this.updateDOM();
    },

    updateDOM() {
        const pages = [
            this.pageSport(),
            this.pageGoals(),
            this.pageStats(),
            this.pageExp(),
            this.pageTraining(),
            this.pageAPI()
        ];

        const totalSteps = pages.length;
        const isOk = this.validateStep();
        const nextBtnDisabled = !isOk ? 'disabled' : '';
        const isLastStep = this.step >= totalSteps - 1;
        const isAPIStep = isLastStep;

        this.appEl.innerHTML = `
            <div class="container padding-view">
                <div style="text-align:center;margin-bottom:20px;">
                    <div style="display:flex;align-items:center;justify-content:center;gap:10px;margin-bottom:6px">
                        <div class="icon-badge" style="background:var(--grad-primary)">⚡</div>
                        <span style="font-family:var(--font-title);font-size:22px;font-weight:800;color:var(--text-primary);letter-spacing:-1px">FitTracker AI</span>
                    </div>
                    <div style="font-size:9px;color:var(--text-muted);font-family:var(--font-mono);letter-spacing:4px;text-transform:uppercase">TREINADOR PESSOAL COM IA</div>
                </div>

                <div style="display:flex;gap:5px;justify-content:center;margin-bottom:22px">
                    ${Array.from({length: totalSteps}, (_, i) => `
                        <div style="width:${i===this.step?32:24}px;height:4px;border-radius:2px;background:${i<=this.step?'var(--color-orange)':'var(--border-color)'};transition:all .3s"></div>
                    `).join('')}
                </div>

                <div style="margin-bottom:20px">${pages[this.step]}</div>

                <div style="display:flex;align-items:center;gap:10px;padding-top:12px;border-top:1px solid var(--border-color)">
                    ${this.step > 0 ? `<button id="ob-back" style="color:var(--text-dim);font-size:13px;font-weight:600;background:none;border:none;cursor:pointer">← Voltar</button>` : ''}
                    <div style="flex:1"></div>
                    ${isAPIStep
                        ? `<button id="ob-skip" style="color:var(--text-dim);font-size:13px;font-weight:600;background:none;border:none;cursor:pointer;padding:8px 14px">Saltar →</button>
                           <button id="ob-finish" class="main-btn" style="width:auto">🚀 Gerar Plano</button>`
                        : this.step < totalSteps - 2
                            ? `<button id="ob-next" class="main-btn" style="width:auto" ${nextBtnDisabled}>Continuar →</button>`
                            : `<button id="ob-next" class="main-btn" style="width:auto" ${nextBtnDisabled}>Continuar →</button>`
                    }
                </div>
            </div>
        `;

        this.bindEvents();
    },

    bindEvents() {
        const btnBack = document.getElementById('ob-back');
        const btnNext = document.getElementById('ob-next');
        const btnFinish = document.getElementById('ob-finish');
        const btnSkip = document.getElementById('ob-skip');

        if (btnBack) btnBack.onclick = () => { this.step--; this.updateDOM(); };
        if (btnNext) btnNext.onclick = () => { this.step++; this.updateDOM(); };
        if (btnFinish) btnFinish.onclick = () => { this.onDoneCb(this.profile, this.apiKey); };
        if (btnSkip) btnSkip.onclick = () => { this.apiKey = ''; this.onDoneCb(this.profile, this.apiKey); };

        const inputs = this.appEl.querySelectorAll('[data-key]');
        inputs.forEach(inp => {
            inp.oninput = (e) => {
                const key = e.target.getAttribute('data-key');
                if (key === 'apiKey') this.apiKey = e.target.value;
                else this.profile[key] = e.target.value;
                const nextBtn = document.getElementById('ob-next') || document.getElementById('ob-finish');
                if(nextBtn) nextBtn.disabled = !this.validateStep();
            };
        });

        const toggleBtns = this.appEl.querySelectorAll('[data-toggle]');
        toggleBtns.forEach(btn => {
            btn.onclick = (e) => {
                const key = btn.getAttribute('data-toggle');
                const val = btn.getAttribute('data-val');
                let arr = this.profile[key];
                if (key === 'injuries' && val === 'none') {
                    arr = ['none'];
                } else {
                    if (arr.includes('none')) arr = arr.filter(x => x !== 'none');
                    if (arr.includes(val)) arr = arr.filter(x => x !== val);
                    else arr.push(val);
                }
                this.profile[key] = arr;
                this.updateDOM();
            };
        });

        const setBtns = this.appEl.querySelectorAll('[data-set]');
        setBtns.forEach(btn => {
            btn.onclick = (e) => {
                const key = btn.getAttribute('data-set');
                const val = btn.getAttribute('data-val');
                this.profile[key] = val;
                this.updateDOM();
            };
        });
    },

    validateStep() {
        if (this.step === 0) return !!this.profile.sport;
        if (this.step === 1) return this.profile.goals.length > 0;
        if (this.step === 2) return !!(this.profile.age && this.profile.weight && this.profile.height);
        if (this.step === 3) return !!this.profile.experience;
        if (this.step === 4) return !!this.profile.daysPerWeek;
        if (this.step === 5) return true; // API key is always optional
        return true;
    },

    pageSport() {
        const SPORTS = [
            { id:"basketball", icon:"🏀", label:"Basquetebol", grad:"var(--grad-gym)" },
            { id:"football",   icon:"⚽", label:"Futebol",      grad:"var(--grad-sport)" },
            { id:"gym",        icon:"🏋️", label:"Musculação",   grad:"var(--grad-vertical)" },
            { id:"running",    icon:"🏃", label:"Corrida",      grad:"var(--grad-recovery)" },
            { id:"custom",     icon:"⚡", label:"Outro",        grad:"var(--grad-meals)" }
        ];
        let html = `<div class="title-2">Qual é o teu desporto?</div><div class="title-3">Modalidade principal</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">`;
        SPORTS.forEach(s => {
            const active = this.profile.sport === s.id;
            html += `
                <button class="card" data-set="sport" data-val="${s.id}" style="border-color:${active ? 'transparent' : 'var(--border-color)'} !important;background:${active ? s.grad : 'var(--surface-1)'} !important;box-shadow:${active ? '0 8px 24px rgba(0,0,0,0.3)' : 'none'}">
                    <div class="icon-badge" style="background:${active ? 'rgba(255,255,255,0.15)' : s.grad};width:40px;height:40px;font-size:20px;border-radius:12px">${s.icon}</div>
                    <span style="font-family:var(--font-mono);font-size:11px;font-weight:700;color:${active ? '#fff' : 'var(--text-primary)'}; letter-spacing:1px;text-transform:uppercase">${s.label}</span>
                </button>
            `;
        });
        html += `</div>`;
        if (this.profile.sport === 'custom') {
            html += `<input class="input-base" style="margin-top:10px" data-key="customSport" placeholder="Descreve o teu desporto..." value="${this.profile.customSport}">`;
        }
        return html;
    },

    pageGoals() {
        const GOALS = [
            { id:"muscle",      label:"Ganhar músculo",  icon:"💪", grad:"var(--grad-gym)" },
            { id:"lose_fat",    label:"Perder gordura",  icon:"🔥", grad:"var(--grad-cardio)" },
            { id:"performance", label:"Performance",     icon:"🏆", grad:"var(--grad-meals)" },
            { id:"vertical",    label:"Salto vertical",  icon:"🚀", grad:"var(--grad-vertical)" }
        ];
        let html = `<div class="title-2">Objetivos</div><div class="title-3">Podes escolher vários</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">`;
        GOALS.forEach(g => {
            const active = this.profile.goals.includes(g.id);
            html += `
                <button class="card" data-toggle="goals" data-val="${g.id}" style="flex-direction:row;gap:10px;border-color:${active ? 'transparent' : 'var(--border-color)'} !important;background:${active ? g.grad : 'var(--surface-1)'} !important;box-shadow:${active ? '0 8px 24px rgba(0,0,0,0.3)' : 'none'}">
                    <div class="icon-badge icon-badge-sm" style="background:${active ? 'rgba(255,255,255,0.15)' : g.grad}">${g.icon}</div>
                    <span style="font-size:12px;font-weight:600;color:${active ? '#fff' : 'var(--text-primary)'}">${g.label}</span>
                </button>
            `;
        });
        html += `</div>`;
        return html;
    },

    pageStats() {
        return `
            <div class="title-2">Dados físicos</div>
            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-top:10px">
                <div>
                    <span class="label-base">Idade</span>
                    <input type="number" class="input-base" data-key="age" value="${this.profile.age}">
                </div>
                <div>
                    <span class="label-base">Peso (kg)</span>
                    <input type="number" class="input-base" data-key="weight" value="${this.profile.weight}">
                </div>
                <div>
                    <span class="label-base">Altura (cm)</span>
                    <input type="number" class="input-base" data-key="height" value="${this.profile.height}">
                </div>
            </div>
            <div style="margin-top:18px;margin-bottom:6px;font-weight:700;color:var(--color-orange);font-size:14px;font-family:var(--font-title)">🎯 Metas Pessoais</div>
            <div class="title-3" style="margin-bottom:10px">Define os teus objetivos para o gráfico de progresso</div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
                <div>
                    <span class="label-base">Peso objetivo (kg)</span>
                    <input type="number" class="input-base" data-key="targetWeight" placeholder="Ex: 75" value="${this.profile.targetWeight}">
                </div>
                <div>
                    <span class="label-base">Salto vertical obj. (cm)</span>
                    <input type="number" class="input-base" data-key="targetVert" placeholder="Ex: 72" value="${this.profile.targetVert}">
                </div>
            </div>
        `;
    },

    pageExp() {
        const EXP = [
            {id:"beginner",     l:"Iniciante",   grad:"var(--grad-recovery)"},
            {id:"intermediate", l:"Intermédio",   grad:"var(--grad-meals)"},
            {id:"advanced",     l:"Avançado",     grad:"var(--grad-gym)"}
        ];
        let html = `<div class="title-2">Experiência & Saúde</div><div class="label-base" style="margin-top:10px">Nível de experiência</div><div style="display:flex;gap:6px;margin-bottom:16px">`;
        EXP.forEach(e => {
            const active = this.profile.experience === e.id;
            html += `<button class="card" style="flex:1;border-color:${active ? 'transparent' : 'var(--border-color)'} !important;background:${active ? e.grad : 'var(--surface-1)'} !important;color:${active ? '#fff' : 'var(--text-primary)'};font-weight:700;box-shadow:${active ? '0 8px 24px rgba(0,0,0,0.3)' : 'none'};letter-spacing:1px;font-size:11px" data-set="experience" data-val="${e.id}">${e.l}</button>`;
        });
        html += `</div><div class="label-base">Lesões</div><div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px">`;
        const INJ = ['none','knee','ankle','shoulder','back','elbow','hip','hamstring','wrist'];
        const INJ_LABELS = { 
            none:'Nenhuma', knee:'Joelho', ankle:'Tornozelo', shoulder:'Ombro', 
            back:'Costas', elbow:'Cotovelo', hip:'Anca', hamstring:'Isquiotibiais', wrist:'Pulso' 
        };
        INJ.forEach(i => {
            const active = this.profile.injuries.includes(i);
            html += `<button class="chip" style="border-color:${active ? 'transparent' : 'var(--border-color)'} !important;background:${active ? 'var(--grad-gym)' : 'var(--surface-1)'} !important;color:${active ? '#fff' : 'var(--text-dim)'} !important;box-shadow:${active ? '0 4px 14px rgba(232,63,111,0.2)' : 'none'}" data-toggle="injuries" data-val="${i}">${INJ_LABELS[i]}</button>`;
        });
        html += `</div>`;
        if(this.profile.injuries.some(i=>i!=='none')) {
            html += `<input class="input-base" data-key="injuryDetails" placeholder="Detalhes da lesão..." value="${this.profile.injuryDetails}">`;
        }
        return html;
    },

    pageTraining() {
        const DAYS = [2, 3, 4, 5, 6, 7];
        const HOURS = ['1', '1.5', '2', '2.5'];
        const EQUIP = [
            { id: 'ginásio completo', label: 'Ginásio Completo', icon: '🏋️' },
            { id: 'home gym', label: 'Home Gym', icon: '🏠' },
            { id: 'peso corporal', label: 'Peso Corporal', icon: '🤸' },
            { id: 'mínimo', label: 'Equipamento Mínimo', icon: '📦' }
        ];

        let html = `<div class="title-2">Preferências de Treino</div><div class="title-3">Configura a tua disponibilidade semanal</div>`;

        html += `<div class="label-base">Dias de treino por semana</div><div style="display:flex;gap:6px;margin-bottom:16px">`;
        DAYS.forEach(d => {
            const active = parseInt(this.profile.daysPerWeek) === d;
            html += `<button class="card" data-set="daysPerWeek" data-val="${d}" style="flex:1;padding:10px;font-weight:700;font-size:14px;border-color:${active ? 'transparent' : 'var(--border-color)'} !important;background:${active ? 'var(--grad-primary)' : 'var(--surface-1)'} !important;color:${active ? '#fff' : 'var(--text-primary)'};box-shadow:${active ? '0 4px 14px rgba(255,111,30,0.25)' : 'none'}">${d}</button>`;
        });
        html += `</div>`;

        html += `<div class="label-base">Horas por sessão</div><div style="display:flex;gap:6px;margin-bottom:16px">`;
        HOURS.forEach(h => {
            const active = String(this.profile.hoursPerSession) === h;
            html += `<button class="card" data-set="hoursPerSession" data-val="${h}" style="flex:1;padding:10px;font-weight:700;font-size:13px;border-color:${active ? 'transparent' : 'var(--border-color)'} !important;background:${active ? 'var(--grad-sport)' : 'var(--surface-1)'} !important;color:${active ? '#fff' : 'var(--text-primary)'};box-shadow:${active ? '0 4px 14px rgba(91,94,166,0.25)' : 'none'}">${h}h</button>`;
        });
        html += `</div>`;

        html += `<div class="label-base">Equipamento disponível</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">`;
        EQUIP.forEach(e => {
            const active = this.profile.equipment === e.id;
            html += `<button class="card" data-set="equipment" data-val="${e.id}" style="flex-direction:row;gap:8px;padding:10px;border-color:${active ? 'transparent' : 'var(--border-color)'} !important;background:${active ? 'var(--grad-vertical)' : 'var(--surface-1)'} !important;color:${active ? '#fff' : 'var(--text-primary)'};font-weight:600;font-size:11px;box-shadow:${active ? '0 4px 14px rgba(124,58,237,0.25)' : 'none'}"><span style="font-size:16px">${e.icon}</span> ${e.label}</button>`;
        });
        html += `</div>`;

        return html;
    },

    pageAPI() {
        return `
            <div class="title-2">Chave de IA (Opcional)</div>
            <div class="title-3" style="line-height:1.6">O FitTracker inclui um <strong style="color:var(--color-green)">motor de treinos completo</strong> que gera planos profissionais sem custos. Se tiveres uma chave Anthropic, o coach por chat usará IA real para conversas personalizadas.</div>
            
            <div style="background:rgba(16, 185, 129, 0.06);border:1px solid rgba(16, 185, 129, 0.15);border-radius:14px;padding:14px;margin:16px 0;display:flex;align-items:flex-start;gap:10px">
                <span style="font-size:18px;flex-shrink:0">✅</span>
                <div>
                    <div style="font-size:12px;font-weight:700;color:var(--color-green);margin-bottom:4px">Sem chave? Sem problema!</div>
                    <div style="font-size:11px;color:var(--text-dim);line-height:1.5">O plano de treinos, nutrição, suplementação e horários são gerados pelo nosso motor interno — totalmente grátis e sem limite de utilizações. Podes adicionar uma chave mais tarde nas Definições.</div>
                </div>
            </div>

            <input type="password" class="input-base" data-key="apiKey" placeholder="sk-ant-api03... (opcional)" value="${this.apiKey}">
            <div style="font-size:11px;color:var(--text-muted);margin-top:8px;font-weight:500">A chave é guardada apenas no localStorage do teu dispositivo.</div>
        `;
    }
};

window.OnboardingView = OnboardingView;
