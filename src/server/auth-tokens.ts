import { createHash, randomBytes } from "node:crypto";
import { addHours } from "date-fns";
import { getAppUrl } from "@/lib/env";
import { prisma } from "./db";
import { emailCtaButton, emailSection, sendTransactionalEmail } from "./email";

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function createRawToken() {
  return randomBytes(32).toString("base64url");
}

export async function createEmailVerification(user: { id: string; email: string; name: string }) {
  await prisma.emailVerificationToken.updateMany({
    where: { userId: user.id, usedAt: null, expiresAt: { gt: new Date() } },
    data: { usedAt: new Date() }
  });
  const token = createRawToken();
  await prisma.emailVerificationToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(token),
      expiresAt: addHours(new Date(), 24)
    }
  });
  const verifyUrl = `${getAppUrl()}/auth/verify-email?token=${encodeURIComponent(token)}`;
  await sendTransactionalEmail({
    to: user.email,
    toName: user.name,
    subject: "Confirmez votre adresse email BailFlow",
    html: [
      emailSection(`Bonjour <strong>${user.name}</strong>,`),
      emailSection("Confirmez votre adresse email pour sécuriser votre compte BailFlow et accéder à toutes les fonctionnalités."),
      emailCtaButton("Confirmer mon email", verifyUrl),
      emailSection(`Ce lien expire dans <strong>24 heures</strong>. Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.`)
    ].join(""),
    text: `Bonjour ${user.name}, confirmez votre adresse email BailFlow : ${verifyUrl}`
  });
}

export async function verifyEmailToken(rawToken: string) {
  const token = await prisma.emailVerificationToken.findUnique({
    where: { tokenHash: hashToken(rawToken) },
    include: { user: true }
  });
  if (!token || token.usedAt || token.expiresAt < new Date()) return false;
  await prisma.$transaction([
    prisma.emailVerificationToken.update({ where: { id: token.id }, data: { usedAt: new Date() } }),
    prisma.user.update({ where: { id: token.userId }, data: { emailVerifiedAt: new Date() } })
  ]);
  return true;
}

export async function createPasswordReset(user: { id: string; email: string; name: string }) {
  await prisma.passwordResetToken.updateMany({
    where: { userId: user.id, usedAt: null, expiresAt: { gt: new Date() } },
    data: { usedAt: new Date() }
  });
  const token = createRawToken();
  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(token),
      expiresAt: addHours(new Date(), 1)
    }
  });
  const resetUrl = `${getAppUrl()}/auth/reset-password?token=${encodeURIComponent(token)}`;
  await sendTransactionalEmail({
    to: user.email,
    toName: user.name,
    subject: "Réinitialisation de votre mot de passe BailFlow",
    html: [
      emailSection(`Bonjour <strong>${user.name}</strong>,`),
      emailSection("Vous avez demandé à réinitialiser votre mot de passe BailFlow. Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe."),
      emailCtaButton("Choisir un nouveau mot de passe", resetUrl),
      emailSection("Ce lien expire dans <strong>1 heure</strong>. Si vous n'êtes pas à l'origine de cette demande, ignorez cet email — votre mot de passe reste inchangé.")
    ].join(""),
    text: `Réinitialisez votre mot de passe BailFlow : ${resetUrl}`
  });
}

export async function consumePasswordReset(rawToken: string) {
  const token = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: hashToken(rawToken) },
    include: { user: true }
  });
  if (!token || token.usedAt || token.expiresAt < new Date()) return null;
  return token;
}
