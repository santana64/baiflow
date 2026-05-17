# BailFlow Deployment Checklist

## Environment

- [ ] Set `DATABASE_URL` to a managed PostgreSQL database.
- [ ] Set `NEXT_PUBLIC_APP_URL` to the production domain.
- [ ] Generate `AUTH_SECRET` with at least 32 random bytes.
- [ ] Set `STRIPE_SECRET_KEY`.
- [ ] Set `STRIPE_WEBHOOK_SECRET`.
- [ ] Set monthly and annual Stripe price IDs for Bailleur, Premium, Gestionnaire, and Agence.
- [ ] Set `RESEND_API_KEY`.
- [ ] Set `EMAIL_FROM` with a verified sending domain.
- [ ] Set `CRON_SECRET`.
- [ ] Set `ANTHROPIC_API_KEY` only if AI document generation is enabled.
- [ ] Set `ANTHROPIC_MODEL` if the default Claude model should be changed.
- [ ] Set AR24 provider URL/key/webhook secret if recommandé électronique is sold.
- [ ] Set Yousign provider URL/key/webhook secret if signatures are sold.
- [ ] Set GLI partner URL/key if insurance leads are enabled.
- [ ] Set `BAILFLOW_ADMIN_EMAILS` to the comma-separated operator emails allowed on `/app/admin`.
- [ ] Set `NEXT_PUBLIC_POSTHOG_KEY` and `NEXT_PUBLIC_POSTHOG_HOST` if product analytics are enabled.
- [ ] Set all `NEXT_PUBLIC_LEGAL_*` variables with the real editor identity, contact email, and hosting details.

## Database

- [ ] Run `npm run db:generate` during build or release.
- [ ] Run `npm run db:migrate` before starting the production app.
- [ ] Verify the migration `20260501105000_commercial_schema` has converted the legacy `STARTER` plan to `FREE`.
- [ ] Verify backups and point-in-time recovery.
- [ ] Verify database TLS requirements for the host.

## Stripe

- [ ] Create recurring monthly and annual prices for Bailleur, Premium, Gestionnaire, and Agence.
- [ ] Configure Customer Portal settings in Stripe.
- [ ] Add the production webhook endpoint `/api/stripe/webhook`.
- [ ] Select events: `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`.
- [ ] Test checkout and portal flows in Stripe test mode.
- [ ] Confirm webhook updates `plan`, `subscriptionStatus`, and `subscriptionCurrentPeriodEnd`.
- [ ] Confirm one-off add-on checkout marks `AddOnOrder` as `PAID`.
- [ ] Confirm tenant portal payment checkout creates a `TenantPayment`, receives the webhook, and updates the case balance.

## Partner Modules

- [ ] Test AR24 recommandé flow with sandbox contract credentials.
- [ ] Test Yousign signature flow with sandbox contract credentials.
- [ ] Test GLI lead provider delivery.
- [ ] Seed or onboard verified professionals before enabling marketplace publicly.
- [ ] Verify API keys only work for Gestionnaire/Agence.
- [ ] Verify tenant portal links expire and can be revoked.
- [ ] Verify Gestionnaire workspace invitations, acceptance, and shared dossier visibility.

## Auth and Security

- [ ] Confirm sign-up and sign-in work on production domain.
- [ ] Confirm email verification is delivered and required before creations.
- [ ] Confirm password reset emails are delivered and tokens expire.
- [ ] Confirm protected `/app/*` routes redirect anonymous visitors.
- [ ] Confirm signed session cookies are secure over HTTPS.
- [ ] Add platform-level bot protection to auth routes.

## Legal/RGPD

- [ ] Configure `/legal/mentions-legales` with real editor and host through `NEXT_PUBLIC_LEGAL_*`.
- [ ] Complete `/legal/privacy` with contact, retention periods, subprocessors, and rights workflow.
- [ ] Complete `/legal/terms` with commercial terms, liability, cancellation, jurisdiction.
- [ ] Confirm Stripe is listed as a payment processor.
- [ ] Define data export and deletion procedures.
- [ ] Keep a processing register for landlord, tenant, payment, and document data.

## Verification

- [ ] Run `npm run typecheck`.
- [ ] Run `npm run test`.
- [ ] Run `npm run build`.
- [ ] Create a test user.
- [ ] Verify the test user email.
- [ ] Reset the test user password.
- [ ] Start a subscription checkout.
- [ ] Receive the webhook.
- [ ] Verify plan limits block excess properties/cases.
- [ ] Generate a document.
- [ ] Export a PDF.
- [ ] Open the billing portal.

## Operational Readiness

- [ ] Configure error monitoring.
- [ ] Configure uptime monitoring.
- [ ] Configure structured logs for webhooks and auth errors.
- [ ] Configure PostHog dashboards for onboarding completion, first document generated, checkout started, checkout completed, and tenant payment completed.
- [ ] Configure database backups.
- [ ] Document support contact and incident process.
