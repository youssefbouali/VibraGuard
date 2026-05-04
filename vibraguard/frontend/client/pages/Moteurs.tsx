import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { cn, formatTime } from "@/lib/utils";
import { api } from "@/lib/api";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Loader2, Trash2, Edit, MoreHorizontal, Save, X, Plus } from "lucide-react";
import { useMoteurs } from "@/hooks/use-moteurs";

type HealthStatus = "Critique" | "Alerte" | "Optimal" | "Attention" | "Normal"; // Backward compatibility included

interface Moteur {
  id: string;
  zone: string;
  localisation: string;
  type: string;
  puissance: string;
  etatSante: HealthStatus;
  vibrationRMS: number;
  derniereAlerte: string;
  derniereAlerteType?: string;
  alerteRef?: string;
  etatColor?: string;
}

const statusConfig: Record<HealthStatus, { color: string; bg: string; border: string; dot: string; glow: string }> = {
  Critique: {
    color: "text-[#D93F3F]",
    bg: "bg-[rgba(217,63,63,0.10)]",
    border: "border-[rgba(217,63,63,0.20)]",
    dot: "bg-[#D93F3F]",
    glow: "shadow-[0_0_8px_0_#D93F3F]",
  },
  Attention: {
    color: "text-[#F2A900]",
    bg: "bg-[rgba(242,169,0,0.10)]",
    border: "border-[rgba(242,169,0,0.20)]",
    dot: "bg-[#F2A900]",
    glow: "shadow-[0_0_8px_0_#F2A900]",
  },
  Alerte: {
    color: "text-[#F2A900]",
    bg: "bg-[rgba(242,169,0,0.10)]",
    border: "border-[rgba(242,169,0,0.20)]",
    dot: "bg-[#F2A900]",
    glow: "shadow-[0_0_8px_0_#F2A900]",
  },
  Normal: {
    color: "text-[#007A3D]",
    bg: "bg-[rgba(0,122,61,0.10)]",
    border: "border-[rgba(0,122,61,0.20)]",
    dot: "bg-[#007A3D]",
    glow: "shadow-[0_0_8px_0_#007A3D]",
  },
  Optimal: {
    color: "text-[#007A3D]",
    bg: "bg-[rgba(0,122,61,0.10)]",
    border: "border-[rgba(0,122,61,0.20)]",
    dot: "bg-[#007A3D]",
    glow: "shadow-[0_0_8px_0_#007A3D]",
  },
};

const vibrationColor: Record<string, string> = {
  Critique: "text-[#D93F3F]",
  Attention: "text-[#F2A900]",
  Alerte: "text-[#F2A900]",
  Normal: "text-[#007A3D]",
  Optimal: "text-[#007A3D]",
};

// SVG icons
const MoteurIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <g clipPath="url(#moteur-icon-clip)">
      <path d="M8.00004 13.3333V14.6666M8.00004 1.33331V2.66665M11.3334 13.3333V14.6666M11.3334 1.33331V2.66665M1.33337 7.99998H2.66671M1.33337 11.3333H2.66671M1.33337 4.66665H2.66671M13.3334 7.99998H14.6667M13.3334 11.3333H14.6667M13.3334 4.66665H14.6667M4.66671 13.3333V14.6666M4.66671 1.33331V2.66665" stroke="#0C6CF2" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3.99996 2.66669H12C12.7358 2.66669 13.3333 3.26413 13.3333 4.00002V12C13.3333 12.7359 12.7358 13.3334 12 13.3334H3.99996C3.26407 13.3334 2.66663 12.7359 2.66663 12V4.00002C2.66663 3.26413 3.26407 2.66669 3.99996 2.66669V2.66669" stroke="#0C6CF2" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6.00004 5.33331H10C10.368 5.33331 10.6667 5.63204 10.6667 5.99998V9.99998C10.6667 10.3679 10.368 10.6666 10 10.6666H6.00004C5.6321 10.6666 5.33337 10.3679 5.33337 9.99998V5.99998C5.33337 5.63204 5.6321 5.33331 6.00004 5.33331V5.33331" stroke="#0C6CF2" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
    </g>
    <defs><clipPath id="moteur-icon-clip"><rect width="16" height="16" fill="white" /></clipPath></defs>
  </svg>
);

const VibrationIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <g clipPath="url(#vib-clip)">
      <path d="M14.6666 7.99998H13.0133C12.4145 7.9987 11.8883 8.39676 11.7266 8.97331L10.1599 14.5466C10.1392 14.6178 10.074 14.6666 9.99992 14.6666C9.92584 14.6666 9.86066 14.6178 9.83992 14.5466L6.15992 1.45331C6.13918 1.3822 6.07399 1.33331 5.99992 1.33331C5.92584 1.33331 5.86066 1.3822 5.83992 1.45331L4.27325 7.02665C4.11225 7.60082 3.58957 7.99827 2.99325 7.99998H1.33325" stroke="#007A3D" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
    </g>
    <defs><clipPath id="vib-clip"><rect width="16" height="16" fill="white" /></clipPath></defs>
  </svg>
);

const EyeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M1.37468 8.232C1.31912 8.08232 1.31912 7.91767 1.37468 7.768C2.48136 5.0846 5.09737 3.33374 8.00001 3.33374C10.9027 3.33374 13.5187 5.0846 14.6253 7.768C14.6809 7.91767 14.6809 8.08232 14.6253 8.232C13.5187 10.9154 10.9027 12.6663 8.00001 12.6663C5.09737 12.6663 2.48136 10.9154 1.37468 8.232" stroke="#C9E7E6" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M6 8C6 9.10383 6.89617 10 8 10C9.10383 10 10 9.10383 10 8C10 6.89617 9.10383 6 8 6C6.89617 6 6 6.89617 6 8V8" stroke="#C9E7E6" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

function HealthBadge({ status }: { status: HealthStatus }) {
  const cfg = statusConfig[status] || statusConfig["Normal"];
  const labelMap: Record<string, string> = {
    "Normal": "Optimal",
    "Attention": "Alerte",
    "Critique": "Critique"
  };
  return (
    <span className={cn("inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-[13px] font-medium", cfg.bg, cfg.border, cfg.color)}>
      <span className={cn("w-2 h-2 rounded-full shrink-0", cfg.dot, cfg.glow)} />
      {labelMap[status] || status}
    </span>
  );
}

function ActionBtn({ children }: { children: React.ReactNode }) {
  return (
    <button className="flex w-8 h-8 items-center justify-center rounded bg-[#0F2730] hover:bg-[#163340] transition-colors shrink-0">
      {children}
    </button>
  );
}

export default function Moteurs() {
  const navigate = useNavigate();
  const [view, setView] = useState<"liste" | "carte">("carte");
  const [search, setSearch] = useState("");
  const [selectedZone, setSelectedZone] = useState("Toutes les zones");
  const [selectedStatus, setSelectedStatus] = useState("Tous");
  const [currentPage, setCurrentPage] = useState(1);

  const { data: apiMoteurs, isLoading, refetch } = useMoteurs() as any;
  const [selectedMotor, setSelectedMotor] = useState<Moteur | null>(null);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Form state for update
  const [editType, setEditType] = useState("");
  const [editEtat, setEditEtat] = useState<HealthStatus>("Normal");
  const [editVibration, setEditVibration] = useState("");

  const filtered = (apiMoteurs || []).filter((m: any) => {
    const matchesSearch = (m.id + m.localisation + m.zone).toLowerCase().includes(search.toLowerCase());
    const matchesZone = selectedZone === "Toutes les zones" || m.zone === selectedZone;
    let status = m.etatSante || (m.etatColor === "bg-[#007A3D]" ? "Optimal" : m.etatColor === "bg-[#F2A900]" ? "Alerte" : "Critique");
    if (status === "Normal") status = "Optimal";
    if (status === "Attention") status = "Alerte";
    const matchesStatus = selectedStatus === "Tous" || status === selectedStatus;
    return matchesSearch && matchesZone && matchesStatus;
  });

  const totalMoteurs = filtered.length;
  const perPage = 10;
  const totalPages = Math.ceil(totalMoteurs / perPage) || 1;
  const startIndex = (currentPage - 1) * perPage;
  const paginatedMoteurs = filtered.slice(startIndex, startIndex + perPage);

  const zones = ["Toutes les zones", ...new Set((apiMoteurs || []).map((m: any) => m.zone))];
  const statuses = ["Tous", "Optimal", "Alerte", "Critique"];

  return (
    <DashboardLayout breadcrumb="Moteurs">
      <div className="flex flex-col gap-4 sm:gap-6">
        {isLoading && <div className="text-white">Chargement des données...</div>}
        
        {/* Title row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h1 className="text-xl sm:text-2xl lg:text-[24px] font-semibold text-[#E6F0F2]">Liste des Moteurs</h1>
          <button 
            onClick={() => navigate("/moteurs/ajouter")}
            className="flex items-center gap-2 px-4 h-10 rounded-md bg-[#007A3D] hover:bg-[#006633] transition-colors text-white text-sm font-medium whitespace-nowrap"
          >
            <Plus className="w-4 h-4 text-white" />
            <span className="hidden sm:inline">Ajouter un Moteur</span>
            <span className="sm:hidden">Ajouter</span>
          </button>
        </div>

        {/* Filters bar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 rounded-lg border border-black/[0.08] bg-[#0B1518]">
          <div className="flex items-center gap-4 flex-1 min-w-0 flex-wrap">
            {/* Search */}
            <div className="flex items-center gap-3 h-10 px-4 rounded-md border border-black/[0.08] bg-[#0D1316] w-[280px] min-w-[200px]">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="shrink-0">
                <path d="M15.75 15.75L12.495 12.495" stroke="#98A6A8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2.25 8.25C2.25 11.5615 4.93851 14.25 8.25 14.25C11.5615 14.25 14.25 11.5615 14.25 8.25C14.25 4.93851 11.5615 2.25 8.25 2.25C4.93851 2.25 2.25 4.93851 2.25 8.25V8.25" stroke="#98A6A8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <input
                type="text"
                placeholder="Rechercher par ID, Zone..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-transparent text-sm text-[#98A6A8] placeholder:text-[#98A6A8] outline-none flex-1 min-w-0"
              />
            </div>

            {/* Zone dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 h-10 px-4 rounded-md border border-black/[0.08] bg-[#0D1316] text-[#E6F0F2] text-sm min-w-[160px]">
                  <span className="flex-1 text-left">{selectedZone}</span>
                  <MoreHorizontal className="w-4 h-4 text-[#98A6A8]" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-[#0D1316] border-white/10 text-white min-w-[160px]">
                {zones.map(z => (
                  <DropdownMenuItem key={z} onClick={() => { setSelectedZone(z); setCurrentPage(1); }} className="hover:bg-white/5 cursor-pointer">
                    {z}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Santé dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 h-10 px-4 rounded-md border border-black/[0.08] bg-[#0D1316] text-[#E6F0F2] text-sm min-w-[160px]">
                  <span className="flex-1 text-left">Santé: {selectedStatus}</span>
                  <MoreHorizontal className="w-4 h-4 text-[#98A6A8]" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-[#0D1316] border-white/10 text-white min-w-[160px]">
                {statuses.map(s => (
                  <DropdownMenuItem key={s} onClick={() => { setSelectedStatus(s); setCurrentPage(1); }} className="hover:bg-white/5 cursor-pointer flex items-center gap-2">
                    {s !== "Tous" && <div className={cn("w-2 h-2 rounded-full", (s === "Optimal" || s === "Normal") ? "bg-[#007A3D]" : (s === "Alerte" || s === "Attention") ? "bg-[#F2A900]" : "bg-[#D93F3F]")} />}
                    {s}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* View toggle */}
          <div className="flex items-center p-1 rounded-md border border-black/[0.08] bg-[#0D1316] shrink-0">
            <button
              onClick={() => setView("liste")}
              className={cn(
                "flex items-center gap-2 px-4 py-1.5 rounded text-[13px] font-medium transition-colors",
                view === "liste"
                  ? "bg-[#0F2730] text-[#E6F0F2] shadow-sm"
                  : "text-[#C9E7E6] hover:text-white"
              )}
            >
              Liste
            </button>
            <button
              onClick={() => setView("carte")}
              className={cn(
                "flex items-center gap-2 px-4 py-1.5 rounded text-[13px] font-medium transition-colors",
                view === "carte"
                  ? "bg-[#0F2730] text-[#E6F0F2] shadow-sm"
                  : "text-[#C9E7E6] hover:text-white"
              )}
            >
              Carte
            </button>
          </div>
        </div>

        {/* View content */}
        {view === "liste" ? (
          <div className="rounded-lg border border-black/[0.08] bg-[#0B1518] overflow-x-auto">
            <div className="grid grid-cols-[1.5fr_1fr_1.5fr_1fr_1fr_auto] border-b border-black/[0.08] bg-[rgba(15,39,48,0.30)]">
              <div className="px-6 py-4 text-[13px] font-medium text-[#C9E7E6]">ID / Loc</div>
              <div className="px-6 py-4 text-[13px] font-medium text-[#C9E7E6]">Santé</div>
              <div className="px-6 py-4 text-[13px] font-medium text-[#C9E7E6]">Type / Pwr</div>
              <div className="px-6 py-4 text-[13px] font-medium text-[#C9E7E6]">Vibration</div>
              <div className="px-6 py-4 text-[13px] font-medium text-[#C9E7E6]">Alerte</div>
              <div className="px-6 py-4 text-right pr-10 text-[13px] font-medium text-[#C9E7E6]">Actions</div>
            </div>

            <div className="divide-y divide-black/[0.08]">
              {paginatedMoteurs.map((m: any) => {
                const status = (m.etatSante as HealthStatus) || 
                               (m.etatColor === "#10B981" ? "Normal" : 
                                m.etatColor === "#F59E0B" ? "Attention" : 
                                m.etatColor === "#EF4444" ? "Critique" : "Normal");
                return (
                  <div key={m.id} className="grid grid-cols-[1.5fr_1fr_1.5fr_1fr_1fr_auto] hover:bg-white/[0.02] transition-colors cursor-pointer" onClick={() => navigate(`/moteurs/${m.id}`)}>
                    <div className="px-6 py-4 flex flex-col">
                      <span className="text-white font-bold">{m.id}</span>
                      <span className="text-[#98A6A8] text-xs">{m.zone} - {m.localisation}</span>
                    </div>
                    <div className="px-6 py-4 items-center flex">
                      <HealthBadge status={status} />
                    </div>
                    <div className="px-6 py-4 flex flex-col">
                      <span className="text-white text-sm">{m.type}</span>
                      <span className="text-[#98A6A8] text-xs">{m.puissance}</span>
                    </div>
                    <div className="px-6 py-4 flex items-center gap-1">
                      <span className={cn("font-bold text-lg", vibrationColor[status])}>
                        {typeof m.vibrationRMS === 'number' ? m.vibrationRMS.toFixed(2) : String(m.vibration || "0.00").replace(' mm/s', '')}
                      </span>
                      <span className="text-[#98A6A8] text-xs">mm/s</span>
                    </div>
                    <div className="px-6 py-4 text-sm font-medium">
                      <div className="flex flex-col">
                        <span className={cn("text-xs uppercase", (m.derniereAlerteType && m.derniereAlerteType !== 'Sain') ? "text-[#EF4444]" : "text-[#10B981]")}>
                          {m.derniereAlerteType || "Aucun"}
                        </span>
                        <span className="text-[#64748B] text-[10px]">{m.derniereAlerte ? formatTime(m.derniereAlerte) : "N/A"}</span>
                      </div>
                    </div>
                    <div className="px-6 py-4 flex items-center justify-end gap-2 pr-10">
                       <ActionBtn><VibrationIcon /></ActionBtn>
                       <DropdownMenu>
                         <DropdownMenuTrigger asChild>
                           <button onClick={(e) => e.stopPropagation()} className="p-2"><MoreHorizontal className="w-4 h-4 text-[#C9E7E6]" /></button>
                         </DropdownMenuTrigger>
                         <DropdownMenuContent className="bg-[#0D1316] text-white">
                           <DropdownMenuItem onClick={(e) => {e.stopPropagation(); setSelectedMotor(m); setIsUpdateDialogOpen(true);}}>Modifier</DropdownMenuItem>
                           <DropdownMenuItem className="text-red-500" onClick={async (e) => {e.stopPropagation(); await api.deleteMotor(m.id); refetch();}}>Supprimer</DropdownMenuItem>
                         </DropdownMenuContent>
                       </DropdownMenu>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {paginatedMoteurs.map((m: any) => {
              const status = (m.etatSante as HealthStatus) || 
                             (m.etatColor === "#10B981" ? "Normal" : 
                              m.etatColor === "#F59E0B" ? "Attention" : 
                              m.etatColor === "#EF4444" ? "Critique" : "Normal");
              return (
                <div key={m.id} onClick={() => navigate(`/moteurs/${m.id}`)} className="bg-[#0B1518] rounded-xl border border-white/5 p-6 hover:border-[#0EA5E9]/30 transition-all cursor-pointer">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 rounded-lg bg-[#0C6CF2]/10"><MoteurIcon /></div>
                    <HealthBadge status={status} />
                  </div>
                  <h3 className="text-white font-bold text-lg mb-1">{m.id}</h3>
                  <p className="text-[#98A6A8] text-sm mb-6">{m.zone} • {m.localisation}</p>
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                    <div>
                      <p className="text-[#64748B] text-[10px] font-bold uppercase mb-1">Vibration</p>
                      <p className={cn("text-xl font-bold", vibrationColor[status])}>
                        {typeof m.vibrationRMS === 'number' ? m.vibrationRMS.toFixed(2) : String(m.vibration || "0.00").replace(' mm/s', '')} <span className="text-xs font-normal opacity-60">mm/s</span>
                      </p>
                    </div>
                    <div>
                      <p className="text-[#64748B] text-[10px] font-bold uppercase mb-1">Type</p>
                      <p className="text-white font-medium">{m.type}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 border-t border-black/[0.08] bg-[#08151A] rounded-lg border border-white/5">
          <span className="text-[13px] text-[#CFEFF1]">
            Affichage de {totalMoteurs === 0 ? 0 : (currentPage - 1) * perPage + 1} à {Math.min(currentPage * perPage, totalMoteurs)} sur {totalMoteurs} moteurs
          </span>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="flex items-center justify-center h-8 px-3 rounded-md border border-black/[0.08] text-[13px] font-semibold text-[#E8F6F5] hover:bg-white/5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Précédent
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }).map((_, i) => {
                const page = i + 1;
                // Simple logic for small number of pages
                if (totalPages <= 5 || (page <= 3 || page === totalPages)) {
                   return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`flex items-center justify-center w-8 h-8 rounded text-[13px] transition-colors ${currentPage === page
                          ? "bg-[#007A3D] text-white font-semibold"
                          : "text-[#CFEFF1] hover:bg-white/5 font-normal"
                        }`}
                    >
                      {page}
                    </button>
                  );
                }
                // Show ellipsis if we are between 3 and totalPages-1
                if (page === 4 && totalPages > 5) {
                   return <span key="dots" className="text-[#CFEFF1] px-1">...</span>;
                }
                return null;
              })}
            </div>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="flex items-center justify-center h-8 px-3 rounded-md border border-black/[0.08] text-[13px] font-semibold text-[#E8F6F5] hover:bg-white/5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Suivant
            </button>
          </div>
        </div>

        {/* Update Modal */}
        <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
          <DialogContent className="bg-[#0A1114] border-white/10 text-white">
            <DialogHeader><DialogTitle>Modifier Moteur {selectedMotor?.id}</DialogTitle></DialogHeader>
            <div className="py-4 flex flex-col gap-4">
               <div>
                  <label className="text-xs text-[#98A6A8] mb-1 block">Type</label>
                  <input value={editType} onChange={e => setEditType(e.target.value)} className="w-full bg-[#0D1316] border border-white/10 p-2 rounded" />
               </div>
               <div>
                  <label className="text-xs text-[#98A6A8] mb-1 block">État</label>
                  <select value={editEtat} onChange={e => setEditEtat(e.target.value as any)} className="w-full bg-[#0D1316] border border-white/10 p-2 rounded">
                    <option value="Normal">Normal</option>
                    <option value="Attention">Attention</option>
                    <option value="Critique">Critique</option>
                  </select>
               </div>
            </div>
            <DialogFooter>
               <button onClick={() => setIsUpdateDialogOpen(false)} className="px-4 py-2">Annuler</button>
               <button 
                onClick={async () => {
                   setIsUpdating(true);
                   try {
                     await api.updateMotor(selectedMotor!.id, { ...selectedMotor, type: editType, etatSante: editEtat });
                     toast.success("Mis à jour");
                     refetch();
                     setIsUpdateDialogOpen(false);
                   } finally { setIsUpdating(false); }
                }}
                className="bg-[#007A3D] px-4 py-2 rounded text-white font-bold"
               >
                 {isUpdating ? "..." : "Enregistrer"}
               </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
