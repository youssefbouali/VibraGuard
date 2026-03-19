import { useBlockchainKPIs } from "@/hooks/use-blockchain-kpis";

export function AuditKPICards() {
  const { data: kpis, isLoading } = useBlockchainKPIs();

  if (isLoading) return <div className="text-white p-6">Chargement...</div>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
      {/* Blocs Sécurisés */}
      <div className="flex flex-col gap-4 p-5 rounded-lg border border-black/[0.08] bg-[#0B1518] shadow-[0_4px_20px_0_rgba(0,0,0,0.15)]">
        <div className="flex justify-between items-start">
          <span className="text-[#98A6A8] text-[13px] font-medium">Blocs Sécurisés</span>
          <div className="flex w-8 h-8 items-center justify-center rounded-md bg-[rgba(0,122,61,0.15)]">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <g clipPath="url(#bsc-clip)">
                <path d="M15.84 4.80023L11.3025 1.75523C10.8146 1.42383 10.1777 1.40916 9.675 1.71773L2.2125 6.30773C1.77015 6.5806 1.50057 7.063 1.5 7.58273V11.9477C1.49925 12.4467 1.74663 12.9133 2.16 13.1927L6.6975 16.2452C7.18544 16.5766 7.82231 16.5913 8.325 16.2827L15.7875 11.6927C16.2299 11.4199 16.4994 10.9375 16.5 10.4177V6.04523C16.5008 5.5463 16.2534 5.07964 15.84 4.80023" stroke="#007A3D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M7.5 16.5002V10.5002L1.6875 6.86266M7.5 10.5002L16.3275 5.34766" stroke="#007A3D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </g>
              <defs><clipPath id="bsc-clip"><rect width="18" height="18" fill="white"/></clipPath></defs>
            </svg>
          </div>
        </div>
        <div className="flex justify-between items-end">
          <span className="text-[#E6F0F2] text-2xl font-bold leading-6">
            {kpis?.secureBlocks.toLocaleString() ?? ""}
          </span>
          <div className="flex items-end gap-[3px] h-6">
            {[9.6, 14.4, 7.2, 19.2, 24, 12, 21.6].map((h, i) => (
              <div key={i} className="w-1 rounded-sm bg-[#007A3D] opacity-80" style={{ height: `${h}px` }} />
            ))}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M4.08337 4.08301H9.91671V9.91634M4.08337 9.91634L9.91671 4.08301" stroke="#007A3D" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-[#007A3D] text-xs font-medium">
            {kpis?.secureBlocksTrend ?? ""}
          </span>
        </div>
      </div>

      {/* Contrats Intelligents */}
      <div className="flex flex-col gap-4 p-5 rounded-lg border border-black/[0.08] bg-[#0B1518] shadow-[0_4px_20px_0_rgba(0,0,0,0.15)]">
        <div className="flex justify-between items-start">
          <span className="text-[#98A6A8] text-[13px] font-medium">Contrats Intelligents</span>
          <div className="flex w-8 h-8 items-center justify-center rounded-md bg-[rgba(12,108,242,0.15)]">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M3 16.5H13.5C14.3279 16.5 15 15.8279 15 15V5.25L11.25 1.5H4.5C3.67213 1.5 3 2.17213 3 3V6" stroke="#0C6CF2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M10.5 1.5V4.5C10.5 5.32787 11.1721 6 12 6H15M3.75 9L1.5 11.25L3.75 13.5M6.75 13.5L9 11.25L6.75 9" stroke="#0C6CF2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
        <div className="flex items-end">
          <span className="text-[#E6F0F2] text-2xl font-bold leading-6">
            {kpis?.smartContracts ?? ""}
          </span>
        </div>
        <span className="text-[#98A6A8] text-xs font-medium">Actifs sur le réseau interne</span>
      </div>

      {/* Taux d'Intégrité */}
      <div className="flex flex-col gap-4 p-5 rounded-lg border border-black/[0.08] bg-[#0B1518] shadow-[0_4px_20px_0_rgba(0,0,0,0.15)]">
        <div className="flex justify-between items-start">
          <span className="text-[#98A6A8] text-[13px] font-medium">Taux d'Intégrité</span>
          <div className="flex w-8 h-8 items-center justify-center rounded-md bg-[rgba(0,122,61,0.15)]">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M15 9.75034C15 13.5003 12.375 15.3753 9.255 16.4628C9.09162 16.5182 8.91415 16.5156 8.7525 16.4553C5.625 15.3753 3 13.5003 3 9.75034V4.50034C3 4.0864 3.33606 3.75034 3.75 3.75034C5.25 3.75034 7.125 2.85034 8.43 1.71034C8.75826 1.42989 9.24174 1.42989 9.57 1.71034C10.8825 2.85784 12.75 3.75034 14.25 3.75034C14.6639 3.75034 15 4.0864 15 4.50034V9.75034" stroke="#007A3D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M6.75 9L8.25 10.5L11.25 7.5" stroke="#007A3D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
        <div className="flex items-end">
          <span className="text-[#E6F0F2] text-2xl font-bold leading-6">
            {kpis?.integrityRate ?? ""}%
          </span>
        </div>
        <div className="flex items-center gap-1">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M1.1665 7.00033C1.1665 10.2198 3.78033 12.8337 6.99984 12.8337C10.2193 12.8337 12.8332 10.2198 12.8332 7.00033C12.8332 3.78082 10.2193 1.16699 6.99984 1.16699C3.78033 1.16699 1.1665 3.78082 1.1665 7.00033V7.00033" stroke="#007A3D" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M5.25 7.00065L6.41667 8.16732L8.75 5.83398" stroke="#007A3D" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-[#007A3D] text-xs font-medium">Aucune altération détectée</span>
        </div>
      </div>

      {/* Temps de Synthèse */}
      <div className="flex flex-col gap-4 p-5 rounded-lg border border-black/[0.08] bg-[#0B1518] shadow-[0_4px_20px_0_rgba(0,0,0,0.15)]">
        <div className="flex justify-between items-start">
          <span className="text-[#98A6A8] text-[13px] font-medium">Temps de Synthèse</span>
          <div className="flex w-8 h-8 items-center justify-center rounded-md bg-[rgba(242,169,0,0.15)]">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <g clipPath="url(#ts-clip)">
                <path d="M1.5 9C1.5 13.1394 4.86064 16.5 9 16.5C13.1394 16.5 16.5 13.1394 16.5 9C16.5 4.86064 13.1394 1.5 9 1.5C4.86064 1.5 1.5 4.86064 1.5 9V9" stroke="#F2A900" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 4.5V9L12 10.5" stroke="#F2A900" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </g>
              <defs><clipPath id="ts-clip"><rect width="18" height="18" fill="white"/></clipPath></defs>
            </svg>
          </div>
        </div>
        <div className="flex items-end">
          <span className="text-[#E6F0F2] text-2xl font-bold leading-6">
            {kpis?.validationTime ?? ""}s
          </span>
        </div>
        <span className="text-[#98A6A8] text-xs font-medium">Moyenne de validation par bloc</span>
      </div>
    </div>
  );
}
