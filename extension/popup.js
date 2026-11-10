"use strict";

const STORAGE_KEY = "checkedAgencies";
const QUERY_KEY = "lastQuery";
const list = document.getElementById("list");
const input = document.getElementById("q");
const msg = document.getElementById("msg");

// Une agence est « manuelle » si ni son URL ni « fill » ne transmettent les
// mots-clés : on ouvre la page et on copie les mots-clés dans le presse-papiers.
const isManual = (a) => !a.fill && !/\{(q|q:slug|payload)\}/.test(a.url);

/* ---------- Langue ---------- */

const langSelect = document.getElementById("langSelect");
applyI18n(); // langue du navigateur tout de suite…
const langReady = loadLang().then((choice) => { // …puis celle choisie dans les réglages
  langSelect.value = choice;
  applyI18n();
});

langSelect.addEventListener("change", async () => {
  await chrome.storage.local.set({ [LANG_KEY]: langSelect.value });
  await loadLang();
  applyI18n();
  // Textes construits par le code : on les refait dans la nouvelle langue.
  await renderRemoved();
  fillFolderSelect();
  renderOptionFields(await loadOptions());
  if (draft) { layoutEditor(Boolean(draft.editing)); setMode(draft.mode); ed.title.textContent = draft.editing ? t("ed.editTitle", { name: ed.name.value }) : t("ed.addTitle"); ed.submit.textContent = draft.editing ? t("ed.saveEdit") : t("ed.add"); }
  else { ed.title.textContent = t("ed.addTitle"); }
  list.textContent = "";
  await refreshList();
});

/* ---------- Popup ou panneau latéral ---------- */

// Le même fichier sert de popup et de panneau latéral.
const isPopup = chrome.extension.getViews({ type: "popup" }).includes(window);
if (!isPopup) document.documentElement.classList.add("panel");

// L'identifiant de la fenêtre est lu dès l'ouverture : Chrome n'autorise
// l'ouverture du panneau que directement dans le clic.
let windowId = null;
chrome.windows.getCurrent().then(async (w) => {
  windowId = w.id;
  // Sécurité : popup ouverte alors que la colonne TabulaPix est déjà ouverte
  // dans cette fenêtre (normalement évité par le script d'arrière-plan) →
  // le clic sur l'icône sert d'interrupteur : on ferme la colonne et la popup.
  if (!isPopup || !chrome.runtime.getContexts) return;
  try {
    const panels = await chrome.runtime.getContexts({ contextTypes: ["SIDE_PANEL"] });
    // Fenêtre non précisée par Chrome (-1) : on n'agit que s'il n'y a qu'une fenêtre.
    const single = (await chrome.windows.getAll({ windowTypes: ["normal"] })).length === 1;
    if (!panels.some((c) => c.windowId === w.id || (c.windowId === -1 && single))) return;
    if (chrome.sidePanel && chrome.sidePanel.close) await chrome.sidePanel.close({ windowId: w.id }).catch(() => {});
    window.close();
  } catch (_) { /* Chrome trop ancien : on garde la popup */ }
});

const headMsg = document.getElementById("headMsg"); // erreurs du bouton colonne, juste sous l'en-tête
document.getElementById("pin").addEventListener("click", () => {
  if (windowId === null || !chrome.sidePanel) {
    headMsg.textContent = t("main.panelUnavailable");
    return;
  }
  chrome.sidePanel.open({ windowId }).then(() => window.close(), () => {
    headMsg.textContent = t("main.panelError");
  });
});

// Colonne latérale : on le signale au script d'arrière-plan, qui fait alors
// agir l'icône de l'extension sur la colonne (pas de popup en plus). Un
// simple message (et non une connexion permanente, qui pouvait laisser une
// erreur « Receiving end does not exist » dans chrome://extensions).
if (!isPopup) chrome.runtime.sendMessage({ type: "panelOpened" }).catch(() => {});

/* ---------- Vue Options (dans la popup / le panneau) ---------- */

const mainForm = document.getElementById("form");
const settingsView = document.getElementById("settingsView");
const settingsForm = document.getElementById("settingsForm");
const addForm = document.getElementById("addForm");
const editorView = document.getElementById("editorView");
const fields = document.getElementById("fields");
const settingsMsg = document.getElementById("settingsMsg");
const addMsg = document.getElementById("addMsg");

function flash(text, el = settingsMsg) {
  el.textContent = text;
  // Sous le bouton de recherche, un message (erreur) reste jusqu'à l'action
  // suivante : s'il s'effaçait tout seul, la liste remonterait d'un coup.
  if (el === msg || el.classList.contains("field-err")) return;
  setTimeout(() => { if (el.textContent === text) el.textContent = ""; }, 3000);
}

// Supprime une agence (mode Organiser). Une agence fournie est seulement
// retirée de la liste : « Restaurer » dans les options la fait revenir.
async function deleteAgency(a) {
  if (!confirm(t(a.custom ? "opt.delete.confirm" : "opt.delete.builtinConfirm", { name: a.name }))) return;
  if (a.custom) {
    // Agence ajoutée : effacée partout (case, ordre, masquage, dossier).
    const data = await chrome.storage.local.get({ [CUSTOM_KEY]: [], [STORAGE_KEY]: [], [ORDER_KEY]: [], [HIDDEN_KEY]: [], [FOLDER_OF_KEY]: {} });
    const without = (list) => (Array.isArray(list) ? list.filter((x) => x !== a.id) : []);
    const folderOf = data[FOLDER_OF_KEY] && typeof data[FOLDER_OF_KEY] === "object" ? data[FOLDER_OF_KEY] : {};
    delete folderOf[a.id];
    await chrome.storage.local.set({
      [CUSTOM_KEY]: data[CUSTOM_KEY].filter((c) => c && c.id !== a.id),
      [STORAGE_KEY]: without(data[STORAGE_KEY]), [ORDER_KEY]: without(data[ORDER_KEY]),
      [HIDDEN_KEY]: without(data[HIDDEN_KEY]), [FOLDER_OF_KEY]: folderOf
    });
  } else {
    const data = await chrome.storage.local.get({ [REMOVED_KEY]: [], [OVERRIDES_KEY]: {} });
    delete data[OVERRIDES_KEY][a.id];
    await chrome.storage.local.set({ [REMOVED_KEY]: [...new Set(data[REMOVED_KEY].concat(a.id))], [OVERRIDES_KEY]: data[OVERRIDES_KEY] });
  }
  await releaseUnusedOrigins();
}

// Masque ou réaffiche une agence (mode Organiser).
async function setHidden(id, hide) {
  const { [HIDDEN_KEY]: hidden = [] } = await chrome.storage.local.get(HIDDEN_KEY);
  const set = new Set(hidden);
  hide ? set.add(id) : set.delete(id);
  await chrome.storage.local.set({ [HIDDEN_KEY]: [...set] });
}

// Options : agences fournies supprimées, récupérables d'un clic.
async function renderRemoved() {
  const ag = await loadAgencies();
  document.getElementById("removedLine").hidden = !ag.removed.size;
  document.getElementById("removedText").textContent = t("opt.removed.line", { n: ag.removed.size });
}

function renderOptionFields(values) {
  fields.textContent = "";
  for (const o of OPTIONS) {
    const div = document.createElement("div");
    div.className = "field";
    const label = document.createElement("label");
    label.htmlFor = "opt-" + o.id;
    label.textContent = t(`opt.${o.id}.label`);
    const field = document.createElement("input");
    field.id = "opt-" + o.id;
    field.autocomplete = "off";
    field.spellcheck = false;
    field.value = values[o.id] ?? o.default;
    field.placeholder = o.default;
    field.pattern = o.pattern.replace(/^\^|\$$/g, ""); // l'attribut HTML ajoute ^…$ lui-même
    const help = document.createElement("p");
    help.className = "help";
    help.textContent = t(`opt.${o.id}.help`);
    div.append(label, field, help);
    fields.append(div);
  }
}

let cachedOptions = {}; // réglages en mémoire (l'autorisation doit partir directement du clic)
loadOptions().then((o) => { cachedOptions = o; });

// Trois écrans dans la même page : recherche, éditeur d'agence, options.
function showView(view) {
  mainForm.hidden = view !== mainForm;
  editorView.hidden = view !== editorView;
  settingsView.hidden = view !== settingsView;
  scrollTo(0, 0);
}

async function showSettings() {
  await renderRemoved();
  // Sites encore à autoriser (import, refus…) : le bouton reste disponible.
  const missing = await missingFillOrigins((await loadAgencies()).all);
  missingOrigins = [...missing.keys()];
  authorizeBtn.hidden = !missingOrigins.length;
  authorizeBtn.textContent = t("backup.authorize", { n: missingOrigins.length });
  renderOptionFields(await loadOptions());
  settingsMsg.textContent = document.getElementById("restoreMsg").textContent = "";
  showView(settingsView);
  document.getElementById("back").focus();
}

async function showMain() {
  await refreshList();
  showView(mainForm);
  if (!organizing) input.focus();
}

// Éditeur d'agence : a = agence à modifier ; sans a, ajout (ou brouillon repris).
async function showEditor(a) {
  fillFolderSelect();
  if (a) startEdit(a);
  else if (!(await restoreDraft())) resetEditor();
  showView(editorView);
  (draft && draft.editing ? ed.name : ed.detUrl).focus();
}

// Retour à la liste après l'éditeur : l'agence ajoutée ou modifiée y est
// surlignée (pas de message, qui ferait bouger la liste en disparaissant).
async function leaveEditor(id) {
  resetEditor();
  if (id) highlightFresh(`li.agency[data-id="${CSS.escape(id)}"]`);
  await showMain();
}

document.getElementById("settings").addEventListener("click", showSettings);
document.getElementById("back").addEventListener("click", showMain);
document.getElementById("edBack").addEventListener("click", () => leaveEditor());

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
  folder: $id("newFolder"),
  form: addForm
};

// Brouillon : { id, editing, builtin, mode: "url" | "fill", fill }
let draft = null;

// Retire les autorisations de sites dont plus aucune agence ne remplit le champ
// (agence supprimée, passée à une adresse de recherche, rétablie, import…).
// Les sites du manifeste ne sont jamais concernés ; celui d'un repérage en
// cours est gardé.
async function releaseUnusedOrigins() {
  const options = await loadOptions();
  const keep = new Set((await loadAgencies(options)).all.filter((a) => a.fill)
    .map((a) => hostOf(a.url, options)).filter(Boolean).map(originPattern));
  const { fillDraft } = await chrome.storage.session.get("fillDraft");
  const pickHost = fillDraft && hostOf(String(fillDraft.url || ""), {});
  if (pickHost) keep.add(originPattern(pickHost));
  for (const origin of await optionalOriginsGranted()) {
    if (!keep.has(origin)) { try { await chrome.permissions.remove({ origins: [origin] }); } catch (_) { /* déjà retirée */ } }
  }
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
    li.querySelector(".mark").replaceChildren(icon(done ? "check" : "dot")); // icônes dessinées, pas de ✓ / ○
    li.lastChild.textContent = " " + label;
    li.setAttribute("aria-label", `${label} : ${t(done ? "ed.chk.done" : "ed.chk.todo")}`); // l'état sans la seule icône
  };
  set(ed.chkField, Boolean(fill && fill.input), t("ed.chk.field"));
  set(ed.chkButton, Boolean(fill && fill.input), fill && fill.input && !fill.submit ? t("ed.chk.enter") : t("ed.chk.button"));
  ed.pickBtn.textContent = fill && fill.input ? t("ed.repick") : t("ed.pick");
  ed.techFill.hidden = !(draft && draft.mode === "fill" && fill && fill.input);
  // En mode « remplir le champ », rien à montrer tant que le champ n'est pas repéré.
  ed.advanced.hidden = Boolean(draft && draft.mode === "fill" && !(fill && fill.input));
  if (fill && fill.input) ed.techFill.textContent = t("ed.tech.fill", { input: fill.input, button: fill.submit ? t("ed.tech.fill.button", { submit: fill.submit }) : t("ed.tech.fill.enter") });
}

function setMode(mode) {
  draft.mode = mode;
  const fill = mode === "fill";
  ed.fillBox.hidden = !fill;
  ed.urlHelp.hidden = fill;
  ed.techUrl.hidden = fill;
  ed.urlLabel.textContent = fill ? t("ed.url.fill") : t("ed.url");
  ed.url.placeholder = fill ? "https://…" : "https://…{q}…";
  ed.backToUrl.hidden = false;
  renderChecks();
  validate();
}

// Erreurs de saisie affichées sous le champ en cause, une fois ce champ
// modifié (pas de rouge sur un formulaire qu'on vient d'ouvrir).
const touched = new Set();
const fieldErr = { name: $id("nameErr"), url: $id("urlErr"), payload: $id("payloadErr"), encode: $id("encodeErr") };
const fieldInput = { name: ed.name, url: ed.url, payload: ed.payload, encode: ed.encode };
function showFieldErrors(nameError, specError) {
  const errors = {};
  if (nameError) errors.name = nameError;
  if (specError) {
    // À quel champ revient l'erreur d'adresse ?
    const where = [t("spec.payloadLong"), t("spec.payloadMissing")].includes(specError) ? "payload"
      : specError === t("spec.encode", { steps: ENCODE_STEPS.join(", ") }) ? "encode" : "url";
    errors[where] = specError;
  }
  for (const [k, el] of Object.entries(fieldErr)) {
    // Modèle ou encodage : on les signale dès que l'adresse a été touchée.
    const show = errors[k] && (touched.has(k) || (k !== "name" && touched.has("url")));
    el.textContent = show ? errors[k] : "";
    if (show) fieldInput[k].setAttribute("aria-invalid", "true"); else fieldInput[k].removeAttribute("aria-invalid");
    if (show && k !== "name" && k !== "url") ed.advanced.open = true; // champs repliés : on les montre
  }
}

// Vérifie le formulaire ; active « Ajouter » seulement quand tout est bon.
function validate() {
  if (!draft) return t("ed.err.nothing");
  let error = "";
  const name = ed.name.value.trim();
  if (!name || name.length > 40) error = t("ed.err.name");
  const nameError = error;
  const { spec, error: specError } = checkSpec(
    { url: ed.url.value, payload: draft.mode === "url" ? ed.payload.value : "", encode: draft.mode === "url" ? ed.encode.value : "" },
    { allowOptions: draft.builtin }
  );
  showFieldErrors(nameError, specError);
  if (!error && specError) error = specError;
  if (!error && draft.mode === "fill" && !(draft.fill && draft.fill.input)) error = t("ed.err.pickNeeded");
  ed.submit.disabled = Boolean(error);
  ed.tryBtn.disabled = Boolean(specError) || (draft.mode === "fill" && !(draft.fill && draft.fill.input));
  ed.submit.title = error;
  return error;
}

// Écrit un message et ses avertissements (icône dessinée) dans el.
function writeMessage(el, message, warnings = []) {
  el.textContent = message || "";
  for (const w of warnings) {
    const line = document.createElement("span");
    line.className = "warn-line";
    const text = document.createElement("span");
    text.textContent = w;
    line.append(icon("warn"), text);
    el.append(line);
  }
}

// Message de l'étape « vérifier », en haut du formulaire.
function showStep2(message, warnings = []) {
  ed.form.hidden = false;
  writeMessage(ed.step2Msg, message, warnings);
  ed.step2Msg.hidden = !message && !warnings.length;
  validate();
}

// Résultat d'une détection : en modification, la détection est repliée en
// bas du formulaire, donc son résultat s'affiche là, sous « Re-détecter ».
function showDetectResult(message, warnings = []) {
  if (draft.editing) {
    ed.detectMsg.className = "status ok";
    writeMessage(ed.detectMsg, message, warnings);
    showStep2("");
  } else {
    showStep2(message, warnings);
  }
}

async function saveDraft() {
  if (!draft) return chrome.storage.session.remove(AGENCY_DRAFT_KEY);
  await chrome.storage.session.set({
    [AGENCY_DRAFT_KEY]: {
      ...draft, name: ed.name.value, url: ed.url.value, payload: ed.payload.value, encode: ed.encode.value, folder: ed.folder.value,
      detUrl: ed.detUrl.value, detQ: ed.detQ.value, step2: !ed.form.hidden, step2Msg: ed.step2Msg.innerText // innerText : garde les retours à la ligne des avertissements
    }
  });
}

// Ajout : la détection d'abord. Modification : le formulaire d'abord, la
// détection repliée en bas (« Re-détecter »), sans « Saisir à la main ».
const redetect = $id("redetect");
const detectBtn = $id("detectBtn");
function layoutEditor(editing) {
  const help = ed.step1.querySelector(".help");
  if (editing) {
    $id("redetectSlot").append(ed.step1);
    redetect.hidden = false;
    ed.step1.hidden = false;
    help.textContent = t("ed.redetect.help");
    detectBtn.textContent = t("ed.redetect");
    detectBtn.className = "secondary";
  } else {
    editorView.insertBefore(ed.step1, ed.form);
    redetect.hidden = true;
    redetect.open = false;
    ed.step1.hidden = false;
    help.textContent = t("ed.step1.help");
    detectBtn.textContent = t("ed.detect");
    detectBtn.className = "primary";
  }
  ed.manualLink.hidden = editing;
}

// Entrée dans les champs de détection : détecter (et non enregistrer le formulaire).
for (const el of [ed.detUrl, ed.detQ]) {
  el.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); detectBtn.click(); } });
}

function resetEditor() {
  draft = null;
  layoutEditor(false);
  ed.form.reset();
  ed.detUrl.value = ed.detQ.value = "";
  ed.detectMsg.textContent = ed.step2Msg.textContent = addMsg.textContent = pickMsg.textContent = "";
  touched.clear();
  ed.form.hidden = true;
  ed.title.textContent = t("ed.addTitle");
  ed.name.disabled = false;
  ed.reset.hidden = true;
  ed.advanced.open = false;
  ed.advanced.hidden = false;
  ed.submit.textContent = t("ed.add");
  chrome.storage.session.remove([AGENCY_DRAFT_KEY, PICK_RESULT_KEY, "fillDraft"]);
}

function startEdit(a) {
  resetEditor();
  draft = { id: a.id, editing: true, builtin: !a.custom, mode: a.fill ? "fill" : "url", fill: a.fill || null, pageHost: hostOf(a.url, cachedOptions) };
  layoutEditor(true);
  redetect.open = false;
  loadFolders().then(({ folderOf }) => { ed.folder.value = folderOf[a.id] || ""; saveDraft(); });
  ed.title.textContent = t("ed.editTitle", { name: a.name });
  ed.name.value = a.name;
  ed.name.disabled = false;
  ed.url.value = a.url;
  ed.payload.value = a.payload || "";
  ed.encode.value = (a.encode || []).join(", ");
  ed.reset.hidden = !a.modified;
  ed.submit.textContent = t("ed.saveEdit");
  setMode(draft.mode);
  showStep2("");
  saveDraft();
}

// Reprend un brouillon (ex. après le repérage sur le site, qui ferme la popup).
async function restoreDraft() {
  const data = await chrome.storage.session.get([AGENCY_DRAFT_KEY, PICK_RESULT_KEY]);
  const saved = data[AGENCY_DRAFT_KEY];
  if (!saved) return false;
  draft = { id: saved.id, editing: saved.editing, builtin: saved.builtin, mode: saved.mode, fill: saved.fill || null, pageHost: saved.pageHost, review: saved.review };
  ed.title.textContent = saved.editing ? t("ed.editTitle", { name: saved.name }) : t("ed.addTitle");
  ed.detUrl.value = saved.detUrl || "";
  ed.detQ.value = saved.detQ || "";
  ed.name.value = saved.name || "";
  ed.name.disabled = false;
  ed.url.value = saved.url || "";
  ed.payload.value = saved.payload || "";
  ed.encode.value = saved.encode || "";
  ed.submit.textContent = saved.editing ? t("ed.saveEdit") : t("ed.add");
  ed.reset.hidden = !(saved.builtin && ORIGINAL_BY_ID.has(saved.id) && saved.editing);
  fillFolderSelect();
  ed.folder.value = saved.folder || "";
  layoutEditor(Boolean(saved.editing));
  if (saved.editing) redetect.open = Boolean(saved.detUrl);
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
  showStep2(draft.editing ? t("ed.picked.edit") : t("ed.picked.add"));
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
  if (r.error && !r.notFound) { ed.detectMsg.textContent = r.error; return; }
  ed.detectMsg.textContent = "";
  if (!draft.builtin && !ed.name.value.trim()) ed.name.value = nameFromUrl(pageUrl);

  if (r.notFound) {
    // Mots-clés absents de l'adresse : on remplira le champ de recherche du site.
    ed.url.value = pageUrl;
    // Re-détection d'une agence qui remplit déjà ce site : son repérage reste valable.
    if (!(draft.editing && draft.fill && hostOf(pageUrl, {}) === draft.pageHost)) draft.fill = null;
    setMode("fill");
    showDetectResult(t("ed.notInUrl"));
    flashEl(ed.name, ed.url, draft.editing ? ed.detectMsg : ed.step2Msg);
  } else {
    ed.url.value = r.url;
    ed.payload.value = r.payload || "";
    ed.encode.value = (r.encode || []).join(", ");
    draft.fill = null;
    setMode("url");
    showDetectResult([r.summary, draft.editing ? t("ed.check.edit") : t("ed.check.add")].join("\n"), r.warnings);
    flashEl(ed.name, ed.url, draft.editing ? ed.detectMsg : ed.step2Msg);
  }
  await saveDraft();
});

ed.manualLink.addEventListener("click", async () => {
  if (!draft) draft = { id: newId(), editing: false, builtin: false, mode: "url", fill: null };
  setMode("url");
  showStep2(t("ed.manual.msg"));
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
    touched.add(Object.keys(fieldInput).find((k) => fieldInput[k] === el));
    if (el === ed.url && draft.mode === "fill" && draft.fill) {
      const before = draft.pageHost;
      const now = hostOf(ed.url.value, cachedOptions);
      if (before && now !== before) { draft.fill = null; renderChecks(); }
    }
    validate();
    saveDraft();
  });
}

const pickMsg = $id("pickMsg"); // messages du repérage, sous son bouton

/* Repérage sur le site : autorisation Chrome, puis le script d'arrière-plan
   ouvre le site ; le résultat revient dans le brouillon (pickResult). */
ed.pickBtn.addEventListener("click", () => {
  const builtin = draft.builtin ? ORIGINAL_BY_ID.get(draft.id) : null;
  const { spec, error } = checkSpec({ url: ed.url.value }, { allowOptions: Boolean(builtin) });
  if (error) return flash(error, pickMsg);
  const pageUrl = builtin ? applyOptions(spec.url, cachedOptions) : spec.url;
  const host = hostOf(pageUrl, {});
  draft.pageHost = host;
  const pick = { id: draft.id, name: ed.name.value.trim() || (builtin ? builtin.name : nameFromUrl(pageUrl)) || host, url: pageUrl };
  saveDraft();
  chrome.storage.session.set({ fillDraft: pick }); // relu si la popup se ferme pendant la demande
  // La demande d'autorisation doit partir directement du clic.
  chrome.permissions.request({ origins: [originPattern(host)] }).then(async (granted) => {
    if (!granted) {
      chrome.storage.session.remove("fillDraft");
      return flash(t("ed.permRefused", { host }), pickMsg);
    }
    const res = await chrome.runtime.sendMessage({ type: "pick", draft: pick }).catch(() => null);
    if (!res || !res.ok) return flash((res && res.error) || t("ed.pickFailed"), pickMsg);
    pickMsg.textContent = t("ed.siteOpening");
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
  const q = ed.detQ.value.trim() || input.value.trim() || t("ed.sampleQuery");
  const url = await buildUrl(spec, q, await loadOptions());
  const fill = draft.mode === "fill" ? draft.fill : null;
  const res = await chrome.runtime.sendMessage({ type: "try", url, q, fill, builtinId: builtin ? builtin.id : null }).catch(() => null);
  flash(res && res.ok ? t("ed.tryStarted", { q }) : (res && res.error) || t("ed.tryFailed"), addMsg);
});

// Annuler : pendant un ajout, revient à l'étape « détecter » ; sinon, à la liste.
ed.cancel.addEventListener("click", () => {
  if (draft && !draft.editing) { resetEditor(); ed.detUrl.focus(); }
  else leaveEditor();
});

ed.reset.addEventListener("click", async () => {
  const id = draft.id;
  const { [OVERRIDES_KEY]: overrides = {} } = await chrome.storage.local.get(OVERRIDES_KEY);
  delete overrides[id];
  await chrome.storage.local.set({ [OVERRIDES_KEY]: overrides });
  await leaveEditor(id);
  await releaseUnusedOrigins(); // ex. agence fournie qui avait changé de site
});

/* Étape 3 : ajouter (ou enregistrer la modification) */
addForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  ["name", "url", "payload", "encode"].forEach((k) => touched.add(k));
  const error = validate();
  if (error) return flash(error, addMsg);
  const id = draft.id;
  const name = ed.name.value.trim();
  const raw = { url: ed.url.value, payload: draft.mode === "url" ? ed.payload.value : "", encode: draft.mode === "url" ? ed.encode.value : "" };

  if (draft.builtin) {
    // Agence fournie, modifiée comme une agence ajoutée : on n'enregistre que
    // l'écart avec l'original (fill : repères, ou false = « adresse de recherche »).
    const original = ORIGINAL_BY_ID.get(id);
    const { spec } = checkSpec(raw, { allowOptions: true });
    const { [OVERRIDES_KEY]: overrides = {} } = await chrome.storage.local.get(OVERRIDES_KEY);
    let fillOverride; // undefined : comme l'original
    if (draft.mode === "url") {
      if (original.fill) fillOverride = false;
    } else {
      const picked = draft.fill ? cleanFill(draft.fill) : null;
      if (picked) delete picked.delay;
      const unchanged = original.fill && picked && picked.input === original.fill.input
        && (picked.submit || "") === (original.fill.submit || "")
        && hostOf(spec.url, cachedOptions) === hostOf(original.url, cachedOptions);
      if (!unchanged) fillOverride = picked;
    }
    const renamed = name !== original.name;
    const same = spec.url === original.url && (spec.payload || "") === (original.payload || "")
      && (spec.encode || []).join() === (original.encode || []).join() && fillOverride === undefined && !renamed;
    if (same) delete overrides[id];
    else overrides[id] = { ...spec, ...(fillOverride !== undefined ? { fill: fillOverride } : {}), ...(renamed ? { name } : {}) };
    await chrome.storage.local.set({ [OVERRIDES_KEY]: overrides });

  } else {
    const agency = cleanCustomAgency({ id, name, ...raw, fill: draft.mode === "fill" ? draft.fill : undefined });
    if (!agency) return flash(t("ed.err.invalid"), addMsg);
    const data = await chrome.storage.local.get({ [CUSTOM_KEY]: [], [STORAGE_KEY]: DEFAULT_CHECKED });
    const before = data[CUSTOM_KEY].find((c) => c && c.id === id);
    if (before) {
      const after = data[CUSTOM_KEY].map((c) => (c && c.id === id ? agency : c));
      await chrome.storage.local.set({ [CUSTOM_KEY]: after });

    } else {
      if (data[CUSTOM_KEY].length >= MAX_CUSTOM) return flash(t("ed.err.max", { max: MAX_CUSTOM }), addMsg);
      await chrome.storage.local.set({
        [CUSTOM_KEY]: data[CUSTOM_KEY].concat(agency),
        [STORAGE_KEY]: data[STORAGE_KEY].concat(id) // cochée d'office
      });

    }
  }
  // Dossier choisi dans le formulaire.
  const { folderOf } = await loadFolders();
  if (ed.folder.value) folderOf[id] = ed.folder.value; else delete folderOf[id];
  await chrome.storage.local.set({ [FOLDER_OF_KEY]: folderOf });
  await leaveEditor(id); // efface aussi le brouillon de repérage
  await releaseUnusedOrigins(); // ex. passée d'un champ à remplir à une adresse de recherche
});

settingsForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const values = {};
  for (const o of OPTIONS) {
    const v = document.getElementById("opt-" + o.id).value.trim();
    if (v !== "" && !new RegExp(o.pattern).test(v)) {
      flash(t("opt.invalid", { label: t(`opt.${o.id}.label`) }));
      return;
    }
    values[o.id] = v;
  }
  await chrome.storage.local.set({ [OPTIONS_KEY]: values });
  cachedOptions = values;
  flash(t("opt.saved"));
});

// Après reconstruction d'une liste : remet le focus sur le même élément.
const focusKey = () => document.activeElement && document.activeElement.dataset ? document.activeElement.dataset.key : undefined;
function restoreFocus(container, key) {
  if (!key) return;
  const el = container.querySelector(`[data-key="${CSS.escape(key)}"]`);
  if (!el) return;
  const palette = el.closest(".palette");
  if (palette) { palette.hidden = false; palette.parentElement.querySelector(".swatch")?.setAttribute("aria-expanded", "true"); }
  el.focus();
}

/* ---------- Dossiers : opérations communes (liste et options) ---------- */

let currentFolders = []; // dossiers affichés (tenu à jour par refreshList)

// Couleur d'un dossier : la sienne, sinon une couleur stable d'après sa place.
const folderColor = (f, i) => (FOLDER_COLORS.includes(f.color) ? f.color : FOLDER_COLORS[i % FOLDER_COLORS.length]);

async function updateFolder(id, patch) {
  const { folders } = await loadFolders();
  await chrome.storage.local.set({ [FOLDERS_KEY]: folders.map((f) => {
    if (f.id !== id) return f;
    const next = { ...f, ...patch };
    if (!next.collapsed) delete next.collapsed;
    return next;
  }) });
}

/* Ce qui vient d'être ajouté ou modifié est surligné. La liste peut être
   reconstruite plusieurs fois de suite (un changement par réglage) : la
   surbrillance reprend alors là où elle en était (délai négatif), au lieu
   de repartir à zéro à chaque fois, ce qui faisait un effet stroboscope. */
const FRESH_MS = 2400; // durée de l'animation .fresh (popup.css)
let fresh = null; // { selector, start, scrolled }
function highlightFresh(selector) { fresh = { selector, start: performance.now(), scrolled: false }; }
function applyFresh() {
  if (!fresh) return;
  const elapsed = performance.now() - fresh.start;
  if (elapsed >= FRESH_MS) { fresh = null; return; }
  const el = list.querySelector(fresh.selector);
  if (!el) return;
  el.style.animationDelay = `${-Math.round(elapsed)}ms`;
  el.classList.add("fresh");
  if (!fresh.scrolled) { el.scrollIntoView({ block: "nearest" }); fresh.scrolled = true; }
}

// Crée un dossier ; renvoie son nom, ou null (message affiché dans msgEl).
async function createFolder(rawName, msgEl) {
  const name = String(rawName || "").trim();
  if (!name || name.length > 60) { flash(t("folders.err.name"), msgEl); return null; }
  const { folders } = await loadFolders();
  if (folders.length >= MAX_FOLDERS) { flash(t("folders.err.max", { max: MAX_FOLDERS }), msgEl); return null; }
  const used = new Set(folders.map(folderColor));
  const color = FOLDER_COLORS.find((c) => !used.has(c)) || FOLDER_COLORS[folders.length % FOLDER_COLORS.length];
  const id = newFolderId();
  highlightFresh(`li.group[data-folder="${id}"] > .group-head`);
  await chrome.storage.local.set({ [FOLDERS_KEY]: folders.concat({ id, name, color }) });
  return name;
}

async function deleteFolder(f) {
  if (!confirm(t("folders.deleteConfirm", { name: f.name }))) return false;
  const cur = await loadFolders();
  for (const [agencyId, folderId] of Object.entries(cur.folderOf)) if (folderId === f.id) delete cur.folderOf[agencyId];
  await chrome.storage.local.set({ [FOLDERS_KEY]: cur.folders.filter((x) => x.id !== f.id), [FOLDER_OF_KEY]: cur.folderOf });
  return true;
}

// Commandes d'un dossier : nom modifiable sur place, pastille de couleur
// (ouvre la palette), suppression. Renvoie les éléments à placer.
function folderControls(f, color, msgEl) {
  const nameInput = document.createElement("input");
  nameInput.className = "fname-input";
  nameInput.dir = "auto";
  nameInput.dataset.key = "n:" + f.id;
  nameInput.value = f.name;
  nameInput.maxLength = 60;
  nameInput.autocomplete = "off";
  nameInput.setAttribute("aria-label", t("folders.rename", { name: f.name }));
  nameInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") { e.preventDefault(); nameInput.blur(); }
    if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); nameInput.value = f.name; nameInput.blur(); }
  });
  nameInput.addEventListener("change", async () => {
    const n = nameInput.value.trim();
    if (n === f.name) return;
    if (!n || n.length > 60) {
      // Erreur affichée sur le champ lui-même (bulle sous le nom du dossier).
      nameInput.value = f.name;
      nameInput.setCustomValidity(t("folders.err.name"));
      nameInput.reportValidity();
      nameInput.addEventListener("input", () => nameInput.setCustomValidity(""), { once: true });
      return;
    }
    await updateFolder(f.id, { name: n });
  });

  const palette = document.createElement("div");
  palette.className = "palette";
  palette.hidden = true;
  palette.setAttribute("role", "group");
  palette.setAttribute("aria-label", t("folder.color", { name: f.name }));
  for (const c of FOLDER_COLORS) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "chip";
    b.dataset.key = "c:" + f.id + ":" + c;
    b.style.setProperty("--fc", `var(--c-${c})`);
    b.title = t("color." + c);
    b.setAttribute("aria-label", b.title);
    b.setAttribute("aria-pressed", String(c === color));
    b.addEventListener("click", () => updateFolder(f.id, { color: c }));
    palette.append(b);
  }

  const swatch = document.createElement("button");
  swatch.type = "button";
  swatch.className = "swatch";
  swatch.dataset.key = "s:" + f.id;
  swatch.title = t("folder.color", { name: f.name });
  swatch.setAttribute("aria-label", swatch.title);
  swatch.setAttribute("aria-expanded", "false");
  swatch.addEventListener("click", () => {
    palette.hidden = !palette.hidden;
    swatch.setAttribute("aria-expanded", String(!palette.hidden));
    if (!palette.hidden) palette.querySelector('[aria-pressed="true"]')?.focus();
  });

  const del = document.createElement("button");
  del.type = "button";
  del.className = "icon-btn bare fdel";
  del.title = t("folders.delete", { name: f.name });
  del.setAttribute("aria-label", del.title);
  del.append(icon("trash"));
  del.addEventListener("click", async () => {
    await deleteFolder(f);
  });
  return { nameInput, swatch, del, palette };
}

// Menu « Dossier » de l'éditeur d'agence (les dossiers viennent de la liste).
function fillFolderSelect() {
  const keep = ed.folder.value;
  ed.folder.textContent = "";
  const none = document.createElement("option");
  none.value = "";
  none.textContent = t("ed.folder.none");
  ed.folder.append(none);
  for (const f of currentFolders) {
    const o = document.createElement("option");
    o.value = f.id;
    o.textContent = f.name;
    ed.folder.append(o);
  }
  ed.folder.value = currentFolders.some((f) => f.id === keep) ? keep : "";
}

ed.folder.addEventListener("change", () => saveDraft());

/* ---------- Sauvegarde, partage et configuration d'usine ---------- */

const backupMsg = document.getElementById("backupMsg");
const importFile = document.getElementById("importFile");
const authorizeBtn = document.getElementById("authorizeBtn");
let missingOrigins = [];

document.getElementById("restoreRemoved").addEventListener("click", async () => {
  const n = (await loadAgencies()).removed.size;
  await chrome.storage.local.set({ [REMOVED_KEY]: [] });
  await renderRemoved();
  const done = document.getElementById("restoreMsg");
  done.textContent = t(n === 1 ? "opt.removed.restored.one" : "opt.removed.restored.many", { n });
  flashEl(done); // reste affiché jusqu'à la sortie des options

});

// Export : un fichier JSON téléchargé (aucun envoi nulle part).
document.getElementById("exportBtn").addEventListener("click", async () => {
  const config = await buildConfigExport();
  const name = `tabulapix-config-${new Date().toISOString().slice(0, 10)}.json`;
  const url = URL.createObjectURL(new Blob([JSON.stringify(config, null, 2) + "\n"], { type: "application/json" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
  flash(t("backup.exported", { file: name }), backupMsg);
});

// Import : dans la popup, Chrome la ferme à l'ouverture du sélecteur de
// fichier ; on ouvre donc TabulaPix dans un onglet pour choisir le fichier.
document.getElementById("importBtn").addEventListener("click", () => {
  if (isPopup) {
    chrome.tabs.create({ url: chrome.runtime.getURL("popup.html#import") });
    window.close();
    return;
  }
  importFile.value = "";
  importFile.click();
});

importFile.addEventListener("change", async () => {
  const file = importFile.files && importFile.files[0];
  if (!file) return;
  backupMsg.className = "status err";
  if (file.size > CONFIG_MAX_BYTES) { backupMsg.textContent = t("backup.err.size"); return; }
  let parsed;
  try { parsed = JSON.parse(await file.text()); } catch (_) { backupMsg.textContent = t("backup.err.json"); return; }
  const result = parseConfigImport(parsed);
  if (result.error) { backupMsg.textContent = t(result.error); return; }
  const s = result.summary;
  const summary = [t("backup.summary", s), s.skipped ? t("backup.skipped", { n: s.skipped }) : "",
    s.unknown ? t("backup.unknown", { n: s.unknown }) : "", s.newer ? t("backup.newer") : ""].filter(Boolean).join(" ");
  if (!confirm(t("backup.confirm", { summary }))) { backupMsg.textContent = ""; return; }
  // On tente de demander tout de suite les sites nécessaires : Chrome ne
  // l'accepte que peu après un clic (choix du fichier rapide). Sinon, la
  // liste et les options proposent « Autoriser » tant qu'il en manque.
  const asked = result.hosts.length
    ? chrome.permissions.request({ origins: result.hosts.map(originPattern) }).catch(() => false)
    : Promise.resolve(true);

  // Remplace la configuration (la dernière recherche est gardée).
  const { [QUERY_KEY]: lastQuery } = await chrome.storage.local.get(QUERY_KEY);
  await chrome.storage.local.clear();
  await chrome.storage.local.set({ ...result.storage, ...(lastQuery ? { [QUERY_KEY]: lastQuery } : {}) });
  await chrome.storage.session.remove([AGENCY_DRAFT_KEY, PICK_RESULT_KEY, "fillDraft", "pickSession"]);
  await applyNewAgencyDefaults();

  // Autorisations : on retire celles qui ne servent plus, on liste celles à accorder.
  const needed = result.hosts.map(originPattern);
  await releaseUnusedOrigins();
  await reloadSettingsView();
  const report = async () => {
    missingOrigins = [];
    for (const origin of needed) if (!(await chrome.permissions.contains({ origins: [origin] }))) missingOrigins.push(origin);
    backupMsg.className = "status ok";
    backupMsg.textContent = t("backup.imported") + " " + summary + (missingOrigins.length ? "\n" + t("backup.needPerm") : "");
    authorizeBtn.hidden = !missingOrigins.length;
    authorizeBtn.textContent = t("backup.authorize", { n: missingOrigins.length });
  };
  await report();
  asked.then(report); // une fois la demande de Chrome acceptée ou refusée
});

// Les autorisations doivent être demandées directement depuis un clic.
authorizeBtn.addEventListener("click", () => {
  chrome.permissions.request({ origins: missingOrigins }).then((granted) => {
    backupMsg.className = "status " + (granted ? "ok" : "err");
    backupMsg.textContent = granted ? t("backup.authorized") : t("backup.authRefused");
    if (granted) authorizeBtn.hidden = true;
  });
});

// Configuration d'usine : tout est effacé, y compris les autorisations de sites.
document.getElementById("factoryBtn").addEventListener("click", async () => {
  if (!confirm(t("factory.confirm"))) return;
  for (const origin of await optionalOriginsGranted()) {
    try { await chrome.permissions.remove({ origins: [origin] }); } catch (_) { /* déjà retirée */ }
  }
  await chrome.storage.local.clear();
  await chrome.storage.session.clear();
  location.hash = "";
  location.reload();
});

// Après un import : langue, réglages et listes refaits.
async function reloadSettingsView() {
  langSelect.value = await loadLang();
  applyI18n();
  cachedOptions = await loadOptions();
  renderOptionFields(cachedOptions);
  resetEditor();
  await renderRemoved();
}

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
      default: throw new Error(t("spec.step", { step }));
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

/* ---------- Icônes (SVG dessinés, même trait partout) ---------- */
const ICONS = {
  chevron: '<path d="M4 6l4 4 4-4"/>',
  grip: '<g fill="currentColor" stroke="none"><circle cx="6" cy="3.5" r="1.1"/><circle cx="10" cy="3.5" r="1.1"/><circle cx="6" cy="8" r="1.1"/><circle cx="10" cy="8" r="1.1"/><circle cx="6" cy="12.5" r="1.1"/><circle cx="10" cy="12.5" r="1.1"/></g>',
  trash: '<path d="M3 4.5h10M6.5 4.5V3h3v1.5M4.5 4.5l.7 8.5h5.6l.7-8.5"/>',
  plus: '<path d="M8 3.5v9M3.5 8h9"/>',
  check: '<path d="M3.5 8.5l3 3 6-7"/>',
  warn: '<path d="M8 2.5l6 11H2z"/><path d="M8 6.5v3.2M8 11.6v.1"/>',
  dot: '<circle cx="8" cy="8" r="4.5"/>',
  pencil: '<path d="M10.5 2.8l2.7 2.7L6 12.7l-3.3.6.6-3.3z"/><path d="M9 4.3l2.7 2.7"/>',
  eye: '<path d="M1.5 8s2.4-4.5 6.5-4.5S14.5 8 14.5 8 12.1 12.5 8 12.5 1.5 8 1.5 8z"/><circle cx="8" cy="8" r="2"/>',
  eyeOff: '<path d="M1.5 8s2.4-4.5 6.5-4.5S14.5 8 14.5 8 12.1 12.5 8 12.5 1.5 8 1.5 8z"/><path d="M2.5 13.5l11-11"/>',
};
function icon(name) {
  const tpl = document.createElement("template");
  tpl.innerHTML = `<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">${ICONS[name]}</svg>`;
  return tpl.content.firstChild;
}

/* ---------- Mode « Organiser » : ordre, dossiers, couleurs ---------- */
let organizing = false;
const organizeBtn = document.getElementById("organize");
function setOrganizing(on) {
  organizing = on;
  document.documentElement.classList.toggle("organizing", on);
  organizeBtn.setAttribute("aria-pressed", String(on));
  // Pas de recherche pendant l'organisation : on ne reste pas dans ce mode par mégarde.
  const go = document.getElementById("go");
  // …ni de sélection globale : « Tout » / « Aucune » attendent aussi la fin.
  const all = document.getElementById("all"), none = document.getElementById("none");
  input.disabled = go.disabled = all.disabled = none.disabled = on;
  go.title = input.title = all.title = none.title = on ? t("main.organize.blocked") : "";
  return refreshList().then(() => { if (!on) input.focus(); });
}
organizeBtn.addEventListener("click", () => setOrganizing(!organizing));
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && organizing && !dragged && !mainForm.hidden) { e.preventDefault(); setOrganizing(false); }
});

// Une ligne d'agence : case et nom ; en mode Organiser, une poignée à droite.
function agencyItem(a, checked, isHidden = false) {
  const li = document.createElement("li");
  li.className = "agency";
  li.dataset.id = a.id;
  const label = document.createElement("label");
  const box = document.createElement("input");
  box.type = "checkbox";
  box.className = "agency-box";
  box.value = a.id;
  box.dataset.key = "a:" + a.id;
  box.checked = !isHidden && checked.includes(a.id);
  box.disabled = isHidden;
  if (isHidden) li.classList.add("is-hidden");
  box.addEventListener("change", save);
  box.addEventListener("keydown", (e) => {
    if (!e.altKey || (e.key !== "ArrowUp" && e.key !== "ArrowDown")) return;
    e.preventDefault();
    moveAgency(li, e.key === "ArrowUp");
  });
  const name = document.createElement("span");
  name.className = "name";
  name.dir = "auto"; // noms en arabe, hébreu… dans le bon sens
  name.textContent = a.name;
  label.append(box, name);
  if (isManual(a)) {
    const hint = document.createElement("span");
    hint.className = "hint";
    hint.textContent = t("main.paste");
    hint.title = t("main.paste.title");
    label.append(hint);
  }
  li.append(label);
  if (organizing) {
    const eye = toolButton(isHidden ? "eyeOff" : "eye", t(isHidden ? "ag.show" : "ag.hide", { name: a.name }), () => setHidden(a.id, !isHidden));
    eye.setAttribute("aria-pressed", String(isHidden));
    eye.dataset.key = "h:" + a.id;
    const edit = toolButton("pencil", t("opt.edit", { name: a.name }), () => showEditor(a));
    const del = toolButton("trash", t("opt.delete", { name: a.name }), () => deleteAgency(a));
    del.classList.add("fdel");
    li.append(eye, edit, del, grip(t("main.handle")));
    li.draggable = true; // on la glisse aussi par son nom
    label.title = t("main.handle");
  }
  return li;
}

function toolButton(name, title, onClick) {
  const b = document.createElement("button");
  b.type = "button";
  b.className = "icon-btn bare tool";
  b.title = title;
  b.setAttribute("aria-label", title);
  b.append(icon(name));
  b.addEventListener("click", onClick);
  return b;
}

/* ---------- Autorisations des sites dont on remplit le champ ---------- */

// Sites (motif d'origine → agences) que Chrome n'autorise pas encore :
// import d'une configuration, autorisation refusée ou retirée dans Chrome…
async function missingFillOrigins(agencies) {
  const options = await loadOptions();
  const out = new Map();
  for (const a of agencies) {
    if (!a.fill) continue;
    const host = hostOf(a.url, options);
    if (!host) continue;
    const origin = originPattern(host);
    if (!out.has(origin)) out.set(origin, []);
    out.get(origin).push(a);
  }
  for (const origin of [...out.keys()]) {
    if (await chrome.permissions.contains({ origins: [origin] })) out.delete(origin);
  }
  return out;
}

// La demande doit partir directement du clic (aucune attente avant).
function askPermission(origins) {
  // Accordée : le bandeau et la pastille disparaissent ; refusée : ils restent.
  chrome.permissions.request({ origins }).then(() => refreshList()).catch(() => {});
}

let pendingOrigins = [];
const permBanner = document.getElementById("permBanner");
function renderPermBanner(missing) {
  pendingOrigins = [...missing.keys()];
  const names = [...missing.values()].flat().map((a) => a.name);
  permBanner.hidden = !names.length;
  document.getElementById("permText").dir = "auto";
  document.getElementById("permText").textContent = names.length === 1
    ? t("perm.banner.one", { names: names[0] })
    : t("perm.banner.many", { n: names.length, names: names.join(", ") });
}
document.getElementById("permBtn").addEventListener("click", () => askPermission(pendingOrigins));

function permPill(origin) {
  const b = document.createElement("button");
  b.type = "button";
  b.className = "perm-pill";
  b.textContent = t("perm.row");
  b.title = t("perm.row.title", { host: origin.replace(/^https:\/\/|\/\*$/g, "") });
  b.addEventListener("click", () => askPermission([origin]));
  return b;
}
// Autorisation accordée ou retirée ailleurs (réglages de Chrome) : on met à jour.
chrome.permissions.onAdded.addListener(() => { if (!mainForm.hidden) refreshList(); });
chrome.permissions.onRemoved.addListener(() => { if (!mainForm.hidden) refreshList(); });

// Mode Organiser : ajout d'une agence (ouvre l'éditeur).
function addAgencyRow() {
  const li = document.createElement("li");
  li.className = "add-agency";
  const b = document.createElement("button");
  b.type = "button";
  b.className = "add-btn";
  b.append(icon("plus"), document.createTextNode(t("ed.addTitle")));
  b.addEventListener("click", async () => { await chrome.storage.session.remove(AGENCY_DRAFT_KEY); showEditor(); });
  li.append(b);
  return li;
}

function grip(title) {
  const g = document.createElement("span");
  g.className = "grip";
  g.draggable = true;
  g.title = title;
  g.setAttribute("aria-hidden", "true");
  g.append(icon("grip"));
  return g;
}

// Alt + ↑ / ↓ : monte ou descend l'agence ; au bord d'un dossier, elle passe
// dans le dossier voisin (ou parmi les agences sans dossier).
function moveAgency(li, up) {
  const sib = up ? li.previousElementSibling : li.nextElementSibling;
  if (sib) up ? sib.before(li) : sib.after(li);
  else {
    const groups = [...list.querySelectorAll("li.group")];
    const target = groups[groups.indexOf(li.closest("li.group")) + (up ? -1 : 1)];
    if (!target) return;
    if (target.classList.contains("collapsed")) setCollapsed(target, false);
    const items = target.querySelector(".items");
    up ? items.append(li) : items.prepend(li);
  }
  li.querySelector("input").focus();
  saveOrder();
  saveFolderMembership();
  updateFolderStates();
}

// Titre d'un dossier : flèche (replier), case à trois états, nom, compteur ;
// en mode Organiser : nom modifiable, couleur, suppression, poignée.
function folderHead(f, color, group) {
  const head = document.createElement("div");
  head.className = "group-head";
  const toggle = document.createElement("button");
  toggle.type = "button";
  toggle.className = "toggle";
  toggle.dataset.key = "t:" + f.id;
  toggle.title = t("folder.toggle", { name: f.name });
  toggle.setAttribute("aria-label", toggle.title);
  toggle.setAttribute("aria-expanded", String(!f.collapsed));
  toggle.append(icon("chevron"));
  toggle.addEventListener("click", () => setCollapsed(group, !group.classList.contains("collapsed"), true));
  const label = document.createElement("label");
  const box = document.createElement("input");
  box.type = "checkbox";
  box.className = "folder-box";
  box.dataset.key = "f:" + f.id;
  // Cocher le dossier coche (ou décoche) toutes ses agences.
  box.addEventListener("change", () => {
    group.querySelectorAll("input.agency-box:not(:disabled)").forEach((b) => (b.checked = box.checked));
    save();
  });
  box.addEventListener("keydown", (e) => { // Alt + ↑ / ↓ : déplace le dossier
    if (!e.altKey || (e.key !== "ArrowUp" && e.key !== "ArrowDown")) return;
    e.preventDefault();
    const other = e.key === "ArrowUp" ? group.previousElementSibling : group.nextElementSibling;
    if (!other || !other.classList.contains("group") || other.classList.contains("root")) return;
    e.key === "ArrowUp" ? other.before(group) : other.after(group);
    box.focus();
    saveFolderOrder();
  });
  const count = document.createElement("span");
  count.className = "count";
  label.append(box);
  if (organizing) {
    box.setAttribute("aria-label", f.name);
    const c = folderControls(f, color, msg);
    head.append(toggle, label, c.nameInput, c.swatch, c.del, grip(t("folder.handle")));
    group.append(head, c.palette);
  } else {
    const name = document.createElement("span");
    name.className = "folder-name";
    name.dir = "auto";
    name.textContent = f.name;
    label.append(name, count);
    head.append(toggle, label);
    group.append(head);
  }
  return head;
}

// Liste : un bloc coloré par dossier, puis les agences sans dossier.
function render(agencies, checked, folders, folderOf, hidden = new Set(), missing = new Map()) {
  list.classList.toggle("has-folders", folders.length > 0);
  const groups = folders.map((f) => ({ folder: f, items: [] }));
  const byFolder = new Map(groups.map((g) => [g.folder.id, g]));
  const root = { folder: null, items: [] };
  for (const a of agencies) (byFolder.get(folderOf[a.id]) || root).items.push(a);

  [...groups, root].forEach((g, i) => {
    const group = document.createElement("li");
    group.className = "group" + (g.folder ? "" : " root") + (g.folder && g.folder.collapsed ? " collapsed" : "");
    group.dataset.folder = g.folder ? g.folder.id : "";
    if (g.folder) {
      const color = folderColor(g.folder, i);
      group.style.setProperty("--fc", `var(--c-${color})`);
      folderHead(g.folder, color, group);
    } else if (folders.length) {
      const label = document.createElement("div");
      label.className = "group-label";
      label.textContent = t("folder.root");
      group.append(label);
    }
    const ul = document.createElement("ul");
    ul.className = "items";
    for (const a of g.items) {
      const li = agencyItem(a, checked, hidden.has(a.id));
      const origin = [...missing].find(([, names]) => names.includes(a))?.[0];
      if (origin && !organizing) li.append(permPill(origin));
      ul.append(li);
    }
    const empty = document.createElement("p");
    empty.className = "empty";
    empty.textContent = t(!g.folder ? "folder.root.empty" : organizing ? "folder.empty.organize" : "folder.empty");
    group.append(ul, empty);
    list.append(group);
  });
  if (!agencies.length && !folders.length) {
    // Rien à afficher : toutes les agences sont masquées ou supprimées.
    const li = document.createElement("li");
    li.className = "empty-list";
    li.textContent = t(organizing ? "main.empty.organize" : "main.empty");
    list.append(li);
  }
  if (organizing) list.append(newFolderRow(), addAgencyRow());
  updateFolderStates();
}

// Mode Organiser : création d'un dossier en bas de la liste.
function newFolderRow() {
  const li = document.createElement("li");
  li.className = "new-folder";
  const field = document.createElement("input");
  field.maxLength = 60;
  field.autocomplete = "off";
  field.placeholder = t("folders.new");
  field.dataset.key = "new-folder";
  field.setAttribute("aria-label", t("folders.new"));
  const add = document.createElement("button");
  add.type = "button";
  add.className = "icon-btn";
  add.title = t("folders.create");
  add.setAttribute("aria-label", add.title);
  add.append(icon("plus"));
  // Erreur juste sous le champ (là où l'on regarde), pas en haut de la liste.
  const err = document.createElement("p");
  err.className = "status err field-err";
  err.id = "newFolderErr";
  err.setAttribute("role", "alert");
  field.setAttribute("aria-describedby", err.id);
  field.addEventListener("input", () => { err.textContent = ""; field.removeAttribute("aria-invalid"); });
  let busy = false; // double Entrée : un seul dossier
  const create = async () => {
    if (busy) return;
    busy = true;
    try {
      // la liste se reconstruit, le dossier y est surligné
      if (!(await createFolder(field.value, err))) { field.setAttribute("aria-invalid", "true"); field.focus(); }
    } finally { busy = false; }
  };
  field.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); create(); } });
  add.addEventListener("click", create);
  li.append(field, add, err);
  return li;
}

// Case de chaque dossier : cochée, décochée ou à moitié cochée (déduite de
// ses agences, jamais enregistrée), et compteur « cochées / total ».
function updateFolderStates() {
  for (const group of list.querySelectorAll("li.group:not(.root)")) {
    const all = [...group.querySelectorAll("input.agency-box:not(:disabled)")];
    const on = all.filter((b) => b.checked).length;
    const box = group.querySelector("input.folder-box");
    box.checked = all.length > 0 && on === all.length;
    box.indeterminate = on > 0 && on < all.length;
    box.disabled = !all.length;
    const count = group.querySelector(".count");
    if (count) {
      count.textContent = `${on}/${all.length}`;
      count.classList.toggle("some", on > 0);
    }
  }
  const n = checkedIds().length;
  goCount.textContent = n ? (n === 1 ? t("main.tabs.one") : t("main.tabs.many", { n })) : "";
}
const goCount = document.getElementById("goCount");

async function setCollapsed(group, collapsed, persist = true) {
  group.classList.toggle("collapsed", collapsed);
  group.querySelector(".toggle").setAttribute("aria-expanded", String(!collapsed));
  if (persist) await updateFolder(group.dataset.folder, { collapsed });
}

/* Glisser-déposer (mode Organiser), par la poignée : une agence se place
   entre deux agences, ou se range dans un dossier lâchée sur son titre ;
   un dossier se déplace par la poignée de son titre. Échap annule. */
let dragged = null, origin = null, dropHead = null;
const clearDropHead = () => { if (dropHead) dropHead.classList.remove("drop-target"); dropHead = null; };
list.addEventListener("dragstart", (e) => {
  const g = e.target.closest && (e.target.closest(".grip") || (organizing && e.target.closest("li.agency")));
  if (!g) return;
  const head = g.closest(".group-head");
  dragged = head ? head.parentElement : g.closest("li.agency");
  origin = { parent: dragged.parentElement, next: dragged.nextElementSibling };
  e.dataTransfer.effectAllowed = "move";
  e.dataTransfer.setData("text/plain", dragged.dataset.id || dragged.dataset.folder);
  e.dataTransfer.setDragImage(head || dragged, 12, 12);
  requestAnimationFrame(() => dragged && dragged.classList.add("dragging"));
});
list.addEventListener("dragover", (e) => {
  if (!dragged) return;
  e.preventDefault();
  e.dataTransfer.dropEffect = "move";
  const half = (el) => { const r = el.getBoundingClientRect(); return e.clientY < r.top + r.height / 2; };
  if (dragged.classList.contains("group")) {
    // Dossier : avant ou après un autre dossier (jamais après « sans dossier »).
    const over = e.target.closest("li.group");
    if (!over || over === dragged) return;
    if (over.classList.contains("root")) { over.before(dragged); return; }
    half(over.querySelector(".group-head")) ? over.before(dragged) : over.after(dragged);
    return;
  }
  const head = e.target.closest(".group-head");
  if (head !== dropHead) { clearDropHead(); if (head) { dropHead = head; head.classList.add("drop-target"); } }
  if (head) return; // rangé au lâcher seulement
  const over = e.target.closest("li.agency");
  if (over && over !== dragged) { half(over) ? over.before(dragged) : over.after(dragged); return; }
  const group = e.target.closest("li.group");
  if (group && !over) { // zone vide d'un groupe (dossier vide, « sans dossier »)
    const items = group.querySelector(".items");
    if (dragged.parentElement !== items) items.append(dragged);
  }
});
list.addEventListener("drop", (e) => {
  e.preventDefault();
  if (!dragged || !dropHead || dragged.classList.contains("group")) return;
  const group = dropHead.parentElement;
  group.querySelector(".items").append(dragged);
  if (group.classList.contains("collapsed")) flashEl(dropHead);
});
list.addEventListener("dragend", (e) => {
  if (!dragged) return;
  const el = dragged, wasFolder = el.classList.contains("group");
  clearDropHead();
  el.classList.remove("dragging");
  dragged = null;
  if (e.dataTransfer.dropEffect === "none") { // Échap ou lâché hors de la liste : rien ne change
    origin.next && origin.next.parentElement === origin.parent ? origin.next.before(el) : origin.parent.append(el);
    updateFolderStates();
    return;
  }
  if (wasFolder) saveFolderOrder();
  else { saveOrder(); saveFolderMembership(); }
  updateFolderStates();
});

// Cases et ordre sont lus dans la liste affichée.
const boxes = () => Array.from(list.querySelectorAll("input.agency-box"));
const checkedIds = () => boxes().filter((b) => b.checked).map((b) => b.value);

function save() {
  msg.textContent = "";
  updateFolderStates();
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

// Dossier de chaque agence affichée, d'après la liste (les agences masquées
// gardent le leur).
async function saveFolderMembership() {
  const { folderOf } = await loadFolders();
  for (const li of list.querySelectorAll("li.agency")) {
    const folder = li.closest("li.group").dataset.folder;
    if (folder) folderOf[li.dataset.id] = folder; else delete folderOf[li.dataset.id];
  }
  await chrome.storage.local.set({ [FOLDER_OF_KEY]: folderOf });
}

async function saveFolderOrder() {
  const { folders } = await loadFolders();
  const byId = new Map(folders.map((f) => [f.id, f]));
  const order = [...list.querySelectorAll("li.group:not(.root)")].map((g) => byId.get(g.dataset.folder)).filter(Boolean);
  for (const f of folders) if (!order.includes(f)) order.push(f);
  await chrome.storage.local.set({ [FOLDERS_KEY]: order });
}

function setAll(state) {
  boxes().forEach((b) => { if (!b.disabled) b.checked = state; });
  save();
}

document.getElementById("all").addEventListener("click", () => setAll(true));
document.getElementById("none").addEventListener("click", () => setAll(false));

let sweeping = false; // évite un double lancement (double Entrée)
document.getElementById("form").addEventListener("submit", async (e) => {
  e.preventDefault();
  if (sweeping || organizing) return;
  const q = input.value.trim();
  const ids = checkedIds();
  if (!q) return input.focus();
  if (!ids.length) { msg.textContent = t("main.noAgency"); return; }

  const selected = ids.map((id) => AGENCY_BY_ID.get(id)); // dans l'ordre affiché
  let urls;
  try {
    const options = await loadOptions();
    urls = await Promise.all(selected.map((a) => buildUrl(a, q, options)));
  } catch (err) {
    msg.textContent = t("main.configError", { error: err.message });
    return;
  }

  if (selected.some(isManual)) {
    try { await navigator.clipboard.writeText(q); } catch (_) { /* sans gravité */ }
  }

  // L'ouverture des onglets est confiée au script d'arrière-plan : la popup
  // se ferme dès qu'un onglet passe au premier plan.
  chrome.storage.local.set({ [QUERY_KEY]: q });
  const jobs = selected.map((a, i) => ({ id: a.id, url: urls[i] }));
  sweeping = true;
  try { await chrome.runtime.sendMessage({ type: "sweep", jobs, q }); }
  catch (_) { msg.textContent = t("main.bgError"); return; } // ex. extension en cours de rechargement
  finally { setTimeout(() => { sweeping = false; }, 800); }
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
  const { folders, folderOf } = await loadFolders();
  currentFolders = folders;
  // Mode Organiser : les agences masquées apparaissent aussi (grisées), pour les réafficher.
  const shown = organizing ? ordered : ordered.filter((a) => !ag.hidden.has(a.id));
  const missing = await missingFillOrigins(shown.filter((a) => !ag.hidden.has(a.id)));
  // Plus aucune attente ici : vider puis reconstruire d'un seul tenant (sinon
  // deux mises à jour simultanées dupliqueraient les lignes).
  const key = focusKey();
  if (!sweeping) msg.textContent = "";
  list.textContent = "";
  render(shown, data[STORAGE_KEY], folders, folderOf, ag.hidden, missing);
  renderPermBanner(missing);
  restoreFocus(list, key);
  applyFresh();
  return data;
}

langReady.then(applyNewAgencyDefaults).then(refreshList).then((data) => {
  // Derniers mots-clés, sélectionnés : on tape pour les remplacer.
  if (data[QUERY_KEY] && !input.value) { input.value = data[QUERY_KEY]; input.select(); }
});

chrome.storage.onChanged.addListener((changes, area) => {
  // Agences modifiées ailleurs (autre fenêtre) : on met la liste à jour.
  if (area === "local" && (changes[CUSTOM_KEY] || changes[HIDDEN_KEY] || changes[REMOVED_KEY] || changes[OVERRIDES_KEY] || changes[FOLDERS_KEY] || changes[FOLDER_OF_KEY])) {
    if (!settingsView.hidden) renderRemoved(); else refreshList();
  }
  // Repérage terminé sur le site (colonne latérale restée ouverte) : on l'affiche.
  if (area === "session" && changes[PICK_RESULT_KEY] && changes[PICK_RESULT_KEY].newValue) {
    if (editorView.hidden) showEditor(); else applyPickResult(changes[PICK_RESULT_KEY].newValue);
  }
});

// Ouvert pour un import (depuis la popup) : directement à la section Sauvegarde.
if (location.hash === "#import") {
  langReady.then(showSettings).then(() => {
    document.getElementById("backupTitle").scrollIntoView({ block: "start" });
    backupMsg.className = "status ok";
    backupMsg.textContent = t("backup.chooseFile");
  });
}

// Réouverture après un repérage : on revient directement à l'étape « vérifier ».
chrome.storage.session.get([AGENCY_DRAFT_KEY, PICK_RESULT_KEY]).then((data) => {
  const d = data[AGENCY_DRAFT_KEY], r = data[PICK_RESULT_KEY];
  if (d && ((r && r.draftId === d.id) || d.review)) langReady.then(() => showEditor());
});
