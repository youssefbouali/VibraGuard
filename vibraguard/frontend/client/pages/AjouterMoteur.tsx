import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Loader2, ChevronLeft, Save, X } from "lucide-react";

export default function AjouterMoteur() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [id, setId] = useState("");
  const [type, setType] = useState("Asynchrone");
  const [etatLabel, setEtatLabel] = useState("Optimal");
  const [etatColor, setEtatColor] = useState("bg-[#007A3D]");
  const [etatPct, setEtatPct] = useState(100);
  const [vibration, setVibration] = useState("1.2");
  const [vibrationColor, setVibrationColor] = useState("text-[#007A3D]");
  const [trendIcon, setTrendIcon] = useState("stable");
  const [power, setPower] = useState("");
  const [speed, setSpeed] = useState("");
  const [localisation, setLocalisation] = useState("");
  const [site, setSite] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await api.createMotor({
        id,
        type,
        etatLabel,
        etatColor,
        etatPct,
        vibration: vibration + " mm/s",
        vibrationColor,
        trendIcon,
        power: power ? power + " kW" : "",
        speed: speed ? speed + " RPM" : "",
        localisation,
        site,
      });

      toast.success("Moteur ajouté avec succès!");
      navigate("/moteurs");
    } catch (error) {
      toast.error("Erreur lors de l'ajout du moteur");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout breadcrumb="Moteurs > Ajouter">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/moteurs")}
              className="group flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-[#0F2730] hover:bg-[#163340] transition-all"
            >
              <ChevronLeft className="h-5 w-5 text-[#C9E7E6] group-hover:text-white transition-colors" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-[#E6F0F2]">Ajouter un nouveau moteur</h1>
              <p className="text-[#98A6A8] text-sm mt-1">Configurez les paramètres du nouvel équipement</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-xl border border-white/5 bg-[#0B1518]/60 backdrop-blur-sm">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#C9E7E6] mb-1.5">ID du Moteur</label>
                <input
                  type="text"
                  required
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                  placeholder="ex: MTR-Broyeur-10"
                  className="w-full h-11 px-4 rounded-lg border border-white/10 bg-[#0D1316] text-white placeholder-[#64748B] outline-none focus:border-[#0C6CF2]/50 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#C9E7E6] mb-1.5">Type de Moteur</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full h-11 px-4 rounded-lg border border-white/10 bg-[#0D1316] text-white outline-none focus:border-[#0C6CF2]/50 transition-all"
                >
                  <option value="Asynchrone">Asynchrone</option>
                  <option value="Synchrone">Synchrone</option>
                  <option value="CC">Courant Continu</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#C9E7E6] mb-1.5">État Initial</label>
                <select
                  value={etatLabel}
                  onChange={(e) => {
                    setEtatLabel(e.target.value);
                    if (e.target.value === "Optimal") {
                      setEtatColor("bg-[#007A3D]");
                      setVibrationColor("text-[#007A3D]");
                    } else if (e.target.value === "Attention") {
                      setEtatColor("bg-[#F2A900]");
                      setVibrationColor("text-[#F2A900]");
                    } else {
                      setEtatColor("bg-[#D93F3F]");
                      setVibrationColor("text-[#D93F3F]");
                    }
                  }}
                  className="w-full h-11 px-4 rounded-lg border border-white/10 bg-[#0D1316] text-white outline-none focus:border-[#0C6CF2]/50 transition-all"
                >
                  <option value="Optimal">Optimal</option>
                  <option value="Attention">Attention</option>
                  <option value="Critique">Critique</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#C9E7E6] mb-1.5">Vibration Initiale (mm/s)</label>
                <input
                  type="number"
                  step="0.1"
                  value={vibration}
                  onChange={(e) => setVibration(e.target.value)}
                  className="w-full h-11 px-4 rounded-lg border border-white/10 bg-[#0D1316] text-white placeholder-[#64748B] outline-none focus:border-[#0C6CF2]/50 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#C9E7E6] mb-1.5">Santé (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={etatPct}
                  onChange={(e) => setEtatPct(parseInt(e.target.value))}
                  className="w-full h-11 px-4 rounded-lg border border-white/10 bg-[#0D1316] text-white outline-none focus:border-[#0C6CF2]/50 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#C9E7E6] mb-1.5">Tendance</label>
                <select
                  value={trendIcon}
                  onChange={(e) => setTrendIcon(e.target.value)}
                  className="w-full h-11 px-4 rounded-lg border border-white/10 bg-[#0D1316] text-white outline-none focus:border-[#0C6CF2]/50 transition-all"
                >
                  <option value="up">En hausse</option>
                  <option value="down">En baisse</option>
                  <option value="stable">Stable</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#C9E7E6] mb-1.5">Puissance (kW)</label>
                <input
                  type="number"
                  value={power}
                  onChange={(e) => setPower(e.target.value)}
                  placeholder="ex: 450"
                  className="w-full h-11 px-4 rounded-lg border border-white/10 bg-[#0D1316] text-white placeholder-[#64748B] outline-none focus:border-[#0C6CF2]/50 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#C9E7E6] mb-1.5">Vitesse Nominale (RPM)</label>
                <input
                  type="number"
                  value={speed}
                  onChange={(e) => setSpeed(e.target.value)}
                  placeholder="ex: 1480"
                  className="w-full h-11 px-4 rounded-lg border border-white/10 bg-[#0D1316] text-white placeholder-[#64748B] outline-none focus:border-[#0C6CF2]/50 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#C9E7E6] mb-1.5">Site / Complexe</label>
                <input
                   type="text"
                   value={site}
                   onChange={(e) => setSite(e.target.value)}
                   placeholder="ex: Complexe Jorf Lasfar"
                   className="w-full h-11 px-4 rounded-lg border border-white/10 bg-[#0D1316] text-white placeholder-[#64748B] outline-none focus:border-[#0C6CF2]/50 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#C9E7E6] mb-1.5">Localisation</label>
                <input
                  type="text"
                  value={localisation}
                  onChange={(e) => setLocalisation(e.target.value)}
                  placeholder="ex: Zone Broyage - Niveau 2"
                  className="w-full h-11 px-4 rounded-lg border border-white/10 bg-[#0D1316] text-white placeholder-[#64748B] outline-none focus:border-[#0C6CF2]/50 transition-all"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate("/moteurs")}
              className="flex items-center gap-2 px-6 h-11 rounded-lg border border-white/10 text-white font-medium hover:bg-white/5 transition-all"
            >
              <X className="w-4 h-4" />
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-8 h-11 rounded-lg bg-[#007A3D] text-white font-semibold hover:bg-[#006a34] transition-all shadow-lg shadow-[#007A3D]/20 disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Save className="w-5 h-5" />
              )}
              Enregistrer le Moteur
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
