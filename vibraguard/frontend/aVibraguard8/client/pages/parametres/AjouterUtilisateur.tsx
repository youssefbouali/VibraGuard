import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";


// ─── Constants ──────────────────────────────────────────────────────────────────
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
    placeholder = "",
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    type?: string;
    placeholder?: string;
}) {
    return (
        <div className="flex flex-col gap-2">
            <span className="text-[#98A6A8] text-[13px] font-medium">{label}</span>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="px-4 py-3 rounded-md border border-black/[0.08] bg-[#0D1316] text-[#E6F0F2] text-sm outline-none focus:border-[#007A3D] transition-colors placeholder:text-[#98A6A8]/40"
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
    placeholder = "Sélectionner...",
}: {
    label: string;
    value: string;
    options: string[];
    onChange: (v: string) => void;
    placeholder?: string;
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
                    <span className={!value ? "text-[#98A6A8]/40" : ""}>{value || placeholder}</span>
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

export default function AjouterUtilisateur() {
    const navigate = useNavigate();

    // Form State
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("");
    const [department, setDepartment] = useState("");
    const [status, setStatus] = useState("Actif");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const handleCreate = () => {
        // In a real app, you'd validate and make an API call here
        if (!name || !email || !role || !department) {
            toast.error("Veuillez remplir tous les champs obligatoires.");
            return;
        }

        toast.success("Utilisateur créé avec succès !");
        setTimeout(() => {
            navigate("/parametres");
        }, 1000);
    };

    return (
        <DashboardLayout
            breadcrumbItems={[
                { label: "Paramètres", href: "/parametres" },
                { label: "Utilisateurs", href: "/parametres" },
                { label: "Ajouter un utilisateur" },
            ]}
        >
            <div className="flex flex-col flex-1 min-h-0">
                {/* Page title bar */}
                <div className="flex items-end justify-between py-6 border-b border-black/[0.08]">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-[#E6F0F2] text-[28px] font-semibold">Ajouter Utilisateur</h1>
                        <p className="text-[#98A6A8] text-sm">Créez un nouveau compte pour un collaborateur.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate("/parametres")}
                            className="flex items-center gap-2 h-10 px-4 rounded-md border border-black/[0.08] text-[#E6F0F2] text-sm font-semibold hover:bg-white/5 transition-colors"
                        >
                            Annuler
                        </button>
                        <button
                            onClick={handleCreate}
                            className="flex items-center gap-2 h-10 px-6 rounded-md bg-[#007A3D] text-white text-sm font-semibold hover:bg-[#006633] transition-colors"
                        >
                            Créer l'utilisateur
                        </button>
                    </div>
                </div>


                {/* Form content */}
                <div className="flex flex-col gap-8 px-8 py-8 items-start max-w-[1400px]">
                    {/* ── Informations Personnelles ── */}
                    <section className="w-full rounded-lg border border-black/[0.08] bg-[#0B1518]">
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
                                Informations de base
                            </span>
                        </div>

                        <div className="flex flex-col gap-8 p-6">
                            {/* Avatar Placeholder */}
                            <div className="flex items-center gap-6">
                                <div className="w-24 h-24 rounded-full bg-[#0D1316] border-2 border-dashed border-[#98A6A8]/30 flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-[#007A3D]/50 transition-colors">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-[#98A6A8]">
                                        <path d="M12 16V12M12 12V8M12 12H16M12 12H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                                    </svg>
                                    <span className="text-[10px] text-[#98A6A8] font-medium">Photo</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-[#E6F0F2] text-sm font-medium">Avatar de l'utilisateur</span>
                                    <span className="text-[#98A6A8] text-xs">JPG, PNG ou GIF. Max 5MB.</span>
                                </div>
                            </div>

                            {/* Fields grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                                <InputField label="Nom Complet" value={name} onChange={setName} placeholder="ex: Jean Dupont" />
                                <InputField label="Adresse Email" value={email} onChange={setEmail} type="email" placeholder="jean.dupont@vibraguard.com" />
                                <SelectDropdown label="Rôle" value={role} options={ROLES} onChange={setRole} placeholder="Choisir un rôle" />
                                <SelectDropdown
                                    label="Département"
                                    value={department}
                                    options={DEPARTMENTS}
                                    onChange={setDepartment}
                                    placeholder="Choisir un département"
                                />
                            </div>
                        </div>
                    </section>

                    {/* ── Sécurité ── */}
                    <section className="w-full rounded-lg border border-black/[0.08] bg-[#0B1518]">
                        <div className="flex items-center gap-3 px-6 py-5 border-b border-black/[0.08]">
                            <svg
                                width="20"
                                height="20"
                                viewBox="0 0 20 20"
                                fill="none"
                                className="shrink-0"
                            >
                                <path
                                    d="M10 10.8333C11.3807 10.8333 12.5 9.71404 12.5 8.33333C12.5 6.95262 11.3807 5.83333 10 5.83333C8.61929 5.83333 7.5 6.95262 7.5 8.33333C7.5 9.71404 8.61929 10.8333 10 10.8333Z"
                                    stroke="#98A6A8"
                                    strokeWidth="1.66667"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                                <path
                                    d="M3.33325 15.8333C3.33325 13.0719 6.31802 10.8333 9.99992 10.8333C13.6818 10.8333 16.6666 13.0719 16.6666 15.8333"
                                    stroke="#98A6A8"
                                    strokeWidth="1.66667"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                            <span className="text-[#E6F0F2] text-base font-semibold">Sécurité</span>
                        </div>

                        <div className="p-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                                <InputField label="Mot de passe" value={password} onChange={setPassword} type="password" placeholder="••••••••" />
                                <InputField label="Confirmer le mot de passe" value={confirmPassword} onChange={setConfirmPassword} type="password" placeholder="••••••••" />
                            </div>
                        </div>
                    </section>

                    {/* ── Statut et Accès ── */}
                    <section className="w-full rounded-lg border border-black/[0.08] bg-[#0B1518]">
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
                            <span className="text-[#E6F0F2] text-base font-semibold">Statut initial</span>
                        </div>

                        <div className="p-6">
                            <div className="flex items-center justify-between pb-2">
                                <div className="flex flex-col gap-1">
                                    <span className="text-[#E6F0F2] text-[15px] font-medium">Activer le compte immédiatement</span>
                                    <span className="text-[#98A6A8] text-[13px]">
                                        {status === "Actif" ? "L'utilisateur pourra se connecter dès la création." : "Le compte sera créé mais restera inactif."}
                                    </span>
                                </div>
                                <Toggle
                                    checked={status === "Actif"}
                                    onChange={(checked) => setStatus(checked ? "Actif" : "Inactif")}
                                />
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </DashboardLayout>
    );
}
