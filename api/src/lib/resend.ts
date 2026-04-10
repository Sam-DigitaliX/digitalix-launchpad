const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = 'DigitaliX <noreply@digitalix.xyz>';

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

interface ResendResponse {
  id?: string;
  message?: string;
}

export async function sendEmail(params: SendEmailParams): Promise<{ id: string }> {
  if (!RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY environment variable is required');
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: [params.to],
      subject: params.subject,
      html: params.html,
    }),
  });

  const data: ResendResponse = await res.json();

  if (!res.ok) {
    throw new Error(`Resend error: ${data.message ?? res.statusText}`);
  }

  return { id: data.id ?? '' };
}
