import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";

export function LegalPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-paper px-6 py-10 text-ink">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-ink">
              <Shield className="h-4 w-4 text-white" />
            </div>
            <span className="text-base font-bold text-navy">BailFlow</span>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm text-ink/50 hover:text-ink transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour à l'accueil
          </Link>
        </div>

        {/* Content */}
        <article className="rounded-xl border border-line bg-white p-8 shadow-card">
          <h1 className="text-2xl font-bold text-navy">{title}</h1>
          <div className="mt-6 space-y-5 text-sm leading-7 text-ink/75">{children}</div>
        </article>

        {/* Footer nav */}
        <nav className="mt-8 flex flex-wrap justify-center gap-5 text-xs text-ink/40">
          {[
            { href: "/legal/privacy", label: "Confidentialité" },
            { href: "/legal/rgpd", label: "RGPD" },
            { href: "/legal/terms", label: "Conditions" },
            { href: "/legal/cookies", label: "Cookies" },
            { href: "/legal/mentions-legales", label: "Mentions légales" }
          ].map(({ href, label }) => (
            <Link key={href} href={href} className="hover:text-ink transition-colors">
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </main>
  );
}
