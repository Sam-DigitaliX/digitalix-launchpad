import { Input, Label } from '@digitalix/ui';
import { Building2, Mail } from 'lucide-react';
import { Surface } from '../preview-kit/Surface';

export const Qualification = () => (
  <Surface>
    <div className="w-[380px] space-y-5">
      <div className="space-y-2">
        <Label htmlFor="company" className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-muted-foreground" />
          Entreprise *
        </Label>
        <Input
          id="company"
          placeholder="Nom de votre entreprise"
          className="bg-muted/50 border-glass-border focus:border-primary"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email" className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-muted-foreground" />
          Email professionnel *
        </Label>
        <Input
          id="email"
          type="email"
          defaultValue="jean@entreprise.com"
          className="bg-muted/50 border-glass-border focus:border-primary"
        />
      </div>
    </div>
  </Surface>
);

export const GlassEvInput = () => (
  <Surface>
    <div className="w-[380px] space-y-2">
      <Label htmlFor="url">URL du site à auditer</Label>
      <Input id="url" placeholder="https://www.votre-site.fr" className="ev-input h-12 px-4" />
    </div>
  </Surface>
);

export const States = () => (
  <Surface>
    <div className="w-[380px] space-y-3">
      <Input placeholder="Par défaut" />
      <Input defaultValue="Valeur saisie" />
      <Input placeholder="Désactivé" disabled />
    </div>
  </Surface>
);
