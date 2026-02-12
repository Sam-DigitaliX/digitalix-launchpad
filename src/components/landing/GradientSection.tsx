import { ReactNode } from "react";

interface GradientSectionProps {
  children: ReactNode;
  className?: string;
}

const GradientSection = ({ children, className = "" }: GradientSectionProps) => {
  return (
    <div
      className={`mx-4 md:mx-8 my-12 rounded-3xl overflow-hidden bg-gradient-to-b from-primary/10 via-background to-background border border-white/[0.06] p-12 md:p-20 ${className}`}
    >
      {children}
    </div>
  );
};

export default GradientSection;
