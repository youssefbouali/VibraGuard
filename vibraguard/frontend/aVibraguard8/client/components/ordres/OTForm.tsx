import { useState } from "react";
import { cn } from "@/lib/utils";

interface Part {
  name: string;
  stock: number;
  stockColor: "green" | "amber";
}

const DEFAULT_PARTS: Part[] = [
  { name: "Palier SKF-6205", stock: 4, stockColor: "green" },
  { name: "Capteur VibraSense", stock: 1, stockColor: "amber" },
];

const SEVERITY_OPTIONS = ["Critique", "Élevée", "Moyenne", "Faible"];
const SEVERITY_COLORS: Record<string, { dot: string; text: string; border: string; bg: string }> = {
  Critique: { dot: "#D93F3F", text: "#D93F3F", border: "rgba(217,63,63,0.20)", bg: "#1D1719" },
  Élevée:  { dot: "#F2A900", text: "#F2A900", border: "rgba(242,169,0,0.20)", bg: "#1D1B14" },
  Moyenne:  { dot: "#0C6CF2", text: "#0C6CF2", border: "rgba(12,108,242,0.20)", bg: "#111820" },
  Faible:   { dot: "#10B981", text: "#10B981", border: "rgba(16,185,129,0.20)", bg: "#0E1A16" },
};

interface OTFormProps {
  onCancel: () => void;
}

export function OTForm({ onCancel }: OTFormProps) {
  const [moteur, setMoteur] = useState("MTR-Broyeur-04 (Zone 2)");
  const [anomalie, setAnoalie] = useState("Déséquilibre Rotorique");
  const [severity, setSeverity] = useState("Critique");
  const [date, setDate] = useState("2026-10-24T08:00");
  const [duree, setDuree] = useState("4h 30m");
  const [technicien, setTechnicien] = useState("Karim B. (Spéc. Vibrations)");
  const [parts, setParts] = useState<Part[]>(DEFAULT_PARTS);
  const [partSearch, setPartSearch] = useState("");
  const [cout, setCout] = useState("4 500");
  const [description, setDescription] = useState(
    `Intervention urgente suite à l'alerte critique (#ALT-8402).\n\n- Sécuriser la zone de broyage et consigner l'équipement.\n- Effectuer un contrôle visuel détaillé du rotor.\n- Remplacer le palier côté accouplement si l'usure est confirmée lors du démontage.\n- Refaire l'équilibrage dynamique sur site avant la remise en service opérationnelle.`
  );
  const [severityOpen, setSeverityOpen] = useState(false);

  const severityStyle = SEVERITY_COLORS[severity] ?? SEVERITY_COLORS["Critique"];

  const removePart = (index: number) => {
    setParts((p) => p.filter((_, i) => i !== index));
  };

  return (
    <div className="w-full max-w-[880px] rounded-lg bg-[#0B1518] shadow-[0_32px_80px_0_rgba(0,0,0,0.60)] flex flex-col">
      {/* Body */}
      <div className="p-6 sm:p-8 flex flex-col gap-6">
        {/* Row 1: Moteur + Anomalie & Sévérité */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Moteur concerné */}
          <div className="flex flex-col gap-2">
            <label className="text-[#C9E7E6] text-[13px] font-medium">Moteur concerné</label>
            <div className="flex h-12 px-4 items-center gap-3 rounded-[6px] border border-black/[0.08] bg-[#0D1316] shadow-[inset_0_2px_4px_1px_rgba(0,0,0,0.10)]">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="shrink-0">
                <path d="M15.75 15.75L12.495 12.495" stroke="#98A6A8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2.25 8.25C2.25 11.5615 4.93851 14.25 8.25 14.25C11.5615 14.25 14.25 11.5615 14.25 8.25C14.25 4.93851 11.5615 2.25 8.25 2.25C4.93851 2.25 2.25 4.93851 2.25 8.25V8.25" stroke="#98A6A8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <input
                value={moteur}
                onChange={(e) => setMoteur(e.target.value)}
                className="flex-1 bg-transparent text-[#E6F0F2] text-[14px] font-medium outline-none placeholder:text-[#757575]"
                placeholder="Rechercher un moteur..."
              />
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="shrink-0">
                <path d="M4.5 6.75L9 11.25L13.5 6.75" stroke="#98A6A8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>

          {/* Type d'anomalie & Sévérité */}
          <div className="flex flex-col gap-2">
            <label className="text-[#C9E7E6] text-[13px] font-medium">Type d'anomalie & Sévérité</label>
            <div className="flex gap-4">
              {/* Anomalie type */}
              <div className="flex flex-1 h-12 px-4 items-center gap-3 rounded-[6px] border border-black/[0.08] bg-[#0D1316] shadow-[inset_0_2px_4px_1px_rgba(0,0,0,0.10)] min-w-0">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="shrink-0">
                  <g clipPath="url(#anomalie-clip)">
                    <path d="M16.5 9H14.64C13.9664 8.99856 13.3744 9.44638 13.1925 10.095L11.43 16.365C11.4067 16.445 11.3333 16.5 11.25 16.5C11.1667 16.5 11.0933 16.445 11.07 16.365L6.93 1.635C6.90667 1.555 6.83333 1.5 6.75 1.5C6.66667 1.5 6.59333 1.555 6.57 1.635L4.8075 7.905C4.62637 8.55095 4.03836 8.99808 3.3675 9H1.5" stroke="#98A6A8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </g>
                  <defs><clipPath id="anomalie-clip"><rect width="18" height="18" fill="white"/></clipPath></defs>
                </svg>
                <input
                  value={anomalie}
                  onChange={(e) => setAnoalie(e.target.value)}
                  className="flex-1 bg-transparent text-[#E6F0F2] text-[14px] font-medium outline-none min-w-0"
                />
              </div>

              {/* Severity dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setSeverityOpen(!severityOpen)}
                  className="flex h-12 px-4 items-center gap-3 rounded-[6px] border shadow-[inset_0_2px_4px_1px_rgba(0,0,0,0.10)] whitespace-nowrap"
                  style={{
                    borderColor: severityStyle.border,
                    backgroundColor: severityStyle.bg,
                  }}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{
                      backgroundColor: severityStyle.dot,
                      boxShadow: `0 0 8px 0 ${severityStyle.dot}`,
                    }}
                  />
                  <span className="text-[14px] font-medium" style={{ color: severityStyle.text }}>
                    {severity}
                  </span>
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M4.5 6.75L9 11.25L13.5 6.75" stroke={severityStyle.text} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                {severityOpen && (
                  <div className="absolute right-0 top-[calc(100%+6px)] z-20 rounded-[6px] border border-white/[0.08] bg-[#0D1316] shadow-lg overflow-hidden">
                    {SEVERITY_OPTIONS.map((opt) => {
                      const s = SEVERITY_COLORS[opt];
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => { setSeverity(opt); setSeverityOpen(false); }}
                          className="flex items-center gap-3 px-4 py-2.5 w-full hover:bg-white/5 transition-colors"
                        >
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: s.dot }}
                          />
                          <span className="text-[13px] font-medium" style={{ color: s.text }}>{opt}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Row 2: Date & Durée + Technicien */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Date planifiée & Durée estimée */}
          <div className="flex flex-col gap-2">
            <label className="text-[#C9E7E6] text-[13px] font-medium">Date planifiée & Durée estimée</label>
            <div className="flex gap-4">
              {/* Date */}
              <div className="flex flex-1 h-12 px-4 items-center gap-3 rounded-[6px] border border-black/[0.08] bg-[#0D1316] shadow-[inset_0_2px_4px_1px_rgba(0,0,0,0.10)] min-w-0">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="shrink-0">
                  <path d="M6 1.5V4.5M12 1.5V4.5" stroke="#98A6A8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M3.75 3H14.25C15.0779 3 15.75 3.67213 15.75 4.5V15C15.75 15.8279 15.0779 16.5 14.25 16.5H3.75C2.92213 16.5 2.25 15.8279 2.25 15V4.5C2.25 3.67213 2.92213 3 3.75 3V3" stroke="#98A6A8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2.25 7.5H15.75" stroke="#98A6A8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <input
                  type="datetime-local"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="flex-1 bg-transparent text-[#E6F0F2] text-[14px] font-medium outline-none min-w-0 [color-scheme:dark]"
                />
              </div>

              {/* Durée */}
              <div className="flex h-12 px-4 items-center gap-3 rounded-[6px] border border-black/[0.08] bg-[#0D1316] shadow-[inset_0_2px_4px_1px_rgba(0,0,0,0.10)] w-[140px] shrink-0">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="shrink-0">
                  <path d="M1.5 9C1.5 13.1394 4.86064 16.5 9 16.5C13.1394 16.5 16.5 13.1394 16.5 9C16.5 4.86064 13.1394 1.5 9 1.5C4.86064 1.5 1.5 4.86064 1.5 9V9" stroke="#98A6A8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 4.5V9L12 10.5" stroke="#98A6A8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <input
                  value={duree}
                  onChange={(e) => setDuree(e.target.value)}
                  placeholder="4h 30m"
                  className="flex-1 bg-transparent text-[#E6F0F2] text-[14px] font-medium outline-none placeholder:text-[#757575] min-w-0"
                />
              </div>
            </div>
          </div>

          {/* Technicien assigné */}
          <div className="flex flex-col gap-2">
            <label className="text-[#C9E7E6] text-[13px] font-medium">Technicien assigné</label>
            <div className="flex h-12 px-4 items-center gap-3 rounded-[6px] border border-black/[0.08] bg-[#0D1316] shadow-[inset_0_2px_4px_1px_rgba(0,0,0,0.10)]">
              <img
                src="https://api.builder.io/api/v1/image/assets/TEMP/7b02cb388b87f56a63a235a8d02a1683e015ed41?width=56"
                alt="Technicien"
                className="w-7 h-7 rounded-full border border-black/[0.08] object-cover shrink-0"
              />
              <input
                value={technicien}
                onChange={(e) => setTechnicien(e.target.value)}
                className="flex-1 bg-transparent text-[#E6F0F2] text-[14px] font-medium outline-none min-w-0"
              />
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="shrink-0">
                <path d="M4.5 6.75L9 11.25L13.5 6.75" stroke="#98A6A8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Row 3: Pièces + Coût */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pièces nécessaires */}
          <div className="flex flex-col gap-2">
            <label className="text-[#C9E7E6] text-[13px] font-medium">Pièces nécessaires (Magasin)</label>
            <div className="min-h-[48px] px-4 py-1.5 flex flex-wrap gap-2 items-center rounded-[6px] border border-black/[0.08] bg-[#0D1316] shadow-[inset_0_2px_4px_1px_rgba(0,0,0,0.10)]">
              {parts.map((part, idx) => (
                <PartTag
                  key={idx}
                  part={part}
                  onRemove={() => removePart(idx)}
                />
              ))}
              <input
                value={partSearch}
                onChange={(e) => setPartSearch(e.target.value)}
                placeholder="Rechercher une pièce..."
                className="bg-transparent text-[#E6F0F2] text-[13px] outline-none placeholder:text-[#757575] min-w-[140px] h-8"
              />
            </div>
          </div>

          {/* Coût estimé */}
          <div className="flex flex-col gap-2">
            <label className="text-[#C9E7E6] text-[13px] font-medium">Coût estimé</label>
            <div className="flex h-12 px-4 items-center gap-3 rounded-[6px] border border-black/[0.08] bg-[#0D1316] shadow-[inset_0_2px_4px_1px_rgba(0,0,0,0.10)]">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="shrink-0">
                <path d="M14.25 5.25V3C14.25 2.58606 13.9139 2.25 13.5 2.25H3.75C2.92213 2.25 2.25 2.92213 2.25 3.75C2.25 4.57787 2.92213 5.25 3.75 5.25H15C15.4139 5.25 15.75 5.58606 15.75 6V9H13.5C12.6721 9 12 9.67213 12 10.5C12 11.3279 12.6721 12 13.5 12H15.75C16.1639 12 16.5 11.6639 16.5 11.25V9.75C16.5 9.33606 16.1639 9 15.75 9" stroke="#98A6A8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2.25 3.75V14.25C2.25 15.0779 2.92213 15.75 3.75 15.75H15C15.4139 15.75 15.75 15.4139 15.75 15V12" stroke="#98A6A8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <input
                value={cout}
                onChange={(e) => setCout(e.target.value)}
                className="flex-1 bg-transparent text-[#0C6CF2] text-[15px] font-semibold outline-none min-w-0"
              />
              <span className="text-[#98A6A8] text-[13px] font-medium shrink-0">MAD</span>
            </div>
          </div>
        </div>

        {/* Description & Instructions */}
        <div className="flex flex-col gap-2">
          <label className="text-[#C9E7E6] text-[13px] font-medium">
            Description & Instructions de travail
          </label>
          <div className="rounded-[6px] border border-black/[0.08] bg-[#0D1316] shadow-[inset_0_2px_4px_1px_rgba(0,0,0,0.10)] p-4">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              className="w-full bg-transparent text-[#E6F0F2] text-[14px] font-normal leading-[1.6] outline-none resize-none placeholder:text-[#757575]"
              placeholder="Décrivez l'intervention et les instructions de travail..."
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-end items-center gap-4 px-6 sm:px-8 py-6 border-t border-black/[0.08] bg-[rgba(7,16,24,0.40)] rounded-b-lg">
        <button
          type="button"
          onClick={onCancel}
          className="flex h-11 px-6 items-center justify-center rounded-[6px] border border-black/[0.08] text-[#E6F0F2] text-[14px] font-semibold hover:bg-white/5 transition-colors"
        >
          Annuler
        </button>
        <button
          type="button"
          className="flex h-11 px-6 items-center justify-center gap-2.5 rounded-[6px] bg-[#007A3D] hover:bg-[#006a34] transition-colors text-white text-[14px] font-semibold"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M11.4 2.25C11.7957 2.25564 12.1731 2.41738 12.45 2.7L15.3 5.55C15.5826 5.82695 15.7444 6.20435 15.75 6.6V14.25C15.75 15.0779 15.0779 15.75 14.25 15.75H3.75C2.92213 15.75 2.25 15.0779 2.25 14.25V3.75C2.25 2.92213 2.92213 2.25 3.75 2.25H11.4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12.75 15.75V10.5C12.75 10.0861 12.4139 9.75 12 9.75H6C5.58606 9.75 5.25 10.0861 5.25 10.5V15.75M5.25 2.25V5.25C5.25 5.66394 5.58606 6 6 6H11.25" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Enregistrer l'Ordre
        </button>
      </div>
    </div>
  );
}

function PartTag({ part, onRemove }: { part: Part; onRemove: () => void }) {
  const isGreen = part.stockColor === "green";
  return (
    <div
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-[4px] border",
        isGreen
          ? "border-[rgba(0,122,61,0.20)] bg-[rgba(0,122,61,0.10)]"
          : "border-[rgba(242,169,0,0.20)] bg-[rgba(242,169,0,0.10)]"
      )}
    >
      <span className="text-[#E6F0F2] text-[13px] font-medium">{part.name}</span>
      <span
        className={cn(
          "text-[12px] font-bold",
          isGreen ? "text-[#007A3D]" : "text-[#F2A900]"
        )}
      >
        (Stock: {part.stock})
      </span>
      <button
        type="button"
        onClick={onRemove}
        className="flex w-4 h-4 items-center justify-center"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path
            d="M10.5 3.5L3.5 10.5M3.5 3.5L10.5 10.5"
            stroke={isGreen ? "#98A6A8" : "#F2A900"}
            strokeWidth="1.16667"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
}
