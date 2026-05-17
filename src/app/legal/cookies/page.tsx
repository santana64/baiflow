import { LegalPage } from "@/components/legal-layout";

export default function CookiesPage() {
  return (
    <LegalPage title="Politique cookies">
      <p className="text-xs text-ink/40">Dernière mise à jour : avril 2026</p>

      <h2 className="mt-2 font-semibold text-navy">Cookies strictement nécessaires</h2>
      <p>BailFlow utilise un cookie de session pour maintenir l'authentification de l'utilisateur connecté. Ce cookie est :</p>
      <ul className="list-disc pl-5">
        <li>HTTP-only (inaccessible depuis JavaScript)</li>
        <li>Sécurisé (transmis uniquement en HTTPS)</li>
        <li>De durée limitée (session + token d'expiration)</li>
        <li>Strictement nécessaire au fonctionnement du service : aucun consentement requis</li>
      </ul>

      <h2 className="mt-2 font-semibold text-navy">Cookies tiers — Stripe</h2>
      <p>Lors de l'accès aux pages de paiement ou au portail de gestion d'abonnement hébergés par Stripe, des cookies peuvent être déposés par Stripe pour des raisons de sécurité et de gestion de session de paiement. Ces cookies sont soumis à la politique de confidentialité de Stripe (stripe.com/fr/privacy).</p>

      <h2 className="mt-2 font-semibold text-navy">Absence de cookies publicitaires ou analytiques</h2>
      <p>BailFlow ne dépose aucun cookie publicitaire, de suivi comportemental ou d'analyse d'audience tierce (Google Analytics, Facebook Pixel, etc.). Si cette politique devait évoluer, un mécanisme de consentement conforme au RGPD et aux recommandations de la CNIL serait mis en place préalablement.</p>

      <h2 className="mt-2 font-semibold text-navy">Gestion des cookies</h2>
      <p>Vous pouvez supprimer les cookies de votre navigateur à tout moment. La suppression du cookie de session entraîne votre déconnexion automatique de BailFlow. Les paramètres de gestion des cookies sont accessibles dans les préférences de votre navigateur.</p>
    </LegalPage>
  );
}
