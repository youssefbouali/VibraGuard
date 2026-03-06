import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex h-[71px] items-center justify-between px-10 border-b border-white/[0.05] bg-[rgba(7,16,24,0.80)] backdrop-blur-[12px]">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-3 flex-shrink-0">
        <div className="flex w-8 h-8 items-center justify-center rounded border border-[rgba(16,185,129,0.20)] bg-[rgba(16,185,129,0.10)]">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16.6667 10.8331C16.6667 14.9997 13.75 17.0831 10.2834 18.2914C10.1018 18.3529 9.90465 18.35 9.72504 18.2831C6.25004 17.0831 3.33337 14.9997 3.33337 10.8331V4.99972C3.33337 4.53949 3.70647 4.16639 4.16671 4.16639C5.83337 4.16639 7.91671 3.16639 9.36671 1.89972C9.73144 1.58811 10.2686 1.58811 10.6334 1.89972C12.0917 3.17472 14.1667 4.16639 15.8334 4.16639C16.2936 4.16639 16.6667 4.53949 16.6667 4.99972V10.8331Z" stroke="#10B981" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M7.5 9.99967L9.16667 11.6663L12.5 8.33301" stroke="#10B981" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <span className="text-white text-xl font-medium tracking-[-0.4px]">
          OCP <span className="font-bold">VibraGuard</span>
        </span>
      </Link>

      {/* Nav links */}
      <nav className="hidden md:flex items-center gap-8">
        <a href="#" className="text-white text-sm font-medium hover:text-[#10B981] transition-colors">Accueil</a>
        <a href="#features" className="text-[#94A3B8] text-sm font-medium hover:text-white transition-colors">Fonctionnalités</a>
        <a href="#solutions" className="text-[#94A3B8] text-sm font-medium hover:text-white transition-colors">Solutions</a>
        <a href="#about" className="text-[#94A3B8] text-sm font-medium hover:text-white transition-colors">À propos</a>
        <a href="#contact" className="text-[#94A3B8] text-sm font-medium hover:text-white transition-colors">Contact</a>
      </nav>

      {/* CTA buttons */}
      <div className="flex items-center gap-3">
        <Link
          to="/login"
          className="hidden sm:flex px-5 py-2.5 rounded-xl border border-white/[0.08] text-white text-sm font-medium hover:bg-white/[0.05] transition-colors"
        >
          Se connecter
        </Link>
        <Link
          to="/login"
          className="flex px-5 py-2.5 rounded-xl bg-[#007A3D] text-white text-sm font-medium shadow-[0_4px_14px_0_rgba(16,185,129,0.20)] hover:bg-[#008f47] transition-colors"
        >
          Commencer
        </Link>
      </div>
    </header>
  );
}
