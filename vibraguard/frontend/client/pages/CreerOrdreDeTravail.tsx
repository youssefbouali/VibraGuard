import { useNavigate, useSearchParams } from "react-router-dom";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { OTForm } from "@/components/ordres/OTForm";

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";

export default function CreerOrdreDeTravail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialMotorId = searchParams.get("motorId") || undefined;

  return (
    <DashboardLayout
      breadcrumbItems={[
        { label: "Ordres de Travail", href: "/ordres-de-travail" },
        { label: "Créer Ordre de Travail (OT)" },
      ]}
    >
      <div className="flex flex-col flex-1 min-h-0 overflow-y-auto">
        <div className="flex-1 flex items-start justify-center px-0 py-4 lg:py-6">
          <OTForm onCancel={() => navigate("/ordres-de-travail")} initialMotorId={initialMotorId} />
        </div>
      </div>
    </DashboardLayout>
  );
}

