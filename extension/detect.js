"use strict";
/*
 * Détection automatique : à partir de l'adresse d'une page de résultats et
 * des mots-clés cherchés, retrouve où sont les mots-clés (en clair, ou
 * emballés en hexadécimal, base64, gzip, encodage URL…) et en déduit
 * l'adresse avec {q}, {q:slug} ou {payload}, le modèle et les étapes d'encodage.
 * Tout se fait localement, sans réseau.
 */

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const textDecoder = new TextDecoder("utf-8", { fatal: true });

// Différentes façons dont un site écrit les mots-clés en clair dans une adresse.
function plainForms(q) {
  const enc = encodeURIComponent(q);
  return [...new Set([
    enc, enc.replace(/%20/g, "+"), q.replace(/ /g, "+"), q.replace(/ /g, "%20"), q
  ])].sort((a, b) => b.length - a.length);
}

function hexToBytes(h) {
  const out = new Uint8Array(h.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(h.substr(i * 2, 2), 16);
  return out;
}

function base64ToBytes(s) {
  const bin = atob(s);
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

// Décompression plafonnée à 1 Mo (une adresse ne contient pas plus ; évite de
// bloquer la popup sur des données qui gonfleraient démesurément).
const MAX_INFLATE = 1024 * 1024;
async function gunzip(bytes) {
  const reader = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("gzip")).getReader();
  const chunks = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > MAX_INFLATE) { reader.cancel(); throw new Error("trop gros"); }
    chunks.push(value);
  }
  const out = new Uint8Array(size);
  let offset = 0;
  for (const c of chunks) { out.set(c, offset); offset += c.length; }
  return out;
}

const printable = (s) => !/[\u0000-\u0008\u000E-\u001F]/.test(s);

// Cherche, en défaisant les encodages un à un, une forme qui contient les
// mots-clés. Renvoie { text, steps } (steps : dans l'ordre du décodage) ou null.
async function unwrap(value, q, steps = [], depth = 0) {
  if (depth > 6) return null;
  if (typeof value !== "string") {
    if (value[0] === 0x1f && value[1] === 0x8b) {
      try { return await unwrap(await gunzip(value), q, steps.concat("gzip"), depth + 1); } catch (_) { return null; }
    }
    let text;
    try { text = textDecoder.decode(value); } catch (_) { return null; }
    return printable(text) ? unwrap(text, q, steps, depth + 1) : null;
  }
  const s = value;
  if (steps.length && s.toLowerCase().includes(q.toLowerCase())) {
    // Encore encodé pour une URL (ex. %7B%22…) : on décode une fois de plus
    // si c'est réversible à l'identique, pour un modèle lisible.
    if (/%[0-9a-f]{2}/i.test(s)) {
      try {
        const d = decodeURIComponent(s);
        if (encodeURIComponent(d) === s && d.toLowerCase().includes(q.toLowerCase())) return { text: d, steps: steps.concat("uri") };
      } catch (_) { /* on garde la forme encodée */ }
    }
    return { text: s, steps };
  }
  if (/%[0-9a-f]{2}/i.test(s)) {
    let d = null;
    try { d = decodeURIComponent(s); } catch (_) { /* pas de l'encodage URL */ }
    if (d && d !== s) { const r = await unwrap(d, q, steps.concat("uri"), depth + 1); if (r) return r; }
  }
  if (s.length >= 8 && s.length % 2 === 0 && /^[0-9a-f]+$/i.test(s)) {
    const r = await unwrap(hexToBytes(s), q, steps.concat("hex"), depth + 1);
    if (r) return r;
  }
  if (s.length >= 12 && s.length % 4 === 0 && /^[A-Za-z0-9+/]+={0,2}$/.test(s)) {
    let b = null;
    try { b = base64ToBytes(s); } catch (_) { /* pas du base64 */ }
    if (b) { const r = await unwrap(b, q, steps.concat("base64"), depth + 1); if (r) return r; }
  }
  return null;
}

/*
 * Résultat : { url, payload?, encode?, summary, warnings[] } ou { error }.
 */
async function detectSearchUrl(pageUrl, keywords) {
  const url = String(pageUrl || "").trim();
  const q = String(keywords || "").trim();
  if (!q) return { error: t("det.noKeywords") };
  let parsed;
  try { parsed = new URL(url); } catch (_) { return { error: t("det.badUrl") }; }
  if (parsed.protocol !== "https:") return { error: t("det.https") };
  const warnings = [];
  if (/\{[^}]*\}/.test(url)) return { error: t("det.braces") };

  // 1. Mots-clés en clair dans l'adresse.
  for (const form of plainForms(q)) {
    const re = new RegExp(escapeRe(form), "gi");
    const n = (url.match(re) || []).length;
    if (n) {
      const out = url.replace(re, "{q}");
      if (/q=[^&#]*_\d/.test(out) || /search=\d{6,}/.test(out)) {
        warnings.push(t("det.warn.savedSearch"));
      } else if (/[?&=/]\d{10,}(?=[&#/]|$)/.test(out)) {
        warnings.push(t("det.warn.session"));
      }
      return { url: out, summary: n > 1 ? t("det.plain.many", { n }) : t("det.plain.one"), warnings };
    }
  }

  // 1 bis. Mots séparés par des tirets (« estonie-frontière »), si plusieurs mots.
  const words = q.split(/\s+/).filter(Boolean);
  if (words.length > 1) {
    const re = new RegExp(words.map((w) => escapeRe(encodeURIComponent(w))).join("-"), "gi");
    const n = (url.match(re) || []).length;
    if (n) {
      return {
        url: url.replace(re, "{q:slug}"),
        summary: t("det.slug"),
        warnings
      };
    }
  }

  // 2. Mots-clés emballés dans un morceau de l'adresse.
  const pieces = new Set();
  for (const part of url.split(/[\/?&=#]/)) {
    if (part.length < 8) continue;
    pieces.add(part);
    if (/^0x/i.test(part)) pieces.add(part.slice(2));
  }
  for (const piece of [...pieces].sort((a, b) => b.length - a.length)) {
    const found = await unwrap(piece, q);
    if (!found) continue;
    const payload = found.text.replace(new RegExp(escapeRe(q), "gi"), "{q}");
    const encode = found.steps.slice().reverse();
    if (found.steps.includes("hex") && /[a-f]/.test(piece) && !/[A-F]/.test(piece)) {
      warnings.push(t("det.warn.hexCase"));
    }
    return {
      url: url.replace(piece, "{payload}"),
      payload,
      encode,
      summary: t("det.wrapped", { steps: encode.join(" → ") }),
      warnings
    };
  }

  // 3. Rien trouvé.
  return { notFound: true, error: t("det.notFound") };
}
