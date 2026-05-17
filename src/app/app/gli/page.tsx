import { Card, PageHeader } from "@/components/ui";
import { getCurrentUser } from "@/server/auth";
import { prisma } from "@/server/db";
import { requestGliQuote } from "@/server/growth-actions";

export const dynamic = "force-dynamic";

export default async function GliPage() {
  const user = await getCurrentUser();
  const [properties, leads] = await Promise.all([
    prisma.property.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } }),
    prisma.gliLead.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } })
  ]);

  return (
    <div className="space-y-6">
      <PageHeader title="Assurance loyers impayés" subtitle="Prévention GLI via partenaire configuré. Les demandes sont tracées dans BailFlow." />
      <Card>
        <h2 className="mb-4 font-semibold text-navy">Demander une estimation GLI</h2>
        <form action={requestGliQuote} className="flex flex-wrap gap-3">
          <select name="propertyId" className="max-w-sm">
            <option value="">Bien non spécifié</option>
            {properties.map((property) => (
              <option key={property.id} value={property.id}>{property.name} - {(property.rentAmountCents / 100).toFixed(0)}€/mois</option>
            ))}
          </select>
          <button className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white">Demander</button>
        </form>
      </Card>
      <Card>
        <h2 className="mb-4 font-semibold text-navy">Demandes GLI</h2>
        {leads.length ? leads.map((lead) => (
          <div key={lead.id} className="rounded-lg border border-line px-3 py-2 text-sm">
            {lead.createdAt.toLocaleDateString("fr-FR")} · {lead.status} · {lead.provider ?? "Partenaire à configurer"}
          </div>
        )) : <p className="text-sm text-ink/45">Aucune demande.</p>}
      </Card>
    </div>
  );
}
