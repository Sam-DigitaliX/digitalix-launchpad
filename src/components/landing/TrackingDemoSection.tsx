import { useMemo, useCallback } from 'react';
import { useVisitorTracking } from '@/hooks/useVisitorTracking';
import { Button } from '@/components/ui/button';
import { Trash2, ArrowRight, Activity } from 'lucide-react';

const TrackingDemoSection = () => {
  const { displayData, deleteData } = useVisitorTracking();

  const stats = useMemo(() => [
    {
      id: 'firstVisit',
      value: displayData?.firstVisit || '--',
      label: 'Date de votre première visite',
      isPrimary: true,
    },
    {
      id: 'sourceFirstVisit',
      value: displayData?.sourceFirstVisit || '--',
      label: 'Source de votre première visite',
      isPrimary: false,
    },
    {
      id: 'sourceLastVisit',
      value: displayData?.sourceLastVisit || '--',
      label: 'Source de votre visite actuelle',
      isPrimary: false,
    },
    {
      id: 'totalPageViews',
      value: displayData?.totalPageViews?.toString() || '--',
      label: 'Pages vues (toutes visites)',
      isPrimary: true,
    },
    {
      id: 'profile',
      value: displayData?.profile || '--',
      label: 'Votre profil comportemental',
      isPrimary: false,
    },
    {
      id: 'sessionCount',
      value: displayData?.sessionCount?.toString() || '--',
      label: 'Nombre de sessions',
      isPrimary: true,
    },
  ], [displayData]);

  const handleCTAClick = useCallback(() => {
    window.location.href = '/contact';
  }, []);

  return (
    <section className="relative py-16 md:py-24 bg-black/[0.6] backdrop-blur-xl overflow-hidden">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 pointer-events-none" />

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--primary)) 1px, transparent 1px),
                            linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-[1400px] relative z-10">
        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-6 lg:gap-12 items-center">
          
          {/* Left Column - Explanatory Card */}
          <div className="bg-muted/60 backdrop-blur-xl rounded-xl border border-border/50 p-4 sm:p-6 md:p-8 shadow-[0_0_60px_hsl(var(--primary)_/_0.15)]">
            {/* Live Demo Badge */}
            <div className="inline-flex items-center gap-2 mb-6">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-destructive"></span>
              </span>
              <span className="px-3 py-1 bg-gradient-to-r from-primary to-secondary text-primary-foreground text-sm font-bold rounded-full">
                DÉMONSTRATION LIVE
              </span>
            </div>

            {/* Title */}
            <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-3 md:mb-4">
              Découvrez votre tracking en{' '}
              <span className="text-gradient-primary">temps réel</span>
            </h3>

            {/* Description */}
            <p className="text-foreground/70 mb-4 md:mb-6 text-sm sm:text-base leading-relaxed">
              Depuis votre arrivée sur ce site, nous avons collecté et analysé ces données 
              sur votre navigation. C'est <strong className="text-foreground">exactement ce que nous mettons en place</strong> pour vos clients.
            </p>

            {/* Privacy Note */}
            <div className="flex items-start gap-3 p-3 sm:p-4 bg-background/50 rounded-lg border border-border/30 mb-4 md:mb-6">
              <Activity className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">100% local</strong> — Ces données sont stockées uniquement sur votre appareil 
                et ne sont jamais envoyées à un serveur.
              </p>
            </div>

            {/* Buttons */}
            <div className="space-y-3">
              <Button 
                variant="heroGradient" 
                size="xl" 
                className="w-full group"
                onClick={handleCTAClick}
              >
                Voir comment l'implémenter
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <Button
                variant="ghost"
                size="lg"
                className="w-full border border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={deleteData}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Supprimer mes données
              </Button>
            </div>
          </div>

          {/* Right Column - Stats Grid */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 w-full">
            {stats.map((stat) => (
              <div 
                key={stat.id}
                className="bg-muted/60 backdrop-blur-xl rounded-lg sm:rounded-xl border border-border/50 p-3 sm:p-4 md:p-6 text-center hover:border-primary/30 hover:shadow-[0_0_30px_hsl(var(--primary)_/_0.1)] transition-all duration-300"
              >
                <div 
                  id={stat.id}
                  className={`text-base sm:text-xl md:text-2xl lg:text-3xl font-bold mb-1 sm:mb-2 truncate ${stat.isPrimary ? 'text-primary' : 'text-secondary'}`}
                >
                  {stat.value}
                </div>
                <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground leading-tight">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrackingDemoSection;
