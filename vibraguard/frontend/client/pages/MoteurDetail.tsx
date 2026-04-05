import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { cn } from "@/lib/utils";
import { MoteurDetailHeader } from "@/components/dashboard/MoteurDetailHeader";
import { SanteCard } from "@/components/dashboard/SanteCard";
import { TendanceVibratoire } from "@/components/dashboard/TendanceVibratoire";
import { FFTChart } from "@/components/dashboard/FFTChart";
import { DernieresAlertes } from "@/components/dashboard/DernieresAlertes";
import { Header } from "@/components/dashboard/Header";
import { api } from "@/lib/api";

const tabs = [
  "Vue d'ensemble",
  "Vibrations Temps Réel",
  "Analyse FFT",
  "Prédiction RUL",
  "Historique Alertes",
  "Interventions",
];

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";

export default function MoteurDetail() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState("Vue d'ensemble");
  const [motor, setMotor] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [vibrations, setVibrations] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    if (id) {
      setLoading(true);
      Promise.all([
        api.getMotorById(id),
        api.getMotorVibrations(id),
        api.getAlerts() // Normally we would fetch motor-specific alerts, but for now we'll filter them or use all
      ])
        .then(([motorData, vibData, alertData]) => {
          setMotor(motorData);
          setVibrations(vibData);
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

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] gap-4 sm:gap-6">
          {/* Left column */}
          <div className="flex flex-col gap-4 sm:gap-6">
            <SanteCard motor={motor} />
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-4 sm:gap-6">
            <TendanceVibratoire vibrations={vibrations} />
          </div>
        </div>

        {/* Bottom Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-4 sm:gap-6">
          <FFTChart data={vibrations[0]} />
          <DernieresAlertes alerts={alerts} />
        </div>
      </div>
    </DashboardLayout>
  );
}
