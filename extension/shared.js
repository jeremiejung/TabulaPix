"use strict";
/*
 * Outils partagés par la popup et le script d'arrière-plan :
 * lecture des options et insertion dans les adresses ({opt:id}).
 */

const OPTIONS_KEY = "options";
const OPTION_BY_ID = new Map(OPTIONS.map((o) => [o.id, o]));

// Valeur effective d'une option : celle de l'utilisateur si elle est valide,
// sinon la valeur par défaut.
function optionValue(id, values) {
  const def = OPTION_BY_ID.get(id);
  if (!def) return "";
  const raw = String((values && values[id]) ?? "").trim();
  if (raw === "") return def.default;
  return new RegExp(def.pattern).test(raw) ? raw : def.default;
}

// Remplace les {opt:id} d'une adresse.
function applyOptions(url, values) {
  return url.replace(/\{opt:([A-Za-z0-9_]+)\}/g, (_, id) => encodeURIComponent(optionValue(id, values)));
}

async function loadOptions() {
  const data = await chrome.storage.local.get({ [OPTIONS_KEY]: {} });
  return data[OPTIONS_KEY] || {};
}

/* ---------- Agences personnalisées, modifiées et masquées ---------- */

const CUSTOM_KEY = "customAgencies";
const OVERRIDES_KEY = "agencyOverrides";
const HIDDEN_KEY = "hiddenAgencies";
const REMOVED_KEY = "removedAgencies"; // agences fournies supprimées par l'utilisateur
const MAX_CUSTOM = 30;
const ENCODE_STEPS = ["uri", "hex", "gzip", "base64"];

// Lit une liste d'étapes d'encodage (« uri, gzip, base64 » ou tableau).
function parseEncode(value) {
  const list = Array.isArray(value) ? value : String(value || "").split(/[\s,;>→]+/);
  const steps = list.map((x) => String(x).trim().toLowerCase()).filter(Boolean);
  if (steps.length > 8 || steps.some((x) => !ENCODE_STEPS.includes(x))) return null;
  return steps;
}

// Vérifie une adresse de recherche (+ modèle et encodage facultatifs).
// Renvoie { spec } si tout va bien, sinon { error } (message pour l'utilisateur).
function checkSpec(raw, { allowOptions = false } = {}) {
  const url = String(raw.url || "").trim();
  const payload = String(raw.payload || "");
  const encode = parseEncode(raw.encode);
  if (!url || url.length > 2000) return { error: t("spec.url") };
  if (payload.length > 2000) return { error: t("spec.payloadLong") };
  if (!encode) return { error: t("spec.encode", { steps: ENCODE_STEPS.join(", ") }) };
  for (const [, inner] of url.matchAll(/\{([^}]*)\}/g)) {
    if (inner === "q" || inner === "q:slug" || inner === "payload") continue;
    const opt = inner.match(/^opt:([A-Za-z0-9_]+)$/);
    if (opt && allowOptions && OPTION_BY_ID.has(opt[1])) continue;
    return { error: t("spec.marker", { marker: inner }) };
  }
  if (url.includes("{payload}") && !payload) return { error: t("spec.payloadMissing") };
  let u;
  try { u = new URL(url.replace(/\{[^}]*\}/g, "x")); } catch (_) { return { error: t("spec.invalid") }; }
  if (u.protocol !== "https:" || !u.hostname) return { error: t("spec.https") };
  const spec = { url };
  if (url.includes("{payload}")) { spec.payload = payload; spec.encode = encode; }
  return { spec };
}

// Champ et bouton repérés sur un site (sélecteurs CSS) : copie propre, ou null.
function cleanFill(f) {
  if (!f || typeof f !== "object") return null;
  const input = String(f.input || "").trim();
  const submit = String(f.submit || "").trim();
  if (!input || input.length > 500 || submit.length > 500) return null;
  const out = submit ? { input, submit } : { input };
  // Délai propre à certains sites lents (ex. Bloomberg), borné à 10 s.
  if (Number.isFinite(f.delay) && f.delay >= 0 && f.delay <= 10000) out.delay = f.delay;
  return out;
}

// Page de connexion d'une agence : adresse https complète, ou null.
function cleanLogin(v) {
  const url = String(v || "").trim();
  if (!url || url.length > 2000 || /[{}]/.test(url)) return null;
  try { const u = new URL(url); return u.protocol === "https:" && u.hostname ? u.href : null; } catch (_) { return null; }
}

// Agence ajoutée par l'utilisateur : copie propre, ou null.
function cleanCustomAgency(a) {
  if (!a || typeof a !== "object") return null;
  const id = String(a.id || "");
  const name = String(a.name || "").trim();
  if (!/^custom-[a-z0-9]{4,20}$/.test(id) || !name || name.length > 40) return null;
  const fill = a.fill ? cleanFill(a.fill) : null;
  if (a.fill && !fill) return null;
  const { spec } = checkSpec(a);
  if (!spec) return null;
  const login = cleanLogin(a.login); // page de connexion invalide : simplement ignorée
  return { id, name, ...spec, ...(fill ? { fill } : {}), ...(login ? { login } : {}), custom: true };
}

// Origine (pour l'autorisation Chrome) d'une agence à remplissage.
const originPattern = (host) => `https://${host}/*`;

// Nom de domaine d'une adresse (marqueurs neutralisés, options appliquées).
function hostOf(url, options) {
  try { return new URL(applyOptions(url, options).replace(/\{(q|q:slug|payload)\}/g, "x")).hostname; }
  catch (_) { return null; }
}

// Agence intégrée + modification de l'utilisateur, traitée comme une agence
// ajoutée : autre adresse, autre site, passage en « remplir le champ »
// (override.fill = repères) ou en « adresse de recherche » (override.fill = false).
// Le délai propre au site (Bloomberg) n'est gardé que sur le même site, comme
// la page de connexion livrée et la détection de la page « sans session ».
// override.login : autre page de connexion, ou false = aucune.
function applyOverride(agency, override, options) {
  if (!override || typeof override !== "object") return agency;
  const { spec } = checkSpec(override, { allowOptions: true });
  if (!spec) return agency;
  const sameHost = hostOf(spec.url, options) === hostOf(agency.url, options);
  const picked = override.fill && typeof override.fill === "object" ? cleanFill(override.fill) : null;
  // Agence qui remplit un champ, déplacée sur un autre site sans nouveau repérage : ignorée.
  if (agency.fill && override.fill !== false && !picked && !sameHost) return agency;
  const out = { ...agency, url: spec.url, modified: true };
  const name = String(override.name || "").trim();
  if (name && name.length <= 40) out.name = name; // agence fournie renommée
  delete out.payload; delete out.encode;
  if (spec.payload !== undefined) { out.payload = spec.payload; out.encode = spec.encode; }
  if (!sameHost) { delete out.login; delete out.loggedOutTitle; }
  const login = cleanLogin(override.login);
  if (override.login === false) { delete out.login; delete out.loggedOutTitle; }
  else if (login && (login !== agency.login || !sameHost)) { out.login = login; delete out.loggedOutTitle; }
  if (override.fill === false) delete out.fill;
  else if (picked) {
    delete picked.delay;
    const delay = agency.fill && sameHost ? agency.fill.delay : undefined;
    out.fill = delay !== undefined ? { ...picked, delay } : picked;
  }
  return out;
}

// Toutes les agences effectives (intégrées éventuellement modifiées +
// personnalisées valides) et la liste des masquées.
async function loadAgencies(options) {
  const data = await chrome.storage.local.get({ [CUSTOM_KEY]: [], [OVERRIDES_KEY]: {}, [HIDDEN_KEY]: [], [REMOVED_KEY]: [] });
  if (!options) options = await loadOptions();
  const overrides = data[OVERRIDES_KEY] && typeof data[OVERRIDES_KEY] === "object" ? data[OVERRIDES_KEY] : {};
  const removed = new Set(Array.isArray(data[REMOVED_KEY]) ? data[REMOVED_KEY] : []);
  const builtin = AGENCIES.filter((a) => !removed.has(a.id)).map((a) => applyOverride(a, overrides[a.id], options));
  const custom = (Array.isArray(data[CUSTOM_KEY]) ? data[CUSTOM_KEY] : [])
    .map(cleanCustomAgency).filter(Boolean).slice(0, MAX_CUSTOM);
  return {
    all: builtin.concat(custom),
    custom,
    overrides,
    removed,
    hidden: new Set(Array.isArray(data[HIDDEN_KEY]) ? data[HIDDEN_KEY] : [])
  };
}

// Agences fournies « masquées par défaut » (defaultHidden) : masquées la
// première fois qu'elles apparaissent (installation ou mise à jour), puis le
// choix de l'utilisateur est respecté. SEEN_KEY retient les agences déjà vues.
const SEEN_KEY = "seenAgencies";
const FOLDERS_DONE_KEY = "shippedFoldersDone"; // rangement proposé déjà appliqué (ou écarté)
const NEW_KEY = "newAgencies"; // { id: ouvertures restantes } : pastille « Nouveau »
const NEW_OPENS = 5;
const TAB_GROUPS_KEY = "tabGroups"; // { enabled, collapsed } : onglets regroupés par dossier (désactivé par défaut)
const TAB_GROUPS_PERMISSION = { permissions: ["tabGroups"] }; // facultative : demandée en cochant l'option
async function applyNewAgencyDefaults() {
  const data = await chrome.storage.local.get({ [SEEN_KEY]: [], [HIDDEN_KEY]: [], [REMOVED_KEY]: [], [CUSTOM_KEY]: [],
    [FOLDERS_KEY]: [], [FOLDER_OF_KEY]: {}, [STORAGE_KEYS.order]: [], [FOLDERS_DONE_KEY]: false, [NEW_KEY]: {} });
  const seen = new Set(Array.isArray(data[SEEN_KEY]) ? data[SEEN_KEY] : []);
  const fresh = AGENCIES.filter((a) => !seen.has(a.id));
  if (!fresh.length && data[FOLDERS_DONE_KEY]) return;
  const hidden = new Set(Array.isArray(data[HIDDEN_KEY]) ? data[HIDDEN_KEY] : []);
  for (const a of fresh) if (a.defaultHidden) hidden.add(a.id);
  // Agence livrée que l'utilisateur avait déjà ajoutée lui-même (même adresse,
  // paramètres compris, ou même site et même nom) : on garde la sienne, et la
  // livrée est mise de côté comme une agence supprimée (« Restaurer » dans les options).
  const removed = new Set(Array.isArray(data[REMOVED_KEY]) ? data[REMOVED_KEY] : []);
  const custom = (Array.isArray(data[CUSTOM_KEY]) ? data[CUSTOM_KEY] : []).filter((c) => c && typeof c.url === "string");
  const twinOf = new Map(); // agence livrée → agence ajoutée qui la remplace
  if (seen.size && custom.length) { // pas à la première installation : rien d'ajouté à la main
    const options = await loadOptions();
    for (const a of fresh) {
      const twin = custom.find((c) => sameAgencySite(a, c, options));
      if (twin) { removed.add(a.id); twinOf.set(a.id, twin.id); }
    }
  }
  const update = { [SEEN_KEY]: AGENCIES.map((a) => a.id), [HIDDEN_KEY]: [...hidden], [REMOVED_KEY]: [...removed] };
  // Chez un utilisateur existant, les nouvelles agences vont en fin de liste,
  // regroupées (et non intercalées entre les siennes, qui gardent leur place).
  const stored = Array.isArray(data[STORAGE_KEYS.order]) ? data[STORAGE_KEYS.order] : [];
  if (seen.size && fresh.length) {
    const freshIds = new Set(fresh.map((a) => a.id));
    // Jamais réordonné : sa liste suivait l'ordre livré — celui de la 3.4.1 s'il
    // arrive d'avant les dossiers livrés, sinon celui de config.js (sans les nouvelles).
    const shipped = AGENCIES.map((a) => a.id).filter((id) => !freshIds.has(id));
    const base = stored.length ? stored
      : data[FOLDERS_DONE_KEY] ? shipped
      : LEGACY_ORDER.concat(shipped.filter((id) => !LEGACY_ORDER.includes(id)));
    update[STORAGE_KEYS.order] = base.filter((id) => !freshIds.has(id)).concat(fresh.map((a) => a.id));
  }

  // Dossiers livrés (FOLDERS, config.js).
  let folders = Array.isArray(data[FOLDERS_KEY]) ? data[FOLDERS_KEY] : [];
  const folderOf = data[FOLDER_OF_KEY] && typeof data[FOLDER_OF_KEY] === "object" ? { ...data[FOLDER_OF_KEY] } : {};
  const place = (a) => { // l'agence (ou celle qui la remplace) dans son dossier livré
    if (!a.folder || !folders.some((f) => f.id === a.folder)) return;
    const id = twinOf.get(a.id) || a.id;
    if (!folderOf[id]) folderOf[id] = a.folder;
  };
  if (!data[FOLDERS_DONE_KEY]) {
    // Une seule fois (installation, ou première ouverture de cette version).
    if (!folders.length) {
      // Aucun dossier créé : on propose le rangement livré. Cases, masquage,
      // noms et ordre relatif restent ceux de l'utilisateur ; ses agences
      // ajoutées restent hors dossier (sauf celles qui remplacent une livrée).
      const lang = typeof LANG === "string" ? LANG : "fr";
      folders = FOLDERS.map((f) => ({ id: f.id, name: f.name[lang] || f.name.fr, color: f.color }));
      for (const a of AGENCIES) place(a);
      update[FOLDERS_KEY] = folders;
    } else if (seen.size && !stored.length && !update[STORAGE_KEYS.order]) {
      // Il a ses dossiers mais n'a jamais réordonné : on fige l'ordre d'avant
      // (le nouvel ordre de config.js ne doit pas mélanger sa liste).
      update[STORAGE_KEYS.order] = LEGACY_ORDER.filter((id) => AGENCIES.some((a) => a.id === id));
    }
    update[FOLDERS_DONE_KEY] = true;
  } else {
    // Mises à jour suivantes : une nouvelle agence livrée va dans son dossier
    // s'il existe encore chez l'utilisateur (même renommé) ; sinon, hors dossier.
    for (const a of fresh) if (!removed.has(a.id) || twinOf.has(a.id)) place(a);
  }
  if (!data[FOLDERS_DONE_KEY] || fresh.length) update[FOLDER_OF_KEY] = folderOf;
  // Pastille « Nouveau » sur les agences arrivées avec une mise à jour (pas à
  // la première installation, où tout est nouveau), pour quelques ouvertures.
  const arrived = seen.size ? fresh.filter((a) => !removed.has(a.id)) : [];
  if (arrived.length) {
    const marks = data[NEW_KEY] && typeof data[NEW_KEY] === "object" ? { ...data[NEW_KEY] } : {};
    for (const a of arrived) marks[a.id] = NEW_OPENS;
    update[NEW_KEY] = marks;
  }
  await chrome.storage.local.set(update);
}

// Adresse ramenée à l'essentiel pour comparer deux agences : « www. » ignoré,
// paramètres triés, la valeur qui contient les mots-clés remplacée par « * »
// (getty…/image?family=editorial&phrase={q} ≠ getty…/image?family=creative&phrase={q}).
function siteOf(url, options) {
  try {
    const u = new URL(applyOptions(url, options).replace(/\{(q|q:slug|payload)\}/g, "tpkw"));
    const norm = (params) => [...params].map(([k, v]) => `${k.toLowerCase()}=${v.includes("tpkw") ? "*" : v}`).sort().join("&");
    const hash = u.hash.replace(/tpkw/g, "*");
    return {
      host: u.hostname.toLowerCase().replace(/^www\./, ""),
      key: [u.pathname.replace(/tpkw/g, "*").replace(/\/+$/, "").toLowerCase(), norm(u.searchParams), hash].join("|")
    };
  } catch (_) { return null; }
}
// Même agence ? Même site, et même adresse (paramètres compris) ou même nom.
// Dans le doute, non : un doublon visible vaut mieux qu'une agence mise de côté à tort.
function sameAgencySite(builtin, custom, options) {
  const a = siteOf(builtin.url, options), b = siteOf(custom.url, options);
  if (!a || !b || a.host !== b.host) return false;
  return a.key === b.key || String(builtin.name).trim().toLowerCase() === String(custom.name || "").trim().toLowerCase();
}

/* ---------- Fichier de configuration (export / import) ---------- */
/*
 * Format JSON versionné, pour sauvegarder la configuration hors de
 * l'extension ou la partager entre collègues :
 *   { format: "tabulapix-config", formatVersion, minReaderVersion,
 *     exportedAt, app, settings: { language, options, tabGroups? },
 *     folders: [ { id, name, color?, collapsed?, hidden? } ], // dossiers d'agences
 *     agencies: [ … dans l'ordre de la liste … ],
 *     removedBuiltins: [ … agences fournies supprimées … ] }
 * Chaque agence : { id, builtin, name, checked, hidden, folder? } et, si
 * elle est ajoutée ou modifiée, url / payload / encode / fill / login
 * (page de connexion ; false = celle de l'agence fournie retirée).
 * La dernière recherche n'est jamais exportée.
 *
 * Compatibilité entre versions :
 * - une version ne fait qu'AJOUTER des champs facultatifs, jamais changer le
 *   sens d'un champ existant (formatVersion augmente) ; une version plus
 *   ancienne lit donc un fichier plus récent en ignorant ce qu'elle ne
 *   connaît pas, et une version plus récente lit les anciens fichiers en
 *   donnant leur valeur par défaut aux champs absents ;
 * - seul un changement incompatible (à éviter) augmenterait
 *   minReaderVersion : un lecteur plus ancien refuse alors le fichier ;
 * - les dossiers sont conservés tels quels même par une version qui ne les
 *   affiche pas encore, pour ne rien perdre lors des échanges.
 * L'état coché d'un dossier n'est pas enregistré : il se déduit de ses
 * agences (toutes cochées, aucune, ou certaines = à moitié coché).
 */
const CONFIG_FORMAT = "tabulapix-config";
const CONFIG_FORMAT_VERSION = 5; // version du format écrit par cette extension (2 : dossiers repliés ; 3 : dossiers masqués ; 4 : page de connexion ; 5 : groupes d'onglets)
const CONFIG_READER_VERSION = 1; // plus haut minReaderVersion que cette extension sait lire
const CONFIG_MAX_BYTES = 1024 * 1024;
const FOLDERS_KEY = "agencyFolders";     // [ { id, name, color?, collapsed?, hidden? } ]
const FOLDER_OF_KEY = "agencyFolderOf";  // { idAgence: idDossier }
const STORAGE_KEYS = {
  checked: "checkedAgencies", order: "agencyOrder", query: "lastQuery", seen: "seenAgencies"
};

// Dossiers : liste propre (id court, nom de 60 caractères au plus, replié ou non).
// Couleurs proposées pour les dossiers (noms stables, enregistrés tels quels).
const FOLDER_COLORS = ["blue", "teal", "green", "amber", "orange", "red", "pink", "violet", "gray"];

function cleanFolders(list) {
  const out = [], ids = new Set();
  for (const f of Array.isArray(list) ? list.slice(0, 100) : []) {
    if (!f || typeof f !== "object") continue;
    const id = String(f.id || "");
    const name = String(f.name || "").trim();
    if (!/^[A-Za-z0-9][A-Za-z0-9_-]{0,39}$/.test(id) || ids.has(id) || !name || name.length > 60) continue;
    ids.add(id);
    const folder = { id, name };
    if (FOLDER_COLORS.includes(f.color)) folder.color = f.color;
    if (f.collapsed === true) folder.collapsed = true;
    if (f.hidden === true) folder.hidden = true;
    out.push(folder);
  }
  return out;
}

async function buildConfigExport() {
  const data = await chrome.storage.local.get({
    [STORAGE_KEYS.checked]: null, [STORAGE_KEYS.order]: [], [CUSTOM_KEY]: [], [OVERRIDES_KEY]: {},
    [HIDDEN_KEY]: [], [REMOVED_KEY]: [], [OPTIONS_KEY]: {}, [LANG_KEY]: "auto",
    [FOLDERS_KEY]: [], [FOLDER_OF_KEY]: {}, [TAB_GROUPS_KEY]: {}
  });
  const folders = cleanFolders(data[FOLDERS_KEY]);
  const folderIds = new Set(folders.map((f) => f.id));
  const folderOf = data[FOLDER_OF_KEY] && typeof data[FOLDER_OF_KEY] === "object" ? data[FOLDER_OF_KEY] : {};
  const removed = new Set(Array.isArray(data[REMOVED_KEY]) ? data[REMOVED_KEY] : []);
  const custom = (Array.isArray(data[CUSTOM_KEY]) ? data[CUSTOM_KEY] : []).map(cleanCustomAgency).filter(Boolean);
  const checked = new Set(Array.isArray(data[STORAGE_KEYS.checked])
    ? data[STORAGE_KEYS.checked] : AGENCIES.filter((a) => a.defaultChecked !== false).map((a) => a.id));
  const hidden = new Set(Array.isArray(data[HIDDEN_KEY]) ? data[HIDDEN_KEY] : []);
  const overrides = data[OVERRIDES_KEY] && typeof data[OVERRIDES_KEY] === "object" ? data[OVERRIDES_KEY] : {};

  // Ordre : celui de l'utilisateur, puis les agences qu'il ne contient pas.
  const all = AGENCIES.filter((a) => !removed.has(a.id)).map((a) => ({ a, builtin: true }))
    .concat(custom.map((a) => ({ a, builtin: false })));
  const byId = new Map(all.map((x) => [x.a.id, x]));
  const order = [];
  for (const id of Array.isArray(data[STORAGE_KEYS.order]) ? data[STORAGE_KEYS.order] : []) if (byId.has(id) && !order.includes(id)) order.push(id);
  for (const x of all) if (!order.includes(x.a.id)) order.push(x.a.id);

  const agencies = order.map((id) => {
    const { a, builtin } = byId.get(id);
    const entry = { id, builtin, name: a.name, checked: checked.has(id), hidden: hidden.has(id) };
    if (folderIds.has(folderOf[id])) entry.folder = folderOf[id];
    const src = builtin ? overrides[id] : a;
    if (builtin && src && typeof src === "object") {
      for (const k of ["name", "url", "payload", "encode", "fill", "login"]) if (src[k] !== undefined) entry[k] = src[k];
    } else if (!builtin) {
      for (const k of ["url", "payload", "encode", "fill", "login"]) if (a[k] !== undefined) entry[k] = a[k];
    }
    return entry;
  });
  return {
    format: CONFIG_FORMAT,
    formatVersion: CONFIG_FORMAT_VERSION,
    minReaderVersion: 1,
    exportedAt: new Date().toISOString(),
    app: { name: "TabulaPix", version: chrome.runtime.getManifest().version },
    settings: { language: data[LANG_KEY], options: data[OPTIONS_KEY] || {}, tabGroups: await exportedTabGroups(data[TAB_GROUPS_KEY]) },
    folders,
    agencies,
    removedBuiltins: AGENCIES.filter((a) => removed.has(a.id)).map((a) => a.id)
  };
}

// Vérifie un fichier importé (il peut venir d'un collègue : rien n'est pris
// tel quel) et le traduit en valeurs à enregistrer.
// Renvoie { storage, summary, hosts } ou { error }.
function parseConfigImport(file) {
  if (!file || typeof file !== "object" || file.format !== CONFIG_FORMAT || !Array.isArray(file.agencies)) {
    return { error: "backup.err.format" };
  }
  // Versions : un fichier plus récent est lu en ignorant ce qui est inconnu,
  // sauf s'il exige un lecteur plus récent (minReaderVersion).
  const formatVersion = file.formatVersion === undefined ? 1 : file.formatVersion;
  if (!Number.isInteger(formatVersion) || formatVersion < 1) return { error: "backup.err.format" };
  const minReader = file.minReaderVersion === undefined ? 1 : file.minReaderVersion;
  if (!Number.isInteger(minReader) || minReader < 1) return { error: "backup.err.format" };
  if (minReader > CONFIG_READER_VERSION) return { error: "backup.err.newer" };
  const newer = formatVersion > CONFIG_FORMAT_VERSION;

  // Réglages
  const settings = file.settings && typeof file.settings === "object" ? file.settings : {};
  const options = {};
  const rawOptions = settings.options && typeof settings.options === "object" ? settings.options : {};
  for (const o of OPTIONS) {
    const v = String(rawOptions[o.id] ?? "").trim();
    if (v && new RegExp(o.pattern).test(v)) options[o.id] = v;
  }
  const lang = ["auto", ...LANGS].includes(settings.language) ? settings.language : "auto";
  // Groupes d'onglets (format 5) : absent d'un fichier plus ancien.
  const tg = settings.tabGroups && typeof settings.tabGroups === "object" ? settings.tabGroups : null;
  const tabGroups = tg ? { enabled: tg.enabled === true, collapsed: tg.collapsed === true } : null;

  // Agences
  const builtinById = new Map(AGENCIES.map((a) => [a.id, a]));
  const removed = new Set((Array.isArray(file.removedBuiltins) ? file.removedBuiltins : []).filter((id) => builtinById.has(id)));
  const order = [], checked = [], hidden = [], custom = [], overrides = {}, seen = new Set(removed);
  const folders = cleanFolders(file.folders);
  const folderIds = new Set(folders.map((f) => f.id));
  const folderOf = {};
  let skipped = 0, unknown = 0;
  for (const e of file.agencies.slice(0, 200)) {
    if (!e || typeof e !== "object") { skipped++; continue; }
    if (e.builtin === true) {
      const original = builtinById.get(e.id);
      if (!original) { unknown++; continue; } // agence fournie par une autre version
      if (removed.has(e.id) || order.includes(e.id)) { skipped++; continue; }
      seen.add(e.id);
      const hasOverride = ["name", "url", "payload", "encode", "fill", "login"].some((k) => e[k] !== undefined)
        && (e.name !== original.name || e.url !== undefined || e.fill !== undefined || e.login !== undefined);
      if (hasOverride) {
        const ov = { url: e.url !== undefined ? e.url : original.url };
        if (e.payload !== undefined) { ov.payload = e.payload; ov.encode = e.encode; }
        else if (e.url === undefined && original.payload !== undefined) { ov.payload = original.payload; ov.encode = original.encode; }
        if (e.fill === false && original.fill) ov.fill = false; // passée en « adresse de recherche »
        else if (e.fill && typeof e.fill === "object") { const f = cleanFill(e.fill); if (f) { delete f.delay; ov.fill = f; } }
        const name = String(e.name || "").trim();
        if (name && name !== original.name && name.length <= 40) ov.name = name;
        if (e.login === false && original.login) ov.login = false; // page de connexion livrée retirée
        else { const login = cleanLogin(e.login); if (login && login !== original.login) ov.login = login; }
        const applied = applyOverride(original, ov, options);
        if (applied.modified) {
          const { spec } = checkSpec(ov, { allowOptions: true });
          overrides[e.id] = { ...spec, ...(ov.fill !== undefined ? { fill: ov.fill } : {}), ...(ov.name ? { name: ov.name } : {}), ...(ov.login !== undefined ? { login: ov.login } : {}) };
        }
      }
    } else {
      if (custom.length >= MAX_CUSTOM) { skipped++; continue; }
      let id = String(e.id || "");
      if (!/^custom-[a-z0-9]{4,20}$/.test(id) || order.includes(id)) {
        id = "custom-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      }
      const agency = cleanCustomAgency({ ...e, id });
      if (!agency) { skipped++; continue; }
      const { custom: _c, ...stored } = agency;
      custom.push(stored);
      e.id = id;
    }
    order.push(e.id);
    if (e.checked === true) checked.push(e.id);
    if (e.hidden === true) hidden.push(e.id);
    if (folderIds.has(e.folder)) folderOf[e.id] = e.folder;
  }

  // Aucune agence utilisable : on ne remplace pas la configuration par du vide.
  if (!order.length) return { error: "backup.err.empty" };

  // Sites dont il faudra accorder l'autorisation : agences qui remplissent un
  // champ (ajoutées, ou fournies déplacées sur un autre site ; Chrome ne
  // redemande rien pour les sites déjà autorisés par le manifeste).
  const fillHosts = custom.filter((a) => a.fill).map((a) => hostOf(a.url, {}))
    .concat(Object.values(overrides).filter((ov) => ov.fill && typeof ov.fill === "object").map((ov) => hostOf(ov.url, options)));
  const hosts = [...new Set(fillHosts.filter(Boolean))];
  return {
    storage: {
      [STORAGE_KEYS.checked]: checked, [STORAGE_KEYS.order]: order, [HIDDEN_KEY]: hidden,
      [REMOVED_KEY]: [...removed], [CUSTOM_KEY]: custom, [OVERRIDES_KEY]: overrides,
      [OPTIONS_KEY]: options, [LANG_KEY]: lang, [STORAGE_KEYS.seen]: [...seen],
      [FOLDERS_KEY]: folders, [FOLDER_OF_KEY]: folderOf, ...(tabGroups ? { [TAB_GROUPS_KEY]: tabGroups } : {})
    },
    // Retirées « pour de vrai » : sans compter les doublons d'une agence ajoutée du fichier.
    summary: { agencies: order.length, custom: custom.length, folders: folders.length, removed: AGENCIES.filter((a) => removed.has(a.id) && !custom.some((c) => sameAgencySite(a, c, options))).length, modified: Object.keys(overrides).length, checked: checked.length, hidden: hidden.length, skipped, unknown, newer },
    hosts
  };
}

// Option « groupes d'onglets » telle qu'elle s'applique : sans l'autorisation
// de Chrome, elle est sans effet, donc exportée désactivée.
async function exportedTabGroups(pref) {
  const p = pref && typeof pref === "object" ? pref : {};
  let granted = false;
  try { granted = await chrome.permissions.contains(TAB_GROUPS_PERMISSION); } catch (_) { /* rien */ }
  return { enabled: p.enabled === true && granted, collapsed: p.collapsed === true };
}

/* ---------- Import choisi : quoi, et comment ---------- */
/*
 * L'utilisateur choisit ce qu'il importe (parts) et comment (mode) :
 *   parts : agencies (agences ajoutées, modifications et suppressions des
 *           agences fournies, ordre), selection (cases cochées et agences
 *           masquées), folders (dossiers, couleurs, rangement), settings
 *           (langue, options, groupes d'onglets) ;
 *   mode  : "replace" — chaque partie choisie remplace la sienne, le reste
 *           ne change pas ; "add" — seul ce qui manque est ajouté (agences
 *           ajoutées, agences fournies supprimées chez l'utilisateur, dossiers),
 *           rien n'est retiré ni modifié ;
 *   settings : réglages remplacés (IMPORT_SETTINGS), tous par défaut.
 * current : valeurs actuelles (chrome.storage.local) ; parsed : résultat de
 * parseConfigImport. Renvoie { storage (valeurs à écrire), hosts (sites à
 * autoriser), report }.
 */
const IMPORT_PARTS = ["agencies", "selection", "folders", "settings"];
const IMPORT_ADD_PARTS = ["agencies", "folders"]; // seules parties qui ont un sens en mode « ajouter »
// Réglages qu'on peut remplacer un par un : langue, chaque option, groupes d'onglets.
const IMPORT_SETTINGS = ["language", ...OPTIONS.map((o) => "opt:" + o.id), "tabGroups"];

function mergeConfigImport(current, parsed, { mode, parts, settings = IMPORT_SETTINGS }) {
  const F = parsed.storage;
  const want = new Set((parts || []).filter((p) => (mode === "add" ? IMPORT_ADD_PARTS : IMPORT_PARTS).includes(p)));
  const arr = (v) => (Array.isArray(v) ? v : []);
  const obj = (v) => (v && typeof v === "object" && !Array.isArray(v) ? v : {});
  const options = obj(current[OPTIONS_KEY]);

  // État actuel
  let custom = arr(current[CUSTOM_KEY]).map(cleanCustomAgency).filter(Boolean).map(({ custom: _c, ...a }) => a);
  let overrides = obj(current[OVERRIDES_KEY]);
  let removed = arr(current[REMOVED_KEY]);
  let seen = arr(current[STORAGE_KEYS.seen]);
  let checked = Array.isArray(current[STORAGE_KEYS.checked]) ? current[STORAGE_KEYS.checked]
    : AGENCIES.filter((a) => a.defaultChecked !== false).map((a) => a.id); // jamais enregistré : cases livrées
  let hidden = arr(current[HIDDEN_KEY]);
  let folders = cleanFolders(current[FOLDERS_KEY]);
  let folderOf = { ...obj(current[FOLDER_OF_KEY]) };
  const idsOf = (rem, cus) => AGENCIES.filter((a) => !rem.includes(a.id)).map((a) => a.id).concat(cus.map((a) => a.id));
  const before = new Set(idsOf(removed, custom));
  // Ordre affiché : celui de l'utilisateur, puis les agences qu'il ne contient pas.
  const stored = arr(current[STORAGE_KEYS.order]);
  let order = stored.filter((id) => before.has(id));
  for (const id of before) if (!order.includes(id)) order.push(id);

  const out = { [FOLDERS_DONE_KEY]: true };
  const report = { mode, parts: [...want], agenciesAdded: 0, restored: 0, present: 0, dupes: 0, full: 0, foldersAdded: 0, foldersPresent: 0, filed: 0, added: [], taken: [] };
  let hosts = [];
  const fileKnows = new Set(arr(F[STORAGE_KEYS.order]));
  const fileChecked = new Set(arr(F[STORAGE_KEYS.checked]));
  const fileHidden = new Set(arr(F[HIDDEN_KEY]));
  const fileFolderOf = obj(F[FOLDER_OF_KEY]);
  const fileFolders = cleanFolders(F[FOLDERS_KEY]);

  // Dossier du fichier → dossier de l'utilisateur (même id, sinon même nom).
  const norm = (s) => String(s).trim().toLowerCase();
  const folderMap = new Map();
  const matchFolders = () => {
    for (const f of fileFolders) {
      const mine = folders.find((x) => x.id === f.id) || folders.find((x) => norm(x.name) === norm(f.name));
      if (mine) folderMap.set(f.id, mine.id);
    }
  };

  if (mode === "add") {
    matchFolders();
    if (want.has("folders")) {
      const ids = new Set(folders.map((f) => f.id));
      for (const f of fileFolders) {
        if (folderMap.has(f.id)) { report.foldersPresent++; continue; }
        if (folders.length >= MAX_FOLDERS) continue;
        const id = ids.has(f.id) ? newFolderId() : f.id;
        ids.add(id);
        folders.push({ ...f, id });
        folderMap.set(f.id, id);
        report.foldersAdded++;
      }
      // Vos agences hors dossier vont dans le dossier que leur donne le fichier ;
      // celles déjà rangées restent où elles sont.
      const folderIds = new Set(folders.map((f) => f.id));
      for (const id of before) {
        if (folderIds.has(folderOf[id])) continue;
        const target = folderMap.get(fileFolderOf[id]);
        if (target) { folderOf[id] = target; report.filed++; }
      }
    }
    if (want.has("agencies")) {
      // Agences effectives de l'utilisateur, pour reconnaître celles qu'il a déjà.
      const mine = AGENCIES.filter((a) => !removed.includes(a.id)).map((a) => applyOverride(a, overrides[a.id], options)).concat(custom);
      const ids = new Set(before);
      // Agences fournies que le fichier a et que l'utilisateur a supprimées : elles
      // reviennent, avec l'état, le dossier et les réglages qu'elles ont dans le fichier.
      const fileRemoved = new Set(arr(F[REMOVED_KEY]));
      const fileOverrides = obj(F[OVERRIDES_KEY]);
      for (const a of AGENCIES) {
        if (!fileKnows.has(a.id) || fileRemoved.has(a.id)) continue;
        if (!removed.includes(a.id)) {
          // Code de partage : les réglages d'une agence fournie que l'utilisateur
          // n'a pas modifiée sont repris (c'est ce que le collègue voulait transmettre).
          if (parsed.share && fileOverrides[a.id] && !overrides[a.id]) {
            overrides = { ...overrides, [a.id]: fileOverrides[a.id] };
            const effective = applyOverride(a, overrides[a.id], options);
            if (effective.fill) { const h = hostOf(effective.url, options); if (h) hosts.push(h); }
            report.taken.push(effective.name);
          } else report.present++;
          continue;
        }
        removed = removed.filter((id) => id !== a.id);
        if (fileOverrides[a.id]) overrides = { ...overrides, [a.id]: fileOverrides[a.id] };
        const effective = applyOverride(a, overrides[a.id], options);
        mine.push(effective);
        ids.add(a.id);
        order.push(a.id);
        if (fileChecked.has(a.id)) checked = checked.concat(a.id);
        if (fileHidden.has(a.id)) hidden = hidden.concat(a.id);
        const target = folderMap.get(fileFolderOf[a.id]);
        if (target) folderOf[a.id] = target;
        if (effective.fill) { const h = hostOf(effective.url, options); if (h) hosts.push(h); }
        report.restored++;
        report.added.push(effective.name);
      }
      for (const f of arr(F[CUSTOM_KEY])) {
        if (mine.some((m) => sameAgencySite(m, f, options))) { report.dupes++; report.present++; continue; }
        if (custom.length >= MAX_CUSTOM) { report.full++; continue; }
        let id = f.id;
        while (ids.has(id)) id = "custom-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
        ids.add(id);
        const agency = { ...f, id };
        custom.push(agency);
        mine.push(agency);
        order.push(id);
        if (fileChecked.has(f.id)) checked = checked.concat(id);
        if (fileHidden.has(f.id)) hidden = hidden.concat(id);
        const target = folderMap.get(fileFolderOf[f.id]);
        if (target) folderOf[id] = target;
        if (agency.fill) { const h = hostOf(agency.url, {}); if (h) hosts.push(h); }
        report.agenciesAdded++;
        report.added.push(agency.name);
      }
    }
  } else {
    if (want.has("agencies")) {
      custom = arr(F[CUSTOM_KEY]);
      overrides = obj(F[OVERRIDES_KEY]);
      removed = arr(F[REMOVED_KEY]);
      seen = [...new Set(seen.concat(arr(F[STORAGE_KEYS.seen])))]; // déjà vues ici ou là-bas : pas « nouvelles »
      order = arr(F[STORAGE_KEYS.order]).slice();
      out[NEW_KEY] = {}; // plus de pastille « Nouveau » sur une configuration remplacée
      hosts = parsed.hosts.slice();
    }
    const after = new Set(idsOf(removed, custom));
    for (const id of after) if (!order.includes(id)) order.push(id);
    order = order.filter((id) => after.has(id));
    const arrived = [...after].filter((id) => !before.has(id));
    // Cases : celles du fichier pour les agences qu'il connaît (toutes si
    // « sélection » est choisie, sinon seulement les agences qui arrivent).
    const takeFromFile = new Set(want.has("selection") ? [...after].filter((id) => fileKnows.has(id)) : arrived);
    const pick = (mineList, fileSet) => [...after].filter((id) => (takeFromFile.has(id) ? fileSet.has(id) : mineList.includes(id)));
    checked = pick(checked, fileChecked);
    hidden = pick(hidden, fileHidden);

    if (want.has("folders")) {
      const previous = folderOf;
      folders = fileFolders;
      const ids = new Set(folders.map((f) => f.id));
      folderOf = {};
      for (const id of after) {
        if (fileKnows.has(id)) { if (ids.has(fileFolderOf[id])) folderOf[id] = fileFolderOf[id]; }
        else if (ids.has(previous[id])) folderOf[id] = previous[id]; // agence que le fichier ne connaît pas : là où elle était
      }
    } else {
      matchFolders();
      for (const id of arrived) { const target = folderMap.get(fileFolderOf[id]); if (target) folderOf[id] = target; }
    }

    if (want.has("settings")) {
      const pick = new Set(settings);
      if (pick.has("language")) out[LANG_KEY] = F[LANG_KEY];
      const opts = { ...options }, fileOpts = obj(F[OPTIONS_KEY]);
      for (const o of OPTIONS) {
        if (!pick.has("opt:" + o.id)) continue;
        if (fileOpts[o.id] !== undefined) opts[o.id] = fileOpts[o.id]; else delete opts[o.id]; // absent du fichier : valeur par défaut
      }
      out[OPTIONS_KEY] = opts;
      if (pick.has("tabGroups") && F[TAB_GROUPS_KEY]) out[TAB_GROUPS_KEY] = F[TAB_GROUPS_KEY]; // fichier plus ancien : option gardée
    }
    for (const id of Object.keys(folderOf)) if (!after.has(id)) delete folderOf[id];
  }

  Object.assign(out, {
    [CUSTOM_KEY]: custom, [OVERRIDES_KEY]: overrides, [REMOVED_KEY]: removed, [STORAGE_KEYS.seen]: seen,
    [STORAGE_KEYS.order]: order, [STORAGE_KEYS.checked]: [...new Set(checked)], [HIDDEN_KEY]: [...new Set(hidden)],
    [FOLDERS_KEY]: folders, [FOLDER_OF_KEY]: folderOf
  });
  return { storage: out, hosts: [...new Set(hosts)], report };
}

/* Effet de chaque partie, calculé avant l'import (même fusion, sans rien
   écrire), pour afficher ce qui va réellement changer chez l'utilisateur. */
function importEffects(current, parsed, { mode, settings = IMPORT_SETTINGS }) {
  const base = mergeConfigImport(current, parsed, { mode: "replace", parts: [] }).storage; // configuration actuelle, mise en forme
  const nameOf = (st, id) => {
    const c = (st[CUSTOM_KEY] || []).find((a) => a.id === id);
    if (c) return c.name;
    const b = AGENCIES.find((a) => a.id === id);
    const ov = (st[OVERRIDES_KEY] || {})[id];
    return (ov && ov.name) || (b ? b.name : id);
  };
  const idsOf = (st) => AGENCIES.filter((a) => !(st[REMOVED_KEY] || []).includes(a.id)).map((a) => a.id).concat((st[CUSTOM_KEY] || []).map((a) => a.id));
  // Comparaison du contenu, pas de l'ordre des champs (Chrome les enregistre triés).
  const canon = (v) => (Array.isArray(v) ? v.map(canon) : v && typeof v === "object"
    ? Object.fromEntries(Object.keys(v).sort().filter((k) => v[k] !== undefined).map((k) => [k, canon(v[k])])) : v === undefined ? null : v);
  const same = (a, b) => JSON.stringify(canon(a)) === JSON.stringify(canon(b));
  const effects = {};
  for (const part of mode === "add" ? IMPORT_ADD_PARTS : IMPORT_PARTS) {
    const { storage: st, report } = mergeConfigImport(current, parsed, { mode, parts: [part], settings });
    const before = new Set(idsOf(base)), after = new Set(idsOf(st));
    let e;
    if (mode === "add") {
      e = part === "agencies"
        ? { added: report.added, taken: report.taken, present: report.present, full: report.full }
        : { added: report.foldersAdded, present: report.foldersPresent, filed: report.filed };
    } else if (part === "agencies") {
      const ov0 = base[OVERRIDES_KEY] || {}, ov1 = st[OVERRIDES_KEY] || {};
      e = {
        arrive: [...after].filter((id) => !before.has(id)).map((id) => nameOf(st, id)),
        leave: [...before].filter((id) => !after.has(id)).map((id) => nameOf(base, id)),
        edited: [...after].filter((id) => before.has(id) && (AGENCIES.some((a) => a.id === id)
          ? !same(ov0[id], ov1[id])
          : !same((base[CUSTOM_KEY] || []).find((a) => a.id === id), (st[CUSTOM_KEY] || []).find((a) => a.id === id))))
          .map((id) => nameOf(base, id)) // nom actuel : c'est la version de l'utilisateur qui est remplacée
      };
    } else if (part === "selection") {
      const on = (st, key, id) => (st[key] || []).includes(id);
      e = { changed: [...after].filter((id) => on(base, STORAGE_KEYS.checked, id) !== on(st, STORAGE_KEYS.checked, id) || on(base, HIDDEN_KEY, id) !== on(st, HIDDEN_KEY, id)).length };
    } else if (part === "folders") {
      const f0 = new Map(base[FOLDERS_KEY].map((f) => [f.id, f])), f1 = new Map(st[FOLDERS_KEY].map((f) => [f.id, f]));
      e = {
        created: [...f1.keys()].filter((id) => !f0.has(id)).length,
        removed: [...f0.keys()].filter((id) => !f1.has(id)).length,
        edited: [...f1.keys()].filter((id) => f0.has(id) && !same(f0.get(id), f1.get(id))).length,
        moved: [...after].filter((id) => (base[FOLDER_OF_KEY][id] || "") !== (st[FOLDER_OF_KEY][id] || "")).length
      };
    } else {
      // Réglages : valeur actuelle → valeur du fichier, pour chacun.
      const fileOpts = parsed.storage[OPTIONS_KEY] || {}, mine = current[OPTIONS_KEY] || {};
      const tg = (v) => (v && typeof v === "object" ? { enabled: v.enabled === true, collapsed: v.collapsed === true } : null);
      e = { items: [
        { id: "language", from: current[LANG_KEY] || "auto", to: parsed.storage[LANG_KEY] },
        ...OPTIONS.map((o) => ({ id: "opt:" + o.id, from: mine[o.id] || o.default, to: fileOpts[o.id] || o.default })),
        { id: "tabGroups", from: tg(current[TAB_GROUPS_KEY]) || { enabled: false, collapsed: false }, to: tg(parsed.storage[TAB_GROUPS_KEY]) }
      ].map((x) => ({ ...x, same: x.to === null || same(x.from, x.to) })) };
    }
    effects[part] = e;
  }
  return effects;
}

/* ---------- Codes de partage (copier / coller) ---------- */
/*
 * Une agence ou un dossier envoyé à un collègue par la messagerie de la
 * rédaction, sous forme d'un court texte : « TabulaPix:1:… ». C'est un petit
 * fichier de configuration (même format, mêmes vérifications à l'arrivée),
 * compressé (gzip) puis encodé en base64 « URL » (lettres, chiffres, - et _).
 * Il ne contient que l'agence ou le dossier et ses agences : jamais les
 * réglages, les autres agences ni les recherches. Aucune requête réseau.
 */
const SHARE_PREFIX = "TabulaPix";
const SHARE_VERSION = 1; // version du code ; une version plus récente est refusée poliment
// Le code peut arriver entouré de texte (message Slack…) : il s'arrête au
// premier caractère qui n'est pas du base64 « URL » (espace, ponctuation…).
const SHARE_RE = /TabulaPix:(\d+):([A-Za-z0-9_-]{8,})/;

// Agence qui vaut la peine d'être partagée : ajoutée, ou fournie modifiée
// (une agence fournie telle quelle, le collègue l'a déjà).
const isShareable = (a) => Boolean(a && (a.custom || a.modified));

async function gzipBytes(bytes) {
  return new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(new CompressionStream("gzip"))).arrayBuffer());
}
// Décompression bornée : un code piégé ne peut pas gonfler au-delà de CONFIG_MAX_BYTES.
async function gunzipBytes(bytes) {
  const reader = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("gzip")).getReader();
  const parts = [];
  let size = 0;
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > CONFIG_MAX_BYTES) { reader.cancel().catch(() => {}); throw new Error("too big"); }
    parts.push(value);
  }
  const out = new Uint8Array(size);
  let at = 0;
  for (const p of parts) { out.set(p, at); at += p.length; }
  return out;
}
const toB64url = (bytes) => { let s = ""; for (const b of bytes) s += String.fromCharCode(b); return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""); };
const fromB64url = (s) => { const t = s.replace(/-/g, "+").replace(/_/g, "/"); const bin = atob(t + "===".slice((t.length + 3) % 4)); return Uint8Array.from(bin, (c) => c.charCodeAt(0)); };

// Code d'une ou plusieurs agences (agencyIds), ou d'un dossier et de ses agences
// visibles (folderId). Renvoie { code, agencies, name } ou null (rien à partager).
async function buildShareCode({ agencyIds, folderId }) {
  const cfg = await buildConfigExport();
  let folders = [], agencies;
  if (folderId) {
    const f = cfg.folders.find((x) => x.id === folderId);
    if (!f) return null;
    folders = [{ id: f.id, name: f.name, ...(f.color ? { color: f.color } : {}) }];
    agencies = cfg.agencies.filter((a) => a.folder === folderId && !a.hidden);
  } else {
    const ids = new Set(agencyIds || []);
    agencies = cfg.agencies.filter((a) => ids.has(a.id)).map(({ folder: _f, ...a }) => a);
  }
  if (!agencies.length) return null; // dossier vide : rien à partager
  // À l'arrivée, les agences partagées sont cochées (comme une agence ajoutée à la main).
  agencies = agencies.map((a) => ({ ...a, checked: true, hidden: false }));
  const mini = { format: CONFIG_FORMAT, formatVersion: CONFIG_FORMAT_VERSION, minReaderVersion: 1, share: true, folders, agencies, removedBuiltins: [] };
  const code = `${SHARE_PREFIX}:${SHARE_VERSION}:${toB64url(await gzipBytes(new TextEncoder().encode(JSON.stringify(mini))))}`;
  return { code, agencies: agencies.length, name: folderId ? folders[0].name : agencies[0].name };
}

// Texte collé → résultat de parseConfigImport, { error }, ou null (pas un code).
async function parseShareCode(text) {
  const m = String(text || "").match(SHARE_RE);
  if (!m) return null;
  if (Number(m[1]) > SHARE_VERSION) return { error: "share.err.newer" };
  if (m[2].length > CONFIG_MAX_BYTES) return { error: "share.err.broken" }; // compressé, il serait bien plus court
  let file;
  try {
    const bytes = await gunzipBytes(fromB64url(m[2]));
    file = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
  } catch (_) { return { error: "share.err.broken" }; }
  if (!file || file.share !== true) return { error: "share.err.broken" };
  const result = parseConfigImport(file);
  return result.error ? { error: result.error === "backup.err.newer" ? "share.err.newer" : "share.err.broken" } : { ...result, share: true };
}

// Autorisations de sites facultatives actuellement accordées (hors sites
// déclarés dans le manifeste).
async function optionalOriginsGranted() {
  const required = new Set(chrome.runtime.getManifest().host_permissions || []);
  const { origins = [] } = await chrome.permissions.getAll();
  return origins.filter((o) => !required.has(o));
}

// Dossiers et rattachement des agences (id d'agence → id de dossier existant).
// Dossier livré jamais renommé (son nom est encore l'un des noms livrés) :
// affiché dans la langue de l'interface. Un nom choisi par l'utilisateur reste tel quel.
function localizeFolder(f) {
  const shipped = typeof FOLDERS !== "undefined" ? FOLDERS.find((x) => x.id === f.id) : null;
  if (!shipped || !Object.values(shipped.name).includes(f.name)) return f;
  const lang = typeof LANG === "string" ? LANG : "fr";
  return { ...f, name: shipped.name[lang] || shipped.name.fr };
}

async function loadFolders() {
  const data = await chrome.storage.local.get({ [FOLDERS_KEY]: [], [FOLDER_OF_KEY]: {} });
  const folders = cleanFolders(data[FOLDERS_KEY]).map(localizeFolder);
  const ids = new Set(folders.map((f) => f.id));
  const raw = data[FOLDER_OF_KEY] && typeof data[FOLDER_OF_KEY] === "object" ? data[FOLDER_OF_KEY] : {};
  const folderOf = {};
  for (const [agencyId, folderId] of Object.entries(raw)) if (ids.has(folderId)) folderOf[agencyId] = folderId;
  return { folders, folderOf };
}
const MAX_FOLDERS = 100;
const newFolderId = () => "f-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
