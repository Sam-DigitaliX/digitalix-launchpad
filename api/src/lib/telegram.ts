import { sql } from '../db.js';

/**
 * Real-time lead notifications to a dedicated Telegram bot/chat.
 *
 * Triggered on every `generate_lead`-equivalent server event (audit unlock,
 * qualification/contact form). Fire-and-forget: never throws, never blocks the
 * API response. Uses HTML parse mode + an (expandable) blockquote so the feed
 * stays clean — headline visible, detail collapsed for simple leads, expanded
 * for hot/qualified ones.
 */

const BOT_TOKEN = process.env.TELEGRAM_LEADS_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_LEADS_CHAT_ID;
const SITE = process.env.PUBLIC_SITE_URL ?? 'https://digitalix.xyz';

let warnedMissingConfig = false;

export interface LeadNotification {
  contactId: string;
  email: string;
  /** qualification_form | contact | audit_unlock | post_audit_cta | … */
  leadSource: string;
  /** Interaction type for the "Nᵉ du jour" counter (e.g. 'audit_unlock'). */
  interactionType?: string | null;
  /** Resolved traffic source label: 'LinkedIn', 'google / cpc', 'direct'… */
  trafficSource?: string | null;
  profileType?: string | null;
  company?: string | null;
  qualificationScore?: number | null;
  isQualified?: boolean | null;
  auditId?: string | null;
  auditUrl?: string | null;
  auditScore?: number | null;
  /** Scan not finished yet → score not meaningful. */
  auditPending?: boolean;
  partnerSlug?: string | null;
}

const ENTRY_LABELS: Record<string, string> = {
  audit_unlock: 'Audit Checker',
  post_audit_cta: 'Post-audit',
  qualification_form: 'Formulaire de qualif',
  audit_contact_request: 'Contact (post-audit)',
  contact: 'Formulaire de contact',
};

const TEMP_LABELS: Record<string, string> = {
  hot: '🔥 Chaud',
  warm: 'Tiède',
  cold: 'Froid',
};

function esc(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function domainOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

function buildHtml(n: LeadNotification, temperature: string, dayCount: number): string {
  const hot = n.isQualified === true || temperature === 'hot';
  const entry = ENTRY_LABELS[n.leadSource] ?? 'Lead';

  const head = hot
    ? `🎯 <b>Lead QUALIFIÉ${n.qualificationScore != null ? ` · ${n.qualificationScore}/100` : ''}</b>`
    : `🟠 <b>Nouveau lead · ${esc(entry)}</b>`;

  const srcLine = `📣 ${n.trafficSource ? esc(n.trafficSource) : 'source inconnue'}`;

  const lines: string[] = [`👤 ${esc(n.email)}`];
  if (n.company) lines.push(`🏢 ${esc(n.company)}`);
  if (n.profileType) lines.push(`🧭 Profil : ${esc(n.profileType)}`);
  if (n.auditUrl) {
    const score = n.auditPending ? 'scan en cours' : `<b>${n.auditScore ?? 0}/100</b>`;
    lines.push(`🛠 ${esc(domainOf(n.auditUrl))} — site audité ${score}`);
  }
  if (n.partnerSlug) lines.push(`🤝 Partenaire : ${esc(n.partnerSlug)}`);
  lines.push(`🌡 ${TEMP_LABELS[temperature] ?? 'Tiède'} · entrée : ${esc(entry)}`);
  if (dayCount > 0) lines.push(`🔢 ${dayCount}ᵉ lead du jour`);

  const detail = lines.join('\n');
  const quote = hot
    ? `<blockquote>${detail}</blockquote>`
    : `<blockquote expandable>${detail}</blockquote>`;

  return `${head}\n${srcLine}\n${quote}`;
}

function buildKeyboard(n: LeadNotification) {
  const row: Array<{ text: string; url: string }> = [
    { text: '🔎 Ouvrir le contact', url: `${SITE}/admin?contact=${n.contactId}` },
  ];
  if (n.auditId) {
    row.push({ text: '📄 Voir l’audit', url: `${SITE}/audit-tracking/resultats/${n.auditId}` });
  }
  return { inline_keyboard: [row] };
}

/** Fire-and-forget. Awaitable but never rejects. */
export async function sendLeadNotification(n: LeadNotification): Promise<void> {
  try {
    if (!BOT_TOKEN || !CHAT_ID) {
      if (!warnedMissingConfig) {
        console.warn('[telegram] TELEGRAM_LEADS_BOT_TOKEN / TELEGRAM_LEADS_CHAT_ID not set — lead notifications disabled');
        warnedMissingConfig = true;
      }
      return;
    }

    const [meta] = await sql`
      SELECT
        (SELECT lead_temperature FROM admin_contacts_overview WHERE id = ${n.contactId}) AS temperature,
        (
          SELECT count(*)::int FROM interactions
          WHERE type = ${n.interactionType ?? null}
            AND created_at >= date_trunc('day', now())
        ) AS day_count
    `;

    const temperature = (meta?.temperature as string) ?? 'warm';
    const dayCount = Number(meta?.day_count) || 0;

    const text = buildHtml(n, temperature, dayCount);

    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
        reply_markup: buildKeyboard(n),
      }),
    });

    if (!res.ok) {
      console.error('[telegram] lead notif failed', res.status, await res.text().catch(() => ''));
    }
  } catch (err) {
    console.error('[telegram] lead notif error', err);
  }
}
