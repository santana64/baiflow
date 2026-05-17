import { NextResponse } from "next/server";
import { renderDocumentPdf } from "@/server/pdf";
import { getCurrentUser } from "@/server/auth";
import { prisma } from "@/server/db";
import { formatMoney } from "@/domain/rent-cases";
import { assertHasFiscalExport } from "@/server/entitlements";
import { getAccessibleUserIds } from "@/server/workspace";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  try {
    assertHasFiscalExport(user);
  } catch {
    return NextResponse.json({ error: "Réservé au forfait Premium." }, { status: 403 });
  }
  const accessibleUserIds = await getAccessibleUserIds(user.id);
  const year = Number(new URL(request.url).searchParams.get("year")) || new Date().getFullYear();
  const start = new Date(year, 0, 1);
  const end = new Date(year + 1, 0, 1);

  const properties = await prisma.property.findMany({
    where: { userId: { in: accessibleUserIds } },
    include: {
      rentCases: {
        include: {
          payments: { where: { paymentDate: { gte: start, lt: end } } },
          lines: { where: { dueDate: { gte: start, lt: end } } }
        }
      }
    },
    orderBy: { name: "asc" }
  });

  const lines: string[] = [
    `Rapport fiscal BailFlow ${year}`,
    "",
    "Ce rapport est une aide administrative. Vérifiez les montants avec votre comptable ou conseil fiscal avant déclaration.",
    ""
  ];

  let totalPaid = 0;
  let totalUnpaid = 0;
  for (const property of properties) {
    const paid = property.rentCases.flatMap((rentCase) => rentCase.payments).reduce((sum, payment) => sum + payment.amountCents, 0);
    const unpaid = property.rentCases.flatMap((rentCase) => rentCase.lines).reduce((sum, line) => sum + line.unpaidAmountCents, 0);
    totalPaid += paid;
    totalUnpaid += unpaid;
    lines.push(`${property.name}`);
    lines.push(`Adresse : ${property.address}, ${property.postalCode} ${property.city}`);
    lines.push(`Loyers encaissés : ${formatMoney(paid)}`);
    lines.push(`Impayés constatés : ${formatMoney(unpaid)}`);
    lines.push(`Loyer mensuel théorique : ${formatMoney(property.rentAmountCents)} ; charges : ${formatMoney(property.chargesAmountCents)}`);
    lines.push("");
  }

  lines.push("Totaux");
  lines.push(`Total encaissé : ${formatMoney(totalPaid)}`);
  lines.push(`Total impayé : ${formatMoney(totalUnpaid)}`);

  const pdf = await renderDocumentPdf({
    title: `Rapport fiscal 2044 - ${year}`,
    contentText: lines.join("\n"),
    footer: "BailFlow fournit un rapport administratif. Les règles fiscales dépendent de votre situation et doivent être vérifiées."
  });

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "content-type": "application/pdf",
      "content-disposition": `attachment; filename="bailflow-rapport-fiscal-${year}.pdf"`,
      "cache-control": "private, no-store"
    }
  });
}
