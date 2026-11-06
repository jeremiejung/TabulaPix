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

// Agence intégrée + modification de l'utilisateur. Pour les agences à
// remplissage automatique, le site ne peut pas changer (autorisation Chrome
// limitée à ce site) : sinon la modification est ignorée.
function applyOverride(agency, override, options) {
  if (!override || typeof override !== "object") return agency;
  const { spec } = checkSpec(override, { allowOptions: true });
  if (!spec) return agency;
  if (agency.fill && hostOf(spec.url, options) !== hostOf(agency.url, options)) return agency;
  const out = { ...agency, url: spec.url, modified: true };
  delete out.payload; delete out.encode;
  if (spec.payload !== undefined) { out.payload = spec.payload; out.encode = spec.encode; }
  // Repères refaits par l'utilisateur (agences qui remplissent un champ) ;
  // le délai propre au site reste celui de la configuration d'origine.
  const fill = agency.fill && override.fill ? cleanFill(override.fill) : null;
  if (fill) {
    delete fill.delay;
    out.fill = agency.fill.delay !== undefined ? { ...fill, delay: agency.fill.delay } : fill;
  }
  return out;
}

// Toutes les agences effectives (intégrées éventuellement modifiées +
// personnalisées valides) et la liste des masquées.
async function loadAgencies(options) {
  const data = await chrome.storage.local.get({ [CUSTOM_KEY]: [], [OVERRIDES_KEY]: {}, [HIDDEN_KEY]: [] });
  if (!options) options = await loadOptions();
  const overrides = data[OVERRIDES_KEY] && typeof data[OVERRIDES_KEY] === "object" ? data[OVERRIDES_KEY] : {};
  const builtin = AGENCIES.map((a) => applyOverride(a, overrides[a.id], options));
  const custom = (Array.isArray(data[CUSTOM_KEY]) ? data[CUSTOM_KEY] : [])
    .map(cleanCustomAgency).filter(Boolean).slice(0, MAX_CUSTOM);
  return {
    all: builtin.concat(custom),
    custom,
    overrides,
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
