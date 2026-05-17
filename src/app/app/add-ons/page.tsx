import { Card, PageHeader } from "@/components/ui";
import { ADD_ONS } from "@/lib/add-ons";
import { getCurrentUser } from "@/server/auth";
import { prisma } from "@/server/db";
import { markAddOnPaidForDev, startAddOnCheckout } from "@/server/growth-actions";

export const dynamic = "force-dynamic";

export default async function AddOnsPage() {
  const user = await getCurrentUser();
  const orders = await prisma.addOnOrder.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 20,
    include: { rentCase: { include: { tenant: true, property: true } } }
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Add-ons transactionnels" subtitle="Monétisation à l'acte: recommandé, signature, fiscalité, archivage et consultation." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Object.values(ADD_ONS).map((addOn) => (
          <Card key={addOn.type}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold text-navy">{addOn.name}</h2>
                <p className="mt-1 text-sm leading-relaxed text-ink/55">{addOn.description}</p>
              </div>
              <p className="shrink-0 text-lg font-bold text-navy">{(addOn.priceCents / 100).toFixed(2).replace(".", ",")}€</p>
            </div>
            <form action={startAddOnCheckout} className="mt-4">
              <input type="hidden" name="type" value={addOn.type} />
              <button className="w-full rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white">Acheter</button>
            </form>
            {process.env.NODE_ENV !== "production" && (
              <form action={markAddOnPaidForDev} className="mt-2">
                <input type="hidden" name="type" value={addOn.type} />
                <button className="w-full rounded-lg border border-line px-4 py-2 text-xs font-semibold text-navy">Marquer payé en dev</button>
              </form>
            )}
          </Card>
        ))}
      </div>

      <Card>
        <h2 className="mb-4 font-semibold text-navy">Dernières commandes</h2>
        {orders.length === 0 ? (
          <p className="text-sm text-ink/45">Aucune commande add-on.</p>
        ) : (
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Add-on</th>
                  <th>Dossier</th>
                  <th>Statut</th>
                  <th>Montant</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.createdAt.toLocaleDateString("fr-FR")}</td>
                    <td>{ADD_ONS[order.type].name}</td>
                    <td>{order.rentCase ? `${order.rentCase.tenant.firstName} ${order.rentCase.tenant.lastName}` : "Global"}</td>
                    <td>{order.status}</td>
                    <td>{(order.amountCents / 100).toFixed(2).replace(".", ",")}€</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
