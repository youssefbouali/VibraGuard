import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import KPIsSection from "@/components/KPIsSection";
import IntegrationsSection from "@/components/IntegrationsSection";
import LandingFooter from "@/components/LandingFooter";

export default function Index() {
  return (
    <div className="min-h-screen bg-[#071018] text-white">
      <Navbar />
      <main className="flex flex-col gap-[120px] pb-[120px]">
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <KPIsSection />
        <IntegrationsSection />
      </main>
      <LandingFooter />
    </div>
  );
}
