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

async function gunzip(bytes) {
  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("gzip"));
  return new Uint8Array(await new Response(stream).arrayBuffer());
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
  if (!q) return { error: "Indiquez les mots-clés que vous aviez cherchés." };
  let parsed;
  try { parsed = new URL(url); } catch (_) { return { error: "Adresse invalide : collez l'adresse complète de la page de résultats." }; }
  if (parsed.protocol !== "https:") return { error: "L'adresse doit commencer par https://" };
  const warnings = [];
  if (/\{[^}]*\}/.test(url)) return { error: "L'adresse contient déjà des accolades { } : collez l'adresse réelle de la page de résultats." };

  // 1. Mots-clés en clair dans l'adresse.
  for (const form of plainForms(q)) {
    const re = new RegExp(escapeRe(form), "gi");
    const n = (url.match(re) || []).length;
    if (n) {
      const out = url.replace(re, "{q}");
      const where = n > 1 ? `${n} endroits de l'adresse` : "l'adresse";
      if (/q=[^&#]*_\d/.test(out) || /search=\d{6,}/.test(out)) {
        warnings.push("L'adresse contient aussi un numéro de recherche enregistrée : il est possible qu'il faille le retirer.");
      }
      return { url: out, summary: `Mots-clés trouvés en clair dans ${where}.`, warnings };
    }
  }

  // 1 bis. Mots séparés par des tirets (« emmanuel-macron »), si plusieurs mots.
  const words = q.split(/\s+/).filter(Boolean);
  if (words.length > 1) {
    const re = new RegExp(words.map((w) => escapeRe(encodeURIComponent(w))).join("-"), "gi");
    const n = (url.match(re) || []).length;
    if (n) {
      return {
        url: url.replace(re, "{q:slug}"),
        summary: "Mots-clés trouvés avec des tirets à la place des espaces (marqueur {q:slug}).",
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
      warnings.push("Le site écrit l'hexadécimal en minuscules ; l'extension l'écrit en majuscules (en général sans conséquence).");
    }
    return {
      url: url.replace(piece, "{payload}"),
      payload,
      encode,
      summary: `Mots-clés trouvés emballés dans l'adresse. Encodage : ${encode.join(" → ")}.`,
      warnings
    };
  }

  // 3. Rien trouvé.
  return { error: "Mots-clés introuvables dans l'adresse. Ce site ne les y met peut-être pas (recherche enregistrée côté serveur) : il faudra coller les mots-clés à la main." };
}
