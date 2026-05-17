import { NextResponse } from "next/server";
import type { BillingInterval, BillingPlan } from "@prisma/client";
import { getAppUrl } from "@/lib/env";
import { getPlanPriceId, PLAN_DEFINITIONS } from "@/lib/plans";
import { getOptionalCurrentUser } from "@/server/auth";
import { prisma } from "@/server/db";
import { getStripe } from "@/server/stripe";

export async function POST(request: Request) {
  const user = await getOptionalCurrentUser();
  if (!user) return NextResponse.redirect(`${getAppUrl()}/auth/sign-in`, 303);
  const formData = await request.formData();
  const plan = String(formData.get("plan")) as BillingPlan;
  const interval = String(formData.get("interval") || "MONTHLY") as BillingInterval;
  if (!PLAN_DEFINITIONS[plan]) {
    return NextResponse.redirect(`${getAppUrl()}/app/account?billing=invalid-plan`, 303);
  }
  if (!["MONTHLY", "ANNUAL"].includes(interval)) {
    return NextResponse.redirect(`${getAppUrl()}/app/account?billing=invalid-interval`, 303);
  }
  if (plan === "FREE") {
    return NextResponse.redirect(`${getAppUrl()}/app/account?billing=free-plan`, 303);
  }
  const priceId = getPlanPriceId(plan, interval);
  if (!priceId) {
    return NextResponse.redirect(`${getAppUrl()}/app/account?billing=missing-price`, 303);
  }
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
  if (user.stripeSubscriptionId && !["NONE", "CANCELED", "INCOMPLETE_EXPIRED"].includes(user.subscriptionStatus)) {
    const portal = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: `${getAppUrl()}/app/account?billing=portal`
    });
    return NextResponse.redirect(portal.url, 303);
  }
  const checkout = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: stripeCustomerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${getAppUrl()}/app/account?billing=success`,
    cancel_url: `${getAppUrl()}/app/account?billing=cancelled`,
    allow_promotion_codes: true,
    client_reference_id: user.id,
    metadata: { userId: user.id, plan, interval },
    subscription_data: {
      metadata: { userId: user.id, plan, interval }
    }
  });
  return NextResponse.redirect(checkout.url ?? `${getAppUrl()}/app/account`, 303);
}
