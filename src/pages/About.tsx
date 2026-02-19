import Header from "@/components/landing/Header";
import EvervaultGlow from "@/components/landing/EvervaultGlow";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/landing/Footer";
import AboutHero from "@/components/about/AboutHero";
import FounderSection from "@/components/about/FounderSection";
import ValuesSection from "@/components/about/ValuesSection";
import ExpertiseSection from "@/components/about/ExpertiseSection";
import NumbersSection from "@/components/about/NumbersSection";
import GeographySection from "@/components/about/GeographySection";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <EvervaultGlow />
      <Header />
      <main className="relative z-[1]">
        <AboutHero />
        <FounderSection />
        <ValuesSection />
        <ExpertiseSection />
        <NumbersSection />
        <GeographySection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default About;
