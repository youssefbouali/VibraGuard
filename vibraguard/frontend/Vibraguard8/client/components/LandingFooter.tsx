import { Link } from "react-router-dom";

const footerLinks = {
  Produit: ["Fonctionnalités", "Tarifs", "Cas d'usage", "Mises à jour"],
  Ressources: ["Documentation API", "Webinaires", "Blog Industriel", "Support Technique"],
  Contact: ["Ventes", "Partenariats", "Carrières"],
};

export default function LandingFooter() {
  return (
    <footer className="w-full border-t border-black/[0.08] bg-[rgba(10,17,24,0.80)] backdrop-blur-[12px] pt-16 pb-8">
      <div className="max-w-[1280px] mx-auto px-8 flex flex-col gap-16">
        {/* Top row */}
        <div className="flex flex-col lg:flex-row gap-12 justify-between">
          {/* Brand */}
          <div className="flex flex-col gap-4 max-w-[300px]">
            <div className="flex items-center gap-3">
              <div className="flex w-8 h-8 items-center justify-center rounded border border-[rgba(16,185,129,0.20)] bg-[rgba(16,185,129,0.10)]">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16.6667 10.8331C16.6667 14.9997 13.75 17.0831 10.2834 18.2914C10.1018 18.3529 9.90465 18.35 9.72504 18.2831C6.25004 17.0831 3.33337 14.9997 3.33337 10.8331V4.99972C3.33337 4.53949 3.70647 4.16639 4.16671 4.16639C5.83337 4.16639 7.91671 3.16639 9.36671 1.89972C9.73144 1.58811 10.2686 1.58811 10.6334 1.89972C12.0917 3.17472 14.1667 4.16639 15.8334 4.16639C16.2936 4.16639 16.6667 4.53949 16.6667 4.99972V10.8331Z" stroke="#10B981" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M7.5 9.99967L9.16667 11.6663L12.5 8.33301" stroke="#10B981" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="text-white text-xl font-medium tracking-[-0.4px]">
                OCP <span className="font-bold">VibraGuard</span>
              </span>
            </div>
            <p className="text-[#94A3B8] text-sm leading-[1.6]">
              La solution de référence pour la maintenance prédictive industrielle. Sécurisée par l'IA et la Blockchain.
            </p>
          </div>

          {/* Link columns */}
          <div className="flex flex-wrap gap-12">
            {Object.entries(footerLinks).map(([category, links]) => (
              <div key={category} className="flex flex-col gap-6">
                <h5 className="text-white text-[15px] font-semibold">{category}</h5>
                <ul className="flex flex-col gap-3">
                  {links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-[#94A3B8] text-sm hover:text-white transition-colors">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="border-t border-white/[0.05] pt-6">
          <p className="text-[#94A3B8] text-sm">© 2026 OCP Group. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}
