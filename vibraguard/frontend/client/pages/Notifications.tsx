import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { cn } from "@/lib/utils";
import { useAlerts } from "@/hooks/use-alerts";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { 
  Bell, 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  Clock, 
  Search, 
  Filter,
  CheckCheck,
  ChevronRight,
  Trash2
} from "lucide-react";
import { toast } from "sonner";

type NotificationLevel = "Critique" | "Alerte" | "Attention" | "Tous";

export default function Notifications() {
  const { data: alerts = [], isLoading, refetch } = useAlerts() as any;
  const { user } = useAuth();
  const [filter, setFilter] = useState<NotificationLevel>("Tous");
  const [search, setSearch] = useState("");

  const handleMarkAllRead = async () => {
    try {
      await api.markAllAlertsAsRead();
      toast.success("Toutes les notifications ont été marquées comme lues");
      refetch();
    } catch (err) {
      toast.error("Erreur lors de l'opération");
    }
  };

  const handleMarkAsRead = async (id: string, currentStatus: string) => {
    if (currentStatus === "Read") return;
    try {
      await api.markAlertAsRead(id);
      refetch();
    } catch (err) {
      console.error(err);
    }
  };

  const getIcon = (level: string) => {
    switch (level) {
      case "Critique":
        return <AlertTriangle className="w-5 h-5 text-[#EF4444]" />;
      case "Alerte":
        return <AlertTriangle className="w-5 h-5 text-[#F59E0B]" />;
      case "Attention":
        return <Info className="w-5 h-5 text-[#0EA5E9]" />;
      default:
        return <Bell className="w-5 h-5 text-[#94A3B8]" />;
    }
  };

  const filteredAlerts = alerts.filter((a: any) => {
    const matchesFilter = filter === "Tous" || a.level === filter;
    const matchesSearch = a.message.toLowerCase().includes(search.toLowerCase());
    const matchesUser = !a.recipientEmail || a.recipientEmail === user?.email;
    return matchesFilter && matchesSearch && matchesUser;
  });

  return (
    <DashboardLayout breadcrumb="Notifications">
      <div className="flex flex-col gap-6 max-w-full lg:max-w-[1200px] mx-auto">
        
        {/* Header section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Centre de Notifications</h1>
            <p className="text-[#94A3B8] text-sm">Gérez et consultez toutes les alertes système et maintenance.</p>
          </div>
          <button 
            onClick={handleMarkAllRead}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-sm font-medium text-white"
          >
            <CheckCheck className="w-4 h-4 text-[#10B981]" />
            Tout marquer comme lu
          </button>
        </div>

        {/* Filters and search */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 items-center p-4 rounded-xl border border-white/5 bg-[#0A1118]/50 backdrop-blur-sm">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
            <input 
              type="text"
              placeholder="Rechercher une notification..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-11 pl-10 pr-4 rounded-lg bg-[#071018] border border-white/5 text-sm text-white placeholder:text-[#64748B] outline-none focus:border-[#4FB3AF]/50 transition-colors"
            />
          </div>
          
          <div className="flex items-center gap-2 bg-[#071018] p-1 rounded-lg border border-white/5">
            {(["Tous", "Critique", "Alerte", "Attention"] as NotificationLevel[]).map((lvl) => (
              <button
                key={lvl}
                onClick={() => setFilter(lvl)}
                className={cn(
                  "px-4 py-1.5 rounded-md text-xs font-semibold transition-all",
                  filter === lvl 
                    ? "bg-[#10B981]/10 text-[#10B981] shadow-sm" 
                    : "text-[#64748B] hover:text-[#94A3B8]"
                )}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex flex-col gap-3">
          {isLoading ? (
            <div className="py-20 text-center animate-pulse text-[#94A3B8]">
              Chargement des notifications...
            </div>
          ) : filteredAlerts.length === 0 ? (
            <div className="py-20 text-center rounded-2xl border border-dashed border-white/10 bg-white/[0.02]">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                <Bell className="w-8 h-8 text-[#64748B]" />
              </div>
              <h3 className="text-white font-semibold mb-1">Aucune notification trouvée</h3>
              <p className="text-[#64748B] text-sm">Essayez de modifier vos filtres ou votre recherche.</p>
            </div>
          ) : (
            filteredAlerts.map((alert: any) => (
              <div 
                key={alert.id}
                onClick={() => handleMarkAsRead(alert.id, alert.status)}
                className={cn(
                  "group relative flex items-start gap-4 p-5 rounded-xl border transition-all cursor-pointer",
                  alert.status !== "Read" 
                    ? "bg-[#111A24] border-[#10B981]/20 shadow-[0_4px_20px_-4px_rgba(16,185,129,0.1)]" 
                    : "bg-[#0A1118] border-white/5 hover:border-white/10"
                )}
              >
                {/* Status indicator */}
                {alert.status !== "Read" && (
                  <div className="absolute left-[-2px] top-6 bottom-6 w-1 bg-[#10B981] rounded-full" />
                )}

                <div className={cn(
                  "flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center border",
                  alert.level === "Critique" ? "bg-red-500/10 border-red-500/20" :
                  alert.level === "Alerte" ? "bg-amber-500/10 border-amber-500/20" :
                  "bg-blue-500/10 border-blue-500/20"
                )}>
                  {getIcon(alert.level)}
                </div>

                <div className="flex-1 min-w-0 pr-8">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={cn(
                      "text-xs font-bold uppercase tracking-wider",
                      alert.level === "Critique" ? "text-[#EF4444]" :
                      alert.level === "Alerte" ? "text-[#F59E0B]" :
                      "text-[#0EA5E9]"
                    )}>
                      {alert.level}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-[#64748B]" />
                    <span className="text-[#64748B] text-xs font-mono">{alert.id}</span>
                  </div>
                  <p className={cn(
                    "text-[15px] leading-relaxed mb-2",
                    alert.status !== "Read" ? "text-white font-medium" : "text-[#E2E8F0]"
                  )}>
                    {alert.message}
                  </p>
                  <div className="flex items-center gap-4 text-[#64748B] text-xs">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {alert.time}
                    </span>
                    {alert.motorId && (
                      <span className="flex items-center gap-1.5">
                        <ChevronRight className="w-3.5 h-3.5" />
                        Moteur: <span className="text-[#0EA5E9] font-medium">{alert.motorId}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Mark as read tick */}
                {alert.status !== "Read" && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMarkAsRead(alert.id, alert.status);
                    }}
                    className="absolute right-6 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-white/5 opacity-0 group-hover:opacity-100 transition-all hover:bg-[#10B981]/10 text-[#64748B] hover:text-[#10B981]"
                    title="Marquer comme lu"
                  >
                    <CheckCircle className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
