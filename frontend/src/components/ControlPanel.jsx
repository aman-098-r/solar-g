// src/components/ControlPanel.jsx
import { useState, useEffect } from "react";
import { 
  LuSave, 
  LuRotateCcw, 
  LuPlay, 
  LuSquare, 
  LuSettings2, 
  LuJoystick,
  LuChevronRight,
  LuChevronLeft
} from "react-icons/lu";

const BACKEND_URL = import.meta.env.VITE_BACKEND_HTTP_URL || "http://localhost:4000";

export default function ControlPanel({ solarCleaner, onSaved }) {
  const [form, setForm] = useState({
    Threshold: "",
    bpwm: "",
    checkpoint: "",
    checkpointdelay: "",
    fpwm: "",
    motordelay: "",
  });
  const [saving, setSaving] = useState(false);
  const [manualScore, setManualScore] = useState(255);
  const [manualAction, setManualAction] = useState(null); // 'forward' | 'reverse' | 'stop'

  useEffect(() => {
    if (solarCleaner) {
      setForm({
        Threshold: solarCleaner.Threshold ?? "",
        bpwm: solarCleaner.bpwm ?? "",
        checkpoint: solarCleaner.checkpoint ?? "",
        checkpointdelay: solarCleaner.checkpointdelay ?? "",
        fpwm: solarCleaner.fpwm ?? "",
        motordelay: solarCleaner.motordelay ?? "",
      });
    }
  }, [solarCleaner]);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function updateMotors(payload) {
    const action = payload.fpwm > payload.bpwm ? "forward" : payload.bpwm > payload.fpwm ? "reverse" : "stop";
    setManualAction(action);
    try {
      const res = await fetch(`${BACKEND_URL}/api/solarcleaner`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      onSaved?.(json.success ? "success" : "error");
    } catch (err) {
      console.error(err);
      onSaved?.("error");
    } finally {
      setManualAction(null);
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {};
      for (const [k, v] of Object.entries(form)) {
        if (v !== "") payload[k] = Number(v);
      }
      const res = await fetch(`${BACKEND_URL}/api/solarcleaner`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      onSaved?.(json.success ? "success" : "error");
    } catch (err) {
      console.error(err);
      onSaved?.("error");
    } finally {
      setSaving(false);
    }
  }

  const fields = [
    { name: "Threshold",       label: "Threshold",          hint: "Automation trigger" },
    { name: "fpwm",            label: "Forward PWM",        hint: "Range 0–255" },
    { name: "bpwm",            label: "Backward PWM",       hint: "Range 0–255" },
    { name: "motordelay",      label: "Motor Delay",        hint: "Latency in ms" },
    { name: "checkpoint",      label: "Station Index",      hint: "Current unit pos" },
    { name: "checkpointdelay", label: "Pause Time",         hint: "Wait in seconds" },
  ];

  return (
    <div className="card">
      <div className="card-header">
        <div className="flex-center gap-8">
          <LuSettings2 className="text-muted" />
          <span className="card-title">System Configuration</span>
        </div>
        <span style={{ fontSize: 10, fontWeight: 700, color: "var(--clr-muted)", textTransform: "uppercase" }}>Live SSE Push</span>
      </div>

      <form onSubmit={handleSave}>
        <div className="control-grid">
          {fields.map(({ name, label, hint }) => (
            <div key={name} className="control-field">
              <label htmlFor={`ctrl-${name}`}>{label}</label>
              <input
                id={`ctrl-${name}`}
                name={name}
                type="number"
                value={form[name]}
                onChange={handleChange}
                placeholder={hint}
              />
            </div>
          ))}
        </div>
        <div className="mt-16 flex gap-12">
          <button
            id="btn-save-controls"
            type="submit"
            className="btn btn-primary"
            disabled={saving}
          >
            {saving ? <><span className="loading-spinner" /> Updating…</> : <><LuSave /> Commit Changes</>}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() =>
              setForm({
                Threshold: solarCleaner?.Threshold ?? "",
                bpwm: solarCleaner?.bpwm ?? "",
                checkpoint: solarCleaner?.checkpoint ?? "",
                checkpointdelay: solarCleaner?.checkpointdelay ?? "",
                fpwm: solarCleaner?.fpwm ?? "",
                motordelay: solarCleaner?.motordelay ?? "",
              })
            }
          >
            <LuRotateCcw /> Reset
          </button>
        </div>
      </form>

      <hr className="divider" />

      <div className="manual-mode">
        <div className="flex-center gap-8 mb-16">
          <LuJoystick className="text-muted" />
          <span className="card-title">Manual Override</span>
        </div>
        
        <div className="flex gap-16" style={{ alignItems: "flex-end" }}>
          <div className="control-field" style={{ width: 140 }}>
            <label>Master PWM Score</label>
            <input
              type="number"
              value={manualScore}
              onChange={(e) => setManualScore(Number(e.target.value))}
              min="0"
              max="255"
            />
          </div>

          <div className="flex gap-12">
            <button
              className="btn btn-primary"
              style={{ minWidth: 120 }}
              onClick={() => updateMotors({ fpwm: manualScore, bpwm: 0 })}
              disabled={manualAction === "forward"}
            >
              {manualAction === "forward" ? <span className="loading-spinner" /> : <><LuChevronRight /> Forward</>}
            </button>
            <button
              className="btn btn-primary"
              style={{ minWidth: 120 }}
              onClick={() => updateMotors({ fpwm: 0, bpwm: manualScore })}
              disabled={manualAction === "reverse"}
            >
              {manualAction === "reverse" ? <span className="loading-spinner" /> : <><LuChevronLeft /> Reverse</>}
            </button>
            <button
              className="btn btn-danger"
              style={{ minWidth: 100 }}
              onClick={() => updateMotors({ fpwm: 0, bpwm: 0 })}
              disabled={manualAction === "stop"}
            >
              {manualAction === "stop" ? <span className="loading-spinner" /> : <><LuSquare /> Stop</>}
            </button>
          </div>
        </div>
        <p className="mt-16" style={{ fontSize: 11, color: "var(--clr-muted)", fontWeight: 500 }}>
          Direct low-latency injection: Toggles active motor state and stops opposing drive immediately.
        </p>
      </div>
    </div>
  );
}
