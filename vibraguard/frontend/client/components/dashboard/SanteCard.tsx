const HEALTH_PERCENT = 78;
// SVG circle: cx=70, cy=70, r=52.5
// Circumference = 2 * π * 52.5 ≈ 329.87
const R = 52.5;
const CIRCUMFERENCE = 2 * Math.PI * R;
const DASH = CIRCUMFERENCE * (HEALTH_PERCENT / 100);
const GAP = CIRCUMFERENCE - DASH;

export function SanteCard() {
  return (
    <div className="flex flex-col rounded-lg border border-black/[0.08] bg-[#0B1518] p-6">
      {/* Card title */}
      <div className="flex items-center gap-2.5 pb-6 border-b border-black/[0.08]">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M1.33337 6.33335C1.3334 4.81465 2.26967 3.45315 3.68778 2.90962C5.10589 2.36609 6.7123 2.75305 7.72737 3.88269C7.79797 3.95817 7.89669 4.00101 8.00004 4.00101C8.10339 4.00101 8.20211 3.95817 8.27271 3.88269C9.28479 2.74549 10.8951 2.35351 12.3166 2.89834C13.7381 3.44317 14.674 4.81103 14.6667 6.33335C14.6667 7.86002 13.6667 9.00002 12.6667 10L9.00537 13.542C8.75409 13.8306 8.3909 13.9974 8.00823 13.9998C7.62556 14.0022 7.2603 13.8401 7.00537 13.5547L3.33337 10C2.33337 9.00002 1.33337 7.86669 1.33337 6.33335" stroke="#007A3D" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M2.14661 8.66671H6.33327L6.66661 8.00004L7.99994 11L9.33327 6.33337L10.3333 8.66671H13.8466" stroke="#007A3D" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span className="text-[16px] font-semibold text-[#EAF6F5]">Santé Globale</span>
      </div>

      {/* Circular progress section */}
      <div className="flex flex-col items-center py-6">
        <div className="relative flex flex-col items-center">
          <div className="relative flex items-center justify-center w-[140px] h-[140px]">
            <svg width="140" height="140" viewBox="0 0 140 140" fill="none">
              {/* Background track */}
              <circle
                cx="70"
                cy="70"
                r={R}
                stroke="rgba(0,0,0,0.04)"
                strokeWidth="11.6667"
                fill="none"
              />
              {/* Progress arc - starts from top (-90deg) */}
              <circle
                cx="70"
                cy="70"
                r={R}
                stroke="#F2A900"
                strokeWidth="11.6667"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${DASH} ${GAP}`}
                transform="rotate(-90 70 70)"
              />
            </svg>
            {/* Center percentage text */}
            <div className="absolute flex items-start">
              <span className="text-[36px] font-bold text-[#EAF6F5] leading-none">78</span>
              <span className="text-[18px] font-semibold text-[#C9EDEB] mt-1 ml-0.5">%</span>
            </div>
          </div>

          {/* État badge - overlaps bottom of circle */}
          <div className="-mt-3 z-10">
            <span className="inline-flex items-center px-[14px] py-1 rounded-[12px] border border-[rgba(242,169,0,0.30)] bg-[#2E2B14] text-[#F2A900] text-[13px] font-semibold">
              État Dégradé
            </span>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="w-full h-px bg-black/[0.08]" />

      {/* RUL prediction */}
      <div className="flex flex-col items-center gap-1.5 pt-6">
        <span className="text-[13px] font-semibold text-[#C9EDEB] tracking-[0.5px] uppercase">
          Prédiction RUL
        </span>
        <span className="text-[64px] font-bold text-[#EAF6F5] leading-none py-2">47</span>
        <span className="text-[18px] font-medium text-[#C9EDEB]">Jours restants</span>
        <div className="flex items-center gap-1.5 mt-1">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <g clipPath="url(#rul-trend-clip)">
              <path d="M9.33337 9.91675H12.8334V6.41675" stroke="#D93F3F" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12.8333 9.91658L7.87496 4.95825L4.95829 7.87492L1.16663 4.08325" stroke="#D93F3F" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
            </g>
            <defs><clipPath id="rul-trend-clip"><rect width="14" height="14" fill="white"/></clipPath></defs>
          </svg>
          <span className="text-[14px] font-medium text-[#D93F3F]">-3 jours depuis hier</span>
        </div>
      </div>
    </div>
  );
}
