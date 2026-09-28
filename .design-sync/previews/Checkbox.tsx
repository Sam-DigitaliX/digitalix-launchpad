import { Checkbox, Label } from '@digitalix/ui';
import { Surface } from '../preview-kit/Surface';

export const GdprConsent = () => (
  <Surface>
    <div className="w-[440px] flex items-start gap-3">
      <Checkbox id="gdpr_consent" defaultChecked className="mt-0.5" />
      <Label htmlFor="gdpr_consent" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
        J'accepte que mes données personnelles soient traitées par DigitaliX dans le cadre de ma demande, conformément à
        la <span className="text-foreground underline">politique de confidentialité</span>. *
      </Label>
    </div>
  </Surface>
);

export const States = () => (
  <Surface>
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <Checkbox id="c1" />
        <Label htmlFor="c1">Non coché</Label>
      </div>
      <div className="flex items-center gap-3">
        <Checkbox id="c2" defaultChecked />
        <Label htmlFor="c2">Coché</Label>
      </div>
      <div className="flex items-center gap-3">
        <Checkbox id="c3" disabled />
        <Label htmlFor="c3">Désactivé</Label>
      </div>
    </div>
  </Surface>
);
