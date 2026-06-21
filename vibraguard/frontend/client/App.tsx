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
import AjouterMoteur from "./pages/AjouterMoteur";
import Alertes from "./pages/Alertes";
import AlerteDetail from "./pages/AlerteDetail";
import OrdresDeTravail from "./pages/OrdresDeTravail";
import CreerOrdreDeTravail from "./pages/CreerOrdreDeTravail";
import RapportsBI from "./pages/RapportsBI";
import Reports from "./pages/Reports";
import ReportShare from "./pages/ReportShare";
import AuditBlockchain from "./pages/AuditBlockchain";
import Parametres from "./pages/Parametres";
import Users from "./pages/Users";
import ProfilUtilisateur from "./pages/ProfilUtilisateur";
import Notifications from "./pages/Notifications";
import UtilisateurDetail from "./pages/parametres/UtilisateurDetail";
import AjouterUtilisateur from "./pages/parametres/AjouterUtilisateur";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";

import { AuthProvider } from "@/lib/auth-context";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import GuestRoute from "@/components/auth/GuestRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<GuestRoute><Index /></GuestRoute>} />
            <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
            <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Protected Routes */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/moteurs" element={<ProtectedRoute><Moteurs /></ProtectedRoute>} />
            <Route path="/moteurs/ajouter" element={<ProtectedRoute><AjouterMoteur /></ProtectedRoute>} />
            <Route path="/moteurs/:id" element={<ProtectedRoute><MoteurDetail /></ProtectedRoute>} />
            <Route path="/alertes" element={<ProtectedRoute><Alertes /></ProtectedRoute>} />
            <Route path="/alertes/:id" element={<ProtectedRoute><AlerteDetail /></ProtectedRoute>} />
            <Route path="/ordres-de-travail" element={<ProtectedRoute><OrdresDeTravail /></ProtectedRoute>} />
            <Route path="/ordres-de-travail/creer" element={<ProtectedRoute><CreerOrdreDeTravail /></ProtectedRoute>} />
            <Route path="/rapports-bi" element={<ProtectedRoute allowedRoles={["admin"]}><RapportsBI /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
            <Route path="/audit" element={<ProtectedRoute allowedRoles={["admin"]}><AuditBlockchain /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
            <Route path="/users" element={<ProtectedRoute allowedRoles={["admin"]}><Users /></ProtectedRoute>} />
            <Route path="/users/ajouter" element={<ProtectedRoute allowedRoles={["admin"]}><AjouterUtilisateur /></ProtectedRoute>} />
            <Route path="/users/:id" element={<ProtectedRoute allowedRoles={["admin"]}><UtilisateurDetail /></ProtectedRoute>} />
            <Route path="/parametres" element={<ProtectedRoute><Parametres /></ProtectedRoute>} />
            <Route path="/parametres/profil" element={<ProtectedRoute><ProfilUtilisateur /></ProtectedRoute>} />

            {/* Public Shared Report Route */}
            <Route path="/reports/share/:id" element={<ReportShare />} />

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
