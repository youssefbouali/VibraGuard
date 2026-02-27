import { useState } from "react";
import { useNavigate } from "react-router-dom";

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

const ROLES = ["Tous les rôles", "Admin", "Ingénieur Data", "Technicien", "Responsable"];
const DEPARTMENTS = [
  "Tous les départements",
  "Direction",
  "Analyse & ML",
  "Maintenance Ligne A",
  "Maintenance Ligne B",
  "Opérations",
];

const ROLE_STYLES: Record<string, { border: string; bg: string; text: string }> = {
  Admin: {
    border: "border-[rgba(217,63,63,0.30)]",
    bg: "bg-[rgba(217,63,63,0.15)]",
    text: "text-[#D93F3F]",
  },
  "Ingénieur Data": {
    border: "border-[rgba(12,108,242,0.30)]",
    bg: "bg-[rgba(12,108,242,0.15)]",
    text: "text-[#0C6CF2]",
  },
  Technicien: {
    border: "border-[rgba(207,239,241,0.30)]",
    bg: "bg-[rgba(207,239,241,0.15)]",
    text: "text-[#CFEFF1]",
  },
  Responsable: {
    border: "border-[rgba(242,169,0,0.30)]",
    bg: "bg-[rgba(242,169,0,0.15)]",
    text: "text-[#F2A900]",
  },
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function UserAvatar({ user }: { user: User }) {
  if (user.avatar) {
    return (
      <img
        src={user.avatar}
        alt={user.name}
        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
      />
    );
  }
  return (
    <div className="w-10 h-10 rounded-full bg-[#007A3D]/30 border border-[#007A3D]/40 flex items-center justify-center flex-shrink-0">
      <span className="text-[#10B981] text-sm font-semibold">{getInitials(user.name)}</span>
    </div>
  );
}

function RoleBadge({ role }: { role: User["role"] }) {
  const styles = ROLE_STYLES[role];
  return (
    <span
      className={`inline-flex items-center px-3 py-[6px] rounded border text-xs font-semibold ${styles.border} ${styles.bg} ${styles.text}`}
    >
      {role}
    </span>
  );
}

function StatusBadge({ status }: { status: User["status"] }) {
  if (status === "Actif") {
    return (
      <span className="inline-flex items-center gap-[6px] px-3 py-[6px] rounded bg-[rgba(0,122,61,0.15)]">
        <span className="w-[6px] h-[6px] rounded-full bg-[#007A3D] shadow-[0_0_6px_0_#007A3D] flex-shrink-0" />
        <span className="text-xs font-semibold text-[#007A3D]">Actif</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-[6px] px-3 py-[6px] rounded bg-[rgba(155,179,181,0.15)]">
      <span className="w-[6px] h-[6px] rounded-full bg-[#CFEFF1] flex-shrink-0" />
      <span className="text-xs font-semibold text-[#CFEFF1]">Inactif</span>
    </span>
  );
}

function LastConnectionCell({ value }: { value: string }) {
  if (value === "En ligne") {
    return (
      <span className="flex items-center gap-2 text-sm font-medium text-[#007A3D]">
        <span className="w-[6px] h-[6px] rounded-full bg-[#007A3D] shadow-[0_0_6px_0_#007A3D] flex-shrink-0" />
        En ligne
      </span>
    );
  }
  return <span className="text-sm text-[#CFEFF1]">{value}</span>;
}

const EditIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <g clipPath="url(#edit-clip)">
      <path
        d="M15.8805 5.10929C16.7062 4.28376 16.7064 2.94515 15.8808 2.11941C15.0553 1.29368 13.7167 1.29351 12.891 2.11904L2.88146 12.1308C2.70732 12.3044 2.57855 12.5182 2.50646 12.7533L1.51571 16.0173C1.47622 16.1494 1.51245 16.2926 1.61006 16.39C1.70766 16.4875 1.85088 16.5235 1.98296 16.4838L5.24771 15.4938C5.48259 15.4223 5.69634 15.2944 5.87021 15.121L15.8805 5.10929"
        stroke="#CFEFF1"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
    <defs>
      <clipPath id="edit-clip">
        <rect width="18" height="18" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

const DeleteIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <g clipPath="url(#delete-clip)">
      <path
        d="M12 15.75V14.25C12 12.5943 10.6557 11.25 9 11.25H4.5C2.84425 11.25 1.5 12.5943 1.5 14.25V15.75"
        stroke="#D93F3F"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3.75 5.25C3.75 6.90575 5.09425 8.25 6.75 8.25C8.40575 8.25 9.75 6.90575 9.75 5.25C9.75 3.59425 8.40575 2.25 6.75 2.25C5.09425 2.25 3.75 3.59425 3.75 5.25V5.25"
        stroke="#D93F3F"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12.75 6L16.5 9.75M16.5 6L12.75 9.75"
        stroke="#D93F3F"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
    <defs>
      <clipPath id="delete-clip">
        <rect width="18" height="18" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

const ITEMS_PER_PAGE = 6;
const TOTAL_USERS = 24;

export function UtilisateursTab() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [selectedRole, setSelectedRole] = useState("Tous les rôles");
  const [selectedDepartment, setSelectedDepartment] = useState("Tous les départements");
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [deptDropdownOpen, setDeptDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const filteredUsers = USERS.filter((u) => {
    const matchesSearch =
      search === "" ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = selectedRole === "Tous les rôles" || u.role === selectedRole;
    const matchesDept =
      selectedDepartment === "Tous les départements" || u.department === selectedDepartment;
    return matchesSearch && matchesRole && matchesDept;
  });

  const totalPages = 4;

  return (
    <div className="flex flex-col gap-5">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Search */}
        <div className="flex items-center gap-3 h-10 px-4 rounded-md border border-black/[0.08] bg-[#0B1418] w-full sm:w-80">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="flex-shrink-0">
            <path
              d="M15.75 15.7501L12.495 12.4951"
              stroke="#CFEFF1"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M2.25 8.25C2.25 11.5615 4.93851 14.25 8.25 14.25C11.5615 14.25 14.25 11.5615 14.25 8.25C14.25 4.93851 11.5615 2.25 8.25 2.25C4.93851 2.25 2.25 4.93851 2.25 8.25V8.25"
              stroke="#CFEFF1"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <input
            type="text"
            placeholder="Rechercher par nom ou email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm text-[#CFEFF1] placeholder:text-[#CFEFF1]/60 outline-none"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Role filter */}
          <div className="relative">
            <button
              onClick={() => {
                setRoleDropdownOpen(!roleDropdownOpen);
                setDeptDropdownOpen(false);
              }}
              className="flex items-center gap-2 h-10 px-4 rounded-md border border-black/[0.08] bg-[#08151A] text-sm font-medium text-[#E8F6F5] hover:bg-white/5 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="flex-shrink-0">
                <path
                  d="M13.3334 8.66664C13.3334 12 11.0001 13.6666 8.22675 14.6333C8.08152 14.6825 7.92377 14.6802 7.78008 14.6266C5.00008 13.6666 2.66675 12 2.66675 8.66664V3.99997C2.66675 3.63203 2.96547 3.33331 3.33341 3.33331C4.66675 3.33331 6.33341 2.53331 7.49341 1.51997C7.7852 1.27069 8.21497 1.27069 8.50675 1.51997C9.67341 2.53997 11.3334 3.33331 12.6667 3.33331C13.0347 3.33331 13.3334 3.63203 13.3334 3.99997V8.66664"
                  stroke="#CFEFF1"
                  strokeWidth="1.33333"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {selectedRole}
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M4 6L8 10L12 6"
                  stroke="#CFEFF1"
                  strokeWidth="1.33333"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            {roleDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-48 rounded-md border border-black/[0.08] bg-[#0B1A22] shadow-lg z-10">
                {ROLES.map((role) => (
                  <button
                    key={role}
                    onClick={() => {
                      setSelectedRole(role);
                      setRoleDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors hover:bg-white/5 ${selectedRole === role ? "text-[#007A3D] font-medium" : "text-[#E8F6F5]"
                      }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Department filter */}
          <div className="relative">
            <button
              onClick={() => {
                setDeptDropdownOpen(!deptDropdownOpen);
                setRoleDropdownOpen(false);
              }}
              className="flex items-center gap-2 h-10 px-4 rounded-md border border-black/[0.08] bg-[#08151A] text-sm font-medium text-[#E8F6F5] hover:bg-white/5 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="flex-shrink-0">
                <path
                  d="M7.99992 6.66667H8.00659M7.99992 9.33333H8.00659M7.99992 4H8.00659M10.6666 6.66667H10.6733M10.6666 9.33333H10.6733M10.6666 4H10.6733M5.33325 6.66667H5.33992M5.33325 9.33333H5.33992M5.33325 4H5.33992M5.99992 14.6667V12.6667C5.99992 12.2987 6.29864 12 6.66659 12H9.33325C9.7012 12 9.99992 12.2987 9.99992 12.6667V14.6667"
                  stroke="#CFEFF1"
                  strokeWidth="1.33333"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M4.00008 1.33301H12.0001C12.736 1.33301 13.3334 1.93045 13.3334 2.66634V13.333C13.3334 14.0689 12.736 14.6663 12.0001 14.6663H4.00008C3.26419 14.6663 2.66675 14.0689 2.66675 13.333V2.66634C2.66675 1.93045 3.26419 1.33301 4.00008 1.33301V1.33301"
                  stroke="#CFEFF1"
                  strokeWidth="1.33333"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {selectedDepartment}
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M4 6L8 10L12 6"
                  stroke="#CFEFF1"
                  strokeWidth="1.33333"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            {deptDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-56 rounded-md border border-black/[0.08] bg-[#0B1A22] shadow-lg z-10">
                {DEPARTMENTS.map((dept) => (
                  <button
                    key={dept}
                    onClick={() => {
                      setSelectedDepartment(dept);
                      setDeptDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors hover:bg-white/5 ${selectedDepartment === dept ? "text-[#007A3D] font-medium" : "text-[#E8F6F5]"
                      }`}
                  >
                    {dept}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add user button */}
      <div>
        <button
          onClick={() => navigate("/parametres/utilisateurs/ajouter")}
          className="flex items-center gap-2 h-11 px-5 rounded-md bg-[#007A3D] text-white text-sm font-semibold hover:bg-[#006633] transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path
              d="M12 15.75V14.25C12 12.5943 10.6557 11.25 9 11.25H4.5C2.84425 11.25 1.5 12.5943 1.5 14.25V15.75"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M3.75 5.25C3.75 6.90575 5.09425 8.25 6.75 8.25C8.40575 8.25 9.75 6.90575 9.75 5.25C9.75 3.59425 8.40575 2.25 6.75 2.25C5.09425 2.25 3.75 3.59425 3.75 5.25V5.25"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M14.25 6V10.5M16.5 8.25H12"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Ajouter un utilisateur
        </button>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-black/[0.08] bg-[#08151A] overflow-hidden">
        {/* Table header */}
        <div className="hidden md:grid grid-cols-[2fr_1.2fr_1.4fr_1fr_1.3fr_auto] bg-[#091519] border-b border-black/[0.08]">
          {["Utilisateur", "Rôle", "Département", "Statut", "Dernière connexion", "Actions"].map(
            (col, i) => (
              <div
                key={col}
                className={`px-6 py-4 text-[13px] font-medium text-[#CFEFF1] ${i === 5 ? "text-right pr-6" : ""}`}
              >
                {col}
              </div>
            )
          )}
        </div>

        {/* Table body */}
        <div>
          {filteredUsers.map((user, idx) => (
            <div
              key={user.id}
              className={`flex flex-col md:grid md:grid-cols-[2fr_1.2fr_1.4fr_1fr_1.3fr_auto] items-start md:items-center gap-3 md:gap-0 px-6 py-4 ${idx < filteredUsers.length - 1 ? "border-b border-black/[0.08]" : ""
                } hover:bg-white/[0.02] transition-colors`}
            >
              {/* User info */}
              <div className="flex items-center gap-4 w-full md:w-auto">
                <UserAvatar user={user} />
                <div className="flex flex-col gap-1 min-w-0">
                  <span className="text-sm font-semibold text-[#E8F6F5] leading-tight">
                    {user.name}
                  </span>
                  <span className="text-[13px] text-[#CFEFF1] leading-tight truncate">
                    {user.email}
                  </span>
                </div>
              </div>

              {/* Role */}
              <div className="md:px-0 md:py-0">
                <RoleBadge role={user.role} />
              </div>

              {/* Department */}
              <div className="text-sm text-[#E8F6F5] md:px-0">
                {user.department}
              </div>

              {/* Status */}
              <div>
                <StatusBadge status={user.status} />
              </div>

              {/* Last connection */}
              <div>
                <LastConnectionCell value={user.lastConnection} />
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 justify-end">
                <button
                  onClick={() => navigate(`/parametres/utilisateurs/${user.id}`)}
                  className="flex items-center justify-center w-8 h-8 rounded hover:bg-white/5 transition-colors"
                >
                  <EditIcon />
                </button>
                <button className="flex items-center justify-center w-8 h-8 rounded hover:bg-[#D93F3F]/10 transition-colors">
                  <DeleteIcon />
                </button>
              </div>
            </div>
          ))}

          {filteredUsers.length === 0 && (
            <div className="flex items-center justify-center py-16 text-[#CFEFF1] text-sm opacity-50">
              Aucun utilisateur trouvé
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 border-t border-black/[0.08] bg-[#08151A]">
          <span className="text-[13px] text-[#CFEFF1]">
            Affichage de 1 à {ITEMS_PER_PAGE} sur {TOTAL_USERS} utilisateurs
          </span>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="flex items-center justify-center h-8 px-3 rounded-md border border-black/[0.08] text-[13px] font-semibold text-[#E8F6F5] hover:bg-white/5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Précédent
            </button>
            <div className="flex items-center gap-1">
              {[1, 2, 3, "...", 4].map((page, i) => (
                <button
                  key={i}
                  onClick={() => typeof page === "number" && setCurrentPage(page)}
                  disabled={page === "..."}
                  className={`flex items-center justify-center w-8 h-8 rounded text-[13px] transition-colors ${currentPage === page
                      ? "bg-[#007A3D] text-white font-semibold"
                      : page === "..."
                        ? "text-[#CFEFF1] cursor-default"
                        : "text-[#CFEFF1] hover:bg-white/5 font-normal"
                    }`}
                >
                  {page}
                </button>
              ))}
            </div>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="flex items-center justify-center h-8 px-3 rounded-md border border-black/[0.08] text-[13px] font-semibold text-[#E8F6F5] hover:bg-white/5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Suivant
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
