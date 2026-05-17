import { NextResponse } from "next/server";
import { prisma } from "@/server/db";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const secret = request.headers.get("x-bailflow-webhook-secret");
  if (!process.env.YOUSIGN_WEBHOOK_SECRET || secret !== process.env.YOUSIGN_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json() as { providerId?: string; status?: string; signatureUrl?: string; signedDocumentUrl?: string; error?: string };
  if (!body.providerId) return NextResponse.json({ error: "Missing providerId" }, { status: 400 });
  await prisma.eSignatureRequest.updateMany({
    where: { providerId: body.providerId },
    data: {
      status: body.status === "SIGNED" ? "SIGNED" : body.status === "FAILED" ? "FAILED" : "SENT",
      signatureUrl: body.signatureUrl ?? undefined,
      signedDocumentUrl: body.signedDocumentUrl ?? undefined,
      error: body.error ?? undefined
    }
  });
  return NextResponse.json({ ok: true });
}
