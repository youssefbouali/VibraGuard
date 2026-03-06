import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

interface Alerte {
  id: string;
  title: string;
  motorId: string;
  time: string;
  description: string;
  iconType: "critical" | "warning" | "temp";
}

// Data is now fetched via useQuery

function CriticalIcon() {
  return (
    <div className="flex w-10 h-10 shrink-0 items-center justify-center rounded-[10px] bg-[rgba(239,68,68,0.10)]">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M18.1083 15L11.4416 3.33333C11.1457 2.81115 10.5918 2.48842 9.99161 2.48842C9.3914 2.48842 8.83754 2.81115 8.54161 3.33333L1.87494 15C1.57585 15.518 1.57726 16.1565 1.87865 16.6732C2.18003 17.1898 2.73516 17.5054 3.33327 17.5H16.6666C17.2617 17.4994 17.8114 17.1815 18.1087 16.6659C18.406 16.1504 18.4058 15.5154 18.1083 15M9.99994 7.5V10.8333M9.99994 14.1667H10.0083" stroke="#EF4444" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

function WarningIcon() {
  return (
    <div className="flex w-10 h-10 shrink-0 items-center justify-center rounded-[10px] bg-[rgba(245,158,11,0.10)]">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M3.33325 11.6667C3.01138 11.6678 2.71765 11.4834 2.57871 11.193C2.43977 10.9027 2.48047 10.5583 2.68325 10.3083L10.9333 1.80833C11.0607 1.66121 11.2731 1.62194 11.4447 1.71375C11.6163 1.80556 11.7015 2.00398 11.6499 2.19166L10.0499 7.20833C9.95415 7.46464 9.99031 7.75164 10.1467 7.97619C10.303 8.20073 10.5596 8.33422 10.8333 8.33333H16.6666C16.9885 8.33223 17.2822 8.5166 17.4211 8.80695C17.5601 9.0973 17.5194 9.4417 17.3166 9.69166L9.06659 18.1917C8.93913 18.3388 8.72679 18.3781 8.55514 18.2862C8.3835 18.1944 8.2983 17.996 8.34992 17.8083L9.94992 12.7917C10.0457 12.5354 10.0095 12.2484 9.85318 12.0238C9.69683 11.7993 9.4402 11.6658 9.16659 11.6667H3.33325" stroke="#F59E0B" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

function TempIcon() {
  return (
    <div className="flex w-10 h-10 shrink-0 items-center justify-center rounded-[10px] bg-[rgba(245,158,11,0.10)]">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M11.6666 3.33334V12.1167C12.9731 12.871 13.6101 14.4089 13.2196 15.8662C12.8292 17.3234 11.5086 18.3368 9.99989 18.3368C8.49121 18.3368 7.17062 17.3234 6.78014 15.8662C6.38967 14.4089 7.02667 12.871 8.33323 12.1167V3.33334C8.33323 2.41348 9.08004 1.66667 9.99989 1.66667C10.9198 1.66667 11.6666 2.41348 11.6666 3.33334" stroke="#F59E0B" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

function AlerteIcon({ type }: { type: Alerte["iconType"] }) {
  if (type === "critical") return <CriticalIcon />;
  if (type === "warning") return <WarningIcon />;
  return <TempIcon />;
}

export function AlertesRecentes() {
  const navigate = useNavigate();

  const { data: rawAlerts = [], isLoading } = useQuery<any[]>({
    queryKey: ["alerts"],
    queryFn: api.getAlerts
  });

  // Map backend alerts to the format expected by the frontend
  const alertes: Alerte[] = rawAlerts.map(a => ({
    id: a.id,
    title: a.title || a.message.split("sur ")[1] || "Alerte",
    motorId: a.motorId || a.message.split("sur ")[1] || "M-04",
    time: a.time,
    description: a.message || a.description,
    iconType: a.priority === "high" ? "critical" : a.priority === "medium" ? "warning" : "temp"
  }));

  if (isLoading) {
    return (
      <div className="flex flex-col h-full rounded-2xl border border-white/[0.08] bg-[rgba(17,26,36,0.50)] p-6">
        <div className="text-white text-sm">Chargement des alertes...</div>
      </div>
    );
  }
  return (
    <div className="flex flex-col h-full rounded-2xl border border-white/[0.08] bg-[rgba(17,26,36,0.50)] backdrop-blur-xl p-6 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.30)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <g clipPath="url(#alerte-clip)">
              <path d="M7.701 15.75C7.96896 16.2141 8.46413 16.4999 9 16.4999C9.53587 16.4999 10.031 16.2141 10.299 15.75M16.5 6C16.5 4.275 15.9 2.775 15 1.5M2.4465 11.4945C2.24632 11.7139 2.19447 12.0308 2.31428 12.3025C2.43409 12.5743 2.70299 12.7498 3 12.75H15C15.297 12.7501 15.566 12.575 15.6862 12.3034C15.8063 12.0318 15.7549 11.7149 15.555 11.4952C14.5575 10.467 13.5 9.37425 13.5 6C13.5 3.51638 11.4836 1.5 9 1.5C6.51638 1.5 4.5 3.51638 4.5 6C4.5 9.37425 3.44175 10.467 2.4465 11.4945M3 1.5C2.1 2.775 1.5 4.275 1.5 6" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </g>
            <defs><clipPath id="alerte-clip"><rect width="18" height="18" fill="white" /></clipPath></defs>
          </svg>
          <span className="text-white text-base font-semibold">Alertes Récentes</span>
        </div>
        <button className="text-[#0EA5E9] text-[13px] font-medium hover:underline">Historique</button>
      </div>

      {/* Alerts list */}
      <div className="flex flex-col gap-3 flex-1">
        {alertes.map((alerte) => (
          <button
            key={alerte.id}
            onClick={() => navigate(`/moteurs/${alerte.motorId}`)}
            className="flex items-start gap-4 p-4 rounded-xl border border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/[0.10] transition-colors text-left"
          >
            <AlerteIcon type={alerte.iconType} />
            <div className="flex flex-col gap-1 flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[#E2E8F0] text-sm font-semibold truncate hover:text-[#0EA5E9] transition-colors">{alerte.title}</span>
                <span className="text-[#64748B] text-xs whitespace-nowrap shrink-0">{alerte.time}</span>
              </div>
              <p className="text-[#94A3B8] text-[13px] leading-snug">{alerte.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
