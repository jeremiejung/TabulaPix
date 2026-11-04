# wireSweep
Chrome extension for photo editors: type your keywords once and search all your news picture agencies at the same time (AFP, Reuters, Getty, Sipa, Abaca, MaxPPP, PixPalace…). Opens one tab per agency with results ready, using your own logged-in accounts. No scraping, no API keys, no passwords stored.

---

## Wire Sweep (en français)

Extension Chrome (Manifest V3) : vous tapez vos mots-clés une fois, cochez les agences, et Wire Sweep ouvre un onglet par agence avec la recherche déjà lancée. Les agences cochées sont mémorisées d'une utilisation à l'autre.

HTML/JavaScript simple : aucune dépendance, aucune compilation.

### Installation

1. Téléchargez ce dépôt (bouton **Code → Download ZIP** sur GitHub) et décompressez-le, ou clonez-le avec `git clone`.
2. Dans Chrome, ouvrez `chrome://extensions`.
3. Activez le **Mode développeur** (interrupteur en haut à droite).
4. Cliquez sur **Charger l'extension non empaquetée** et choisissez le dossier `extension` du dépôt.
5. Épinglez l'extension : icône puzzle 🧩 dans la barre d'outils → épingle à côté de **Wire Sweep**.
6. Réglez vos **options** (bouton ⚙ de la popup) : notamment le sous-domaine de votre espace Pixpalace (voir « Options » ci-dessous).

Fonctionne aussi dans les navigateurs basés sur Chromium (Edge, Brave, Arc…) via leur page d'extensions équivalente.

> **Ne déplacez pas, ne renommez pas et ne supprimez pas le dossier après l'installation.** Chrome lit l'extension directement dans ce dossier : s'il change de place, l'extension ne se charge plus (elle est désactivée, avec une erreur dans `chrome://extensions`).
> Choisissez donc un emplacement durable avant d'installer (par exemple `Documents/WireSweep`), pas le dossier Téléchargements ni le Bureau.
> Si le dossier a été déplacé : supprimez Wire Sweep dans `chrome://extensions`, puis refaites l'étape 4 en choisissant le dossier `extension` à son nouvel emplacement. Chrome la considère alors comme une nouvelle extension : les agences cochées et leur ordre sont à refaire.

### Mettre à jour une version déjà installée

1. Téléchargez la nouvelle version (bouton **Code → Download ZIP**) et décompressez-la.
2. Copiez le **contenu** de son dossier `extension` dans le dossier `extension` déjà installé, en remplaçant les fichiers existants. Gardez le même dossier, au même endroit : c'est ce qui conserve vos agences cochées et leur ordre.
3. Dans `chrome://extensions`, cliquez sur le bouton **↻** (recharger) de la carte Wire Sweep.
4. Si Chrome affiche un avertissement sur de nouvelles autorisations, acceptez-le : la section « Confidentialité » ci-dessous explique chacune.

Si vous avez installé avec `git clone` : `git pull` dans le dossier du dépôt, puis **↻** dans `chrome://extensions`.

Si vous aviez modifié `config.js`, notez vos changements avant de remplacer les fichiers, puis reportez-les dans le nouveau `config.js`.

### Utilisation

1. Cliquez sur l'icône Wire Sweep.
2. Tapez vos mots-clés, cochez les agences voulues (boutons **Tout** / **Aucune** pour aller vite).
   Pour changer l'ordre des agences, faites-les glisser par la poignée **⋮⋮** à gauche (ou, au clavier, **Alt + ↑ / ↓** sur une case). L'ordre est mémorisé et les onglets s'ouvrent dans cet ordre.
3. Appuyez sur **Entrée** ou **Lancer la recherche** : un onglet s'ouvre par agence.
   Les onglets s'ouvrent en arrière-plan : vous restez sur l'onglet où vous êtes.
   Les derniers mots-clés lancés sont réaffichés (déjà sélectionnés) à la prochaine ouverture : tapez directement pour les remplacer.
   Si un onglet est déjà ouvert sur le site d'une agence (par exemple après une recherche précédente), il est réutilisé : la nouvelle recherche s'y affiche au lieu d'ouvrir un onglet de plus.

**Garder ouvert :** le bouton **Garder ouvert ⇥** en haut de la popup affiche Wire Sweep dans une colonne à droite de la fenêtre (panneau latéral de Chrome, version 116 ou plus récente). La colonne reste ouverte quand vous changez d'onglet ; vous pouvez enchaîner les recherches sans rouvrir l'extension. Pour la fermer : la croix en haut de la colonne. Elle se rouvre aussi depuis l'icône « panneau latéral » de Chrome.

Pour **Bloomberg, Abacapress et Pixpalace**, l'adresse ne peut pas contenir la recherche : l'extension ouvre la page, tape vos mots-clés dans le champ de recherche et clique sur le bouton à votre place (comptez une ou deux secondes de plus).

Si une agence ajoutée plus tard n'a ni adresse avec `{q}` ni remplissage automatique, elle est marquée **« coller »** : la page s'ouvre et vos mots-clés sont copiés dans le presse-papiers, il suffit de faire **Ctrl+V** (ou **Cmd+V**) dans le champ de recherche.

Vous devez être connecté à vos comptes agences dans Chrome, comme d'habitude : l'extension ne fait qu'ouvrir des onglets.

### Options

Le bouton **⚙** en haut de la popup (ou de la colonne) affiche les réglages propres à votre rédaction, directement dans la popup ; **← Retour** revient à la recherche.

- **Sous-domaine Pixpalace** : la partie avant `.pixpalace.com` dans l'adresse de votre espace Pixpalace (par défaut `www`). Par exemple, pour `https://maredaction.pixpalace.com/home`, saisissez `maredaction`.

Ces réglages restent dans Chrome sur votre ordinateur et sont conservés lors des mises à jour.

### Modifier les agences

Tout se trouve dans **`extension/config.js`**. Chaque agence a un nom et une adresse où le mot-clé est remplacé par `{q}` :

```js
{
  id: "getty-actu",
  name: "Getty Actu",
  url: "https://www.gettyimages.fr/search/2/image?family=editorial&phrase={q}"
}
```

Pour qu'une agence soit décochée lors d'une première installation, ajoutez-lui `defaultChecked: false` (c'est le cas d'AFP (forum)). Une agence ajoutée se place dans la liste juste après celle qui la précède dans `config.js`.

Astuce pour trouver l'adresse : faites une recherche sur le site avec des mots faciles à repérer (ex. `midterms texas democrats`), copiez l'URL de la page de résultats et remplacez les mots par `{q}`. Selon le site, les espaces y apparaissent sous la forme `%20` ou `+` : remplacez l'ensemble, séparateurs compris.

Les valeurs propres à une rédaction ne s'écrivent pas en dur : elles passent par une option, insérée dans l'adresse avec `{opt:nom}` (voir `OPTIONS` en bas de `config.js`).

Certains sites (AFP news, Sipa, Rea) « emballent » la recherche dans l'URL (hexadécimal, ou gzip + base64). Pour eux, on décrit le contenu dans `payload` et les étapes d'encodage dans `encode` — voir les commentaires en tête de `config.js`.

Pour les sites dont l'adresse ne peut pas contenir la recherche, on indique plutôt le champ à remplir et le bouton à cliquer (`fill`), sous forme de sélecteurs CSS. Pour un nouveau site de ce type, ajoutez aussi son domaine dans `host_permissions` du fichier `extension/manifest.json`.

Après toute modification : `chrome://extensions` → bouton **↻** (recharger) sur Wire Sweep.

### Icône

Un curseur de texte dans un cadre arrondi à fond blanc (lisible en thème sombre), avec une loupe rouge en bas à droite. Sources dans `extension/icons/` : `icon.svg` (32 à 128 px) et `icon-16.svg`, une version simplifiée dessinée pour 16 px. Les PNG `icon-16/32/48/128.png` en sont l'export à taille réelle. Pour modifier l'icône, éditez les SVG puis réexportez-les aux mêmes tailles, sur fond transparent.

### Confidentialité

- Aucune collecte de données, aucun mot de passe, aucun compte.
- Aucun appel réseau : l'extension se contente d'ouvrir des onglets (la politique de sécurité de l'extension interdit d'ailleurs toute requête : `connect-src 'none'`).
- Seules données enregistrées : la liste des agences cochées, leur ordre, la dernière recherche lancée et vos options, stockés localement dans Chrome (`chrome.storage.local`), jamais transmis. Seule la dernière recherche est gardée (pas d'historique) ; elle disparaît en désinstallant l'extension.
- Permissions demandées :
  - `storage` : mémoriser les cases cochées ;
  - `clipboardWrite` : copier les mots-clés pour les sites « coller » ;
  - `sidePanel` : afficher Wire Sweep dans la colonne de droite.
  - `tabs` : voir les adresses des onglets ouverts, pour réutiliser celui d'une agence déjà ouverte au lieu d'en ouvrir un nouveau. Rien n'est enregistré ni transmis. Chrome affiche pour cela l'avertissement « Lire votre historique de navigation ».
  - `scripting` + accès à `mercury.bloomberg.com`, `search.abacapress.com` et `*.pixpalace.com` : uniquement pour taper les mots-clés dans le champ de recherche de ces trois sites et cliquer sur le bouton. L'extension ne lit rien d'autre sur ces pages. Chrome affichera pour cela un avertissement « lire et modifier vos données sur ces sites ».

### Sécurité

- Les sites et les champs à remplir viennent uniquement de `config.js`, livré avec l'extension : rien n'est téléchargé.
- Le script d'arrière-plan n'accepte que les demandes de sa propre popup, et n'ouvre que des adresses `https` correspondant au site déclaré pour chaque agence.
- Avant de remplir un champ, il vérifie que l'onglet est toujours sur le site de l'agence.
- Les mots-clés sont insérés comme du texte (jamais comme du code) et encodés dans les adresses.
- Mises à jour : l'extension ne se met jamais à jour toute seule. Ne remplacez le dossier que par une version venant de ce dépôt, et protégez le compte GitHub par la double authentification.
