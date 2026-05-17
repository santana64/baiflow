// ─── Blog data ────────────────────────────────────────────────────────────────

export type BlogPost = {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  publishedAt: string; // ISO date string
  readMinutes: number;
  category: string;
  excerpt: string;
  content: string; // HTML string — semantic tags only, no Tailwind classes
};

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "loyer-impaye-que-faire",
    title: "Loyer impayé : que faire dès le premier retard ?",
    metaTitle: "Loyer impayé : que faire dès le premier retard ? | BailFlow",
    metaDescription:
      "Locataire qui ne paie plus ? Découvrez les étapes clés à suivre dès les premières 48h : documentation, mise en demeure, commissaire de justice. Guide complet pour propriétaires.",
    publishedAt: "2025-09-10T08:00:00Z",
    readMinutes: 7,
    category: "Guide pratique",
    excerpt:
      "Un retard de loyer peut rester ponctuel… ou marquer le début d'une situation chronique. Voici comment réagir dans les premières 48h pour protéger vos droits et garder le contrôle.",
    content: `
<h2>Les premières 48 heures : une fenêtre décisive</h2>
<p>Dès que la date d'échéance est dépassée et que le loyer n'est pas tombé, l'horloge tourne. La majorité des propriétaires attendent plusieurs semaines avant d'agir, souvent par gêne ou par espoir que la situation se règle d'elle-même. C'est une erreur coûteuse. Agir dans les 48 heures ne signifie pas escalader immédiatement, mais <strong>documenter et initier un premier contact</strong>.</p>
<p>Commencez par envoyer un message simple — SMS, e-mail ou appel téléphonique — pour signaler le retard et demander une confirmation de paiement. Notez la date, l'heure et le contenu de cet échange. Ce premier contact peut suffire si l'impayé est accidentel (virement oublié, changement de compte bancaire). Mais s'il ne suffit pas, vous disposerez d'une trace qui renforcera votre dossier.</p>

<h2>Documenter chaque fait dès le départ</h2>
<p>La gestion d'un impayé est avant tout une affaire de preuves. Dès le premier retard, constituez un journal factuel :</p>
<ul>
  <li>Dates d'échéance et montants dus (loyer + charges)</li>
  <li>Date et mode des relances effectuées (appel, SMS, e-mail, courrier)</li>
  <li>Réponses ou absence de réponse du locataire</li>
  <li>Tout paiement partiel reçu avec sa date exacte</li>
  <li>Copie du bail et des avenants éventuels</li>
</ul>
<p>Ce relevé chronologique est indispensable si vous devez ensuite passer à une procédure formelle. Un commissaire de justice ou un juge ne travaille qu'avec des faits datés et vérifiables.</p>

<h2>Les trois stades de la gestion d'un impayé</h2>
<p><strong>Stade 1 — La relance amiable.</strong> C'est la phase que vous venez d'initier. Elle peut inclure un appel, un message écrit, et même une proposition de rendez-vous pour comprendre la situation. Elle dure généralement entre une et trois semaines selon la réactivité du locataire.</p>
<p><strong>Stade 2 — La mise en demeure.</strong> Si la relance amiable reste sans effet et que le loyer du mois suivant est également impayé, il est temps d'envoyer une mise en demeure en recommandé avec accusé de réception (LRAR). Ce courrier formel indique le montant total dû, fixe un délai de paiement (généralement 8 à 15 jours) et précise les conséquences en cas de non-paiement. Il constitue une étape juridiquement nécessaire avant toute action en justice.</p>
<p><strong>Stade 3 — Le commissaire de justice.</strong> Anciennement appelé huissier, le commissaire de justice intervient lorsque la mise en demeure est restée sans effet. Il peut délivrer un commandement de payer, ouvrir la procédure d'injonction de payer et, en dernier recours, accompagner une procédure d'expulsion. À ce stade, votre dossier doit être complet et chronologiquement irréprochable.</p>

<h2>Impayé ponctuel ou situation chronique : savoir lire les signaux</h2>
<p>Tous les retards ne sont pas égaux. Un locataire qui règle avec 10 jours de retard depuis trois ans mais paie toujours n'est pas dans la même situation qu'un locataire qui n'a pas payé deux mois consécutifs sans donner de nouvelles. La distinction est importante, car la réponse appropriée diffère :</p>
<ul>
  <li><strong>Impayé ponctuel :</strong> un accord verbal ou un plan d'apurement informel peut suffire. Préférez tout de même une confirmation écrite.</li>
  <li><strong>Situation chronique :</strong> la dette s'accumule, le dialogue est difficile ou inexistant. Il faut formaliser rapidement et envisager la procédure judiciaire.</li>
</ul>
<p>Des signaux d'alerte à surveiller : le locataire ne répond plus, les paiements partiels se succèdent, des promesses de paiement ne sont pas tenues. Plus vous laissez la dette grossir, plus le recouvrement devient complexe.</p>

<h2>Le garant : un levier souvent sous-utilisé</h2>
<p>Si votre locataire a fourni un garant (personne physique ou organisme comme Visale), il est temps de l'actionner. Le garant est solidairement responsable du paiement et peut être mis en demeure dans les mêmes conditions que le locataire principal. Beaucoup de propriétaires oublient cette démarche ou la retardent, ce qui peut compliquer l'action ultérieure.</p>
<p>En cas de garantie Visale (garantie d'Action Logement), les délais de déclaration sont stricts. Si vous attendez trop longtemps pour signaler l'impayé, vous risquez de perdre le bénéfice de la garantie. Vérifiez les conditions de votre contrat dès les premiers signes de retard.</p>

<h2>Quand ouvrir un dossier formel</h2>
<p>Un dossier formel de suivi des impayés devrait être ouvert dès le deuxième mois de non-paiement. À ce stade, les relances orales ont montré leurs limites et il vous faut une traçabilité solide. Un dossier bien structuré rassemble en un seul endroit toutes les pièces utiles : bail, état des lieux, relevé des loyers, courriers échangés, preuves d'envoi.</p>
<p>Cette organisation n'est pas un luxe administratif : elle conditionne directement la rapidité et l'efficacité de chaque étape à venir. Un commissaire de justice ou un avocat facture à l'heure — plus votre dossier est clair, moins vous payez en temps de préparation.</p>
<p>BailFlow a précisément été conçu pour centraliser cette documentation dès les premiers jours : relevé automatique des impayés, historique des relances, génération des courriers clés et suivi de l'avancement du dossier. Avant d'escalader, assurez-vous que tout est en ordre.</p>
`,
  },
  {
    slug: "mise-en-demeure-locataire-modele",
    title: "Mise en demeure à un locataire : quand l'envoyer et comment",
    metaTitle:
      "Mise en demeure locataire : modèle et guide complet | BailFlow",
    metaDescription:
      "Tout savoir sur la mise en demeure pour loyer impayé : quand l'envoyer, ce qu'elle doit contenir, comment la transmettre. Modèle de lettre et conseils pratiques pour propriétaires.",
    publishedAt: "2025-09-17T08:00:00Z",
    readMinutes: 6,
    category: "Documents",
    excerpt:
      "La mise en demeure est le pivot de toute procédure pour loyer impayé. Bien rédigée et envoyée au bon moment, elle protège vos droits et met en mouvement la procédure judiciaire si nécessaire.",
    content: `
<h2>Qu'est-ce qu'une mise en demeure sur le plan juridique ?</h2>
<p>La mise en demeure est un acte par lequel le créancier — ici, vous en tant que propriétaire — somme formellement son débiteur — le locataire — de s'exécuter dans un délai déterminé. En droit français, elle est encadrée par l'article 1344 du Code civil. Elle a deux effets juridiques immédiats :</p>
<ul>
  <li>Elle fait courir les intérêts légaux sur les sommes dues à compter de sa réception.</li>
  <li>Elle constitue une preuve formelle que le locataire a été informé de sa défaillance et mis en situation de régulariser.</li>
</ul>
<p>Sans mise en demeure préalable, une procédure judiciaire peut être ralentie ou contestée. C'est une étape que les tribunaux et les commissaires de justice considèrent comme indispensable dans le traitement d'un dossier d'impayé.</p>

<h2>Quand envoyer la mise en demeure ?</h2>
<p>La règle généralement retenue est la suivante : <strong>dès le deuxième mois consécutif de non-paiement</strong>, ou lorsque le premier mois n'a toujours pas été réglé après une ou deux relances amiables infructueuses.</p>
<p>Il est possible d'agir dès le premier impayé si le locataire ne répond pas du tout à vos relances. L'absence de communication est un signal fort que la situation ne se règlera pas d'elle-même.</p>
<p>En revanche, envoyer une mise en demeure à un locataire qui communique et qui s'engage à payer peut dégrader inutilement la relation. Si le locataire a fourni des garanties sérieuses (date de virement confirmée, justificatif de situation), un bref délai supplémentaire peut être accordé — mais <strong>jamais sans trace écrite de cet accord</strong>.</p>

<h2>Ce que doit obligatoirement contenir la lettre</h2>
<p>Une mise en demeure efficace comporte les éléments suivants :</p>
<ul>
  <li><strong>Vos coordonnées complètes</strong> (nom, adresse, qualité de propriétaire bailleur)</li>
  <li><strong>Les coordonnées du locataire</strong> (nom, adresse du logement)</li>
  <li><strong>La date du courrier</strong></li>
  <li><strong>La référence au bail</strong> (date de signature, adresse du logement loué)</li>
  <li><strong>Le détail des sommes dues</strong> : mois concernés, loyer + charges pour chaque mois, total cumulé</li>
  <li><strong>Un délai de régularisation</strong> explicite : généralement 8 à 15 jours à compter de la réception</li>
  <li><strong>Les conséquences en cas de non-paiement</strong> : procédure judiciaire, commandement de payer par commissaire de justice, résiliation du bail</li>
  <li><strong>Votre signature manuscrite</strong></li>
</ul>
<p>Évitez les formulations vagues. Chaque montant doit être précis, chaque date vérifiable. Un courrier imprécis sera plus facilement contesté.</p>

<h2>Comment transmettre la lettre</h2>
<p>La mise en demeure doit impérativement être envoyée en <strong>lettre recommandée avec accusé de réception (LRAR)</strong>. C'est ce mode d'envoi qui lui confère sa valeur probatoire : la date de remise et la signature du destinataire constituent une preuve irréfutable de réception.</p>
<p>Vous pouvez également faire appel à un commissaire de justice pour signifier le courrier, ce qui lui donne un caractère encore plus solennel. Cette option est recommandée si la relation avec le locataire est très dégradée ou si vous anticipez un contentieux judiciaire.</p>
<p>Conservez toujours : l'original du courrier envoyé, le récépissé de dépôt postal, et l'avis de réception signé. Ces trois documents forment la preuve complète de votre démarche.</p>

<h2>Que se passe-t-il si le locataire ne paie toujours pas ?</h2>
<p>Si le délai fixé dans la mise en demeure expire sans règlement, vous êtes en mesure de saisir un commissaire de justice pour faire délivrer un <strong>commandement de payer</strong>. Ce document officiel ouvre formellement la procédure juridique et constitue le point de départ de nombreuses actions en justice (injonction de payer, clause résolutoire, procédure d'expulsion).</p>
<p>À ce stade, la totalité de votre dossier — bail, historique des relances, mise en demeure avec accusé de réception, relevé des sommes dues — doit être organisé et facilement consultable. Plus votre documentation est complète, plus la procédure sera rapide et moins elle vous coûtera en honoraires.</p>
<p>BailFlow vous permet de générer un projet de mise en demeure pré-rempli à partir des données de votre dossier, que vous pouvez relire et personnaliser avant envoi. Chaque document généré est horodaté et conservé dans votre dossier, prêt à être transmis à votre commissaire de justice si nécessaire.</p>
`,
  },
  {
    slug: "plan-apurement-loyer",
    title:
      "Plan d'apurement de loyer : quand le proposer et comment le formaliser",
    metaTitle:
      "Plan d'apurement de loyer : guide pratique pour propriétaires | BailFlow",
    metaDescription:
      "Le plan d'apurement permet d'échelonner une dette locative. Découvrez quand le proposer, ce qu'il doit contenir et comment le sécuriser juridiquement pour éviter les mauvaises surprises.",
    publishedAt: "2025-09-24T08:00:00Z",
    readMinutes: 6,
    category: "Gestion",
    excerpt:
      "Proposer un plan d'apurement peut éviter une procédure judiciaire coûteuse. Encore faut-il savoir quand le proposer, comment le rédiger et comment vous protéger si votre locataire ne le respecte pas.",
    content: `
<h2>Qu'est-ce qu'un plan d'apurement ?</h2>
<p>Un plan d'apurement est un accord amiable entre le propriétaire et le locataire permettant d'échelonner le remboursement d'une dette locative accumulée. Il ne supprime pas la dette : il organise son remboursement progressif selon un calendrier défini d'un commun accord.</p>
<p>Ce type d'arrangement est fréquemment utilisé lorsque le locataire traverse une difficulté financière temporaire — perte d'emploi, séparation, problème de santé — mais dispose de la volonté et des moyens d'honorer ses obligations à terme. Le plan d'apurement est une alternative à la procédure judiciaire : il est plus rapide, moins coûteux et moins traumatisant pour les deux parties.</p>

<h2>Quand proposer un plan d'apurement ?</h2>
<p>La condition première est que le locataire soit <strong>de bonne foi et en capacité de rembourser</strong>. Un plan proposé à un locataire qui n'a aucune source de revenus stable ne fait que reporter le problème sans le résoudre.</p>
<p>Les situations favorables à un plan d'apurement :</p>
<ul>
  <li>Le locataire communique activement et reconnaît la dette</li>
  <li>Il peut justifier d'une rentrée d'argent prochaine (reprise d'emploi, aide sociale, vente d'un bien)</li>
  <li>La dette ne dépasse pas trois ou quatre mois de loyer</li>
  <li>La relation locative est globalement saine (entretien du logement, voisinage correct)</li>
</ul>
<p>En revanche, ne proposez pas de plan d'apurement si le locataire cumule les promesses non tenues, si la dette est très ancienne ou si des dégradations ont été constatées dans le logement. Dans ces cas, la procédure formelle est plus adaptée.</p>

<h2>Ce que doit contenir un plan d'apurement</h2>
<p>Pour être valide et opposable, le plan d'apurement doit être rédigé par écrit et signé par les deux parties. Il doit comporter :</p>
<ul>
  <li><strong>L'identité des deux parties</strong> (propriétaire et locataire) avec adresses complètes</li>
  <li><strong>La référence au bail</strong> (date, adresse du logement)</li>
  <li><strong>Le montant total de la dette</strong> à la date de signature, avec le détail mois par mois</li>
  <li><strong>Le calendrier de remboursement</strong> : dates précises, montants pour chaque échéance</li>
  <li><strong>Le rappel que le loyer courant continue d'être dû</strong> en parallèle du remboursement de la dette</li>
  <li><strong>Une clause résolutoire</strong> précisant ce qui se passe en cas de non-respect du plan (reprise de la procédure, exigibilité immédiate du solde)</li>
  <li><strong>La date et la signature manuscrite des deux parties</strong></li>
</ul>
<p>Un plan non signé n'a aucune valeur juridique. Un accord verbal ne vous protège pas. Même si le locataire semble de bonne foi, l'écrit est indispensable.</p>

<h2>Les risques si le locataire ne respecte pas le plan</h2>
<p>Malgré les bonnes intentions initiales, un plan d'apurement peut être mis en défaut. Le locataire peut cesser de payer les mensualités de remboursement, ou ne plus pouvoir assumer le loyer courant en parallèle. C'est un scénario fréquent.</p>
<p>Si vous avez bien rédigé le plan avec une clause résolutoire, le non-respect déclenche automatiquement les conditions pour relancer la procédure formelle. Vous n'avez pas à repartir de zéro : le plan signé, les preuves de non-respect (relevé des paiements manquants) et les relances effectuées constituent un dossier solide pour saisir un commissaire de justice.</p>
<p>C'est pourquoi il est essentiel de <strong>conserver une trace de chaque paiement reçu</strong> ou manqué au titre du plan. Un tableau de suivi des versements, horodaté, peut faire la différence devant un juge.</p>

<h2>Pourquoi la formalisation écrite est non négociable</h2>
<p>Un plan d'apurement non formalisé par écrit est une erreur courante. Le propriétaire pense avoir trouvé un accord, mais quelques semaines plus tard le locataire conteste les montants, prétend que certains versements ont été faits en espèces, ou nie l'existence même de l'accord.</p>
<p>Le document écrit, signé et daté, protège les deux parties. Il clarifie les attentes, les montants et les délais. Il peut être cosigné par le garant si ce dernier s'engage également dans le plan.</p>
<p>Pour les dossiers qui impliquent une CAF ou une aide au logement, le plan d'apurement signé peut également être transmis aux organismes sociaux pour débloquer des aides exceptionnelles. Certains organismes exigent ce document pour intervenir.</p>
<p>BailFlow vous permet de structurer la chronologie complète de votre dossier — de la première relance amiable au plan d'apurement — avec des dates et des montants précis. Si le plan échoue, tout est déjà en place pour passer à l'étape suivante sans perdre de temps.</p>
`,
  },
  {
    slug: "dossier-commissaire-justice-impayes",
    title:
      "Préparer un dossier pour un commissaire de justice : les pièces indispensables",
    metaTitle:
      "Dossier commissaire de justice impayé : pièces indispensables | BailFlow",
    metaDescription:
      "Comment préparer un dossier complet pour votre commissaire de justice en cas de loyer impayé ? Liste des pièces, conseils de présentation et erreurs à éviter pour une procédure efficace.",
    publishedAt: "2025-10-01T08:00:00Z",
    readMinutes: 7,
    category: "Escalade",
    excerpt:
      "Faire appel à un commissaire de justice est souvent inévitable face à un locataire défaillant. La qualité de votre dossier détermine la rapidité — et le coût — de la procédure.",
    content: `
<h2>Qui est le commissaire de justice ?</h2>
<p>Depuis la réforme de 2022, le terme « huissier de justice » a été remplacé par <strong>commissaire de justice</strong>. Il s'agit d'un officier ministériel assermenté qui dispose de pouvoirs exclusifs pour délivrer certains actes juridiques : significations, commandements de payer, constats, et exécutions forcées. Dans le cadre des impayés locatifs, il est l'interlocuteur central dès que la procédure judiciaire est enclenchée.</p>
<p>Son intervention est obligatoire pour plusieurs étapes clés : la délivrance du commandement de payer visant la clause résolutoire, le procès-verbal de tentative d'expulsion, et la remise des clés. Son tarif est réglementé mais ses honoraires peuvent s'alourdir si le dossier nécessite de nombreux allers-retours pour compléter des pièces manquantes. Un dossier bien préparé est donc directement synonyme d'économies.</p>

<h2>Quand faire appel à un commissaire de justice ?</h2>
<p>Le recours à un commissaire de justice est pertinent lorsque :</p>
<ul>
  <li>La mise en demeure est restée sans effet après l'expiration du délai imparti</li>
  <li>La dette représente au moins deux mois de loyer impayés</li>
  <li>Tout dialogue avec le locataire a échoué ou est impossible</li>
  <li>Un plan d'apurement a été signé mais n'est pas respecté</li>
</ul>
<p>Il ne sert à rien d'attendre davantage : chaque mois supplémentaire alourdit la dette et réduit les chances de recouvrement. La prescription en matière de loyers impayés est de trois ans, mais agir tôt améliore significativement les chances d'aboutir.</p>

<h2>Les pièces indispensables à rassembler</h2>
<p>Voici la liste des documents que tout commissaire de justice vous demandera pour traiter un dossier d'impayé :</p>
<ul>
  <li><strong>Le bail signé</strong> avec tous ses avenants éventuels (renouvellements, modifications de loyer)</li>
  <li><strong>L'état des lieux d'entrée</strong> — il permet d'établir l'état du logement à la prise de possession</li>
  <li><strong>Le relevé détaillé des impayés</strong> : tableau mois par mois indiquant les sommes dues, les sommes reçues et le solde cumulé</li>
  <li><strong>Les correspondances avec le locataire</strong> : SMS, e-mails, lettres recommandées et leurs accusés de réception</li>
  <li><strong>La mise en demeure envoyée et l'accusé de réception signé</strong></li>
  <li><strong>Le plan d'apurement signé</strong>, si un accord avait été trouvé, ainsi que les preuves de non-respect</li>
  <li><strong>Les coordonnées complètes du locataire</strong> : adresse actuelle (si différente du logement), employeur connu, numéro de téléphone</li>
  <li><strong>Les informations sur le garant</strong> : nom, adresse, copie de l'acte de cautionnement</li>
  <li><strong>Le règlement de copropriété</strong> si applicable, et les éventuelles relances pour charges de copropriété impayées</li>
</ul>

<h2>L'importance du classement chronologique</h2>
<p>Un commissaire de justice ne reconstruit pas votre historique — il l'utilise. Chaque document doit être daté, et l'ensemble doit former une chronologie cohérente et sans lacune. Un dossier présenté dans l'ordre chronologique permet au commissaire de comprendre la situation en quelques minutes plutôt qu'en plusieurs heures.</p>
<p>Concrètement, cela signifie :</p>
<ul>
  <li>Numéroter les pièces et les référencer dans un bordereau récapitulatif</li>
  <li>Joindre les preuves d'envoi (récépissés postaux) avec les courriers correspondants</li>
  <li>Ne jamais fournir une copie sans être certain qu'elle correspond à l'original signé</li>
  <li>Dater tous les documents internes (tableaux de suivi, notes)</li>
</ul>
<p>Les dossiers mal organisés allongent les délais et peuvent contraindre le commissaire de justice à revenir vers vous pour des compléments, ce qui retarde l'ensemble de la procédure.</p>

<h2>Les erreurs fréquentes à éviter</h2>
<p>Voici les erreurs les plus courantes observées dans les dossiers transmis aux commissaires de justice :</p>
<ul>
  <li><strong>Relevé des impayés incomplet ou non signé</strong> : sans ce document précis, les montants réclamés peuvent être contestés.</li>
  <li><strong>Mise en demeure non envoyée en LRAR</strong> : un e-mail ou un SMS ne suffit pas à constituer une mise en demeure juridiquement valide.</li>
  <li><strong>Absence de l'acte de cautionnement</strong> : si vous avez un garant, son engagement écrit est indispensable pour l'actionner.</li>
  <li><strong>Bail non signé ou incomplet</strong> : un bail manuscrit non paraphé ou sans annexes légales obligatoires peut fragiliser votre position.</li>
  <li><strong>Confusion entre loyer et charges</strong> : le relevé doit distinguer clairement les deux, avec les justificatifs de charges si nécessaire.</li>
</ul>

<h2>Comment un dossier bien structuré change la donne</h2>
<p>Un commissaire de justice bien alimenté peut agir rapidement. Le commandement de payer peut être délivré dans les jours suivant votre demande si toutes les pièces sont en ordre. À l'inverse, un dossier incomplet peut repousser cette étape de plusieurs semaines, pendant lesquelles la dette continue de s'accumuler.</p>
<p>Au-delà de la rapidité, la qualité du dossier influence directement le résultat : un juge statuant sur une demande d'expulsion ou d'injonction de payer sera plus favorable à un propriétaire dont le dossier montre clairement une démarche structurée, des relances documentées et une mise en demeure conforme.</p>
<p>BailFlow centralise l'ensemble de ces pièces au fil de la vie du dossier : chaque relance est enregistrée, chaque courrier généré est horodaté, et le relevé des impayés se met à jour automatiquement. Le jour où vous devez transmettre votre dossier à un commissaire de justice, tout est déjà prêt.</p>
`,
  },
];

// ─── Helper ───────────────────────────────────────────────────────────────────

export function getBlogPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((post) => post.slug === slug);
}
