import { NextResponse } from "next/server";
import { getAppUrl } from "@/lib/env";
import { prisma } from "@/server/db";
import { getStripe } from "@/server/stripe";
import { getTenantPortalCase } from "@/server/tenant-portal";

export const dynamic = "force-dynamic";

function centsFromForm(value: FormDataEntryValue | null, fallback: number) {
  if (!value) return fallback;
  const normalized = String(value).replace(",", ".");
  const amount = Math.round(Number(normalized) * 100);
  if (!Number.isFinite(amount)) return fallback;
  return amount;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const access = await getTenantPortalCase(token);
  if (!access) return NextResponse.json({ error: "Portail introuvable ou expiré" }, { status: 404 });

  const formData = await request.formData();
  const amountCents = centsFromForm(formData.get("amount"), access.rentCase.totalUnpaidCents);
  if (amountCents <= 0 || amountCents > access.rentCase.totalUnpaidCents) {
    return NextResponse.json({ error: "Montant invalide" }, { status: 400 });
  }

  const tenantPayment = await prisma.tenantPayment.create({
    data: {
      userId: access.rentCase.userId,
      rentCaseId: access.rentCaseId,
      tenantPortalAccessId: access.id,
      amountCents,
      payerEmail: access.rentCase.tenant.email || null
    }
  });

  const stripe = getStripe();
  const checkout = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: access.rentCase.tenant.email || undefined,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "eur",
          unit_amount: amountCents,
          product_data: {
            name: `Règlement loyer - ${access.rentCase.property.name}`,
            description: `Dossier BailFlow ${access.rentCase.tenant.firstName} ${access.rentCase.tenant.lastName}`
          }
        }
      }
    ],
    success_url: `${getAppUrl()}/tenant/${encodeURIComponent(token)}?payment=success`,
    cancel_url: `${getAppUrl()}/tenant/${encodeURIComponent(token)}?payment=cancelled`,
    metadata: {
      tenantPaymentId: tenantPayment.id,
      rentCaseId: access.rentCaseId,
      userId: access.rentCase.userId
    }
  });

  await prisma.tenantPayment.update({
    where: { id: tenantPayment.id },
    data: { stripeSessionId: checkout.id }
  });

  return NextResponse.redirect(checkout.url ?? `${getAppUrl()}/tenant/${encodeURIComponent(token)}?payment=checkout-error`);
}
