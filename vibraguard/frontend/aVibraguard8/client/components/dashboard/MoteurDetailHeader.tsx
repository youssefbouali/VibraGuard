export function MoteurDetailHeader() {
  return (
    <div className="relative rounded-lg border border-black/[0.08] bg-[#0B1518] overflow-hidden">
      {/* Top gradient border */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#F2A900] to-[#D93F3F] z-10" />

      <div className="flex flex-col sm:flex-row sm:items-center gap-8 p-6 pt-7">
        {/* Motor image */}
        <img
          src="https://api.builder.io/api/v1/image/assets/TEMP/f93ab530be3aa3f9cf08b15729571e3e3eeaa4d8?width=280"
          alt="Moteur M-0456"
          className="w-[140px] h-[140px] rounded-md border border-black/[0.08] object-cover shrink-0"
        />

        {/* Info - takes remaining space */}
        <div className="flex flex-col gap-4 flex-1 min-w-0">
          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center px-3 py-1.5 rounded text-[12px] font-semibold text-[#0C6CF2] bg-[rgba(12,108,242,0.15)] border border-[rgba(12,108,242,0.30)]">
              Broyeur Phosphate
            </span>
            <span className="inline-flex items-center px-3 py-1.5 rounded text-[12px] font-semibold text-[#C9EDEB] bg-[rgba(201,237,235,0.10)] border border-[rgba(201,237,235,0.20)]">
              Zone 2
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-[12px] font-semibold text-[#D93F3F] bg-[rgba(217,63,63,0.15)] border border-[rgba(217,63,63,0.30)]">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <g clipPath="url(#critique-clip)">
                  <path d="M1 6C1 8.75958 3.24042 11 6 11C8.75958 11 11 8.75958 11 6C11 3.24042 8.75958 1 6 1C3.24042 1 1 3.24042 1 6V6" stroke="#D93F3F" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M6 4V6M6 8H6.005" stroke="#D93F3F" strokeLinecap="round" strokeLinejoin="round"/>
                </g>
                <defs><clipPath id="critique-clip"><rect width="12" height="12" fill="white"/></clipPath></defs>
              </svg>
              Critique
            </span>
          </div>

          {/* Title */}
          <h1 className="text-[28px] font-bold text-[#EAF6F5] leading-tight">Moteur M-0456</h1>

          {/* Specs */}
          <div className="flex flex-wrap items-center gap-6 sm:gap-8">
            <div className="flex items-center gap-2">
              <span className="text-[14px] font-medium text-[#C9EDEB]">ID:</span>
              <span className="text-[14px] font-medium text-[#EAF6F5]">#MTR-0456</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[14px] font-medium text-[#C9EDEB]">Puissance:</span>
              <span className="text-[14px] font-medium text-[#EAF6F5]">450 kW</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[14px] font-medium text-[#C9EDEB]">Vitesse:</span>
              <span className="text-[14px] font-medium text-[#EAF6F5]">1480 RPM</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[14px] font-medium text-[#C9EDEB]">Installé le:</span>
              <span className="text-[14px] font-medium text-[#EAF6F5]">12 Sept 2022</span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-3 shrink-0 sm:items-end">
          <button className="flex items-center gap-2 px-5 h-11 rounded-md bg-[#007A3D] hover:bg-[#006633] transition-colors text-white text-[14px] font-semibold whitespace-nowrap">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2.91675 6.99996H11.0834M7.00008 2.91663V11.0833" stroke="white" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Créer OT
          </button>
          <button className="flex items-center gap-2 px-5 h-11 rounded-md border border-black/[0.08] bg-transparent hover:bg-white/5 transition-colors text-[#EAF6F5] text-[14px] font-semibold whitespace-nowrap">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3.49992 12.8333C2.85602 12.8333 2.33325 12.3105 2.33325 11.6666V2.33329C2.33325 1.68939 2.85602 1.16663 3.49992 1.16663H8.16658C8.53955 1.16602 8.89734 1.31426 9.16058 1.57846L11.2536 3.67146C11.5185 3.9348 11.6672 4.29309 11.6666 4.66663V11.6666C11.6666 12.3105 11.1438 12.8333 10.4999 12.8333H3.49992" stroke="#EAF6F5" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M8.16675 1.16663V4.08329C8.16675 4.40524 8.42813 4.66663 8.75008 4.66663H11.6667M5.83341 5.24996H4.66675M9.33341 7.58329H4.66675M9.33341 9.91663H4.66675" stroke="#EAF6F5" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Rapport Complet
          </button>
        </div>
      </div>
    </div>
  );
}
