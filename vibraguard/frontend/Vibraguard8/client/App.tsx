import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Moteurs from "./pages/Moteurs";
import MoteurDetail from "./pages/MoteurDetail";
import Alertes from "./pages/Alertes";
import AlerteDetail from "./pages/AlerteDetail";
import OrdresDeTravail from "./pages/OrdresDeTravail";
import CreerOrdreDeTravail from "./pages/CreerOrdreDeTravail";
import RapportsBI from "./pages/RapportsBI";
import AuditBlockchain from "./pages/AuditBlockchain";
import Parametres from "./pages/Parametres";
import ProfilUtilisateur from "./pages/ProfilUtilisateur";
import UtilisateurDetail from "./pages/parametres/UtilisateurDetail";
import AjouterUtilisateur from "./pages/parametres/AjouterUtilisateur";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/moteurs" element={<Moteurs />} />
          <Route path="/moteurs/:id" element={<MoteurDetail />} />
          <Route path="/alertes" element={<Alertes />} />
          <Route path="/alertes/:id" element={<AlerteDetail />} />
          <Route path="/ordres-de-travail" element={<OrdresDeTravail />} />
          <Route path="/ordres-de-travail/creer" element={<CreerOrdreDeTravail />} />
          <Route path="/rapports-bi" element={<RapportsBI />} />
          <Route path="/audit" element={<AuditBlockchain />} />
          <Route path="/parametres" element={<Parametres />} />
          <Route path="/parametres/profil" element={<ProfilUtilisateur />} />
          <Route path="/parametres/utilisateurs/ajouter" element={<AjouterUtilisateur />} />
          <Route path="/parametres/utilisateurs/:id" element={<UtilisateurDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
