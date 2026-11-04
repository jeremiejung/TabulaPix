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

Fonctionne aussi dans les navigateurs basés sur Chromium (Edge, Brave, Arc…) via leur page d'extensions équivalente.

### Utilisation

1. Cliquez sur l'icône Wire Sweep.
2. Tapez vos mots-clés, cochez les agences voulues (boutons **Tout** / **Aucune** pour aller vite).
3. Appuyez sur **Entrée** ou **Lancer la recherche** : un onglet s'ouvre par agence.

Pour les agences marquées **« coller »** (Bloomberg, Abacapress, Pixpalace, MaxPPP), l'adresse ne permet pas encore de transmettre le mot-clé : la page de recherche s'ouvre et vos mots-clés sont copiés dans le presse-papiers, il suffit de faire **Ctrl+V** (ou **Cmd+V**) dans le champ de recherche du site.

Vous devez être connecté à vos comptes agences dans Chrome, comme d'habitude : l'extension ne fait qu'ouvrir des onglets.

### Modifier les agences

Tout se trouve dans **`extension/config.js`**. Chaque agence a un nom et une adresse où le mot-clé est remplacé par `{q}` :

```js
{
  id: "getty-actu",
  name: "Getty Actu",
  url: "https://www.gettyimages.fr/search/2/image?family=editorial&phrase={q}"
}
```

Astuce pour trouver l'adresse : faites une recherche sur le site avec un mot rare (ex. `macron`), copiez l'URL de la page de résultats et remplacez le mot par `{q}`.

Certains sites (AFP, Sipa, Rea) « emballent » la recherche dans l'URL (hexadécimal, ou gzip + base64). Pour eux, on décrit le contenu dans `payload` et les étapes d'encodage dans `encode` — voir les commentaires en tête de `config.js`.

Après toute modification : `chrome://extensions` → bouton **↻** (recharger) sur Wire Sweep.

### Confidentialité

- Aucune collecte de données, aucun mot de passe, aucun compte.
- Aucun appel réseau : l'extension se contente d'ouvrir des onglets (la politique de sécurité de l'extension interdit d'ailleurs toute requête : `connect-src 'none'`).
- Seule donnée enregistrée : la liste des agences cochées, stockée localement dans Chrome (`chrome.storage.local`). Les mots-clés ne sont pas conservés.
- Permissions demandées : `storage` (mémoriser les cases) et `clipboardWrite` (copier les mots-clés pour les sites « coller »).
