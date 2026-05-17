import { createHash } from "node:crypto";
import { prisma } from "./db";

function hashKey(key: string) {
  return createHash("sha256").update(key).digest("hex");
}

export async function getApiUser(request: Request) {
  const header = request.headers.get("authorization") ?? "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  if (!match) return null;
  const apiKey = await prisma.apiKey.findUnique({
    where: { keyHash: hashKey(match[1]) },
    include: { user: true }
  });
  if (!apiKey || apiKey.revokedAt) return null;
  await prisma.apiKey.update({ where: { id: apiKey.id }, data: { lastUsedAt: new Date() } });
  return apiKey.user;
}
