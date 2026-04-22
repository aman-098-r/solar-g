// src/components/ScoreRing.jsx
import { useMemo } from "react";

const SIZE = 180;
const STROKE = 10;
const R = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * R;

function getStyles(score) {
  if (score >= 80) return { color: "#ffffff", shadow: "rgba(255,255,255,0.4)", text: "Excellent", cls: "badge-clean" };
  if (score >= 50) return { color: "#facc15", shadow: "rgba(250,204,21,0.3)", text: "Moderate", cls: "badge-moderate" };
  return { color: "#ef4444", shadow: "rgba(239,68,68,0.3)", text: "Maintenance", cls: "badge-dirty" };
}

export default function ScoreRing({ score }) {
  const safeScore = score ?? 0;
  const progress = Math.min(100, Math.max(0, safeScore));
  const { color, shadow, text, cls } = useMemo(() => getStyles(progress), [progress]);

  const dashOffset = CIRCUMFERENCE - (progress / 100) * CIRCUMFERENCE;

  return (
    <div className="score-ring-wrap">
      <div className="card-title" style={{ marginBottom: 0 }}>Efficiency Index</div>
      <div className="score-ring">
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
          {/* Background Track */}
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={R}
            fill="none"
            stroke="var(--clr-border)"
            strokeWidth={STROKE}
          />
          {/* Progress Ring */}
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={R}
            fill="none"
            stroke={color}
            strokeWidth={STROKE}
            strokeLinecap="square"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
            style={{
              transition: "stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.4s",
              filter: `drop-shadow(0 0 6px ${shadow})`,
            }}
          />
        </svg>
        <div className="score-ring-text">
          <span className="score-ring-value">
            {score != null ? Math.round(safeScore) : "—"}
          </span>
          <span className="score-ring-sub">Efficiency</span>
        </div>
      </div>
      <span className={`score-label-badge ${cls}`}>{text}</span>
    </div>
  );
}
