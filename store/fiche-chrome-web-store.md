# Fiche Chrome Web Store — TabulaPix

Tout ce qu'il faut pour remplir le tableau de bord du Chrome Web Store (https://chrome.google.com/webstore/devconsole), dans l'ordre des onglets. Chaque texte est dans un bloc à copier-coller.

Paquet à envoyer : `TabulaPix-3.1.1.zip` (ou plus récent).

---

## 1. Fiche du Store (*Store listing*)

### Nom et résumé

Lus automatiquement dans le paquet (fichiers `_locales`) :

- **Nom** : TabulaPix
- **Résumé** (français) : Une recherche, toutes vos agences photo : TabulaPix ouvre un onglet par agence avec vos résultats.
- **Résumé** (anglais) : One search, all your picture agencies: TabulaPix opens one tab per agency with your results.

> **Ne listez pas les noms des agences dans les descriptions** : le Chrome Web Store les considère comme du « bourrage de mots-clés » (refus « Yellow Argon » au premier envoi).

### Description détaillée — français

```text
TabulaPix — une recherche, toutes vos agences photo.

Pour les services photo, iconographes et éditeurs photo : tapez vos mots-clés une seule fois, cochez vos agences, et TabulaPix ouvre un onglet par agence avec les résultats, en utilisant vos propres comptes. Vous restez sur l'onglet où vous êtes.

AGENCES PRÊTES À L'EMPLOI
Une douzaine d'agences de presse et de banques d'images parmi les plus utilisées par les rédactions sont déjà configurées. L'ordre et les cases cochées sont mémorisés ; masquez celles que vous n'utilisez pas.

AJOUTEZ VOS AGENCES
Faites une recherche sur le site d'une agence, collez l'adresse de la page de résultats et vos mots-clés : TabulaPix détecte tout seul comment y relancer la recherche, que les mots-clés soient en clair, séparés par des tirets ou encodés dans l'adresse. Un bouton « Essayer » permet de vérifier avant d'ajouter.
Quand le site ne met pas la recherche dans l'adresse, montrez une fois à TabulaPix son champ de recherche et son bouton : il les remplira pour vous à chaque recherche.

PRATIQUE
• Colonne latérale pour enchaîner les recherches
• Réutilise l'onglet d'une agence déjà ouverte
• Dernière recherche mémorisée
• Toutes les agences renommables, modifiables ou supprimables, avec retour à la configuration d'usine
• Sauvegarde de la configuration dans un fichier, à garder ou à partager entre collègues
• En français et en anglais

CONFIDENTIALITÉ
Aucun compte, aucune collecte de données, aucun serveur : TabulaPix ne fait aucune requête réseau et ne lit pas le contenu des pages. Vos réglages restent dans Chrome, sur votre ordinateur. L'accès à un site supplémentaire n'est demandé que lorsque vous ajoutez une agence qui en a besoin, et il est retiré si vous la supprimez.

TabulaPix est un outil indépendant, gratuit et open source (licence MIT), sans lien avec les agences de presse ni les banques d'images. Un abonnement à chaque agence reste nécessaire pour accéder à ses contenus.

Code source : https://github.com/jeremiejung/TabulaPix
```

### Description détaillée — anglais

```text
TabulaPix — one search, all your picture agencies.

For photo desks, picture researchers and photo editors: type your keywords once, tick your agencies, and TabulaPix opens one tab per agency with the results, using your own accounts. You stay on the tab you are on.

READY-TO-USE AGENCIES
A dozen of the news picture agencies and stock image libraries most used by newsrooms are already set up. Their order and ticks are remembered; hide the ones you don't use.

ADD YOUR OWN AGENCIES
Run a search on an agency's website, paste the address of the results page and your keywords: TabulaPix works out by itself how to run the search there again, whether the keywords are plain, separated by dashes or encoded in the address. A "Try" button lets you check before adding.
When the site doesn't put the search in the address, show TabulaPix its search field and button once: it will fill them in for you on every search.

HANDY
• Side panel to chain searches
• Reuses an agency's tab that is already open
• Remembers your last search
• Every agency can be renamed, edited or deleted, with a way back to factory settings
• Configuration backup to a file, to keep or to share with colleagues
• In English and French

PRIVACY
No account, no data collection, no server: TabulaPix makes no network requests and does not read page content. Your settings stay in Chrome, on your computer. Access to an additional site is only requested when you add an agency that needs it, and is removed if you delete that agency.

TabulaPix is an independent, free and open-source tool (MIT licence), not affiliated with any news agency or stock image library. A subscription to each agency is still required to access its content.

Source code: https://github.com/jeremiejung/TabulaPix
```

### Autres champs

| Champ | Valeur |
|---|---|
| Catégorie | Productivité (*Productivity*) — ou Outils (*Tools*) |
| Langue principale | Français (ajoutez l'anglais comme seconde langue de la fiche) |
| Icône du Store (128 × 128) | `extension/icons/icon-128.png` |
| Format des images | Toutes en PNG 24 bits sans transparence, comme exigé |
| Captures d'écran (1280 × 800) | `store/images/capture-1-fr.png`, `capture-2-fr.png`, `capture-3-fr.png` — versions `-en` pour la fiche anglaise |
| Petite image promotionnelle (440 × 280) | `store/images/tuile-440x280.png` (en anglais, une seule version) |
| Image promotionnelle en haut de la page (1 400 × 560) | `store/images/banniere-1400x560.png` (en anglais) |
| Site web officiel | https://github.com/jeremiejung/TabulaPix |
| URL d'assistance | https://github.com/jeremiejung/TabulaPix/issues |

---

## 2. Pratiques de confidentialité (*Privacy practices*)

Les examinateurs lisent l'anglais : les textes anglais sont recommandés (traduction française en dessous de chacun, pour information).

### Objectif unique (*Single purpose*)

```text
TabulaPix lets photo editors run the same keyword search on several news picture agency websites at once, opening one tab per agency with the results, using the user's own accounts.
```

> TabulaPix permet aux éditeurs photo de lancer la même recherche par mots-clés sur plusieurs sites d'agences photo à la fois, en ouvrant un onglet par agence avec les résultats, avec leurs propres comptes.

### Justification des autorisations

**storage**

```text
Stores the user's settings locally (chrome.storage.local): ticked agencies and their order, hidden, added or edited agencies, the last search, the interface language and the Pixpalace subdomain. Nothing is transmitted.
```

**clipboardWrite**

```text
For an agency whose search cannot be passed in its address and whose search field is not filled automatically, TabulaPix opens the agency's page and copies the keywords to the clipboard so the user can paste them. Only happens when the user launches a search.
```

**tabs**

```text
Opens one tab per agency in the background when the user launches a search, and reads the addresses of open tabs to reuse the tab already open on an agency's site instead of opening duplicates. Tab addresses are only read at search time; they are never stored or transmitted.
```

**scripting**

```text
On agency sites the extension is allowed to access, injects a small function that types the user's keywords into the site's own search field and clicks its search button (for agencies whose search cannot be passed in the URL). Also shows a banner on a site when the user adds such an agency, so the user can point at the search field and button. No page content is read or collected.
```

**sidePanel**

```text
Lets the user keep TabulaPix open in Chrome's side panel ("Keep open" button) to chain several searches.
```

**Justification de l'autorisation d'accès à l'hôte** (une seule boîte pour les deux groupes ; 722 caractères sur 1000)

```text
https://mercury.bloomberg.com/*, https://search.abacapress.com/*, https://*.pixpalace.com/*
These three built-in agencies do not accept the search in their URL, so TabulaPix types the keywords into their search field and clicks their search button (see "scripting"). Pixpalace uses a wildcard because each newsroom has its own subdomain (set by the user). Used only on these sites, only after the user launches a search.

https://*/*
Never requested at install. Requested at runtime, for one single site at a time, only when the user adds a custom agency whose search must be typed into the site's search field; Chrome shows its permission prompt for that site. The permission is removed when the user deletes that agency.
```

### Code distant (*Remote code*)

Réponse : **Non, je n'utilise pas de code distant.**

```text
All JavaScript is included in the package. The extension's content security policy forbids remote scripts and network requests (script-src 'self'; connect-src 'none').
```

### Utilisation des données (*Data usage*)

- Ne cochez **aucune** catégorie de données collectées (informations personnelles, santé, finances, authentification, communications personnelles, localisation, historique web, activité de l'utilisateur, contenu des sites) : TabulaPix n'en collecte aucune.
- Cochez les trois certifications :
  - je ne vends ni ne transfère les données des utilisateurs à des tiers, en dehors des cas d'utilisation approuvés ;
  - je n'utilise ni ne transfère les données des utilisateurs à des fins sans rapport avec la fonctionnalité principale de mon article ;
  - je n'utilise ni ne transfère les données des utilisateurs pour déterminer leur solvabilité ou à des fins de prêt.

### Règles de confidentialité (*Privacy policy URL*)

```text
https://github.com/jeremiejung/TabulaPix/blob/main/PRIVACY.md
```

---

## 3. Distribution

- **Visibilité** : Public (ou Non répertorié pour commencer avec un cercle restreint).
- **Pays** : tous, ou ceux de votre choix.
- **Prix** : gratuit.

---

## 4. Instructions pour l'examen (*Test instructions*)

À coller dans le champ prévu pour l'équipe d'examen (500 caractères au plus ; ce texte en fait 482) :

```text
No account needed; most agencies need a subscription, so test with public sites:
1. Type "Estonia border", click None, tick Getty Creative, Shutterstock, Adobe Stock, click Search: one tab per agency opens.
2. Gear icon: paste an alamy.com results URL and its keywords, click Detect, then Add the agency.
3. Paste https://www.alamy.com/ with "estonia border", click Detect, then "Locate the field on the site", accept Chrome's prompt, click the search box then its button, then Add.
```

---

## 5. Après la publication

Pour chaque mise à jour : augmenter `version` dans `extension/manifest.json`, refaire le ZIP, l'envoyer dans l'onglet **Paquet** (*Package*) puis **Envoyer pour examen**.
