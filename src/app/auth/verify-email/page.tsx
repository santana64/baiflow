import Link from "next/link";
import { Shield } from "lucide-react";
import { verifyEmail } from "@/server/account-actions";

export default async function VerifyEmailPage({
  searchParams
}: {
  searchParams: Promise<{ token?: string; error?: string }>;
}) {
  const query = await searchParams;
  return (
    <main className="grid min-h-screen place-items-center bg-paper px-6 py-12">
      <section className="w-full max-w-md rounded-xl border border-line bg-white p-6 shadow-soft">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-ink">
            <Shield className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold text-navy">BailFlow</span>
        </Link>
        <h1 className="mt-8 text-2xl font-bold text-navy">Vérification email</h1>
        {query.error === "invalid" && (
          <div className="mt-5 rounded-lg border border-danger/20 bg-danger/6 px-4 py-3 text-sm text-danger">
            Lien invalide ou expiré. Connectez-vous et renvoyez un email de confirmation.
          </div>
        )}
        {query.token ? (
          <form action={verifyEmail} className="mt-6">
            <input type="hidden" name="token" value={query.token} />
            <button className="w-full rounded-full bg-ink px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-80">
              Confirmer mon email
            </button>
          </form>
        ) : (
          <p className="mt-5 text-sm text-ink/60">Aucun jeton de vérification n’est présent dans ce lien.</p>
        )}
        <p className="mt-5 text-center text-sm text-ink/55">
          <Link href="/app/account" className="font-semibold text-navy hover:underline">Retour au compte</Link>
        </p>
      </section>
    </main>
  );
}
