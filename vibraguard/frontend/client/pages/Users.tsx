import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { UtilisateursTab } from "./parametres/UtilisateursTab";

export default function Users() {
  return (
    <DashboardLayout
      breadcrumbItems={[
        { label: "Utilisateurs", href: "/users" },
        { label: "Gestion des Utilisateurs" },
      ]}
    >
      <div className="flex flex-col gap-6">
        <h1 className="text-[#E6F0F2] text-2xl font-semibold leading-tight">
          Gestion des Utilisateurs
        </h1>
        <UtilisateursTab />
      </div>
    </DashboardLayout>
  );
}
