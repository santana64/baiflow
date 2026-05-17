"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function AppError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-xl rounded-xl border border-danger/20 bg-white p-8 shadow-card">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-danger/8">
          <AlertTriangle className="h-5 w-5 text-danger" />
        </div>
        <div>
          <h1 className="font-semibold text-navy">Impossible de terminer l'action</h1>
          <p className="mt-2 text-sm leading-relaxed text-ink/60">
            {error.message ||
              "Une erreur est survenue. Vérifiez les informations saisies puis réessayez."}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <button
              onClick={reset}
              className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-80"
            >
              <RotateCcw className="h-4 w-4" />
              Réessayer
            </button>
            <Link
              href="/app/account"
              className="inline-flex items-center gap-2 rounded-lg border border-line px-4 py-2 text-sm font-semibold text-navy transition-colors hover:bg-paper"
            >
              Compte et forfait
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
