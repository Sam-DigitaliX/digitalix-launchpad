import { Separator } from '@digitalix/ui';
import { Surface } from '../preview-kit/Surface';

export const Horizontal = () => (
  <Surface>
    <div className="w-[360px]">
      <p className="font-display font-semibold">Audit tracking</p>
      <p className="text-sm text-muted-foreground">28 vérifications, 4 catégories</p>
      <Separator className="my-4" />
      <p className="text-sm text-muted-foreground">Score global : 72/100</p>
    </div>
  </Surface>
);

export const Vertical = () => (
  <Surface>
    <div className="flex h-5 items-center gap-4 text-sm">
      <span>GA4</span>
      <Separator orientation="vertical" />
      <span>Google Ads</span>
      <Separator orientation="vertical" />
      <span>Meta CAPI</span>
    </div>
  </Surface>
);
