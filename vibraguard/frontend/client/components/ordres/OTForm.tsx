import { useState, useEffect } from "react";
import { Loader2, User, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Part {
  id?: string;
  name: string;
  stock: number;
  stockColor: string;
}

interface Technician {
  id: string;
  name: string;
  specialization: string;
  avatarUrl?: string;
}

interface Motor {
  id: string;
  type: string;
  label: string;
}

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
  const [moteur, setMoteur] = useState("");
  const [anomalie, setAnoalie] = useState("");
  const [severity, setSeverity] = useState("Critique");
  const [date, setDate] = useState("");
  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("");
  const [technicien, setTechnicien] = useState("");
  const [parts, setParts] = useState<Part[]>([]);
  const [partSearch, setPartSearch] = useState("");
  const [cout, setCout] = useState("");
  const [description, setDescription] = useState("");
  const [typeMaintenance, setTypeMaintenance] = useState("Préventif");
  
  const [availableMotors, setAvailableMotors] = useState<Motor[]>([]);
  const [availableTechnicians, setAvailableTechnicians] = useState<Technician[]>([]);
  const [availableParts, setAvailableParts] = useState<Part[]>([]);
  
  const [severityOpen, setSeverityOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New Part Modal State
  const [isPartDialogOpen, setIsPartDialogOpen] = useState(false);
  const [newPartName, setNewPartName] = useState("");
  const [newPartStock, setNewPartStock] = useState("");
  const [isCreatingPart, setIsCreatingPart] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [motors, technicians, invParts] = await Promise.all([
          api.getMotors(),
          api.getTechnicians(),
          api.getInventoryParts()
        ]);
        setAvailableMotors(motors);
        setAvailableTechnicians(technicians);
        setAvailableParts(invParts);
        
        if (motors.length > 0) setMoteur(motors[0].id);
        if (technicians.length > 0) setTechnicien(technicians[0].name);
      } catch (error) {
        console.error("Failed to fetch form data:", error);
        toast.error("Erreur lors du chargement des données.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const workOrder = {
        title: anomalie,
        asset: moteur,
        status: "Nouveau",
        assignedTo: technicien,
        dueDate: date,
        priority: severity,
        duration: `${hours}h ${minutes}m`,
        cost: parseFloat(cout) || 0,
        type: typeMaintenance,
        parts: parts.map(p => p.name).join(", ")
      };
      
      const createdWo = await api.createWorkOrder(workOrder);
      
      // Send to local blockchain parallel to DB
      import("@/lib/blockchain").then(async ({ submitWorkOrderToBlockchain }) => {
        const txHash = await submitWorkOrderToBlockchain({ ...workOrder, id: createdWo.id });
        if (txHash) {
          toast.success("OT sécurisé avec succès sur la Blockchain !", {
            description: `Hash: ${txHash.substring(0, 10)}...${txHash.substring(txHash.length - 8)}`
          });
        }
      });
      toast.success("Ordre de travail créé avec succès !");
      onCancel(); // Navigate back
    } catch (error) {
      console.error("Failed to create work order:", error);
      toast.error("Erreur lors de la création de l'ordre de travail.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddPart = (part: Part) => {
    if (!parts.find(p => p.name === part.name)) {
      setParts([...parts, part]);
    }
    setPartSearch("");
  };

  const handleCreatePart = async () => {
    if (!newPartName || !newPartStock) {
      toast.error("Veuillez remplir tous les champs.");
      return;
    }
    setIsCreatingPart(true);
    try {
      const created = await api.createInventoryPart({
        name: newPartName,
        stock: parseInt(newPartStock),
      }) as any;
      
      setAvailableParts([...availableParts, created]);
      setParts([...parts, created]);
      setIsPartDialogOpen(false);
      setNewPartName("");
      setNewPartStock("");
      toast.success("Nouvelle pièce ajoutée et sélectionnée.");
    } catch (err) {
      toast.error("Erreur lors de la création de la pièce.");
    } finally {
      setIsCreatingPart(false);
    }
  };

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
              <select
                value={moteur}
                onChange={(e) => setMoteur(e.target.value)}
                className="flex-1 bg-transparent text-[#E6F0F2] text-[14px] font-medium outline-none appearance-none cursor-pointer"
              >
                {isLoading ? (
                  <option>Chargement...</option>
                ) : (
                  availableMotors.map((m) => (
                    <option key={m.id} value={m.id} className="bg-[#0D1316]">
                      {m.id} - {m.label}
                    </option>
                  ))
                )}
              </select>
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
              <div className="flex h-12 items-center gap-2 shrink-0">
                <div className="flex h-12 px-3 items-center gap-2 rounded-[6px] border border-black/[0.08] bg-[#0D1316] shadow-[inset_0_2px_4px_1px_rgba(0,0,0,0.10)] w-[80px]">
                  <input
                    type="number"
                    min="0"
                    value={hours}
                    onChange={(e) => setHours(e.target.value)}
                    placeholder="HH"
                    className="w-full bg-transparent text-[#E6F0F2] text-[14px] font-medium outline-none placeholder:text-[#757575] text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <span className="text-[#98A6A8] text-[12px] font-medium">h</span>
                </div>
                <div className="flex h-12 px-3 items-center gap-2 rounded-[6px] border border-black/[0.08] bg-[#0D1316] shadow-[inset_0_2px_4px_1px_rgba(0,0,0,0.10)] w-[80px]">
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={minutes}
                    onChange={(e) => setMinutes(e.target.value)}
                    placeholder="MM"
                    className="w-full bg-transparent text-[#E6F0F2] text-[14px] font-medium outline-none placeholder:text-[#757575] text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <span className="text-[#98A6A8] text-[12px] font-medium">m</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Row Type Maintenance & Tech */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           {/* Type de Maintenance */}
           <div className="flex flex-col gap-2">
            <label className="text-[#C9E7E6] text-[13px] font-medium">Type de Maintenance</label>
            <div className="flex h-12 p-1 rounded-[6px] border border-black/[0.08] bg-[#0D1316] shadow-[inset_0_2px_4px_1px_rgba(0,0,0,0.10)]">
              <button
                type="button"
                onClick={() => setTypeMaintenance("Préventif")}
                className={cn(
                  "flex-1 flex items-center justify-center rounded-[4px] text-[13px] font-semibold transition-all",
                  typeMaintenance === "Préventif" 
                    ? "bg-[#007A3D] text-white shadow-lg" 
                    : "text-[#98A6A8] hover:text-[#C9E7E6]"
                )}
              >
                Préventif
              </button>
              <button
                type="button"
                onClick={() => setTypeMaintenance("Correctif")}
                className={cn(
                  "flex-1 flex items-center justify-center rounded-[4px] text-[13px] font-semibold transition-all",
                  typeMaintenance === "Correctif" 
                    ? "bg-[#0C6CF2] text-white shadow-lg" 
                    : "text-[#98A6A8] hover:text-[#C9E7E6]"
                )}
              >
                Correctif
              </button>
            </div>
          </div>

          {/* Technicien assigné */}
          <div className="flex flex-col gap-2">
            <label className="text-[#C9E7E6] text-[13px] font-medium">Technicien assigné</label>
            <div className="flex h-12 px-4 items-center gap-3 rounded-[6px] border border-black/[0.08] bg-[#0D1316] shadow-[inset_0_2px_4px_1px_rgba(0,0,0,0.10)]">
              <User className="w-5 h-5 text-[#C9E7E6]" />
              <select
                value={technicien}
                onChange={(e) => setTechnicien(e.target.value)}
                className="flex-1 bg-transparent text-[#E6F0F2] text-[14px] font-medium outline-none appearance-none cursor-pointer"
              >
                {isLoading ? (
                  <option>Chargement...</option>
                ) : (
                  availableTechnicians.map((t) => (
                    <option key={t.id} value={t.name} className="bg-[#0D1316]">
                      {t.name}
                    </option>
                  ))
                )}
              </select>
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
              <div className="relative flex-1 min-w-[140px]">
                <input
                  value={partSearch}
                  onChange={(e) => setPartSearch(e.target.value)}
                  placeholder="Rechercher une pièce..."
                  className="w-full bg-transparent text-[#E6F0F2] text-[13px] outline-none placeholder:text-[#757575] h-8"
                />
                
                {partSearch && (
                  <div className="absolute left-0 top-[calc(100%+6px)] z-30 w-full rounded-[6px] border border-white/[0.08] bg-[#0D1316] shadow-lg overflow-hidden">
                    <div className="max-h-[200px] overflow-y-auto">
                      {availableParts
                        .filter(p => p.name.toLowerCase().includes(partSearch.toLowerCase()))
                        .map(p => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => handleAddPart(p)}
                            className="flex items-center justify-between px-4 py-2 w-full hover:bg-white/5 transition-colors"
                          >
                            <span className="text-[#E6F0F2] text-[13px]">{p.name}</span>
                            <span className={cn("text-[11px] font-bold", p.stockColor === "green" ? "text-[#007A3D]" : "text-[#F2A900]")}>
                              (Stock: {p.stock})
                            </span>
                          </button>
                        ))}
                      
                      <button
                        type="button"
                        onClick={() => {
                          setNewPartName(partSearch);
                          setIsPartDialogOpen(true);
                        }}
                        className="flex items-center gap-2 px-4 py-2.5 w-full bg-[#10B981]/10 hover:bg-[#10B981]/20 transition-colors border-t border-white/5"
                      >
                        <Plus className="w-4 h-4 text-[#10B981]" />
                        <span className="text-[#10B981] text-[13px] font-semibold">Ajouter "{partSearch}" au magasin</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <button
               type="button"
               onClick={() => setIsPartDialogOpen(true)}
               className="text-[12px] text-[#4FB3AF] hover:text-[#7EDBD7] font-medium mt-1 underline underline-offset-4"
            >
              + Ajouter une pièce inexistante
            </button>
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
          disabled={isSubmitting}
          onClick={handleSubmit}
          className="flex h-11 px-6 items-center justify-center gap-2.5 rounded-[6px] bg-[#007A3D] hover:bg-[#006a34] transition-colors text-white text-[14px] font-semibold disabled:opacity-50"
        >
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M11.4 2.25C11.7957 2.25564 12.1731 2.41738 12.45 2.7L15.3 5.55C15.5826 5.82695 15.7444 6.20435 15.75 6.6V14.25C15.75 15.0779 15.0779 15.75 14.25 15.75H3.75C2.92213 15.75 2.25 15.0779 2.25 14.25V3.75C2.25 2.92213 2.92213 2.25 3.75 2.25H11.4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12.75 15.75V10.5C12.75 10.0861 12.4139 9.75 12 9.75H6C5.58606 9.75 5.25 10.0861 5.25 10.5V15.75M5.25 2.25V5.25C5.25 5.66394 5.58606 6 6 6H11.25" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
          {isSubmitting ? "Enregistrement..." : "Enregistrer l'Ordre"}
        </button>
      </div>

      {/* New Part Dialog */}
      <Dialog open={isPartDialogOpen} onOpenChange={setIsPartDialogOpen}>
        <DialogContent className="bg-[#0A1114] border-white/10 text-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-[#E6F0F2]">
              Nouvelle pièce au magasin
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-6 flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-[#98A6A8] text-xs font-semibold uppercase tracking-wider">Nom de la pièce</label>
              <input
                value={newPartName}
                onChange={(e) => setNewPartName(e.target.value)}
                placeholder="Ex: Roulement à billes"
                className="w-full h-11 px-4 rounded-md border border-white/10 bg-[#0D1316] text-white outline-none focus:border-[#4FB3AF]/50"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[#98A6A8] text-xs font-semibold uppercase tracking-wider">Quantité initiale en stock</label>
              <input
                type="number"
                value={newPartStock}
                onChange={(e) => setNewPartStock(e.target.value)}
                placeholder="0"
                className="w-full h-11 px-4 rounded-md border border-white/10 bg-[#0D1316] text-white outline-none focus:border-[#4FB3AF]/50"
              />
            </div>
          </div>

          <DialogFooter className="gap-3 sm:gap-0">
            <button
              onClick={() => setIsPartDialogOpen(false)}
              className="px-4 py-2 rounded-md border border-white/10 text-sm font-medium hover:bg-white/5 transition-colors"
              disabled={isCreatingPart}
            >
              Annuler
            </button>
            <button
              onClick={handleCreatePart}
              disabled={isCreatingPart}
              className="px-4 py-2 rounded-md bg-[#10B981] hover:bg-[#0da06f] text-white text-sm font-semibold transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isCreatingPart && <Loader2 className="w-4 h-4 animate-spin" />}
              Ajouter au magasin
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
