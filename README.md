<p align="center">
  <strong>⚡ FitPlan — AI-Powered Fitness Coach</strong>
</p>

<p align="center">
  A full-stack web application that generates personalized 12-week training plans, nutrition guides, and recovery programs powered by AI. Features real-time AI coaching chat, progress tracking with visual analytics, and multi-sport support.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express-5.x-000000?logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/Claude_AI-Anthropic-7C3AED?logo=anthropic&logoColor=white" alt="Claude AI" />
  <img src="https://img.shields.io/badge/SQLite-Local_DB-003B57?logo=sqlite&logoColor=white" alt="SQLite" />
  <img src="https://img.shields.io/badge/MySQL-Optional-4479A1?logo=mysql&logoColor=white" alt="MySQL" />
  <img src="https://img.shields.io/badge/License-ISC-blue" alt="License" />
</p>

---

## ✨ Features

- **🤖 AI Plan Generation** — Generates a complete 12-week periodized training plan (3 phases × 4 weeks) tailored to your sport, goals, equipment, injuries, and schedule using Claude AI (Anthropic).
- **💬 Real-Time AI Coach Chat** — Server-Sent Events (SSE) streaming chat with an AI coach that can dynamically update your plan in real-time based on your requests (e.g., injury adjustments, diet changes).
- **📊 Progress Tracking** — Log and visualize your vertical jump and body weight over time with interactive SVG charts.
- **📋 Exercise Checklists** — Mark exercises as complete on a per-day, per-category basis (gym, sport-specific, plyometrics, recovery, meals, supplements).
- **🏀 Multi-Sport Support** — Basketball, football, volleyball, athletics, swimming, martial arts, and custom sports.
- **🔐 User Authentication** — Secure JWT-based auth with bcrypt password hashing and 30-day token expiry.
- **📱 Mobile-First UI** — Responsive dark-themed design optimized for mobile with bottom navigation, smooth transitions, and modern typography (Outfit, Plus Jakarta Sans).
- **⚙️ Guided Onboarding** — Step-by-step profile setup collecting sport, goals, body stats, experience level, injuries, schedule, equipment, and budget.
- **🔁 Mock Mode** — Works fully offline without an API key using a built-in mock plan generator for development and demo purposes.
- **💾 Dual Database Support** — SQLite (zero-config, default) with automatic fallback, or MySQL for production environments.

---

## 🏗️ Architecture

The app follows an **MVC (Model–View–Controller)** pattern on the frontend with a **RESTful Express API** backend:

```
FitPlan/
├── index.html                  # SPA entry point
├── css/
│   └── style.css               # Full design system (dark theme, gradients, animations)
├── js/
│   ├── app.js                  # Bootstrap / initialization
│   ├── services/
│   │   └── api.js              # HTTP client & SSE streaming (API service layer)
│   ├── models/
│   │   ├── Store.js            # localStorage abstraction
│   │   ├── UserModel.js        # User session management
│   │   ├── PlanModel.js        # Training plan state & persistence
│   │   └── StatsModel.js       # Progress stats (vertical jump, weight)
│   ├── views/
│   │   ├── AuthView.js         # Login & registration screens
│   │   ├── OnboardingView.js   # Multi-step profile wizard
│   │   ├── DashboardView.js    # Main dashboard with progress rings
│   │   ├── DayView.js          # Daily training detail view
│   │   ├── ChatView.js         # AI coach chat interface
│   │   └── SettingsView.js     # Profile & preferences editor
│   └── controllers/
│       ├── AppController.js    # Navigation, routing & view lifecycle
│       └── AIController.js     # AI key management & API orchestration
├── server/
│   ├── server.js               # Express server (auth, CRUD, AI proxy)
│   ├── schema.sql              # MySQL schema reference
│   ├── database.sqlite         # SQLite database file (auto-created)
│   ├── config/
│   │   └── db.js               # Database abstraction (MySQL/SQLite dual driver)
│   └── utils/
│       └── mockGenerator.js    # Offline mock plan generator
├── package.json
└── .env                        # Environment configuration
```

---

## 🚀 Getting Started

### Prerequisites

- **[Node.js](https://nodejs.org/)** v18 or later
- **npm** (comes with Node.js)
- *(Optional)* An **[Anthropic API key](https://console.anthropic.com/)** for real AI-powered plan generation and coaching. The app works without one using built-in mock data.

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/FitPlan.git
cd FitPlan

# 2. Install dependencies
npm install

# 3. Configure environment variables
#    Copy and edit the .env file (see Configuration section below)

# 4. Start the server
npm start
```

The app will be available at **http://localhost:3000**.

For development with auto-reload:

```bash
npm run dev
```

### Configuration

Create or edit the `.env` file in the project root:

```env
# Server
PORT=3000

# Database — 'sqlite' (default, zero-config) or 'mysql'
DB_TYPE=sqlite

# MySQL settings (only needed if DB_TYPE=mysql)
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=fittracker_db

# Auth
JWT_SECRET=your_secure_random_secret_here

# AI (optional — can also be set per-user in the app UI)
ANTHROPIC_API_KEY=sk-ant-...
```

> **Note:** If `DB_TYPE` is set to `mysql` and the connection fails, the server automatically falls back to SQLite.

---

## 🔌 API Endpoints

### Authentication

| Method | Endpoint               | Description           |
| ------ | ---------------------- | --------------------- |
| POST   | `/api/auth/register`   | Create a new account  |
| POST   | `/api/auth/login`      | Login & receive JWT   |

### Profile

| Method | Endpoint        | Auth | Description              |
| ------ | --------------- | ---- | ------------------------ |
| GET    | `/api/profile`  | ✅   | Get user profile         |
| POST   | `/api/profile`  | ✅   | Create/update profile    |

### Training Plan

| Method | Endpoint     | Auth | Description                     |
| ------ | ------------ | ---- | ------------------------------- |
| GET    | `/api/plan`  | ✅   | Get active training plan        |
| POST   | `/api/plan`  | ✅   | Save/update training plan       |
| DELETE | `/api/plan`  | ✅   | Reset plan & exercise checks    |

### Exercise Checks

| Method | Endpoint              | Auth | Description                   |
| ------ | --------------------- | ---- | ----------------------------- |
| GET    | `/api/checks`         | ✅   | Get all exercise check states |
| POST   | `/api/checks/toggle`  | ✅   | Toggle an exercise check      |

### Progress Stats

| Method | Endpoint      | Auth | Description              |
| ------ | ------------- | ---- | ------------------------ |
| GET    | `/api/stats`  | ✅   | Get progress history     |
| POST   | `/api/stats`  | ✅   | Log a new stat entry     |

### AI Coach

| Method | Endpoint                    | Auth | Description                            |
| ------ | --------------------------- | ---- | -------------------------------------- |
| POST   | `/api/coach/generate`       | ✅   | Generate a full 12-week training plan  |
| POST   | `/api/coach/chat`           | ✅   | Chat with AI coach (SSE streaming)     |
| GET    | `/api/coach/chat/history`   | ✅   | Get chat conversation history          |
| DELETE | `/api/coach/chat/history`   | ✅   | Clear chat history                     |

---

## 🧰 Tech Stack

| Layer      | Technology                                                   |
| ---------- | ------------------------------------------------------------ |
| Frontend   | Vanilla JavaScript (ES6+), HTML5, CSS3 (custom properties, gradients, animations) |
| UI Fonts   | Outfit, Plus Jakarta Sans, Fira Code, Syne (Google Fonts)    |
| Backend    | Node.js, Express 5                                           |
| Database   | SQLite 3 (default) / MySQL 2 (optional)                      |
| Auth       | JSON Web Tokens (jsonwebtoken), bcryptjs                     |
| AI         | Anthropic Claude API (claude-3-5-sonnet)                     |
| Streaming  | Server-Sent Events (SSE) for real-time chat                  |
| Dev Tools  | nodemon, dotenv                                              |

---

## 📸 App Flow

1. **Register / Login** → Secure account creation with hashed passwords
2. **Onboarding Wizard** → Set your sport, goals, body stats, experience, injuries, schedule & equipment
3. **AI Plan Generation** → Get a personalized 12-week plan (3 phases) with gym work, sport-specific drills, plyometrics, nutrition, supplements & recovery
4. **Dashboard** → Visual progress rings, weekly overview, phase navigation (weeks 1–12)
5. **Day View** → Detailed daily schedule with exercise checklists across all categories
6. **AI Coach Chat** → Real-time conversation with your AI coach — ask questions, request plan modifications
7. **Stats** → Track vertical jump and weight progress with SVG line charts
8. **Settings** → Update profile, training preferences, API key & account management

---

## 📄 License

This project is licensed under the [ISC License](https://opensource.org/licenses/ISC).
