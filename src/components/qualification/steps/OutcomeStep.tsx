import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { ScoringResult } from '../types';
import { Calendar, Download, CheckCircle2, ArrowRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const CALENDAR_URL = 'https://calendar.google.com/calendar/appointments/schedules/AcZssZ0g1W0t1KcMGk_wBbT28y5PEnG5bhavF3_YMB3P8H-H2SbVDoAv9ZoC2yyLmLTvXgLoIfYbSgCx?gv=true';

interface OutcomeStepProps {
  result: ScoringResult;
  onDownloadResource?: () => void;
}

export function OutcomeStep({ result, onDownloadResource }: OutcomeStepProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  if (result.isQualified) {
    return (
      <div className="space-y-8 animate-fade-in-up text-center">
        <div className="inline-flex p-4 rounded-full bg-primary/20 mb-4">
          <CheckCircle2 className="w-16 h-16 text-primary" />
        </div>
        
        <div className="space-y-3">
          <h2 className="text-2xl md:text-3xl font-bold">
            Parfait, vous êtes <span className="text-gradient-primary">éligible</span> !
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Votre profil correspond parfaitement à notre expertise. 
            Réservez un créneau pour un audit tracking gratuit de 30 minutes.
          </p>
        </div>

        <div className="glass-card p-8 max-w-lg mx-auto space-y-6">
          <div className="flex items-center justify-center gap-3 text-primary">
            <Calendar className="w-8 h-8" />
            <span className="text-xl font-semibold">Audit Tracking Gratuit</span>
          </div>
          
          <ul className="text-left space-y-3 text-muted-foreground">
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <span>Analyse de votre setup tracking actuel</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <span>Identification des opportunités d'amélioration</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <span>Recommandations personnalisées</span>
            </li>
          </ul>

          <Button 
            variant="heroGradient" 
            size="xl"
            onClick={() => setIsCalendarOpen(true)}
            className="w-full gap-2"
          >
            <Calendar className="w-5 h-5" />
            Réserver mon créneau
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>

        {/* Calendar Modal */}
        <Dialog open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
          <DialogContent className="max-w-2xl h-[80vh] p-0 overflow-hidden">
            <DialogTitle className="sr-only">Réserver un créneau</DialogTitle>
            <button
              onClick={() => setIsCalendarOpen(false)}
              className="absolute right-3 top-3 z-10 p-1.5 rounded-full bg-background/80 hover:bg-background transition-colors"
              aria-label="Fermer"
            >
              <X className="w-4 h-4" />
            </button>
            <iframe
              src={CALENDAR_URL}
              className="w-full h-full border-0"
              title="Réserver un rendez-vous"
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
          <span className="text-xl font-semibold">Guide Gratuit</span>
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
          Télécharger le guide gratuit
        </Button>
      </div>
    </div>
  );
}
