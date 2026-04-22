// src/components/ScoreRing.jsx
import { useMemo } from "react";

const SIZE = 160;
const STROKE = 14;
const R = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * R;

function getColor(score) {
  if (score >= 80) return "#34d399";
  if (score >= 50) return "#fbbf24";
  return "#f87171";
}

function getLabel(score) {
  if (score >= 80) return { text: "Clean", cls: "badge-clean" };
  if (score >= 50) return { text: "Moderate", cls: "badge-moderate" };
  return { text: "Dirty", cls: "badge-dirty" };
}

export default function ScoreRing({ score }) {
  const safeScore = score ?? 0;
  const progress = Math.min(100, Math.max(0, safeScore));
  const color = useMemo(() => getColor(progress), [progress]);
  const label = useMemo(() => getLabel(progress), [progress]);

  const dashOffset = CIRCUMFERENCE - (progress / 100) * CIRCUMFERENCE;

  return (
    <div className="score-ring-wrap">
      <div className="card-title" style={{ marginBottom: 0 }}>Cleanliness Score</div>
      <div className="score-ring">
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
          {/* Track */}
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={R}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth={STROKE}
          />
          {/* Progress */}
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={R}
            fill="none"
            stroke={color}
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
            style={{
              transition: "stroke-dashoffset 0.6s cubic-bezier(0.4,0,0.2,1), stroke 0.4s",
              filter: `drop-shadow(0 0 8px ${color}80)`,
            }}
          />
        </svg>
        <div className="score-ring-text">
          <span className="score-ring-value" style={{ color }}>
            {score != null ? Math.round(safeScore) : "—"}
          </span>
          <span className="score-ring-sub">/ 100</span>
        </div>
      </div>
      <span className={`score-label-badge ${label.cls}`}>{label.text}</span>
    </div>
  );
}
