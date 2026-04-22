// src/components/Header.jsx
import React from "react";
import { LuZap, LuShieldCheck, LuShieldAlert } from "react-icons/lu";

export default function Header({ connected }) {
  return (
    <header className="app-header">
      <div className="header-brand">
        <div className="header-brand-logo">
          <LuZap />
        </div>
        <div className="header-brand-name">Surya.dev</div>
      </div>

      <div className="header-status">
        {connected ? (
          <>
            <LuShieldCheck />
            <span>Telemetry Active</span>
            <div className="status-dot" />
          </>
        ) : (
          <>
            <LuShieldAlert />
            <span>Connection Offline</span>
            <div className="status-dot disconnected" />
          </>
        )}
      </div>
    </header>
  );
}
