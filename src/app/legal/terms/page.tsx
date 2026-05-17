import { LegalPage } from "@/components/legal-layout";

export default function TermsPage() {
  return (
    <LegalPage title="Conditions générales d'utilisation">
      <p className="text-xs text-ink/40">Dernière mise à jour : avril 2026</p>

      <h2 className="mt-2 font-semibold text-navy">1. Objet du service</h2>
      <p>BailFlow est un logiciel en ligne (SaaS) destiné aux bailleurs particuliers souhaitant structurer et documenter le suivi administratif de loyers impayés. Le service permet de créer des dossiers d'impayés, de générer des courriers administratifs préparatoires, de suivre les paiements et de conserver une trace chronologique des démarches.</p>
      <p>BailFlow n'est pas un cabinet juridique, un commissaire de justice, ni un conseiller légal réglementé. Les documents générés sont des brouillons d'aide administrative et ne sauraient remplacer l'avis d'un professionnel qualifié.</p>

      <h2 className="mt-2 font-semibold text-navy">2. Accès et inscription</h2>
      <p>L'accès au service nécessite la création d'un compte avec une adresse email valide et un mot de passe. L'utilisateur est seul responsable de la confidentialité de ses identifiants. Toute utilisation du compte est réputée effectuée par le titulaire.</p>
      <p>L'utilisateur doit être une personne physique majeure agissant en qualité de bailleur particulier. L'utilisation à des fins de revente, de prestation de services tiers ou de contournement des limites de forfait est interdite.</p>

      <h2 className="mt-2 font-semibold text-navy">3. Forfaits et facturation</h2>
      <p>BailFlow propose un forfait gratuit limité et plusieurs niveaux d'abonnement payant (Bailleur, Premium) aux tarifs affichés sur la page Tarifs. Les abonnements sont mensuels, renouvelables automatiquement. La facturation est gérée par Stripe.</p>
      <p>Toute période entamée est due. L'utilisateur peut résilier depuis son espace Compte ; l'accès aux fonctionnalités payantes est maintenu jusqu'à la fin de la période en cours. Aucun remboursement n'est accordé pour les jours non utilisés.</p>
      <p>En cas d'impayé de l'abonnement, l'accès aux fonctionnalités payantes peut être suspendu après relance.</p>

      <h2 className="mt-2 font-semibold text-navy">4. Utilisation du service</h2>
      <p>L'utilisateur s'engage à ne saisir que des informations exactes, à ne pas utiliser le service à des fins illégales, et à ne pas tenter de contourner les mécanismes d'authentification ou de contrôle d'accès.</p>
      <p>L'utilisateur reste seul responsable du contenu qu'il saisit, des courriers qu'il envoie et des démarches qu'il engage à l'égard de ses locataires. BailFlow fournit des outils, pas des conseils.</p>
      <p>Les brouillons de mise en demeure et dossiers préparatoires sont des documents sensibles qui doivent être relus et validés par un professionnel compétent (avocat, ADIL, commissaire de justice) avant tout usage.</p>

      <h2 className="mt-2 font-semibold text-navy">5. Propriété intellectuelle</h2>
      <p>Le service BailFlow, son interface, ses algorithmes, ses modèles de documents et son code source sont la propriété exclusive de l'éditeur. L'utilisateur dispose d'un droit d'usage personnel, non exclusif et non transférable dans le cadre de son abonnement.</p>
      <p>Les données saisies par l'utilisateur lui appartiennent. L'éditeur dispose d'un droit d'usage limité à l'exécution du service.</p>

      <h2 className="mt-2 font-semibold text-navy">6. Responsabilité</h2>
      <p>BailFlow est fourni « en l'état ». L'éditeur ne garantit pas une disponibilité ininterrompue ni l'adéquation du service à une situation légale particulière.</p>
      <p>En aucun cas la responsabilité de l'éditeur ne saurait excéder le montant des abonnements versés au cours des trois mois précédant le sinistre allégué. L'éditeur n'est pas responsable des pertes indirectes résultant d'une utilisation inadaptée des documents générés.</p>

      <h2 className="mt-2 font-semibold text-navy">7. Résiliation et suppression de compte</h2>
      <p>L'utilisateur peut supprimer son compte à tout moment depuis la page Compte. Cette suppression entraîne la suppression définitive de toutes les données associées dans un délai de 30 jours, sauf obligation légale de conservation.</p>

      <h2 className="mt-2 font-semibold text-navy">8. Modifications des CGU</h2>
      <p>L'éditeur peut modifier les présentes conditions avec un préavis de 30 jours par email. La poursuite de l'utilisation du service après ce délai vaut acceptation.</p>

      <h2 className="mt-2 font-semibold text-navy">9. Droit applicable</h2>
      <p>Les présentes CGU sont soumises au droit français. En cas de litige, une solution amiable sera recherchée en priorité. À défaut, les tribunaux français compétents seront seuls compétents.</p>
    </LegalPage>
  );
}
