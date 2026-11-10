# Journal des versions

*[English](CHANGELOG.md) · **Français***

Les versions publiées sur le [Chrome Web Store](https://chromewebstore.google.com/detail/gdggcpmgjoaobfjlnbfmgfnjfgodgikp) sont signalées. Le numéro de version ne change qu'à un envoi au store (voir « Numéros de version » dans le [README](README.fr.md)).

## [Non publié]

- **Dossiers d'agences** (agences filaires, agences d'auteurs, agences de service de presse…), affichés en blocs chacun dans sa couleur (9 couleurs). La case d'un dossier coche ou décoche toutes ses agences, et est à moitié cochée quand seules certaines le sont ; le compteur ressort quand un dossier replié contient des agences cochées. Les dossiers se replient et se réordonnent ; tout est conservé dans le fichier de configuration exporté (format version 2, toujours lisible par la 3.3.0, qui garde les dossiers mais pas leur couleur).
- **Mode Organiser** (crayon en haut) : poignées de glisser-déposer, dossiers renommés sur place, couleur, suppression, création en bas de la liste. En usage courant, la liste ne montre que les noms et les cases. Une agence est rangée dans un dossier quand on la lâche sur son titre (surligné), Échap annule un glisser, et Alt + ↑ / ↓ fait aussi passer une agence d'un dossier à l'autre et déplace les dossiers.
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
- Les erreurs de nom de dossier s’affichent juste sous le champ (nouveau dossier) ou sur le champ lui-même (renommage), et non plus en haut de la liste.
- Barre latérale : la colonne ne garde plus de connexion permanente avec le script d’arrière-plan (source de l’erreur « Receiving end does not exist » dans chrome://extensions) ; elle signale son ouverture, et la fermeture est détectée par Chrome ou au changement d’onglet ou de fenêtre suivant.
- Barre latérale : le bouton « Garder ouvert » devient une icône comme les autres ; tant que la colonne est ouverte, l'icône de la barre d'outils agit sur elle au lieu d'ouvrir une popup par-dessus.
- Barre latérale : le pied de page (liens vers jeremie.eu et le code source) reste désormais collé au bas de la fenêtre.

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
