const features = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M22 12H19.52C18.6218 11.9981 17.8325 12.5952 17.59 13.46L15.24 21.82C15.2089 21.9267 15.1111 22 15 22C14.8889 22 14.7911 21.9267 14.76 21.82L9.24 2.18C9.20889 2.07333 9.11111 2 9 2C8.88889 2 8.79111 2.07333 8.76 2.18L6.41 10.54C6.16849 11.4013 5.38448 11.9974 4.49 12H2" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: "Surveillance temps réel",
    description: "Collectez et visualisez les données vibratoires de vos équipements 24/7 avec une latence ultra-faible.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M5 21V15M12 21V3M19 21V9" stroke="#0EA5E9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: "Analyse vibrations (FFT)",
    description: "Spectre de fréquences et analyses harmoniques détaillées pour isoler les signatures de défauts (roulements, alignement).",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 20V22M12 2V4M17 20V22M17 2V4M2 12H4M2 17H4M2 7H4M20 12H22M20 17H22M20 7H22M7 20V22M7 2V4" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6 4H18C19.1038 4 20 4.89617 20 6V18C20 19.1038 19.1038 20 18 20H6C4.89617 20 4 19.1038 4 18V6C4 4.89617 4.89617 4 6 4Z" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 8H15C15.5523 8 16 8.44772 16 9V15C16 15.5523 15.5523 16 15 16H9C8.44808 16 8 15.5519 8 15V9C8 8.44808 8.44808 8 9 8Z" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: "Prédiction RUL avec IA",
    description: "Nos modèles de Machine Learning prédisent la durée de vie utile restante (Remaining Useful Life) avec >95% de précision.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10.268 21C10.6253 21.6188 11.2855 21.9999 12 21.9999C12.7145 21.9999 13.3747 21.6188 13.732 21M22 8C22 5.7 21.2 3.7 20 2M3.262 15.326C2.99509 15.6185 2.92596 16.041 3.08571 16.4034C3.24546 16.7658 3.60399 16.9997 4 17H20C20.396 17.0001 20.7547 16.7666 20.9149 16.4045C21.0751 16.0424 21.0065 15.6199 20.74 15.327C19.41 13.956 18 12.499 18 8C18 4.68851 15.3115 2 12 2C8.68851 2 6 4.68851 6 8C6 12.499 4.589 13.956 3.262 15.326M4 2C2.8 3.7 2 5.7 2 8" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: "Alertes intelligentes",
    description: "Système de notification multi-canaux (SMS, Email, Push) avec escalade automatique basée sur la criticité.",
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="w-full py-0">
      <div className="max-w-[1280px] mx-auto px-8 flex flex-col items-center gap-16">
        {/* Header */}
        <div className="flex flex-col items-center gap-4 max-w-[700px] text-center">
          <h2 className="text-white text-[clamp(28px,3vw,40px)] font-bold tracking-[-0.8px] leading-tight">
            La puissance de l'Intelligence Artificielle
          </h2>
          <p className="text-[#94A3B8] text-lg leading-[1.6]">
            Découvrez comment VibraGuard transforme vos données de vibration en insights actionnables.
          </p>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="flex flex-col gap-5 p-8 rounded-lg border border-black/[0.08] bg-[#0B1518] backdrop-blur-[12px]"
            >
              <div className="flex w-14 h-14 items-center justify-center rounded-[6px] border border-white/[0.05] bg-white/[0.05] flex-shrink-0">
                {feature.icon}
              </div>
              <h3 className="text-white text-lg font-semibold">{feature.title}</h3>
              <p className="text-[#94A3B8] text-[15px] leading-6">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
