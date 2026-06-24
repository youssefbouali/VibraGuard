import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { cn } from "@/lib/utils";
import { MoteurDetailHeader } from "@/components/dashboard/MoteurDetailHeader";
import { SanteCard } from "@/components/dashboard/SanteCard";
import { TendanceVibratoire } from "@/components/dashboard/TendanceVibratoire";
import { DernieresAlertes } from "@/components/dashboard/DernieresAlertes";
import { Header } from "@/components/dashboard/Header";
import { api } from "@/lib/api";
import { useVibrations } from "@/hooks/use-vibrations";
import { toast } from "sonner";

const tabs = [
  "Vue d'ensemble",
  "Vibrations Temps Réel",
  "Historique Alertes",
  "Interventions",
];

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";

export default function MoteurDetail() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState("Vue d'ensemble");
  const [motor, setMotor] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Real-time vibrations via WebSocket, filtered for this motor
  const { data: vibrations = [] } = useVibrations(id);
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    if (id) {
      setLoading(true);
      Promise.all([
        api.getMotorById(id),
        api.getAlerts()
      ])
        .then(([motorData, alertData]) => {
          setMotor(motorData);
          setAlerts(alertData.filter((a: any) => a.message.includes(id) || a.message.includes(motorData.id)));
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) {
    return (
      <DashboardLayout breadcrumb={`Moteurs / ${id}`}>
        <div className="p-8 text-center text-[#98A6A8] italic">Chargement du moteur...</div>
      </DashboardLayout>
    );
  }

  if (!motor) {
    return (
      <DashboardLayout breadcrumb={`Moteurs / ${id}`}>
        <div className="p-8 text-center text-[#E6F0F2]">Moteur non trouvé.</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout breadcrumb="Moteurs / Détails">
      <div className="flex flex-col gap-4 sm:gap-6 lg:gap-8 max-w-full lg:max-w-[1400px]">
        {/* Motor Header Card */}
        <MoteurDetailHeader motor={motor} />

        {/* Tabs */}
        <div className="flex items-start gap-3 sm:gap-6 lg:gap-8 border-b border-black/[0.08] overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "relative flex flex-col pb-3 sm:pb-4 whitespace-nowrap text-xs sm:text-[15px] font-medium transition-colors shrink-0",
                activeTab === tab ? "text-[#007A3D]" : "text-[#C9EDEB] hover:text-white"
              )}
            >
              {tab}
              {activeTab === tab && (
                <span className="absolute bottom-0 left-0 right-0 h-[3px] rounded-t bg-[#007A3D]" />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "Vue d'ensemble" && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] gap-4 sm:gap-6">
              <div className="flex flex-col gap-4 sm:gap-6">
                <SanteCard motor={motor} />
              </div>
              <div className="flex flex-col gap-4 sm:gap-6">
                <TendanceVibratoire vibrations={vibrations} />
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)] gap-4 sm:gap-6">
              <DernieresAlertes alerts={alerts} />
            </div>
          </>
        )}

        {activeTab === "Vibrations Temps Réel" && (
          <div className="w-full flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              <span className="text-sm text-green-400 font-medium">Temps Réel — WebSocket actif</span>
            </div>
            <TendanceVibratoire vibrations={vibrations} />
          </div>
        )}


        {activeTab === "Historique Alertes" && (
          <div className="w-full">
            <DernieresAlertes alerts={alerts} />
          </div>
        )}


        {activeTab === "Interventions" && (
          <div className="p-8 rounded-lg border border-black/[0.08] bg-[#0B1518] text-center">
             <h3 className="text-[#E6F0F2] text-lg font-semibold mb-4">Interventions de Maintenance</h3>
             <p className="text-[#98A6A8] mb-6">Aucune intervention planifiée pour ce moteur.</p>
             <Link 
                to={`/ordres-de-travail/creer?motorId=${motor.id}`}
               className="inline-flex items-center px-4 py-2 rounded-md bg-[#007A3D] text-white text-sm hover:bg-[#006633]"
             >
               Créer un Ordre de Travail
             </Link>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
