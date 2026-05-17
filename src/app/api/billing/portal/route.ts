import { NextResponse } from "next/server";
import { getAppUrl } from "@/lib/env";
import { getOptionalCurrentUser } from "@/server/auth";
import { prisma } from "@/server/db";
import { getStripe } from "@/server/stripe";

export async function POST() {
  const user = await getOptionalCurrentUser();
  if (!user) return NextResponse.redirect(`${getAppUrl()}/auth/sign-in`, 303);
  const stripe = getStripe();
  let stripeCustomerId = user.stripeCustomerId;
  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name,
      metadata: { userId: user.id }
    });
    stripeCustomerId = customer.id;
    await prisma.user.update({ where: { id: user.id }, data: { stripeCustomerId } });
  }
  const portal = await stripe.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: `${getAppUrl()}/app/account`
  });
  return NextResponse.redirect(portal.url, 303);
}
