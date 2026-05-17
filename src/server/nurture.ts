import { addDays } from "date-fns";
import { getAppUrl } from "@/lib/env";
import { prisma } from "./db";
import { emailCtaButton, emailSection, sendTransactionalEmail } from "./email";

const sequence = [
  {
    day: 0,
    subject: "Bienvenue sur BailFlow - votre premier dossier en 20 minutes",
    body: "Créez votre profil bailleur, ajoutez un bien, puis ouvrez un premier dossier d'impayé. Le moment clé: générer votre première relance propre."
  },
  {
    day: 1,
    subject: "L'erreur qui fait perdre du temps aux bailleurs",
    body: "Beaucoup de bailleurs gardent les échanges dans leur téléphone ou leur boîte mail. BailFlow vous aide à tracer chaque action dans une chronologie exploitable."
  },
  {
    day: 3,
    subject: "Générez un courrier calme, factuel et vérifiable",
    body: "Les documents BailFlow privilégient la relance amiable, les faits et la prudence. Vous gardez la main sur chaque envoi."
  },
  {
    day: 5,
    subject: "Préparez un dossier lisible avant l'escalade",
    body: "Si vous devez contacter un commissaire de justice, un avocat ou l'ADIL, BailFlow rassemble les montants, dates, événements et documents."
  },
  {
    day: 7,
    subject: "Votre essai BailFlow se termine dans 7 jours",
    body: "Terminez votre onboarding et générez votre premier document pour mesurer la valeur réelle du workflow."
  },
  {
    day: 10,
    subject: "Passez au forfait annuel et réduisez votre coût",
    body: "Le forfait annuel Bailleur revient à 299€/an au lieu de 408€/an en mensuel. C'est le meilleur choix si vous voulez garder vos dossiers archivés proprement."
  },
  {
    day: 14,
    subject: "Dernier rappel - votre essai BailFlow arrive à échéance",
    body: "Activez Bailleur ou Premium pour conserver la création de dossiers, la génération illimitée et les relances email."
  }
];

export async function scheduleNurtureSequence(user: { id: string; name: string; email: string }) {
  const now = new Date();
  const appUrl = getAppUrl();
  await prisma.nurtureEmail.createMany({
    data: sequence.map((item, index) => ({
      userId: user.id,
      step: index + 1,
      subject: item.subject,
      bodyHtml: buildNurtureHtml(user.name, item.body, appUrl),
      bodyText: `${item.body}\n\nContinuer: ${appUrl}/app/onboarding`,
      sendAfter: addDays(now, item.day)
    })),
    skipDuplicates: true
  });
}

function buildNurtureHtml(name: string, body: string, appUrl: string): string {
  return [
    emailSection(`Bonjour <strong>${name}</strong>,`),
    emailSection(body),
    emailCtaButton("Continuer sur BailFlow", `${appUrl}/app/onboarding`),
    emailSection(`<span style="font-size:13px;color:#a8a29e;">BailFlow est un outil d'aide administrative. Il ne constitue pas un conseil juridique personnalisé.</span>`)
  ].join("");
}

export async function sendDueNurtureEmails(limit = 50) {
  const due = await prisma.nurtureEmail.findMany({
    where: { status: "PENDING", sendAfter: { lte: new Date() }, user: { emailVerifiedAt: { not: null } } },
    include: { user: true },
    orderBy: { sendAfter: "asc" },
    take: limit
  });

  const results: { id: string; email: string; sent: boolean; error?: string }[] = [];
  for (const email of due) {
    try {
      await sendTransactionalEmail({
        to: email.user.email,
        toName: email.user.name,
        subject: email.subject,
        html: email.bodyHtml,
        text: email.bodyText
      });
      await prisma.nurtureEmail.update({ where: { id: email.id }, data: { status: "SENT", sentAt: new Date() } });
      results.push({ id: email.id, email: email.user.email, sent: true });
    } catch (error) {
      await prisma.nurtureEmail.update({ where: { id: email.id }, data: { status: "FAILED" } });
      results.push({ id: email.id, email: email.user.email, sent: false, error: String(error) });
    }
  }
  return results;
}
