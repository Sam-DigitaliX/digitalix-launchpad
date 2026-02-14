import { StepProps, PROFILE_GROUPS } from '../types';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function ProfileStep({ data, updateData, onNext, isHotProspect }: StepProps) {
  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="text-center space-y-3">
        <h2 className="text-2xl md:text-3xl font-bold">
          {isHotProspect ? (
            <>On voit que vous êtes <span className="text-gradient-primary">intéressé</span> !</>
          ) : (
            <>Quel est votre <span className="text-gradient-primary">profil</span> ?</>
          )}
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          {isHotProspect
            ? "Quelques infos et on vous rappelle rapidement"
            : "Pour vous proposer l'accompagnement le plus adapté"
          }
        </p>
      </div>

      <div className="max-w-sm mx-auto">
        <label className="text-sm font-medium text-foreground mb-2 block">Vous êtes</label>
        <Select
          value={data.profile_type || ''}
          onValueChange={(value) => updateData({ profile_type: value })}
        >
          <SelectTrigger className="w-full h-12 bg-white/[0.04] border-white/[0.08] focus:border-primary text-base">
            <SelectValue placeholder="Sélectionnez votre profil" />
          </SelectTrigger>
          <SelectContent className="bg-background border-white/[0.08]">
            {PROFILE_GROUPS.map((group) => (
              <SelectGroup key={group.label}>
                <SelectLabel className="text-xs uppercase tracking-wider text-muted-foreground font-semibold px-2 py-1.5">
                  {group.label}
                </SelectLabel>
                {group.options.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    className="cursor-pointer text-base"
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-center pt-4 px-4 sm:px-0">
        <Button
          variant="heroGradient"
          size="lg"
          onClick={onNext}
          disabled={!data.profile_type}
          className="w-full sm:w-auto sm:min-w-[200px]"
        >
          Continuer
        </Button>
      </div>
    </div>
  );
}
