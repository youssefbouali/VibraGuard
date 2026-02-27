import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { KanbanBoard } from "@/components/ordres/KanbanBoard";

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";

export default function OrdresDeTravail() {
  const navigate = useNavigate();

  return (
    <DashboardLayout breadcrumb="Ordres de Travail">
      <div className="flex flex-col flex-1 min-h-0 overflow-hidden relative">
        <KanbanBoard />

        {/* FAB */}
        <button
          onClick={() => navigate("/ordres-de-travail/creer")}
          className="absolute bottom-8 right-8 flex items-center gap-3 h-14 px-6 rounded-xl bg-[#007A3D] hover:bg-[#006a34] transition-colors text-white font-semibold text-[15px] shadow-lg z-10"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M5 12H19M12 5V19" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Nouveau OT
        </button>
      </div>
    </DashboardLayout>
  );
}

