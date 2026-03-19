import { useBIKPIs } from "@/hooks/use-bi-kpis";

export function CartographieSites() {
  const { data: kpis, isLoading } = useBIKPIs();
  return (
    <div className="flex flex-col rounded-lg border border-black/[0.08] bg-[#0B1518] h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-black/[0.08]">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path
            d="M15 7.5C15 11.2448 10.8457 15.1447 9.45075 16.3492C9.18378 16.55 8.81622 16.55 8.54925 16.3492C7.15425 15.1447 3 11.2448 3 7.5C3 4.18851 5.68851 1.5 9 1.5C12.3115 1.5 15 4.18851 15 7.5"
            stroke="#98A6A8"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M6.75 7.5C6.75 8.74181 7.75819 9.75 9 9.75C10.2418 9.75 11.25 8.74181 11.25 7.5C11.25 6.25819 10.2418 5.25 9 5.25C7.75819 5.25 6.75 6.25819 6.75 7.5V7.5"
            stroke="#98A6A8"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="text-[#E6F0F2] text-[15px] font-semibold">
          Cartographie des Sites
        </span>
      </div>

      {/* Map area */}
      <div className="relative flex-1 bg-[#0D1316] rounded-b-lg overflow-hidden min-h-[300px]">
        <img
          src="https://api.builder.io/api/v1/image/assets/TEMP/ba4f479c9dbc93d9a100d39f12e8d285e84003e8?width=1304"
          alt="Cartographie des Sites Maroc"
          className="w-full h-full object-cover opacity-90"
        />

        {/* Overlay stats card */}
        <div className="absolute top-4 right-4 flex flex-col gap-4 min-w-[190px] rounded-md border border-black/[0.08] bg-[rgba(5,8,12,0.85)] backdrop-blur-[4px] px-5 py-4">
          <span className="text-[#98A6A8] text-[12px] font-semibold uppercase tracking-[0.5px]">
            État du Réseau
          </span>

          {/* Sites connectés */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-[#E6F0F2] text-[24px] font-bold leading-none">
                {isLoading ? "..." : kpis?.sitesConnected || "5"}
              </span>
              <span className="text-[#98A6A8] text-[12px] font-normal">Sites Connectés</span>
            </div>
            <div className="flex w-9 h-9 items-center justify-center rounded-lg bg-[rgba(0,122,61,0.15)] shrink-0">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path
                  d="M12.75 12H15.75C16.1639 12 16.5 12.3361 16.5 12.75V15.75C16.5 16.1639 16.1639 16.5 15.75 16.5H12.75C12.3361 16.5 12 16.1639 12 15.75V12.75C12 12.3361 12.3361 12 12.75 12V12"
                  stroke="#007A3D"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M2.25 12H5.25C5.66394 12 6 12.3361 6 12.75V15.75C6 16.1639 5.66394 16.5 5.25 16.5H2.25C1.83606 16.5 1.5 16.1639 1.5 15.75V12.75C1.5 12.3361 1.83606 12 2.25 12V12"
                  stroke="#007A3D"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M7.5 1.5H10.5C10.9139 1.5 11.25 1.83606 11.25 2.25V5.25C11.25 5.66394 10.9139 6 10.5 6H7.5C7.08606 6 6.75 5.66394 6.75 5.25V2.25C6.75 1.83606 7.08606 1.5 7.5 1.5V1.5"
                  stroke="#007A3D"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M3.75 12V9.75C3.75 9.33606 4.08606 9 4.5 9H13.5C13.9139 9 14.25 9.33606 14.25 9.75V12M9 9V6"
                  stroke="#007A3D"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>

          {/* Alertes actives */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-[#F2A900] text-[24px] font-bold leading-none">
                {isLoading ? "..." : kpis?.activeAlerts || "12"}
              </span>
              <span className="text-[#98A6A8] text-[12px] font-normal">Alertes Actives</span>
            </div>
            <div className="flex w-9 h-9 items-center justify-center rounded-lg bg-[rgba(242,169,0,0.15)] shrink-0">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path
                  d="M16.2976 13.4997L10.2976 2.99968C10.0312 2.52971 9.53276 2.23926 8.99257 2.23926C8.45238 2.23926 7.95391 2.52971 7.68757 2.99968L1.68757 13.4997C1.41839 13.9659 1.41966 14.5406 1.6909 15.0055C1.96215 15.4705 2.46177 15.7545 3.00007 15.7497H15.0001C15.5357 15.7491 16.0304 15.463 16.298 14.999C16.5655 14.535 16.5654 13.9635 16.2976 13.4997M9.00007 6.74968V9.74968M9.00007 12.7497H9.00757"
                  stroke="#F2A900"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
