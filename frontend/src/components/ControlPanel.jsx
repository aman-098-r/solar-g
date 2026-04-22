// src/components/ControlPanel.jsx
import { useState, useEffect } from "react";

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
    setManualAction(payload.fpwm > payload.bpwm ? "forward" : payload.bpwm > payload.fpwm ? "reverse" : "stop");
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
    { name: "Threshold",       label: "Threshold",          hint: "Dirt threshold (0–10)" },
    { name: "fpwm",            label: "Forward PWM",        hint: "0 – 255" },
    { name: "bpwm",            label: "Backward PWM",       hint: "0 – 255" },
    { name: "motordelay",      label: "Motor Delay (ms)",   hint: "Milliseconds" },
    { name: "checkpoint",      label: "Checkpoint",         hint: "Checkpoint index" },
    { name: "checkpointdelay", label: "Checkpoint Delay",   hint: "Seconds" },
  ];

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">⚙️ Cleaner Controls</span>
        <span style={{ fontSize: 11, color: "var(--clr-muted)" }}>Live Firebase write</span>
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
        <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
          <button
            id="btn-save-controls"
            type="submit"
            className="btn btn-primary"
            disabled={saving}
          >
            {saving ? <><span className="loading-spinner" /> Saving…</> : "💾 Save Settings"}
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
            ↺ Reset
          </button>
        </div>
      </form>

      <hr className="divider" />

      <div className="manual-mode">
        <div className="card-title" style={{ marginBottom: 16 }}>🕹️ Manual Toggling</div>
        <div className="flex gap-16" style={{ alignItems: "flex-end" }}>
          <div className="control-field" style={{ width: 120 }}>
            <label>PWM Score</label>
            <input
              type="number"
              value={manualScore}
              onChange={(e) => setManualScore(Number(e.target.value))}
              min="0"
              max="255"
            />
          </div>

          <div className="flex gap-8">
            <button
              className="btn btn-success"
              style={{ minWidth: 110 }}
              onClick={() => updateMotors({ fpwm: manualScore, bpwm: 0 })}
              disabled={manualAction === "forward"}
            >
              {manualAction === "forward" ? <span className="loading-spinner" /> : "▶ Forward"}
            </button>
            <button
              className="btn btn-danger"
              style={{ minWidth: 110 }}
              onClick={() => updateMotors({ fpwm: 0, bpwm: manualScore })}
              disabled={manualAction === "reverse"}
            >
              {manualAction === "reverse" ? <span className="loading-spinner" /> : "◀ Reverse"}
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => updateMotors({ fpwm: 0, bpwm: 0 })}
              disabled={manualAction === "stop"}
            >
              ⏹ Stop
            </button>
          </div>
        </div>
        <p className="mt-8" style={{ fontSize: 11, color: "var(--clr-muted)" }}>
          Direct action: Sets one motor to the score and stops the other.
        </p>
      </div>
    </div>

  );
}
