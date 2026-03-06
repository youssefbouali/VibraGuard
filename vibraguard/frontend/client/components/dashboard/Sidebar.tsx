import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const navItems = [
  {
    label: "Tableau de bord",
    href: "/dashboard",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M3.33333 2.5H7.5C7.96024 2.5 8.33333 2.8731 8.33333 3.33333V9.16667C8.33333 9.6269 7.96024 10 7.5 10H3.33333C2.8731 10 2.5 9.6269 2.5 9.16667V3.33333C2.5 2.8731 2.8731 2.5 3.33333 2.5V2.5" stroke="currentColor" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12.5 2.5H16.6666C17.1269 2.5 17.5 2.8731 17.5 3.33333V5.83333C17.5 6.29357 17.1269 6.66667 16.6666 6.66667H12.5C12.0397 6.66667 11.6666 6.29357 11.6666 5.83333V3.33333C11.6666 2.8731 12.0397 2.5 12.5 2.5V2.5" stroke="currentColor" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12.5 10H16.6666C17.1269 10 17.5 10.3731 17.5 10.8333V16.6667C17.5 17.1269 17.1269 17.5 16.6666 17.5H12.5C12.0397 17.5 11.6666 17.1269 11.6666 16.6667V10.8333C11.6666 10.3731 12.0397 10 12.5 10V10" stroke="currentColor" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M3.33333 13.3333H7.5C7.96024 13.3333 8.33333 13.7064 8.33333 14.1666V16.6666C8.33333 17.1269 7.96024 17.5 7.5 17.5H3.33333C2.8731 17.5 2.5 17.1269 2.5 16.6666V14.1666C2.5 13.7064 2.8731 13.3333 3.33333 13.3333V13.3333" stroke="currentColor" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: "Moteurs",
    href: "/moteurs",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <g clipPath="url(#moteurs-clip)">
          <path d="M9.99996 16.6667V18.3334M9.99996 1.66669V3.33335M14.1666 16.6667V18.3334M14.1666 1.66669V3.33335M1.66663 10H3.33329M1.66663 14.1667H3.33329M1.66663 5.83335H3.33329M16.6666 10H18.3333M16.6666 14.1667H18.3333M16.6666 5.83335H18.3333M5.83329 16.6667V18.3334M5.83329 1.66669V3.33335" stroke="currentColor" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4.99992 3.33331H14.9999C15.9204 3.33331 16.6666 4.07951 16.6666 4.99998V15C16.6666 15.9205 15.9204 16.6666 14.9999 16.6666H4.99992C4.07944 16.6666 3.33325 15.9205 3.33325 15V4.99998C3.33325 4.07951 4.07944 3.33331 4.99992 3.33331V3.33331" stroke="currentColor" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M7.49996 6.66669H12.5C12.9602 6.66669 13.3333 7.03978 13.3333 7.50002V12.5C13.3333 12.9603 12.9602 13.3334 12.5 13.3334H7.49996C7.03972 13.3334 6.66663 12.9603 6.66663 12.5V7.50002C6.66663 7.03978 7.03972 6.66669 7.49996 6.66669V6.66669" stroke="currentColor" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
        </g>
        <defs><clipPath id="moteurs-clip"><rect width="20" height="20" fill="white" /></clipPath></defs>
      </svg>
    ),
  },
  {
    label: "Alertes",
    href: "/alertes",
    badge: 3,
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M18.1083 15L11.4416 3.33332C11.1457 2.81113 10.5918 2.4884 9.99161 2.4884C9.3914 2.4884 8.83754 2.81113 8.54161 3.33332L1.87494 15C1.57585 15.518 1.57726 16.1565 1.87865 16.6732C2.18003 17.1898 2.73516 17.5054 3.33327 17.5H16.6666C17.2617 17.4994 17.8114 17.1815 18.1087 16.6659C18.406 16.1504 18.4058 15.5154 18.1083 15M9.99994 7.49998V10.8333M9.99994 14.1666H10.0083" stroke="currentColor" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: "Ordres de Travail",
    href: "/ordres-de-travail",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M7.50008 1.66669H12.5001C12.9603 1.66669 13.3334 2.03978 13.3334 2.50002V4.16669C13.3334 4.62692 12.9603 5.00002 12.5001 5.00002H7.50008C7.03984 5.00002 6.66675 4.62692 6.66675 4.16669V2.50002C6.66675 2.03978 7.03984 1.66669 7.50008 1.66669V1.66669" stroke="currentColor" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M13.3334 3.33331H15C15.9205 3.33331 16.6667 4.07951 16.6667 4.99998V16.6666C16.6667 17.5871 15.9205 18.3333 15 18.3333H5.00004C4.07957 18.3333 3.33337 17.5871 3.33337 16.6666V4.99998C3.33337 4.07951 4.07957 3.33331 5.00004 3.33331H6.66671M10 9.16665H13.3334M10 13.3333H13.3334M6.66671 9.16665H6.67504M6.66671 13.3333H6.67504" stroke="currentColor" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: "Rapports BI",
    href: "/rapports-bi",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M4.16663 17.5V12.5M9.99996 17.5V2.5M15.8333 17.5V7.5" stroke="currentColor" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: "Audit Blockchain",
    href: "/audit",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M16.6667 10.8333C16.6667 15 13.75 17.0833 10.2834 18.2917C10.1018 18.3532 9.90465 18.3502 9.72504 18.2833C6.25004 17.0833 3.33337 15 3.33337 10.8333V5C3.33337 4.53976 3.70647 4.16666 4.16671 4.16666C5.83337 4.16666 7.91671 3.16666 9.36671 1.9C9.73144 1.58839 10.2686 1.58839 10.6334 1.9C12.0917 3.175 14.1667 4.16666 15.8334 4.16666C16.2936 4.16666 16.6667 4.53976 16.6667 5V10.8333" stroke="currentColor" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M7.5 10L9.16667 11.6667L12.5 8.33334" stroke="currentColor" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: "Paramètres",
    href: "/parametres",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M8.05923 3.44666C8.15437 2.4457 8.995 1.68118 10.0005 1.68118C11.006 1.68118 11.8466 2.4457 11.9417 3.44666C11.9977 4.07994 12.3589 4.64617 12.9096 4.96389C13.4603 5.28162 14.1313 5.31095 14.7076 5.04249C15.6211 4.62774 16.7003 4.97386 17.2022 5.84258C17.704 6.71131 17.4648 7.81909 16.6492 8.40333C16.129 8.76837 15.8193 9.36404 15.8193 9.99958C15.8193 10.6351 16.129 11.2308 16.6492 11.5958C17.4648 12.1801 17.704 13.2878 17.2022 14.1566C16.7003 15.0253 15.6211 15.3714 14.7076 14.9567C14.1313 14.6882 13.4603 14.7175 12.9096 15.0353C12.3589 15.353 11.9977 15.9192 11.9417 16.5525C11.8466 17.5535 11.006 18.318 10.0005 18.318C8.995 18.318 8.15437 17.5535 8.05923 16.5525C8.00332 15.919 7.64199 15.3525 7.09109 15.0348C6.54018 14.717 5.86893 14.6878 5.29256 14.9567C4.37902 15.3714 3.29985 15.0253 2.79796 14.1566C2.29607 13.2878 2.53527 12.1801 3.35089 11.5958C3.87114 11.2308 4.18085 10.6351 4.18085 9.99958C4.18085 9.36404 3.87114 8.76837 3.35089 8.40333C2.53646 7.81883 2.29789 6.71204 2.79921 5.84392C3.30054 4.97581 4.3784 4.62924 5.29173 5.04249C5.86802 5.31095 6.539 5.28162 7.08967 4.96389C7.64034 4.64617 8.00155 4.07994 8.05756 3.44666" stroke="currentColor" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M7.5 10C7.5 11.3798 8.62021 12.5 10 12.5C11.3798 12.5 12.5 11.3798 12.5 10C12.5 8.62021 11.3798 7.5 10 7.5C8.62021 7.5 7.5 8.62021 7.5 10V10" stroke="currentColor" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

interface SidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function Sidebar({ isCollapsed = false, onToggleCollapse }: SidebarProps) {
  const location = useLocation();

  return (
    <aside
      className={cn(
        "flex flex-col h-screen shrink-0 border-r border-white/[0.08] bg-[rgba(10,17,24,0.95)] transition-all duration-300 ease-in-out",
        isCollapsed ? "w-[80px]" : "w-[260px]"
      )}
    >
      {/* Logo */}
      <Link
        to="/dashboard"
        className={cn(
          "flex h-20 items-center border-b border-white/[0.05] transition-all duration-300 hover:bg-white/5",
          isCollapsed ? "justify-center px-0" : "gap-3 px-6"
        )}
      >
        <div className="flex w-8 h-8 items-center justify-center rounded-lg border border-emerald-500/20 bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 shrink-0">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M18.3333 10H16.2666C15.5181 9.99842 14.8604 10.496 14.6583 11.2167L12.7 18.1834C12.674 18.2722 12.5926 18.3334 12.5 18.3334C12.4074 18.3334 12.3259 18.2722 12.3 18.1834L7.69996 1.81669C7.67403 1.7278 7.59255 1.66669 7.49996 1.66669C7.40737 1.66669 7.32589 1.7278 7.29996 1.81669L5.34163 8.78335C5.14037 9.50107 4.48702 9.99789 3.74163 10H1.66663" stroke="#10B981" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        {!isCollapsed && (
          <span className="text-[18px] font-bold tracking-tight whitespace-nowrap overflow-hidden">
            <span className="text-white">OCP </span>
            <span className="text-emerald-400">VibraGuard</span>
          </span>
        )}
      </Link>

      {/* Nav */}
      <nav className="flex-1 flex flex-col gap-2 p-4 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? location.pathname === item.href
              : location.pathname === item.href || location.pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center rounded-md text-sm font-medium transition-all duration-200 group relative",
                isCollapsed ? "justify-center p-3" : "gap-3 px-4 py-3",
                isActive
                  ? "bg-[#063B2A] border-l-[3px] border-[#DFF7EE] text-[#DFF7EE]"
                  : "text-[#98A6A8] hover:text-white hover:bg-white/5",
                isCollapsed && isActive && "border-l-0 bg-[#063B2A]"
              )}
            >
              <span className={cn(
                "shrink-0 transition-colors",
                isActive ? "text-[#DFF7EE]" : "text-[#98A6A8] group-hover:text-white"
              )}>
                {item.icon}
              </span>

              {!isCollapsed && (
                <span className="flex-1 whitespace-nowrap overflow-hidden">{item.label}</span>
              )}

              {!isCollapsed && item.badge && (
                <span className="flex items-center justify-center px-[6px] py-[2px] rounded-[10px] bg-[#D93F3F] text-white text-[10px] font-bold min-w-[18px]">
                  {item.badge}
                </span>
              )}

              {/* Tooltip for collapsed state */}
              {isCollapsed && (
                <div className="fixed left-[90px] px-2 py-1 bg-[#0D1316] border border-white/10 rounded text-xs text-white opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">
                  {item.label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Collapse Toggle Button */}
      <div className="p-4 border-t border-white/[0.05]">
        <button
          onClick={onToggleCollapse}
          className={cn(
            "flex items-center w-full rounded-md text-[#98A6A8] hover:text-white hover:bg-white/5 transition-all duration-200",
            isCollapsed ? "justify-center p-3" : "gap-3 px-4 py-3"
          )}
        >
          <div className={cn("transition-transform duration-300", isCollapsed ? "rotate-180" : "")}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 17l-5-5 5-5M18 17l-5-5 5-5" />
            </svg>
          </div>
          {!isCollapsed && <span className="text-sm font-medium">Réduire le menu</span>}
        </button>
      </div>
    </aside>
  );
}

