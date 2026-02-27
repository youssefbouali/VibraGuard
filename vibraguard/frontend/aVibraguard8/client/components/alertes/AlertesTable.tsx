import { cn } from "@/lib/utils";

export type Severite = "Critique" | "Majeur" | "Mineur";
export type Statut = "Nouveau" | "En cours" | "Résolu";

export interface Alerte {
  id: string;
  moteur: string;
  typeDefaut: string;
  severite: Severite;
  confiance: number;
  dateHeure: string;
  statut: Statut;
}

interface AlertesTableProps {
  alertes: Alerte[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAcquitter: (id: string) => void;
  onEscalader: (id: string) => void;
}

const severiteConfig: Record<Severite, { color: string; bg: string; border: string; dot: string }> = {
  Critique: {
    color: "text-[#EF4444]",
    bg: "bg-[rgba(239,68,68,0.15)]",
    border: "border-[rgba(239,68,68,0.30)]",
    dot: "bg-[#EF4444] shadow-[0_0_8px_0_#EF4444]",
  },
  Majeur: {
    color: "text-[#F97316]",
    bg: "bg-[rgba(249,115,22,0.15)]",
    border: "border-[rgba(249,115,22,0.30)]",
    dot: "bg-[#F97316]",
  },
  Mineur: {
    color: "text-[#EAB308]",
    bg: "bg-[rgba(234,179,8,0.15)]",
    border: "border-[rgba(234,179,8,0.30)]",
    dot: "bg-[#EAB308]",
  },
};

const statutConfig: Record<Statut, { color: string; bg: string; border: string }> = {
  Nouveau: {
    color: "text-[#10B981]",
    bg: "bg-[rgba(16,185,129,0.10)]",
    border: "border-[rgba(16,185,129,0.20)]",
  },
  "En cours": {
    color: "text-[#0EA5E9]",
    bg: "bg-[rgba(14,165,233,0.10)]",
    border: "border-[rgba(14,165,233,0.20)]",
  },
  Résolu: {
    color: "text-[#94A3B8]",
    bg: "bg-[rgba(148,163,184,0.10)]",
    border: "border-[rgba(148,163,184,0.20)]",
  },
};

function ConfidenceBar({ value, severite }: { value: number; severite: Severite }) {
  const barColor =
    severite === "Critique"
      ? "bg-[#EF4444]"
      : severite === "Majeur"
      ? "bg-[#F97316]"
      : "bg-[#EAB308]";
  const textColor =
    severite === "Critique"
      ? "text-[#EF4444]"
      : severite === "Majeur"
      ? "text-[#F97316]"
      : "text-[#EAB308]";

  return (
    <div className="flex items-center gap-2">
      <div className="w-12 h-1 rounded-full overflow-hidden bg-white/10">
        <div
          className={cn("h-full rounded-full", barColor)}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className={cn("text-[13px] font-semibold", textColor)}>{value}%</span>
    </div>
  );
}

export function AlertesTable({
  alertes,
  selectedId,
  onSelect,
  onAcquitter,
  onEscalader,
}: AlertesTableProps) {
  return (
    <div className="flex flex-col w-full overflow-x-auto">
      {/* Header row */}
      <div className="flex min-w-[700px]">
        {["ID Alerte", "Moteur", "Type de Défaut", "Sévérité", "Confiance", "Date & Heure", "Statut", "Actions"].map(
          (col) => (
            <div
              key={col}
              className={cn(
                "px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.6px] text-[#64748B] border-b border-white/5 shrink-0",
                col === "ID Alerte" ? "w-[90px]" :
                col === "Moteur" ? "w-[100px]" :
                col === "Type de Défaut" ? "w-[130px]" :
                col === "Sévérité" ? "w-[110px]" :
                col === "Confiance" ? "w-[110px]" :
                col === "Date & Heure" ? "w-[110px]" :
                col === "Statut" ? "w-[100px]" :
                "w-[100px]"
              )}
            >
              {col}
            </div>
          )
        )}
      </div>

      {/* Body */}
      <div className="flex flex-col gap-[7px] pt-2 min-w-[700px]">
        {alertes.map((alerte) => {
          const isSelected = alerte.id === selectedId;
          const sev = severiteConfig[alerte.severite];
          const stat = statutConfig[alerte.statut];

          return (
            <div
              key={alerte.id}
              onClick={() => onSelect(alerte.id)}
              className={cn(
                "flex items-stretch rounded-lg cursor-pointer transition-all",
                isSelected
                  ? "bg-[rgba(239,68,68,0.05)] border border-[rgba(239,68,68,0.20)] shadow-[0_0_0_2px_rgba(239,68,68,0.30)_inset]"
                  : "bg-[rgba(17,26,36,0.50)] border border-white/5 hover:border-white/10 hover:bg-[rgba(17,26,36,0.70)]"
              )}
            >
              {/* ID */}
              <div className="w-[90px] px-4 py-4 flex items-center shrink-0">
                <span className="text-[#94A3B8] text-sm font-mono leading-tight whitespace-pre-line">
                  {alerte.id}
                </span>
              </div>

              {/* Moteur */}
              <div className="w-[100px] px-4 py-4 flex items-center shrink-0">
                <span className="text-[#E2E8F0] text-sm font-semibold leading-tight whitespace-pre-line">
                  {alerte.moteur}
                </span>
              </div>

              {/* Type de Défaut */}
              <div className="w-[130px] px-4 py-4 flex items-center shrink-0">
                <span className="text-[#CBD5E1] text-sm leading-tight">
                  {alerte.typeDefaut}
                </span>
              </div>

              {/* Sévérité */}
              <div className="w-[110px] px-4 py-4 flex items-center shrink-0">
                <span
                  className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold",
                    sev.color,
                    sev.bg,
                    sev.border
                  )}
                >
                  <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", sev.dot)} />
                  {alerte.severite}
                </span>
              </div>

              {/* Confiance */}
              <div className="w-[110px] px-4 py-4 flex items-center shrink-0">
                <ConfidenceBar value={alerte.confiance} severite={alerte.severite} />
              </div>

              {/* Date & Heure */}
              <div className="w-[110px] px-4 py-4 flex items-center shrink-0">
                <span className="text-[#94A3B8] text-sm leading-tight whitespace-pre-line">
                  {alerte.dateHeure}
                </span>
              </div>

              {/* Statut */}
              <div className="w-[100px] px-4 py-4 flex items-center shrink-0">
                <span
                  className={cn(
                    "px-2 py-1 rounded-md border text-xs font-medium",
                    stat.color,
                    stat.bg,
                    stat.border
                  )}
                >
                  {alerte.statut}
                </span>
              </div>

              {/* Actions */}
              <div className="w-[100px] px-4 py-4 flex items-center gap-2 shrink-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAcquitter(alerte.id);
                  }}
                  className="flex w-8 h-8 items-center justify-center rounded-md border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
                  title="Acquitter"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M13.3334 4L6.00008 11.3333L2.66675 8" stroke="#10B981" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEscalader(alerte.id);
                  }}
                  className="flex w-8 h-8 items-center justify-center rounded-md border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
                  title="Escalader"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M14.4866 12L9.15329 2.66665C8.91654 2.24891 8.47346 1.99072 7.99329 1.99072C7.51312 1.99072 7.07004 2.24891 6.83329 2.66665L1.49995 12C1.26068 12.4144 1.26181 12.9252 1.50292 13.3385C1.74402 13.7519 2.18813 14.0043 2.66662 14H13.3333C13.8094 13.9995 14.2491 13.7452 14.487 13.3327C14.7248 12.9203 14.7247 12.4123 14.4866 12M7.99995 5.99999V8.66665M7.99995 11.3333H8.00662" stroke="#EF4444" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
