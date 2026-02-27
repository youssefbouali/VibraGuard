import { cn } from "@/lib/utils";

type MoteurStatus = "ok" | "critical" | "warning";

interface Moteur {
  id: string;
  status: MoteurStatus;
  iconType: "turbine" | "cpu" | "settings" | "waves";
}

const moteurs: Moteur[] = [
  { id: "M-01", status: "ok", iconType: "turbine" },
  { id: "M-02", status: "ok", iconType: "turbine" },
  { id: "M-03", status: "ok", iconType: "cpu" },
  { id: "M-04", status: "critical", iconType: "settings" },
  { id: "M-05", status: "ok", iconType: "cpu" },
  { id: "M-06", status: "ok", iconType: "turbine" },
  { id: "M-07", status: "ok", iconType: "settings" },
  { id: "M-08", status: "warning", iconType: "waves" },
  { id: "M-09", status: "ok", iconType: "cpu" },
  { id: "M-10", status: "ok", iconType: "waves" },
  { id: "M-11", status: "ok", iconType: "turbine" },
  { id: "M-12", status: "warning", iconType: "settings" },
  { id: "M-13", status: "ok", iconType: "cpu" },
  { id: "M-14", status: "ok", iconType: "waves" },
  { id: "M-15", status: "ok", iconType: "settings" },
  { id: "M-16", status: "ok", iconType: "turbine" },
];

const statusDotColor: Record<MoteurStatus, string> = {
  ok: "#10B981",
  critical: "#EF4444",
  warning: "#F59E0B",
};

const statusBorder: Record<MoteurStatus, string> = {
  ok: "border-white/[0.05] bg-white/[0.02]",
  critical: "border-red-500/20 bg-red-500/5",
  warning: "border-amber-500/20 bg-amber-500/5",
};

const statusTextColor: Record<MoteurStatus, string> = {
  ok: "#E2E8F0",
  critical: "#EF4444",
  warning: "#F59E0B",
};

const statusIconColor: Record<MoteurStatus, string> = {
  ok: "#64748B",
  critical: "#EF4444",
  warning: "#F59E0B",
};

function TurbineIcon({ color }: { color: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M10.827 16.379C8.68642 17.4607 6.11003 17.1835 4.24862 15.6711C2.38721 14.1587 1.58839 11.6937 2.20897 9.37701L7.62097 10.827C6.53926 8.68645 6.8165 6.11006 8.32887 4.24865C9.84124 2.38724 12.3063 1.58842 14.623 2.20901L13.173 7.62101C15.3135 6.53929 17.8899 6.81653 19.7513 8.3289C21.6127 9.84127 22.4116 12.3063 21.791 14.623L16.379 13.173C17.4607 15.3136 17.1834 17.89 15.6711 19.7514C14.1587 21.6128 11.6936 22.4116 9.37697 21.791L10.827 16.379M12 12V12.01" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function CpuIcon({ color }: { color: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M12 20V22M12 2V4M17 20V22M17 2V4M2 12H4M2 17H4M2 7H4M20 12H22M20 17H22M20 7H22M7 20V22M7 2V4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M6 4H18C19.1038 4 20 4.89617 20 6V18C20 19.1038 19.1038 20 18 20H6C4.89617 20 4 19.1038 4 18V6C4 4.89617 4.89617 4 6 4V4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M9 8H15C15.5523 8 16 8.44772 16 9V15C16 15.5523 15.5523 16 15 16H9C8.44808 16 8 15.5519 8 15V9C8 8.44808 8.44808 8 9 8V8" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function SettingsIcon({ color }: { color: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M9.67102 4.136C9.7852 2.93484 10.794 2.01743 12.0005 2.01743C13.2071 2.01743 14.2158 2.93484 14.33 4.136C14.3972 4.89594 14.8307 5.57541 15.4915 5.95668C16.1523 6.33795 16.9575 6.37315 17.649 6.051C18.7453 5.55329 20.0403 5.96863 20.6425 7.0111C21.2448 8.05357 20.9578 9.38291 19.979 10.084C19.3547 10.522 18.9831 11.2369 18.9831 11.9995C18.9831 12.7621 19.3547 13.4769 19.979 13.915C20.9578 14.6161 21.2448 15.9454 20.6425 16.9879C20.0403 18.0304 18.7453 18.4457 17.649 17.948C16.9575 17.6259 16.1523 17.6611 15.4915 18.0423C14.8307 18.4236 14.3972 19.1031 14.33 19.863C14.2158 21.0642 13.2071 21.9816 12.0005 21.9816C10.794 21.9816 9.7852 21.0642 9.67102 19.863C9.60394 19.1028 9.17034 18.423 8.50926 18.0417C7.84817 17.6604 7.04267 17.6254 6.35102 17.948C5.25477 18.4457 3.95978 18.0304 3.35751 16.9879C2.75524 15.9454 3.04227 14.6161 4.02102 13.915C4.64532 13.4769 5.01698 12.7621 5.01698 11.9995C5.01698 11.2369 4.64532 10.522 4.02102 10.084C3.0437 9.3826 2.75742 8.05445 3.35901 7.01271C3.96059 5.97098 5.25403 5.55509 6.35002 6.051C7.04158 6.37315 7.84676 6.33795 8.50756 5.95668C9.16836 5.57541 9.60181 4.89594 9.66902 4.136" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M9 12C9 13.6557 10.3443 15 12 15C13.6557 15 15 13.6557 15 12C15 10.3443 13.6557 9 12 9C10.3443 9 9 10.3443 9 12V12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function WavesIcon({ color }: { color: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M2 6C2.6 6.5 3.2 7 4.5 7C7 7 7 5 9.5 5C12.1 5 11.9 7 14.5 7C17 7 17 5 19.5 5C20.8 5 21.4 5.5 22 6M2 12C2.6 12.5 3.2 13 4.5 13C7 13 7 11 9.5 11C12.1 11 11.9 13 14.5 13C17 13 17 11 19.5 11C20.8 11 21.4 11.5 22 12M2 18C2.6 18.5 3.2 19 4.5 19C7 19 7 17 9.5 17C12.1 17 11.9 19 14.5 19C17 19 17 17 19.5 17C20.8 17 21.4 17.5 22 18" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function MoteurIcon({ type, color }: { type: Moteur["iconType"]; color: string }) {
  switch (type) {
    case "turbine": return <TurbineIcon color={color} />;
    case "cpu": return <CpuIcon color={color} />;
    case "settings": return <SettingsIcon color={color} />;
    case "waves": return <WavesIcon color={color} />;
  }
}

export function CartographieSante() {
  return (
    <div className="flex flex-col h-full rounded-2xl border border-white/[0.08] bg-[rgba(17,26,36,0.50)] backdrop-blur-xl p-6 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.30)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M3.75 2.25H14.25C15.0779 2.25 15.75 2.92213 15.75 3.75V14.25C15.75 15.0779 15.0779 15.75 14.25 15.75H3.75C2.92213 15.75 2.25 15.0779 2.25 14.25V3.75C2.25 2.92213 2.92213 2.25 3.75 2.25V2.25" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2.25 6.75H15.75M2.25 11.25H15.75M6.75 2.25V15.75M11.25 2.25V15.75" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-white text-base font-semibold">Cartographie Santé</span>
        </div>
        <button className="text-[#0EA5E9] text-[13px] font-medium hover:underline">Vue liste</button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-4 gap-3 flex-1 content-start">
        {moteurs.map((m) => {
          const dotColor = statusDotColor[m.status];
          const iconColor = statusIconColor[m.status];
          const textColor = statusTextColor[m.status];
          return (
            <div
              key={m.id}
              className={cn(
                "relative flex flex-col items-center justify-center rounded-[10px] border aspect-square p-2 cursor-pointer hover:opacity-90 transition-opacity",
                statusBorder[m.status]
              )}
            >
              {/* Status dot */}
              <span
                className="absolute top-2 right-2 w-2 h-2 rounded-full"
                style={{ backgroundColor: dotColor, boxShadow: `0 0 8px 0 ${dotColor}` }}
              />
              <MoteurIcon type={m.iconType} color={iconColor} />
              <span className="mt-2 text-[13px] font-semibold" style={{ color: textColor }}>
                {m.id}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
