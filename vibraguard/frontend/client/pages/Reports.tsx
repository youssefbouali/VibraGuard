import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { api, apiRequest } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { Copy, Download, Plus, Calendar, User, ShieldCheck, ShieldAlert } from "lucide-react";
import { verifyReportIntegrity, type ReportIntegrityResult } from "@/lib/blockchain";

interface Report {
  id: string;
  title: string;
  type: string;
  frequency: string;
  ipfsHash: string;
  blockchainTxHash?: string;
  createdBy: string;
  createdAt: number;
  shareLink: string;
  downloadCount: number;
}

type IntegrityStatus = {
  loading: boolean;
  result?: ReportIntegrityResult;
};

interface ReportKpis {
  mtbf?: number;
  mttr?: number;
  uptime?: string;
  totalCost?: number;
  activeWorkOrders?: number;
  activeAlerts?: number;
  totalMotors?: number;
}

interface MotorReport {
  id: string;
  type?: string;
  site?: string;
  zone?: string;
  localisation?: string;
  puissance?: string;
  // API fields (from /api/v1/iot/motors)
  etatLabel?: string;    // actual field returned: e.g. "85% Normal"
  etatSante?: string;    // alias if ever mapped
  vibration?: string | number; // actual field returned: e.g. "1.23"
  vibrationRMS?: number; // alias if ever mapped
  derniereAlerte?: string;
}

interface VibrationData {
  motorId?: string;
  time: string;
  vibRms: number;
  vibPeak: number;
  vibKurtosis: number;
  temperature: number;
  currentRms: number;
  isAnomalous: boolean;
}

interface WorkOrderReport {
  id: string;
  asset?: string;
  status?: string;
  duration?: string;
  createdAt?: string;
  completedAt?: string;
}

interface AlertReport {
  id: string;
}

interface SiteMetric {
  name: string;
  value: number;
}

function formatCurrency(value: number) {
  return `${value.toLocaleString("fr-FR")} DH`;
}

function formatHours(value?: number) {
  return typeof value === "number" && Number.isFinite(value) ? `${value.toFixed(1)} h` : "0.0 h";
}

function formatMotorVibration(value?: number) {
  return typeof value === "number" ? `${value.toFixed(2)} mm/s` : "N/A";
}

function parseDurationHours(value?: string) {
  if (!value) return null;

  const trimmed = value.trim().toLowerCase();
  if (!trimmed) return null;

  const matcher = trimmed.match(/(?:(\d+(?:\.\d+)?)h)?\s*(?:(\d+(?:\.\d+)?)m)?/);
  if (matcher && (matcher[1] || matcher[2])) {
    const hours = matcher[1] ? Number(matcher[1]) : 0;
    const minutes = matcher[2] ? Number(matcher[2]) : 0;
    return hours + minutes / 60;
  }

  const numeric = Number(trimmed);
  return Number.isFinite(numeric) ? numeric : null;
}

function parseReportDate(value?: string) {
  if (!value) return null;

  const directDate = new Date(value);
  if (!Number.isNaN(directDate.getTime())) {
    return directDate;
  }

  const normalizedDate = new Date(value.replace(" ", "T"));
  return Number.isNaN(normalizedDate.getTime()) ? null : normalizedDate;
}

function buildMttrBySite(workOrders: WorkOrderReport[], motors: MotorReport[]): SiteMetric[] {
  const assetToSite = new Map(
    motors.map((motor) => [
      motor.id,
      (motor.zone || motor.site || "").trim() || "Site inconnu",
    ]),
  );

  const totals = new Map<string, { totalHours: number; count: number }>();

  for (const workOrder of workOrders) {
    if (!workOrder.asset) continue;
    if (workOrder.status && !workOrder.status.toLowerCase().includes("termin")) continue;

    const siteName = assetToSite.get(workOrder.asset);
    if (!siteName) continue;

    const durationHours =
      parseDurationHours(workOrder.duration) ??
      (() => {
        const createdAt = parseReportDate(workOrder.createdAt);
        const completedAt = parseReportDate(workOrder.completedAt);
        if (!createdAt || !completedAt) return null;

        const diffHours = (completedAt.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
        return diffHours >= 0 ? diffHours : null;
      })();

    if (durationHours === null) continue;

    const current = totals.get(siteName) || { totalHours: 0, count: 0 };
    current.totalHours += durationHours;
    current.count += 1;
    totals.set(siteName, current);
  }

  return Array.from(totals.entries())
    .map(([name, { totalHours, count }]) => ({
      name,
      value: Math.round((totalHours / count) * 10) / 10,
    }))
    .sort((a, b) => a.name.localeCompare(b.name, "fr"));
}

function buildReliabilityBySite(mtbfBySite: SiteMetric[], mttrBySite: SiteMetric[]) {
  const mtbfMap = new Map(mtbfBySite.map((item) => [item.name, item.value]));
  const mttrMap = new Map(mttrBySite.map((item) => [item.name, item.value]));
  const siteNames = Array.from(new Set([...mtbfMap.keys(), ...mttrMap.keys()])).sort((a, b) =>
    a.localeCompare(b, "fr"),
  );

  if (siteNames.length === 0) {
    return [["Aucune donnée", "0.0 h", "0.0 h"]];
  }

  return siteNames.map((siteName) => [
    siteName,
    formatHours(mtbfMap.get(siteName)),
    formatHours(mttrMap.get(siteName)),
  ]);
}

export default function Reports() {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [verifyingAll, setVerifyingAll] = useState(false);
  const [integrityByReport, setIntegrityByReport] = useState<Record<string, IntegrityStatus>>({});
  const [formData, setFormData] = useState({
    type: "pdf",
  });
  const [reportPage, setReportPage] = useState(1);
  const reportsPerPage = 10;

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

      const [kpis, motors, alerts, workOrders, mtbfBySite, allVibrations] = await Promise.all([
        api.getBIKPIs() as Promise<ReportKpis>,
        api.getMotors() as Promise<MotorReport[]>,
        api.getAlerts() as Promise<AlertReport[]>,
        api.getWorkOrders() as Promise<WorkOrderReport[]>,
        api.getMtbfBySite() as Promise<SiteMetric[]>,
        apiRequest<VibrationData[]>("GET", "/api/v1/iot/motors/vibrations"),
      ]);

      const safeMotors = Array.isArray(motors) ? motors : [];
      const safeAlerts = Array.isArray(alerts) ? alerts : [];
      const safeWorkOrders = Array.isArray(workOrders) ? workOrders : [];
      const safeMtbfBySite = Array.isArray(mtbfBySite) ? mtbfBySite : [];
      const safeVibrations = Array.isArray(allVibrations) ? allVibrations : [];

      // Build map of motorId -> latest vibration (by time)
      const latestVibrationByMotor = new Map<string, VibrationData>();
      for (const v of safeVibrations) {
        if (!v.motorId) continue;
        const existing = latestVibrationByMotor.get(v.motorId);
        if (!existing || new Date(v.time).getTime() > new Date(existing.time).getTime()) {
          latestVibrationByMotor.set(v.motorId, v);
        }
      }

      const formatNumber = (value?: number | null) =>
        typeof value === "number" && Number.isFinite(value) ? value.toFixed(2) : "N/A";

      const mtbfValue = formatHours(kpis?.mtbf);
      const mttrValue = formatHours(kpis?.mttr);
      const availabilityValue = kpis?.uptime || "100.0%";
      const maintenanceCostValue = formatCurrency(Number(kpis?.totalCost || 0));
      const mttrBySite = buildMttrBySite(safeWorkOrders, safeMotors);
      const reliabilityBySiteRows = buildReliabilityBySite(safeMtbfBySite, mttrBySite);

      let fileContent = "";
      if (formData.type === "pdf") {
        const { jsPDF } = await import("jspdf");
        const { default: autoTable } = await import("jspdf-autotable");

        const doc = new jsPDF("landscape") as any;
        doc.setFontSize(22);
        doc.setTextColor(0, 122, 61);
        doc.text("VibraGuard - Rapport", 14, 22);

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Généré le: ${new Date().toLocaleString()}`, 14, 30);

        autoTable(doc, {
          startY: 45,
          head: [["Paramètre", "Valeur"]],
          body: [
            ["MTBF", mtbfValue],
            ["MTTR", mttrValue],
            ["Disponibilité", availabilityValue],
            ["Coût Maintenance", maintenanceCostValue],
          ],
          theme: "grid",
          headStyles: { fillColor: [0, 122, 61] },
        });

        autoTable(doc, {
          startY: (doc as any).lastAutoTable.finalY + 10,
          head: [["Métrique", "Valeur"]],
          body: [
            ["Nombre de moteurs", String(kpis?.totalMotors ?? safeMotors.length)],
            ["Alertes actives", String(kpis?.activeAlerts ?? safeAlerts.length)],
            ["Ordres de travail actifs", String(kpis?.activeWorkOrders ?? safeWorkOrders.length)],
          ],
          theme: "striped",
          headStyles: { fillColor: [15, 39, 48] },
        });

        doc.setFontSize(14);
        doc.setTextColor(15, 39, 48);
        doc.text("MTTR et MTBF par site", 14, (doc as any).lastAutoTable.finalY + 14);

        autoTable(doc, {
          startY: (doc as any).lastAutoTable.finalY + 18,
          head: [["Site", "MTBF", "MTTR"]],
          body: reliabilityBySiteRows,
          theme: "striped",
          headStyles: { fillColor: [0, 122, 61] },
        });

        doc.setFontSize(14);
        doc.setTextColor(15, 39, 48);
        doc.text("Rapport détaillé des moteurs", 14, (doc as any).lastAutoTable.finalY + 14);

        autoTable(doc, {
          startY: (doc as any).lastAutoTable.finalY + 18,
          head: [[
            "ID",
            "Type",
            "Zone",
            "Localisation",
            "Etat",
            "Vibration Initiale",
            "Vibration Actuelle",
            "Vib Peak",
            "Vib Kurtosis",
            "Température",
            "Courant RMS",
          ]],
          body: safeMotors.length > 0
            ? safeMotors.map((motor) => {
                // API returns etatLabel (e.g. "85% Normal") and vibration (string e.g. "1.23")
                const etat = motor.etatSante || motor.etatLabel || "Normal";
                const initialVibNum =
                  typeof motor.vibrationRMS === "number" && Number.isFinite(motor.vibrationRMS)
                    ? motor.vibrationRMS
                    : typeof motor.vibration === "string"
                    ? parseFloat(motor.vibration)
                    : typeof motor.vibration === "number"
                    ? motor.vibration
                    : NaN;
                const initialVibStr = Number.isFinite(initialVibNum) ? `${initialVibNum.toFixed(2)} mm/s` : "N/A";
                const lastVib = latestVibrationByMotor.get(motor.id);
                return [
                  motor.id || "-",
                  motor.type || "-",
                  motor.zone || motor.site || "-",
                  motor.localisation || "-",
                  etat,
                  initialVibStr,
                  lastVib ? `${formatNumber(lastVib.vibRms)} mm/s` : "N/A",
                  lastVib ? formatNumber(lastVib.vibPeak) : "N/A",
                  lastVib ? formatNumber(lastVib.vibKurtosis) : "N/A",
                  lastVib ? `${formatNumber(lastVib.temperature)} °C` : "N/A",
                  lastVib ? `${formatNumber(lastVib.currentRms)} A` : "N/A",
                ];
              })
            : [["Aucun moteur", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-"]],
          theme: "grid",
          headStyles: { fillColor: [0, 122, 61] },
          styles: { fontSize: 7, cellPadding: 1.5 },
        });

        fileContent = doc.output("dataurlstring");
      }

      const newReport = await api.generateReport({
        ...formData,
        createdBy: user?.fullName,
        fileContent,
      });

      setReports([newReport, ...reports]);
      setReportPage(1);
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

  const handleVerifyReport = async (report: Report) => {
    setIntegrityByReport((prev) => ({
      ...prev,
      [report.id]: { loading: true, result: prev[report.id]?.result },
    }));

    try {
      const result = await verifyReportIntegrity(report.id, report.ipfsHash, report.blockchainTxHash);
      setIntegrityByReport((prev) => ({
        ...prev,
        [report.id]: { loading: false, result },
      }));

      if (result.ok) {
        toast.success(`Integrity verified for ${report.id}`);
      } else {
        toast.error(result.reason || `Integrity check failed for ${report.id}`);
      }
    } catch (error) {
      console.error(error);
      setIntegrityByReport((prev) => ({
        ...prev,
        [report.id]: {
          loading: false,
          result: {
            ok: false,
            reason: "Unable to verify this report.",
            reportId: report.id,
            expectedCid: report.ipfsHash,
            expectedTxHash: report.blockchainTxHash,
            blockchainRecord: null,
          },
        },
      }));
      toast.error(`Verification failed for ${report.id}`);
    }
  };

  const handleVerifyAllIntegrity = async () => {
    if (reports.length === 0) return;

    setVerifyingAll(true);
    setIntegrityByReport((prev) => {
      const next = { ...prev };
      for (const report of reports) {
        next[report.id] = { loading: true, result: prev[report.id]?.result };
      }
      return next;
    });

    try {
      const verificationResults = await Promise.all(
        reports.map(async (report) => ({
          reportId: report.id,
          result: await verifyReportIntegrity(report.id, report.ipfsHash, report.blockchainTxHash),
        })),
      );

      const passedCount = verificationResults.filter(({ result }) => result.ok).length;

      setIntegrityByReport((prev) => {
        const next = { ...prev };
        for (const { reportId, result } of verificationResults) {
          next[reportId] = { loading: false, result };
        }
        return next;
      });

      toast.success(`${passedCount}/${verificationResults.length} reports verified successfully`);
    } catch (error) {
      console.error(error);
      toast.error("Unable to verify all reports");
    } finally {
      setVerifyingAll(false);
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

  const totalReportPages = Math.max(1, Math.ceil(reports.length / reportsPerPage));
  const paginatedReports = reports.slice((reportPage - 1) * reportsPerPage, reportPage * reportsPerPage);

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
            <button
              onClick={handleVerifyAllIntegrity}
              disabled={verifyingAll || reports.length === 0}
              className="flex items-center gap-2 h-10 px-4 rounded-md border border-white/10 hover:bg-white/5 transition-colors text-[#E6F0F2] font-semibold disabled:opacity-50"
            >
              {verifyingAll ? "Vérification..." : "Vérifier toute l'intégrité"}
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
              <>
              <div className="grid gap-4">
                {paginatedReports.map((report) => (
                  <div
                    key={report.id}
                    className="flex items-center gap-4 p-4 rounded-lg border border-white/10 bg-white/[0.02] hover:bg-white/5 transition-colors"
                  >
                    {(() => {
                      const integrity = integrityByReport[report.id];
                      const integrityResult = integrity?.result;
                      const isVerified = !!integrityResult?.ok;
                      const isFailed = !!integrityResult && !integrityResult.ok;

                      return (
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
                        {isVerified && (
                          <span className="flex items-center gap-1 text-emerald-400">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Intégrité vérifiée
                          </span>
                        )}
                        {isFailed && (
                          <span className="flex items-center gap-1 text-red-400">
                            <ShieldAlert className="w-3.5 h-3.5" />
                            Intégrité non vérifiée
                          </span>
                        )}
                      </div>
                      <div className="mt-2 space-y-2">
                        <div className="p-2 rounded bg-black/20 text-[10px] font-mono text-[#4FB3AF] break-all">
                          IPFS: {report.ipfsHash}
                        </div>
                        {report.blockchainTxHash && (
                          <div className="p-2 rounded bg-black/20 text-[10px] font-mono text-[#E6F0F2] break-all">
                            Blockchain TX: {report.blockchainTxHash}
                          </div>
                        )}
                        {integrityResult?.onChainCid && (
                          <div className="p-2 rounded bg-black/20 text-[10px] font-mono text-[#98A6A8] break-all">
                            Blockchain CID: {integrityResult.onChainCid}
                          </div>
                        )}
                        {integrityResult?.reason && (
                          <div className={`text-[11px] ${integrityResult.ok ? "text-emerald-400" : "text-red-400"}`}>
                            {integrityResult.reason}
                          </div>
                        )}
                      </div>
                    </div>
                      );
                    })()}

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
                        onClick={() => handleVerifyReport(report)}
                        disabled={integrityByReport[report.id]?.loading}
                        className="flex items-center justify-center w-10 h-10 rounded-md hover:bg-white/10 transition-colors text-[#98A6A8] hover:text-emerald-400 disabled:opacity-50"
                        title="Vérifier l'intégrité"
                      >
                        {integrityByReport[report.id]?.loading ? (
                          <span className="text-[10px]">...</span>
                        ) : (
                          <ShieldCheck className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {reports.length > reportsPerPage && (
                <div className="flex items-center justify-between pt-4 mt-4 border-t border-white/[0.05]">
                  <span className="text-[13px] text-[#64748B]">{reports.length} rapports</span>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setReportPage(Math.max(1, reportPage - 1))} disabled={reportPage === 1} className="flex items-center h-7 px-3 rounded text-[12px] font-medium text-[#94A3B8] hover:text-white hover:bg-white/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">Précédent</button>
                    <span className="text-[12px] text-[#64748B]">{reportPage}/{totalReportPages}</span>
                    <button onClick={() => setReportPage(Math.min(totalReportPages, reportPage + 1))} disabled={reportPage === totalReportPages} className="flex items-center h-7 px-3 rounded text-[12px] font-medium text-[#94A3B8] hover:text-white hover:bg-white/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">Suivant</button>
                  </div>
                </div>
              )}
              </>
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
