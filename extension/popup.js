"use strict";

const STORAGE_KEY = "checkedAgencies";
const QUERY_KEY = "lastQuery";
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

/* ---------- Vue Options (dans la popup / le panneau) ---------- */

const mainForm = document.getElementById("form");
const settingsForm = document.getElementById("settingsForm");
const fields = document.getElementById("fields");
const settingsMsg = document.getElementById("settingsMsg");

async function showSettings() {
  const values = await loadOptions();
  fields.textContent = "";
  for (const o of OPTIONS) {
    const div = document.createElement("div");
    div.className = "field";
    const label = document.createElement("label");
    label.htmlFor = "opt-" + o.id;
    label.textContent = o.label;
    const field = document.createElement("input");
    field.id = "opt-" + o.id;
    field.autocomplete = "off";
    field.spellcheck = false;
    field.value = values[o.id] ?? o.default;
    field.placeholder = o.default;
    field.pattern = o.pattern.replace(/^\^|\$$/g, ""); // l'attribut HTML ajoute ^…$ lui-même
    const help = document.createElement("p");
    help.className = "help";
    help.textContent = o.help;
    div.append(label, field, help);
    fields.append(div);
  }
  settingsMsg.textContent = "";
  mainForm.hidden = true;
  settingsForm.hidden = false;
  fields.querySelector("input")?.focus();
}

function showMain() {
  settingsForm.hidden = true;
  mainForm.hidden = false;
  input.focus();
}

document.getElementById("settings").addEventListener("click", showSettings);
document.getElementById("back").addEventListener("click", showMain);

settingsForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const values = {};
  for (const o of OPTIONS) {
    const v = document.getElementById("opt-" + o.id).value.trim();
    if (v !== "" && !new RegExp(o.pattern).test(v)) {
      settingsMsg.textContent = `Valeur invalide pour « ${o.label} ».`;
      return;
    }
    values[o.id] = v;
  }
  await chrome.storage.local.set({ [OPTIONS_KEY]: values });
  showMain();
  msg.textContent = "Options enregistrées.";
  setTimeout(() => { if (msg.textContent === "Options enregistrées.") msg.textContent = ""; }, 2500);
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

async function buildUrl(agency, q, options) {
  let url = applyOptions(agency.url, options).split("{q}").join(encodeURIComponent(q));
  if (url.includes("{payload}")) {
    const jsonSafe = JSON.stringify(q).slice(1, -1); // échappe " et \
    const payload = (agency.payload || "").split("{q}").join(jsonSafe);
    url = url.split("{payload}").join(await applySteps(payload, agency.encode));
  }
  return url;
}

/* ---------- Interface ---------- */

const ORDER_KEY = "agencyOrder";
const AGENCY_BY_ID = new Map(AGENCIES.map((a) => [a.id, a]));

// Ordre choisi par l'utilisateur ; une agence ajoutée depuis dans config.js
// se place juste après celle qui la précède dans config.js (sinon en tête),
// les agences retirées sont ignorées.
function orderedAgencies(order) {
  const seen = new Set();
  const out = [];
  for (const id of order) {
    const a = AGENCY_BY_ID.get(id);
    if (a && !seen.has(id)) { out.push(a); seen.add(id); }
  }
  AGENCIES.forEach((a, i) => {
    if (seen.has(a.id)) return;
    const prev = i > 0 ? out.indexOf(AGENCIES[i - 1]) : -1;
    out.splice(prev + 1, 0, a);
    seen.add(a.id);
  });
  return out;
}

function render(agencies, checked) {
  for (const a of agencies) {
    const li = document.createElement("li");
    li.dataset.id = a.id;
    li.draggable = true;
    const handle = document.createElement("span");
    handle.className = "handle";
    handle.textContent = "⋮⋮";
    handle.title = "Glisser pour réordonner (ou Alt + ↑ / ↓ sur la case)";
    handle.setAttribute("aria-hidden", "true");
    const label = document.createElement("label");
    const box = document.createElement("input");
    box.type = "checkbox";
    box.value = a.id;
    box.checked = checked.includes(a.id);
    box.addEventListener("change", save);
    box.addEventListener("keydown", (e) => {
      if (!e.altKey || (e.key !== "ArrowUp" && e.key !== "ArrowDown")) return;
      e.preventDefault();
      const other = e.key === "ArrowUp" ? li.previousElementSibling : li.nextElementSibling;
      if (!other) return;
      e.key === "ArrowUp" ? other.before(li) : other.after(li);
      box.focus();
      saveOrder();
    });
    label.append(box, a.name);
    if (isManual(a)) {
      const hint = document.createElement("span");
      hint.className = "hint";
      hint.textContent = "coller";
      hint.title = "Mots-clés copiés dans le presse-papiers : collez-les (Ctrl/Cmd+V) dans le champ de recherche du site.";
      label.append(hint);
    }
    li.append(handle, label);
    list.append(li);
  }
}

/* Glisser-déposer */
let dragged = null;
list.addEventListener("dragstart", (e) => {
  dragged = e.target.closest("li");
  if (!dragged) return;
  dragged.classList.add("dragging");
  e.dataTransfer.effectAllowed = "move";
  e.dataTransfer.setData("text/plain", dragged.dataset.id);
});
list.addEventListener("dragover", (e) => {
  if (!dragged) return;
  e.preventDefault();
  const over = e.target.closest("li");
  if (!over || over === dragged) return;
  const box = over.getBoundingClientRect();
  e.clientY < box.top + box.height / 2 ? over.before(dragged) : over.after(dragged);
});
list.addEventListener("drop", (e) => e.preventDefault());
list.addEventListener("dragend", () => {
  if (!dragged) return;
  dragged.classList.remove("dragging");
  dragged = null;
  saveOrder();
});

// Cases et ordre sont lus dans la liste affichée.
const boxes = () => Array.from(list.querySelectorAll("input[type=checkbox]"));
const checkedIds = () => boxes().filter((b) => b.checked).map((b) => b.value);

function save() {
  chrome.storage.local.set({ [STORAGE_KEY]: checkedIds() });
}

function saveOrder() {
  chrome.storage.local.set({ [ORDER_KEY]: boxes().map((b) => b.value) });
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

  const selected = ids.map((id) => AGENCY_BY_ID.get(id)); // dans l'ordre affiché
  let urls;
  try {
    const options = await loadOptions();
    urls = await Promise.all(selected.map((a) => buildUrl(a, q, options)));
  } catch (err) {
    msg.textContent = "Erreur de configuration : " + err.message;
    return;
  }

  if (selected.some(isManual)) {
    try { await navigator.clipboard.writeText(q); } catch (_) { /* sans gravité */ }
  }

  // L'ouverture des onglets est confiée au script d'arrière-plan : la popup
  // se ferme dès qu'un onglet passe au premier plan.
  chrome.storage.local.set({ [QUERY_KEY]: q });
  const jobs = selected.map((a, i) => ({ id: a.id, url: urls[i] }));
  await chrome.runtime.sendMessage({ type: "sweep", jobs, q });
  if (isPopup) {
    window.close(); // on reste sur l'onglet en cours
  } else {
    input.select(); // panneau : prêt pour la recherche suivante
    msg.textContent = "";
  }
});

const DEFAULT_CHECKED = AGENCIES.filter((a) => a.defaultChecked !== false).map((a) => a.id);
chrome.storage.local.get({ [STORAGE_KEY]: DEFAULT_CHECKED, [ORDER_KEY]: [], [QUERY_KEY]: "" }, (data) => {
  render(orderedAgencies(data[ORDER_KEY]), data[STORAGE_KEY]);
  // Derniers mots-clés, sélectionnés : on tape pour les remplacer.
  if (data[QUERY_KEY] && !input.value) { input.value = data[QUERY_KEY]; input.select(); }
});
