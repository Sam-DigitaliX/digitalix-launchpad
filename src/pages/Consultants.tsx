import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Header from "@/components/landing/Header";
import EvervaultGlow from "@/components/landing/EvervaultGlow";
import HeroSection from "@/components/landing/HeroSection";
import TrackingDemoSection from "@/components/landing/TrackingDemoSection";
import ReviewsCarouselSection from "@/components/landing/ReviewsCarouselSection";
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
      const SCROLL_DELAY_MS = 100;
      setTimeout(() => {
        const id = location.hash.replace(/^#/, '');
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, SCROLL_DELAY_MS);
    }
  }, [location.hash]);
  return (
    <div className="min-h-screen bg-background">
      <EvervaultGlow />
      <Header />
      <main>
        <HeroSection />
        <TrackingDemoSection />
        <ReviewsCarouselSection />
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
