// src/components/Header.jsx
export default function Header({ connected }) {
  return (
    <header className="app-header">
      <div className="header-brand">
        <div className="header-brand-logo">☀️</div>
        <span className="header-brand-name">SolarGuard</span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
        <div className="header-status">
          <div className={`status-dot${connected ? "" : " disconnected"}`} />
          <span>{connected ? "Live — Connected" : "Reconnecting…"}</span>
        </div>
        <div style={{ fontSize: "12px", color: "var(--clr-muted)" }}>
          {new Date().toLocaleDateString("en-IN", {
            weekday: "short",
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </div>
      </div>
    </header>
  );
}
