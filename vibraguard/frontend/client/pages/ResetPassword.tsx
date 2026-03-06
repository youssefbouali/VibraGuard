import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";

export default function ResetPassword() {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!password || !confirmPassword) {
            toast({
                title: "Erreur",
                description: "Veuillez remplir tous les champs.",
                variant: "destructive",
            });
            return;
        }

        if (password !== confirmPassword) {
            toast({
                title: "Erreur",
                description: "Les mots de passe ne correspondent pas.",
                variant: "destructive",
            });
            return;
        }

        if (password.length < 8) {
            toast({
                title: "Erreur",
                description: "Le mot de passe doit contenir au moins 8 caractères.",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);
        // Simuler la réinitialisation
        setTimeout(() => {
            setIsLoading(false);
            toast({
                title: "Succès",
                description: "Votre mot de passe a été réinitialisé avec succès.",
            });
            navigate("/login");
        }, 1500);
    };

    return (
        <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#0A1118] p-4 sm:p-6">
            {/* Background decorative SVG */}
            <svg
                className="absolute inset-0 w-full h-full"
                viewBox="0 0 1440 884"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                preserveAspectRatio="xMidYMid slice"
                aria-hidden="true"
            >
                <g clipPath="url(#reset-clip)">
                    <path
                        d="M-384 221C-384 552.149 -115.149 821 216 821C547.149 821 816 552.149 816 221C816 -110.149 547.149 -379 216 -379C-115.149 -379 -384 -110.149 -384 221Z"
                        fill="url(#reset-radial0)"
                    />
                    <path
                        d="M424 663C424 1104.53 782.468 1463 1224 1463C1665.53 1463 2024 1104.53 2024 663C2024 221.468 1665.53 -137 1224 -137C782.468 -137 424 221.468 424 663Z"
                        fill="url(#reset-radial1)"
                    />
                    <path
                        d="M320 442C320 662.766 499.234 842 720 842C940.766 842 1120 662.766 1120 442C1120 221.234 940.766 42 720 42C499.234 42 320 221.234 320 442Z"
                        fill="url(#reset-radial2)"
                    />
                </g>
                <defs>
                    <radialGradient id="reset-radial0" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(216 221) scale(600)">
                        <stop stopColor="#10B981" stopOpacity="0.08" />
                        <stop offset="1" stopColor="#10B981" stopOpacity="0" />
                    </radialGradient>
                    <radialGradient id="reset-radial1" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(1224 663) scale(800)">
                        <stop stopColor="#0EA5E9" stopOpacity="0.05" />
                        <stop offset="1" stopColor="#0EA5E9" stopOpacity="0" />
                    </radialGradient>
                    <radialGradient id="reset-radial2" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(720 442) scale(400)">
                        <stop stopColor="#10B981" stopOpacity="0.08" />
                        <stop offset="1" stopColor="#10B981" stopOpacity="0" />
                    </radialGradient>
                    <clipPath id="reset-clip">
                        <rect width="1440" height="884" fill="white" />
                    </clipPath>
                </defs>
            </svg>

            {/* Card */}
            <div className="relative z-10 w-full max-w-[480px] rounded-xl sm:rounded-2xl border border-white/[0.08] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.50),0_0_40px_0_rgba(16,185,129,0.05)] backdrop-blur-[12px] bg-[rgba(17,26,36,0.70)] px-6 sm:px-10 py-8 sm:py-12 flex flex-col items-center">

                {/* Logo icon */}
                <div className="mb-6 flex flex-col items-center gap-4">
                    <div className="relative w-12 h-12 flex items-center justify-center rounded-lg border border-[#10B981]/20 bg-gradient-to-br from-[rgba(16,185,129,0.20)] to-[rgba(16,185,129,0.05)]">
                        <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M29.3334 16.0001H26.0267C24.8292 15.9975 23.7768 16.7936 23.4534 17.9467L20.3201 29.0934C20.2786 29.2356 20.1482 29.3334 20.0001 29.3334C19.8519 29.3334 19.7216 29.2356 19.6801 29.0934L12.3201 2.90675C12.2786 2.76453 12.1482 2.66675 12.0001 2.66675C11.8519 2.66675 11.7216 2.76453 11.6801 2.90675L8.54675 14.0534C8.22474 15.2018 7.17938 15.9967 5.98675 16.0001H2.66675" stroke="#10B981" strokeWidth="2.66667" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <div className="text-center">
                        <h1 className="text-white font-bold text-2xl leading-tight">Nouveau mot de passe</h1>
                        <p className="text-[#94A3B8] text-sm mt-2">
                            Veuillez définir votre nouveau mot de passe de sécurité.
                        </p>
                    </div>
                </div>

                <form className="w-full flex flex-col gap-5" onSubmit={handleSubmit}>
                    {/* Password field */}
                    <div className="flex flex-col gap-2">
                        <label className="text-[#E2E8F0] text-sm font-medium">Mot de passe</label>
                        <div className="flex items-center gap-3 h-[52px] px-4 rounded-[10px] border border-white/10 bg-[rgba(10,17,24,0.60)]">
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M4.16667 9.16663H15.8333C16.7538 9.16663 17.5 9.91282 17.5 10.8333V16.6666C17.5 17.5871 16.7538 18.3333 15.8333 18.3333H4.16667C3.24619 18.3333 2.5 17.5871 2.5 16.6666V10.8333C2.5 9.91282 3.24619 9.16663 4.16667 9.16663Z" stroke="#64748B" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M5.83325 9.16663V5.83329C5.83325 3.53365 7.70027 1.66663 9.99992 1.66663C12.2996 1.66663 14.1666 3.53365 14.1666 5.83329V9.16663" stroke="#64748B" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="flex-1 bg-transparent text-white text-[15px] outline-none placeholder-[#64748B]"
                                placeholder="••••••••"
                                disabled={isLoading}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="text-[#64748B] hover:text-[#94A3B8]"
                            >
                                {/* Same icon as Login */}
                                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M1.5 9C1.5 9 4 3.75 9 3.75C14 3.75 16.5 9 16.5 9C16.5 9 14 14.25 9 14.25C4 14.25 1.5 9 1.5 9Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Confirm Password field */}
                    <div className="flex flex-col gap-2">
                        <label className="text-[#E2E8F0] text-sm font-medium">Confirmer le mot de passe</label>
                        <div className="flex items-center gap-3 h-[52px] px-4 rounded-[10px] border border-white/10 bg-[rgba(10,17,24,0.60)]">
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M4.16667 9.16663H15.8333C16.7538 9.16663 17.5 9.91282 17.5 10.8333V16.6666C17.5 17.5871 16.7538 18.3333 15.8333 18.3333H4.16667C3.24619 18.3333 2.5 17.5871 2.5 16.6666V10.8333C2.5 9.91282 3.24619 9.16663 4.16667 9.16663Z" stroke="#64748B" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M5.83325 9.16663V5.83329C5.83325 3.53365 7.70027 1.66663 9.99992 1.66663C12.2996 1.66663 14.1666 3.53365 14.1666 5.83329V9.16663" stroke="#64748B" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <input
                                type={showPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="flex-1 bg-transparent text-white text-[15px] outline-none placeholder-[#64748B]"
                                placeholder="••••••••"
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-[52px] flex items-center justify-center gap-2.5 rounded-[10px] bg-[#10B981] shadow-[0_4px_12px_0_rgba(16,185,129,0.20)] text-white font-semibold hover:bg-[#0ea572] transition-colors disabled:opacity-50"
                    >
                        {isLoading ? "Réinitialisation..." : "Réinitialiser le mot de passe"}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <Link to="/login" className="text-[#10B981] text-sm font-medium hover:text-[#34D399] transition-colors">
                        Retour à la connexion
                    </Link>
                </div>
            </div>
        </div>
    );
}
