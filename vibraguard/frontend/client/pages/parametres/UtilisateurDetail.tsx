import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";


// ─── User Interface ──────────────────────────────────────────────────────────────────
interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  role: "Admin" | "Ingénieur Data" | "Technicien" | "Responsable";
  department: string;
  status: "Actif" | "Inactif";
  lastConnection: string | "En ligne";
}

const USERS: User[] = [
  {
    id: 1,
    name: "Sarah Dubois",
    email: "sarah.dubois@vibraguard.com",
    role: "Admin",
    department: "Direction",
    status: "Actif",
    lastConnection: "En ligne",
  },
  {
    id: 2,
    name: "Karim Benali",
    email: "karim.benali@vibraguard.com",
    avatar:
      "https://api.builder.io/api/v1/image/assets/TEMP/33eff0290226457aa3b405842cde586de6f5f7ac?width=80",
    role: "Ingénieur Data",
    department: "Analyse & ML",
    status: "Actif",
    lastConnection: "En ligne",
  },
  {
    id: 3,
    name: "Marc Leroy",
    email: "marc.leroy@vibraguard.com",
    avatar:
      "https://api.builder.io/api/v1/image/assets/TEMP/bea15a3f5aecbda98746220b1fe56ef741cf9ab2?width=80",
    role: "Technicien",
    department: "Maintenance Ligne A",
    status: "Actif",
    lastConnection: "Aujourd'hui, 08:15",
  },
  {
    id: 4,
    name: "Julie Martin",
    email: "julie.martin@vibraguard.com",
    avatar:
      "https://api.builder.io/api/v1/image/assets/TEMP/95924e154d79d9ab33cf5bb91967b29f65c955a5?width=80",
    role: "Responsable",
    department: "Opérations",
    status: "Inactif",
    lastConnection: "12 Oct 2026",
  },
  {
    id: 5,
    name: "Ahmed Sy",
    email: "ahmed.sy@vibraguard.com",
    avatar:
      "https://api.builder.io/api/v1/image/assets/TEMP/f41c3b05830ce4629f33d33aca439021fdc66728?width=80",
    role: "Technicien",
    department: "Maintenance Ligne B",
    status: "Actif",
    lastConnection: "Hier, 14:20",
  },
  {
    id: 6,
    name: "Elodie Roux",
    email: "elodie.roux@vibraguard.com",
    avatar:
      "https://api.builder.io/api/v1/image/assets/TEMP/c6d8f1b8da1c5f2e533ecd312364679717603796?width=80",
    role: "Ingénieur Data",
    department: "Analyse & ML",
    status: "Actif",
    lastConnection: "Aujourd'hui, 09:30",
  },
];

const ROLES = ["Admin", "Ingénieur Data", "Technicien", "Responsable"];
const DEPARTMENTS = [
  "Direction",
  "Analyse & ML",
  "Maintenance Ligne A",
  "Maintenance Ligne B",
  "Opérations",
];

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

// ─── Input Field ──────────────────────────────────────────────────────────────────
function InputField({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[#98A6A8] text-[13px] font-medium">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="px-4 py-3 rounded-md border border-black/[0.08] bg-[#0D1316] text-[#E6F0F2] text-sm outline-none focus:border-[#007A3D] transition-colors"
      />
    </div>
  );
}

// ─── Select Field ──────────────────────────────────────────────────────────────────
function SelectDropdown({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <span className="text-[#98A6A8] text-[13px] font-medium">{label}</span>
      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-between px-4 py-3 rounded-md border border-black/[0.08] bg-[#0D1316] text-[#E6F0F2] text-sm hover:bg-white/[0.02] transition-colors"
        >
          <span>{value}</span>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M4 6L8 10L12 6"
              stroke="#E6F0F2"
              strokeWidth="1.33333"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        {open && (
          <div className="absolute top-full left-0 right-0 mt-1 rounded-md border border-black/[0.08] bg-[#0B1A22] shadow-lg z-10">
            {options.map((option) => (
              <button
                key={option}
                onClick={() => {
                  onChange(option);
                  setOpen(false);
                }}
                className={`w-full text-left px-4 py-2 text-sm transition-colors hover:bg-white/5 ${value === option ? "text-[#007A3D] font-medium" : "text-[#E6F0F2]"
                  }`}
              >
                {option}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
// ─── Main Page ────────────────────────────────────────────────────────────────────

export default function UtilisateurDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const user = USERS.find((u) => u.id === parseInt(id || "0"));

  if (!user) {
    return (
      <DashboardLayout
        breadcrumbItems={[
          { label: "Paramètres", href: "/parametres" },
          { label: "Utilisateurs", href: "/parametres" },
          { label: "Utilisateur non trouvé" },
        ]}
      >
        <div className="flex items-center justify-center flex-1 min-h-[400px]">
          <span className="text-[#CFEFF1]">Utilisateur non trouvé</span>
        </div>
      </DashboardLayout>
    );
  }


  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [role, setRole] = useState(user.role);
  const [department, setDepartment] = useState(user.department);
  const [status, setStatus] = useState(user.status);

  const handleSave = () => {
    // For now, just navigate back. In a real app, you'd make an API call here
    navigate("/parametres");
  };

  return (
    <DashboardLayout
      breadcrumbItems={[
        { label: "Paramètres", href: "/parametres" },
        { label: "Utilisateurs", href: "/parametres" },
        { label: `Modifier - ${user.name}` },
      ]}
    >
      <div className="flex flex-col flex-1 min-h-0">
        {/* Page title bar */}
        <div className="flex items-center justify-between py-6 border-b border-black/[0.08]">
          <h1 className="text-[#E6F0F2] text-[28px] font-semibold">Modifier Utilisateur</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/parametres")}
              className="flex items-center gap-2 h-10 px-4 rounded-md border border-black/[0.08] text-[#E6F0F2] text-sm font-semibold hover:bg-white/5 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 h-10 px-4 rounded-md bg-[#007A3D] text-white text-sm font-semibold hover:bg-[#006633] transition-colors"
            >
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
              Enregistrer les modifications
            </button>
          </div>
        </div>


        {/* Form content */}
        <div className="flex gap-8 px-8 py-8 items-start max-w-[1400px]">
          {/* Left column */}
          <div className="flex flex-col gap-8 flex-1 min-w-0">
            {/* ── Informations Personnelles ── */}
            <section className="rounded-lg border border-black/[0.08] bg-[#0B1518]">
              {/* Panel header */}
              <div className="flex items-center gap-3 px-6 py-5 border-b border-black/[0.08]">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  className="text-[#98A6A8] shrink-0"
                >
                  <path
                    d="M13.3334 8.33301H15.0001M13.3334 11.6663H15.0001M5.14172 12.4997C5.49378 11.4989 6.43915 10.8293 7.50006 10.8293C8.56096 10.8293 9.50633 11.4989 9.85839 12.4997"
                    stroke="#98A6A8"
                    strokeWidth="1.66667"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M5.83337 9.16667C5.83337 10.0865 6.58018 10.8333 7.50004 10.8333C8.4199 10.8333 9.16671 10.0865 9.16671 9.16667C9.16671 8.24681 8.4199 7.5 7.50004 7.5C6.58018 7.5 5.83337 8.24681 5.83337 9.16667V9.16667"
                    stroke="#98A6A8"
                    strokeWidth="1.66667"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M3.33329 4.16699H16.6666C17.5871 4.16699 18.3333 4.91318 18.3333 5.83366V14.167C18.3333 15.0875 17.5871 15.8337 16.6666 15.8337H3.33329C2.41282 15.8337 1.66663 15.0875 1.66663 14.167V5.83366C1.66663 4.91318 2.41282 4.16699 3.33329 4.16699V4.16699"
                    stroke="#98A6A8"
                    strokeWidth="1.66667"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="text-[#E6F0F2] text-base font-semibold">
                  Informations Personnelles
                </span>
              </div>

              <div className="flex flex-col gap-8 p-6">
                {/* Avatar */}
                <div className="flex items-center gap-6">
                  <img
                    src={
                      user.avatar ||
                      "https://api.builder.io/api/v1/image/assets/TEMP/debebd2e98692a4004e72072b04e25237419d788?width=192"
                    }
                    alt={user.name}
                    className="w-24 h-24 rounded-full border-[3px] border-[#0B1518] ring-2 ring-[#007A3D] object-cover shrink-0"
                  />
                </div>

                {/* Fields grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                  <InputField label="Nom Complet" value={name} onChange={setName} />
                  <InputField label="Adresse Email" value={email} onChange={setEmail} type="email" />
                  <SelectDropdown label="Rôle" value={role} options={ROLES} onChange={setRole} />
                  <SelectDropdown
                    label="Département"
                    value={department}
                    options={DEPARTMENTS}
                    onChange={setDepartment}
                  />
                </div>
              </div>
            </section>

            {/* ── Statut et Accès ── */}
            <section className="rounded-lg border border-black/[0.08] bg-[#0B1518]">
              <div className="flex items-center gap-3 px-6 py-5 border-b border-black/[0.08]">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  className="shrink-0"
                >
                  <path
                    d="M8.33333 4.16667H2.5M10 15.8333H2.5M11.6667 2.5V5.83333M13.3333 14.1667V17.5M17.5 10H10M17.5 15.8333H13.3333M17.5 4.16667H11.6667M6.66667 8.33333V11.6667M6.66667 10H2.5"
                    stroke="#98A6A8"
                    strokeWidth="1.66667"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="text-[#E6F0F2] text-base font-semibold">Statut et Accès</span>
              </div>

              <div className="p-6">
                <div className="flex flex-col gap-6">
                  {/* Statut Utilisateur */}
                  <div className="flex items-center justify-between pb-6 border-b border-black/[0.08]">
                    <div className="flex flex-col gap-1">
                      <span className="text-[#E6F0F2] text-[15px] font-medium">Statut</span>
                      <span className="text-[#98A6A8] text-[13px]">
                        {status === "Actif" ? "Utilisateur actif" : "Utilisateur inactif"}
                      </span>
                    </div>
                    <Toggle
                      checked={status === "Actif"}
                      onChange={(checked) => setStatus(checked ? "Actif" : "Inactif")}
                    />
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
