export function DernieresAlertes({ alerts = [] }: { alerts?: any[] }) {
  const getIcon = (level: string, color: string) => {
    const stroke = color.startsWith("#") ? color : `#${color}`;
    if (level.toLowerCase().includes("critique")) {
      return (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M18.1083 15.0001L11.4416 3.33344C11.1457 2.81126 10.5918 2.48853 9.99161 2.48853C9.3914 2.48853 8.83754 2.81126 8.54161 3.33344L1.87494 15.0001C1.57585 15.5181 1.57726 16.1566 1.87865 16.6733C2.18003 17.1899 2.73516 17.5055 3.33327 17.5001H16.6666C17.2617 17.4995 17.8114 17.1816 18.1087 16.666C18.406 16.1505 18.4058 15.5155 18.1083 15.0001M9.99994 7.50011V10.8334M9.99994 14.1668H10.0083" stroke={stroke} strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    }
    return (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M11.6666 3.33341V12.1167C12.9731 12.8711 13.6101 14.409 13.2196 15.8662C12.8292 17.3235 11.5086 18.3368 9.99989 18.3368C8.49121 18.3368 7.17062 17.3235 6.78014 15.8662C6.38967 14.409 7.02667 12.8711 8.33323 12.1167V3.33341C8.33323 2.41356 9.08004 1.66675 9.99989 1.66675C10.9198 1.66675 11.6666 2.41356 11.6666 3.33341" stroke={stroke} strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
  };

  const filteredAlerts = alerts.filter(a => a.type === "ALERT" || !a.type);
  const displayAlerts = filteredAlerts.length > 0 ? filteredAlerts : [
    { id: "fake-1", message: "Aucune alerte récente", level: "Info", time: "-", color: "#C9EDEB" }
  ];

  return (
    <div className="flex flex-col rounded-lg border border-black/[0.08] bg-[#0B1518] p-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-6">
        <div className="flex items-center gap-2.5">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <g clipPath="url(#alert-header-clip)">
              <path d="M6.84525 13.9999C7.08344 14.4124 7.52359 14.6665 7.99992 14.6665C8.47625 14.6665 8.9164 14.4124 9.15459 13.9999M14.6666 5.33325C14.6666 3.79992 14.1333 2.46659 13.3333 1.33325M2.17459 10.2173C1.99664 10.4123 1.95056 10.6939 2.05706 10.9355C2.16356 11.1771 2.40258 11.3331 2.66659 11.3333H13.3333C13.5972 11.3333 13.8364 11.1777 13.9432 10.9363C14.05 10.6948 14.0042 10.4132 13.8266 10.2179C12.9399 9.30392 11.9999 8.33259 11.9999 5.33325C11.9999 3.12559 10.2076 1.33325 7.99992 1.33325C5.79226 1.33325 3.99992 3.12559 3.99992 5.33325C3.99992 8.33259 3.05925 9.30392 2.17459 10.2173M2.66659 1.33325C1.86659 2.46659 1.33325 3.79992 1.33325 5.33325" stroke="#D93F3F" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
            </g>
            <defs><clipPath id="alert-header-clip"><rect width="16" height="16" fill="white"/></clipPath></defs>
          </svg>
          <span className="text-[16px] font-semibold text-[#EAF6F5]">Dernières Alertes</span>
        </div>
        <button className="text-[13px] font-medium text-[#0C6CF2] hover:underline">
          Voir tout
        </button>
      </div>

      {/* Alert list - Limited height with internal scroll */}
      <div className="flex flex-col gap-5 pt-2 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10">
        {displayAlerts.map((alert, idx) => (
          <div
            key={alert.id || idx}
            className={`flex items-start gap-4 ${idx < displayAlerts.length - 1 ? "pb-5 border-b border-black/[0.08]" : ""}`}
          >
            {/* Icon */}
            <div
              className="flex w-10 h-10 shrink-0 items-center justify-center rounded-full"
              style={{ background: `${alert.color}26` }}
            >
              {getIcon(alert.level, alert.color)}
            </div>

            {/* Text */}
            <div className="flex flex-col gap-1.5 flex-1 min-w-0">
              <span className="text-[15px] font-semibold text-[#EAF6F5] leading-tight">
                {alert.message}
              </span>
              <span className="text-[13px] text-[#C9EDEB] leading-tight">
                {alert.time} • {alert.level}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
