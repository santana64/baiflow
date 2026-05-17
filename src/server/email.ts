import { Resend } from "resend";

function isConfiguredResendKey(key: string | undefined) {
  if (!key) return false;
  if (/replace|your_key|changeme|example/i.test(key)) return false;
  return key.startsWith("re_");
}

const resendApiKey = process.env.RESEND_API_KEY?.trim();
const resend = isConfiguredResendKey(resendApiKey) ? new Resend(resendApiKey) : null;
const from = process.env.EMAIL_FROM ?? "BailFlow <noreply@bailflow.fr>";

export const sendableDocumentTypes = new Set([
  "AMICABLE_REMINDER_EMAIL",
  "REPAYMENT_PLAN",
  "GUARANTOR_INFORMATION_LETTER"
]);

export const emailRecipientLabel: Record<string, string> = {
  AMICABLE_REMINDER_EMAIL: "locataire",
  REPAYMENT_PLAN: "locataire",
  GUARANTOR_INFORMATION_LETTER: "caution"
};

function emailWrapper(title: string, body: string, landlordName: string): string {
  return `<!DOCTYPE html>
<html lang="fr" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
<title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f3f1;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f3f1;">
  <tr>
    <td align="center" style="padding:40px 16px 48px;">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Logo row -->
        <tr>
          <td style="padding-bottom:20px;">
            <a href="https://bailflow.fr" style="text-decoration:none;display:inline-flex;align-items:center;gap:10px;">
              <span style="display:inline-block;width:34px;height:34px;background:#0a0a0a;border-radius:8px;text-align:center;line-height:34px;font-size:16px;color:#ffffff;">⚖</span>
              <span style="font-size:18px;font-weight:700;color:#0a0a0a;letter-spacing:-0.3px;">BailFlow</span>
            </a>
          </td>
        </tr>

        <!-- Main card -->
        <tr>
          <td style="background:#ffffff;border-radius:12px;border:1px solid #e5e5e5;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.06),0 2px 8px rgba(0,0,0,0.04);">

            <!-- Top accent stripe -->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr><td style="background:#16a34a;height:3px;font-size:0;line-height:0;">&nbsp;</td></tr>
            </table>

            <!-- Body content -->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:40px 40px 32px;font-size:15px;line-height:1.75;color:#0a0a0a;">
                  ${body}
                </td>
              </tr>
            </table>

            <!-- Divider -->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr><td style="height:1px;background:#e5e5e5;font-size:0;line-height:0;">&nbsp;</td></tr>
            </table>

            <!-- Sender row -->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:20px 40px;font-size:12px;color:#a8a29e;">
                  Envoyé par <strong style="color:#57534e;">${landlordName}</strong> via BailFlow
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:24px 8px 0;text-align:center;font-size:12px;color:#a8a29e;line-height:1.7;">
            <a href="https://bailflow.fr" style="color:#a8a29e;text-decoration:none;">bailflow.fr</a>
            &nbsp;·&nbsp;Support administratif des impayés locatifs
            <br />
            BailFlow est un outil administratif. Il ne constitue pas un service juridique.
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}

export function emailCtaButton(label: string, url: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;">
  <tr>
    <td style="background:#0a0a0a;border-radius:9999px;text-align:center;">
      <a href="${url}" style="display:inline-block;padding:12px 28px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;letter-spacing:-0.1px;">${label}</a>
    </td>
  </tr>
</table>`;
}

export function emailSection(content: string): string {
  return `<p style="margin:0 0 16px;font-size:15px;line-height:1.75;color:#0a0a0a;">${content}</p>`;
}

function shouldSimulateEmail() {
  return process.env.NODE_ENV !== "production";
}

function logSimulatedEmail(payload: { to: string; subject: string; text?: string; error?: string }) {
  console.info("[BailFlow email dev]", payload);
}

export async function sendDocumentEmail({
  to,
  toName,
  subject,
  documentTitle,
  contentHtml,
  landlordName
}: {
  to: string;
  toName: string;
  subject: string;
  documentTitle: string;
  contentHtml: string;
  landlordName: string;
}) {
  const html = emailWrapper(documentTitle, contentHtml, landlordName);
  if (!resend) {
    if (!shouldSimulateEmail()) throw new Error("RESEND_API_KEY manquant ou invalide");
    logSimulatedEmail({ to, subject });
    return { id: "dev-email" };
  }
  const result = await resend.emails.send({ from, to: `${toName} <${to}>`, subject, html });
  if (result.error) {
    if (shouldSimulateEmail()) {
      logSimulatedEmail({ to, subject, error: result.error.message });
      return { id: "dev-email" };
    }
    throw new Error(result.error.message);
  }
  return result.data as { id: string } | null;
}

export async function sendTransactionalEmail({
  to,
  toName,
  subject,
  html,
  text
}: {
  to: string;
  toName: string;
  subject: string;
  html: string;
  text: string;
}) {
  const wrapped = emailWrapper(subject, html, "BailFlow");
  if (!resend) {
    if (!shouldSimulateEmail()) throw new Error("RESEND_API_KEY manquant ou invalide");
    logSimulatedEmail({ to, subject, text });
    return { id: "dev-email" };
  }
  const result = await resend.emails.send({ from, to: `${toName} <${to}>`, subject, html: wrapped, text });
  if (result.error) {
    if (shouldSimulateEmail()) {
      logSimulatedEmail({ to, subject, text, error: result.error.message });
      return { id: "dev-email" };
    }
    throw new Error(result.error.message);
  }
  return result.data as { id: string } | null;
}
