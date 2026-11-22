# Développer TabulaPix

*[English](DEVELOPMENT.md) · **Français***

Pour travailler sur le code de l'extension : agences fournies, format du fichier de configuration, icône, versions et publication. L'utilisation de TabulaPix est décrite dans le [README](README.fr.md).

## Organisation du dépôt

TabulaPix est une extension Chrome (Manifest V3) en HTML/JavaScript simple : aucune dépendance, aucune compilation. Le dossier `extension/` est chargé tel quel par Chrome.

- `extension/manifest.json` : nom, version, autorisations.
- `extension/config.js` : agences fournies (`AGENCIES`), dossiers livrés (`FOLDERS`) et options propres à une rédaction (`OPTIONS`) ; les champs sont décrits dans les commentaires en tête du fichier.
- `extension/popup.html`, `popup.js`, `popup.css` : l'interface (popup et colonne latérale), éditeur et options compris.
- `extension/background.js` : ouverture des onglets, remplissage des champs de recherche, bandeau de repérage, connexion aux agences, groupes d'onglets.
- `extension/shared.js` : partagé par les deux (vérification des agences, modifications appliquées aux agences fournies, fichier de configuration).
- `extension/detect.js` : détection d'une adresse de recherche à partir d'une page de résultats, faite localement.
- `extension/i18n.js` : textes de l'interface en français et en anglais (mêmes clés dans les deux langues) ; `extension/_locales/` : nom et description affichés par Chrome.
- `extension/icons/` : icônes (sources SVG et exports PNG).
- `store/` : éléments de la fiche du Chrome Web Store.
- Documentation, en anglais et en français : `README`, `CHANGELOG` (toujours un titre **[Non publié]** en tête), `ROADMAP`, ce fichier ; politique de confidentialité dans `PRIVACY.md`.

Pour essayer une modification : chargez le dossier `extension` avec **Charger l'extension non empaquetée** dans `chrome://extensions`, puis **↻** sur la carte TabulaPix après chaque modification.

## Fichier de configuration

Le fichier créé par **Exporter** est du JSON lisible et modifiable :

```json
{
  "format": "tabulapix-config",
  "formatVersion": 4,
  "minReaderVersion": 1,
  "exportedAt": "2026-11-06T10:00:00.000Z",
  "app": { "name": "TabulaPix", "version": "3.6.7" },
  "settings": { "language": "auto", "options": { "pixpalaceSubdomain": "www" } },
  "folders": [{ "id": "f-wire", "name": "Agences filaires", "color": "blue" }],
  "agencies": [
    { "id": "reuters", "builtin": true, "name": "Reuters (points)", "folder": "f-wire", "checked": true, "hidden": false },
    { "id": "custom-abc123", "builtin": false, "name": "Alamy", "url": "https://www.alamy.com/search.html?qt={q}", "checked": true, "hidden": false }
  ],
  "removedBuiltins": ["afp-forum"]
}
```

- `agencies` suit l'ordre de la liste. Les agences fournies ne portent `name`, `url`, `payload`, `encode`, `fill` ou `login` que si elles ont été modifiées (`login` : page de connexion, `false` si celle livrée a été retirée) ; les agences ajoutées portent toujours leur adresse (et `fill` quand elles remplissent un champ de recherche, `login` quand elles ont une page de connexion).
- **Compatibilité entre versions** : une nouvelle version ne fait qu'*ajouter* des champs facultatifs, jamais changer le sens d'un champ existant (`formatVersion` augmente). Une version plus récente de TabulaPix lit donc les anciens fichiers (les champs absents prennent leur valeur par défaut), et une version plus ancienne lit les fichiers plus récents en ignorant ce qu'elle ne connaît pas encore (le récapitulatif d'import le signale ; les agences fournies qu'elle ne connaît pas sont comptées à part). Seul un changement incompatible, à éviter, augmenterait `minReaderVersion` : une version plus ancienne refuse alors le fichier et demande une mise à jour.
- **Dossiers** (`folders: [{ "id", "name", "color", "collapsed", "hidden" }]`, et un champ `folder` sur chaque agence) : exportés et importés avec le reste, y compris la couleur de chaque dossier (`blue`, `teal`, `green`, `amber`, `orange`, `red`, `pink`, `violet`, `gray`) son état replié et s'il est masqué. La case d'un dossier n'est pas enregistrée : elle se déduit de ses agences.

## Modifier les agences fournies

Tout se trouve dans **`extension/config.js`**. Chaque agence a un nom et une adresse où le mot-clé est remplacé par `{q}` :

```js
{
  id: "getty-actu",
  name: "Getty Actu",
  url: "https://www.gettyimages.fr/search/2/image?family=editorial&phrase={q}"
}
```

Champs facultatifs :

- `defaultChecked: false` : décochée lors d'une première installation. `defaultHidden: true` : masquée (à réafficher avec son œil en mode Organiser), appliqué la première fois que l'agence apparaît, y compris lors d'une mise à jour (AFP (forum), Reuters (standard)).
- `folder` : son dossier, parmi ceux déclarés dans `FOLDERS` (`id` fixe, noms en français et en anglais, couleur). Les dossiers livrés sont créés à une première installation (ou chez un utilisateur qui n'a encore aucun dossier) ; ensuite, ils appartiennent à l'utilisateur : une mise à jour n'en crée, n'en renomme ni n'en supprime aucun.
- `login` : sa page de connexion (l'icône **Se connecter**) et, avec elle, `loggedOutTitle` : le titre exact de l'onglet quand une recherche s'affiche sans session (Sipa : `Sipa Press`). TabulaPix ouvre alors la page de connexion dans cet onglet et relance la recherche une fois l'utilisateur connecté.

Une nouvelle agence fournie va dans son dossier si l'utilisateur l'a encore (même renommé), sinon hors dossier ; chez les utilisateurs existants, elle arrive décochée, en fin de liste, avec une pastille « Nouveau » pendant cinq ouvertures (jusqu'à ce qu'on la coche ou la déplace). Si un utilisateur avait déjà ajouté la même agence à la main (même adresse, paramètres compris hors mots-clés, ou même site et même nom), la sienne est gardée et celle fournie est mise de côté comme une agence supprimée (**Restaurer** dans les options la fait revenir). Un import respecte le fichier tel quel.

Astuce pour trouver l'adresse : faites une recherche sur le site avec des mots faciles à repérer (ex. `midterms texas democrats`), copiez l'URL de la page de résultats et remplacez les mots par `{q}`. Selon le site, les espaces y apparaissent sous la forme `%20` ou `+` : remplacez l'ensemble, séparateurs compris.

Les valeurs propres à une rédaction ne s'écrivent pas en dur : elles passent par une option, insérée dans l'adresse avec `{opt:nom}` (voir `OPTIONS` en bas de `config.js`).

Certains sites (AFP news, Sipa, Rea, AgencesONline, Gamma-Rapho) « emballent » la recherche dans l'URL (hexadécimal, ou gzip + base64). Pour eux, on décrit le contenu dans `payload` et les étapes d'encodage dans `encode` — voir les commentaires en tête de `config.js`.

Pour les sites dont l'adresse ne peut pas contenir la recherche, on indique plutôt le champ à remplir et le bouton à cliquer (`fill`), sous forme de sélecteurs CSS. Un tel site a besoin de l'autorisation de Chrome, que l'utilisateur accorde à la demande : une pastille « à autoriser » apparaît quand l'agence est cochée. Ne pas l'ajouter aux `host_permissions` du fichier `extension/manifest.json` : Chrome l'annoncerait à l'installation, et en ajouter un désactive l'extension chez les utilisateurs existants jusqu'à ce qu'ils l'acceptent.

Après toute modification : `chrome://extensions` → bouton **↻** (recharger) sur TabulaPix.

## Icône

Un curseur de texte dans un cadre arrondi à fond blanc (lisible en thème sombre), avec une loupe rouge en bas à droite. Sources dans `extension/icons/` : `icon.svg` (32 à 128 px) et `icon-16.svg`, une version simplifiée dessinée pour 16 px. Les PNG `icon-16/32/48/128.png` en sont l'export à taille réelle. Pour modifier l'icône, éditez les SVG puis réexportez-les aux mêmes tailles, sur fond transparent.

## Numéros de version

Le numéro de version (`version` dans `extension/manifest.json`) ne change **qu'au moment d'un envoi au Chrome Web Store**, une seule fois par envoi, quel que soit le nombre de modifications intégrées entre-temps :

- **correction ou amélioration** : dernier chiffre (3.2.0 → 3.2.1) ;
- **nouveauté** : chiffre du milieu (3.2.x → 3.3.0) ;
- **changement majeur** : premier chiffre.

Le store refuse un numéro inférieur ou égal à la version publiée : on ne peut jamais revenir en arrière.

L'historique des versions est tenu dans [`CHANGELOG.fr.md`](CHANGELOG.fr.md).

## Chrome Web Store

Les éléments de la fiche (descriptions, justifications des autorisations, instructions pour l'examen) sont dans [`store/fiche-chrome-web-store.md`](store/fiche-chrome-web-store.md), les captures d'écran et la tuile promotionnelle dans [`store/images/`](store/images/), et la politique de confidentialité dans [`PRIVACY.md`](PRIVACY.md). Ne jamais citer de noms d'agences dans les descriptions du store.

## Publier une version

1. Choisissez le numéro (voir « Numéros de version ») et inscrivez-le dans `extension/manifest.json`.
2. Dans `CHANGELOG.md` et `CHANGELOG.fr.md`, ajoutez le titre de la version (numéro, date, « Chrome Web Store ») sous **[Non publié]**, qui reste en tête, vide.
3. Mettez à jour la version dans l'exemple de fichier de configuration (« Fichier de configuration » plus haut) et le nom du paquet dans `store/fiche-chrome-web-store.md`.
4. Fabriquez le paquet depuis le dossier `extension`, sans les sources SVG (15 fichiers) :

   ```bash
   cd extension && zip -q -X -D -r ../TabulaPix-X.Y.Z.zip . -x '*.svg'
   ```

   Les fichiers `.zip` sont ignorés par git (`.gitignore`).
5. Chargez le paquet décompressé dans Chrome et essayez-le, puis envoyez-le au Chrome Web Store. Si les autorisations ont changé, mettez à jour leurs justifications dans la console développeur (textes dans le fichier de la fiche).
6. Sur GitHub, publiez une release `vX.Y.Z` avec le paquet en pièce jointe.
