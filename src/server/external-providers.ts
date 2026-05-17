import { DomainError } from "@/lib/errors";

function requireEnv(name: string) {
  const value = process.env[name]?.trim();
  if (!value || /replace|example|your_key|changeme/i.test(value)) {
    throw new DomainError(`${name} doit être configuré avant d'utiliser ce prestataire.`);
  }
  return value;
}

async function jsonRequest<T>(
  method: "GET" | "POST" | "PUT" | "PATCH",
  url: string,
  apiKey: string,
  body?: unknown
): Promise<T> {
  const response = await fetch(url, {
    method,
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`
    },
    body: body !== undefined ? JSON.stringify(body) : undefined
  });
  const text = await response.text();
  if (!response.ok) {
    throw new DomainError(`Prestataire externe indisponible (${response.status}) : ${text.slice(0, 200)}`);
  }
  return (text ? JSON.parse(text) : {}) as T;
}

// ─── AR24 — Lettre Recommandée Électronique ─────────────────────────────────
//
// AR24 delivers eIDAS-compliant electronic registered letters (LRE).
// The sender email must be a verified AR24 address.
// Docs: https://www.ar24.fr/documentation-api
//
// Flow:
//  1. POST /mail  → create the letter (returns id + tracking URL)
//  2. Webhook callbacks → update status (SENT / DELIVERED / REFUSED / FAILED)

export async function sendRegisteredLetterProvider(input: {
  senderEmail: string;
  senderName: string;
  recipientEmail: string;
  recipientName: string;
  documentTitle: string;
  contentHtml: string;
  attachmentBase64?: string;
  attachmentName?: string;
}): Promise<{ id: string; trackingUrl?: string }> {
  const apiKey = requireEnv("AR24_API_KEY");
  const baseUrl = requireEnv("AR24_API_URL");

  const payload: Record<string, unknown> = {
    to_lastname: input.recipientName.split(" ").slice(1).join(" ") || input.recipientName,
    to_firstname: input.recipientName.split(" ")[0],
    to_email: input.recipientEmail,
    from_email: input.senderEmail,
    from_name: input.senderName,
    subject: input.documentTitle,
    content: input.contentHtml,
    ref: `bailflow-${Date.now()}`
  };

  if (input.attachmentBase64 && input.attachmentName) {
    payload.attachments = [
      {
        filename: input.attachmentName,
        content: input.attachmentBase64,
        encoding: "base64",
        contentType: "application/pdf"
      }
    ];
  }

  const result = await jsonRequest<{ id?: string; mail_id?: string; tracking_url?: string }>(
    "POST",
    `${baseUrl}/mail`,
    apiKey,
    payload
  );

  return {
    id: result.id ?? result.mail_id ?? `ar24-${Date.now()}`,
    trackingUrl: result.tracking_url
  };
}

// ─── YouSign V3 — Signature Électronique ─────────────────────────────────────
//
// YouSign V3 uses a 4-step flow:
//  1. POST /signature_requests          → create request
//  2. POST /signature_requests/{id}/documents → upload the PDF document
//  3. POST /signature_requests/{id}/signers   → add the signer with signature fields
//  4. PUT  /signature_requests/{id}/activate  → send the request to signers
//
// Docs: https://developers.yousign.com/docs/build-your-first-yousign-app

type YouSignDocument = {
  id: string;
  name: string;
  nature: string;
};

type YouSignRequest = {
  id: string;
  status: string;
  name: string;
};

type YouSignSigner = {
  id: string;
  status: string;
  signature_link?: string;
};

export async function createSignatureProvider(input: {
  documentTitle: string;
  pdfBase64: string;
  signerEmail: string;
  signerName: string;
  signerPhone?: string;
}): Promise<{ id: string; signatureUrl?: string }> {
  const apiKey = requireEnv("YOUSIGN_API_KEY");
  const baseUrl = requireEnv("YOUSIGN_API_URL");

  // 1. Create the signature request
  const signatureRequest = await jsonRequest<YouSignRequest>(
    "POST",
    `${baseUrl}/signature_requests`,
    apiKey,
    {
      name: input.documentTitle,
      delivery_mode: "email",
      timezone: "Europe/Paris",
      email_notification: {
        sender: { name: "BailFlow" },
        custom_note: "Veuillez signer ce document administratif locatif."
      }
    }
  );

  // 2. Upload the PDF document
  const document = await jsonRequest<YouSignDocument>(
    "POST",
    `${baseUrl}/signature_requests/${signatureRequest.id}/documents`,
    apiKey,
    {
      nature: "signable_document",
      name: `${input.documentTitle}.pdf`,
      content: input.pdfBase64
    }
  );

  // 3. Add the signer with a signature field on page 1
  const nameParts = input.signerName.split(" ");
  const signer = await jsonRequest<YouSignSigner>(
    "POST",
    `${baseUrl}/signature_requests/${signatureRequest.id}/signers`,
    apiKey,
    {
      info: {
        first_name: nameParts[0] ?? input.signerName,
        last_name: nameParts.slice(1).join(" ") || nameParts[0],
        email: input.signerEmail,
        phone_number: input.signerPhone ?? undefined,
        locale: "fr"
      },
      signature_level: "electronic_signature",
      signature_authentication_mode: "otp_email",
      fields: [
        {
          document_id: document.id,
          type: "signature",
          page: 1,
          x: 380,
          y: 700,
          width: 160,
          height: 60
        }
      ]
    }
  );

  // 4. Activate the request (sends emails)
  await jsonRequest<YouSignRequest>(
    "PUT",
    `${baseUrl}/signature_requests/${signatureRequest.id}/activate`,
    apiKey,
    {}
  );

  return {
    id: signatureRequest.id,
    signatureUrl: signer.signature_link
  };
}

// ─── GLI Partner — Garantie Loyers Impayés ───────────────────────────────────

export async function sendGliLeadProvider(input: {
  fullName: string;
  email: string;
  propertyName?: string;
  rentAmountCents?: number;
}): Promise<{ provider?: string; estimatedAnnualPremiumCents?: number; commissionCents?: number }> {
  const apiKey = requireEnv("GLI_PARTNER_API_KEY");
  const endpoint = requireEnv("GLI_PARTNER_API_URL");
  return jsonRequest("POST", endpoint, apiKey, input);
}
