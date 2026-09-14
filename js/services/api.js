const API = {
    setToken: (token) => {
        if (token) {
            localStorage.setItem('ft_jwt_token', token);
        } else {
            localStorage.removeItem('ft_jwt_token');
        }
    },

    getToken: () => {
        return localStorage.getItem('ft_jwt_token');
    },

    request: async (endpoint, options = {}) => {
        let origin = window.location.origin;
        // Se correr via file:// ou noutra porta de servidor estático, aponta para o Express na 3000
        if (origin.startsWith('file://') || !origin.includes(':3000')) {
            origin = 'http://localhost:3000';
        }
        const url = `${origin}${endpoint}`;
        
        const token = API.getToken();
        const headers = {
            'Content-Type': 'application/json',
            ...(options.headers || {})
        };
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const config = {
            ...options,
            headers
        };

        const res = await fetch(url, config);
        
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error || `Erro HTTP ${res.status}`);
        }

        return res.json();
    },

    // Autenticação
    register: async (username, password) => {
        return API.request('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
    },

    login: async (username, password) => {
        const data = await API.request('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
        if (data.token) {
            API.setToken(data.token);
        }
        return data;
    },

    logout: () => {
        API.setToken(null);
    },

    // Perfil
    getProfile: async () => {
        return API.request('/api/profile');
    },

    saveProfile: async (profileData) => {
        return API.request('/api/profile', {
            method: 'POST',
            body: JSON.stringify(profileData)
        });
    },

    // Plano de Treino
    getPlan: async () => {
        return API.request('/api/plan');
    },

    savePlan: async (planData) => {
        return API.request('/api/plan', {
            method: 'POST',
            body: JSON.stringify(planData)
        });
    },

    clearPlan: async () => {
        return API.request('/api/plan', {
            method: 'DELETE'
        });
    },

    // Checks
    getChecks: async () => {
        return API.request('/api/checks');
    },

    toggleCheck: async (checkKey) => {
        return API.request('/api/checks/toggle', {
            method: 'POST',
            body: JSON.stringify({ checkKey })
        });
    },

    // Stats
    getStats: async () => {
        return API.request('/api/stats');
    },

    addStat: async (type, value) => {
        return API.request('/api/stats', {
            method: 'POST',
            body: JSON.stringify({ type, value })
        });
    },

    // AI Coach
    generatePlan: async (profile, apiKey) => {
        return API.request('/api/coach/generate', {
            method: 'POST',
            body: JSON.stringify({ profile, apiKey })
        });
    },

    streamCoachChat: async (profile, historyStr, userText, onChunk, apiKey) => {
        let origin = window.location.origin;
        if (origin.startsWith('file://') || !origin.includes(':3000')) {
            origin = 'http://localhost:3000';
        }
        const url = `${origin}/api/coach/chat`;
        
        const token = API.getToken();
        const headers = {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        };

        const response = await fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify({ profile, historyStr, userText, apiKey })
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let accumulatedText = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
                const cleaned = line.trim();
                if (!cleaned.startsWith('data: ')) continue;
                const dataStr = cleaned.slice(6).trim();

                if (dataStr === '[DONE]') return accumulatedText;
                
                try {
                    const parsed = JSON.parse(dataStr);
                    if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
                        accumulatedText += parsed.delta.text;
                        onChunk(accumulatedText);
                    }
                } catch (err) {
                    // ignorar parse parcial
                }
            }
        }
        return accumulatedText;
    },

    getChatHistory: async () => {
        return API.request('/api/coach/chat/history');
    },

    clearChatHistory: async () => {
        return API.request('/api/coach/chat/history', {
            method: 'DELETE'
        });
    }
};

window.API = API;
