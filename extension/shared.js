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

/* ---------- Agences personnalisées et agences masquées ---------- */

const CUSTOM_KEY = "customAgencies";
const HIDDEN_KEY = "hiddenAgencies";
const MAX_CUSTOM = 30;

// Vérifie une agence ajoutée par l'utilisateur : nom court, adresse https
// valide (avec ou sans {q}). Renvoie une copie propre, ou null.
function cleanCustomAgency(a) {
  if (!a || typeof a !== "object") return null;
  const id = String(a.id || "");
  const name = String(a.name || "").trim();
  const url = String(a.url || "").trim();
  if (!/^custom-[a-z0-9]{4,20}$/.test(id)) return null;
  if (!name || name.length > 40) return null;
  if (url.length > 2000 || /\{(payload|opt:[^}]*)\}/.test(url)) return null;
  let u;
  try { u = new URL(url.split("{q}").join("x")); } catch (_) { return null; }
  if (u.protocol !== "https:" || !u.hostname) return null;
  return { id, name, url, custom: true };
}

// Agences intégrées + agences personnalisées valides, et la liste des masquées.
async function loadAgencies() {
  const data = await chrome.storage.local.get({ [CUSTOM_KEY]: [], [HIDDEN_KEY]: [] });
  const custom = (Array.isArray(data[CUSTOM_KEY]) ? data[CUSTOM_KEY] : [])
    .map(cleanCustomAgency).filter(Boolean).slice(0, MAX_CUSTOM);
  return {
    all: AGENCIES.concat(custom),
    custom,
    hidden: new Set(Array.isArray(data[HIDDEN_KEY]) ? data[HIDDEN_KEY] : [])
  };
}
