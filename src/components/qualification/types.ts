import { z } from 'zod';

// Schema de validation
export const leadSchema = z.object({
  // Step 1: Profile
  profile_type: z.string().min(1, "Veuillez sélectionner votre profil"),

  // Step 2: Situation
  current_situation: z.string().optional(),
  pain_points: z.array(z.string()).optional(),

  // Step 3: Need
  budget_range: z.string().optional(),
  timeline: z.string().optional(),
  priority: z.string().optional(),

  // Step 4: Contact
  company_name: z.string().min(1, "Nom de l'entreprise requis").max(200),
  full_name: z.string().min(2, "Prénom et nom requis").max(100),
  email: z.string().email("Email invalide").max(255),
  phone: z.string().min(8, "Téléphone requis").regex(/^\+\d{8,15}$/, "Format E.164 invalide"),
  gdpr_consent: z.literal(true, { errorMap: () => ({ message: "Vous devez accepter le traitement de vos données" }) }),
  newsletter_optin: z.boolean().optional(),
});

export type LeadFormData = z.infer<typeof leadSchema>;

export interface StepProps {
  data: Partial<LeadFormData>;
  updateData: (updates: Partial<LeadFormData>) => void;
  onNext: () => void;
  onPrev?: () => void;
  isHotProspect?: boolean;
}

// Profile options — grouped
export const PROFILE_GROUPS = [
  {
    label: 'Agence / Consultant',
    options: [
      { value: 'consultant_sea', label: 'Consultant SEA', score: 10 },
      { value: 'agency_sea', label: 'Agence SEA', score: 10 },
    ],
  },
  {
    label: 'Annonceur',
    options: [
      { value: 'ecommerce', label: 'E-commerce', score: 8 },
      { value: 'saas', label: 'SaaS', score: 8 },
      { value: 'other_services', label: 'Autres services', score: 6 },
    ],
  },
] as const;

// Flat list for scoring lookup
export const PROFILE_OPTIONS = PROFILE_GROUPS.flatMap(g => g.options);

// Pain points — checkboxes (multi-select)
export const PAIN_POINTS_OPTIONS = [
  { value: 'data_loss', label: 'Perte de données', score: 9 },
  { value: 'budget_optimization', label: 'Optimisation budget pub', score: 9 },
  { value: 'low_profitability', label: 'Faible rentabilité', score: 9 },
  { value: 'attribution', label: 'Mauvaise attribution', score: 8 },
  { value: 'compliance', label: 'Mise en conformité RGPD', score: 7 },
  { value: 'missing_kpis', label: "Manque d'indicateurs clés", score: 7 },
  { value: 'technical_limitation', label: 'Limitation technique', score: 6 },
  { value: 'integration', label: "Intégration d'outils", score: 6 },
] as const;

// Situation tracking — radio (single)
export const SITUATION_OPTIONS = [
  { value: 'no_tracking', label: 'Pas de tracking', score: 2 },
  { value: 'extensions', label: 'Tracking simple grâce à des extensions', score: 4 },
  { value: 'client_side', label: 'Tracking Client-side (Google Tag Manager, ...)', score: 8 },
  { value: 'server_side_partial', label: 'Tracking Server-side partiel (API Conversion)', score: 7 },
  { value: 'server_side_full', label: 'Tracking Server-side complet', score: 6 },
] as const;

// Budget — dropdown
export const BUDGET_OPTIONS = [
  { value: 'not_defined', label: 'Non défini', score: 0, disqualify: true },
  { value: 'under_5k', label: 'Moins de 5 000€', score: 1 },
  { value: '5k_10k', label: '5 000€ - 10 000€', score: 5 },
  { value: '10k_20k', label: '10 000€ - 20 000€', score: 8 },
  { value: '20k_plus', label: 'Plus de 20 000€', score: 10 },
] as const;

// Timeline — dropdown
export const TIMELINE_OPTIONS = [
  { value: 'asap', label: 'Dès que possible', score: 10 },
  { value: '1_month', label: 'Dans le mois', score: 9 },
  { value: '1_3_months', label: '1 à 3 mois', score: 7 },
  { value: '3_6_months', label: '3 à 6 mois', score: 4 },
  { value: '6_months_plus', label: 'Plus de 6 mois', score: 0, disqualify: true },
] as const;

// Priority — radio
export const PRIORITY_OPTIONS = [
  { value: 'critical', label: 'Critique - urgent', score: 10 },
  { value: 'high', label: 'Haute priorité', score: 8 },
  { value: 'medium', label: 'Priorité moyenne', score: 5 },
  { value: 'low', label: 'Faible priorité', score: 2 },
] as const;

// Scoring logic
export interface ScoringResult {
  score: number;
  baseScore: number;
  behavioralBonus: number;
  isQualified: boolean;
  disqualifyReason?: string;
}

export function calculateScore(data: Partial<LeadFormData>, behavioralBonus: number = 0): ScoringResult {
  let score = 0;
  let disqualifyReason: string | undefined;

  // Profile score
  const profile = PROFILE_OPTIONS.find(p => p.value === data.profile_type);
  if (profile) {
    score += profile.score;
  }

  // Situation score
  const situation = SITUATION_OPTIONS.find(s => s.value === data.current_situation);
  if (situation) {
    score += situation.score;
  }

  // Pain points score (cumulative)
  if (data.pain_points?.length) {
    data.pain_points.forEach(pp => {
      const painPoint = PAIN_POINTS_OPTIONS.find(p => p.value === pp);
      if (painPoint) score += painPoint.score;
    });
  }

  // Budget score
  const budget = BUDGET_OPTIONS.find(b => b.value === data.budget_range);
  if (budget) {
    score += budget.score;
    if ('disqualify' in budget && budget.disqualify) {
      disqualifyReason = 'Budget non défini — nous avons besoin d\'une estimation pour avancer';
    }
  }

  // Timeline score
  const timeline = TIMELINE_OPTIONS.find(t => t.value === data.timeline);
  if (timeline) {
    score += timeline.score;
    if ('disqualify' in timeline && timeline.disqualify) {
      disqualifyReason = 'Délai trop long pour une collaboration immédiate';
    }
  }

  // Priority score
  const priority = PRIORITY_OPTIONS.find(p => p.value === data.priority);
  if (priority) {
    score += priority.score;
  }

  const baseScore = score;

  // Add behavioral bonus (doesn't override disqualification)
  score += behavioralBonus;

  // Qualification threshold: 30 points minimum without disqualification
  const isQualified = score >= 30 && !disqualifyReason;

  return { score, baseScore, behavioralBonus, isQualified, disqualifyReason };
}
