import { cn } from "@/lib/utils";

export type Priority = "haute" | "moyenne" | "basse";
export type Status = "todo" | "inprogress" | "done";

export interface OT {
  id: string;
  title: string;
  machine: string;
  priority: Priority;
  date: string;
  dateColor?: "red" | "default";
  assignee?: string;
  unassigned?: boolean;
  status: Status;
}

const PriorityBadge = ({ priority }: { priority: Priority }) => {
  const config = {
    haute: {
      bg: "bg-[rgba(217,63,63,0.15)]",
      text: "text-[#D93F3F]",
      label: "Haute",
      icon: (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2.5 6L6 2.5L9.5 6M6 9.5V2.5" stroke="#D93F3F" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
    moyenne: {
      bg: "bg-[rgba(242,169,0,0.15)]",
      text: "text-[#F2A900]",
      label: "Moyenne",
      icon: (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2.5 6H9.5M6 2.5L9.5 6L6 9.5" stroke="#F2A900" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
    basse: {
      bg: "bg-[rgba(0,146,74,0.15)]",
      text: "text-[#00924A]",
      label: "Basse",
      icon: (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M6 2.5V9.5M9.5 6L6 9.5L2.5 6" stroke="#00924A" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
  };

  const c = config[priority];
  return (
    <span className={cn("flex items-center gap-1 px-2 py-1 rounded", c.bg)}>
      {c.icon}
      <span className={cn("text-[11px] font-bold uppercase", c.text)}>{c.label}</span>
    </span>
  );
};

const DonePriorityBadge = ({ priority }: { priority: Priority }) => {
  const config = {
    haute: { bg: "bg-[rgba(217,63,63,0.15)]", text: "text-[#D93F3F]", label: "Haute" },
    moyenne: { bg: "bg-[rgba(242,169,0,0.15)]", text: "text-[#F2A900]", label: "Moyenne" },
    basse: { bg: "bg-[rgba(0,146,74,0.15)]", text: "text-[#00924A]", label: "Basse" },
  };

  const c = config[priority];
  return (
    <span className={cn("flex items-center gap-1 px-2 py-1 rounded", c.bg)}>
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M10 3L4.5 8.5L2 6" stroke="#00924A" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      <span className={cn("text-[11px] font-bold uppercase", c.text)}>{c.label}</span>
    </span>
  );
};

const MachineIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0">
    <g clipPath="url(#mc-clip)">
      <path d="M6.99996 11.6665V12.8332M6.99996 1.1665V2.33317M9.91663 11.6665V12.8332M9.91663 1.1665V2.33317M1.16663 6.99984H2.33329M1.16663 9.9165H2.33329M1.16663 4.08317H2.33329M11.6666 6.99984H12.8333M11.6666 9.9165H12.8333M11.6666 4.08317H12.8333M4.08329 11.6665V12.8332M4.08329 1.1665V2.33317" stroke="#98A6A8" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M3.50004 2.3335H10.5C11.1439 2.3335 11.6667 2.85626 11.6667 3.50016V10.5002C11.6667 11.1441 11.1439 11.6668 10.5 11.6668H3.50004C2.85614 11.6668 2.33337 11.1441 2.33337 10.5002V3.50016C2.33337 2.85626 2.85614 2.3335 3.50004 2.3335V2.3335" stroke="#98A6A8" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M5.24996 4.6665H8.74996C9.07191 4.6665 9.33329 4.92789 9.33329 5.24984V8.74984C9.33329 9.07179 9.07191 9.33317 8.74996 9.33317H5.24996C4.92801 9.33317 4.66663 9.07179 4.66663 8.74984V5.24984C4.66663 4.92789 4.92801 4.6665 5.24996 4.6665V4.6665" stroke="#98A6A8" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
    </g>
    <defs><clipPath id="mc-clip"><rect width="14" height="14" fill="white"/></clipPath></defs>
  </svg>
);

const CalendarIcon = ({ color = "default" }: { color?: "red" | "default" }) => {
  const stroke = color === "red" ? "#D93F3F" : "#C9E7E6";
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0">
      <path d="M4.66663 1.1665V3.49984M9.33329 1.1665V3.49984" stroke={stroke} strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M2.91667 2.3335H11.0833C11.7272 2.3335 12.25 2.85626 12.25 3.50016V11.6668C12.25 12.3107 11.7272 12.8335 11.0833 12.8335H2.91667C2.27277 12.8335 1.75 12.3107 1.75 11.6668V3.50016C1.75 2.85626 2.27277 2.3335 2.91667 2.3335V2.3335" stroke={stroke} strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M1.75 5.8335H12.25" stroke={stroke} strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
};

const DeadlineIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0">
    <path d="M9.33333 8.1665V9.44984L10.2667 10.0332M9.33333 1.1665V3.49984M12.25 4.37484V3.49984C12.25 2.85594 11.7272 2.33317 11.0833 2.33317H2.91667C2.27277 2.33317 1.75 2.85594 1.75 3.49984V11.6665C1.75 12.3104 2.27277 12.8332 2.91667 12.8332H4.95833M1.75 5.83317H4.66667M4.66667 1.1665V3.49984" stroke="#D93F3F" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M5.83337 9.3335C5.83337 11.2652 7.40167 12.8335 9.33337 12.8335C11.2651 12.8335 12.8334 11.2652 12.8334 9.3335C12.8334 7.40179 11.2651 5.8335 9.33337 5.8335C7.40167 5.8335 5.83337 7.40179 5.83337 9.3335V9.3335" stroke="#D93F3F" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const DoneCalendarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0">
    <path d="M4.66675 1.1665V3.49984M9.33341 1.1665V3.49984" stroke="#C9E7E6" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2.91667 2.3335H11.0833C11.7272 2.3335 12.25 2.85626 12.25 3.50016V11.6668C12.25 12.3107 11.7272 12.8335 11.0833 12.8335H2.91667C2.27277 12.8335 1.75 12.3107 1.75 11.6668V3.50016C1.75 2.85626 2.27277 2.3335 2.91667 2.3335V2.3335" stroke="#C9E7E6" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M1.75 5.8335H12.25M5.25 9.3335L6.41667 10.5002L8.75 8.16683" stroke="#C9E7E6" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const UnassignedIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <g clipPath="url(#ua-clip)">
      <path d="M9.33317 12.25V11.0833C9.33317 9.79553 8.28764 8.75 6.99984 8.75H3.49984C2.21204 8.75 1.1665 9.79553 1.1665 11.0833V12.25" stroke="#98A6A8" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M2.9165 4.08333C2.9165 5.37113 3.96204 6.41667 5.24984 6.41667C6.53764 6.41667 7.58317 5.37113 7.58317 4.08333C7.58317 2.79553 6.53764 1.75 5.24984 1.75C3.96204 1.75 2.9165 2.79553 2.9165 4.08333H2.9165" stroke="#98A6A8" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M11.0833 4.6665V8.1665M12.8333 6.4165H9.33325" stroke="#98A6A8" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
    </g>
    <defs><clipPath id="ua-clip"><rect width="14" height="14" fill="white"/></clipPath></defs>
  </svg>
);

const avatarMap: Record<string, string> = {
  karim: "https://api.builder.io/api/v1/image/assets/TEMP/510563aa3524920d6debf2fd879b98736baf9aac?width=44",
  sofia: "https://api.builder.io/api/v1/image/assets/TEMP/bcb96eaf8322d4a4cf3deaa70a8d0dfc2b1b195a?width=44",
};

interface KanbanCardProps {
  ot: OT;
}

export function KanbanCard({ ot }: KanbanCardProps) {
  const isDone = ot.status === "done";

  return (
    <div
      className={cn(
        "flex flex-col gap-3 p-4 rounded-md border border-black/[0.08] bg-[#0B1518] shadow-[0_4px_12px_rgba(0,0,0,0.2)] cursor-pointer hover:border-white/10 transition-colors",
        isDone && "opacity-70"
      )}
    >
      {/* Top row: ID + Priority */}
      <div className="flex items-center justify-between">
        <span className="font-mono text-[13px] font-medium text-[#C9E7E6]">{ot.id}</span>
        {isDone ? (
          <DonePriorityBadge priority={ot.priority} />
        ) : (
          <PriorityBadge priority={ot.priority} />
        )}
      </div>

      {/* Title */}
      <p
        className={cn(
          "text-[15px] font-semibold leading-[1.4]",
          isDone ? "text-[#98A6A8] line-through" : "text-[#E6F0F2]"
        )}
      >
        {ot.title}
      </p>

      {/* Machine */}
      <div className="flex items-center gap-1.5">
        <MachineIcon />
        <span className="text-[13px] text-[#98A6A8]">{ot.machine}</span>
      </div>

      {/* Footer: date + assignee */}
      <div className="flex items-center justify-between pt-3 border-t border-black/[0.08]">
        <div className="flex items-center gap-1.5">
          {isDone ? (
            <DoneCalendarIcon />
          ) : ot.dateColor === "red" ? (
            <DeadlineIcon />
          ) : (
            <CalendarIcon />
          )}
          <span
            className={cn(
              "text-[12px] font-medium",
              ot.dateColor === "red" && !isDone ? "text-[#D93F3F]" : "text-[#C9E7E6]"
            )}
          >
            {ot.date}
          </span>
        </div>

        {ot.unassigned ? (
          <div className="flex w-6 h-6 items-center justify-center rounded-full bg-[rgba(7,16,24,0.13)]">
            <UnassignedIcon />
          </div>
        ) : ot.assignee ? (
          <img
            src={avatarMap[ot.assignee] || avatarMap.karim}
            alt="Assignee"
            className="w-6 h-6 rounded-full border border-black/[0.08] object-cover bg-[#041018]"
          />
        ) : null}
      </div>
    </div>
  );
}
