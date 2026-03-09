import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { X, Bell, Check, Clock, AlertCircle, Info, LogOut, User, Settings } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface HeaderProps {
  breadcrumb?: string;
  breadcrumbItems?: BreadcrumbItem[];
  onMenuClick?: () => void;
}

import { useAuth } from "@/lib/auth-context";

export function Header({ breadcrumb = "Tableau de bord", breadcrumbItems, onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth();
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  useEffect(() => {
    if (isSearchVisible && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchVisible]);

  // Handle outside click to close search
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const searchContainer = document.getElementById("search-container");
      if (isSearchVisible && searchContainer && !searchContainer.contains(event.target as Node)) {
        setIsSearchVisible(false);
      }
    };

    if (isSearchVisible) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSearchVisible]);

  return (
    <header className="flex h-auto sm:h-[72px] items-center justify-between px-4 sm:px-6 lg:px-8 py-4 sm:py-0 border-b border-black/[0.08] bg-[#071018] shrink-0 gap-4">
      {/* Menu button for mobile */}
      <button
        id="menu-button"
        onClick={onMenuClick}
        className="lg:hidden flex w-10 h-10 items-center justify-center rounded-md hover:bg-white/5 transition-colors shrink-0"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M2.5 5H17.5M2.5 10H17.5M2.5 15H17.5" stroke="#C9E7E6" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 min-w-0 flex-wrap">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
          <path d="M10 14V8.66667C10 8.29872 9.70128 8 9.33333 8H6.66667C6.29872 8 6 8.29872 6 8.66667V14" stroke="#98A6A8" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M2 6.66666C1.99991 6.27408 2.17283 5.90141 2.47267 5.64799L7.13933 1.64799C7.63626 1.22801 8.36374 1.22801 8.86067 1.64799L13.5273 5.64799C13.8272 5.90141 14.0001 6.27408 14 6.66666V12.6667C14 13.4025 13.4026 14 12.6667 14H3.33333C2.59745 14 2 13.4025 2 12.6667V6.66666" stroke="#98A6A8" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {breadcrumbItems ? (
          breadcrumbItems.map((item, idx) => (
            <span key={idx} className="flex items-center gap-2">
              <span className="text-[#98A6A8] text-xs sm:text-sm font-medium">/</span>
              {idx === breadcrumbItems.length - 1 ? (
                <span className="text-[#E6F0F2] text-xs sm:text-sm font-medium truncate">{item.label}</span>
              ) : (
                <span className="text-[#98A6A8] text-xs sm:text-sm font-medium">{item.label}</span>
              )}
            </span>
          ))
        ) : (
          <>
            <span className="text-[#98A6A8] text-xs sm:text-sm font-medium">/</span>
            <span className="text-[#E6F0F2] text-xs sm:text-sm font-medium truncate">{breadcrumb}</span>
          </>
        )}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2 sm:gap-6 ml-auto">
        {/* Search - hidden on mobile */}
        <div id="search-container" className="flex items-center">
          {isSearchVisible ? (
            <div className="relative flex items-center animate-in fade-in slide-in-from-right-4 duration-300">
              <Input
                ref={searchInputRef}
                type="text"
                placeholder="Rechercher..."
                className="w-[200px] sm:w-[300px] h-10 bg-white/5 border-white/10 text-white placeholder:text-[#98A6A8] pr-10 focus:ring-emerald-500/20"
              />
              <button
                onClick={() => setIsSearchVisible(false)}
                className="absolute right-2 text-[#98A6A8] hover:text-white transition-colors"
                aria-label="Close search"
              >
                <X size={18} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsSearchVisible(true)}
              className="hidden sm:flex w-10 h-10 items-center justify-center rounded-md hover:bg-white/5 transition-colors"
              aria-label="Open search"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M17.5 17.5L13.8833 13.8834" stroke="#C9E7E6" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2.5 9.16667C2.5 12.8461 5.48723 15.8333 9.16667 15.8333C12.8461 15.8333 15.8333 12.8461 15.8333 9.16667C15.8333 5.31095 12.8461 2.5 9.16667 2.5C5.48723 2.5 2.5 5.48723 2.5 9.16667V9.16667" stroke="#C9E7E6" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
        </div>

        {/* Notifications */}
        <Popover>
          <PopoverTrigger asChild>
            <button className="relative flex w-10 h-10 items-center justify-center rounded-md hover:bg-white/5 transition-colors">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M8.55656 17.5C8.85429 18.0156 9.40448 18.3333 9.9999 18.3333C10.5953 18.3333 11.1455 18.0156 11.4432 17.5M2.71823 12.7717C2.4958 13.0155 2.43819 13.3676 2.57132 13.6695C2.70444 13.9715 3.00322 14.1664 3.33323 14.1667H16.6666C16.9965 14.1668 17.2955 13.9722 17.429 13.6704C17.5624 13.3687 17.5053 13.0166 17.2832 12.7725C16.1749 11.63 14.9999 10.4159 14.9999 6.66669C14.9999 3.90711 12.7595 1.66669 9.9999 1.66669C7.24032 1.66669 4.9999 3.90711 4.9999 6.66669C4.9999 10.4159 3.82406 11.63 2.71823 12.7717" stroke="#C9E7E6" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-[#D93F3F] border-2 border-[#071018]" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-[320px] sm:w-[380px] p-0 bg-[#0A1A27] border-white/10 shadow-2xl mr-4" align="end" sideOffset={8}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
              <h3 className="text-[#E6F0F2] font-semibold text-sm">Notifications</h3>
              <button className="text-[#4FB3AF] hover:text-[#7EDBD7] text-xs font-medium transition-colors">
                Tout marquer comme lu
              </button>
            </div>

            <ScrollArea className="h-[350px]">
              <div className="flex flex-col">
                {/* Notification Item 1 */}
                <div className="p-4 border-b border-white/5 hover:bg-white/[0.02] cursor-pointer transition-colors relative group">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-9 h-9 rounded-full bg-emerald-500/10 flex items-center justify-center">
                      <Check className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div className="flex flex-col gap-1 pr-4">
                      <p className="text-[#E6F0F2] text-sm leading-snug">
                        <span className="font-semibold text-white">Ordre de travail</span> terminé avec succès par Jean Dupont.
                      </p>
                      <span className="text-[#98A6A8] text-xs flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        Il y a 2 minutes
                      </span>
                    </div>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#D93F3F]" />
                  </div>
                </div>

                {/* Notification Item 2 */}
                <div className="p-4 border-b border-white/5 hover:bg-white/[0.02] cursor-pointer transition-colors group">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-9 h-9 rounded-full bg-amber-500/10 flex items-center justify-center">
                      <AlertCircle className="w-5 h-5 text-amber-500" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className="text-[#E6F0F2] text-sm leading-snug">
                        Alerte de maintenance détectée sur la <span className="font-semibold text-white">Pompe P-101</span>.
                      </p>
                      <span className="text-[#98A6A8] text-xs flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        Il y a 15 minutes
                      </span>
                    </div>
                  </div>
                </div>

                {/* Notification Item 3 */}
                <div className="p-4 border-b border-white/5 hover:bg-white/[0.02] cursor-pointer transition-colors group">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-9 h-9 rounded-full bg-blue-500/10 flex items-center justify-center">
                      <Info className="w-5 h-5 text-blue-500" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className="text-[#E6F0F2] text-sm leading-snug">
                        Mise à jour du système <span className="font-semibold text-white">v2.4.0</span> déployée.
                      </p>
                      <span className="text-[#98A6A8] text-xs flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        Il y a 1 heure
                      </span>
                    </div>
                  </div>
                </div>

                {/* Notification Item 4 */}
                <div className="p-4 border-b border-white/5 hover:bg-white/[0.02] cursor-pointer transition-colors group">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-9 h-9 rounded-full bg-indigo-500/10 flex items-center justify-center">
                      <Bell className="w-5 h-5 text-indigo-500" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className="text-[#E6F0F2] text-sm leading-snug">
                        Nouveau rapport hebdomadaire d'activité disponible.
                      </p>
                      <span className="text-[#98A6A8] text-xs flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        Il y a 3 heures
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>

            <div className="p-3 bg-white/[0.02] text-center">
              <button className="text-[#E6F0F2] hover:text-white text-xs font-semibold transition-colors">
                Voir toutes les notifications
              </button>
            </div>
          </PopoverContent>
        </Popover>

        {/* User - hidden on mobile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="hidden sm:flex items-center gap-3 pl-6 border-l border-white/10 cursor-pointer hover:opacity-80 transition-opacity">
              <div className="flex flex-col items-end">
                <span className="text-[#E6F0F2] text-sm font-semibold leading-tight">{user?.fullName || "Utilisateur"}</span>
                <span className="text-[#C9E7E6] text-xs font-normal leading-tight">Expert Maintenance</span>
              </div>
              <img
                src="https://api.builder.io/api/v1/image/assets/TEMP/16bc886799b3bbe8e6a643d7280a0b9514614061?width=72"
                alt="User avatar"
                className="w-10 h-10 rounded-full border-2 border-white/10 object-cover"
              />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 bg-[#0A1A27] border-white/10 text-[#E6F0F2] shadow-2xl" align="end" sideOffset={8}>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.fullName || "Utilisateur"}</p>
                <p className="text-xs leading-none text-[#98A6A8]">{user?.email || ""}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-white/5" />
            <DropdownMenuItem
              className="focus:bg-white/5 focus:text-white cursor-pointer py-2.5 gap-2"
              onClick={() => navigate("/parametres/profil")}
            >
              <User className="w-4 h-4 text-[#4FB3AF]" />
              <span>Mon Profil</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="focus:bg-white/5 focus:text-white cursor-pointer py-2.5 gap-2"
              onClick={() => navigate("/parametres")}
            >
              <Settings className="w-4 h-4 text-[#4FB3AF]" />
              <span>Paramètres</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/5" />
            <DropdownMenuItem
              className="focus:bg-red-500/10 focus:text-red-500 text-red-400 cursor-pointer py-2.5 gap-2"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4" />
              <span>Se déconnecter</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
