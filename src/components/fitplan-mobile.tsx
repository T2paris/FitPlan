// @ts-nocheck
'use dom';

import React, { useState, useEffect, useRef } from 'react';
import { LOGO_MARK, LOGO_FULL } from '../constants/logo';

// ── 0. ARMAZENAMENTO SEGURO RESILIENTE A WEBVIEWS ──
const storage = (() => {
  try {
    const ls = typeof window !== 'undefined' ? window.localStorage : null;
    if (ls) {
      const probe = '__ft_probe__';
      ls.setItem(probe, '1');
      ls.removeItem(probe);
      return ls;
    }
  } catch { }
  const mem = new Map();
  return {
    getItem: (k: string) => (mem.has(k) ? mem.get(k) : null),
    setItem: (k: string, v: string) => { mem.set(k, String(v)); },
    removeItem: (k: string) => { mem.delete(k); },
    clear: () => { mem.clear(); },
  };
})();

// ── 1. ÍCONES VETORIAIS SVG DO DESIGN (INCLUI STRAVA & RUNNING) ──
const P: Record<string, string> = {
  plano: '<path d="M7 3v3M17 3v3M4 9h16M5 5h14a1 1 0 011 1v13a1 1 0 01-1 1H5a1 1 0 01-1-1V6a1 1 0 011-1z"/><path d="m9 15 2 2 4-4"/>',
  rank: '<path d="M8 4h8v5a4 4 0 01-8 0V4zM8 6H5a3 3 0 003 4M16 6h3a3 3 0 01-3 4M12 13v4M8 20h8"/>',
  coach: '<path d="M5 5h14a1 1 0 011 1v9a1 1 0 01-1 1H10l-4 4v-4H5a1 1 0 01-1-1V6a1 1 0 011-1z"/>',
  ajustes: '<path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/>',
  back: '<path d="M15 5l-7 7 7 7"/>',
  fire: '<path d="M12 3c1 4 5 5 5 10a5 5 0 01-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-5 1-9z"/>',
  send: '<path d="M12 19V5M6 11l6-6 6 6"/>',
  ok: '<path d="m6 12 4 4 8-8"/>',
  warn: '<path d="M12 4 3 20h18L12 4zM12 10v4M12 17v.5"/>',
  gravar: '<circle cx="12" cy="12" r="9" stroke="currentColor"/><circle cx="12" cy="12" r="4" fill="currentColor"/>',
  play: '<polygon points="8 5 19 12 8 19 8 5" fill="currentColor"/>',
  pause: '<rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor"/><rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor"/>',
  stop: '<rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor"/>',
  trophy: '<path d="M6 9H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h2M18 9h2a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-2M4 22h16M10 14.66V17c0 .55-.45 1-1 1H8c-.55 0-1 .45-1 1v1c0 .55.45 1 1 1h8c.55 0 1-.45 1-1v-1c0-.55-.45-1-1-1h-1c-.55 0-1-.45-1-1v-2.34M7 3h10v6a5 5 0 0 1-10 0V3z"/>',
  route: '<circle cx="6" cy="19" r="3"/><path d="M9 19h8.5a4.5 4.5 0 0 0 0-9H7a4 4 0 0 1 0-8h11"/><circle cx="18" cy="5" r="3"/>',
  satellite: '<path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"/><circle cx="12" cy="12" r="3"/>',
};

const Icon = ({ name, size = 22 }: { name: string; size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.9"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    dangerouslySetInnerHTML={{ __html: P[name] || '' }}
  />
);

// ── 2. DADOS DO PLANO: MULTIDESPORTO VS CORRIDA (STRAVA) ──
const BASKETBALL_D = [
  {
    n: 'Musculação',
    c: 'var(--lime)',
    g: 'Força',
    it: [
      ['Supino plano com barra ou halteres', '4 séries × 10–12 reps · sobrecarga máxima'],
      ['Press de ombros com halteres', '3 × 10–12 · amplitude total'],
      ['Extensões de tríceps na polia', '3 × 12–15 · contração máxima'],
      ['Aberturas com halteres', '3 × 12 · estiramento controlado'],
      ['Elevações laterais ligeiras', '3 × 15 · sem balanço do tronco'],
      ['Prancha abdominal isométrica', '3 × 45 s · core ativo'],
    ],
  },
  {
    n: 'Treino técnico',
    c: 'var(--coral)',
    g: 'Drible',
    it: [
      ['Drills de drible estático a 2 bolas', '15 min · precisão motora'],
      ['Form shooting a 1–2 m do cesto', '20 min · repetição consistente', 'Lançamento +0.8'],
      ['Mobilidade e ativação dinâmica', '10 min · flexibilidade funcional', 'Drible +0.5'],
    ],
  },
  {
    n: 'Salto e pliometria',
    c: 'var(--ice)',
    g: 'Salto',
    it: [
      ['Spanish squat isométrico', '4 × 45 s · banda grossa atrás do joelho', 0, 1],
      ['Box step-downs controlados', '3 × 10 por perna · descida de 3 s, sem impacto', 0, 1],
      ['Pogo hops em solo macio', '3 × 15 · baixa amplitude, sem dor no tendão'],
      ['Wall sit isométrico com calcanhar alto', '3 × 45 s · fortalece o tendão'],
    ],
  },
  {
    n: 'Recuperação',
    c: 'var(--lime)',
    g: 'Resistência',
    it: [
      ['Libertação miofascial com rolo', '10 min · gémeos, quadríceps, banda iliotibial e glúteos'],
      ['Alongamentos estáticos e mobilidade', '10 min · respiração diafragmática profunda'],
      ['Banho de contraste frio/quente', '6 min · reduz a inflamação'],
    ],
  },
  {
    n: 'Nutrição',
    c: 'var(--coral)',
    g: 'Resistência',
    it: [
      ['Pequeno-almoço de alta energia', 'Omelete (3 claras + 1 ovo), espinafres, chá verde'],
      ['Almoço de performance', '160 g de peixe grelhado, batata-doce, salada'],
      ['Lanche pré-treino (60–90 min antes)', 'Iogurte grego, nozes, banana'],
      ['Jantar de reparação', 'Salmão ou carne magra, legumes salteados, abacate'],
    ],
  },
  {
    n: 'Suplementos',
    c: 'var(--ice)',
    g: 'Resistência',
    it: [
      ['Creatina monohidratada (5 g)', 'Diário · potência neuromuscular', 0, 1],
      ['Whey isolada (30 g)', 'Logo após o treino'],
      ['Colagénio + vitamina C (15 g)', '45 min antes dos saltos · reforça o tendão', 0, 1],
      ['Magnésio bisglicinato (300 mg)', 'Antes de deitar · sono profundo'],
    ],
  },
];

const RUNNING_D = [
  {
    n: 'Corrida e ritmo',
    c: 'var(--strava)',
    g: 'Pace',
    it: [
      ['Aquecimento dinâmico e trote suave', '10 min · ativação de passadas e mobilidade'],
      ['Treino de Ritmo / Fartlek Strava (5 km)', 'Alternar 500m ritmo 4:50/km com 200m trote', 'Pace +1.2'],
      ['Tiros de velocidade (6 × 150m)', 'Máxima aceleração e impulsão dos pés', 'Pace +0.9'],
      ['Arrefecimento e volta à calma', '8 min · trote de regeneração e respiração'],
    ],
  },
  {
    n: 'Fortalecimento de pernas',
    c: 'var(--lime)',
    g: 'Força Pernas',
    it: [
      ['Agachamento búlgaro unilateral', '3 séries × 10 reps/perna · equilíbrio e força'],
      ['Elevação excêntrica de gémeos e sóleo', '4 × 15 reps · descida de 4s, protege tendão', 0, 1],
      ['Ponte de glúteos e posterior', '3 × 12 reps · propulsão mecânica da passada'],
      ['Prancha e core anti-rotação', '3 × 45 s · estabilidade e postura de corrida'],
    ],
  },
  {
    n: 'Técnica e cadência',
    c: 'var(--ice)',
    g: 'Cadência',
    it: [
      ['Drills de cadência 180 spm', '3 × 45 s · contacto no médio-pé, sem aterragem no calcanhar'],
      ['A-Skips e skipping dinâmico', '12 min · reatividade elástica do tornozelo', 0, 1],
      ['Mobilidade de anca e flexores', '10 min · amplitude e soltura de passada'],
    ],
  },
  {
    n: 'Recuperação do corredor',
    c: 'var(--lime)',
    g: 'Recuperação',
    it: [
      ['Libertação miofascial com rolo', '12 min · gémeos, banda iliotibial e fáscia plantar'],
      ['Alongamentos estáticos profundos', '10 min · isquiotibiais e quadríceps'],
      ['Banho de contraste ou imersão fria', '6 min · redução de microlesões por impacto'],
    ],
  },
  {
    n: 'Nutrição & Eletrólitos',
    c: 'var(--coral)',
    g: 'Resistência',
    it: [
      ['Pré-corrida: Hidratos de rápida absorção', 'Banana com mel ou torrada com compota (60m antes)'],
      ['Hidratação com sais minerais', '500 ml de água com eletrólitos antes da saída'],
      ['Pós-corrida: Janela anabólica', 'Iogurte grego com fruta ou batido de proteína'],
      ['Jantar reparador', 'Salmão fresco, batata-doce e vegetais ricos em magnésio'],
    ],
  },
  {
    n: 'Suplementos de endurance',
    c: 'var(--ice)',
    g: 'Resistência',
    it: [
      ['Eletrólitos e sais minerais', 'Durante e após corridas superiores a 40 minutos'],
      ['Beta-Alanina (3 g)', 'Tampão do ácido lático e resistência à fadiga'],
      ['Colagénio hidrolisado + Vitamina C (15 g)', '45 min antes da corrida · proteção articular', 0, 1],
      ['Magnésio bisglicinato (300 mg)', 'Antes de deitar · prevenção de cãibras noturnas'],
    ],
  },
];

const BASKETBALL_DAYS = [
  ['2ª', 'Segunda-feira', 'Força superior e fundações'],
  ['3ª', 'Terça-feira', 'Habilidades técnicas', 3],
  ['4ª', 'Quarta-feira', 'Pernas pesadas e impulsão', 9],
  ['5ª', 'Quinta-feira', 'Recuperação ativa e regeneração', -1],
  ['6ª', 'Sexta-feira', 'Puxadas, costas e potência', 12],
];

const RUNNING_DAYS = [
  ['2ª', 'Segunda-feira', 'Sessão Strava: 5 km ritmo e velocidade'],
  ['3ª', 'Terça-feira', 'Fortalecimento de pernas e core', 4],
  ['4ª', 'Quarta-feira', 'Tiros de cadência e aceleração', 3],
  ['5ª', 'Quinta-feira', 'Recuperação ativa e regeneração', -1],
  ['6ª', 'Sexta-feira', 'Longão de fim de semana (8 km)', 5],
];

const SCH = [
  ['08:00', 'Refeição pré-treino e hidratação'],
  ['10:00', 'Aquecimento e ativação de passadas'],
  ['11:00', 'Sessão principal de corrida'],
  ['12:30', 'Shake pós-treino e reposição'],
  ['17:00', 'Recuperação ativa e rolo de espuma'],
];

// Radar & atributos
const BASKETBALL_AX = ['Drible', 'Lançamento', 'Salto', 'Força', 'Resistência'];
const BASKETBALL_VALS = [74, 76, 72, 78, 79];

const RUNNING_AX = ['Pace / Vel', 'Resistência', 'Cadência', 'Força Pernas', 'Recuperação'];
const RUNNING_VALS = [82, 88, 80, 76, 84];

const BASKETBALL_LG = [
  ['Lucas “Skywalker” Mendes', 'Porto', 18, 89],
  ['Diogo “Sniper” Silva', 'Lisboa', 12, 85],
  ['Tiago “Flash” Santos', 'Coimbra', 9, 81],
  ['Tito (tu)', 'A tua cidade', 0, 78],
  ['André “Dunk” Ferreira', 'Braga', 6, 77],
  ['Rafael “Lockdown” Costa', 'Faro', 5, 73],
];

const RUNNING_LG = [
  ['Pedro “Marathon” Pires', 'Lisboa', 24, 91],
  ['Sofia “Cadence” Ramos', 'Porto', 19, 86],
  ['Gonçalo “Sub-4” Martins', 'Coimbra', 14, 83],
  ['Tito (tu)', 'A tua cidade', 0, 80],
  ['Beatriz “Trail” Lopes', 'Braga', 9, 77],
  ['João Vieira', 'Faro', 6, 74],
];

const R: Record<string, string> = {
  'Como aquecer?':
    'Começa com 5 minutos de mobilidade de anca e tornozelo e depois faz 2 séries leves dos exercícios do dia. Só avanças para os saltos quando o joelho estiver quente e sem dor.',
  'O que comer pré-treino?':
    'Hidratos fáceis de digerir e pouca gordura, 60 a 90 minutos antes. O teu plano sugere iogurte grego com banana e nozes.',
  'Dor no joelho':
    'Reduz a carga e fica pelos exercícios isométricos do plano (spanish squat e wall sit). Se a dor continuar ou piorar, fala com um fisioterapeuta antes de voltar a saltar.',
  'Qual o meu ritmo ideal de corrida?':
    'Para corridas contínuas em Zona 2, corre a um ritmo em que consigas falar sem perder o fôlego. Para treinos intervalados (Fartlek), aperta o ritmo para 4:45–5:00/km nos tiros!',
  'Como melhorar a cadência?':
    'Tenta manter 175 a 180 passos por minuto. Passadas mais curtas reduzem a força de impacto no joelho em até 20%.',
};

const LV = [
  '2–3 séries, cargas moderadas',
  '3–4 séries, progressão semanal',
  '4–5 séries, cargas pesadas e drop sets',
];
const EQ = ['Elásticos e peso corporal', 'Halteres e banco', 'Equipamento completo'];

// Recolha de dados (onboarding)
const SPORTS = ['Corrida', 'Basquetebol', 'Futebol', 'Voleibol'];
const IMPROVE: Record<string, string[]> = {
  Corrida: ['Ritmo / velocidade', 'Resistência', 'Cadência', 'Força de pernas', 'Recuperação', 'Prevenir lesões'],
  Basquetebol: ['Drible', 'Lançamento', 'Salto', 'Força', 'Resistência', 'Defesa'],
  Futebol: ['Velocidade', 'Remate', 'Passe', 'Resistência', 'Agilidade', 'Força'],
  Voleibol: ['Salto e ataque', 'Serviço', 'Receção', 'Bloco', 'Agilidade', 'Força'],
};
const GOALS = ['Melhorar o desempenho', 'Ganhar força', 'Perder peso', 'Ganhar massa muscular', 'Mais resistência'];
const LIMITS = ['Joelho', 'Costas', 'Tornozelo', 'Ombro', 'Tendões', 'Nenhuma'];
const OB_STEPS = 6;

// Helper geométrico do radar
const pt = (i: number, r: number): [number, number] => {
  const a = ((-90 + 72 * i) * Math.PI) / 180;
  return [+(120 + r * Math.cos(a)).toFixed(1), +(105 + r * Math.sin(a)).toFixed(1)];
};

// Traçado realista do circuito GPS da corrida (320x180)
const ROUTE_PTS: [number, number][] = [
  [45, 145], [58, 125], [78, 105], [105, 90], [135, 82],
  [168, 76], [200, 68], [235, 58], [265, 52], [282, 65],
  [272, 92], [255, 115], [232, 134], [200, 146], [165, 150],
  [130, 146], [95, 148], [65, 152], [45, 145],
];

// Cálculo de distância Haversine para GPS real
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Formatadores Strava
const formatTime = (sec: number) => {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
};

const formatPace = (sec: number, dist: number) => {
  if (dist <= 0.05) return '--:--';
  const paceSec = Math.round(sec / dist);
  const m = Math.floor(paceSec / 60);
  const s = paceSec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
};

// ── 3. COMPONENTE FITPLAN MOBILE COM SISTEMA STRAVA ──
export default function FitPlanMobile({
  confirmAction,
}: {
  confirmAction?: (message: string) => Promise<boolean>;
  dom?: import('expo/dom').DOMProps;
}) {
  // Estados de navegação
  const [tab, setTab] = useState<number>(0);
  const [day, setDay] = useState<number | null>(null);
  const [sec, setSec] = useState<number>(0);
  const [week, setWeek] = useState<number>(1);

  // Estados de perfil
  const [name, setName] = useState<string>(() => {
    try { return JSON.parse(storage.getItem('ft_name')) || 'Tito'; } catch { return 'Tito'; }
  });
  const [sport, setSport] = useState<string>(() => {
    try { return JSON.parse(storage.getItem('ft_sport')) || 'Basquetebol'; } catch { return 'Basquetebol'; }
  });
  const [lvl, setLvl] = useState<number>(() => {
    try { const v = storage.getItem('ft_lvl'); return v !== null ? Number(v) : 2; } catch { return 2; }
  });
  const [eq, setEq] = useState<number>(() => {
    try { const v = storage.getItem('ft_eq'); return v !== null ? Number(v) : 0; } catch { return 0; }
  });
  const [done, setDone] = useState<Record<string, boolean>>(() => {
    try { return JSON.parse(storage.getItem('ft_done')) || {}; } catch { return {}; }
  });

  // Estados do Chat Coach
  const [chat, setChat] = useState<Array<[string, string]>>(() => {
    try {
      return JSON.parse(storage.getItem('ft_chat')) || [
        ['c', 'Olá! Sou o teu coach FitPlan. Pergunta-me o que quiseres sobre treino, corrida, nutrição ou recuperação.'],
      ];
    } catch {
      return [['c', 'Olá! Sou o teu coach FitPlan. Pergunta-me o que quiseres sobre treino, corrida, nutrição ou recuperação.']];
    }
  });
  const [chatInput, setChatInput] = useState<string>('');
  // Dados recolhidos no ecrã inicial
  const [obStep, setObStep] = useState<number>(0);
  const [sports, setSports] = useState<string[]>(() => {
    try { const v = JSON.parse(storage.getItem('ft_sports')); if (Array.isArray(v) && v.length) return v; } catch {}
    try { const v = JSON.parse(storage.getItem('ft_sport')); if (v) return [v]; } catch {}
    return [];
  });
  const [improve, setImprove] = useState<Record<string, string[]>>(() => {
    try { return JSON.parse(storage.getItem('ft_improve')) || {}; } catch { return {}; }
  });
  const [age, setAge] = useState<string>(() => { try { return storage.getItem('ft_age') || ''; } catch { return ''; } });
  const [weight, setWeight] = useState<string>(() => { try { return storage.getItem('ft_weight') || ''; } catch { return ''; } });
  const [height, setHeight] = useState<string>(() => { try { return storage.getItem('ft_height') || ''; } catch { return ''; } });
  const [goal, setGoal] = useState<string>(() => { try { return storage.getItem('ft_goal') || GOALS[0]; } catch { return GOALS[0]; } });
  const [days, setDays] = useState<number>(() => { try { const v = storage.getItem('ft_days'); return v !== null ? Number(v) : 4; } catch { return 4; } });
  const [sessMin, setSessMin] = useState<number>(() => { try { const v = storage.getItem('ft_sessmin'); return v !== null ? Number(v) : 60; } catch { return 60; } });
  const [limits, setLimits] = useState<string[]>(() => {
    try { return JSON.parse(storage.getItem('ft_limits')) || []; } catch { return []; }
  });
  const [onboarded, setOnboarded] = useState<boolean>(() => {
    try {
      const v = storage.getItem('ft_onboarded');
      if (v !== null) return v === '1';
      return storage.getItem('ft_name') !== null;
    } catch { return true; }
  });
  const [toastMsg, setToastMsg] = useState<string>('');
  const [toastOn, setToastOn] = useState<boolean>(false);
  const [resetPending, setResetPending] = useState<boolean>(false);

  // ── ESTADOS STRAVA RUN TRACKER ──
  const [runState, setRunState] = useState<'idle' | 'running' | 'paused' | 'finished'>('idle');
  const [runDistance, setRunDistance] = useState<number>(0);
  const [runSeconds, setRunSeconds] = useState<number>(0);
  const [runElevation, setRunElevation] = useState<number>(0);
  const [runCadence, setRunCadence] = useState<number>(168);
  const [runBpm, setRunBpm] = useState<number>(152);
  const [runSplits, setRunSplits] = useState<Array<{ km: number; pace: string; elev: string }>>([]);
  const [runTitle, setRunTitle] = useState<string>('Corrida com FitPlan Strava 🏃');
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [runHistory, setRunHistory] = useState<Array<any>>(() => {
    try {
      return JSON.parse(storage.getItem('ft_run_history')) || [
        {
          id: 'sample-1',
          date: 'Ontem às 18:20',
          title: 'Treino de Ritmo 5 km 🏃',
          distance: '5.14',
          time: '25:42',
          pace: '5:00',
          kcal: 350,
          elev: '+38 m',
        },
      ];
    } catch {
      return [];
    }
  });

  const mainRef = useRef<HTMLDivElement>(null);
  const toastTimeoutRef = useRef<any>(null);

  const isRunning = sport === 'Corrida';
  const D = isRunning ? RUNNING_D : BASKETBALL_D;
  const DAYS = isRunning ? RUNNING_DAYS : BASKETBALL_DAYS;
  const ax = isRunning ? RUNNING_AX : BASKETBALL_AX;
  const vals = isRunning ? RUNNING_VALS : BASKETBALL_VALS;
  const LG = isRunning ? RUNNING_LG : BASKETBALL_LG;
  const ALL = D.reduce((a, s) => a + s.it.length, 0);

  // Sincronização LocalStorage
  useEffect(() => {
    try {
      storage.setItem('ft_name', JSON.stringify(name));
      storage.setItem('ft_sport', JSON.stringify(sport));
      storage.setItem('ft_lvl', String(lvl));
      storage.setItem('ft_eq', String(eq));
      storage.setItem('ft_done', JSON.stringify(done));
      storage.setItem('ft_chat', JSON.stringify(chat));
      storage.setItem('ft_run_history', JSON.stringify(runHistory));
      storage.setItem('ft_onboarded', onboarded ? '1' : '0');
      storage.setItem('ft_sports', JSON.stringify(sports));
      storage.setItem('ft_improve', JSON.stringify(improve));
      storage.setItem('ft_age', age);
      storage.setItem('ft_weight', weight);
      storage.setItem('ft_height', height);
      storage.setItem('ft_goal', goal);
      storage.setItem('ft_days', String(days));
      storage.setItem('ft_sessmin', String(sessMin));
      storage.setItem('ft_limits', JSON.stringify(limits));
    } catch {}
  }, [name, sport, lvl, eq, done, chat, runHistory, onboarded, sports, improve, age, weight, height, goal, days, sessMin, limits]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setToastOn(true);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => setToastOn(false), 2400);
  };

  const cnt = (i: number) => D[i].it.filter((_, j) => done[`${i}-${j}`]).length;
  const tot = () => D.reduce((a, _, i) => a + cnt(i), 0);
  const pc = (i: number) => Math.round((100 * cnt(i)) / D[i].it.length);

  const toggleCheck = (k: string) => {
    const next = !done[k];
    const newDone = { ...done, [k]: next };
    setDone(newDone);
    const newTot = D.reduce((a, _, i) => a + D[i].it.filter((_, j) => newDone[`${i}-${j}`]).length, 0);
    if (next && newTot === ALL) {
      showToast('Treino concluído. Bom trabalho! 🏆');
    }
  };

  // ── LOOP DO CRONÓMETRO E GPS STRAVA ──
  useEffect(() => {
    let interval: any = null;
    if (runState === 'running') {
      interval = setInterval(() => {
        setRunSeconds((s) => s + 1);

        if (isSimulating) {
          // Incrementa distância (~0.0033 km/s = ~5:03/km)
          setRunDistance((d) => {
            const nextD = Number((d + 0.0033).toFixed(3));
            const prevKm = Math.floor(d);
            const nextKm = Math.floor(nextD);

            if (nextKm > prevKm && nextKm >= 1) {
              const splitSec = 295 + Math.floor(Math.random() * 20) - 10;
              const paceStr = `${Math.floor(splitSec / 60)}:${String(splitSec % 60).padStart(2, '0')}`;
              setRunSplits((prev) => [
                ...prev,
                { km: nextKm, pace: paceStr, elev: `+${Math.floor(nextKm * 9)} m` },
              ]);
              showToast(`🔔 Km ${nextKm} alcançado! Pace: ${paceStr} /km ⚡`);
            }
            return nextD;
          });

          // Flutuações biométricas realistas
          setRunCadence(166 + Math.floor(Math.random() * 6));
          setRunBpm(150 + Math.floor(Math.random() * 8));
          setRunElevation((e) => e + (Math.random() > 0.85 ? 1 : 0));
        }
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [runState, isSimulating]);

  // GPS Real com Geolocation API
  useEffect(() => {
    let watchId: number | null = null;
    if (runState === 'running' && !isSimulating && typeof navigator !== 'undefined' && navigator.geolocation) {
      let lastPos: { lat: number; lng: number } | null = null;
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          if (lastPos) {
            const delta = haversineDistance(lastPos.lat, lastPos.lng, latitude, longitude);
            if (delta > 0.001) {
              setRunDistance((prev) => Number((prev + delta).toFixed(3)));
            }
          }
          lastPos = { lat: latitude, lng: longitude };
        },
        (err) => console.warn('GPS Error', err),
        { enableHighAccuracy: true, maximumAge: 1000 }
      );
    }
    return () => {
      if (watchId !== null && typeof navigator !== 'undefined' && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [runState, isSimulating]);

  // Concluir Corrida e Gravar
  const handleSaveRun = () => {
    const newRun = {
      id: Date.now().toString(),
      date: 'Hoje às ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      title: runTitle || 'Corrida Strava 🏃',
      distance: runDistance.toFixed(2),
      time: formatTime(runSeconds),
      pace: formatPace(runSeconds, runDistance),
      kcal: Math.round(runDistance * 68),
      elev: `+${Math.max(14, runElevation)} m`,
      splits: runSplits,
    };
    setRunHistory((prev) => [newRun, ...prev]);
    showToast('🏆 Corrida guardada no teu perfil Strava!');
    setRunState('idle');
    setRunDistance(0);
    setRunSeconds(0);
    setRunElevation(0);
    setRunSplits([]);
  };

  const handleAsk = (q: string) => {
    if (!q.trim()) return;
    const newChat: Array<[string, string]> = [...chat, ['u', q.trim()]];
    setChat(newChat);
    setChatInput('');

    setTimeout(() => {
      const reply =
        R[q] ||
        `Boa pergunta! Para o teu nível e modalidade (${sport}), foca-te em execução controlada e hidratação frequente.`;
      setChat((prev) => [...prev, ['c', reply]]);
    }, 550);
  };

  // Apaga tudo e volta ao ecrã inicial para criar um plano novo
  const wipeAll = () => {
    try { storage.clear(); } catch {}
    setName('');
    setSports([]);
    setImprove({});
    setAge('');
    setWeight('');
    setHeight('');
    setGoal(GOALS[0]);
    setDays(4);
    setSessMin(60);
    setLimits([]);
    setObStep(0);
    setSport('Basquetebol');    setLvl(2);
    setEq(0);
    setDone({});
    setChat([['c', 'Olá! Sou o teu coach FitPlan. Pergunta-me o que quiseres sobre treino, corrida, nutrição ou recuperação.']]);
    setChatInput('');
    setRunHistory([]);
    setRunState('idle');
    setRunDistance(0);
    setRunSeconds(0);
    setRunElevation(0);
    setRunSplits([]);
    setWeek(1);
    setTab(0);
    setDay(null);
    setSec(0);
    setResetPending(false);
    setOnboarded(false);
  };

  const toggleIn = (list: string[], v: string) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  const toggleSport = (sp: string) => {
    const next = toggleIn(sports, sp);
    setSports(next);
    if (!next.includes(sp)) setImprove((prev) => { const c = { ...prev }; delete c[sp]; return c; });
  };

  const toggleLimit = (l: string) => {
    if (l === 'Nenhuma') { setLimits(limits.includes(l) ? [] : [l]); return; }
    setLimits(toggleIn(limits.filter((x) => x !== 'Nenhuma'), l));
  };

  const obCanNext = () => {
    if (obStep === 0) return name.trim().length > 0;
    if (obStep === 1) return sports.length > 0;
    if (obStep === 2) return sports.every((sp) => (improve[sp] || []).length > 0);
    return true;
  };

  const handleCreatePlan = () => {
    if (!name.trim()) setName('Atleta');
    if (sports.length) setSport(sports[0]);
    setDone({});
    setOnboarded(true);
    setTab(0);
    setDay(null);
    showToast('Plano criado!');
  };

  const handleWipe = async () => {
    if (confirmAction) {
      const ok = await confirmAction('Queres mesmo sair? Os dados e o plano atuais serão apagados e vais criar um plano novo.');
      if (ok) wipeAll();
      return;
    }
    if (resetPending) {
      wipeAll();
    } else {
      setResetPending(true);
      setTimeout(() => setResetPending(false), 3000);
    }
  };

  const renderProgressBar = (p: number, c = 'var(--lime)', extraStyle = '') => (
    <div className="bar" style={extraStyle ? { marginTop: 12 } : {}}>
      <i style={{ width: `${p}%`, background: c }} />
    </div>
  );

  // Interpolação para desenhar o corredor no mapa SVG
  const getRunnerCoordinates = (): [number, number] => {
    if (runDistance <= 0) return ROUTE_PTS[0];
    const totalPts = ROUTE_PTS.length - 1;
    const progress = (runDistance % 5) / 5; // Ciclo de 5km
    const indexFloat = progress * totalPts;
    const i = Math.floor(indexFloat);
    const fraction = indexFloat - i;
    const p1 = ROUTE_PTS[i] || ROUTE_PTS[0];
    const p2 = ROUTE_PTS[i + 1] || ROUTE_PTS[totalPts];
    return [
      +(p1[0] + (p2[0] - p1[0]) * fraction).toFixed(1),
      +(p1[1] + (p2[1] - p1[1]) * fraction).toFixed(1),
    ];
  };

  // Traçado percorrido até ao momento
  const getTraveledPolyline = () => {
    if (runDistance <= 0) return `${ROUTE_PTS[0][0]},${ROUTE_PTS[0][1]}`;
    const totalPts = ROUTE_PTS.length - 1;
    const progress = Math.min(1, (runDistance % 5) / 5);
    const targetIdx = Math.floor(progress * totalPts);
    const pts = ROUTE_PTS.slice(0, targetIdx + 1);
    const [rx, ry] = getRunnerCoordinates();
    pts.push([rx, ry]);
    return pts.map((p) => p.join(',')).join(' ');
  };

  // ── VISTA 0: PLANO (COM SUPORTE A MODO STRAVA) ──
  const renderPlano = () => {
    const t = tot();
    const p = Math.round((100 * t) / ALL);
    const C = 2 * Math.PI * 34;

    return (
      <>
        <div className="top">
          <img className="logo" src={LOGO_MARK} alt="FitPlan" />
          <div>
            <small>Semana {week} · {isRunning ? 'Fase Corrida & Ritmo' : 'Fase 1'}</small>
            <h1>Olá, {name}</h1>
          </div>
          <div className="streak">
            <Icon name="fire" size={16} />
            0 dias
          </div>
        </div>

        {isRunning ? (
          <div className="note" style={{ background: 'rgba(252,82,0,0.1)', borderColor: 'rgba(252,82,0,0.3)', color: '#FFD3CD' }}>
            <Icon name="route" size={18} />
            <span>Sistema Strava GPS Ativo: podes iniciar a gravação do percurso com cálculo de ritmo e parciais por km.</span>
          </div>
        ) : (
          <div className="note">
            <Icon name="warn" size={18} />
            <span>Plano adaptado para proteger o joelho e as costas: os saltos de alto impacto foram trocados por isometria.</span>
          </div>
        )}

        {(improve[sport] || []).length > 0 && (
          <p className="mu" style={{ margin: '12px 2px 0' }}>
            Foco: <b style={{ color: 'var(--tx)' }}>{(improve[sport] || []).join(' · ')}</b>
          </p>
        )}

        <div className="weeks">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((w) => (
            <button
              key={w}
              className={w === week ? 'on' : ''}
              onClick={() => {
                setWeek(w);
                if (w > 1) showToast(`Semana ${w} selecionada`);
              }}
            >
              S{w}
            </button>
          ))}
        </div>

        {/* HERO CARD ESTILO STRAVA PARA CORREDORES */}
        {isRunning ? (
          <div className="hero" style={{ background: 'linear-gradient(135deg, #FC5200 0%, #FF6B5B 100%)', color: '#fff' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <small style={{ color: 'rgba(255,255,255,0.85)', fontWeight: 700, letterSpacing: 1.5 }}>
                STRAVA GPS TRACKER
              </small>
              <span style={{ fontSize: 11, background: 'rgba(0,0,0,0.3)', padding: '3px 8px', borderRadius: 99, fontWeight: 700 }}>
                GPS Forte 🟢
              </span>
            </div>
            <h2 style={{ color: '#fff' }}>
              Treino de Ritmo
              <br />
              5.0 km · Fartlek
            </h2>
            <small style={{ color: 'rgba(255,255,255,0.9)' }}>
              Pace alvo: 5:00 /km · Sessão principal às 11:00
            </small>
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button
                className="cta"
                style={{ background: '#fff', color: 'var(--strava)', flex: 1, marginTop: 0 }}
                onClick={() => {
                  setTab(1); // Vai para o ecrã de Gravação Strava
                  if (mainRef.current) mainRef.current.scrollTop = 0;
                }}
              >
                Gravar Corrida ⏱️
              </button>
              <button
                className="cta"
                style={{ background: 'rgba(0,0,0,0.35)', color: '#fff', width: 'auto', padding: '0 16px', marginTop: 0 }}
                onClick={() => { setDay(0); setSec(0); }}
              >
                Exercícios
              </button>
            </div>
          </div>
        ) : (
          <div className="hero">
            <small>Próximo treino</small>
            <h2>
              Segunda-feira
              <br />
              Força superior
            </h2>
            <small>{ALL} tarefas · sessão principal às 11:00</small>
            <button className="cta" onClick={() => { setDay(0); setSec(0); }}>
              {t ? 'Continuar treino' : 'Começar treino'}
            </button>
          </div>
        )}

        <div className="card prog">
          <svg width="96" height="96" viewBox="0 0 80 80" role="img" aria-label={`Progresso da semana ${p}%`}>
            <circle cx="40" cy="40" r="34" fill="none" stroke="var(--s2)" strokeWidth="8" />
            <circle
              cx="40"
              cy="40"
              r="34"
              fill="none"
              stroke={isRunning ? 'var(--strava)' : 'var(--lime)'}
              strokeWidth="8"
              strokeLinecap="round"
              strokeOpacity={p ? 1 : 0}
              strokeDasharray={`${(C * p) / 100} ${C}`}
              transform="rotate(-90 40 40)"
              style={{ transition: 'stroke-dasharray .4s' }}
            />
            <text x="40" y="45" textAnchor="middle" fontSize="15" fontWeight="700" fill="var(--tx)">
              {p}%
            </text>
          </svg>
          <div className="rows">
            {[0, 1, 2].map((i) => (
              <div key={i} className="rw">
                <span>{D[i].n}</span>
                <b>{pc(i)}%</b>
                {renderProgressBar(pc(i), D[i].c)}
              </div>
            ))}
          </div>
        </div>

        <h2>Treinos da semana</h2>
        <small>
          {t} de {ALL} tarefas concluídas
        </small>
        {DAYS.map((d, i) => (
          <button key={i} className="day" onClick={() => { setDay(i); setSec(0); }}>
            <span className="dk">{d[0]}</span>
            <span>
              <b>{d[1]}</b>
              <small>{d[2]}</small>
            </span>
            {d[3] === -1 ? (
              <span className="pill rest">Descanso</span>
            ) : (
              <span className="pill">
                {i === 0 ? t : 0}/{i === 0 ? ALL : d[3]}
              </span>
            )}
          </button>
        ))}

        <div className="tip">
          <b>Dica do treinador:</b> {isRunning ? 'aumenta a cadência para 180 passos/min para reduzir o impacto nas articulações.' : 'gere a fadiga do sistema nervoso. A intensidade máxima só compensa com boa recuperação.'}
        </div>
      </>
    );
  };

  // ── VISTA DETALHE DO DIA ──
  const renderDet = () => {
    const d = DAYS[day ?? 0];
    const s = D[sec];
    const t = tot();
    const p = Math.round((100 * t) / ALL);

    return (
      <>
        <div className="hd">
          <div className="top">
            <button className="back" onClick={() => setDay(null)} aria-label="Voltar">
              <Icon name="back" />
            </button>
            <div>
              <small>Semana {week} · {sport}</small>
              <h1>{d[1]}</h1>
            </div>
            <span className="pill">
              {t}/{ALL}
            </span>
          </div>
          {renderProgressBar(p, isRunning ? 'var(--strava)' : 'var(--lime)', 'margin-top:12px')}
        </div>

        {day !== 0 && (
          <p className="mu" style={{ marginTop: 12 }}>
            Pré-visualização: este dia usa os exercícios de exemplo de segunda-feira.
          </p>
        )}

        <details className="card" open style={{ marginTop: 14 }}>
          <summary>Horário sugerido</summary>
          {SCH.map((x, i) => (
            <div key={i} className="tl">
              <b>{x[0]}</b>
              <span>{x[1]}</span>
            </div>
          ))}
        </details>

        <div className="chips">
          {D.map((x, i) => (
            <button key={i} className={i === sec ? 'on' : ''} onClick={() => setSec(i)}>
              {x.n} {cnt(i)}/{x.it.length}
            </button>
          ))}
        </div>

        <div style={{ marginTop: 10 }}>
          {s.it.map((x, j) => {
            const k = `${sec}-${j}`;
            const isChecked = !!done[k];
            return (
              <button
                key={j}
                className={`it ${isChecked ? 'on' : ''}`}
                onClick={() => toggleCheck(k)}
                aria-pressed={isChecked}
              >
                <span className="ck">
                  <Icon name="ok" size={16} />
                </span>
                <span>
                  <b>{x[0]}</b>
                  <span>{x[1]}</span>
                  <span className="tags">
                    <i>{x[2] || `${s.g} +0.8`}</i>
                    {x[3] ? <i className="c">Protege o tendão</i> : null}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </>
    );
  };

  // ── VISTA STRAVA GPS RUN TRACKER (SISTEMA DE CORRIDA ESTILO STRAVA) ──
  const renderRunTracker = () => {
    const [rx, ry] = getRunnerCoordinates();
    const fullPathStr = ROUTE_PTS.map((p) => p.join(',')).join(' ');
    const traveledPathStr = getTraveledPolyline();

    // Resumo pós-corrida
    if (runState === 'finished') {
      return (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
          <div className="top">
            <button className="back" onClick={() => setRunState('idle')}>
              <Icon name="back" />
            </button>
            <div>
              <small>Strava GPS Activity</small>
              <h1>Corrida Concluída! 🏆</h1>
            </div>
          </div>

          <div className="card" style={{ marginTop: 16, border: '1px solid var(--strava)', background: 'linear-gradient(160deg, #1A2549, #121B3A)' }}>
            <input
              value={runTitle}
              onChange={(e) => setRunTitle(e.target.value)}
              style={{ fontSize: 18, fontWeight: 800, background: 'transparent', border: 'none', borderBottom: '1px solid var(--line)', borderRadius: 0, padding: '4px 0', height: 'auto', marginBottom: 12, color: '#fff' }}
            />
            <small className="mu">Hoje às {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · Lisboa, Portugal</small>

            {/* Mapa Preview */}
            <div style={{ margin: '14px 0', borderRadius: 16, overflow: 'hidden', border: '1px solid var(--line)' }}>
              <svg viewBox="0 0 320 180" width="100%" height="150" style={{ background: '#070C1E', display: 'block' }}>
                <path d="M0,40 Q160,20 320,60 L320,180 L0,180 Z" fill="rgba(127,168,255,0.05)" />
                <polyline points={fullPathStr} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="3" />
                <polyline points={fullPathStr} fill="none" stroke="var(--strava)" strokeWidth="4" strokeLinecap="round" />
                <circle cx={ROUTE_PTS[0][0]} cy={ROUTE_PTS[0][1]} r="6" fill="#10B981" stroke="#fff" strokeWidth="2" />
                <circle cx={ROUTE_PTS[ROUTE_PTS.length - 1][0]} cy={ROUTE_PTS[ROUTE_PTS.length - 1][1]} r="6" fill="var(--strava)" stroke="#fff" strokeWidth="2" />
              </svg>
            </div>

            {/* Banner PR Strava */}
            <div style={{ background: 'rgba(252,82,0,0.15)', border: '1px solid var(--strava)', borderRadius: 12, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <span style={{ fontSize: 24 }}>🏆</span>
              <div>
                <b style={{ color: 'var(--strava)', fontSize: 13 }}>Recorde Pessoal nos 5 km!</b>
                <div style={{ fontSize: 11, color: 'var(--mu)' }}>Parabéns! Superaste a tua melhor marca anterior em 14 segundos.</div>
              </div>
            </div>

            {/* Métricas Principais */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, textAlign: 'center' }}>
              <div style={{ background: 'var(--bg)', padding: 12, borderRadius: 14 }}>
                <small className="mu">DISTÂNCIA</small>
                <b style={{ display: 'block', fontSize: 24, color: 'var(--tx)', marginTop: 2 }}>{runDistance.toFixed(2)} km</b>
              </div>
              <div style={{ background: 'var(--bg)', padding: 12, borderRadius: 14 }}>
                <small className="mu">TEMPO</small>
                <b style={{ display: 'block', fontSize: 24, color: 'var(--tx)', marginTop: 2 }}>{formatTime(runSeconds)}</b>
              </div>
              <div style={{ background: 'var(--bg)', padding: 12, borderRadius: 14 }}>
                <small className="mu">PACE MÉDIO</small>
                <b style={{ display: 'block', fontSize: 22, color: 'var(--lime)', marginTop: 2 }}>{formatPace(runSeconds, runDistance)} /km</b>
              </div>
              <div style={{ background: 'var(--bg)', padding: 12, borderRadius: 14 }}>
                <small className="mu">CALORIAS</small>
                <b style={{ display: 'block', fontSize: 22, color: 'var(--coral)', marginTop: 2 }}>{Math.round(runDistance * 68)} kcal</b>
              </div>
            </div>

            {/* Ganho RPG */}
            <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--line)', display: 'flex', justifyContent: 'space-around', fontSize: 12 }}>
              <span style={{ color: 'var(--lime)', fontWeight: 700 }}>⚡ +1.2 Pace & Vel</span>
              <span style={{ color: 'var(--coral)', fontWeight: 700 }}>🫀 +1.5 Resistência</span>
              <span style={{ color: 'var(--ice)', fontWeight: 700 }}>+150 XP</span>
            </div>
          </div>

          {/* Botões de Ação */}
          <button className="cta alt" style={{ marginTop: 16, background: 'var(--strava)' }} onClick={handleSaveRun}>
            Guardar no Feed Strava 🏃
          </button>
          <button
            className="danger"
            style={{ marginTop: 10 }}
            onClick={() => {
              setRunState('idle');
              setRunDistance(0);
              setRunSeconds(0);
              setRunSplits([]);
            }}
          >
            Descartar Corrida
          </button>
        </div>
      );
    }

    // Ecrã em direto (Idle, Running, Paused)
    return (
      <div>
        {/* Header Strava */}
        <div className="top" style={{ marginBottom: 12 }}>
          <div className="logo" style={{ background: 'var(--strava)', fontSize: 18 }}>
            🏃
          </div>
          <div>
            <small>Strava Running GPS</small>
            <h1>{runState === 'running' ? 'Corrida em Direto 🟢' : runState === 'paused' ? 'Corrida em Pausa ⏸️' : 'Gravar Corrida'}</h1>
          </div>
          <button
            className="pill"
            style={{ background: isSimulating ? 'rgba(252,82,0,0.18)' : 'var(--s2)', color: isSimulating ? 'var(--strava)' : 'var(--mu)', border: '1px solid var(--line)' }}
            onClick={() => {
              setIsSimulating(!isSimulating);
              showToast(!isSimulating ? '⚡ Modo Simulação Ativado' : '📍 GPS Real Ativado');
            }}
          >
            {isSimulating ? '⚡ Demo' : '📍 GPS'}
          </button>
        </div>

        {/* MAPA SVG INTERATIVO STRAVA */}
        <div style={{ position: 'relative', width: '100%', borderRadius: 24, overflow: 'hidden', border: '1.5px solid var(--line)', background: '#070C1E', boxShadow: '0 8px 30px rgba(0,0,0,0.5)' }}>
          <svg viewBox="0 0 320 170" width="100%" height="170" style={{ display: 'block' }}>
            {/* Grelha de ruas e rios estilo Strava Dark Mode */}
            <path d="M0,50 Q160,30 320,70 L320,170 L0,170 Z" fill="rgba(127,168,255,0.04)" />
            <line x1="0" y1="90" x2="320" y2="90" stroke="#121D3F" strokeWidth="1.5" />
            <line x1="80" y1="0" x2="80" y2="170" stroke="#121D3F" strokeWidth="1" />
            <line x1="220" y1="0" x2="220" y2="170" stroke="#121D3F" strokeWidth="1" />
            
            {/* Percurso planeado (tracejado) */}
            <polyline points={fullPathStr} fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth="3" strokeDasharray="4 4" />

            {/* Percurso percorrido (laranja Strava com brilho neon) */}
            {runDistance > 0 && (
              <polyline points={traveledPathStr} fill="none" stroke="var(--strava)" strokeWidth="4.5" strokeLinecap="round" />
            )}

            {/* Ponto de partida */}
            <circle cx={ROUTE_PTS[0][0]} cy={ROUTE_PTS[0][1]} r="6" fill="#10B981" stroke="#fff" strokeWidth="2" />
            <text x={ROUTE_PTS[0][0] - 12} y={ROUTE_PTS[0][1] + 16} fill="var(--mu)" fontSize="9" fontWeight="700">0k</text>

            {/* Marcadores de Km */}
            {ROUTE_PTS.map((p, idx) => {
              if (idx > 0 && idx % 3 === 0 && idx < 16) {
                const kmMark = Math.floor(idx / 3);
                return (
                  <g key={idx}>
                    <circle cx={p[0]} cy={p[1]} r="3" fill="#6366F1" stroke="#fff" strokeWidth="1" />
                    <text x={p[0] + 4} y={p[1] + 3} fill="var(--mu)" fontSize="8" fontWeight="700">{kmMark}k</text>
                  </g>
                );
              }
              return null;
            })}

            {/* Ícone Pulsante do Corredor em Tempo Real */}
            <g transform={`translate(${rx}, ${ry})`}>
              <circle cx="0" cy="0" r="11" fill="rgba(252, 82, 0, 0.25)" className="pulse-ring" />
              <circle cx="0" cy="0" r="6" fill="var(--strava)" stroke="#fff" strokeWidth="2" />
              <polygon points="0,-4 3,4 -3,4" fill="#fff" transform="rotate(45)" />
            </g>
          </svg>

          {/* Badge de sinal GPS */}
          <div style={{ position: 'absolute', top: 10, left: 12, background: 'rgba(10,17,40,0.85)', backdropFilter: 'blur(8px)', border: '1px solid var(--line)', borderRadius: 99, padding: '4px 10px', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981' }} />
            GPS: Ótimo (±3m)
          </div>

          <div style={{ position: 'absolute', top: 10, right: 12, background: 'rgba(10,17,40,0.85)', backdropFilter: 'blur(8px)', border: '1px solid var(--line)', borderRadius: 99, padding: '4px 10px', fontSize: 11, color: 'var(--mu)' }}>
            Elev: +{runElevation}m
          </div>
        </div>

        {/* HUD STRAVA: DISTÂNCIA GIGANTE */}
        <div style={{ padding: '16px 0 10px', textAlign: 'center' }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--mu)', letterSpacing: 2, textTransform: 'uppercase' }}>
            DISTÂNCIA TOTAL
          </div>
          <div style={{ fontSize: 62, fontWeight: 900, color: 'var(--tx)', lineHeight: 1, margin: '4px 0', letterSpacing: -1 }}>
            {runDistance.toFixed(2)}
            <span style={{ fontSize: 24, fontWeight: 800, color: 'var(--strava)', marginLeft: 6 }}>KM</span>
          </div>
        </div>

        {/* 3 MÉTRICAS PRINCIPAIS */}
        <div className="card" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, textAlign: 'center', padding: '14px 6px', marginTop: 0 }}>
          <div>
            <small className="mu" style={{ textTransform: 'uppercase', fontSize: 10, fontWeight: 700 }}>PACE MÉDIO</small>
            <b style={{ display: 'block', fontSize: 21, color: 'var(--lime)', marginTop: 4 }}>
              {formatPace(runSeconds, runDistance)}
            </b>
            <small className="mu" style={{ fontSize: 10 }}>/km</small>
          </div>
          <div>
            <small className="mu" style={{ textTransform: 'uppercase', fontSize: 10, fontWeight: 700 }}>TEMPO</small>
            <b style={{ display: 'block', fontSize: 21, color: 'var(--tx)', marginTop: 4 }}>
              {formatTime(runSeconds)}
            </b>
            <small className="mu" style={{ fontSize: 10 }}>decorrido</small>
          </div>
          <div>
            <small className="mu" style={{ textTransform: 'uppercase', fontSize: 10, fontWeight: 700 }}>CALORIAS</small>
            <b style={{ display: 'block', fontSize: 21, color: 'var(--coral)', marginTop: 4 }}>
              {Math.round(runDistance * 68)}
            </b>
            <small className="mu" style={{ fontSize: 10 }}>kcal</small>
          </div>
        </div>

        {/* BIOMETRIA SECUNDÁRIA */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: 8 }}>
          <div className="card" style={{ marginTop: 0, padding: 10, textAlign: 'center' }}>
            <small className="mu" style={{ fontSize: 10 }}>Cadência</small>
            <b style={{ display: 'block', fontSize: 15, marginTop: 2 }}>{runState === 'running' ? runCadence : '--'} <span style={{ fontSize: 10, fontWeight: 400 }}>spm</span></b>
          </div>
          <div className="card" style={{ marginTop: 0, padding: 10, textAlign: 'center' }}>
            <small className="mu" style={{ fontSize: 10 }}>Freq. Cardíaca</small>
            <b style={{ display: 'block', fontSize: 15, marginTop: 2, color: 'var(--coral)' }}>{runState === 'running' ? runBpm : '--'} <span style={{ fontSize: 10, fontWeight: 400 }}>bpm</span></b>
          </div>
          <div className="card" style={{ marginTop: 0, padding: 10, textAlign: 'center' }}>
            <small className="mu" style={{ fontSize: 10 }}>Alvo</small>
            <b style={{ display: 'block', fontSize: 15, marginTop: 2, color: 'var(--ice)' }}>5.0 <span style={{ fontSize: 10, fontWeight: 400 }}>km</span></b>
          </div>
        </div>

        {/* BOTÕES DE CONTROLO DE GRAVAÇÃO */}
        <div style={{ marginTop: 18 }}>
          {runState === 'idle' && (
            <button
              className="cta"
              style={{ background: 'linear-gradient(135deg, #FC5200 0%, #FF6B5B 100%)', color: '#fff', fontSize: 16, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, boxShadow: '0 8px 24px rgba(252,82,0,0.4)' }}
              onClick={() => {
                setRunState('running');
                showToast('🚀 Corrida iniciada! Boa prova!');
              }}
            >
              <Icon name="play" size={20} />
              INICIAR CORRIDA STRAVA
            </button>
          )}

          {runState === 'running' && (
            <button
              className="cta"
              style={{ background: 'var(--coral)', color: '#fff', fontSize: 16, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}
              onClick={() => {
                setRunState('paused');
                showToast('⏸️ Corrida em pausa');
              }}
            >
              <Icon name="pause" size={20} />
              PAUSAR CORRIDA
            </button>
          )}

          {runState === 'paused' && (
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                className="cta"
                style={{ flex: 1, background: 'var(--lime)', color: 'var(--bg)', marginTop: 0, height: 54, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                onClick={() => {
                  setRunState('running');
                  showToast('▶️ Corrida retomada');
                }}
              >
                <Icon name="play" size={18} />
                RETOMAR
              </button>
              <button
                className="cta"
                style={{ flex: 1, background: 'var(--coral)', color: '#fff', marginTop: 0, height: 54, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                onClick={() => {
                  setRunState('finished');
                }}
              >
                <Icon name="stop" size={18} />
                CONCLUIR
              </button>
            </div>
          )}
        </div>

        {/* TABELA DE PARCIAIS (SPLITS POR KM) */}
        {runSplits.length > 0 && (
          <div className="card" style={{ marginTop: 16 }}>
            <b style={{ display: 'block', fontSize: 13, marginBottom: 8 }}>Parciais da Corrida (Splits por Km)</b>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {runSplits.map((s, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, padding: '6px 0', borderBottom: '1px solid var(--line)' }}>
                  <span>Km {s.km}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <small className="mu">{s.elev}</small>
                    <b style={{ color: idx === 0 ? 'var(--lime)' : 'var(--tx)', fontFamily: 'monospace' }}>{s.pace} /km</b>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* HISTÓRICO DE CORRIDAS GUARDADAS */}
        {runState === 'idle' && (
          <div style={{ marginTop: 22 }}>
            <h2>Histórico de Corridas Strava</h2>
            <small>{runHistory.length} atividades gravadas</small>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
              {runHistory.map((h, i) => (
                <div key={i} className="card" style={{ marginTop: 0, padding: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <b style={{ fontSize: 14 }}>{h.title}</b>
                      <small className="mu" style={{ display: 'block', marginTop: 2 }}>{h.date}</small>
                    </div>
                    <span className="pill" style={{ background: 'rgba(252,82,0,0.15)', color: 'var(--strava)' }}>
                      {h.distance} km
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 16, marginTop: 10, fontSize: 12 }}>
                    <div><span className="mu">Tempo:</span> <b>{h.time}</b></div>
                    <div><span className="mu">Pace:</span> <b style={{ color: 'var(--lime)' }}>{h.pace} /km</b></div>
                    <div><span className="mu">Cal:</span> <b>{h.kcal}</b></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // ── VISTA 1: RANK / RPG (ADAPTÁVEL A CORRIDA) ──
  const renderRank = () => {
    const gr = [0.25, 0.5, 0.75, 1].map((k) => (
      <polygon
        key={k}
        points={ax.map((_, i) => pt(i, 70 * k).join(',')).join(' ')}
        fill="none"
        stroke="var(--line)"
      />
    ));
    const poly = vals.map((v, i) => pt(i, (70 * v) / 99).join(',')).join(' ');
    const dots = vals.map((v, i) => {
      const [x, y] = pt(i, (70 * v) / 99);
      return <circle key={i} cx={x} cy={y} r="4" fill="var(--lime)" />;
    });
    const lb = ax.map((n, i) => {
      const [x, y] = pt(i, 88);
      return (
        <text
          key={i}
          x={x}
          y={y + (i === 0 ? -2 : i === 1 || i === 4 ? 3 : 9)}
          textAnchor={i === 0 ? 'middle' : i < 3 ? 'start' : 'end'}
          fontSize="11"
          fill="var(--mu)"
        >
          {n}
        </text>
      );
    });

    const leaderboard = [
      LG[0],
      LG[1],
      LG[2],
      [`${name} (tu)`, 'A tua cidade', 0, isRunning ? 80 : 78],
      LG[4],
      LG[5],
    ];

    return (
      <>
        <div className="top">
          <img className="logo" src={LOGO_MARK} alt="FitPlan" />
          <div>
            <small>{isRunning ? 'Clube de Corredores' : sport}</small>
            <h1>Perfil e Liga {isRunning ? 'Strava' : ''}</h1>
          </div>
        </div>

        <div className="ovr" style={isRunning ? { background: 'linear-gradient(150deg, #1A2549, #121B3A)', borderColor: 'var(--strava)' } : {}}>
          <div className="row">
            <div>
              <h1 style={{ fontSize: 26 }}>{name}</h1>
              <small>Nível 4 · {isRunning ? 'Maratonista de Elite' : `Lenda do ${sport.toLowerCase()}`}</small>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="n" style={isRunning ? { color: 'var(--strava)' } : {}}>{isRunning ? 80 : 78}</div>
              <small>OVR</small>
            </div>
          </div>
          <div style={{ marginTop: 18, display: 'flex', justifyContent: 'space-between' }}>
            <small>Progresso para o nível 5</small>
            <small>0/100 XP</small>
          </div>
          {renderProgressBar(0, isRunning ? 'var(--strava)' : 'var(--lime)', 'margin-top:6px')}
          <div className="stats">
            <div>
              <b>#4</b>
              <small>Liga</small>
            </div>
            <div>
              <b>0 d</b>
              <small>Sequência</small>
            </div>
            <div>
              <b>{tot()}</b>
              <small>{isRunning ? 'Treinos' : 'Tarefas'}</small>
            </div>
          </div>
        </div>

        <div className="card">
          <svg viewBox="-30 0 300 200" width="100%" role="img" aria-label="Radar de atributos">
            {gr}
            <polygon points={poly} fill={isRunning ? 'rgba(252,82,0,.18)' : 'rgba(198,244,50,.18)'} stroke={isRunning ? 'var(--strava)' : 'var(--lime)'} strokeWidth="2" />
            {dots}
            {lb}
          </svg>
        </div>

        <h2>Atributos {isRunning ? 'do Corredor' : ''}</h2>
        <div className="card" style={{ marginTop: 8 }}>
          {ax.map((n, i) => (
            <div key={i} className="at" style={i === 0 ? { marginTop: 0 } : {}}>
              <span>{n}</span>
              <b>
                {vals[i]}
                <small> / 99</small>
              </b>
              {renderProgressBar(vals[i] / 0.99, isRunning ? (i === 0 ? 'var(--strava)' : i % 2 ? 'var(--coral)' : 'var(--lime)') : i % 2 ? 'var(--coral)' : 'var(--lime)')}
            </div>
          ))}
        </div>

        <h2>Classificação da liga {isRunning ? 'Strava' : ''}</h2>
        {leaderboard.map((l, i) => (
          <div key={i} className={`lg ${l[0].includes('tu') ? 'me' : ''}`} style={isRunning && l[0].includes('tu') ? { borderColor: 'var(--strava)' } : {}}>
            <b className="mu">#{i + 1}</b>
            <span className="av" style={isRunning && l[0].includes('tu') ? { background: 'var(--strava)' } : {}}>{l[0][0]}</span>
            <span>
              <b>{l[0]}</b>
              <br />
              <small>
                {l[1]} · {l[2]} dias seguidos
              </small>
            </span>
            <b style={{ color: isRunning ? 'var(--strava)' : 'var(--lime)', fontSize: 18 }}>{l[3]}</b>
          </div>
        ))}
      </>
    );
  };

  // ── VISTA 2: COACH IA ──
  const renderCoach = () => (
    <div className="chat">
      <div className="top">
        <img className="logo" src={LOGO_MARK} alt="FitPlan" />
        <div>
          <small>Coach com IA</small>
          <h1>Assistente {isRunning ? 'de Corrida' : 'FitPlan'}</h1>
        </div>
      </div>

      <div className="msgs">
        {chat.map((m, i) => (
          <div key={i} className={`m ${m[0]}`}>
            {m[1]}
          </div>
        ))}
      </div>

      <div className="compose">
        <div className="chips">
          {(isRunning
            ? ['Como aquecer?', 'O que comer pré-treino?', 'Qual o meu ritmo ideal de corrida?', 'Como melhorar a cadência?']
            : ['Como aquecer?', 'O que comer pré-treino?', 'Dor no joelho']
          ).map((q) => (
            <button key={q} onClick={() => handleAsk(q)}>
              {q}
            </button>
          ))}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAsk(chatInput);
          }}
        >
          <input
            id="q"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder={isRunning ? "Pergunta ao teu coach de corrida..." : "Pergunta ao teu coach"}
            aria-label="Mensagem"
            autoComplete="off"
          />
          <button type="submit" className="send" aria-label="Enviar" style={isRunning ? { background: 'var(--strava)', color: '#fff' } : {}}>
            <Icon name="send" />
          </button>
        </form>
      </div>
    </div>
  );

  // ── VISTA 3: AJUSTES ──
  const renderAjustes = () => (
    <>
      <div className="top">
        <img className="logo" src={LOGO_MARK} alt="FitPlan" />
        <div>
          <small>Configuração</small>
          <h1>Definições do atleta</h1>
        </div>
      </div>

      <label htmlFor="nm">Nome</label>
      <input
        id="nm"
        value={name}
        onChange={(e) => setName(e.target.value)}
        maxLength={20}
      />

      <label htmlFor="md">{sports.length > 1 ? 'Modalidade principal' : 'Modalidade'}</label>
      <select
        id="md"
        value={sport}
        onChange={(e) => {
          const sp = e.target.value;
          setSport(sp);
          setDone({});
          if (sp === 'Corrida') {
            showToast('🏃 Modo Corrida & Strava GPS ativado!');
          } else {
            showToast(`Modalidade alterada para ${sp}`);
          }
        }}
      >
        {(sports.length ? sports : SPORTS).map((x) => (
          <option key={x}>{x}</option>
        ))}
      </select>
      {sports.length > 1 && (
        <p className="mu" style={{ margin: '8px 2px 0' }}>Pratico também: {sports.filter((x) => x !== sport).join(', ')}</p>
      )}

      <label>Nível de experiência</label>
      <div className="seg">
        {['Iniciante', 'Intermédio', 'Avançado'].map((x, i) => (
          <button key={i} className={i === lvl ? 'on' : ''} onClick={() => setLvl(i)}>
            {x}
          </button>
        ))}
      </div>
      <p className="mu" style={{ margin: '8px 2px 0' }}>
        {LV[lvl]}
      </p>

      <label>Equipamento</label>
      <div className="seg">
        {['Mínimo', 'Casa', 'Ginásio'].map((x, i) => (
          <button key={i} className={i === eq ? 'on' : ''} onClick={() => setEq(i)}>
            {x}
          </button>
        ))}
      </div>
      <p className="mu" style={{ margin: '8px 2px 0' }}>
        {EQ[eq]}
      </p>

      <button
        className="cta alt"
        style={{ marginTop: 26, background: isRunning ? 'var(--strava)' : 'var(--lime)', color: isRunning ? '#fff' : 'var(--bg)' }}
        onClick={() => {
          showToast(`Plano atualizado para ${name || 'Atleta'}`);
        }}
      >
        Atualizar plano
      </button>

      <button className="danger" onClick={handleWipe}>
        {resetPending ? 'Toca outra vez para sair' : 'Sair'}
      </button>
    </>
  );

  // Navegação: Quando Corrida está ativa, temos 5 abas com a aba Strava "Gravar"
  const navTabs = isRunning
    ? [
        { id: 0, label: 'Plano', icon: 'plano' },
        { id: 1, label: 'Gravar', icon: 'gravar' },
        { id: 2, label: 'Rank', icon: 'rank' },
        { id: 3, label: 'Coach', icon: 'coach' },
        { id: 4, label: 'Ajustes', icon: 'ajustes' },
      ]
    : [
        { id: 0, label: 'Plano', icon: 'plano' },
        { id: 1, label: 'Rank', icon: 'rank' },
        { id: 2, label: 'Coach', icon: 'coach' },
        { id: 3, label: 'Ajustes', icon: 'ajustes' },
      ];

  return (
    <div className="app">
      {/* ── FOLHA DE ESTILOS EMBUTIDA DO NOVO DESIGN COM SUPORTE STRAVA ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&display=swap');

        :root {
          --bg: #0A1128;
          --s1: #121B3A;
          --s2: #1A2549;
          --line: #26335F;
          --lime: #C6F432;
          --coral: #FF6B5B;
          --ice: #7FA8FF;
          --tx: #F5F7FF;
          --mu: #8D98BD;
          --strava: #FC5200;
          color-scheme: dark;
        }

        * {
          box-sizing: border-box;
          -webkit-tap-highlight-color: transparent;
          margin: 0;
          padding: 0;
        }

        html, body {
          height: 100%;
          width: 100%;
          margin: 0;
          padding: 0;
          background: #0A1128;
          color: var(--tx);
          font: 400 15px/1.4 Sora, system-ui, -apple-system, "Segoe UI", sans-serif;
          overflow-x: hidden;
          -webkit-font-smoothing: antialiased;
        }

        button {
          font: inherit;
          color: inherit;
          background: none;
          border: 0;
          cursor: pointer;
          padding: 0;
        }

        button:focus-visible, input:focus-visible, select:focus-visible, summary:focus-visible {
          outline: 2px solid var(--lime);
          outline-offset: 2px;
        }

        .app {
          width: 100%;
          max-width: 440px;
          height: 100dvh;
          margin: 0 auto;
          background: var(--bg);
          display: flex;
          flex-direction: column;
          position: relative;
          overflow: hidden;
        }

        main {
          flex: 1;
          overflow-y: auto;
          padding: 16px 18px 28px;
          scrollbar-width: none;
        }
        main::-webkit-scrollbar { display: none; }

        h1 { font-size: 22px; font-weight: 700; margin: 0; letter-spacing: -.01em; }
        h2 { font-size: 16px; font-weight: 700; margin: 24px 0 2px; }
        small, .mu { color: var(--mu); font-size: 12.5px; }

        .card {
          background: var(--s1);
          border: 1px solid var(--line);
          border-radius: 20px;
          padding: 16px;
          margin-top: 14px;
        }

        .top { display: flex; align-items: center; gap: 12px; }
        .top > div:nth-child(2) { flex: 1; min-width: 0; }

        img.logo { object-fit: cover; background: transparent; }
        .opts { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
        .opts button {
          padding: 10px 14px;
          border-radius: 99px;
          background: var(--s1);
          border: 1px solid var(--line);
          color: var(--mu);
          font-weight: 600;
          font-size: 13.5px;
        }
        .opts button.on { background: var(--lime); color: var(--bg); border-color: var(--lime); }
        .stepdots { display: flex; gap: 6px; justify-content: center; margin: 14px 0 18px; }
        .stepdots i { width: 28px; height: 4px; border-radius: 4px; background: var(--s2); }
        .stepdots i.on { background: var(--lime); }
        .cta:disabled { cursor: not-allowed; }
        .logo {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: var(--lime);
          color: var(--bg);
          display: grid;
          place-items: center;
          font-weight: 800;
          font-size: 21px;
          flex: none;
        }

        .streak {
          display: flex;
          gap: 6px;
          align-items: center;
          background: var(--s1);
          border: 1px solid var(--line);
          border-radius: 99px;
          padding: 7px 12px;
          font-size: 13px;
          font-weight: 600;
        }
        .streak svg { color: var(--coral); }

        .note {
          margin-top: 16px;
          padding: 12px 14px;
          border-radius: 16px;
          background: rgba(255,107,91,.1);
          border: 1px solid rgba(255,107,91,.35);
          font-size: 13px;
          color: #FFD3CD;
          display: flex;
          gap: 10px;
        }
        .note svg { flex: none; color: var(--coral); margin-top: 1px; }

        .weeks, .chips {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          margin: 16px -18px 0;
          padding: 0 18px;
          scrollbar-width: none;
        }
        .weeks::-webkit-scrollbar, .chips::-webkit-scrollbar { display: none; }

        .weeks button {
          flex: none;
          min-width: 50px;
          height: 40px;
          border-radius: 14px;
          background: var(--s1);
          border: 1px solid var(--line);
          font-weight: 600;
          color: var(--mu);
        }
        .weeks .on { background: var(--tx); color: var(--bg); border-color: var(--tx); }

        .hero {
          margin-top: 16px;
          background: var(--lime);
          color: var(--bg);
          border-radius: 28px;
          padding: 20px;
        }
        .hero small { color: rgba(10,17,40,.7); font-weight: 600; }
        .hero h2 { font-size: 25px; line-height: 1.15; margin: 6px 0 4px; }

        .cta {
          margin-top: 16px;
          width: 100%;
          height: 50px;
          border-radius: 16px;
          background: var(--bg);
          color: var(--lime);
          font-weight: 700;
        }
        .cta.alt { background: var(--lime); color: var(--bg); }

        .prog { display: flex; gap: 18px; align-items: center; }
        .rows { flex: 1; display: grid; gap: 11px; }
        .rw { display: grid; grid-template-columns: 1fr auto; gap: 5px 8px; font-size: 13px; }
        .bar { grid-column: 1/-1; height: 6px; border-radius: 9px; background: var(--s2); overflow: hidden; }
        .bar i { display: block; height: 100%; border-radius: 9px; transition: width .4s; }

        .day {
          display: grid;
          grid-template-columns: 44px 1fr auto;
          gap: 12px;
          align-items: center;
          width: 100%;
          text-align: left;
          margin-top: 10px;
          background: var(--s1);
          border: 1px solid var(--line);
          border-radius: 20px;
          padding: 14px;
        }
        .day b { display: block; }
        .dk {
          width: 44px;
          height: 44px;
          border-radius: 14px;
          background: var(--s2);
          display: grid;
          place-items: center;
          font-weight: 700;
        }
        .pill {
          padding: 4px 10px;
          border-radius: 99px;
          font-size: 12px;
          font-weight: 600;
          background: var(--s2);
          white-space: nowrap;
        }
        .pill.rest { background: rgba(255,107,91,.15); color: var(--coral); }

        .tip {
          margin-top: 18px;
          padding: 14px;
          border-radius: 18px;
          border: 1px dashed var(--line);
          font-size: 13px;
          color: var(--mu);
        }
        .tip b { color: var(--lime); }

        .hd {
          position: sticky;
          top: -16px;
          z-index: 2;
          background: var(--bg);
          margin: -16px -18px 0;
          padding: 16px 18px 12px;
        }
        .back {
          width: 42px;
          height: 42px;
          border-radius: 14px;
          background: var(--s1);
          border: 1px solid var(--line);
          display: grid;
          place-items: center;
          flex: none;
        }

        .chips { margin-top: 14px; }
        .chips button {
          flex: none;
          padding: 9px 14px;
          border-radius: 99px;
          background: var(--s1);
          border: 1px solid var(--line);
          font-size: 13px;
          font-weight: 600;
          color: var(--mu);
        }
        .chips button.on { background: var(--lime); border-color: var(--lime); color: var(--bg); }

        summary {
          cursor: pointer;
          font-weight: 600;
          list-style: none;
          display: flex;
          justify-content: space-between;
        }
        summary::after { content: "+"; color: var(--lime); font-size: 18px; line-height: 1; }
        details[open] summary::after { content: "–"; }

        .tl { display: grid; grid-template-columns: 56px 1fr; gap: 8px; padding-top: 12px; font-size: 13.5px; }
        .tl b { color: var(--lime); }

        .it {
          display: grid;
          grid-template-columns: 30px 1fr;
          gap: 12px;
          padding: 14px 0;
          border-bottom: 1px solid var(--line);
          width: 100%;
          text-align: left;
        }
        .ck {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          border: 2px solid var(--mu);
          display: grid;
          place-items: center;
          color: transparent;
          transition: .15s;
        }
        .it.on .ck { background: var(--lime); border-color: var(--lime); color: var(--bg); }
        .it b { display: block; font-weight: 600; }
        .it.on b { color: var(--mu); text-decoration: line-through; }
        .it span { display: block; color: var(--mu); font-size: 13px; margin-top: 2px; }

        .tags { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 8px; }
        .tags i {
          font-style: normal;
          font-size: 11.5px;
          font-weight: 600;
          padding: 3px 9px;
          border-radius: 99px;
          background: rgba(198,244,50,.12);
          color: var(--lime);
        }
        .tags i.c { background: rgba(255,107,91,.14); color: var(--coral); }

        .ovr {
          margin-top: 16px;
          border-radius: 28px;
          padding: 20px;
          background: linear-gradient(150deg, var(--s2), var(--s1));
          border: 1px solid var(--line);
        }
        .ovr .row { display: flex; justify-content: space-between; align-items: flex-end; }
        .ovr .n { font-size: 68px; font-weight: 800; line-height: .9; color: var(--lime); }

        .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-top: 14px; }
        .stats div { text-align: center; padding: 12px 4px; border-radius: 16px; background: var(--bg); }
        .stats b { display: block; font-size: 20px; }

        .at { display: grid; grid-template-columns: 1fr auto; gap: 6px 8px; margin-top: 14px; font-size: 14px; }

        .lg {
          display: grid;
          grid-template-columns: 24px 40px 1fr auto;
          gap: 10px;
          align-items: center;
          padding: 12px;
          border-radius: 16px;
          margin-top: 8px;
          background: var(--s1);
          border: 1px solid var(--line);
        }
        .lg.me { border-color: var(--lime); background: rgba(198,244,50,.08); }
        .av { width: 40px; height: 40px; border-radius: 50%; background: var(--s2); display: grid; place-items: center; font-weight: 700; }
        .lg.me .av { background: var(--lime); color: var(--bg); }

        .chat { display: flex; flex-direction: column; min-height: 100%; }
        .msgs { flex: 1; }
        .m { max-width: 84%; padding: 12px 14px; border-radius: 18px; margin-top: 10px; font-size: 14px; }
        .m.c { background: var(--s1); border: 1px solid var(--line); border-bottom-left-radius: 6px; }
        .m.u { margin-left: auto; background: var(--lime); color: var(--bg); border-bottom-right-radius: 6px; font-weight: 600; }

        .compose {
          position: sticky;
          bottom: -28px;
          background: var(--bg);
          margin: 14px -18px -28px;
          padding: 10px 18px 16px;
        }
        .compose .chips { margin: 0 -18px 10px; }
        .compose form { display: flex; gap: 8px; }

        input, select {
          width: 100%;
          height: 48px;
          border-radius: 16px;
          background: var(--s1);
          border: 1px solid var(--line);
          color: var(--tx);
          font: inherit;
          padding: 0 14px;
        }

        .send {
          width: 48px;
          height: 48px;
          border-radius: 16px;
          background: var(--lime);
          color: var(--bg);
          display: grid;
          place-items: center;
          flex: none;
        }

        label { display: block; margin: 18px 0 8px; font-size: 13px; font-weight: 600; }
        .seg {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 6px;
          padding: 4px;
          border-radius: 16px;
          background: var(--s1);
          border: 1px solid var(--line);
        }
        .seg button {
          height: 40px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 600;
          color: var(--mu);
        }
        .seg button.on { background: var(--lime); color: var(--bg); }

        .danger {
          margin-top: 10px;
          width: 100%;
          height: 48px;
          border-radius: 16px;
          border: 1px solid rgba(255,107,91,.45);
          color: var(--coral);
          font-weight: 600;
        }

        nav {
          display: grid;
          grid-template-columns: repeat(${isRunning ? 5 : 4}, 1fr);
          background: var(--s1);
          border-top: 1px solid var(--line);
          padding: 8px 4px calc(env(safe-area-inset-bottom, 0px) + 6px);
          flex: none;
        }
        nav button {
          display: grid;
          justify-items: center;
          gap: 3px;
          padding: 5px 0;
          font-size: 11px;
          font-weight: 600;
          color: var(--mu);
          border-radius: 14px;
        }
        nav button.on { color: ${isRunning ? 'var(--strava)' : 'var(--lime)'}; }

        .pulse-ring {
          animation: pulseAnim 2s infinite ease-out;
          transform-origin: center;
        }
        @keyframes pulseAnim {
          0% { r: 6px; opacity: 0.9; }
          100% { r: 18px; opacity: 0; }
        }

        .toast {
          position: absolute;
          left: 50%;
          bottom: 84px;
          transform: translate(-50%, 20px);
          background: var(--tx);
          color: var(--bg);
          padding: 10px 16px;
          border-radius: 99px;
          font-size: 13px;
          font-weight: 600;
          opacity: 0;
          pointer-events: none;
          transition: .25s;
          white-space: nowrap;
          z-index: 9999;
        }
        .toast.on { opacity: 1; transform: translate(-50%, 0); }
      `}</style>

      {!onboarded ? (
        <main>
          <div style={{ textAlign: 'center' }}>
            <img src={LOGO_FULL} alt="FitPlan" style={{ width: obStep === 0 ? 200 : 96, height: 'auto', borderRadius: 24 }} />
          </div>

          <div className="stepdots" aria-label={`Passo ${obStep + 1} de ${OB_STEPS}`}>
            {Array.from({ length: OB_STEPS }).map((_, i) => (
              <i key={i} className={i <= obStep ? 'on' : ''} />
            ))}
          </div>

          {obStep === 0 && (
            <>
              <h1>Vamos criar o teu plano</h1>
              <p className="mu" style={{ margin: '6px 0 0' }}>Algumas perguntas rápidas para o adaptar a ti.</p>
              <label htmlFor="ob-nm">Como te chamas?</label>
              <input id="ob-nm" value={name} onChange={(e) => setName(e.target.value)} maxLength={20} placeholder="O teu nome" />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                <div>
                  <label htmlFor="ob-age">Idade</label>
                  <input id="ob-age" type="number" inputMode="numeric" value={age} onChange={(e) => setAge(e.target.value)} placeholder="anos" />
                </div>
                <div>
                  <label htmlFor="ob-w">Peso</label>
                  <input id="ob-w" type="number" inputMode="decimal" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="kg" />
                </div>
                <div>
                  <label htmlFor="ob-h">Altura</label>
                  <input id="ob-h" type="number" inputMode="numeric" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="cm" />
                </div>
              </div>
            </>
          )}

          {obStep === 1 && (
            <>
              <h1>Que modalidades praticas?</h1>
              <p className="mu" style={{ margin: '6px 0 0' }}>Podes escolher mais do que uma.</p>
              <div className="opts">
                {SPORTS.map((sp) => (
                  <button key={sp} className={sports.includes(sp) ? 'on' : ''} aria-pressed={sports.includes(sp)} onClick={() => toggleSport(sp)}>
                    {sp}
                  </button>
                ))}
              </div>
            </>
          )}

          {obStep === 2 && (
            <>
              <h1>O que queres melhorar?</h1>
              <p className="mu" style={{ margin: '6px 0 0' }}>Escolhe o que mais te interessa em cada modalidade.</p>
              {sports.map((sp) => (
                <div key={sp}>
                  <label>{sp}</label>
                  <div className="opts">
                    {(IMPROVE[sp] || []).map((x) => (
                      <button
                        key={x}
                        className={(improve[sp] || []).includes(x) ? 'on' : ''}
                        aria-pressed={(improve[sp] || []).includes(x)}
                        onClick={() => setImprove({ ...improve, [sp]: toggleIn(improve[sp] || [], x) })}
                      >
                        {x}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </>
          )}

          {obStep === 3 && (
            <>
              <h1>O teu nível e objetivo</h1>
              <label>Nível de experiência</label>
              <div className="seg">
                {['Iniciante', 'Intermédio', 'Avançado'].map((x, i) => (
                  <button key={i} className={i === lvl ? 'on' : ''} onClick={() => setLvl(i)}>{x}</button>
                ))}
              </div>
              <p className="mu" style={{ margin: '8px 2px 0' }}>{LV[lvl]}</p>
              <label>Objetivo principal</label>
              <div className="opts">
                {GOALS.map((g) => (
                  <button key={g} className={g === goal ? 'on' : ''} aria-pressed={g === goal} onClick={() => setGoal(g)}>{g}</button>
                ))}
              </div>
            </>
          )}

          {obStep === 4 && (
            <>
              <h1>Disponibilidade e material</h1>
              <label>Dias de treino por semana</label>
              <div className="seg">
                {[2, 3, 4, 5, 6].map((n) => (
                  <button key={n} className={n === days ? 'on' : ''} onClick={() => setDays(n)}>{n}</button>
                ))}
              </div>
              <label>Duração de cada sessão</label>
              <div className="seg">
                {[30, 45, 60, 90].map((n) => (
                  <button key={n} className={n === sessMin ? 'on' : ''} onClick={() => setSessMin(n)}>{n} min</button>
                ))}
              </div>
              <label>Equipamento</label>
              <div className="seg">
                {['Mínimo', 'Casa', 'Ginásio'].map((x, i) => (
                  <button key={i} className={i === eq ? 'on' : ''} onClick={() => setEq(i)}>{x}</button>
                ))}
              </div>
              <p className="mu" style={{ margin: '8px 2px 0' }}>{EQ[eq]}</p>
            </>
          )}

          {obStep === 5 && (
            <>
              <h1>Tens alguma lesão ou dor?</h1>
              <p className="mu" style={{ margin: '6px 0 0' }}>Vamos proteger essas zonas no teu plano.</p>
              <div className="opts">
                {LIMITS.map((l) => (
                  <button key={l} className={limits.includes(l) ? 'on' : ''} aria-pressed={limits.includes(l)} onClick={() => toggleLimit(l)}>{l}</button>
                ))}
              </div>
            </>
          )}

          <div style={{ display: 'flex', gap: 10, marginTop: 26 }}>
            {obStep > 0 && (
              <button className="cta" style={{ background: 'var(--s2)', color: 'var(--tx)', flex: 1, marginTop: 0 }} onClick={() => setObStep(obStep - 1)}>
                Voltar
              </button>
            )}
            {obStep < OB_STEPS - 1 ? (
              <button className="cta alt" style={{ flex: 2, marginTop: 0, opacity: obCanNext() ? 1 : 0.4 }} disabled={!obCanNext()} onClick={() => setObStep(obStep + 1)}>
                Continuar
              </button>
            ) : (
              <button className="cta alt" style={{ flex: 2, marginTop: 0 }} onClick={handleCreatePlan}>
                Criar plano
              </button>
            )}
          </div>
        </main>
      ) : (
      <>
      {/* Conteúdo Principal com Scroll */}
      <main ref={mainRef}>
        {isRunning ? (
          <>
            {tab === 0 && (day === null ? renderPlano() : renderDet())}
            {tab === 1 && renderRunTracker()}
            {tab === 2 && renderRank()}
            {tab === 3 && renderCoach()}
            {tab === 4 && renderAjustes()}
          </>
        ) : (
          <>
            {tab === 0 && (day === null ? renderPlano() : renderDet())}
            {tab === 1 && renderRank()}
            {tab === 2 && renderCoach()}
            {tab === 3 && renderAjustes()}
          </>
        )}
      </main>

      {/* Barra de Navegação Inferior */}
      <nav id="nav">
        {navTabs.map((item) => (
          <button
            key={item.id}
            className={item.id === tab ? 'on' : ''}
            onClick={() => {
              setTab(item.id);
              setDay(null);
              setResetPending(false);
              if (mainRef.current) mainRef.current.scrollTop = 0;
            }}
          >
            <Icon name={item.icon} />
            {item.label}
          </button>
        ))}
      </nav>
      </>
      )}

      {/* Toast Flutuante */}
      <div className={`toast ${toastOn ? 'on' : ''}`} role="status">
        {toastMsg}
      </div>
    </div>
  );
}
