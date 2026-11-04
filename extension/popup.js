"use strict";

const STORAGE_KEY = "checkedAgencies";
const list = document.getElementById("list");
const input = document.getElementById("q");
const msg = document.getElementById("msg");

// Une agence est « manuelle » si ni son URL ni « fill » ne transmettent les
// mots-clés : on ouvre la page et on copie les mots-clés dans le presse-papiers.
const isManual = (a) => !a.fill && !a.url.includes("{q}") && !a.url.includes("{payload}");

/* ---------- Popup ou panneau latéral ---------- */

// Le même fichier sert de popup et de panneau latéral.
const isPopup = chrome.extension.getViews({ type: "popup" }).includes(window);
if (!isPopup) document.documentElement.classList.add("panel");

// L'identifiant de la fenêtre est lu dès l'ouverture : Chrome n'autorise
// l'ouverture du panneau que directement dans le clic.
let windowId = null;
chrome.windows.getCurrent().then((w) => { windowId = w.id; });

document.getElementById("pin").addEventListener("click", () => {
  if (windowId === null || !chrome.sidePanel) {
    msg.textContent = "Panneau latéral indisponible (Chrome 116 ou plus récent requis).";
    return;
  }
  chrome.sidePanel.open({ windowId }).then(() => window.close(), () => {
    msg.textContent = "Impossible d'ouvrir le panneau latéral.";
  });
});

/* ---------- Construction des URL ---------- */

const utf8 = (s) => new TextEncoder().encode(s);

async function gzip(bytes) {
  const stream = new Blob([bytes]).stream().pipeThrough(new CompressionStream("gzip"));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

function toBase64(bytes) {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}

const toHex = (bytes) =>
  Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("").toUpperCase();

async function applySteps(text, steps) {
  let value = text; // string ou Uint8Array
  for (const step of steps || []) {
    const asBytes = typeof value === "string" ? utf8(value) : value;
    const asText = typeof value === "string" ? value : new TextDecoder().decode(value);
    switch (step) {
      case "uri": value = encodeURIComponent(asText); break;
      case "hex": value = toHex(asBytes); break;
      case "gzip": value = await gzip(asBytes); break;
      case "base64": value = toBase64(asBytes); break;
      default: throw new Error(`Étape d'encodage inconnue : ${step}`);
    }
  }
  return typeof value === "string" ? value : toBase64(value);
}

async function buildUrl(agency, q) {
  let url = agency.url.split("{q}").join(encodeURIComponent(q));
  if (url.includes("{payload}")) {
    const jsonSafe = JSON.stringify(q).slice(1, -1); // échappe " et \
    const payload = (agency.payload || "").split("{q}").join(jsonSafe);
    url = url.split("{payload}").join(await applySteps(payload, agency.encode));
  }
  return url;
}

/* ---------- Interface ---------- */

function render(checked) {
  for (const a of AGENCIES) {
    const li = document.createElement("li");
    const label = document.createElement("label");
    const box = document.createElement("input");
    box.type = "checkbox";
    box.value = a.id;
    box.checked = checked.includes(a.id);
    box.addEventListener("change", save);
    label.append(box, a.name);
    if (isManual(a)) {
      const hint = document.createElement("span");
      hint.className = "hint";
      hint.textContent = "coller";
      hint.title = "Mots-clés copiés dans le presse-papiers : collez-les (Ctrl/Cmd+V) dans le champ de recherche du site.";
      label.append(hint);
    }
    li.append(label);
    list.append(li);
  }
}

const boxes = () => Array.from(list.querySelectorAll("input[type=checkbox]"));
const checkedIds = () => boxes().filter((b) => b.checked).map((b) => b.value);

function save() {
  chrome.storage.local.set({ [STORAGE_KEY]: checkedIds() });
}

function setAll(state) {
  boxes().forEach((b) => (b.checked = state));
  save();
}

document.getElementById("all").addEventListener("click", () => setAll(true));
document.getElementById("none").addEventListener("click", () => setAll(false));

document.getElementById("form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const q = input.value.trim();
  const ids = checkedIds();
  if (!q) return input.focus();
  if (!ids.length) { msg.textContent = "Cochez au moins une agence."; return; }

  const selected = AGENCIES.filter((a) => ids.includes(a.id));
  let urls;
  try {
    urls = await Promise.all(selected.map((a) => buildUrl(a, q)));
  } catch (err) {
    msg.textContent = "Erreur de configuration : " + err.message;
    return;
  }

  if (selected.some(isManual)) {
    try { await navigator.clipboard.writeText(q); } catch (_) { /* sans gravité */ }
  }

  // L'ouverture des onglets est confiée au script d'arrière-plan : la popup
  // se ferme dès qu'un onglet passe au premier plan.
  const jobs = selected.map((a, i) => ({ id: a.id, url: urls[i] }));
  chrome.runtime.sendMessage({ type: "sweep", jobs, q });
  if (!isPopup) { input.select(); msg.textContent = ""; } // panneau : prêt pour la suivante
});

chrome.storage.local.get({ [STORAGE_KEY]: AGENCIES.map((a) => a.id) }, (data) => {
  render(data[STORAGE_KEY]);
});
