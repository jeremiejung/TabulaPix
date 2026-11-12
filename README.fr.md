# TabulaPix

*[English](README.md) · **Français***

**Une recherche, toutes vos agences photo.**

**➜ [Installer depuis le Chrome Web Store](https://chromewebstore.google.com/detail/gdggcpmgjoaobfjlnbfmgfnjfgodgikp)**

Extension Chrome pour les services photo, iconographes et éditeurs photo : tapez vos mots-clés une fois et cherchez sur toutes vos agences photo en même temps. TabulaPix ouvre un onglet par agence, résultats prêts, avec vos propres comptes. Aucun scraping, aucune clé d'API, aucun mot de passe enregistré. Interface en français et en anglais.

Tout se règle depuis l'extension (bouton ⚙), sans modifier de fichier : agences affichées, ordre, agences ajoutées avec détection automatique, adresses et repérages modifiables, langue, sous-domaine Pixpalace. Les agences cochées et leur ordre sont mémorisés d'une utilisation à l'autre.

Extension Chrome (Manifest V3) en HTML/JavaScript simple : aucune dépendance, aucune compilation.

## Installation

**Le plus simple : [installer TabulaPix depuis le Chrome Web Store](https://chromewebstore.google.com/detail/gdggcpmgjoaobfjlnbfmgfnjfgodgikp)**, puis épingler l'extension (icône puzzle 🧩 → épingle à côté de **TabulaPix**). Les mises à jour arrivent ensuite automatiquement.

> Si vous utilisiez jusqu'ici la version chargée depuis un dossier, Chrome considère la version du store comme une autre extension : vos réglages (agences cochées, ordre, agences ajoutées, sous-domaine Pixpalace) ne sont pas repris. Notez-les, installez la version du store, refaites-les, puis supprimez l'ancienne version dans `chrome://extensions` pour ne pas avoir TabulaPix en double.

**Installation manuelle** (version de développement, depuis ce dépôt) :

1. Téléchargez ce dépôt (bouton **Code → Download ZIP** sur GitHub) et décompressez-le, ou clonez-le avec `git clone`.
2. Dans Chrome, ouvrez `chrome://extensions`.
3. Activez le **Mode développeur** (interrupteur en haut à droite).
4. Cliquez sur **Charger l'extension non empaquetée** et choisissez le dossier `extension` du dépôt.
5. Épinglez l'extension : icône puzzle 🧩 dans la barre d'outils → épingle à côté de **TabulaPix**.
6. Réglez vos **options** (bouton ⚙ de la popup) : notamment le sous-domaine de votre espace Pixpalace (voir « Options » ci-dessous).

Fonctionne aussi dans les navigateurs basés sur Chromium (Edge, Brave, Arc…) via leur page d'extensions équivalente.

> **Ne déplacez pas, ne renommez pas et ne supprimez pas le dossier après l'installation.** Chrome lit l'extension directement dans ce dossier : s'il change de place, l'extension ne se charge plus (elle est désactivée, avec une erreur dans `chrome://extensions`).
> Choisissez donc un emplacement durable avant d'installer (par exemple `Documents/TabulaPix`), pas le dossier Téléchargements ni le Bureau.
> Si le dossier a été déplacé : supprimez TabulaPix dans `chrome://extensions`, puis refaites l'étape 4 en choisissant le dossier `extension` à son nouvel emplacement. Chrome la considère alors comme une nouvelle extension : les agences cochées et leur ordre sont à refaire.

## Mettre à jour une version installée manuellement

(La version du Chrome Web Store se met à jour toute seule.)

1. Téléchargez la nouvelle version (bouton **Code → Download ZIP**) et décompressez-la.
2. Copiez le **contenu** de son dossier `extension` dans le dossier `extension` déjà installé, en remplaçant les fichiers existants. Gardez le même dossier, au même endroit : c'est ce qui conserve vos agences cochées et leur ordre.
3. Dans `chrome://extensions`, cliquez sur le bouton **↻** (recharger) de la carte TabulaPix.
4. Si Chrome affiche un avertissement sur de nouvelles autorisations, acceptez-le : la section « Confidentialité » ci-dessous explique chacune.

Si vous avez installé avec `git clone` : `git pull` dans le dossier du dépôt, puis **↻** dans `chrome://extensions`.

Si vous aviez modifié `config.js`, notez vos changements avant de remplacer les fichiers, puis reportez-les dans le nouveau `config.js`.

## Utilisation

1. Cliquez sur l'icône TabulaPix, ou appuyez sur **Alt + Maj + Y** (raccourci modifiable dans `chrome://extensions/shortcuts`).
2. Tapez vos mots-clés, cochez les agences voulues (boutons **Tout** / **Aucune** pour aller vite).
   Les **dossiers** regroupent les agences, chacun dans sa couleur. À l'installation, les agences arrivent rangées dans six dossiers : Actualité, Reportage & auteurs, Agrégateurs, People, Stock et Archives (seuls Actualité, Reportage et Agrégateurs sont cochés) ; à vous de les renommer, recolorer, réordonner ou supprimer. La case d'un dossier coche ou décoche toutes ses agences d'un coup ; elle est à moitié cochée quand seules certaines le sont (le compteur indique combien). Un clic sur le titre d'un dossier (ou sur **›**) le replie ou le déplie, sans rien cocher. Les onglets s'ouvrent dans l'ordre de la liste.

   **Réordonner à tout moment** : au survol d'une agence ou d'un dossier, sa poignée apparaît (à droite) ; faites-la glisser entre deux agences, ou sur le titre d'un dossier (surligné) pour y ranger une agence. Au clavier, **Alt + ↑ / ↓** sur une case fait de même.
3. Appuyez sur **Entrée** ou **Lancer la recherche**, juste sous les mots-clés : un onglet s'ouvre par agence (le bouton indique combien).
   Les onglets s'ouvrent en arrière-plan : vous restez sur l'onglet où vous êtes.
   Les derniers mots-clés lancés sont réaffichés (déjà sélectionnés) à la prochaine ouverture : tapez directement pour les remplacer.
   Si un onglet est déjà ouvert sur le site d'une agence (par exemple après une recherche précédente), il est réutilisé : la nouvelle recherche s'y affiche au lieu d'ouvrir un onglet de plus.

**Garder ouvert :** le bouton **colonne** (première icône en haut de la popup) affiche TabulaPix dans une colonne à droite de la fenêtre (panneau latéral de Chrome, version 116 ou plus récente). La colonne reste ouverte quand vous changez d'onglet ; vous pouvez enchaîner les recherches sans rouvrir l'extension. Tant que la colonne est ouverte, l'icône TabulaPix de la barre d'outils agit sur la colonne (elle n'ouvre pas de popup par-dessus) ; une fois la colonne fermée, l'icône rouvre la popup. Pour la fermer : la croix en haut de la colonne. Elle se rouvre aussi depuis l'icône « panneau latéral » de Chrome.

Pour certaines agences (Bloomberg, Abacapress, Pixpalace, Hans Lucas, Myop, Signatures, Vu', Bestimage, Bureau 233, Phototele, Starface), l'adresse ne peut pas contenir la recherche : l'extension ouvre la page, tape vos mots-clés dans le champ de recherche et clique sur le bouton à votre place (comptez une ou deux secondes de plus). Hormis Bloomberg, Abacapress et Pixpalace, Chrome demande une fois l'autorisation pour le site : quand vous cochez une de ces agences, une pastille « à autoriser » et un bandeau proposent de l'autoriser.

Si une agence ajoutée plus tard n'a ni adresse avec `{q}` ni remplissage automatique, elle est marquée **« coller »** : la page s'ouvre et vos mots-clés sont copiés dans le presse-papiers, il suffit de faire **Ctrl+V** (ou **Cmd+V**) dans le champ de recherche.

Vous devez être connecté à vos comptes agences dans Chrome, comme d'habitude : l'extension ne fait qu'ouvrir des onglets.

## Mode Organiser

Le bouton **Organiser** en haut (icône liste, à côté du bouton colonne) passe en mode **Organiser** (**Échap** ou **Terminé** pour en sortir ; le champ et le bouton de recherche, ainsi que Tout / Aucune, sont désactivés pendant ce temps, pour ne pas y rester par mégarde). En usage courant, la liste ne montre que les noms et les cases (et permet de les réordonner) ; tout le reste de ce qui concerne les agences et les dossiers se fait ici, directement dans la liste.

- **Ordre et dossiers** : comme hors de ce mode, et une agence se glisse aussi par son nom : faites-la glisser par son nom ou sa poignée (à droite) entre deux agences, ou sur le titre d'un dossier (surligné) pour l'y ranger ; faites glisser un dossier par sa poignée pour le déplacer. Un glisser annulé avec Échap ne change rien. Au clavier, **Alt + ↑ / ↓** sur la case d'une agence la déplace (et la fait passer dans le dossier voisin au bord), sur la case d'un dossier déplace le dossier.
- **Dossiers** : renommez un dossier directement dans son titre, changez sa couleur avec sa pastille, supprimez-le avec la corbeille (ses agences sont conservées, hors dossier ; **Annuler** pendant quelques secondes), créez-en un en bas de la liste.
- **Agences**, sur chaque ligne :
  - **œil** : masque l'agence (elle disparaît de la liste, sa place est conservée) ou la réaffiche ; les agences masquées n'apparaissent, grisées, qu'en mode Organiser.
    - **Reuters** existe en deux versions, selon votre contrat : **Reuters (points)** pour les comptes au crédit de points (affiche le solde), visible par défaut, et **Reuters (standard)** pour les comptes sans points (téléchargement libre), masquée par défaut : affichez celle qui correspond à votre compte avec son œil. **AFP (forum)** est aussi masquée par défaut.
  - **crayon** : modifie l'agence (voir plus bas) ;
  - **corbeille** : supprime n'importe quelle agence, y compris celles fournies, tout de suite ; une ligne **Annuler** prend sa place quelques secondes (les agences fournies supprimées se récupèrent aussi plus tard dans ⚙ avec **Restaurer**).
- **+ Ajouter une agence**, en bas de la liste, ouvre l'écran d'ajout (**← Retour** revient à la liste).

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

- **Modifier une agence** (son crayon) : même écran, directement sur le formulaire (nom, dossier, adresse), avec **Enregistrer**. Si le site a changé, **Re-détecter l'adresse depuis le site** (replié, en bas) relance la détection à partir d'une page de résultats ; pour une agence ajoutée qui remplit un champ, le repérage est gardé si les mots-clés ne sont toujours pas dans l'adresse. Toutes les agences peuvent être renommées, y compris celles fournies ; pour celles-ci, **Rétablir l'original** revient au nom et aux réglages livrés.
  - **Bloomberg, Abacapress et Pixpalace** remplissent le champ de recherche de leur site : si l'un d'eux change sa page et que la recherche ne part plus, ouvrez son crayon puis **Refaire le repérage** pour lui montrer à nouveau le champ et le bouton (aucune autorisation supplémentaire n'est demandée ; le délai propre à Bloomberg est conservé). Comme toute agence, elles peuvent aussi être re-détectées, passer à une adresse de recherche (**Utiliser plutôt une adresse de recherche**) ou changer de site (le champ est alors repéré sur ce site, avec l'autorisation de Chrome pour celui-ci) ; **Rétablir l'original** revient au fonctionnement livré.
## Options

Le bouton **⚙** en haut affiche les réglages directement dans la popup ; **← Retour** (ou Échap) revient à la recherche. Pas de bouton Enregistrer : chaque réglage est enregistré dès qu'on quitte le champ ou qu'on appuie sur Entrée, avec un bref « ✓ Enregistré » à côté.

- **À régler** (en haut, seulement si besoin) : liste les agences ajoutées ou importées dont Chrome n'a pas encore autorisé le site, avec un bouton **Autoriser ces sites**.

- **Langue** : français ou anglais. Par défaut, TabulaPix suit la langue du navigateur (« Automatique ») ; le changement s'applique immédiatement. Le nom et la description affichés dans `chrome://extensions` et sur le Chrome Web Store suivent toujours la langue du navigateur.
- **Pixpalace** › **Sous-domaine** : la partie avant `.pixpalace.com` dans l'adresse de votre espace Pixpalace (par défaut `www`). Par exemple, pour `https://maredaction.pixpalace.com/home`, saisissez `maredaction`. Une valeur invalide est signalée sous le champ et n'est pas enregistrée.
- **Accès rapide** : affiche le raccourci clavier qui ouvre TabulaPix (Alt + Maj + Y par défaut), avec un lien pour le changer, et rappelle que le bouton colonne garde TabulaPix ouvert à côté de la page.
- **Sauvegarde et partage** : **Exporter** enregistre toute votre configuration dans un fichier `.json` (agences et leur ordre, noms, adresses, repérages, agences cochées, masquées et supprimées, langue, sous-domaine Pixpalace — jamais vos recherches). **Importer…** recharge un tel fichier, après une confirmation bien signalée (votre configuration actuelle est entièrement remplacée) qui détaille le contenu du fichier — agences, dossiers, agences cochées : après une réinstallation, ou pour partager une configuration entre collègues. Chaque agence du fichier est vérifiée comme une agence ajoutée à la main ; les invalides sont ignorées. Si le fichier contient des agences qui remplissent le champ de recherche de leur site, TabulaPix demande ces sites à Chrome tout de suite quand c'est possible (Chrome ne l'accepte que peu après un clic) ; sinon, et tant qu'un site n'est pas autorisé (autorisation refusée, ou retirée dans Chrome), un bandeau au-dessus de la liste, une pastille « à autoriser » sur l'agence et le bouton **Autoriser ces sites** sous « À régler » dans les options permettent de l'autoriser à tout moment. Depuis la popup, Importer ouvre TabulaPix dans un onglet (Chrome ferme la popup à l'ouverture du sélecteur de fichier).
- **Agences retirées de la liste** : nomme les agences fournies supprimées ; **Restaurer** les fait revenir (affiché seulement s'il y en a).
- **Configuration d'usine** : **Rétablir la configuration d'usine** efface vos réglages, vos agences ajoutées, modifiées ou supprimées et les autorisations de sites accordées, et revient à la configuration livrée (après confirmation ; exportez d'abord si vous voulez garder la vôtre).

Ces réglages restent dans Chrome sur votre ordinateur et sont conservés lors des mises à jour.

## Fichier de configuration

Le fichier créé par **Exporter** est du JSON lisible et modifiable :

```json
{
  "format": "tabulapix-config",
  "formatVersion": 2,
  "minReaderVersion": 1,
  "exportedAt": "2026-11-06T10:00:00.000Z",
  "app": { "name": "TabulaPix", "version": "3.4.1" },
  "settings": { "language": "auto", "options": { "pixpalaceSubdomain": "www" } },
  "folders": [{ "id": "f-wire", "name": "Agences filaires", "color": "blue" }],
  "agencies": [
    { "id": "reuters", "builtin": true, "name": "Reuters (points)", "folder": "f-wire", "checked": true, "hidden": false },
    { "id": "custom-abc123", "builtin": false, "name": "Alamy", "url": "https://www.alamy.com/search.html?qt={q}", "checked": true, "hidden": false }
  ],
  "removedBuiltins": ["afp-forum"]
}
```

- `agencies` suit l'ordre de la liste. Les agences fournies ne portent `name`, `url`, `payload`, `encode` ou `fill` que si elles ont été modifiées ; les agences ajoutées portent toujours leur adresse (et `fill` quand elles remplissent un champ de recherche).
- **Compatibilité entre versions** : une nouvelle version ne fait qu'*ajouter* des champs facultatifs, jamais changer le sens d'un champ existant (`formatVersion` augmente). Une version plus récente de TabulaPix lit donc les anciens fichiers (les champs absents prennent leur valeur par défaut), et une version plus ancienne lit les fichiers plus récents en ignorant ce qu'elle ne connaît pas encore (le récapitulatif d'import le signale ; les agences fournies qu'elle ne connaît pas sont comptées à part). Seul un changement incompatible, à éviter, augmenterait `minReaderVersion` : une version plus ancienne refuse alors le fichier et demande une mise à jour.
- **Dossiers** (`folders: [{ "id", "name", "color", "collapsed" }]`, et un champ `folder` sur chaque agence) : exportés et importés avec le reste, y compris la couleur de chaque dossier (`blue`, `teal`, `green`, `amber`, `orange`, `red`, `pink`, `violet`, `gray`) et son état replié. La case d'un dossier n'est pas enregistrée : elle se déduit de ses agences. Une version plus ancienne qui n'affiche pas les dossiers les conserve et les réécrit : rien n'est perdu quand des collègues aux versions différentes s'échangent des fichiers (les autres champs qu'une version future ajouterait sont ignorés).

## Modifier les agences fournies (développement)

Tout se trouve dans **`extension/config.js`**. Chaque agence a un nom et une adresse où le mot-clé est remplacé par `{q}` :

```js
{
  id: "getty-actu",
  name: "Getty Actu",
  url: "https://www.gettyimages.fr/search/2/image?family=editorial&phrase={q}"
}
```

Pour qu'une agence soit décochée lors d'une première installation, ajoutez-lui `defaultChecked: false` ; pour qu'elle soit masquée (à réafficher avec son œil en mode Organiser), `defaultHidden: true` — appliqué la première fois que l'agence apparaît, y compris lors d'une mise à jour (c'est le cas d'AFP (forum) et de Reuters (standard)). Les dossiers sont déclarés dans `FOLDERS` (`id` fixe, noms en français et en anglais, couleur) et chaque agence indique le sien (`folder`). À une première installation, ou à la première ouverture de cette version chez un utilisateur qui n'a encore créé aucun dossier, les dossiers livrés sont créés et les agences y sont rangées (cases, agences masquées, noms et ordre relatif sont conservés ; les agences ajoutées restent hors dossier). Ensuite, les dossiers appartiennent à l'utilisateur : une mise à jour n'en crée, n'en renomme ni n'en supprime aucun. Une nouvelle agence fournie va dans son dossier si l'utilisateur l'a encore (même renommé), sinon hors dossier ; chez les utilisateurs existants, elle arrive décochée, en fin de liste. Un import respecte le fichier tel quel. Si un utilisateur avait déjà ajouté la même agence à la main (même adresse, paramètres compris hors mots-clés, ou même site et même nom), la sienne est gardée et celle fournie est mise de côté comme une agence supprimée (**Restaurer** dans les options la fait revenir).

Astuce pour trouver l'adresse : faites une recherche sur le site avec des mots faciles à repérer (ex. `midterms texas democrats`), copiez l'URL de la page de résultats et remplacez les mots par `{q}`. Selon le site, les espaces y apparaissent sous la forme `%20` ou `+` : remplacez l'ensemble, séparateurs compris.

Les valeurs propres à une rédaction ne s'écrivent pas en dur : elles passent par une option, insérée dans l'adresse avec `{opt:nom}` (voir `OPTIONS` en bas de `config.js`).

Certains sites (AFP news, Sipa, Rea) « emballent » la recherche dans l'URL (hexadécimal, ou gzip + base64). Pour eux, on décrit le contenu dans `payload` et les étapes d'encodage dans `encode` — voir les commentaires en tête de `config.js`.

Pour les sites dont l'adresse ne peut pas contenir la recherche, on indique plutôt le champ à remplir et le bouton à cliquer (`fill`), sous forme de sélecteurs CSS. Un tel site a besoin de l'autorisation de Chrome : soit il figure dans `host_permissions` du fichier `extension/manifest.json` (accordé à l'installation, mais en ajouter un désactive l'extension chez les utilisateurs existants jusqu'à ce qu'ils l'acceptent), soit — préférable — l'utilisateur l'autorise à la demande : une pastille « à autoriser » apparaît quand l'agence est cochée.

Après toute modification : `chrome://extensions` → bouton **↻** (recharger) sur TabulaPix.

## Icône

Un curseur de texte dans un cadre arrondi à fond blanc (lisible en thème sombre), avec une loupe rouge en bas à droite. Sources dans `extension/icons/` : `icon.svg` (32 à 128 px) et `icon-16.svg`, une version simplifiée dessinée pour 16 px. Les PNG `icon-16/32/48/128.png` en sont l'export à taille réelle. Pour modifier l'icône, éditez les SVG puis réexportez-les aux mêmes tailles, sur fond transparent.

## Confidentialité

- Aucune collecte de données, aucun mot de passe, aucun compte.
- Aucun appel réseau : l'extension se contente d'ouvrir des onglets (la politique de sécurité de l'extension interdit d'ailleurs toute requête : `connect-src 'none'`).
- Seules données enregistrées : la liste des agences cochées, leur ordre, les agences masquées, modifiées ou ajoutées, la dernière recherche lancée et vos options, stockés localement dans Chrome (`chrome.storage.local`), jamais transmis. Seule la dernière recherche est gardée (pas d'historique) ; elle disparaît en désinstallant l'extension.
- Permissions demandées :
  - `storage` : mémoriser les cases cochées ;
  - `clipboardWrite` : copier les mots-clés pour les sites « coller » ;
  - `sidePanel` : afficher TabulaPix dans la colonne de droite.
  - `tabs` : voir les adresses des onglets ouverts, pour réutiliser celui d'une agence déjà ouverte au lieu d'en ouvrir un nouveau. Rien n'est enregistré ni transmis. Chrome affiche pour cela l'avertissement « Lire votre historique de navigation ».
  - accès à un site supplémentaire, demandé au cas par cas (fenêtre de Chrome) uniquement quand vous ajoutez une agence de type « Remplir le champ de recherche du site », et retiré quand vous la supprimez ;
  - `scripting` + accès à `mercury.bloomberg.com`, `search.abacapress.com` et `*.pixpalace.com` : uniquement pour taper les mots-clés dans le champ de recherche de ces trois sites et cliquer sur le bouton. L'extension ne lit rien d'autre sur ces pages. Chrome affichera pour cela un avertissement « lire et modifier vos données sur ces sites ».

Voir aussi la [politique de confidentialité](PRIVACY.md).

## Sécurité

- Les agences fournies viennent de `config.js`, livré avec l'extension, et les agences ajoutées de vos réglages : rien n'est téléchargé.
- Le script d'arrière-plan n'accepte que les demandes de sa propre popup, et n'ouvre que des adresses `https` correspondant au site déclaré pour chaque agence (y compris les agences ajoutées, dont l'adresse est vérifiée à l'ajout puis à chaque lecture).
- Avant de remplir un champ, il vérifie que l'onglet est toujours sur le site de l'agence.
- Repérage d'un champ sur un site ajouté : le bandeau n'est affiché que dans l'onglet ouvert pour ce repérage ; le résultat n'est accepté que de cet onglet, sur ce site, et ne contient que l'emplacement du champ et du bouton (aucun contenu de la page n'est lu ni conservé).
- Les mots-clés sont insérés comme du texte (jamais comme du code) et encodés dans les adresses.
- Mises à jour : la version du Chrome Web Store se met à jour automatiquement, après examen de chaque version par Google. La version installée manuellement ne se met jamais à jour toute seule : ne remplacez son dossier que par une version venant de ce dépôt. Protégez le compte GitHub par la double authentification.

## Numéros de version

Le numéro de version (`version` dans `extension/manifest.json`) ne change **qu'au moment d'un envoi au Chrome Web Store**, une seule fois par envoi, quel que soit le nombre de modifications intégrées entre-temps :

- **correction** : dernier chiffre (3.2.0 → 3.2.1) ;
- **nouveauté** : chiffre du milieu (3.2.x → 3.3.0) ;
- **changement majeur** : premier chiffre.

Le store refuse un numéro inférieur ou égal à la version publiée : on ne peut jamais revenir en arrière.

L'historique des versions est tenu dans [`CHANGELOG.fr.md`](CHANGELOG.fr.md).

## Chrome Web Store

Les éléments de la fiche (descriptions, justifications des autorisations, instructions pour l'examen) sont dans [`store/fiche-chrome-web-store.md`](store/fiche-chrome-web-store.md), les captures d'écran et la tuile promotionnelle dans [`store/images/`](store/images/), et la politique de confidentialité dans [`PRIVACY.md`](PRIVACY.md).

## Licence

TabulaPix est distribué sous **licence MIT** (voir le fichier [`LICENSE`](LICENSE)) : vous pouvez l'utiliser, le modifier et le partager librement, à condition de conserver la mention de l'auteur et de la licence. Le logiciel est fourni « tel quel », sans garantie.

TabulaPix est un outil indépendant, sans lien avec les agences citées. Les noms AFP, Reuters, Getty Images, Sipa, Shutterstock, Adobe Stock, Abacapress, Rea, Pixpalace, MaxPPP, Bloomberg et les autres sont des marques de leurs propriétaires respectifs.
