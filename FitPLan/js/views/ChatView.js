const ChatView = {
    msgs: [],
    busy: false,
    appEl: null,

    clearLocalMessages() {
        this.msgs = [];
    },

    init() {
        // init local padrão caso não carregado da BD
        if (this.msgs.length === 0) {
            this.msgs.push({ role: "ai", text: "Olá! 💪 Sou o teu **FitTracker AI**.\n\nPergunta-me qualquer coisa sobre treino, nutrição, recuperação ou lesões!" });
        }
    },

    mdRender(t) {
        if (!t) return "";
        let cleanText = t;
        const startTag = "<update_plan>";
        const endTag = "</update_plan>";
        const startIdx = t.indexOf(startTag);
        const endIdx = t.lastIndexOf(endTag);
        if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
            cleanText = t.slice(0, startIdx) + t.slice(endIdx + endTag.length);
        }
        return cleanText.trim()
            .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
            .replace(/\*\*(.+?)\*\*/g, '<strong style="color:#e4e4e7">$1</strong>')
            .replace(/^### (.+)$/gm, '<div style="font-family:var(--font-mono);font-size:13px;font-weight:700;color:#D97706;margin:10px 0 3px">$1</div>')
            .replace(/^## (.+)$/gm, '<div style="font-family:var(--font-mono);font-size:15px;font-weight:700;color:#E83F6F;margin:14px 0 5px">$1</div>')
            .replace(/^- (.+)$/gm, '<div style="padding:2px 0 2px 14px;position:relative;font-size:13px;color:#d4d4d8"><span style="position:absolute;left:0;color:#E83F6F">▸</span>$1</div>')
            .replace(/\n{2,}/g, '<div style="height:7px"></div>')
            .replace(/\n/g, "<br/>");
    },

    async render(appEl) {
        this.appEl = appEl;
        if (this.msgs.length === 0) {
            try {
                const history = await API.getChatHistory();
                if (history && history.length > 0) {
                    this.msgs = history.map(h => ({
                        role: h.sender === 'user' ? 'user' : 'ai',
                        text: h.message
                    }));
                } else {
                    this.init();
                }
            } catch (err) {
                console.error("Erro ao carregar histórico:", err);
                this.init();
            }
        } else {
            this.init();
        }
        this.updateDOM();
    },

    updateDOM() {
        const quickQ = ["Como aquecer antes do treino?", "O que comer pré-treino?", "Dicas de recuperação rápida", "Como prevenir lesões"];

        let html = `
            <div class="app-header">
                <div class="icon-badge" style="background:var(--grad-gym)">🤖</div>
                <div style="flex:1">
                    <span class="header-tag">FITTRACKER AI</span>
                    <span class="header-title">Coach Virtual</span>
                </div>
            </div>

            <div style="display:flex;flex-direction:column;height:calc(100vh - 140px)">
                <div id="chat-messages" style="flex:1;overflow-y:auto;padding:14px">
                    ${this.msgs.map(m => `
                        <div style="display:flex;justify-content:${m.role === 'user' ? 'flex-end' : 'flex-start'};margin-bottom:10px;gap:8px;align-items:flex-start">
                            ${m.role === 'ai' ? `<div class="chat-ai-avatar" style="background:var(--grad-gym)">🤖</div>` : ''}
                            <div style="max-width:78%;padding:10px 14px;border-radius:${m.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px'};background:${m.role === 'user' ? 'var(--color-orange)' : 'var(--surface-2)'};border:${m.role === 'user' ? 'none' : '1px solid var(--border-color)'};color:${m.role === 'user' ? '#fff' : 'var(--text-primary)'};font-size:13px;line-height:1.5">
                                ${this.mdRender(m.text)}
                            </div>
                        </div>
                    `).join('')}
                    ${this.busy && this.msgs[this.msgs.length - 1]?.text === "" ? `<div style="padding:0 0 10px 42px;font-size:12px;color:var(--text-dim);font-family:var(--font-mono)">a pensar...</div>` : ''}
                </div>

                ${this.msgs.length <= 1 ? `
                    <div style="display:flex;flex-wrap:wrap;gap:5px;padding:0 14px 8px;justify-content:center">
                        ${quickQ.map(q => `<button class="chip" onclick="ChatView.send('${q}')">${q}</button>`).join('')}
                    </div>
                ` : ''}

                <div style="display:flex;gap:8px;padding:8px 14px;border-top:1px solid var(--border-color);background:var(--surface-1)">
                    <input id="chat-input" class="input-base" style="flex:1;border-radius:20px;margin:0" placeholder="Pergunta ao teu coach..." ${this.busy ? 'disabled' : ''}>
                    <button id="chat-send" style="width:38px;height:38px;border-radius:12px;background:var(--grad-primary);color:#FFFFFF;font-size:16px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;opacity:${this.busy ? '0.4' : '1'};box-shadow:0 4px 14px rgba(255,111,30,0.2);position:relative;overflow:hidden" ${this.busy ? 'disabled' : ''}>↑</button>
                </div>
            </div>
        `;

        this.appEl.innerHTML = html;

        const msgContainer = document.getElementById('chat-messages');
        if (msgContainer) msgContainer.scrollTop = msgContainer.scrollHeight;

        const input = document.getElementById('chat-input');
        const sendBtn = document.getElementById('chat-send');

        if (input && sendBtn) {
            input.onkeydown = (e) => {
                if (e.key === 'Enter') this.send(input.value);
            };
            input.oninput = () => {
                sendBtn.style.opacity = input.value.trim() ? '1' : '0.4';
            };
            sendBtn.onclick = () => this.send(input.value);
        }
    },

    async send(txt) {
        if (!txt.trim() || this.busy) return;

        const userMsg = { role: "user", text: txt.trim() };
        this.msgs.push(userMsg);
        this.busy = true;
        this.updateDOM();

        const historyStr = this.msgs.map(m => `${m.role === "user" ? "Atleta" : "Coach"}: ${m.text}`).join("\n");
        this.msgs.push({ role: "ai", text: "" });

        try {
            await AIController.chatStream(PlanModel.profile, historyStr, txt.trim(), (partial) => {
                this.msgs[this.msgs.length - 1].text = partial;
                this.updateDOM();
            });

            const lastMsg = this.msgs[this.msgs.length - 1].text;
            this.handlePlanUpdates(lastMsg);

        } catch (e) {
            this.msgs[this.msgs.length - 1].text = "⚠️ Erro de ligação. " + e.message;
        }

        this.busy = false;
        this.updateDOM();
    },

    handlePlanUpdates(text) {
        const startTag = "<update_plan>";
        const endTag = "</update_plan>";
        const startIdx = text.indexOf(startTag);
        const endIdx = text.lastIndexOf(endTag);

        if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
            const jsonStr = text.slice(startIdx + startTag.length, endIdx).trim();
            try {
                let cleaned = jsonStr.replace(/\/\*[\s\S]*?\*\//g, "");
                cleaned = cleaned.replace(/\/\/.*$/gm, "");
                const updates = JSON.parse(cleaned);

                let planChanged = false;
                const activePlan = PlanModel.plan;
                if (activePlan) {
                    const keys = ["phases", "gym", "skill", "vert", "rec", "meals", "supps", "dayPlan", "sched", "injuryWarning", "weeklyTip"];
                    keys.forEach(k => {
                        if (updates[k] !== undefined) {
                            activePlan[k] = updates[k];
                            planChanged = true;
                        }
                    });
                }

                if (planChanged) {
                    PlanModel.savePlan(activePlan);
                    this.showUpdateToast();
                }
            } catch (err) {
                console.error("Failed to parse plan updates from chat:", err);
            }
        }
    },

    showUpdateToast() {
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%) translateY(-20px);
            background: linear-gradient(135deg, #10B981, #2DD4BF);
            color: #fff;
            padding: 12px 24px;
            border-radius: 14px;
            font-size: 13px;
            font-weight: 700;
            font-family: var(--font-sans);
            box-shadow: 0 10px 30px rgba(16, 185, 129, 0.3);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            z-index: 9999;
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            opacity: 0;
            display: flex;
            align-items: center;
            gap: 8px;
        `;
        toast.innerHTML = `<span>✨</span><span>Plano de Treinos Atualizado!</span>`;
        document.body.appendChild(toast);

        toast.offsetHeight;

        toast.style.opacity = '1';
        toast.style.transform = 'translateX(-50%) translateY(0)';

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(-50%) translateY(-20px)';
            setTimeout(() => toast.remove(), 400);
        }, 3000);
    }
};

window.ChatView = ChatView;
