export function FFTChart({ data }: { data?: any }) {
  // Use real data or fallback to defaults
  const dominantFreq = data?.dominantFreq || 25.0; // 1X
  const maxAmp = data?.maxAmplitude || 5.0;
  
  // Mapping frequency (0-200Hz) to SVG x-coordinates (23-663)
  const getX = (freq: number) => 23 + (freq * 3.2);
  
  // Dynamic bars positions
  const x1 = getX(dominantFreq);
  const x2 = getX(dominantFreq * 2); // 2X harmonic
  const x3 = getX(dominantFreq * 3); // 3X harmonic

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

          {/* Random background harmonics */}
          {[...Array(20)].map((_, i) => (
             <rect key={i} x={39 + (i * 32)} y={210 + Math.random() * 20} width="6.4" height={30 - Math.random() * 20} fill="#0C6CF2" fillOpacity="0.4"/>
          ))}

          {/* 1X harmonic (yellow) */}
          <rect x={x1} y={240 - (maxAmp * 15)} width="6.4" height={maxAmp * 15} fill="#F2A900"/>
          <text x={x1} y={230 - (maxAmp * 15)} fill="#F2A900" fontFamily="Inter" fontSize="12">1X</text>

          {/* 2X harmonic (red - déséquilibre) - only show if high amplitude */}
          <rect x={x2} y={240 - (maxAmp * 25)} width="8" height={maxAmp * 25} fill="#D93F3F"/>
          <text x={x2} y={230 - (maxAmp * 25)} fill="#D93F3F" fontFamily="Inter" fontSize="12" fontWeight="bold">2X</text>

          {/* 3X harmonic (yellow) */}
          <rect x={x3} y={240 - (maxAmp * 10)} width="6.4" height={maxAmp * 10} fill="#F2A900"/>
          <text x={x3} y={230 - (maxAmp * 10)} fill="#F2A900" fontFamily="Inter" fontSize="12">3X</text>

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
