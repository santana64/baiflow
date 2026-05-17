import { NextResponse } from "next/server";
import JSZip from "jszip";
import { getCurrentUser } from "@/server/auth";
import { prisma } from "@/server/db";
import { renderDocumentPdf, pdfFileName } from "@/server/pdf";
import { getAccessibleUserIds } from "@/server/workspace";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  const accessibleUserIds = await getAccessibleUserIds(user.id);
  const { id } = await params;

  const rentCase = await prisma.rentCase.findFirst({
    where: { id, userId: { in: accessibleUserIds } },
    include: {
      tenant: true,
      property: true,
      documents: { orderBy: { createdAt: "asc" } }
    }
  });

  if (!rentCase) return NextResponse.json({ error: "Dossier introuvable" }, { status: 404 });
  if (rentCase.documents.length === 0) {
    return NextResponse.json({ error: "Aucun document dans ce dossier" }, { status: 404 });
  }

  const zip = new JSZip();
  const tenantSlug = `${rentCase.tenant.firstName}-${rentCase.tenant.lastName}`
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-");

  for (const doc of rentCase.documents) {
    const pdf = await renderDocumentPdf({ title: doc.title, contentText: doc.contentText });
    zip.file(pdfFileName(doc.title), pdf);
  }

  const zipBuffer = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
  const zipName = `bailflow-dossier-${tenantSlug}.zip`;

  return new NextResponse(new Uint8Array(zipBuffer), {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${zipName}"`,
      "Cache-Control": "private, no-store"
    }
  });
}
