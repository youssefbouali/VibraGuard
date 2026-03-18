import { useState } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { AlertesTable, Alerte } from "@/components/alertes/AlertesTable";
import { AlertDetail } from "@/components/alertes/AlertDetail";

const ALERTES_DATA: Alerte[] = [
  {
    id: "#ALT-\n8402",
    moteur: "MTR-\nBroyeur-\n04",
    typeDefaut: "Déséquilibre Rotorique",
    severite: "Critique",
    confiance: 96,
    dateHeure: "Aujourd'hui,\n08:14",
    statut: "Nouveau",
  },
  {
    id: "#ALT-\n8401",
    moteur: "MTR-\nConv-12",
    typeDefaut: "Usure Roulement (Bague Externe)",
    severite: "Majeur",
    confiance: 82,
    dateHeure: "Aujourd'hui,\n06:45",
    statut: "En cours",
  },
  {
    id: "#ALT-\n8395",
    moteur: "MTR-\nPompe-\n02",
    typeDefaut: "Défaut d'Alignement Léger",
    severite: "Mineur",
    confiance: 65,
    dateHeure: "Hier, 14:22",
    statut: "En cours",
  },
  {
    id: "#ALT-\n8390",
    moteur: "MTR-\nBroyeur-\n01",
    typeDefaut: "Température Anormale",
    severite: "Majeur",
    confiance: 88,
    dateHeure: "Hier, 09:10",
    statut: "Nouveau",
  },
  {
    id: "#ALT-\n8388",
    moteur: "MTR-\nVent-A",
    typeDefaut: "Résonance Structurale",
    severite: "Mineur",
    confiance: 55,
    dateHeure: "12 Fév,\n16:30",
    statut: "En cours",
  },
];

type SeveriteFilter = "Toutes" | "Critique" | "Majeur" | "Mineur";
type DateFilter = "7 Derniers Jours" | "30 Derniers Jours" | "Aujourd'hui";
type MoteurFilter = "Zone Broyage" | "Zone Convoyage" | "Tous";

import { useAlerts } from "@/hooks/use-alerts";

// ... (types and filters remain)

export default function Alertes() {
  const { data: apiAlerts, isLoading } = useAlerts();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [severiteFilter, setSeveriteFilter] = useState<SeveriteFilter>("Toutes");
  const [dateFilter, setDateFilter] = useState<DateFilter>("7 Derniers Jours");
  const [moteurFilter, setMoteurFilter] = useState<MoteurFilter>("Zone Broyage");
  const [searchQuery, setSearchQuery] = useState("");

  // Map backend alerts to frontend format
  const mappedAlerts: Alerte[] = (apiAlerts || []).map(a => ({
    id: a.id,
    moteur: "MTR-Broyeur-04", // Backend doesn't provide specific motor in createAlert
    typeDefaut: a.message,
    severite: a.level as Alerte["severite"],
    confiance: a.priority === "high" ? 95 : 85,
    dateHeure: a.time,
    statut: "Nouveau",
  }));

  const selectedAlerte = mappedAlerts.find((a) => a.id === selectedId) ?? null;

  const filteredAlertes = mappedAlerts.filter((a) => {
    if (severiteFilter !== "Toutes" && a.severite !== severiteFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (
        !a.id.toLowerCase().includes(q) &&
        !a.moteur.toLowerCase().includes(q) &&
        !a.typeDefaut.toLowerCase().includes(q)
      )
        return false;
    }
    return true;
  });

  const handleSelect = (id: string) => {
    setSelectedId(id === selectedId ? null : id);
  };

  const handleAcquitter = (id: string) => {
    console.log("Acquitter", id);
  };

  const handleEscalader = (id: string) => {
    console.log("Escalader", id);
  };

  return (
    <DashboardLayout breadcrumb="Alertes">
      <div className="flex flex-col flex-1 min-h-[calc(100vh-72px)] overflow-hidden">
        {isLoading && <div className="text-white p-4">Chargement des alertes...</div>}
        {/* Filters toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-0 py-5 border-b border-white/5 shrink-0">
          <div className="flex flex-wrap items-center gap-3">
            {/* Sévérité filter */}
            <FilterDropdown
              icon={
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M14.6667 2H1.33337L6.66671 8.30667V12.6667L9.33337 14V8.30667L14.6667 2" stroke="#64748B" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              }
              label="Sévérité:"
              value={severiteFilter}
              options={["Toutes", "Critique", "Majeur", "Mineur"]}
              onChange={(v) => setSeveriteFilter(v as SeveriteFilter)}
            />

            {/* Date filter */}
            <FilterDropdown
              icon={
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M5.33325 1.33325V3.99992M10.6666 1.33325V3.99992" stroke="#64748B" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M3.33333 2.66675H12.6667C13.4026 2.66675 14 3.26419 14 4.00008V13.3334C14 14.0693 13.4026 14.6667 12.6667 14.6667H3.33333C2.59745 14.6667 2 14.0693 2 13.3334V4.00008C2 3.26419 2.59745 2.66675 3.33333 2.66675V2.66675" stroke="#64748B" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M2 6.66675H14" stroke="#64748B" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              }
              label="Date:"
              value={dateFilter}
              options={["Aujourd'hui", "7 Derniers Jours", "30 Derniers Jours"]}
              onChange={(v) => setDateFilter(v as DateFilter)}
            />

            {/* Moteur filter */}
            <FilterDropdown
              icon={
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M7.99992 13.3333V14.6666M7.99992 1.33325V2.66659M11.3333 13.3333V14.6666M11.3333 1.33325V2.66659M1.33325 7.99992H2.66659M1.33325 11.3333H2.66659M1.33325 4.66659H2.66659M13.3333 7.99992H14.6666M13.3333 11.3333H14.6666M13.3333 4.66659H14.6666M4.66659 13.3333V14.6666M4.66659 1.33325V2.66659" stroke="#64748B" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M3.99984 2.66675H11.9998C12.7357 2.66675 13.3332 3.26419 13.3332 4.00008V12.0001C13.3332 12.736 12.7357 13.3334 11.9998 13.3334H3.99984C3.26395 13.3334 2.6665 12.736 2.6665 12.0001V4.00008C2.6665 3.26419 3.26395 2.66675 3.99984 2.66675V2.66675" stroke="#64748B" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M5.99992 5.33325H9.99992C10.3679 5.33325 10.6666 5.63198 10.6666 5.99992V9.99992C10.6666 10.3679 10.3679 10.6666 9.99992 10.6666H5.99992C5.63198 10.6666 5.33325 10.3679 5.33325 9.99992V5.99992C5.33325 5.63198 5.63198 5.33325 5.99992 5.33325V5.33325" stroke="#64748B" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              }
              label="Moteur:"
              value={moteurFilter}
              options={["Zone Broyage", "Zone Convoyage", "Tous"]}
              onChange={(v) => setMoteurFilter(v as MoteurFilter)}
            />
          </div>

          {/* Search */}
          <div className="flex items-center gap-3 h-11 px-4 rounded-lg border border-white/10 bg-[rgba(17,26,36,0.60)] min-w-[220px] max-w-[360px] flex-1">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="shrink-0">
              <path d="M15.7501 15.7501L12.4951 12.4951" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M2.25 8.25C2.25 11.5615 4.93851 14.25 8.25 14.25C11.5615 14.25 14.25 11.5615 14.25 8.25C14.25 4.93851 11.5615 2.25 8.25 2.25C4.93851 2.25 2.25 4.93851 2.25 8.25V8.25" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <input
              type="text"
              placeholder="Rechercher une alerte, un ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-sm text-[#E2E8F0] placeholder-[#64748B] outline-none"
            />
          </div>
        </div>

        {/* Split content */}
        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* Table area */}
          <div className="flex-1 min-w-0 overflow-y-auto overflow-x-auto py-6">
            <AlertesTable
              alertes={filteredAlertes}
              selectedId={selectedId}
              onSelect={handleSelect}
              onAcquitter={handleAcquitter}
              onEscalader={handleEscalader}
            />
          </div>

          {/* Side panel */}
          {selectedAlerte && (
            <div className="hidden lg:block w-[400px] xl:w-[420px] shrink-0 overflow-y-auto border-l border-white/[0.08]">
              <AlertDetail
                alerte={selectedAlerte}
                onClose={() => setSelectedId(null)}
                onAcquitter={handleAcquitter}
                onEscalader={handleEscalader}
              />
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

// ────────────────────────────────────────
// FilterDropdown helper component
// ────────────────────────────────────────
interface FilterDropdownProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}

function FilterDropdown({ icon, label, value, options, onChange }: FilterDropdownProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2.5 h-11 px-4 rounded-lg border border-white/10 bg-[rgba(17,26,36,0.60)] hover:border-white/20 transition-colors"
      >
        <span className="shrink-0">{icon}</span>
        <span className="text-[#E2E8F0] text-sm font-medium">{label}</span>
        <span className="text-[#10B981] text-sm font-medium">{value}</span>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
          <path d="M4 6L8 10L12 6" stroke="#64748B" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full mt-1 z-20 min-w-[160px] rounded-lg border border-white/10 bg-[#111A24] shadow-lg overflow-hidden">
            {options.map((opt) => (
              <button
                key={opt}
                onClick={() => {
                  onChange(opt);
                  setOpen(false);
                }}
                className={`w-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-white/5 ${opt === value ? "text-[#10B981]" : "text-[#E2E8F0]"
                  }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
