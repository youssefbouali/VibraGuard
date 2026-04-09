import { useInterventions } from "@/hooks/use-interventions";

export function InterventionChart({ tab, date }: { tab: string; date: string }) {
  const { data: interventions = [], isLoading } = useInterventions();

  const preventif = interventions.find(i => i.type === "Préventif");
  const correctif = interventions.find(i => i.type === "Correctif");

  const total = interventions.reduce((acc, i) => acc + i.value, 0);
  const preventifPct = total > 0 ? Math.round((preventif?.value || 0) / total * 100) : 50;
  const correctifPct = total > 0 ? (100 - preventifPct) : 50;

  // SVG parameters for donut
  const radius = 72;
  const circumference = 2 * Math.PI * radius;
  const preventifStrokeDasharray = (preventifPct / 100) * circumference;
  const correctifStrokeDasharray = (correctifPct / 100) * circumference;

  return (
    <div className="flex flex-col rounded-lg border border-black/[0.08] bg-[#0B1518] h-full shadow-sm hover:border-white/10 transition-colors">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-black/[0.08]">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M15.9075 11.9171C14.5949 15.0212 11.3728 16.8686 8.03079 16.4332C4.68876 15.9978 2.04757 13.3866 1.57406 10.0498C1.10054 6.71295 2.91099 3.47005 5.99997 2.12207" stroke="#98A6A8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M16.5 9C16.5 4.86064 13.1394 1.5 9 1.5V9H16.5" stroke="#98A6A8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span className="text-[#E6F0F2] text-[15px] font-semibold">
          Répartition des Interventions
        </span>
      </div>

      {/* Chart */}
      <div className="flex flex-1 flex-col items-center justify-center gap-6 p-6">
        {isLoading ? (
          <div className="text-white text-sm">Chargement...</div>
        ) : (
          <>
            {/* Donut */}
            <div className="relative flex items-center justify-center w-44 h-44">
              <svg width="176" height="176" viewBox="0 0 180 180" className="-rotate-90">
                {/* Background Correctif Part */}
                <circle 
                  cx="90" 
                  cy="90" 
                  r={radius} 
                  stroke={correctif?.color || "#D32F2F"} 
                  strokeWidth="24" 
                  fill="none" 
                  strokeDasharray={`${circumference} ${circumference}`}
                  opacity="0.1"
                />
                
                {/* Correctif Segment */}
                <circle 
                  cx="90" 
                  cy="90" 
                  r={radius} 
                  stroke={correctif?.color || "#D32F2F"} 
                  strokeWidth="24" 
                  fill="none" 
                  strokeDasharray={`${correctifStrokeDasharray} ${circumference}`}
                  strokeLinecap="round"
                />

                {/* Préventif Segment */}
                <circle 
                  cx="90" 
                  cy="90" 
                  r={radius} 
                  stroke={preventif?.color || "#007A3D"} 
                  strokeWidth="24" 
                  fill="none" 
                  strokeDasharray={`${preventifStrokeDasharray} ${circumference}`}
                  strokeDashoffset={-correctifStrokeDasharray}
                  strokeLinecap="round"
                />
              </svg>

              {/* Center label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[#E6F0F2] text-3xl font-bold">{preventifPct}%</span>
                <span className="text-[#007A3D] text-[10px] uppercase font-bold tracking-widest mt-0.5">Préventif</span>
              </div>
            </div>

            {/* Legend */}
            <div className="flex flex-col gap-3 w-full max-w-[200px]">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#007A3D]" />
                    <span className="text-[#C9E7E6] text-[13px] font-medium">Préventif</span>
                  </div>
                  <span className="text-[#E6F0F2] text-[13px] font-bold">{preventif?.value || 0}</span>
               </div>
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#D93F3F]" />
                    <span className="text-[#C9E7E6] text-[13px] font-medium">Correctif</span>
                  </div>
                  <span className="text-[#E6F0F2] text-[13px] font-bold">{correctif?.value || 0}</span>
               </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
