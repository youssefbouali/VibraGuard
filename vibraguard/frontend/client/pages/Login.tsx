import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [email, setEmail] = useState("expert.maintenance@ocp.com");
  const [password, setPassword] = useState("••••••••");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // For now, redirect directly to dashboard as requested
    navigate("/dashboard");
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
        <g clipPath="url(#login-clip)">
          <path
            d="M-384 221C-384 552.149 -115.149 821 216 821C547.149 821 816 552.149 816 221C816 -110.149 547.149 -379 216 -379C-115.149 -379 -384 -110.149 -384 221Z"
            fill="url(#login-radial0)"
          />
          <path
            d="M424 663C424 1104.53 782.468 1463 1224 1463C1665.53 1463 2024 1104.53 2024 663C2024 221.468 1665.53 -137 1224 -137C782.468 -137 424 221.468 424 663Z"
            fill="url(#login-radial1)"
          />
          <path
            d="M320 442C320 662.766 499.234 842 720 842C940.766 842 1120 662.766 1120 442C1120 221.234 940.766 42 720 42C499.234 42 320 221.234 320 442Z"
            fill="url(#login-radial2)"
          />
          <g opacity="0.1">
            <path d="M66 221C66 303.787 133.213 371 216 371C298.787 371 366 303.787 366 221C366 138.213 298.787 71 216 71C133.213 71 66 138.213 66 221Z" stroke="#10B981" />
            <path d="M-4 221C-4 342.421 94.5787 441 216 441C337.421 441 436 342.421 436 221C436 99.5787 337.421 1 216 1C94.5787 1 -4 99.5787 -4 221Z" stroke="#10B981" />
            <path d="M-84 221C-84 386.575 50.4255 521 216 521C381.575 521 516 386.575 516 221C516 55.4255 381.575 -79 216 -79C50.4255 -79 -84 55.4255 -84 221Z" stroke="#10B981" />
            <path d="M1024 663C1024 773.383 1113.62 863 1224 863C1334.38 863 1424 773.383 1424 663C1424 552.617 1334.38 463 1224 463C1113.62 463 1024 552.617 1024 663Z" stroke="#10B981" />
            <path d="M904 663C904 839.613 1047.39 983 1224 983C1400.61 983 1544 839.613 1544 663C1544 486.387 1400.61 343 1224 343C1047.39 343 904 486.387 904 663Z" stroke="#10B981" />
            <path d="M774 663C774 911.362 975.638 1113 1224 1113C1472.36 1113 1674 911.362 1674 663C1674 414.638 1472.36 213 1224 213C975.638 213 774 414.638 774 663Z" stroke="#10B981" />
          </g>
        </g>
        <defs>
          <radialGradient id="login-radial0" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(216 221) scale(600)">
            <stop stopColor="#10B981" stopOpacity="0.08" />
            <stop offset="1" stopColor="#10B981" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="login-radial1" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(1224 663) scale(800)">
            <stop stopColor="#0EA5E9" stopOpacity="0.05" />
            <stop offset="1" stopColor="#0EA5E9" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="login-radial2" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(720 442) scale(400)">
            <stop stopColor="#10B981" stopOpacity="0.08" />
            <stop offset="1" stopColor="#10B981" stopOpacity="0" />
          </radialGradient>
          <clipPath id="login-clip">
            <rect width="1440" height="884" fill="white" />
          </clipPath>
        </defs>
      </svg>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-[480px] rounded-xl sm:rounded-2xl border border-white/[0.08] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.50),0_0_40px_0_rgba(16,185,129,0.05)] backdrop-blur-[12px] bg-[rgba(17,26,36,0.70)] px-6 sm:px-10 py-8 sm:py-12 flex flex-col items-center gap-0">

        {/* Logo icon */}
        <div className="mb-6 flex flex-col items-center gap-4 sm:gap-5">
          <div className="relative w-12 sm:w-16 h-12 sm:h-16 flex items-center justify-center rounded-lg sm:rounded-2xl border border-[#10B981]/20 bg-gradient-to-br from-[rgba(16,185,129,0.20)] to-[rgba(16,185,129,0.05)] shadow-[0_0_20px_0_rgba(16,185,129,0.20)]">
            <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="sm:w-[32px] sm:h-[32px]">
              <path d="M29.3334 16.0001H26.0267C24.8292 15.9975 23.7768 16.7936 23.4534 17.9467L20.3201 29.0934C20.2786 29.2356 20.1482 29.3334 20.0001 29.3334C19.8519 29.3334 19.7216 29.2356 19.6801 29.0934L12.3201 2.90675C12.2786 2.76453 12.1482 2.66675 12.0001 2.66675C11.8519 2.66675 11.7216 2.76453 11.6801 2.90675L8.54675 14.0534C8.22474 15.2018 7.17938 15.9967 5.98675 16.0001H2.66675" stroke="#10B981" strokeWidth="2.66667" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          {/* Title */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2">
              <span className="text-white font-bold text-2xl sm:text-[36px] leading-tight tracking-[-0.72px]">OCP</span>
              <span className="text-[#10B981] font-bold text-2xl sm:text-[36px] leading-tight tracking-[-0.72px]">VibraGuard</span>
            </div>
            <p className="text-[#94A3B8] text-xs sm:text-[15px] font-normal text-center">
              Plateforme de maintenance prédictive I4.0
            </p>
          </div>
        </div>

        {/* Form */}
        <form className="w-full flex flex-col gap-4 sm:gap-6" onSubmit={handleSubmit}>
          {/* Email field */}
          <div className="flex flex-col gap-2">
            <label className="text-[#E2E8F0] text-xs sm:text-sm font-medium">
              Email professionnel
            </label>
            <div className="flex items-center gap-3 h-10 sm:h-[52px] px-3 sm:px-4 rounded-lg sm:rounded-[10px] border border-white/10 bg-[rgba(10,17,24,0.60)]">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
                <path d="M18.3334 5.83337L10.8409 10.6059C10.3233 10.9065 9.68432 10.9065 9.16675 10.6059L1.66675 5.83337" stroke="#64748B" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M3.33341 3.33337H16.6667C17.5872 3.33337 18.3334 4.07957 18.3334 5.00004V15C18.3334 15.9205 17.5872 16.6667 16.6667 16.6667H3.33341C2.41294 16.6667 1.66675 15.9205 1.66675 15V5.00004C1.66675 4.07957 2.41294 3.33337 3.33341 3.33337Z" stroke="#64748B" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-transparent text-white text-xs sm:text-[15px] font-normal outline-none placeholder-[#64748B]"
                placeholder="votre@email.com"
              />
            </div>
          </div>

          {/* Password field */}
          <div className="flex flex-col gap-2">
            <label className="text-[#E2E8F0] text-xs sm:text-sm font-medium">
              Mot de passe
            </label>
            <div className="flex items-center gap-3 h-10 sm:h-[52px] px-3 sm:px-4 rounded-lg sm:rounded-[10px] border border-white/10 bg-[rgba(10,17,24,0.60)]">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
                <path d="M4.16667 9.16663H15.8333C16.7538 9.16663 17.5 9.91282 17.5 10.8333V16.6666C17.5 17.5871 16.7538 18.3333 15.8333 18.3333H4.16667C3.24619 18.3333 2.5 17.5871 2.5 16.6666V10.8333C2.5 9.91282 3.24619 9.16663 4.16667 9.16663Z" stroke="#64748B" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M5.83325 9.16663V5.83329C5.83325 3.53365 7.70027 1.66663 9.99992 1.66663C12.2996 1.66663 14.1666 3.53365 14.1666 5.83329V9.16663" stroke="#64748B" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="flex-1 bg-transparent text-white text-xs sm:text-[15px] font-normal outline-none"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="flex-shrink-0 w-5 h-5 flex items-center justify-center text-[#64748B] hover:text-[#94A3B8] transition-colors"
                aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1.5 9C1.5 9 4 3.75 9 3.75C14 3.75 16.5 9 16.5 9C16.5 9 14 14.25 9 14.25C4 14.25 1.5 9 1.5 9Z" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M9 11.25C10.2426 11.25 11.25 10.2426 11.25 9C11.25 7.75736 10.2426 6.75 9 6.75C7.75736 6.75 6.75 7.75736 6.75 9C6.75 10.2426 7.75736 11.25 9 11.25Z" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g clipPath="url(#login-eye-clip)">
                      <path d="M8.04961 3.80695C11.64 3.37908 15.0757 5.39517 16.4534 8.7382C16.5159 8.90659 16.5159 9.09182 16.4534 9.2602C16.1773 9.92824 15.8131 10.5563 15.3704 11.1277M10.5629 10.6185C9.68001 11.4711 8.27667 11.4589 7.40877 10.591C6.54087 9.72314 6.52867 8.31981 7.38136 7.43695" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M13.1091 13.1243C11.0961 14.3167 8.66427 14.5759 6.44511 13.8344C4.22596 13.093 2.43834 11.4241 1.54639 9.261C1.48389 9.09261 1.48389 8.90739 1.54639 8.739C2.21136 7.12639 3.3814 5.77294 4.88089 4.88175M1.49989 1.5L16.4999 16.5" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </g>
                    <defs>
                      <clipPath id="login-eye-clip">
                        <rect width="18" height="18" fill="white" />
                      </clipPath>
                    </defs>
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Remember me + forgot password */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <button
                type="button"
                onClick={() => setRememberMe(!rememberMe)}
                className={`w-4 sm:w-5 h-4 sm:h-5 flex items-center justify-center rounded-[6px] border transition-colors flex-shrink-0 ${rememberMe ? "bg-[#10B981] border-[#10B981]" : "bg-transparent border-[#64748B]"}`}
                aria-checked={rememberMe}
                role="checkbox"
              >
                {rememberMe && (
                  <svg width="12" height="12" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" className="sm:w-[14px] sm:h-[14px]">
                    <path d="M11.6666 3.5L5.24992 9.91667L2.33325 7" stroke="white" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
              <span className="text-[#CBD5E1] text-xs sm:text-sm font-normal">Se souvenir de moi</span>
            </label>
            <Link to="/forgot-password" className="text-[#10B981] text-xs sm:text-sm font-medium hover:text-[#34D399] transition-colors">
              Mot de passe oublié ?
            </Link>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            className="w-full h-10 sm:h-[52px] flex items-center justify-center gap-2.5 rounded-lg sm:rounded-[10px] bg-[#10B981] shadow-[0_4px_12px_0_rgba(16,185,129,0.20)] text-white font-semibold text-xs sm:text-base hover:bg-[#0ea572] active:bg-[#059669] transition-colors"
          >
            <span>Se connecter</span>
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="sm:w-[20px] sm:h-[20px] hidden sm:block">
              <path d="M4.16675 9.99996H15.8334M10.0001 4.16663L15.8334 9.99996L10.0001 15.8333" stroke="white" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </form>

        {/* Register link */}
        <p className="mt-4 sm:mt-6 text-[#64748B] text-xs sm:text-sm text-center">
          Pas encore de compte ?{" "}
          <Link to="/register" className="text-[#10B981] font-medium hover:text-[#34D399] transition-colors">
            Créer un compte
          </Link>
        </p>

        {/* Footer */}
        <div className="mt-6 sm:mt-8 flex items-center justify-center gap-2 text-[#64748B]">
          <svg width="12" height="12" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" className="sm:w-[14px] sm:h-[14px]">
            <path d="M1.16675 6.99996C1.16675 10.2195 3.78058 12.8333 7.00008 12.8333C10.2196 12.8333 12.8334 10.2195 12.8334 6.99996C12.8334 3.78045 10.2196 1.16663 7.00008 1.16663C3.78058 1.16663 1.16675 3.78045 1.16675 6.99996Z" stroke="#64748B" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M8.65079 8.65079C7.7393 9.56127 6.26238 9.56072 5.35157 8.64957C4.44075 7.73842 4.44075 6.2615 5.35157 5.35035C6.26238 4.4392 7.7393 4.43865 8.65079 5.34913" stroke="#64748B" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-xs sm:text-sm">2026 OCP Group. Tous droits réservés.</span>
        </div>
      </div>
    </div>
  );
}
