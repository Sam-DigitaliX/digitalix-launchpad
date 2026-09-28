import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@digitalix/ui';
import { Surface } from '../preview-kit/Surface';

const groups = [
  {
    label: 'Annonceur',
    options: [
      { value: 'ecommerce', label: 'E-commerce' },
      { value: 'lead_gen', label: 'Génération de leads' },
    ],
  },
  {
    label: 'Prestataire',
    options: [
      { value: 'agency', label: 'Agence marketing' },
      { value: 'freelance', label: 'Consultant freelance' },
    ],
  },
];

const ProfileSelect = ({ open, value }: { open?: boolean; value?: string }) => (
  <div className="w-[360px] space-y-2">
    <label className="text-sm font-medium text-foreground">Vous êtes…</label>
    <Select defaultValue={value} defaultOpen={open}>
      <SelectTrigger className="w-full h-12 bg-white/[0.04] border-white/[0.08] focus:border-primary text-base">
        <SelectValue placeholder="Sélectionnez votre profil" />
      </SelectTrigger>
      <SelectContent className="bg-background border-white/[0.08]">
        {groups.map((group) => (
          <SelectGroup key={group.label}>
            <SelectLabel className="text-xs uppercase tracking-wider text-muted-foreground font-semibold px-2 py-1.5">
              {group.label}
            </SelectLabel>
            {group.options.map((option) => (
              <SelectItem key={option.value} value={option.value} className="cursor-pointer text-base">
                {option.label}
              </SelectItem>
            ))}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  </div>
);

export const Placeholder = () => (
  <Surface>
    <ProfileSelect />
  </Surface>
);

export const Selected = () => (
  <Surface>
    <ProfileSelect value="ecommerce" />
  </Surface>
);

export const Open = () => (
  <Surface>
    <div className="h-[340px]">
      <ProfileSelect open value="agency" />
    </div>
  </Surface>
);
