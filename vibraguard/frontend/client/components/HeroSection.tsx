import { Link } from "react-router-dom";

export default function HeroSection() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden pt-[71px]">
      {/* Background SVG */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1440 765"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <g clipPath="url(#hero-clip)">
          <path
            d="M-312 229.5C-312 560.649 -43.149 829.5 288 829.5C619.149 829.5 888 560.649 888 229.5C888 -101.649 619.149 -370.5 288 -370.5C-43.149 -370.5 -312 -101.649 -312 229.5Z"
            fill="url(#hero-radial0)"
          />
          <path
            d="M352 535.5C352 977.032 710.468 1335.5 1152 1335.5C1593.53 1335.5 1952 977.032 1952 535.5C1952 93.968 1593.53 -264.5 1152 -264.5C710.468 -264.5 352 93.968 352 535.5Z"
            fill="url(#hero-radial1)"
          />
          <g opacity="0.15">
            <path d="M138 229.5C138 312.287 205.213 379.5 288 379.5C370.787 379.5 438 312.287 438 229.5C438 146.713 370.787 79.5 288 79.5C205.213 79.5 138 146.713 138 229.5Z" stroke="#10B981" />
            <path d="M68 229.5C68 350.921 166.579 449.5 288 449.5C409.421 449.5 508 350.921 508 229.5C508 108.079 409.421 9.5 288 9.5C166.579 9.5 68 108.079 68 229.5Z" stroke="#10B981" />
            <path d="M-12 229.5C-12 395.075 122.425 529.5 288 529.5C453.575 529.5 588 395.075 588 229.5C588 63.9255 453.575 -70.5 288 -70.5C122.425 -70.5 -12 63.9255 -12 229.5Z" stroke="#10B981" />
            <path d="M952 535.5C952 645.883 1041.62 735.5 1152 735.5C1262.38 735.5 1352 645.883 1352 535.5C1352 425.117 1262.38 335.5 1152 335.5C1041.62 335.5 952 425.117 952 535.5Z" stroke="#10B981" />
            <path d="M832 535.5C832 712.113 975.387 855.5 1152 855.5C1328.61 855.5 1472 712.113 1472 535.5C1472 358.887 1328.61 215.5 1152 215.5C975.387 215.5 832 358.887 832 535.5Z" stroke="#10B981" />
          </g>
        </g>
        <defs>
          <radialGradient id="hero-radial0" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(288 229.5) scale(600)">
            <stop stopColor="#10B981" stopOpacity="0.08" />
            <stop offset="1" stopColor="#10B981" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="hero-radial1" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(1152 535.5) scale(800)">
            <stop stopColor="#0EA5E9" stopOpacity="0.05" />
            <stop offset="1" stopColor="#0EA5E9" stopOpacity="0" />
          </radialGradient>
          <clipPath id="hero-clip">
            <rect width="1440" height="765" fill="white" />
          </clipPath>
        </defs>
      </svg>

      <div className="relative z-10 w-full max-w-[1280px] mx-auto px-8 flex flex-col lg:flex-row items-center gap-16 py-20">
        {/* Left content */}
        <div className="flex flex-col items-start gap-6 flex-1 max-w-[600px]">
          {/* Badge */}
          <div className="flex items-center px-3 py-1.5 rounded-full border border-[rgba(16,185,129,0.20)] bg-[rgba(16,185,129,0.10)]">
            <span className="text-[#007A3D] text-[13px] font-semibold">Nouveau : IA Prédictive V2.0</span>
          </div>

          {/* Heading */}
          <h1 className="text-white text-[clamp(36px,4vw,56px)] font-bold leading-[1.1] tracking-[-1.12px]">
            Surveillez vos moteurs industriels en temps réel grâce à l'IA
          </h1>

          {/* Description */}
          <p className="text-[#94A3B8] text-lg leading-[1.6]">
            La plateforme de maintenance prédictive ultime. Analysez les vibrations, prévenez les pannes et optimisez le cycle de vie de vos équipements critiques.
          </p>

          {/* CTA */}
          <Link
            to="/login"
            className="mt-4 flex px-7 py-3.5 rounded-xl bg-[#007A3D] text-white text-sm font-medium shadow-[0_4px_14px_0_rgba(16,185,129,0.20)] hover:bg-[#008f47] transition-colors"
          >
            Commencer
          </Link>
        </div>

        {/* Right: Image + Stat Cards */}
        <div className="flex-1 flex justify-center items-center relative w-full max-w-[560px]">
          {/* Motor image */}
          <img
            src="https://api.builder.io/api/v1/image/assets/TEMP/38ecc1f7be11dd4468db76165e9ac466507d621e?width=1152"
            alt="VibraGuard AI Motor"
            className="w-full rounded-2xl border border-black/[0.08] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.50),0_0_60px_0_rgba(16,185,129,0.15)] aspect-[4/3] object-cover"
          />

          {/* Top-left stat card: État de santé */}
          <div className="absolute top-6 -left-4 md:-left-10 w-[160px] rounded-[6px] border border-black/[0.08] bg-[#0B1518] backdrop-blur-[12px] shadow-[0_10px_25px_-5px_rgba(0,0,0,0.50)] p-4">
            <div className="flex items-center gap-2 mb-2">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
                <g clipPath="url(#card-clip0)">
                  <path d="M14.6666 7.99967H13.0133C12.4145 7.99839 11.8883 8.39645 11.7266 8.97301L10.1599 14.5463C10.1392 14.6175 10.074 14.6663 9.99992 14.6663C9.92584 14.6663 9.86066 14.6175 9.83992 14.5463L6.15992 1.45301C6.13918 1.3819 6.07399 1.33301 5.99992 1.33301C5.92584 1.33301 5.86066 1.3819 5.83992 1.45301L4.27325 7.02634C4.11225 7.60052 3.58957 7.99797 2.99325 7.99967H1.33325" stroke="#10B981" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
                </g>
                <defs><clipPath id="card-clip0"><rect width="16" height="16" fill="white" /></clipPath></defs>
              </svg>
              <span className="text-[#94A3B8] text-[13px]">État de santé</span>
            </div>
            <div className="text-white text-2xl font-bold">98%</div>
            <div className="text-[#94A3B8] text-xs mt-1">+2% ce mois</div>
          </div>

          {/* Bottom-right stat card: Prédiction RUL */}
          <div className="absolute bottom-6 -right-4 md:-right-10 w-[160px] rounded-[6px] border border-black/[0.08] bg-[#0B1518] backdrop-blur-[12px] shadow-[0_10px_25px_-5px_rgba(0,0,0,0.50)] p-4">
            <div className="flex items-center gap-2 mb-2">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
                <path d="M14.4866 12.0005L9.15329 2.66714C8.91654 2.24939 8.47346 1.99121 7.99329 1.99121C7.51312 1.99121 7.07004 2.24939 6.83329 2.66714L1.49995 12.0005C1.26068 12.4149 1.26181 12.9257 1.50292 13.339C1.74402 13.7524 2.18813 14.0048 2.66662 14.0005H13.3333C13.8094 14 14.2491 13.7457 14.487 13.3332C14.7248 12.9208 14.7247 12.4128 14.4866 12.0005ZM7.99995 6.00048V8.66714M7.99995 11.3338H8.00662" stroke="#EAB308" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-[#94A3B8] text-[13px]">Prédiction RUL</span>
            </div>
            <div className="text-white text-2xl font-bold">45 Jours</div>
            <div className="text-[#94A3B8] text-xs mt-1">Maintenance reco.</div>
          </div>
        </div>
      </div>
    </section>
  );
}
