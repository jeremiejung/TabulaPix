# TabulaPix

*[English](README.md) · **Français***

**Une recherche, toutes vos agences photo.**

**[Installer depuis le Chrome Web Store](https://chromewebstore.google.com/detail/gdggcpmgjoaobfjlnbfmgfnjfgodgikp)** · site : [tabulapix.com](https://tabulapix.com)

Extension Chrome pour les services photo, iconographes et éditeurs photo : tapez vos mots-clés une fois et cherchez sur toutes vos agences photo en même temps. TabulaPix ouvre un onglet par agence, résultats prêts, avec vos propres comptes. Aucun scraping, aucune clé d'API, aucun mot de passe enregistré. Interface en français et en anglais.

Tout se règle depuis l'extension (mode **Organiser** et options **⚙**), sans modifier de fichier : agences affichées, ordre, dossiers, agences ajoutées avec détection automatique, adresses et repérages modifiables, langue, sous-domaine Pixpalace. Les agences cochées et leur ordre sont mémorisés d'une utilisation à l'autre.

Extension Chrome (Manifest V3) en HTML/JavaScript simple : aucune dépendance, aucune compilation. Pour travailler sur le code : [`DEVELOPMENT.fr.md`](DEVELOPMENT.fr.md).

## Installation

[Installez TabulaPix depuis le Chrome Web Store](https://chromewebstore.google.com/detail/gdggcpmgjoaobfjlnbfmgfnjfgodgikp), puis épinglez l'extension (icône puzzle 🧩 → épingle à côté de **TabulaPix**). Les mises à jour arrivent ensuite automatiquement.

> Si vous utilisiez jusqu'ici la version chargée depuis un dossier, Chrome considère la version du store comme une autre extension : vos réglages ne sont pas repris d'eux-mêmes. Dans l'ancienne version, **⚙ › Exporter** ; installez la version du store et **⚙ › Importer…** ce fichier ; puis supprimez l'ancienne version dans `chrome://extensions` pour ne pas avoir TabulaPix en double.

**Installation manuelle** (version de développement, depuis ce dépôt) :

1. Téléchargez ce dépôt (bouton **Code → Download ZIP** sur GitHub) et décompressez-le, ou clonez-le avec `git clone`.
2. Dans Chrome, ouvrez `chrome://extensions`.
3. Activez le **Mode développeur** (interrupteur en haut à droite).
4. Cliquez sur **Charger l'extension non empaquetée** et choisissez le dossier `extension` du dépôt.
5. Épinglez l'extension : icône puzzle 🧩 dans la barre d'outils → épingle à côté de **TabulaPix**.
6. Réglez vos **options** (bouton ⚙ de la popup) : notamment le sous-domaine de votre espace Pixpalace (voir « Options » ci-dessous).

> **Ne déplacez pas, ne renommez pas et ne supprimez pas le dossier après l'installation.** Chrome lit l'extension directement dans ce dossier : s'il change de place, l'extension ne se charge plus (elle est désactivée, avec une erreur dans `chrome://extensions`).
> Choisissez donc un emplacement durable avant d'installer (par exemple `Documents/TabulaPix`), pas le dossier Téléchargements ni le Bureau.
> Si le dossier a été déplacé : supprimez TabulaPix dans `chrome://extensions`, puis refaites l'étape 4 en choisissant le dossier `extension` à son nouvel emplacement. Chrome la considère alors comme une nouvelle extension, avec les réglages livrés : **Importez** votre dernier export pour retrouver les vôtres (d'où l'intérêt d'exporter de temps en temps).

## Mettre à jour une version installée manuellement

(La version du Chrome Web Store se met à jour toute seule.)

1. Téléchargez la nouvelle version (bouton **Code → Download ZIP**) et décompressez-la.
2. Copiez le **contenu** de son dossier `extension` dans le dossier `extension` déjà installé, en remplaçant les fichiers existants. Gardez le même dossier, au même endroit : c'est ce qui conserve vos agences cochées et leur ordre.
3. Dans `chrome://extensions`, cliquez sur le bouton **↻** (recharger) de la carte TabulaPix.
4. Si Chrome affiche un avertissement sur de nouvelles autorisations, acceptez-le : la section « Confidentialité » ci-dessous explique chacune.

Si vous avez installé avec `git clone` : `git pull` dans le dossier du dépôt, puis **↻** dans `chrome://extensions`.

Si vous aviez modifié `config.js` (voir [`DEVELOPMENT.fr.md`](DEVELOPMENT.fr.md)), notez vos changements avant de remplacer les fichiers, puis reportez-les dans le nouveau `config.js`.

## Utilisation

1. Cliquez sur l'icône TabulaPix, ou appuyez sur **Alt + Maj + Y** (raccourci modifiable dans `chrome://extensions/shortcuts`).
2. Tapez vos mots-clés, cochez les agences voulues (boutons **Tout** / **Aucune** pour aller vite).
   Les **dossiers** regroupent les agences, chacun dans sa couleur. À l'installation, les agences arrivent rangées dans six dossiers : Actualité, Reportage & auteurs, Agrégateurs, People, Stock et Archives (une partie des agences d'Actualité, Reportage et Agrégateurs est cochée) ; à vous de les renommer, recolorer, réordonner ou supprimer (tant qu'ils gardent leur nom d'origine, ils suivent la langue de l'interface). La case d'un dossier coche ou décoche toutes ses agences d'un coup ; elle est à moitié cochée quand seules certaines le sont (le compteur indique combien). Un clic sur le titre d'un dossier (ou sur **›**) le replie ou le déplie, sans rien cocher. Les onglets s'ouvrent dans l'ordre de la liste.

   **Réordonner à tout moment** : au survol d'une agence ou d'un dossier, sa poignée apparaît (à droite) ; faites-la glisser entre deux agences, ou sur le titre d'un dossier (surligné) pour y ranger une agence ; près du bas de la fenêtre ou sur son haut, la liste défile d'elle-même. Au clavier, **Alt + ↑ / ↓** sur une case fait de même.
3. Appuyez sur **Entrée** ou **Lancer la recherche**, juste sous les mots-clés : un onglet s'ouvre par agence (le bouton indique combien). Les mots-clés, ce bouton et les boutons du dessus restent en haut quand la liste défile.
   Les onglets s'ouvrent en arrière-plan : vous restez sur l'onglet où vous êtes.
   Les derniers mots-clés lancés sont réaffichés (déjà sélectionnés) à la prochaine ouverture : tapez directement pour les remplacer.
   Une agence arrivée avec une mise à jour porte une pastille **Nouveau** pendant quelques ouvertures.
   Si un onglet est déjà ouvert sur le site d'une agence (par exemple après une recherche précédente), il est réutilisé : la nouvelle recherche s'y affiche au lieu d'ouvrir un onglet de plus. Ça marche aussi quand le site a renvoyé cet onglet vers sa page de connexion, sur une autre adresse, juste après son ouverture par TabulaPix (connectez-vous-y, ou relancez la recherche : c'est le même onglet qui sert).

**Garder ouvert :** le bouton **colonne** (première icône en haut de la popup) affiche TabulaPix dans une colonne à droite de la fenêtre (panneau latéral de Chrome, version 116 ou plus récente). La colonne reste ouverte quand vous changez d'onglet ; vous pouvez enchaîner les recherches sans rouvrir l'extension ; après chaque recherche, une ligne discrète dit combien sont parties. Tant que la colonne est ouverte, l'icône TabulaPix de la barre d'outils agit sur la colonne (elle n'ouvre pas de popup par-dessus) ; une fois la colonne fermée, l'icône rouvre la popup. Pour la fermer : la croix en haut de la colonne. Elle se rouvre aussi depuis l'icône « panneau latéral » de Chrome.

Pour certaines agences (Bloomberg, Abacapress, Pixpalace, Hans Lucas, Magnum, Myop, Signatures, Vu', Bestimage, Bureau 233, Phototélé, Starface), l'adresse ne peut pas contenir la recherche : l'extension ouvre la page, tape vos mots-clés dans le champ de recherche et clique sur le bouton à votre place (comptez une ou deux secondes de plus). Chrome demande une fois l'autorisation pour le site : quand vous cochez une de ces agences, une pastille « à autoriser » et un bandeau proposent de l'autoriser. Elles arrivent donc décochées à l'installation, et tant que leur site n'est pas autorisé, la recherche ne leur ouvre pas d'onglet (le bouton ne les compte pas ; dans la colonne, la ligne qui confirme la recherche les nomme).

Si une agence ajoutée plus tard n'a ni adresse avec `{q}` ni remplissage automatique, elle est marquée **« coller »** : la page s'ouvre et vos mots-clés sont copiés dans le presse-papiers, il suffit de faire **Ctrl+V** (ou **Cmd+V**) dans le champ de recherche.

Vous devez être connecté à vos comptes agences dans Chrome, comme d'habitude : l'extension ne fait qu'ouvrir des onglets. Pour les agences qui ont une page de connexion (Sipa, livrée ainsi), le survol de l'agence montre aussi une icône **Se connecter**, à côté de la poignée : elle ouvre la page de connexion dans l'onglet de l'agence (ou un nouveau), et la dernière recherche de cet onglet est relancée une fois connecté. Sipa affiche une page noire quand une recherche arrive sans session : TabulaPix la reconnaît au titre de l'onglet, ouvre la page de connexion à sa place et relance la recherche après la connexion.

## Mode Organiser

Le bouton **Organiser** en haut (icône liste ; écrit en toutes lettres dans la colonne, comme **Options**) passe en mode **Organiser**, où l'on range, renomme, masque, modifie et supprime agences et dossiers, directement dans la liste. **Échap** ou **Terminé** pour en sortir ; la recherche est en pause pendant ce temps. Les outils d'une ligne (partager, crayon, corbeille, œil) apparaissent au survol ou quand la ligne a le focus clavier ; l'œil barré d'une agence ou d'un dossier masqué reste toujours visible.

- **Ordre et dossiers** : comme hors de ce mode : faites glisser une agence par sa poignée (à droite) entre deux agences, ou sur le titre d'un dossier (surligné) pour l'y ranger ; faites glisser un dossier par sa poignée pour le déplacer. Un glisser annulé avec Échap ne change rien. Au clavier, **Alt + ↑ / ↓** sur la case d'une agence la déplace (et la fait passer dans le dossier voisin au bord), sur la case d'un dossier déplace le dossier.
- **Dossiers** : renommez un dossier directement dans son titre, changez sa couleur avec sa pastille, masquez-le avec son **œil** (le dossier et ses agences disparaissent de la liste et ne sont jamais cherchés ; leurs cases cochées sont gardées pour quand vous le réaffichez), supprimez-le avec la corbeille (ses agences sont conservées, hors dossier ; **Annuler** pendant quinze secondes), créez-en un en bas de la liste. Un dossier dont toutes les agences sont masquées n'apparaît pas non plus en usage courant ; les dossiers masqués n'apparaissent, grisés, qu'en mode Organiser.
- **Agences** : renommez une agence directement dans son nom (souligné en pointillé), comme un dossier : **Entrée** ou sortie du champ enregistre, **Échap** annule ; pour une agence fournie, **Rétablir l'original** dans son crayon redonne le nom livré. Puis, sur chaque ligne (de gauche à droite, avant la poignée : partager, crayon, corbeille, œil) :
  - **œil** : masque l'agence (elle disparaît de la liste, sa place est conservée) ou la réaffiche ; il montre l'état (ouvert : affichée, barré : masquée), son infobulle dit ce que fait le clic ; les agences masquées n'apparaissent, grisées, qu'en mode Organiser.
    - **Reuters** existe en deux versions, selon votre contrat : **Reuters (points)** pour les comptes au crédit de points (affiche le solde), visible par défaut, et **Reuters (standard)** pour les comptes sans points (téléchargement libre), masquée par défaut : affichez celle qui correspond à votre compte avec son œil. **AFP (forum)** est aussi masquée par défaut.
  - **crayon** : modifie l'agence (voir plus bas) ;
  - **partager** (agences ajoutées et agences fournies modifiées seulement) : copie un code à envoyer à un collègue (voir « Partager une agence ou un dossier » plus bas) ;
  - **corbeille** : supprime n'importe quelle agence, y compris celles fournies, tout de suite ; une ligne **Annuler** prend sa place quinze secondes (les agences fournies supprimées se récupèrent aussi plus tard dans ⚙ avec **Restaurer**).
- **+ Ajouter une agence**, en bas de la liste (aussi hors du mode Organiser), ouvre l'écran d'ajout (**← Retour** revient à la liste).

### Partager une agence ou un dossier

Pour envoyer une agence ou tout un dossier à un collègue, sans compte ni serveur : c'est la messagerie de la rédaction (Slack, Teams, e-mail) qui sert de transport.

- **Partager** : en mode Organiser, l'icône **partager** d'une agence (ou, dans son crayon, le bouton **Partager**), ou celle du titre d'un dossier. TabulaPix copie un court code (`TabulaPix:1:…`) qui contient l'agence, ou le dossier (nom, couleur) et ses agences affichées : adresse, modèle, champ repéré, page de connexion — jamais vos cases cochées, vos réglages ni vos recherches. Les agences fournies ne sont partagées que si vous les avez modifiées (sinon votre collègue les a déjà) ; dans un dossier, elles sont simplement citées, pour y être rangées.
- **Recevoir** : collez le code dans **+ Ajouter une agence** (premier champ), dans le champ des mots-clés (l'écran **Code de partage** s'ouvre alors tout seul) ou dans **⚙ › Sauvegarde et partage › Coller un code de partage**. TabulaPix dit ce que contient le code (ex. « Dossier « People » et ses 4 agences : … ») et ce qui va se passer, avec les noms, sans rien à choisir : **Ajouter** ou **Annuler**, ou un seul bouton **Retour à la liste** si vous avez déjà tout. En détail : ce qui vous manque arrive coché, un dossier du même nom est réutilisé ; ce que vous avez déjà ne change pas (une agence fournie que vous n'avez pas modifiée prend les réglages de votre collègue). Chaque agence est vérifiée comme une agence ajoutée à la main ; si elle remplit un champ, Chrome demande l'autorisation pour son site.

### Ajouter une agence

En trois étapes :
  1. **Détecter** : faites une recherche sur le site de l'agence, puis collez l'adresse de la page de résultats et les mots-clés que vous avez tapés (ex. « Estonie frontière ») et cliquez sur **Détecter**. Si l'onglet ouvert est déjà la page de résultats de l'agence, TabulaPix reprend son adresse, et aussi les mots-clés s'il s'agit de votre dernière recherche TabulaPix ou du paramètre de recherche de l'adresse : il suffit de cliquer sur **Détecter**.
  2. **Vérifier** : TabulaPix propose un nom (le domaine du site, ex. `search.reaphoto.com` → « Reaphoto ») et remplit l'adresse de recherche, avec une surbrillance verte sur ce qu'il vient de remplir.
     - Si les mots-clés sont dans l'adresse (en clair, avec des tirets, ou emballés : encodage URL, hexadécimal, base64, gzip et leurs combinaisons), c'est prêt.
     - Sinon (recherche enregistrée côté serveur, comme Pixpalace, ou page qui ne change pas d'adresse), TabulaPix remplira le champ de recherche du site : cliquez sur **Repérer le champ sur le site**. Chrome demande l'autorisation pour ce site (et lui seul), le site s'ouvre avec un bandeau TabulaPix : cliquez sur son champ de recherche, puis sur son bouton (ou « Pas de bouton : utiliser Entrée » ; le bandeau se fait glisser où l’on veut, et **⇅** le déplace). TabulaPix se rouvre ensuite sur cette étape, avec « ✓ Champ de recherche » et « ✓ Bouton de recherche ».
     - **Essayer** lance une recherche d'essai dans un nouvel onglet, avec les réglages en cours.
  3. **Ajouter l'agence** : le bouton ne s'active que lorsque tout est correct ; TabulaPix revient à la liste, où l'agence apparaît cochée, en surbrillance.

  Le lien « Saisir l'adresse à la main » permet de taper directement une adresse avec `{q}` à la place des mots-clés (ou `{q:slug}` si le site sépare les mots par des tirets : « Estonie frontière » → `Estonie-frontière`). Sans `{q}`, la page s'ouvre et les mots-clés sont copiés pour être collés. Les **Détails techniques** (repliés) montrent le modèle et les étapes d'encodage, ou l'emplacement du champ et du bouton repérés. Supprimer une agence qui remplit un champ retire aussi l'autorisation donnée pour son site.

  Le repérage ignore les identifiants générés à chaque chargement (ex. `…__bfac60392382`) et s'appuie sur des repères stables (nom du champ, classe, libellé du bouton…) ; si le site a plusieurs formulaires de recherche identiques, TabulaPix utilise le premier visible et le bouton le plus proche du champ. Si le site change sa page, refaites le repérage (crayon de l'agence puis **Refaire le repérage**).

### Modifier une agence

- **Modifier une agence** (son crayon) : même écran, directement sur le formulaire (nom, dossier, adresse), avec **Enregistrer**. Si le site a changé, **Re-détecter l'adresse depuis le site** (replié, en bas) relance la détection à partir d'une page de résultats ; pour une agence ajoutée qui remplit un champ, le repérage est gardé si les mots-clés ne sont toujours pas dans l'adresse. Toutes les agences peuvent être renommées, y compris celles fournies ; pour celles-ci, **Rétablir l'original** revient au nom et aux réglages livrés. **Détails techniques › Page de connexion** (facultatif) règle la page ouverte par l'icône **Se connecter** ; vide, l'icône disparaît.
  - **Agences fournies qui remplissent un champ de recherche** (Bloomberg, Abacapress, Pixpalace, Magnum…) : si l'une d'elles change sa page et que la recherche ne part plus, ouvrez son crayon puis **Refaire le repérage** pour lui montrer à nouveau le champ et le bouton (le délai propre à Bloomberg est conservé). Comme toute agence, elles peuvent aussi être re-détectées, passer à une adresse de recherche (**Utiliser plutôt une adresse de recherche**) ou changer de site (le champ est alors repéré sur ce site, avec l'autorisation de Chrome pour celui-ci) ; **Rétablir l'original** revient au fonctionnement livré.

## Options

Le bouton **⚙** en haut affiche les réglages directement dans la popup ; **← Retour** (ou Échap) revient à la recherche. Pas de bouton Enregistrer : chaque réglage est enregistré dès qu'on quitte le champ ou qu'on appuie sur Entrée, avec un bref « ✓ Enregistré » à côté.

- **À régler** (en haut, seulement si besoin) : liste les agences cochées dont Chrome n'a pas encore autorisé le site, avec un bouton **Autoriser ces sites**.
- **Langue** : français ou anglais. Par défaut, TabulaPix suit la langue du navigateur (« Automatique ») ; le changement s'applique immédiatement. Le nom et la description affichés dans `chrome://extensions` et sur le Chrome Web Store suivent toujours la langue du navigateur.
- **Pixpalace** › **Sous-domaine** : la partie avant `.pixpalace.com` dans l'adresse de votre espace Pixpalace (par défaut `www`). Par exemple, pour `https://maredaction.pixpalace.com/home`, saisissez `maredaction` : Chrome demande alors l'autorisation pour cette adresse (pastille « à autoriser »). Une valeur invalide est signalée sous le champ et n'est pas enregistrée.
- **Accès rapide** : affiche le raccourci clavier qui ouvre TabulaPix (Alt + Maj + Y par défaut), avec un lien pour le changer, et rappelle que le bouton colonne garde TabulaPix ouvert à côté de la page.
- **Onglets** : **Ouvrir les onglets en groupes, un par dossier** (désactivé par défaut) range les onglets de chaque dossier dans un groupe d'onglets Chrome, au nom et à la couleur du dossier (les agences sans dossier restent hors groupe). Chrome demande l'autorisation quand vous l'activez ; la désactiver rend l'autorisation. Une recherche suivante reprend le groupe du dossier s'il est encore ouvert, même renommé, et le laisse comme vous l'avez laissé : un groupe que vous avez replié le reste (ses onglets se chargent quand même). **Replier les groupes après la recherche** les referme tous.
- **Sauvegarde et partage** : pour retrouver votre configuration après une réinstallation, ou la partager entre collègues.
  - **Exporter** l'enregistre dans un fichier `.json` : agences et leur ordre, dossiers, noms, adresses, repérages, pages de connexion, agences cochées, masquées et supprimées, langue, sous-domaine Pixpalace, groupes d'onglets — jamais vos recherches. Son format est décrit dans [`DEVELOPMENT.fr.md`](DEVELOPMENT.fr.md#fichier-de-configuration).
  - **Importer…** charge un tel fichier. Avant toute modification, vous choisissez :
    - **quoi** importer : **Agences** (agences ajoutées, agences fournies modifiées ou supprimées, ordre), **Cases cochées et agences masquées**, **Dossiers** (avec leurs couleurs et le rangement des agences), **Réglages** (langue, sous-domaine Pixpalace et groupes d'onglets, chacun décochable). En face de chacun, TabulaPix indique ce qui va changer chez vous (ex. « à ajouter : 2 (Magnum, Myop) · déjà présentes : 29 », « Langue : anglais → français ») ; si rien ne changerait, le bouton reste désactivé ;
    - **comment** : **Remplacer** — ce que vous cochez remplace le vôtre, le reste de votre configuration ne change pas (avec **Agences** coché, vos agences prennent les réglages du fichier — adresse, champ repéré… — et celles que vous aviez modifiées sont nommées avant de confirmer) (tout coché : le fichier remplace entièrement votre configuration, par exemple après une réinstallation) ; ou **Ajouter** — seul ce qui vous manque est ajouté, rien de chez vous n'est retiré ni modifié : les agences ajoutées du fichier que vous n'avez pas encore (celles que vous avez déjà, même adresse ou même site et même nom, restent telles quelles), les agences fournies que vous avez supprimées et que le fichier a encore, ses dossiers que vous n'avez pas (même nom), et vos agences hors dossier vont dans le dossier que leur donne le fichier. Idéal pour récupérer les agences d'un collègue. **Ajouter** est choisi par défaut.

    Chaque agence est vérifiée comme une agence ajoutée à la main ; les invalides sont ignorées. Depuis la popup, Importer ouvre TabulaPix dans un onglet (Chrome ferme la popup à l'ouverture du sélecteur de fichier).
  - Sites à autoriser : si le fichier contient des agences qui remplissent le champ de recherche de leur site, TabulaPix demande ces sites à Chrome tout de suite quand c'est possible ; sinon le bandeau, les pastilles « à autoriser » et **À régler** permettent de les autoriser à tout moment.
- **Agences retirées de la liste** : nomme les agences fournies supprimées ; **Restaurer** les fait revenir (affiché seulement s'il y en a).
- **Configuration d'usine** : **Rétablir la configuration d'usine** efface vos réglages, vos agences ajoutées, modifiées ou supprimées et les autorisations de sites accordées, et revient à la configuration livrée (après confirmation ; exportez d'abord si vous voulez garder la vôtre).

Ces réglages restent dans Chrome sur votre ordinateur et sont conservés lors des mises à jour.

## Confidentialité

- Aucune collecte de données, aucun mot de passe, aucun compte.
- Aucun appel réseau : l'extension se contente d'ouvrir des onglets (la politique de sécurité de l'extension interdit d'ailleurs toute requête : `connect-src 'none'`).
- Seules données enregistrées : la liste des agences cochées, leur ordre, les dossiers, les agences masquées, modifiées ou ajoutées (avec leur page de connexion), la dernière recherche lancée et vos options, stockés localement dans Chrome (`chrome.storage.local`), jamais transmis. Seule la dernière recherche est gardée (pas d'historique) ; elle disparaît en désinstallant l'extension.
- Pour la seule session du navigateur (`chrome.storage.session`, effacé à la fermeture de Chrome) : quels onglets appartiennent à quelle agence, et la recherche à relancer après une connexion.
- Permissions demandées :
  - `storage` : mémoriser les cases cochées ;
  - `sidePanel` : afficher TabulaPix dans la colonne de droite ;
  - `tabs` : voir les adresses des onglets ouverts, pour réutiliser celui d'une agence déjà ouverte au lieu d'en ouvrir un nouveau, et le titre de l'onglet d'une agence pour reconnaître une page affichée sans session (Sipa). Rien n'est gardé au-delà de la session du navigateur, rien n'est transmis. Chrome affiche pour cela l'avertissement « Consulter votre historique de navigation » ;
  - `tabGroups` (facultative) : ranger les onglets de chaque dossier dans un groupe d'onglets nommé. Demandée seulement quand vous activez l'option « Onglets » (Chrome affiche alors « Afficher et gérer vos groupes d'onglets »), rendue quand vous la désactivez ;
  - `scripting` + accès à un site, demandé site par site (fenêtre de Chrome) uniquement pour les agences dont il faut remplir le champ de recherche (Bloomberg, Abacapress, Pixpalace, Magnum…, ou une agence que vous ajoutez), et retiré quand vous la supprimez : uniquement pour taper les mots-clés dans le champ de recherche de ce site et cliquer sur le bouton. L'extension ne lit rien d'autre sur ces pages.
  - La copie des mots-clés pour les sites « coller » ne demande aucune autorisation : elle se fait au clic sur **Rechercher**.

À l'installation, Chrome n'annonce donc que « Consulter votre historique de navigation » (`tabs`).

Voir aussi la [politique de confidentialité](PRIVACY.md).

## Sécurité

- Les agences fournies viennent de `config.js`, livré avec l'extension, et les agences ajoutées de vos réglages : rien n'est téléchargé.
- Le script d'arrière-plan n'accepte que les demandes de sa propre popup, et n'ouvre que des adresses `https` correspondant au site déclaré pour chaque agence (y compris les agences ajoutées, dont l'adresse est vérifiée à l'ajout puis à chaque lecture).
- Avant de remplir un champ, il vérifie que l'onglet est toujours sur le site de l'agence.
- Repérage d'un champ sur un site ajouté : le bandeau n'est affiché que dans l'onglet ouvert pour ce repérage ; le résultat n'est accepté que de cet onglet, sur ce site, et ne contient que l'emplacement du champ et du bouton (aucun contenu de la page n'est lu ni conservé).
- Les mots-clés sont insérés comme du texte (jamais comme du code) et encodés dans les adresses.
- Mises à jour : la version du Chrome Web Store se met à jour automatiquement, après examen de chaque version par Google. La version installée manuellement ne se met jamais à jour toute seule : ne remplacez son dossier que par une version venant de ce dépôt. Protégez le compte GitHub par la double authentification.

## Idées

Les pistes envisagées pour de futures versions (sélections enregistrées, coffre chiffré des identifiants d'agence) sont listées dans [`ROADMAP.fr.md`](ROADMAP.fr.md).

## Développement

Organisation du dépôt, modification des agences fournies, format du fichier de configuration, icône, numéros de version et publication : voir [`DEVELOPMENT.fr.md`](DEVELOPMENT.fr.md). L'historique des versions est dans [`CHANGELOG.fr.md`](CHANGELOG.fr.md).

## Licence

TabulaPix est distribué sous **licence MIT** (voir le fichier [`LICENSE`](LICENSE)) : vous pouvez l'utiliser, le modifier et le partager librement, à condition de conserver la mention de l'auteur et de la licence. Le logiciel est fourni « tel quel », sans garantie.

TabulaPix est un outil indépendant, sans lien avec les agences citées. Les noms AFP, Reuters, Getty Images, Sipa, Shutterstock, Adobe Stock, Abacapress, Rea, Pixpalace, MaxPPP, Bloomberg et les autres sont des marques de leurs propriétaires respectifs.
