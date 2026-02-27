import { Alerte } from "./AlertesTable";

interface AlertDetailProps {
  alerte: Alerte;
  onClose: () => void;
  onAcquitter: (id: string) => void;
  onEscalader: (id: string) => void;
}

const metriques = {
  velociteRMS: { label: "Vélocité RMS", value: "14.8 mm/s", highlight: true },
  accelerationPeak: { label: "Accélération Peak", value: "9.2 g", highlight: true },
  temperature: { label: "Température", value: "86 °C", highlight: false },
  scoreConfiance: { label: "Score Confiance IA", value: "96 %", highlight: false },
};

export function AlertDetail({ alerte, onClose, onAcquitter, onEscalader }: AlertDetailProps) {
  return (
    <div className="flex flex-col h-full bg-[#111A24] border-l border-white/[0.08] shadow-[-10px_0_30px_0_rgba(0,0,0,0.50)] overflow-y-auto">
      {/* Red glow top border */}
      <div className="h-1 w-full bg-[#EF4444] shadow-[0_0_15px_0_#EF4444] shrink-0" />

      {/* Header section with red gradient */}
      <div className="relative px-6 pt-6 pb-6 border-b border-white/5 bg-gradient-to-b from-[rgba(239,68,68,0.15)] to-transparent shrink-0">
        {/* Tag + close */}
        <div className="flex items-center justify-between mb-5">
          <span className="px-2 py-1 rounded border border-[rgba(239,68,68,0.20)] bg-[rgba(239,68,68,0.10)] text-[#EF4444] text-sm font-mono">
            {alerte.id}
          </span>
          <button
            onClick={onClose}
            className="flex w-5 h-5 items-center justify-center hover:opacity-70 transition-opacity"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M15 5L5 15M5 5L15 15" stroke="white" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* Title */}
        <h2 className="text-white text-xl font-bold mb-2">{alerte.typeDefaut}</h2>

        {/* Location */}
        <div className="flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
            <path d="M13.3332 6.66659C13.3332 9.99525 9.6405 13.4619 8.4005 14.5326C8.1632 14.711 7.83648 14.711 7.59917 14.5326C6.35917 13.4619 2.6665 9.99525 2.6665 6.66659C2.6665 3.72304 5.05629 1.33325 7.99984 1.33325C10.9434 1.33325 13.3332 3.72304 13.3332 6.66659" stroke="#CBD5E1" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M6 6.66675C6 7.77058 6.89617 8.66675 8 8.66675C9.10383 8.66675 10 7.77058 10 6.66675C10 5.56292 9.10383 4.66675 8 4.66675C6.89617 4.66675 6 5.56292 6 6.66675V6.66675" stroke="#CBD5E1" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-[#CBD5E1] text-[15px]">{alerte.moteur} (Zone 2)</span>
        </div>
      </div>

      {/* Vibration chart section */}
      <div className="px-6 py-6 border-b border-white/5 shrink-0">
        <div className="flex items-center gap-2 mb-4">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M14.6666 7.99992H13.0133C12.4145 7.99864 11.8883 8.3967 11.7266 8.97325L10.1599 14.5466C10.1392 14.6177 10.074 14.6666 9.99992 14.6666C9.92584 14.6666 9.86066 14.6177 9.83992 14.5466L6.15992 1.45325C6.13918 1.38214 6.07399 1.33325 5.99992 1.33325C5.92584 1.33325 5.86066 1.38214 5.83992 1.45325L4.27325 7.02659C4.11225 7.60076 3.58957 7.99821 2.99325 7.99992H1.33325" stroke="#94A3B8" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-[#94A3B8] text-[13px] font-semibold uppercase tracking-[0.65px]">
            Analyse Vibratoire (Temps Réel)
          </span>
        </div>

        {/* Chart */}
        <div className="relative rounded-lg border border-white/[0.08] bg-[#0A1118] overflow-hidden h-[140px] flex items-center justify-center">
          <svg width="100%" height="100" viewBox="0 0 369 100" fill="none" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <clipPath id="chart-clip">
                <rect width="369" height="100" fill="white"/>
              </clipPath>
              <filter id="red-glow">
                <feFlood floodOpacity="0" result="BackgroundImageFix"/>
                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                <feOffset/>
                <feGaussianBlur stdDeviation="2"/>
                <feComposite in2="hardAlpha" operator="out"/>
                <feColorMatrix type="matrix" values="0 0 0 0 0.937255 0 0 0 0 0.266667 0 0 0 0 0.266667 0 0 0 1 0"/>
                <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow"/>
                <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/>
              </filter>
            </defs>
            <g clipPath="url(#chart-clip)">
              {/* Grid lines */}
              <path d="M0 25H369" stroke="white" strokeOpacity="0.05" strokeWidth="0.96" strokeDasharray="3.85"/>
              <path d="M0 50H369" stroke="white" strokeOpacity="0.1" strokeWidth="0.96"/>
              <path d="M0 75H369" stroke="white" strokeOpacity="0.05" strokeWidth="0.96" strokeDasharray="3.85"/>
              {/* Normal vibration - green */}
              <path
                opacity="0.5"
                d="M0 50C6.15 30 12.3 30 18.45 50C24.6 70 30.75 70 36.9 50C43.05 30 49.2 30 55.35 50C61.5 70 67.65 70 73.8 50C79.95 30 86.1 30 92.25 50C98.4 70 104.55 66.67 110.7 40C116.85 13.33 123 20 129.15 60C135.3 100 141.45 96.67 147.6 50C153.75 3.33 159.9 3.33 166.05 50L175.275 10L184.5 90L193.725 5L202.95 85L212.175 20L221.4 70L230.625 50C279.825 96.67 289.05 96.67 258.3 50C227.55 3.33 233.7 3.33 276.75 50C319.8 96.67 325.95 96.67 295.2 50C264.45 3.33 270.6 3.33 313.65 50C356.7 96.67 362.85 96.67 332.1 50C301.35 3.33 307.5 3.33 350.55 50C393.6 96.67 399.75 96.67 369 50"
                stroke="#10B981"
                strokeWidth="1.44"
              />
              {/* Anomaly spike - red with glow */}
              <g filter="url(#red-glow)">
                <path
                  d="M170.663 50L175.275 10L184.5 90L193.725 5L202.95 85L212.175 20L221.4 70L226.013 50"
                  stroke="#EF4444"
                  strokeWidth="2.4"
                />
              </g>
            </g>
          </svg>
          {/* Threshold badge */}
          <div className="absolute top-2 right-2 flex items-center px-1.5 py-0.5 rounded border border-[rgba(239,68,68,0.20)] bg-[rgba(239,68,68,0.10)]">
            <span className="text-[#EF4444] text-[11px] font-semibold">Dépassement Seuil: +42%</span>
          </div>
        </div>
      </div>

      {/* Key metrics section */}
      <div className="px-6 py-6 border-b border-white/5 shrink-0">
        <div className="flex items-center gap-2 mb-4">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2 2V14H14M12 11.3333V6M8.66667 11.3333V3.33333M5.33333 11.3333V9.33333" stroke="#94A3B8" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-[#94A3B8] text-[13px] font-semibold uppercase tracking-[0.65px]">
            Métriques Clés
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Vélocité RMS */}
          <div className="flex flex-col gap-2 p-4 rounded-lg border border-white/5 bg-[rgba(10,17,24,0.60)]">
            <span className="text-[#64748B] text-xs">Vélocité RMS</span>
            <span className="text-[#EF4444] text-xl font-bold">14.8 mm/s</span>
          </div>

          {/* Accélération Peak */}
          <div className="flex flex-col gap-2 p-4 rounded-lg border border-white/5 bg-[rgba(10,17,24,0.60)]">
            <span className="text-[#64748B] text-xs">Accélération Peak</span>
            <span className="text-[#EF4444] text-xl font-bold">9.2 g</span>
          </div>

          {/* Température */}
          <div className="flex flex-col gap-2 p-4 rounded-lg border border-white/5 bg-[rgba(10,17,24,0.60)]">
            <span className="text-[#64748B] text-xs">Température</span>
            <span className="text-[#E2E8F0] text-xl font-bold">86 °C</span>
          </div>

          {/* Score Confiance IA */}
          <div className="flex flex-col gap-2 p-4 rounded-lg border border-white/5 bg-[rgba(10,17,24,0.60)]">
            <span className="text-[#64748B] text-xs">Score Confiance IA</span>
            <span className="text-[#E2E8F0] text-xl font-bold">96 %</span>
          </div>
        </div>
      </div>

      {/* AI Recommendation section */}
      <div className="px-6 py-6 border-b border-white/5 shrink-0">
        <div className="flex items-center gap-2 mb-4">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M7.99999 3.33329C8.00212 2.60741 7.61081 1.93737 6.97755 1.58258C6.34429 1.22778 5.56851 1.24395 4.95058 1.62482C4.33266 2.00569 3.9696 2.69147 4.00199 3.41662C3.20797 3.62078 2.552 4.17883 2.22322 4.92985C1.89443 5.68088 1.92938 6.5414 2.31799 7.26329C1.63334 7.8195 1.26805 8.67829 1.34223 9.55728C1.41641 10.4363 1.92047 11.2217 2.68865 11.6553C2.56133 12.6404 2.99209 13.6146 3.80645 14.1834C4.62081 14.7521 5.68379 14.8211 6.56483 14.3624C7.44587 13.9037 7.99893 12.9933 7.99999 12V3.33329" stroke="#94A3B8" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M6.00012 8.66667C7.14471 8.26402 7.93406 7.21155 8.00012 6M8.00012 8.66667H10.6668M8.00012 12H12.0001C12.736 12 13.3334 12.5974 13.3334 13.3333V14M8.00012 5.33333H13.3334" stroke="#94A3B8" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-[#94A3B8] text-[13px] font-semibold uppercase tracking-[0.65px]">
            Recommandation IA
          </span>
        </div>

        <div className="flex gap-3 p-4 rounded-lg border border-[rgba(14,165,233,0.20)] bg-[rgba(14,165,233,0.05)]">
          <div className="shrink-0 mt-0.5">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M12.5 11.6667C12.6667 10.8334 13.0833 10.2501 13.75 9.58341C14.5833 8.83341 15 7.75008 15 6.66675C15 3.90717 12.7596 1.66675 10 1.66675C7.24042 1.66675 5 3.90717 5 6.66675C5 7.50008 5.16667 8.50008 6.25 9.58341C6.83333 10.1667 7.33333 10.8334 7.5 11.6667M7.5 15.0001H12.5M8.33333 18.3334H11.6667" stroke="#0EA5E9" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <p className="text-[13px] leading-relaxed text-[#CBD5E1]">
            Forte probabilité de perte d'équilibrage suite au redémarrage récent.{" "}
            <span className="text-[#0EA5E9] font-bold">Action suggérée :</span>{" "}
            Planifier une inspection visuelle du rotor et procéder à un rééquilibrage dynamique dans les 24h pour éviter une défaillance du palier côté accouplement.
          </p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="px-6 py-6 flex flex-col gap-3 shrink-0">
        <button
          onClick={() => onEscalader(alerte.id)}
          className="flex items-center justify-center gap-2.5 h-12 rounded-lg bg-[#EF4444] shadow-[0_4px_12px_0_rgba(239,68,68,0.20)] text-white text-[15px] font-semibold hover:bg-[#dc2626] transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M5.83341 14.9998V9.99984C5.83341 7.70019 7.70044 5.83317 10.0001 5.83317C12.2997 5.83317 14.1667 7.70019 14.1667 9.99984V14.9998M4.16675 17.4998C4.16675 17.9601 4.53984 18.3332 5.00008 18.3332H15.0001C15.4603 18.3332 15.8334 17.9601 15.8334 17.4998V16.6665C15.8334 15.746 15.0872 14.9998 14.1667 14.9998H5.83341C4.91294 14.9998 4.16675 15.746 4.16675 16.6665L5.83341 14.9998M19.1667 7.49984H20.0001M17.0834 1.24984L15.0001 4.1665M1.66675 9.99984H2.50008M10.0001 1.6665V2.49984M4.10758 4.10734L4.69675 4.6965M10.0001 9.99984V14.9998" stroke="white" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Escalader au Chef d'Équipe
        </button>

        <button
          onClick={() => onAcquitter(alerte.id)}
          className="flex items-center justify-center gap-2.5 h-12 rounded-lg border border-[#10B981] text-[#10B981] text-[15px] font-semibold hover:bg-[rgba(16,185,129,0.08)] transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M1.66675 10.0003C1.66675 14.5996 5.40079 18.3337 10.0001 18.3337C14.5994 18.3337 18.3334 14.5996 18.3334 10.0003C18.3334 5.40103 14.5994 1.66699 10.0001 1.66699C5.40079 1.66699 1.66675 5.40103 1.66675 10.0003V10.0003" stroke="#10B981" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M7.50024 10.0002L9.16691 11.6668L12.5002 8.3335" stroke="#10B981" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Acquitter l'Alerte
        </button>
      </div>
    </div>
  );
}
