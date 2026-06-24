import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
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
  const [page, setPage] = useState(1);
  const perPage = 10;

  const { data: rows = [], isLoading } = useMoteurs();

  const totalPages = Math.max(1, Math.ceil(rows.length / perPage));
  const paginated = rows.slice((page - 1) * perPage, page * perPage);

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
        <Link to="/moteurs" className="text-[#0EA5E9] text-[13px] font-medium hover:underline">Voir tout</Link>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left">
          <thead>
            <tr>
              <th className="pb-3 text-[12px] font-medium text-[#64748B] border-b border-white/[0.05] pr-4">Moteur</th>
              <th className="pb-3 text-[12px] font-medium text-[#64748B] border-b border-white/[0.05] pr-4">Type</th>
              <th className="pb-3 text-[12px] font-medium text-[#64748B] border-b border-white/[0.05] pr-4">État Santé</th>
              <th className="pb-3 text-[12px] font-medium text-[#64748B] border-b border-white/[0.05] pr-4">Vibration Initiale</th>
              <th className="pb-3 text-[12px] font-medium text-[#64748B] border-b border-white/[0.05]">Action</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((row, i) => (
              <tr key={row.id} className={cn("cursor-pointer hover:bg-white/[0.03] transition-colors", i < paginated.length - 1 ? "border-b border-white/[0.02]" : "")}>
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
                    <span className="text-sm font-semibold text-[#E2E8F0]">
                      {String(row.vibration).replace(' mm/s', '')} mm/s
                    </span>
                    {row.trendIcon === "up" && <TrendUp color="#94A3B8" />}
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

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-3 mt-3 border-t border-white/[0.05]">
          <span className="text-[11px] text-[#64748B]">{rows.length} moteurs</span>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="px-2.5 py-1 rounded text-[11px] font-medium text-[#94A3B8] hover:text-white hover:bg-white/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">Précédent</button>
            <span className="text-[11px] text-[#64748B]">{page}/{totalPages}</span>
            <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="px-2.5 py-1 rounded text-[11px] font-medium text-[#94A3B8] hover:text-white hover:bg-white/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">Suivant</button>
          </div>
        </div>
      )}
    </div>
  );
}
