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

// Monochromatic Chart Palette
const CHART_COLORS = {
  voltage: "#ffffff",
  score: "#a1a1aa",
  fpwm: "#52525b",
  bpwm: "#27272a",
};

export default function LiveChart({ metric, value, label }) {
  const [history, setHistory] = useState([]);
  const color = CHART_COLORS[metric] || "#ffffff";

  useEffect(() => {
    if (value == null) return;
    setHistory((prev) => {
      const next = [...prev, { value, time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }) }];
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
        backgroundColor: `${color}10`,
        fill: true,
        tension: 0.2,
        pointRadius: 0,
        pointHoverRadius: 4,
        borderWidth: 1.5,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 0 }, // Instant updates for B&W look
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#000000",
        borderColor: "rgba(255,255,255,0.1)",
        borderWidth: 1,
        titleFont: { family: 'Plus Jakarta Sans', size: 10 },
        bodyFont: { family: 'Plus Jakarta Sans', size: 12, weight: '700' },
        padding: 10,
        displayColors: false,
      },
    },
    scales: {
      x: {
        ticks: {
          maxTicksLimit: 4,
          color: "#71717a",
          font: { family: 'Plus Jakarta Sans', size: 9 },
        },
        grid: { display: false },
        border: { display: false },
      },
      y: {
        ticks: { 
          color: "#71717a", 
          font: { family: 'Plus Jakarta Sans', size: 9 },
          padding: 8,
        },
        grid: { color: "rgba(255,255,255,0.03)" },
        border: { display: false },
      },
    },
  };

  return (
    <div className="card" style={{ padding: '16px 20px' }}>
      <div className="flex-between mb-16">
        <span className="card-title">{label}</span>
        <span style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>
          {value != null ? value : "—"}
        </span>
      </div>
      <div className="chart-wrap">
        <Line data={data} options={options} />
      </div>
    </div>
  );
}
