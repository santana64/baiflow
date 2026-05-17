import { NextResponse } from "next/server";
import { getCurrentUser } from "@/server/auth";
import { prisma } from "@/server/db";
import { getAccessibleUserIds } from "@/server/workspace";

export const dynamic = "force-dynamic";

function formatEuros(cents: number) {
  return (cents / 100).toFixed(2).replace(".", ",");
}

function escapeCsv(value: string | number | null | undefined): string {
  const str = String(value ?? "");
  return str.includes(",") || str.includes('"') || str.includes("\n")
    ? `"${str.replace(/"/g, '""')}"`
    : str;
}

function row(...cols: (string | number | null | undefined)[]): string {
  return cols.map(escapeCsv).join(",");
}

export async function GET() {
  const user = await getCurrentUser();
  const accessibleUserIds = await getAccessibleUserIds(user.id);

  const [payments, unpaidLines] = await Promise.all([
    prisma.payment.findMany({
      where: { rentCase: { userId: { in: accessibleUserIds } } },
      include: { rentCase: { include: { property: true, tenant: true } } },
      orderBy: { paymentDate: "asc" }
    }),
    prisma.unpaidRentLine.findMany({
      where: { rentCase: { userId: { in: accessibleUserIds } }, unpaidAmountCents: { gt: 0 } },
      include: { rentCase: { include: { property: true, tenant: true } } },
      orderBy: { dueDate: "asc" }
    })
  ]);

  const lines: string[] = [];

  lines.push(row("Type", "Date", "Propriété", "Locataire", "Période / Référence", "Loyer dû (€)", "Charges dues (€)", "Payé (€)", "Impayé (€)", "Note"));
  lines.push("");

  lines.push(row("=== PAIEMENTS REÇUS ==="));
  for (const p of payments) {
    lines.push(
      row(
        "Paiement reçu",
        p.paymentDate.toLocaleDateString("fr-FR"),
        p.rentCase.property.name,
        `${p.rentCase.tenant.firstName} ${p.rentCase.tenant.lastName}`,
        p.note ?? "",
        "",
        "",
        formatEuros(p.amountCents),
        "",
        ""
      )
    );
  }

  lines.push("");
  lines.push(row("=== IMPAYÉS EN COURS ==="));
  for (const l of unpaidLines) {
    lines.push(
      row(
        "Impayé",
        l.dueDate.toLocaleDateString("fr-FR"),
        l.rentCase.property.name,
        `${l.rentCase.tenant.firstName} ${l.rentCase.tenant.lastName}`,
        l.periodLabel,
        formatEuros(l.rentDueCents),
        formatEuros(l.chargesDueCents),
        formatEuros(l.paidAmountCents),
        formatEuros(l.unpaidAmountCents),
        l.status
      )
    );
  }

  const totalPaid = payments.reduce((s, p) => s + p.amountCents, 0);
  const totalUnpaid = unpaidLines.reduce((s, l) => s + l.unpaidAmountCents, 0);

  lines.push("");
  lines.push(row("=== TOTAUX ==="));
  lines.push(row("Total encaissé", "", "", "", "", "", "", formatEuros(totalPaid), "", ""));
  lines.push(row("Total impayé restant", "", "", "", "", "", "", "", formatEuros(totalUnpaid), ""));

  const year = new Date().getFullYear();
  const csv = "\uFEFF" + lines.join("\r\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="bailflow-comptabilite-${year}.csv"`,
      "Cache-Control": "private, no-store"
    }
  });
}
