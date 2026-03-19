import { useMtbfBySite } from "@/hooks/use-mtbf-by-site";

export function MtbfBySiteChart() {
  const { data: sites = [], isLoading } = useMtbfBySite();

  const maxVal = sites.length > 0 ? Math.max(...sites.map(s => s.value)) : 1;

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
        {isLoading ? (
          <div className="text-white">Chargement...</div>
        ) : (
          sites.map((site) => {
            const pct = (site.value / maxVal) * 100;
            return (
              <div key={site.name} className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[#E6F0F2] text-[14px] font-medium">{site.name}</span>
                  <span className="text-[14px] font-semibold" style={{ color: site.color }}>
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
          })
        )}
      </div>
    </div>
  );
}
