import Link from "next/link";
import { ArrowRight, CheckCircle2, Shield } from "lucide-react";
import { registerUser } from "@/server/account-actions";

export default async function SignUpPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string; email?: string; ref?: string }>;
}) {
  const query = await searchParams;

  return (
    <main className="min-h-screen bg-paper lg:grid lg:grid-cols-[1fr_1fr]">
      {/* ── Left panel ── */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-ink p-12 lg:flex">
        <div className="pointer-events-none absolute -top-32 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #16a34a, transparent 70%)" }} />
        <Link href="/" className="relative flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white">BailFlow</span>
        </Link>

        <div className="relative">
          <p className="text-sm font-semibold uppercase tracking-wider text-white/50">
            Démarrez en quelques minutes
          </p>
          <h2 className="mt-4 text-3xl font-bold leading-tight text-white">
            Votre premier dossier,
            <br />
            structuré dès le départ.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-white/65">
            Enregistrez votre bien, votre locataire, et ouvrez un dossier. La timeline
            initiale est générée automatiquement.
          </p>

          <ul className="mt-10 space-y-5">
            {[
              { step: "1", text: "Créez votre compte (gratuit)" },
              { step: "2", text: "Activez un abonnement Stripe" },
              { step: "3", text: "Ajoutez un bien et un locataire" },
              { step: "4", text: "Ouvrez votre premier dossier d'impayé" }
            ].map(({ step, text }) => (
              <li key={step} className="flex items-center gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-white/70">
                  {step}
                </div>
                <span className="text-sm text-white/75">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-white/30">
          BailFlow est un outil administratif. Il ne remplace pas un professionnel du droit.
        </p>
      </div>

      {/* ── Right panel ── */}
      <div className="flex min-h-screen flex-col items-center justify-center px-6 py-12 lg:px-12">
        {/* Mobile logo */}
        <Link href="/" className="mb-10 flex items-center gap-2 lg:hidden">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-ink">
            <Shield className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold text-navy">BailFlow</span>
        </Link>

        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-navy">Créer un compte</h1>
            <p className="mt-2 text-sm text-ink/55">
              Gratuit à la création — un abonnement est requis pour utiliser l'application.
            </p>
          </div>

          {query.error === "exists" && (
            <div className="mb-5 rounded-lg border border-warning/25 bg-warning/8 px-4 py-3 text-sm text-warning">
              Un compte existe déjà avec cet email.{" "}
              <Link href="/auth/sign-in" className="font-semibold underline">
                Se connecter
              </Link>
            </div>
          )}

          {/* Disclaimer compact */}
          <div className="mb-5 rounded-lg border border-blue/20 bg-blue/5 p-3 text-xs leading-relaxed text-ink/60">
            <CheckCircle2 className="mb-1 h-3.5 w-3.5 text-sage inline mr-1" />
            BailFlow est un outil administratif. Il ne constitue pas un service juridique et ne
            remplace pas les conseils d'un professionnel du droit.
          </div>

          <form action={registerUser} className="space-y-4">
            {query.ref ? <input type="hidden" name="ref" value={query.ref} /> : null}
            <div>
              <label>Nom complet</label>
              <input
                name="name"
                required
                placeholder="Jean Dupont"
                autoComplete="name"
              />
            </div>
            <div>
              <label>Adresse email</label>
              <input
                name="email"
                type="email"
                defaultValue={query.email ?? ""}
                required
                placeholder="vous@exemple.fr"
                autoComplete="email"
              />
            </div>
            <div>
              <label>Mot de passe</label>
              <input
                name="password"
                type="password"
                minLength={8}
                required
                placeholder="8 caractères minimum"
                autoComplete="new-password"
              />
            </div>
            <button className="flex w-full items-center justify-center gap-2 rounded-full bg-ink px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-80">
              Créer mon compte
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="mt-6 border-t border-line pt-6">
            <p className="text-center text-sm text-ink/55">
              Déjà inscrit ?{" "}
              <Link href="/auth/sign-in" className="font-semibold text-navy hover:underline">
                Se connecter
              </Link>
            </p>
          </div>
        </div>

        <p className="mt-10 text-center text-xs text-ink/30">
          <Link href="/legal/privacy" className="hover:text-ink/60">
            Confidentialité
          </Link>{" "}
          ·{" "}
          <Link href="/legal/terms" className="hover:text-ink/60">
            Conditions
          </Link>{" "}
          ·{" "}
          <Link href="/legal/rgpd" className="hover:text-ink/60">
            RGPD
          </Link>
        </p>
      </div>
    </main>
  );
}
