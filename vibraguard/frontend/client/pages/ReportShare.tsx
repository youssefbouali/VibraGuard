import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Download, ExternalLink, AlertCircle, ShieldCheck, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { verifyReportIntegrity, type ReportIntegrityResult } from "@/lib/blockchain";

export default function ReportShare() {
  const { id } = useParams<{ id: string }>();
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [integrityResult, setIntegrityResult] = useState<ReportIntegrityResult | null>(null);

  useEffect(() => {
    const fetchReport = async () => {
      if (!id) return;
      try {
        setLoading(true);
        // We use the public-enabled endpoint from backend
        // Note: fetch directly since we don't want to use the api.ts instance with potential token issues for public links
        const response = await fetch(`/api/v1/reports/${id}`);
        if (!response.ok) {
          throw new Error("Rapport introuvable");
        }
        const data = await response.json();
        setReport(data);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Erreur lors du chargement du rapport");
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [id]);

  const handleDownload = async () => {
    if (!id || !report) return;
    try {
      toast.info("Préparation du téléchargement...");
      const response = await fetch(`/api/v1/reports/${id}/download`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${report.title}.${report.type}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        toast.success("Téléchargement réussi");
      } else {
        toast.error("Échec du téléchargement");
      }
    } catch (error) {
      console.error(error);
      toast.error("Une erreur est survenue");
    }
  };

  const handleVerifyIntegrity = async () => {
    if (!report?.id || !report?.ipfsHash) return;

    try {
      setVerifying(true);
      const result = await verifyReportIntegrity(report.id, report.ipfsHash, report.blockchainTxHash);
      setIntegrityResult(result);

      if (result.ok) {
        toast.success("Integrity verified successfully");
      } else {
        toast.error(result.reason || "Integrity verification failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Unable to verify report integrity");
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-vibraguard-950">
        <div className="animate-pulse text-vibraguard-400">Chargement du rapport...</div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-vibraguard-950 p-4">
        <Card className="max-w-md w-full border-vibraguard-800 bg-vibraguard-900 shadow-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-red-900/20 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="text-red-500 w-8 h-8" />
            </div>
            <CardTitle className="text-white">Rapport non disponible</CardTitle>
            <CardDescription className="text-vibraguard-400">
              {error || "Ce lien de partage est invalide ou a expiré."}
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button 
              className="w-full bg-vibraguard-600 hover:bg-vibraguard-700 text-white"
              onClick={() => window.location.href = "/"}
            >
              Retour à l'accueil
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-vibraguard-950 p-4 font-sans">
      <Card className="max-w-2xl w-full border-vibraguard-800 bg-vibraguard-900 shadow-2xl overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-vibraguard-600 to-blue-600" />
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 px-3 py-1 bg-vibraguard-800/50 rounded-full border border-vibraguard-700">
              <FileText className="w-4 h-4 text-vibraguard-400" />
              <span className="text-xs font-medium text-vibraguard-300 uppercase tracking-wider">
                Rapport partagé
              </span>
            </div>
            <span className="text-xs text-vibraguard-500 font-mono">
              ID: {id}
            </span>
          </div>
          <CardTitle className="text-2xl md:text-3xl font-bold text-white mb-1">
            {report.title}
          </CardTitle>
          <CardDescription className="text-vibraguard-400">
            Généré le {new Date(report.createdAt).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-vibraguard-800/40 p-4 rounded-xl border border-vibraguard-700/50">
              <p className="text-xs text-vibraguard-500 mb-1 uppercase tracking-tight">Format</p>
              <p className="text-white font-semibold uppercase">{report.type}</p>
            </div>
            <div className="bg-vibraguard-800/40 p-4 rounded-xl border border-vibraguard-700/50">
              <p className="text-xs text-vibraguard-500 mb-1 uppercase tracking-tight">Période</p>
              <p className="text-white font-semibold capitalize">{report.frequency || "Ponctuel"}</p>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-medium text-vibraguard-300">Détails de sécurité</h3>
            <div className="bg-vibraguard-800/20 p-4 rounded-xl border border-dashed border-vibraguard-700 text-sm">
              <div className="flex items-start gap-3">
                <ExternalLink className="w-5 h-5 text-vibraguard-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-vibraguard-200 font-medium mb-1">Stockage Décentralisé IPFS</p>
                  <p className="text-vibraguard-400 text-xs leading-relaxed">
                    Ce rapport est authentifié et stocké sur le réseau IPFS. Le hash de sécurité 
                    garantit l'intégrité des données vibratoires récoltées.
                  </p>
                  <p className="mt-2 text-[10px] font-mono text-vibraguard-500 break-all bg-black/30 p-1.5 rounded">
                    {report.ipfsHash}
                  </p>
                  {report.blockchainTxHash && (
                    <p className="mt-2 text-[10px] font-mono text-vibraguard-300 break-all bg-black/30 p-1.5 rounded">
                      Blockchain TX: {report.blockchainTxHash}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-medium text-vibraguard-300">Vérification d'intégrité</h3>
            <div className="bg-vibraguard-800/20 p-4 rounded-xl border border-dashed border-vibraguard-700 text-sm">
              {integrityResult ? (
                <div className="space-y-3">
                  <div className={`flex items-center gap-2 font-medium ${integrityResult.ok ? "text-emerald-400" : "text-red-400"}`}>
                    {integrityResult.ok ? <ShieldCheck className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
                    <span>{integrityResult.ok ? "Intégrité vérifiée" : "Intégrité non vérifiée"}</span>
                  </div>
                  <p className="text-vibraguard-400 text-xs">{integrityResult.reason}</p>
                  {integrityResult.onChainCid && (
                    <p className="text-[10px] font-mono text-vibraguard-300 break-all bg-black/30 p-1.5 rounded">
                      Blockchain CID: {integrityResult.onChainCid}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-vibraguard-400 text-xs">
                  Vérifiez que le CID IPFS de ce rapport correspond bien au CID enregistré sur la blockchain.
                </p>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button 
            className="w-full sm:flex-1 bg-vibraguard-600 hover:bg-vibraguard-500 text-white font-bold h-12 gap-2 transition-all active:scale-95"
            onClick={handleDownload}
          >
            <Download className="w-5 h-5" />
            Télécharger le rapport
          </Button>
          <Button 
            variant="outline"
            className="w-full sm:w-auto border-vibraguard-700 text-vibraguard-300 hover:bg-vibraguard-800 h-12 px-6"
            onClick={() => window.open(`https://ipfs.io/ipfs/${report.ipfsHash}`, '_blank')}
          >
            Voir sur IPFS
          </Button>
          <Button
            variant="outline"
            className="w-full sm:w-auto border-vibraguard-700 text-vibraguard-300 hover:bg-vibraguard-800 h-12 px-6"
            onClick={handleVerifyIntegrity}
            disabled={verifying}
          >
            {verifying ? "Vérification..." : "Vérifier l'intégrité"}
          </Button>
        </CardFooter>
      </Card>
      
      <div className="fixed bottom-6 text-center w-full left-0 opacity-40">
        <p className="text-[10px] text-vibraguard-600 uppercase tracking-widest font-bold">
          © 2026 VibraGuard Systems • Plateforme de Maintenance Prédictive
        </p>
      </div>
    </div>
  );
}
