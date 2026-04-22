require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { WebSocketServer } = require("ws");
const https = require("https");
const fetch = (...args) =>
  import("node-fetch").then(({ default: f }) => f(...args));

// ─── Config ──────────────────────────────────────────────────────────────────
const DB_URL = process.env.FIREBASE_DATABASE_URL; // e.g. https://xxx.firebaseio.com
const PORT = process.env.PORT || 4000;

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// ─── Cached data ─────────────────────────────────────────────────────────────
let latestData = { Solarcleaner: null, solarvoltage: null, prediction: null };

// ─── Broadcast to all WS clients ─────────────────────────────────────────────
function broadcast(payload) {
  const msg = JSON.stringify(payload);
  wss.clients.forEach((client) => {
    if (client.readyState === 1 /* OPEN */) client.send(msg);
  });
}

// ─── Firebase REST SSE streaming listener ────────────────────────────────────
function listenFirebaseSSE(path) {
  const url = `${DB_URL}/${path}.json`;
  const req = https.request(
    url,
    { headers: { Accept: "text/event-stream" } },
    (res) => {
      res.setEncoding("utf8");
      let buffer = "";
      res.on("data", (chunk) => {
        buffer += chunk;
        const lines = buffer.split("\n");
        buffer = lines.pop(); // keep incomplete last line
        let event = null;
        let dataLine = null;
        for (const line of lines) {
          if (line.startsWith("event:")) event = line.slice(6).trim();
          if (line.startsWith("data:")) dataLine = line.slice(5).trim();
          if (event && dataLine) {
            if (event === "put" || event === "patch") {
              try {
                const parsed = JSON.parse(dataLine);
                const val = parsed.data;
                if (path === "Solarcleaner") latestData.Solarcleaner = val;
                else if (path === "solarvoltage") latestData.solarvoltage = val;
                else if (path === "prediction") latestData.prediction = val;
                broadcast({ type: "firebase_update", data: { ...latestData } });
              } catch (_) {}
            }
            event = null;
            dataLine = null;
          }
        }
      });
      res.on("end", () => {
        console.warn(`[SSE] ${path} stream ended — reconnecting in 3s`);
        setTimeout(() => listenFirebaseSSE(path), 3000);
      });
    }
  );
  req.on("error", (err) => {
    console.error(`[SSE] ${path} error: ${err.message} — reconnecting in 5s`);
    setTimeout(() => listenFirebaseSSE(path), 5000);
  });
  req.end();
}

// Start listeners
listenFirebaseSSE("Solarcleaner");
listenFirebaseSSE("solarvoltage");
listenFirebaseSSE("prediction");

// ─── WebSocket: send snapshot on connect ─────────────────────────────────────
wss.on("connection", (ws, req) => {
  console.log(`[WS] Client connected from ${req.socket.remoteAddress}`);
  ws.send(JSON.stringify({ type: "firebase_update", data: { ...latestData } }));

  ws.on("message", (raw) => {
    try {
      const msg = JSON.parse(raw);
      if (msg.type === "ping") ws.send(JSON.stringify({ type: "pong" }));
    } catch (_) {}
  });

  ws.on("close", () => console.log("[WS] Client disconnected"));
});

// ─── REST helper: write to Firebase ─────────────────────────────────────────
async function firebasePatch(path, data) {
  const url = `${DB_URL}/${path}.json`;
  const res = await fetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Firebase responded ${res.status}`);
  return res.json();
}

async function firebaseGet(path) {
  const url = `${DB_URL}/${path}.json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Firebase responded ${res.status}`);
  return res.json();
}

// ─── REST Endpoints ──────────────────────────────────────────────────────────
app.get("/health", (_, res) =>
  res.json({ status: "ok", service: "solar-backend", port: PORT })
);

app.get("/api/data", async (req, res) => {
  try {
    const data = await firebaseGet("");
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.patch("/api/solarcleaner", async (req, res) => {
  try {
    const result = await firebasePatch("Solarcleaner", req.body);
    res.json({ success: true, updated: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.patch("/api/solarvoltage", async (req, res) => {
  try {
    const result = await firebasePatch("solarvoltage", req.body);
    res.json({ success: true, updated: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── Start ───────────────────────────────────────────────────────────────────
server.listen(PORT, () => {
  console.log(`🚀 Solar Backend + WebSocket  →  http://localhost:${PORT}`);
  console.log(`   WebSocket endpoint         →  ws://localhost:${PORT}`);
});
