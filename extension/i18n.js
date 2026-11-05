"use strict";
/*
 * Traductions de TabulaPix (français / anglais).
 * La langue suit celle du navigateur, sauf si l'utilisateur en choisit une
 * dans les réglages (clé « lang » : "auto", "fr" ou "en").
 * t("clé", { nom: valeur }) renvoie le texte, avec {nom} remplacé.
 */

const LANG_KEY = "lang";
const LANGS = ["fr", "en"];

const I18N = {
  fr: {
    // Écran de recherche
    "main.pin": "Garder ouvert ⇥",
    "main.pin.title": "Garder TabulaPix ouvert dans une colonne à droite de la fenêtre",
    "main.settings": "Options",
    "main.keywords": "Mots-clés…",
    "main.all": "Tout",
    "main.none": "Aucune",
    "main.go": "Lancer la recherche",
    "main.noAgency": "Cochez au moins une agence.",
    "main.configError": "Erreur de configuration : {error}",
    "main.panelUnavailable": "Panneau latéral indisponible (Chrome 116 ou plus récent requis).",
    "main.panelError": "Impossible d'ouvrir le panneau latéral.",
    "main.handle": "Glisser pour réordonner (ou Alt + ↑ / ↓ sur la case)",
    "main.paste": "coller",
    "main.paste.title": "Mots-clés copiés dans le presse-papiers : collez-les (Ctrl/Cmd+V) dans le champ de recherche du site.",

    // Options
    "opt.title": "Options",
    "opt.back": "← Retour",
    "opt.shown": "Agences affichées",
    "opt.shown.intro": "Décochez celles que vous n'utilisez pas : elles disparaissent de la liste.",
    "opt.tag.custom": "perso",
    "opt.tag.customFill": "perso · champ",
    "opt.tag.modified": "modifiée",
    "opt.edit": "Modifier « {name} »",
    "opt.delete": "Supprimer « {name} »",
    "opt.delete.confirm": "Supprimer l'agence « {name} » ?",
    "opt.deleted": "« {name} » supprimée.",
    "opt.settings": "Réglages",
    "opt.save": "Enregistrer",
    "opt.saved": "Réglages enregistrés.",
    "opt.invalid": "Valeur invalide pour « {label} ».",
    "opt.lang": "Langue",
    "opt.lang.auto": "Automatique (langue du navigateur)",
    "footer.source": "Code source sur GitHub",
    "opt.pixpalaceSubdomain.label": "Sous-domaine Pixpalace",
    "opt.pixpalaceSubdomain.help": "La partie avant « .pixpalace.com » dans l'adresse de votre espace Pixpalace (ex. « www » ou le nom de votre rédaction).",

    // Ajout / modification d'une agence
    "ed.addTitle": "Ajouter une agence",
    "ed.editTitle": "Modifier « {name} »",
    "ed.step1.help": "Faites une recherche sur le site de l'agence, puis collez ici l'adresse de la page de résultats et les mots-clés que vous avez tapés.",
    "ed.detUrl": "Page de résultats",
    "ed.detQ": "Mots-clés cherchés",
    "ed.detQ.placeholder": "ex. Estonie frontière",
    "ed.sampleQuery": "Estonie frontière",
    "ed.detect": "Détecter",
    "ed.manual": "Saisir l'adresse à la main",
    "ed.name": "Nom",
    "ed.url": "Adresse de recherche",
    "ed.url.fill": "Page avec le champ de recherche",
    "ed.url.help": "Vos mots-clés y sont remplacés par <code>{q}</code>.",
    "ed.fill.help": "TabulaPix ouvrira cette page, tapera les mots-clés dans le champ de recherche du site et cliquera sur son bouton. Montrez-lui où ils se trouvent :",
    "ed.chk.field": "Champ de recherche",
    "ed.chk.button": "Bouton de recherche",
    "ed.chk.enter": "Touche Entrée (pas de bouton)",
    "ed.pick": "Repérer le champ sur le site",
    "ed.repick": "Refaire le repérage",
    "ed.pick.permission": "Chrome vous demandera l'autorisation pour ce site.",
    "ed.backToUrl": "Utiliser plutôt une adresse de recherche",
    "ed.tech": "Détails techniques",
    "ed.tech.help": "Pour les sites qui « emballent » la recherche dans l'adresse : <code>{payload}</code> dans l'adresse, le texte modèle contenant <code>{q}</code> ci-dessous, et les étapes d'encodage (<code>uri</code>, <code>hex</code>, <code>gzip</code>, <code>base64</code>) dans l'ordre. <code>{q:slug}</code> écrit les mots avec des tirets (<code>estonie-frontière</code>).",
    "ed.payload": "Modèle (payload)",
    "ed.encode": "Étapes d'encodage",
    "ed.encode.placeholder": "ex. hex   ou   uri, gzip, base64, uri",
    "ed.tech.fill": "Champ : {input} — {button}",
    "ed.tech.fill.button": "bouton : {submit}",
    "ed.tech.fill.enter": "touche Entrée",
    "ed.try": "Essayer",
    "ed.try.title": "Lancer une recherche d'essai dans un nouvel onglet",
    "ed.add": "Ajouter l'agence",
    "ed.saveEdit": "Enregistrer",
    "ed.reset": "Rétablir l'original",
    "ed.cancel": "Annuler",
    "ed.err.nothing": "Rien à ajouter.",
    "ed.err.name": "Indiquez un nom (40 caractères au plus).",
    "ed.err.pickNeeded": "Repérez le champ de recherche sur le site.",
    "ed.err.sameHost": "Pour {name}, l'adresse doit rester sur {host}.",
    "ed.err.invalid": "Agence invalide : vérifiez le nom et l'adresse.",
    "ed.err.max": "{max} agences personnalisées au maximum.",
    "ed.picked.add": "Champ et bouton repérés : vérifiez, puis ajoutez l'agence.",
    "ed.picked.edit": "Champ et bouton repérés : vérifiez, puis enregistrez.",
    "ed.notInUrl": "Les mots-clés ne figurent pas dans l'adresse : TabulaPix remplira le champ de recherche du site.",
    "ed.check.add": "Vérifiez, puis ajoutez l'agence.",
    "ed.check.edit": "Vérifiez, puis enregistrez.",
    "ed.manual.msg": "Saisissez l'adresse de recherche, avec {q} à la place des mots-clés.",
    "ed.permRefused": "Autorisation refusée pour {host} : impossible de remplir son champ de recherche.",
    "ed.pickFailed": "Repérage impossible.",
    "ed.siteOpening": "Le site s'ouvre : cliquez sur son champ de recherche, puis sur son bouton.",
    "ed.tryStarted": "Essai lancé avec « {q} » dans un nouvel onglet.",
    "ed.tryFailed": "Essai impossible.",
    "ed.restored": "« {name} » : adresse d'origine rétablie.",
    "ed.original": "« {name} » : adresse d'origine.",
    "ed.modified": "« {name} » modifiée.",
    "ed.added": "« {name} » ajoutée.",

    // Détection automatique
    "det.noKeywords": "Indiquez les mots-clés que vous aviez cherchés.",
    "det.badUrl": "Adresse invalide : collez l'adresse complète de la page de résultats.",
    "det.https": "L'adresse doit commencer par https://",
    "det.braces": "L'adresse contient déjà des accolades { } : collez l'adresse réelle de la page de résultats.",
    "det.plain.one": "Mots-clés trouvés en clair dans l'adresse.",
    "det.plain.many": "Mots-clés trouvés en clair à {n} endroits de l'adresse.",
    "det.slug": "Mots-clés trouvés avec des tirets à la place des espaces (marqueur {q:slug}).",
    "det.wrapped": "Mots-clés trouvés emballés dans l'adresse. Encodage : {steps}.",
    "det.warn.savedSearch": "L'adresse contient aussi un numéro de recherche enregistrée : il est possible qu'il faille le retirer.",
    "det.warn.session": "L'adresse contient un long numéro (peut-être un numéro de session) : si la recherche cesse de fonctionner, essayez de le retirer de l'adresse.",
    "det.warn.hexCase": "Le site écrit l'hexadécimal en minuscules ; l'extension l'écrit en majuscules (en général sans conséquence).",
    "det.notFound": "Mots-clés introuvables dans l'adresse : ce site ne les y met pas (recherche enregistrée côté serveur, ou page qui ne change pas d'adresse).",

    // Validation des adresses
    "spec.url": "Adresse manquante ou trop longue.",
    "spec.payloadLong": "Modèle trop long (2000 caractères au plus).",
    "spec.encode": "Étapes d'encodage inconnues : utilisez {steps}.",
    "spec.marker": "Marqueur inconnu dans l'adresse : {{marker}}. Utilisez {q}, {q:slug} (ou {payload}).",
    "spec.payloadMissing": "L'adresse contient {payload} : renseignez le modèle.",
    "spec.invalid": "Adresse invalide.",
    "spec.https": "L'adresse doit commencer par https://",
    "spec.step": "Étape d'encodage inconnue : {step}",

    // Script d'arrière-plan et bandeau de repérage
    "bg.invalidAgency": "Agence invalide.",
    "bg.permRefused": "Autorisation refusée pour ce site.",
    "bg.pickExpired": "Repérage expiré : recommencez depuis TabulaPix.",
    "bg.wrongSite": "Ce n'est pas le site prévu.",
    "bg.pickInvalid": "Repérage invalide : recommencez.",
    "bg.badUrl": "Adresse invalide.",
    "bg.https": "Adresse invalide : elle doit commencer par https://",
    "bg.unknownAgency": "Agence inconnue.",
    "bg.sameHost": "L'adresse doit rester sur {host}.",
    "bg.pickInvalidShort": "Repérage invalide.",
    "bg.permMissing": "Autorisation manquante pour ce site : refaites le repérage.",
    "pick.step1": "1/2 — Cliquez sur le champ de recherche du site.",
    "pick.step2": "2/2 — Cliquez sur le bouton qui lance la recherche (loupe, « Rechercher »…).",
    "pick.notField": "Ce n'est pas un champ de saisie : cliquez dans la zone où l'on tape la recherche.",
    "pick.noButton": "Pas de bouton : utiliser Entrée",
    "pick.cancel": "Annuler",
    "pick.close": "Fermer",
    "pick.move": "Déplacer ce bandeau en haut / en bas de l'écran",
    "pick.done": "✓ Champ et bouton repérés. Revenez dans TabulaPix pour vérifier puis ajouter « {name} ».",
    "pick.failed": "Enregistrement impossible : recommencez depuis TabulaPix."
  },

  en: {
    "main.pin": "Keep open ⇥",
    "main.pin.title": "Keep TabulaPix open in a column on the right of the window",
    "main.settings": "Settings",
    "main.keywords": "Keywords…",
    "main.all": "All",
    "main.none": "None",
    "main.go": "Search",
    "main.noAgency": "Tick at least one agency.",
    "main.configError": "Configuration error: {error}",
    "main.panelUnavailable": "Side panel unavailable (Chrome 116 or later required).",
    "main.panelError": "Could not open the side panel.",
    "main.handle": "Drag to reorder (or Alt + ↑ / ↓ on the checkbox)",
    "main.paste": "paste",
    "main.paste.title": "Keywords copied to the clipboard: paste them (Ctrl/Cmd+V) into the site's search field.",

    "opt.title": "Settings",
    "opt.back": "← Back",
    "opt.shown": "Agencies shown",
    "opt.shown.intro": "Untick the ones you don't use: they disappear from the list.",
    "opt.tag.custom": "custom",
    "opt.tag.customFill": "custom · field",
    "opt.tag.modified": "modified",
    "opt.edit": "Edit “{name}”",
    "opt.delete": "Delete “{name}”",
    "opt.delete.confirm": "Delete the agency “{name}”?",
    "opt.deleted": "“{name}” deleted.",
    "opt.settings": "Preferences",
    "opt.save": "Save",
    "opt.saved": "Preferences saved.",
    "opt.invalid": "Invalid value for “{label}”.",
    "opt.lang": "Language",
    "opt.lang.auto": "Automatic (browser language)",
    "footer.source": "Source code on GitHub",
    "opt.pixpalaceSubdomain.label": "Pixpalace subdomain",
    "opt.pixpalaceSubdomain.help": "The part before “.pixpalace.com” in your Pixpalace address (e.g. “www” or your newsroom's name).",

    "ed.addTitle": "Add an agency",
    "ed.editTitle": "Edit “{name}”",
    "ed.step1.help": "Run a search on the agency's website, then paste the address of the results page and the keywords you typed.",
    "ed.detUrl": "Results page",
    "ed.detQ": "Keywords searched",
    "ed.detQ.placeholder": "e.g. Estonia border",
    "ed.sampleQuery": "Estonia border",
    "ed.detect": "Detect",
    "ed.manual": "Type the address by hand",
    "ed.name": "Name",
    "ed.url": "Search address",
    "ed.url.fill": "Page with the search field",
    "ed.url.help": "Your keywords are replaced there by <code>{q}</code>.",
    "ed.fill.help": "TabulaPix will open this page, type the keywords into the site's search field and click its button. Show it where they are:",
    "ed.chk.field": "Search field",
    "ed.chk.button": "Search button",
    "ed.chk.enter": "Enter key (no button)",
    "ed.pick": "Locate the field on the site",
    "ed.repick": "Locate again",
    "ed.pick.permission": "Chrome will ask for permission for this site.",
    "ed.backToUrl": "Use a search address instead",
    "ed.tech": "Technical details",
    "ed.tech.help": "For sites that “wrap” the search in the address: <code>{payload}</code> in the address, the template containing <code>{q}</code> below, and the encoding steps (<code>uri</code>, <code>hex</code>, <code>gzip</code>, <code>base64</code>) in order. <code>{q:slug}</code> writes the words with dashes (<code>estonia-border</code>).",
    "ed.payload": "Template (payload)",
    "ed.encode": "Encoding steps",
    "ed.encode.placeholder": "e.g. hex   or   uri, gzip, base64, uri",
    "ed.tech.fill": "Field: {input} — {button}",
    "ed.tech.fill.button": "button: {submit}",
    "ed.tech.fill.enter": "Enter key",
    "ed.try": "Try",
    "ed.try.title": "Run a test search in a new tab",
    "ed.add": "Add the agency",
    "ed.saveEdit": "Save",
    "ed.reset": "Restore the original",
    "ed.cancel": "Cancel",
    "ed.err.nothing": "Nothing to add.",
    "ed.err.name": "Enter a name (40 characters at most).",
    "ed.err.pickNeeded": "Locate the search field on the site.",
    "ed.err.sameHost": "For {name}, the address must stay on {host}.",
    "ed.err.invalid": "Invalid agency: check the name and address.",
    "ed.err.max": "{max} custom agencies at most.",
    "ed.picked.add": "Field and button located: check, then add the agency.",
    "ed.picked.edit": "Field and button located: check, then save.",
    "ed.notInUrl": "The keywords are not in the address: TabulaPix will fill in the site's search field instead.",
    "ed.check.add": "Check, then add the agency.",
    "ed.check.edit": "Check, then save.",
    "ed.manual.msg": "Type the search address, with {q} in place of the keywords.",
    "ed.permRefused": "Permission refused for {host}: its search field cannot be filled in.",
    "ed.pickFailed": "Could not start locating.",
    "ed.siteOpening": "The site is opening: click its search field, then its button.",
    "ed.tryStarted": "Test search for “{q}” opened in a new tab.",
    "ed.tryFailed": "Test search failed.",
    "ed.restored": "“{name}”: original address restored.",
    "ed.original": "“{name}”: original address.",
    "ed.modified": "“{name}” updated.",
    "ed.added": "“{name}” added.",

    "det.noKeywords": "Enter the keywords you searched for.",
    "det.badUrl": "Invalid address: paste the full address of the results page.",
    "det.https": "The address must start with https://",
    "det.braces": "The address already contains braces { }: paste the real address of the results page.",
    "det.plain.one": "Keywords found as plain text in the address.",
    "det.plain.many": "Keywords found as plain text in {n} places in the address.",
    "det.slug": "Keywords found with dashes instead of spaces ({q:slug} marker).",
    "det.wrapped": "Keywords found wrapped in the address. Encoding: {steps}.",
    "det.warn.savedSearch": "The address also contains a saved-search number: it may need to be removed.",
    "det.warn.session": "The address contains a long number (possibly a session number): if the search stops working, try removing it from the address.",
    "det.warn.hexCase": "The site writes hexadecimal in lower case; the extension writes it in upper case (usually harmless).",
    "det.notFound": "Keywords not found in the address: this site doesn't put them there (search stored on the server, or a page whose address doesn't change).",

    "spec.url": "Address missing or too long.",
    "spec.payloadLong": "Template too long (2000 characters at most).",
    "spec.encode": "Unknown encoding steps: use {steps}.",
    "spec.marker": "Unknown marker in the address: {{marker}}. Use {q}, {q:slug} (or {payload}).",
    "spec.payloadMissing": "The address contains {payload}: fill in the template.",
    "spec.invalid": "Invalid address.",
    "spec.https": "The address must start with https://",
    "spec.step": "Unknown encoding step: {step}",

    "bg.invalidAgency": "Invalid agency.",
    "bg.permRefused": "Permission refused for this site.",
    "bg.pickExpired": "Locating expired: start again from TabulaPix.",
    "bg.wrongSite": "This is not the expected site.",
    "bg.pickInvalid": "Invalid result: please start again.",
    "bg.badUrl": "Invalid address.",
    "bg.https": "Invalid address: it must start with https://",
    "bg.unknownAgency": "Unknown agency.",
    "bg.sameHost": "The address must stay on {host}.",
    "bg.pickInvalidShort": "Invalid field location.",
    "bg.permMissing": "Permission missing for this site: locate the field again.",
    "pick.step1": "1/2 — Click the site's search field.",
    "pick.step2": "2/2 — Click the button that starts the search (magnifier, “Search”…).",
    "pick.notField": "This is not a text field: click in the box where you type the search.",
    "pick.noButton": "No button: use Enter",
    "pick.cancel": "Cancel",
    "pick.close": "Close",
    "pick.move": "Move this banner to the top / bottom of the screen",
    "pick.done": "✓ Field and button located. Go back to TabulaPix to check, then add “{name}”.",
    "pick.failed": "Could not save: start again from TabulaPix."
  }
};

// Langue du navigateur ramenée à une langue disponible (français sinon anglais).
const browserLang = () => (String((typeof navigator !== "undefined" && navigator.language) || "en").toLowerCase().startsWith("fr") ? "fr" : "en");
const resolveLang = (choice) => (LANGS.includes(choice) ? choice : browserLang());

let LANG = browserLang();

// Texte traduit ; {nom} est remplacé par vars.nom ({{nom}} donne {valeur}).
function t(key, vars) {
  let s = (I18N[LANG] && I18N[LANG][key]) ?? I18N.fr[key] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) s = s.split(`{${k}}`).join(String(v));
  }
  return s;
}

// Lit le choix enregistré et fixe LANG. Renvoie le choix ("auto", "fr", "en").
async function loadLang() {
  const { [LANG_KEY]: choice = "auto" } = await chrome.storage.local.get(LANG_KEY);
  LANG = resolveLang(choice);
  return choice;
}

// Applique les traductions aux éléments marqués data-i18n (texte),
// data-i18n-html (texte avec <code>, issu de ce fichier uniquement),
// data-i18n-placeholder et data-i18n-title.
function applyI18n(root = document) {
  document.documentElement.lang = LANG;
  root.querySelectorAll("[data-i18n]").forEach((el) => { el.textContent = t(el.dataset.i18n); });
  root.querySelectorAll("[data-i18n-html]").forEach((el) => { el.innerHTML = t(el.dataset.i18nHtml); });
  root.querySelectorAll("[data-i18n-placeholder]").forEach((el) => { el.placeholder = t(el.dataset.i18nPlaceholder); });
  root.querySelectorAll("[data-i18n-title]").forEach((el) => {
    el.title = t(el.dataset.i18nTitle);
    if (el.hasAttribute("aria-label")) el.setAttribute("aria-label", el.title);
  });
}
