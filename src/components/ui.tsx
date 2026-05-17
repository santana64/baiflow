"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AlertTriangle,
  CheckCircle2,
  CreditCard,
  FileCheck,
  FileText,
  FolderOpen,
  Gift,
  Home,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Plus,
  Receipt,
  Settings,
  Shield,
  Store,
  Users,
  ChevronRight,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LEGAL_DISCLAIMER } from "@/lib/constants";
import { SignOutButton } from "./sign-out-button";
import { SearchBar } from "./search-bar";

// ─── Types ────────────────────────────────────────────────────────────────────

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "success";
type ButtonSize = "sm" | "md" | "lg";

const buttonBase = "inline-flex items-center justify-center rounded-full font-medium transition-all active:scale-[0.97] select-none";

const buttonVariantClasses: Record<ButtonVariant, string> = {
  primary:   "bg-ink text-white hover:bg-ink/90 shadow-panel",
  secondary: "bg-white text-ink border border-line hover:bg-powder shadow-card",
  ghost:     "text-ink/70 hover:bg-powder hover:text-ink",
  danger:    "bg-danger text-white hover:bg-danger/90 shadow-panel",
  success:   "bg-sage text-white hover:bg-sage/90 shadow-panel"
};

const buttonSizeClasses: Record<ButtonSize, string> = {
  sm: "px-3.5 py-1.5 text-xs gap-1.5",
  md: "px-4 py-2 text-sm gap-2",
  lg: "px-5 py-2.5 text-[15px] gap-2"
};

// ─── Button ───────────────────────────────────────────────────────────────────

export function Button({
  children,
  className,
  variant = "primary",
  size = "md",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
}) {
  return (
    <button
      className={cn(buttonBase, buttonVariantClasses[variant], buttonSizeClasses[size], className)}
      {...props}
    >
      {children}
    </button>
  );
}

// ─── LinkButton ───────────────────────────────────────────────────────────────

export function LinkButton({
  href,
  children,
  className,
  variant = "primary",
  size = "md"
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
}) {
  return (
    <Link
      href={href}
      className={cn(buttonBase, buttonVariantClasses[variant], buttonSizeClasses[size], className)}
    >
      {children}
    </Link>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-2xl border border-line bg-white p-6 shadow-card", className)}>
      {children}
    </section>
  );
}

// ─── SectionHeader ────────────────────────────────────────────────────────────

export function SectionHeader({
  title,
  subtitle,
  action
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex items-start justify-between gap-4">
      <div>
        <h2 className="font-semibold text-ink">{title}</h2>
        {subtitle ? <p className="mt-0.5 text-sm text-cinder">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}

// ─── FormSection ──────────────────────────────────────────────────────────────

export function FormSection({
  title,
  subtitle,
  children
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <div className="mb-5 border-b border-line pb-4">
        <h2 className="font-semibold text-ink">{title}</h2>
        {subtitle ? <p className="mt-1 text-sm text-cinder">{subtitle}</p> : null}
      </div>
      <div className="grid gap-4 md:grid-cols-2">{children}</div>
    </Card>
  );
}

// ─── StatCard ─────────────────────────────────────────────────────────────────

export function StatCard({
  label,
  value,
  hint,
  icon,
  accent
}: {
  label: string;
  value: string;
  hint?: string;
  icon?: React.ReactNode;
  accent?: "danger" | "warning" | "sage" | "blue" | "navy";
}) {
  const dotColor: Record<string, string> = {
    danger:  "bg-danger",
    warning: "bg-warning",
    sage:    "bg-sage",
    blue:    "bg-blue",
    navy:    "bg-ink"
  };

  return (
    <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          {accent && <span className={cn("h-2 w-2 rounded-full shrink-0", dotColor[accent])} />}
          <p className="text-xs font-medium text-stone uppercase tracking-widest">{label}</p>
        </div>
        {icon ? <div className="shrink-0 text-stone">{icon}</div> : null}
      </div>
      <p className="mt-3 text-[1.75rem] font-bold tabular-nums leading-none tracking-tight text-ink">
        {value}
      </p>
      {hint ? <p className="mt-1.5 text-xs text-stone">{hint}</p> : null}
    </div>
  );
}

// ─── CaseStatusBadge ──────────────────────────────────────────────────────────

const statusConfig: Record<string, { label: string; dot: string; text: string; bg: string }> = {
  DRAFT:                   { label: "Brouillon",         dot: "bg-stone",   text: "text-stone",   bg: "bg-powder" },
  AMICABLE:                { label: "Amiable",           dot: "bg-blue",    text: "text-blue",    bg: "bg-blue-light" },
  FORMAL_NOTICE:           { label: "Mise en demeure",   dot: "bg-warning", text: "text-warning", bg: "bg-warning-light" },
  REPAYMENT_PLAN:          { label: "Plan d'apurement",  dot: "bg-sage",    text: "text-sage",    bg: "bg-sage-light" },
  PROFESSIONAL_ESCALATION: { label: "Escalade pro",      dot: "bg-danger",  text: "text-danger",  bg: "bg-danger-light" },
  RESOLVED:                { label: "Résolu",            dot: "bg-sage",    text: "text-sage",    bg: "bg-sage-light" },
  CLOSED:                  { label: "Clos",              dot: "bg-stone",   text: "text-stone",   bg: "bg-powder" }
};

export function CaseStatusBadge({ status }: { status: string }) {
  const c = statusConfig[status] ?? { label: status, dot: "bg-stone", text: "text-stone", bg: "bg-powder" };
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium", c.bg, c.text)}>
      <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", c.dot)} />
      {c.label}
    </span>
  );
}

// ─── SeverityBadge ────────────────────────────────────────────────────────────

const severityConfig: Record<string, { label: string; dot: string; text: string; bg: string }> = {
  LOW:      { label: "Faible",       dot: "bg-sage",    text: "text-sage",    bg: "bg-sage-light" },
  MEDIUM:   { label: "À surveiller", dot: "bg-blue",    text: "text-blue",    bg: "bg-blue-light" },
  HIGH:     { label: "Élevé",        dot: "bg-warning", text: "text-warning", bg: "bg-warning-light" },
  CRITICAL: { label: "Critique",     dot: "bg-danger",  text: "text-danger",  bg: "bg-danger-light" }
};

export function SeverityBadge({ severity }: { severity: string }) {
  const c = severityConfig[severity] ?? { label: severity, dot: "bg-stone", text: "text-stone", bg: "bg-powder" };
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium", c.bg, c.text)}>
      <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", c.dot)} />
      {c.label}
    </span>
  );
}

// ─── EmptyState ───────────────────────────────────────────────────────────────

export function EmptyState({
  title,
  text,
  href,
  cta
}: {
  title: string;
  text: string;
  href?: string;
  cta?: string;
}) {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-white p-12 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-line bg-powder">
        <FolderOpen className="h-6 w-6 text-stone" />
      </div>
      <h3 className="mt-5 text-sm font-semibold text-ink">{title}</h3>
      <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-cinder">{text}</p>
      {href && cta ? (
        <LinkButton href={href} className="mt-6">
          <Plus className="h-4 w-4" />
          {cta}
        </LinkButton>
      ) : null}
    </div>
  );
}

// ─── WarningNotice ────────────────────────────────────────────────────────────

export function WarningNotice({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-warning/20 bg-warning-light px-4 py-3 text-sm text-cinder">
      <div className="flex gap-3">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
        <div className="leading-relaxed">{children}</div>
      </div>
    </div>
  );
}

export function LegalDisclaimerBox() {
  return <WarningNotice>{LEGAL_DISCLAIMER}</WarningNotice>;
}

// ─── InfoBox ──────────────────────────────────────────────────────────────────

export function InfoBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-blue/20 bg-blue-light px-4 py-3 text-sm text-cinder">
      <div className="flex gap-3">
        <Shield className="mt-0.5 h-4 w-4 shrink-0 text-blue" />
        <div className="leading-relaxed">{children}</div>
      </div>
    </div>
  );
}

// ─── Timeline ─────────────────────────────────────────────────────────────────

export function Timeline({
  events
}: {
  events: {
    id?: string;
    title: string;
    description?: string | null;
    eventDate: Date;
    type: string;
  }[];
}) {
  if (events.length === 0) {
    return <p className="text-sm text-stone italic">Aucun événement enregistré.</p>;
  }
  return (
    <ol className="relative space-y-0 border-l border-line pl-6">
      {events.map((event, index) => (
        <li key={event.id ?? `${event.type}-${index}`} className="relative pb-5 last:pb-0">
          <span className="absolute -left-[1.3rem] flex h-5 w-5 items-center justify-center rounded-full border border-line bg-white">
            <span className="h-1.5 w-1.5 rounded-full bg-sage" />
          </span>
          <div className="ml-1 pt-0.5">
            <p className="text-sm font-medium text-ink leading-snug">{event.title}</p>
            <p className="mt-0.5 text-xs text-stone">
              {event.eventDate.toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "long",
                year: "numeric"
              })}
            </p>
            {event.description ? (
              <p className="mt-1 text-sm leading-relaxed text-cinder">{event.description}</p>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  );
}

// ─── ActionChecklist ──────────────────────────────────────────────────────────

export function ActionChecklist({ hasGuarantor }: { hasGuarantor: boolean }) {
  const items = [
    { label: "Contacter le locataire",           hint: "Appel ou message direct" },
    { label: "Envoyer une relance amiable",       hint: "Email ou courrier simple" },
    { label: "Proposer un plan d'apurement",      hint: "Accord écrit recommandé" },
    { label: hasGuarantor ? "Notifier la caution si pertinent" : "Vérifier l'absence de caution", hint: "Selon les termes du bail" },
    { label: "Préparer une mise en demeure",      hint: "À faire vérifier avant envoi" },
    { label: "Préparer le dossier professionnel", hint: "Commissaire ou avocat" }
  ];

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <label
          key={item.label}
          className="flex cursor-pointer items-start gap-3 rounded-xl border border-line bg-white px-3.5 py-3 text-sm transition-colors hover:bg-powder"
        >
          <input type="checkbox" className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded-full border-line accent-sage" />
          <div className="leading-none">
            <span className="font-medium text-ink">{item.label}</span>
            <span className="ml-1.5 text-xs text-stone">{item.hint}</span>
          </div>
        </label>
      ))}
    </div>
  );
}

// ─── DocumentPreview ──────────────────────────────────────────────────────────

export function DocumentPreview({ html }: { html: string }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-line shadow-card">
      <div className="flex items-center gap-2 border-b border-line bg-powder px-4 py-2.5">
        <FileText className="h-3.5 w-3.5 text-stone" />
        <span className="text-xs font-medium uppercase tracking-widest text-stone">Aperçu</span>
      </div>
      <div className="max-h-[640px] overflow-auto bg-white" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}

// ─── App Shell Navigation ─────────────────────────────────────────────────────

interface NavLink {
  href: string;
  label: string;
  Icon: React.ElementType;
  exact?: boolean;
  group?: string;
}

const navLinks: NavLink[] = [
  { href: "/app",             label: "Tableau de bord",    Icon: LayoutDashboard, exact: true, group: "main" },
  { href: "/app/properties",  label: "Biens",              Icon: Home,            group: "main" },
  { href: "/app/tenants",     label: "Locataires",         Icon: Users,           group: "main" },
  { href: "/app/cases",       label: "Dossiers",           Icon: FolderOpen,      group: "main" },
  { href: "/app/documents",   label: "Documents",          Icon: FileText,        group: "main" },
  { href: "/app/quittances",  label: "Quittances",         Icon: FileCheck,       group: "main" },
  { href: "/app/add-ons",     label: "Add-ons",            Icon: CreditCard,      group: "tools" },
  { href: "/app/marketplace", label: "Marketplace",        Icon: Store,           group: "tools" },
  { href: "/app/referral",    label: "Parrainage",         Icon: Gift,            group: "tools" },
  { href: "/app/team",        label: "Équipe",             Icon: Users,           group: "tools" },
  { href: "/app/developer",   label: "API",                Icon: KeyRound,        group: "tools" },
  { href: "/app/sci",         label: "SCI",                Icon: Shield,          group: "tools" },
  { href: "/app/white-label", label: "White label",        Icon: Shield,          group: "tools" },
  { href: "/app/gli",         label: "GLI",                Icon: Shield,          group: "tools" },
  { href: "/app/admin",       label: "Admin",              Icon: LayoutDashboard, group: "admin" },
  { href: "/app/account",     label: "Compte",             Icon: CreditCard,      group: "account" },
  { href: "/app/settings",    label: "Réglages",           Icon: Settings,        group: "account" }
];

function NavGroup({ title, links }: { title: string; links: NavLink[] }) {
  const pathname = usePathname();
  return (
    <div>
      <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-stone">{title}</p>
      {links.map(({ href, label, Icon, exact }) => {
        const isActive = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
              isActive
                ? "bg-ink text-white font-medium"
                : "text-cinder hover:bg-powder hover:text-ink"
            )}
          >
            <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-white" : "text-stone")} />
            {label}
          </Link>
        );
      })}
    </div>
  );
}

function SidebarNav() {
  const mainLinks = navLinks.filter((l) => l.group === "main");
  const toolsLinks = navLinks.filter((l) => l.group === "tools");
  const adminLinks = navLinks.filter((l) => l.group === "admin");
  const accountLinks = navLinks.filter((l) => l.group === "account");
  return (
    <nav className="space-y-4 mt-2">
      <NavGroup title="Principal" links={mainLinks} />
      <NavGroup title="Outils" links={toolsLinks} />
      {adminLinks.length > 0 && <NavGroup title="Admin" links={adminLinks} />}
      <NavGroup title="Compte" links={accountLinks} />
    </nav>
  );
}

function MobileNav() {
  const pathname = usePathname();
  const mobileLinks: NavLink[] = [
    { href: "/app",            label: "Tableau",    Icon: LayoutDashboard, exact: true },
    { href: "/app/cases",      label: "Dossiers",   Icon: FolderOpen },
    { href: "/app/properties", label: "Biens",      Icon: Home },
    { href: "/app/tenants",    label: "Locataires", Icon: Users },
    { href: "/app/documents",  label: "Docs",       Icon: FileText },
    { href: "/app/account",    label: "Compte",     Icon: CreditCard }
  ];
  return (
    <nav className="flex gap-1 overflow-x-auto pb-0.5">
      {mobileLinks.map(({ href, label, Icon, exact }) => {
        const isActive = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
              isActive
                ? "bg-ink text-white"
                : "border border-line bg-white text-cinder hover:text-ink"
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

// ─── AppShell ─────────────────────────────────────────────────────────────────

export function AppShell({
  children,
  userName
}: {
  children: React.ReactNode;
  userName?: string;
}) {
  const initials = userName
    ? userName.split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase()
    : "?";

  return (
    <div className="min-h-screen bg-surface">
      {/* ── Desktop sidebar ── */}
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-60 flex-col border-r border-line bg-white lg:flex">
        {/* Brand */}
        <div className="flex items-center gap-2.5 px-4 py-4 border-b border-line">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-ink">
            <Shield className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="text-[15px] font-semibold tracking-tight text-ink">BailFlow</span>
        </div>

        {/* New case CTA */}
        <div className="px-3 pt-3 pb-1">
          <LinkButton href="/app/cases/new" className="w-full justify-center" size="sm">
            <Plus className="h-3.5 w-3.5" />
            Nouveau dossier
          </LinkButton>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-3 pb-3">
          <SidebarNav />
        </div>

        {/* User footer */}
        <div className="border-t border-line px-3 py-3">
          {userName && (
            <div className="flex items-center gap-2.5 rounded-xl px-2 py-2 transition-colors hover:bg-powder">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink text-[11px] font-bold text-white">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-ink">{userName}</p>
              </div>
              <SignOutButton />
            </div>
          )}
          <div className="mt-2 flex items-center gap-3 px-2">
            <Link href="/legal/privacy" className="text-[10px] text-stone hover:text-cinder transition-colors">Confidentialité</Link>
            <span className="text-stone text-[10px]">·</span>
            <Link href="/legal/mentions-legales" className="text-[10px] text-stone hover:text-cinder transition-colors">Mentions</Link>
          </div>
        </div>
      </aside>

      {/* ── Main area ── */}
      <div className="lg:pl-60">
        {/* Topbar */}
        <header className="sticky top-0 z-10 border-b border-line bg-white/90 backdrop-blur-md">
          <div className="flex items-center justify-between gap-4 px-4 py-2.5 lg:px-6">
            <Link href="/app" className="flex items-center gap-2 lg:hidden">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-ink">
                <Shield className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="font-semibold text-ink">BailFlow</span>
            </Link>

            <div className="hidden lg:block flex-1 max-w-sm">
              <SearchBar />
            </div>

            <div className="flex items-center gap-2">
              <div className="lg:hidden"><SignOutButton /></div>
              <LinkButton href="/app/cases/new" size="sm" className="lg:hidden">
                <Plus className="h-3.5 w-3.5" />
                Dossier
              </LinkButton>
            </div>
          </div>

          <div className="px-4 pb-2.5 lg:hidden">
            <MobileNav />
          </div>
        </header>

        <main className="animate-fade-up p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

// ─── PageHeader ───────────────────────────────────────────────────────────────

export function PageHeader({
  title,
  subtitle,
  action
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-cinder">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}

// ─── Breadcrumbs ──────────────────────────────────────────────────────────────

export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Fil d'Ariane">
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="h-3.5 w-3.5 shrink-0 text-stone" aria-hidden />}
            {item.href ? (
              <Link href={item.href} className="text-sm text-stone hover:text-ink transition-colors">
                {item.label}
              </Link>
            ) : (
              <span className="text-sm font-medium text-ink">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

// ─── FlashMessage ─────────────────────────────────────────────────────────────

export function FlashMessage({
  type,
  children
}: {
  type: "success" | "error" | "warning" | "info";
  children: React.ReactNode;
}) {
  const styles = {
    success: "border-sage/20 bg-sage-light  text-sage",
    error:   "border-danger/20 bg-danger-light text-danger",
    warning: "border-warning/20 bg-warning-light text-warning",
    info:    "border-blue/20 bg-blue-light text-blue"
  };
  const icons = {
    success: CheckCircle2,
    error:   X,
    warning: AlertTriangle,
    info:    Shield
  };
  const Icon = icons[type];
  return (
    <div className={cn("flex items-start gap-3 rounded-xl border px-4 py-3 text-sm", styles[type])}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <div className="leading-relaxed">{children}</div>
    </div>
  );
}

// ─── OnboardingSteps ──────────────────────────────────────────────────────────

export function OnboardingSteps({
  steps
}: {
  steps: {
    n: number;
    title: string;
    description: string;
    done: boolean;
    href?: string;
    cta?: string;
  }[];
}) {
  return (
    <Card>
      <div className="mb-5">
        <h2 className="font-semibold text-ink">Mise en route</h2>
        <p className="mt-1 text-sm text-cinder">Complétez ces étapes pour ouvrir votre premier dossier.</p>
      </div>
      <div className="space-y-3">
        {steps.map((step) => (
          <div
            key={step.n}
            className={cn(
              "flex items-start gap-4 rounded-xl border p-4 transition-colors",
              step.done ? "border-sage/20 bg-sage-light" : "border-line bg-powder"
            )}
          >
            <div className={cn(
              "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
              step.done ? "bg-sage text-white" : "border border-line bg-white text-stone"
            )}>
              {step.done ? <CheckCircle2 className="h-3.5 w-3.5" /> : step.n}
            </div>
            <div className="flex-1">
              <p className={cn("font-medium text-sm", step.done ? "text-sage" : "text-ink")}>
                {step.title}
                {step.done && <span className="ml-2 text-xs font-normal text-sage/70">Fait</span>}
              </p>
              <p className="mt-0.5 text-sm text-cinder">{step.description}</p>
            </div>
            {!step.done && step.href && step.cta && (
              <LinkButton href={step.href} size="sm" className="shrink-0">{step.cta}</LinkButton>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}

// ─── PriorityActionCard ───────────────────────────────────────────────────────

export function PriorityActionCard({
  caseName,
  tenantName,
  reason,
  dueLabel,
  href,
  severity
}: {
  caseName: string;
  tenantName: string;
  reason: string;
  dueLabel?: string;
  href: string;
  severity: string;
}) {
  const dot: Record<string, string> = {
    CRITICAL: "bg-danger",
    HIGH:     "bg-warning",
    MEDIUM:   "bg-blue",
    LOW:      "bg-sage"
  };
  return (
    <Link
      href={href}
      className="flex items-start justify-between gap-3 rounded-xl border border-line bg-white p-4 transition-colors hover:bg-powder"
    >
      <div className="flex items-start gap-3 min-w-0">
        <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", dot[severity] ?? "bg-stone")} />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-ink">{tenantName}</p>
          <p className="mt-0.5 truncate text-xs text-stone">{caseName}</p>
          <p className="mt-1 text-xs text-cinder">{reason}</p>
          {dueLabel ? <p className="mt-0.5 text-xs font-medium text-warning">{dueLabel}</p> : null}
        </div>
      </div>
      <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-stone" />
    </Link>
  );
}

// ─── Pill ─────────────────────────────────────────────────────────────────────

export function Pill({
  children,
  variant = "default"
}: {
  children: React.ReactNode;
  variant?: "default" | "sage" | "blue" | "danger" | "warning";
}) {
  const styles: Record<string, string> = {
    default: "bg-powder text-cinder",
    sage:    "bg-sage-light text-sage",
    blue:    "bg-blue-light text-blue",
    danger:  "bg-danger-light text-danger",
    warning: "bg-warning-light text-warning"
  };
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", styles[variant])}>
      {children}
    </span>
  );
}

// ─── Divider ──────────────────────────────────────────────────────────────────

export function Divider({ label }: { label?: string }) {
  if (!label) return <hr className="border-line" />;
  return (
    <div className="flex items-center gap-3">
      <hr className="flex-1 border-line" />
      <span className="text-xs text-stone">{label}</span>
      <hr className="flex-1 border-line" />
    </div>
  );
}
