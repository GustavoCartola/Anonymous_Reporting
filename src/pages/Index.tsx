import { HeroSection } from "@/components/ui/hero-section";
import { ReportForm } from "@/components/ui/report-form";
import { TrackingSection } from "@/components/ui/tracking-section";
import { HowItWorks } from "@/components/ui/how-it-works";

const Index = () => {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <HowItWorks />
      <ReportForm />
      <TrackingSection />
    </div>
  );
};

export default Index;
