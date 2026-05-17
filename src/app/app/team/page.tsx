import { Copy, Users } from "lucide-react";
import { Breadcrumbs, Card, PageHeader, WarningNotice } from "@/components/ui";
import { SubmitButton } from "@/components/submit-button";
import { getCurrentUser } from "@/server/auth";
import { prisma } from "@/server/db";
import { inviteTeamMember, removeTeamMember } from "@/server/team-actions";
import { getOrCreatePrimaryOrganization } from "@/server/workspace";
import { PLAN_DEFINITIONS } from "@/lib/plans";

export const dynamic = "force-dynamic";

const roleLabels: Record<string, string> = {
  OWNER: "Proprietaire",
  ADMIN: "Admin",
  MEMBER: "Collaborateur",
  ACCOUNTANT: "Comptable"
};

export default async function TeamPage({
  searchParams
}: {
  searchParams: Promise<{ invited?: string; token?: string; accepted?: string }>;
}) {
  const user = await getCurrentUser();
  const params = await searchParams;
  const plan = PLAN_DEFINITIONS[user.plan];
  const canManage = ["GESTIONNAIRE", "AGENCE"].includes(user.plan);
  const organization = canManage ? await getOrCreatePrimaryOrganization(user) : null;
  const members = organization
    ? await prisma.organizationMember.findMany({
        where: { organizationId: organization.id },
        include: { user: true },
        orderBy: { createdAt: "asc" }
      })
    : [];
  const invitations = organization
    ? await prisma.workspaceInvitation.findMany({
        where: { organizationId: organization.id, acceptedAt: null, expiresAt: { gt: new Date() } },
        orderBy: { createdAt: "desc" }
      })
    : [];

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Tableau de bord", href: "/app" }, { label: "Equipe" }]} />
      <PageHeader
        title="Equipe"
        subtitle="Invitez un collaborateur ou un comptable dans un espace partage. Les dossiers des membres de l'espace deviennent visibles entre eux."
      />

      {!canManage ? (
        <WarningNotice>
          La gestion multi-utilisateurs est reservee au forfait Gestionnaire ou Agence. Votre forfait actuel est {plan.name}.
        </WarningNotice>
      ) : null}

      {params.invited ? (
        <div className="rounded-lg border border-sage/20 bg-sage/6 px-4 py-3 text-sm font-semibold text-sage">
          Invitation creee. L'email a ete envoye si Resend est configure.
        </div>
      ) : null}
      {params.token ? (
        <Card>
          <h2 className="mb-2 flex items-center gap-2 font-semibold text-navy">
            <Copy className="h-4 w-4 text-sage" />
            Lien d'invitation developpement
          </h2>
          <code className="block break-all rounded-lg bg-paper p-3 text-xs text-navy">
            {`${process.env.NEXT_PUBLIC_APP_URL ?? ""}/app/team/accept?token=${params.token}`}
          </code>
        </Card>
      ) : null}
      {params.accepted ? (
        <div className="rounded-lg border border-sage/20 bg-sage/6 px-4 py-3 text-sm font-semibold text-sage">
          Invitation acceptee. Vous avez rejoint l'espace partage.
        </div>
      ) : null}

      <Card>
        <div className="mb-5 flex items-center gap-2">
          <Users className="h-5 w-5 text-sage" />
          <h2 className="font-semibold text-navy">Inviter un membre</h2>
        </div>
        <form action={inviteTeamMember} className="grid gap-4 md:grid-cols-[1fr_180px_auto]">
          <div>
            <label>Email</label>
            <input name="email" type="email" required disabled={!canManage} placeholder="collaborateur@exemple.fr" />
          </div>
          <div>
            <label>Role</label>
            <select name="role" disabled={!canManage}>
              <option value="MEMBER">Collaborateur</option>
              <option value="ADMIN">Admin</option>
              <option value="ACCOUNTANT">Comptable</option>
            </select>
          </div>
          <div className="flex items-end">
            {canManage ? (
              <SubmitButton className="rounded-full bg-ink px-4 py-2.5 text-sm font-semibold text-white">
                Inviter
              </SubmitButton>
            ) : (
              <button disabled className="rounded-lg bg-ink/10 px-4 py-2.5 text-sm font-semibold text-ink/40">
                Inviter
              </button>
            )}
          </div>
        </form>
        <p className="mt-3 text-xs text-ink/45">
          Limite du forfait : {plan.userLimit === null ? "utilisateurs illimites" : `${members.length}/${plan.userLimit} utilisateurs`}.
        </p>
      </Card>

      <Card>
        <h2 className="mb-4 font-semibold text-navy">Membres</h2>
        {members.length ? (
          <div className="space-y-2">
            {members.map((member) => (
              <div key={member.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line px-4 py-3">
                <div>
                  <p className="font-semibold text-navy">{member.user.name}</p>
                  <p className="text-sm text-ink/50">{member.user.email} - {roleLabels[member.role]}</p>
                </div>
                {member.role !== "OWNER" ? (
                  <form action={removeTeamMember}>
                    <input type="hidden" name="memberId" value={member.id} />
                    <button className="rounded-lg border border-danger/20 px-3 py-1.5 text-xs font-semibold text-danger">
                      Retirer
                    </button>
                  </form>
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-ink/45">Aucun espace partage actif.</p>
        )}
      </Card>

      <Card>
        <h2 className="mb-4 font-semibold text-navy">Invitations en attente</h2>
        {invitations.length ? (
          <div className="space-y-2">
            {invitations.map((invitation) => (
              <div key={invitation.id} className="rounded-lg border border-line px-4 py-3 text-sm text-ink/70">
                {invitation.email} - {roleLabels[invitation.role]} - expire le {invitation.expiresAt.toLocaleDateString("fr-FR")}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-ink/45">Aucune invitation en attente.</p>
        )}
      </Card>
    </div>
  );
}
