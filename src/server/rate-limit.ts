import { headers } from "next/headers";
import { DomainError } from "@/lib/errors";

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const current = buckets.get(key);
  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }
  current.count += 1;
  if (current.count > limit) {
    throw new DomainError("Trop de tentatives. Réessayez dans quelques minutes.");
  }
}

export async function requestFingerprint(scope: string, email?: string) {
  const headerBag = await headers();
  const forwardedFor = headerBag.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwardedFor || headerBag.get("x-real-ip") || "unknown";
  return `${scope}:${ip}:${email?.toLowerCase() ?? ""}`;
}
