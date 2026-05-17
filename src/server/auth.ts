import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { UnauthorizedError } from "@/lib/errors";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/session-token";
import { prisma } from "./db";

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const userId = await verifySessionToken(cookieStore.get(SESSION_COOKIE_NAME)?.value);
  if (!userId) {
    redirect("/auth/sign-in?callbackUrl=/app");
  }
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new UnauthorizedError("Session invalide");
  }
  return user;
}

export async function getOptionalCurrentUser() {
  const cookieStore = await cookies();
  const userId = await verifySessionToken(cookieStore.get(SESSION_COOKIE_NAME)?.value);
  if (!userId) return null;
  return prisma.user.findUnique({ where: { id: userId } });
}
