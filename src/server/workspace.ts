import type { OrganizationRole, User } from "@prisma/client";
import { createHash, randomBytes } from "node:crypto";
import { PLAN_DEFINITIONS } from "@/lib/plans";
import { DomainError, NotFoundError, ValidationError } from "@/lib/errors";
import { getAppUrl } from "@/lib/env";
import { prisma } from "./db";
import { sendTransactionalEmail } from "./email";

export function hashWorkspaceToken(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export async function getAccessibleUserIds(userId: string) {
  const memberships = await prisma.organizationMember.findMany({
    where: { userId },
    select: { organizationId: true }
  });
  if (!memberships.length) return [userId];
  const members = await prisma.organizationMember.findMany({
    where: { organizationId: { in: memberships.map((item) => item.organizationId) } },
    select: { userId: true }
  });
  return [...new Set([userId, ...members.map((member) => member.userId)])];
}

export async function getOrCreatePrimaryOrganization(user: User) {
  const existing = await prisma.organizationMember.findFirst({
    where: { userId: user.id, role: { in: ["OWNER", "ADMIN"] } },
    include: { organization: true },
    orderBy: { createdAt: "asc" }
  });
  if (existing) return existing.organization;

  return prisma.organization.create({
    data: {
      name: `${user.name || user.email} - Espace`,
      type: "INVESTOR",
      members: { create: { userId: user.id, role: "OWNER" } }
    }
  });
}

export async function assertCanManageTeam(user: User) {
  const plan = PLAN_DEFINITIONS[user.plan];
  if (!["GESTIONNAIRE", "AGENCE"].includes(user.plan)) {
    throw new DomainError("La gestion multi-utilisateurs est disponible a partir du forfait Gestionnaire.");
  }
  return plan;
}

export async function inviteWorkspaceMember(user: User, email: string, role: OrganizationRole = "MEMBER") {
  const plan = await assertCanManageTeam(user);
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail.includes("@")) throw new ValidationError("Email invalide");
  const organization = await getOrCreatePrimaryOrganization(user);
  const memberCount = await prisma.organizationMember.count({ where: { organizationId: organization.id } });
  if (plan.userLimit !== null && memberCount >= plan.userLimit) {
    throw new DomainError(`Votre forfait ${plan.name} est limite a ${plan.userLimit} utilisateurs.`);
  }

  const token = `team_${randomBytes(32).toString("base64url")}`;
  const invitation = await prisma.workspaceInvitation.create({
    data: {
      organizationId: organization.id,
      invitedByUserId: user.id,
      email: normalizedEmail,
      tokenHash: hashWorkspaceToken(token),
      role,
      expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
    }
  });

  await sendTransactionalEmail({
    to: normalizedEmail,
    toName: normalizedEmail,
    subject: "Invitation BailFlow",
    html: `<p>${user.name} vous invite a rejoindre son espace BailFlow.</p><p><a href="${getAppUrl()}/app/team/accept?token=${encodeURIComponent(token)}">Accepter l'invitation</a></p>`,
    text: `${user.name} vous invite a rejoindre son espace BailFlow: ${getAppUrl()}/app/team/accept?token=${token}`
  }).catch(() => null);

  return { invitation, token };
}

export async function acceptWorkspaceInvitation(user: User, token: string) {
  const invitation = await prisma.workspaceInvitation.findUnique({
    where: { tokenHash: hashWorkspaceToken(token) }
  });
  if (!invitation || invitation.expiresAt < new Date() || invitation.acceptedAt) {
    throw new NotFoundError("Invitation introuvable ou expiree");
  }
  if (invitation.email !== user.email.toLowerCase()) {
    throw new DomainError("Cette invitation est liee a une autre adresse email.");
  }
  await prisma.$transaction([
    prisma.organizationMember.upsert({
      where: { organizationId_userId: { organizationId: invitation.organizationId, userId: user.id } },
      update: { role: invitation.role },
      create: { organizationId: invitation.organizationId, userId: user.id, role: invitation.role }
    }),
    prisma.workspaceInvitation.update({
      where: { id: invitation.id },
      data: { acceptedAt: new Date(), acceptedUserId: user.id }
    })
  ]);
}
