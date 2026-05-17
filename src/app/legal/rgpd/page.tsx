import { LegalPage } from "@/components/legal-layout";

export default function RgpdPage() {
  return (
    <LegalPage title="RGPD et sécurité">
      <p className="text-xs text-ink/40">Dernière mise à jour : avril 2026</p>

      <h2 className="mt-2 font-semibold text-navy">Principes appliqués</h2>
      <p>BailFlow applique une logique de minimisation des données : seules les informations strictement nécessaires au suivi administratif d'un dossier sont demandées. Aucune donnée de géolocalisation, de comportement publicitaire ou de profilage commercial n'est collectée.</p>

      <h2 className="mt-2 font-semibold text-navy">Isolation des données</h2>
      <p>Chaque compte accède uniquement à ses propres biens, locataires, dossiers et documents. Toutes les mutations serveur vérifient l'appartenance des données à l'utilisateur authentifié avant exécution.</p>

      <h2 className="mt-2 font-semibold text-navy">Sécurité technique</h2>
      <ul className="list-disc pl-5">
        <li>Mots de passe hachés avec bcrypt (facteur de coût adapté)</li>
        <li>Sessions via cookies HTTP-only signés (jose / JWT)</li>
        <li>Communications chiffrées en TLS 1.2+</li>
        <li>Base de données PostgreSQL accessible uniquement depuis l'environnement d'exécution du service</li>
        <li>Aucune clé API ni secret exposé côté client</li>
      </ul>

      <h2 className="mt-2 font-semibold text-navy">Documents générés et données personnelles</h2>
      <p>Les exports PDF et documents générés peuvent contenir des données personnelles sensibles (noms, adresses, montants, situation financière). L'utilisateur s'engage à les transmettre uniquement aux interlocuteurs légitimes : locataire, caution, ADIL, commissaire de justice, avocat ou conseil juridique. BailFlow n'est pas responsable de l'usage fait des documents téléchargés.</p>

      <h2 className="mt-2 font-semibold text-navy">Génération IA</h2>
      <p>Lorsque la fonctionnalité de génération par intelligence artificielle est activée, les données du dossier (noms, montants, adresses, historique) sont transmises à Anthropic (Claude) pour générer le contenu du document. Ces données sont traitées dans le cadre de la politique de confidentialité d'Anthropic, qui exclut leur utilisation pour l'entraînement des modèles dans le cadre de l'API commerciale.</p>

      <h2 className="mt-2 font-semibold text-navy">Droits des personnes concernées</h2>
      <p>Les locataires et cautions dont les données sont saisies dans BailFlow peuvent exercer leurs droits RGPD (accès, rectification, effacement) en contactant directement le bailleur qui utilise le service, ou en adressant leur demande à <strong>contact@bailflow.fr</strong>.</p>
      <p>Les utilisateurs (bailleurs) peuvent exporter l'intégralité de leurs données depuis la page Compte, ou demander leur suppression.</p>

      <h2 className="mt-2 font-semibold text-navy">Notification d'incident</h2>
      <p>En cas de violation de données à caractère personnel, l'éditeur s'engage à notifier la CNIL dans les 72 heures conformément à l'article 33 du RGPD, et à informer les utilisateurs concernés si le risque pour leurs droits est élevé.</p>

      <h2 className="mt-2 font-semibold text-navy">Contact</h2>
      <p>Pour toute question relative au traitement de vos données : <strong>contact@bailflow.fr</strong></p>
    </LegalPage>
  );
}
