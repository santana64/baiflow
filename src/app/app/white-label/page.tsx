import { Card, PageHeader } from "@/components/ui";
import { getCurrentUser } from "@/server/auth";
import { prisma } from "@/server/db";
import { saveWhiteLabel } from "@/server/growth-actions";

export const dynamic = "force-dynamic";

export default async function WhiteLabelPage() {
  const user = await getCurrentUser();
  const settings = await prisma.whiteLabelSetting.findUnique({ where: { userId: user.id } });

  return (
    <div className="space-y-6">
      <PageHeader title="White label Agence" subtitle="Personnalisez l'expérience pour les agences: marque, couleurs, domaine." />
      <Card>
        <form action={saveWhiteLabel} className="grid gap-4 md:grid-cols-2">
          <label>Nom de marque<input name="brandName" defaultValue={settings?.brandName ?? "BailFlow"} required /></label>
          <label>Logo URL<input name="logoUrl" defaultValue={settings?.logoUrl ?? ""} /></label>
          <label>Couleur principale<input name="primaryColor" type="color" defaultValue={settings?.primaryColor ?? "#0a0a0a"} /></label>
          <label>Couleur accent<input name="accentColor" type="color" defaultValue={settings?.accentColor ?? "#16a34a"} /></label>
          <label className="md:col-span-2">Domaine custom<input name="customDomain" defaultValue={settings?.customDomain ?? ""} placeholder="impayes.votreagence.fr" /></label>
          <button className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white">Enregistrer</button>
        </form>
      </Card>
    </div>
  );
}
