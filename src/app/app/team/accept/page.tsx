import { PageHeader, Card } from "@/components/ui";
import { acceptTeamInvitation } from "@/server/team-actions";

export const dynamic = "force-dynamic";

export default async function AcceptTeamInvitationPage({
  searchParams
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <PageHeader
        title="Rejoindre un espace BailFlow"
        subtitle="Confirmez l'invitation avec le compte correspondant a l'adresse invitee."
      />
      <Card>
        <form action={acceptTeamInvitation} className="space-y-4">
          <input type="hidden" name="token" value={params.token ?? ""} />
          <p className="text-sm text-ink/60">
            En acceptant, vous pourrez consulter et mettre a jour les dossiers partages par cette equipe selon votre role.
          </p>
          <button className="rounded-full bg-ink px-4 py-2.5 text-sm font-semibold text-white">
            Accepter l'invitation
          </button>
        </form>
      </Card>
    </div>
  );
}
