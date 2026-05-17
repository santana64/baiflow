import { NextResponse } from "next/server";
import { getCurrentUser } from "@/server/auth";
import { prisma } from "@/server/db";
import { pdfFileName, renderDocumentPdf } from "@/server/pdf";
import { getAccessibleUserIds } from "@/server/workspace";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  const accessibleUserIds = await getAccessibleUserIds(user.id);
  const { id } = await params;
  const document = await prisma.generatedDocument.findFirst({
    where: { id, rentCase: { userId: { in: accessibleUserIds } } }
  });
  if (!document) return NextResponse.json({ error: "Document introuvable" }, { status: 404 });
  const pdf = await renderDocumentPdf({ title: document.title, contentText: document.contentText });
  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${pdfFileName(document.title)}"`,
      "Cache-Control": "private, no-store"
    }
  });
}
