export function TendanceVibratoire() {
  // Data points mapped to a 0-100 scale (inverted: 0 = top, 100 = bottom)
  // Original: y values in 0-220 range (0 = high vibration, 220 = baseline)
  // Line points from design: (0,188.8),(64,180.8),(128,185.6),(192,164.8),(256,156.8),(320,137.6),(384,148.8),(448,108.8),(512,68.8),(576,36.8),(640,0)
  const chartW = 640;
  const chartH = 200;
  const origH = 220;
  const origW = 640;

  const rawPoints = [
    [0, 188.8],
    [64, 180.8],
    [128, 185.6],
    [192, 164.8],
    [256, 156.8],
    [320, 137.6],
    [384, 148.8],
    [448, 108.8],
    [512, 68.8],
    [576, 36.8],
    [640, 0],
  ];

  const scaleX = chartW / origW;
  const scaleY = chartH / origH;

  const points = rawPoints.map(([x, y]) => [x * scaleX, y * scaleY]);

  const polyline = points.map(([x, y]) => `${x},${y}`).join(" ");
  const areaPath =
    `M${points[0][0]},${points[0][1]} ` +
    points
      .slice(1)
      .map(([x, y]) => `L${x},${y}`)
      .join(" ") +
    ` L${chartW},${chartH} L0,${chartH} Z`;

  // Alert line Y: original 80/220 * chartH
  const alertY = (80 / origH) * chartH;
  // Critical line Y: original 32/220 * chartH
  const criticalY = (32 / origH) * chartH;

  const days = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Auj"];

  return (
    <div className="flex flex-col rounded-lg border border-black/[0.08] bg-[#0B1518] p-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-6">
        <div className="flex items-center gap-2.5">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M14.6666 8.00004H13.0133C12.4145 7.99876 11.8883 8.39682 11.7266 8.97337L10.1599 14.5467C10.1392 14.6178 10.074 14.6667 9.99992 14.6667C9.92584 14.6667 9.86066 14.6178 9.83992 14.5467L6.15992 1.45337C6.13918 1.38226 6.07399 1.33337 5.99992 1.33337C5.92584 1.33337 5.86066 1.38226 5.83992 1.45337L4.27325 7.02671C4.11225 7.60088 3.58957 7.99833 2.99325 8.00004H1.33325" stroke="#0C6CF2" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-[16px] font-semibold text-[#EAF6F5]">
            Tendance Vibratoire (mm/s RMS)
          </span>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-black/[0.08] bg-[#0D1A1F] text-[#C9EDEB] text-[12px]">
          7 Derniers Jours
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M3 4.5L6 7.5L9 4.5" stroke="#C9EDEB" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* Chart */}
      <div className="relative w-full">
        <span className="text-[11px] text-[#C9EDEB] mb-2 block">Vitesse (mm/s)</span>

        <div className="relative w-full overflow-visible">
          <svg
            viewBox={`0 0 ${chartW + 80} ${chartH + 40}`}
            className="w-full"
            preserveAspectRatio="none"
          >
            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((frac) => (
              <line
                key={frac}
                x1="0"
                y1={frac * chartH}
                x2={chartW}
                y2={frac * chartH}
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="1.6"
                strokeDasharray="6.4"
              />
            ))}

            {/* Alert threshold line */}
            <line
              x1="0"
              y1={alertY}
              x2={chartW}
              y2={alertY}
              stroke="#F2A900"
              strokeWidth="1.6"
              strokeDasharray="6.4"
            />
            <text x={chartW + 6} y={alertY + 6} fill="#F2A900" fontSize="13" fontFamily="Inter">
              Alerte
            </text>

            {/* Critical threshold line */}
            <line
              x1="0"
              y1={criticalY}
              x2={chartW}
              y2={criticalY}
              stroke="#D93F3F"
              strokeWidth="1.6"
              strokeDasharray="6.4"
            />
            <text x={chartW + 6} y={criticalY + 6} fill="#D93F3F" fontSize="13" fontFamily="Inter">
              Critique
            </text>

            {/* Area fill */}
            <defs>
              <linearGradient id="vibGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0EA5E9" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#0EA5E9" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={areaPath} fill="url(#vibGrad)" />

            {/* Line */}
            <polyline
              points={polyline}
              fill="none"
              stroke="#0C6CF2"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* End dot */}
            <circle cx={chartW} cy={0} r="8" fill="#071423" stroke="#D93F3F" strokeWidth="3.2" />
            <circle cx={chartW} cy={0} r="22" fill="#D93F3F" fillOpacity="0.2" />

            {/* Baseline */}
            <line
              x1="0"
              y1={chartH}
              x2={chartW}
              y2={chartH}
              stroke="rgba(255,255,255,0.10)"
              strokeWidth="1.6"
            />

            {/* X axis labels */}
            {days.map((day, i) => {
              const x = i === days.length - 1 ? chartW - 10 : (i / (days.length - 1)) * chartW;
              return (
                <text
                  key={day}
                  x={x}
                  y={chartH + 28}
                  fill="#C9EDEB"
                  fontSize="14"
                  fontFamily="Inter"
                  textAnchor="middle"
                >
                  {day}
                </text>
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
}
