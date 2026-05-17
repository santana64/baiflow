import Link from "next/link";
import { Shield } from "lucide-react";
import { requestPasswordReset } from "@/server/account-actions";

export default async function ForgotPasswordPage({
  searchParams
}: {
  searchParams: Promise<{ sent?: string; email?: string }>;
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
        <h1 className="mt-8 text-2xl font-bold text-navy">Réinitialiser le mot de passe</h1>
        <p className="mt-2 text-sm leading-relaxed text-ink/60">
          Saisissez votre email. Si le compte existe, nous envoyons un lien valable 1 heure.
        </p>
        {query.sent && (
          <div className="mt-5 rounded-lg border border-sage/20 bg-sage/8 px-4 py-3 text-sm text-sage">
            Si un compte existe pour {query.email}, un email de réinitialisation a été envoyé.
          </div>
        )}
        <form action={requestPasswordReset} className="mt-6 space-y-4">
          <div>
            <label>Adresse email</label>
            <input name="email" type="email" defaultValue={query.email ?? ""} required autoComplete="email" />
          </div>
          <button className="w-full rounded-full bg-ink px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-80">
            Envoyer le lien
          </button>
        </form>
        <p className="mt-5 text-center text-sm text-ink/55">
          <Link href="/auth/sign-in" className="font-semibold text-navy hover:underline">Retour à la connexion</Link>
        </p>
      </section>
    </main>
  );
}
