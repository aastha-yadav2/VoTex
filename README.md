# 🗳️ Election Buddy AI

> **Interactive Election Process Assistant for Indian Citizens**
> Built with React + FastAPI + Google Gemini AI

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Python](https://img.shields.io/badge/Python-3.11-blue)](https://python.org)
[![React](https://img.shields.io/badge/React-18-61dafb)](https://reactjs.org)

---

## ✨ Features

| Feature | Description |
|---|---|
| 💬 **AI Chat** | ChatGPT-style assistant powered by Gemini 1.5 Flash |
| 📅 **Election Timeline** | Interactive 6-step visual election journey |
| ✅ **Eligibility Checker** | Age + citizenship form with instant result |
| 🧠 **Knowledge Quiz** | 8 MCQ questions with explanations |
| 🌐 **Hindi Support** | Toggle between English and Hindi |
| 📱 **Mobile Responsive** | Works on all screen sizes |

---

## 🚀 Quick Start (Local Dev)

### Prerequisites
- Node.js 20+
- Python 3.11+
- A free [Google Gemini API key](https://aistudio.google.com/app/apikey)

### 1. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate    # Windows
# source venv/bin/activate  # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY

# Start backend
python main.py
# → Running at http://localhost:8080
```

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
# → Running at http://localhost:5173
```

> ✅ The Vite dev proxy forwards `/chat`, `/timeline`, etc. to `localhost:8080` automatically.

---

## 🐳 Docker Deployment

### Using Docker Compose (Recommended)

```bash
# Set your Gemini API key
$env:GEMINI_API_KEY="your_key_here"  # Windows PowerShell
# export GEMINI_API_KEY="your_key_here"  # Mac/Linux

# Build and start all services
docker-compose up --build

# App:     http://localhost
# API:     http://localhost:8080
# MongoDB: mongodb://localhost:27017
```

### Individual Containers

```bash
# Backend
docker build -t election-buddy-backend ./backend
docker run -p 8080:8080 -e GEMINI_API_KEY=your_key election-buddy-backend

# Frontend
docker build -t election-buddy-frontend ./frontend
docker run -p 80:80 election-buddy-frontend
```

---

## ☁️ Google Cloud Run Deployment

```bash
# Authenticate
gcloud auth login
gcloud config set project YOUR_PROJECT_ID

# Backend to Cloud Run
cd backend
gcloud run deploy election-buddy-api \
  --source . \
  --region asia-south1 \
  --allow-unauthenticated \
  --port 8080 \
  --set-env-vars GEMINI_API_KEY=your_key

# Frontend to Cloud Run
cd ../frontend
docker build --build-arg VITE_API_URL=https://YOUR-API-URL.run.app -t gcr.io/YOUR_PROJECT_ID/election-buddy-frontend .
docker push gcr.io/YOUR_PROJECT_ID/election-buddy-frontend
gcloud run deploy election-buddy-frontend \
  --image gcr.io/YOUR_PROJECT_ID/election-buddy-frontend \
  --region asia-south1 \
  --allow-unauthenticated \
  --port 80
```

---

## 🔌 API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Health check |
| `POST` | `/chat` | AI chat – `{ query, language }` |
| `GET` | `/timeline` | Election steps JSON |
| `POST` | `/eligibility` | Check eligibility – `{ age, citizen, state }` |
| `GET` | `/quiz` | All quiz questions |
| `POST` | `/quiz/check` | Check answer – `{ question_id, answer }` |
| `GET` | `/suggested-prompts` | Suggested chat prompts |

---

## 📁 Project Structure

```
VoTex/
├── backend/
│   ├── main.py           # FastAPI app + all routes + AI integration
│   ├── requirements.txt
│   ├── .env.example
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── Navbar.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Chat.jsx
│   │   │   ├── Timeline.jsx
│   │   │   ├── Eligibility.jsx
│   │   │   └── Quiz.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── styles/
│   │   │   ├── Navbar.css
│   │   │   ├── Home.css
│   │   │   ├── Chat.css
│   │   │   ├── Timeline.css
│   │   │   ├── Eligibility.css
│   │   │   └── Quiz.css
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css      # Global design system
│   ├── Dockerfile
│   ├── nginx.conf
│   └── vite.config.js
├── docker-compose.yml
└── README.md
```

---

## 🎨 Design System

- **Primary**: `#FF6B35` (Saffron-orange — India theme)
- **Secondary**: `#2563EB` (Trust blue)
- **Accent**: `#10B981` (Success green)
- **Background**: `#0D0D1A` (Deep dark)
- **Font**: Inter (body) + Outfit (headings)

---

## 🧠 AI Behavior

The Gemini AI is instructed to:
- Use **simple, beginner-friendly** language
- Always avoid **political bias or party opinions**
- Structure answers with **numbered steps**
- Give **real Indian examples** (ECI, Lok Sabha, VVPAT)
- Gracefully fall back to offline responses if API key is not set

---

## 📌 Important Links

| Resource | URL |
|---|---|
| Voter Portal | https://voterportal.eci.gov.in |
| ECI Official | https://eci.gov.in |
| Voter Registration | https://voters.eci.gov.in |
| Voter Helpline | 1950 |

---

## ⚠️ Disclaimer

Election Buddy AI is an **educational tool only**. It is not affiliated with the Election Commission of India or any political party. All information is for learning purposes.

---

Built with ❤️ for India's democracy 🇮🇳
