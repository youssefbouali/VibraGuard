import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            toast({
                title: "Erreur",
                description: "Veuillez entrer votre adresse email.",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);
        // Simuler l'envoi de l'email
        setTimeout(() => {
            setIsLoading(false);
            setIsSubmitted(true);
            toast({
                title: "Email envoyé",
                description: "Si un compte est associé à cette adresse, vous recevrez un lien de réinitialisation.",
            });
        }, 1500);
    };

    return (
        <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#0A1118] p-4 sm:p-6">
            {/* Background decorative SVG (même que Login) */}
            <svg
                className="absolute inset-0 w-full h-full"
                viewBox="0 0 1440 884"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                preserveAspectRatio="xMidYMid slice"
                aria-hidden="true"
            >
                <g clipPath="url(#forgot-clip)">
                    <path
                        d="M-384 221C-384 552.149 -115.149 821 216 821C547.149 821 816 552.149 816 221C816 -110.149 547.149 -379 216 -379C-115.149 -379 -384 -110.149 -384 221Z"
                        fill="url(#forgot-radial0)"
                    />
                    <path
                        d="M424 663C424 1104.53 782.468 1463 1224 1463C1665.53 1463 2024 1104.53 2024 663C2024 221.468 1665.53 -137 1224 -137C782.468 -137 424 221.468 424 663Z"
                        fill="url(#forgot-radial1)"
                    />
                    <path
                        d="M320 442C320 662.766 499.234 842 720 842C940.766 842 1120 662.766 1120 442C1120 221.234 940.766 42 720 42C499.234 42 320 221.234 320 442Z"
                        fill="url(#forgot-radial2)"
                    />
                </g>
                <defs>
                    <radialGradient id="forgot-radial0" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(216 221) scale(600)">
                        <stop stopColor="#10B981" stopOpacity="0.08" />
                        <stop offset="1" stopColor="#10B981" stopOpacity="0" />
                    </radialGradient>
                    <radialGradient id="forgot-radial1" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(1224 663) scale(800)">
                        <stop stopColor="#0EA5E9" stopOpacity="0.05" />
                        <stop offset="1" stopColor="#0EA5E9" stopOpacity="0" />
                    </radialGradient>
                    <radialGradient id="forgot-radial2" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(720 442) scale(400)">
                        <stop stopColor="#10B981" stopOpacity="0.08" />
                        <stop offset="1" stopColor="#10B981" stopOpacity="0" />
                    </radialGradient>
                    <clipPath id="forgot-clip">
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
                        <h1 className="text-white font-bold text-2xl leading-tight">Mot de passe oublié</h1>
                        <p className="text-[#94A3B8] text-sm mt-2">
                            Entrez votre email pour recevoir un lien de réinitialisation.
                        </p>
                    </div>
                </div>

                {!isSubmitted ? (
                    <form className="w-full flex flex-col gap-6" onSubmit={handleSubmit}>
                        <div className="flex flex-col gap-2">
                            <label className="text-[#E2E8F0] text-sm font-medium">Email professionnel</label>
                            <div className="flex items-center gap-3 h-[52px] px-4 rounded-[10px] border border-white/10 bg-[rgba(10,17,24,0.60)]">
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M18.3334 5.83337L10.8409 10.6059C10.3233 10.9065 9.68432 10.9065 9.16675 10.6059L1.66675 5.83337" stroke="#64748B" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M3.33341 3.33337H16.6667C17.5872 3.33337 18.3334 4.07957 18.3334 5.00004V15C18.3334 15.9205 17.5872 16.6667 16.6667 16.6667H3.33341C2.41294 16.6667 1.66675 15.9205 1.66675 15V5.00004C1.66675 4.07957 2.41294 3.33337 3.33341 3.33337Z" stroke="#64748B" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="flex-1 bg-transparent text-white text-[15px] outline-none placeholder-[#64748B]"
                                    placeholder="votre@email.com"
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-[52px] flex items-center justify-center gap-2.5 rounded-[10px] bg-[#10B981] shadow-[0_4px_12px_0_rgba(16,185,129,0.20)] text-white font-semibold hover:bg-[#0ea572] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? "Envoi en cours..." : "Envoyer le lien"}
                        </button>
                    </form>
                ) : (
                    <div className="w-full flex flex-col gap-6 text-center">
                        <div className="p-4 rounded-lg bg-[#10B981]/10 border border-[#10B981]/20">
                            <p className="text-[#10B981] text-sm">
                                Un email de réinitialisation a été envoyé à <strong>{email}</strong>.
                            </p>
                        </div>
                        <button
                            onClick={() => setIsSubmitted(false)}
                            className="text-[#64748B] text-sm hover:text-white transition-colors"
                        >
                            Renvoyer l'email
                        </button>
                    </div>
                )}

                <div className="mt-8 text-center">
                    <Link to="/login" className="text-[#10B981] text-sm font-medium hover:text-[#34D399] transition-colors flex items-center justify-center gap-2">
                        <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M15.8334 10H4.16675M4.16675 10L10.0001 15.8333M4.16675 10L10.0001 4.16663" stroke="currentColor" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Retour à la connexion
                    </Link>
                </div>
            </div>
        </div>
    );
}
