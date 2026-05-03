import { useState } from "react";
import { formatTime } from "@/lib/utils";

export function TendanceVibratoire({ vibrations = [] }: { vibrations?: any[] }) {
  const [selectedMetric, setSelectedMetric] = useState<string>("vibRms");
  const chartW = 640;
  const chartH = 200;

  const safeVibrations = Array.isArray(vibrations) ? vibrations : [];
  const days = safeVibrations.map(v => v.time);

  const METRICS = [
    { key: "vibRms", label: "RMS", color: "#0EA5E9", unit: "mm/s", scale: chartH / 15 },
    { key: "vibPeak", label: "Peak", color: "#F43F5E", unit: "mm/s", scale: chartH / 30 },
    { key: "vibKurtosis", label: "Kurtosis", color: "#10B981", unit: "", scale: chartH / 10 },
    { key: "temperature", label: "Temp", color: "#F59E0B", unit: "°C", scale: chartH / 100 },
    { key: "currentRms", label: "Current", color: "#8B5CF6", unit: "mm/s", scale: chartH / 50 }
  ];

  const currentMetric = METRICS.find(m => m.key === selectedMetric) || METRICS[0];

  return (
    <div className="flex flex-col rounded-lg border border-black/[0.08] bg-[#0B1518] p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6">
        <div className="flex items-center gap-2.5">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M14.6666 8.00004H13.0133C12.4145 7.99876 11.8883 8.39682 11.7266 8.97337L10.1599 14.5467C10.1392 14.6178 10.074 14.6667 9.99992 14.6667C9.92584 14.6667 9.86066 14.6178 9.83992 14.5467L6.15992 1.45337C6.13918 1.38226 6.07399 1.33337 5.99992 1.33337C5.92584 1.33337 5.86066 1.38226 5.83992 1.45337L4.27325 7.02671C4.11225 7.60088 3.58957 7.99833 2.99325 8.00004H1.33325" stroke={currentMetric.color} strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-[16px] font-semibold text-[#EAF6F5]">Analyse {currentMetric.label} ({currentMetric.unit})</span>
        </div>

        {/* Metric Selector Tabs */}
        <div className="flex items-center bg-[#0D1A1F] rounded-md p-1 border border-white/5">
          {METRICS.map(m => (
            <button
              key={m.key}
              onClick={() => setSelectedMetric(m.key)}
              className={`px-3 py-1 text-[11px] font-medium rounded transition-all ${
                selectedMetric === m.key 
                  ? "bg-[#0EA5E9] text-white shadow-lg" 
                  : "text-[#64748B] hover:text-[#C9EDEB]"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="relative w-full">
        <div className="relative w-full overflow-visible">
          <svg viewBox={`0 0 ${chartW + 80} ${chartH + 40}`} className="w-full" preserveAspectRatio="none">
            {/* Grid lines and Y-axis labels */}
            {[0, 0.25, 0.5, 0.75, 1].map((frac) => {
              const y = frac * chartH;
              // Simple inverse calculation for labels (approximate based on current scale)
              const maxVal = chartH / currentMetric.scale;
              const val = ((1 - frac) * maxVal).toFixed(1);
              return (
                <g key={frac}>
                  <line x1="0" y1={y} x2={chartW} y2={y} stroke="rgba(255,255,255,0.08)" strokeWidth="1.6" strokeDasharray="6.4" />
                  <text x="-10" y={y + 4} fill="#64748B" fontSize="10" textAnchor="end">
                    {val} {currentMetric.unit}
                  </text>
                </g>
              );
            })}

            {/* Render selected metric line */}
            {(() => {
              const points = safeVibrations.map((v, i) => [
                safeVibrations.length > 1 ? (i / (safeVibrations.length - 1)) * chartW : chartW / 2,
                chartH - (((v as any)[selectedMetric] || 0) * currentMetric.scale)
              ]);
              const polyline = points.map(([x, y]) => `${x},${y}`).join(" ");
              return (
                <>
                  <polyline points={polyline} fill="none" stroke={currentMetric.color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  {safeVibrations.map((v, i) => {
                    if (!v.isAnomalous) return null;
                    const x = safeVibrations.length > 1 ? (i / (safeVibrations.length - 1)) * chartW : chartW / 2;
                    const y = chartH - (((v as any)[selectedMetric] || 0) * currentMetric.scale);
                    return <circle key={i} cx={x} cy={y} r="3.5" fill="#EF4444" className="animate-pulse" />;
                  })}
                </>
              );
            })()}

            {/* X axis labels */}
            {(() => {
              const maxLabels = 5;
              const step = Math.max(1, Math.floor(days.length / maxLabels));
              return days.map((day, i) => {
                if (i % step !== 0 && i !== days.length - 1) return null;
                const x = i === days.length - 1 ? chartW - 10 : (i / (days.length - 1)) * chartW;
                return (
                  <text key={`${day}-${i}`} x={x} y={chartH + 28} fill="#64748B" fontSize="11" fontFamily="Inter" textAnchor="middle">
                    {formatTime(day)}
                  </text>
                );
              });
            })()}
          </svg>
        </div>
      </div>
    </div>
  );
}
