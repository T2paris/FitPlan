import { useState, useEffect, useRef, useCallback } from "react";

// ── Colors ────────────────────────────────────────────────────────────────────
const C = {
  bg: "#0A0A0F", s1: "#111118", s2: "#18181F", bd: "#1E1E2E",
  tx: "#F0F0F0", dim: "#71717A", mut: "#52525B",
  gold: "#C9A227", orange: "#F97316", red: "#EF4444", blue: "#3B82F6",
  green: "#22C55E", purple: "#A855F7", pink: "#EC4899",
};
const PHASE_COLORS = [C.blue, C.green, C.purple];
const CAT = {
  warmup:      { color: "#888",      icon: "🔥", label: "Aquecimento" },
  gym:         { color: C.red,       icon: "💪", label: "Musculação" },
  sport:       { color: C.blue,      icon: "🎯", label: "Treino Desportivo" },
  vertical:    { color: C.purple,    icon: "⬆️", label: "Pliometria/Vertical" },
  cardio:      { color: C.pink,      icon: "🫀", label: "Cardio" },
  recovery:    { color: C.green,     icon: "🧘", label: "Recuperação" },
  meals:       { color: C.orange,    icon: "🍽️", label: "Refeições" },
  supplements: { color: C.gold,      icon: "💊", label: "Suplementos" },
};
const CAT_ORDER = ["warmup","gym","sport","vertical","cardio","recovery","meals","supplements"];

const SPORTS = [
  { id:"basketball", icon:"🏀", label:"Basquetebol" },
  { id:"football",   icon:"⚽", label:"Futebol" },
  { id:"gym",        icon:"🏋️", label:"Musculação" },
  { id:"running",    icon:"🏃", label:"Corrida" },
  { id:"mma",        icon:"🥊", label:"Artes Marciais" },
  { id:"swimming",   icon:"🏊", label:"Natação" },
  { id:"calisthenics",icon:"🤸",label:"Calistenia" },
  { id:"custom",     icon:"⚡", label:"Outro" },
];
const GOALS = [
  { id:"muscle",      label:"Ganhar músculo",     icon:"💪" },
  { id:"lose_fat",    label:"Perder gordura",      icon:"🔥" },
  { id:"performance", label:"Performance",         icon:"🏆" },
  { id:"strength",    label:"Força máxima",        icon:"🦾" },
  { id:"endurance",   label:"Resistência",         icon:"❤️" },
  { id:"recovery",    label:"Recuperação lesão",   icon:"🩹" },
  { id:"vertical",    label:"Salto vertical",      icon:"🚀" },
  { id:"general",     label:"Saúde geral",         icon:"🧘" },
];
const EXPERIENCE = [
  { id:"beginner",     label:"Iniciante",   desc:"< 6 meses" },
  { id:"intermediate", label:"Intermédio",  desc:"6m – 2 anos" },
  { id:"advanced",     label:"Avançado",    desc:"2+ anos" },
];
const INJURIES_LIST = [
  { id:"none",     label:"Nenhuma" },   { id:"knee",     label:"Joelho" },
  { id:"ankle",    label:"Tornozelo" }, { id:"shoulder", label:"Ombro" },
  { id:"back",     label:"Costas" },    { id:"wrist",    label:"Pulso" },
  { id:"hip",      label:"Anca" },      { id:"other",    label:"Outra" },
];
const BUDGETS = [
  { id:"low",    label:"Económico",  desc:"< €30/sem",   icon:"💰" },
  { id:"medium", label:"Moderado",   desc:"€30–60/sem",  icon:"💰💰" },
  { id:"high",   label:"Sem limite", desc:"€60+/sem",    icon:"💰💰💰" },
];

// ── AI helpers ────────────────────────────────────────────────────────────────
async function callAPI(system, user) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4000,
      system,
      messages: [{ role: "user", content: user }],
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `HTTP ${res.status}`);
  }
  const data = await res.json();
  return data.content?.map(b => b.text || "").join("") || "";
}

async function callAPIStream(system, user, onChunk) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      stream: true,
      system,
      messages: [{ role: "user", content: user }],
    }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let full = "", buf = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    const lines = buf.split("\n"); buf = lines.pop() || "";
    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const raw = line.slice(6).trim();
      if (raw === "[DONE]") return full;
      try {
        const parsed = JSON.parse(raw);
        if (parsed.type === "content_block_delta" && parsed.delta?.text) {
          full += parsed.delta.text;
          onChunk(full);
        }
      } catch {}
    }
  }
  return full;
}

// Extract first valid JSON object from a string (handles markdown fences etc.)
function extractJSON(raw) {
  // Try direct parse first
  try { return JSON.parse(raw.trim()); } catch {}
  // Strip markdown fences
  const stripped = raw.replace(/```(?:json)?/gi, "").trim();
  try { return JSON.parse(stripped); } catch {}
  // Find first { ... } block
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) {
    try { return JSON.parse(raw.slice(start, end + 1)); } catch {}
  }
  throw new Error("Não foi possível extrair JSON da resposta");
}

// ── Plan prompt (simpler = more reliable JSON) ─────────────────────────────
function planPrompt(p) {
  const nDays = Math.min(parseInt(p.daysPerWeek) || 5, 7);
  return `Cria um plano de treino semanal em JSON para este atleta:
Desporto: ${p.sport}${p.customSport ? ` (${p.customSport})` : ""}
Objetivos: ${p.goals?.join(", ") || "performance"}
Idade: ${p.age}a | Peso: ${p.weight}kg | Altura: ${p.height}cm
Experiência: ${p.experience} | Lesões: ${p.injuries?.filter(x=>x!=="none").join(", ") || "nenhuma"} ${p.injuryDetails||""}
Dias treino: ${nDays}/7 | Horas/sessão: ${p.hoursPerSession}h
Orçamento: ${p.budget} | Equipamento: ${p.equipment || "ginásio completo"}

Devolve APENAS este JSON, sem texto antes ou depois, sem backticks:
{
  "phases": [
    {"id":1,"name":"Fase 1 - Nome","weeks":"Sem 1-4","focus":"Foco principal"},
    {"id":2,"name":"Fase 2 - Nome","weeks":"Sem 5-8","focus":"Foco"},
    {"id":3,"name":"Fase 3 - Nome","weeks":"Sem 9-12","focus":"Foco peak"}
  ],
  "days": [
    {
      "day":"2ª","label":"Segunda","icon":"💪","goal":"Objectivo breve",
      "isRest":false,
      "schedule":[
        {"time":"08:30","activity":"Acordar + Pequeno-almoço","color":"orange","note":""},
        {"time":"09:00","activity":"Suplemento pré-treino","color":"gold","note":""},
        {"time":"09:30","activity":"Treino","color":"red","note":"75 min"}
      ],
      "sections":{
        "warmup":[{"id":"w1","name":"Bike leve","detail":"10 min"}],
        "gym":[{"id":"g1","name":"Agachamento","detail":"4x8"},{"id":"g2","name":"Leg Press","detail":"4x10"}],
        "sport":[{"id":"s1","name":"Dribble cones","detail":"20 min"}],
        "vertical":[],
        "cardio":[],
        "recovery":[{"id":"r1","name":"Gelo joelho","detail":"15 min"}],
        "meals":[
          {"id":"m1","name":"Pequeno-almoço","detail":"Aveia 80g + banana + 3 ovos"},
          {"id":"m2","name":"Almoço","detail":"Frango 200g + arroz 150g + brócolos"},
          {"id":"m3","name":"Jantar","detail":"Salmão 180g + batata-doce 200g"}
        ],
        "supplements":[
          {"id":"sp1","name":"Creatina","detail":"5g pós-treino","star":false},
          {"id":"sp2","name":"Whey","detail":"30g pós-treino","star":false}
        ]
      }
    }
  ],
  "injuryWarning": null,
  "weeklyTip": "Dica motivacional curta"
}

REGRAS OBRIGATÓRIAS:
- Gera EXATAMENTE 7 dias (${nDays} de treino, ${7-nDays} de descanso)
- Cada dia de treino: 4-6 exercícios gym, 3-5 refeições, suplementos relevantes
- Dias de descanso: isRest:true, sections só com recovery e meals
- IDs únicos dentro de cada secção: w1,w2 / g1,g2 / s1,s2 / r1,r2 / m1,m2 / sp1,sp2
- schedule colors: "orange"=comida, "gold"=supls, "red"=gym, "blue"=sport, "green"=recovery, "purple"=vertical, "gray"=descanso
- injuryWarning: string com aviso se tiver lesão, senão null
- JSON tem de ser válido — sem vírgulas a mais, sem campos em falta`;
}

function chatPrompt(p) {
  return `És o FitCoach AI — treinador pessoal, nutricionista e fisioterapeuta de elite.
Perfil: ${p.sport}${p.customSport ? ` (${p.customSport})` : ""}, ${p.age}a, ${p.weight}kg, ${p.height}cm, ${p.experience}, lesões: ${p.injuries?.filter(x=>x!=="none").join(",")||"nenhuma"} ${p.injuryDetails||""}, obj: ${p.goals?.join(",")}, orç: ${p.budget}.
Responde SEMPRE em Português Europeu. Sê direto, prático, motivador. Usa markdown (negrito, listas). Se for questão médica grave, recomenda profissional.`;
}

// ── Markdown renderer ─────────────────────────────────────────────────────────
function mdRender(t) {
  if (!t) return "";
  return t
    .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
    .replace(/\*\*(.+?)\*\*/g,'<strong style="color:#e4e4e7">$1</strong>')
    .replace(/^### (.+)$/gm,'<div style="font-family:monospace;font-size:13px;font-weight:700;color:#C9A227;margin:10px 0 3px">$1</div>')
    .replace(/^## (.+)$/gm,'<div style="font-family:monospace;font-size:15px;font-weight:700;color:#F97316;margin:14px 0 5px">$1</div>')
    .replace(/^- (.+)$/gm,'<div style="padding:2px 0 2px 14px;position:relative;font-size:13px;color:#d4d4d8"><span style="position:absolute;left:0;color:#F97316">▸</span>$1</div>')
    .replace(/\n{2,}/g,'<div style="height:7px"></div>')
    .replace(/\n/g,"<br/>");
}

// ══════════════════════════════════════════════════════════════════════════════
//  UI COMPONENTS
// ══════════════════════════════════════════════════════════════════════════════

function Bar({ pct, color, h = 5 }) {
  return (
    <div style={{ background: C.bd, borderRadius: 99, overflow: "hidden", height: h }}>
      <div style={{ width: `${Math.min(100, Math.max(0, pct || 0))}%`, height: "100%", borderRadius: 99, background: color, transition: "width .4s" }} />
    </div>
  );
}

// ── Onboarding ────────────────────────────────────────────────────────────────
function Onboarding({ onDone }) {
  const [step, setStep] = useState(0);
  const [p, setP] = useState({
    sport:"", customSport:"", goals:[], age:"", weight:"", height:"",
    experience:"", injuries:[], injuryDetails:"", daysPerWeek:5,
    hoursPerSession:1.5, budget:"medium", equipment:"", notes:"",
  });
  const set = (k, v) => setP(x => ({ ...x, [k]: v }));
  const tog = (k, v) => setP(x => ({ ...x, [k]: x[k].includes(v) ? x[k].filter(i=>i!==v) : [...x[k], v] }));
  const ok = [
    () => !!p.sport,
    () => p.goals.length > 0,
    () => !!(p.age && p.weight && p.height),
    () => !!p.experience,
    () => true,
  ];

  const pages = [
    // 0 — Sport
    <>
      <T2>Qual é o teu desporto?</T2><T3>Modalidade principal</T3>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
        {SPORTS.map(s => (
          <Btn key={s.id} active={p.sport===s.id} onClick={() => set("sport", s.id)} col={C.orange}>
            <span style={{fontSize:22}}>{s.icon}</span>
            <span style={{fontFamily:"monospace",fontSize:12,fontWeight:700,color:"#fff"}}>{s.label}</span>
          </Btn>
        ))}
      </div>
      {p.sport==="custom" && <input style={{...SS.inp,marginTop:10}} placeholder="Descreve o teu desporto..." value={p.customSport} onChange={e=>set("customSport",e.target.value)}/>}
    </>,
    // 1 — Goals
    <>
      <T2>Objetivos</T2><T3>Podes escolher vários</T3>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
        {GOALS.map(g => (
          <Btn key={g.id} active={p.goals.includes(g.id)} onClick={() => tog("goals", g.id)} col={C.orange} row>
            <span style={{fontSize:18}}>{g.icon}</span>
            <span style={{fontSize:12,color:"#ddd"}}>{g.label}</span>
          </Btn>
        ))}
      </div>
    </>,
    // 2 — Stats
    <>
      <T2>Dados físicos</T2>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10 }}>
        {[["age","Idade","anos","22"],["weight","Peso","kg","80"],["height","Altura","cm","180"]].map(([k,l,u,ph])=>(
          <div key={k}>
            <div style={SS.lbl}>{l}</div>
            <div style={{position:"relative"}}>
              <input type="number" style={SS.inp} placeholder={ph} value={p[k]} onChange={e=>set(k,e.target.value)}/>
              <span style={{position:"absolute",right:8,top:"50%",transform:"translateY(-50%)",fontSize:10,color:C.mut}}>{u}</span>
            </div>
          </div>
        ))}
      </div>
    </>,
    // 3 — Experience + Injuries
    <>
      <T2>Experiência & Saúde</T2>
      <div style={SS.lbl}>Nível de experiência</div>
      <div style={{display:"flex",gap:6,marginBottom:16}}>
        {EXPERIENCE.map(e=>(
          <Btn key={e.id} active={p.experience===e.id} onClick={()=>set("experience",e.id)} col={C.orange} style={{flex:1}}>
            <span style={{fontSize:12,fontWeight:700,color:"#fff"}}>{e.label}</span>
            <span style={{fontSize:10,color:C.dim}}>{e.desc}</span>
          </Btn>
        ))}
      </div>
      <div style={SS.lbl}>Lesões / condições</div>
      <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:10}}>
        {INJURIES_LIST.map(i=>(
          <button key={i.id}
            onClick={()=>i.id==="none" ? set("injuries",["none"]) : tog("injuries",i.id)}
            style={{...SS.chip, borderColor:p.injuries.includes(i.id)?C.orange:C.bd, color:p.injuries.includes(i.id)?C.orange:C.tx, background:p.injuries.includes(i.id)?C.orange+"18":C.s1}}>
            {i.label}
          </button>
        ))}
      </div>
      {p.injuries.some(i=>i!=="none") &&
        <input style={SS.inp} placeholder="Detalhes da lesão..." value={p.injuryDetails} onChange={e=>set("injuryDetails",e.target.value)}/>}
    </>,
    // 4 — Schedule + Budget
    <>
      <T2>Rotina & Orçamento</T2>
      <div style={SS.lbl}>Dias de treino/semana: <strong style={{color:C.orange}}>{p.daysPerWeek}</strong></div>
      <input type="range" min={2} max={7} value={p.daysPerWeek} onChange={e=>set("daysPerWeek",+e.target.value)} style={{width:"100%",accentColor:C.orange,marginBottom:16}}/>
      <div style={SS.lbl}>Horas por sessão: <strong style={{color:C.orange}}>{p.hoursPerSession}h</strong></div>
      <input type="range" min={0.5} max={3} step={0.5} value={p.hoursPerSession} onChange={e=>set("hoursPerSession",+e.target.value)} style={{width:"100%",accentColor:C.orange,marginBottom:16}}/>
      <div style={SS.lbl}>Orçamento alimentar</div>
      <div style={{display:"flex",gap:6,marginBottom:14}}>
        {BUDGETS.map(b=>(
          <Btn key={b.id} active={p.budget===b.id} onClick={()=>set("budget",b.id)} col={C.orange} style={{flex:1}}>
            <span style={{fontSize:14}}>{b.icon}</span>
            <span style={{fontSize:11,fontWeight:700,color:"#fff"}}>{b.label}</span>
            <span style={{fontSize:10,color:C.dim}}>{b.desc}</span>
          </Btn>
        ))}
      </div>
      <div style={SS.lbl}>Equipamento disponível</div>
      <input style={{...SS.inp,marginBottom:10}} placeholder="ginásio completo, casa, parque..." value={p.equipment} onChange={e=>set("equipment",e.target.value)}/>
      <div style={SS.lbl}>Notas extra</div>
      <textarea style={{...SS.inp,minHeight:60,resize:"vertical"}} placeholder="Algo mais que o coach deva saber..." value={p.notes} onChange={e=>set("notes",e.target.value)}/>
    </>,
  ];

  return (
    <div style={{fontFamily:"Georgia,serif",background:C.bg,minHeight:"100vh",padding:"20px 14px 30px",maxWidth:500,margin:"0 auto",color:C.tx}}>
      <div style={{textAlign:"center",marginBottom:20}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginBottom:4}}>
          <span style={{fontSize:26}}>⚡</span>
          <span style={{fontFamily:"monospace",fontSize:22,fontWeight:700,color:C.orange,letterSpacing:-1}}>FitPlan AI</span>
        </div>
        <div style={{fontSize:10,color:C.dim,fontFamily:"monospace",letterSpacing:2}}>TREINADOR PESSOAL COM IA</div>
      </div>

      {/* Progress dots */}
      <div style={{display:"flex",gap:5,justifyContent:"center",marginBottom:22}}>
        {[0,1,2,3,4].map(i=>(
          <div key={i} style={{width:i===step?32:24,height:3,borderRadius:2,background:i<=step?C.orange:C.bd,transition:"all .3s"}}/>
        ))}
      </div>

      <div style={{marginBottom:20}}>{pages[step]}</div>

      <div style={{display:"flex",alignItems:"center",gap:10,paddingTop:12,borderTop:`1px solid ${C.bd}`}}>
        {step > 0 && <button onClick={()=>setStep(s=>s-1)} style={{background:"none",border:"none",color:C.dim,fontSize:13,cursor:"pointer",fontFamily:"Georgia"}}>← Voltar</button>}
        <div style={{flex:1}}/>
        {step < 4
          ? <button onClick={()=>ok[step]()&&setStep(s=>s+1)} disabled={!ok[step]()} style={{...SS.mainBtn,opacity:ok[step]()?1:.4}}>Continuar →</button>
          : <button onClick={()=>onDone(p)} style={SS.mainBtn}>🚀 Gerar o meu plano</button>
        }
      </div>
      <style>{CSS}</style>
    </div>
  );
}

// Small helper components
function T2({ children }) { return <div style={{ fontFamily:"monospace", fontSize:17, fontWeight:700, color:"#fff", marginBottom:4 }}>{children}</div>; }
function T3({ children }) { return <div style={{ fontSize:12, color:C.dim, marginBottom:12 }}>{children}</div>; }
function Btn({ active, onClick, col, children, row, style: extra = {} }) {
  return (
    <button onClick={onClick} style={{
      ...SS.card, flexDirection: row ? "row" : "column",
      borderColor: active ? col : C.bd,
      background: active ? col + "18" : C.s1,
      ...extra,
    }}>
      {children}
    </button>
  );
}

// ── Section (collapsible checklist) ──────────────────────────────────────────
function Section({ catKey, items, checks, dayIdx, onToggle, open, onToggleOpen }) {
  if (!items || items.length === 0) return null;
  const { color, icon, label } = CAT[catKey] || { color: C.dim, icon:"📋", label: catKey };
  const total = items.length;
  const done = items.filter(ex => checks[`${dayIdx}:${catKey}:${ex.id}`]).length;
  const pct = total > 0 ? Math.round(done / total * 100) : 0;
  const complete = done === total && total > 0;

  return (
    <div style={{ marginBottom:8, borderRadius:10, overflow:"hidden", border:`1px solid ${complete ? color : color+"44"}` }}>
      <button onClick={onToggleOpen} style={{
        width:"100%", display:"flex", alignItems:"center", gap:8, padding:"10px 12px",
        background: complete ? color+"22" : color+"0D", border:"none", textAlign:"left", cursor:"pointer",
      }}>
        <span style={{fontSize:14}}>{complete ? "✅" : icon}</span>
        <span style={{flex:1, fontSize:11, fontWeight:700, fontFamily:"monospace", color}}>{label.toUpperCase()}</span>
        <span style={{fontSize:10, fontFamily:"monospace", color, background:color+"22", padding:"2px 7px", borderRadius:99}}>{done}/{total}</span>
        <span style={{fontSize:10,color:C.mut}}>{open?"▲":"▼"}</span>
      </button>
      <div style={{padding:"0 12px 3px", background:color+"0D"}}>
        <Bar pct={pct} color={color} h={3}/>
      </div>
      {open && (
        <div style={{padding:"10px 12px", background:C.bg}}>
          {items.map(ex => {
            const ck = checks[`${dayIdx}:${catKey}:${ex.id}`];
            return (
              <button key={ex.id} onClick={() => onToggle(dayIdx, catKey, ex.id)}
                style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6, width:"100%", background:"transparent", border:`1px solid ${C.bd}`, borderRadius:8, padding:"8px 10px", textAlign:"left", cursor:"pointer" }}>
                <div style={{ width:20, height:20, borderRadius:5, flexShrink:0, border:`1.5px solid ${ck?color:"#333"}`, background:ck?color:"transparent", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, color:"#fff" }}>
                  {ck && "✓"}
                </div>
                <span style={{ flex:1, fontSize:13, color:ck?C.mut:"#ddd", textDecoration:ck?"line-through":"none", lineHeight:1.4 }}>{ex.name}</span>
                {ex.detail && <span style={{ fontSize:10, fontFamily:"monospace", color:ck?C.mut:color, flexShrink:0 }}>{ex.detail}</span>}
                {ex.star && <span>⭐</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Schedule timeline ─────────────────────────────────────────────────────────
const SCHED_COLORS = { orange:C.orange, gold:C.gold, red:C.red, blue:C.blue, green:C.green, purple:C.purple, gray:C.mut };

function Schedule({ items, open, onToggle }) {
  if (!items?.length) return null;
  return (
    <div style={{ marginBottom:10, border:`1px solid ${C.gold}44`, borderRadius:10, overflow:"hidden" }}>
      <button onClick={onToggle} style={{ width:"100%", display:"flex", alignItems:"center", gap:8, padding:"10px 12px", background:C.gold+"10", border:"none", textAlign:"left", cursor:"pointer" }}>
        <span>🕐</span>
        <span style={{flex:1, fontSize:11, fontWeight:700, color:C.gold, fontFamily:"monospace"}}>HORÁRIO DO DIA</span>
        <span style={{fontSize:10, color:C.gold, background:C.gold+"22", padding:"2px 7px", borderRadius:99}}>{items.length} blocos</span>
        <span style={{fontSize:10,color:C.mut}}>{open?"▲":"▼"}</span>
      </button>
      {open && (
        <div style={{padding:"10px 12px", background:C.bg}}>
          {items.map((it, i) => {
            const col = SCHED_COLORS[it.color] || C.dim;
            const hasNext = i < items.length - 1;
            return (
              <div key={i} style={{ display:"flex", gap:10, alignItems:"flex-start", paddingBottom:10, marginBottom: hasNext?10:0, borderBottom: hasNext?`1px solid ${C.bd}`:"none", position:"relative" }}>
                {hasNext && <div style={{position:"absolute",left:28,top:20,bottom:-10,width:1,background:col+"33"}}/>}
                <div style={{width:8,height:8,borderRadius:"50%",flexShrink:0,marginTop:5,marginLeft:24,background:col,position:"relative",zIndex:1}}/>
                <div style={{flex:1}}>
                  <div style={{display:"flex",alignItems:"baseline",gap:8}}>
                    <span style={{fontSize:12,fontWeight:700,color:C.gold,fontFamily:"monospace",flexShrink:0}}>{it.time}</span>
                    <span style={{fontSize:13,color:"#ddd"}}>{it.activity}</span>
                  </div>
                  {it.note && <span style={{fontSize:11,color:C.mut,display:"block"}}>{it.note}</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Dashboard ────────────────────────────────────────────────────────────────
function Dashboard({ plan, week, checks, onDay }) {
  const phIdx = week <= 4 ? 0 : week <= 8 ? 1 : 2;
  const phase = plan.phases?.[phIdx] || { id:1, name:"Fase 1", weeks:"Sem 1-4", focus:"Treino base" };
  const pColor = PHASE_COLORS[phIdx];
  const days = plan.days || [];

  const dayProg = di => {
    let tot=0, done=0;
    const d = days[di]; if (!d?.sections) return {tot,done};
    Object.entries(d.sections).forEach(([cat,items]) => {
      if (!items) return;
      items.forEach(ex => { tot++; if (checks[`${di}:${cat}:${ex.id}`]) done++; });
    });
    return {tot,done};
  };

  const catTotals = {};
  Object.keys(CAT).forEach(k => { catTotals[k] = {done:0,tot:0}; });
  days.forEach((d,di) => {
    if (!d.sections) return;
    Object.entries(d.sections).forEach(([cat,items]) => {
      if (!items || !catTotals[cat]) return;
      items.forEach(ex => { catTotals[cat].tot++; if (checks[`${di}:${cat}:${ex.id}`]) catTotals[cat].done++; });
    });
  });
  const activeCats = Object.entries(catTotals).filter(([,v]) => v.tot > 0);
  const catRows = [];
  for (let i=0; i<activeCats.length; i+=2) catRows.push(activeCats.slice(i,i+2));

  return (
    <div style={{padding:"12px 14px"}}>
      {/* Phase card */}
      <div style={{background:pColor+"12",border:`1px solid ${pColor}33`,borderRadius:10,padding:14,marginBottom:12}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:5}}>
          <span style={{fontSize:9,fontWeight:700,padding:"2px 8px",borderRadius:4,color:"#fff",fontFamily:"monospace",background:pColor}}>{phase.name}</span>
          <span style={{fontSize:11,fontFamily:"monospace",color:pColor}}>{phase.weeks}</span>
        </div>
        <div style={{fontSize:12,color:"#bbb"}}>{phase.focus}</div>
      </div>

      {/* Day progress list */}
      <div style={{background:C.s1,borderRadius:10,border:`1px solid ${C.bd}`,overflow:"hidden",marginBottom:12}}>
        <div style={{padding:"9px 14px",borderBottom:`1px solid ${C.bd}`,display:"flex",alignItems:"center",gap:7}}>
          <div style={{width:3,height:13,borderRadius:2,background:pColor}}/>
          <span style={{fontSize:10,letterSpacing:2,color:C.mut,fontFamily:"monospace"}}>PROGRESSO POR DIA</span>
        </div>
        <div style={{padding:"12px 14px"}}>
          {days.map((d,di) => {
            const {tot,done} = dayProg(di);
            const pv = tot>0 ? Math.round(done/tot*100) : 0;
            const pvC = pv===100 ? C.green : pColor;
            return (
              <button key={di} onClick={()=>onDay(di)} style={{display:"flex",alignItems:"center",gap:10,width:"100%",background:"transparent",border:"none",padding:"6px 0",borderBottom:di<days.length-1?`1px solid ${C.bd}`:"none",textAlign:"left",cursor:"pointer"}}>
                <span style={{fontSize:14,minWidth:22}}>{d.icon}</span>
                <span style={{fontSize:12,color:"#bbb",minWidth:42,fontFamily:"monospace"}}>{d.day}</span>
                <div style={{flex:1}}><Bar pct={pv} color={pvC} h={5}/></div>
                <span style={{fontSize:10,color:tot>0?pvC:C.mut,fontFamily:"monospace",minWidth:32,textAlign:"right"}}>{tot>0?`${pv}%`:"—"}</span>
                <span style={{fontSize:10,color:C.mut}}>›</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Category stats */}
      {catRows.map((row,ri) => (
        <div key={ri} style={{display:"flex",gap:8,marginBottom:8}}>
          {row.map(([k,ct]) => {
            const pv = ct.tot>0 ? Math.round(ct.done/ct.tot*100) : 0;
            const {color} = CAT[k] || {};
            return (
              <div key={k} style={{flex:1,background:C.s1,borderRadius:10,border:`1px solid ${C.bd}`,padding:11}}>
                <div style={{fontSize:9,color:C.mut,fontFamily:"monospace",letterSpacing:1,marginBottom:5}}>{CAT[k]?.icon} {CAT[k]?.label?.toUpperCase()}</div>
                <div style={{fontSize:20,fontWeight:700,fontFamily:"monospace",color,lineHeight:1}}>{ct.done}<span style={{fontSize:10,color:C.mut}}>/{ct.tot}</span></div>
                <div style={{margin:"5px 0 3px"}}><Bar pct={pv} color={color} h={5}/></div>
                <div style={{fontSize:9,color:C.mut,fontFamily:"monospace"}}>{pv}%</div>
              </div>
            );
          })}
        </div>
      ))}

      {plan.injuryWarning && (
        <div style={{background:"#12080A",border:`1px solid ${C.red}33`,borderRadius:10,padding:12,marginBottom:12}}>
          <div style={{fontSize:9,color:C.red,fontFamily:"monospace",letterSpacing:2,marginBottom:5}}>⚠️ ATENÇÃO LESÃO</div>
          <div style={{fontSize:12,color:"#ccc",lineHeight:1.7}}>{plan.injuryWarning}</div>
        </div>
      )}

      {plan.weeklyTip && (
        <div style={{background:C.gold+"10",border:`1px solid ${C.gold}33`,borderRadius:10,padding:12}}>
          <div style={{fontSize:9,color:C.gold,fontFamily:"monospace",letterSpacing:2,marginBottom:5}}>💡 DICA DA SEMANA</div>
          <div style={{fontSize:12,color:"#ccc",lineHeight:1.6}}>{plan.weeklyTip}</div>
        </div>
      )}
    </div>
  );
}

// ── Day view ─────────────────────────────────────────────────────────────────
function DayView({ plan, dayIdx, checks, onToggle, openSections, onToggleSection }) {
  const day = plan.days?.[dayIdx];
  if (!day) return <div style={{padding:20,color:C.dim}}>Dia não encontrado.</div>;
  const schedKey = `sched:${dayIdx}`;
  const schedOpen = openSections[schedKey] !== false;

  return (
    <div style={{padding:"12px 14px"}}>
      <div style={{background:C.blue+"12",borderRadius:10,padding:14,marginBottom:12}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:24}}>{day.icon}</span>
          <div style={{flex:1}}>
            <div style={{fontSize:14,fontWeight:700,color:"#fff"}}>{day.label}</div>
            <div style={{fontSize:11,color:C.dim,marginTop:2}}>{day.goal}</div>
          </div>
          {day.isRest && <span style={{fontSize:10,fontFamily:"monospace",color:C.red,background:C.red+"22",padding:"3px 8px",borderRadius:6}}>DESCANSO</span>}
        </div>
      </div>

      <Schedule items={day.schedule} open={schedOpen} onToggle={()=>onToggleSection(schedKey)}/>

      {CAT_ORDER.map(cat => (
        <Section
          key={cat} catKey={cat}
          items={day.sections?.[cat]}
          checks={checks} dayIdx={dayIdx}
          onToggle={onToggle}
          open={openSections[`${dayIdx}:${cat}`] !== false}
          onToggleOpen={()=>onToggleSection(`${dayIdx}:${cat}`)}
        />
      ))}
    </div>
  );
}

// ── Chat ─────────────────────────────────────────────────────────────────────
function ChatView({ profile }) {
  const [msgs, setMsgs] = useState([{ role:"ai", text:"Olá! 💪 Sou o teu **FitCoach AI**.\n\nPergunta-me qualquer coisa sobre treino, nutrição, recuperação ou lesões!" }]);
  const [inp, setInp] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior:"smooth" }); }, [msgs]);

  const send = async (txt) => {
    if (!txt.trim() || busy) return;
    const uMsg = { role:"user", text:txt.trim() };
    setMsgs(p => [...p, uMsg]); setInp(""); setBusy(true);
    const hist = [...msgs, uMsg].map(m=>`${m.role==="user"?"Atleta":"Coach"}: ${m.text}`).join("\n");
    try {
      setMsgs(p => [...p, { role:"ai", text:"" }]);
      await callAPIStream(chatPrompt(profile), `Conversa:\n${hist}\n\nAtleta: ${txt.trim()}`, partial => {
        setMsgs(p => { const u=[...p]; u[u.length-1]={role:"ai",text:partial}; return u; });
      });
    } catch {
      setMsgs(p => [...p.slice(0,-1), { role:"ai", text:"⚠️ Erro de ligação. Tenta novamente." }]);
    }
    setBusy(false);
  };

  const quickQ = ["Como aquecer antes do treino?","O que comer pré-treino?","Dicas de recuperação rápida","Como prevenir lesões no joelho"];

  return (
    <div style={{display:"flex",flexDirection:"column",height:"calc(100vh - 128px)"}}>
      <div style={{flex:1,overflowY:"auto",padding:14}}>
        {msgs.map((m,i) => (
          <div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start",marginBottom:10,gap:6,alignItems:"flex-start"}}>
            {m.role==="ai" && <div style={{width:28,height:28,borderRadius:"50%",background:C.orange+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0,border:`1px solid ${C.orange}33`}}>🤖</div>}
            <div style={{maxWidth:"78%",padding:"10px 14px",borderRadius:m.role==="user"?"14px 14px 4px 14px":"14px 14px 14px 4px",background:m.role==="user"?C.orange:C.s2,border:m.role==="user"?"none":`1px solid ${C.bd}`,color:m.role==="user"?C.bg:C.tx,fontSize:13,lineHeight:1.5}}
              dangerouslySetInnerHTML={{__html:mdRender(m.text)}}/>
          </div>
        ))}
        {busy && msgs[msgs.length-1]?.text==="" && (
          <div style={{display:"flex",gap:6,alignItems:"center",padding:"0 0 10px 34px"}}>
            <span style={{fontSize:12,color:C.dim,fontFamily:"monospace"}}>a pensar...</span>
          </div>
        )}
        <div ref={endRef}/>
      </div>

      {msgs.length<=1 && (
        <div style={{display:"flex",flexWrap:"wrap",gap:5,padding:"0 14px 8px",justifyContent:"center"}}>
          {quickQ.map((q,i)=><button key={i} onClick={()=>send(q)} style={SS.chip}>{q}</button>)}
        </div>
      )}

      <div style={{display:"flex",gap:8,padding:"8px 14px",borderTop:`1px solid ${C.bd}`,background:C.s1}}>
        <input style={{...SS.inp,flex:1,borderRadius:20}} placeholder="Pergunta ao teu coach..." value={inp} onChange={e=>setInp(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send(inp)} disabled={busy}/>
        <button onClick={()=>send(inp)} disabled={busy||!inp.trim()} style={{width:36,height:36,borderRadius:"50%",background:C.orange,border:"none",color:C.bg,fontSize:16,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,opacity:busy||!inp.trim()?0.4:1}}>↑</button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  MAIN APP
// ══════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [profile, setProfile] = useState(null);
  const [plan, setPlan] = useState(null);
  const [genState, setGenState] = useState({ loading:false, error:null, attempt:0 });
  const [view, setView] = useState("dash");   // "dash" | number | "chat"
  const [week, setWeek] = useState(1);
  const [checks, setChecks] = useState({});
  const [openSections, setOpenSections] = useState({});

  const toggleCheck = (dayIdx, cat, exId) => {
    const k = `${dayIdx}:${cat}:${exId}`;
    setChecks(p => ({ ...p, [k]: !p[k] }));
  };
  const toggleSection = k => setOpenSections(p => ({ ...p, [k]: p[k]===undefined ? false : !p[k] }));

  const generate = useCallback(async (prof) => {
    setProfile(prof);
    setGenState({ loading:true, error:null, attempt:0 });
    setPlan(null);

    for (let attempt = 1; attempt <= 2; attempt++) {
      setGenState(s => ({ ...s, attempt }));
      try {
        const raw = await callAPI(
          "Responde APENAS com JSON puro e válido. Zero texto antes ou depois. Zero backticks. Apenas o objecto JSON.",
          planPrompt(prof)
        );
        const parsed = extractJSON(raw);
        // Basic validation
        if (!parsed.phases || !parsed.days || !Array.isArray(parsed.days)) {
          throw new Error("Estrutura JSON inválida — faltam 'phases' ou 'days'");
        }
        setPlan(parsed);
        setView("dash");
        setChecks({});
        setOpenSections({});
        setGenState({ loading:false, error:null, attempt:0 });
        return;
      } catch (err) {
        console.error(`Tentativa ${attempt} falhou:`, err.message);
        if (attempt === 2) {
          setGenState({ loading:false, error: err.message, attempt:0 });
        }
        // Wait before retry
        if (attempt < 2) await new Promise(r => setTimeout(r, 1500));
      }
    }
  }, []);

  // ── ONBOARDING ──
  if (!profile) return <Onboarding onDone={generate}/>;

  // ── LOADING ──
  if (genState.loading) return (
    <div style={{fontFamily:"Georgia,serif",background:C.bg,minHeight:"100vh",color:C.tx,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{width:72,height:72,borderRadius:"50%",background:C.orange+"18",border:`1px solid ${C.orange}33`,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:20,animation:"pulse 2s ease-in-out infinite"}}>
        <span style={{fontSize:30,animation:"float 2s ease-in-out infinite"}}>⚡</span>
      </div>
      <div style={{fontFamily:"monospace",fontSize:14,fontWeight:700,color:"#fff",marginBottom:8}}>
        {genState.attempt > 1 ? `A tentar novamente (${genState.attempt}/2)...` : "A gerar o teu plano personalizado..."}
      </div>
      <div style={{fontSize:11,color:C.mut}}>Aguarda 20–40 segundos</div>
      <style>{CSS}</style>
    </div>
  );

  // ── ERROR (no plan) ──
  if (genState.error && !plan) return (
    <div style={{fontFamily:"Georgia,serif",background:C.bg,minHeight:"100vh",color:C.tx,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24}}>
      <span style={{fontSize:44,marginBottom:12}}>⚠️</span>
      <div style={{fontFamily:"monospace",fontSize:13,fontWeight:700,color:C.red,marginBottom:8}}>Erro ao gerar o plano</div>
      <div style={{fontSize:12,color:C.dim,marginBottom:4,textAlign:"center",maxWidth:320}}>Detalhe técnico:</div>
      <div style={{fontSize:11,color:"#888",background:C.s1,border:`1px solid ${C.bd}`,borderRadius:8,padding:"8px 14px",marginBottom:20,maxWidth:320,wordBreak:"break-all",textAlign:"center"}}>
        {genState.error}
      </div>
      <button onClick={()=>generate(profile)} style={{...SS.mainBtn,marginBottom:10}}>🔄 Tentar novamente</button>
      <button onClick={()=>{setProfile(null);setPlan(null);setGenState({loading:false,error:null,attempt:0});}}
        style={{background:"none",border:"none",color:C.dim,fontSize:12,cursor:"pointer"}}>← Editar perfil</button>
      <style>{CSS}</style>
    </div>
  );

  if (!plan) return null;

  // ── MAIN UI ──
  const phIdx = week<=4 ? 0 : week<=8 ? 1 : 2;
  const phase = plan.phases?.[phIdx] || plan.phases?.[0] || { id:1, name:"Fase 1", weeks:"Sem 1-4", focus:"" };
  const pColor = PHASE_COLORS[phIdx];
  const sportObj = SPORTS.find(s=>s.id===profile.sport);
  const days = plan.days || [];

  const dayProg = di => {
    let tot=0, done=0;
    const d = days[di]; if (!d?.sections) return {tot,done};
    Object.entries(d.sections).forEach(([cat,items]) => {
      if (!items) return;
      items.forEach(ex => { tot++; if (checks[`${di}:${cat}:${ex.id}`]) done++; });
    });
    return {tot,done};
  };

  const viewTitle = () => {
    if (view==="dash") return `Semana ${week} — ${phase.name}`;
    if (view==="chat") return "FitCoach AI";
    return `${days[view]?.label||""} — ${(days[view]?.goal||"").slice(0,26)}`;
  };

  return (
    <div style={{fontFamily:"Georgia,serif",background:C.bg,minHeight:"100vh",color:C.tx,maxWidth:500,margin:"0 auto"}}>
      {/* ── Header ── */}
      <div style={{background:C.s1,borderBottom:`1px solid ${C.bd}`,padding:"11px 16px",position:"sticky",top:0,zIndex:100}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:20}}>{sportObj?.icon||"⚡"}</span>
          <div style={{flex:1}}>
            <span style={{fontSize:9,letterSpacing:3,color:C.gold,fontFamily:"monospace",display:"block"}}>FITPLAN AI · {(sportObj?.label||profile.customSport||"").toUpperCase()}</span>
            <span style={{fontSize:13,fontWeight:700,display:"block"}}>{viewTitle()}</span>
          </div>
          <button onClick={()=>{setProfile(null);setPlan(null);}} style={{background:"none",border:"none",fontSize:14,cursor:"pointer"}} title="Editar perfil">✏️</button>
          <div style={{textAlign:"right"}}>
            <span style={{fontSize:8,color:C.mut,fontFamily:"monospace",display:"block"}}>SEM.</span>
            <span style={{fontSize:16,fontWeight:700,fontFamily:"monospace",display:"block",color:pColor}}>{week}</span>
          </div>
        </div>
      </div>

      {/* ── Phase strip ── */}
      <div style={{borderBottom:`1px solid ${pColor}33`,padding:"6px 16px",display:"flex",alignItems:"center",gap:8}}>
        <span style={{fontSize:9,fontWeight:700,padding:"2px 8px",borderRadius:4,color:"#fff",fontFamily:"monospace",background:pColor}}>{phase.name}</span>
        <span style={{fontSize:11,fontFamily:"monospace",color:pColor}}>{phase.weeks} — {phase.focus}</span>
      </div>

      {/* ── Week selector ── */}
      <div style={{padding:"8px 16px",borderBottom:`1px solid ${C.bd}`,display:"flex",gap:4,overflowX:"auto"}}>
        {Array.from({length:12},(_,i)=>i+1).map(w=>(
          <button key={w} onClick={()=>setWeek(w)} style={{
            width:32,height:32,borderRadius:7,background:w===week?pColor:C.bg,
            color:w===week?"#fff":C.mut,fontWeight:700,fontSize:12,fontFamily:"monospace",
            border:`1.5px solid ${w===week?pColor:C.bd}`,cursor:"pointer",flexShrink:0,
          }}>{w}</button>
        ))}
      </div>

      {/* ── Content ── */}
      <div style={{paddingBottom:80}}>
        {view==="dash" && <Dashboard plan={plan} week={week} checks={checks} onDay={di=>setView(di)}/>}
        {typeof view==="number" && <DayView plan={plan} dayIdx={view} checks={checks} onToggle={toggleCheck} openSections={openSections} onToggleSection={toggleSection}/>}
        {view==="chat" && <ChatView profile={profile}/>}
      </div>

      {/* ── Bottom Nav ── */}
      <nav style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:500,background:C.s1,borderTop:`1px solid ${C.bd}`,padding:"5px 3px 10px",display:"flex",gap:1,zIndex:100,overflowX:"auto"}}>
        {/* Resumo */}
        <NavBtn active={view==="dash"} color={pColor} icon="⚡" label="Resumo" onClick={()=>setView("dash")}/>
        {/* Days */}
        {days.map((d,di)=>{
          const {tot,done} = dayProg(di);
          const pv = tot>0 ? Math.round(done/tot*100) : null;
          const complete = pv===100;
          const act = view===di;
          return (
            <NavBtn key={di} active={act} color={pColor} icon={complete&&!act?"✅":d.icon} label={d.day} pct={pv} complete={complete} onClick={()=>setView(di)}/>
          );
        })}
        {/* Coach */}
        <NavBtn active={view==="chat"} color={C.orange} icon="🤖" label="Coach" onClick={()=>setView("chat")}/>
      </nav>

      <style>{CSS}</style>
    </div>
  );
}

function NavBtn({ active, color, icon, label, pct, complete, onClick }) {
  return (
    <button onClick={onClick} style={{
      flex:1, minWidth:38, padding:"5px 1px 2px", border:"none", borderRadius:7,
      background: active ? color : "transparent",
      color: active ? "#fff" : complete ? C.green : C.mut,
      fontSize:9, fontFamily:"monospace", fontWeight:700,
      display:"flex", flexDirection:"column", alignItems:"center", gap:2, cursor:"pointer",
    }}>
      <span style={{fontSize:13,lineHeight:1}}>{icon}</span>
      <span>{label}</span>
      {pct !== null && pct !== undefined && (
        <div style={{width:"75%",height:2,borderRadius:1,background:C.bd,overflow:"hidden",marginTop:1}}>
          <div style={{height:"100%",borderRadius:1,width:`${pct}%`,background:active?"#fff":complete?C.green:color}}/>
        </div>
      )}
    </button>
  );
}

// ── Shared styles ──────────────────────────────────────────────────────────
const SS = {
  card: { background:C.s1, border:`1px solid ${C.bd}`, borderRadius:10, padding:"12px 10px", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:4, transition:"all .2s", textAlign:"center" },
  chip: { background:C.s1, border:`1px solid ${C.bd}`, borderRadius:20, padding:"7px 12px", fontSize:11, color:C.tx, cursor:"pointer", whiteSpace:"nowrap", fontFamily:"Georgia,serif" },
  inp:  { width:"100%", background:C.bg, border:`1px solid ${C.bd}`, borderRadius:8, padding:"9px 11px", fontSize:13, color:C.tx, fontFamily:"monospace", outline:"none" },
  lbl:  { fontSize:11, color:C.dim, fontFamily:"monospace", marginBottom:6, display:"block" },
  mainBtn: { fontFamily:"monospace", fontSize:13, fontWeight:700, color:C.bg, background:`linear-gradient(135deg,${C.orange},#fb923c)`, border:"none", borderRadius:10, padding:"12px 24px", cursor:"pointer", boxShadow:`0 4px 16px ${C.orange}33` },
};

const CSS = `
  *{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}
  body{background:${C.bg}}
  ::-webkit-scrollbar{display:none}
  @keyframes pulse{0%,100%{transform:scale(.93);opacity:.7}50%{transform:scale(1.08);opacity:.25}}
  @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
`;
