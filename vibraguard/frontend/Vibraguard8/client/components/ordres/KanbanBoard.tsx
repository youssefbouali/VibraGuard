import { useState } from "react";
import { KanbanColumn } from "./KanbanColumn";
import { OT } from "./KanbanCard";

const ALL_TASKS: OT[] = [
  {
    id: "#OT-1024",
    title: "Rééquilibrage Rotorique",
    machine: "MTR-Broyeur-04",
    priority: "haute",
    date: "24 Oct, 14:00",
    dateColor: "red",
    assignee: "karim",
    status: "todo",
  },
  {
    id: "#OT-1031",
    title: "Graissage Paliers (Maintenance Préventive)",
    machine: "MTR-Conv-12",
    priority: "basse",
    date: "28 Oct, 09:00",
    unassigned: true,
    status: "todo",
  },
  {
    id: "#OT-1022",
    title: "Remplacement Roulement Bague Externe",
    machine: "MTR-Vent-A",
    priority: "moyenne",
    date: "Aujourd'hui, 16:30",
    assignee: "sofia",
    status: "inprogress",
  },
  {
    id: "#OT-1018",
    title: "Alignement de l'Arbre Moteur",
    machine: "MTR-Pompe-02",
    priority: "moyenne",
    date: "Demain, 10:00",
    assignee: "karim",
    status: "inprogress",
  },
  {
    id: "#OT-1002",
    title: "Inspection Thermographique",
    machine: "MTR-Broyeur-01",
    priority: "basse",
    date: "20 Oct, 11:30",
    assignee: "sofia",
    status: "done",
  },
];

export function KanbanBoard() {
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"kanban" | "tableau">("kanban");

  const filtered = ALL_TASKS.filter(
    (t) =>
      t.id.toLowerCase().includes(search.toLowerCase()) ||
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.machine.toLowerCase().includes(search.toLowerCase())
  );

  const todo = filtered.filter((t) => t.status === "todo");
  const inprogress = filtered.filter((t) => t.status === "inprogress");
  const done = filtered.filter((t) => t.status === "done");

  return (
    <div className="flex flex-col flex-1 min-h-0">
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

        {/* View toggle */}
        <div className="flex items-center gap-1 p-1 rounded-md border border-black/[0.08] bg-[#0D1316]">
          <button
            onClick={() => setView("kanban")}
            className={`flex items-center gap-2 px-4 py-2 rounded text-[13px] font-semibold transition-colors ${
              view === "kanban"
                ? "bg-[#0B1518] text-[#E6F0F2] shadow-[0_2px_8px_rgba(0,0,0,0.20)]"
                : "text-[#98A6A8] hover:text-white"
            }`}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3.33325 2V11.3333M7.99992 2V7.33333M12.6666 2V14" stroke="currentColor" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Kanban
          </button>
          <button
            onClick={() => setView("tableau")}
            className={`flex items-center gap-2 px-4 py-2 rounded text-[13px] font-semibold transition-colors ${
              view === "tableau"
                ? "bg-[#0B1518] text-[#E6F0F2] shadow-[0_2px_8px_rgba(0,0,0,0.20)]"
                : "text-[#98A6A8] hover:text-white"
            }`}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 3.3335H2.00667M2 8.00016H2.00667M2 12.6668H2.00667M5.33333 3.3335H14M5.33333 8.00016H14M5.33333 12.6668H14" stroke="currentColor" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Tableau
          </button>
        </div>
      </div>

      {/* Board */}
      {view === "kanban" ? (
        <div className="flex gap-6 px-10 pb-10 flex-1 min-h-0 overflow-x-auto overflow-y-hidden">
          <KanbanColumn title="À faire" status="todo" tasks={todo} />
          <KanbanColumn title="En cours" status="inprogress" tasks={inprogress} />
          <KanbanColumn title="Terminé" status="done" tasks={done} />
        </div>
      ) : (
        <div className="px-10 pb-10 flex-1 overflow-auto">
          <div className="rounded-lg border border-black/[0.08] bg-[rgba(11,21,24,0.40)] overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/[0.08] bg-[rgba(11,21,24,0.80)]">
                  <th className="text-left px-4 py-3 text-[#98A6A8] font-semibold text-[13px]">ID</th>
                  <th className="text-left px-4 py-3 text-[#98A6A8] font-semibold text-[13px]">Titre</th>
                  <th className="text-left px-4 py-3 text-[#98A6A8] font-semibold text-[13px]">Machine</th>
                  <th className="text-left px-4 py-3 text-[#98A6A8] font-semibold text-[13px]">Priorité</th>
                  <th className="text-left px-4 py-3 text-[#98A6A8] font-semibold text-[13px]">Statut</th>
                  <th className="text-left px-4 py-3 text-[#98A6A8] font-semibold text-[13px]">Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => (
                  <tr key={t.id} className="border-b border-black/[0.08] hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3 font-mono text-[13px] text-[#C9E7E6]">{t.id}</td>
                    <td className="px-4 py-3 text-[#E6F0F2] font-medium">{t.title}</td>
                    <td className="px-4 py-3 text-[#98A6A8]">{t.machine}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase ${
                        t.priority === "haute"
                          ? "bg-[rgba(217,63,63,0.15)] text-[#D93F3F]"
                          : t.priority === "moyenne"
                          ? "bg-[rgba(242,169,0,0.15)] text-[#F2A900]"
                          : "bg-[rgba(0,146,74,0.15)] text-[#00924A]"
                      }`}>
                        {t.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 text-[12px] font-medium ${
                        t.status === "todo"
                          ? "text-[#98A6A8]"
                          : t.status === "inprogress"
                          ? "text-[#0C6CF2]"
                          : "text-[#00924A]"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          t.status === "todo" ? "bg-[#98A6A8]" : t.status === "inprogress" ? "bg-[#0C6CF2]" : "bg-[#00924A]"
                        }`} />
                        {t.status === "todo" ? "À faire" : t.status === "inprogress" ? "En cours" : "Terminé"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#C9E7E6] text-[12px]">{t.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
