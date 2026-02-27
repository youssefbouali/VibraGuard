import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#071018" }}>
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-50"
          style={{
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.08) 2.5%, rgba(0,0,0,0) 2.5%), linear-gradient(90deg, rgba(0,0,0,0.08) 2.5%, rgba(0,0,0,0) 2.5%)",
          }}
        />
        {/* Radial gradients */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(137.64% 86.02% at 30% 20%, rgba(0,122,61,0.08) 0%, rgba(0,122,61,0) 50%), radial-gradient(137.64% 86.02% at 70% 80%, rgba(12,108,242,0.08) 0%, rgba(12,108,242,0) 50%)",
          }}
        />
        {/* Particles */}
        <div
          className="absolute rounded-full opacity-40"
          style={{
            width: 4,
            height: 4,
            left: "25%",
            top: "25%",
            background: "#007A3D",
            boxShadow: "0 0 12px 0 #007A3D",
          }}
        />
        <div
          className="absolute rounded-full opacity-40"
          style={{
            width: 6,
            height: 6,
            left: "20%",
            top: "60%",
            background: "#0C6CF2",
            boxShadow: "0 0 12px 0 #0C6CF2",
          }}
        />
        <div
          className="absolute rounded-full opacity-40"
          style={{
            width: 3,
            height: 3,
            right: "28%",
            top: "35%",
            background: "#007A3D",
            boxShadow: "0 0 12px 0 #007A3D",
          }}
        />
        <div
          className="absolute rounded-full opacity-40"
          style={{
            width: 5,
            height: 5,
            right: "22%",
            bottom: "34%",
            background: "#0C6CF2",
            boxShadow: "0 0 12px 0 #0C6CF2",
          }}
        />
        <div
          className="absolute rounded-full opacity-20"
          style={{
            width: 8,
            height: 8,
            left: "45%",
            bottom: "19%",
            background: "#007A3D",
            boxShadow: "0 0 12px 0 #007A3D",
          }}
        />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center gap-3 px-10 h-20 flex-shrink-0">
        <div
          className="flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0"
          style={{
            border: "1px solid rgba(16,185,129,0.20)",
            background:
              "linear-gradient(135deg, rgba(16,185,129,0.20) 0%, rgba(16,185,129,0.05) 100%)",
          }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clipPath="url(#clip0_header)">
              <path
                d="M18.3333 9.99984H16.2666C15.5181 9.99824 14.8604 10.4958 14.6583 11.2165L12.7 18.1832C12.674 18.2721 12.5926 18.3332 12.5 18.3332C12.4074 18.3332 12.3259 18.2721 12.3 18.1832L7.69996 1.8165C7.67403 1.72762 7.59255 1.6665 7.49996 1.6665C7.40737 1.6665 7.32589 1.72762 7.29996 1.8165L5.34163 8.78317C5.14037 9.50089 4.48702 9.9977 3.74163 9.99984H1.66663"
                stroke="#10B981"
                strokeWidth="1.66667"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
            <defs>
              <clipPath id="clip0_header">
                <rect width="20" height="20" fill="white" />
              </clipPath>
            </defs>
          </svg>
        </div>
        <span className="font-bold text-lg tracking-tight" style={{ letterSpacing: "-0.36px" }}>
          <span className="text-white">OCP </span>
          <span style={{ color: "#10B981" }}>VibraGuard</span>
        </span>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-8 py-12">
        {/* 404 + Image section */}
        <div className="relative flex items-center justify-center mb-10 w-full max-w-2xl">
          {/* 404 text behind the image */}
          <div
            className="absolute select-none font-black text-center leading-none pointer-events-none"
            style={{
              fontSize: "clamp(120px, 22vw, 320px)",
              letterSpacing: "-12px",
              WebkitTextStrokeWidth: "1px",
              WebkitTextStrokeColor: "rgba(255,255,255,0.12)",
              color: "transparent",
              lineHeight: 1,
            }}
          >
            404
          </div>

          {/* Card with image and floating badges */}
          <div className="relative z-10 flex flex-col items-center">
            {/* Top badge - Signal Perdu */}
            <div
              className="absolute flex items-center gap-2 px-4 py-2 rounded-md z-20"
              style={{
                top: 0,
                left: "-32px",
                transform: "translateY(-50%)",
                border: "1px solid rgba(0,0,0,0.08)",
                background: "rgba(11,21,24,0.85)",
                boxShadow: "0 8px 32px 0 rgba(0,0,0,0.50)",
                backdropFilter: "blur(6px)",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M14.4866 12L9.15329 2.66665C8.91654 2.24891 8.47346 1.99072 7.99329 1.99072C7.51312 1.99072 7.07004 2.24891 6.83329 2.66665L1.49995 12C1.26068 12.4144 1.26181 12.9252 1.50292 13.3385C1.74402 13.7519 2.18813 14.0043 2.66662 14H13.3333C13.8094 13.9995 14.2491 13.7452 14.487 13.3327C14.7248 12.9203 14.7247 12.4123 14.4866 12M7.99995 5.99999V8.66665M7.99995 11.3333H8.00662"
                  stroke="#D93F3F"
                  strokeWidth="1.33333"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="text-sm font-medium" style={{ color: "#E6F0F2" }}>
                Signal Perdu
              </span>
            </div>

            {/* Image card */}
            <div
              className="rounded-3xl p-px"
              style={{
                background: "linear-gradient(135deg, rgba(0,122,61,0.40) 0%, rgba(12,108,242,0.40) 100%)",
                width: "clamp(240px, 35vw, 320px)",
                height: "clamp(240px, 35vw, 320px)",
              }}
            >
              <div
                className="w-full h-full rounded-3xl overflow-hidden flex items-center justify-center"
                style={{ background: "#0B1518" }}
              >
                <img
                  src="https://api.builder.io/api/v1/image/assets/TEMP/78d61746e5bd14fcef7f2500d4473a3fe6d07150?width=636"
                  alt="Moteur en panne"
                  className="w-full h-full object-cover opacity-95"
                />
              </div>
            </div>

            {/* Bottom badge - Vibration */}
            <div
              className="absolute flex items-center gap-2 px-4 py-2 rounded-md z-20"
              style={{
                bottom: 0,
                right: "-32px",
                transform: "translateY(50%)",
                border: "1px solid rgba(0,0,0,0.08)",
                background: "rgba(11,21,24,0.85)",
                boxShadow: "0 8px 32px 0 rgba(0,0,0,0.50)",
                backdropFilter: "blur(6px)",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clipPath="url(#clip0_vibration)">
                  <path
                    d="M14.6666 8.00016H13.0133C12.4145 7.99888 11.8883 8.39694 11.7266 8.9735L10.1599 14.5468C10.1392 14.6179 10.074 14.6668 9.99992 14.6668C9.92584 14.6668 9.86066 14.6179 9.83992 14.5468L6.15992 1.4535C6.13918 1.38238 6.07399 1.3335 5.99992 1.3335C5.92584 1.3335 5.86066 1.38238 5.83992 1.4535L4.27325 7.02683C4.11225 7.601 3.58957 7.99846 2.99325 8.00016H1.33325"
                    stroke="#F2A900"
                    strokeWidth="1.33333"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_vibration">
                    <rect width="16" height="16" fill="white" />
                  </clipPath>
                </defs>
              </svg>
              <span className="text-sm font-medium" style={{ color: "#E6F0F2" }}>
                Vibration: 0 RMS
              </span>
            </div>
          </div>
        </div>

        {/* Text & CTA */}
        <div className="flex flex-col items-center gap-4 max-w-lg text-center mt-8">
          <h1
            className="font-bold text-4xl"
            style={{ color: "#E6F0F2", letterSpacing: "-1px" }}
          >
            Page non trouvée
          </h1>
          <p
            className="text-base leading-relaxed"
            style={{ color: "#C9E7E6", lineHeight: "1.6" }}
          >
            Le moteur que vous recherchez semble être hors ligne ou la page
            n'existe plus. Retournez au tableau de bord pour reprendre la
            surveillance.
          </p>
          <Link
            to="/"
            className="flex items-center gap-2 px-8 py-3 rounded-md font-semibold text-white text-sm transition-opacity hover:opacity-90 mt-2"
            style={{ background: "#007A3D", border: "1px solid transparent" }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M10.0001 15.8332L4.16675 9.99984L10.0001 4.1665M15.8334 9.99984H4.16675"
                stroke="white"
                strokeWidth="1.66667"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Retour au Dashboard
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 flex justify-center py-8 flex-shrink-0">
        <span className="text-sm" style={{ color: "#98A6A8" }}>
          © 2026 VibraGuard. Tous droits réservés.
        </span>
      </footer>
    </div>
  );
};

export default NotFound;
