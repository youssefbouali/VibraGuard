import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";

interface GuestRouteProps {
    children: React.ReactNode;
}

const GuestRoute: React.FC<GuestRouteProps> = ({ children }) => {
    const { token, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#071018]">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#007A3D] border-t-transparent" />
            </div>
        );
    }

    if (token) {
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
};

export default GuestRoute;
