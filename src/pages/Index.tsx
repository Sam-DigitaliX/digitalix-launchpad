import Header from "@/components/landing/Header";
import HeroSection from "@/components/landing/HeroSection";
import ProblemSection from "@/components/landing/ProblemSection";
import BenefitsSection from "@/components/landing/BenefitsSection";
import SolutionsSection from "@/components/landing/SolutionsSection";
import ProcessSection from "@/components/landing/ProcessSection";
import IntegrationSection from "@/components/landing/IntegrationSection";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/landing/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <ProblemSection />
        <BenefitsSection />
        <SolutionsSection />
        <ProcessSection />
        <IntegrationSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
