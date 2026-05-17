"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { generateDocumentTemplate } from "@/domain/rent-cases/documents";
import { DomainError, NotFoundError } from "@/lib/errors";
import { getCurrentUser } from "./auth";
import { rentCaseInclude } from "./cases";
import { prisma } from "./db";
import { getAccessibleUserIds } from "./workspace";

export async function generateRentReceipt(formData: FormData) {
  const user = await getCurrentUser();
  const accessibleUserIds = await getAccessibleUserIds(user.id);
  const rentCaseId = String(formData.get("rentCaseId") || "");
  if (!rentCaseId) throw new DomainError("Dossier requis.");

  const rentCase = await prisma.rentCase.findFirst({
    where: { id: rentCaseId, userId: { in: accessibleUserIds } },
    include: rentCaseInclude
  });
  if (!rentCase) throw new NotFoundError("Dossier introuvable.");

  const landlord = await prisma.landlordProfile.findUnique({ where: { userId: rentCase.userId } });
  if (!landlord) throw new DomainError("Profil bailleur requis pour générer la quittance.");

  const generated = generateDocumentTemplate({
    type: "RENT_RECEIPT",
    landlord,
    tenant: rentCase.tenant,
    property: rentCase.property,
    rentCase,
    lines: rentCase.lines,
    events: rentCase.events,
    documents: rentCase.documents,
    currentDate: new Date()
  });

  const doc = await prisma.generatedDocument.create({
    data: { rentCaseId, type: "RENT_RECEIPT", ...generated }
  });
  await prisma.caseEvent.create({
    data: {
      rentCaseId,
      type: "DOCUMENT_GENERATED",
      title: `Quittance générée : ${generated.title}`,
      eventDate: new Date()
    }
  });

  revalidatePath(`/app/cases/${rentCaseId}`);
  revalidatePath("/app/quittances");
  redirect("/app/quittances");
}
