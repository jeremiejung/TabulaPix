# Journal des versions

*[English](CHANGELOG.md) · **Français***

Les versions publiées sur le [Chrome Web Store](https://chromewebstore.google.com/detail/gdggcpmgjoaobfjlnbfmgfnjfgodgikp) sont signalées. Le numéro de version ne change qu'à un envoi au store (voir « Numéros de version » dans le [README](README.fr.md)).

## [Non publié]

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
