import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: Array<"admin" | "technician">;
}

const normalizeRole = (role: string | undefined) =>
    role?.toLowerCase().replace(/[^a-z]/g, "") || "";

const isAdminRole = (role: string | undefined) => {
    const normalized = normalizeRole(role);
    return normalized.startsWith("admin") || normalized.startsWith("administrateur");
};

const isTechnicianRole = (role: string | undefined) => {
    const normalized = normalizeRole(role);
    return normalized.includes("technicien") || normalized.includes("technician");
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
    const { token, isLoading, user } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#071018]">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#007A3D] border-t-transparent" />
            </div>
        );
    }

    if (!token) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRoles && allowedRoles.length > 0) {
        const role = user?.role;
        const adminAllowed = allowedRoles.includes("admin") && isAdminRole(role);
        const techAllowed = allowedRoles.includes("technician") && isTechnicianRole(role);

        if (!adminAllowed && !techAllowed) {
            return <Navigate to="/dashboard" replace />;
        }
    }

    return <>{children}</>;
};

export default ProtectedRoute;
