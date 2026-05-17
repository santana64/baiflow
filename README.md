# BailFlow

BailFlow is a French vertical SaaS for private landlords managing unpaid rent cases with traceable actions, cautious document templates, deadlines, and exportable case files.

## Stack

- Next.js App Router
- TypeScript strict
- TailwindCSS
- Prisma ORM
- PostgreSQL
- Email/password authentication with signed HTTP-only session cookies
- Email verification and password reset emails
- Stripe Checkout subscriptions, webhooks, and billing portal
- Zod validation
- PDFKit server-side PDF export
- Vitest domain tests

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Copy `.env.example` to `.env` and configure:

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:55433/bailflow?schema=public"
POSTGRES_PORT="55433"
NEXT_PUBLIC_APP_URL="http://127.0.0.1:3000"
AUTH_SECRET="generate-a-real-secret"
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PRICE_BAILLEUR_MONTHLY="price_..."
STRIPE_PRICE_BAILLEUR_ANNUAL="price_..."
STRIPE_PRICE_PREMIUM_MONTHLY="price_..."
STRIPE_PRICE_PREMIUM_ANNUAL="price_..."
STRIPE_PRICE_GESTIONNAIRE_MONTHLY="price_..."
STRIPE_PRICE_GESTIONNAIRE_ANNUAL="price_..."
STRIPE_PRICE_AGENCE_MONTHLY="price_..."
STRIPE_PRICE_AGENCE_ANNUAL="price_..."
RESEND_API_KEY="re_..."
EMAIL_FROM="BailFlow <noreply@your-domain.example>"
CRON_SECRET="..."
ANTHROPIC_API_KEY=""
ANTHROPIC_MODEL="claude-3-5-haiku-latest"
AR24_API_URL="https://api-prestataire.example/registered-letters"
AR24_API_KEY="..."
YOUSIGN_API_URL="https://api-prestataire.example/signatures"
YOUSIGN_API_KEY="..."
GLI_PARTNER_API_URL="https://api-prestataire.example/gli-leads"
GLI_PARTNER_API_KEY="..."
BAILFLOW_ADMIN_EMAILS="admin@your-domain.example"
NEXT_PUBLIC_POSTHOG_KEY=""
NEXT_PUBLIC_POSTHOG_HOST="https://eu.i.posthog.com"
NEXT_PUBLIC_LEGAL_PUBLISHER_NAME="BailFlow"
NEXT_PUBLIC_LEGAL_PUBLISHER_DETAILS="SAS/SASU/EI - SIREN/RCS - Adresse du siege"
NEXT_PUBLIC_LEGAL_PUBLICATION_DIRECTOR="Nom du directeur de publication"
NEXT_PUBLIC_LEGAL_CONTACT_EMAIL="contact@bailflow.fr"
```

3. Prepare the database:

```bash
# Optional local PostgreSQL if Docker Desktop is available:
npm run db:up

npm run db:generate
npm run db:migrate
npm run db:seed
```

Seed login:

- Email: `demo@bailflow.fr`
- Password: `BailFlowDemo123!`

4. Run locally:

```bash
npm run dev
```

## Billing

Create recurring Stripe prices for monthly and annual paid plans and map their IDs to:

- `STRIPE_PRICE_BAILLEUR_MONTHLY`
- `STRIPE_PRICE_BAILLEUR_ANNUAL`
- `STRIPE_PRICE_PREMIUM_MONTHLY`
- `STRIPE_PRICE_PREMIUM_ANNUAL`
- `STRIPE_PRICE_GESTIONNAIRE_MONTHLY`
- `STRIPE_PRICE_GESTIONNAIRE_ANNUAL`
- `STRIPE_PRICE_AGENCE_MONTHLY`
- `STRIPE_PRICE_AGENCE_ANNUAL`

Configure a Stripe webhook pointing to:

```text
https://your-domain.example/api/stripe/webhook
```

Required events:

- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `checkout.session.completed` for one-off add-on payments

## Growth Modules

- Add-ons: `/app/add-ons`
- Tenant portal: `/tenant/[token]`
- Tenant Stripe payment: `POST /api/tenant/[token]/checkout`
- Team workspaces: `/app/team`
- API: `/app/developer` and `/api/v1/cases`
- Admin cockpit: `/app/admin` guarded by `BAILFLOW_ADMIN_EMAILS`
- Marketplace: `/app/marketplace`
- SCI: `/app/sci`
- White label: `/app/white-label`
- GLI leads: `/app/gli`
- Fiscal PDF: `/api/reports/fiscal-2044`

AR24, Yousign, and GLI provider calls are intentionally strict: without real provider URLs and API keys, the app returns a configuration error instead of pretending the legal action succeeded.

Plan limits are enforced in server actions:

- Solo: 1 property, archived/read-only usage, 3 documents per month
- Bailleur: 3 properties, unlimited cases, email sending, 2 registered letters per month
- Premium: unlimited properties/cases, tenant portal, fiscal export, 10 registered letters/signatures
- Gestionnaire: 3 users, 50 properties, API and shared workspace
- Agence: unlimited users/properties and white label

Email verification is required before creating properties, cases, or generated documents.

Users with invalid paid subscription states can manage their account and billing, but cannot create new paid-plan resources or generate new documents.

## Production Commands

```bash
npm run typecheck
npm run test
npm run build
npm run db:migrate
```

## Legal Note

BailFlow is an administrative and documentary tool. It does not replace an avocat, ADIL, commissaire de justice, or personalized legal advice. Before public launch, configure the `NEXT_PUBLIC_LEGAL_*` variables with the real operating entity, host, contact details, retention periods, and legal terms.
