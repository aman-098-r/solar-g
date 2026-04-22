// src/components/WebcamPanel.jsx
import { useEffect, useMemo, useState } from "react";

const PYTHON_URL = import.meta.env.VITE_PYTHON_URL || "http://localhost:5001";

function resolvePythonBaseUrl(configured) {
  if (typeof window === "undefined") return configured;
  const uiHost = window.location.hostname || "localhost";
  if (
    uiHost &&
    uiHost !== "localhost" &&
    uiHost !== "127.0.0.1" &&
    configured.includes("localhost")
  ) {
    return configured.replace("localhost", uiHost);
  }
  return configured;
}

export default function WebcamPanel({ prediction, onPredict, onStartInference, onStopInference }) {
  const [inferenceRunning, setInferenceRunning] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [predicting, setPredicting] = useState(false);
  const [streamNonce, setStreamNonce] = useState(Date.now());
  const pythonBaseUrl = useMemo(() => resolvePythonBaseUrl(PYTHON_URL), []);

  const streamUrl = useMemo(
    () => `${pythonBaseUrl}/stream?t=${streamNonce}`,
    [pythonBaseUrl, streamNonce]
  );

  useEffect(() => {
    if (!imgError) return;
    const timer = setTimeout(() => {
      // Force a fresh request so the stream can recover after backend restarts.
      setStreamNonce(Date.now());
    }, 2000);
    return () => clearTimeout(timer);
  }, [imgError]);

  async function handlePredict() {
    setPredicting(true);
    try {
      const res = await fetch(`${pythonBaseUrl}/predict`, { method: "POST" });
      const json = await res.json();
      onPredict?.(json);
    } catch (e) {
      console.error("Predict failed:", e);
    } finally {
      setPredicting(false);
    }
  }

  async function handleToggleInference() {
    if (inferenceRunning) {
      await fetch(`${pythonBaseUrl}/stop_inference`, { method: "POST" });
      setInferenceRunning(false);
      onStopInference?.();
    } else {
      await fetch(`${pythonBaseUrl}/start_inference`, { method: "POST" });
      setInferenceRunning(true);
      onStartInference?.();
    }
  }

  return (
    <div className="webcam-card">
      <div className="webcam-header">
        <div>
          <div className="webcam-title">🎥 Live Solar Panel Feed</div>
          <div style={{ fontSize: 12, color: "var(--clr-muted)", marginTop: 2 }}>
            MJPEG stream from Python • {pythonBaseUrl}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            id="btn-predict-once"
            className="btn btn-secondary"
            onClick={handlePredict}
            disabled={predicting}
          >
            {predicting ? (
              <><span className="loading-spinner" /> Analysing…</>
            ) : (
              <>🔍 Predict Once</>
            )}
          </button>
          <button
            id="btn-toggle-inference"
            className={`btn ${inferenceRunning ? "btn-danger" : "btn-success"}`}
            onClick={handleToggleInference}
          >
            {inferenceRunning ? "⏹ Stop Auto" : "▶ Auto Infer"}
          </button>
        </div>
      </div>

      <div className="webcam-body">
        <img
          id="webcam-stream"
          src={streamUrl}
          alt="Solar panel live feed"
          onError={() => setImgError(true)}
          onLoad={() => setImgError(false)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: imgError ? "none" : "block",
          }}
        />

        {imgError && (
          <div className="webcam-no-signal">
            <div style={{ fontSize: 40, marginBottom: 12 }}>📷</div>
            <div style={{ fontWeight: 600, marginBottom: 6 }}>Python stream temporarily unavailable</div>
            <div style={{ fontSize: 12 }}>
              Reconnecting stream... If needed run{" "}
              <code style={{ color: "var(--clr-accent)" }}>uvicorn main:app --port 5001</code>
            </div>
          </div>
        )}

        {!imgError && (
          <div className="webcam-overlay">
            <div className="webcam-badge">
              <span style={{ color: "#f87171", fontSize: 16 }}>●</span> LIVE
            </div>
            {inferenceRunning && (
              <div className="webcam-badge">
                <span className="loading-spinner" /> Auto-Inference ON
              </div>
            )}
          </div>
        )}
      </div>

      {/* Prediction result bar */}
      {prediction && (
        <div
          style={{
            padding: "12px 20px",
            borderTop: "1px solid var(--clr-border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 12, color: "var(--clr-muted)" }}>Last prediction</span>
            {prediction.stub && (
              <span
                className="tag"
                style={{
                  background: "rgba(251,191,36,0.1)",
                  color: "var(--clr-warning)",
                  border: "1px solid rgba(251,191,36,0.3)",
                }}
              >
                Stub / No model
              </span>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 22, fontWeight: 700, color: "var(--clr-accent)" }}>
              {prediction.score?.toFixed(1)}
            </span>
            <span
              className={`score-label-badge ${
                prediction.label === "Clean"
                  ? "badge-clean"
                  : prediction.label === "Moderate"
                  ? "badge-moderate"
                  : "badge-dirty"
              }`}
            >
              {prediction.label}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
