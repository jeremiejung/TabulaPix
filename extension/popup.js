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
    li.dataset.id = a.id;
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
      tag.textContent = a.custom ? (a.fill ? "perso · champ" : "perso") : "modifiée";
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
        const rest = custom.filter((c) => c && c.id !== a.id);
        await chrome.storage.local.set({ [CUSTOM_KEY]: rest });
        if (a.fill) releasePermission(a, rest);
        if (editing === a.id) resetEditor();
        await renderManageList();
        flash(`« ${a.name} » supprimée.`, listMsg);
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
  if (!(await restoreDraft())) resetEditor();
  await renderManageList();
  renderOptionFields(await loadOptions());
  settingsMsg.textContent = listMsg.textContent = "";
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

/* ---------- Éditeur d'agence : détecter → vérifier → ajouter ---------- */

const ORIGINAL_BY_ID = new Map(AGENCIES.map((a) => [a.id, a]));
const AGENCY_DRAFT_KEY = "agencyDraft"; // brouillon en cours (mémoire de session)
const PICK_RESULT_KEY = "pickResult";   // champ et bouton repérés sur le site
const $id = (x) => document.getElementById(x);
const ed = {
  title: $id("editorTitle"), step1: $id("step1"), detUrl: $id("detUrl"), detQ: $id("detQ"),
  detectMsg: $id("detectMsg"), manualLink: $id("manualLink"), step2Msg: $id("step2Msg"),
  name: $id("newName"), url: $id("newUrl"), urlLabel: $id("urlLabel"), urlHelp: $id("urlHelp"),
  fillBox: $id("fillBox"), chkField: $id("chkField"), chkButton: $id("chkButton"),
  pickBtn: $id("pickBtn"), backToUrl: $id("backToUrl"), advanced: $id("advanced"),
  techUrl: $id("techUrl"), techFill: $id("techFill"), payload: $id("newPayload"), encode: $id("newEncode"),
  tryBtn: $id("tryBtn"), submit: $id("agencySubmit"), reset: $id("resetAgency"), cancel: $id("cancelEdit"),
  form: addForm
};
const listMsg = $id("listMsg");

// Brouillon : { id, editing, builtin, mode: "url" | "fill", fill }
let draft = null;
let editing = null; // id de l'agence en cours de modification (surlignée dans la liste)

// Retire l'autorisation d'un site quand plus aucune agence ajoutée ne le remplit
// (jamais pour les sites des agences intégrées, autorisés d'office).
async function releasePermission(agency, remaining) {
  const host = hostOf(agency.url, {});
  if (!host || AGENCIES.some((b) => b.fill && hostOf(b.url, {}) === host)) return;
  if (remaining.some((c) => c && c.fill && hostOf(c.url, {}) === host)) return;
  try { await chrome.permissions.remove({ origins: [originPattern(host)] }); } catch (_) { /* déjà retirée */ }
}

const newId = () => "custom-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

// Surbrillance verte qui s'estompe, sur ce qui vient d'être rempli ou ajouté.
function flashEl(...els) {
  for (const el of els) {
    if (!el) continue;
    el.classList.remove("flash");
    void el.offsetWidth; // relance l'animation
    el.classList.add("flash");
  }
}

// Nom proposé : le domaine sans sous-domaine ni extension (search.reaphoto.com → Reaphoto).
function nameFromUrl(url) {
  let host;
  try { host = new URL(url).hostname; } catch (_) { return ""; }
  const labels = host.split(".");
  let i = labels.length - 2;
  // extensions en deux parties : co.uk, com.au, org.uk…
  if (labels.length >= 3 && labels[labels.length - 1].length === 2 && /^(co|com|org|net|ac|gov|edu)$/.test(labels[i])) i -= 1;
  const base = labels[Math.max(i, 0)] || host;
  return base.charAt(0).toUpperCase() + base.slice(1);
}

function renderChecks() {
  const fill = draft && draft.fill;
  const set = (li, done, label) => {
    li.classList.toggle("done", done);
    li.querySelector(".mark").textContent = done ? "✓" : "○";
    li.lastChild.textContent = " " + label;
  };
  set(ed.chkField, Boolean(fill && fill.input), "Champ de recherche");
  set(ed.chkButton, Boolean(fill && fill.input), fill && fill.input && !fill.submit ? "Touche Entrée (pas de bouton)" : "Bouton de recherche");
  ed.pickBtn.textContent = fill && fill.input ? "Refaire le repérage" : "Repérer le champ sur le site";
  ed.techFill.hidden = !(draft && draft.mode === "fill" && fill && fill.input);
  if (fill && fill.input) ed.techFill.textContent = `Champ : ${fill.input}${fill.submit ? ` — bouton : ${fill.submit}` : " — touche Entrée"}`;
}

function setMode(mode) {
  draft.mode = mode;
  const fill = mode === "fill";
  ed.fillBox.hidden = !fill;
  ed.urlHelp.hidden = fill;
  ed.techUrl.hidden = fill;
  ed.urlLabel.textContent = fill ? "Page avec le champ de recherche" : "Adresse de recherche";
  ed.url.placeholder = fill ? "https://…" : "https://…{q}…";
  ed.backToUrl.hidden = draft.builtin;
  renderChecks();
  validate();
}

// Vérifie le formulaire ; active « Ajouter » seulement quand tout est bon.
function validate() {
  if (!draft) return "Rien à ajouter.";
  let error = "";
  const name = ed.name.value.trim();
  if (!draft.builtin && (!name || name.length > 40)) error = "Indiquez un nom (40 caractères au plus).";
  const { spec, error: specError } = checkSpec(
    { url: ed.url.value, payload: draft.mode === "url" ? ed.payload.value : "", encode: draft.mode === "url" ? ed.encode.value : "" },
    { allowOptions: draft.builtin }
  );
  if (!error && specError) error = specError;
  if (!error && draft.mode === "fill" && !(draft.fill && draft.fill.input)) error = "Repérez le champ de recherche sur le site.";
  const original = draft.builtin && ORIGINAL_BY_ID.get(draft.id);
  if (!error && original && original.fill && spec && hostOf(spec.url, {}) !== hostOf(original.url, {})) {
    error = `Pour ${original.name}, l'adresse doit rester sur ${hostOf(original.url, {})}.`;
  }
  ed.submit.disabled = Boolean(error);
  ed.tryBtn.disabled = Boolean(specError) || (draft.mode === "fill" && !(draft.fill && draft.fill.input));
  ed.submit.title = error;
  return error;
}

function showStep2(message) {
  ed.form.hidden = false;
  ed.step2Msg.textContent = message || "";
  ed.step2Msg.hidden = !message;
  validate();
}

async function saveDraft() {
  if (!draft) return chrome.storage.session.remove(AGENCY_DRAFT_KEY);
  await chrome.storage.session.set({
    [AGENCY_DRAFT_KEY]: {
      ...draft, name: ed.name.value, url: ed.url.value, payload: ed.payload.value, encode: ed.encode.value,
      detUrl: ed.detUrl.value, detQ: ed.detQ.value, step2: !ed.form.hidden, step2Msg: ed.step2Msg.textContent
    }
  });
}

function resetEditor() {
  draft = null;
  editing = null;
  ed.form.reset();
  ed.detUrl.value = ed.detQ.value = "";
  ed.detectMsg.textContent = ed.step2Msg.textContent = addMsg.textContent = "";
  ed.form.hidden = true;
  ed.title.textContent = "Ajouter une agence";
  ed.name.disabled = false;
  ed.reset.hidden = true;
  ed.advanced.open = false;
  ed.submit.textContent = "Ajouter l'agence";
  chrome.storage.session.remove([AGENCY_DRAFT_KEY, PICK_RESULT_KEY, "fillDraft"]);
}

function startEdit(a) {
  resetEditor();
  draft = { id: a.id, editing: true, builtin: !a.custom, mode: a.custom && a.fill ? "fill" : "url", fill: a.custom ? a.fill || null : null, pageHost: hostOf(a.url, {}) };
  editing = a.id;
  ed.title.textContent = `Modifier « ${a.name} »`;
  ed.name.value = a.name;
  ed.name.disabled = !a.custom; // le nom des agences intégrées ne change pas
  ed.url.value = a.url;
  ed.payload.value = a.payload || "";
  ed.encode.value = (a.encode || []).join(", ");
  ed.reset.hidden = !a.modified;
  ed.submit.textContent = "Enregistrer";
  setMode(draft.mode);
  showStep2("");
  saveDraft();
  renderManageList();
  ed.title.scrollIntoView({ block: "start" });
}

// Reprend un brouillon (ex. après le repérage sur le site, qui ferme la popup).
async function restoreDraft() {
  const data = await chrome.storage.session.get([AGENCY_DRAFT_KEY, PICK_RESULT_KEY]);
  const saved = data[AGENCY_DRAFT_KEY];
  if (!saved) return false;
  draft = { id: saved.id, editing: saved.editing, builtin: saved.builtin, mode: saved.mode, fill: saved.fill || null, pageHost: saved.pageHost, review: saved.review };
  editing = saved.editing ? saved.id : null;
  ed.title.textContent = saved.editing ? `Modifier « ${saved.name} »` : "Ajouter une agence";
  ed.detUrl.value = saved.detUrl || "";
  ed.detQ.value = saved.detQ || "";
  ed.name.value = saved.name || "";
  ed.name.disabled = saved.builtin;
  ed.url.value = saved.url || "";
  ed.payload.value = saved.payload || "";
  ed.encode.value = saved.encode || "";
  ed.submit.textContent = saved.editing ? "Enregistrer" : "Ajouter l'agence";
  ed.reset.hidden = !(saved.builtin && ORIGINAL_BY_ID.has(saved.id) && saved.editing);
  setMode(saved.mode);
  if (saved.step2) showStep2(saved.step2Msg);
  await applyPickResult(data[PICK_RESULT_KEY]);
  return true;
}

async function applyPickResult(result) {
  if (!draft || !result || result.draftId !== draft.id) return;
  draft.fill = cleanFill(result) || null;
  draft.review = true; // à vérifier : TabulaPix rouvrira cette étape tant qu'elle n'est pas validée
  setMode("fill");
  showStep2(draft.editing ? "Champ et bouton repérés : vérifiez, puis enregistrez." : "Champ et bouton repérés : vérifiez, puis ajoutez l'agence.");
  flashEl(ed.chkField, ed.chkButton, ed.step2Msg);
  await chrome.storage.session.remove(PICK_RESULT_KEY);
  await saveDraft();
}

/* Étape 1 : détection */
document.getElementById("detectBtn").addEventListener("click", async () => {
  const pageUrl = ed.detUrl.value.trim();
  const r = await detectSearchUrl(pageUrl, ed.detQ.value);
  if (!draft) draft = { id: newId(), editing: false, builtin: false, mode: "url", fill: null };
  ed.detectMsg.className = "status err";
  if (r.error && !(r.notFound && !draft.builtin)) { ed.detectMsg.textContent = r.error; return; }
  ed.detectMsg.textContent = "";
  if (!draft.builtin && !ed.name.value.trim()) ed.name.value = nameFromUrl(pageUrl);

  if (r.notFound) {
    // Mots-clés absents de l'adresse : on remplira le champ de recherche du site.
    ed.url.value = pageUrl;
    draft.fill = null;
    setMode("fill");
    showStep2("Les mots-clés ne figurent pas dans l'adresse : TabulaPix remplira le champ de recherche du site.");
    flashEl(ed.name, ed.url, ed.step2Msg, ed.fillBox);
  } else {
    ed.url.value = r.url;
    ed.payload.value = r.payload || "";
    ed.encode.value = (r.encode || []).join(", ");
    if (!draft.builtin) draft.fill = null;
    setMode("url");
    showStep2([r.summary, ...r.warnings.map((w) => "⚠ " + w), draft.editing ? "Vérifiez, puis enregistrez." : "Vérifiez, puis ajoutez l'agence."].join("\n"));
    flashEl(ed.name, ed.url, ed.step2Msg);
  }
  await saveDraft();
});

ed.manualLink.addEventListener("click", async () => {
  if (!draft) draft = { id: newId(), editing: false, builtin: false, mode: "url", fill: null };
  setMode("url");
  showStep2("Saisissez l'adresse de recherche, avec {q} à la place des mots-clés.");
  ed.url.focus();
  await saveDraft();
});

ed.backToUrl.addEventListener("click", async () => {
  draft.fill = null;
  setMode("url");
  ed.url.focus();
  await saveDraft();
});

// Saisie : on revérifie ; une autre page = repérage à refaire.
for (const el of [ed.name, ed.url, ed.payload, ed.encode]) {
  el.addEventListener("input", () => {
    if (!draft) return;
    if (el === ed.url && draft.mode === "fill" && draft.fill && !draft.builtin) {
      const before = draft.pageHost;
      const now = hostOf(ed.url.value.replace(/\{[^}]*\}/g, "x"), {});
      if (before && now !== before) { draft.fill = null; renderChecks(); }
    }
    validate();
    saveDraft();
  });
}

/* Repérage sur le site : autorisation Chrome, puis le script d'arrière-plan
   ouvre le site ; le résultat revient dans le brouillon (pickResult). */
ed.pickBtn.addEventListener("click", () => {
  const { spec, error } = checkSpec({ url: ed.url.value });
  if (error) return flash(error, addMsg);
  const host = hostOf(spec.url, {});
  draft.pageHost = host;
  const pick = { id: draft.id, name: ed.name.value.trim() || nameFromUrl(spec.url) || host, url: spec.url };
  saveDraft();
  chrome.storage.session.set({ fillDraft: pick }); // relu si la popup se ferme pendant la demande
  // La demande d'autorisation doit partir directement du clic.
  chrome.permissions.request({ origins: [originPattern(host)] }).then(async (granted) => {
    if (!granted) return flash(`Autorisation refusée pour ${host} : impossible de remplir son champ de recherche.`, addMsg);
    const res = await chrome.runtime.sendMessage({ type: "pick", draft: pick });
    if (!res || !res.ok) return flash((res && res.error) || "Repérage impossible.", addMsg);
    addMsg.textContent = "Le site s'ouvre : cliquez sur son champ de recherche, puis sur son bouton.";
    if (isPopup) window.close();
  });
});

/* Essayer : recherche d'essai, dans un nouvel onglet, avec les réglages en cours */
ed.tryBtn.addEventListener("click", async () => {
  const builtin = draft.builtin ? ORIGINAL_BY_ID.get(draft.id) : null;
  const { spec, error } = checkSpec(
    { url: ed.url.value, payload: draft.mode === "url" ? ed.payload.value : "", encode: draft.mode === "url" ? ed.encode.value : "" },
    { allowOptions: Boolean(builtin) }
  );
  if (error) return flash(error, addMsg);
  const q = ed.detQ.value.trim() || input.value.trim() || "Estonie frontière";
  const url = await buildUrl(spec, q, await loadOptions());
  const fill = draft.mode === "fill" ? draft.fill : (builtin ? builtin.fill || null : null);
  const res = await chrome.runtime.sendMessage({ type: "try", url, q, fill, builtinId: builtin ? builtin.id : null });
  flash(res && res.ok ? `Essai lancé avec « ${q} » dans un nouvel onglet.` : (res && res.error) || "Essai impossible.", addMsg);
});

ed.cancel.addEventListener("click", async () => { resetEditor(); await renderManageList(); });

ed.reset.addEventListener("click", async () => {
  const id = draft.id;
  const { [OVERRIDES_KEY]: overrides = {} } = await chrome.storage.local.get(OVERRIDES_KEY);
  delete overrides[id];
  await chrome.storage.local.set({ [OVERRIDES_KEY]: overrides });
  resetEditor();
  await renderManageList();
  flashEl(manageList.querySelector(`li[data-id="${id}"]`));
  flash(`« ${ORIGINAL_BY_ID.get(id).name} » : adresse d'origine rétablie.`, listMsg);
});

/* Étape 3 : ajouter (ou enregistrer la modification) */
addForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const error = validate();
  if (error) return flash(error, addMsg);
  const id = draft.id;
  const name = ed.name.value.trim();
  const raw = { url: ed.url.value, payload: draft.mode === "url" ? ed.payload.value : "", encode: draft.mode === "url" ? ed.encode.value : "" };
  let done;

  if (draft.builtin) {
    // Agence intégrée : seulement une modification de son adresse.
    const original = ORIGINAL_BY_ID.get(id);
    const { spec } = checkSpec(raw, { allowOptions: true });
    const { [OVERRIDES_KEY]: overrides = {} } = await chrome.storage.local.get(OVERRIDES_KEY);
    const same = spec.url === original.url && (spec.payload || "") === (original.payload || "")
      && (spec.encode || []).join() === (original.encode || []).join();
    if (same) delete overrides[id]; else overrides[id] = spec;
    await chrome.storage.local.set({ [OVERRIDES_KEY]: overrides });
    done = same ? `« ${original.name} » : adresse d'origine.` : `« ${original.name} » modifiée.`;
  } else {
    const agency = cleanCustomAgency({ id, name, ...raw, fill: draft.mode === "fill" ? draft.fill : undefined });
    if (!agency) return flash("Agence invalide : vérifiez le nom et l'adresse.", addMsg);
    const data = await chrome.storage.local.get({ [CUSTOM_KEY]: [], [STORAGE_KEY]: DEFAULT_CHECKED });
    const before = data[CUSTOM_KEY].find((c) => c && c.id === id);
    if (before) {
      const after = data[CUSTOM_KEY].map((c) => (c && c.id === id ? agency : c));
      await chrome.storage.local.set({ [CUSTOM_KEY]: after });
      if (before.fill && !agency.fill) releasePermission(before, after);
      done = `« ${agency.name} » modifiée.`;
    } else {
      if (data[CUSTOM_KEY].length >= MAX_CUSTOM) return flash(`${MAX_CUSTOM} agences personnalisées au maximum.`, addMsg);
      await chrome.storage.local.set({
        [CUSTOM_KEY]: data[CUSTOM_KEY].concat(agency),
        [STORAGE_KEY]: data[STORAGE_KEY].concat(id) // cochée d'office
      });
      done = `« ${agency.name} » ajoutée.`;
    }
  }
  resetEditor();
  await renderManageList();
  const li = manageList.querySelector(`li[data-id="${id}"]`);
  li?.scrollIntoView({ block: "nearest" });
  flashEl(li);
  flash(done, listMsg);
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
  // {q:slug} : mots séparés par des tirets (ex. « estonie-frontière »).
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

chrome.storage.onChanged.addListener((changes, area) => {
  // Agences modifiées ailleurs (autre fenêtre) : on met la liste à jour.
  if (area === "local" && changes[CUSTOM_KEY]) {
    if (!settingsView.hidden) renderManageList(); else refreshList();
  }
  // Repérage terminé sur le site (colonne latérale restée ouverte) : on l'affiche.
  if (area === "session" && changes[PICK_RESULT_KEY] && changes[PICK_RESULT_KEY].newValue) {
    if (settingsView.hidden) showSettings(); else applyPickResult(changes[PICK_RESULT_KEY].newValue);
  }
});

// Réouverture après un repérage : on revient directement à l'étape « vérifier ».
chrome.storage.session.get([AGENCY_DRAFT_KEY, PICK_RESULT_KEY]).then((data) => {
  const d = data[AGENCY_DRAFT_KEY], r = data[PICK_RESULT_KEY];
  if (d && ((r && r.draftId === d.id) || d.review)) showSettings();
});
