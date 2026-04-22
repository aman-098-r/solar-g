// src/components/StatCard.jsx
import React from "react";

export default function StatCard({ 
  label, 
  value, 
  unit, 
  icon: Icon, 
  description,
  accent // kept for backward compat if needed, but we mostly use monochrome now
}) {
  return (
    <div className="stat-card">
      <div className="stat-label">{label}</div>
      <div className="stat-value">
        {value != null ? value : "—"}
        {unit && <span className="stat-unit" style={{ marginLeft: 6 }}>{unit}</span>}
      </div>
      
      {Icon && (
        <div className="stat-icon">
          {typeof Icon === 'string' ? Icon : <Icon />}
        </div>
      )}

      {description && <div className="stat-desc">{description}</div>}
    </div>
  );
}
