import { formatTime } from "@/lib/utils";

export function TendanceVibratoire({ vibrations = [] }: { vibrations?: any[] }) {
  const chartW = 640;
  const chartH = 200;
  const maxVib = 15;

  const safeVibrations = Array.isArray(vibrations) ? vibrations : [];
  const days = safeVibrations.map(v => v.time);

  const metrics = [
    { key: "vibRms", color: "#0EA5E9", label: "RMS", scale: chartH / 15 },
    { key: "vibPeak", color: "#F43F5E", label: "Peak", scale: chartH / 30 },
    { key: "vibKurtosis", color: "#10B981", label: "Kurtosis", scale: chartH / 10 },
    { key: "temperature", color: "#F59E0B", label: "Temp", scale: chartH / 100 },
    { key: "currentRms", color: "#8B5CF6", label: "Current", scale: chartH / 50 }
  ];

  return (
    <div className="flex flex-col rounded-lg border border-black/[0.08] bg-[#0B1518] p-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-6">
        <div className="flex items-center gap-2.5">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M14.6666 8.00004H13.0133C12.4145 7.99876 11.8883 8.39682 11.7266 8.97337L10.1599 14.5467C10.1392 14.6178 10.074 14.6667 9.99992 14.6667C9.92584 14.6667 9.86066 14.6178 9.83992 14.5467L6.15992 1.45337C6.13918 1.38226 6.07399 1.33337 5.99992 1.33337C5.92584 1.33337 5.86066 1.38226 5.83992 1.45337L4.27325 7.02671C4.11225 7.60088 3.58957 7.99833 2.99325 8.00004H1.33325" stroke="#0C6CF2" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-[16px] font-semibold text-[#EAF6F5]">Analyses de Tendance Multi-Paramètres</span>
        </div>
      </div>

      {/* Chart */}
      <div className="relative w-full">
        <div className="relative w-full overflow-visible">
          <svg viewBox={`0 0 ${chartW + 80} ${chartH + 40}`} className="w-full" preserveAspectRatio="none">
            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((frac) => (
              <line key={frac} x1="0" y1={frac * chartH} x2={chartW} y2={frac * chartH} stroke="rgba(255,255,255,0.08)" strokeWidth="1.6" strokeDasharray="6.4" />
            ))}

            {/* Render all metric lines */}
            {metrics.map((m) => {
              const points = safeVibrations.map((v, i) => [
                safeVibrations.length > 1 ? (i / (safeVibrations.length - 1)) * chartW : chartW / 2,
                chartH - (((v as any)[m.key] || 0) * m.scale)
              ]);
              const polyline = points.map(([x, y]) => `${x},${y}`).join(" ");
              return (
                <polyline key={m.key} points={polyline} fill="none" stroke={m.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              );
            })}

            {/* X axis labels */}
            {(() => {
              const maxLabels = 5;
              const step = Math.max(1, Math.floor(days.length / maxLabels));
              return days.map((day, i) => {
                if (i % step !== 0 && i !== days.length - 1) return null;
                const x = i === days.length - 1 ? chartW - 10 : (i / (days.length - 1)) * chartW;
                return (
                  <text key={`${day}-${i}`} x={x} y={chartH + 28} fill="#C9EDEB" fontSize="12" fontFamily="Inter" textAnchor="middle">
                    {formatTime(day)}
                  </text>
                );
              });
            })()}
          </svg>
        </div>
      </div>

      {/* Custom Legend */}
      <div className="flex flex-wrap items-center gap-4 mt-6 pt-4 border-t border-white/5">
        {metrics.map((m) => (
          <div key={m.key} className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: m.color }} />
            <span className="text-[#C9EDEB] text-xs font-medium">{m.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
