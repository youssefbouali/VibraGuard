const integrations = [
  {
    label: "IoT / Edge",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 20.0001H12.01M2 8.82015C7.69401 3.72727 16.306 3.72727 22 8.82015M5 12.8591C8.88844 9.04772 15.1116 9.04772 19 12.8591M8.5 16.4291C10.4442 14.5234 13.5558 14.5234 15.5 16.4291" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: "Cloud Azure / AWS",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M17.5 19H9.00005C5.39575 18.9991 2.38131 16.2614 2.03435 12.6738C1.68739 9.08627 4.12133 5.82168 7.65865 5.13007C11.196 4.43846 14.6802 6.54594 15.71 9.99999H17.5C19.9837 9.99999 22 12.0164 22 14.5C22 16.9836 19.9837 19 17.5 19" stroke="#0EA5E9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: "API REST / GraphQL",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 18L22 12L16 6M8 6L2 12L8 18" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: "SCADA / ERP",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 3H20C21.1038 3 22 3.89617 22 5V15C22 16.1038 21.1038 17 20 17H4C2.89617 17 2 16.1038 2 15V5C2 3.89617 2.89617 3 4 3Z" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8 21H16M12 17V21" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

export default function IntegrationsSection() {
  return (
    <section className="w-full py-0">
      <div className="max-w-[1280px] mx-auto px-8 flex flex-col items-center gap-12">
        <h2 className="text-white text-[clamp(22px,2.5vw,28px)] font-bold tracking-[-0.56px] text-center">
          S'intègre parfaitement avec votre écosystème
        </h2>
        <div className="flex flex-wrap justify-center gap-4 w-full">
          {integrations.map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-3 px-6 py-4 rounded-lg border border-black/[0.08] bg-[#0B1518] backdrop-blur-[12px]"
            >
              {item.icon}
              <span className="text-white text-base font-medium">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
