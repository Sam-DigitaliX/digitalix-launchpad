import { ReactNode } from "react";

interface GradientSectionProps {
  children: ReactNode;
  className?: string;
}

const GradientSection = ({ children, className = "" }: GradientSectionProps) => {
  return (
    <div className="relative mx-4 md:mx-8 my-16">
      {/* Glow orb above the section */}
      <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[500px] h-[200px] bg-primary/20 rounded-full blur-[100px] pointer-events-none" />

      {/* Main section container */}
      <div
        className={`relative rounded-t-[40px] pt-16 md:pt-24 px-8 md:px-20 pb-16 md:pb-24 ${className}`}
        style={{
          background: 'linear-gradient(180deg, hsl(262 83% 58% / 0.18) 0%, hsl(262 83% 58% / 0.06) 30%, hsl(0 0% 0% / 0) 100%)',
        }}
      >
        {/* Subtle top border glow */}
        <div
          className="absolute inset-x-0 top-0 h-px rounded-t-[40px]"
          style={{
            background: 'linear-gradient(90deg, transparent, hsl(262 83% 58% / 0.3) 30%, hsl(262 83% 58% / 0.4) 50%, hsl(262 83% 58% / 0.3) 70%, transparent)',
          }}
        />

        {children}
      </div>
    </div>
  );
};

export default GradientSection;
