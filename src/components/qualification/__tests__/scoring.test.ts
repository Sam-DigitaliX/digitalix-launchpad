import { describe, it, expect } from 'vitest';
import { calculateScore, leadSchema } from '../types';

/* ─────────────── calculateScore ─────────────── */

describe('calculateScore', () => {
  it('returns 0 for empty data', () => {
    const result = calculateScore({});
    expect(result.score).toBe(0);
    expect(result.isQualified).toBe(false);
  });

  it('sums profile + situation + pain points + budget + timeline + priority', () => {
    const result = calculateScore({
      profile_type: 'consultant_sea', // 10
      current_situation: 'client_side', // 8
      pain_points: ['data_loss', 'budget_optimization'], // 9 + 9
      budget_range: '10k_20k', // 8
      timeline: 'asap', // 10
      priority: 'critical', // 10
    });
    expect(result.baseScore).toBe(10 + 8 + 9 + 9 + 8 + 10 + 10);
    expect(result.score).toBe(result.baseScore);
    expect(result.isQualified).toBe(true);
  });

  it('adds behavioral bonus to score', () => {
    const result = calculateScore(
      { profile_type: 'agency_sea', budget_range: '5k_10k', timeline: '1_month', priority: 'high' },
      15,
    );
    expect(result.behavioralBonus).toBe(15);
    expect(result.score).toBe(result.baseScore + 15);
  });

  it('disqualifies when budget is not defined', () => {
    const result = calculateScore({
      profile_type: 'consultant_sea',
      budget_range: 'not_defined',
      timeline: 'asap',
      priority: 'critical',
    });
    expect(result.isQualified).toBe(false);
    expect(result.disqualifyReason).toContain('Budget');
  });

  it('disqualifies when timeline > 6 months', () => {
    const result = calculateScore({
      profile_type: 'consultant_sea',
      budget_range: '20k_plus',
      timeline: '6_months_plus',
      priority: 'critical',
    });
    expect(result.isQualified).toBe(false);
    expect(result.disqualifyReason).toContain('Délai');
  });

  it('does not qualify below 30 points even without disqualification', () => {
    const result = calculateScore({
      profile_type: 'other_services', // 6
      priority: 'low', // 2
    });
    expect(result.score).toBeLessThan(30);
    expect(result.isQualified).toBe(false);
    expect(result.disqualifyReason).toBeUndefined();
  });

  it('behavioral bonus does not override disqualification', () => {
    const result = calculateScore(
      { profile_type: 'consultant_sea', budget_range: 'not_defined', timeline: 'asap', priority: 'critical' },
      100,
    );
    expect(result.score).toBeGreaterThanOrEqual(30);
    expect(result.isQualified).toBe(false);
  });
});

/* ─────────────── leadSchema (Zod) ─────────────── */

describe('leadSchema', () => {
  const validData = {
    profile_type: 'consultant_sea',
    full_name: 'Jean Dupont',
    email: 'jean@entreprise.com',
    phone: '+33612345678',
    company_name: 'Acme',
    gdpr_consent: true as const,
  };

  it('passes with valid required fields', () => {
    expect(leadSchema.safeParse(validData).success).toBe(true);
  });

  it('fails without profile_type', () => {
    const result = leadSchema.safeParse({ ...validData, profile_type: '' });
    expect(result.success).toBe(false);
  });

  it('fails with invalid email', () => {
    const result = leadSchema.safeParse({ ...validData, email: 'not-an-email' });
    expect(result.success).toBe(false);
  });

  it('fails with non-E.164 phone', () => {
    const result = leadSchema.safeParse({ ...validData, phone: '0612345678' });
    expect(result.success).toBe(false);
  });

  it('fails without gdpr consent', () => {
    const result = leadSchema.safeParse({ ...validData, gdpr_consent: false });
    expect(result.success).toBe(false);
  });

  it('accepts optional fields', () => {
    const result = leadSchema.safeParse({
      ...validData,
      current_situation: 'client_side',
      pain_points: ['data_loss'],
      budget_range: '10k_20k',
      timeline: 'asap',
      priority: 'high',
      newsletter_optin: true,
    });
    expect(result.success).toBe(true);
  });
});
