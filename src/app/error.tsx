"use client";

import Link from "next/link";
import { RotateCcw, Shield } from "lucide-react";

export default function RootError({
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="grid min-h-screen place-items-center bg-paper px-6">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-navy">
          <Shield className="h-7 w-7 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-navy">Une erreur est survenue</h1>
        <p className="mt-3 text-sm leading-relaxed text-ink/55">
          La page n'a pas pu être chargée correctement. Si le problème persiste, contactez le
          support.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-80"
          >
            <RotateCcw className="h-4 w-4" />
            Réessayer
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg border border-line bg-white px-5 py-2.5 text-sm font-semibold text-navy transition-colors hover:bg-paper"
          >
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </main>
  );
}
