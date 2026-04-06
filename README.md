# TypeCraft

<div align="center">
  <img src="client/public/favicon.svg" width="120" height="120" alt="TypeCraft Logo" />
  <h3>Type at the Speed of Thought</h3>
  <p>A high-performance, cyber-industrial typing platform featuring AI-driven training, real-time analytics, and a gamified progression system.</p>

  [![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](#)
  [![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
  [![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://reactjs.org/)
  [![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=node.js)](https://nodejs.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
</div>

---

## 📖 Overview

**TypeCraft** is a professional-grade typing application designed for developers and power users who want to master their muscle memory. Unlike standard typing tutors, TypeCraft utilizes **Google Gemini 2.0 Flash** to analyze your character-level weaknesses and generate 100% saturated training passages in real-time.

With a sleek "cyber-industrial" aesthetic, the platform provides deep technical insights into your typing performance, including WPM history, accuracy rates, and character heatmaps.

## ✨ Features

- **🎯 AI-Powered Weakness Training**: Uses Gemini 2.0 Flash to generate custom passages targeting specific characters you struggle with.
- **⚡ Multiple Practice Modes**:
  - **Words**: Standard vocabulary training.
  - **Quotes**: Real-world sentence structure.
  - **Code**: Syntax-heavy training for developers (includes brackets, semicolons, and keywords).
- **📊 Advanced Analytics**:
  - Real-time WPM and Accuracy tracking.
  - Character-level Heatmaps showing precision across the keyboard.
  - Consistency scoring and WPM history graphs.
- **🎮 Gamified Progression**:
  - Earn XP based on WPM, Accuracy, and Challenge Duration.
  - Global Leaderboards to compete with other operators.
  - Custom Avatars and Onboarding flow.
- **🌐 Real-time Connectivity**: Powered by Socket.io for low-latency interactions and race synchronization.
- **🔐 Secure Authentication**: Integrated Social Auth via Google and GitHub using Passport.js.

## 🛠 Tech Stack

### Frontend
- **Framework**: React 19 (Vite)
- **State Management**: Zustand
- **Animations**: Framer Motion & TSParticles
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js / Express
- **Database**: Prisma ORM (SQLite/PostgreSQL)
- **Real-time**: Socket.io
- **AI Integration**: Google Generative AI (Gemini 2.0 Flash)
- **Authentication**: Passport.js (Google & GitHub Strategies)

---

## 🏗 Architecture

TypeCraft follows a decoupled Client-Server architecture:

```text
├── client/                # React Vite Application
│   ├── src/hooks/         # Core typing logic (useTyping.js)
│   ├── src/store/         # Zustand stores for Auth & Settings
│   └── src/lib/           # WPM calculation and utility functions
└── server/                # Express Node.js Server
    ├── src/handlers/      # Socket.io event handlers
    ├── src/routes/        # REST API Endpoints
    └── prisma/            # Database Schema & Migrations
```

### Data Flow
1. **Typing Session**: The `useTyping` hook captures keystrokes and calculates metrics locally.
2. **Result Sync**: On completion, results are POSTed to `/api/results`.
3. **XP Calculation**: The server calculates XP using: `(WPM * Accuracy/100) * (Duration/60)`.
4. **AI Generation**: If a user requests training, the server prompts Gemini to create a "saturated" passage where every word contains the target weak characters.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v20 or higher)
- NPM or Yarn
- A Google Gemini API Key (for AI features)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/SudeepKagi/TypeCraft.git
   cd TypeCraft
   ```

2. **Setup Server**:
   ```bash
   cd server
   npm install
   cp .env.example .env # Add your GEMINI_API_KEY and Auth Credentials
   npx prisma migrate dev --name init
   npm run dev
   ```

3. **Setup Client**:
   ```bash
   cd ../client
   npm install
   npm run dev
   ```

### Configuration (.env)
**Server:**
```env
DATABASE_URL="file:./dev.db"
SESSION_SECRET="your_secret"
GEMINI_API_KEY="your_gemini_key"
FRONTEND_URL="http://localhost:5173"
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
GITHUB_CLIENT_ID="..."
GITHUB_CLIENT_SECRET="..."
```

---

## ⌨️ Usage

### Core Typing Hook
Developers can leverage the `useTyping` hook for custom typing interfaces:

```javascript
import { useTyping } from './hooks/useTyping';

const { words, currentWPM, accuracy, status } = useTyping("Initial passage text");

// status can be 'idle', 'running', or 'finished'
```

### AI Training Endpoint
To generate a targeted practice session:
```bash
curl -X POST http://localhost:4000/api/ai/train \
     -H "Content-Type: application/json" \
     -d '{"weakness": "qz"}'
```

---

## 📈 API Documentation

### Authentication
- `GET /auth/google`: Initiates Google OAuth.
- `GET /auth/github`: Initiates GitHub OAuth.
- `GET /auth/me`: Returns current session user.

### Statistics & Leaderboards
- `GET /api/leaderboard`: Returns top users by WPM.
- `GET /api/users/:userId/stats`: Returns detailed WPM history and momentum.
- `GET /api/users/:userId/heatmap`: Returns character-specific accuracy data.

### Results
- `POST /api/results`: Saves a completed race.
  - **Body**: `{ userId, wpm, accuracy, duration, mode, keystrokes: [] }`

---

## 🤝 Contributing

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📜 License

Distributed under the ISC License. See `LICENSE` for more information.

## 🙏 Acknowledgments

- **Google Gemini**: For providing the intelligence behind the AI Trainer.
- **Vite**: For the lightning-fast development environment.
- **Framer Motion**: For the smooth, high-fidelity UI transitions.

---
<div align="center">
  <sub>Built with precision by <a href="https://github.com/SudeepKagi">Sudeep Kagi</a></sub>
</div>