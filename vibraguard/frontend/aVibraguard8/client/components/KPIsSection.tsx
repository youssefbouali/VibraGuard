const kpis = [
  {
    value: "45%",
    title: "Réduction des pannes inattendues",
    description: "Passez d'une maintenance réactive à une stratégie 100% proactive.",
  },
  {
    value: "+20%",
    title: "Amélioration de la disponibilité",
    description: "Maximisez le temps de fonctionnement de vos équipements critiques.",
  },
  {
    value: "3.5x",
    title: "ROI sur la maintenance",
    description: "Retour sur investissement moyen constaté sur la première année.",
  },
];

export default function KPIsSection() {
  return (
    <section className="w-full py-0">
      <div className="max-w-[1280px] mx-auto px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {kpis.map((kpi) => (
            <div key={kpi.value} className="flex flex-col items-center text-center gap-3">
              <div
                className="text-[clamp(48px,5vw,64px)] font-bold leading-none tracking-[-1.92px]"
                style={{
                  background: "linear-gradient(103deg, #10B981 0%, #0EA5E9 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {kpi.value}
              </div>
              <h3 className="text-white text-xl font-semibold">{kpi.title}</h3>
              <p className="text-[#94A3B8] text-[15px] leading-6">{kpi.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
