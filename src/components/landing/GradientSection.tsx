import { ReactNode } from "react";

interface GradientSectionProps {
  children: ReactNode;
  className?: string;
}

const GradientSection = ({ children, className = "" }: GradientSectionProps) => {
  return (
    <div className="relative mx-4 md:mx-8 my-16">
      {/* Main section container — glass panel */}
      <div
        className={`relative rounded-[40px] pt-16 md:pt-24 px-4 md:px-8 lg:px-20 pb-16 md:pb-24 bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] ${className}`}
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
