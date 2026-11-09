<p align="center">
  <strong>⚡ FitPlan — Mobile Fitness Coach &amp; GPS Run Tracker</strong>
</p>

<p align="center">
  A cross-platform mobile app (Expo / React Native) with personalized weekly training plans, nutrition and recovery guides, a GPS run tracker with per-km splits, a coach chat, and a profile with league ranking. Works fully offline, with all data stored on the device.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Expo-SDK_58-000020?logo=expo&logoColor=white" alt="Expo" />
  <img src="https://img.shields.io/badge/React_Native-0.88-61DAFB?logo=react&logoColor=black" alt="React Native" />
  <img src="https://img.shields.io/badge/TypeScript-6.x-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Expo_Router-File--based-000020?logo=expo&logoColor=white" alt="Expo Router" />
  <img src="https://img.shields.io/badge/SQLite-On--device-003B57?logo=sqlite&logoColor=white" alt="SQLite" />
  <img src="https://img.shields.io/badge/License-MIT-blue" alt="License" />
</p>

---

## ✨ Features

- **📅 Weekly Training Plan** — Day-by-day plan with gym work, sport-specific drills, jump/plyometrics, recovery, meals and supplements, adapted to your sport, level and equipment.
- **🏃 Running Mode** — Dedicated running plan (pace sessions, fartlek, long runs) with its own themed UI and navigation.
- **📍 GPS Run Tracker** — Record your route with distance, moving time, pace, elevation gain, calories and per-km splits. Start / pause / stop controls, live map and a **simulation mode** to test without going outside.
- **🗂️ Run History & PRs** — Runs are saved on-device (SQLite key-value store) and shown in a history feed, with personal-record highlights.
- **📋 Exercise Checklists** — Mark exercises as done per day and category; progress rings show weekly completion.
- **🏆 Profile & League** — Overall rating, attribute radar chart and league standings.
- **💬 Coach Chat** — Chat screen with suggested questions about training, running, nutrition and recovery. Replies are currently predefined (no AI backend).
- **🏀 Multi-Sport Support** — Choose one or more sports and the areas you want to improve during onboarding.
- **⚙️ Guided Onboarding** — Step-by-step setup: name, sports, age, weight, level and equipment.
- **🔒 Background Location** — Run recording continues with the screen locked (iOS background location, Android foreground service).
- **🌙 Mobile-First Dark UI** — Dark theme with bottom tab navigation (Sora font).

---

## 🏗️ Architecture

The app is built with **Expo Router** (file-based routing). The main UI lives in a single DOM component (`'use dom'`) rendered inside the native app; run history is persisted through a small storage module.

```
FitPlan/
├── app.json / app.config.js       # Expo config (permissions, plugins, icons)
├── .env.example                   # Environment variables template
├── assets/                        # Icons, splash and images
├── scripts/                       # Project scripts
└── src/                   
    ├── app/                       # Routes (Expo Router)
    │   ├── _layout.tsx            # Root layout
    │   ├── index.tsx              # Home screen
    │   └── explore.tsx            # Secondary screen
    ├── components/
    │   ├── fitplan-mobile.tsx     # Main FitPlan UI (plan, tracker, coach, profile)
    │   ├── app-tabs.tsx           # Native tabs (app-tabs.web.tsx for web)
    │   ├── themed-text.tsx / themed-view.tsx
    │   └── ui/                    # Shared UI components
    ├── constants/                 # Theme and logo
    ├── hooks/                     # Color scheme and theme hooks
    └── lib/
        └── runs.ts                # Run model + persistence (expo-sqlite kv-store)
```

---

## 🚀 Getting Started

### Prerequisites

- **[Node.js](https://nodejs.org/)** (LTS) and **npm**
- **[Expo Go](https://expo.dev/go)**, an Android/iOS emulator, or a [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- *(Optional)* A **Google Maps API key** for map views

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/FitPlan.git
cd FitPlan

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env.local

# 4. Start the dev server
npx expo start
```

### Running

```bash
npm start        # Expo dev server
npm run android  # Android
npm run ios      # iOS
npm run web      # Web
```

> Native modules such as `react-native-maps` and background location may require a development build:
> `npx expo run:android` / `npx expo run:ios`, or `eas build --profile development`.

### Configuration

Edit `.env.local`:

```env
# Google Maps (optional, used by map views)
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here
```

### Lint & Typecheck

```bash
npx expo lint
npx tsc --noEmit
```

---

## 🧰 Tech Stack

| Layer       | Technology                                                    |
| ----------- | ------------------------------------------------------------- |
| Framework   | Expo SDK 58, React 19, React Native 0.88                      |
| Navigation  | Expo Router (typed routes)                                    |
| Language    | TypeScript, React Compiler enabled                            |
| Storage     | `expo-sqlite` (kv-store) for runs, `localStorage` for plan state |
| Location    | `expo-location` (foreground + background)                     |
| Maps        | `react-native-maps`                                           |
| Animations  | `react-native-reanimated`, `react-native-worklets`            |
| UI          | `expo-image`, `expo-symbols`, `expo-glass-effect`, `@expo/ui` |
| Fonts       | Sora (Google Fonts)                                           |
| Tooling     | ESLint (`eslint-config-expo`), EAS Build                      |

---

## 📸 App Flow

1. **Onboarding** → Set your name, sports, age, weight, level and equipment
2. **Plan** → Weekly overview with progress rings and week navigation
3. **Day View** → Daily schedule with exercise checklists across all categories
4. **Run Tracker** *(Running mode)* → Record a run with GPS, live map, pace and splits, then save it
5. **Coach** → Ask the coach about training, nutrition and recovery
6. **Profile** → Rating, attributes and league standings
7. **Settings** → Change sport/mode or reset all data and create a new plan

---


## 📄 Documentation & License

- Project report: [`Relatorio_FitPlan.pdf`](Relatorio_FitPlan.pdf)
- Licensed under the [MIT License](LICENSE).
