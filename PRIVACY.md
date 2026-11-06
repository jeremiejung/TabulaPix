# Politique de confidentialité — TabulaPix

*English version below.*

Dernière mise à jour : 5 novembre 2026

TabulaPix est une extension Chrome qui lance une même recherche sur plusieurs sites d'agences photo, en ouvrant un onglet par agence.

## Aucune collecte de données

- TabulaPix **ne collecte, ne transmet et ne vend aucune donnée**. L'extension n'a ni serveur, ni compte, ni outil de mesure d'audience.
- L'extension **ne fait aucune requête réseau** : sa politique de sécurité l'interdit (`connect-src 'none'`). Elle se contente d'ouvrir des onglets vers les sites des agences que vous avez choisies, comme si vous tapiez leur adresse vous-même.
- TabulaPix **ne lit pas le contenu des pages** que vous visitez, ni vos mots de passe, ni vos cookies.

## Ce qui est enregistré, et où

Les éléments suivants sont enregistrés **uniquement dans Chrome, sur votre ordinateur** (`chrome.storage.local`), pour que TabulaPix se souvienne de vos réglages. Ils ne quittent jamais votre ordinateur :

- les agences cochées, leur ordre, les agences masquées ;
- les agences que vous avez ajoutées ou modifiées (nom, adresse de recherche, emplacement du champ et du bouton de recherche sur leur site) ;
- votre dernière recherche (une seule, pas d'historique) ;
- vos réglages (langue, sous-domaine Pixpalace).

Pendant une recherche, les mots-clés à taper dans le champ d'un site sont gardés en mémoire de session (effacée à la fermeture de Chrome).

Désinstaller TabulaPix efface toutes ces données.

**Fichier de configuration** : le bouton « Exporter » enregistre ces réglages (sans vos recherches) dans un fichier, à l'endroit que vous choisissez sur votre ordinateur. TabulaPix ne l'envoie nulle part ; c'est vous qui décidez de le conserver ou de le partager. « Importer » lit un tel fichier localement.

## Sites des agences

Les recherches s'ouvrent sur les sites des agences, avec vos propres comptes : ces sites reçoivent vos mots-clés comme pour toute recherche faite à la main, et appliquent leur propre politique de confidentialité.

## Autorisations

- **Onglets** (`tabs`) : ouvrir les recherches et réutiliser l'onglet d'une agence déjà ouverte. Les adresses des onglets sont lues au moment de la recherche, jamais enregistrées ni transmises.
- **Accès à certains sites** (`scripting`, Bloomberg, Abacapress, Pixpalace) : taper les mots-clés dans le champ de recherche de ces sites et cliquer sur leur bouton.
- **Accès facultatif à d'autres sites** : demandé site par site, uniquement quand vous ajoutez une agence dont il faut remplir le champ de recherche, et retiré quand vous la supprimez.
- **Stockage** (`storage`), **presse-papiers** (`clipboardWrite`), **panneau latéral** (`sidePanel`) : vos réglages, copier les mots-clés pour les sites où il faut les coller, afficher TabulaPix dans la colonne latérale.

## Contact

Jérémie Jung — https://www.jeremie.eu/ — code source et signalements : https://github.com/jeremiejung/TabulaPix

---

# Privacy policy — TabulaPix

Last updated: 5 November 2026

TabulaPix is a Chrome extension that runs the same search on several picture agency websites, opening one tab per agency.

## No data collection

- TabulaPix **does not collect, transmit or sell any data**. The extension has no server, no account and no analytics.
- The extension **makes no network requests**: its security policy forbids them (`connect-src 'none'`). It only opens tabs to the agency websites you selected, as if you typed their address yourself.
- TabulaPix **does not read the content of the pages** you visit, nor your passwords or cookies.

## What is stored, and where

The following is stored **only in Chrome, on your computer** (`chrome.storage.local`), so that TabulaPix remembers your settings. It never leaves your computer:

- ticked agencies, their order, hidden agencies;
- agencies you added or edited (name, search address, location of the search field and button on their site);
- your last search (only one, no history);
- your preferences (language, Pixpalace subdomain).

During a search, the keywords to type into a site's field are kept in session memory (cleared when Chrome closes).

Uninstalling TabulaPix deletes all of this data.

**Configuration file**: the “Export” button saves these settings (without your searches) to a file, wherever you choose on your computer. TabulaPix never sends it anywhere; you decide whether to keep or share it. “Import” reads such a file locally.

## Agency websites

Searches open on the agencies' websites, with your own accounts: these sites receive your keywords as for any search typed by hand, and apply their own privacy policies.

## Permissions

- **Tabs** (`tabs`): open the searches and reuse an agency's tab that is already open. Tab addresses are read at search time, never stored or transmitted.
- **Access to some sites** (`scripting`, Bloomberg, Abacapress, Pixpalace): type the keywords into these sites' search field and click their button.
- **Optional access to other sites**: requested one site at a time, only when you add an agency whose search field must be filled in, and removed when you delete it.
- **Storage** (`storage`), **clipboard** (`clipboardWrite`), **side panel** (`sidePanel`): your settings, copying keywords for sites where they must be pasted, showing TabulaPix in the side panel.

## Contact

Jérémie Jung — https://www.jeremie.eu/ — source code and issues: https://github.com/jeremiejung/TabulaPix
