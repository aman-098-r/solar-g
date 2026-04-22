// src/components/StatCard.jsx

export default function StatCard({ label, value, unit, icon, accent, description }) {
  return (
    <div
      className="stat-card"
      style={{ "--stat-accent": accent || "var(--grad-accent)" }}
    >
      <span className="stat-icon">{icon}</span>
      <div className="stat-label">{label}</div>
      <div className="stat-value">
        {value ?? <span style={{ fontSize: "20px", color: "var(--clr-muted)" }}>—</span>}
      </div>
      {unit && <div className="stat-unit">{unit}</div>}
      {description && (
        <div style={{ marginTop: 8, fontSize: 11, color: "var(--clr-muted)" }}>
          {description}
        </div>
      )}
    </div>
  );
}
