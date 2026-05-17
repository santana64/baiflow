import Link from "next/link";
import { ArrowRight, CheckCircle2, FileText, FolderOpen, Shield } from "lucide-react";
import { loginUser } from "@/server/account-actions";

export default async function SignInPage({
  searchParams
}: {
  searchParams: Promise<{ callbackUrl?: string; email?: string; error?: string; reset?: string }>;
}) {
  const query = await searchParams;

  return (
    <main className="min-h-screen bg-paper lg:grid lg:grid-cols-[1fr_1fr]">
      {/* ── Left panel — product pitch ── */}
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
            Pour les propriétaires bailleurs
          </p>
          <h2 className="mt-4 text-3xl font-bold leading-tight text-white">
            Reprenez le contrôle
            <br />
            dès le premier impayé.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-white/65">
            Suivez chaque étape, documentez chaque démarche, préparez votre dossier avant
            d'escalader.
          </p>

          <ul className="mt-10 space-y-4">
            {[
              { icon: FolderOpen, text: "Dossiers structurés par bien et locataire" },
              { icon: FileText, text: "Courriers administratifs prudents générés" },
              { icon: CheckCircle2, text: "Chronologie opposable de toutes vos actions" }
            ].map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/8">
                  <Icon className="h-3.5 w-3.5 text-sage" />
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

      {/* ── Right panel — form ── */}
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
            <h1 className="text-2xl font-bold text-navy">Connexion</h1>
            <p className="mt-2 text-sm text-ink/55">
              Accédez à vos dossiers, documents et paramètres.
            </p>
          </div>

          {query.error === "credentials" && (
            <div className="mb-5 rounded-lg border border-danger/20 bg-danger/6 px-4 py-3 text-sm text-danger">
              Identifiants invalides. Vérifiez votre email et votre mot de passe.
            </div>
          )}
          {query.reset && (
            <div className="mb-5 rounded-lg border border-sage/20 bg-sage/8 px-4 py-3 text-sm text-sage">
              Mot de passe mis à jour. Vous pouvez vous connecter.
            </div>
          )}

          <form action={loginUser} className="space-y-4">
            <input type="hidden" name="callbackUrl" value={query.callbackUrl ?? "/app"} />
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
                autoComplete="current-password"
              />
            </div>
            <button className="flex w-full items-center justify-center gap-2 rounded-full bg-ink px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-80">
              Se connecter
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
          <div className="mt-3 text-right">
            <Link href="/auth/forgot-password" className="text-sm font-medium text-navy hover:underline">
              Mot de passe oublié ?
            </Link>
          </div>

          <div className="mt-6 border-t border-line pt-6">
            <p className="text-center text-sm text-ink/55">
              Pas encore de compte ?{" "}
              <Link href="/auth/sign-up" className="font-semibold text-navy hover:underline">
                Créer un compte gratuit
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
            Conditions d'utilisation
          </Link>
        </p>
      </div>
    </main>
  );
}
