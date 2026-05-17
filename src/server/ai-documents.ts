import Anthropic from "@anthropic-ai/sdk";
import { formatFrenchDate, formatMoney } from "@/domain/rent-cases";
import { wrap, type DocumentInput } from "@/domain/rent-cases/documents";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const documentTitles: Record<string, string> = {
  AMICABLE_REMINDER_EMAIL: "Relance amiable par email",
  AMICABLE_REMINDER_LETTER: "Relance amiable - loyer impayé",
  FORMAL_NOTICE_DRAFT: "Brouillon à vérifier - mise en demeure",
  REPAYMENT_PLAN: "Plan d'apurement proposé",
  GUARANTOR_INFORMATION_LETTER: "Information de la caution",
  PROFESSIONAL_ESCALATION_FILE: "Dossier préparatoire pour commissaire de justice / conseil juridique",
  CASE_SUMMARY: "Synthèse du dossier"
};

const sensitivetypes = new Set(["FORMAL_NOTICE_DRAFT", "GUARANTOR_INFORMATION_LETTER", "PROFESSIONAL_ESCALATION_FILE", "CASE_SUMMARY"]);

const typeInstructions: Record<string, string> = {
  AMICABLE_REMINDER_EMAIL: "Rédige une relance amiable par email. Ton : cordial, factuel, non agressif. Rappelle le montant impayé et la date de première échéance manquée. Propose une discussion pour trouver une solution amiable (régularisation ou plan d'apurement). 3 à 4 paragraphes courts.",
  AMICABLE_REMINDER_LETTER: "Rédige une relance amiable formelle par courrier. Ton : poli et direct. Mentionne l'objet, la situation précise, et invite le locataire à régulariser ou contacter le bailleur. Inclure une ligne de tableau récapitulatif des mois impayés sous forme de liste structurée.",
  FORMAL_NOTICE_DRAFT: "Rédige un brouillon de mise en demeure. Commence par un avertissement visible indiquant que ce document est un brouillon à relire avec un professionnel avant envoi. Ton : formel, juridiquement neutre. Mentionne le montant exact, les périodes concernées, et demande une régularisation sous 8 jours.",
  REPAYMENT_PLAN: "Rédige une proposition de plan d'apurement en 3 mensualités égales. Présente le total à apurer, le montant de chaque mensualité, et précise que les dates exactes doivent être fixées par accord écrit entre les parties. Ajoute une clause de résiliation du plan en cas de retard.",
  GUARANTOR_INFORMATION_LETTER: "Rédige un courrier d'information à la caution. Ton : factuel, sans pression excessive. Informe de la situation d'impayé. Précise que cette lettre est une information préalable selon les engagements du bail. Commence par un avertissement que ce document est sensible et doit être relu avant envoi.",
  PROFESSIONAL_ESCALATION_FILE: "Rédige un dossier de préparation complet pour un commissaire de justice ou un conseil juridique. Inclure : identités complètes des parties, description du logement et du bail, chronologie détaillée des événements, récapitulatif financier précis, liste des documents déjà générés, et prochaine action recommandée.",
  CASE_SUMMARY: "Rédige une synthèse complète du dossier. Récapitule les informations essentielles : parties, logement, montants, historique, documents, et prochaine étape recommandée. Format structuré avec sections claires."
};

function buildContext(input: DocumentInput): string {
  const tenantName = `${input.tenant.firstName} ${input.tenant.lastName}`;
  const propertyLine = `${input.property.address}, ${input.property.postalCode} ${input.property.city}`;

  const lines = input.lines
    .map((l) => `  - ${l.periodLabel} : loyer ${formatMoney(l.rentDueCents)}, charges ${formatMoney(l.chargesDueCents)}, payé ${formatMoney(l.paidAmountCents)}, restant dû ${formatMoney(l.unpaidAmountCents)}`)
    .join("\n");

  const events = input.events.length
    ? input.events.map((e) => `  - ${formatFrenchDate(e.eventDate)} : ${e.title}${e.description ? ` (${e.description})` : ""}`).join("\n")
    : "  Aucun événement enregistré.";

  const docs = input.documents?.length
    ? input.documents.map((d) => `  - ${formatFrenchDate(d.createdAt)} : ${d.title}`).join("\n")
    : "  Aucun document antérieur.";

  return `CONTEXTE DU DOSSIER :

Bailleur : ${input.landlord.fullName}, ${input.landlord.address}, ${input.landlord.email}, ${input.landlord.phone}
Locataire : ${tenantName}, ${input.tenant.address}, ${input.tenant.email}, ${input.tenant.phone}${input.tenant.guarantorName ? `\nCaution : ${input.tenant.guarantorName}` : ""}
Logement : ${input.property.name}, ${propertyLine}
Bail : depuis le ${formatFrenchDate(input.property.leaseStartDate)}, loyer ${formatMoney(input.property.rentAmountCents)}, charges ${formatMoney(input.property.chargesAmountCents)}, échéance le ${input.property.paymentDayOfMonth} du mois

Montant total impayé : ${formatMoney(input.rentCase.totalUnpaidCents)}
Première échéance manquée : ${formatFrenchDate(input.rentCase.firstMissedPaymentDate)}
Prochaine action recommandée : ${input.rentCase.nextActionLabel}

Détail des impayés :
${lines || "  Aucune ligne."}

Historique des actions :
${events}

Documents déjà générés :
${docs}
${input.customNote ? `\nNote du bailleur : ${input.customNote}` : ""}`;
}

export async function generateDocumentWithAI(input: DocumentInput) {
  const context = buildContext(input);
  const instruction = typeInstructions[input.type] ?? typeInstructions.CASE_SUMMARY;

  const message = await client.messages.create({
    model: process.env.ANTHROPIC_MODEL ?? "claude-3-5-haiku-latest",
    max_tokens: 1024,
    system: `Tu es un assistant spécialisé en gestion locative française. Tu génères des documents administratifs professionnels pour les bailleurs particuliers.
Réponds UNIQUEMENT avec le contenu HTML du document, en utilisant uniquement des balises <p>, <strong>, <em>, <ul>, <li>, <ol>, <h2>, <table>, <thead>, <tbody>, <tr>, <th>, <td>.
NE PAS inclure <html>, <head>, <body>, <article>, ni aucun wrapper. Juste le contenu intérieur.
Rédige en français. Sois précis, professionnel et adapté au contexte légal français.`,
    messages: [
      {
        role: "user",
        content: `${context}\n\nINSTRUCTION : ${instruction}`
      }
    ]
  });

  const body = message.content[0].type === "text" ? message.content[0].text : "";
  const title = documentTitles[input.type] ?? "Document généré";
  const sensitive = sensitivetypes.has(input.type);
  return wrap(title, body, input, sensitive);
}
