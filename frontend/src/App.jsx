// src/App.jsx
import { useState } from "react";
import { useWebSocket } from "./hooks/useWebSocket";
import { useToast } from "./hooks/useToast";
import Header from "./components/Header";
import StatCard from "./components/StatCard";
import ScoreRing from "./components/ScoreRing";
import WebcamPanel from "./components/WebcamPanel";
import ControlPanel from "./components/ControlPanel";
import LiveChart from "./components/LiveChart";
import ToastContainer from "./components/ToastContainer";

export default function App() {
  const { data, connected } = useWebSocket();
  const { toasts, addToast } = useToast();
  const [lastPrediction, setLastPrediction] = useState(null);

  // Convenience destructure
  const sc = data?.Solarcleaner ?? {};
  const sv = data?.solarvoltage ?? {};
  const pred = data?.prediction ?? null;

  function handleSaved(status) {
    if (status === "success") {
      addToast("Settings saved to Firebase ✓", "success");
    } else {
      addToast("Failed to save — check backend connection", "error");
    }
  }

  function handlePredict(result) {
    setLastPrediction(result);
    addToast(
      `Prediction: ${result?.label ?? "—"} (${result?.score?.toFixed(1) ?? "?"}%)`,
      result?.label === "Dirty" ? "error" : result?.label === "Moderate" ? "info" : "success"
    );
  }

  return (
    <div className="app-layout">
      <Header connected={connected} />

      <main className="app-main">
        {/* ── Section: Key Metrics ─────────────────────────────────────── */}
        <div className="section-title">📊 System Overview</div>

        <div className="grid-4">
          <StatCard
            label="Solar Voltage"
            value={sv.volt}
            unit="Volts"
            icon="⚡"
            accent="linear-gradient(135deg, #fbbf24, #f59e0b)"
            description="Grid / panel output voltage"
          />
          <StatCard
            label="Forward PWM"
            value={sc.fpwm}
            unit="/ 255"
            icon="▶"
            accent="linear-gradient(135deg, #818cf8, #6366f1)"
            description="Forward motor speed signal"
          />
          <StatCard
            label="Backward PWM"
            value={sc.bpwm}
            unit="/ 255"
            icon="◀"
            accent="linear-gradient(135deg, #f472b6, #ec4899)"
            description="Reverse motor speed signal"
          />
          <StatCard
            label="Motor Delay"
            value={sc.motordelay}
            unit="ms"
            icon="⏱"
            accent="linear-gradient(135deg, #34d399, #10b981)"
            description="Delay between motor pulses"
          />
        </div>

        <div className="grid-4" style={{ marginBottom: 24 }}>
          <StatCard
            label="Threshold"
            value={sc.Threshold}
            unit="dirt level"
            icon="⚠️"
            accent="linear-gradient(135deg, #f87171, #ef4444)"
            description="Trigger level for cleaning cycle"
          />
          <StatCard
            label="Checkpoint"
            value={sc.checkpoint}
            unit="index"
            icon="📍"
            accent="var(--grad-accent)"
            description="Current cleaner position"
          />
          <StatCard
            label="Checkpoint Delay"
            value={sc.checkpointdelay}
            unit="sec"
            icon="⏳"
            accent="linear-gradient(135deg, #38bdf8, #0ea5e9)"
            description="Wait time at each checkpoint"
          />
          <StatCard
            label="Cleanliness Score"
            value={pred?.score != null ? `${Math.round(pred.score)}` : "—"}
            unit={pred?.label ?? ""}
            icon="🌟"
            accent="linear-gradient(135deg, #34d399, #38bdf8)"
            description={
              pred?.timestamp
                ? `Last: ${new Date(pred.timestamp).toLocaleTimeString()}`
                : "Awaiting inference"
            }
          />
        </div>

        {/* ── Section: Live Charts ─────────────────────────────────────── */}
        <div className="section-title">📈 Live Telemetry</div>

        <div className="grid-4" style={{ marginBottom: 24 }}>
          <LiveChart metric="voltage" value={sv.volt}     label="Voltage (V)" />
          <LiveChart metric="score"   value={pred?.score}  label="Cleanliness Score" />
          <LiveChart metric="fpwm"    value={sc.fpwm}      label="Forward PWM" />
          <LiveChart metric="bpwm"    value={sc.bpwm}      label="Backward PWM" />
        </div>

        {/* ── Section: Webcam + Score ─────────────────────────────────── */}
        <div className="section-title">🎥 Vision & Prediction</div>

        <div className="grid-3" style={{ alignItems: "start" }}>
          <WebcamPanel
            prediction={lastPrediction}
            onPredict={handlePredict}
            onStartInference={() => addToast("Auto-inference started", "info")}
            onStopInference={() => addToast("Auto-inference stopped", "info")}
          />

          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Score ring */}
            <div className="card" style={{ textAlign: "center", padding: 28 }}>
              <ScoreRing score={pred?.score} />
              {pred && (
                <div style={{ marginTop: 16, fontSize: 12, color: "var(--clr-muted)" }}>
                  Updated: {pred.timestamp ? new Date(pred.timestamp).toLocaleTimeString() : "—"}
                </div>
              )}
            </div>

            {/* Firebase raw data card */}
            <div className="card">
              <div className="card-header">
                <span className="card-title">🔥 Firebase Raw</span>
                <span
                  className={`status-dot${connected ? "" : " disconnected"}`}
                  style={{ display: "inline-block" }}
                />
              </div>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Key</th>
                    <th>Value</th>
                  </tr>
                </thead>
                <tbody>
                  {data
                    ? Object.entries({
                        "Threshold": sc.Threshold,
                        "Forward PWM": sc.fpwm,
                        "Backward PWM": sc.bpwm,
                        "Motor Delay": sc.motordelay,
                        "Checkpoint": sc.checkpoint,
                        "Chk. Delay": sc.checkpointdelay,
                        "Voltage": sv.volt,
                        "Score": pred?.score?.toFixed(1),
                      }).map(([k, v]) => (
                        <tr key={k}>
                          <td style={{ color: "var(--clr-muted)" }}>{k}</td>
                          <td style={{ fontWeight: 600, color: "var(--clr-accent)" }}>
                            {v ?? "—"}
                          </td>
                        </tr>
                      ))
                    : (
                      <tr>
                        <td colSpan={2} style={{ textAlign: "center", color: "var(--clr-muted)", padding: 20 }}>
                          Waiting for WebSocket data…
                        </td>
                      </tr>
                    )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ── Section: Control Panel ───────────────────────────────────── */}
        <div className="section-title" style={{ marginTop: 8 }}>⚙️ Control Settings</div>
        <ControlPanel solarCleaner={sc} onSaved={handleSaved} />

        <div style={{ height: 40 }} />
      </main>

      <ToastContainer toasts={toasts} />
    </div>
  );
}
