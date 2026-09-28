import { OrbitLoader } from '@digitalix/ui';

// OrbitLoader is position:fixed full-viewport; the transformed box gives it a containing block inside the card.
export const FullScreen = () => (
  <div className="relative h-[280px] w-[440px] overflow-hidden rounded-xl" style={{ transform: 'translateZ(0)' }}>
    <OrbitLoader />
  </div>
);
