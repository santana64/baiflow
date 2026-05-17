import { LegalPage } from "@/components/legal-layout";

export default function PrivacyPage() {
  return (
    <LegalPage title="Politique de confidentialité">
      <p className="text-xs text-ink/40">Dernière mise à jour : avril 2026</p>

      <h2 className="mt-2 font-semibold text-navy">1. Responsable de traitement</h2>
      <p>Le responsable de traitement est l'éditeur de BailFlow. Pour toute question relative à vos données personnelles, contactez : <strong>contact@bailflow.fr</strong>.</p>

      <h2 className="mt-2 font-semibold text-navy">2. Données collectées</h2>
      <p>BailFlow collecte uniquement les données nécessaires au fonctionnement du service :</p>
      <ul className="list-disc pl-5">
        <li><strong>Compte utilisateur</strong> : adresse email, nom, mot de passe haché (bcrypt), plan d'abonnement</li>
        <li><strong>Profil bailleur</strong> : nom complet, adresse, téléphone, email professionnel, signature par défaut</li>
        <li><strong>Biens immobiliers</strong> : adresse, loyer, charges, date de bail</li>
        <li><strong>Locataires</strong> : nom, prénom, adresse, email, téléphone, informations caution</li>
        <li><strong>Dossiers d'impayés</strong> : montants, dates, statut, événements, documents générés, paiements</li>
        <li><strong>Facturation</strong> : identifiant client Stripe, statut d'abonnement (BailFlow ne stocke pas les numéros de carte)</li>
      </ul>

      <h2 className="mt-2 font-semibold text-navy">3. Finalités et bases légales</h2>
      <ul className="list-disc pl-5">
        <li><strong>Exécution du contrat</strong> : fourniture du service, génération de documents, gestion de l'abonnement</li>
        <li><strong>Intérêt légitime</strong> : sécurité des accès, prévention de la fraude, amélioration du service</li>
        <li><strong>Obligation légale</strong> : conservation des données de facturation</li>
      </ul>

      <h2 className="mt-2 font-semibold text-navy">4. Durées de conservation</h2>
      <ul className="list-disc pl-5">
        <li>Données de compte actif : pendant toute la durée de l'abonnement</li>
        <li>Données de facturation : 10 ans (obligation comptable)</li>
        <li>Données supprimées sur demande : effacement dans les 30 jours, sauf obligation légale</li>
      </ul>

      <h2 className="mt-2 font-semibold text-navy">5. Destinataires</h2>
      <p>Les données sont traitées par les sous-traitants suivants dans le cadre strict du service :</p>
      <ul className="list-disc pl-5">
        <li><strong>Stripe</strong> (paiement) — politique disponible sur stripe.com/fr/privacy</li>
        <li><strong>Resend</strong> (envoi d'emails) — politique disponible sur resend.com/legal/privacy-policy</li>
        <li><strong>Vercel</strong> (hébergement) — politique disponible sur vercel.com/legal/privacy-policy</li>
        <li><strong>Anthropic</strong> (génération IA de documents) — les données de dossier sont transmises pour générer les courriers ; elles ne sont pas utilisées pour entraîner les modèles</li>
      </ul>
      <p>Aucune donnée n'est vendue ni cédée à des tiers à des fins commerciales.</p>

      <h2 className="mt-2 font-semibold text-navy">6. Vos droits</h2>
      <p>Conformément au RGPD, vous disposez des droits suivants : accès, rectification, effacement, limitation, portabilité et opposition. Pour exercer ces droits, contactez <strong>contact@bailflow.fr</strong>. Vous pouvez également exporter vos données directement depuis la page Compte.</p>
      <p>En cas de réclamation non résolue, vous pouvez saisir la CNIL (cnil.fr).</p>

      <h2 className="mt-2 font-semibold text-navy">7. Sécurité</h2>
      <p>Les mots de passe sont hachés avec bcrypt. Les sessions utilisent des cookies HTTP-only signés. Les communications sont chiffrées en TLS. L'accès aux données est strictement limité au compte propriétaire.</p>

      <h2 className="mt-2 font-semibold text-navy">8. Cookies</h2>
      <p>Voir notre <a href="/legal/cookies" className="text-navy underline">politique cookies</a>.</p>
    </LegalPage>
  );
}
