import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { ScoringResult } from '../types';
import { Calendar, Download, CheckCircle2, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Small inline orbit animation reusing the .orbit-loader CSS */
function OrbitIcon({ className = '' }: { className?: string }) {
  return (
    <div className={cn('orbit-loader relative shrink-0', className)}>
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="orbit-ring absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ width: `${100 - i * 22}%`, height: `${100 - i * 22}%` }}
        />
      ))}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-gradient-to-br from-primary to-secondary" />
    </div>
  );
}

const CALENDAR_URL = 'https://calendar.google.com/calendar/appointments/schedules/AcZssZ0g1W0t1KcMGk_wBbT28y5PEnG5bhavF3_YMB3P8H-H2SbVDoAv9ZoC2yyLmLTvXgLoIfYbSgCx?gv=true';

interface OutcomeStepProps {
  result: ScoringResult;
  onDownloadResource?: () => void;
}

export function OutcomeStep({ result, onDownloadResource }: OutcomeStepProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isCalendarLoading, setIsCalendarLoading] = useState(true);

  const handleCalendarOpen = (open: boolean) => {
    setIsCalendarOpen(open);
    if (open) {
      setIsCalendarLoading(true);
      
      // Track calendar modal open for qualified leads
      const dataLayer = (window as Window & { dataLayer?: Record<string, unknown>[] }).dataLayer;
      if (dataLayer) {
        dataLayer.push({
          event: 'calendar_modal_open',
          event_category: 'engagement',
          event_label: 'qualified_lead_booking',
        });
      }
    }
  };
  
  if (result.isQualified) {
    return (
      <div className="space-y-8 animate-fade-in-up text-center">
        <div className="icon-gradient inline-flex p-4 rounded-full bg-white/[0.05] border border-white/[0.06] mb-4">
          <CheckCircle2 className="w-16 h-16" />
        </div>
        
        <div className="space-y-3">
          <h2 className="text-2xl md:text-3xl font-bold">
            Parfait, vous êtes <span className="text-gradient-primary">éligible</span> !
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Votre profil correspond parfaitement à notre expertise. 
            Réservez un créneau pour un audit tracking offert de 30 minutes.
          </p>
        </div>

        <div className="glass-card p-8 max-w-lg mx-auto space-y-6">
          <div className="flex items-center justify-center gap-3">
            <OrbitIcon className="w-8 h-8" />
            <span className="text-xl font-semibold text-gradient-primary">Audit Tracking Offert</span>
          </div>
          
          <ul className="text-left space-y-3 text-muted-foreground">
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 icon-gradient mt-0.5 shrink-0" />
              <span>Analyse de votre setup tracking actuel</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 icon-gradient mt-0.5 shrink-0" />
              <span>Identification des opportunités d'amélioration</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 icon-gradient mt-0.5 shrink-0" />
              <span>Recommandations personnalisées</span>
            </li>
          </ul>

          <Button
            variant="heroGradient"
            size="xl"
            onClick={() => handleCalendarOpen(true)}
            className="w-full gap-2"
          >
            <Calendar className="w-5 h-5" />
            Réserver mon créneau
          </Button>
        </div>

        {/* Calendar Modal */}
        <Dialog open={isCalendarOpen} onOpenChange={handleCalendarOpen}>
          <DialogContent className="max-w-4xl w-[95vw] h-[90vh] p-0 overflow-hidden border-0 bg-white flex flex-col [&>button]:hidden">
            <DialogTitle className="sr-only">Réserver un créneau</DialogTitle>

            {/* Sticky close bar */}
            <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200">
              <span className="text-sm font-medium text-gray-700">Réserver un créneau</span>
              <button
                onClick={() => handleCalendarOpen(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Fermer"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Loading Spinner */}
            {isCalendarLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-0">
                <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                <p className="text-gray-600 text-sm">Chargement du calendrier...</p>
              </div>
            )}

            <iframe
              src={CALENDAR_URL}
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
              referrerPolicy="no-referrer-when-downgrade"
              className={cn(
                "w-full flex-1 border-0 relative z-[1]",
                isCalendarLoading && "opacity-0"
              )}
              title="Réserver un rendez-vous"
              onLoad={() => setIsCalendarLoading(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Disqualified - Nurturing flow
  return (
    <div className="space-y-8 animate-fade-in-up text-center">
      <div className="inline-flex p-4 rounded-full bg-secondary/20 mb-4">
        <Download className="w-16 h-16 text-secondary" />
      </div>
      
      <div className="space-y-3">
        <h2 className="text-2xl md:text-3xl font-bold">
          Merci pour votre <span className="text-gradient-primary">intérêt</span> !
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          {result.disqualifyReason 
            ? `${result.disqualifyReason}. En attendant, découvrez notre guide complet sur le Server-Side Tracking.`
            : "Votre projet ne correspond pas à notre offre actuelle, mais nous avons une ressource qui pourrait vous aider."
          }
        </p>
      </div>

      <div className="glass-card p-8 max-w-lg mx-auto space-y-6">
        <div className="flex items-center justify-center gap-3 text-secondary">
          <Download className="w-8 h-8" />
          <span className="text-xl font-semibold">Guide Offert</span>
        </div>
        
        <div className={cn(
          "p-6 rounded-xl bg-gradient-to-br from-secondary/10 to-primary/10",
          "border border-secondary/20"
        )}>
          <h3 className="text-lg font-bold mb-2">
            Le Guide Ultime du Server-Side Tracking
          </h3>
          <p className="text-sm text-muted-foreground">
            +40 pages pour comprendre et implémenter le tracking server-side
          </p>
        </div>

        <Button 
          variant="outline" 
          size="xl"
          onClick={onDownloadResource}
          className="w-full gap-2 border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground"
        >
          <Download className="w-5 h-5" />
          Télécharger le guide offert
        </Button>
      </div>
    </div>
  );
}
