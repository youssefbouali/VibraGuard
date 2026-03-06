import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { SeuilsTab } from "./parametres/SeuilsTab";
import { UtilisateursTab } from "./parametres/UtilisateursTab";

const TABS = [
  "Capteurs IoT",
  "Seuils Alertes",
  "Modèles ML",
  "IPFS",
  "Kafka",
  "Utilisateurs",
];
export default function Parametres() {
  const [activeTab, setActiveTab] = useState("Seuils Alertes");

  return (
    <DashboardLayout
      breadcrumbItems={[
        { label: "Paramètres", href: "/parametres" },
        { label: "Configuration Système" },
      ]}
    >
      <div className="flex flex-col gap-6">
        {/* Title + actions */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h1 className="text-[#E6F0F2] text-2xl font-semibold leading-tight">
            Configuration Système
          </h1>
          <div className="flex items-center gap-3">
            <button className="flex h-10 items-center px-4 rounded-md border border-black/[0.08] text-[#E6F0F2] text-sm font-medium hover:bg-white/5 transition-colors">
              Annuler
            </button>
            <button className="flex h-10 items-center gap-2 px-4 rounded-md bg-[#007A3D] text-white text-sm font-medium hover:bg-[#006633] transition-colors">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path
                  d="M11.4 2.25C11.7957 2.25564 12.1731 2.41738 12.45 2.7L15.3 5.55C15.5826 5.82695 15.7444 6.20435 15.75 6.6V14.25C15.75 15.0779 15.0779 15.75 14.25 15.75H3.75C2.92213 15.75 2.25 15.0779 2.25 14.25V3.75C2.25 2.92213 2.92213 2.25 3.75 2.25H11.4"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12.75 15.75V10.5C12.75 10.0861 12.4139 9.75 12 9.75H6C5.58606 9.75 5.25 10.0861 5.25 10.5V15.75M5.25 2.25V5.25C5.25 5.66394 5.58606 6 6 6H11.25"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Enregistrer
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-black/[0.08] -mb-2">
          <div className="flex gap-6 sm:gap-8 overflow-x-auto scrollbar-none">
            {TABS.map((tab) => {
              const isActive = tab === activeTab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`relative pb-4 text-[15px] font-medium whitespace-nowrap transition-colors shrink-0 ${isActive
                    ? "text-[#007A3D]"
                    : "text-[#C9E7E6] hover:text-[#E6F0F2]"
                    }`}
                >
                  {tab}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] rounded-t bg-[#007A3D]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab content */}
        <div className="flex-1 pb-8">
          {activeTab === "Seuils Alertes" && <SeuilsTab />}
          {activeTab === "Utilisateurs" && <UtilisateursTab />}
          {activeTab !== "Seuils Alertes" && activeTab !== "Utilisateurs" && (
            <div className="flex items-center justify-center h-48 text-[#C9E7E6] text-sm opacity-50">
              Contenu de l'onglet «{activeTab}» à venir
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

