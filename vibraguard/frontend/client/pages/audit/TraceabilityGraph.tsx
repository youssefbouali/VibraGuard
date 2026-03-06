const steps = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M18.1083 14.9999L11.4416 3.3332C11.1457 2.81101 10.5918 2.48828 9.99161 2.48828C9.3914 2.48828 8.83754 2.81101 8.54161 3.3332L1.87494 14.9999C1.57585 15.5178 1.57726 16.1564 1.87865 16.673C2.18003 17.1897 2.73516 17.5052 3.33327 17.4999H16.6666C17.2617 17.4993 17.8114 17.1813 18.1087 16.6658C18.406 16.1502 18.4058 15.5153 18.1083 14.9999M9.99994 7.49986V10.8332M9.99994 14.1665H10.0083" stroke="#007A3D" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    label: "Alerte #8402",
    sublabel: "24 Oct, 08:15",
    borderColor: "#007A3D",
    bgColor: "#061B1C",
    sublabelColor: "#98A6A8",
    status: "done",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M7.50008 1.66699H12.5001C12.9603 1.66699 13.3334 2.04009 13.3334 2.50033V4.16699C13.3334 4.62723 12.9603 5.00033 12.5001 5.00033H7.50008C7.03984 5.00033 6.66675 4.62723 6.66675 4.16699V2.50033C6.66675 2.04009 7.03984 1.66699 7.50008 1.66699V1.66699" stroke="#007A3D" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M13.3335 3.33398H15.0002C15.9206 3.33398 16.6668 4.08018 16.6668 5.00065V16.6673C16.6668 17.5878 15.9206 18.334 15.0002 18.334H5.00016C4.07969 18.334 3.3335 17.5878 3.3335 16.6673V5.00065C3.3335 4.08018 4.07969 3.33398 5.00016 3.33398H6.66683M10.0002 9.16732H13.3335M10.0002 13.334H13.3335M6.66683 9.16732H6.67516M6.66683 13.334H6.67516" stroke="#007A3D" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    label: "OT #4092",
    sublabel: "24 Oct, 08:30",
    borderColor: "#007A3D",
    bgColor: "#061B1C",
    sublabelColor: "#98A6A8",
    status: "done",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <g clipPath="url(#int-clip)">
          <path d="M12.25 5.24968C11.9324 5.57372 11.9324 6.09231 12.25 6.41635L13.5833 7.74968C13.9074 8.0673 14.4259 8.0673 14.75 7.74968L17.3383 5.16218C17.605 4.89385 18.0575 4.97885 18.1575 5.34385C18.6715 7.21324 18.0584 9.21126 16.5845 10.4707C15.1105 11.7302 13.0413 12.024 11.275 11.2247L4.68332 17.8163C3.99342 18.506 2.8734 18.5058 2.18373 17.8159C1.49407 17.126 1.49426 16.006 2.18415 15.3163L8.77582 8.72468C7.9765 6.95836 8.27033 4.88917 9.52978 3.41519C10.7892 1.94122 12.7873 1.3282 14.6566 1.84218C15.0216 1.94218 15.1066 2.39385 14.8391 2.66218L12.25 5.24968" stroke="#007A3D" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
        </g>
        <defs><clipPath id="int-clip"><rect width="20" height="20" fill="white"/></clipPath></defs>
      </svg>
    ),
    label: "Intervention",
    sublabel: "24 Oct, 14:30",
    borderColor: "#007A3D",
    bgColor: "#061B1C",
    sublabelColor: "#98A6A8",
    status: "done",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M3.33325 18.3337H14.9999C15.9204 18.3337 16.6666 17.5875 16.6666 16.667V5.83366L12.4999 1.66699H4.99992C4.07944 1.66699 3.33325 2.41318 3.33325 3.33366V6.66699" stroke="#0C6CF2" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M11.6667 1.66699V5.00033C11.6667 5.9208 12.4129 6.66699 13.3334 6.66699H16.6667M4.16675 10.0003L1.66675 12.5003L4.16675 15.0003M7.50008 15.0003L10.0001 12.5003L7.50008 10.0003" stroke="#0C6CF2" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    label: "Smart Contract",
    sublabel: "Validation en cours",
    borderColor: "#0C6CF2",
    bgColor: "#08192E",
    sublabelColor: "#0C6CF2",
    status: "active",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M17.5 6.66626C17.4994 6.07143 17.1818 5.52201 16.6667 5.22459L10.8333 1.89126C10.3177 1.59354 9.68233 1.59354 9.16667 1.89126L3.33333 5.22459C2.81819 5.52201 2.50061 6.07143 2.5 6.66626V13.3329C2.50061 13.9278 2.81819 14.4772 3.33333 14.7746L9.16667 18.1079C9.68233 18.4056 10.3177 18.4056 10.8333 18.1079L16.6667 14.7746C17.1818 14.4772 17.4994 13.9278 17.5 13.3329V6.66626" stroke="#98A6A8" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M2.75 5.83301L10 9.99967L17.25 5.83301M10 18.333V9.99967" stroke="#98A6A8" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    label: "Bloc #104830",
    sublabel: "Attente réseau",
    borderColor: "rgba(0,0,0,0.08)",
    bgColor: "#071018",
    sublabelColor: "#98A6A8",
    status: "pending",
  },
];

export function TraceabilityGraph() {
  return (
    <div className="flex flex-col gap-6 p-6 rounded-lg border border-black/[0.08] bg-[#0B1518] shadow-[0_4px_20px_0_rgba(0,0,0,0.15)]">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-3">
        <div className="flex items-center gap-2.5">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M7.5 10C7.5 11.3798 8.62021 12.5 10 12.5C11.3798 12.5 12.5 11.3798 12.5 10C12.5 8.62021 11.3798 7.5 10 7.5C8.62021 7.5 7.5 8.62021 7.5 10V10" stroke="#0C6CF2" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2.5 10H7.5M12.5 10H17.5" stroke="#0C6CF2" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-[#E6F0F2] text-base font-semibold">Traçabilité d'Intervention en Direct</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-black/[0.08] bg-[rgba(7,16,24,0.50)]">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M12.8334 7.00033H11.3867C10.8628 6.9992 10.4024 7.34751 10.2609 7.85199L8.89008 12.7287C8.87193 12.7909 8.8149 12.8337 8.75008 12.8337C8.68527 12.8337 8.62823 12.7909 8.61008 12.7287L5.39008 1.27199C5.37193 1.20977 5.3149 1.16699 5.25008 1.16699C5.18527 1.16699 5.12823 1.20977 5.11008 1.27199L3.73925 6.14866C3.59837 6.65106 3.14103 6.99883 2.61925 7.00033H1.16675" stroke="#98A6A8" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-[#98A6A8] text-xs font-semibold">MTR-Broyeur-04</span>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative overflow-x-auto">
        <div className="flex items-start min-w-[600px]">
          {steps.map((step, idx) => (
            <div key={idx} className="flex flex-col items-center flex-1 relative">
              {/* Connector line */}
              {idx < steps.length - 1 && (
                <div className="absolute top-6 left-1/2 w-full h-[2px] z-0">
                  {idx === 2 ? (
                    /* Green to blue gradient line with glowing dot */
                    <div className="w-full h-full relative">
                      <div
                        className="w-full h-full"
                        style={{ background: "linear-gradient(90deg, #007A3D 0%, #0C6CF2 100%)" }}
                      />
                      <div
                        className="absolute top-[-2px] rounded-sm"
                        style={{
                          width: "40px",
                          height: "6px",
                          left: "calc(50% - 20px)",
                          background: "#0C6CF2",
                          boxShadow: "0 0 12px 0 #0C6CF2",
                        }}
                      />
                    </div>
                  ) : idx <= 1 ? (
                    <div className="w-full h-full bg-[#007A3D]" />
                  ) : (
                    <div className="w-full h-full bg-black/[0.08]" />
                  )}
                </div>
              )}

              {/* Step circle */}
              <div
                className="relative z-10 flex w-12 h-12 items-center justify-center rounded-full border-2"
                style={{
                  borderColor: step.borderColor,
                  background: step.bgColor,
                }}
              >
                {step.icon}
              </div>

              {/* Labels */}
              <div className="flex flex-col items-center gap-1 mt-3">
                <span
                  className="text-[13px] font-semibold text-center"
                  style={{ color: step.status === "pending" ? "#98A6A8" : "#E6F0F2" }}
                >
                  {step.label}
                </span>
                <span
                  className="text-[11px] font-normal text-center"
                  style={{ color: step.sublabelColor }}
                >
                  {step.sublabel}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
