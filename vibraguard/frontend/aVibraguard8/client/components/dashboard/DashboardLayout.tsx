import { useState, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface DashboardLayoutProps {
    children: React.ReactNode;
    breadcrumb?: string;
    breadcrumbItems?: BreadcrumbItem[];
}

export function DashboardLayout({ children, breadcrumb, breadcrumbItems }: DashboardLayoutProps) {

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);

    // Close sidebar on mobile when clicking outside
    useEffect(() => {
        const handleOutsideClick = (event: MouseEvent) => {
            const sidebar = document.getElementById("mobile-sidebar");
            const menuButton = document.getElementById("menu-button");

            if (sidebarOpen &&
                sidebar && !sidebar.contains(event.target as Node) &&
                menuButton && !menuButton.contains(event.target as Node)) {
                setSidebarOpen(false);
            }
        };

        if (sidebarOpen) {
            document.addEventListener("mousedown", handleOutsideClick);
        }

        return () => {
            document.removeEventListener("mousedown", handleOutsideClick);
        };
    }, [sidebarOpen]);

    return (
        <div className="flex h-screen w-screen overflow-hidden bg-[#071018] text-white">
            {/* Background radial glows */}
            <div className="pointer-events-none fixed inset-0" aria-hidden="true">
                <div
                    className="absolute"
                    style={{
                        width: 1200,
                        height: 1200,
                        left: -312,
                        top: -420,
                        background: "radial-gradient(circle at 30% 30%, rgba(16,185,129,0.04) 0%, transparent 70%)",
                    }}
                />
                <div
                    className="absolute"
                    style={{
                        width: 1600,
                        height: 1600,
                        right: -400,
                        bottom: -400,
                        background: "radial-gradient(circle at 70% 70%, rgba(14,165,233,0.04) 0%, transparent 70%)",
                    }}
                />
            </div>

            {/* Sidebar - Hidden on mobile, visible on desktop */}
            <div
                id="mobile-sidebar"
                className={cn(
                    "fixed inset-y-0 left-0 z-50 lg:relative lg:inset-auto transition-transform duration-300 ease-in-out lg:translate-x-0",
                    sidebarOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <Sidebar
                    isCollapsed={isCollapsed}
                    onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
                />
            </div>

            {/* Main content */}
            <div className="flex flex-col flex-1 min-w-0 overflow-hidden relative">
                <Header
                    breadcrumb={breadcrumb}
                    breadcrumbItems={breadcrumbItems}
                    onMenuClick={() => setSidebarOpen(!sidebarOpen)}
                />


                {/* Scrollable content */}
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    <div className="flex flex-col gap-4 sm:gap-6 max-w-full lg:max-w-[1200px] mx-auto">
                        {children}
                    </div>
                </main>

                {/* Overlay for mobile */}
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity duration-300"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}
            </div>
        </div>
    );
}
