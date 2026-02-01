import { StepProps, PROFILE_OPTIONS } from '../types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { User, Briefcase, LineChart, Code, GraduationCap, HelpCircle, Building, UserCheck } from 'lucide-react';

const ICONS: Record<string, React.ReactNode> = {
  agency_seo_sea: <Building className="w-6 h-6" />,
  ecommerce_manager: <Briefcase className="w-6 h-6" />,
  marketing_director: <UserCheck className="w-6 h-6" />,
  data_analyst: <LineChart className="w-6 h-6" />,
  freelance: <User className="w-6 h-6" />,
  developer: <Code className="w-6 h-6" />,
  student: <GraduationCap className="w-6 h-6" />,
  other: <HelpCircle className="w-6 h-6" />,
};

export function ProfileStep({ data, updateData, onNext }: StepProps) {
  const handleSelect = (value: string) => {
    updateData({ profile_type: value });
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="text-center space-y-3">
        <h2 className="text-2xl md:text-3xl font-bold">
          Quel est votre <span className="text-gradient-primary">profil</span> ?
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Pour vous proposer l'accompagnement le plus adapté
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {PROFILE_OPTIONS.map((option) => {
          const isSelected = data.profile_type === option.value;
          
          return (
            <button
              key={option.value}
              onClick={() => handleSelect(option.value)}
              className={cn(
                "glass-card p-6 flex flex-col items-center gap-3 transition-all duration-300 cursor-pointer group",
                isSelected && "border-primary glow-primary",
                !isSelected && "hover:border-primary/50"
              )}
            >
              <div className={cn(
                "p-3 rounded-xl transition-colors duration-300",
                isSelected ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground group-hover:text-primary"
              )}>
                {ICONS[option.value]}
              </div>
              <span className={cn(
                "text-sm font-medium text-center transition-colors duration-300",
                isSelected ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
              )}>
                {option.label}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex justify-center pt-4">
        <Button 
          variant="heroGradient" 
          size="lg"
          onClick={onNext}
          disabled={!data.profile_type}
          className="min-w-[200px]"
        >
          Continuer
        </Button>
      </div>
    </div>
  );
}
