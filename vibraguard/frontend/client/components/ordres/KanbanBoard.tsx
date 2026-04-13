import { useState, useEffect } from "react";
import { KanbanColumn } from "./KanbanColumn";
import { OT } from "./KanbanCard";
import { api } from "@/lib/api";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";


import { useWorkOrders } from "@/hooks/use-work-orders";

// ... (KanbanColumn and OT imports remain)

export function KanbanBoard() {
  const { data: apiWorkOrders, isLoading, refetch } = useWorkOrders();
  const [search, setSearch] = useState("");
  const [selectedOT, setSelectedOT] = useState<OT | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState<string>("");

  // Map backend work orders to frontend OT interface
  const mappedTasks: OT[] = (apiWorkOrders || []).map(wo => ({
    id: wo.id,
    title: wo.title,
    machine: wo.asset,
    priority: wo.priority.toLowerCase() === "critique" || wo.priority.toLowerCase() === "haute" 
      ? "haute" 
      : wo.priority.toLowerCase() === "basse" 
        ? "basse" 
        : "moyenne",
    date: wo.dueDate,
    assignee: wo.assignedTo?.name || wo.assignedTo || "Non assigné",
    status: wo.status === "Nouveau" ? "todo" : wo.status === "En cours" ? "inprogress" : "done",
    type: wo.type,
    cost: wo.cost,
    duration: wo.duration,
    parts: wo.parts ? wo.parts.split(",").map((p: string) => p.trim()) : [],
  }));

  const { user } = useAuth();
  const currentRole = user?.role?.toLowerCase() || "";
  const isTechnician = currentRole.includes("technicien") || currentRole.includes("technician");
  const currentUserName = user?.fullName?.toLowerCase() || "";

  const visibleTasks = isTechnician
    ? mappedTasks.filter((task) => task.assignee.toLowerCase().includes(currentUserName))
    : mappedTasks;

  const filtered = visibleTasks.filter(
    (t) =>
      t.id.toLowerCase().includes(search.toLowerCase()) ||
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.machine.toLowerCase().includes(search.toLowerCase())
  );

  const todo = filtered.filter((t) => t.status === "todo");
  const inprogress = filtered.filter((t) => t.status === "inprogress");
  const done = filtered.filter((t) => t.status === "done");

  const handleDrop = async (taskId: string, newColStatus: string) => {
    try {
      const statusMap: Record<string, string> = {
        todo: "Nouveau",
        inprogress: "En cours",
        done: "Terminé"
      };
      
      const newBackendStatus = statusMap[newColStatus];
      const originalWO = apiWorkOrders.find((wo: any) => wo.id === taskId);
      
      if (originalWO && originalWO.status !== newBackendStatus) {
        await toast.promise(
          api.updateWorkOrder(taskId, {
            ...originalWO,
            status: newBackendStatus
          }),
          {
            loading: 'Mise à jour du statut...',
            success: () => {
              refetch();
              return 'Statut mis à jour !';
            },
            error: 'Erreur lors de la mise à jour',
          }
        );
      }
    } catch (err) {
      console.error("Drop error:", err);
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {isLoading && <div className="text-white px-10 py-4">Chargement des ordres de travail...</div>}
      {/* Toolbar */}
      <div className="flex items-center justify-between px-10 py-6 shrink-0">
        {/* Search */}
        <div className="flex items-center gap-3 w-[280px] h-11 px-4 rounded-md border border-black/[0.08] bg-[#0D1316]">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="shrink-0">
            <path d="M15.75 15.75L12.495 12.495" stroke="#98A6A8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2.25 8.25C2.25 11.5615 4.93851 14.25 8.25 14.25C11.5615 14.25 14.25 11.5615 14.25 8.25C14.25 4.93851 11.5615 2.25 8.25 2.25C4.93851 2.25 2.25 4.93851 2.25 8.25V8.25" stroke="#98A6A8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un OT, Moteur..."
            className="flex-1 bg-transparent text-[14px] text-[#98A6A8] placeholder:text-[#98A6A8] outline-none"
          />
        </div>
      </div>

      <div className="flex gap-6 px-10 pb-10 flex-1 min-h-0 overflow-x-auto overflow-y-hidden">
        <KanbanColumn 
          title="À faire" 
          status="todo" 
          tasks={todo} 
          onDrop={handleDrop}
          onCardClick={(ot) => {
            setSelectedOT(ot);
            setNewStatus(ot.status === "todo" ? "Nouveau" : ot.status === "inprogress" ? "En cours" : "Terminé");
            setIsDialogOpen(true);
          }}
        />
        <KanbanColumn 
          title="En cours" 
          status="inprogress" 
          tasks={inprogress} 
          onDrop={handleDrop}
          onCardClick={(ot) => {
            setSelectedOT(ot);
            setNewStatus(ot.status === "todo" ? "Nouveau" : ot.status === "inprogress" ? "En cours" : "Terminé");
            setIsDialogOpen(true);
          }}
        />
        <KanbanColumn 
          title="Terminé" 
          status="done" 
          tasks={done} 
          onDrop={handleDrop}
          onCardClick={(ot) => {
            setSelectedOT(ot);
            setNewStatus(ot.status === "todo" ? "Nouveau" : ot.status === "inprogress" ? "En cours" : "Terminé");
            setIsDialogOpen(true);
          }}
        />
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-[#0A1114] border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-[#E6F0F2]">
              Mettre à jour l'Ordre de Travail
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-6 flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-[#98A6A8] text-xs font-semibold uppercase tracking-wider">ID de l'OT</label>
              <div className="text-[#0C6CF2] font-mono font-bold text-lg">{selectedOT?.id}</div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[#98A6A8] text-xs font-semibold uppercase tracking-wider">Titre</label>
              <div className="text-[#E6F0F2] font-medium">{selectedOT?.title}</div>
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-[#98A6A8] text-xs font-semibold uppercase tracking-wider">Statut de l'intervention</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "À faire", value: "Nouveau", color: "bg-[#98A6A8]" },
                  { label: "En cours", value: "En cours", color: "bg-[#0C6CF2]" },
                  { label: "Terminé", value: "Terminé", color: "bg-[#00924A]" }
                ].map((s) => (
                  <button
                    key={s.value}
                    onClick={() => setNewStatus(s.value)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-md border transition-all ${
                      newStatus === s.value 
                        ? "border-[#007A3D] bg-[#007A3D]/10" 
                        : "border-white/5 bg-white/5 hover:bg-white/10"
                    }`}
                  >
                    <div className={`w-2 h-2 rounded-full ${s.color}`} />
                    <span className="text-[12px] font-medium">{s.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="gap-3 sm:gap-0">
            <button
              onClick={() => setIsDialogOpen(false)}
              className="px-4 py-2 rounded-md border border-white/10 text-sm font-medium hover:bg-white/5 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={async () => {
                if (!selectedOT) return;
                setIsUpdating(true);
                try {
                  const originalWO = apiWorkOrders.find((wo: any) => wo.id === selectedOT.id);
                  await api.updateWorkOrder(selectedOT.id, {
                    ...originalWO,
                    status: newStatus
                  });
                  toast.success("Statut mis à jour avec succès");
                  refetch();
                  setIsDialogOpen(true); // Keep it open for user to see or close? User said pop up update.
                  setIsDialogOpen(false);
                } catch (err) {
                  toast.error("Erreur lors de la mise à jour");
                } finally {
                  setIsUpdating(false);
                }
              }}
              disabled={isUpdating}
              className="px-4 py-2 rounded-md bg-[#007A3D] hover:bg-[#006a34] text-white text-sm font-semibold transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isUpdating && <Loader2 className="w-4 h-4 animate-spin" />}
              Mettre à jour
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
