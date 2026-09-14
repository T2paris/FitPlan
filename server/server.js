const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ override: true });
const db = require('./config/db');
const { generateMockPlan } = require('./utils/mockGenerator');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'fittracker_jwt_secret_key_99';

// Middlewares
app.use(cors());
app.use(express.json());

// Servir ficheiros estáticos do frontend (raiz do projeto)
app.use(express.static(path.join(__dirname, '..')));

// Middleware de Autenticação JWT
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Acesso negado. Token em falta.' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Token inválido ou expirado.' });
        }
        req.user = user;
        next();
    });
}

// -------------------------------------------------------------
// ENDPOINTS DE AUTENTICAÇÃO
// -------------------------------------------------------------

// Registo de Conta
app.post('/api/auth/register', async (req, res) => {
    const { username, password } = req.body;
    const normalized = (username || '').trim().toLowerCase();

    if (!normalized || !password) {
        return res.status(400).json({ error: 'Campos utilizador e password são obrigatórios.' });
    }
    if (normalized.length < 3) {
        return res.status(400).json({ error: 'Utilizador deve ter pelo menos 3 caracteres.' });
    }

    try {
        // Verificar se já existe
        const [existing] = await db.query('SELECT id FROM users WHERE username = ?', [normalized]);
        if (existing.length > 0) {
            return res.status(400).json({ error: 'Este utilizador já se encontra registado.' });
        }

        // Hashing
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Guardar utilizador
        const [result] = await db.query('INSERT INTO users (username, password_hash) VALUES (?, ?)', [normalized, passwordHash]);
        const userId = result.insertId;

        // Criar perfil em branco inicial
        await db.query('INSERT INTO profiles (user_id) VALUES (?)', [userId]);

        res.json({ success: true, message: 'Conta criada com sucesso!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro interno ao registar conta.' });
    }
});

// Login
app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    const normalized = (username || '').trim().toLowerCase();

    if (!normalized || !password) {
        return res.status(400).json({ error: 'Campos utilizador e password são obrigatórios.' });
    }

    try {
        const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [normalized]);
        if (rows.length === 0) {
            return res.status(400).json({ error: 'Credenciais incorretas ou utilizador inexistente.' });
        }

        const user = rows[0];
        const validPass = await bcrypt.compare(password, user.password_hash);
        if (!validPass) {
            return res.status(400).json({ error: 'Credenciais incorretas ou utilizador inexistente.' });
        }

        // Emitir JWT
        const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '30d' });

        res.json({ success: true, token, username: user.username });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro interno ao fazer login.' });
    }
});

// -------------------------------------------------------------
// ENDPOINTS DE PERFIL
// -------------------------------------------------------------

// Obter Perfil
app.get('/api/profile', authenticateToken, async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM profiles WHERE user_id = ?', [req.user.id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Perfil não encontrado.' });
        }
        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao carregar perfil.' });
    }
});

// Gravar/Atualizar Perfil
app.post('/api/profile', authenticateToken, async (req, res) => {
    const {
        age, weight, height, sport, custom_sport, experience, goals,
        injuries, injury_details, days_per_week, hours_per_session,
        budget, equipment, notes, target_vert, target_weight
    } = req.body;

    try {
        // Como o registo cria a linha em branco, usamos UPDATE
        await db.query(`
            UPDATE profiles SET 
                age = ?, weight = ?, height = ?, sport = ?, custom_sport = ?, 
                experience = ?, goals = ?, injuries = ?, injury_details = ?, days_per_week = ?, 
                hours_per_session = ?, budget = ?, equipment = ?, notes = ?, 
                target_vert = ?, target_weight = ?
            WHERE user_id = ?
        `, [
            age || null, weight || null, height || null, sport || null, custom_sport || null,
            experience || null, JSON.stringify(goals || []), JSON.stringify(injuries || []), injury_details || null, days_per_week || null,
            hours_per_session || null, budget || null, equipment || null, notes || null,
            target_vert || null, target_weight || null, req.user.id
        ]);

        res.json({ success: true, message: 'Perfil atualizado com sucesso!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao guardar perfil.' });
    }
});

// -------------------------------------------------------------
// ENDPOINTS DE PLANO DE TREINO
// -------------------------------------------------------------

// Obter Plano
app.get('/api/plan', authenticateToken, async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM plans WHERE user_id = ?', [req.user.id]);
        if (rows.length === 0) {
            return res.json(null); // Retorna nulo se não houver plano gerado
        }
        
        const plan = rows[0];
        res.json({
            plan: plan.plan_json ? JSON.parse(plan.plan_json) : null,
            week: plan.week,
            openSections: plan.open_sections_json ? JSON.parse(plan.open_sections_json) : {}
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao carregar plano de treinos.' });
    }
});

// Gravar Plano
app.post('/api/plan', authenticateToken, async (req, res) => {
    const { plan, week, openSections } = req.body;

    try {
        // Verificar se já existe uma linha de plano para o utilizador
        const [existing] = await db.query('SELECT id FROM plans WHERE user_id = ?', [req.user.id]);
        
        const planJson = plan ? JSON.stringify(plan) : null;
        const openSecJson = openSections ? JSON.stringify(openSections) : null;

        if (existing.length > 0) {
            await db.query('UPDATE plans SET plan_json = ?, week = ?, open_sections_json = ? WHERE user_id = ?', [
                planJson, week, openSecJson, req.user.id
            ]);
        } else {
            await db.query('INSERT INTO plans (user_id, plan_json, week, open_sections_json) VALUES (?, ?, ?, ?)', [
                req.user.id, planJson, week, openSecJson
            ]);
        }

        res.json({ success: true, message: 'Plano gravado com sucesso!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao gravar plano.' });
    }
});

// Reset do plano (eliminar plano ativo)
app.delete('/api/plan', authenticateToken, async (req, res) => {
    try {
        await db.query('DELETE FROM plans WHERE user_id = ?', [req.user.id]);
        await db.query('DELETE FROM checks WHERE user_id = ?', [req.user.id]);
        res.json({ success: true, message: 'Plano e histórico de checks apagados com sucesso!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao fazer reset ao plano.' });
    }
});

// -------------------------------------------------------------
// ENDPOINTS DE CHECKS DE EXERCÍCIO
// -------------------------------------------------------------

// Obter todos os checks
app.get('/api/checks', authenticateToken, async (req, res) => {
    try {
        const [rows] = await db.query('SELECT check_key, checked FROM checks WHERE user_id = ?', [req.user.id]);
        const checksObj = {};
        rows.forEach(r => {
            checksObj[r.check_key] = !!r.checked;
        });
        res.json(checksObj);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao ler checks concluídos.' });
    }
});

// Inverter estado de um check
app.post('/api/checks/toggle', authenticateToken, async (req, res) => {
    const { checkKey } = req.body;

    if (!checkKey) {
        return res.status(400).json({ error: 'Parâmetro checkKey obrigatório.' });
    }

    try {
        const [existing] = await db.query('SELECT id, checked FROM checks WHERE user_id = ? AND check_key = ?', [req.user.id, checkKey]);
        
        let newStatus = true;
        if (existing.length > 0) {
            newStatus = !existing[0].checked;
            await db.query('UPDATE checks SET checked = ? WHERE id = ?', [newStatus, existing[0].id]);
        } else {
            await db.query('INSERT INTO checks (user_id, check_key, checked) VALUES (?, ?, ?)', [req.user.id, checkKey, true]);
        }

        res.json({ success: true, checked: newStatus });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao alternar marcação do exercício.' });
    }
});

// -------------------------------------------------------------
// ENDPOINTS DE HISTÓRICO / ESTATÍSTICAS
// -------------------------------------------------------------

// Obter stats
app.get('/api/stats', authenticateToken, async (req, res) => {
    try {
        const [rows] = await db.query('SELECT type, date_label, value FROM stats WHERE user_id = ? ORDER BY id ASC', [req.user.id]);
        
        const verts = [{ date: "Início", value: 50 }];
        const weights = [{ date: "Início", value: 80 }];

        rows.forEach(r => {
            const ptDate = r.date_label;
            const floatVal = parseFloat(r.value);
            if (r.type === 'verts') {
                verts.push({ date: ptDate, value: floatVal });
            } else if (r.type === 'weights') {
                weights.push({ date: ptDate, value: floatVal });
            }
        });

        res.json({ verts, weights });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao ler estatísticas de progresso.' });
    }
});

// Adicionar stat
app.post('/api/stats', authenticateToken, async (req, res) => {
    const { type, value } = req.body;
    const floatVal = parseFloat(value);

    if (!type || isNaN(floatVal)) {
        return res.status(400).json({ error: 'Parâmetros type e value numérico são obrigatórios.' });
    }

    try {
        const ptDate = new Date().toLocaleDateString("pt-PT", { day: "2-digit", month: "short" });
        await db.query('INSERT INTO stats (user_id, type, date_label, value) VALUES (?, ?, ?, ?)', [
            req.user.id, type, ptDate, floatVal
        ]);
        res.json({ success: true, date: ptDate, value: floatVal });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao guardar estatística.' });
    }
});

// -------------------------------------------------------------
// ENDPOINTS DE INTELIGÊNCIA ARTIFICIAL (COACH)
// -------------------------------------------------------------

// Geração de Plano de Treino
app.post('/api/coach/generate', authenticateToken, async (req, res) => {
    const { profile, apiKey } = req.body;
    const userApiKey = apiKey || process.env.ANTHROPIC_API_KEY || '';
    const keyLower = userApiKey.toLowerCase();
    const isMock = !userApiKey || !userApiKey.startsWith('sk-ant-') || keyLower.includes('mock') || keyLower.includes('test') || keyLower.includes('dummy');

    if (isMock) {
        console.log("Mock key detected in backend. Generating local plan...");
        const plan = generateMockPlan(profile);
        return res.json(plan);
    }

    try {
        const nDays = Math.min(parseInt(profile.days_per_week || profile.daysPerWeek) || 5, 7);
        const systemPrompt = "Responde APENAS com JSON puro e válido. Zero texto antes ou depois. Zero backticks. Apenas o objecto JSON.";
        const userPrompt = `Cria um plano de treino dinâmico de 12 semanas (dividido em 3 fases de 4 semanas) em JSON para este atleta:
Desporto: ${profile.sport}${profile.custom_sport || profile.customSport ? ` (${profile.custom_sport || profile.customSport})` : ""}
Objetivos: ${Array.isArray(profile.goals) ? profile.goals.join(", ") : "performance"}
Idade: ${profile.age}a | Peso: ${profile.weight}kg | Altura: ${profile.height}cm
Experiência: ${profile.experience} | Lesões: ${Array.isArray(profile.injuries) ? profile.injuries.filter(x=>x!=="none").join(", ") : "nenhuma"} ${profile.injury_details || profile.injuryDetails || ""}
Dias treino: ${nDays}/7 | Horas/sessão: ${profile.hours_per_session || profile.hoursPerSession}h
Orçamento: ${profile.budget} | Equipamento: ${profile.equipment || "ginásio completo"}

REGRAS RÍGIDAS DE COERÊNCIA:
1. DIAS DE TREINO (DURAÇÃO E DISTRIBUIÇÃO): 
- No 'dayPlan', para cada uma das fases (1, 2, 3), deves ter exatamente ${nDays} dias ativos (com "rest": false) e os restantes (7 - ${nDays}) como descanso (com "rest": true).
- No 'sched' (agenda horária), apenas os dias ativos no 'dayPlan' devem conter blocos de treino. Os dias de descanso devem conter apenas rotinas de descanso, mobilidade e recuperação.
- As durações das sessões nos treinos (skills, pliometria, força) descritas na agenda devem somar exatamente a duração diária selecionada de ${profile.hours_per_session || profile.hoursPerSession} horas.
2. EQUIPAMENTO DISPONÍVEL:
- Adapta rigorosamente os exercícios de 'gym' e 'vert' para o equipamento: '${profile.equipment}'.
- Se o equipamento for "peso corporal" ou "mínimo", usa apenas variações com peso do corpo ou bandas.
3. OBJETIVOS E DIETA:
- Se incluir perda de gordura ('lose_fat'), a dieta foca em menor densidade calórica. Se 'muscle', foca em calorias abundantes.
4. LESÕES E LIMITAÇÕES:
- Não prescrevas exercícios com sobrecarga axial ou impacto na articulação lesionada. Mapeia orientações específicas de recuperação.
`;

        const anthRes = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": userApiKey,
                "anthropic-version": "2023-06-01"
            },
            body: JSON.stringify({
                model: "claude-3-5-sonnet-20241022",
                max_tokens: 4000,
                system: systemPrompt,
                messages: [{ role: "user", content: userPrompt }]
            })
        });

        if (!anthRes.ok) {
            const err = await anthRes.json().catch(() => ({}));
            throw new Error(err?.error?.message || `HTTP ${anthRes.status}`);
        }

        const data = await anthRes.json();
        const raw = data.content?.map(b => b.text || "").join("") || "";
        
        const cleanJSON = (str) => {
            const cleaned = str.trim();
            try { return JSON.parse(cleaned); } catch {}
            const stripped = cleaned.replace(/```(?:json)?/gi, "").trim();
            try { return JSON.parse(stripped); } catch {}
            const start = stripped.indexOf("{");
            const end = stripped.lastIndexOf("}");
            if (start !== -1 && end !== -1 && end > start) {
                return JSON.parse(stripped.slice(start, end + 1));
            }
            throw new Error("Formato JSON inválido");
        };

        const plan = cleanJSON(raw);
        res.json(plan);
    } catch (err) {
        console.warn("Erro na geração da IA real no backend. Fallback para mock...", err.message);
        const plan = generateMockPlan(profile);
        res.json(plan);
    }
});

// Obter Histórico de Conversação do Coach
app.get('/api/coach/chat/history', authenticateToken, async (req, res) => {
    try {
        const [rows] = await db.query('SELECT sender, message, created_at FROM chat_messages WHERE user_id = ? ORDER BY created_at ASC', [req.user.id]);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao carregar histórico de conversação.' });
    }
});

// Limpar Histórico de Conversação do Coach
app.delete('/api/coach/chat/history', authenticateToken, async (req, res) => {
    try {
        await db.query('DELETE FROM chat_messages WHERE user_id = ?', [req.user.id]);
        res.json({ success: true, message: 'Histórico de conversação limpo com sucesso!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao limpar histórico de conversação.' });
    }
});

// Chat Streaming com o Coach
app.post('/api/coach/chat', authenticateToken, async (req, res) => {
    const { profile, historyStr, userText, apiKey } = req.body;
    const userApiKey = apiKey || process.env.ANTHROPIC_API_KEY || '';
    const keyLower = userApiKey.toLowerCase();
    const isMock = !userApiKey || !userApiKey.startsWith('sk-ant-') || keyLower.includes('mock') || keyLower.includes('test') || keyLower.includes('dummy');

    // Guardar mensagem do utilizador de imediato
    try {
        await db.query('INSERT INTO chat_messages (user_id, sender, message) VALUES (?, ?, ?)', [req.user.id, 'user', userText || '']);
    } catch (dbErr) {
        console.error("Erro ao guardar mensagem do utilizador na BD:", dbErr);
    }

    // Configurar cabeçalhos SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    if (isMock) {
        let responseText = "";
        let updateBlock = "";
        
        const textLower = (userText || '').toLowerCase();
        if (textLower.includes("alerg") || textLower.includes("dieta") || textLower.includes("comer") || textLower.includes("refeic") || textLower.includes("peixe") || textLower.includes("leite") || textLower.includes("amendoim") || textLower.includes("ovo")) {
            responseText = "Compreendo perfeitamente a tua restrição alimentar. Ajustei a tua dieta e refeições no plano para remover o alimento problemático e substituí-lo por uma alternativa segura e igualmente nutritiva, mantendo os teus objetivos.\n\nPodes verificar a tua nova ementa diária no Plano.";
            updateBlock = `\n<update_plan>\n{\n  "meals": [\n    {"id": "m1", "label": "Pequeno-almoço", "desc": "Papas de aveia com água ou bebida vegetal, banana fatiada e sementes de abóbora (Alternativa sem alergénios)"},\n    {"id": "m2", "label": "Almoço", "desc": "Grelhado de peru ou tofu marinado, brócolos e arroz basmati"}\n  ]\n}\n</update_plan>`;
        } else if (textLower.includes("les") || textLower.includes("dor") || textLower.includes("joelho") || textLower.includes("ombro") || textLower.includes("costas")) {
            responseText = "Lamento ouvir sobre o teu desconforto. Ajustei o teu plano de treinos para reduzir a carga nas articulações afetadas e incluí notas preventivas na secção de recuperação. Lembra-te de parar se a dor exceder 4/10.";
            updateBlock = `\n<update_plan>\n{\n  "injuryWarning": "Foco redobrado em mobilidade e aquecimento específico na articulação com queixas de dor.",\n  "weeklyTip": "Treina de forma inteligente: substitui qualquer exercício que cause dor por alongamento dinâmico."\n}\n</update_plan>`;
        } else {
            responseText = "Olá! Como o teu Coach virtual, estou aqui para ajudar. Se quiseres que ajuste a tua dieta (por exemplo, por alergias ou preferências) ou o teu treino (por lesão ou fadiga), basta dizeres o que pretendes mudar e eu atualizo o teu plano de imediato!";
        }

        const fullText = responseText + updateBlock;
        let i = 0;
        const interval = setInterval(async () => {
            if (i >= fullText.length) {
                // Guardar resposta completa do coach na BD
                try {
                    await db.query('INSERT INTO chat_messages (user_id, sender, message) VALUES (?, ?, ?)', [req.user.id, 'coach', fullText]);
                } catch (dbErr) {
                    console.error("Erro ao guardar resposta mock do coach na BD:", dbErr);
                }
                res.write("data: [DONE]\n\n");
                res.end();
                clearInterval(interval);
                return;
            }
            const chunk = fullText.slice(i, i + 12);
            i += 12;
            res.write(`data: ${JSON.stringify({ type: "content_block_delta", delta: { text: chunk } })}\n\n`);
        }, 30);
        return;
    }

    try {
        const systemPrompt = `És o FitCoach AI — treinador pessoal, nutricionista e fisioterapeuta de elite.
Perfil do Atleta:
- Desporto: ${profile.sport}${profile.custom_sport || profile.customSport ? ` (${profile.custom_sport || profile.customSport})` : ""}
- Objetivos: ${Array.isArray(profile.goals) ? profile.goals.join(", ") : "performance"}
- Idade: ${profile.age}a | Peso: ${profile.weight}kg | Altura: ${profile.height}cm
- Experiência: ${profile.experience} | Lesões: ${Array.isArray(profile.injuries) ? profile.injuries.filter(x=>x!=="none").join(", ") : "nenhuma"} ${profile.injury_details || profile.injuryDetails || ""}

Responde sempre em Português Europeu de forma motivadora, direta e profissional.
SE o atleta pedir para alterar ou ajustar algo no seu plano de treino, nutrição, suplementação ou agenda:
1. Explica as alterações que vais fazer.
2. No FIM da tua resposta, inclui a secção correspondente do plano atualizada dentro de blocos <update_plan>...</update_plan> no formato JSON.
`;

        const anthRes = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": userApiKey,
                "anthropic-version": "2023-06-01"
            },
            body: JSON.stringify({
                model: "claude-3-Sonnet-20241022",
                max_tokens: 2000,
                stream: true,
                system: systemPrompt,
                messages: [{ role: "user", content: `Conversa:\n${historyStr}\n\nAtleta: ${userText}` }]
            })
        });

        if (!anthRes.ok) {
            throw new Error(`HTTP ${anthRes.status}`);
        }

        // Acumulador de resposta de texto no backend para persistir
        let fullResponseText = '';
        const decoder = new TextDecoder();
        let buffer = '';

        for await (const chunk of anthRes.body) {
            res.write(chunk);

            buffer += decoder.decode(chunk, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
                const cleaned = line.trim();
                if (!cleaned.startsWith('data: ')) continue;
                const dataStr = cleaned.slice(6).trim();

                if (dataStr === '[DONE]') continue;
                
                try {
                    const parsed = JSON.parse(dataStr);
                    if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
                        fullResponseText += parsed.delta.text;
                    }
                } catch (err) {
                    // ignorar
                }
            }
        }
        res.end();

        // Guardar resposta completa real do coach na BD
        if (fullResponseText) {
            try {
                await db.query('INSERT INTO chat_messages (user_id, sender, message) VALUES (?, ?, ?)', [req.user.id, 'coach', fullResponseText]);
            } catch (dbErr) {
                console.error("Erro ao guardar resposta real do coach na BD:", dbErr);
            }
        }
    } catch (err) {
        console.error("Erro no stream do Coach no backend:", err);
        res.write(`data: ${JSON.stringify({ type: "content_block_delta", delta: { text: "Lamento, ocorreu um erro de ligação ao meu servidor de IA. Por favor, tenta novamente." } })}\n\n`);
        res.write("data: [DONE]\n\n");
        res.end();
    }
});

// -------------------------------------------------------------
// INICIALIZAÇÃO E ARRANQUE DO SERVIDOR
// -------------------------------------------------------------
async function startServer() {
    try {
        // Inicializar Base de dados (e auto-tabelas)
        await db.initDB();

        // Iniciar escuta Express
        app.listen(PORT, () => {
            console.log(`FitTracker AI Server running locally on http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error('CRITICAL: Server failed to start due to database connection issue:', err.message);
        console.error('Verify if your MySQL instance is running and if your root password in .env is correct.');
        process.exit(1);
    }
}

startServer();
