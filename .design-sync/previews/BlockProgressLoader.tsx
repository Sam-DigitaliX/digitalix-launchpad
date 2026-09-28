import { BlockProgressLoader } from '@digitalix/ui';
import { Surface } from '../preview-kit/Surface';

export const Scanning = () => (
  <Surface>
    <div className="w-[520px] py-6">
      <BlockProgressLoader percentage={45} label="Session 2/3 — acceptation du consentement" />
    </div>
  </Surface>
);

export const AlmostDone = () => (
  <Surface>
    <div className="w-[520px] py-6">
      <BlockProgressLoader percentage={95} title="Mesure des Core Web Vitals" label="Appel PageSpeed Insights" />
    </div>
  </Surface>
);
