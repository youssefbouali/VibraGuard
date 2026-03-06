import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

interface Transaction {
  hash: string;
  bloc: string;
  moteur: string;
  intervention: string;
  date: string;
  user: { name: string; avatar: string };
}

// Data is now fetched via useQuery

const CopyIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <g clipPath="url(#copy-clip)">
      <path d="M5.83329 4.66602H11.6666C12.3105 4.66602 12.8333 5.18878 12.8333 5.83268V11.666C12.8333 12.3099 12.3105 12.8327 11.6666 12.8327H5.83329C5.18939 12.8327 4.66663 12.3099 4.66663 11.666V5.83268C4.66663 5.18878 5.18939 4.66602 5.83329 4.66602V4.66602" stroke="#0C6CF2" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2.33329 9.33268C1.69163 9.33268 1.16663 8.80768 1.16663 8.16602V2.33268C1.16663 1.69102 1.69163 1.16602 2.33329 1.16602H8.16663C8.80829 1.16602 9.33329 1.69102 9.33329 2.33268" stroke="#0C6CF2" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round" />
    </g>
    <defs><clipPath id="copy-clip"><rect width="14" height="14" fill="white" /></clipPath></defs>
  </svg>
);

const BlockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M14 5.33262C13.9995 4.85675 13.7454 4.41722 13.3333 4.17928L8.66667 1.51262C8.25413 1.27444 7.74587 1.27444 7.33333 1.51262L2.66667 4.17928C2.25455 4.41722 2.00049 4.85675 2 5.33262V10.666C2.00049 11.1418 2.25455 11.5814 2.66667 11.8193L7.33333 14.486C7.74587 14.7241 8.25413 14.7241 8.66667 14.486L13.3333 11.8193C13.7454 11.5814 13.9995 11.1418 14 10.666V5.33262" stroke="#98A6A8" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M2.19995 4.66602L7.99995 7.99935L13.8 4.66602M7.99995 14.666V7.99935" stroke="#98A6A8" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const VerifyIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M11.6666 7.58294C11.6666 10.4996 9.62492 11.9579 7.19825 12.8038C7.07118 12.8468 6.93315 12.8448 6.80742 12.7979C4.37492 11.9579 2.33325 10.4996 2.33325 7.58294V3.49961C2.33325 3.17766 2.59463 2.91628 2.91659 2.91628C4.08325 2.91628 5.54159 2.21628 6.55659 1.32961C6.81189 1.11148 7.18794 1.11148 7.44325 1.32961C8.46408 2.22211 9.91659 2.91628 11.0833 2.91628C11.4054 2.91628 11.6666 3.17745 11.6666 3.49961V7.58294" stroke="#0C6CF2" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M5.25 6.99967L6.41667 8.16634L8.75 5.83301" stroke="#0C6CF2" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export function TransactionTable() {
  const { data: rawAudit = [], isLoading } = useQuery<any[]>({
    queryKey: ["audit"],
    queryFn: api.getAudit
  });

  const transactions: Transaction[] = rawAudit.map((tx, idx) => ({
    hash: tx.hash,
    bloc: tx.bloc || `#${104829 - idx}`,
    moteur: tx.moteur || "MTR-Unknown",
    intervention: tx.action || tx.intervention,
    date: tx.date,
    user: {
      name: tx.user || "Karim B.",
      avatar: "https://api.builder.io/api/v1/image/assets/TEMP/7b02cb388b87f56a63a235a8d02a1683e015ed41?width=56"
    }
  }));

  if (isLoading) return <div className="p-6 text-white text-sm">Chargement de l'audit blockchain...</div>;

  return (
    <div className="rounded-lg border border-black/[0.08] bg-[#0B1518] shadow-[0_4px_20px_0_rgba(0,0,0,0.15)] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="border-b border-black/[0.08] bg-[rgba(7,16,24,0.50)]">
              <th className="px-6 py-4 text-left text-[#98A6A8] text-xs font-semibold uppercase tracking-[0.5px]">
                Hash Transaction
              </th>
              <th className="px-6 py-4 text-left text-[#98A6A8] text-xs font-semibold uppercase tracking-[0.5px]">
                Bloc
              </th>
              <th className="px-6 py-4 text-left text-[#98A6A8] text-xs font-semibold uppercase tracking-[0.5px]">
                Moteur
              </th>
              <th className="px-6 py-4 text-left text-[#98A6A8] text-xs font-semibold uppercase tracking-[0.5px]">
                Intervention
              </th>
              <th className="px-6 py-4 text-left text-[#98A6A8] text-xs font-semibold uppercase tracking-[0.5px]">
                Date
              </th>
              <th className="px-6 py-4 text-left text-[#98A6A8] text-xs font-semibold uppercase tracking-[0.5px]">
                Utilisateur
              </th>
              <th className="px-6 py-4 text-right text-[#98A6A8] text-xs font-semibold uppercase tracking-[0.5px]" />
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx, idx) => (
              <tr
                key={idx}
                className="border-b border-black/[0.08] last:border-b-0 hover:bg-white/[0.02] transition-colors"
              >
                {/* Hash */}
                <td className="px-6 py-[18px]">
                  <div className="flex items-center gap-2 px-2.5 py-1.5 rounded border border-[rgba(12,108,242,0.15)] bg-[rgba(12,108,242,0.08)] w-fit">
                    <span className="text-[#0C6CF2] text-[13px] font-mono">{tx.hash}</span>
                    <button className="opacity-70 hover:opacity-100 transition-opacity">
                      <CopyIcon />
                    </button>
                  </div>
                </td>

                {/* Bloc */}
                <td className="px-6 py-[18px]">
                  <div className="flex items-center gap-1.5">
                    <span className="opacity-50">
                      <BlockIcon />
                    </span>
                    <span className="text-[#98A6A8] text-[13px] font-mono">{tx.bloc}</span>
                  </div>
                </td>

                {/* Moteur */}
                <td className="px-6 py-[18px]">
                  <span className="text-[#E6F0F2] text-sm font-medium">{tx.moteur}</span>
                </td>

                {/* Intervention */}
                <td className="px-6 py-[18px]">
                  <span className="text-[#E6F0F2] text-sm font-normal">{tx.intervention}</span>
                </td>

                {/* Date */}
                <td className="px-6 py-[18px]">
                  <span className="text-[#98A6A8] text-sm font-normal">{tx.date}</span>
                </td>

                {/* Utilisateur */}
                <td className="px-6 py-[18px]">
                  <div className="flex items-center gap-3">
                    <img
                      src={tx.user.avatar}
                      alt={tx.user.name}
                      className="w-7 h-7 rounded-full border border-black/[0.08] object-cover shrink-0"
                    />
                    <span className="text-[#E6F0F2] text-sm font-medium">{tx.user.name}</span>
                  </div>
                </td>

                {/* Verify */}
                <td className="px-6 py-[18px] text-right">
                  <button className="inline-flex items-center gap-1.5 h-8 px-3 rounded border border-[rgba(12,108,242,0.25)] bg-[rgba(12,108,242,0.10)] hover:bg-[rgba(12,108,242,0.20)] transition-colors whitespace-nowrap">
                    <VerifyIcon />
                    <span className="text-[#0C6CF2] text-[13px] font-semibold">Vérifier intégrité</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
