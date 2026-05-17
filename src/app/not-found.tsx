import Link from "next/link";
import { ArrowRight, Shield } from "lucide-react";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-paper px-6">
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-navy">
          <Shield className="h-8 w-8 text-white" />
        </div>
        <p className="text-sm font-semibold uppercase tracking-wider text-sage">Erreur 404</p>
        <h1 className="mt-3 text-3xl font-bold text-navy">Page introuvable</h1>
        <p className="mx-auto mt-3 max-w-sm text-base text-ink/55">
          La page que vous cherchez n'existe pas ou a été déplacée.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/app"
            className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-80"
          >
            Tableau de bord
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg border border-line bg-white px-5 py-2.5 text-sm font-semibold text-navy transition-colors hover:bg-paper"
          >
            Accueil
          </Link>
        </div>
      </div>
    </main>
  );
}
