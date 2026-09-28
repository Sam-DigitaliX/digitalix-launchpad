import { Checkbox, Input, Label } from '@digitalix/ui';
import { User } from 'lucide-react';
import { Surface } from '../preview-kit/Surface';

export const WithIcon = () => (
  <Surface>
    <div className="w-[360px] space-y-2">
      <Label htmlFor="fullname" className="flex items-center gap-2">
        <User className="w-4 h-4 text-muted-foreground" />
        Prénom et Nom *
      </Label>
      <Input id="fullname" placeholder="Jean Dupont" className="bg-muted/50 border-glass-border" />
    </div>
  </Surface>
);

export const PeerDisabled = () => (
  <Surface>
    <div className="flex items-center gap-3">
      <Checkbox id="newsletter" disabled />
      <Label htmlFor="newsletter">Recevoir la newsletter (indisponible)</Label>
    </div>
  </Surface>
);
