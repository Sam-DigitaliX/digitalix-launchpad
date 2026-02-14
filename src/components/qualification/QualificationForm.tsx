import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase';
import { toast } from '@/hooks/use-toast';
import { LeadFormData, leadSchema, calculateScore, ScoringResult } from './types';
import { StepProgress } from './StepProgress';
import { ProfileStep } from './steps/ProfileStep';
import { SituationStep } from './steps/SituationStep';
import { NeedStep } from './steps/NeedStep';
import { ContactStep } from './steps/ContactStep';
import { OutcomeStep } from './steps/OutcomeStep';
import { X, Flame } from 'lucide-react';
import { getBehavioralData, BehavioralData } from '@/lib/trackingUtils';

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
  const [behavioralData, setBehavioralData] = useState<BehavioralData | null>(null);

  // Load behavioral data on mount
  useEffect(() => {
    const data = getBehavioralData();
    setBehavioralData(data);
  }, []);

  const isHotProspect = behavioralData?.isHotProspect ?? false;

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
    // Validate required fields before submission
    if (!formData.profile_type || !formData.full_name || !formData.email || !formData.company_name) {
      toast({
        title: "Champs manquants",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.gdpr_consent) {
      toast({
        title: "Consentement requis",
        description: "Vous devez accepter le traitement de vos données pour continuer.",
        variant: "destructive",
      });
      return;
    }

    // Validate with Zod schema
    const validation = leadSchema.safeParse(formData);
    if (!validation.success) {
      const firstError = validation.error.errors[0];
      toast({
        title: "Validation",
        description: firstError?.message ?? "Données invalides. Veuillez vérifier le formulaire.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Calculate score with behavioral bonus
      const behavioralBonus = behavioralData?.bonusScore ?? 0;
      const scoringResult = calculateScore(formData, behavioralBonus);

      const validData = validation.data;

      if (!supabase) {
        toast({
          title: "Configuration manquante",
          description: "Le service de base de données n'est pas configuré.",
          variant: "destructive",
        });
        return;
      }

      // Upsert contact + log interaction via RPC (atomic, bypasses RLS)
      const { error } = await supabase.rpc('upsert_contact_with_interaction', {
        p_email: validData.email,
        p_full_name: validData.full_name,
        p_company_name: validData.company_name,
        p_phone: validData.phone,
        p_profile_type: validData.profile_type,
        p_qualification_score: scoringResult.score,
        p_is_qualified: scoringResult.isQualified,
        p_gdpr_consent: validData.gdpr_consent,
        p_gdpr_consent_at: new Date().toISOString(),
        p_newsletter_optin: validData.newsletter_optin ?? false,
        p_behavioral_profile: behavioralData?.profileLabel ?? null,
        p_interaction_type: 'qualification_form',
        p_interaction_metadata: {
          current_situation: validData.current_situation,
          pain_points: validData.pain_points,
          budget_range: validData.budget_range,
          timeline: validData.timeline,
          priority: validData.priority,
          behavioral_pageviews: behavioralData?.pageviews,
          behavioral_sessions: behavioralData?.sessions,
          first_visit_source: behavioralData?.firstVisitSource,
          current_visit_source: behavioralData?.currentSource,
          behavioral_bonus: behavioralBonus,
          score: scoringResult.score,
          base_score: scoringResult.baseScore,
          is_qualified: scoringResult.isQualified,
          disqualify_reason: scoringResult.disqualifyReason,
        },
      });

      if (error) {
        console.error('[QualificationForm] Supabase insert error:', error.message, error.details, error.hint);
        const isNetworkError = error.message?.includes('fetch') || error.message?.includes('network');
        toast({
          title: "Erreur",
          description: isNetworkError
            ? "Problème de connexion. Vérifiez votre réseau et réessayez."
            : "Une erreur est survenue lors de l'envoi. Veuillez réessayer.",
          variant: "destructive",
        });
        return;
      }

      // Show result
      setResult(scoringResult);
      setCurrentStep(TOTAL_STEPS);

      toast({
        title: scoringResult.isQualified ? "Félicitations !" : "Demande envoyée",
        description: scoringResult.isQualified
          ? "Vous êtes éligible à un audit tracking offert !"
          : "Consultez nos ressources offertes.",
        className: scoringResult.isQualified
          ? "bg-gradient-to-r from-primary to-secondary text-white border-0 shadow-lg shadow-primary/25"
          : undefined,
      });

      // Send confirmation email via Edge Function (non-blocking)
      try {
        await supabase.functions.invoke('send-confirmation', {
          body: {
            type: 'confirmation',
            data: {
              email: validData.email,
              full_name: validData.full_name,
              company_name: validData.company_name,
              profile_type: validData.profile_type,
              current_situation: validData.current_situation,
              pain_points: validData.pain_points,
              budget_range: validData.budget_range,
              timeline: validData.timeline,
              score: scoringResult.score,
              is_qualified: scoringResult.isQualified,
            },
          },
        });
      } catch (emailErr) {
        console.warn('[QualificationForm] Confirmation email failed:', emailErr);
      }

    } catch (err) {
      toast({
        title: "Erreur réseau",
        description: "Impossible de contacter le serveur. Vérifiez votre connexion et réessayez.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadResource = () => {
    // TODO: Link to actual resource
    toast({
      title: "Téléchargement",
      description: "Le guide sera bientôt disponible !",
    });
  };

  const isResultStep = currentStep === TOTAL_STEPS;

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
            <Flame className="w-4 h-4 icon-gradient" />
            <span className="text-sm font-medium text-gradient-primary">Prospect prioritaire</span>
          </div>
        )}

        {/* Progress */}
        {!isResultStep && (
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
            isHotProspect={isHotProspect}
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

        {isResultStep && result && (
          <OutcomeStep
            result={result}
            onDownloadResource={handleDownloadResource}
          />
        )}
      </div>
    </div>
  );
}
