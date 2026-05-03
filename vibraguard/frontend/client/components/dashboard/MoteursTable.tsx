import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useMoteurs } from "@/hooks/use-moteurs";

interface MoteurRow {
  id: string;
  type: string;
  etatLabel: string;
  etatColor: string;
  etatPct: number;
  vibration: string;
  vibrationColor: string;
  trendIcon: "up" | "down" | "flat";
}

// Data is now fetched via useQuery

function TrendUp({ color }: { color: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M9.33337 4.08331H12.8334V7.58331" stroke={color} strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12.8333 4.08331L7.87496 9.04165L4.95829 6.12498L1.16663 9.91665" stroke={color} strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TrendFlat() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M2.91675 7H11.0834" stroke="#94A3B8" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function MoteursTable() {
  const navigate = useNavigate();

  const { data: rows = [], isLoading } = useMoteurs();

  if (isLoading) {
    return (
      <div className="flex flex-col h-full rounded-2xl border border-white/[0.08] bg-[rgba(17,26,36,0.50)] p-6">
        <div className="text-white text-sm">Chargement des données...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full rounded-2xl border border-white/[0.08] bg-[rgba(17,26,36,0.50)] backdrop-blur-xl p-6 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.30)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <g clipPath="url(#mot-table-clip)">
              <path d="M9 12H9.0075M9 6V9M11.484 1.5C11.8818 1.50008 12.2633 1.65818 12.5445 1.9395L16.0605 5.4555C16.3418 5.73674 16.4999 6.11821 16.5 6.516V11.484C16.4999 11.8818 16.3418 12.2633 16.0605 12.5445L12.5445 16.0605C12.2633 16.3418 11.8818 16.4999 11.484 16.5H6.516C6.11821 16.4999 5.73674 16.3418 5.4555 16.0605L1.9395 12.5445C1.65818 12.2633 1.50008 11.8818 1.5 11.484V6.516C1.50008 6.11821 1.65818 5.73674 1.9395 5.4555L5.4555 1.9395C5.73674 1.65818 6.11821 1.50008 6.516 1.5L9 12" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </g>
            <defs><clipPath id="mot-table-clip"><rect width="18" height="18" fill="white" /></clipPath></defs>
          </svg>
          <span className="text-white text-base font-semibold">Moteurs Sous Surveillance</span>
        </div>
        <button className="text-[#0EA5E9] text-[13px] font-medium hover:underline">Voir tout</button>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left">
          <thead>
            <tr>
              <th className="pb-3 text-[12px] font-medium text-[#64748B] border-b border-white/[0.05] pr-4">Moteur</th>
              <th className="pb-3 text-[12px] font-medium text-[#64748B] border-b border-white/[0.05] pr-4">Type</th>
              <th className="pb-3 text-[12px] font-medium text-[#64748B] border-b border-white/[0.05] pr-4">État Santé</th>
              <th className="pb-3 text-[12px] font-medium text-[#64748B] border-b border-white/[0.05] pr-4">Vibration RMS</th>
              <th className="pb-3 text-[12px] font-medium text-[#64748B] border-b border-white/[0.05]">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.id} className={cn("cursor-pointer hover:bg-white/[0.03] transition-colors", i < rows.length - 1 ? "border-b border-white/[0.02]" : "")}>
                <td className="py-5 pr-4">
                  <button
                    onClick={() => navigate(`/moteurs/${row.id}`)}
                    className="text-white text-sm font-semibold hover:text-[#0EA5E9] transition-colors"
                  >
                    {row.id}
                  </button>
                </td>
                <td className="py-5 pr-4">
                  <span className="text-[#E2E8F0] text-sm">{row.type}</span>
                </td>
                <td className="py-4 pr-4">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs font-semibold" style={{ color: row.etatColor }}>{row.etatLabel}</span>
                    <div className="relative w-[100px] h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="absolute left-0 top-0 h-full rounded-full"
                        style={{ width: `${row.etatPct}%`, backgroundColor: row.etatColor }}
                      />
                    </div>
                  </div>
                </td>
                <td className="py-5 pr-4">
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-semibold" style={{ color: row.vibrationColor }}>{row.vibration}</span>
                    {row.trendIcon === "up" && <TrendUp color={row.vibrationColor} />}
                    {row.trendIcon === "flat" && <TrendFlat />}
                  </div>
                </td>
                <td className="py-4">
                  <button
                    onClick={() => navigate(`/moteurs/${row.id}`)}
                    className="px-3 py-1.5 rounded-md border border-white/10 bg-white/5 text-[#E2E8F0] text-xs font-medium hover:bg-white/10 transition-colors"
                  >
                    Détails
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
