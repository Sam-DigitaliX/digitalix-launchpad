import { useState } from 'react';
import { supabase } from '@/integrations/supabase';
import { toast } from '@/hooks/use-toast';
import { LeadFormData, calculateScore, ScoringResult } from './types';
import { StepProgress } from './StepProgress';
import { ProfileStep } from './steps/ProfileStep';
import { SituationStep } from './steps/SituationStep';
import { NeedStep } from './steps/NeedStep';
import { ContactStep } from './steps/ContactStep';
import { OutcomeStep } from './steps/OutcomeStep';
import { X } from 'lucide-react';

const STEP_LABELS = ['Profil', 'Situation', 'Besoin', 'Contact', 'Résultat'];
const TOTAL_STEPS = 5;

interface QualificationFormProps {
  onClose?: () => void;
}

export function QualificationForm({ onClose }: QualificationFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<LeadFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<ScoringResult | null>(null);

  const updateData = (updates: Partial<LeadFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    if (currentStep < TOTAL_STEPS) {
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
      // Calculate score
      const scoringResult = calculateScore(formData);
      
      // Save to Supabase
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
      setCurrentStep(5);
      
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
        {/* Progress */}
        {currentStep < 5 && (
          <StepProgress 
            currentStep={currentStep} 
            totalSteps={TOTAL_STEPS - 1} 
            stepLabels={STEP_LABELS.slice(0, -1)} 
          />
        )}

        {/* Steps */}
        {currentStep === 1 && (
          <ProfileStep 
            data={formData} 
            updateData={updateData} 
            onNext={nextStep} 
          />
        )}
        
        {currentStep === 2 && (
          <SituationStep 
            data={formData} 
            updateData={updateData} 
            onNext={nextStep}
            onPrev={prevStep}
          />
        )}
        
        {currentStep === 3 && (
          <NeedStep 
            data={formData} 
            updateData={updateData} 
            onNext={nextStep}
            onPrev={prevStep}
          />
        )}
        
        {currentStep === 4 && (
          <ContactStep 
            data={formData} 
            updateData={updateData} 
            onNext={nextStep}
            onPrev={prevStep}
            isSubmitting={isSubmitting}
            onSubmit={handleSubmit}
          />
        )}
        
        {currentStep === 5 && result && (
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
