import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";

// ── Mock data ────────────────────────────────────────────────────────────────
const ALERTE_MOCK = {
  id: "#ALT-8402",
  severite: "CRITIQUE" as const,
  equipement: "MTR-Broyeur-04 (Zone 2)",
  typeDefaut: "Désalignement de l'arbre",
  scoreConfiance: 0.94,
  horodatage: "24 Oct 2026, 07:12:45",
  recommandation: {
    intro:
      "Le modèle d'apprentissage automatique indique une forte probabilité de désalignement critique (94%) basée sur les harmoniques 1X et 2X. ",
    action: "Action suggérée :",
    suite:
      " Arrêter l'équipement, inspecter les fixations du châssis et vérifier l'accouplement moteur immédiatement pour éviter des dommages sur le palier SKF-6205.",
  },
  historique: [
    {
      time: "Aujourd'hui, 07:20",
      titre: "Notification SMS envoyée",
      description: "Alerte transférée à Karim B. (Spécialiste Vibrations)",
      critical: false,
    },
    {
      time: "Aujourd'hui, 07:12",
      titre: "Alerte Critique Générée",
      description: "Dépassement du seuil ISO 10816-3 (18.4 mm/s)",
      critical: true,
    },
    {
      time: "Aujourd'hui, 06:45",
      titre: "Analyse prédictive activée",
      description: "Tendance à la hausse détectée par VibraGuard ML",
      critical: false,
    },
    {
      time: "23 Oct 2026, 14:30",
      titre: "Dernière inspection de routine",
      description: "Effectuée par Équipe Maintenance Ligne A",
      critical: false,
    },
  ],
};

// ── Spectral chart SVG ────────────────────────────────────────────────────────
function SpectralChart() {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 730 205"
      fill="none"
      preserveAspectRatio="xMidYMid meet"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <clipPath id="spectral-clip">
          <rect width="730" height="205" fill="white" />
        </clipPath>
      </defs>
      <g clipPath="url(#spectral-clip)">
        {/* Grid lines */}
        <path d="M0 51.25H730" stroke="white" strokeOpacity="0.08" strokeWidth="0.97" strokeDasharray="3.87 3.87" />
        <path d="M0 102.5H730" stroke="white" strokeOpacity="0.08" strokeWidth="0.97" strokeDasharray="3.87 3.87" />
        <path d="M0 153.75H730" stroke="white" strokeOpacity="0.08" strokeWidth="0.97" strokeDasharray="3.87 3.87" />
        {/* Y-axis labels */}
        <text fill="#98A6A8" fontFamily="Inter, sans-serif" fontSize="10.25" x="9" y="46">15.0</text>
        <text fill="#98A6A8" fontFamily="Inter, sans-serif" fontSize="10.25" x="9" y="97">10.0</text>
        <text fill="#98A6A8" fontFamily="Inter, sans-serif" fontSize="10.25" x="9" y="148">5.0</text>
        {/* Baseline – grey */}
        <path
          opacity="0.5"
          d="M0 184.5C30.4 181.1 60.8 181.1 91.2 184.5C121.6 187.9 152 187.2 182.3 182.5C212.7 177.7 243.1 178 273.5 183.5C303.9 188.9 334.3 187.6 364.7 179.4C395 171.2 425.4 172.9 455.8 184.5C486.2 196.1 516.6 195.1 547 181.4C577.4 167.8 607.8 168.4 638.2 183.5C668.5 198.5 698.9 198.9 729.3 184.5"
          stroke="#98A6A8"
          strokeWidth="1.94"
        />
        {/* Current measure – red */}
        <path
          d="M0 174.3C24.3 167.4 48.6 165.7 72.9 169.1C97.2 172.5 121.6 167.4 145.9 153.8C170.2 140.1 194.5 136.7 218.8 143.5C243.1 150.3 261.3 129.8 273.5 82C285.7 41 297.8 17.1 310 10.3C322.1 65 334.3 102.5 346.4 123C358.6 143.5 382.9 150.3 419.4 143.5C455.8 136.7 480.1 140.1 492.3 153.8C504.5 167.4 528.8 170.8 565.2 164C601.7 157.2 626 158.9 638.2 169.1C650.3 179.4 680.7 181.1 729.3 174.3"
          stroke="#D93F3F"
          strokeWidth="1.94"
        />
        {/* Fill under curve */}
        <path
          d="M0 174.3C24.3 167.4 48.6 165.7 72.9 169.1C97.2 172.5 121.6 167.4 145.9 153.8C170.2 140.1 194.5 136.7 218.8 143.5C243.1 150.3 261.3 129.8 273.5 82C285.7 41 297.8 17.1 310 10.3C322.1 65 334.3 102.5 346.4 123C358.6 143.5 382.9 150.3 419.4 143.5C455.8 136.7 480.1 140.1 492.3 153.8C504.5 167.4 528.8 170.8 565.2 164C601.7 157.2 626 158.9 638.2 169.1C650.3 179.4 680.7 181.1 729.3 174.3V205H0V174.3Z"
          fill="#D93F3F"
          fillOpacity="0.1"
        />
        {/* Peak dot */}
        <circle cx="310" cy="10.25" r="4" fill="#D93F3F" />
        {/* Vertical dashed line */}
        <path d="M310 10.25V205" stroke="#D93F3F" strokeWidth="0.97" strokeDasharray="1.94 1.94" opacity="0.7" />
        {/* Peak label */}
        <text fill="#D93F3F" fontFamily="Inter, sans-serif" fontSize="12.3" fontWeight="bold" x="319" y="20.5">
          18.4 mm/s
        </text>
      </g>
    </svg>
  );
}

// ── Icons ─────────────────────────────────────────────────────────────────────
function MoteurIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M9 15V16.5M9 1.5V3M12.75 15V16.5M12.75 1.5V3M1.5 9H3M1.5 12.75H3M1.5 5.25H3M15 9H16.5M15 12.75H16.5M15 5.25H16.5M5.25 15V16.5M5.25 1.5V3" stroke="#98A6A8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4.5 3H13.5C14.33 3 15 3.67 15 4.5V13.5C15 14.33 14.33 15 13.5 15H4.5C3.67 15 3 14.33 3 13.5V4.5C3 3.67 3.67 3 4.5 3V3" stroke="#98A6A8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6.75 6H11.25C11.66 6 12 6.34 12 6.75V11.25C12 11.66 11.66 12 11.25 12H6.75C6.34 12 6 11.66 6 11.25V6.75C6 6.34 6.34 6 6.75 6V6" stroke="#98A6A8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function WaveformIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <g clipPath="url(#wf-clip)">
        <path d="M16.5 9H14.64C13.97 8.999 13.37 9.447 13.19 10.095L11.43 16.365C11.407 16.445 11.333 16.5 11.25 16.5C11.167 16.5 11.093 16.445 11.07 16.365L6.93 1.635C6.907 1.555 6.833 1.5 6.75 1.5C6.667 1.5 6.593 1.555 6.57 1.635L4.808 7.905C4.626 8.551 4.038 8.998 3.368 9H1.5" stroke="#D93F3F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <defs><clipPath id="wf-clip"><rect width="18" height="18" fill="white" /></clipPath></defs>
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <g clipPath="url(#clk-clip)">
        <path d="M1.5 9C1.5 13.14 4.86 16.5 9 16.5C13.14 16.5 16.5 13.14 16.5 9C16.5 4.86 13.14 1.5 9 1.5C4.86 1.5 1.5 4.86 1.5 9V9" stroke="#98A6A8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 4.5V9L12 10.5" stroke="#98A6A8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <defs><clipPath id="clk-clip"><rect width="18" height="18" fill="white" /></clipPath></defs>
    </svg>
  );
}

function HistoryIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M2.5 10C2.5 14.14 5.86 17.5 10 17.5C14.14 17.5 17.5 14.14 17.5 10C17.5 5.86 14.14 2.5 10 2.5C7.9 2.508 5.89 3.326 4.383 4.783L2.5 6.667" stroke="#98A6A8" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2.5 2.5V6.667H6.667M10 5.833V10L13.333 11.667" stroke="#98A6A8" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function AcquitterIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <g clipPath="url(#acq-clip)">
        <path d="M16.35 7.5C17.06 10.96 15.25 14.45 12.01 15.87C8.77 17.29 4.98 16.25 2.92 13.38C0.85 10.51 1.07 6.59 3.44 3.97C5.81 1.35 9.69 0.73 12.75 2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6.75 8.25L9 10.5L16.5 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <defs><clipPath id="acq-clip"><rect width="18" height="18" fill="white" /></clipPath></defs>
    </svg>
  );
}

function CreerOTIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <g clipPath="url(#ot-clip)">
        <path d="M12 3H13.5C14.33 3 15 3.67 15 4.5V6M16 11.75C16.41 11.35 16.56 10.76 16.42 10.21C16.27 9.66 15.84 9.23 15.29 9.08C14.74 8.94 14.15 9.09 13.75 9.5L9.99 13.25C9.82 13.43 9.69 13.65 9.62 13.89L8.99 16.05C8.95 16.18 8.99 16.32 9.08 16.42C9.18 16.51 9.32 16.55 9.45 16.51L11.6 15.88C11.85 15.81 12.07 15.68 12.25 15.5L12 3M6 16.5H4.5C3.67 16.5 3 15.83 3 15V4.5C3 3.67 3.67 3 4.5 3H6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6.75 1.5H11.25C11.66 1.5 12 1.84 12 2.25V3.75C12 4.16 11.66 4.5 11.25 4.5H6.75C6.34 4.5 6 4.16 6 3.75V2.25C6 1.84 6.34 1.5 6.75 1.5V1.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <defs><clipPath id="ot-clip"><rect width="18" height="18" fill="white" /></clipPath></defs>
    </svg>
  );
}

function EscaladerIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M16.3 13.5L10.3 3C10.03 2.53 9.53 2.24 9 2.24C8.45 2.24 7.95 2.53 7.69 3L1.69 13.5C1.42 13.97 1.42 14.54 1.69 15.01C1.96 15.47 2.46 15.75 3 15.75H15C15.54 15.75 16.03 15.46 16.3 15C16.57 14.54 16.57 13.96 16.3 13.5M9 6.75V9.75M9 12.75H9.008" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IgnorerIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <g clipPath="url(#ign-clip)">
        <path d="M8.05 3.81C11.64 3.38 15.08 5.4 16.45 8.74C16.52 8.91 16.52 9.09 16.45 9.26C16.18 9.93 15.81 10.56 15.37 11.13M10.56 10.62C9.68 11.47 8.28 11.46 7.41 10.59C6.54 9.72 6.53 8.32 7.38 7.44" stroke="#E6F0F2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M13.11 13.12C11.1 14.32 8.66 14.58 6.45 13.83C4.23 13.09 2.44 11.42 1.55 9.26C1.48 9.09 1.48 8.91 1.55 8.74C2.21 7.13 3.38 5.77 4.88 4.88M1.5 1.5L16.5 16.5" stroke="#E6F0F2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <defs><clipPath id="ign-clip"><rect width="18" height="18" fill="white" /></clipPath></defs>
    </svg>
  );
}

function PrinterIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <g clipPath="url(#prt-clip)">
        <path d="M4.5 13.5H3C2.17 13.5 1.5 12.83 1.5 12V8.25C1.5 7.42 2.17 6.75 3 6.75H15C15.83 6.75 16.5 7.42 16.5 8.25V12C16.5 12.83 15.83 13.5 15 13.5H13.5M4.5 6.75V2.25C4.5 1.84 4.84 1.5 5.25 1.5H12.75C13.16 1.5 13.5 1.84 13.5 2.25V6.75" stroke="#E6F0F2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5.25 10.5H12.75C13.16 10.5 13.5 10.84 13.5 11.25V15.75C13.5 16.16 13.16 16.5 12.75 16.5H5.25C4.84 16.5 4.5 16.16 4.5 15.75V11.25C4.5 10.84 4.84 10.5 5.25 10.5V10.5" stroke="#E6F0F2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <defs><clipPath id="prt-clip"><rect width="18" height="18" fill="white" /></clipPath></defs>
    </svg>
  );
}

function AIIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M11.017 2.814C11.105 2.341 11.519 1.998 12 1.998C12.481 1.998 12.895 2.341 12.983 2.814L14.034 8.372C14.187 9.181 14.819 9.813 15.628 9.966L21.186 11.017C21.659 11.105 22.002 11.519 22.002 12C22.002 12.481 21.659 12.895 21.186 12.983L15.628 14.034C14.819 14.187 14.187 14.819 14.034 15.628L12.983 21.186C12.895 21.659 12.481 22.002 12 22.002C11.519 22.002 11.105 21.659 11.017 21.186L9.966 15.628C9.813 14.819 9.181 14.187 8.372 14.034L2.814 12.983C2.341 12.895 1.998 12.481 1.998 12C1.998 11.519 2.341 11.105 2.814 11.017L8.372 9.966C9.181 9.813 9.813 9.181 9.966 8.372L11.017 2.814M20 2V6M22 4H18" stroke="#0C6CF2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2 20C2 21.1 2.9 22 4 22C5.1 22 6 21.1 6 20C6 18.9 5.1 18 4 18C2.9 18 2 18.9 2 20V20" stroke="#0C6CF2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";

// ── Main page ─────────────────────────────────────────────────────────────────
export default function AlerteDetail() {
  const { id } = useParams<{ id: string }>();

  // In a real app you'd fetch by id; here we use mock
  const alerte = ALERTE_MOCK;

  return (
    <DashboardLayout breadcrumb="Alertes">
      <div className="flex flex-col flex-1 min-h-[calc(100vh-72px)] overflow-hidden">
        {/* Page heading row */}
        <div className="flex items-center justify-between pt-4 pb-6 px-0 transition-all">
          <div className="flex items-center gap-4 flex-wrap">
            <h1 className="text-[#E6F0F2] text-2xl lg:text-3xl font-bold">
              Détail de l'alerte {alerte.id}
            </h1>
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[rgba(217,63,63,0.15)] border border-[rgba(217,63,63,0.4)] text-[#D93F3F] text-xs font-bold uppercase tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D93F3F]" />
              {alerte.severite}
            </span>
          </div>
          <button className="flex items-center gap-2 h-10 px-4 rounded-lg border border-white/10 bg-[rgba(11,21,24,0.60)] hover:bg-white/5 transition-colors text-[#E6F0F2] text-sm font-semibold shrink-0">
            <PrinterIcon />
            Exporter Rapport
          </button>
        </div>

        {/* Two-column layout */}
        <div className="flex gap-6 pb-10 min-w-0 flex-col xl:flex-row">
          {/* ── LEFT COLUMN ─────────────────────────────────────── */}
          <div className="flex-1 min-w-0 flex flex-col gap-0 rounded-lg border border-black/[0.08] bg-[#0B1518] overflow-hidden">
            {/* Key info */}
            <div className="p-6 border-b border-black/[0.08]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                {/* Équipement */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[#98A6A8] text-[13px] font-medium">Équipement (Moteur)</span>
                  <div className="flex items-center gap-2">
                    <MoteurIcon />
                    <span className="text-[#E6F0F2] text-base font-semibold">{alerte.equipement}</span>
                  </div>
                </div>

                {/* Type de défaut */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[#98A6A8] text-[13px] font-medium">Type de défaut détecté</span>
                  <div className="flex items-center gap-2">
                    <WaveformIcon />
                    <span className="text-[#E6F0F2] text-base font-semibold">{alerte.typeDefaut}</span>
                  </div>
                </div>

                {/* Score confiance */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[#98A6A8] text-[13px] font-medium">Score de Confiance ML</span>
                  <span className="text-[#D93F3F] text-2xl font-bold">{alerte.scoreConfiance}</span>
                </div>

                {/* Horodatage */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[#98A6A8] text-[13px] font-medium">Horodatage</span>
                  <div className="flex items-center gap-2">
                    <ClockIcon />
                    <span className="text-[#E6F0F2] text-base font-semibold">{alerte.horodatage}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Recommendation */}
            <div className="p-6 border-b border-black/[0.08]">
              <div className="flex items-start gap-4 p-5 rounded-md border border-[rgba(12,108,242,0.30)] bg-gradient-to-r from-[#0B2239] to-[#0B1518]">
                <div className="flex w-10 h-10 shrink-0 items-center justify-center rounded-md bg-[rgba(12,108,242,0.20)]">
                  <AIIcon />
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-[#0C6CF2] text-[15px] font-bold">Recommandation IA VibraGuard</span>
                  <p className="text-[#E6F0F2] text-sm leading-relaxed">
                    {alerte.recommandation.intro}
                    <strong>{alerte.recommandation.action}</strong>
                    {alerte.recommandation.suite}
                  </p>
                </div>
              </div>
            </div>

            {/* Spectral Graph */}
            <div className="p-6 border-b border-black/[0.08]">
              <div className="rounded-md border border-black/[0.08] bg-[#0D1316] overflow-hidden">
                {/* Graph header */}
                <div className="flex items-center justify-between px-5 pt-6 pb-4">
                  <span className="text-[#C9E7E6] text-sm font-medium">
                    Analyse Spectrale (Vitesse vibratoire mm/s)
                  </span>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-sm bg-[#98A6A8]" />
                      <span className="text-[#98A6A8] text-xs">Ligne de base</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-sm bg-[#D93F3F]" />
                      <span className="text-[#98A6A8] text-xs">Mesure actuelle</span>
                    </div>
                  </div>
                </div>
                {/* Chart area */}
                <div className="px-5 pb-5 h-[220px]">
                  <SpectralChart />
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-4 px-6 py-5">
              <button className="flex items-center gap-2 h-11 px-5 rounded-md bg-[#007A3D] hover:bg-[#006633] transition-colors text-white text-sm font-semibold">
                <AcquitterIcon />
                Acquitter
              </button>
              <button className="flex items-center gap-2 h-11 px-5 rounded-md bg-[#0C6CF2] hover:bg-[#0a5dd4] transition-colors text-white text-sm font-semibold">
                <CreerOTIcon />
                Créer OT
              </button>
              <button className="flex items-center gap-2 h-11 px-5 rounded-md bg-[#F2A900] hover:bg-[#d99500] transition-colors text-white text-sm font-semibold">
                <EscaladerIcon />
                Escalader
              </button>
              <div className="flex-1" />
              <button className="flex items-center gap-2 h-11 px-5 rounded-md border border-white/10 hover:bg-white/5 transition-colors text-[#E6F0F2] text-sm font-semibold">
                <IgnorerIcon />
                Ignorer
              </button>
            </div>
          </div>

          {/* ── RIGHT COLUMN: History ────────────────────────────── */}
          <div className="w-full xl:w-[320px] shrink-0 flex flex-col rounded-lg border border-black/[0.08] bg-[#0B1518] overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-3 px-6 py-5 border-b border-black/[0.08]">
              <HistoryIcon />
              <span className="text-[#E6F0F2] text-base font-semibold">Historique des actions</span>
            </div>

            {/* Timeline */}
            <div className="flex-1 px-6 py-6">
              <div className="relative pl-6">
                {/* Vertical line */}
                <div className="absolute left-[7px] top-4 bottom-4 w-[2px] bg-black/[0.08]" />

                <div className="flex flex-col gap-6">
                  {alerte.historique.map((item, idx) => (
                    <div key={idx} className="relative flex flex-col gap-1">
                      {/* Timeline dot */}
                      <div
                        className={`absolute -left-6 top-[3px] w-4 h-4 rounded-full border-2 ${item.critical
                          ? "border-[#D93F3F] bg-[#D93F3F]"
                          : "border-[#98A6A8] bg-[#0B1518]"
                          }`}
                      />
                      <span className="text-[#98A6A8] text-xs">{item.time}</span>
                      <span
                        className={`text-sm font-medium leading-snug ${item.critical ? "text-[#D93F3F]" : "text-[#E6F0F2]"
                          }`}
                      >
                        {item.titre}
                      </span>
                      <span className="text-[#C9E7E6] text-[13px]">{item.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

