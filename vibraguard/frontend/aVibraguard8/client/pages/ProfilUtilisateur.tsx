import { useState } from "react";
import { Link } from "react-router-dom";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";

// ─── Toggle ──────────────────────────────────────────────────────────────────
function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border transition-colors focus-visible:outline-none ${checked ? "bg-[#007A3D] border-[#007A3D]" : "bg-[#071018]/20 border-black/[0.08]"
        }`}
    >
      <span
        className={`pointer-events-none inline-block h-[18px] w-[18px] rounded-full bg-white shadow transition-transform duration-200 translate-y-[3px] ${checked ? "translate-x-[23px]" : "translate-x-[3px]"
          }`}
      />
    </button>
  );
}

// ─── Select ───────────────────────────────────────────────────────────────────
function SelectField({ value }: { value: string }) {
  return (
    <div className="flex items-center justify-between w-[200px] px-4 py-[10px] rounded-md border border-black/[0.08] bg-[#0D1316] cursor-pointer">
      <span className="text-[#E6F0F2] text-sm">{value}</span>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M4 6L8 10L12 6" stroke="#E6F0F2" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

// ─── Info Field ───────────────────────────────────────────────────────────────
function InfoField({ label, icon, value, muted }: { label: string; icon: React.ReactNode; value: string; muted?: boolean }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[#98A6A8] text-[13px] font-medium">{label}</span>
      <div className={`flex items-center gap-3 px-4 py-3 rounded-md border border-black/[0.08] ${muted ? "bg-[#071018]/20 opacity-80" : "bg-[#0D1316]"}`}>
        <span className="text-[#98A6A8] shrink-0">{icon}</span>
        <span className="text-[#E6F0F2] text-sm">{value}</span>
      </div>
    </div>
  );
}

// ─── Intervention Row ─────────────────────────────────────────────────────────
interface InterventionProps {
  id: string;
  title: string;
  subtitle: string;
  status: "En cours" | "Terminé";
  iconBg: string;
  icon: React.ReactNode;
}

function InterventionRow({ title, subtitle, status, iconBg, icon }: InterventionProps) {
  const isEnCours = status === "En cours";
  return (
    <div className="flex items-center justify-between p-4 rounded-md border border-black/[0.08] bg-[#0D1316]">
      <div className="flex items-center gap-4">
        <div className={`flex w-10 h-10 items-center justify-center rounded-md shrink-0 ${iconBg}`}>
          {icon}
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[#E6F0F2] text-sm font-medium">{title}</span>
          <div className="flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0">
              <path d="M6.99996 11.667V12.8337M6.99996 1.16699V2.33366M9.91663 11.667V12.8337M9.91663 1.16699V2.33366M1.16663 7.00033H2.33329M1.16663 9.91699H2.33329M1.16663 4.08366H2.33329M11.6666 7.00033H12.8333M11.6666 9.91699H12.8333M11.6666 4.08366H12.8333M4.08329 11.667V12.8337M4.08329 1.16699V2.33366" stroke="#98A6A8" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M3.50004 2.33301H10.5C11.1439 2.33301 11.6667 2.85577 11.6667 3.49967V10.4997C11.6667 11.1436 11.1439 11.6663 10.5 11.6663H3.50004C2.85614 11.6663 2.33337 11.1436 2.33337 10.4997V3.49967C2.33337 2.85577 2.85614 2.33301 3.50004 2.33301V2.33301" stroke="#98A6A8" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M5.24996 4.66699H8.74996C9.07191 4.66699 9.33329 4.92838 9.33329 5.25033V8.75033C9.33329 9.07228 9.07191 9.33366 8.74996 9.33366H5.24996C4.92801 9.33366 4.66663 9.07228 4.66663 8.75033V5.25033C4.66663 4.92838 4.92801 4.66699 5.24996 4.66699V4.66699" stroke="#98A6A8" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-[#98A6A8] text-[13px]">{subtitle}</span>
          </div>
        </div>
      </div>
      <span
        className={`px-[10px] py-1 rounded text-xs font-semibold ${isEnCours
          ? "bg-[rgba(242,169,0,0.15)] text-[#F2A900]"
          : "bg-[rgba(0,122,61,0.15)] text-[#007A3D]"
          }`}
      >
        {status}
      </span>
    </div>
  );
}

// ─── Activity Item ────────────────────────────────────────────────────────────
interface ActivityItemProps {
  time: string;
  title: string;
  description: string;
  isFirst?: boolean;
}

function ActivityItem({ time, title, description, isFirst }: ActivityItemProps) {
  return (
    <div className="relative flex flex-col gap-1 pl-6">
      {/* Timeline dot */}
      <div
        className={`absolute left-0 top-1 w-4 h-4 rounded-full border-2 ${isFirst ? "bg-[#0C6CF2] border-[#0C6CF2]" : "bg-[#0B1518] border-[#98A6A8]"
          }`}
      />
      <span className="text-[#98A6A8] text-xs">{time}</span>
      <span className={`text-sm font-medium leading-[1.5] ${isFirst ? "text-[#0C6CF2]" : "text-[#E6F0F2]"}`}>
        {title}
      </span>
      <span className="text-[#C9E7E6] text-[13px]">{description}</span>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ProfilUtilisateur() {
  const [pushNotif, setPushNotif] = useState(true);
  const [emailReports, setEmailReports] = useState(false);

  return (
    <DashboardLayout
      breadcrumbItems={[
        { label: "Paramètres", href: "/parametres" },
        { label: "Profil Utilisateur" },
      ]}
    >
      <div className="flex flex-col flex-1 min-h-0">
        {/* Page title bar */}
        <div className="flex items-center justify-between py-4 border-b border-black/[0.08] transition-all">
          <h1 className="text-[#E6F0F2] text-[28px] font-semibold">Profil Utilisateur</h1>
          <button className="flex items-center gap-2 h-10 px-4 rounded-md bg-[#007A3D] text-white text-sm font-semibold hover:bg-[#006633] transition-colors">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M11.4 2.25C11.7957 2.25564 12.1731 2.41738 12.45 2.7L15.3 5.55C15.5826 5.82695 15.7444 6.20435 15.75 6.6V14.25C15.75 15.0779 15.0779 15.75 14.25 15.75H3.75C2.92213 15.75 2.25 15.0779 2.25 14.25V3.75C2.25 2.92213 2.92213 2.25 3.75 2.25H11.4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M12.75 15.75V10.5C12.75 10.0861 12.4139 9.75 12 9.75H6C5.58606 9.75 5.25 10.0861 5.25 10.5V15.75M5.25 2.25V5.25C5.25 5.66394 5.58606 6 6 6H11.25" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Enregistrer les modifications
          </button>
        </div>


        {/* Two-column layout */}
        <div className="flex gap-8 px-8 py-8 items-start max-w-[1400px]">
          {/* Left column */}
          <div className="flex flex-col gap-8 flex-1 min-w-0">

            {/* ── Informations Personnelles ── */}
            <section className="rounded-lg border border-black/[0.08] bg-[#0B1518]">
              {/* Panel header */}
              <div className="flex items-center gap-3 px-6 py-5 border-b border-black/[0.08]">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-[#98A6A8] shrink-0">
                  <path d="M13.3334 8.33301H15.0001M13.3334 11.6663H15.0001M5.14172 12.4997C5.49378 11.4989 6.43915 10.8293 7.50006 10.8293C8.56096 10.8293 9.50633 11.4989 9.85839 12.4997" stroke="#98A6A8" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M5.83337 9.16667C5.83337 10.0865 6.58018 10.8333 7.50004 10.8333C8.4199 10.8333 9.16671 10.0865 9.16671 9.16667C9.16671 8.24681 8.4199 7.5 7.50004 7.5C6.58018 7.5 5.83337 8.24681 5.83337 9.16667V9.16667" stroke="#98A6A8" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M3.33329 4.16699H16.6666C17.5871 4.16699 18.3333 4.91318 18.3333 5.83366V14.167C18.3333 15.0875 17.5871 15.8337 16.6666 15.8337H3.33329C2.41282 15.8337 1.66663 15.0875 1.66663 14.167V5.83366C1.66663 4.91318 2.41282 4.16699 3.33329 4.16699V4.16699" stroke="#98A6A8" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="text-[#E6F0F2] text-base font-semibold">Informations Personnelles</span>
              </div>

              <div className="flex flex-col gap-8 p-6">
                {/* Avatar */}
                <div className="flex items-center gap-6">
                  <img
                    src="https://api.builder.io/api/v1/image/assets/TEMP/debebd2e98692a4004e72072b04e25237419d788?width=192"
                    alt="Karim B."
                    className="w-24 h-24 rounded-full border-[3px] border-[#0B1518] ring-2 ring-[#007A3D] object-cover shrink-0"
                  />
                </div>

                {/* Fields grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                  <InfoField
                    label="Identifiant Employé"
                    muted
                    icon={
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M2.66663 6H13.3333M2.66663 10H13.3333M6.66663 2L5.33329 14M10.6666 2L9.33329 14" stroke="#98A6A8" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    }
                    value="TECH-4892"
                  />
                  <InfoField
                    label="Adresse Email"
                    icon={
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M14.6666 4.66699L8.67259 8.48499C8.25853 8.72549 7.74731 8.72549 7.33325 8.48499L1.33325 4.66699" stroke="#98A6A8" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M2.66659 2.66699H13.3333C14.0691 2.66699 14.6666 3.26444 14.6666 4.00033V12.0003C14.6666 12.7362 14.0691 13.3337 13.3333 13.3337H2.66659C1.9307 13.3337 1.33325 12.7362 1.33325 12.0003V4.00033C1.33325 3.26444 1.9307 2.66699 2.66659 2.66699V2.66699" stroke="#98A6A8" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    }
                    value="k.benali@ocpgroup.ma"
                  />
                  <InfoField
                    label="Numéro de Téléphone"
                    icon={
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M9.22137 11.045C9.50498 11.1753 9.84099 11.0913 10.03 10.843L10.2667 10.533C10.5185 10.1973 10.9137 9.99967 11.3334 9.99967H13.3334C14.0693 9.99967 14.6667 10.5971 14.6667 11.333V13.333C14.6667 14.0689 14.0693 14.6663 13.3334 14.6663C6.70596 14.6663 1.33337 9.29376 1.33337 2.66634C1.33337 1.93045 1.93082 1.33301 2.66671 1.33301H4.66671C5.40259 1.33301 6.00004 1.93045 6.00004 2.66634V4.66634C6.00004 5.08602 5.80245 5.4812 5.46671 5.73301L5.15471 5.96701C4.90236 6.15969 4.82091 6.50361 4.96004 6.78901C5.87116 8.63959 7.36966 10.1362 9.22137 11.045" stroke="#98A6A8" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    }
                    value="+212 6 00 11 22 33"
                  />
                  <InfoField
                    label="Département"
                    icon={
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M10.6666 13.333V2.66634C10.6666 1.93045 10.0691 1.33301 9.33325 1.33301H6.66659C5.9307 1.33301 5.33325 1.93045 5.33325 2.66634V13.333" stroke="#98A6A8" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M2.66659 4H13.3333C14.0691 4 14.6666 4.59745 14.6666 5.33333V12C14.6666 12.7359 14.0691 13.3333 13.3333 13.3333H2.66659C1.9307 13.3333 1.33325 12.7359 1.33325 12V5.33333C1.33325 4.59745 1.9307 4 2.66659 4V4" stroke="#98A6A8" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    }
                    value="Maintenance Prédictive"
                  />
                </div>
              </div>
            </section>

            {/* ── Préférences et Notifications ── */}
            <section className="rounded-lg border border-black/[0.08] bg-[#0B1518]">
              <div className="flex items-center gap-3 px-6 py-5 border-b border-black/[0.08]">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0">
                  <path d="M8.33333 4.16667H2.5M10 15.8333H2.5M11.6667 2.5V5.83333M13.3333 14.1667V17.5M17.5 10H10M17.5 15.8333H13.3333M17.5 4.16667H11.6667M6.66667 8.33333V11.6667M6.66667 10H2.5" stroke="#98A6A8" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="text-[#E6F0F2] text-base font-semibold">Préférences et Notifications</span>
              </div>

              <div className="p-6">
                <div className="flex flex-col gap-6">
                  {/* Notifications Push */}
                  <div className="flex items-center justify-between pb-6 border-b border-black/[0.08]">
                    <div className="flex flex-col gap-1">
                      <span className="text-[#E6F0F2] text-[15px] font-medium">Notifications Push</span>
                      <span className="text-[#98A6A8] text-[13px]">Recevoir des alertes critiques sur l'application mobile</span>
                    </div>
                    <Toggle checked={pushNotif} onChange={setPushNotif} />
                  </div>

                  {/* Rapports par Email */}
                  <div className="flex items-center justify-between pb-6 border-b border-black/[0.08]">
                    <div className="flex flex-col gap-1">
                      <span className="text-[#E6F0F2] text-[15px] font-medium">Rapports par Email</span>
                      <span className="text-[#98A6A8] text-[13px]">Recevoir le résumé quotidien des interventions</span>
                    </div>
                    <Toggle checked={emailReports} onChange={setEmailReports} />
                  </div>

                  {/* Langue */}
                  <div className="flex items-center justify-between pb-6 border-b border-black/[0.08]">
                    <div className="flex flex-col gap-1">
                      <span className="text-[#E6F0F2] text-[15px] font-medium">Langue de l'interface</span>
                      <span className="text-[#98A6A8] text-[13px]">Choisissez votre langue préférée (FR/AR/EN)</span>
                    </div>
                    <SelectField value="Français (FR)" />
                  </div>

                  {/* Thème */}
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                      <span className="text-[#E6F0F2] text-[15px] font-medium">Thème Visuel</span>
                      <span className="text-[#98A6A8] text-[13px]">Apparence de l'application VibraGuard</span>
                    </div>
                    <SelectField value="Sombre (Industry 4.0)" />
                  </div>
                </div>
              </div>
            </section>

            {/* ── Mes interventions récentes ── */}
            <section className="rounded-lg border border-black/[0.08] bg-[#0B1518]">
              <div className="flex items-center justify-between px-6 py-5 border-b border-black/[0.08]">
                <div className="flex items-center gap-3">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0">
                    <path d="M7.49996 1.66699H12.5C12.9602 1.66699 13.3333 2.04009 13.3333 2.50033V4.16699C13.3333 4.62723 12.9602 5.00033 12.5 5.00033H7.49996C7.03972 5.00033 6.66663 4.62723 6.66663 4.16699V2.50033C6.66663 2.04009 7.03972 1.66699 7.49996 1.66699V1.66699" stroke="#98A6A8" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M13.3334 3.33301H15C15.9205 3.33301 16.6667 4.0792 16.6667 4.99967V16.6663C16.6667 17.5868 15.9205 18.333 15 18.333H5.00004C4.07957 18.333 3.33337 17.5868 3.33337 16.6663V4.99967C3.33337 4.0792 4.07957 3.33301 5.00004 3.33301H6.66671M10 9.16634H13.3334M10 13.333H13.3334M6.66671 9.16634H6.67504M6.66671 13.333H6.67504" stroke="#98A6A8" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="text-[#E6F0F2] text-base font-semibold">Mes interventions récentes</span>
                </div>
                <button className="flex h-8 items-center px-4 rounded-md border border-black/[0.08] text-[#E6F0F2] text-[13px] font-semibold hover:bg-white/5 transition-colors">
                  Voir tout
                </button>
              </div>

              <div className="flex flex-col gap-3 p-6">
                <InterventionRow
                  id="OT-1102"
                  title="OT-1102 : Inspection Palier SKF-6205"
                  subtitle="MTR-Broyeur-04 • Échéance : Aujourd'hui, 16:00"
                  status="En cours"
                  iconBg="bg-[rgba(12,108,242,0.15)]"
                  icon={
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M3.33333 2.5H7.5C7.96024 2.5 8.33333 2.8731 8.33333 3.33333V9.16667C8.33333 9.6269 7.96024 10 7.5 10H3.33333C2.8731 10 2.5 9.6269 2.5 9.16667V3.33333C2.5 2.8731 2.8731 2.5 3.33333 2.5V2.5" stroke="#0C6CF2" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M12.5 2.5H16.6666C17.1269 2.5 17.5 2.8731 17.5 3.33333V5.83333C17.5 6.29357 17.1269 6.66667 16.6666 6.66667H12.5C12.0397 6.66667 11.6666 6.29357 11.6666 5.83333V3.33333C11.6666 2.8731 12.0397 2.5 12.5 2.5V2.5" stroke="#0C6CF2" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M12.5 10H16.6666C17.1269 10 17.5 10.3731 17.5 10.8333V16.6667C17.5 17.1269 17.1269 17.5 16.6666 17.5H12.5C12.0397 17.5 11.6666 17.1269 11.6666 16.6667V10.8333C11.6666 10.3731 12.0397 10 12.5 10V10" stroke="#0C6CF2" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M3.33333 13.333H7.5C7.96024 13.333 8.33333 13.7061 8.33333 14.1663V16.6663C8.33333 17.1266 7.96024 17.4997 7.5 17.4997H3.33333C2.8731 17.4997 2.5 17.1266 2.5 16.6663V14.1663C2.5 13.7061 2.8731 13.333 3.33333 13.333V13.333" stroke="#0C6CF2" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  }
                />
                <InterventionRow
                  id="OT-1098"
                  title="OT-1098 : Réalignement Arbre de Transmission"
                  subtitle="MTR-Convoyeur-12 • Terminé le 22 Oct"
                  status="Terminé"
                  iconBg="bg-[rgba(0,122,61,0.15)]"
                  icon={
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M18.1675 8.33289C18.9517 12.1817 16.942 16.0555 13.3438 17.6307C9.74557 19.2058 5.53598 18.0545 3.24023 14.8674C0.944472 11.6803 1.18591 7.32282 3.81971 4.40887C6.45351 1.49491 10.7645 0.815722 14.1667 2.77873" stroke="#007A3D" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M7.5 9.16634L10 11.6663L18.3333 3.33301" stroke="#007A3D" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  }
                />
                <InterventionRow
                  id="OT-1095"
                  title="OT-1095 : Graissage Roulements Pompe A"
                  subtitle="PMP-Eau-01 • Terminé le 18 Oct"
                  status="Terminé"
                  iconBg="bg-[rgba(0,122,61,0.15)]"
                  icon={
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M18.1675 8.33289C18.9517 12.1817 16.942 16.0555 13.3438 17.6307C9.74557 19.2058 5.53598 18.0545 3.24023 14.8674C0.944472 11.6803 1.18591 7.32282 3.81971 4.40887C6.45351 1.49491 10.7645 0.815722 14.1667 2.77873" stroke="#007A3D" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M7.5 9.16634L10 11.6663L18.3333 3.33301" stroke="#007A3D" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  }
                />
              </div>
            </section>
          </div>

          {/* Right column – Activity history */}
          <div className="w-[306px] shrink-0 hidden xl:block">
            <div className="rounded-lg border border-black/[0.08] bg-[#0B1518]">
              <div className="flex items-center gap-3 px-6 py-5 border-b border-black/[0.08]">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0">
                  <path d="M18.3334 10.0003H16.2667C15.5183 9.99872 14.8605 10.4963 14.6584 11.217L12.7001 18.1837C12.6742 18.2725 12.5927 18.3337 12.5001 18.3337C12.4075 18.3337 12.326 18.2725 12.3001 18.1837L7.70008 1.81699C7.67416 1.7281 7.59267 1.66699 7.50008 1.66699C7.40749 1.66699 7.32601 1.7281 7.30008 1.81699L5.34175 8.78366C5.14049 9.50138 4.48715 9.99819 3.74175 10.0003H1.66675" stroke="#98A6A8" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="text-[#E6F0F2] text-base font-semibold">Historique d'activités</span>
              </div>

              <div className="p-6">
                {/* Timeline */}
                <div className="relative flex flex-col gap-6">
                  {/* Vertical line */}
                  <div className="absolute left-[7px] top-4 bottom-0 w-[2px] bg-black/[0.08]" />

                  <ActivityItem
                    isFirst
                    time="Aujourd'hui, 08:30"
                    title="Connexion réussie"
                    description="IP: 192.168.1.45 • Session Mobile"
                  />
                  <ActivityItem
                    time="Aujourd'hui, 07:45"
                    title="Alerte ALT-8402 consultée"
                    description="MTR-Broyeur-04 (Critique)"
                  />
                  <ActivityItem
                    time="Hier, 16:20"
                    title="Clôture Intervention OT-1098"
                    description="Signature électronique validée et certifiée"
                  />
                  <ActivityItem
                    time="Hier, 14:10"
                    title="Mise à jour du statut OT-1098"
                    description='Passage de "À faire" à "En cours"'
                  />
                  <ActivityItem
                    time="22 Oct 2026, 09:00"
                    title="Modification des préférences"
                    description="Activation des alertes SMS"
                  />
                  <ActivityItem
                    time="20 Oct 2026, 11:30"
                    title="Rapport de diagnostic exporté"
                    description="PMP-Eau-01 Analyse Spectrale (PDF)"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
