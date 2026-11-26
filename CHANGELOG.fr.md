# Journal des versions

*[English](CHANGELOG.md) · **Français***

Les versions publiées sur le [Chrome Web Store](https://chromewebstore.google.com/detail/gdggcpmgjoaobfjlnbfmgfnjfgodgikp) sont signalées. Le numéro de version ne change qu'à un envoi au store (voir « Numéros de version » dans [DEVELOPMENT.fr.md](DEVELOPMENT.fr.md)).

## [Non publié]

- **Mode Organiser : après un clic sur l'œil**, la corbeille, le crayon et l'icône partager ne restent plus affichés une fois la souris partie (au clavier, ils restent là tant que le focus est sur la ligne).
- **Une agence masquée garde sa case cochée**, grisée, au lieu de paraître décochée puis recochée : sa coche n'a jamais changé, elle reprend effet quand l'agence est réaffichée. Cocher une autre case en mode Organiser n'efface plus la coche des agences masquées.

## 3.7.3 — 26 novembre 2026 (Chrome Web Store)

- **Code de partage : un écran clair.** Un code collé ouvre un écran « Code de partage » qui ne montre plus le formulaire d'ajout d'agence (adresse, mots-clés, **Détecter**). Il dit ce que contient le code, avec les noms (« Dossier « People » et ses 4 agences : … »), puis ce qui va se passer (« À ajouter, cochées : 1 (Bestimage). Le dossier « People » sera créé. »), sans cases à cocher ni compteurs. **Ajouter** ou **Annuler** ; si vous avez déjà tout, un seul bouton **Retour à la liste** au lieu d'un **Ajouter** grisé. L'import d'un fichier ne change pas.

## 3.7.2 — 26 novembre 2026 (Chrome Web Store)

- **Colonne : une ligne discrète confirme la recherche** (« 8 recherches lancées. »), avec les agences sautées parce qu'elles sont encore à autoriser (« À autoriser, non cherchées : 1 (Abacapress). »). Elle s'efface dès qu'on tape la recherche suivante. La popup, elle, se ferme comme avant.
- **Mode Organiser plus calme dans la colonne.** Comme dans la popup, les outils d'une ligne (partager, crayon, corbeille, œil) n'apparaissent qu'au survol ou au focus clavier de cette ligne, au lieu d'être affichés sur toutes les lignes ; l'œil barré d'une agence ou d'un dossier masqué reste visible. L'œil montre désormais toujours l'état (ouvert : affichée, barré : masquée) et ne change plus d'icône au survol ; son infobulle dit ce que fait le clic.
- **Plus de demande d'autorisation au premier lancement.** Abacapress, Bloomberg et Pixpalace, qui remplissent le champ de recherche de leur site et demandent donc une autorisation de Chrome, ne sont plus cochées à l'installation : le premier écran mène directement à la recherche. L'autorisation est demandée quand on coche l'une d'elles. Rien ne change pour les utilisateurs actuels : leurs cases restent telles quelles.
- **Une agence pas encore autorisée n'ouvre plus d'onglet vide.** Tant que son site attend l'autorisation (pastille « à autoriser »), la recherche la saute et le bouton ne la compte pas ; si seules des agences à autoriser sont cochées, un message le dit.

## 3.7.1 — 26 novembre 2026 (Chrome Web Store)

- **Recevoir un code de partage plus facilement.** **+ Ajouter une agence** est désormais aussi en bas de la liste hors du mode Organiser (c'est là que le message de partage envoie votre collègue), et un code collé dans le champ des mots-clés ouvre directement l'écran d'ajout. Un code incomplet ou abîmé est signalé au lieu d'être ignoré.
- **Mode Organiser : la corbeille n'est plus collée au nom.** Les outils sont dans le même ordre sur les agences et les dossiers : partager, crayon, corbeille, puis l'œil, qui reste à sa place contre la poignée. La ligne **Annuler** reste quinze secondes au lieu de six, et l'infobulle de la corbeille d'un dossier précise que ses agences restent.
- **Import d'un fichier : « Ajouter » est choisi par défaut**, le mode qui ne retire ni ne modifie rien. Quand il n'y a rien à remplacer, le bouton **Remplacer** apparaît bien désactivé.
- **Bandeau d'autorisation sur une ligne** (« 3 agences sont à autoriser. » + **Autoriser**) ; la liste des agences est dans l'infobulle et sur les pastilles « à autoriser ».
- **Colonne : « Organiser » et « Options » écrits en toutes lettres** à côté de leur icône (la popup garde les icônes seules).
- **Clavier, mode Organiser dans la popup :** le crayon, la corbeille et l'œil d'une agence sont de nouveau atteignables avec Tab (ils disparaissaient pendant que le nom avait le focus, depuis la 3.7.0).
- **Bilan d'un ajout en phrases**, avec les noms et sans compteurs à zéro (ex. « Dossiers ajoutés : 1 (People). ») ; pour un code de partage, la boîte parle de « ce code » et non plus de « ce fichier ».
- Les noms de dossier longs passent à la ligne au lieu d'être coupés, et la ligne d'annulation garde « supprimée » en entier.
- « Cochez au moins une agence. » et les autres erreurs de la recherche s'affichent en rouge ; le nom d'une agence en cours de modification a un anneau de focus visible au clavier.

## 3.7.0 — 25 novembre 2026 (Chrome Web Store)

- **Partager une agence ou un dossier par copier / coller.** En mode Organiser, une icône **partager** sur les agences ajoutées, les agences fournies modifiées et les titres de dossier (et un bouton **Partager** dans le crayon d’une agence) copie un court code (`TabulaPix:1:…`) à coller dans Slack, Teams ou un e-mail. Votre collègue le colle dans **+ Ajouter une agence** ou dans **⚙ › Sauvegarde et partage** : la boîte d’import s’ouvre en mode Ajouter, avec ce qui sera réellement ajouté (arrivé coché, dans le dossier partagé). Jamais vos cases cochées, réglages ni recherches ; aucun réseau, c’est la messagerie de la rédaction qui sert de transport. Une agence fournie que le destinataire n’a pas modifiée prend les réglages partagés (ex. une page de connexion).
- **Renommer une agence directement dans la liste** (mode Organiser), comme un dossier. Dans ce mode, une agence se glisse désormais par sa poignée seulement, pour qu’un clic sur son nom permette de le taper.

## 3.6.13 — 25 novembre 2026 (Chrome Web Store)

- Groupes d’onglets : un groupe que vous avez replié dans Chrome reste replié aux recherches suivantes (ses onglets se chargent quand même). Avant, chaque recherche le redépliait. TabulaPix ne déplie plus jamais un groupe de lui-même ; « Replier les groupes après la recherche » les referme toujours tous.

## 3.6.12 — 24 novembre 2026 (Chrome Web Store)

- Aperçu de l’import : réimporter son propre export n’annonce plus « réglages remplacés par ceux du fichier » pour les agences fournies que vous aviez modifiées (ex. page de connexion ajoutée à Pixpalace) : les réglages étaient identiques, seulement enregistrés dans un autre ordre. L’import lui-même ne changeait rien.

## 3.6.11 — 24 novembre 2026 (Chrome Web Store)

- **L’import montre ce qui va réellement changer.** En face de chaque élément, la confirmation compare désormais le fichier à votre configuration au lieu de décrire le fichier : juste après un export, le réimporter affiche « à ajouter : 0 · déjà présentes : 31 » et le bouton reste désactivé. En mode Remplacer, elle nomme les agences qui arrivent, celles qui sont retirées et celles dont les réglages (adresse, champ repéré…) seraient remplacés par ceux du fichier, et montre chaque réglage sous la forme « actuel → fichier ».
- **Le mode Ajouter rétablit les agences fournies que vous aviez supprimées** quand le fichier les a encore (avec la case, le dossier et les réglages qu’elles ont dans le fichier).
- **Réglages un par un** : langue, sous-domaine Pixpalace et groupes d’onglets se décochent séparément à l’import (tous cochés par défaut).
- Le **numéro de version** s’affiche en bas de la fenêtre, avant le lien vers le code source.

## 3.6.10 — 24 novembre 2026 (Chrome Web Store)

- **Choisir quoi importer, et comment.** Importer un fichier de configuration ne remplace plus forcément tout :
  - **quoi** : Agences, Cases cochées et agences masquées, Dossiers (avec leurs couleurs), Réglages — chacun avec ce que contient le fichier ;
  - **comment** : **Remplacer** (ce que vous cochez remplace le vôtre, le reste ne change pas ; tout coché = comme avant) ou **Ajouter** (seulement ce qui vous manque : les agences ajoutées du fichier que vous n’avez pas encore, ses dossiers, et un dossier pour vos agences qui n’en ont pas — rien de chez vous n’est retiré ni modifié).
- Le fichier de configuration comprend désormais l’option des groupes d’onglets (format 5).

## 3.6.9 — 23 novembre 2026 (Chrome Web Store)

- Mode Organiser : les pastilles de couleur d’un dossier replié s’affichent désormais sous son titre quand on clique sur sa couleur, au lieu de rester cachées dans le dossier replié ; le dossier reste replié.

## 3.6.8 — 22 novembre 2026 (Chrome Web Store)

- En faisant glisser une agence ou un dossier, la liste défile désormais d’elle-même pour atteindre une place hors de l’écran : près du bas de la fenêtre, ou vers le haut (sur l’en-tête qui reste en place), d’autant plus vite qu’on s’approche du bord. Vers le haut, la liste ne défilait plus du tout depuis que l’en-tête reste en haut (3.6.7), et dans la popup Chrome ne la faisait défiler dans aucun sens.

## 3.6.7 — 22 novembre 2026 (Chrome Web Store)

- Le haut de la fenêtre (mots-clés, bouton **Lancer la recherche**, boutons Organiser et Options) reste visible quand la liste des agences défile ; un filet le sépare de la liste dès qu’elle passe dessous.

## 3.6.6 — 22 novembre 2026 (Chrome Web Store)

- **Moins d’autorisations à l’installation** : Chrome n’annonce plus que « Consulter votre historique de navigation » (`tabs`, nécessaire pour réutiliser les onglets des agences).
  - Bloomberg, Abacapress et Pixpalace sont autorisées à la demande, comme les autres agences dont on remplit le champ de recherche (pastille et bandeau « à autoriser »). Les utilisateurs actuels gardent Bloomberg et Abacapress ; Pixpalace est à autoriser de nouveau, une fois, pour votre seul sous-domaine.
  - Les groupes d’onglets (`tabGroups`) ne sont demandés qu’en activant l’option, et rendus en la désactivant. Contrairement à ce qu’indiquait la 3.6.0, Chrome affichait bien un avertissement (« Afficher et gérer vos groupes d’onglets »). Si vous utilisiez déjà l’option, elle continue de fonctionner.
  - `clipboardWrite` est retiré : les mots-clés des agences « à coller » sont copiés dès le clic sur **Rechercher**, ce qui ne demande aucune autorisation.

## 3.6.5 — 21 novembre 2026 (Chrome Web Store)

- **Se connecter à une agence** : pour les agences qui ont une page de connexion (Sipa, livrée ainsi), une icône « Se connecter » apparaît au survol dans la liste, à côté de la poignée. Elle ouvre la page de connexion dans l’onglet de l’agence s’il est ouvert (et relance la dernière recherche de cet onglet une fois connecté), sinon dans un nouvel onglet, qui devient celui de l’agence. Toute agence peut recevoir une page de connexion dans son crayon (Détails techniques › Page de connexion), ou la perdre ; elle est gardée dans le fichier de configuration (format 4).
- **Sipa sans session** : une recherche ouverte sans être connecté à Sipa affichait une page noire. TabulaPix la reconnaît désormais au titre de l’onglet (« Sipa Press », sans « > Recherche »), ouvre la page de connexion de Sipa dans le même onglet et, dès que vous êtes connecté, relance la recherche. Une seule fois par recherche, et oublié au bout de 10 minutes ; une page de mot de passe oublié ou de création de compte en chemin n’est pas interrompue.

## 3.6.0 — 20 novembre 2026 (Chrome Web Store)

- **Groupes d’onglets par dossier** (option, désactivée par défaut, dans Options › Onglets) : les onglets de chaque dossier s’ouvrent dans un groupe d’onglets Chrome, au nom et à la couleur du dossier ; les agences sans dossier restent hors groupe ; une recherche suivante reprend le groupe du dossier s’il est encore ouvert (même renommé). Une seconde option replie les groupes après la recherche. Nouvelle autorisation `tabGroups`, pour laquelle Chrome n’affiche aucun avertissement. Les onglets d’agence épinglés restent épinglés, hors groupe, et un groupe qui contient l’onglet affiché n’est jamais replié.

## 3.5.8 — 19 novembre 2026 (Chrome Web Store)

- Le repérage du champ de recherche d’un site est plus robuste sur les sites « applications » modernes (ex. les bibliothèques spécialisées de la Ville de Paris) : les identifiants à petit compteur (`searchTextField_13`) et les classes générées courtes (`jss313`) ne sont plus enregistrés tels quels, car ils changent à chaque chargement ; TabulaPix utilise une description stable (ex. `input[type="search"]`, ou « identifiant qui commence par `searchTextField_` »). Les agences déjà repérées avec un tel identifiant remarchent : si `#nom_13` est introuvable, le champ dont l’identifiant commence par `nom_` est utilisé.

## 3.5.7 — 19 novembre 2026 (Chrome Web Store)

- Mode Organiser : au survol (ou au focus) d’un œil, l’icône montre l’état qu’on obtiendra en cliquant — œil barré pour masquer, œil ouvert pour réafficher. Juste après un clic, l’œil montre le nouvel état jusqu’à ce que la souris (ou le focus clavier) le quitte.

## 3.5.6 — 19 novembre 2026 (Chrome Web Store)

- **Nouvelle agence : Magnum** (dossier Reportage, décochée). Elle remplit le champ de recherche de son site : Chrome demande l’autorisation pour le site quand on la coche. Les utilisateurs existants la reçoivent avec la pastille « Nouveau », et si vous aviez déjà ajouté Magnum vous-même, c’est la vôtre qui est gardée.
- Mode Organiser : l’œil est maintenant contre la poignée (corbeille · crayon · œil) ; il ne bouge plus quand les autres outils apparaissent au survol dans la popup — la corbeille venait se placer sous la souris quand on voulait réafficher une agence masquée. Même ordre sur les titres de dossier.
- L’info-bulle du bouton Organiser dit maintenant « Organiser et modifier », puisqu’on y modifie, masque et supprime aussi les agences ; mode actif, les lecteurs d’écran entendent aussi le « Terminé » affiché.

## 3.5.5 — 13 novembre 2026 (Chrome Web Store)

- Quand le site d’une agence renvoie l’onglet ouvert par TabulaPix vers sa page de connexion sur une autre adresse (Hans Lucas, par exemple), une nouvelle recherche réutilise maintenant cet onglet au lieu d’en ouvrir un à chaque fois. Seules comptent les redirections juste après l’ouverture : un onglet que vous emmenez vous-même vers un autre site n’est jamais repris.
- Le script d’arrière-plan ne réécrit plus son stockage de session à chaque chargement de page dans des onglets sans rapport.

## 3.5.4 — 13 novembre 2026 (Chrome Web Store)

- Options : les agences fournies mises de côté parce que vous aviez déjà la même (ajoutée à la main) ne sont plus listées dans « Agences retirées de la liste », et **Restaurer** ne les fait plus revenir en doublon ; si vous supprimez la vôtre, celle fournie redevient restaurable. Le récapitulatif d’import ne les compte plus non plus comme supprimées.

## 3.5.3 — 13 novembre 2026 (Chrome Web Store)

- **Masquer un dossier** avec son œil en mode Organiser, comme une agence : le dossier et ses agences disparaissent de la liste et ne sont jamais cherchés, leurs cases cochées étant gardées pour quand on le réaffiche. Les dossiers masqués n’apparaissent, grisés, qu’en mode Organiser, et gardent leur place dans l’ordre des dossiers.
- Un dossier dont toutes les agences sont masquées n’apparaît plus en usage courant (il reste visible en mode Organiser) ; un dossier vraiment vide reste affiché, pour y déposer des agences.
- Dans l’éditeur d’agence, les dossiers masqués sont signalés « (masqué) » dans le menu Dossier.
- Fichier de configuration, format version 3 : les dossiers portent `hidden` (les versions plus anciennes l’ignorent).

## 3.5.2 — 12 novembre 2026 (Chrome Web Store)

- Les dossiers livrés jamais renommés suivent désormais la langue de l’interface (Actualité ↔ News…) ; un nom choisi par l’utilisateur reste tel quel.
- Corrections (audit du code) : une future agence fournie ne mélangera plus la liste de qui a installé la 3.5 sans jamais réordonner (l’ordre de la 3.4.1 ne sert qu’aux utilisateurs venant d’avant les dossiers livrés) ; « Essayer » dans l’éditeur d’agence demande l’autorisation du site quand une agence qui remplit un champ ne l’a pas encore, au lieu d’échouer ; glisser un dossier n’affiche plus la zone vide « Sans dossier » ; le compteur de la pastille « Nouveau » n’est plus réécrit à chaque ouverture quand il est vide ; la ligne d’aide du mode Organiser a une zone cliquable de 24 px.

## 3.5.1 — 12 novembre 2026 (Chrome Web Store)

- **Pastille « Nouveau »** sur les agences arrivées avec une mise à jour (pas à la première installation), dans la couleur de leur dossier : elle reste cinq ouvertures de TabulaPix et disparaît dès qu’on coche ou déplace l’agence.

## 3.5.0 — 12 novembre 2026 (Chrome Web Store)

- **14 nouvelles agences** : Divergence, Hans Lucas, Myop, Signatures, Vu', AgencesONline, Bestimage, Bureau 233, Phototélé, Starface, Alamy, Unsplash, Gamma-Rapho, Photo12. Celles qui remplissent le champ de recherche de leur site demandent l’autorisation de Chrome quand on les coche : aucune nouvelle autorisation n’est demandée à l’installation ni à la mise à jour.
- **Dossiers livrés** : à l’installation, les agences arrivent rangées dans Actualité, Reportage & auteurs, Agrégateurs, People, Stock et Archives. Qui n’a encore créé aucun dossier reçoit une fois ce même rangement, en gardant ses cases, ses agences masquées et son ordre ; qui a déjà ses dossiers les garde intacts, et les nouvelles agences arrivent décochées en fin de liste.
- Les sites à autoriser (bandeau, pastilles, « À régler ») ne concernent plus que les agences cochées.
- « Sans dossier » n’est plus affiché quand il est vide, sauf pendant un glisser (pour y déposer une agence) ; un nom de dossier trop long pour la popup s’affiche en entier au survol.
- Une agence fournie arrivant avec une mise à jour ne fait plus doublon avec une agence que l’utilisateur avait déjà ajoutée à la main (même adresse, paramètres compris hors mots-clés, ou même site et même nom) : la sienne est gardée, et celle fournie est mise de côté comme une agence supprimée (Restaurer dans les options).

## 3.4.1 — 11 novembre 2026 (Chrome Web Store)

- **Réordonner à tout moment**, sans passer par le mode Organiser : au survol d’une agence ou d’un dossier, sa poignée apparaît pour le faire glisser ; Alt + ↑ / ↓ sur une case marche aussi à tout moment.
- Un clic sur le titre d’un dossier le replie ou le déplie ; seule sa case coche ou décoche ses agences (plus de « tout coché » par mégarde).
- Le survol d’une agence surligne sa ligne aussi en mode normal, comme en mode Organiser.
- Pendant un glisser, la ligne reste saisie là où on l’a prise, au lieu de sauter pour placer sa case sous le pointeur.
- Import : la confirmation est maintenant un encadré d’avertissement bien visible dans la page (au lieu d’une fenêtre du navigateur), qui précise que la configuration actuelle sera entièrement remplacée et détaille le contenu du fichier, nombre de dossiers compris.
- Changer de langue dans les options traduit aussi le bloc « À régler », la ligne du raccourci clavier et une confirmation d’import ouverte.
- Dossier vide : la même indication dans les deux modes (« Glissez une agence sur le titre du dossier. »).
- Pied de page : les deux lignes de la signature sont rapprochées, avec les mêmes zones cliquables.
- Mode Organiser : la ligne d’aide est allégée (« Glissez pour ranger · Échap ») ; le raccourci clavier Alt + ↑ / ↓ reste expliqué dans l’aide dépliable, et il est désormais annoncé par les lecteurs d’écran sur chaque case.

## 3.4.0 — 10 novembre 2026 (Chrome Web Store)

- **Dossiers d'agences** (agences filaires, agences d'auteurs, agences de service de presse…), affichés en blocs chacun dans sa couleur (9 couleurs). La case d'un dossier coche ou décoche toutes ses agences, et est à moitié cochée quand seules certaines le sont ; le compteur ressort quand un dossier replié contient des agences cochées. Les dossiers se replient et se réordonnent ; tout est conservé dans le fichier de configuration exporté (format version 2, toujours lisible par la 3.3.0, qui garde les dossiers mais pas leur couleur).
- **Mode Organiser** (icône liste en haut) : poignées de glisser-déposer, dossiers renommés sur place, couleur, suppression, création en bas de la liste. En usage courant, la liste ne montre que les noms et les cases. Une agence est rangée dans un dossier quand on la lâche sur son titre (surligné), Échap annule un glisser, et Alt + ↑ / ↓ fait aussi passer une agence d'un dossier à l'autre et déplace les dossiers.
- **Tout ce qui concerne les agences se fait dans la liste**, en mode Organiser : masquer ou réafficher (œil ; les agences masquées y apparaissent grisées), modifier (crayon), supprimer (corbeille), **+ Ajouter une agence** en bas de la liste, qui ouvre l'écran d'ajout et de modification (← Retour revient à la liste). Les dossiers ne se gèrent plus que là. Les options (⚙) ne gardent que la langue, le sous-domaine Pixpalace, la sauvegarde et l'import, la restauration des agences fournies supprimées et la configuration d'usine.
- **Les agences fournies se modifient comme les autres** : en modification, le formulaire vient d'abord et la détection est repliée en « Re-détecter l'adresse » ; Bloomberg, Abacapress et Pixpalace peuvent maintenant aussi être re-détectées, passer à une adresse de recherche ou changer de site (leur champ y est alors repéré à nouveau). Exporté en `fill: false` pour une agence passée à une adresse de recherche.
- **Bouton de recherche juste sous les mots-clés**, avec le nombre d'onglets.
- **Sites encore à autoriser détectés** : une agence qui remplit le champ de recherche de son site sans l'autorisation de Chrome (configuration importée, autorisation refusée ou retirée) est signalée par un bandeau au-dessus de la liste et une pastille « à autoriser », avec un bouton **Autoriser** ; le bouton des options reste aussi disponible. À l'import, l'autorisation est demandée tout de suite quand Chrome le permet. La confirmation d'import est plus courte.
- Liste redessinée : hiérarchie typographique plus nette, cases alignées, icônes dessinées, cibles de clic agrandies, petits textes agrandis.
- Corrections (audit du code) : une recherche lancée depuis l'onglet ouvert pour un import n'échoue plus en silence ; la détection ne remplace plus des mots-clés présents dans le nom du site (ex. « photos » sur photos.example.net) ; une agence ajoutée supprimée ne laisse plus de traces (case, ordre, dossier) ; les autorisations de sites devenues inutiles sont retirées après chaque changement (suppression, passage à une adresse de recherche, retour à l'original, import), et un import demande aussi les sites des agences fournies déplacées ; une autorisation refusée ne déclenche plus le repérage plus tard.
- Couleurs alignées sur l’icône : le même rouge signal pour le bouton de recherche, le focus et le bandeau de repérage sur les sites (il différait légèrement) ; l’icône à côté du nom en haut ; cases hors dossier en noir d’encre au lieu du bleu du navigateur ; thème sombre avec un focus et des couleurs d’état éclaircis.
- Mise en page : en mode Organiser dans la popup, les outils d’une ligne (œil, crayon, corbeille) apparaissent au survol ou au focus de cette ligne, et les noms ne sont plus tronqués (les agences masquées gardent leur œil barré ; la colonne, plus large, affiche tout) ; une seule colonne de cases pour les agences dans et hors dossier ; Tout / Aucune rapprochés de la liste plutôt que du bouton de recherche.
- Finitions : l’éditeur d’agence et les options utilisent les mêmes champs et boutons que la liste (plus de contrôles au style par défaut du navigateur) ; icônes dessinées au lieu de ✓ / ○ pour le repérage (état aussi lu par les lecteurs d’écran) ; zones cliquables agrandies pour les liens et sections repliables ; petits textes passés à 12 px ; plus de trous laissés par les zones de message vides ; deux arrondis (contrôles, blocs) plus les pastilles ; icônes dessinées pour les avertissements de la détection et « Retour » ; le lien vers le code source du pied de page a une zone cliquable de 24 px ; espaces insécables avant « : », « ? », « ! », « ; » et dans les guillemets.
- Bandeau de repérage sur les sites : se fait glisser n’importe où à la souris (⇅ le déplace toujours en haut / en bas) ; liseré blanc pour bien le distinguer sur une page sombre.
- Surbrillance après l’ajout ou la modification d’une agence ou la création d’un dossier : quatre éclats verts brefs et secs, le dernier tenu puis estompé (seulement le fondu si le système demande moins d’animations) ; le rythme ne se casse plus quand la liste est reconstruite plusieurs fois de suite.
- Robustesse et accessibilité : contrastes suffisants en thème sombre partout (exemples dans les champs, messages de réussite et d’erreur, « Rétablir la configuration d’usine ») ; lisible en mode contraste élevé de Windows (contours des dossiers, bouton « Terminé », pastilles de couleur) ; noms en écriture de droite à gauche affichés correctement ; message quand toutes les agences sont masquées ; message au lieu d’un échec silencieux si les onglets ne peuvent pas s’ouvrir (extension en cours de rechargement) ; une double Entrée ne crée qu’un dossier ; zone principale et formulaire de recherche nommés pour les lecteurs d’écran.
- Après la troisième critique de design : l’ajout d’une agence résume l’étape 1 en une ligne une fois la détection faite, avec un seul bouton principal à la fois (Repérer, puis Ajouter) et la mention « mots-clés absents de l’adresse » en avertissement ; le mode Organiser a sa propre icône (liste), le crayon ne sert plus qu’à modifier une agence ; supprimer une agence ou un dossier est immédiat, avec une ligne **Annuler** à sa place pendant quelques secondes, au lieu d’une fenêtre de confirmation ; noms de dossier en entier en mode Organiser, pastille de couleur devant le nom ; Échap revient en arrière depuis l’éditeur et les options ; chaque liste d’agences porte le nom de son dossier pour les lecteurs d’écran ; sélection de texte neutre et croix d’effacement à l’encre dans le champ de recherche.
- Après la deuxième critique de design : l’ajout d’une agence part de l’onglet ouvert (adresse, et mots-clés s’ils correspondent à votre dernière recherche ou au paramètre de recherche de l’adresse) ; les titres de dossier gardent leur apparence en mode Organiser (majuscules, pastille de couleur toujours visible, nom visiblement modifiable) ; rouge réservé au bouton de recherche (œil des agences masquées en gris, cadre « remplir le champ » neutre, bouton « Recherche en pause » neutre pendant l’organisation, survol « danger » dans la couleur d’erreur) ; **Alt + Maj + Y** ouvre TabulaPix ; Alt + ↑ / ↓ ne déplace les agences qu’en mode Organiser, avec annonces pour lecteurs d’écran ; aide du mode Organiser sur une ligne, détail à la demande ; compteurs de dossier lus « 2 sur 3 cochées » ; champs dans la police de l’interface.
- Chaque message s’affiche maintenant à côté de sa cause : erreurs de nom de dossier sous le champ (nouveau dossier) ou sur le champ lui-même (renommage) ; erreurs de saisie de l’éditeur d’agence (nom, adresse, modèle, encodage) sous le champ en cause dès qu’il a été modifié, au lieu de seulement dans l’info-bulle du bouton grisé ; messages du repérage sous « Repérer le champ sur le site » au lieu du bas de l’éditeur ; résultat de la re-détection sous « Re-détecter » en modification ; erreurs du bouton colonne juste sous l’en-tête. Les champs de saisie montrent leur focus à l’encre plutôt qu’en rouge, pour ne pas le confondre avec une erreur.
- Barre latérale : la colonne ne garde plus de connexion permanente avec le script d’arrière-plan (source de l’erreur « Receiving end does not exist » dans chrome://extensions) ; elle signale son ouverture, et la fermeture est détectée par Chrome ou au changement d’onglet ou de fenêtre suivant.
- Barre latérale : le bouton « Garder ouvert » devient une icône comme les autres ; tant que la colonne est ouverte, l'icône de la barre d'outils agit sur elle au lieu d'ouvrir une popup par-dessus.
- Autorisations de sites : le site dont le champ vient d'être repéré pour une agence en cours d'ajout n'est plus retiré avant l'enregistrement de cette agence ; les autorisations devenues inutiles après une suppression dont le délai d'annulation a été interrompu (popup fermée) sont retirées à l'ouverture suivante de TabulaPix.
- Barre latérale : le pied de page (liens vers jeremie.eu et le code source) reste désormais collé au bas de la fenêtre.
- Après la critique de design des options : chaque réglage est enregistré dès qu'on quitte le champ ou qu'on appuie sur Entrée (« ✓ Enregistré » à côté du libellé ; plus de bouton Enregistrer), et changer de langue ne perd plus une valeur en cours de saisie ; un sous-domaine Pixpalace invalide est signalé sous le champ ; un bloc **À régler** en haut nomme les agences dont le site reste à autoriser, avec **Autoriser ces sites** ; nouvelle section **Accès rapide** (raccourci clavier et lien pour le changer, bouton colonne) ; les agences fournies supprimées sont nommées ; hiérarchie plus nette (titres de section au-dessus des libellés) et textes raccourcis.

## 3.3.0 — 7 novembre 2026 (Chrome Web Store)

- **Supprimer n'importe quelle agence**, y compris celles fournies ; les agences fournies supprimées peuvent être restaurées.
- **Renommer n'importe quelle agence**, y compris celles fournies (« Rétablir l'original » remet le nom d'origine).
- **Exporter / importer la configuration** dans un fichier JSON, pour la garder hors de l'extension ou la partager entre collègues ; chaque agence importée est vérifiée, avec un récapitulatif avant de remplacer ; un bouton autorise les sites nécessaires aux agences importées qui remplissent un champ. Le format est versionné et compatible dans les deux sens (les versions plus anciennes et plus récentes lisent les fichiers les unes des autres, en ignorant ce qu'elles ne connaissent pas) ; les dossiers d'agences (`folders`, `folder`) sont déjà conservés à l'import et à l'export, en vue de la fonction de dossiers prévue.
- Bouton **Rétablir la configuration d'usine**.
- Documentation : README et journal des versions en anglais (`README.md`, `CHANGELOG.md`) et en français (`README.fr.md`, `CHANGELOG.fr.md`) ; règle de numérotation des versions.

## 3.2.0 — 6 novembre 2026 (Chrome Web Store)

- **Reuters en deux versions**, selon le contrat Reuters Connect :
  - **Reuters (points)** : l'ancienne agence « Reuters », renommée (cases et ordre conservés). Interface classique, qui affiche le solde des comptes au crédit de points.
  - **Reuters (standard)** : nouvelle agence pour les comptes sans points (téléchargement libre, paiement à la publication), interface « app ».
- **Agences masquées par défaut** : Reuters (standard) et AFP (forum) sont masquées à l'installation comme lors de la mise à jour ; elles s'affichent dans ⚙ → Agences affichées. Le choix de l'utilisateur est ensuite respecté.
- Lien vers la fiche du Chrome Web Store dans le README.

## 3.1.1 — 5 novembre 2026 (Chrome Web Store, première publication)

Première version publiée sur le Chrome Web Store.

- Une recherche, toutes vos agences photo : un onglet par agence, ouvert en arrière-plan, avec vos propres comptes ; réutilisation de l'onglet d'une agence déjà ouverte ; dernière recherche mémorisée.
- Agences fournies : Reuters, AFP (news et forum), Bloomberg, Sipa, Getty Images (Creative et Actu), Shutterstock, Adobe Stock, Abacapress, Rea, Pixpalace, MaxPPP. Ordre personnalisable par glisser-déposer, agences masquables.
- Remplissage automatique du champ de recherche pour les sites dont l'adresse ne contient pas la recherche (Bloomberg, Abacapress, Pixpalace), avec possibilité de **refaire le repérage** si un site change sa page.
- **Ajout d'agences** guidé : détection automatique des mots-clés dans l'adresse (en clair, avec des tirets, ou encodés : URL, hexadécimal, base64, gzip), ou repérage du champ de recherche directement sur le site ; bouton « Essayer ». Agences fournies modifiables, avec retour à l'original.
- Colonne latérale (« Garder ouvert ») pour enchaîner les recherches.
- Interface en **français et en anglais**, selon la langue du navigateur ou au choix.
- Aucune collecte de données, aucune requête réseau ; autorisation d'accès à un site supplémentaire demandée au cas par cas.

## Versions de développement (non publiées)

Avant la première publication, les versions se sont succédé rapidement (une par modification) :

- **3.0.x – 3.1.0** (5 novembre 2026) : traduction anglaise et choix de la langue, audit du code et corrections (dont le délai de Bloomberg), lien vers le code source, nouveau repérage des agences fournies.
- **2.x** (4–5 novembre 2026) : réglages complets dans l'extension (agences masquées, modifiées, ajoutées), détection automatique, repérage du champ sur site, parcours d'ajout guidé, nouveau nom **TabulaPix** (anciennement Wire Sweep).
- **1.x** (4 novembre 2026) : premières versions (Wire Sweep) — recherche sur une douzaine d'agences, remplissage de champ pour Bloomberg, Abacapress et Pixpalace, réutilisation des onglets, colonne latérale, icône, réglage du sous-domaine Pixpalace.
