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
  company_name: z.string().optional(),
  full_name: z.string().min(2, "Prénom et nom requis").max(100),
  email: z.string().email("Email invalide").max(255),
  phone: z.string().optional(),
});

export type LeadFormData = z.infer<typeof leadSchema>;

export interface StepProps {
  data: Partial<LeadFormData>;
  updateData: (updates: Partial<LeadFormData>) => void;
  onNext: () => void;
  onPrev?: () => void;
  isHotProspect?: boolean;
}

// Options de profil
export const PROFILE_OPTIONS = [
  { value: 'agency_seo_sea', label: 'Agence SEO/SEA', score: 10 },
  { value: 'ecommerce_manager', label: 'Responsable E-commerce', score: 10 },
  { value: 'marketing_director', label: 'Directeur Marketing', score: 10 },
  { value: 'data_analyst', label: 'Data Analyst', score: 8 },
  { value: 'freelance', label: 'Freelance Marketing', score: 6 },
  { value: 'developer', label: 'Développeur', score: 5 },
  { value: 'student', label: 'Étudiant', score: 0, disqualify: true },
  { value: 'other', label: 'Autre', score: 3 },
] as const;

// Options de situation
export const SITUATION_OPTIONS = [
  { value: 'no_tracking', label: 'Pas de tracking avancé', score: 10 },
  { value: 'basic_gtm', label: 'GTM basique en place', score: 8 },
  { value: 'client_side', label: 'Tracking client-side uniquement', score: 10 },
  { value: 'server_side_partial', label: 'Server-side partiel', score: 5 },
  { value: 'server_side_full', label: 'Server-side complet', score: 2 },
] as const;

// Pain points
export const PAIN_POINTS_OPTIONS = [
  { value: 'data_loss', label: 'Perte de données (adblockers, ITP)', score: 10 },
  { value: 'attribution', label: 'Problèmes d\'attribution', score: 8 },
  { value: 'compliance', label: 'Conformité RGPD/CNIL', score: 7 },
  { value: 'performance', label: 'Performance du site', score: 6 },
  { value: 'integration', label: 'Intégration des outils', score: 5 },
  { value: 'budget_optimization', label: 'Optimisation des budgets pub', score: 9 },
] as const;

// Budget ranges
export const BUDGET_OPTIONS = [
  { value: 'under_5k', label: 'Moins de 5 000€', score: 0, disqualify: true },
  { value: '5k_10k', label: '5 000€ - 10 000€', score: 6 },
  { value: '10k_20k', label: '10 000€ - 20 000€', score: 8 },
  { value: '20k_plus', label: 'Plus de 20 000€', score: 10 },
  { value: 'not_defined', label: 'Budget non défini', score: 4 },
] as const;

// Timeline options
export const TIMELINE_OPTIONS = [
  { value: 'asap', label: 'Dès que possible', score: 10 },
  { value: '1_month', label: 'Dans le mois', score: 9 },
  { value: '1_3_months', label: '1 à 3 mois', score: 7 },
  { value: '3_6_months', label: '3 à 6 mois', score: 4 },
  { value: '6_months_plus', label: 'Plus de 6 mois', score: 0, disqualify: true },
] as const;

// Priority options
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
    if ('disqualify' in profile && profile.disqualify) {
      disqualifyReason = 'Profil non éligible';
    }
  }

  // Situation score
  const situation = SITUATION_OPTIONS.find(s => s.value === data.current_situation);
  if (situation) {
    score += situation.score;
  }

  // Pain points score
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
      disqualifyReason = 'Budget insuffisant pour ce type de projet';
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
