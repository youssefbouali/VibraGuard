export function VibrationChart() {
  return (
    <div className="flex flex-col h-full rounded-2xl border border-white/[0.08] bg-[rgba(17,26,36,0.50)] backdrop-blur-xl p-6 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.30)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M2.25 2.25V15.75H15.75" stroke="#0EA5E9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M14.25 6.75L10.5 10.5L7.5 7.5L5.25 9.75" stroke="#0EA5E9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-white text-base font-semibold">Vibrations Temps Réel (Multi-Axes)</span>
        </div>
        <button className="text-[#0EA5E9] text-[13px] font-medium hover:underline">Ouvrir analyse</button>
      </div>

      {/* Chart */}
      <div className="flex-1 min-h-0">
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
            <text fill="#64748B" fontFamily="Inter, sans-serif" fontSize="12" x="72" y="334">10:00</text>
            <text fill="#64748B" fontFamily="Inter, sans-serif" fontSize="12" x="274" y="334">10:30</text>
            <text fill="#64748B" fontFamily="Inter, sans-serif" fontSize="12" x="476" y="334">11:00</text>

            {/* Axe X – filled area */}
            <path
              d="M40.35 222.38C73.97 192.73 107.59 187.79 141.21 207.56C174.83 227.32 208.45 207.56 242.08 148.25C275.7 88.95 309.32 103.78 342.94 192.73C376.56 281.68 410.18 256.97 443.81 118.6C477.43 -19.77 511.05 -4.94 544.67 163.08L605.19 177.9V296.51H40.35Z"
              fill="url(#grad-x)"
            />
            <path
              d="M40.35 222.38C73.97 192.73 107.59 187.79 141.21 207.56C174.83 227.32 208.45 207.56 242.08 148.25C275.7 88.95 309.32 103.78 342.94 192.73C376.56 281.68 410.18 256.97 443.81 118.6C477.43 -19.77 511.05 -4.94 544.67 163.08L605.19 177.9"
              stroke="#0EA5E9"
              strokeWidth="2.5"
            />

            {/* Axe Y – filled area */}
            <path
              d="M40.35 266.86C80.69 247.09 121.04 242.15 161.38 252.03C201.73 261.92 242.08 247.09 282.42 207.56C322.77 168.02 363.11 172.96 403.46 222.38C443.81 271.8 474.07 256.97 494.24 177.9C514.41 98.84 531.22 108.72 544.67 207.56L605.19 192.73V296.51H40.35Z"
              fill="url(#grad-y)"
            />
            <path
              d="M40.35 266.86C80.69 247.09 121.04 242.15 161.38 252.03C201.73 261.92 242.08 247.09 282.42 207.56C322.77 168.02 363.11 172.96 403.46 222.38C443.81 271.8 474.07 256.97 494.24 177.9C514.41 98.84 531.22 108.72 544.67 207.56L605.19 192.73"
              stroke="#10B981"
              strokeWidth="2.5"
            />

            {/* Axe Z (dashed anomalie) */}
            <path
              d="M40.35 281.68L141.21 274.27L242.08 266.86L302.6 74.13L342.94 252.03L463.98 259.45L605.19 266.86"
              stroke="#A855F7"
              strokeWidth="2.5"
              strokeDasharray="5"
            />

            {/* Anomaly point */}
            <circle cx="302.6" cy="74.13" r="4" fill="#A855F7"/>
            <circle cx="302.6" cy="74.13" r="11" stroke="#A855F7" strokeWidth="1.2" opacity="0.5"/>
          </g>

          <defs>
            <linearGradient id="grad-x" x1="40.35" y1="24.87" x2="40.35" y2="296.51" gradientUnits="userSpaceOnUse">
              <stop stopColor="#0EA5E9" stopOpacity="0.3"/>
              <stop offset="1" stopColor="#0EA5E9" stopOpacity="0"/>
            </linearGradient>
            <linearGradient id="grad-y" x1="40.35" y1="125.19" x2="40.35" y2="296.51" gradientUnits="userSpaceOnUse">
              <stop stopColor="#10B981" stopOpacity="0.3"/>
              <stop offset="1" stopColor="#10B981" stopOpacity="0"/>
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
          <span className="text-[#94A3B8] text-xs">Axe X</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-sm bg-[#10B981]" />
          <span className="text-[#94A3B8] text-xs">Axe Y</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-sm bg-[#A855F7]" />
          <span className="text-[#94A3B8] text-xs">Axe Z (Anomalie)</span>
        </div>
      </div>
    </div>
  );
}
