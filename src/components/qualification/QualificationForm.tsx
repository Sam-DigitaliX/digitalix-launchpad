import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase';
import { toast } from '@/hooks/use-toast';
import { LeadFormData, calculateScore, ScoringResult } from './types';
import { StepProgress } from './StepProgress';
import { ProfileStep } from './steps/ProfileStep';
import { SituationStep } from './steps/SituationStep';
import { NeedStep } from './steps/NeedStep';
import { ContactStep } from './steps/ContactStep';
import { OutcomeStep } from './steps/OutcomeStep';
import { X, Flame } from 'lucide-react';
import { getBehavioralData, BehavioralData } from '@/lib/trackingUtils';

const STEP_LABELS = ['Profil', 'Situation', 'Besoin', 'Contact', 'Résultat'];
const STEP_LABELS_SHORT = ['Profil', 'Besoin', 'Contact', 'Résultat']; // For hot prospects
const TOTAL_STEPS = 5;
const TOTAL_STEPS_SHORT = 4; // For hot prospects (skip Situation)

interface QualificationFormProps {
  onClose?: () => void;
}

export function QualificationForm({ onClose }: QualificationFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<LeadFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<ScoringResult | null>(null);
  const [behavioralData, setBehavioralData] = useState<BehavioralData | null>(null);
  
  // Load behavioral data on mount
  useEffect(() => {
    const data = getBehavioralData();
    setBehavioralData(data);
  }, []);
  
  // Determine if we should use shortened flow
  const isHotProspect = behavioralData?.isHotProspect ?? false;
  const stepLabels = isHotProspect ? STEP_LABELS_SHORT : STEP_LABELS;
  const totalSteps = isHotProspect ? TOTAL_STEPS_SHORT : TOTAL_STEPS;

  // Map logical step to actual step (for hot prospects who skip Situation)
  const getActualStep = (logicalStep: number): number => {
    if (!isHotProspect) return logicalStep;
    // Hot prospects: 1=Profile, 2=Need, 3=Contact, 4=Result
    // Normal flow: 1=Profile, 2=Situation, 3=Need, 4=Contact, 5=Result
    if (logicalStep === 1) return 1;
    if (logicalStep === 2) return 3; // Skip situation, go to Need
    if (logicalStep === 3) return 4; // Contact
    if (logicalStep === 4) return 5; // Result
    return logicalStep;
  };

  const updateData = (updates: Partial<LeadFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Calculate score with behavioral bonus
      const behavioralBonus = behavioralData?.bonusScore ?? 0;
      const scoringResult = calculateScore(formData, behavioralBonus);
      
      // Save to Supabase with behavioral data
      const { error } = await supabase.from('leads').insert({
        profile_type: formData.profile_type!,
        current_situation: formData.current_situation,
        pain_points: formData.pain_points,
        budget_range: formData.budget_range,
        timeline: formData.timeline,
        priority: formData.priority,
        company_name: formData.company_name,
        full_name: formData.full_name!,
        email: formData.email!,
        phone: formData.phone,
        qualification_score: scoringResult.score,
        is_qualified: scoringResult.isQualified,
        // Behavioral enrichment data
        behavioral_profile: behavioralData?.profileLabel,
        behavioral_pageviews: behavioralData?.pageviews,
        behavioral_sessions: behavioralData?.sessions,
        first_visit_source: behavioralData?.firstVisitSource,
        current_visit_source: behavioralData?.currentSource,
        behavioral_bonus: behavioralBonus,
      });

      if (error) {
        console.error('Error saving lead:', error);
        toast({
          title: "Erreur",
          description: "Une erreur est survenue. Veuillez réessayer.",
          variant: "destructive",
        });
        return;
      }

      // Show result
      setResult(scoringResult);
      setCurrentStep(totalSteps);
      
      toast({
        title: "Demande envoyée",
        description: scoringResult.isQualified 
          ? "Nous allons vous recontacter rapidement !" 
          : "Consultez nos ressources gratuites.",
      });
      
    } catch (err) {
      console.error('Submit error:', err);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBookCall = () => {
    // TODO: Integrate with Google Calendar API
    window.open('https://calendly.com', '_blank');
  };

  const handleDownloadResource = () => {
    // TODO: Link to actual resource
    toast({
      title: "Téléchargement",
      description: "Le guide sera bientôt disponible !",
    });
  };

  const actualStep = getActualStep(currentStep);
  const isResultStep = currentStep === totalSteps;

  return (
    <div className="relative w-full max-w-3xl mx-auto">
      {/* Close button */}
      {onClose && (
        <button 
          onClick={onClose}
          className="absolute -top-2 -right-2 p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors z-10"
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      <div className="glass-card p-8 md:p-12">
        {/* Hot Prospect Badge */}
        {isHotProspect && !isResultStep && (
          <div className="flex items-center gap-2 mb-4 px-3 py-1.5 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full w-fit border border-primary/30">
            <Flame className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Prospect prioritaire</span>
          </div>
        )}

        {/* Progress */}
        {!isResultStep && (
          <StepProgress 
            currentStep={currentStep} 
            totalSteps={totalSteps - 1} 
            stepLabels={stepLabels.slice(0, -1)} 
          />
        )}

        {/* Steps - using actualStep for hot prospect flow */}
        {actualStep === 1 && (
          <ProfileStep 
            data={formData} 
            updateData={updateData} 
            onNext={nextStep}
            isHotProspect={isHotProspect}
          />
        )}
        
        {actualStep === 2 && (
          <SituationStep 
            data={formData} 
            updateData={updateData} 
            onNext={nextStep}
            onPrev={prevStep}
          />
        )}
        
        {actualStep === 3 && (
          <NeedStep 
            data={formData} 
            updateData={updateData} 
            onNext={nextStep}
            onPrev={prevStep}
          />
        )}
        
        {actualStep === 4 && (
          <ContactStep 
            data={formData} 
            updateData={updateData} 
            onNext={nextStep}
            onPrev={prevStep}
            isSubmitting={isSubmitting}
            onSubmit={handleSubmit}
          />
        )}
        
        {isResultStep && result && (
          <OutcomeStep 
            result={result}
            onBookCall={handleBookCall}
            onDownloadResource={handleDownloadResource}
          />
        )}
      </div>
    </div>
  );
}
