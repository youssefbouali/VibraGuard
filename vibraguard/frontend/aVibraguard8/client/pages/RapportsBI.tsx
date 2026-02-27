import { useState } from "react";
import { KPICards } from "./rapports-bi/KPICards";

import { MaintenanceCostChart } from "./rapports-bi/MaintenanceCostChart";
import { InterventionChart } from "./rapports-bi/InterventionChart";
import { CartographieSites } from "./rapports-bi/CartographieSites";
import { MtbfBySiteChart } from "./rapports-bi/MtbfBySiteChart";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";

type Tab = "quotidien" | "hebdomadaire" | "mensuel";


export default function RapportsBI() {
  const [activeTab, setActiveTab] = useState<Tab>("hebdomadaire");

  return (
    <DashboardLayout breadcrumb="Rapports BI">
      <div className="flex flex-col flex-1 min-w-0">
        {/* Page title bar */}
        <div className="flex flex-col border-b border-black/[0.08] shrink-0">

          {/* Top row: title + actions */}
          <div className="flex flex-wrap items-end justify-between gap-4 px-6 lg:px-12 pt-8 pb-6">
            <h1 className="text-[#E6F0F2] text-2xl lg:text-[28px] font-semibold leading-tight">
              Tableau de Bord Décisionnel
            </h1>

            <div className="flex flex-wrap items-center gap-3">
              {/* Date range */}
              <div className="relative flex items-center gap-2 h-10 px-4 rounded-md border border-black/[0.08] bg-[#0B1518] min-w-[200px]">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="shrink-0">
                  <path d="M6 1.5V4.5M12 1.5V4.5" stroke="#98A6A8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M3.75 3H14.25C15.0779 3 15.75 3.67213 15.75 4.5V15C15.75 15.8279 15.0779 16.5 14.25 16.5H3.75C2.92213 16.5 2.25 15.8279 2.25 15V4.5C2.25 3.67213 2.92213 3 3.75 3V3" stroke="#98A6A8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M2.25 7.5H15.75" stroke="#98A6A8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="text-[#E6F0F2] text-[14px] font-medium flex-1 whitespace-nowrap">
                  01 Oct 2026 – 31 Oct 2026
                </span>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
                  <path d="M4 6L8 10L12 6" stroke="#98A6A8" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>

              {/* Export PDF */}
              <button className="flex items-center gap-2 h-10 px-4 rounded-md border border-black/[0.08] hover:bg-white/5 transition-colors">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M4.5 16.5C3.67213 16.5 3 15.8279 3 15V3C3 2.17213 3.67213 1.5 4.5 1.5H10.5C10.9795 1.49923 11.4395 1.68982 11.778 2.0295L14.469 4.7205C14.8096 5.05909 15.0008 5.51974 15 6V15C15 15.8279 14.3279 16.5 13.5 16.5H4.5" stroke="#D93F3F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M10.5 1.5V5.25C10.5 5.66394 10.8361 6 11.25 6H15M7.5 6.75H6M12 9.75H6M12 12.75H6" stroke="#D93F3F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="text-[#E6F0F2] text-[14px] font-semibold">Export PDF</span>
              </button>

              {/* Export Excel */}
              <button className="flex items-center gap-2 h-10 px-4 rounded-md bg-[#007A3D] hover:bg-[#006633] transition-colors">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M4.5 16.5C3.67213 16.5 3 15.8279 3 15V3C3 2.17213 3.67213 1.5 4.5 1.5H10.5C10.9795 1.49923 11.4395 1.68982 11.778 2.0295L14.469 4.7205C14.8096 5.05909 15.0008 5.51974 15 6V15C15 15.8279 14.3279 16.5 13.5 16.5H4.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M10.5 1.5V5.25C10.5 5.66394 10.8361 6 11.25 6H15M6 9.75H7.5M10.5 9.75H12M6 12.75H7.5M10.5 12.75H12" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="text-white text-[14px] font-semibold">Export Excel</span>
              </button>
            </div>
          </div>

          {/* Bottom row: tabs + last update */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-6 lg:px-12 pb-6">
            {/* Tabs */}
            <div className="flex items-center gap-1 p-1 rounded-md border border-black/[0.08] bg-[#0D1316]">
              {(
                [
                  { id: "quotidien", label: "Rapport Quotidien" },
                  { id: "hebdomadaire", label: "Hebdomadaire" },
                  { id: "mensuel", label: "Mensuel" },
                ] as { id: Tab; label: string }[]
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-5 py-2 rounded-[4px] text-[14px] font-medium transition-colors ${activeTab === tab.id
                    ? "bg-[#0B1518] text-[#E6F0F2] shadow-[0_1px_4px_0_rgba(0,0,0,0.30)]"
                    : "text-[#98A6A8] hover:text-white"
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <span className="text-[#98A6A8] text-[13px] font-normal">
              Dernière mise à jour : il y a 2 min
            </span>
          </div>
        </div>


        {/* Page content */}
        <div className="flex flex-col gap-6 py-8">
          {/* KPI Cards */}
          <KPICards />

          {/* Charts row: Maintenance cost + Intervention donut */}
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-6">
            <div className="min-h-[320px]">
              <MaintenanceCostChart />
            </div>
            <div className="min-h-[320px]">
              <InterventionChart />
            </div>
          </div>

          {/* Bottom row: Map + MTBF by Site */}
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-6 pb-4">
            <div className="min-h-[380px]">
              <CartographieSites />
            </div>
            <div className="min-h-[380px]">
              <MtbfBySiteChart />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

