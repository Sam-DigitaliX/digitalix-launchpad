import { Button, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@digitalix/ui';
import { Info } from 'lucide-react';
import { Surface } from '../preview-kit/Surface';

export const OnIcon = () => (
  <Surface>
    <div className="h-[140px] flex items-end justify-center">
      <TooltipProvider>
        <Tooltip defaultOpen>
          <TooltipTrigger asChild>
            <Button variant="glass" size="icon" aria-label="Info">
              <Info />
            </Button>
          </TooltipTrigger>
          <TooltipContent className="border-glass-border">
            FPID : cookie server-managed, résiste à Safari ITP
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  </Surface>
);
