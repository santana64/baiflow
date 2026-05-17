import { Card, PageHeader } from "@/components/ui";
import { getCurrentUser } from "@/server/auth";
import { prisma } from "@/server/db";
import { requestProfessionalReferral } from "@/server/growth-actions";

export const dynamic = "force-dynamic";

const typeLabels: Record<string, string> = {
  COMMISSAIRE_JUSTICE: "Commissaire de justice",
  AVOCAT: "Avocat",
  RECOUVREMENT: "Recouvrement",
  EXPERT_COMPTABLE: "Expert-comptable"
};

export default async function MarketplacePage() {
  const user = await getCurrentUser();
  const [partners, cases] = await Promise.all([
    prisma.partnerProfessional.findMany({ orderBy: [{ premiumPlacement: "desc" }, { verified: "desc" }, { department: "asc" }] }),
    prisma.rentCase.findMany({
      where: { userId: user.id, status: { in: ["FORMAL_NOTICE", "PROFESSIONAL_ESCALATION"] } },
      include: { tenant: true, property: true },
      orderBy: { updatedAt: "desc" }
    })
  ]);

  return (
    <div className="space-y-6">
      <PageHeader title="Marketplace professionnels" subtitle="Réseau de commissaires de justice, avocats et partenaires à activer quand le dossier doit sortir de BailFlow." />
      <div className="grid gap-4 lg:grid-cols-2">
        {partners.map((partner) => (
          <Card key={partner.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-sage">{typeLabels[partner.type]}</p>
                <h2 className="mt-1 font-semibold text-navy">{partner.name}</h2>
                <p className="mt-1 text-sm text-ink/55">{partner.city} ({partner.department})</p>
              </div>
              {partner.verified && <span className="rounded-full bg-sage/12 px-2 py-1 text-xs font-semibold text-sage">Vérifié</span>}
            </div>
            <p className="mt-3 text-sm leading-relaxed text-ink/65">{partner.description}</p>
            <form action={requestProfessionalReferral} className="mt-4 space-y-3">
              <input type="hidden" name="partnerId" value={partner.id} />
              <select name="rentCaseId" required>
                <option value="">Choisir un dossier</option>
                {cases.map((rentCase) => (
                  <option key={rentCase.id} value={rentCase.id}>{rentCase.tenant.firstName} {rentCase.tenant.lastName} - {rentCase.property.name}</option>
                ))}
              </select>
              <textarea name="note" rows={2} placeholder="Message de contexte pour le partenaire" />
              <button className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white">Demander une mise en relation</button>
            </form>
          </Card>
        ))}
      </div>
      {partners.length === 0 && (
        <Card>
          <p className="text-sm text-ink/55">Aucun partenaire vérifié n'est encore configuré. Ajoutez-les via seed/admin avant lancement public.</p>
        </Card>
      )}
    </div>
  );
}
