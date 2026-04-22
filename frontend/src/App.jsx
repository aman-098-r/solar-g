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

// Icons
import { 
  LuActivity, 
  LuZap, 
  LuCircleArrowRight, 
  LuCircleArrowLeft, 
  LuTimer, 
  LuShieldAlert, 
  LuMapPin, 
  LuHourglass, 
  LuStar,
  LuLayoutGrid,
  LuTrendingUp,
  LuVideo
} from "react-icons/lu";

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
      addToast("Settings updated successfully", "success");
    } else {
      addToast("Connection failed — verify backend status", "error");
    }
  }

  function handlePredict(result) {
    setLastPrediction(result);
    const scoreVal = result?.score?.toFixed(1) ?? "?";
    addToast(
      `Analysis Complete: ${result?.label ?? "—"} (${scoreVal}%)`,
      result?.label === "Dirty" ? "error" : "info"
    );
  }

  return (
    <div className="app-layout">
      <Header connected={connected} />

      <main className="app-main">
        {/* ── Section: Key Metrics ─────────────────────────────────────── */}
        <div className="section-title">
          <LuLayoutGrid /> System Overview
        </div>

        <div className="grid-4">
          <StatCard
            label="Solar Voltage"
            value={sv.volt}
            unit="V"
            icon={LuZap}
            description="Active panel output"
          />
          <StatCard
            label="Forward PWM"
            value={sc.fpwm}
            unit="/ 255"
            icon={LuCircleArrowRight}
            description="Active forward signal"
          />
          <StatCard
            label="Backward PWM"
            value={sc.bpwm}
            unit="/ 255"
            icon={LuCircleArrowLeft}
            description="Active reverse signal"
          />
          <StatCard
            label="Motor Delay"
            value={sc.motordelay}
            unit="ms"
            icon={LuTimer}
            description="Pulse interval latency"
          />
        </div>

        <div className="grid-4" style={{ marginBottom: 40 }}>
          <StatCard
            label="Cleaning Threshold"
            value={sc.Threshold}
            icon={LuShieldAlert}
            description="Automation trigger level"
          />
          <StatCard
            label="Current Position"
            value={sc.checkpoint}
            icon={LuMapPin}
            description="Active checkpoint index"
          />
          <StatCard
            label="Wait Duration"
            value={sc.checkpointdelay}
            unit="s"
            icon={LuHourglass}
            description="Pause time per station"
          />
          <StatCard
            label="Efficiency Score"
            value={pred?.score != null ? `${Math.round(pred.score)}` : "—"}
            unit={pred?.label ? `% ${pred.label}` : ""}
            icon={LuStar}
            description={
              pred?.timestamp
                ? `Last sync: ${new Date(pred.timestamp).toLocaleTimeString()}`
                : "Awaiting ML inference..."
            }
          />
        </div>

        {/* ── Section: Live Charts ─────────────────────────────────────── */}
        <div className="section-title">
          <LuTrendingUp /> Real-time Telemetry
        </div>

        <div className="grid-4" style={{ marginBottom: 40 }}>
          <LiveChart metric="voltage" value={sv.volt}     label="Voltage" />
          <LiveChart metric="score"   value={pred?.score}  label="Cleanliness" />
          <LiveChart metric="fpwm"    value={sc.fpwm}      label="F-PWM" />
          <LiveChart metric="bpwm"    value={sc.bpwm}      label="B-PWM" />
        </div>

        {/* ── Section: Webcam + Score ─────────────────────────────────── */}
        <div className="section-title">
          <LuVideo /> Vision & AI Analysis
        </div>

        <div className="grid-3" style={{ alignItems: "start" }}>
          <WebcamPanel
            prediction={lastPrediction}
            onPredict={handlePredict}
            onStartInference={() => addToast("Background inference active", "info")}
            onStopInference={() => addToast("Background inference paused", "info")}
          />

          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {/* Score ring */}
            <div className="card" style={{ textAlign: "center", padding: 32 }}>
              <ScoreRing score={pred?.score} />
              {pred && (
                <div style={{ marginTop: 24, fontSize: 11, color: "var(--clr-muted)", fontWeight: 600 }}>
                  LAST SYNC: {pred.timestamp ? new Date(pred.timestamp).toLocaleTimeString() : "—"}
                </div>
              )}
            </div>

            {/* Raw Data Card */}
            <div className="card">
              <div className="card-header">
                <span className="card-title">System Parameters</span>
                <span className={`status-dot${connected ? "" : " disconnected"}`} />
              </div>
              <table className="data-table">
                <tbody>
                  {[
                    ["Threshold", sc.Threshold],
                    ["F-PWM Signal", sc.fpwm],
                    ["B-PWM Signal", sc.bpwm],
                    ["Motor Latency", `${sc.motordelay}ms`],
                    ["Checkpoint", sc.checkpoint],
                    ["Voltage", `${sv.volt}V`],
                    ["ML Score", pred?.score ? `${pred.score.toFixed(1)}%` : "—"],
                  ].map(([k, v]) => (
                    <tr key={k}>
                      <td>{k}</td>
                      <td style={{ textAlign: "right" }}>
                        <strong>{v ?? "—"}</strong>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ── Section: Control Panel ───────────────────────────────────── */}
        <div className="section-title" style={{ marginTop: 16 }}>
          <LuActivity /> Configuration Settings
        </div>
        <ControlPanel solarCleaner={sc} onSaved={handleSaved} />

        <div style={{ height: 60 }} />
      </main>

      <ToastContainer toasts={toasts} />
    </div>
  );
}
