import { Button } from '@digitalix/ui';
import { Surface } from '../preview-kit/Surface';
import { ArrowRight, Calendar, Printer } from 'lucide-react';

export const HeroCTA = () => (
  <Surface>
    <div className="flex flex-wrap items-center gap-4">
      <Button variant="heroGradient" size="xl" className="group">
        Réserver mon audit offert
        <ArrowRight className="transition-transform group-hover:translate-x-1" />
      </Button>
      <Button variant="heroGradientOutline" size="xl">
        Voir les services
      </Button>
    </div>
  </Surface>
);

export const Variants = () => (
  <Surface>
    <div className="flex flex-wrap items-center gap-3">
      <Button>Default</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="glass">Glass</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
      <Button variant="destructive">Supprimer</Button>
    </div>
  </Surface>
);

export const Sizes = () => (
  <Surface>
    <div className="flex flex-wrap items-center gap-3">
      <Button variant="heroGradient" size="sm">
        Small
      </Button>
      <Button variant="heroGradient">Default</Button>
      <Button variant="heroGradient" size="lg">
        Large
      </Button>
      <Button variant="heroGradient" size="xl">
        Extra large
      </Button>
      <Button variant="outline" size="icon" aria-label="Planifier">
        <Calendar />
      </Button>
    </div>
  </Surface>
);

export const WithIconAndDisabled = () => (
  <Surface>
    <div className="flex flex-wrap items-center gap-3">
      <Button variant="heroGradient" size="lg">
        <Printer />
        Imprimer le rapport
      </Button>
      <Button variant="outline" size="lg" disabled>
        Envoi en cours…
      </Button>
    </div>
  </Surface>
);
