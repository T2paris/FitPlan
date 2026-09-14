const DashboardView = {
    PHASE_COLORS: ['var(--color-red)', 'var(--color-green)', 'var(--color-purple)'],
    PHASE_GRADIENTS: ['var(--grad-gym)', 'var(--grad-recovery)', 'var(--grad-vertical)'],

    // Ring colors for the concentric arcs
    RING_COLORS: [
        { color: '#E83F6F', label: 'Musculação' },    // Outer ring — pink/coral
        { color: '#5B5EA6', label: 'Técnico' },        // Middle ring — blue/indigo
        { color: '#10B981', label: 'Explosividade' }   // Inner ring — green/teal
    ],

    getPhaseColor(week) {
        const phIdx = week <= 4 ? 0 : week <= 8 ? 1 : 2;
        return this.PHASE_COLORS[phIdx];
    },

    async prevWeek() {
        const w = Math.max(1, PlanModel.week - 1);
        await PlanModel.setWeek(w);
        AppController.renderView();
        AppController.renderNav();
    },

    async nextWeek() {
        const w = Math.min(12, PlanModel.week + 1);
        await PlanModel.setWeek(w);
        AppController.renderView();
        AppController.renderNav();
    },

    render(appEl) {
        const plan = PlanModel.plan;
        const week = PlanModel.week;
        const curPhase = PlanModel.getPhase();
        const phIdx = curPhase - 1;
        const phase = plan.phases?.[phIdx] || { name: "Fase 1", weeks: "Sem 1-4", focus: "Treino base" };
        const pColor = this.getPhaseColor(week);
        const days = plan.dayPlan?.[curPhase] || plan.days || [];

        // ────── 1. Calculate ring data ──────
        let gD=0,gT=0,sD=0,sT=0,vD=0,vT=0,rD=0,rT=0,mD=0,mT=0,spD=0,spT=0;
        let totalWeekEx = 0, doneWeekEx = 0;

        days.forEach((d, di) => {
            const prog = PlanModel.getDayProgress(di);
            totalWeekEx += prog.tot;
            doneWeekEx += prog.done;

            if (plan.dayPlan) {
                const gE = d.gym && plan.gym ? plan.gym[d.gym] : [];
                const sE = d.skill && plan.skill ? plan.skill[d.skill] : [];
                const vE = d.vert && plan.vert ? plan.vert[curPhase] : [];
                const rE = plan.rec || [];
                const mE = plan.meals || [];
                const spE = plan.supps || [];

                gE.forEach(ex => { gT++; if (PlanModel.isChecked(di, "gym", ex.id)) gD++; });
                sE.forEach(ex => { sT++; if (PlanModel.isChecked(di, "sport", ex.id)) sD++; });
                vE.forEach(ex => { vT++; if (PlanModel.isChecked(di, "vertical", ex.id)) vD++; });
                rE.forEach(ex => { rT++; if (PlanModel.isChecked(di, "recovery", ex.id)) rD++; });
                mE.forEach(ex => { mT++; if (PlanModel.isChecked(di, "meals", ex.id)) mD++; });
                spE.forEach(ex => { spT++; if (PlanModel.isChecked(di, "supplements", ex.id)) spD++; });
            }
        });

        const weeklyPct = totalWeekEx > 0 ? Math.round(doneWeekEx / totalWeekEx * 100) : 0;

        // Ring percentages
        const gymPct = gT > 0 ? Math.round(gD / gT * 100) : 0;
        const sportPct = sT > 0 ? Math.round(sD / sT * 100) : 0;
        const vertPct = vT > 0 ? Math.round(vD / vT * 100) : 0;

        // Ring parameters (outer to inner)
        const rings = [
            { r: 68, sw: 9, pct: gymPct, color: '#E83F6F' },
            { r: 54, sw: 9, pct: sportPct, color: '#5B5EA6' },
            { r: 40, sw: 9, pct: vertPct, color: '#10B981' }
        ];

        const ringSvg = rings.map(ring => {
            const circ = 2 * Math.PI * ring.r;
            const offset = circ - (ring.pct / 100 * circ);
            return `
                <circle class="ring-bg" cx="90" cy="90" r="${ring.r}" stroke-width="${ring.sw}" />
                <circle class="ring-val" cx="90" cy="90" r="${ring.r}" stroke="${ring.color}" stroke-width="${ring.sw}" stroke-dasharray="${circ.toFixed(1)}" stroke-dashoffset="${offset.toFixed(1)}" style="color:${ring.color}" />
            `;
        }).join('');

        // Cardinal dots
        const dotPositions = [
            { top: '0px', left: '50%', tx: '-50%', ty: '0' },
            { top: '50%', right: '0px', tx: '0', ty: '-50%' },
            { bottom: '0px', left: '50%', tx: '-50%', ty: '0' },
            { top: '50%', left: '0px', tx: '0', ty: '-50%' }
        ];

        // ────── 2. Chevron Stats ──────
        const chevronStats = [
            { icon: '💪', label: 'Musculação', done: gD, total: gT, color: '#E83F6F', grad: 'var(--grad-gym)' },
            { icon: '🎯', label: 'Treino Técnico', done: sD, total: sT, color: '#5B5EA6', grad: 'var(--grad-sport)' },
            { icon: '⬆️', label: 'Explosividade', done: vD, total: vT, color: '#7C3AED', grad: 'var(--grad-vertical)' },
            { icon: '🧘', label: 'Recuperação', done: rD, total: rT, color: '#10B981', grad: 'var(--grad-recovery)' },
            { icon: '🍽️', label: 'Refeições', done: mD, total: mT, color: '#F97316', grad: 'var(--grad-meals)' },
            { icon: '💊', label: 'Suplementos', done: spD, total: spT, color: '#D97706', grad: 'var(--grad-supplements)' }
        ];

        const chevronHtml = chevronStats.map(s => {
            const pct = s.total > 0 ? Math.round(s.done / s.total * 100) : 0;
            return `
                <div class="chevron-bar" onclick="AppController.setView(0)">
                    <div class="chevron-bar-fill" style="width:${pct}%;background:${s.grad}"></div>
                    <div class="icon-badge icon-badge-sm" style="background:${s.grad}">${s.icon}</div>
                    <div class="chevron-bar-info">
                        <div class="chevron-bar-label" style="color:${s.color}">${s.label}</div>
                        <div class="chevron-bar-detail">${s.done}/${s.total} completo</div>
                    </div>
                    <div class="chevron-bar-stat" style="color:${s.color}">${pct}<span class="chevron-bar-pct">%</span></div>
                </div>
            `;
        }).join('');

        // ────── Build HTML ──────
        let html = `
            <div class="app-header">
                <div class="icon-badge" style="background:var(--grad-primary)">⚡</div>
                <div style="flex:1">
                    <span class="header-tag">FITTRACKER AI</span>
                    <span class="header-title">Semana ${week} — ${phase.name}</span>
                </div>
                <button onclick="AppController.setView('settings')" style="font-size:14px;color:var(--text-muted);padding:6px" title="Definições">⚙️</button>
            </div>

            <div style="border-bottom:1px solid var(--border-color);padding:8px 16px;display:flex;align-items:center;gap:8px;background:var(--surface-1)">
                <span style="font-size:9px;font-weight:700;padding:3px 10px;border-radius:6px;color:#fff;font-family:var(--font-mono);background:${pColor};letter-spacing:1px">${phase.name}</span>
                <span style="font-size:11px;font-family:var(--font-sans);font-weight:500;color:var(--text-dim)">${phase.focus}</span>
            </div>

            <div style="padding:10px 16px 4px;border-bottom:1px solid var(--border-color);display:flex;gap:5px;overflow-x:auto;background:var(--surface-1)">
                ${Array.from({length:12}, (_, i) => i + 1).map(w => `
                    <button onclick="DashboardView.selectWeek(${w})" style="width:30px;height:30px;border-radius:8px;background:${w===week ? pColor : 'var(--surface-2)'};color:${w===week ? '#fff' : 'var(--text-dim)'};font-weight:700;font-size:12px;font-family:var(--font-mono);border:1px solid ${w===week ? pColor : 'var(--border-color)'};flex-shrink:0;transition:all 0.2s">${w}</button>
                `).join('')}
            </div>

            <div class="padding-view">
                <div class="dashboard-grid">
                    <div class="dash-col-left">
                        <!-- ═══ Multi-Ring Concentric Progress Chart ═══ -->
                        <div class="ring-chart-card">
                            <div class="section-title" style="margin-bottom:8px">PROGRESSO SEMANAL</div>

                            <div style="display:flex;align-items:center;gap:14px;width:100%;justify-content:center">
                                <button onclick="DashboardView.prevWeek()" style="font-size:28px;font-weight:bold;color:var(--text-muted);padding:8px 12px;line-height:1;transition:color 0.2s;" onmouseover="this.style.color='#E83F6F'" onmouseout="this.style.color='var(--text-muted)'">‹</button>

                                <div class="ring-chart-svg-wrap">
                                    <svg class="ring-chart-svg" viewBox="0 0 180 180">
                                        ${ringSvg}
                                    </svg>
                                    <div class="ring-chart-center">
                                        <div class="ring-chart-pct">${weeklyPct}%</div>
                                        <div class="ring-chart-sub">Semana ${week}</div>
                                    </div>
                                    <!-- Cardinal dots -->
                                    <div class="ring-dot" style="top:0;left:50%;transform:translateX(-50%)"></div>
                                    <div class="ring-dot" style="top:50%;right:0;transform:translateY(-50%)"></div>
                                    <div class="ring-dot" style="bottom:0;left:50%;transform:translateX(-50%)"></div>
                                    <div class="ring-dot" style="top:50%;left:0;transform:translateY(-50%)"></div>
                                </div>

                                <button onclick="DashboardView.nextWeek()" style="font-size:28px;font-weight:bold;color:var(--text-muted);padding:8px 12px;line-height:1;transition:color 0.2s;" onmouseover="this.style.color='#E83F6F'" onmouseout="this.style.color='var(--text-muted)'">›</button>
                            </div>

                            <div class="ring-legend">
                                ${this.RING_COLORS.map(rc => `
                                    <div class="ring-legend-item">
                                        <div class="ring-legend-dot" style="background:${rc.color};box-shadow:0 0 6px ${rc.color}"></div>
                                        ${rc.label}
                                    </div>
                                `).join('')}
                            </div>
                        </div>

                        <!-- ═══ Day-by-Day Activity Bar Chart ═══ -->
                        <div class="bar-chart-card">
                            <div class="section-title">ATIVIDADE DIÁRIA</div>
                            <div class="bar-chart-container">
                                ${days.map((d, di) => {
                                    const {tot, done} = PlanModel.getDayProgress(di);
                                    const pv = tot > 0 ? Math.round(done / tot * 100) : 0;
                                    const activeColor = pv === 100 ? '#10B981' : '#E83F6F';
                                    const barHeight = pv > 0 ? Math.round(pv / 100 * 70) : 4;
                                    return `
                                        <div class="bar-chart-col" onclick="AppController.setView(${di})" title="${d.label}: ${pv}% concluído">
                                            <span style="font-size:8px;font-weight:700;color:${activeColor};margin-bottom:4px;font-family:var(--font-mono)">${pv}%</span>
                                            <div class="bar-chart-track">
                                                <div class="bar-chart-fill" style="height:${barHeight}px;background:${activeColor}"></div>
                                            </div>
                                            <div class="bar-chart-label" style="color:${pv === 100 ? '#10B981' : 'var(--text-dim)'}">${d.day}</div>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        </div>

                        <!-- ═══ Vertical & Weight Live Tracking ═══ -->
                        <div class="tracking-card">
                            <div class="tracking-card-header">
                                <div class="icon-badge icon-badge-sm" style="background:var(--grad-vertical)">📈</div>
                                <span class="section-title" style="margin:0">VERTICAL & PESO (LIVE TRACKING)</span>
                            </div>
                            <div class="tracking-card-body">
                                <div style="display:flex;gap:8px;align-items:center;margin-bottom:8px">
                                    <input id="vIn" type="number" class="input-base" style="margin:0" placeholder="Salto em cm">
                                    <button class="main-btn" style="width:auto;padding:8px 14px;background:var(--grad-vertical)!important;font-size:12px!important" onclick="DashboardView.addVert()">+ cm</button>
                                </div>
                                <div style="display:flex;gap:8px;align-items:center;margin-bottom:12px">
                                    <input id="wIn" type="number" class="input-base" style="margin:0" placeholder="Peso em kg">
                                    <button class="main-btn" style="width:auto;padding:8px 14px;background:var(--grad-meals)!important;font-size:12px!important" onclick="DashboardView.addWeight()">+ kg</button>
                                </div>
                                ${this.renderChart(StatsModel.verts, parseInt(PlanModel.profile?.targetVert) || 72, '#7C3AED')}
                                ${this.renderChart(StatsModel.weights, parseInt(PlanModel.profile?.targetWeight) || 83, '#F97316')}
                            </div>
                        </div>
                    </div>

                    <div class="dash-col-right">
                        <!-- ═══ Phase Quadrant 2×2 ═══ -->
                        <div class="section-title">FASES DE TREINO</div>
                        <div class="phase-quadrant">
                            <div class="phase-block ${curPhase===1?'':'phase-block-inactive'}" onclick="AppController.setView(0)" style="background:var(--grad-gym)">
                                <div class="phase-block-icon">🏋️‍♂️</div>
                                <div class="phase-block-label">Força</div>
                            </div>
                            <div class="phase-block ${curPhase===3?'':'phase-block-inactive'}" onclick="AppController.setView(0)" style="background:var(--grad-sport)">
                                <div class="phase-block-icon">🎯</div>
                                <div class="phase-block-label">Técnico</div>
                            </div>
                            <div class="phase-block ${curPhase===2?'':'phase-block-inactive'}" onclick="AppController.setView(0)" style="background:var(--grad-recovery)">
                                <div class="phase-block-icon">⚡</div>
                                <div class="phase-block-label">Explosão</div>
                            </div>
                            <div class="phase-block" onclick="AppController.setView(0)" style="background:var(--grad-meals)">
                                <div class="phase-block-icon">🧘</div>
                                <div class="phase-block-label">Recovery</div>
                            </div>
                        </div>

                        <!-- ═══ Chevron Category Stats ═══ -->
                        <div class="section-title">CATEGORIAS</div>
                        <div class="chevron-bar-list">
                            ${chevronHtml}
                        </div>

                        ${plan.injuryWarning ? `
                            <div class="alert-box alert-box-red">
                                <div style="font-size:9px;color:var(--color-red);font-family:var(--font-mono);letter-spacing:2px;margin-bottom:5px;font-weight:700">⚠️ ATENÇÃO LESÃO</div>
                                <div style="font-size:12px;color:var(--text-dim);line-height:1.6;font-weight:500">${plan.injuryWarning}</div>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;

        appEl.innerHTML = html;
    },

    async addVert() {
        const v = document.getElementById('vIn').value;
        const success = await StatsModel.addVert(v);
        if (success) AppController.renderView();
    },

    async addWeight() {
        const w = document.getElementById('wIn').value;
        const success = await StatsModel.addWeight(w);
        if (success) AppController.renderView();
    },

    renderChart(data, goal, color) {
        if (data.length < 2) return `<div style="font-size:11px;color:var(--text-muted);font-family:var(--font-mono);text-align:center;padding:14px 10px;margin-top:10px">Regista 2+ medições para ver gráfico</div>`;

        const vals = data.map(d => d.value);
        const mn = Math.min(...vals, goal) - 4;
        const mx = Math.max(...vals, goal) + 4;
        const W = 300, H = 65;
        const xp = i => 12 + (i / (data.length - 1)) * (W - 24);
        const yp = v => H - 12 - ((v - mn) / (mx - mn)) * (H - 24);
        const gy = yp(goal);

        let path = "";
        data.forEach((d, i) => path += (i === 0 ? "M" : "L") + xp(i).toFixed(1) + "," + yp(d.value).toFixed(1));

        return `
            <svg viewBox="0 0 ${W} ${H}" style="width:100%;height:75px;display:block;margin-top:10px;background:linear-gradient(135deg, #1e1b4b, #0f172a) !important;border-radius:12px;box-shadow:0 6px 20px rgba(0,0,0,0.2)">
                <line x1="12" y1="${gy}" x2="${W-12}" y2="${gy}" stroke="${color}" stroke-width="1.2" stroke-dasharray="4,3" opacity=".5"/>
                <text x="${W-15}" y="${gy-4}" fill="${color}" font-size="7.5" font-weight="700" text-anchor="end" font-family="var(--font-mono)">META ${goal}</text>
                <path d="${path}" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                ${data.map((d, i) => `
                    <circle cx="${xp(i)}" cy="${yp(d.value)}" r="4.5" fill="#FFFFFF" stroke="${color}" stroke-width="1.5"/>
                    <text x="${xp(i)}" y="${yp(d.value)-7}" fill="#FFFFFF" font-size="8.5" font-weight="700" text-anchor="middle" font-family="var(--font-title)">${d.value}</text>
                    <text x="${xp(i)}" y="${H-2}" fill="rgba(255,255,255,0.35)" font-size="7.5" text-anchor="middle" font-family="var(--font-mono)">${d.date}</text>
                `).join('')}
            </svg>
        `;
    },

    async selectWeek(w) {
        await PlanModel.setWeek(w);
        AppController.renderView();
        AppController.renderNav();
    }
};

window.DashboardView = DashboardView;
