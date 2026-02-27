export function InterventionChart() {
  return (
    <div className="flex flex-col rounded-lg border border-black/[0.08] bg-[#0B1518] h-full">
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
        {/* Donut */}
        <div className="relative flex items-center justify-center w-44 h-44">
          <svg width="180" height="180" viewBox="0 0 180 180" fill="none">
            {/* Background circle (Correctif - 25%) */}
            <circle cx="90" cy="90" r="72" stroke="#0C6CF2" strokeWidth="25.2" fill="none" />
            {/* Foreground arc (Préventif - 75%) */}
            <path
              d="M90 18C104.221 18 118.124 22.2114 129.954 30.1029C141.785 37.9945 151.013 49.2127 156.476 62.3428C161.939 75.4728 163.391 89.9265 160.649 103.881C157.908 117.835 151.095 130.665 141.071 140.752C131.046 150.839 118.259 157.732 104.323 160.561C90.3857 163.39 75.9233 162.028 62.7593 156.648C49.5954 151.267 38.3196 142.109 30.3541 130.328C22.3887 118.547 18.0904 104.671 18.0014 90.4506"
              stroke="#007A3D"
              strokeWidth="25.2"
              fill="none"
              strokeLinecap="butt"
            />
          </svg>
          {/* Center label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[#E6F0F2] text-4xl font-bold">75%</span>
            <span className="text-[#98A6A8] text-[13px] font-medium mt-1">Préventif</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#007A3D]" />
            <span className="text-[#C9E7E6] text-[13px] font-medium">Préventif</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#0C6CF2]" />
            <span className="text-[#C9E7E6] text-[13px] font-medium">Correctif</span>
          </div>
        </div>
      </div>
    </div>
  );
}
