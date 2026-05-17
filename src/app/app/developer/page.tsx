import { Card, PageHeader } from "@/components/ui";
import { getCurrentUser } from "@/server/auth";
import { prisma } from "@/server/db";
import { createApiKey } from "@/server/growth-actions";

export const dynamic = "force-dynamic";

export default async function DeveloperPage({
  searchParams
}: {
  searchParams: Promise<{ created?: string }>;
}) {
  const user = await getCurrentUser();
  const query = await searchParams;
  const keys = await prisma.apiKey.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-6">
      <PageHeader title="API publique" subtitle="Accès REST pour Gestionnaire et Agence. Authentification Bearer token." />
      {query.created && (
        <div className="rounded-xl border border-sage/25 bg-sage/8 p-4 text-sm text-sage">
          Nouvelle clé API créée. Copiez-la maintenant: <code className="font-mono">{query.created}</code>
        </div>
      )}
      <Card>
        <h2 className="mb-4 font-semibold text-navy">Créer une clé API</h2>
        <form action={createApiKey} className="flex flex-wrap gap-3">
          <input name="name" placeholder="Nom de la clé" required className="max-w-sm" />
          <button className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white">Créer</button>
        </form>
      </Card>
      <Card>
        <h2 className="mb-4 font-semibold text-navy">Documentation rapide</h2>
        <pre className="overflow-auto rounded-full bg-ink p-4 text-xs text-white">{`GET /api/v1/cases
Authorization: Bearer bf_xxx

Réponse: { data: RentCase[] }`}</pre>
      </Card>
      <Card>
        <h2 className="mb-4 font-semibold text-navy">Clés existantes</h2>
        {keys.length ? (
          <div className="space-y-2">
            {keys.map((key) => (
              <div key={key.id} className="rounded-lg border border-line px-3 py-2 text-sm">
                <span className="font-semibold text-navy">{key.name}</span>
                <span className="ml-2 text-ink/45">{key.prefix}...</span>
                <span className="ml-2 text-ink/45">créée le {key.createdAt.toLocaleDateString("fr-FR")}</span>
              </div>
            ))}
          </div>
        ) : <p className="text-sm text-ink/45">Aucune clé.</p>}
      </Card>
    </div>
  );
}
