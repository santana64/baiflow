"use server";

import { randomBytes } from "node:crypto";
import { compare, hash } from "bcryptjs";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { ValidationError } from "@/lib/errors";
import { createSessionToken, SESSION_COOKIE_NAME } from "@/lib/session-token";
import { consumePasswordReset, createEmailVerification, createPasswordReset, verifyEmailToken } from "./auth-tokens";
import { getCurrentUser } from "./auth";
import { prisma } from "./db";
import { scheduleNurtureSequence } from "./nurture";
import { rateLimit, requestFingerprint } from "./rate-limit";

const registerSchema = z.object({
  name: z.string().min(2, "Nom requis"),
  email: z.string().email("Email invalide"),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caracteres"),
  ref: z.string().optional()
});

const accountSchema = z.object({
  name: z.string().min(2),
  email: z.string().email()
});

const passwordSchema = z.object({
  password: z.string().min(8)
});

const resetRequestSchema = z.object({
  email: z.string().email()
});

const resetPasswordSchema = z.object({
  token: z.string().min(20),
  password: z.string().min(8)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  callbackUrl: z.string().default("/app")
});

async function setSessionCookie(userId: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, await createSessionToken(userId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30
  });
}

async function createReferralCode() {
  for (let i = 0; i < 5; i += 1) {
    const code = randomBytes(5).toString("base64url").toUpperCase();
    const existing = await prisma.user.findUnique({ where: { referralCode: code } });
    if (!existing) return code;
  }
  return randomBytes(8).toString("base64url").toUpperCase();
}

export async function registerUser(formData: FormData) {
  const data = registerSchema.parse({
    name: formData.get("name"),
    email: String(formData.get("email") ?? "").toLowerCase(),
    password: formData.get("password"),
    ref: String(formData.get("ref") ?? "") || undefined
  });
  rateLimit(await requestFingerprint("register", data.email), 5, 10 * 60 * 1000);
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) redirect(`/auth/sign-up?error=exists&email=${encodeURIComponent(data.email)}`);
  const passwordHash = await hash(data.password, 12);
  const referrer = data.ref ? await prisma.user.findUnique({ where: { referralCode: data.ref.toUpperCase() } }) : null;
  const user = await prisma.user.create({
    data: {
      email: data.email,
      name: data.name,
      passwordHash,
      referralCode: await createReferralCode(),
      referredById: referrer?.id ?? null,
      plan: "BAILLEUR",
      subscriptionStatus: "TRIALING",
      trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      profile: {
        create: {
          fullName: data.name,
          email: data.email,
          phone: "",
          address: "",
          defaultSignature: data.name
        }
      }
    }
  });
  if (referrer) {
    await prisma.user.update({
      where: { id: referrer.id },
      data: { referralCreditMonths: { increment: 2 } }
    });
  }
  await createEmailVerification(user);
  await scheduleNurtureSequence(user);
  await setSessionCookie(user.id);
  redirect("/app/onboarding?registered=1");
}

export async function loginUser(formData: FormData) {
  const data = loginSchema.parse({
    email: String(formData.get("email") ?? "").toLowerCase(),
    password: formData.get("password"),
    callbackUrl: String(formData.get("callbackUrl") ?? "/app")
  });
  rateLimit(await requestFingerprint("login", data.email), 10, 10 * 60 * 1000);
  const user = await prisma.user.findUnique({ where: { email: data.email } });
  if (!user || !(await compare(data.password, user.passwordHash))) {
    redirect(`/auth/sign-in?error=credentials&email=${encodeURIComponent(data.email)}&callbackUrl=${encodeURIComponent(data.callbackUrl)}`);
  }
  await setSessionCookie(user.id);
  redirect(data.callbackUrl.startsWith("/") ? data.callbackUrl : "/app");
}

export async function logoutUser() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  redirect("/");
}

export async function updateAccount(formData: FormData) {
  const user = await getCurrentUser();
  const data = accountSchema.parse({
    name: formData.get("name"),
    email: String(formData.get("email") ?? "").toLowerCase()
  });
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing && existing.id !== user.id) throw new ValidationError("Un compte existe déjà avec cet email");
  const emailChanged = data.email !== user.email;
  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { ...data, emailVerifiedAt: emailChanged ? null : user.emailVerifiedAt }
  });
  await prisma.landlordProfile.updateMany({ where: { userId: user.id }, data: { email: data.email } });
  if (emailChanged) await createEmailVerification(updated);
  revalidatePath("/app/account");
}

export async function deleteAccount(formData: FormData) {
  const user = await getCurrentUser();
  const confirmation = String(formData.get("confirmation") ?? "");
  if (confirmation !== "SUPPRIMER") throw new ValidationError("Confirmation invalide");
  await prisma.user.delete({ where: { id: user.id } });
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  redirect("/");
}

export async function updatePassword(formData: FormData) {
  const user = await getCurrentUser();
  const data = passwordSchema.parse({ password: formData.get("password") });
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash: await hash(data.password, 12) } });
  revalidatePath("/app/account");
}

export async function resendVerificationEmail() {
  const user = await getCurrentUser();
  if (user.emailVerifiedAt) redirect("/app/account?email=already-verified");
  rateLimit(await requestFingerprint("resend-verification", user.email), 3, 10 * 60 * 1000);
  await createEmailVerification(user);
  redirect("/app/account?email=verification-sent");
}

export async function verifyEmail(formData: FormData) {
  const token = String(formData.get("token") ?? "");
  const ok = await verifyEmailToken(token);
  redirect(ok ? "/app/account?email=verified" : "/auth/verify-email?error=invalid");
}

export async function requestPasswordReset(formData: FormData) {
  const data = resetRequestSchema.parse({ email: String(formData.get("email") ?? "").toLowerCase() });
  rateLimit(await requestFingerprint("password-reset", data.email), 5, 10 * 60 * 1000);
  const user = await prisma.user.findUnique({ where: { email: data.email } });
  if (user) await createPasswordReset(user);
  redirect(`/auth/forgot-password?sent=1&email=${encodeURIComponent(data.email)}`);
}

export async function resetPassword(formData: FormData) {
  const data = resetPasswordSchema.parse({
    token: formData.get("token"),
    password: formData.get("password")
  });
  const resetToken = await consumePasswordReset(data.token);
  if (!resetToken) redirect("/auth/reset-password?error=invalid");
  await prisma.$transaction([
    prisma.user.update({ where: { id: resetToken.userId }, data: { passwordHash: await hash(data.password, 12) } }),
    prisma.passwordResetToken.update({ where: { id: resetToken.id }, data: { usedAt: new Date() } })
  ]);
  redirect("/auth/sign-in?reset=1");
}
