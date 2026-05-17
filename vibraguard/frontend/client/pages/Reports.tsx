import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { Copy, Download, Trash2, Plus, Calendar, User } from "lucide-react";

interface Report {
  id: string;
  title: string;
  type: string;
  frequency: string;
  ipfsHash: string;
  createdBy: string;
  createdAt: number;
  shareLink: string;
  downloadCount: number;
}

export default function Reports() {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [formData, setFormData] = useState({
    type: "pdf",
    frequency: "quotidien",
  });

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      const data = await api.getReports();
      setReports(data || []);
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors du chargement des rapports");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    try {
      setGenerating(true);

      // Fetch data based on type
      let fileContent = "";
      if (formData.type === "pdf") {
        // Generate PDF content
        const { jsPDF } = await import("jspdf");
        const { default: autoTable } = await import("jspdf-autotable");

        const doc = new jsPDF() as any;
        doc.setFontSize(22);
        doc.setTextColor(0, 122, 61);
        doc.text("VibraGuard - Rapport " + formData.frequency, 14, 22);

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Généré le: ${new Date().toLocaleString()}`, 14, 30);
        doc.text(`Période: ${formData.frequency}`, 14, 35);

        autoTable(doc, {
          startY: 45,
          head: [["Paramètre", "Valeur", "Tendance"]],
          body: [
            ["MTBF", "245 h", "+5%"],
            ["Disponibilité", "98.5%", "↑"],
            ["Coût Maintenance", "2,450 €", "-3%"],
          ],
          theme: "grid",
          headStyles: { fillColor: [0, 122, 61] },
        });

        fileContent = doc.output("dataurlstring");
      } else {
        // Generate Excel content
        const XLSX = await import("xlsx");
        const wb = XLSX.utils.book_new();
        const wsData = [
          ["KPI", "Valeur", "Tendance"],
          ["MTBF", "245 h", "+5%"],
          ["Disponibilité", "98.5%", "↑"],
          ["Coût", "2,450 €", "-3%"],
        ];
        const ws = XLSX.utils.aoa_to_sheet(wsData);
        XLSX.utils.book_append_sheet(wb, ws, "Rapport");
        fileContent = XLSX.write(wb, { type: "base64" });
      }

      const newReport = await api.generateReport({
        ...formData,
        fileContent,
      });

      setReports([newReport, ...reports]);
      setShowGenerateModal(false);
      toast.success("Rapport généré et stocké sur IPFS");
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de la génération du rapport");
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = async (reportId: string, title: string) => {
    try {
      const token = localStorage.getItem("token");
      const headers = new Headers();
      if (token) headers.append("Authorization", `Bearer ${token}`);
      
      const response = await fetch(`/api/v1/reports/${reportId}/download`, { headers });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = title;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        toast.success("Rapport téléchargé");
      } else {
        toast.error("Erreur lors du téléchargement");
      }
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors du téléchargement");
    }
  };

  const handleCopyLink = (reportId: string) => {
    const link = `${window.location.origin}/reports/share/${reportId}`;
    
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(link)
        .then(() => toast.success("Lien copié"))
        .catch(() => toast.error("Échec de la copie"));
    } else {
      // Fallback for non-HTTPS environments
      const textArea = document.createElement("textarea");
      textArea.value = link;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy') ? toast.success("Lien copié") : toast.error("Échec de la copie");
      } catch (error) {
        toast.error("Échec de la copie");
      }
      document.body.removeChild(textArea);
    }
  };

  const handleDelete = async (reportId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce rapport ?")) return;

    try {
      await api.deleteReport(reportId);
      setReports(reports.filter((r) => r.id !== reportId));
      toast.success("Rapport supprimé");
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de la suppression");
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <DashboardLayout breadcrumb="Rapports">
      <div className="flex flex-col flex-1 min-w-0">
        <div className="flex flex-col border-b border-black/[0.08] shrink-0">
          <div className="flex flex-wrap items-center justify-between gap-4 px-6 lg:px-12 py-8">
            <div>
              <h1 className="text-[#E6F0F2] text-2xl lg:text-[28px] font-semibold leading-tight mb-2">
                Rapports Générés
              </h1>
              <p className="text-[#98A6A8] text-sm">
                Gérez vos rapports stockés sur IPFS pour une traçabilité complète
              </p>
            </div>
            <button
              onClick={() => setShowGenerateModal(true)}
              className="flex items-center gap-2 h-10 px-4 rounded-md bg-[#007A3D] hover:bg-[#006633] transition-colors text-white font-semibold"
            >
              <Plus className="w-4 h-4" />
              Générer Rapport
            </button>
          </div>
        </div>

        {/* Reports Grid */}
        <div className="flex-1 overflow-auto">
          <div className="p-6 lg:p-12">
            {loading ? (
              <div className="text-[#98A6A8] text-center py-12">
                Chargement des rapports...
              </div>
            ) : reports.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center mx-auto mb-4">
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 32 32"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M8 4H20L24 8V28C24 29.1046 23.1046 30 22 30H8C6.89543 30 6 29.1046 6 28V6C6 4.89543 6.89543 4 8 4Z"
                      stroke="#98A6A8"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M20 4V8H24"
                      stroke="#98A6A8"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <p className="text-[#98A6A8] text-sm">
                  Aucun rapport généré pour le moment
                </p>
                <p className="text-[#64748B] text-xs mt-2">
                  Générez votre premier rapport pour commencer
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {reports.map((report) => (
                  <div
                    key={report.id}
                    className="flex items-center gap-4 p-4 rounded-lg border border-white/10 bg-white/[0.02] hover:bg-white/5 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-[#E6F0F2] font-semibold truncate">
                          {report.title}
                        </h3>
                        <span className="px-2 py-1 rounded text-xs font-medium bg-white/5 text-[#4FB3AF]">
                          {report.type.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-3 text-xs text-[#98A6A8]">
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5" />
                          {report.createdBy}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDate(report.createdAt)}
                        </span>
                        <span>
                          {report.downloadCount} téléchargement
                          {report.downloadCount !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <div className="mt-2 p-2 rounded bg-black/20 text-[10px] font-mono text-[#4FB3AF] break-all">
                        IPFS: {report.ipfsHash}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleCopyLink(report.id)}
                        className="flex items-center justify-center w-10 h-10 rounded-md hover:bg-white/10 transition-colors text-[#98A6A8] hover:text-white"
                        title="Copier le lien de partage"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDownload(report.id, report.title)}
                        className="flex items-center justify-center w-10 h-10 rounded-md hover:bg-white/10 transition-colors text-[#98A6A8] hover:text-[#4FB3AF]"
                        title="Télécharger depuis IPFS"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(report.id)}
                        className="flex items-center justify-center w-10 h-10 rounded-md hover:bg-red-500/10 transition-colors text-[#98A6A8] hover:text-red-500"
                        title="Supprimer le rapport"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Generate Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0A1A27] border border-white/10 rounded-lg p-6 max-w-md w-full">
            <h2 className="text-[#E6F0F2] text-lg font-semibold mb-4">
              Générer un nouveau rapport
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-[#E6F0F2] text-sm font-medium mb-2">
                  Type de rapport
                </label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-md border border-white/10 bg-white/5 text-white text-sm"
                >
                  <option value="pdf">PDF</option>
                  <option value="excel">Excel</option>
                </select>
              </div>

              <div>
                <label className="block text-[#E6F0F2] text-sm font-medium mb-2">
                  Fréquence
                </label>
                <select
                  value={formData.frequency}
                  onChange={(e) =>
                    setFormData({ ...formData, frequency: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-md border border-white/10 bg-white/5 text-white text-sm"
                >
                  <option value="quotidien">Quotidien</option>
                  <option value="hebdomadaire">Hebdomadaire</option>
                  <option value="mensuel">Mensuel</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowGenerateModal(false)}
                  className="flex-1 px-4 py-2 rounded-md border border-white/10 text-[#E6F0F2] hover:bg-white/5 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleGenerateReport}
                  disabled={generating}
                  className="flex-1 px-4 py-2 rounded-md bg-[#007A3D] hover:bg-[#006633] text-white font-semibold disabled:opacity-50 transition-colors"
                >
                  {generating ? "Génération..." : "Générer"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
