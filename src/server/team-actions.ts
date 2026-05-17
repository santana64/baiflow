"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { DomainError, NotFoundError } from "@/lib/errors";
import { getCurrentUser } from "./auth";
import { prisma } from "./db";
import { acceptWorkspaceInvitation, inviteWorkspaceMember } from "./workspace";

const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(["ADMIN", "MEMBER", "ACCOUNTANT"]).default("MEMBER")
});

export async function inviteTeamMember(formData: FormData) {
  const user = await getCurrentUser();
  const data = inviteSchema.parse({
    email: String(formData.get("email") ?? "").toLowerCase(),
    role: formData.get("role") || "MEMBER"
  });
  const { token } = await inviteWorkspaceMember(user, data.email, data.role);
  const suffix = process.env.NODE_ENV === "production" ? "invited=1" : `invited=1&token=${encodeURIComponent(token)}`;
  redirect(`/app/team?${suffix}`);
}

export async function acceptTeamInvitation(formData: FormData) {
  const user = await getCurrentUser();
  const token = String(formData.get("token") || "");
  await acceptWorkspaceInvitation(user, token);
  redirect("/app/team?accepted=1");
}

export async function removeTeamMember(formData: FormData) {
  const user = await getCurrentUser();
  const memberId = String(formData.get("memberId") || "");
  const member = await prisma.organizationMember.findUnique({
    where: { id: memberId },
    include: { organization: { include: { members: true } } }
  });
  if (!member) throw new NotFoundError("Membre introuvable");
  const currentMembership = member.organization.members.find((item) => item.userId === user.id);
  if (!currentMembership || !["OWNER", "ADMIN"].includes(currentMembership.role)) {
    throw new DomainError("Vous ne pouvez pas modifier cette equipe.");
  }
  if (member.role === "OWNER") throw new DomainError("Le proprietaire de l'espace ne peut pas etre retire.");
  await prisma.organizationMember.delete({ where: { id: memberId } });
  revalidatePath("/app/team");
}
