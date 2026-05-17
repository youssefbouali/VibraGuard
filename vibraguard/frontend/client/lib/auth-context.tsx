import React, { createContext, useContext, useState, useEffect } from "react";

interface User {
    email: string;
    fullName: string;
    employeeId: string;
    phoneNumber: string;
    department: string;
    role: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (token: string, user: User, rememberMe: boolean) => void;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(
        localStorage.getItem("token") || sessionStorage.getItem("token")
    );
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            if (token) {
                try {
                    const response = await fetch("/api/v1/auth/me", {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });
                    if (response.ok) {
                        const userData = await response.json();
                        setUser(userData);
                    } else {
                        // Token might be expired
                        logout();
                    }
                } catch (error) {
                    console.error("Failed to fetch user", error);
                    logout();
                }
            }
            setIsLoading(false);
        };

        fetchUser();
    }, [token]);

    const login = (newToken: string, userData: User, rememberMe: boolean) => {
        if (rememberMe) {
            localStorage.setItem("token", newToken);
        } else {
            sessionStorage.setItem("token", newToken);
        }
        setToken(newToken);
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
