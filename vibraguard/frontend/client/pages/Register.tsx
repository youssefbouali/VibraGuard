import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(true);
  const [role, setRole] = useState("Technicien");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }

    if (!acceptTerms) {
      toast.error("Veuillez accepter les conditions d'utilisation");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, fullName, role }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Échec de l'inscription");
      }

      const data = await response.json();
      login(data.token, { email: data.email, fullName: data.fullName });

      toast.success("Compte créé avec succès !");
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Registration error:", error);
      toast.error(error.message || "Erreur lors de l'inscription. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col lg:flex-row overflow-hidden bg-[#0A1118]">
      {/* Background decorative circles */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 1440 900"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <g opacity="0.08">
          <path d="M-84 221C-84 386.575 50.4255 521 216 521C381.575 521 516 386.575 516 221C516 55.4255 381.575 -79 216 -79C50.4255 -79 -84 55.4255 -84 221Z" stroke="#10B981" />
          <path d="M-4 221C-4 342.421 94.5787 441 216 441C337.421 441 436 342.421 436 221C436 99.5787 337.421 1 216 1C94.5787 1 -4 99.5787 -4 221Z" stroke="#10B981" />
          <path d="M66 221C66 303.787 133.213 371 216 371C298.787 371 366 303.787 366 221C366 138.213 298.787 71 216 71C133.213 71 66 138.213 66 221Z" stroke="#10B981" />
        </g>
        <radialGradient id="reg-radial0" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(216 221) scale(600)">
          <stop stopColor="#10B981" stopOpacity="0.08" />
          <stop offset="1" stopColor="#10B981" stopOpacity="0" />
        </radialGradient>
        <path d="M-384 221C-384 552.149 -115.149 821 216 821C547.149 821 816 552.149 816 221C816 -110.149 547.149 -379 216 -379C-115.149 -379 -384 -110.149 -384 221Z" fill="url(#reg-radial0)" />
      </svg>

      {/* Left panel — branding */}
      <div className="relative hidden lg:flex flex-col justify-between w-[45%] min-h-screen p-10 xl:p-14 bg-gradient-to-br from-[#0A1118] to-[#0d1a24]">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#10B981]/30 bg-gradient-to-br from-[rgba(16,185,129,0.25)] to-[rgba(16,185,129,0.05)]">
            <svg width="16" height="16" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M29.3334 16.0001H26.0267C24.8292 15.9975 23.7768 16.7936 23.4534 17.9467L20.3201 29.0934C20.2786 29.2356 20.1482 29.3334 20.0001 29.3334C19.8519 29.3334 19.7216 29.2356 19.6801 29.0934L12.3201 2.90675C12.2786 2.76453 12.1482 2.66675 12.0001 2.66675C11.8519 2.66675 11.7216 2.76453 11.6801 2.90675L8.54675 14.0534C8.22474 15.2018 7.17938 15.9967 5.98675 16.0001H2.66675" stroke="#10B981" strokeWidth="2.66667" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="text-[#10B981] font-bold text-lg tracking-tight">VibraGuard</span>
        </div>

        {/* Main content */}
        <div className="flex flex-col gap-8">
          <div>
            <h1 className="text-white font-bold text-3xl xl:text-4xl leading-tight mb-6">
              Rejoignez VibraGuard et passez à la maintenance intelligente
            </h1>
            <div className="flex flex-col gap-4">
              <FeatureItem
                icon={
                  <svg width="18" height="18" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M29.3334 16.0001H26.0267C24.8292 15.9975 23.7768 16.7936 23.4534 17.9467L20.3201 29.0934C20.2786 29.2356 20.1482 29.3334 20.0001 29.3334C19.8519 29.3334 19.7216 29.2356 19.6801 29.0934L12.3201 2.90675C12.2786 2.76453 12.1482 2.66675 12.0001 2.66675C11.8519 2.66675 11.7216 2.76453 11.6801 2.90675L8.54675 14.0534C8.22474 15.2018 7.17938 15.9967 5.98675 16.0001H2.66675" stroke="#10B981" strokeWidth="2.66667" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                }
                label="Monitoring temps réel"
              />
              <FeatureItem
                icon={
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="#10B981" />
                    <path d="M12 6C8.69 6 6 8.69 6 12C6 15.31 8.69 18 12 18C15.31 18 18 15.31 18 12C18 8.69 15.31 6 12 6ZM12 16C9.79 16 8 14.21 8 12C8 9.79 9.79 8 12 8C14.21 8 16 9.79 16 12C16 14.21 14.21 16 12 16Z" fill="#10B981" />
                    <circle cx="12" cy="12" r="2" fill="#10B981" />
                  </svg>
                }
                label="IA prédictive"
              />
              <FeatureItem
                icon={
                  <svg width="18" height="18" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M29.3334 16.0001H26.0267C24.8292 15.9975 23.7768 16.7936 23.4534 17.9467L20.3201 29.0934C20.2786 29.2356 20.1482 29.3334 20.0001 29.3334C19.8519 29.3334 19.7216 29.2356 19.6801 29.0934L12.3201 2.90675C12.2786 2.76453 12.1482 2.66675 12.0001 2.66675C11.8519 2.66675 11.7216 2.76453 11.6801 2.90675L8.54675 14.0534C8.22474 15.2018 7.17938 15.9967 5.98675 16.0001H2.66675" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="23" cy="8" r="5" stroke="#10B981" strokeWidth="2" />
                    <path d="M21 8L22.5 9.5L25 7" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                }
                label="Réduction des coûts"
              />
            </div>
          </div>

          {/* Machine image */}
          <div className="rounded-2xl overflow-hidden border border-white/[0.06] bg-[rgba(10,17,24,0.80)] aspect-[16/9] flex items-center justify-center relative">
            <div className="absolute inset-0 bg-gradient-to-br from-[rgba(16,185,129,0.05)] to-transparent" />
            <div className="relative flex items-center justify-center w-full h-full p-4">
              {/* Industrial motor SVG illustration */}
              <svg width="220" height="140" viewBox="0 0 220 140" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-80">
                {/* Motor body */}
                <ellipse cx="110" cy="70" rx="50" ry="35" fill="none" stroke="#10B981" strokeWidth="1.5" strokeOpacity="0.5" />
                <ellipse cx="110" cy="70" rx="35" ry="24" fill="none" stroke="#10B981" strokeWidth="1" strokeOpacity="0.4" />
                <ellipse cx="110" cy="70" rx="20" ry="14" fill="none" stroke="#10B981" strokeWidth="1" strokeOpacity="0.6" />
                <ellipse cx="110" cy="70" rx="8" ry="8" fill="#10B981" fillOpacity="0.2" stroke="#10B981" strokeWidth="1" />
                {/* Shaft */}
                <line x1="160" y1="70" x2="190" y2="70" stroke="#10B981" strokeWidth="2" strokeOpacity="0.6" />
                <line x1="20" y1="70" x2="60" y2="70" stroke="#10B981" strokeWidth="2" strokeOpacity="0.6" />
                {/* Housing */}
                <rect x="65" y="50" width="90" height="40" rx="4" fill="none" stroke="#10B981" strokeWidth="1" strokeOpacity="0.3" />
                {/* Fins */}
                {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                  <line key={i} x1={70 + i * 12} y1="50" x2={70 + i * 12} y2="90" stroke="#10B981" strokeWidth="0.5" strokeOpacity="0.25" />
                ))}
                {/* Circular indicators */}
                <circle cx="110" cy="70" r="60" stroke="#10B981" strokeWidth="0.5" strokeOpacity="0.15" strokeDasharray="4 8" />
                <circle cx="110" cy="70" r="75" stroke="#10B981" strokeWidth="0.5" strokeOpacity="0.10" strokeDasharray="3 10" />
                {/* Data points */}
                <circle cx="42" cy="35" r="3" fill="#10B981" fillOpacity="0.7" />
                <circle cx="170" cy="42" r="2" fill="#10B981" fillOpacity="0.5" />
                <circle cx="155" cy="105" r="2.5" fill="#10B981" fillOpacity="0.6" />
                <circle cx="60" cy="108" r="2" fill="#10B981" fillOpacity="0.4" />
                {/* Connecting lines */}
                <line x1="42" y1="35" x2="75" y2="55" stroke="#10B981" strokeWidth="0.5" strokeOpacity="0.3" />
                <line x1="170" y1="42" x2="148" y2="58" stroke="#10B981" strokeWidth="0.5" strokeOpacity="0.3" />
                <line x1="155" y1="105" x2="140" y2="90" stroke="#10B981" strokeWidth="0.5" strokeOpacity="0.3" />
                <line x1="60" y1="108" x2="78" y2="90" stroke="#10B981" strokeWidth="0.5" strokeOpacity="0.3" />
              </svg>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-2 text-[#64748B]">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1.16675 6.99996C1.16675 10.2195 3.78058 12.8333 7.00008 12.8333C10.2196 12.8333 12.8334 10.2195 12.8334 6.99996C12.8334 3.78045 10.2196 1.16663 7.00008 1.16663C3.78058 1.16663 1.16675 3.78045 1.16675 6.99996Z" stroke="#64748B" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M8.65079 8.65079C7.7393 9.56127 6.26238 9.56072 5.35157 8.64957C4.44075 7.73842 4.44075 6.2615 5.35157 5.35035C6.26238 4.4392 7.7393 4.43865 8.65079 5.34913" stroke="#64748B" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-xs">2026 OCP Group. Tous droits réservés.</span>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="relative flex-1 flex items-center justify-center py-8 px-4 lg:px-10 min-h-screen">
        <div className="w-full max-w-[520px] rounded-2xl border border-white/[0.08] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.50),0_0_40px_0_rgba(16,185,129,0.05)] backdrop-blur-[12px] bg-[rgba(17,26,36,0.80)] px-8 py-10">
          <div className="mb-7 text-center">
            <h2 className="text-white font-bold text-2xl tracking-[-0.5px] mb-2">Créer un compte</h2>
            <p className="text-[#94A3B8] text-sm">
              Remplissez les informations ci-dessous pour rejoindre VibraGuard.
            </p>
          </div>

          <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
            {/* Full name */}
            <FormField label="Nom complet">
              <InputWrapper>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="flex-1 bg-transparent text-white text-[15px] font-normal outline-none placeholder-[#64748B]"
                  placeholder="Votre nom complet"
                  required
                />
                <CheckIcon />
              </InputWrapper>
            </FormField>

            {/* Email */}
            <FormField label="Email professionnel">
              <InputWrapper>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 bg-transparent text-white text-[15px] font-normal outline-none placeholder-[#64748B]"
                  placeholder="votre@email.com"
                  required
                />
                <CheckIcon />
              </InputWrapper>
            </FormField>

            {/* Password + Confirm */}
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Mot de passe">
                <InputWrapper>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="flex-1 bg-transparent text-white text-[15px] font-normal outline-none min-w-0"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="flex-shrink-0 text-[#64748B] hover:text-[#94A3B8] transition-colors"
                    aria-label="Toggle password visibility"
                  >
                    <EyeOffIcon />
                  </button>
                </InputWrapper>
                {/* Password strength */}
                <div className="flex items-center gap-2 mt-1.5">
                  <div className="flex gap-1 flex-1">
                    <div className="h-1 flex-1 rounded-full bg-[#10B981]" />
                    <div className="h-1 flex-1 rounded-full bg-[#10B981]" />
                    <div className="h-1 flex-1 rounded-full bg-[#10B981]" />
                    <div className="h-1 flex-1 rounded-full bg-[rgba(255,255,255,0.10)]" />
                  </div>
                  <span className="text-[#10B981] text-xs font-medium">Fort</span>
                </div>
              </FormField>
              <FormField label="Confirmation">
                <InputWrapper>
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="flex-1 bg-transparent text-white text-[15px] font-normal outline-none min-w-0"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="flex-shrink-0 text-[#64748B] hover:text-[#94A3B8] transition-colors"
                    aria-label="Toggle confirm visibility"
                  >
                    <CheckIcon />
                  </button>
                </InputWrapper>
              </FormField>
            </div>

            {/* Company + Role */}
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Entreprise">
                <InputWrapper>
                  <input
                    type="text"
                    defaultValue="OCP Group"
                    className="flex-1 bg-transparent text-white text-[15px] font-normal outline-none min-w-0"
                    placeholder="Votre entreprise"
                  />
                </InputWrapper>
              </FormField>
              <FormField label="Rôle">
                <div className="flex items-center h-[48px] px-4 rounded-[10px] border border-white/10 bg-[rgba(10,17,24,0.60)]">
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="flex-1 bg-transparent text-white text-[15px] font-normal outline-none appearance-none cursor-pointer min-w-0"
                  >
                    <option value="Technicien" className="bg-[#0d1a24]">Technicien</option>
                    <option value="Ingénieur" className="bg-[#0d1a24]">Ingénieur</option>
                    <option value="Manager" className="bg-[#0d1a24]">Manager</option>
                    <option value="Administrateur" className="bg-[#0d1a24]">Administrateur</option>
                  </select>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0 ml-1">
                    <path d="M4 6L8 10L12 6" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </FormField>
            </div>

            {/* Terms */}
            <label className="flex items-start gap-3 cursor-pointer">
              <button
                type="button"
                onClick={() => setAcceptTerms(!acceptTerms)}
                className={`w-5 h-5 mt-0.5 flex items-center justify-center rounded-[6px] border transition-colors flex-shrink-0 ${acceptTerms ? "bg-[#10B981] border-[#10B981]" : "bg-transparent border-[#64748B]"}`}
                role="checkbox"
                aria-checked={acceptTerms}
              >
                {acceptTerms && (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11.6666 3.5L5.24992 9.91667L2.33325 7" stroke="white" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
              <span className="text-[#CBD5E1] text-sm leading-snug">
                J'accepte les{" "}
                <a href="#" className="text-[#10B981] hover:text-[#34D399] transition-colors">Conditions d'utilisation</a>
                {" "}et la{" "}
                <a href="#" className="text-[#10B981] hover:text-[#34D399] transition-colors">Politique de confidentialité</a>.
              </span>
            </label>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-[52px] flex items-center justify-center rounded-[10px] bg-[#10B981] shadow-[0_4px_12px_0_rgba(16,185,129,0.20)] text-white font-semibold text-base hover:bg-[#0ea572] active:bg-[#059669] transition-colors mt-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Création en cours..." : "Créer un compte"}
            </button>
          </form>

          {/* Login link */}
          <p className="mt-5 text-center text-[#64748B] text-sm">
            Déjà un compte ?{" "}
            <Link to="/" className="text-[#10B981] font-medium hover:text-[#34D399] transition-colors">
              Se connecter
            </Link>
          </p>

          {/* Footer (mobile only) */}
          <div className="mt-6 flex items-center justify-center gap-2 text-[#64748B] lg:hidden">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1.16675 6.99996C1.16675 10.2195 3.78058 12.8333 7.00008 12.8333C10.2196 12.8333 12.8334 10.2195 12.8334 6.99996C12.8334 3.78045 10.2196 1.16663 7.00008 1.16663C3.78058 1.16663 1.16675 3.78045 1.16675 6.99996Z" stroke="#64748B" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M8.65079 8.65079C7.7393 9.56127 6.26238 9.56072 5.35157 8.64957C4.44075 7.73842 4.44075 6.2615 5.35157 5.35035C6.26238 4.4392 7.7393 4.43865 8.65079 5.34913" stroke="#64748B" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-xs">2026 OCP Group. Tous droits réservés.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[#E2E8F0] text-sm font-medium">{label}</label>
      {children}
    </div>
  );
}

function InputWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 h-[48px] px-4 rounded-[10px] border border-white/10 bg-[rgba(10,17,24,0.60)]">
      {children}
    </div>
  );
}

function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
      <path d="M15 4.5L7 13.5L3 9" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clipPath="url(#reg-eye-clip)">
        <path d="M8.04961 3.80695C11.64 3.37908 15.0757 5.39517 16.4534 8.7382C16.5159 8.90659 16.5159 9.09182 16.4534 9.2602C16.1773 9.92824 15.8131 10.5563 15.3704 11.1277M10.5629 10.6185C9.68001 11.4711 8.27667 11.4589 7.40877 10.591C6.54087 9.72314 6.52867 8.31981 7.38136 7.43695" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M13.1091 13.1243C11.0961 14.3167 8.66427 14.5759 6.44511 13.8344C4.22596 13.093 2.43834 11.4241 1.54639 9.261C1.48389 9.09261 1.48389 8.90739 1.54639 8.739C2.21136 7.12639 3.3814 5.77294 4.88089 4.88175M1.49989 1.5L16.4999 16.5" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <defs>
        <clipPath id="reg-eye-clip">
          <rect width="18" height="18" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}

function FeatureItem({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#10B981]/20 bg-[rgba(16,185,129,0.08)] flex-shrink-0">
        {icon}
      </div>
      <span className="text-[#CBD5E1] text-sm font-medium">{label}</span>
    </div>
  );
}
