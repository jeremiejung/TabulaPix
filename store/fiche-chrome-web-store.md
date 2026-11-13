# Fiche Chrome Web Store — TabulaPix

Tout ce qu'il faut pour remplir le tableau de bord du Chrome Web Store (https://chrome.google.com/webstore/devconsole), dans l'ordre des onglets. Chaque texte est dans un bloc à copier-coller.

Paquet à envoyer : `TabulaPix-3.5.3.zip` (ou plus récent).

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

La même recherche sur dix agences ? Tapez vos mots-clés une seule fois : TabulaPix ouvre chaque agence dans son onglet, avec vos propres comptes.

• Quelques agences de presse et banques d'images prêtes à l'emploi
• Ajoutez les autres en quelques clics
• Rangez-les dans des dossiers
• Sauvegardez votre configuration et partagez-la
• En français et en anglais

Rien ne quitte votre ordinateur : pas de compte, pas de serveur, aucune donnée collectée.

Outil indépendant, gratuit et open source (licence MIT). Un abonnement à chaque agence reste nécessaire pour voir ses contenus.

Code source : https://github.com/jeremiejung/TabulaPix
```

### Description détaillée — anglais

```text
TabulaPix — one search, all your picture agencies.

The same search on ten agencies? Type your keywords once: TabulaPix opens each agency in its own tab, with your own accounts.

• A few news picture agencies and stock libraries ready to use
• Add the others in a few clicks
• Sort them into folders
• Back up your configuration and share it
• In English and French

Nothing leaves your computer: no account, no server, no data collected.

Independent, free and open-source tool (MIT licence). A subscription to each agency is still required to see its content.

Source code: https://github.com/jeremiejung/TabulaPix
```

### Autres champs

| Champ | Valeur |
|---|---|
| Catégorie | Productivité (*Productivity*) — ou Outils (*Tools*) |
| Langue principale | Français (ajoutez l'anglais comme seconde langue de la fiche) |
| Icône du Store (128 × 128) | `extension/icons/icon-128.png` |
| Format des images | Toutes en PNG 24 bits sans transparence, comme exigé |
| Fichiers modifiables | `store/psd/` : un PSD par image (mêmes noms), en calques — fond, capture, logo, trait, coches, et textes modifiables (police **Inter**, à installer : à l'ouverture, accepter de mettre à jour les calques de texte). Exporter ensuite en PNG 24 bits |
| Captures d'écran (1280 × 800) | `store/images/capture-1-fr.png` à `capture-4-fr.png` (recherche, dossiers, ajout d'agence, repérage du champ) — versions `-en` pour la fiche anglaise |
| Petite image promotionnelle (440 × 280) | `store/images/tuile-440x280-fr.png` — `-en` pour la fiche anglaise |
| Image promotionnelle en haut de la page (1 400 × 560) | `store/images/banniere-1400x560-fr.png` — `-en` pour la fiche anglaise |
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
