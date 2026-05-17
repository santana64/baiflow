import { NextResponse } from "next/server";
import type Stripe from "stripe";
import type { BillingInterval, BillingPlan, SubscriptionStatus } from "@prisma/client";
import { getRequiredEnv } from "@/lib/env";
import { priceIdToPlan, PLAN_DEFINITIONS } from "@/lib/plans";
import { prisma } from "@/server/db";
import { recordPaymentAndRecalculate } from "@/server/payments";
import { getStripe } from "@/server/stripe";

export const dynamic = "force-dynamic";

function normalizeStatus(status: Stripe.Subscription.Status): SubscriptionStatus {
  const normalized = status.toUpperCase() as SubscriptionStatus;
  return normalized;
}

function unixToDate(value: number | null | undefined) {
  return value ? new Date(value * 1000) : null;
}

async function updateUserFromSubscription(subscription: Stripe.Subscription) {
  const stripeCustomerId = typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;
  const priceId = subscription.items.data[0]?.price.id ?? null;
  const planFromMetadata = subscription.metadata.plan as BillingPlan | undefined;
  const intervalFromMetadata = subscription.metadata.interval as BillingInterval | undefined;
  const metadataPlan = planFromMetadata && PLAN_DEFINITIONS[planFromMetadata] ? planFromMetadata : null;
  const fromPrice = priceIdToPlan(priceId);
  const plan = fromPrice?.plan ?? metadataPlan ?? "FREE";
  const interval = fromPrice?.interval ?? (intervalFromMetadata === "ANNUAL" ? "ANNUAL" : "MONTHLY");
  const currentPeriodEnd = unixToDate((subscription as Stripe.Subscription & { current_period_end?: number }).current_period_end);
  const userId = subscription.metadata.userId;
  if (!userId && !stripeCustomerId) return;
  await prisma.user.updateMany({
    where: userId ? { id: userId } : { stripeCustomerId },
    data: {
      stripeCustomerId,
      stripeSubscriptionId: subscription.id,
      stripePriceId: priceId,
      plan,
      subscriptionInterval: interval,
      subscriptionStatus: normalizeStatus(subscription.status),
      subscriptionCurrentPeriodEnd: currentPeriodEnd,
      cancelAtPeriodEnd: subscription.cancel_at_period_end
    }
  });
}

export async function POST(request: Request) {
  const stripe = getStripe();
  const signature = request.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(await request.text(), signature, getRequiredEnv("STRIPE_WEBHOOK_SECRET"));
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const checkout = event.data.object as Stripe.Checkout.Session;
    const tenantPaymentId = checkout.metadata?.tenantPaymentId;
    if (tenantPaymentId && checkout.mode === "payment") {
      const tenantPayment = await prisma.tenantPayment.findUnique({ where: { id: tenantPaymentId } });
      if (tenantPayment && tenantPayment.status === "PENDING") {
        const amountCents = checkout.amount_total ?? tenantPayment.amountCents;
        await prisma.tenantPayment.update({
          where: { id: tenantPayment.id },
          data: {
            status: "PAID",
            amountCents,
            stripeSessionId: checkout.id,
            stripePaymentIntentId: typeof checkout.payment_intent === "string" ? checkout.payment_intent : checkout.payment_intent?.id ?? null,
            payerEmail: checkout.customer_details?.email ?? tenantPayment.payerEmail,
            paidAt: new Date()
          }
        });
        await recordPaymentAndRecalculate({
          rentCaseId: tenantPayment.rentCaseId,
          userId: tenantPayment.userId,
          amountCents,
          paymentDate: new Date(),
          note: "Paiement locataire via portail Stripe"
        });
      }
      return NextResponse.json({ received: true });
    }
    const addOnOrderId = checkout.metadata?.orderId;
    if (addOnOrderId && checkout.mode === "payment") {
      await prisma.addOnOrder.updateMany({
        where: { id: addOnOrderId },
        data: {
          status: "PAID",
          stripeSessionId: checkout.id,
          stripePaymentIntentId: typeof checkout.payment_intent === "string" ? checkout.payment_intent : checkout.payment_intent?.id ?? null
        }
      });
      return NextResponse.json({ received: true });
    }
    const userId = checkout.metadata?.userId ?? checkout.client_reference_id;
    const stripeCustomerId = typeof checkout.customer === "string" ? checkout.customer : checkout.customer?.id;
    if (userId && stripeCustomerId) {
      await prisma.user.updateMany({ where: { id: userId }, data: { stripeCustomerId } });
    }
    const subscriptionId = typeof checkout.subscription === "string" ? checkout.subscription : checkout.subscription?.id;
    if (subscriptionId) {
      await updateUserFromSubscription(await stripe.subscriptions.retrieve(subscriptionId));
    }
  }

  if (event.type === "customer.subscription.created" || event.type === "customer.subscription.updated") {
    await updateUserFromSubscription(event.data.object as Stripe.Subscription);
  }

  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;
    await updateUserFromSubscription(subscription);
  }

  return NextResponse.json({ received: true });
}
