function generateMockPlan(profile) {
    const sport = profile.sport || 'gym';
    const goals = profile.goals || ['performance'];
    // Suportar tanto camelCase (frontend) como snake_case (backend)
    const rawDays = profile.days_per_week || profile.daysPerWeek;
    const nDays = Math.min(parseInt(rawDays) || 5, 7);
    const rawHours = profile.hours_per_session || profile.hoursPerSession;
    const sessionH = parseFloat(rawHours) || 1.5;
    const experience = profile.experience || 'intermediate';
    
    // ═══════════════════════════════════════════════════════════
    // FASES — Descrições específicas por desporto e objetivo
    // ═══════════════════════════════════════════════════════════
    const phases = [
        { id: 1, name: "Fase 1 — Fundações & Adaptação", weeks: "Sem 1-4", focus: "Construção de base de força, estabilização articular e adaptação anatómica." },
        { id: 2, name: "Fase 2 — Desenvolvimento & Força", weeks: "Sem 5-8", focus: "Aumento progressivo de intensidade, pliometria intermédia e força muscular." },
        { id: 3, name: "Fase 3 — Pico de Performance", weeks: "Sem 9-12", focus: "Transferência para velocidade, potência máxima e pico desportivo." }
    ];
    
    if (sport === 'gym' || goals.includes('muscle') || goals.includes('lose_fat')) {
        phases[0].focus = "Hipertrofia geral, volume de treino elevado e adaptação anatómica progressiva.";
        phases[1].focus = "Força máxima, exercícios compostos pesados e periodização ondulatória.";
        phases[2].focus = "Definição muscular, super-séries, drop-sets e alta densidade metabólica.";
    } else if (sport === 'running') {
        phases[0].focus = "Resistência aeróbica de base, fortalecimento de glúteos/core e economia de corrida.";
        phases[1].focus = "Limiar de lactato, treinos de ritmo (tempo), fartlek e força explosiva específica.";
        phases[2].focus = "Velocidade de pico, VO2max, polimento (tapering) e preparação competitiva.";
    } else if (sport === 'basketball') {
        phases[0].focus = "Base de força funcional, coordenação com bola e prevenção de lesões do tornozelo/joelho.";
        phases[1].focus = "Potência explosiva, movimentos de jogo sob pressão e agilidade lateral.";
        phases[2].focus = "Pico atlético, velocidade de reação, simulações competitivas e salto vertical máximo.";
    } else if (sport === 'football') {
        phases[0].focus = "Resistência aeróbica, técnica de bola, equilíbrio e estabilização do core.";
        phases[1].focus = "Velocidade de sprint, passes em pressão, fintas e força muscular integrada.";
        phases[2].focus = "Capacidade de jogo 90min, resistência à fadiga, intensidade competitiva máxima.";
    }

    // ═══════════════════════════════════════════════════════════
    // GYM — Exercícios por fase (periodização real)
    // ═══════════════════════════════════════════════════════════
    const gym = {
        // ── FASE 1: Fundações (Volume alto, reps altas, foco em forma) ──
        push_1: [
            { id: "gp1a", name: "Supino Plano com Halteres", detail: "4 séries x 10-12 reps — Foco em controlo excêntrico (3s a descer)" },
            { id: "gp2a", name: "Press Ombros com Halteres (sentado)", detail: "3 séries x 12 reps — Amplitude completa" },
            { id: "gp3a", name: "Flexões (variação adaptada ao nível)", detail: "3 séries x 12-15 reps — Ativação do core" },
            { id: "gp4a", name: "Aberturas com Halteres (Peck-Deck)", detail: "3 séries x 12-15 reps — Sensação de estiramento" },
            { id: "gp5a", name: "Extensões de Tríceps na Polia", detail: "3 séries x 12-15 reps — Contração máxima no final" },
            { id: "gp6a", name: "Elevações Laterais com Halteres", detail: "3 séries x 15 reps — Peso leve, controlo total" }
        ],
        pull_1: [
            { id: "gl1a", name: "Puxada na Polia Alta (Pegada Larga)", detail: "4 séries x 10-12 reps — Até o queixo passar a barra" },
            { id: "gl2a", name: "Remada Sentado na Máquina", detail: "3 séries x 12 reps — Retração escapular completa" },
            { id: "gl3a", name: "Face Pulls com Corda", detail: "3 séries x 15 reps — Rotação externa no topo" },
            { id: "gl4a", name: "Curl Bíceps Alternado com Halteres", detail: "3 séries x 12 reps/braço — Sem balanço" },
            { id: "gl5a", name: "Remada com Haltere Unilateral", detail: "3 séries x 10 reps/lado — Cotovelo junto ao corpo" },
            { id: "gl6a", name: "Superman Hold Isométrico", detail: "3 séries x 30 segundos — Fortalecer eretores" }
        ],
        legs_1: [
            { id: "gleg1a", name: "Agachamento Goblet com Haltere/Kettlebell", detail: "4 séries x 12 reps — Profundidade paralela" },
            { id: "gleg2a", name: "Romanian Deadlift (RDL) com Halteres", detail: "3 séries x 10-12 reps — Esticar isquiotibiais" },
            { id: "gleg3a", name: "Lunges Estáticos (Afundo)", detail: "3 séries x 10 reps/perna — Joelho não passa o pé" },
            { id: "gleg4a", name: "Leg Press (máquina)", detail: "3 séries x 12 reps — Pés largura dos ombros" },
            { id: "gleg5a", name: "Elevações de Gémeos Bilateral", detail: "4 séries x 15-20 reps — Amplitude total" },
            { id: "gleg6a", name: "Ponte de Glúteos com Barra", detail: "3 séries x 12 reps — Contração de 2s no topo" }
        ],
        core: [
            { id: "gc1", name: "Prancha Abdominal Isométrica", detail: "4 séries x 45 segundos — Corpo alinhado" },
            { id: "gc2", name: "Dead Bug", detail: "3 séries x 10 reps/lado — Costas pressionadas no chão" },
            { id: "gc3", name: "Pallof Press (Anti-Rotação)", detail: "3 séries x 12 reps/lado — Resistir à rotação" },
            { id: "gc4", name: "Bird Dog", detail: "3 séries x 10 reps/lado — Estabilidade da coluna" },
            { id: "gc5", name: "Crunch com Pernas Elevadas", detail: "3 séries x 15 reps — Sem puxar o pescoço" }
        ],

        // ── FASE 2: Desenvolvimento (Cargas moderadas-altas, compostos) ──
        push_2: [
            { id: "gp1b", name: "Supino Inclinado com Barra", detail: "4 séries x 8-10 reps — Progressão de carga semanal" },
            { id: "gp2b", name: "Press Militar com Barra (em pé)", detail: "4 séries x 6-8 reps — Core ativado, sem balanço" },
            { id: "gp3b", name: "Dips nas Paralelas (Lastrado se possível)", detail: "3 séries x 8-10 reps — Inclinação para peito" },
            { id: "gp4b", name: "Aberturas Inclinadas com Halteres", detail: "3 séries x 10-12 reps — Estiramento profundo" },
            { id: "gp5b", name: "Press Arnold com Halteres", detail: "3 séries x 10 reps — Rotação completa" },
            { id: "gp6b", name: "Extensões de Tríceps Overhead", detail: "3 séries x 10-12 reps — Corda na polia ou haltere" }
        ],
        pull_2: [
            { id: "gl1b", name: "Puxadas na Barra Fixa (Pull-ups)", detail: "4 séries x 6-10 reps — Lastrado se > 10 reps" },
            { id: "gl2b", name: "Remada com Barra (Bent-over Row)", detail: "4 séries x 8-10 reps — 45° de inclinação" },
            { id: "gl3b", name: "Face Pulls com Pausa", detail: "3 séries x 12 reps — Pausa de 2s no topo" },
            { id: "gl4b", name: "Hammer Curls com Halteres", detail: "3 séries x 10-12 reps — Foco no braquial" },
            { id: "gl5b", name: "Pullover com Haltere", detail: "3 séries x 12 reps — Expansão torácica" },
            { id: "gl6b", name: "Shrugs com Barra ou Halteres", detail: "3 séries x 12-15 reps — Contração no topo" }
        ],
        legs_2: [
            { id: "gleg1b", name: "Agachamento com Barra (Back Squat)", detail: "4 séries x 6-8 reps — Abaixo do paralelo" },
            { id: "gleg2b", name: "Romanian Deadlift com Barra", detail: "4 séries x 8-10 reps — Carga progressiva" },
            { id: "gleg3b", name: "Agachamento Búlgaro com Halteres", detail: "3 séries x 8 reps/perna — Amplitude total" },
            { id: "gleg4b", name: "Leg Curl (Máquina)", detail: "3 séries x 10-12 reps — Contração excêntrica lenta" },
            { id: "gleg5b", name: "Elevações de Gémeos Unilateral c/ Peso", detail: "4 séries x 12-15 reps — Excêntrica de 3s" },
            { id: "gleg6b", name: "Hip Thrust com Barra", detail: "4 séries x 10 reps — Contração glúteo máximo" }
        ],

        // ── FASE 3: Pico de Performance (Potência, cargas altas, explosividade) ──
        push_3: [
            { id: "gp1c", name: "Supino Plano com Barra (Pesado)", detail: "5 séries x 4-6 reps — Próximo do 1RM, descanso 3min" },
            { id: "gp2c", name: "Push Press com Barra (Explosivo)", detail: "4 séries x 5-6 reps — Usar impulsão das pernas" },
            { id: "gp3c", name: "Flexões Pliométricas (Clap Push-ups)", detail: "3 séries x 8-10 reps — Máxima velocidade" },
            { id: "gp4c", name: "Dips Lastrados (Pesado)", detail: "3 séries x 6-8 reps — Progressão de carga" },
            { id: "gp5c", name: "Supino Inclinado com Halteres (Drop-set)", detail: "3 séries x 8+8+8 reps — Reduzir peso 3x" },
            { id: "gp6c", name: "Extensões de Tríceps c/ Barra EZ", detail: "3 séries x 8-10 reps — Skull Crushers" }
        ],
        pull_3: [
            { id: "gl1c", name: "Pull-ups Lastrados (Pesado)", detail: "4 séries x 4-6 reps — Cinto c/ peso, descanso 3min" },
            { id: "gl2c", name: "Remada Pendlay com Barra", detail: "4 séries x 5-6 reps — Explosiva desde o chão" },
            { id: "gl3c", name: "Remada Unilateral com Haltere Pesado", detail: "3 séries x 6-8 reps/lado — Potência máxima" },
            { id: "gl4c", name: "Chin-ups (Pegada Supinada)", detail: "3 séries x 8-10 reps — Foco em bíceps + costas" },
            { id: "gl5c", name: "Face Pulls c/ Rotação Externa", detail: "3 séries x 12-15 reps — Saúde do ombro" },
            { id: "gl6c", name: "Curl com Barra EZ (Pesado)", detail: "3 séries x 8-10 reps — Cheating controlado" }
        ],
        legs_3: [
            { id: "gleg1c", name: "Back Squat Pesado", detail: "5 séries x 3-5 reps — 85-90% 1RM, descanso 3-4min" },
            { id: "gleg2c", name: "Trap Bar Deadlift", detail: "4 séries x 4-6 reps — Potência de quadril" },
            { id: "gleg3c", name: "Step-ups Explosivos com Halteres", detail: "3 séries x 8 reps/perna — Subida rápida" },
            { id: "gleg4c", name: "Nordic Hamstring Curl", detail: "3 séries x 6-8 reps — Controlo excêntrico" },
            { id: "gleg5c", name: "Agachamento com Salto (Jump Squat)", detail: "4 séries x 6 reps — 30% do 1RM do squat" },
            { id: "gleg6c", name: "Elevações de Gémeos c/ Salto", detail: "4 séries x 10-12 reps — Contacto rápido" }
        ]
    };

    // Equipamento adaptado
    const equip = (profile.equipment || 'ginásio completo').toLowerCase();
    if (equip === 'peso corporal' || equip === 'mínimo') {
        // Substituir exercícios com barra por peso corporal
        gym.push_1 = [
            { id: "gp1a", name: "Flexões Standard", detail: "4 séries x 12-15 reps — Corpo rígido" },
            { id: "gp2a", name: "Pike Push-ups (Ombros)", detail: "3 séries x 10-12 reps — Elevação de pés" },
            { id: "gp3a", name: "Flexões Diamante (Tríceps)", detail: "3 séries x 10-12 reps — Mãos juntas" },
            { id: "gp4a", name: "Dips em Cadeira/Banco", detail: "3 séries x 12-15 reps — Sem carga adicional" },
            { id: "gp5a", name: "Flexões Inclinadas (Peito superior)", detail: "3 séries x 12 reps — Pés elevados 30cm" },
            { id: "gp6a", name: "Flexões em Y (Ombro anterior)", detail: "3 séries x 10 reps — Braços em Y no chão" }
        ];
        gym.push_2 = [
            { id: "gp1b", name: "Flexões Archer (Unilateral)", detail: "4 séries x 6-8 reps/lado — Progressão de força" },
            { id: "gp2b", name: "Pike Push-ups Elevados", detail: "3 séries x 8-10 reps — Pés em banco" },
            { id: "gp3b", name: "Pseudo Planche Push-ups", detail: "3 séries x 8-10 reps — Mãos viradas para trás" },
            { id: "gp4b", name: "Dips entre Cadeiras (Pesado)", detail: "3 séries x 10-12 reps — Mochila com peso" },
            { id: "gp5b", name: "Flexões Explosivas (mãos saem do chão)", detail: "3 séries x 8 reps — Velocidade máxima" },
            { id: "gp6b", name: "Flexões de Tríceps c/ Mãos Juntas", detail: "3 séries x 10-12 reps — Extensão completa" }
        ];
        gym.push_3 = [
            { id: "gp1c", name: "One Arm Push-up (Progressão)", detail: "4 séries x 3-5 reps/lado — Elevação gradual" },
            { id: "gp2c", name: "Handstand Push-ups (Parede)", detail: "4 séries x 5-8 reps — Controlo total" },
            { id: "gp3c", name: "Flexões Pliométricas (Clap)", detail: "3 séries x 8 reps — Potência máxima" },
            { id: "gp4c", name: "Dips c/ Mochila Lastrada", detail: "3 séries x 8-10 reps — Progressão de peso" },
            { id: "gp5c", name: "Flexões Hindú", detail: "3 séries x 12 reps — Movimento fluido" },
            { id: "gp6c", name: "Flexões em L-sit", detail: "3 séries x 6-8 reps — Core + tríceps" }
        ];
        gym.pull_1 = [
            { id: "gl1a", name: "Remada Invertida (Barra baixa / Mesa)", detail: "4 séries x 10-12 reps — Corpo rígido" },
            { id: "gl2a", name: "Superman Hold Dinâmico", detail: "3 séries x 12 reps — Elevar braços e pernas" },
            { id: "gl3a", name: "Band Pull-aparts", detail: "3 séries x 15-20 reps — Banda elástica" },
            { id: "gl4a", name: "Curl de Bíceps com Toalha + Mochila", detail: "3 séries x 12 reps — Isométrico + dinâmico" },
            { id: "gl5a", name: "YTW no Chão (Costas)", detail: "3 séries x 10 reps/posição — Retração escapular" },
            { id: "gl6a", name: "Reverse Snow Angels", detail: "3 séries x 12 reps — Fortalecer rombóides" }
        ];
        gym.pull_2 = [
            { id: "gl1b", name: "Pull-ups (Barra de porta ou parque)", detail: "4 séries x 6-10 reps — Progressão com elástico" },
            { id: "gl2b", name: "Remada Invertida Avançada (pés elevados)", detail: "3 séries x 10 reps — Pés em banco" },
            { id: "gl3b", name: "Face Pulls com Banda Elástica", detail: "3 séries x 15 reps — Rotação externa" },
            { id: "gl4b", name: "Chin-ups (Pegada supinada)", detail: "3 séries x 6-8 reps — Foco bíceps" },
            { id: "gl5b", name: "Remada com Banda Elástica", detail: "3 séries x 12 reps — Contração escapular" },
            { id: "gl6b", name: "Isometric Towel Curl", detail: "3 séries x 20 segundos — Tensão máxima" }
        ];
        gym.pull_3 = [
            { id: "gl1c", name: "Pull-ups Lastrados (Mochila)", detail: "4 séries x 4-6 reps — Adicionar peso gradual" },
            { id: "gl2c", name: "Muscle-up Negativos", detail: "3 séries x 3-5 reps — Controlo excêntrico 5s" },
            { id: "gl3c", name: "Archer Rows (Remada Unilateral)", detail: "3 séries x 6-8 reps/lado — Máxima tensão" },
            { id: "gl4c", name: "L-sit Pull-ups", detail: "3 séries x 5-6 reps — Core + costas" },
            { id: "gl5c", name: "Typewriter Pull-ups", detail: "3 séries x 4-5 reps/lado — Força avançada" },
            { id: "gl6c", name: "Banda Elástica Curl (Pesada)", detail: "3 séries x 10-12 reps — Tensão constante" }
        ];
        gym.legs_1 = [
            { id: "gleg1a", name: "Agachamento Pistol Assistido", detail: "3 séries x 6-8 reps/perna — Segura numa porta" },
            { id: "gleg2a", name: "Ponte de Glúteos Unilateral", detail: "3 séries x 12 reps/perna — Contração de 2s" },
            { id: "gleg3a", name: "Lunges Retrógrados", detail: "3 séries x 10 reps/perna — Passos longos" },
            { id: "gleg4a", name: "Wall Sit Isométrico", detail: "4 séries x 45-60 segundos — Coxas paralelas" },
            { id: "gleg5a", name: "Elevações de Gémeos Unilateral", detail: "4 séries x 20 reps — Degrau/elevação" },
            { id: "gleg6a", name: "Step-ups no Banco", detail: "3 séries x 10 reps/perna — Banco ou cadeira" }
        ];
        gym.legs_2 = [
            { id: "gleg1b", name: "Pistol Squat Completo", detail: "4 séries x 5-6 reps/perna — Sem assistência" },
            { id: "gleg2b", name: "Agachamento Búlgaro (Peso Corporal)", detail: "4 séries x 10 reps/perna — Banco atrás" },
            { id: "gleg3b", name: "Nordic Hamstring Curl (Progressão)", detail: "3 séries x 5-6 reps — Excêntrica controlada" },
            { id: "gleg4b", name: "Skater Squats", detail: "3 séries x 8 reps/perna — Equilíbrio + força" },
            { id: "gleg5b", name: "Calf Raise Excêntrico (Escada)", detail: "4 séries x 15 reps — Descida de 5s" },
            { id: "gleg6b", name: "Glute Ham Raise Improvisado", detail: "3 séries x 6-8 reps — Pés fixos" }
        ];
        gym.legs_3 = [
            { id: "gleg1c", name: "Pistol Squat Explosivo", detail: "4 séries x 4-5 reps/perna — Saltar do fundo" },
            { id: "gleg2c", name: "Agachamento Búlgaro c/ Mochila", detail: "4 séries x 8 reps/perna — Carga adicionada" },
            { id: "gleg3c", name: "Jump Squats (Máxima altura)", detail: "4 séries x 8 reps — Aterragem suave" },
            { id: "gleg4c", name: "Nordic Curl Completo", detail: "3 séries x 6-8 reps — Sem assistência" },
            { id: "gleg5c", name: "Single Leg Bounds", detail: "3 séries x 6 reps/perna — Potência horizontal" },
            { id: "gleg6c", name: "Calf Raise Pliométrico", detail: "4 séries x 12 reps — Contacto rápido" }
        ];
    } else if (equip === 'home gym') {
        gym.push_1 = [
            { id: "gp1a", name: "Supino com Halteres no Chão", detail: "4 séries x 10-12 reps — Controlo excêntrico" },
            { id: "gp2a", name: "Press Ombros com Halteres (sentado)", detail: "3 séries x 12 reps — Amplitude completa" },
            { id: "gp3a", name: "Flexões com Elevação", detail: "3 séries x 12-15 reps — Mãos em halteres" },
            { id: "gp4a", name: "Aberturas com Halteres", detail: "3 séries x 12-15 reps — Braços ligeiramente fletidos" },
            { id: "gp5a", name: "Kickbacks de Tríceps", detail: "3 séries x 12 reps/braço — Contração máxima" },
            { id: "gp6a", name: "Elevações Laterais com Halteres", detail: "3 séries x 15 reps — Sem momentum" }
        ];
        // Fase 2 e 3 usam as versões padrão (ginásio completo) pois home gym terá pesos suficientes
    }

    // Exercícios de corrida (adaptação das pernas)
    if (sport === 'running') {
        gym.legs_1 = [
            { id: "gleg1a", name: "Agachamento Goblet c/ Haltere", detail: "3 séries x 12 reps — Foco em glúteos" },
            { id: "gleg2a", name: "Elevações de Gémeos (Foco em Sóleo)", detail: "4 séries x 15-20 reps — Joelhos fletidos" },
            { id: "gleg3a", name: "Ponte de Glúteos Unilateral", detail: "3 séries x 12 reps/perna — Estabilização pélvica" },
            { id: "gleg4a", name: "Lunges Dinâmicos Retrógrados", detail: "3 séries x 10 reps/perna — Passos longos" },
            { id: "gleg5a", name: "Step-ups c/ Joelho Alto", detail: "3 séries x 10 reps/perna — Impulso do glúteo" },
            { id: "gleg6a", name: "Clamshells com Banda Elástica", detail: "3 séries x 15 reps/lado — Ativação do glúteo médio" }
        ];
        gym.legs_2 = [
            { id: "gleg1b", name: "Back Squat (Moderado)", detail: "4 séries x 8-10 reps — 70% 1RM, sem excesso" },
            { id: "gleg2b", name: "RDL Unilateral com Haltere", detail: "3 séries x 8 reps/perna — Equilíbrio + isquiotibiais" },
            { id: "gleg3b", name: "Agachamento Búlgaro", detail: "3 séries x 8 reps/perna — Amplitude total" },
            { id: "gleg4b", name: "Leg Curl (Máquina ou Bola Suíça)", detail: "3 séries x 12 reps — Contração lenta" },
            { id: "gleg5b", name: "Calf Raise Excêntrico Unilateral", detail: "4 séries x 12 reps — Descida de 4s (prevenir fasceíte)" },
            { id: "gleg6b", name: "Monster Walks com Banda", detail: "3 séries x 20 passos — Ativação glúteo médio" }
        ];
        gym.legs_3 = [
            { id: "gleg1c", name: "Agachamento com Salto (Jump Squat)", detail: "4 séries x 6 reps — 20% 1RM, explosivo" },
            { id: "gleg2c", name: "Step-ups Explosivos em Banco Alto", detail: "3 séries x 6 reps/perna — Subida máxima" },
            { id: "gleg3c", name: "Nordic Hamstring Curl", detail: "3 séries x 5-6 reps — Prevenção de lesões" },
            { id: "gleg4c", name: "Single Leg Bounds (Saltos unipodais)", detail: "3 séries x 8 reps/perna — Potência horizontal" },
            { id: "gleg5c", name: "Pogo Hops (Tornozelo)", detail: "4 séries x 20 reps — Rigidez reactiva" },
            { id: "gleg6c", name: "Box Jumps (Baixo)", detail: "3 séries x 8 reps — Aterragem suave" }
        ];
    }

    // ═══════════════════════════════════════════════════════════
    // SKILL — Exercícios técnicos por fase e desporto
    // ═══════════════════════════════════════════════════════════
    let skill = {};
    if (sport === 'basketball') {
        skill = {
            dribble_1: [
                { id: "sk1a", name: "Manipulação de Bola Estática", detail: "15 min — Crossovers, behind-the-back e wraps parados" },
                { id: "sk2a", name: "Dribble com 2 Bolas (Coordenação)", detail: "10 min — Driblar alto/baixo, alternado" }
            ],
            dribble_2: [
                { id: "sk1b", name: "Dribble sob Pressão / Cones", detail: "15 min — Mudanças de direção explosivas com defensor passivo" },
                { id: "sk2b", name: "Hesitation + Crossover Explosivo", detail: "12 min — Simulação de 1v1 com hesitação" }
            ],
            dribble_3: [
                { id: "sk1c", name: "Dribble em Velocidade Total (Full Court)", detail: "15 min — Sprint com bola, fintas em velocidade" },
                { id: "sk2c", name: "Combo Moves: Hesitation-Cross-Behind", detail: "12 min — Sequências de 3+ movimentos" }
            ],
            shooting_1: [
                { id: "sk3a", name: "Lançamento de Forma (Close Range)", detail: "20 min — 100 lançamentos a 3-4 metros" },
                { id: "sk4a", name: "Lance Livre (Mecânica)", detail: "15 min — 50 lances, foco na rotação" }
            ],
            shooting_2: [
                { id: "sk3b", name: "Catch & Shoot de 5 Posições", detail: "20 min — 100 convertidos de zonas variadas" },
                { id: "sk4b", name: "Pull-up Jumper (Após Dribble)", detail: "15 min — 50 convertidos mid-range" }
            ],
            shooting_3: [
                { id: "sk3c", name: "Lançamento de 3 Pontos (Off-Screen)", detail: "20 min — Saída de bloqueio + lançamento" },
                { id: "sk4c", name: "Step-back 3 (Isolamento)", detail: "15 min — Criar espaço + lançar em fadiga" }
            ],
            finishing_1: [
                { id: "sk5a", name: "Lay-ups com Ambas as Mãos", detail: "15 min — 10 esquerdos, 10 direitos" },
                { id: "sk6a", name: "Power Finish (Contacto Leve)", detail: "12 min — Finalizar com corpo do defensor" }
            ],
            finishing_2: [
                { id: "sk5b", name: "Eurostep + Floater", detail: "15 min — Variações à volta do defensor" },
                { id: "sk6b", name: "Finalizações com Contacto Pesado", detail: "15 min — Almofada + finalização" }
            ],
            finishing_3: [
                { id: "sk5c", name: "Reverse Lay-ups + Scoop Finish", detail: "15 min — Finalizar por baixo do aro" },
                { id: "sk6c", name: "And-1 Finishes (Absorver + Converter)", detail: "12 min — Simulação de falta + lançamento" }
            ],
            pickup_1: [
                { id: "sk7a", name: "Jogo Coletivo Leve (3v3 Half Court)", detail: "30 min — Foco em execução de jogadas" },
                { id: "sk8a", name: "Situações de 1v1 (Controlo)", detail: "15 min — Sem forçar, ler o defensor" }
            ],
            pickup_2: [
                { id: "sk7b", name: "Jogo 5v5 (Intensidade Média)", detail: "40 min — Aplicar skills treinados" },
                { id: "sk8b", name: "1v1 Competitivo King of the Court", detail: "20 min — Vencer = ficar" }
            ],
            pickup_3: [
                { id: "sk7c", name: "5v5 Intensidade Total (Simulação de Jogo)", detail: "45 min — Ritmo de jogo oficial" },
                { id: "sk8c", name: "Torneio 3v3 Competitivo", detail: "30 min — Séries de eliminação" }
            ]
        };
    } else if (sport === 'football') {
        skill = {
            dribble_1: [
                { id: "sk1a", name: "Condução de Bola (Slalom Lento)", detail: "15 min — Ambas as superfícies, controlo total" },
                { id: "sk2a", name: "Receção e Controlo Orientado", detail: "10 min — Controlo de passe rasteiro e aéreo" }
            ],
            dribble_2: [
                { id: "sk1b", name: "Slalom em Velocidade + Fintas", detail: "15 min — Fintas de corpo com mudança de ritmo" },
                { id: "sk2b", name: "Condução com Oposição Passiva", detail: "12 min — 1v1 com defensor a 50%" }
            ],
            dribble_3: [
                { id: "sk1c", name: "Dribble em Espaço Reduzido (Rondo)", detail: "15 min — Manter posse em 5x2 / 4v1" },
                { id: "sk2c", name: "Fintas + Aceleração (Match Intensity)", detail: "12 min — Simulação de jogo real" }
            ],
            shooting_1: [
                { id: "sk3a", name: "Remates à Baliza (Pé Dominante)", detail: "20 min — 30 remates de dentro da área" },
                { id: "sk4a", name: "Passes Curtos de Precisão (10-15m)", detail: "15 min — 2 toques máximo" }
            ],
            shooting_2: [
                { id: "sk3b", name: "Remates de Fora da Área", detail: "20 min — Colocação e potência" },
                { id: "sk4b", name: "Passes Longos de Precisão (30m+)", detail: "15 min — Pé não dominante incluído" }
            ],
            shooting_3: [
                { id: "sk3c", name: "Remates de Primeira (Cruzamento + Finalizar)", detail: "20 min — Velocidade de decisão" },
                { id: "sk4c", name: "Livre Direto + Cantos", detail: "15 min — Bolas paradas com colocação" }
            ],
            finishing_1: [
                { id: "sk5a", name: "Finalização 1v0 (Deslocamento)", detail: "15 min — Corrida + remate colocado" },
                { id: "sk6a", name: "Cruzamentos Rasteiros + Finalização", detail: "12 min — Atacar o 1º poste" }
            ],
            finishing_2: [
                { id: "sk5b", name: "Desmarcações Rápidas (Timing)", detail: "15 min — Leitura do passe + corrida" },
                { id: "sk6b", name: "Cabeceamento (Bola aérea)", detail: "15 min — Impulsão + direção" }
            ],
            finishing_3: [
                { id: "sk5c", name: "Finalização em Superioridade (2v1, 3v2)", detail: "15 min — Decisão rápida" },
                { id: "sk6c", name: "1v1 Contra Guarda-Redes", detail: "12 min — Dribble + finalização fria" }
            ],
            pickup_1: [
                { id: "sk7a", name: "Jogo Treino (Campo Reduzido)", detail: "30 min — Posse de bola, transições" },
                { id: "sk8a", name: "Exercícios de Transição (4v3)", detail: "15 min — Contra-ataque rápido" }
            ],
            pickup_2: [
                { id: "sk7b", name: "Jogo 7v7 (Meio-Campo)", detail: "40 min — Organização tática" },
                { id: "sk8b", name: "Treino de Pressing (5v5)", detail: "20 min — Pressão alta coordenada" }
            ],
            pickup_3: [
                { id: "sk7c", name: "Jogo 11v11 (Simulação de Jogo)", detail: "45 min — Ritmo de jogo oficial" },
                { id: "sk8c", name: "Treino Tático Posicional", detail: "25 min — Movimentação da equipa" }
            ]
        };
    } else if (sport === 'running') {
        skill = {
            dribble_1: [
                { id: "sk1a", name: "Running Drills (Técnica Básica)", detail: "15 min — A-Skip, B-Skip, calcanhar-glúteo" },
                { id: "sk2a", name: "Escada de Agilidade (Coordenação)", detail: "10 min — Padrões básicos de pés" }
            ],
            dribble_2: [
                { id: "sk1b", name: "Running Drills Avançados", detail: "15 min — High Knees, Cariocas, bounding" },
                { id: "sk2b", name: "Strides (Acelerações de 100m)", detail: "8x100m — 85% de velocidade máxima" }
            ],
            dribble_3: [
                { id: "sk1c", name: "Sprint Drills (Técnica de Sprint)", detail: "15 min — Saídas explosivas, aceleração" },
                { id: "sk2c", name: "Wind Sprints (Velocidade)", detail: "6x150m — 95% de intensidade" }
            ],
            shooting_1: [
                { id: "sk3a", name: "Treino de Cadência (170-175 ppm)", detail: "20 min — Metrónomo para ritmo de pés" },
                { id: "sk4a", name: "Corrida em Subida Leve", detail: "6x30s subida + descanso — Potência de quadril" }
            ],
            shooting_2: [
                { id: "sk3b", name: "Treino de Cadência (175-180 ppm)", detail: "25 min — Otimizar economia de corrida" },
                { id: "sk4b", name: "Hill Repeats (Subidas Repetidas)", detail: "8x45s subida forte — Construir potência" }
            ],
            shooting_3: [
                { id: "sk3c", name: "Cadência em Velocidade (180+ ppm)", detail: "20 min — Manter em ritmo de competição" },
                { id: "sk4c", name: "Hill Sprints (Explosividade)", detail: "6x20s sprint máximo — Inclinação de 8-10%" }
            ],
            finishing_1: [
                { id: "sk5a", name: "Fartlek Leve (Variação de Ritmo)", detail: "25 min — 2min forte / 3min leve" },
                { id: "sk6a", name: "Tempo Run Introdutório", detail: "20 min — Ritmo que dá para falar com esforço" }
            ],
            finishing_2: [
                { id: "sk5b", name: "Fartlek Intermédio", detail: "30 min — 3min forte / 2min leve" },
                { id: "sk6b", name: "Intervalado 4x800m", detail: "800m a ritmo de limiar — Descanso 2min" }
            ],
            finishing_3: [
                { id: "sk5c", name: "VO2max Intervals (5x1000m)", detail: "1000m a ritmo de 5K — Descanso 3min" },
                { id: "sk6c", name: "Lactate Threshold Run", detail: "25 min contínuo a ritmo de limiar" }
            ],
            pickup_1: [
                { id: "sk7a", name: "Corrida Longa de Base (LSD)", detail: "40-50 min — Ritmo confortável, conversacional" },
                { id: "sk8a", name: "Easy Run (Recuperação Ativa)", detail: "25 min — Zona 2, relaxado" }
            ],
            pickup_2: [
                { id: "sk7b", name: "Corrida Longa Progressiva", detail: "50-60 min — Último 20% mais rápido" },
                { id: "sk8b", name: "Tempo Run Sustentado", detail: "30 min — Ritmo de meia-maratona" }
            ],
            pickup_3: [
                { id: "sk7c", name: "Corrida Longa com Simulação de Prova", detail: "60-75 min — Incluir 20min a ritmo de prova" },
                { id: "sk8c", name: "Race Pace Run (Ritmo de Competição)", detail: "25 min — Ritmo objetivo da prova" }
            ]
        };
    } else {
        // Gym / Custom sport
        skill = {
            dribble_1: [
                { id: "sk1a", name: "Mobilidade Articular Completa", detail: "15 min — Ombros, anca, tornozelos, coluna" },
                { id: "sk2a", name: "Técnica de Agachamento com Vara", detail: "10 min — Alinhamento e profundidade" }
            ],
            dribble_2: [
                { id: "sk1b", name: "Mobilidade Torácica Avançada", detail: "15 min — Cat-cow, rotação, extensão" },
                { id: "sk2b", name: "Técnica de Peso Morto com Carga Leve", detail: "12 min — Padrão de hip hinge" }
            ],
            dribble_3: [
                { id: "sk1c", name: "Complexo de Mobilidade Dinâmica", detail: "15 min — World's Greatest Stretch + variações" },
                { id: "sk2c", name: "Técnica de Clean & Press (Leve)", detail: "12 min — Coordenação de potência" }
            ],
            shooting_1: [
                { id: "sk3a", name: "Cardio LISS (Passadeira Inclinada)", detail: "20 min — Inclinação 8%, ritmo moderado" },
                { id: "sk4a", name: "Remo Ergómetro (Steady State)", detail: "15 min — Ritmo constante, foco na técnica" }
            ],
            shooting_2: [
                { id: "sk3b", name: "Cardio em Intervalos (Bicicleta)", detail: "20 min — 30s forte / 90s leve" },
                { id: "sk4b", name: "Treino de Força Explosiva (Kettlebell Swings)", detail: "15 min — 10 reps EMOM" }
            ],
            shooting_3: [
                { id: "sk3c", name: "HIIT em Assault Bike", detail: "15 min — 20s all-out / 40s leve, 12 rondas" },
                { id: "sk4c", name: "Complexo com Barra (Bear Complex)", detail: "12 min — Clean+Front Squat+Press+Back Squat+Press" }
            ],
            finishing_1: [
                { id: "sk5a", name: "Tempo Training (Excêntrica Lenta)", detail: "15 min — 4s descer em cada rep" },
                { id: "sk6a", name: "Farmer Walk (Core Funcional)", detail: "4x30 metros — Carga pesada, postura perfeita" }
            ],
            finishing_2: [
                { id: "sk5b", name: "Super-séries Antagonistas", detail: "15 min — Push+Pull sem descanso" },
                { id: "sk6b", name: "Sled Push / Sled Pull", detail: "4x20 metros — Potência de pernas" }
            ],
            finishing_3: [
                { id: "sk5c", name: "Drop-sets em Máquinas", detail: "15 min — 3 reduções de peso por set" },
                { id: "sk6c", name: "Loaded Carry Complex", detail: "12 min — Farmer + Waiter + Rack Walk" }
            ],
            pickup_1: [
                { id: "sk7a", name: "Metcon Leve (AMRAP 15min)", detail: "5 Burpees + 10 KB Swings + 15 Air Squats" },
                { id: "sk8a", name: "Treino Tabata (4 exercícios)", detail: "16 min — 20s trabalho / 10s descanso" }
            ],
            pickup_2: [
                { id: "sk7b", name: "Metcon EMOM 20min", detail: "Min 1: 12 KB Swings, Min 2: 8 Burpees, Min 3: 15 Box Jumps, Min 4: Descanso" },
                { id: "sk8b", name: "Circuit Training (6 estações)", detail: "3 rondas x 45s/estação — Descanso 15s" }
            ],
            pickup_3: [
                { id: "sk7c", name: "CrossFit WOD Benchmark ('Cindy')", detail: "AMRAP 20min: 5 Pull-ups + 10 Push-ups + 15 Air Squats" },
                { id: "sk8c", name: "Chipper Workout", detail: "For Time: 50 DU + 40 KB Swings + 30 Box Jumps + 20 Burpees + 10 Clean&Jerks" }
            ]
        };
    }

    // ═══════════════════════════════════════════════════════════
    // VERT — Pliometria por fase
    // ═══════════════════════════════════════════════════════════
    const vert = {
        "1": [
            { id: "v1a", name: "Wall Sit Isométrico (Parede)", detail: "5x45s — Construir resistência do tendão patelar" },
            { id: "v2a", name: "Ankle Hops (Saltos de Tornozelo)", detail: "3x20 reps — Rigidez do tendão de Aquiles" },
            { id: "v3a", name: "Elevação de Gémeos Excêntrica", detail: "4x12 reps — Descida de 5s, foco no sóleo" },
            { id: "v4a", name: "Pogo Jumps (Baixa Intensidade)", detail: "3x15 reps — Contacto rápido, tornozelos rígidos" }
        ],
        "2": [
            { id: "v1b", name: "Box Jumps (Caixa Média-Alta)", detail: "4x5 saltos — Aterragem suave, subir de pé" },
            { id: "v2b", name: "Broad Jumps (Saltos Horizontais)", detail: "4x4 reps — Extensão total de quadril" },
            { id: "v3b", name: "Bounds Laterais", detail: "3x6/lado — Estabilização unipodal na aterragem" },
            { id: "v4b", name: "Tuck Jumps", detail: "3x8 reps — Joelhos ao peito no ar" }
        ],
        "3": [
            { id: "v1c", name: "Depth Jumps (Saltos de Queda)", detail: "4x4 saltos — Caixa de 40-60cm, contacto rápido (< 0.2s)" },
            { id: "v2c", name: "Approach Jumps (Salto de Basquetebol)", detail: "4x5 reps — 2 passos + salto máximo, esforço 100%" },
            { id: "v3c", name: "Sprint + Salto Explosivo", detail: "6x1 salto — Sprint de 10m + salto vertical máximo" },
            { id: "v4c", name: "Reactive Depth Jumps", detail: "3x4 reps — Queda + salto + queda + salto (duplo)" }
        ]
    };

    // ═══════════════════════════════════════════════════════════
    // REC — Recuperação
    // ═══════════════════════════════════════════════════════════
    const rec = [
        { id: "r1", label: "Massagem com Foam Roller — Quadriceps, Gémeos, Banda IT, Glúteos (8 min)" },
        { id: "r2", label: "Alongamentos Estáticos Passivos — Isquiotibiais, quadril, ombros (12 min)" },
        { id: "r3", label: "Gelo/Crioterapia na zona de maior fadiga (15 min)" },
        { id: "r4", label: "Banho de Contraste — 1min frio / 2min quente, 4 ciclos" },
        { id: "r5", label: "Respiração Diafragmática — 5 min, box breathing (4-4-4-4)" },
        { id: "r6", label: "Libertação Miofascial com Bola de Lacrosse — Planta do pé, glúteos (8 min)" }
    ];

    // ═══════════════════════════════════════════════════════════
    // MEALS — Nutrição adaptada aos objetivos
    // ═══════════════════════════════════════════════════════════
    const isFatLoss = goals.includes('lose_fat');
    const isMuscle = goals.includes('muscle');
    
    const meals = isFatLoss ? [
        { id: "m1", label: "Pequeno-almoço", desc: "3 claras + 1 ovo inteiro mexidos, 40g de aveia cozida em água, punhado de morangos. Café preto sem açúcar." },
        { id: "m2", label: "Lanche Manhã", desc: "Iogurte grego 0% (150g) com canela e 5 amêndoas. Chá verde." },
        { id: "m3", label: "Almoço", desc: "150g de peito de frango grelhado, salada verde grande (rúcula, tomate, pepino), 80g de arroz integral. Azeite (1 colher de sopa)." },
        { id: "m4", label: "Lanche Tarde (Pré-treino)", desc: "1 banana média + 15g de manteiga de amendoim. Consumir 60-90min antes do treino." },
        { id: "m5", label: "Jantar (Pós-treino)", desc: "150g de salmão grelhado ou pescada, brócolos e courgette salteados, 100g de batata-doce assada." },
        { id: "m6", label: "Ceia", desc: "200g de queijo quark ou cottage com canela. Evitar hidratos simples." }
    ] : isMuscle ? [
        { id: "m1", label: "Pequeno-almoço", desc: "80g de papas de aveia com 30g de whey, 1 banana fatiada, 1 colher de sopa de manteiga de amendoim. 3 ovos inteiros mexidos." },
        { id: "m2", label: "Lanche Manhã", desc: "Batido: 300ml de leite, 1 banana, 30g de aveia, 30g de whey. Punhado de nozes." },
        { id: "m3", label: "Almoço", desc: "200g de bife de frango ou peru, 200g de arroz basmati, brócolos e cenoura. Azeite generoso." },
        { id: "m4", label: "Lanche Tarde (Pré-treino)", desc: "2 fatias de pão integral com 2 ovos cozidos e abacate. 1 fruta. Consumir 90min antes." },
        { id: "m5", label: "Jantar (Pós-treino)", desc: "200g de carne magra picada (vaca ou peru), 200g de batata-doce, espinafres salteados com alho. 30g de whey em água." },
        { id: "m6", label: "Ceia", desc: "250g de queijo quark com 30g de caseína, nozes e canela. Manter anabolismo noturno." }
    ] : [
        { id: "m1", label: "Pequeno-almoço", desc: "60g de aveia com fruta fresca (banana ou morangos), 3 ovos inteiros (mexidos ou cozidos). Café ou chá." },
        { id: "m2", label: "Lanche Manhã", desc: "Iogurte grego com granola caseira e mel. 1 peça de fruta." },
        { id: "m3", label: "Almoço", desc: "180g de proteína magra (frango, peixe ou tofu), 150g de arroz ou quinoa, legumes variados salteados." },
        { id: "m4", label: "Lanche Tarde (Pré-treino)", desc: "1 banana com manteiga de amendoim, ou barra de proteína. Consumir 60-90min antes do treino." },
        { id: "m5", label: "Jantar (Pós-treino)", desc: "180g de salmão ou frango, 150g de batata-doce ou arroz, salada verde com azeite e limão." },
        { id: "m6", label: "Ceia", desc: "200g de queijo cottage ou quark com canela. Opcional: punhado pequeno de nozes." }
    ];

    // ═══════════════════════════════════════════════════════════
    // SUPPS — Suplementação
    // ═══════════════════════════════════════════════════════════
    const supps = [
        { id: "sp1", label: "Colagénio + Vitamina C", desc: "15g colagénio hidrolisado + 50mg Vit. C — 30-60 min ANTES do treino (saúde do tendão)", star: true },
        { id: "sp2", label: "Creatina Monohidratada", desc: "5g por dia a qualquer hora (potência, força, recuperação muscular)", star: goals.includes('vertical') || goals.includes('performance') || goals.includes('muscle') },
        { id: "sp3", label: "Proteína Whey", desc: "25-30g pós-treino ou como lanche prático (síntese proteica)", star: false },
        { id: "sp4", label: "Magnésio (Bisglicinato)", desc: "300-400mg antes de dormir (qualidade do sono, recuperação muscular)", star: true },
        { id: "sp5", label: "Vitamina D3 + K2", desc: "2000-4000 UI de D3 + 100μg K2 por dia (saúde óssea, imunidade, energia)", star: true },
        { id: "sp6", label: "Ómega-3 (EPA/DHA)", desc: "2-3g por dia com refeição (anti-inflamatório, saúde articular e cerebral)", star: false },
        { id: "sp7", label: "Cafeína (Pré-treino)", desc: "100-200mg 30min antes do treino (foco, performance). Evitar após as 15h.", star: false }
    ];

    // ═══════════════════════════════════════════════════════════
    // DAY PLAN — Distribuição semanal
    // ═══════════════════════════════════════════════════════════
    const dayNames = [
        { day: "2ª", label: "Segunda", icon: "💪" },
        { day: "3ª", label: "Terça", icon: "💪" },
        { day: "4ª", label: "Quarta", icon: "🧘" },
        { day: "5ª", label: "Quinta", icon: "💪" },
        { day: "6ª", label: "Sexta", icon: "💪" },
        { day: "Sáb", label: "Sábado", icon: "⚡" },
        { day: "Dom", label: "Domingo", icon: "🔴" }
    ];

    const getIsRest = (di, n) => {
        if (n === 2) return di !== 1 && di !== 4;
        if (n === 3) return di !== 0 && di !== 2 && di !== 4;
        if (n === 4) return di !== 0 && di !== 1 && di !== 3 && di !== 4;
        if (n === 5) return di === 2 || di === 6;
        if (n === 6) return di === 6;
        if (n === 7) return false;
        return di === 2 || di === 6;
    };

    const sportIcon = { basketball: '🏀', football: '⚽', running: '🏃', gym: '🏋️' }[sport] || '⚡';
    const skillGoalLabels = {
        basketball: { dribble: 'Handles & Dribble', shooting: 'Lançamento', finishing: 'Finalizações', pickup: 'Jogo Pick-up' },
        football: { dribble: 'Condução & Fintas', shooting: 'Remates & Passes', finishing: 'Cruzamentos', pickup: 'Jogo de Treino' },
        running: { dribble: 'Técnica de Corrida', shooting: 'Cadência & Ritmo', finishing: 'Intervalado', pickup: 'Corrida Longa' },
        gym: { dribble: 'Mobilidade & Técnica', shooting: 'Cardio', finishing: 'Tempo Training', pickup: 'Metcon / HIIT' }
    }[sport] || { dribble: 'Técnica Base', shooting: 'Treino Complementar', finishing: 'Trabalho Específico', pickup: 'Treino Livre' };
    const gymGoalLabels = { push: 'Empurrar (Peito/Ombro)', pull: 'Puxar (Costas/Bíceps)', legs: 'Pernas & Potência', core: 'Core & Mobilidade' };

    const activeDayIndices = [];
    for (let di = 0; di < 7; di++) {
        if (!getIsRest(di, nDays)) activeDayIndices.push(di);
    }

    const dayPlan = {};
    for (let ph = 1; ph <= 3; ph++) {
        dayPlan[ph.toString()] = dayNames.map((dInfo, di) => {
            const rest = getIsRest(di, nDays);
            let gymKey = null;
            let skillKey = null;
            let vertActive = false;
            let goal = "Descanso total";
            let icon = dInfo.icon;

            if (rest) {
                gymKey = "core";
                skillKey = null;
                goal = di === 6 ? "Recuperação Total" : "Descanso Ativo & Mobilidade";
                icon = di === 6 ? "🔴" : "🧘";
            } else {
                const activeIdx = activeDayIndices.indexOf(di);
                if (activeDayIndices.length === 2) {
                    if (activeIdx === 0) { gymKey = "push"; skillKey = "dribble"; goal = `Superior (Push) + ${skillGoalLabels.dribble}`; icon = "💪"; }
                    else { gymKey = "legs"; skillKey = "shooting"; vertActive = true; goal = `${gymGoalLabels.legs} + Pliometria`; icon = "⚡"; }
                } else if (activeDayIndices.length === 3) {
                    if (activeIdx === 0) { gymKey = "push"; skillKey = "dribble"; goal = `${gymGoalLabels.push} + ${skillGoalLabels.dribble}`; icon = "💪"; }
                    else if (activeIdx === 1) { gymKey = "pull"; skillKey = "shooting"; goal = `${gymGoalLabels.pull} + ${skillGoalLabels.shooting}`; icon = "💪"; }
                    else { gymKey = "legs"; skillKey = "finishing"; vertActive = true; goal = `${gymGoalLabels.legs} + Pliometria`; icon = "⚡"; }
                } else {
                    const mod = activeIdx % 5;
                    if (mod === 0) { gymKey = "push"; skillKey = "dribble"; goal = `${gymGoalLabels.push} + ${skillGoalLabels.dribble}`; icon = "💪"; }
                    else if (mod === 1) { gymKey = "legs"; skillKey = "shooting"; goal = `${gymGoalLabels.legs} + ${skillGoalLabels.shooting}`; icon = "🦵"; }
                    else if (mod === 2) { gymKey = "pull"; skillKey = "dribble"; goal = `${gymGoalLabels.pull} + ${skillGoalLabels.dribble}`; icon = "💪"; }
                    else if (mod === 3) { gymKey = "legs"; skillKey = "finishing"; vertActive = true; goal = `${gymGoalLabels.legs} + Pliometria`; icon = "⚡"; }
                    else { gymKey = "push"; skillKey = "pickup"; goal = `${skillGoalLabels.pickup} + Força`; icon = sportIcon; }
                }
            }

            return { day: dInfo.day, label: dInfo.label, icon, goal, gym: gymKey, skill: skillKey, vert: vertActive, rest };
        });
    }

    // ═══════════════════════════════════════════════════════════
    // Resolver exercícios phase-aware: gym e skill
    // O DayView usa plan.gym[gymKey] e plan.skill[skillKey]
    // Precisamos montar gym e skill finais com chaves por fase
    // ═══════════════════════════════════════════════════════════
    const resolvePhaseGym = (phase) => ({
        push: gym[`push_${phase}`] || gym.push_1,
        pull: gym[`pull_${phase}`] || gym.pull_1,
        legs: gym[`legs_${phase}`] || gym.legs_1,
        core: gym.core
    });

    const resolvePhaseSkill = (phase) => {
        const result = {};
        const keys = ['dribble', 'shooting', 'finishing', 'pickup'];
        keys.forEach(k => {
            result[k] = skill[`${k}_${phase}`] || skill[`${k}_1`] || [];
        });
        return result;
    };

    // Mesclar tudo num gym e skill combinado (para compatibilidade com DayView)
    // O DayView acede a plan.gym[day.gym] onde day.gym = "push", "pull", etc.
    // Como o phase está disponível via PlanModel.getPhase(), precisamos incluir as 3 fases
    // Solução: usar chaves como "push" mas os exercícios mudam pela fase actual
    // Limitação do mock: vamos usar phase 1 como padrão no objecto gym/skill,
    // e incluir as fases 2 e 3 como gym_2, gym_3 para referência futura
    // MAS o DayView actual só lê plan.gym[key], não é phase-aware
    // Então: vamos manter a mesma API mas retornar exercícios da fase actual baseado na semana
    // Para máxima compatibilidade, retornamos os 3 sets e deixamos o frontend resolver

    // Formato final compatível com DayView
    const finalGym = {
        push: gym.push_1,
        pull: gym.pull_1,
        legs: gym.legs_1,
        core: gym.core
    };

    const finalSkill = {};
    ['dribble', 'shooting', 'finishing', 'pickup'].forEach(k => {
        finalSkill[k] = skill[`${k}_1`] || [];
    });

    // Adicionar gym/skill por fase para que o DayView possa usar via phase
    const gymByPhase = {};
    const skillByPhase = {};
    for (let ph = 1; ph <= 3; ph++) {
        gymByPhase[ph] = resolvePhaseGym(ph);
        skillByPhase[ph] = resolvePhaseSkill(ph);
    }

    // ═══════════════════════════════════════════════════════════
    // SCHEDULE — Horário do dia
    // ═══════════════════════════════════════════════════════════
    const skillDuration = sessionH <= 1 ? '25 min' : sessionH <= 1.5 ? '45 min' : sessionH <= 2 ? '60 min' : '75 min';
    const gymDuration = sessionH <= 1 ? '30-40 min' : sessionH <= 1.5 ? '60-75 min' : sessionH <= 2 ? '75-90 min' : '90-120 min';

    const sched = {};
    for (let ph = 1; ph <= 3; ph++) {
        for (let di = 0; di < 7; di++) {
            const rest = getIsRest(di, nDays);
            const key = `${ph}-${di}`;

            if (rest) {
                if (di === 6) {
                    sched[key] = [
                        { t: "08:30", l: "Acordar + Hidratação generosa (500ml água)", c: "orange", n: "" },
                        { t: "09:00", l: "Pequeno-almoço equilibrado", c: "orange", n: "" },
                        { t: "10:00", l: "Banho morno + Alongamento suave passivo", c: "green", n: "15 min" },
                        { t: "13:00", l: "Almoço regenerador (foco em proteína + vegetais)", c: "orange", n: "" },
                        { t: "15:00", l: "Descanso passivo / Sesta (20-30min)", c: "gray", n: "" },
                        { t: "17:00", l: "Foam Roller completo + Bola de lacrosse", c: "green", n: "20 min" },
                        { t: "19:00", l: "Caminhada leve ao ar livre (opcional)", c: "gray", n: "20 min" },
                        { t: "20:00", l: "Jantar regenerador", c: "orange", n: "" },
                        { t: "22:00", l: "Magnésio + Rotina de sono (8-9h mínimo)", c: "gold", n: "" }
                    ];
                } else {
                    sched[key] = [
                        { t: "08:00", l: "Acordar + Hidratação + Pequeno-almoço leve", c: "orange", n: "" },
                        { t: "09:30", l: "Mobilidade Articular Geral (anca, ombros, coluna)", c: "green", n: "15 min" },
                        { t: "09:45", l: "Trabalho de Core Estabilizador", c: "red", n: "25-30 min" },
                        { t: "10:15", l: "Foam Roller + Libertação miofascial", c: "green", n: "15 min" },
                        { t: "13:00", l: "Almoço nutritivo", c: "orange", n: "" },
                        { t: "17:00", l: "Caminhada leve ou descanso ativo", c: "gray", n: "20-30 min" },
                        { t: "20:00", l: "Jantar", c: "orange", n: "" },
                        { t: "22:00", l: "Magnésio + Descanso mental (sem ecrãs)", c: "gold", n: "" }
                    ];
                }
            } else {
                const isVertDay = dayPlan[ph.toString()]?.[di]?.vert;
                const daySkillKey = dayPlan[ph.toString()]?.[di]?.skill;
                const schedSkillLabel = daySkillKey ? (skillGoalLabels[daySkillKey] || 'Treino Técnico') : 'Treino Técnico';
                sched[key] = [
                    { t: "07:30", l: "Acordar + 500ml água com limão", c: "orange", n: "" },
                    { t: "08:00", l: "Pequeno-almoço focado (hidratos + proteína)", c: "orange", n: "" },
                    { t: "09:00", l: "Colagénio + Vitamina C", c: "gold", n: "30-60 min antes do treino" },
                    { t: "09:15", l: "Aquecimento dinâmico + ativação muscular", c: "green", n: "12-15 min" },
                    { t: "09:30", l: schedSkillLabel, c: "blue", n: skillDuration },
                    { t: sessionH <= 1 ? "10:00" : "10:15", l: isVertDay ? "Pliometria + Força Explosiva" : "Sessão de Força (Musculação)", c: isVertDay ? "purple" : "red", n: gymDuration },
                    { t: sessionH <= 1 ? "10:45" : "11:30", l: "Cool-down: Alongamento ativo + Whey", c: "green", n: "15 min" },
                    { t: "13:00", l: "Almoço rico em nutrientes (maior refeição)", c: "orange", n: "" },
                    { t: "16:00", l: "Lanche da tarde (pré-segundo período)", c: "orange", n: "" },
                    { t: "17:00", l: "Foam Roller focado (pernas e costas)", c: "green", n: "15-20 min" },
                    { t: "20:00", l: "Jantar pós-treino (proteína + hidratos)", c: "orange", n: "" },
                    { t: "22:00", l: "Magnésio + Caseína/Queijo quark + Sono (8h mínimo)", c: "gold", n: "" }
                ];
            }
        }
    }

    // ═══════════════════════════════════════════════════════════
    // LESÕES — Substituições dinâmicas
    // ═══════════════════════════════════════════════════════════
    const activeInjuries = profile.injuries || [];
    
    const applyInjurySubstitutions = (gymObj) => {
        if (!activeInjuries.some(i => i !== 'none')) return;

        if (activeInjuries.includes('knee')) {
            ['legs_1', 'legs_2', 'legs_3'].forEach(key => {
                if (gymObj[key]) {
                    gymObj[key] = gymObj[key].map(ex => {
                        if (ex.name.includes('Squat') && !ex.name.includes('Wall Sit')) return { ...ex, name: "Box Squat Alto (Menos ângulo de joelho)", detail: ex.detail.replace(/\d+ reps/, "10 reps") };
                        return ex;
                    });
                }
            });
        }
        if (activeInjuries.includes('shoulder')) {
            ['push_1', 'push_2', 'push_3'].forEach(key => {
                if (gymObj[key]) {
                    gymObj[key] = gymObj[key].map(ex => {
                        if (ex.name.includes('Press Militar') || ex.name.includes('Push Press')) return { ...ex, name: "Elevações Laterais Ligeiras c/ Halteres", detail: "3 séries x 12-15 reps — Sem dor" };
                        return ex;
                    });
                }
            });
        }
        if (activeInjuries.includes('back')) {
            ['legs_1', 'legs_2', 'legs_3'].forEach(key => {
                if (gymObj[key]) {
                    gymObj[key] = gymObj[key].map(ex => {
                        if (ex.name.includes('Deadlift') || ex.name.includes('RDL')) return { ...ex, name: "Hip Thrust sem Carga Axial", detail: "3 séries x 12 reps — Zero pressão na coluna" };
                        return ex;
                    });
                }
            });
        }
        if (activeInjuries.includes('ankle')) {
            for (const phaseKey in vert) {
                vert[phaseKey] = vert[phaseKey].map(ex => {
                    if (ex.name.includes('Depth') || ex.name.includes('Pogo') || ex.name.includes('Ankle')) return { ...ex, name: "Fortalecimento de Tornozelo c/ Elástico", detail: "3 séries x 15 reps — Eversão, inversão, dorsiflexão" };
                    return ex;
                });
            }
        }
        if (activeInjuries.includes('elbow')) {
            ['push_1', 'push_2', 'push_3'].forEach(key => {
                if (gymObj[key]) {
                    gymObj[key] = gymObj[key].map(ex => {
                        if (ex.name.includes('Dips') || ex.name.includes('Skull')) return { ...ex, name: "Prancha Isométrica (Sem impacto no cotovelo)", detail: "3 séries x 45 segundos" };
                        return ex;
                    });
                }
            });
        }
        if (activeInjuries.includes('hip')) {
            ['legs_1', 'legs_2', 'legs_3'].forEach(key => {
                if (gymObj[key]) {
                    gymObj[key] = gymObj[key].map(ex => {
                        if (ex.name.includes('Búlgaro') || ex.name.includes('Lunge')) return { ...ex, name: "Elevações de Pernas Controladas", detail: "3 séries x 10 reps — Sem dor na anca" };
                        return ex;
                    });
                }
            });
        }
        if (activeInjuries.includes('hamstring')) {
            ['legs_1', 'legs_2', 'legs_3'].forEach(key => {
                if (gymObj[key]) {
                    gymObj[key] = gymObj[key].map(ex => {
                        if (ex.name.includes('RDL') || ex.name.includes('Deadlift') || ex.name.includes('Nordic')) return { ...ex, name: "Ponte de Glúteos (Calcanhares Próximos)", detail: "4 séries x 15 reps — Sem estirar isquiotibiais" };
                        return ex;
                    });
                }
            });
        }
        if (activeInjuries.includes('wrist')) {
            ['push_1', 'push_2', 'push_3'].forEach(key => {
                if (gymObj[key]) {
                    gymObj[key] = gymObj[key].map(ex => {
                        if (ex.name.includes('Flexões') || ex.name.includes('Push')) return { ...ex, name: "Flexões nos Punhos/Halteres (Sem extensão do punho)", detail: ex.detail };
                        return ex;
                    });
                }
            });
        }
    };

    applyInjurySubstitutions(gym);

    // ═══════════════════════════════════════════════════════════
    // RESULTADO FINAL — Compatível com DayView + gymByPhase/skillByPhase
    // ═══════════════════════════════════════════════════════════
    return {
        phases,
        gym: gym.push_1 ? { push: gym.push_1, pull: gym.pull_1, legs: gym.legs_1, core: gym.core } : finalGym,
        gymByPhase,
        skill: finalSkill,
        skillByPhase,
        vert,
        rec,
        meals,
        supps,
        dayPlan,
        sched,
        injuryWarning: (!activeInjuries || activeInjuries.includes('none') || activeInjuries.length === 0) ? null : `Foco extra na prevenção de lesões: ${activeInjuries.filter(x => x !== 'none').join(', ')}. Exercícios adaptados automaticamente. Parar se dor > 4/10.`,
        weeklyTip: `Mantém a consistência — ${experience === 'beginner' ? 'foca-te na técnica antes de aumentar carga' : experience === 'advanced' ? 'gere a fadiga e prioriza a qualidade sobre o volume' : 'progressão gradual é a chave para resultados duradouros'}. ${sport === 'gym' ? 'Regista os pesos usados para tracking de progresso.' : `Combina o treino de ${sport} com a recuperação adequada.`}`
    };
}

module.exports = {
    generateMockPlan
};
