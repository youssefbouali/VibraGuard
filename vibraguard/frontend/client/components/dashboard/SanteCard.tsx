export function SanteCard({ motor }: { motor: any }) {
  const healthPercent = motor.etatPct;
  const R = 52.5;
  const CIRCUMFERENCE = 2 * Math.PI * R;
  const DASH = CIRCUMFERENCE * (healthPercent / 100);
  const GAP = CIRCUMFERENCE - DASH;

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
                stroke={`#${motor.etatColor}`}
                strokeWidth="11.6667"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${DASH} ${GAP}`}
                transform="rotate(-90 70 70)"
              />
            </svg>
            {/* Center percentage text */}
            <div className="absolute flex items-start">
              <span className="text-[36px] font-bold text-[#EAF6F5] leading-none">{healthPercent}</span>
              <span className="text-[18px] font-semibold text-[#C9EDEB] mt-1 ml-0.5">%</span>
            </div>
          </div>


        </div>
      </div>

      {/* Divider */}
      <div className="w-full h-px bg-black/[0.08]" />

    </div>
  );
}
