const DayView = {
    CAT: {
        warmup:      { color: "#94A3B8", icon: "🔥", label: "Aquecimento",       grad: "var(--grad-warmup)" },
        gym:         { color: "#E83F6F", icon: "💪", label: "Musculação",        grad: "var(--grad-gym)" },
        sport:       { color: "#5B5EA6", icon: "🎯", label: "Treino Desportivo", grad: "var(--grad-sport)" },
        vertical:    { color: "#7C3AED", icon: "⬆️", label: "Pliometria/Vertical", grad: "var(--grad-vertical)" },
        cardio:      { color: "#DB2777", icon: "🫀", label: "Cardio",            grad: "var(--grad-cardio)" },
        recovery:    { color: "#10B981", icon: "🧘", label: "Recuperação",       grad: "var(--grad-recovery)" },
        meals:       { color: "#F97316", icon: "🍽️", label: "Refeições",         grad: "var(--grad-meals)" },
        supplements: { color: "#D97706", icon: "💊", label: "Suplementos",       grad: "var(--grad-supplements)" }
    },
    CAT_ORDER: ["warmup", "gym", "sport", "vertical", "cardio", "recovery", "meals", "supplements"],
    SCHED_COLORS: { orange: "#F97316", gold: "#D97706", red: "#E83F6F", blue: "#5B5EA6", green: "#10B981", purple: "#7C3AED", gray: "var(--text-muted)" },

    renderCalendar(days, week, activeDayIdx) {
        return `
            <div class="horizontal-calendar">
                ${days.map((d, di) => {
                    const dateNum = 8 + (week - 1) * 7 + di;
                    const active = activeDayIdx === di;
                    let shortDay = d.day || '';
                    if (shortDay === "2ª") shortDay = "Seg";
                    else if (shortDay === "3ª") shortDay = "Ter";
                    else if (shortDay === "4ª") shortDay = "Qua";
                    else if (shortDay === "5ª") shortDay = "Qui";
                    else if (shortDay === "6ª") shortDay = "Sex";
                    return `
                        <div class="calendar-capsule ${active ? 'active' : ''}" onclick="AppController.setView(${di})">
                            <span class="calendar-day">${shortDay}</span>
                            <span class="calendar-date">${dateNum}</span>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    },

    render(appEl, dayIdx) {
        const plan = PlanModel.plan;
        if (!plan) return;

        const phase = PlanModel.getPhase();
        const week = PlanModel.week;
        const isNew = !!plan.dayPlan;

        let day;
        let scheduleItems = [];
        let sectionsHtml = '';
        const days = (plan.dayPlan ? plan.dayPlan[phase] : plan.days) || [];

        if (isNew) {
            day = plan.dayPlan[phase]?.[dayIdx];
            if (!day) return;
            scheduleItems = plan.sched?.[`${phase}-${dayIdx}`] || [];

            let recoveryBox = '';
            if (day.rest && (day.day === "Dom" || day.day === "Domingo" || dayIdx === 6)) {
                recoveryBox = `
                    <div class="alert-box alert-box-red" style="text-align:center">
                        <div style="font-size:28px;margin-bottom:6px">🔴</div>
                        <div style="font-size:13px;color:var(--color-red);font-weight:bold;margin-bottom:4px">Recuperação Total</div>
                        <div style="font-size:12px;color:var(--text-dim)">Zero impacto. É neste dia que o tendão cresce.</div>
                    </div>
                `;
            }

            // Gym section
            if (day.gym && plan.gym?.[day.gym]) {
                const items = plan.gym[day.gym];
                let footerNote = '';
                if (day.gym === 'legs') {
                    footerNote = `
                        <div class="alert-box alert-box-red" style="font-size:11px;color:var(--color-red);font-weight:600;margin-top:8px;padding:8px 10px">
                            HSR: 3s a descer, 3s a subir. Parar se dor > 4/10.
                        </div>
                    `;
                }
                sectionsHtml += this.renderSection(dayIdx, "gym", items, footerNote);
            }

            // Skill/Sport section
            if (day.skill && plan.skill?.[day.skill]) {
                const items = plan.skill[day.skill];
                sectionsHtml += this.renderSection(dayIdx, "sport", items);
            }

            // Vertical section
            if (day.vert && plan.vert?.[phase]) {
                const items = plan.vert[phase];
                const footerNote = `
                    <div class="alert-box alert-box-purple" style="font-size:11px;color:var(--color-purple);font-weight:600;margin-top:8px;padding:8px 10px">
                        Regista o teu salto no Plano após a sessão.
                    </div>
                `;
                sectionsHtml += this.renderSection(dayIdx, "vertical", items, footerNote);
            }

            // Recovery section
            if (plan.rec?.length) {
                sectionsHtml += this.renderSection(dayIdx, "recovery", plan.rec);
            }

            // Meals section
            if (plan.meals?.length) {
                sectionsHtml += this.renderSection(dayIdx, "meals", plan.meals);
            }

            // Supplements section
            if (plan.supps?.length) {
                const footerNote = `
                    <div class="alert-box alert-box-gold" style="font-size:11px;color:var(--color-gold);font-weight:600;margin-top:8px;padding:8px 10px">
                        * = crítico para o tendão. Colagénio 30-60 min ANTES do treino.
                    </div>
                `;
                sectionsHtml += this.renderSection(dayIdx, "supplements", plan.supps, footerNote, false);
            }

            let html = `
                <div class="app-header">
                    <div class="icon-badge" style="background:var(--grad-primary)">${day.icon}</div>
                    <div style="flex:1">
                        <span class="header-tag">FITTRACKER AI</span>
                        <span class="header-title">${day.label} — ${day.goal.slice(0, 26)}</span>
                    </div>
                </div>

                ${this.renderCalendar(days, week, dayIdx)}

                        <div class="padding-view" style="padding-top:0">
                    ${day.rest ? `<div style="font-size:10px;font-family:var(--font-mono);color:var(--color-red);background:rgba(232, 63, 111, 0.08);padding:4px 10px;border-radius:6px;display:inline-block;margin-bottom:12px;font-weight:700;letter-spacing:1px">DESCANSO</div>` : ''}
                    ${recoveryBox}
                    <div class="day-grid">
                        <div class="day-col-left">
                            ${this.renderSchedule(scheduleItems, dayIdx)}
                        </div>
                        <div class="day-col-right">
                            ${sectionsHtml}
                        </div>
                    </div>
                </div>
             `;
            appEl.innerHTML = html;

        } else {
            day = plan.days?.[dayIdx];
            if (!day) return;
            scheduleItems = day.schedule || [];

            let html = `
                <div class="app-header">
                    <div class="icon-badge" style="background:var(--grad-primary)">${day.icon}</div>
                    <div style="flex:1">
                        <span class="header-tag">FITTRACKER AI</span>
                        <span class="header-title">${day.label} — ${day.goal.slice(0, 26)}</span>
                    </div>
                </div>

                ${this.renderCalendar(days, week, dayIdx)}

                <div class="padding-view" style="padding-top:0">
                    ${day.isRest ? `<div style="font-size:10px;font-family:var(--font-mono);color:var(--color-red);background:rgba(232, 63, 111, 0.08);padding:4px 10px;border-radius:6px;display:inline-block;margin-bottom:12px;font-weight:700;letter-spacing:1px">DESCANSO</div>` : ''}
                    <div class="day-grid">
                        <div class="day-col-left">
                            ${this.renderSchedule(scheduleItems, dayIdx)}
                        </div>
                        <div class="day-col-right">
                            ${this.CAT_ORDER.map(catKey => this.renderSection(dayIdx, catKey, day.sections?.[catKey])).join('')}
                        </div>
                    </div>
                </div>
            `;
            appEl.innerHTML = html;
        }
    },

    renderSchedule(items, dayIdx) {
        if (!items?.length) return '';
        const schedKey = `sched:${dayIdx}`;
        const open = PlanModel.isSectionOpen(schedKey, true);

        let html = `
            <div class="section-block" style="border-color:rgba(217, 119, 6, 0.15)">
                <button onclick="DayView.toggleSec('${schedKey}', true);" class="section-block-header" style="background:rgba(217, 119, 6, 0.03)">
                    <div class="icon-badge icon-badge-sm" style="background:var(--grad-supplements)">🕐</div>
                    <span style="flex:1;font-size:11px;font-weight:700;color:#D97706;font-family:var(--font-mono);letter-spacing:1px">HORÁRIO DO DIA</span>
                    <span style="font-size:9px;color:#D97706;background:rgba(217, 119, 6, 0.08);padding:2px 7px;border-radius:99px;font-family:var(--font-mono);font-weight:700">${items.length} blocos</span>
                    <span style="font-size:10px;color:var(--text-muted)">${open ? '▲' : '▼'}</span>
                </button>
        `;

        if (open) {
            html += `<div class="section-block-body">`;
            items.forEach((it, i) => {
                const col = this.SCHED_COLORS[it.color] || 'var(--text-dim)';
                const hasNext = i < items.length - 1;
                html += `
                    <div style="display:flex;gap:12px;align-items:flex-start;padding-bottom:12px;margin-bottom:${hasNext?12:0}px;border-bottom:${hasNext?'1px solid var(--border-color)':'none'};position:relative">
                        ${hasNext ? `<div class="timeline-line" style="left:28px;background:${col}"></div>` : ''}
                        <div class="timeline-dot" style="margin-top:5px;margin-left:24px;background:${col};box-shadow:0 0 8px ${col}"></div>
                        <div style="flex:1">
                            <div style="display:flex;align-items:baseline;gap:8px">
                                <span style="font-size:12px;font-weight:700;color:#D97706;font-family:var(--font-mono);flex-shrink:0">${it.time || it.t || ''}</span>
                                <span style="font-size:13px;color:var(--text-primary);font-weight:500">${it.activity || it.l || ''}</span>
                            </div>
                            ${(it.note || it.n) ? `<span style="font-size:11px;color:var(--text-muted);display:block;margin-top:2px">${it.note || it.n}</span>` : ''}
                        </div>
                    </div>
                `;
            });
            html += `</div>`;
        }
        html += `</div>`;
        return html;
    },

    renderSection(dayIdx, catKey, items, footerNote = '', defaultOpen = true) {
        if (!items || items.length === 0) return '';
        const { color, icon, label, grad } = this.CAT[catKey];
        const total = items.length;
        const done = items.filter(ex => PlanModel.isChecked(dayIdx, catKey, ex.id)).length;
        const pv = total > 0 ? Math.round((done / total) * 100) : 0;
        const complete = done === total && total > 0;
        const openKey = `${dayIdx}:${catKey}`;
        const open = PlanModel.isSectionOpen(openKey, defaultOpen);

        let html = `
            <div class="section-block" style="border-color:${complete ? color : 'var(--border-color)'}">
                <button onclick="DayView.toggleSec('${openKey}', ${defaultOpen});" class="section-block-header" style="background:${complete ? color+'0A' : 'transparent'}">
                    <div class="icon-badge icon-badge-sm" style="background:${grad}">${complete ? "✅" : icon}</div>
                    <span style="flex:1;font-size:11px;font-weight:700;font-family:var(--font-mono);color:${color};letter-spacing:1px">${label.toUpperCase()}</span>
                    <span style="font-size:9px;font-family:var(--font-mono);color:${color};background:${color}0D;padding:2px 7px;border-radius:99px;font-weight:700">${done}/${total}</span>
                    <span style="font-size:10px;color:var(--text-muted)">${open ? '▲' : '▼'}</span>
                </button>
                <div style="padding:0 14px 4px;background:${complete ? color+'0A' : 'transparent'}">
                    <div class="progress-bar" style="height:3px;background:rgba(148, 163, 184, 0.1)!important"><div class="progress-bar-fill" style="width:${pv}%;background:${color}"></div></div>
                </div>
        `;

        if (open) {
            html += `<div class="section-block-body">`;
            items.forEach(ex => {
                const ck = PlanModel.isChecked(dayIdx, catKey, ex.id);
                const name = ex.name || ex.label || '';
                const detail = ex.detail || ex.desc || '';
                const hasStar = !!ex.star;

                html += `
                    <button onclick="DayView.toggleEx(${dayIdx}, '${catKey}', '${ex.id}');" class="exercise-item">
                        <div class="exercise-check" style="border:1.5px solid ${ck?color:'var(--text-muted)'};background:${ck?color:'transparent'}">
                            ${ck ? '✓' : ''}
                        </div>
                        <div style="flex:1">
                            <div style="font-size:13px;color:${ck?'var(--text-muted)':'var(--text-primary)'};text-decoration:${ck?'line-through':'none'};line-height:1.4;font-weight:500">${name} ${hasStar ? '⭐' : ''}</div>
                            ${detail ? `<div style="font-size:10px;font-family:var(--font-mono);color:${ck?'var(--text-muted)':color};margin-top:2px;font-weight:600">${detail}</div>` : ''}
                        </div>
                    </button>
                `;
            });
            if (footerNote) {
                html += footerNote;
            }
            html += `</div>`;
        }
        html += `</div>`;
        return html;
    },

    async toggleEx(dayIdx, catKey, exId) {
        await PlanModel.toggleCheck(dayIdx, catKey, exId);
        AppController.renderView();
        AppController.renderNav();
    },

    async toggleSec(openKey, defaultOpen) {
        await PlanModel.toggleSection(openKey, defaultOpen);
        AppController.renderView();
    }
};

window.DayView = DayView;
