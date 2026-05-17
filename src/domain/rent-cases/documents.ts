import { LEGAL_DISCLAIMER } from "@/lib/constants";
import { computeOldestUnpaidMonth, formatFrenchDate, formatMoney } from ".";
import type { DocumentType, EventLike, RentLineLike } from "./types";

export type DocumentInput = {
  type: DocumentType;
  landlord: { fullName: string; email: string; phone: string; address: string; defaultSignature: string };
  tenant: { firstName: string; lastName: string; email: string; phone: string; address: string; guarantorName?: string | null };
  property: { name: string; address: string; city: string; postalCode: string; rentAmountCents: number; chargesAmountCents: number; paymentDayOfMonth: number; leaseStartDate: Date };
  rentCase: { totalUnpaidCents: number; firstMissedPaymentDate: Date; nextActionLabel: string };
  lines: RentLineLike[];
  events: EventLike[];
  documents?: { title: string; type: string; createdAt: Date }[];
  currentDate: Date;
  customNote?: string;
};

type GeneratedTemplate = { title: string; contentHtml: string; contentText: string };

const esc = (value: string) =>
  value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");

const p = (text: string) => `<p>${esc(text)}</p>`;

function parties(input: DocumentInput) {
  const tenantName = `${input.tenant.firstName} ${input.tenant.lastName}`;
  return { tenantName, landlordName: input.landlord.fullName };
}

function lineTable(lines: RentLineLike[]) {
  const rows = lines
    .map(
      (line) =>
        `<tr><td>${esc(line.periodLabel)}</td><td>${formatFrenchDate(line.dueDate)}</td><td>${formatMoney(line.rentDueCents)}</td><td>${formatMoney(line.chargesDueCents)}</td><td>${formatMoney(line.paidAmountCents)}</td><td><strong>${formatMoney(line.unpaidAmountCents)}</strong></td></tr>`,
    )
    .join("");
  return `<table><thead><tr><th>Période</th><th>Échéance</th><th>Loyer</th><th>Charges</th><th>Payé</th><th>Restant dû</th></tr></thead><tbody>${rows}</tbody></table>`;
}

export function wrap(title: string, body: string, input: DocumentInput, sensitive = false): GeneratedTemplate {
  const text = body.replace(/<[^>]+>/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
  const contentHtml = `<article class="printable-document"><header><p>${esc(input.landlord.fullName)}<br>${esc(input.landlord.address)}<br>${esc(input.landlord.email)} - ${esc(input.landlord.phone)}</p><p>${esc(input.tenant.firstName)} ${esc(input.tenant.lastName)}<br>${esc(input.tenant.address)}</p><p>Fait le ${formatFrenchDate(input.currentDate)}</p></header><h1>${esc(title)}</h1>${body}<footer>${p(sensitive ? `${LEGAL_DISCLAIMER} Document préparatoire à vérifier avant envoi.` : LEGAL_DISCLAIMER)}</footer></article>`;
  return { title, contentHtml, contentText: `${title}\n\n${text}\n\n${LEGAL_DISCLAIMER}` };
}

export function generateDocumentTemplate(input: DocumentInput): GeneratedTemplate {
  const { tenantName } = parties(input);
  const total = formatMoney(input.rentCase.totalUnpaidCents);
  const propertyLine = `${input.property.address}, ${input.property.postalCode} ${input.property.city}`;
  const note = input.customNote ? p(`Note ajoutée : ${input.customNote}`) : "";

  if (input.type === "AMICABLE_REMINDER_EMAIL") {
    return wrap(
      "Relance amiable par email",
      [
        p(`Bonjour ${tenantName},`),
        p(`Je me permets de vous écrire au sujet du règlement du loyer et des charges du logement situé ${propertyLine}. Sauf erreur de ma part, le montant restant dû à ce jour est de ${total}, la première échéance concernée datant du ${formatFrenchDate(input.rentCase.firstMissedPaymentDate)}.`),
        p("Pouvez-vous me confirmer la situation et me proposer une date de régularisation, ou me contacter afin que nous échangions sur une solution écrite adaptée, par exemple un plan d’apurement ?"),
        p("Je souhaite que nos échanges restent calmes, factuels et correctement documentés."),
        note,
        p(`Cordialement,\n${input.landlord.defaultSignature}`)
      ].join(""),
      input,
    );
  }

  if (input.type === "AMICABLE_REMINDER_LETTER") {
    return wrap(
      "Relance amiable - loyer impayé",
      [
        p("Objet : relance amiable concernant un retard de paiement"),
        p(`Madame, Monsieur ${tenantName},`),
        p(`Je constate un retard de paiement concernant le logement ${propertyLine}. Le montant restant dû ressort à ${total}.`),
        lineTable(input.lines),
        p("Je vous invite à régulariser la situation ou à prendre contact rapidement afin d’envisager une solution écrite et réaliste."),
        note,
        p(`Signature : ${input.landlord.defaultSignature}`)
      ].join(""),
      input,
    );
  }

  if (input.type === "FORMAL_NOTICE_DRAFT") {
    return wrap(
      "Brouillon à vérifier - mise en demeure",
      [
        p("Objet : brouillon de mise en demeure concernant un retard de paiement"),
        p("Ce document est un brouillon préparatoire. Il doit être relu et adapté avec un conseil juridique, une ADIL, un avocat ou un commissaire de justice avant tout envoi."),
        p(`Selon les informations enregistrées, le montant restant dû par ${tenantName} pour le logement ${propertyLine} est de ${total}.`),
        lineTable(input.lines),
        p("Je vous demande de prendre contact afin de régulariser la situation ou de formaliser une proposition écrite de règlement."),
        note
      ].join(""),
      input,
      true,
    );
  }

  if (input.type === "REPAYMENT_PLAN") {
    const instalment = Math.ceil(input.rentCase.totalUnpaidCents / 3);
    const rows = [1, 2, 3]
      .map((index) => `<tr><td>${index}</td><td>À convenir par écrit</td><td>${formatMoney(index === 3 ? input.rentCase.totalUnpaidCents - instalment * 2 : instalment)}</td><td>Signature des parties</td></tr>`)
      .join("");
    return wrap(
      "Plan d’apurement proposé",
      [
        p(`Ce plan d’apurement vise à formaliser une proposition amiable de règlement du solde de ${total} concernant le logement ${propertyLine}.`),
        `<table><thead><tr><th>Échéance</th><th>Date</th><th>Montant</th><th>Validation</th></tr></thead><tbody>${rows}</tbody></table>`,
        p("Le paiement du loyer courant reste à suivre séparément selon les termes du bail."),
        p("Signatures précédées de la mention lu et approuvé : Bailleur / Locataire"),
        note
      ].join(""),
      input,
    );
  }

  if (input.type === "GUARANTOR_INFORMATION_LETTER") {
    return wrap(
      "Information de la caution",
      [
        p("Objet : information factuelle concernant un retard de paiement"),
        p(`Je vous informe, de manière factuelle, qu’un retard de paiement est enregistré concernant ${tenantName} pour le logement ${propertyLine}. Le montant restant dû indiqué dans le dossier est de ${total}.`),
        p("Cette information ne constitue pas une pression ni une demande abusive. Elle vise à conserver une trace claire de la situation selon le bail et les engagements applicables."),
        note
      ].join(""),
      input,
      true,
    );
  }

  if (input.type === "RENT_RECEIPT") {
    const receiptLine = input.lines.find((l) => l.status === "PAID") ?? input.lines[0];
    const period = receiptLine ? esc(receiptLine.periodLabel) : "période concernée";
    const amount = formatMoney(
      receiptLine ? receiptLine.paidAmountCents : input.property.rentAmountCents + input.property.chargesAmountCents
    );
    return wrap(
      `Quittance de loyer — ${period}`,
      [
        p(`Je soussigné(e) ${input.landlord.fullName}, bailleur du logement sis ${propertyLine}, reconnais avoir reçu de ${tenantName} la somme de ${amount} au titre du loyer et des charges pour la période : ${period}.`),
        p("Sous réserve de règlement effectif du présent loyer."),
        note,
        p(`Fait le ${formatFrenchDate(input.currentDate)}`),
        p(`Signature du bailleur : ${input.landlord.defaultSignature}`)
      ].join(""),
      input,
    );
  }

  if (input.type === "PROFESSIONAL_ESCALATION_FILE") {
    const events = input.events.map((event) => `<li>${formatFrenchDate(event.eventDate)} - ${esc(event.title)}${event.description ? ` : ${esc(event.description)}` : ""}</li>`).join("");
    return wrap(
      "Dossier préparatoire pour commissaire de justice / conseil juridique",
      [
        p(`Bailleur : ${input.landlord.fullName}, ${input.landlord.address}, ${input.landlord.email}, ${input.landlord.phone}`),
        p(`Locataire : ${tenantName}, ${input.tenant.address}, ${input.tenant.email}, ${input.tenant.phone}`),
        p(`Logement : ${input.property.name}, ${propertyLine}. Bail commencé le ${formatFrenchDate(input.property.leaseStartDate)}. Loyer ${formatMoney(input.property.rentAmountCents)}, charges ${formatMoney(input.property.chargesAmountCents)}, échéance le ${input.property.paymentDayOfMonth} du mois.`),
        p(`Montant impayé : ${total}. Plus ancienne période impayée : ${computeOldestUnpaidMonth(input.lines)}.`),
        lineTable(input.lines),
        `<h2>Chronologie</h2><ol>${events}</ol>`,
        note
      ].join(""),
      input,
      true,
    );
  }

  const docs = input.documents?.map((document) => `<li>${formatFrenchDate(document.createdAt)} - ${esc(document.title)}</li>`).join("") ?? "";
  const events = input.events.map((event) => `<li>${formatFrenchDate(event.eventDate)} - ${esc(event.title)}</li>`).join("");
  return wrap(
    "Synthèse du dossier",
    [
      p(`Dossier concernant ${tenantName} pour le logement ${propertyLine}.`),
      p(`Montant restant dû : ${total}. Première échéance impayée : ${formatFrenchDate(input.rentCase.firstMissedPaymentDate)}.`),
      lineTable(input.lines),
      `<h2>Événements</h2><ol>${events}</ol>`,
      `<h2>Documents générés</h2><ul>${docs}</ul>`,
      p(`Prochaine action recommandée : ${input.rentCase.nextActionLabel}.`),
      note
    ].join(""),
    input,
    true,
  );
}
