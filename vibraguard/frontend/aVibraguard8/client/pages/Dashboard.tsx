import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { KPICards } from "@/components/dashboard/KPICards";
import { CartographieSante } from "@/components/dashboard/CartographieSante";
import { VibrationChart } from "@/components/dashboard/VibrationChart";
import { MoteursTable } from "@/components/dashboard/MoteursTable";
import { AlertesRecentes } from "@/components/dashboard/AlertesRecentes";

export default function Dashboard() {
  return (
    <DashboardLayout>
      {/* KPI Cards */}
      <KPICards />

      {/* Middle section: Cartographie + Vibration Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-4 sm:gap-6">
        <CartographieSante />
        <VibrationChart />
      </div>

      {/* Bottom section: Moteurs table + Alertes */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] gap-4 sm:gap-6">
        <MoteursTable />
        <AlertesRecentes />
      </div>
    </DashboardLayout>
  );
}

