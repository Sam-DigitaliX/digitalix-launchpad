import { StepProps, SITUATION_OPTIONS, PAIN_POINTS_OPTIONS } from '../types';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { ArrowLeft, Check } from 'lucide-react';

export function SituationStep({ data, updateData, onNext, onPrev }: StepProps) {
  const togglePainPoint = (value: string) => {
    const current = data.pain_points || [];
    const updated = current.includes(value)
      ? current.filter(p => p !== value)
      : [...current, value];
    updateData({ pain_points: updated });
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="text-center space-y-3">
        <h2 className="text-2xl md:text-3xl font-bold">
          Votre <span className="text-gradient-primary">situation</span> actuelle
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Où en êtes-vous dans votre tracking ?
        </p>
      </div>

      {/* Pain points — checkboxes */}
      <div className="space-y-4">
        <label className="text-sm font-medium text-foreground">
          Vos problématiques principales <span className="text-muted-foreground">(plusieurs choix possibles)</span>
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {PAIN_POINTS_OPTIONS.map((option) => {
            const isSelected = data.pain_points?.includes(option.value) ?? false;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => togglePainPoint(option.value)}
                className={cn(
                  "glass-card p-4 text-left transition-all duration-300 flex items-center gap-3",
                  isSelected && "border-secondary",
                  !isSelected && "hover:border-secondary/50"
                )}
              >
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => togglePainPoint(option.value)}
                  className="pointer-events-none"
                />
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

      {/* Situation tracking — radio */}
      <div className="space-y-4">
        <label className="text-sm font-medium text-foreground">Tracking actuel</label>
        <div className="grid grid-cols-1 gap-3">
          {SITUATION_OPTIONS.map((option) => {
            const isSelected = data.current_situation === option.value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => updateData({ current_situation: option.value })}
                className={cn(
                  "glass-card p-4 text-left transition-all duration-300 flex items-center gap-3",
                  isSelected && "border-primary glow-primary",
                  !isSelected && "hover:border-primary/50"
                )}
              >
                <div className={cn(
                  "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors shrink-0",
                  isSelected ? "border-primary bg-primary" : "border-muted-foreground"
                )}>
                  {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
                </div>
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
