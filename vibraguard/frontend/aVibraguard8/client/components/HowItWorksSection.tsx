const steps = [
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M21.6627 10.3478C24.7804 13.4709 24.7804 18.5287 21.6627 21.6518M25.4334 6.57715C30.6331 11.7829 30.6331 20.2167 25.4334 25.4225M6.56669 25.4225C1.36693 20.2167 1.36693 11.7829 6.56669 6.57715M10.3374 21.6518C7.21963 18.5287 7.21963 13.4709 10.3374 10.3478" stroke="#94A3B8" strokeWidth="2.66667" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M13.3334 15.9997C13.3334 17.4714 14.5283 18.6663 16 18.6663C17.4718 18.6663 18.6667 17.4714 18.6667 15.9997C18.6667 14.5279 17.4718 13.333 16 13.333C14.5283 13.333 13.3334 14.5279 13.3334 15.9997Z" stroke="#94A3B8" strokeWidth="2.66667" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    label: "1. Capteurs",
    description: "Acquisition IoT haute fréquence",
    highlight: false,
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 6.66699C4 8.87465 9.37702 10.667 16 10.667C22.623 10.667 28 8.87465 28 6.66699C28 4.45933 22.623 2.66699 16 2.66699C9.37702 2.66699 4 4.45933 4 6.66699Z" stroke="#0EA5E9" strokeWidth="2.66667" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M4 6.66699V25.3337C4 27.5413 9.37702 29.3337 16 29.3337C22.623 29.3337 28 27.5413 28 25.3337V6.66699" stroke="#0EA5E9" strokeWidth="2.66667" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M4 16C4 18.2077 9.37702 20 16 20C22.623 20 28 18.2077 28 16" stroke="#0EA5E9" strokeWidth="2.66667" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    label: "2. Data",
    description: "Stockage cloud sécurisé",
    highlight: false,
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 6.66657C16.0042 5.21483 15.2216 3.87473 13.9551 3.16515C12.6886 2.45557 11.137 2.48791 9.90117 3.24965C8.66532 4.01139 7.93921 5.38294 8.00397 6.83324C6.41594 7.24156 5.104 8.35765 4.44643 9.8597C3.78886 11.3618 3.85876 13.0828 4.63597 14.5266C3.26667 15.639 2.53609 17.3566 2.68446 19.1146C2.83282 20.8725 3.84094 22.4434 5.37731 23.3106C5.12266 25.2808 5.98417 27.2293 7.6129 28.3668C9.24162 29.5042 11.3676 29.6422 13.1297 28.7248C14.8917 27.8073 15.9979 25.9865 16 23.9999V6.66657Z" stroke="#10B981" strokeWidth="2.66667" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 17.3333C14.2892 16.528 15.8679 14.4231 16 12M8.00399 6.83333C8.03035 7.47831 8.21242 8.10733 8.53465 8.66667M4.63599 14.528C4.87991 14.3293 5.14092 14.1527 5.41599 14M7.99999 24C7.08109 24.0004 6.17768 23.7634 5.37732 23.312M16 17.3333H21.3333M16 24H24C25.4718 24 26.6667 25.1949 26.6667 26.6667V28M16 10.6667H26.6667M21.3333 10.6667V6.66667C21.3333 5.19489 22.5282 4 24 4" stroke="#10B981" strokeWidth="2.66667" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M20.6667 17.3332C20.6667 17.7011 20.9655 17.9998 21.3334 17.9998C21.7014 17.9998 22.0001 17.7011 22.0001 17.3332C22.0001 16.9652 21.7014 16.6665 21.3334 16.6665C20.9655 16.6665 20.6667 16.9652 20.6667 17.3332Z" stroke="#10B981" strokeWidth="2.66667" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M23.3333 4.00016C23.3333 4.36811 23.632 4.66683 23.9999 4.66683C24.3679 4.66683 24.6666 4.36811 24.6666 4.00016C24.6666 3.63222 24.3679 3.3335 23.9999 3.3335C23.632 3.3335 23.3333 3.63222 23.3333 4.00016Z" stroke="#10B981" strokeWidth="2.66667" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M26 28.0002C26 28.3681 26.2987 28.6668 26.6667 28.6668C27.0346 28.6668 27.3333 28.3681 27.3333 28.0002C27.3333 27.6322 27.0346 27.3335 26.6667 27.3335C26.2987 27.3335 26 27.6322 26 28.0002Z" stroke="#10B981" strokeWidth="2.66667" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M26 10.6667C26 11.0346 26.2987 11.3333 26.6667 11.3333C27.0346 11.3333 27.3333 11.0346 27.3333 10.6667C27.3333 10.2987 27.0346 10 26.6667 10C26.2987 10 26 10.2987 26 10.6667Z" stroke="#10B981" strokeWidth="2.66667" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    label: "3. IA",
    description: "Analyse & Prédiction RUL",
    highlight: true,
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12.0001 2.66699H20.0001C20.736 2.66699 21.3334 3.26444 21.3334 4.00033V6.66699C21.3334 7.40288 20.736 8.00033 20.0001 8.00033H12.0001C11.2642 8.00033 10.6667 7.40288 10.6667 6.66699V4.00033C10.6667 3.26444 11.2642 2.66699 12.0001 2.66699Z" stroke="#F59E0B" strokeWidth="2.66667" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M21.3333 5.3335H23.9999C25.4717 5.3335 26.6666 6.52839 26.6666 8.00016V26.6668C26.6666 28.1386 25.4717 29.3335 23.9999 29.3335H7.99992C6.52815 29.3335 5.33325 28.1386 5.33325 26.6668V8.00016C5.33325 6.52839 6.52815 5.3335 7.99992 5.3335H10.6666" stroke="#F59E0B" strokeWidth="2.66667" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 18.6667L14.6667 21.3333L20 16" stroke="#F59E0B" strokeWidth="2.66667" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    label: "4. Décision",
    description: "Création OT & Intervention",
    highlight: false,
  },
];

export default function HowItWorksSection() {
  return (
    <section className="w-full border-t border-b border-white/[0.05] bg-white/[0.02] py-[120px]">
      <div className="max-w-[1280px] mx-auto px-8 flex flex-col items-center gap-16">
        {/* Header */}
        <div className="flex flex-col items-center gap-4 max-w-[700px] text-center">
          <h2 className="text-white text-[clamp(28px,3vw,40px)] font-bold tracking-[-0.8px]">
            Comment ça marche ?
          </h2>
          <p className="text-[#94A3B8] text-lg leading-[1.6]">
            Un flux de données continu, du capteur jusqu'à la prise de décision.
          </p>
        </div>

        {/* Steps */}
        <div className="relative w-full max-w-[1000px] mx-auto">
          {/* Connector line */}
          <div
            className="absolute top-10 left-[10%] right-[10%] h-[2px] hidden md:block"
            style={{
              background:
                "linear-gradient(90deg, rgba(16,185,129,0.10) 0%, rgba(14,165,233,0.50) 50%, rgba(245,158,11,0.10) 100%)",
            }}
          />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {steps.map((step) => (
              <div key={step.label} className="flex flex-col items-center gap-0 text-center">
                {/* Icon circle */}
                <div
                  className={`relative z-10 mb-6 flex w-20 h-20 items-center justify-center rounded-full border backdrop-blur-[12px] bg-[#0B1518] ${
                    step.highlight
                      ? "border-[rgba(16,185,129,0.50)] shadow-[0_0_20px_0_rgba(16,185,129,0.20)]"
                      : "border-black/[0.08]"
                  }`}
                >
                  {step.icon}
                </div>
                <h4 className="text-white text-lg font-semibold mb-2">{step.label}</h4>
                <p className="text-[#94A3B8] text-sm leading-normal">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
