"use strict";

const STORAGE_KEY = "checkedAgencies";
const QUERY_KEY = "lastQuery";
const list = document.getElementById("list");
const input = document.getElementById("q");
const msg = document.getElementById("msg");

// Une agence est « manuelle » si ni son URL ni « fill » ne transmettent les
// mots-clés : on ouvre la page et on copie les mots-clés dans le presse-papiers.
const isManual = (a) => !a.fill && !/\{(q|q:slug|payload)\}/.test(a.url);

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
const settingsView = document.getElementById("settingsView");
const settingsForm = document.getElementById("settingsForm");
const addForm = document.getElementById("addForm");
const manageList = document.getElementById("manageList");
const fields = document.getElementById("fields");
const settingsMsg = document.getElementById("settingsMsg");
const addMsg = document.getElementById("addMsg");

function flash(text, el = settingsMsg) {
  el.textContent = text;
  setTimeout(() => { if (el.textContent === text) el.textContent = ""; }, 3000);
}

// Liste « Agences affichées » : case = visible ; ✕ = supprimer (agences perso).
async function renderManageList() {
  const ag = await loadAgencies();
  const { [ORDER_KEY]: order = [] } = await chrome.storage.local.get(ORDER_KEY);
  ALL = ag.all;
  AGENCY_BY_ID = new Map(ALL.map((a) => [a.id, a]));
  manageList.textContent = "";
  for (const a of orderedAgencies(order)) {
    const li = document.createElement("li");
    const label = document.createElement("label");
    const box = document.createElement("input");
    box.type = "checkbox";
    box.checked = !ag.hidden.has(a.id);
    box.addEventListener("change", async () => {
      const { [HIDDEN_KEY]: hidden = [] } = await chrome.storage.local.get(HIDDEN_KEY);
      const set = new Set(hidden);
      box.checked ? set.delete(a.id) : set.add(a.id);
      await chrome.storage.local.set({ [HIDDEN_KEY]: [...set] });
    });
    label.append(box, a.name);
    if (a.custom || a.modified) {
      const tag = document.createElement("span");
      tag.className = "tag";
      tag.textContent = a.custom ? "perso" : "modifiée";
      label.append(" ", tag);
    }
    li.append(label);
    if (a.id === editing) li.classList.add("editing");
    const edit = document.createElement("button");
    edit.type = "button";
    edit.className = "edit";
    edit.textContent = "✎";
    edit.title = `Modifier « ${a.name} »`;
    edit.setAttribute("aria-label", edit.title);
    edit.addEventListener("click", () => startEdit(a));
    li.append(edit);
    if (a.custom) {
      const del = document.createElement("button");
      del.type = "button";
      del.className = "del";
      del.textContent = "✕";
      del.title = `Supprimer « ${a.name} »`;
      del.setAttribute("aria-label", del.title);
      del.addEventListener("click", async () => {
        if (!confirm(`Supprimer l'agence « ${a.name} » ?`)) return;
        const { [CUSTOM_KEY]: custom = [] } = await chrome.storage.local.get(CUSTOM_KEY);
        await chrome.storage.local.set({ [CUSTOM_KEY]: custom.filter((c) => c && c.id !== a.id) });
        if (editing === a.id) endEdit();
        await renderManageList();
        flash(`« ${a.name} » supprimée.`, addMsg);
      });
      li.append(del);
    }
    manageList.append(li);
  }
}

function renderOptionFields(values) {
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
}

async function showSettings() {
  endEdit();
  await renderManageList();
  renderOptionFields(await loadOptions());
  settingsMsg.textContent = addMsg.textContent = "";
  mainForm.hidden = true;
  settingsView.hidden = false;
  document.getElementById("back").focus();
}

async function showMain() {
  await refreshList();
  settingsView.hidden = true;
  mainForm.hidden = false;
  input.focus();
}

document.getElementById("settings").addEventListener("click", showSettings);
document.getElementById("back").addEventListener("click", showMain);

/* Éditeur d'agence : ajout, ou modification d'une agence existante */

const ORIGINAL_BY_ID = new Map(AGENCIES.map((a) => [a.id, a]));
const ed = {
  title: document.getElementById("editorTitle"),
  name: document.getElementById("newName"),
  url: document.getElementById("newUrl"),
  payload: document.getElementById("newPayload"),
  encode: document.getElementById("newEncode"),
  advanced: document.getElementById("advanced"),
  submit: document.getElementById("agencySubmit"),
  reset: document.getElementById("resetAgency"),
  cancel: document.getElementById("cancelEdit")
};
let editing = null; // id de l'agence en cours de modification, sinon null

function startEdit(a) {
  editing = a.id;
  ed.title.textContent = `Modifier « ${a.name} »`;
  ed.name.value = a.name;
  ed.name.disabled = !a.custom; // le nom des agences intégrées ne change pas
  ed.url.value = a.url;
  ed.payload.value = a.payload || "";
  ed.encode.value = (a.encode || []).join(", ");
  ed.advanced.open = Boolean(a.payload);
  ed.submit.textContent = "Enregistrer";
  ed.cancel.hidden = false;
  ed.reset.hidden = !a.modified;
  addMsg.textContent = "";
  renderManageList();
  ed.title.scrollIntoView({ block: "start" });
  ed.url.focus();
}

function endEdit() {
  editing = null;
  addForm.reset();
  detectMsg.textContent = "";
  ed.title.textContent = "Ajouter une agence";
  ed.name.disabled = false;
  ed.advanced.open = false;
  ed.submit.textContent = "Ajouter";
  ed.cancel.hidden = ed.reset.hidden = true;
}

ed.cancel.addEventListener("click", async () => { endEdit(); await renderManageList(); });

// Détection automatique : remplit adresse, modèle et encodage.
const detectMsg = document.getElementById("detectMsg");
document.getElementById("detectBtn").addEventListener("click", async () => {
  const pageUrl = document.getElementById("detUrl").value;
  const r = await detectSearchUrl(pageUrl, document.getElementById("detQ").value);
  detectMsg.className = "status " + (r.error ? "err" : "ok");
  if (r.error) { detectMsg.textContent = r.error; return; }
  ed.url.value = r.url;
  ed.payload.value = r.payload || "";
  ed.encode.value = (r.encode || []).join(", ");
  ed.advanced.open = Boolean(r.payload);
  if (!ed.name.disabled && !ed.name.value.trim()) {
    ed.name.value = new URL(pageUrl.trim()).hostname.replace(/^(www|search|stock)\./, "");
  }
  detectMsg.textContent = [r.summary, ...r.warnings.map((w) => "⚠ " + w), `Vérifiez, puis cliquez sur « ${ed.submit.textContent} ».`].join("\n");
});

ed.reset.addEventListener("click", async () => {
  const id = editing;
  const { [OVERRIDES_KEY]: overrides = {} } = await chrome.storage.local.get(OVERRIDES_KEY);
  delete overrides[id];
  await chrome.storage.local.set({ [OVERRIDES_KEY]: overrides });
  endEdit();
  await renderManageList();
  flash(`« ${ORIGINAL_BY_ID.get(id).name} » : adresse d'origine rétablie.`, addMsg);
});

addForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = ed.name.value.trim();
  const raw = { url: ed.url.value, payload: ed.payload.value, encode: ed.encode.value };
  const original = editing && ORIGINAL_BY_ID.get(editing);

  // Agence intégrée : on enregistre seulement une modification de son adresse.
  if (original) {
    const { spec, error } = checkSpec(raw, { allowOptions: true });
    if (error) return flash(error, addMsg);
    const options = await loadOptions();
    const host = hostOf(original.url, options);
    if (original.fill && hostOf(spec.url, options) !== host) {
      return flash(`Pour ${original.name}, l'adresse doit rester sur ${host} (remplissage automatique du champ de recherche).`, addMsg);
    }
    const { [OVERRIDES_KEY]: overrides = {} } = await chrome.storage.local.get(OVERRIDES_KEY);
    const same = spec.url === original.url && (spec.payload || "") === (original.payload || "")
      && (spec.encode || []).join() === (original.encode || []).join();
    if (same) delete overrides[editing]; else overrides[editing] = spec;
    await chrome.storage.local.set({ [OVERRIDES_KEY]: overrides });
    endEdit();
    await renderManageList();
    return flash(same ? `« ${original.name} » : adresse d'origine.` : `« ${original.name} » modifiée.`, addMsg);
  }

  if (!name || name.length > 40) return flash("Nom manquant (40 caractères au plus).", addMsg);
  const { error } = checkSpec(raw);
  if (error) return flash(error, addMsg);
  const data = await chrome.storage.local.get({ [CUSTOM_KEY]: [], [STORAGE_KEY]: DEFAULT_CHECKED });

  // Agence personnalisée existante : remplacée sur place.
  if (editing) {
    const agency = cleanCustomAgency({ id: editing, name, ...raw });
    await chrome.storage.local.set({ [CUSTOM_KEY]: data[CUSTOM_KEY].map((c) => (c && c.id === editing ? agency : c)) });
    endEdit();
    await renderManageList();
    return flash(`« ${agency.name} » modifiée.`, addMsg);
  }

  // Nouvelle agence.
  if (data[CUSTOM_KEY].length >= MAX_CUSTOM) return flash(`${MAX_CUSTOM} agences personnalisées au maximum.`, addMsg);
  const id = "custom-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const agency = cleanCustomAgency({ id, name, ...raw });
  await chrome.storage.local.set({
    [CUSTOM_KEY]: data[CUSTOM_KEY].concat(agency),
    [STORAGE_KEY]: data[STORAGE_KEY].concat(id) // cochée d'office
  });
  addForm.reset();
  detectMsg.textContent = "";
  ed.advanced.open = false;
  await renderManageList();
  flash(`« ${agency.name} » ajoutée.`, addMsg);
});

settingsForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const values = {};
  for (const o of OPTIONS) {
    const v = document.getElementById("opt-" + o.id).value.trim();
    if (v !== "" && !new RegExp(o.pattern).test(v)) {
      flash(`Valeur invalide pour « ${o.label} ».`);
      return;
    }
    values[o.id] = v;
  }
  await chrome.storage.local.set({ [OPTIONS_KEY]: values });
  flash("Réglages enregistrés.");
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
  // {q:slug} : mots séparés par des tirets (ex. « emmanuel-macron »).
  const slug = q.split(/\s+/).filter(Boolean).map(encodeURIComponent).join("-");
  let url = applyOptions(agency.url, options).split("{q:slug}").join(slug).split("{q}").join(encodeURIComponent(q));
  if (url.includes("{payload}")) {
    const jsonSafe = JSON.stringify(q).slice(1, -1); // échappe " et \
    const payload = (agency.payload || "").split("{q}").join(jsonSafe);
    url = url.split("{payload}").join(await applySteps(payload, agency.encode));
  }
  return url;
}

/* ---------- Interface ---------- */

const ORDER_KEY = "agencyOrder";
let ALL = AGENCIES; // intégrées + personnalisées (complété au chargement)
let AGENCY_BY_ID = new Map(ALL.map((a) => [a.id, a]));
let fullOrder = []; // ordre de toutes les agences, masquées comprises

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
  ALL.forEach((a, i) => {
    if (seen.has(a.id)) return;
    const prev = i > 0 ? out.indexOf(ALL[i - 1]) : -1;
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

// Les visibles prennent l'ordre affiché ; chaque agence masquée reste juste
// après celle qui la précédait.
function saveOrder() {
  const visible = boxes().map((b) => b.value);
  const shown = new Set(visible);
  const out = [...visible];
  fullOrder.forEach((id, i) => {
    if (shown.has(id)) return;
    const pos = i > 0 ? out.indexOf(fullOrder[i - 1]) : -1;
    out.splice(pos + 1, 0, id);
  });
  fullOrder = out;
  chrome.storage.local.set({ [ORDER_KEY]: fullOrder });
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

// (Re)construit la liste : agences intégrées + personnalisées, sans les masquées.
async function refreshList() {
  const ag = await loadAgencies();
  ALL = ag.all;
  AGENCY_BY_ID = new Map(ALL.map((a) => [a.id, a]));
  const data = await chrome.storage.local.get({ [STORAGE_KEY]: DEFAULT_CHECKED, [ORDER_KEY]: [], [QUERY_KEY]: "" });
  const ordered = orderedAgencies(data[ORDER_KEY]);
  fullOrder = ordered.map((a) => a.id);
  list.textContent = "";
  render(ordered.filter((a) => !ag.hidden.has(a.id)), data[STORAGE_KEY]);
  return data;
}

refreshList().then((data) => {
  // Derniers mots-clés, sélectionnés : on tape pour les remplacer.
  if (data[QUERY_KEY] && !input.value) { input.value = data[QUERY_KEY]; input.select(); }
});
