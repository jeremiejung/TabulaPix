/*
 * TabulaPix — configuration des agences
 * ======================================
 *
 * Pour ajouter, retirer ou modifier une agence, éditez uniquement ce fichier,
 * puis rechargez l'extension (chrome://extensions → bouton ↻ de TabulaPix).
 *
 * Champs d'une agence :
 *   id       identifiant unique, sans espace (sert à mémoriser la case cochée)
 *   name     nom affiché dans la popup
 *   folder   (facultatif) identifiant d'un dossier de FOLDERS (ci-dessous) :
 *            rangement proposé à l'installation, et dossier d'une agence
 *            ajoutée plus tard si l'utilisateur a encore ce dossier
 *   defaultChecked  (facultatif) false = décochée au premier lancement
 *   defaultHidden   (facultatif) true = masquée la première fois qu'elle
 *                   apparaît (à réafficher avec son œil, mode Organiser)
 *   url      adresse de recherche. Marqueurs possibles :
 *              {q}        → les mots-clés, encodés pour une URL (cas le plus courant)
 *              {payload}  → le résultat du champ « payload » ci-dessous
 *              {opt:xxx}  → la valeur de l'option « xxx » (voir OPTIONS en bas
 *                           du fichier), réglable par chacun via le bouton ⚙
 *            Sans {q} ni {payload} (et sans « fill »), la page est simplement
 *            ouverte et les mots-clés sont copiés dans le presse-papiers.
 *
 * Champs avancés (pour les sites qui « emballent » la recherche dans l'URL) :
 *   payload  texte modèle (souvent du JSON) contenant {q}. Ici {q} est inséré
 *            tel quel, avec juste l'échappement JSON des guillemets.
 *   encode   liste d'étapes appliquées au payload, dans l'ordre :
 *              "uri"    → encodage URL (encodeURIComponent)
 *              "hex"    → hexadécimal majuscule (UTF-8)
 *              "gzip"   → compression gzip (faite localement, sans réseau)
 *              "base64" → base64
 *
 * Pour les sites dont l'adresse ne peut pas contenir la recherche :
 *   fill     { input: "sélecteur CSS du champ", submit: "sélecteur CSS du bouton" }
 *            L'extension ouvre la page, tape les mots-clés dans le champ puis
 *            clique sur le bouton (« submit » est facultatif : sinon, Entrée).
 *            « delay » (facultatif, en millisecondes, 300 par défaut) : pause
 *            avant de taper puis avant de cliquer, pour les sites lents.
 *            Chrome doit autoriser le site : soit il figure dans
 *            "host_permissions" de manifest.json (accordé à l'installation ;
 *            en ajouter un désactive l'extension chez les utilisateurs jusqu'à
 *            ce qu'ils l'acceptent), soit l'utilisateur l'autorise à la demande
 *            (pastille « à autoriser » quand l'agence est cochée) — préférable.
 *            Pour trouver un sélecteur : clic droit sur le champ → Inspecter →
 *            clic droit sur la ligne surlignée → Copier → Copier le sélecteur.
 */
/*
 * Dossiers livrés : rangement proposé à l'installation (et à la première
 * ouverture de cette version chez qui n'a encore créé aucun dossier).
 * Ensuite, les dossiers appartiennent à l'utilisateur : une mise à jour ne
 * les crée, ne les renomme ni ne les supprime plus. Ne jamais changer un id.
 *   id     identifiant fixe (lettres, chiffres, tirets)
 *   name   nom en français et en anglais (pris dans la langue de l'utilisateur)
 *   color  blue, teal, green, amber, orange, red, pink, violet ou gray
 */
const FOLDERS = [
  { id: "tp-actu", name: { fr: "Actualité", en: "News" }, color: "blue" },
  { id: "tp-reportage", name: { fr: "Reportage & auteurs", en: "Documentary" }, color: "green" },
  { id: "tp-agregateurs", name: { fr: "Agrégateurs", en: "Aggregators" }, color: "amber" },
  { id: "tp-people", name: { fr: "People", en: "Celebrity" }, color: "pink" },
  { id: "tp-stock", name: { fr: "Stock", en: "Stock" }, color: "violet" },
  { id: "tp-archives", name: { fr: "Archives", en: "Archives" }, color: "gray" }
];

const AGENCIES = [
  /* ---------- Actualité ---------- */
  {
    id: "reuters-standard",
    name: "Reuters (standard)",
    folder: "tp-actu",
    defaultChecked: false,
    defaultHidden: true,
    // Interface « app » des comptes sans points (téléchargement libre).
    url: "https://www.reutersconnect.com/app/feed/pictures?query={q}"
  },
  {
    id: "reuters",
    name: "Reuters (points)",
    folder: "tp-actu",
    // Interface des comptes au crédit de points (affiche le solde de points).
    url: "https://www.reutersconnect.com/all?media-types=pic&search=all%3A{q}"
  },
  {
    id: "afp-forum",
    name: "AFP (forum)",
    folder: "tp-actu",
    defaultChecked: false,
    defaultHidden: true,
    // Les paramètres sont répétés après le « # » : la page les relit de là.
    url: "https://www.afpforum.com/AFPForum/Search/Results.aspx?pn=1&smd=8&mui=3&fst={q}&fto=3&t=2#pn=1&smd=8&mui=3&fst={q}&fto=3&t=2"
  },
  {
    id: "afp",
    name: "AFP (news)",
    folder: "tp-actu",
    url: "https://news.afp.com/#/c/main/search/photos?search={payload}",
    payload: '{"languages":["fr"],"sortOrder":"desc","searchTab":"photos","keywords":{"value":"{q}","lang":"fr"}}',
    encode: ["uri", "gzip", "base64", "uri"]
  },
  {
    id: "sipa",
    name: "Sipa",
    folder: "tp-actu",
    url: "https://www.sipa.com/search/fr/1/0x{payload}",
    payload: '{"searchbar":"{q}","is_searchandgo":"false","ordermode":"2","orderby":"1","folding":"0"}',
    encode: ["hex"]
  },
  {
    id: "abacapress",
    name: "Abacapress",
    folder: "tp-actu",
    url: "https://search.abacapress.com/recherche",
    fill: {
      input: "#fullTextInput",
      submit: "#simpleSearchForm button[type=submit]"
    }
  },
  {
    id: "getty-actu",
    name: "Getty Actu",
    folder: "tp-actu",
    url: "https://www.gettyimages.fr/search/2/image?family=editorial&phrase={q}&sort=best&phraseprocessing=default&groupbyevent=false"
  },
  {
    id: "maxppp",
    name: "MaxPPP",
    folder: "tp-actu",
    url: "https://maxppp.com/search?p_p_id=listenersearchresults_WAR_searchportlet&p_p_lifecycle=0&p_p_state=normal&p_p_mode=view&_listenersearchresults_WAR_searchportlet_search={q}&_listenersearchresults_WAR_searchportlet_match=a&_listenersearchresults_WAR_searchportlet_sort=d&_listenersearchresults_WAR_searchportlet_struts.portlet.action=%2Fview%2FdisplaySearchResults"
    // Si cette adresse ne marche pas, remplacez la ligne « url » ci-dessus par :
    // url: "https://maxppp.com/search",
    // fill: { input: "#search" }
  },
  {
    id: "bloomberg",
    name: "Bloomberg",
    folder: "tp-actu",
    url: "https://mercury.bloomberg.com/search",
    fill: {
      input: "form.searchbar input.react-autosuggest__input",
      submit: ".search-go-button",
      delay: 1200
    }
  },

  /* ---------- Reportage & auteurs ---------- */
  {
    id: "divergence",
    name: "Divergence",
    folder: "tp-reportage",
    url: "https://www.divergence-images.com/recherche/{q}/"
  },
  {
    id: "hans-lucas",
    name: "Hans Lucas",
    folder: "tp-reportage",
    defaultChecked: false, // remplit le champ : autorisation demandée quand on la coche
    url: "https://search.odyssey.photo/search",
    fill: { input: "#kw1", submit: "#adv_search_submit" }
  },
  {
    id: "myop",
    name: "Myop",
    folder: "tp-reportage",
    defaultChecked: false,
    url: "https://myop.pixtech.fr/home",
    fill: { input: "#search-field", submit: "input.btn-search" }
  },
  {
    id: "rea",
    name: "Rea",
    folder: "tp-reportage",
    url: "https://search.reaphoto.com/search/fr/1/0x{payload}",
    payload: '{"searchbar":"{q}","folding":"0"}',
    encode: ["hex"]
  },
  {
    id: "signatures",
    name: "Signatures",
    folder: "tp-reportage",
    defaultChecked: false,
    url: "https://recherche.signatures-photographies.com/recherche",
    fill: { input: "#fullTextInput", submit: "button[type=\"submit\"]" }
  },
  {
    id: "vu",
    name: "Vu'",
    folder: "tp-reportage",
    defaultChecked: false,
    url: "https://archive.agencevu.com/",
    fill: { input: "form[role=\"search\"] input.text", submit: "input.search-opened" }
  },

  /* ---------- Agrégateurs ---------- */
  {
    id: "agencesonline",
    name: "AgencesONline",
    folder: "tp-agregateurs",
    url: "https://www.agencesonline.com/search/fr/1/0x{payload}",
    payload: '{"searchbar":"{q}","category":"DFL","ordermode":"2"}',
    encode: ["hex"]
  },
  {
    id: "pixpalace",
    name: "Pixpalace",
    folder: "tp-agregateurs",
    url: "https://{opt:pixpalaceSubdomain}.pixpalace.com/home",
    fill: {
      input: "#search-field",
      submit: "#pw_search_form input[type=submit]"
    }
  },

  /* ---------- People ---------- */
  {
    id: "bestimage",
    name: "Bestimage",
    folder: "tp-people",
    defaultChecked: false,
    url: "https://www.bestimage.fr/recherche",
    fill: { input: "input.min-w-0", submit: "button.left-0" }
  },
  {
    id: "bureau233",
    name: "Bureau 233",
    folder: "tp-people",
    defaultChecked: false,
    url: "https://www.bureau233.com/?idPageWeb=95",
    fill: { input: "input.formulaire2", submit: "input[name=\"Submit\"]" }
  },
  {
    id: "phototele",
    name: "Phototélé",
    folder: "tp-people",
    defaultChecked: false,
    url: "https://www.phototele.com/prod/",
    fill: { input: "#EDIT_query", submit: "form#searchForm button.btn" }
  },
  {
    id: "starface",
    name: "Starface",
    folder: "tp-people",
    defaultChecked: false,
    url: "https://www.starfacephoto.com/recherche",
    fill: { input: "#fullTextInput", submit: "#simpleSearchForm > button" }
  },

  /* ---------- Stock ---------- */
  {
    id: "adobe-stock",
    name: "Adobe Stock",
    folder: "tp-stock",
    defaultChecked: false,
    url: "https://stock.adobe.com/fr/search?k={q}"
  },
  {
    id: "alamy",
    name: "Alamy",
    folder: "tp-stock",
    defaultChecked: false,
    url: "https://www.alamyimages.fr/photos-images/{q:slug}.html?sortBy=relevant"
  },
  {
    id: "getty-creative",
    name: "Getty Creative",
    folder: "tp-stock",
    defaultChecked: false,
    url: "https://www.gettyimages.fr/search/2/image-film?family=creative&phrase={q}&sort=best&phraseprocessing=default&excludenudity=false&suppressfamilycorrection=true"
  },
  {
    id: "shutterstock",
    name: "Shutterstock",
    folder: "tp-stock",
    defaultChecked: false,
    url: "https://www.shutterstock.com/fr/search/{q}?image_type=photo"
  },
  {
    id: "unsplash",
    name: "Unsplash",
    folder: "tp-stock",
    defaultChecked: false,
    url: "https://unsplash.com/fr/s/photos/{q}"
  },

  /* ---------- Archives ---------- */
  {
    id: "gamma-rapho",
    name: "Gamma-Rapho",
    folder: "tp-archives",
    defaultChecked: false,
    url: "https://www.gamma-rapho.com/search/fr/1/0x{payload}",
    payload: '{"searchbar":"{q}","ordermode":"2"}',
    encode: ["hex"]
  },
  {
    id: "photo12",
    name: "Photo12",
    folder: "tp-archives",
    defaultChecked: false,
    url: "https://www.photo12.com/fr/images?search={q}"
  }
];

/*
 * Ordre de la liste dans la version 3.4.1 (avant les dossiers livrés) :
 * gardé tel quel chez les utilisateurs qui n'avaient jamais réordonné.
 */
const LEGACY_ORDER = ["reuters", "reuters-standard", "afp", "afp-forum", "bloomberg", "sipa", "getty-creative", "getty-actu", "shutterstock", "adobe-stock", "abacapress", "rea", "pixpalace", "maxppp"];

/*
 * Options réglables par chaque utilisateur (bouton ⚙ de la popup),
 * pour les valeurs propres à une rédaction. Elles s'insèrent dans les
 * adresses ci-dessus avec {opt:id}.
 *   id        nom utilisé dans {opt:id}
 *   label     intitulé dans la page Options
 *   help      explication affichée sous le champ
 *   default   valeur par défaut
 *   pattern   valeurs autorisées (expression régulière) ; sinon : défaut
 */
const OPTIONS = [
  {
    id: "pixpalaceSubdomain",
    label: "Sous-domaine Pixpalace",
    help: "La partie avant « .pixpalace.com » dans l'adresse de votre espace Pixpalace (ex. « www » ou le nom de votre rédaction).",
    default: "www",
    pattern: "^[a-z0-9]([a-z0-9\\-]{0,61}[a-z0-9])?$"
  }
];
