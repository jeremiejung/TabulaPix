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
  if (!url || url.length > 2000) return { error: "Adresse manquante ou trop longue." };
  if (payload.length > 2000) return { error: "Modèle trop long (2000 caractères au plus)." };
  if (!encode) return { error: `Étapes d'encodage inconnues : utilisez ${ENCODE_STEPS.join(", ")}.` };
  for (const [, inner] of url.matchAll(/\{([^}]*)\}/g)) {
    if (inner === "q" || inner === "payload") continue;
    const opt = inner.match(/^opt:([A-Za-z0-9_]+)$/);
    if (opt && allowOptions && OPTION_BY_ID.has(opt[1])) continue;
    return { error: `Marqueur inconnu dans l'adresse : {${inner}}. Utilisez {q} (ou {payload}).` };
  }
  if (url.includes("{payload}") && !payload) return { error: "L'adresse contient {payload} : renseignez le modèle." };
  let u;
  try { u = new URL(url.replace(/\{[^}]*\}/g, "x")); } catch (_) { return { error: "Adresse invalide." }; }
  if (u.protocol !== "https:" || !u.hostname) return { error: "L'adresse doit commencer par https://" };
  const spec = { url };
  if (url.includes("{payload}")) { spec.payload = payload; spec.encode = encode; }
  return { spec };
}

// Agence ajoutée par l'utilisateur : copie propre, ou null.
function cleanCustomAgency(a) {
  if (!a || typeof a !== "object") return null;
  const id = String(a.id || "");
  const name = String(a.name || "").trim();
  if (!/^custom-[a-z0-9]{4,20}$/.test(id) || !name || name.length > 40) return null;
  const { spec } = checkSpec(a);
  return spec ? { id, name, ...spec, custom: true } : null;
}

// Nom de domaine d'une adresse (marqueurs neutralisés, options appliquées).
function hostOf(url, options) {
  try { return new URL(applyOptions(url, options).replace(/\{(q|payload)\}/g, "x")).hostname; }
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
