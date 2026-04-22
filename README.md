# Surya.dev — Solar Panel Cleaning Dashboard

Full-stack monorepo: **React 18** · **Node.js + Express + WebSocket** · **Python FastAPI** · **Firebase RTDB**

```
solar/
├── frontend/        ← React 18 + Vite dashboard
├── backend/         ← Node.js + Express + WebSocket bridge
└── python/          ← FastAPI + OpenCV webcam + ML inference
```

---

## 🚀 Quick Start

### 1. Firebase Database Rules
Make sure your Firebase Realtime Database is in **test mode** (public read/write):
```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

---

### 2. Install & Run Backend (Node.js)
```bash
cd backend
npm install
npm run dev      # starts on http://localhost:4000
```

### 3. Install & Run Frontend (React)
```bash
cd frontend
npm install
npm run dev      # starts on http://localhost:3000
```

### 4. Install & Run Python Server
```bash
cd python
pip install -r requirements.txt
python main.py   # starts on http://localhost:5001
```

---

## 🔌 WebSocket Flow

```
Firebase RTDB ──SSE──▶ Node.js ──WS──▶ React Dashboard
                                  ▲
Python /predict ──REST──▶ Firebase (writes /prediction)
```

---

## 📷 Webcam + ML

- Stream URL: `http://localhost:5001/stream` (MJPEG)
- Predict once: `POST http://localhost:5001/predict`
- Auto inference: `POST http://localhost:5001/start_inference`

### Adding your PKL model
1. Copy your `model.pkl` file to: `python/model.pkl`
2. Edit `preprocess_frame()` in `python/main.py` to match your model's input shape
3. Edit `raw_to_score()` to map raw output → 0–100 score

---

## 🌐 Ports

| Service    | Port |
|------------|------|
| React      | 3000 |
| Node.js    | 4000 |
| Python     | 5001 |

---

## 📦 Firebase Data Structure

```json
{
  "Solarcleaner": {
    "Threshold": 2,
    "bpwm": 245,
    "checkpoint": 0,
    "checkpointdelay": 10,
    "fpwm": 245,
    "motordelay": 1500
  },
  "solarvoltage": { "volt": 230 },
  "prediction": {
    "score": 75.3,
    "label": "Moderate",
    "timestamp": 1713090000000
  }
}
```
