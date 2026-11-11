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
  return fill ? { id, name, ...spec, fill, custom: true } : { id, name, ...spec, custom: true };
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
// Le délai propre au site (Bloomberg) n'est gardé que sur le même site.
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
async function applyNewAgencyDefaults() {
  const data = await chrome.storage.local.get({ [SEEN_KEY]: [], [HIDDEN_KEY]: [] });
  const seen = new Set(Array.isArray(data[SEEN_KEY]) ? data[SEEN_KEY] : []);
  const fresh = AGENCIES.filter((a) => !seen.has(a.id));
  if (!fresh.length) return;
  const hidden = new Set(Array.isArray(data[HIDDEN_KEY]) ? data[HIDDEN_KEY] : []);
  for (const a of fresh) if (a.defaultHidden) hidden.add(a.id);
  await chrome.storage.local.set({ [SEEN_KEY]: AGENCIES.map((a) => a.id), [HIDDEN_KEY]: [...hidden] });
}

/* ---------- Fichier de configuration (export / import) ---------- */
/*
 * Format JSON versionné, pour sauvegarder la configuration hors de
 * l'extension ou la partager entre collègues :
 *   { format: "tabulapix-config", formatVersion, minReaderVersion,
 *     exportedAt, app, settings: { language, options },
 *     folders: [ { id, name, color?, collapsed? } ], // dossiers d'agences
 *     agencies: [ … dans l'ordre de la liste … ],
 *     removedBuiltins: [ … agences fournies supprimées … ] }
 * Chaque agence : { id, builtin, name, checked, hidden, folder? } et, si
 * elle est ajoutée ou modifiée, url / payload / encode / fill.
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
const CONFIG_FORMAT_VERSION = 2; // version du format écrit par cette extension (2 : dossiers repliés)
const CONFIG_READER_VERSION = 1; // plus haut minReaderVersion que cette extension sait lire
const CONFIG_MAX_BYTES = 1024 * 1024;
const FOLDERS_KEY = "agencyFolders";     // [ { id, name, color?, collapsed? } ]
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
    out.push(folder);
  }
  return out;
}

async function buildConfigExport() {
  const data = await chrome.storage.local.get({
    [STORAGE_KEYS.checked]: null, [STORAGE_KEYS.order]: [], [CUSTOM_KEY]: [], [OVERRIDES_KEY]: {},
    [HIDDEN_KEY]: [], [REMOVED_KEY]: [], [OPTIONS_KEY]: {}, [LANG_KEY]: "auto",
    [FOLDERS_KEY]: [], [FOLDER_OF_KEY]: {}
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
      for (const k of ["name", "url", "payload", "encode", "fill"]) if (src[k] !== undefined) entry[k] = src[k];
    } else if (!builtin) {
      for (const k of ["url", "payload", "encode", "fill"]) if (a[k] !== undefined) entry[k] = a[k];
    }
    return entry;
  });
  return {
    format: CONFIG_FORMAT,
    formatVersion: CONFIG_FORMAT_VERSION,
    minReaderVersion: 1,
    exportedAt: new Date().toISOString(),
    app: { name: "TabulaPix", version: chrome.runtime.getManifest().version },
    settings: { language: data[LANG_KEY], options: data[OPTIONS_KEY] || {} },
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
      const hasOverride = ["name", "url", "payload", "encode", "fill"].some((k) => e[k] !== undefined)
        && (e.name !== original.name || e.url !== undefined || e.fill !== undefined);
      if (hasOverride) {
        const ov = { url: e.url !== undefined ? e.url : original.url };
        if (e.payload !== undefined) { ov.payload = e.payload; ov.encode = e.encode; }
        else if (e.url === undefined && original.payload !== undefined) { ov.payload = original.payload; ov.encode = original.encode; }
        if (e.fill === false && original.fill) ov.fill = false; // passée en « adresse de recherche »
        else if (e.fill && typeof e.fill === "object") { const f = cleanFill(e.fill); if (f) { delete f.delay; ov.fill = f; } }
        const name = String(e.name || "").trim();
        if (name && name !== original.name && name.length <= 40) ov.name = name;
        const applied = applyOverride(original, ov, options);
        if (applied.modified) {
          const { spec } = checkSpec(ov, { allowOptions: true });
          overrides[e.id] = { ...spec, ...(ov.fill !== undefined ? { fill: ov.fill } : {}), ...(ov.name ? { name: ov.name } : {}) };
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
      [FOLDERS_KEY]: folders, [FOLDER_OF_KEY]: folderOf
    },
    summary: { agencies: order.length, custom: custom.length, folders: folders.length, removed: removed.size, modified: Object.keys(overrides).length, checked: checked.length, skipped, unknown, newer },
    hosts
  };
}

// Autorisations de sites facultatives actuellement accordées (hors sites
// déclarés dans le manifeste).
async function optionalOriginsGranted() {
  const required = new Set(chrome.runtime.getManifest().host_permissions || []);
  const { origins = [] } = await chrome.permissions.getAll();
  return origins.filter((o) => !required.has(o));
}

// Dossiers et rattachement des agences (id d'agence → id de dossier existant).
async function loadFolders() {
  const data = await chrome.storage.local.get({ [FOLDERS_KEY]: [], [FOLDER_OF_KEY]: {} });
  const folders = cleanFolders(data[FOLDERS_KEY]);
  const ids = new Set(folders.map((f) => f.id));
  const raw = data[FOLDER_OF_KEY] && typeof data[FOLDER_OF_KEY] === "object" ? data[FOLDER_OF_KEY] : {};
  const folderOf = {};
  for (const [agencyId, folderId] of Object.entries(raw)) if (ids.has(folderId)) folderOf[agencyId] = folderId;
  return { folders, folderOf };
}
const MAX_FOLDERS = 100;
const newFolderId = () => "f-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
