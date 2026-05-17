import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  FileText,
  FolderOpen,
  LayoutDashboard,
  Shield,
  ShieldCheck,
  AlertTriangle,
  Clock,
  BookOpen
} from "lucide-react";
import { LegalDisclaimerBox, LinkButton } from "@/components/ui";

// ─── Landing page ─────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <main className="bg-paper text-ink">
      <LandingNav />
      <HeroSection />
      <PainSection />
      <WorkflowSection />
      <ProductPreviewSection />
      <TrustSection />
      <PricingSection />
      <FAQSection />
      <FinalCTASection />
      <LandingFooter />
    </main>
  );
}

// ─── Navigation ───────────────────────────────────────────────────────────────

function LandingNav() {
  return (
    <nav className="sticky top-0 z-30 border-b border-line bg-paper/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-ink">
            <Shield className="h-4 w-4 text-white" />
          </div>
          <span className="text-base font-bold tracking-tight text-navy">BailFlow</span>
        </div>
        <div className="hidden items-center gap-6 md:flex">
          <a href="#workflow" className="text-sm font-medium text-ink/60 hover:text-ink">
            Fonctionnement
          </a>
          <a href="#tarifs" className="text-sm font-medium text-ink/60 hover:text-ink">
            Tarifs
          </a>
          <a href="#faq" className="text-sm font-medium text-ink/60 hover:text-ink">
            FAQ
          </a>
          <a href="/blog" className="text-sm font-medium text-ink/60 hover:text-ink">
            Ressources
          </a>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/auth/sign-in"
            className="hidden text-sm font-semibold text-navy hover:underline md:block"
          >
            Connexion
          </Link>
          <LinkButton href="/auth/sign-up">
            Créer un compte
            <ArrowRight className="h-4 w-4" />
          </LinkButton>
        </div>
      </div>
    </nav>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function HeroSection() {
  return (
    <section className="relative mx-auto grid min-h-[86vh] max-w-7xl items-center gap-12 overflow-hidden px-6 py-16 lg:grid-cols-[1.1fr_0.9fr]">
      {/* Background decorative elements */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        {/* Large radial gradient blob — top-right */}
        <div className="absolute -right-32 -top-32 h-[600px] w-[600px] rounded-full opacity-[0.05]"
          style={{ background: "radial-gradient(circle at 60% 40%, #0a0a0a, transparent 70%)" }} />
        {/* Sage accent blob — bottom-left */}
        <div className="absolute -bottom-20 -left-20 h-[400px] w-[400px] rounded-full opacity-[0.06]"
          style={{ background: "radial-gradient(circle at 40% 60%, #16a34a, transparent 70%)" }} />
        {/* Floating dot grid */}
        <svg className="absolute right-0 top-0 opacity-[0.025]" width="400" height="400" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.5" fill="#0a0a0a" />
            </pattern>
          </defs>
          <rect width="400" height="400" fill="url(#dots)" />
        </svg>
      </div>
      <div>
        <p className="inline-flex items-center gap-2 rounded-full border border-sage/25 bg-sage/8 px-3 py-1.5 text-xs font-semibold text-sage">
          <Shield className="h-3.5 w-3.5" />
          SaaS français pour propriétaires bailleurs
        </p>
        <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight text-navy md:text-5xl lg:text-[3.25rem]">
          Reprenez le contrôle
          <br />
          <span className="text-sage">dès le premier loyer impayé.</span>
        </h1>
        <p className="mt-5 max-w-xl text-lg leading-8 text-ink/65">
          BailFlow aide les propriétaires bailleurs à suivre les impayés, générer leurs
          courriers, documenter chaque étape et préparer un dossier propre avant
          escalade professionnelle.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <LinkButton href="/auth/sign-up" size="lg">
            Créer mon premier dossier
            <ArrowRight className="h-4 w-4" />
          </LinkButton>
          <a
            href="#workflow"
            className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-5 py-2.5 text-base font-semibold text-navy shadow-sm hover:bg-powder"
          >
            Voir le fonctionnement
            <ChevronDown className="h-4 w-4" />
          </a>
        </div>
        <div className="mt-10 flex flex-wrap gap-5">
          {[
            "Courriers prêts à vérifier",
            "Chronologie opposable",
            "Dossier exportable"
          ].map((item) => (
            <div key={item} className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-sage" />
              <span className="text-sm font-medium text-ink/70">{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Product mockup */}
      <div className="relative">
        {/* Browser chrome wrapper */}
        <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-soft">
          {/* Browser top bar */}
          <div className="flex items-center gap-2 border-b border-line bg-paper px-4 py-3">
            <div className="flex gap-1.5">
              <div className="h-3 w-3 rounded-full bg-danger/40" />
              <div className="h-3 w-3 rounded-full bg-warning/40" />
              <div className="h-3 w-3 rounded-full bg-sage/40" />
            </div>
            <div className="mx-auto flex h-5 w-44 items-center justify-center rounded-md bg-line/60 px-3">
              <span className="text-[10px] text-ink/35">app.bailflow.fr/dossiers</span>
            </div>
          </div>
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 border-b border-line pb-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-ink/40">
                Dossier actif
              </p>
              <h2 className="mt-1 text-lg font-bold text-navy">Martin Dupont · Apt. Lyon 3</h2>
              <p className="mt-0.5 text-sm text-ink/60">Plan d'apurement en cours</p>
            </div>
            <div className="flex gap-2">
              <span className="rounded-full bg-warning/15 px-2.5 py-1 text-xs font-semibold text-warning">
                Élevé
              </span>
              <span className="rounded-full bg-sage/15 px-2.5 py-1 text-xs font-semibold text-sage">
                Plan d'apurement
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-5 grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-paper p-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-ink/40">Impayé total</p>
              <p className="mt-2 text-2xl font-bold tabular-nums text-navy">1 690 €</p>
            </div>
            <div className="rounded-lg bg-paper p-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-ink/40">
                Action recommandée
              </p>
              <p className="mt-2 text-sm font-semibold text-navy">Envoyer plan d'apurement</p>
            </div>
          </div>

          {/* Timeline preview */}
          <div className="mt-5 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-ink/40">
              Chronologie
            </p>
            {[
              { label: "Dossier ouvert", date: "12 janv. 2026", done: true },
              { label: "Relance amiable envoyée", date: "18 janv. 2026", done: true },
              { label: "Plan d'apurement proposé", date: "28 janv. 2026", done: true },
              { label: "Mise en demeure à préparer", date: "Prochaine étape", done: false }
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <div
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${item.done ? "bg-sage/15" : "border-2 border-dashed border-line bg-white"}`}
                >
                  {item.done && <CheckCircle2 className="h-3 w-3 text-sage" />}
                </div>
                <div className="flex flex-1 items-center justify-between gap-2">
                  <span className={`text-sm ${item.done ? "font-medium text-navy" : "text-ink/40"}`}>
                    {item.label}
                  </span>
                  <span className="text-xs text-ink/40">{item.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>{/* close browser-content p-6 */}
        </div>{/* close browser-chrome wrapper */}

        {/* Floating doc badge */}
        <div className="absolute -bottom-4 -right-4 hidden rounded-xl border border-line bg-white px-4 py-3 shadow-soft md:block">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sage/10">
              <FileText className="h-4 w-4 text-sage" />
            </div>
            <div>
              <p className="text-xs font-semibold text-navy">2 documents générés</p>
              <p className="text-[11px] text-ink/50">Prêts à vérifier avant envoi</p>
            </div>
          </div>
        </div>

        {/* Floating alert badge */}
        <div className="absolute -left-4 top-12 hidden rounded-xl border border-warning/25 bg-warning/5 px-3 py-2.5 shadow-soft lg:block">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 animate-pulse rounded-full bg-warning" />
            <p className="text-xs font-semibold text-warning">Action requise sous 3j</p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Pain Section ─────────────────────────────────────────────────────────────

function PainSection() {
  const pains = [
    {
      icon: BookOpen,
      title: "Je ne sais pas quel courrier envoyer",
      text: "Les modèles génériques ne correspondent pas à votre situation. BailFlow génère des courriers adaptés au stade de votre dossier."
    },
    {
      icon: Clock,
      title: "Je perds le fil des échanges",
      text: "Les dates, les tentatives, les réponses — tout se mélange. La chronologie BailFlow trace chaque action et la date correspondante."
    },
    {
      icon: AlertTriangle,
      title: "J'ai peur d'oublier une étape",
      text: "Chaque dossier suit un plan d'action recommandé, avec les prochaines étapes toujours visibles et les délais surveillés."
    },
    {
      icon: FolderOpen,
      title: "Je veux un dossier propre si ça s'aggrave",
      text: "Si la situation nécessite un professionnel, votre dossier BailFlow est prêt : pièces structurées, timeline, montants calculés."
    }
  ];

  return (
    <section className="border-y border-line bg-white py-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-sage">Ce que vivent les bailleurs</p>
          <h2 className="mt-3 text-3xl font-bold text-navy">
            L'impayé crée du flou. BailFlow apporte de la clarté.
          </h2>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {pains.map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-xl border border-line p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-paper">
                <Icon className="h-5 w-5 text-navy" />
              </div>
              <h3 className="mt-4 font-semibold text-navy">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink/60">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Workflow Section ─────────────────────────────────────────────────────────

function WorkflowSection() {
  const steps = [
    {
      n: "1",
      title: "Enregistrer le bien et le locataire",
      text: "Adresse, loyer, charges, caution — les informations de base structurées une fois pour toutes."
    },
    {
      n: "2",
      title: "Déclarer l'impayé",
      text: "Première échéance manquante, montant dû, date — le dossier s'ouvre avec une timeline initiale générée."
    },
    {
      n: "3",
      title: "Suivre les actions recommandées",
      text: "Checklist de démarches adaptée au stade du dossier. Chaque action documentée est horodatée."
    },
    {
      n: "4",
      title: "Générer les documents",
      text: "Relances, plans d'apurement, courriers caution — à vérifier et adapter avant tout envoi."
    },
    {
      n: "5",
      title: "Exporter le dossier préparatoire",
      text: "Si la situation s'aggrave, votre dossier complet est prêt pour un commissaire de justice ou un avocat."
    }
  ];

  return (
    <section id="workflow" className="mx-auto max-w-7xl px-6 py-20">
      <div className="mb-12 max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-wider text-sage">Fonctionnement</p>
        <h2 className="mt-3 text-3xl font-bold text-navy">Un workflow en 5 étapes prudentes</h2>
        <p className="mt-3 text-base leading-relaxed text-ink/60">
          BailFlow structure votre démarche sans vous faire prendre de risques. Chaque étape
          respecte une logique de progressivité et de traçabilité.
        </p>
      </div>
      <div className="relative">
        <div className="hidden lg:block absolute top-8 left-8 right-8 h-px bg-line" />
        <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-5">
          {steps.map(({ n, title, text }) => (
            <div key={n} className="relative">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-white text-sm font-bold text-navy">
                {n}
              </div>
              <h3 className="mt-4 font-semibold text-navy">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink/55">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Product Preview ──────────────────────────────────────────────────────────

function ProductPreviewSection() {
  return (
    <section className="border-y border-line bg-white py-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-10 max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-sage">Interface</p>
          <h2 className="mt-3 text-3xl font-bold text-navy">
            Un centre de commande pour vos dossiers
          </h2>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {/* Card 1: Impayé */}
          <div className="rounded-xl border border-line bg-paper p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-ink/40">Montant impayé</p>
            <p className="mt-3 text-3xl font-bold tabular-nums text-navy">3 180 €</p>
            <p className="mt-1 text-sm text-ink/55">2 dossiers actifs</p>
            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-line">
              <div className="h-full w-3/5 rounded-full bg-warning" />
            </div>
          </div>
          {/* Card 2: Next action */}
          <div className="rounded-xl border border-danger/20 bg-danger/5 p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-danger/60">
              Action urgente
            </p>
            <p className="mt-3 text-sm font-semibold text-navy">Dupont · Apt. Lyon 3</p>
            <p className="mt-1 text-sm text-ink/60">Envoyer plan d'apurement</p>
            <div className="mt-3 flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-warning" />
              <span className="text-xs font-semibold text-warning">Échéance sous 3 jours</span>
            </div>
          </div>
          {/* Card 3: Timeline */}
          <div className="rounded-xl border border-line bg-paper p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-ink/40">
              Dernière action
            </p>
            <div className="mt-3 space-y-2.5">
              {[
                { label: "Relance envoyée", date: "18 janv." },
                { label: "Plan proposé", date: "28 janv." },
                { label: "Réponse locataire", date: "31 janv." }
              ].map((e) => (
                <div key={e.label} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-sage" />
                    <span className="text-sm text-navy">{e.label}</span>
                  </div>
                  <span className="text-xs text-ink/40">{e.date}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Card 4: Documents */}
          <div className="rounded-xl border border-line bg-paper p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-ink/40">
              Documents générés
            </p>
            <div className="mt-3 space-y-2">
              {[
                "Relance amiable",
                "Plan d'apurement",
                "Synthèse dossier"
              ].map((doc) => (
                <div
                  key={doc}
                  className="flex items-center gap-2 rounded-lg border border-line bg-white px-3 py-2"
                >
                  <FileText className="h-3.5 w-3.5 text-navy/50" />
                  <span className="text-sm font-medium text-navy">{doc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Trust Section ────────────────────────────────────────────────────────────

function TrustSection() {
  const points = [
    {
      icon: ShieldCheck,
      title: "Support administratif, pas juridique",
      text: "BailFlow structure vos informations et génère des documents de travail. Il ne remplace pas un avocat, un commissaire de justice ou un conseil ADIL."
    },
    {
      icon: FileText,
      title: "Traçabilité et opposabilité",
      text: "Chaque action documentée dans BailFlow est horodatée. Votre chronologie constitue un historique clair, utile en cas d'escalade."
    },
    {
      icon: FolderOpen,
      title: "Dossier préparatoire exportable",
      text: "Exportez l'ensemble de votre dossier — pièces, chronologie, montants — pour faciliter la prise en charge par un professionnel."
    },
    {
      icon: LayoutDashboard,
      title: "Adapté aux petits patrimoines",
      text: "Conçu pour les propriétaires qui gèrent 1 à 5 biens, sans service juridique interne, face à une situation stressante."
    }
  ];

  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <div className="mb-12 max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-wider text-sage">Clarté et limites</p>
        <h2 className="mt-3 text-3xl font-bold text-navy">Ce que BailFlow fait — et ne fait pas</h2>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {points.map(({ icon: Icon, title, text }) => (
          <div key={title} className="flex gap-5 rounded-xl border border-line bg-white p-6">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-paper">
              <Icon className="h-5 w-5 text-sage" />
            </div>
            <div>
              <h3 className="font-semibold text-navy">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink/60">{text}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-8">
        <LegalDisclaimerBox />
      </div>
    </section>
  );
}

// ─── Pricing ──────────────────────────────────────────────────────────────────

function PricingSection() {
  const plans = [
    {
      name: "Solo",
      price: "0€",
      period: "",
      annual: null,
      description: "Lead magnet, pas un vrai plan de production",
      features: [
        "1 propriété",
        "1 dossier archivé en lecture seule",
        "3 documents templates/mois",
        "Pas d'envoi email ni IA"
      ],
      highlighted: false,
      cta: "Démarrer l'essai"
    },
    {
      name: "Bailleur",
      price: "34€",
      period: "/mois",
      annual: "299€/an · économisez 109€",
      description: "Pour les bailleurs particuliers qui veulent agir vite",
      features: [
        "3 propriétés",
        "Dossiers illimités",
        "Documents IA illimités",
        "Envoi email intégré",
        "2 recommandés électroniques/mois inclus",
        "Support chat"
      ],
      highlighted: true,
      cta: "Choisir Bailleur"
    },
    {
      name: "Premium",
      price: "69€",
      period: "/mois",
      annual: "599€/an · économisez 229€",
      description: "Pour les dossiers sensibles et exports avancés",
      features: [
        "Propriétés illimitées",
        "10 recommandés électroniques/mois inclus",
        "Signature électronique des plans",
        "Export comptable 2044",
        "Dossier commissaire pré-formaté",
        "Support prioritaire"
      ],
      highlighted: false,
      cta: "Choisir Premium"
    },
    {
      name: "Gestionnaire",
      price: "149€",
      period: "/mois",
      annual: "1290€/an · économisez 498€",
      description: "SCI et petits gestionnaires multi-lots",
      features: [
        "3 utilisateurs",
        "50 propriétés",
        "Portail locataire branded",
        "Accès API",
        "Dashboard multi-propriétaires",
        "Account manager dédié"
      ],
      highlighted: false,
      cta: "Parler à l'équipe"
    },
    {
      name: "Agence",
      price: "399€",
      period: "/mois",
      annual: "3490€/an · white label",
      description: "Agences indépendantes et marque blanche",
      features: [
        "Utilisateurs illimités",
        "Propriétés illimitées",
        "Logo, couleurs, domaine",
        "Intégration CRM",
        "Formation équipe incluse",
        "SLA 99.9%"
      ],
      highlighted: false,
      cta: "Demander une démo"
    }
  ];

  return (
    <section id="tarifs" className="border-y border-line bg-white py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-12 text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-sage">Tarifs</p>
          <h2 className="mt-3 text-3xl font-bold text-navy">Un pricing aligné sur l'urgence réelle</h2>
          <p className="mt-3 text-base text-ink/55">14 jours d'essai Bailleur. Annuel recommandé pour sécuriser l'archivage et réduire le coût.</p>
        </div>
        <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-2 lg:grid-cols-5">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl border p-7 transition-shadow hover:shadow-soft ${
                plan.highlighted
                  ? "border-transparent bg-ink text-white shadow-soft"
                  : "border-line bg-white"
              }`}
            >
              {plan.highlighted && (
                <>
                  {/* Subtle top-glow */}
                  <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-20"
                    style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(22,163,74,0.5), transparent 60%)" }} />
                  <p className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-sage px-4 py-1 text-xs font-bold text-white shadow-sm">
                    Recommandé
                  </p>
                </>
              )}
              <div className="mb-5">
                <h3
                  className={`text-lg font-bold ${plan.highlighted ? "text-white" : "text-navy"}`}
                >
                  {plan.name}
                </h3>
                <p
                  className={`mt-1 text-sm ${plan.highlighted ? "text-white/70" : "text-ink/55"}`}
                >
                  {plan.description}
                </p>
              </div>
              <div className="mb-2 flex items-baseline gap-1">
                <span
                  className={`text-4xl font-bold tabular-nums ${plan.highlighted ? "text-white" : "text-navy"}`}
                >
                  {plan.price}
                </span>
                <span
                  className={`text-sm ${plan.highlighted ? "text-white/60" : "text-ink/45"}`}
                >
                  {plan.period}
                </span>
              </div>
              {plan.annual && (
                <p className={`mb-5 text-xs font-semibold ${plan.highlighted ? "text-sage" : "text-sage"}`}>
                  {plan.annual}
                </p>
              )}
              <ul className="mb-7 space-y-2.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2.5">
                    <CheckCircle2
                      className={`h-4 w-4 shrink-0 ${plan.highlighted ? "text-sage" : "text-sage"}`}
                    />
                    <span
                      className={`text-sm ${plan.highlighted ? "text-white/85" : "text-ink/70"}`}
                    >
                      {f}
                    </span>
                  </li>
                ))}
              </ul>
              <LinkButton
                href="/auth/sign-up"
                className={`w-full justify-center ${
                  plan.highlighted
                    ? "bg-white text-navy hover:bg-paper"
                    : ""
                }`}
                variant={plan.highlighted ? "secondary" : "primary"}
              >
                {plan.cta}
              </LinkButton>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────

function FAQSection() {
  const faqs = [
    {
      q: "Est-ce un service juridique ?",
      a: "Non. BailFlow est un outil d'aide à la documentation administrative. Il ne fournit pas de conseils juridiques personnalisés et ne remplace pas un avocat, un notaire ou un commissaire de justice. Pour toute décision sensible, consultez un professionnel."
    },
    {
      q: "Puis-je envoyer les documents directement depuis BailFlow ?",
      a: "Non. BailFlow génère des brouillons de documents à vérifier et adapter avant envoi. L'envoi des courriers reste de votre responsabilité. Certains documents (comme une mise en demeure) doivent être relus par un professionnel avant expédition."
    },
    {
      q: "Est-ce adapté aux petits propriétaires ?",
      a: "Oui, c'est précisément la cible. BailFlow est conçu pour les propriétaires qui gèrent 1 à 5 biens sans service juridique ou comptable dédié, et qui font face à une situation d'impayé pour la première fois."
    },
    {
      q: "Puis-je préparer un dossier pour un commissaire de justice ?",
      a: "Oui. BailFlow permet d'exporter un dossier préparatoire complet : chronologie, montants, documents générés, informations sur le bien et le locataire. Ce dossier facilite la prise en charge par un professionnel mais ne s'y substitue pas."
    },
    {
      q: "Mes données sont-elles organisées par dossier ?",
      a: "Oui. Chaque dossier est lié à un bien et un locataire. Toutes les lignes d'impayé, les événements chronologiques, les documents et les paiements sont rattachés au dossier concerné."
    }
  ];

  return (
    <section id="faq" className="mx-auto max-w-4xl px-6 py-20">
      <div className="mb-10 text-center">
        <p className="text-sm font-semibold uppercase tracking-wider text-sage">Questions fréquentes</p>
        <h2 className="mt-3 text-3xl font-bold text-navy">Ce que vous nous demandez</h2>
      </div>
      <div className="space-y-3">
        {faqs.map(({ q, a }) => (
          <details
            key={q}
            className="group rounded-xl border border-line bg-white"
          >
            <summary className="flex cursor-pointer items-center justify-between gap-4 px-6 py-4">
              <span className="font-semibold text-navy">{q}</span>
              <ChevronDown className="h-4 w-4 shrink-0 text-ink/40 transition-transform group-open:rotate-180" />
            </summary>
            <p className="px-6 pb-5 text-sm leading-relaxed text-ink/65">{a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

// ─── Final CTA ────────────────────────────────────────────────────────────────

function FinalCTASection() {
  return (
    <section className="border-t border-line bg-navy py-20">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <h2 className="text-3xl font-bold text-white md:text-4xl">
          Reprenez le contrôle dès aujourd'hui.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base text-white/65">
          Créez votre premier dossier, structurez vos informations et générez vos premiers
          courriers en quelques minutes.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <LinkButton
            href="/auth/sign-up"
            size="lg"
            className="bg-white text-navy hover:bg-paper"
            variant="secondary"
          >
            Créer mon premier dossier
            <ArrowRight className="h-4 w-4" />
          </LinkButton>
          <Link
            href="/auth/sign-in"
            className="inline-flex items-center px-5 py-2.5 text-base font-semibold text-white/70 hover:text-white"
          >
            Déjà un compte ? Se connecter
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function LandingFooter() {
  return (
    <footer className="border-t border-line bg-white">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-ink">
              <Shield className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-sm font-bold text-navy">BailFlow</span>
            <span className="text-sm text-ink/40">
              · Support administratif des impayés locatifs
            </span>
          </div>
          <nav className="flex flex-wrap gap-5">
            {[
              { href: "/legal/privacy", label: "Confidentialité" },
              { href: "/legal/rgpd", label: "RGPD" },
              { href: "/legal/terms", label: "Conditions" },
              { href: "/legal/cookies", label: "Cookies" },
              { href: "/legal/mentions-legales", label: "Mentions légales" }
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-sm text-ink/50 hover:text-ink"
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
        <p className="mt-5 text-xs text-ink/35">
          BailFlow est un outil d'aide à la documentation administrative. Il ne constitue pas un
          service juridique et ne remplace pas les conseils d'un professionnel du droit.
        </p>
      </div>
    </footer>
  );
}
