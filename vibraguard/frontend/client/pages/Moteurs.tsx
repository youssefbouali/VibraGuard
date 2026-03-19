import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { cn } from "@/lib/utils";

type HealthStatus = "Critique" | "Attention" | "Normal";

interface Moteur {
  id: string;
  zone: string;
  localisation: string;
  type: string;
  puissance: string;
  etatSante: HealthStatus;
  vibrationRMS: number;
  derniereAlerte: string;
  alerteRef?: string;
}

const moteursData: Moteur[] = [
  {
    id: "MTR-Broyeur-04",
    zone: "Zone 2",
    localisation: "Ligne de Concasseur",
    type: "Asynchrone",
    puissance: "350kW",
    etatSante: "Critique",
    vibrationRMS: 14.2,
    derniereAlerte: "Il y a 2h",
    alerteRef: "#ALT-8402",
  },
  {
    id: "MTR-Ventil-12",
    zone: "Zone 4",
    localisation: "Séchage Thermique",
    type: "Synchrone",
    puissance: "120kW",
    etatSante: "Attention",
    vibrationRMS: 6.8,
    derniereAlerte: "Il y a 1j",
    alerteRef: "#ALT-8395",
  },
  {
    id: "MTR-Conv-01",
    zone: "Zone 1",
    localisation: "Bande de Transport A",
    type: "Asynchrone",
    puissance: "55kW",
    etatSante: "Normal",
    vibrationRMS: 1.2,
    derniereAlerte: "Aucune",
  },
  {
    id: "MTR-Pompe-08",
    zone: "Zone 3",
    localisation: "Station Lavage",
    type: "Asynchrone",
    puissance: "200kW",
    etatSante: "Normal",
    vibrationRMS: 2.4,
    derniereAlerte: "Il y a 15j",
    alerteRef: "Résolue",
  },
  {
    id: "MTR-Broyeur-02",
    zone: "Zone 2",
    localisation: "Ligne de Concasseur",
    type: "Asynchrone",
    puissance: "400kW",
    etatSante: "Attention",
    vibrationRMS: 7.5,
    derniereAlerte: "Il y a 5h",
    alerteRef: "#ALT-8400",
  },
];

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
  Normal: {
    color: "text-[#007A3D]",
    bg: "bg-[rgba(0,122,61,0.10)]",
    border: "border-[rgba(0,122,61,0.20)]",
    dot: "bg-[#007A3D]",
    glow: "shadow-[0_0_8px_0_#007A3D]",
  },
};

const vibrationColor: Record<HealthStatus, string> = {
  Critique: "text-[#D93F3F]",
  Attention: "text-[#F2A900]",
  Normal: "text-[#007A3D]",
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

const DotsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M7.33325 7.99998C7.33325 8.36792 7.63198 8.66665 7.99992 8.66665C8.36786 8.66665 8.66659 8.36792 8.66659 7.99998C8.66659 7.63204 8.36786 7.33331 7.99992 7.33331C7.63198 7.33331 7.33325 7.63204 7.33325 7.99998V7.99998" stroke="#C9E7E6" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 7.99998C12 8.36792 12.2987 8.66665 12.6667 8.66665C13.0346 8.66665 13.3333 8.36792 13.3333 7.99998C13.3333 7.63204 13.0346 7.33331 12.6667 7.33331C12.2987 7.33331 12 7.63204 12 7.99998V7.99998" stroke="#C9E7E6" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M2.66675 7.99998C2.66675 8.36792 2.96547 8.66665 3.33341 8.66665C3.70136 8.66665 4.00008 8.36792 4.00008 7.99998C4.00008 7.63204 3.70136 7.33331 3.33341 7.33331C2.96547 7.33331 2.66675 7.63204 2.66675 7.99998V7.99998" stroke="#C9E7E6" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

function HealthBadge({ status }: { status: HealthStatus }) {
  const cfg = statusConfig[status];
  return (
    <span className={cn("inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-[13px] font-medium", cfg.bg, cfg.border, cfg.color)}>
      <span className={cn("w-2 h-2 rounded-full shrink-0", cfg.dot, cfg.glow)} />
      {status}
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

import { useMoteurs } from "@/hooks/use-moteurs";

// ... (types and statusConfig remain)

export default function Moteurs() {
  const navigate = useNavigate();
  const [view, setView] = useState<"liste" | "carte">("liste");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const { data: apiMoteurs, isLoading } = useMoteurs();

  const totalMoteurs = apiMoteurs?.length || 0;
  const perPage = 5;
  const totalPages = Math.ceil(totalMoteurs / perPage) || 1;

  // Map backend data to frontend Moteur interface
  const mappedMoteurs: Moteur[] = (apiMoteurs || []).map(m => {
    let etatSante: HealthStatus = "Normal";
    const label = m.etatLabel || "";
    if (label.includes("Critique") || label.includes("Alerte")) etatSante = "Critique";
    else if (label.includes("Attention")) etatSante = "Attention";
    else if (label.includes("Optimal")) etatSante = "Normal";
    
    return {
      id: m.id,
      zone: "Zone Principal",
      localisation: "Site Alpha",
      type: m.type,
      puissance: "N/A",
      etatSante: etatSante,
      vibrationRMS: parseFloat(m.vibration.split(' ')[0] || "0"),
      derniereAlerte: "Récemment",
    };
  });

  const filtered = mappedMoteurs.filter(
    (m) =>
      m.id.toLowerCase().includes(search.toLowerCase()) ||
      m.zone.toLowerCase().includes(search.toLowerCase()) ||
      m.localisation.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout breadcrumb="Moteurs">
      <div className="flex flex-col gap-4 sm:gap-6">
        {isLoading && <div className="text-white">Chargement des données...</div>}
        {/* Title row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h1 className="text-xl sm:text-2xl lg:text-[24px] font-semibold text-[#E6F0F2]">Liste des Moteurs</h1>
          <button className="flex items-center gap-2 px-4 h-10 rounded-md bg-[#007A3D] hover:bg-[#006633] transition-colors text-white text-sm font-medium whitespace-nowrap">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M3.75 9H14.25M9 3.75V14.25" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
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
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent text-sm text-[#98A6A8] placeholder:text-[#98A6A8] outline-none flex-1 min-w-0"
              />
            </div>

            {/* Zone dropdown */}
            <button className="flex items-center gap-2 h-10 px-4 rounded-md border border-black/[0.08] bg-[#0D1316] text-[#E6F0F2] text-sm min-w-[160px]">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
                <path d="M13.3334 6.66665C13.3334 9.99531 9.64075 13.462 8.40075 14.5326C8.16344 14.7111 7.83672 14.7111 7.59941 14.5326C6.35941 13.462 2.66675 9.99531 2.66675 6.66665C2.66675 3.7231 5.05653 1.33331 8.00008 1.33331C10.9436 1.33331 13.3334 3.7231 13.3334 6.66665" stroke="#98A6A8" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M6 6.66669C6 7.77052 6.89617 8.66669 8 8.66669C9.10383 8.66669 10 7.77052 10 6.66669C10 5.56286 9.10383 4.66669 8 4.66669C6.89617 4.66669 6 5.56286 6 6.66669V6.66669" stroke="#98A6A8" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="flex-1 text-left">Toutes les zones</span>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
                <path d="M4 6L8 10L12 6" stroke="#98A6A8" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {/* État dropdown */}
            <button className="flex items-center gap-2 h-10 px-4 rounded-md border border-black/[0.08] bg-[#0D1316] text-[#E6F0F2] text-sm min-w-[160px]">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
                <g clipPath="url(#etat-clip)">
                  <path d="M14.6666 7.99998H13.0133C12.4145 7.9987 11.8883 8.39676 11.7266 8.97331L10.1599 14.5466C10.1392 14.6178 10.074 14.6666 9.99992 14.6666C9.92584 14.6666 9.86066 14.6178 9.83992 14.5466L6.15992 1.45331C6.13918 1.3822 6.07399 1.33331 5.99992 1.33331C5.92584 1.33331 5.86066 1.3822 5.83992 1.45331L4.27325 7.02665C4.11225 7.60082 3.58957 7.99827 2.99325 7.99998H1.33325" stroke="#98A6A8" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
                </g>
                <defs><clipPath id="etat-clip"><rect width="16" height="16" fill="white" /></clipPath></defs>
              </svg>
              <span className="flex-1 text-left">État: Tous</span>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
                <path d="M4 6L8 10L12 6" stroke="#98A6A8" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
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
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 3.33331H2.00667M2 7.99998H2.00667M2 12.6666H2.00667M5.33333 3.33331H14M5.33333 7.99998H14M5.33333 12.6666H14" stroke="currentColor" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
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
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M9.404 3.70202C9.77922 3.88951 10.2208 3.88951 10.596 3.70202L13.0353 2.48202C13.2421 2.37867 13.4877 2.38985 13.6843 2.51157C13.8809 2.63328 14.0003 2.84815 14 3.07935V11.5887C13.9999 11.8411 13.8572 12.0718 13.6313 12.1847L10.596 13.7027C10.2208 13.8902 9.77922 13.8902 9.404 13.7027L6.596 12.2987C6.22079 12.1112 5.77922 12.1112 5.404 12.2987L2.96467 13.5187C2.75775 13.6221 2.51202 13.6108 2.31541 13.489C2.11881 13.3671 1.99943 13.152 2 12.9207V4.41202C2.00014 4.15957 2.14285 3.92886 2.36867 3.81602L5.404 2.29802C5.77922 2.11052 6.22079 2.11052 6.596 2.29802L9.404 3.70202M10 3.84268V13.8427M6 2.15735V12.1573" stroke="currentColor" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Carte
            </button>
          </div>
        </div>

        {/* Table - Responsive */}
        <div className="rounded-lg border border-black/[0.08] bg-[#0B1518] overflow-x-auto">
          {/* Table header - Hide columns on mobile */}
          <div className="grid grid-cols-[1fr_1fr_auto] md:grid-cols-[2fr_1.8fr_1.3fr_1.5fr_1.4fr_1.5fr_auto] border-b border-black/[0.08] bg-[rgba(15,39,48,0.30)] min-w-full md:min-w-0">
            <div className="flex items-center gap-2 px-3 sm:px-6 py-4">
              <span className="text-xs sm:text-[13px] font-medium text-[#C9E7E6]">ID Moteur</span>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="hidden sm:block">
                <path d="M6.99996 2.91669V11.0834M11.0833 7.00002L6.99996 11.0834L2.91663 7.00002" stroke="#C9E7E6" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="flex items-center px-3 sm:px-6 py-4">
              <span className="text-xs sm:text-[13px] font-medium text-[#C9E7E6]">État Santé</span>
            </div>
            {/* Hidden on mobile */}
            <div className="hidden md:flex items-center px-6 py-4">
              <span className="text-[13px] font-medium text-[#C9E7E6]">Localisation</span>
            </div>
            <div className="hidden md:flex items-center px-6 py-4">
              <span className="text-[13px] font-medium text-[#C9E7E6]">Type</span>
            </div>
            <div className="hidden md:flex items-center px-6 py-4">
              <span className="text-[13px] font-medium text-[#C9E7E6]">Vibration RMS</span>
            </div>
            <div className="hidden md:flex items-center px-6 py-4">
              <span className="text-[13px] font-medium text-[#C9E7E6]">Dernière Alerte</span>
            </div>
            <div className="flex items-center justify-end px-3 sm:px-6 py-4">
              <span className="text-xs sm:text-[13px] font-medium text-[#C9E7E6]">Actions</span>
            </div>
          </div>

          {/* Table body */}
          <div className="divide-y divide-black/[0.08] overflow-x-auto">
            {filtered.map((moteur) => (
              <div
                key={moteur.id}
                className="grid grid-cols-[1fr_1fr_auto] md:grid-cols-[2fr_1.8fr_1.3fr_1.5fr_1.4fr_1.5fr_auto] hover:bg-white/[0.02] transition-colors cursor-pointer min-w-full md:min-w-0"
                onClick={() => navigate(`/moteurs/${moteur.id}`)}
              >
                {/* ID Moteur */}
                <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-6 py-[19px]">
                  <div className="flex w-8 h-8 items-center justify-center rounded bg-[rgba(12,108,242,0.15)] shrink-0">
                    <MoteurIcon />
                  </div>
                  <span className="text-xs sm:text-[14px] font-semibold text-[#E6F0F2] hover:text-[#0EA5E9] truncate transition-colors">{moteur.id}</span>
                </div>

                {/* État Santé - Mobile Position */}
                <div className="flex items-center px-3 sm:px-6 py-[20px]">
                  <HealthBadge status={moteur.etatSante} />
                </div>

                {/* Hidden on Mobile, Visible on MD+ */}
                <div className="hidden md:flex flex-col justify-center gap-1 px-6 py-4">
                  <span className="text-[14px] text-[#E6F0F2]">{moteur.zone}</span>
                  <span className="text-[13px] text-[#C9E7E6]">{moteur.localisation}</span>
                </div>

                <div className="hidden md:flex flex-col justify-center gap-1 px-6 py-4">
                  <span className="text-[14px] text-[#E6F0F2]">{moteur.type}</span>
                  <span className="text-[13px] text-[#C9E7E6]">{moteur.puissance}</span>
                </div>

                <div className="hidden md:flex items-center gap-1 px-6 py-[25px]">
                  <span className={cn("text-[15px] font-semibold", vibrationColor[moteur.etatSante])}>
                    {moteur.vibrationRMS}
                  </span>
                  <span className="text-[13px] text-[#C9E7E6]">mm/s</span>
                </div>

                <div className="hidden md:flex flex-col justify-center gap-1 px-6 py-4">
                  <span className="text-[14px] text-[#E6F0F2]">{moteur.derniereAlerte}</span>
                  {moteur.alerteRef && moteur.alerteRef !== "Résolue" && (
                    <span className={cn("text-[13px]", statusConfig[moteur.etatSante].color)}>
                      {moteur.alerteRef}
                    </span>
                  )}
                  {moteur.alerteRef === "Résolue" && (
                    <span className="text-[13px] text-[#C9E7E6]">Résolue</span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 sm:gap-2 px-3 sm:px-6 py-[19px] justify-end">
                  <ActionBtn>
                    <VibrationIcon />
                  </ActionBtn>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/moteurs/${moteur.id}`);
                    }}
                    className="flex w-8 h-8 items-center justify-center rounded bg-[#0F2730] hover:bg-[#163340] transition-colors shrink-0"
                    title="Voir les détails"
                  >
                    <EyeIcon />
                  </button>
                  <ActionBtn>
                    <DotsIcon />
                  </ActionBtn>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-3 sm:px-6 py-4 border-t border-black/[0.08] bg-[rgba(15,39,48,0.10)]">
            <span className="text-xs sm:text-[13px] text-[#C9E7E6] order-2 sm:order-1">
              Affichage de <span className="font-medium text-[#E6F0F2]">1</span> à{" "}
              <span className="font-medium text-[#E6F0F2]">5</span> sur{" "}
              <span className="font-medium text-[#E6F0F2]">{totalMoteurs}</span> moteurs
            </span>

            <div className="flex items-center gap-2">
              {/* Prev */}
              <button className="flex w-8 h-8 items-center justify-center rounded border border-black/[0.08] bg-[#0D1316] hover:bg-white/5 transition-colors">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M10 12L6 8L10 4" stroke="#E6F0F2" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {[1, 2, 3].map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={cn(
                    "flex w-8 h-8 items-center justify-center rounded text-[13px] font-medium border transition-colors",
                    currentPage === page
                      ? "bg-[#007A3D] border-[#007A3D] text-white"
                      : "bg-[#0D1316] border-black/[0.08] text-[#E6F0F2] hover:bg-white/5"
                  )}
                >
                  {page}
                </button>
              ))}

              <span className="text-[#98A6A8] text-base px-1">...</span>

              <button
                onClick={() => setCurrentPage(totalPages)}
                className={cn(
                  "flex w-8 h-8 items-center justify-center rounded text-[13px] font-medium border transition-colors",
                  currentPage === totalPages
                    ? "bg-[#007A3D] border-[#007A3D] text-white"
                    : "bg-[#0D1316] border-black/[0.08] text-[#E6F0F2] hover:bg-white/5"
                )}
              >
                9
              </button>

              {/* Next */}
              <button className="flex w-8 h-8 items-center justify-center rounded border border-black/[0.08] bg-[#0D1316] hover:bg-white/5 transition-colors">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M6 12L10 8L6 4" stroke="#E6F0F2" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

