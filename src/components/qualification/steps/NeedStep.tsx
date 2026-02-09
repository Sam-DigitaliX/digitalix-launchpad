import { StepProps, BUDGET_OPTIONS, TIMELINE_OPTIONS, PRIORITY_OPTIONS } from '../types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ArrowLeft, Wallet, Clock, Target } from 'lucide-react';

export function NeedStep({ data, updateData, onNext, onPrev }: StepProps) {
  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="text-center space-y-3">
        <h2 className="text-2xl md:text-3xl font-bold">
          Votre <span className="text-gradient-primary">projet</span>
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Quelques informations pour mieux comprendre vos besoins
        </p>
      </div>

      {/* Budget */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Wallet className="w-5 h-5 text-primary" />
          <label className="text-sm font-medium text-foreground">Budget envisagé</label>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {BUDGET_OPTIONS.map((option) => {
            const isSelected = data.budget_range === option.value;
            
            return (
              <button
                key={option.value}
                onClick={() => updateData({ budget_range: option.value })}
                className={cn(
                  "glass-card p-4 text-center transition-all duration-300",
                  isSelected && "border-primary glow-primary",
                  !isSelected && "hover:border-primary/50"
                )}
              >
                <span className={cn(
                  "text-sm font-medium",
                  isSelected ? "text-foreground" : "text-muted-foreground"
                )}>
                  {option.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-secondary" />
          <label className="text-sm font-medium text-foreground">Délai souhaité</label>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {TIMELINE_OPTIONS.map((option) => {
            const isSelected = data.timeline === option.value;
            
            return (
              <button
                key={option.value}
                onClick={() => updateData({ timeline: option.value })}
                className={cn(
                  "glass-card p-4 text-center transition-all duration-300",
                  isSelected && "border-secondary",
                  !isSelected && "hover:border-secondary/50"
                )}
              >
                <span className={cn(
                  "text-sm font-medium",
                  isSelected ? "text-foreground" : "text-muted-foreground"
                )}>
                  {option.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Priority */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          <label className="text-sm font-medium text-foreground">Niveau de priorité</label>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {PRIORITY_OPTIONS.map((option) => {
            const isSelected = data.priority === option.value;
            
            return (
              <button
                key={option.value}
                onClick={() => updateData({ priority: option.value })}
                className={cn(
                  "glass-card p-4 text-center transition-all duration-300",
                  isSelected && "border-primary glow-primary",
                  !isSelected && "hover:border-primary/50"
                )}
              >
                <span className={cn(
                  "text-sm font-medium",
                  isSelected ? "text-foreground" : "text-muted-foreground"
                )}>
                  {option.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col-reverse sm:flex-row justify-between gap-3 pt-4">
        <Button 
          variant="ghost" 
          onClick={onPrev}
          className="gap-2 w-full sm:w-auto"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </Button>
        <Button 
          variant="heroGradient" 
          size="lg"
          onClick={onNext}
          className="w-full sm:w-auto sm:min-w-[200px]"
        >
          Continuer
        </Button>
      </div>
    </div>
  );
}
