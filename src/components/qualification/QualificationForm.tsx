import { useState, useEffect, useRef } from 'react';
import { upsertContact, sendEmail, ApiError } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { LeadFormData, leadSchema, calculateScore, ScoringResult, AuditContext } from './types';
import { StepProgress } from './StepProgress';
import { ProfileStep } from './steps/ProfileStep';
import { SituationStep } from './steps/SituationStep';
import { NeedStep } from './steps/NeedStep';
import { ContactStep } from './steps/ContactStep';
import { OutcomeStep } from './steps/OutcomeStep';
import { X, Flame, ScanSearch } from 'lucide-react';
import { getBehavioralData, BehavioralData } from '@/lib/trackingUtils';

const FULL_STEP_LABELS = ['Profil', 'Situation', 'Besoin', 'Contact', 'Résultat'];
const AUDIT_STEP_LABELS = ['Profil', 'Besoin', 'Contact', 'Résultat'];
const POST_AUDIT_BONUS = 25;

interface QualificationFormProps {
  onClose?: () => void;
  auditContext?: AuditContext;
}

export function QualificationForm({ onClose, auditContext }: QualificationFormProps) {
  const stepLabels = auditContext ? AUDIT_STEP_LABELS : FULL_STEP_LABELS;
  const totalSteps = stepLabels.length;

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<LeadFormData>>(() => (
    auditContext?.email ? { email: auditContext.email } : {}
  ));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<ScoringResult | null>(null);
  const [behavioralData, setBehavioralData] = useState<BehavioralData | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  // Load behavioral data on mount
  useEffect(() => {
    const data = getBehavioralData();
    setBehavioralData(data);
  }, []);

  // Scroll to form top on step change (fixes mobile scroll issue)
  useEffect(() => {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [currentStep]);

  const isHotProspect = behavioralData?.isHotProspect ?? false;

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
      // Calculate score with behavioral + post-audit bonuses
      const behavioralBonus = behavioralData?.bonusScore ?? 0;
      const postAuditBonus = auditContext ? POST_AUDIT_BONUS : 0;
      const scoringResult = calculateScore(formData, behavioralBonus, postAuditBonus);

      const validData = validation.data;

      // Upsert contact + log interaction via API
      await upsertContact({
        email: validData.email,
        full_name: validData.full_name,
        company_name: validData.company_name,
        phone: validData.phone,
        profile_type: validData.profile_type,
        qualification_score: scoringResult.score,
        is_qualified: scoringResult.isQualified,
        gdpr_consent: validData.gdpr_consent,
        gdpr_consent_at: new Date().toISOString(),
        newsletter_optin: validData.newsletter_optin ?? false,
        behavioral_profile: behavioralData?.profileLabel ?? null,
        interaction_type: auditContext ? 'audit_contact_request' : 'qualification_form',
        interaction_metadata: {
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
          post_audit_bonus: postAuditBonus,
          score: scoringResult.score,
          base_score: scoringResult.baseScore,
          is_qualified: scoringResult.isQualified,
          disqualify_reason: scoringResult.disqualifyReason,
          ...(auditContext && {
            audit_id: auditContext.id,
            audit_url: auditContext.url,
            audit_score: auditContext.score,
            source: 'post_audit_cta',
          }),
        },
      });

      // Show result
      setResult(scoringResult);
      setCurrentStep(totalSteps);

      toast({
        title: scoringResult.isQualified ? "Félicitations !" : "Demande envoyée",
        description: scoringResult.isQualified
          ? "Vous êtes éligible à un audit tracking offert !"
          : "Consultez nos ressources offertes.",
        className: scoringResult.isQualified
          ? "bg-gradient-to-r from-primary to-secondary text-white border-0 shadow-lg shadow-primary/25"
          : undefined,
      });

      // Send confirmation email via API (non-blocking)
      try {
        await sendEmail({
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
        });
      } catch (emailErr) {
        console.warn('[QualificationForm] Confirmation email failed:', emailErr);
      }

    } catch (err) {
      const isNetwork = !(err instanceof ApiError);
      toast({
        title: "Erreur",
        description: isNetwork
          ? "Impossible de contacter le serveur. Vérifiez votre connexion et réessayez."
          : "Une erreur est survenue lors de l'envoi. Veuillez réessayer.",
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

  const isResultStep = currentStep === totalSteps;

  return (
    <div ref={formRef} className="relative w-full max-w-3xl mx-auto scroll-mt-4">
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
        {/* Audit context banner */}
        {auditContext && !isResultStep && (
          <div className="mb-6 p-4 rounded-xl border border-primary/30 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
            <div className="flex items-start gap-3">
              <ScanSearch className="w-5 h-5 icon-gradient shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">
                  Audit détecté :{' '}
                  <span className="text-gradient-primary">
                    {auditContext.url.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                  </span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {auditContext.score != null && `Score ${auditContext.score}/100 — `}
                  Quelques infos pour qu'un expert puisse analyser vos résultats.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Hot Prospect Badge */}
        {isHotProspect && !isResultStep && !auditContext && (
          <div className="flex items-center gap-2 mb-4 px-3 py-1.5 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full w-fit border border-primary/30">
            <Flame className="w-4 h-4 icon-gradient" />
            <span className="text-sm font-medium text-gradient-primary">Prospect prioritaire</span>
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

        {/* Steps — Profile → (Situation if full) → Need → Contact */}
        {currentStep === 1 && (
          <ProfileStep
            data={formData}
            updateData={updateData}
            onNext={nextStep}
            isHotProspect={isHotProspect || !!auditContext}
          />
        )}

        {!auditContext && currentStep === 2 && (
          <SituationStep
            data={formData}
            updateData={updateData}
            onNext={nextStep}
            onPrev={prevStep}
          />
        )}

        {((!auditContext && currentStep === 3) || (auditContext && currentStep === 2)) && (
          <NeedStep
            data={formData}
            updateData={updateData}
            onNext={nextStep}
            onPrev={prevStep}
          />
        )}

        {((!auditContext && currentStep === 4) || (auditContext && currentStep === 3)) && (
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
