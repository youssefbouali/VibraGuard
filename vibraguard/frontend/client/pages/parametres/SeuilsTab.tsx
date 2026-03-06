import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { SliderRow } from "./SliderRow";

// ── Card wrapper ──────────────────────────────────────────────────────────────
interface CardProps {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  children: React.ReactNode;
}

function ConfigCard({ icon, iconBg, title, children }: CardProps) {
  return (
    <div className="flex flex-col p-6 rounded-lg border border-black/[0.08] bg-[#0B1518] shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
      {/* Card header */}
      <div className="flex items-center gap-3 pb-4 mb-5 border-b border-black/[0.08]">
        <div
          className="flex w-8 h-8 items-center justify-center rounded"
          style={{ background: iconBg }}
        >
          {icon}
        </div>
        <span className="text-[#E6F0F2] text-base font-semibold">{title}</span>
      </div>
      <div className="flex flex-col gap-6 flex-1">{children}</div>
    </div>
  );
}

// ── Toggle row ────────────────────────────────────────────────────────────────
interface ToggleRowProps {
  label: string;
  description?: string;
  descriptionColor?: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  noBorder?: boolean;
}

function ToggleRow({
  label,
  description,
  descriptionColor = "#C9E7E6",
  checked,
  onCheckedChange,
  noBorder = false,
}: ToggleRowProps) {
  return (
    <div
      className={`flex items-center justify-between gap-4 ${
        !noBorder ? "pb-4 border-b border-black/[0.08]" : ""
      }`}
    >
      <div className="flex flex-col gap-1 flex-1 min-w-0">
        <span className="text-[#E6F0F2] text-sm font-medium">{label}</span>
        {description && (
          <span className="text-xs" style={{ color: descriptionColor }}>
            {description}
          </span>
        )}
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        className="shrink-0 data-[state=checked]:bg-[#007A3D] data-[state=unchecked]:bg-[#0B2C3A]"
      />
    </div>
  );
}

// ── Main SeuilsTab ────────────────────────────────────────────────────────────
export function SeuilsTab() {
  // Card 1 – Vibration Globale
  const [warnVib, setWarnVib] = useState(4.5);
  const [critVib, setCritVib] = useState(7.1);
  const [normeISO, setNormeISO] = useState(true);

  // Card 2 – Enveloppe Accélération
  const [warnAcc, setWarnAcc] = useState(3.0);
  const [critAcc, setCritAcc] = useState(5.0);
  const [ajustML, setAjustML] = useState(true);

  // Card 3 – Auto-Escalade
  const [autoOT, setAutoOT] = useState(true);
  const [arretUrgence, setArretUrgence] = useState(false);
  const [delai, setDelai] = useState(15);

  // Card 4 – Sensibilité IA
  const [confianceAnomalie, setConfianceAnomalie] = useState(85);
  const [sensibiliteHarmo, setSensibiliteHarmo] = useState(90);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      {/* ── Card 1: Vibration Globale (RMS) ─────────────────────── */}
      <ConfigCard
        title="Vibration Globale (RMS)"
        iconBg="rgba(242,169,0,0.15)"
        icon={
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <g clipPath="url(#vib-clip)">
              <path
                d="M16.5 9H14.64C13.9664 8.99856 13.3744 9.44638 13.1925 10.095L11.43 16.365C11.4067 16.445 11.3333 16.5 11.25 16.5C11.1667 16.5 11.0933 16.445 11.07 16.365L6.93 1.635C6.90667 1.555 6.83333 1.5 6.75 1.5C6.66667 1.5 6.59333 1.555 6.57 1.635L4.8075 7.905C4.62637 8.55095 4.03836 8.99808 3.3675 9H1.5"
                stroke="#F2A900"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
            <defs>
              <clipPath id="vib-clip">
                <rect width="18" height="18" fill="white" />
              </clipPath>
            </defs>
          </svg>
        }
      >
        <SliderRow
          label="Seuil Attention (Warning)"
          value={warnVib}
          onChange={setWarnVib}
          min={0}
          max={10}
          step={0.1}
          trackColor="#F2A900"
          valueColor="#F2A900"
          displayValue={`${warnVib.toFixed(2)} mm/s`}
          minLabel="0"
          maxLabel="10 mm/s"
        />
        <SliderRow
          label="Seuil Critique (Danger)"
          value={critVib}
          onChange={setCritVib}
          min={0}
          max={10}
          step={0.1}
          trackColor="#D93F3F"
          valueColor="#D93F3F"
          displayValue={`${critVib.toFixed(2)} mm/s`}
          minLabel="0"
          maxLabel="10 mm/s"
        />
        <ToggleRow
          label="Norme ISO-10816"
          description="Verrouiller les seuils selon la classe de la machine"
          checked={normeISO}
          onCheckedChange={setNormeISO}
          noBorder
        />
      </ConfigCard>

      {/* ── Card 2: Enveloppe d'Accélération (Roulements) ──────── */}
      <ConfigCard
        title="Enveloppe d'Accélération (Roulements)"
        iconBg="rgba(12,108,242,0.12)"
        icon={
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <g clipPath="url(#acc-clip)">
              <path
                d="M7.57512 1.63662C8.51639 1.45446 9.48385 1.45446 10.4251 1.63662M10.4251 16.3636C9.48385 16.5458 8.51639 16.5458 7.57512 16.3636M13.2069 2.79087C14.003 3.33029 14.6879 4.01777 15.2244 4.81587M1.63662 10.4251C1.45446 9.48385 1.45446 8.51639 1.63662 7.57512M15.2094 13.2069C14.67 14.003 13.9825 14.6879 13.1844 15.2244M16.3636 7.57512C16.5458 8.51639 16.5458 9.48385 16.3636 10.4251M2.79087 4.79337C3.33029 3.99727 4.01777 3.31233 4.81587 2.77587M4.79337 15.2094C3.99727 14.67 3.31233 13.9825 2.77587 13.1844"
                stroke="#0C6CF2"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
            <defs>
              <clipPath id="acc-clip">
                <rect width="18" height="18" fill="white" />
              </clipPath>
            </defs>
          </svg>
        }
      >
        <SliderRow
          label="Seuil Attention (Usure Débutante)"
          value={warnAcc}
          onChange={setWarnAcc}
          min={0}
          max={10}
          step={0.1}
          trackColor="#F2A900"
          valueColor="#F2A900"
          displayValue={`${warnAcc.toFixed(2)} gE`}
          minLabel="0"
          maxLabel="10 gE"
        />
        <SliderRow
          label="Seuil Critique (Défaut Avéré)"
          value={critAcc}
          onChange={setCritAcc}
          min={0}
          max={10}
          step={0.1}
          trackColor="#D93F3F"
          valueColor="#D93F3F"
          displayValue={`${critAcc.toFixed(2)} gE`}
          minLabel="0"
          maxLabel="10 gE"
        />
        <ToggleRow
          label="Ajustement dynamique ML"
          description="Adapter automatiquement les seuils selon l'historique"
          checked={ajustML}
          onCheckedChange={setAjustML}
          noBorder
        />
      </ConfigCard>

      {/* ── Card 3: Auto-Escalade & Actions ─────────────────────── */}
      <ConfigCard
        title="Auto-Escalade & Actions"
        iconBg="rgba(0,122,61,0.15)"
        icon={
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path
              d="M15 9.75034C15 13.5003 12.375 15.3753 9.255 16.4628C9.09162 16.5182 8.91415 16.5156 8.7525 16.4553C5.625 15.3753 3 13.5003 3 9.75034V4.50034C3 4.0864 3.33606 3.75034 3.75 3.75034C5.25 3.75034 7.125 2.85034 8.43 1.71034C8.75826 1.42989 9.24174 1.42989 9.57 1.71034C10.8825 2.85784 12.75 3.75034 14.25 3.75034C14.6639 3.75034 15 4.0864 15 4.50034V9.75034M9 6.00034V9.00034M9 12.0003H9.0075"
              stroke="#007A3D"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        }
      >
        <ToggleRow
          label="Génération Auto d'OT"
          description="Créer un Ordre de Travail si seuil critique dépassé"
          checked={autoOT}
          onCheckedChange={setAutoOT}
        />
        <ToggleRow
          label="Arrêt d'Urgence Machine"
          description="Couper l'alimentation via relais IoT"
          descriptionColor="#D93F3F"
          checked={arretUrgence}
          onCheckedChange={setArretUrgence}
          noBorder
        />
        <SliderRow
          label="Délai avant relance (Escalade)"
          value={delai}
          onChange={setDelai}
          min={0}
          max={60}
          step={1}
          trackColor="#F2A900"
          valueColor="#F2A900"
          displayValue={`${delai} min`}
          minLabel="0 min"
          maxLabel="60 min"
        />
      </ConfigCard>

      {/* ── Card 4: Sensibilité Intelligence Artificielle ─────── */}
      <ConfigCard
        title="Sensibilité Intelligence Artificielle"
        iconBg="rgba(12,108,242,0.12)"
        icon={
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path
              d="M8.99989 3.74979C9.0023 2.93319 8.56207 2.17938 7.84965 1.78024C7.13723 1.38111 6.26448 1.3993 5.56932 1.82778C4.87415 2.25625 4.46571 3.02775 4.50214 3.84354C3.60888 4.07322 2.87091 4.70103 2.50103 5.54593C2.13114 6.39083 2.17046 7.35892 2.60764 8.17104C1.83741 8.79678 1.42646 9.76293 1.50992 10.7518C1.59337 11.7406 2.16043 12.6242 3.02464 13.112C2.8814 14.2203 3.36601 15.3163 4.28216 15.9561C5.19832 16.596 6.39418 16.6736 7.38534 16.1575C8.37651 15.6415 8.9987 14.6173 8.99989 13.4998V3.74979"
              stroke="#0C6CF2"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M6.74992 9.75C8.03758 9.29702 8.9256 8.11299 8.99992 6.75M4.50217 3.84375C4.517 4.20655 4.61941 4.56037 4.80067 4.875M2.60767 8.172C2.74487 8.06025 2.89169 7.96087 3.04642 7.875M4.49992 13.5C3.98304 13.5002 3.47487 13.3669 3.02467 13.113M8.99992 9.75H11.9999M8.99992 13.5H13.4999C14.3278 13.5 14.9999 14.1721 14.9999 15V15.75M8.99992 6H14.9999M11.9999 6V3.75C11.9999 2.92213 12.672 2.25 13.4999 2.25"
              stroke="#0C6CF2"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M11.625 9.75C11.625 9.957 11.793 10.125 12 10.125C12.207 10.125 12.375 9.957 12.375 9.75C12.375 9.543 12.207 9.375 12 9.375C11.793 9.375 11.625 9.543 11.625 9.75Z"
              stroke="#0C6CF2"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M13.125 2.25C13.125 2.457 13.293 2.625 13.5 2.625C13.707 2.625 13.875 2.457 13.875 2.25C13.875 2.043 13.707 1.875 13.5 1.875C13.293 1.875 13.125 2.043 13.125 2.25Z"
              stroke="#0C6CF2"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M14.625 15.75C14.625 15.957 14.793 16.125 15 16.125C15.207 16.125 15.375 15.957 15.375 15.75C15.375 15.543 15.207 15.375 15 15.375C14.793 15.375 14.625 15.543 14.625 15.75Z"
              stroke="#0C6CF2"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M14.625 6C14.625 6.207 14.793 6.375 15 6.375C15.207 6.375 15.375 6.207 15.375 6C15.375 5.793 15.207 5.625 15 5.625C14.793 5.625 14.625 5.793 14.625 6Z"
              stroke="#0C6CF2"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        }
      >
        <SliderRow
          label="Seuil de Confiance Anomalie"
          value={confianceAnomalie}
          onChange={setConfianceAnomalie}
          min={50}
          max={100}
          step={1}
          trackColor="#0C6CF2"
          valueColor="#0C6CF2"
          displayValue={`${confianceAnomalie} %`}
          minLabel="50%"
          maxLabel="100%"
        />
        <SliderRow
          label="Sensibilité Détection Pics Harmoniques"
          value={sensibiliteHarmo}
          onChange={setSensibiliteHarmo}
          min={0}
          max={100}
          step={1}
          trackColor="#0C6CF2"
          valueColor="#0C6CF2"
          displayValue={`${sensibiliteHarmo} %`}
          minLabel="Faible"
          maxLabel="Haute"
        />
      </ConfigCard>
    </div>
  );
}
