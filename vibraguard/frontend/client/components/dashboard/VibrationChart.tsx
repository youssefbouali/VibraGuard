import { useVibrations } from "@/hooks/use-vibrations";

export function VibrationChart() {
  const { data: vibrations = [], isLoading } = useVibrations();

  return (
    <div className="flex flex-col h-full rounded-2xl border border-white/[0.08] bg-[rgba(17,26,36,0.50)] backdrop-blur-xl p-6 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.30)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M2.25 2.25V15.75H15.75" stroke="#0EA5E9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M14.25 6.75L10.5 10.5L7.5 7.5L5.25 9.75" stroke="#0EA5E9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-white text-base font-semibold">Vibrations Temps Réel</span>
        </div>
        <button className="text-[#0EA5E9] text-[13px] font-medium hover:underline">Ouvrir analyse</button>
      </div>

      {/* Chart */}
      <div className="flex-1 min-h-0 relative">
        {isLoading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-[rgba(17,26,36,0.50)] rounded-lg">
            <span className="text-white">Chargement...</span>
          </div>
        )}
        <svg viewBox="0 0 606 356" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <g clipPath="url(#vib-clip)">
            {/* Grid lines */}
            <line x1="40.35" y1="59.3" x2="606" y2="59.3" stroke="white" strokeOpacity="0.05" strokeWidth="1.2"/>
            <line x1="40.35" y1="118.6" x2="606" y2="118.6" stroke="white" strokeOpacity="0.05" strokeWidth="1.2"/>
            <line x1="40.35" y1="177.9" x2="606" y2="177.9" stroke="white" strokeOpacity="0.05" strokeWidth="1.2"/>
            <line x1="40.35" y1="237.2" x2="606" y2="237.2" stroke="white" strokeOpacity="0.05" strokeWidth="1.2"/>
            <line x1="40.35" y1="296.5" x2="606" y2="296.5" stroke="white" strokeOpacity="0.05" strokeWidth="1.2"/>

            {/* Y-axis labels */}
            <text fill="#64748B" fontFamily="Inter, sans-serif" fontSize="12" x="0" y="64">20 mm/s</text>
            <text fill="#64748B" fontFamily="Inter, sans-serif" fontSize="12" x="0" y="183">10 mm/s</text>
            <text fill="#64748B" fontFamily="Inter, sans-serif" fontSize="12" x="0" y="302">0 mm/s</text>

            {/* X-axis labels */}
            <text fill="#64748B" fontFamily="Inter, sans-serif" fontSize="12" x="72" y="334">{vibrations.length > 0 ? vibrations[0].time.split(' ').pop() : ""}</text>
            <text fill="#64748B" fontFamily="Inter, sans-serif" fontSize="12" x="274" y="334">{vibrations.length > 2 ? vibrations[Math.floor(vibrations.length/2)].time.split(' ').pop() : ""}</text>
            <text fill="#64748B" fontFamily="Inter, sans-serif" fontSize="12" x="476" y="334">{vibrations.length > 1 ? vibrations[vibrations.length-1].time.split(' ').pop() : ""}</text>

            {/* Axe X – dynamic path */}
            {vibrations.length > 1 ? (
              <>
                <path
                  d={`M ${40.35} ${296.5 - (vibrations[0].x * 11.8)} ${vibrations.slice(1).map((v, i) => `L ${40.35 + (i+1)*(565/(vibrations.length-1))} ${296.5 - (v.x * 11.8)}`).join(' ')} L 606 296.5 L 40.35 296.5 Z`}
                  fill="url(#grad-x)"
                />
                <path
                  d={`M ${40.35} ${296.5 - (vibrations[0].x * 11.8)} ${vibrations.slice(1).map((v, i) => `L ${40.35 + (i+1)*(565/(vibrations.length-1))} ${296.5 - (v.x * 11.8)}`).join(' ')}`}
                  stroke="#0EA5E9"
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                  fill="none"
                />
              </>
            ) : null}

          </g>

          <defs>
            <linearGradient id="grad-x" x1="40.35" y1="24.87" x2="40.35" y2="296.51" gradientUnits="userSpaceOnUse">
              <stop stopColor="#0EA5E9" stopOpacity="0.3"/>
              <stop offset="1" stopColor="#0EA5E9" stopOpacity="0"/>
            </linearGradient>
            <clipPath id="vib-clip">
              <rect width="605.19" height="355.81" fill="white"/>
            </clipPath>
          </defs>
        </svg>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 pt-4">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-sm bg-[#0EA5E9]" />
          <span className="text-[#94A3B8] text-xs">Vibration (mm/s)</span>
        </div>
      </div>
    </div>
  );
}
