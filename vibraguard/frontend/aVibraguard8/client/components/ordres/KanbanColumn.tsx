import { KanbanCard, OT } from "./KanbanCard";

type ColumnStatus = "todo" | "inprogress" | "done";

interface KanbanColumnProps {
  title: string;
  status: ColumnStatus;
  tasks: OT[];
}

const dotColor: Record<ColumnStatus, string> = {
  todo: "bg-[#98A6A8]",
  inprogress: "bg-[#0C6CF2]",
  done: "bg-[#00924A]",
};

export function KanbanColumn({ title, status, tasks }: KanbanColumnProps) {
  return (
    <div className="flex flex-col flex-1 min-w-[280px] max-w-[400px] rounded-lg border border-black/[0.08] bg-[rgba(11,21,24,0.40)] overflow-hidden">
      {/* Column header */}
      <div className="flex items-center justify-between px-5 py-5 border-b border-black/[0.08] bg-[rgba(11,21,24,0.80)] shrink-0">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${dotColor[status]}`} />
          <span className="text-[15px] font-semibold text-[#E6F0F2]">{title}</span>
        </div>
        <span className="px-2 py-0.5 rounded-xl bg-[rgba(7,16,24,0.13)] text-[12px] font-bold text-[#C9E7E6]">
          {tasks.length}
        </span>
      </div>

      {/* Tasks */}
      <div className="flex flex-col gap-4 p-5 overflow-y-auto flex-1">
        {tasks.map((ot) => (
          <KanbanCard key={ot.id} ot={ot} />
        ))}
      </div>
    </div>
  );
}
