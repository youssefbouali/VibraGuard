const sites = [
  { name: "Site Jorf Lasfar", value: 1450, max: 1450, color: "#007A3D", textColor: "#007A3D" },
  { name: "Site Safi", value: 1220, max: 1450, color: "#057485", textColor: "#E6F0F2" },
  { name: "Site Laâyoune", value: 1180, max: 1450, color: "#0C6CF2", textColor: "#E6F0F2" },
  { name: "Site Khouribga", value: 950, max: 1450, color: "#F2A900", textColor: "#F2A900" },
  { name: "Site Benguérir", value: 840, max: 1450, color: "#D93F3F", textColor: "#D93F3F" },
];

export function MtbfBySiteChart() {
  return (
    <div className="flex flex-col rounded-lg border border-black/[0.08] bg-[#0B1518] h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-black/[0.08]">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path
            d="M2.25 2.25V15.75H15.75M5.25 12H11.25M5.25 8.25H14.25M5.25 4.5H7.5"
            stroke="#98A6A8"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="text-[#E6F0F2] text-[15px] font-semibold">
          MTBF par Site (Heures)
        </span>
      </div>

      {/* Bars */}
      <div className="flex flex-col justify-between gap-5 flex-1 p-6">
        {sites.map((site) => {
          const pct = (site.value / site.max) * 100;
          return (
            <div key={site.name} className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[#E6F0F2] text-[14px] font-medium">{site.name}</span>
                <span className="text-[14px] font-semibold" style={{ color: site.textColor }}>
                  {site.value.toLocaleString("fr-FR")} h
                </span>
              </div>
              <div className="relative h-[10px] rounded-full bg-[#0D1316] overflow-hidden">
                <div
                  className="absolute left-0 top-0 h-full rounded-full transition-all duration-500"
                  style={{ width: `${pct}%`, background: site.color }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
