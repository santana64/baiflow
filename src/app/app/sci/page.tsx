import { Card, PageHeader } from "@/components/ui";
import { getCurrentUser } from "@/server/auth";
import { prisma } from "@/server/db";
import { createSciProfile } from "@/server/growth-actions";

export const dynamic = "force-dynamic";

export default async function SciPage() {
  const user = await getCurrentUser();
  const organizations = await prisma.organizationMember.findMany({
    where: { userId: user.id },
    include: { organization: { include: { sciProfile: { include: { shareholders: true } } } } },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="space-y-6">
      <PageHeader title="BailFlow Pro SCI" subtitle="Structure multi-associés, comptable en lecture seule et informations SCI." />
      <Card>
        <h2 className="mb-4 font-semibold text-navy">Créer une SCI</h2>
        <form action={createSciProfile} className="grid gap-4 md:grid-cols-2">
          <label>Nom légal<input name="legalName" required /></label>
          <label>SIREN<input name="siren" /></label>
          <label>Capital social<input name="shareCapital" /></label>
          <label>Régime fiscal<input name="taxRegime" placeholder="IR / IS" /></label>
          <label className="md:col-span-2">Notes<textarea name="notes" rows={2} /></label>
          <button className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white">Créer la SCI</button>
        </form>
      </Card>
      <Card>
        <h2 className="mb-4 font-semibold text-navy">Mes structures</h2>
        {organizations.length ? organizations.map((membership) => (
          <div key={membership.id} className="rounded-lg border border-line p-4">
            <p className="font-semibold text-navy">{membership.organization.name}</p>
            <p className="text-sm text-ink/55">Rôle: {membership.role}</p>
            {membership.organization.sciProfile && (
              <p className="mt-1 text-sm text-ink/55">
                SIREN: {membership.organization.sciProfile.siren ?? "Non renseigné"} · Régime: {membership.organization.sciProfile.taxRegime ?? "Non renseigné"}
              </p>
            )}
          </div>
        )) : <p className="text-sm text-ink/45">Aucune SCI créée.</p>}
      </Card>
    </div>
  );
}
