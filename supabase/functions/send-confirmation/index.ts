// supabase/functions/send-confirmation/index.ts
// Edge Function: sends a confirmation email via Resend after form submission
//
// Deploy: supabase functions deploy send-confirmation
// Secret: supabase secrets set RESEND_API_KEY=re_xxxxx

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/* ──────────────────────── Config ──────────────────────── */

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const FROM_EMAIL = "DigitaliX <noreply@digitalix.xyz>";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

/* ──────────────────── Label Mappings ──────────────────── */

const PROFILE_LABELS: Record<string, string> = {
  consultant_sea: "Consultant SEA",
  agency_sea: "Agence SEA",
  ecommerce: "E-commerce",
  saas: "SaaS",
  other_services: "Autres services",
};

const PAIN_LABELS: Record<string, string> = {
  data_loss: "Perte de données",
  budget_optimization: "Optimisation budget pub",
  low_profitability: "Faible rentabilité",
  attribution: "Mauvaise attribution",
  compliance: "Mise en conformité RGPD",
  missing_kpis: "Manque d'indicateurs clés",
  technical_limitation: "Limitation technique",
  integration: "Intégration d'outils",
};

const SITUATION_LABELS: Record<string, string> = {
  no_tracking: "Pas de tracking",
  extensions: "Tracking via extensions",
  client_side: "Client-side (GTM)",
  server_side_partial: "Server-side partiel",
  server_side_full: "Server-side complet",
};

const BUDGET_LABELS: Record<string, string> = {
  not_defined: "Non défini",
  under_5k: "Moins de 5 000€",
  "5k_10k": "5 000€ – 10 000€",
  "10k_20k": "10 000€ – 20 000€",
  "20k_plus": "Plus de 20 000€",
};

const TIMELINE_LABELS: Record<string, string> = {
  asap: "Dès que possible",
  "1_month": "Dans le mois",
  "1_3_months": "1 à 3 mois",
  "3_6_months": "3 à 6 mois",
  "6_months_plus": "Plus de 6 mois",
};

/* ──────────────────── Request Types ──────────────────── */

interface ConfirmationPayload {
  email: string;
  full_name: string;
  company_name?: string;
  profile_type?: string;
  current_situation?: string;
  pain_points?: string[];
  budget_range?: string;
  timeline?: string;
  score: number;
  is_qualified: boolean;
}

interface AuditUnlockPayload {
  email: string;
  url: string;
  score: number;
}

type EmailPayload =
  | { type: "confirmation"; data: ConfirmationPayload }
  | { type: "audit_unlock"; data: AuditUnlockPayload };

/* ──────────────── Email Template Builders ──────────────── */

function buildConfirmationEmail(d: ConfirmationPayload): {
  subject: string;
  html: string;
  template_key: string;
} {
  const firstName = d.full_name.split(" ")[0];
  const isQualified = d.is_qualified;

  const subject = isQualified
    ? `${firstName}, votre audit tracking offert vous attend`
    : `${firstName}, merci pour votre demande`;

  const template_key = isQualified
    ? "confirmation_qualified"
    : "confirmation_unqualified";

  // Build summary rows
  const summaryRows: string[] = [];

  if (d.profile_type) {
    summaryRows.push(
      row("Profil", PROFILE_LABELS[d.profile_type] || d.profile_type)
    );
  }
  if (d.company_name) {
    summaryRows.push(row("Entreprise", d.company_name));
  }
  if (d.current_situation) {
    summaryRows.push(
      row(
        "Situation actuelle",
        SITUATION_LABELS[d.current_situation] || d.current_situation
      )
    );
  }
  if (d.pain_points?.length) {
    const labels = d.pain_points.map((p) => PAIN_LABELS[p] || p);
    summaryRows.push(row("Problématiques", labels.join(", ")));
  }
  if (d.budget_range) {
    summaryRows.push(
      row("Budget", BUDGET_LABELS[d.budget_range] || d.budget_range)
    );
  }
  if (d.timeline) {
    summaryRows.push(
      row("Délai souhaité", TIMELINE_LABELS[d.timeline] || d.timeline)
    );
  }

  const qualifiedBlock = isQualified
    ? `
      <div style="background: linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%); border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center;">
        <p style="color: #ffffff; font-size: 18px; font-weight: 700; margin: 0 0 8px 0;">
          Vous êtes éligible à un audit tracking offert
        </p>
        <p style="color: rgba(255,255,255,0.85); font-size: 14px; margin: 0 0 16px 0;">
          Un expert DigitaliX va analyser votre setup en détail et vous recontacte sous 24h.
        </p>
        <a href="https://digitalix.fr/contact" style="display: inline-block; background: #ffffff; color: #7c3aed; font-weight: 600; font-size: 14px; padding: 12px 28px; border-radius: 8px; text-decoration: none;">
          Réserver un créneau
        </a>
      </div>`
    : `
      <div style="background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center;">
        <p style="color: #374151; font-size: 16px; font-weight: 600; margin: 0 0 8px 0;">
          Merci pour votre intérêt
        </p>
        <p style="color: #6b7280; font-size: 14px; margin: 0 0 16px 0;">
          Votre demande ne correspond pas encore à nos critères d'audit offert, mais nous avons des ressources pour vous aider.
        </p>
        <a href="https://digitalix.fr/#faq" style="display: inline-block; background: #7c3aed; color: #ffffff; font-weight: 600; font-size: 14px; padding: 12px 28px; border-radius: 8px; text-decoration: none;">
          Consulter nos ressources
        </a>
      </div>`;

  const html = baseLayout(`
    <h1 style="color: #111827; font-size: 24px; font-weight: 700; margin: 0 0 8px 0;">
      Bonjour ${esc(firstName)},
    </h1>
    <p style="color: #6b7280; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
      Merci d'avoir complété notre formulaire de qualification. Voici le récapitulatif de votre demande :
    </p>

    <!-- Summary Table -->
    <div style="background: #f9fafb; border: 1px solid #f3f4f6; border-radius: 12px; overflow: hidden; margin: 0 0 8px 0;">
      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
        ${summaryRows.join("")}
      </table>
    </div>

    <!-- Score badge -->
    <div style="text-align: center; margin: 20px 0;">
      <span style="display: inline-block; background: ${isQualified ? "#f0fdf4" : "#fef3c7"}; color: ${isQualified ? "#166534" : "#92400e"}; font-size: 13px; font-weight: 600; padding: 6px 16px; border-radius: 20px;">
        Score de qualification : ${d.score} / 100
      </span>
    </div>

    ${qualifiedBlock}

    <p style="color: #9ca3af; font-size: 13px; line-height: 1.5; margin: 24px 0 0 0;">
      Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email.
    </p>
  `);

  return { subject, html, template_key };
}

function buildAuditUnlockEmail(d: AuditUnlockPayload): {
  subject: string;
  html: string;
  template_key: string;
} {
  const subject = "Votre rapport d'audit tracking est prêt";
  const template_key = "audit_unlock";

  const html = baseLayout(`
    <h1 style="color: #111827; font-size: 24px; font-weight: 700; margin: 0 0 8px 0;">
      Votre rapport est débloqué
    </h1>
    <p style="color: #6b7280; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
      Merci d'avoir utilisé notre outil d'audit. Voici les résultats pour
      <strong style="color: #111827;">${esc(d.url)}</strong>.
    </p>

    <div style="text-align: center; margin: 24px 0;">
      <span style="display: inline-block; background: ${d.score >= 70 ? "#f0fdf4" : d.score >= 50 ? "#fef3c7" : "#fef2f2"}; color: ${d.score >= 70 ? "#166534" : d.score >= 50 ? "#92400e" : "#991b1b"}; font-size: 20px; font-weight: 700; padding: 12px 28px; border-radius: 12px;">
        Score : ${d.score} / 100
      </span>
    </div>

    <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0 0 24px 0;">
      Ce diagnostic automatique révèle des axes d'amélioration. Pour un plan d'action personnalisé,
      réservez un audit approfondi avec un expert DigitaliX.
    </p>

    <div style="text-align: center; margin: 24px 0;">
      <a href="https://digitalix.fr/contact" style="display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%); color: #ffffff; font-weight: 600; font-size: 14px; padding: 14px 32px; border-radius: 8px; text-decoration: none;">
        Réserver mon audit offert
      </a>
    </div>

    <p style="color: #9ca3af; font-size: 13px; line-height: 1.5; margin: 24px 0 0 0;">
      Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email.
    </p>
  `);

  return { subject, html, template_key };
}

/* ──────────────────── HTML Helpers ──────────────────── */

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function row(label: string, value: string): string {
  return `
    <tr>
      <td style="padding: 12px 16px; border-bottom: 1px solid #f3f4f6; color: #6b7280; font-size: 13px; font-weight: 500; width: 140px; vertical-align: top;">
        ${esc(label)}
      </td>
      <td style="padding: 12px 16px; border-bottom: 1px solid #f3f4f6; color: #111827; font-size: 13px; font-weight: 600;">
        ${esc(value)}
      </td>
    </tr>`;
}

function baseLayout(content: string): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>DigitaliX</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <!-- Header -->
    <div style="text-align: center; margin-bottom: 32px;">
      <span style="font-size: 22px; font-weight: 800; color: #7c3aed; letter-spacing: -0.5px;">
        DigitaliX
      </span>
    </div>

    <!-- Card -->
    <div style="background: #ffffff; border-radius: 16px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.08);">
      ${content}
    </div>

    <!-- Footer -->
    <div style="text-align: center; margin-top: 32px;">
      <p style="color: #9ca3af; font-size: 12px; line-height: 1.5; margin: 0;">
        DigitaliX — Server-Side Tracking Experts<br />
        Cet email a été envoyé à la suite de votre interaction sur digitalix.fr
      </p>
      <p style="margin: 12px 0 0 0;">
        <a href="https://digitalix.fr" style="color: #7c3aed; font-size: 12px; text-decoration: none;">
          digitalix.fr
        </a>
      </p>
    </div>
  </div>
</body>
</html>`;
}

/* ──────────────────── Main Handler ──────────────────── */

Deno.serve(async (req: Request) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const payload: EmailPayload = await req.json();
    let subject: string;
    let html: string;
    let template_key: string;
    let toEmail: string;

    if (payload.type === "confirmation") {
      const result = buildConfirmationEmail(payload.data);
      subject = result.subject;
      html = result.html;
      template_key = result.template_key;
      toEmail = payload.data.email;
    } else if (payload.type === "audit_unlock") {
      const result = buildAuditUnlockEmail(payload.data);
      subject = result.subject;
      html = result.html;
      template_key = result.template_key;
      toEmail = payload.data.email;
    } else {
      return new Response(
        JSON.stringify({ error: "Unknown email type" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Send via Resend
    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [toEmail],
        subject,
        html,
      }),
    });

    const resendData = await resendRes.json();

    if (!resendRes.ok) {
      console.error("[send-confirmation] Resend error:", resendData);
      return new Response(
        JSON.stringify({ error: "Email send failed", details: resendData }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Log email in database via service_role
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    await supabase.rpc("log_email", {
      p_contact_email: toEmail,
      p_to_email: toEmail,
      p_template_key: template_key,
      p_subject: subject,
      p_resend_message_id: resendData.id ?? null,
      p_status: "sent",
      p_metadata:
        payload.type === "confirmation"
          ? { score: payload.data.score, is_qualified: payload.data.is_qualified }
          : { url: payload.data.url, score: payload.data.score },
    });

    return new Response(
      JSON.stringify({ success: true, message_id: resendData.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("[send-confirmation] Unexpected error:", err);
    return new Response(
      JSON.stringify({ error: "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
