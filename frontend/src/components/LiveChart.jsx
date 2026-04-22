// src/components/LiveChart.jsx
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { useRef, useEffect, useState } from "react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const MAX_POINTS = 30;

const CHART_COLORS = {
  voltage: "#38bdf8",
  score: "#34d399",
  fpwm: "#818cf8",
  bpwm: "#f472b6",
};

/**
 * @param {string} metric  - "voltage" | "score" | "fpwm" | "bpwm"
 * @param {number} value   - current value to append
 * @param {string} label   - chart display label
 */
export default function LiveChart({ metric, value, label }) {
  const [history, setHistory] = useState([]);
  const color = CHART_COLORS[metric] || "#38bdf8";

  useEffect(() => {
    if (value == null) return;
    setHistory((prev) => {
      const next = [...prev, { value, time: new Date().toLocaleTimeString() }];
      return next.slice(-MAX_POINTS);
    });
  }, [value]);

  const data = {
    labels: history.map((h) => h.time),
    datasets: [
      {
        label,
        data: history.map((h) => h.value),
        borderColor: color,
        backgroundColor: `${color}18`,
        fill: true,
        tension: 0.4,
        pointRadius: 2,
        pointHoverRadius: 5,
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 300 },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          title: (ctx) => ctx[0]?.label || "",
        },
        backgroundColor: "#0f1629",
        borderColor: "rgba(99,179,237,0.2)",
        borderWidth: 1,
        titleColor: "#64748b",
        bodyColor: color,
      },
    },
    scales: {
      x: {
        ticks: {
          maxTicksLimit: 6,
          color: "#64748b",
          font: { size: 10 },
          maxRotation: 0,
        },
        grid: { color: "rgba(255,255,255,0.04)" },
        border: { display: false },
      },
      y: {
        ticks: { color: "#64748b", font: { size: 10 } },
        grid: { color: "rgba(255,255,255,0.04)" },
        border: { display: false },
      },
    },
  };

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">{label}</span>
        <span
          style={{
            fontFamily: "var(--font-head)",
            fontSize: 18,
            fontWeight: 700,
            color,
          }}
        >
          {value ?? "—"}
        </span>
      </div>
      <div className="chart-wrap">
        <Line data={data} options={options} />
      </div>
    </div>
  );
}
