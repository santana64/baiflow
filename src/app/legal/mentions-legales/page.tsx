import Link from "next/link";
import { LegalPage } from "@/components/legal-layout";
import { legalConfig } from "@/lib/legal-config";

export default function LegalNoticePage() {
  return (
    <LegalPage title="Mentions légales">
      <p className="text-xs text-ink/40">Dernière mise à jour : avril 2026</p>

      <h2 className="mt-2 font-semibold text-navy">Éditeur du service</h2>
      <p>
        <strong>{legalConfig.publisherName}</strong><br />
        {legalConfig.publisherDetails}<br />
        Email : <strong>{legalConfig.contactEmail}</strong><br />
        Directeur de publication : {legalConfig.publicationDirector}
      </p>

      <h2 className="mt-2 font-semibold text-navy">Hébergement</h2>
      <p>
        Le service est hébergé par <strong>{legalConfig.hostingProvider}</strong><br />
        {legalConfig.hostingAddress}<br />
        {legalConfig.hostingWebsite}
      </p>
      <p>
        La base de données est hébergée sur infrastructure cloud PostgreSQL managée. Les données doivent être stockées
        dans des centres de données situés dans l'Union Européenne ou couverts par des garanties contractuelles adaptées.
      </p>

      <h2 className="mt-2 font-semibold text-navy">Nature du service</h2>
      <p>
        BailFlow est un outil logiciel d'aide à la gestion administrative de dossiers d'impayés locatifs. Il ne constitue
        pas un service juridique réglementé, un cabinet d'avocat, un commissariat de justice ni un conseil en gestion de
        patrimoine. Les documents générés sont des brouillons administratifs préparatoires.
      </p>

      <h2 className="mt-2 font-semibold text-navy">Propriété intellectuelle</h2>
      <p>
        L'ensemble des éléments du site, dont l'interface, les modèles de documents, les textes et les signes distinctifs,
        est protégé par le droit de la propriété intellectuelle. Toute reproduction, même partielle, est interdite sans
        autorisation écrite préalable de l'éditeur.
      </p>

      <h2 className="mt-2 font-semibold text-navy">Données personnelles</h2>
      <p>
        Voir notre <Link href="/legal/privacy" className="text-navy underline">politique de confidentialité</Link> et notre{" "}
        <Link href="/legal/rgpd" className="text-navy underline">page RGPD</Link>.
      </p>

      <h2 className="mt-2 font-semibold text-navy">Contact</h2>
      <p>Pour toute question : <strong>{legalConfig.contactEmail}</strong></p>
    </LegalPage>
  );
}
