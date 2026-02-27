export function FFTChart() {
  return (
    <div className="flex flex-col rounded-lg border border-black/[0.08] bg-[#0B1518] p-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-6">
        <div className="flex items-center gap-2.5">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3.33337 14V10M8.00004 14V2M12.6667 14V6" stroke="#F2A900" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-[16px] font-semibold text-[#EAF6F5]">
            Spectre de Fréquence FFT (Axe Z)
          </span>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-black/[0.08] bg-[#0D1A1F] text-[#C9EDEB] text-[12px]">
          Instantané
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M3 4.5L6 7.5L9 4.5" stroke="#C9EDEB" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* Amplitude label */}
      <span className="text-[11px] text-[#C9EDEB] mb-3">Amplitude (mm/s)</span>

      {/* SVG Chart - direct from design, made responsive */}
      <div className="w-full overflow-x-auto">
        <svg
          viewBox="0 -22 686 282"
          className="w-full min-w-[400px]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Grid lines */}
          <line x1="23" y1="48" x2="663" y2="48" stroke="white" strokeOpacity="0.08" strokeWidth="1.6" strokeDasharray="6.4"/>
          <line x1="23" y1="96" x2="663" y2="96" stroke="white" strokeOpacity="0.08" strokeWidth="1.6" strokeDasharray="6.4"/>
          <line x1="23" y1="144" x2="663" y2="144" stroke="white" strokeOpacity="0.08" strokeWidth="1.6" strokeDasharray="6.4"/>
          <line x1="23" y1="192" x2="663" y2="192" stroke="white" strokeOpacity="0.08" strokeWidth="1.6" strokeDasharray="6.4"/>
          {/* Baseline */}
          <line x1="23" y1="240" x2="663" y2="240" stroke="white" strokeOpacity="0.2" strokeWidth="1.6"/>

          {/* Blue bars (normal harmonics) */}
          <rect x="39" y="216" width="6.4" height="24" fill="#0C6CF2" fillOpacity="0.6"/>
          <rect x="55" y="200" width="6.4" height="40" fill="#0C6CF2" fillOpacity="0.6"/>
          <rect x="71" y="227" width="6.4" height="12.8" fill="#0C6CF2" fillOpacity="0.6"/>
          <rect x="87" y="208" width="6.4" height="32" fill="#0C6CF2" fillOpacity="0.6"/>

          {/* 1X harmonic (yellow) */}
          <rect x="103" y="112" width="6.4" height="128" fill="#F2A900"/>
          <text x="106.2" y="96" fill="#F2A900" fontFamily="Inter" fontSize="16">1X</text>

          <rect x="119" y="208" width="6.4" height="32" fill="#0C6CF2" fillOpacity="0.6"/>
          <rect x="135" y="232" width="6.4" height="8" fill="#0C6CF2" fillOpacity="0.6"/>
          <rect x="151" y="200" width="6.4" height="40" fill="#0C6CF2" fillOpacity="0.6"/>
          <rect x="167" y="224" width="6.4" height="16" fill="#0C6CF2" fillOpacity="0.6"/>

          {/* 2X harmonic (red - déséquilibre) */}
          <rect x="183" y="16" width="9.6" height="224" fill="#D93F3F"/>
          <text x="183" y="10" fill="#D93F3F" fontFamily="Inter" fontSize="14" fontWeight="bold">2X (Déséquilibre)</text>

          <rect x="199" y="220.8" width="6.4" height="19.2" fill="#0C6CF2" fillOpacity="0.6"/>
          <rect x="215" y="232" width="6.4" height="8" fill="#0C6CF2" fillOpacity="0.6"/>
          <rect x="231" y="204.8" width="6.4" height="35.2" fill="#0C6CF2" fillOpacity="0.6"/>
          <rect x="247" y="208" width="6.4" height="32" fill="#0C6CF2" fillOpacity="0.6"/>

          {/* 3X harmonic (yellow) */}
          <rect x="263" y="136" width="6.4" height="104" fill="#F2A900"/>
          <text x="266.2" y="120" fill="#F2A900" fontFamily="Inter" fontSize="16">3X</text>

          <rect x="279" y="224" width="6.4" height="16" fill="#0C6CF2" fillOpacity="0.6"/>
          <rect x="295" y="232" width="6.4" height="8" fill="#0C6CF2" fillOpacity="0.6"/>
          <rect x="311" y="220.8" width="6.4" height="19.2" fill="#0C6CF2" fillOpacity="0.6"/>
          <rect x="327" y="227.2" width="6.4" height="12.8" fill="#0C6CF2" fillOpacity="0.6"/>
          <rect x="343" y="216" width="6.4" height="24" fill="#0C6CF2" fillOpacity="0.6"/>
          <rect x="359" y="224" width="6.4" height="16" fill="#0C6CF2" fillOpacity="0.6"/>
          <rect x="375" y="192" width="6.4" height="48" fill="#0C6CF2" fillOpacity="0.6"/>
          <rect x="391" y="220.8" width="6.4" height="19.2" fill="#0C6CF2" fillOpacity="0.6"/>
          <rect x="407" y="227.2" width="6.4" height="12.8" fill="#0C6CF2" fillOpacity="0.6"/>
          <rect x="423" y="192" width="6.4" height="48" fill="#0C6CF2" fillOpacity="0.6"/>
          <rect x="439" y="224" width="6.4" height="16" fill="#0C6CF2" fillOpacity="0.6"/>
          <rect x="455" y="216" width="6.4" height="24" fill="#0C6CF2" fillOpacity="0.6"/>
          <rect x="471" y="232" width="6.4" height="8" fill="#0C6CF2" fillOpacity="0.6"/>
          <rect x="487" y="220.8" width="6.4" height="19.2" fill="#0C6CF2" fillOpacity="0.6"/>
          <rect x="503" y="227.2" width="6.4" height="12.8" fill="#0C6CF2" fillOpacity="0.6"/>
          <rect x="519" y="224" width="6.4" height="16" fill="#0C6CF2" fillOpacity="0.6"/>
          <rect x="535" y="232" width="6.4" height="8" fill="#0C6CF2" fillOpacity="0.6"/>
          <rect x="551" y="200" width="6.4" height="40" fill="#0C6CF2" fillOpacity="0.6"/>
          <rect x="567" y="227.2" width="6.4" height="12.8" fill="#0C6CF2" fillOpacity="0.6"/>
          <rect x="583" y="216" width="6.4" height="24" fill="#0C6CF2" fillOpacity="0.6"/>
          <rect x="599" y="224" width="6.4" height="16" fill="#0C6CF2" fillOpacity="0.6"/>
          <rect x="615" y="232" width="6.4" height="8" fill="#0C6CF2" fillOpacity="0.6"/>
          <rect x="631" y="220.8" width="6.4" height="19.2" fill="#0C6CF2" fillOpacity="0.6"/>
          <rect x="647" y="227.2" width="6.4" height="12.8" fill="#0C6CF2" fillOpacity="0.6"/>

          {/* X axis labels */}
          <text x="23" y="258" fill="#C9EDEB" fontFamily="Inter" fontSize="13" textAnchor="middle">0 Hz</text>
          <text x="183" y="258" fill="#C9EDEB" fontFamily="Inter" fontSize="13" textAnchor="middle">50 Hz</text>
          <text x="343" y="258" fill="#C9EDEB" fontFamily="Inter" fontSize="13" textAnchor="middle">100 Hz</text>
          <text x="503" y="258" fill="#C9EDEB" fontFamily="Inter" fontSize="13" textAnchor="middle">150 Hz</text>
          <text x="663" y="258" fill="#C9EDEB" fontFamily="Inter" fontSize="13" textAnchor="middle">200 Hz</text>
        </svg>
      </div>
    </div>
  );
}
