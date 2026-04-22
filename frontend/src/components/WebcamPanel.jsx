// src/components/WebcamPanel.jsx
import { useState } from "react";
import { 
  LuCamera, 
  LuPlay, 
  LuSquare, 
  LuRefreshCw, 
  LuCircleAlert,
  LuCircleDot
} from "react-icons/lu";

const PYTHON_URL = import.meta.env.VITE_PYTHON_BACKEND_URL || "http://localhost:5001";

export default function WebcamPanel({ onPredict, onStartInference, onStopInference }) {
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(true);
  const [inferenceActive, setInferenceActive] = useState(false);

  async function handlePredict() {
    setLoading(true);
    try {
      const res = await fetch(`${PYTHON_URL}/predict`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        onPredict?.(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function toggleInference() {
    const endpoint = inferenceActive ? "stop_inference" : "start_inference";
    try {
      const res = await fetch(`${PYTHON_URL}/${endpoint}`, { method: "POST" });
      const data = await res.json();
      if (data.status === "started" || data.status === "stopped") {
        setInferenceActive(!inferenceActive);
        if (inferenceActive) onStopInference?.();
        else onStartInference?.();
      }
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="webcam-card">
      <div className="webcam-header">
        <div className="flex-center gap-8">
          <LuCamera className="text-muted" />
          <span className="webcam-title">Vision Intelligence</span>
        </div>
        <div className="flex-center gap-12">
          {inferenceActive && (
            <div className="flex-center gap-4" style={{ color: "var(--clr-accent)", fontSize: 10, fontWeight: 800 }}>
              <LuCircleDot style={{ color: "var(--clr-success)" }} />
              <span>AI SCANNING</span>
            </div>
          )}
          <button 
            className="btn-secondary" 
            style={{ padding: 4, borderRadius: 4, fontSize: 14 }}
            onClick={() => setStreaming(!streaming)}
            title="Toggle Stream"
          >
            <LuRefreshCw />
          </button>
        </div>
      </div>

      <div className="webcam-body">
        {streaming ? (
          <img
            src={`${PYTHON_URL}/stream`}
            alt="Live Feed"
            onError={(e) => {
              e.target.style.display = "none";
              e.target.nextSibling.style.display = "block";
            }}
          />
        ) : null}
        <div className="webcam-no-signal" style={{ display: streaming ? "none" : "block" }}>
          <div className="flex-center flex-column gap-12">
            <LuCircleAlert style={{ fontSize: 32, opacity: 0.2 }} />
            <span>VIDEO FEED SUSPENDED</span>
          </div>
        </div>

        <div className="webcam-overlay">
          <div className="webcam-badge">
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--clr-success)' }} />
            LIVE FEED
          </div>
          <div className="webcam-badge">
            640×480 @ 15fps
          </div>
        </div>
      </div>

      <div style={{ padding: 20, display: "flex", gap: 12, background: "var(--clr-surface)" }}>
        <button
          className="btn btn-primary"
          style={{ flex: 1 }}
          onClick={handlePredict}
          disabled={loading}
        >
          {loading ? <span className="loading-spinner" /> : <><LuCamera /> Analysis Snapshot</>}
        </button>
        
        <button
          className={`btn ${inferenceActive ? "btn-danger" : "btn-success"}`}
          style={{ flex: 1 }}
          onClick={toggleInference}
        >
          {inferenceActive ? (
            <><LuSquare /> Terminate AI</>
          ) : (
            <><LuPlay /> Initiate Scan</>
          )}
        </button>
      </div>
    </div>
  );
}
