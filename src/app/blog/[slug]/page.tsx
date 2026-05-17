import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Shield } from "lucide-react";
import { BLOG_POSTS, getBlogPost } from "@/lib/blog";

// ─── Static params ─────────────────────────────────────────────────────────────

export function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }));
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return {};
  return {
    title: post.metaTitle,
    description: post.metaDescription,
    openGraph: {
      title: post.metaTitle,
      description: post.metaDescription,
      type: "article",
      publishedTime: post.publishedAt,
    },
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function BlogArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  const formattedDate = new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(post.publishedAt));

  return (
    <main className="min-h-screen bg-paper text-ink">
      <style>{`
        .prose-bailflow { font-size: 15px; line-height: 1.8; color: #0a0a0a; }
        .prose-bailflow h2 { font-size: 1.25rem; font-weight: 700; margin: 2rem 0 0.75rem; color: #0a0a0a; }
        .prose-bailflow p { margin: 0 0 1.25rem; }
        .prose-bailflow ul { margin: 0 0 1.25rem 1.5rem; list-style: disc; }
        .prose-bailflow li { margin-bottom: 0.4rem; }
        .prose-bailflow strong { font-weight: 600; }
      `}</style>

      <ArticleNav />

      <article className="mx-auto max-w-2xl px-6 pb-20 pt-10">
        {/* Back link */}
        <Link
          href="/blog"
          className="mb-8 inline-block text-sm font-medium text-ink/50 hover:text-ink"
        >
          ← Toutes les ressources
        </Link>

        {/* Article header */}
        <header className="mb-10">
          <span className="mb-4 inline-block rounded-full bg-powder px-3 py-1 text-xs font-semibold text-[#57534e]">
            {post.category}
          </span>
          <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight text-ink">
            {post.title}
          </h1>
          <p className="mt-4 text-sm text-ink/40">
            {formattedDate} · {post.readMinutes} min de lecture
          </p>
        </header>

        {/* Article body */}
        <div
          className="prose-bailflow"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* CTA card */}
        <aside className="mt-14 rounded-2xl border border-line bg-powder p-8 text-center">
          <h2 className="text-xl font-bold text-ink">
            Besoin de structurer votre dossier d'impayé ?
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-ink/60">
            BailFlow centralise vos pièces, génère vos courriers et vous guide
            étape par étape — de la première relance au commissaire de justice.
          </p>
          <Link
            href="/auth/sign-up"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-80"
          >
            Créer un compte gratuit
          </Link>
        </aside>
      </article>

      {/* Simple footer */}
      <footer className="border-t border-line bg-paper">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-6 py-6 text-xs text-ink/40">
          <span>© {new Date().getFullYear()} BailFlow</span>
          <Link href="/blog" className="hover:text-ink">
            Toutes les ressources
          </Link>
        </div>
      </footer>
    </main>
  );
}

// ─── Navigation ───────────────────────────────────────────────────────────────

function ArticleNav() {
  return (
    <nav className="sticky top-0 z-30 border-b border-line bg-paper/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-2xl items-center justify-between px-6 py-4">
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
            href="/blog"
            className="text-sm font-medium text-ink/60 hover:text-ink"
          >
            Ressources
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
