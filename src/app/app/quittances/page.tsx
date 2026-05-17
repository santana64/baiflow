import Link from "next/link";
import { FileCheck, Download } from "lucide-react";
import { Card, EmptyState, PageHeader } from "@/components/ui";
import { getCurrentUser } from "@/server/auth";
import { prisma } from "@/server/db";
import { getAccessibleUserIds } from "@/server/workspace";
import { generateRentReceipt } from "@/server/quittance";
import { SubmitButton } from "@/components/submit-button";

export const dynamic = "force-dynamic";

export default async function QuittancesPage() {
  const user = await getCurrentUser();
  const accessibleUserIds = await getAccessibleUserIds(user.id);

  const quittances = await prisma.generatedDocument.findMany({
    where: { type: "RENT_RECEIPT", rentCase: { userId: { in: accessibleUserIds } } },
    include: { rentCase: { include: { tenant: true, property: true } } },
    orderBy: { createdAt: "desc" }
  });

  const cases = await prisma.rentCase.findMany({
    where: {
      userId: { in: accessibleUserIds },
      status: { notIn: ["DRAFT", "CLOSED"] }
    },
    include: { tenant: true, property: true },
    orderBy: { updatedAt: "desc" }
  });

  return (
    <div className="space-y-8">
      <PageHeader
        title="Quittances de loyer"
        subtitle="Générez et archivez vos quittances pour les paiements reçus."
      />

      <Card>
        <h2 className="mb-1 font-semibold text-navy">Générer une quittance</h2>
        <p className="mb-4 text-sm text-ink/55">Sélectionnez un dossier pour lequel un paiement a été reçu.</p>
        {cases.length === 0 ? (
          <p className="text-sm text-ink/45">Aucun dossier actif trouvé.</p>
        ) : (
          <form action={generateRentReceipt} className="flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[200px]">
              <label className="mb-1 block text-sm font-medium text-ink/80">Dossier</label>
              <select name="rentCaseId" required>
                <option value="">Sélectionnez un dossier…</option>
                {cases.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.tenant.firstName} {c.tenant.lastName} — {c.property.name}
                  </option>
                ))}
              </select>
            </div>
            <SubmitButton>
              <FileCheck className="h-4 w-4" />
              Générer la quittance
            </SubmitButton>
          </form>
        )}
      </Card>

      {quittances.length === 0 ? (
        <EmptyState
          title="Aucune quittance générée"
          text="Sélectionnez un dossier ci-dessus pour générer votre première quittance de loyer."
        />
      ) : (
        <div className="space-y-3">
          <h2 className="font-semibold text-navy">Quittances archivées ({quittances.length})</h2>
          {quittances.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between gap-4 rounded-xl border border-line bg-white p-4"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sage/10">
                  <FileCheck className="h-4 w-4 text-sage" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-navy">{doc.title}</p>
                  <p className="text-xs text-ink/50">
                    {doc.rentCase.tenant.firstName} {doc.rentCase.tenant.lastName} · {doc.rentCase.property.name}
                    {" · "}
                    {doc.createdAt.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href={`/app/documents/${doc.id}/pdf`}
                  className="flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-navy transition-colors hover:bg-paper"
                >
                  <Download className="h-3.5 w-3.5" />
                  PDF
                </Link>
                <Link
                  href={`/app/cases/${doc.rentCaseId}`}
                  className="text-xs text-ink/45 hover:text-ink transition-colors"
                >
                  Dossier →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
