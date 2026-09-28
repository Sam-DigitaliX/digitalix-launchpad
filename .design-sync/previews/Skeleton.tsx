import { Skeleton } from '@digitalix/ui';
import { Surface } from '../preview-kit/Surface';

export const CardLoading = () => (
  <Surface>
    <div className="ev-card-static w-[380px] p-6 space-y-4">
      <div className="flex items-center gap-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[180px]" />
          <Skeleton className="h-4 w-[120px]" />
        </div>
      </div>
      <Skeleton className="h-24 w-full" />
    </div>
  </Surface>
);
