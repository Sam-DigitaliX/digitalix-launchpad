import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Header from "@/components/landing/Header";
import HeroSection from "@/components/landing/HeroSection";
import ClientLogosSection from "@/components/landing/ClientLogosSection";
import ProblemSolutionSection from "@/components/landing/ProblemSolutionSection";
import BenefitsSection from "@/components/landing/BenefitsSection";
import SolutionsSection from "@/components/landing/SolutionsSection";
import DeepDiveSection from "@/components/landing/DeepDiveSection";
import ProcessSection from "@/components/landing/ProcessSection";
import IntegrationSection from "@/components/landing/IntegrationSection";
import FAQSection from "@/components/landing/FAQSection";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/landing/Footer";

const Index = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        const element = document.querySelector(location.hash);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    }
  }, [location.hash]);
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <ProblemSolutionSection />
        <BenefitsSection />
        <SolutionsSection />
        <DeepDiveSection />
        <ProcessSection />
        <IntegrationSection />
        <ClientLogosSection />
        <FAQSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
