import type { Metadata } from "next";
import Link from "next/link";
import { Shield } from "lucide-react";
import { BLOG_POSTS } from "@/lib/blog";

// ─── Metadata ─────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "Blog BailFlow — Ressources pour propriétaires bailleurs",
  description:
    "Guides pratiques sur la gestion des loyers impayés, courriers, dossiers et procédures pour propriétaires.",
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-paper text-ink">
      <BlogNav />

      {/* Header */}
      <section className="mx-auto max-w-5xl px-6 py-16 text-center">
        <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-sage">
          Ressources
        </p>
        <h1 className="text-4xl font-bold tracking-tight text-ink">
          Ressources pour propriétaires bailleurs
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base text-ink/60">
          Guides pratiques, modèles de courriers et procédures pour gérer
          efficacement vos dossiers d'impayés.
        </p>
      </section>

      {/* Article grid */}
      <section className="mx-auto max-w-5xl px-6 pb-20">
        <div className="grid gap-6 md:grid-cols-2">
          {BLOG_POSTS.map((post) => {
            const formattedDate = new Intl.DateTimeFormat("fr-FR", {
              day: "numeric",
              month: "long",
              year: "numeric",
            }).format(new Date(post.publishedAt));

            return (
              <article
                key={post.slug}
                className="flex flex-col rounded-2xl border border-line bg-white p-6 shadow-card transition-shadow hover:shadow-soft"
              >
                {/* Category pill */}
                <span className="mb-4 inline-block self-start rounded-full bg-powder px-3 py-1 text-xs font-semibold text-[#57534e]">
                  {post.category}
                </span>

                {/* Title */}
                <h2 className="mb-3 text-lg font-bold leading-snug text-ink">
                  {post.title}
                </h2>

                {/* Excerpt */}
                <p className="mb-5 flex-1 text-sm leading-relaxed text-ink/60">
                  {post.excerpt}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between border-t border-line pt-4">
                  <span className="text-xs text-ink/40">
                    {formattedDate} · {post.readMinutes} min de lecture
                  </span>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="text-sm font-semibold text-navy hover:underline"
                  >
                    Lire l'article →
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* CTA banner */}
      <section className="bg-powder">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 px-6 py-16 text-center md:flex-row md:text-left">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-ink">
              Gérez vos dossiers d'impayés avec BailFlow
            </h2>
            <p className="mt-2 text-sm text-ink/60">
              Centralisez vos pièces, générez vos courriers et suivez chaque
              dossier de la première relance à la résolution.
            </p>
          </div>
          <Link
            href="/auth/sign-up"
            className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-80"
          >
            Créer un compte gratuit
          </Link>
        </div>
      </section>

      {/* Simple footer */}
      <footer className="border-t border-line bg-paper">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6 text-xs text-ink/40">
          <span>© {new Date().getFullYear()} BailFlow</span>
          <Link href="/" className="hover:text-ink">
            Retour à l'accueil
          </Link>
        </div>
      </footer>
    </main>
  );
}

// ─── Navigation ───────────────────────────────────────────────────────────────

function BlogNav() {
  return (
    <nav className="sticky top-0 z-30 border-b border-line bg-paper/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink">
            <Shield className="h-4 w-4 text-white" />
          </div>
          <span className="text-base font-bold tracking-tight text-navy">
            BailFlow
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="text-sm font-medium text-ink/60 hover:text-ink"
          >
            Accueil
          </Link>
          <Link
            href="/auth/sign-up"
            className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-80"
          >
            Créer un compte
          </Link>
        </div>
      </div>
    </nav>
  );
}
