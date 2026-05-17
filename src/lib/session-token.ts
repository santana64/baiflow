import { jwtVerify, SignJWT } from "jose";

export const SESSION_COOKIE_NAME = "bailflow_session";

function getSecretKey() {
  const secret = process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET;
  if (!secret && process.env.NODE_ENV === "production") {
    throw new Error("AUTH_SECRET est requis en production");
  }
  return new TextEncoder().encode(secret ?? "local-development-secret-change-me");
}

export async function createSessionToken(userId: string) {
  return new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(getSecretKey());
}

export async function verifySessionToken(token: string | undefined) {
  if (!token) return null;
  try {
    const result = await jwtVerify(token, getSecretKey());
    return typeof result.payload.sub === "string" ? result.payload.sub : null;
  } catch {
    return null;
  }
}
