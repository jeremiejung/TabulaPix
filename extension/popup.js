"use strict";

const STORAGE_KEY = "checkedAgencies";
const QUERY_KEY = "lastQuery";
const list = document.getElementById("list");
const input = document.getElementById("q");
const msg = document.getElementById("msg");

// En-tête fixe : sa hauteur sert de marge de défilement (focus, éléments mis
// en avant), et un filet le sépare de la liste dès qu'elle défile dessous.
const masthead = document.getElementById("masthead");
new ResizeObserver(() => document.documentElement.style.setProperty("--masthead-h", masthead.offsetHeight + "px")).observe(masthead);
const markStuck = () => masthead.classList.toggle("stuck", scrollY > 0);
addEventListener("scroll", markStuck, { passive: true });
markStuck();

// Une agence est « manuelle » si ni son URL ni « fill » ne transmettent les
// mots-clés : on ouvre la page et on copie les mots-clés dans le presse-papiers.
const isManual = (a) => !a.fill && !/\{(q|q:slug|payload)\}/.test(a.url);

/* ---------- Langue ---------- */

const langSelect = document.getElementById("langSelect");
applyI18n(); renderVersion(); // langue du navigateur tout de suite…
const langReady = loadLang().then((choice) => { // …puis celle choisie dans les réglages
  langSelect.value = choice;
  applyI18n(); renderVersion();
});

langSelect.addEventListener("change", async () => {
  await chrome.storage.local.set({ [LANG_KEY]: langSelect.value });
  await loadLang();
  applyI18n(); renderVersion();
  // Textes construits par le code : on les refait dans la nouvelle langue.
  await renderRemoved();
  await renderAttention();
  await renderShortcut();
  if (pendingImport) showImportConfirm(pendingImport, { focus: false }); // détail de l'import en cours
  fillFolderSelect();
  renderOptionFields(await currentOptionValues()); // la saisie en cours n'est pas perdue
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
const addMsg = document.getElementById("addMsg");

function flash(text, el) {
  el.textContent = text;
  // Sous le bouton de recherche, un message (erreur) reste jusqu'à l'action
  // suivante : s'il s'effaçait tout seul, la liste remonterait d'un coup.
  if (el === msg || el.classList.contains("field-err")) return;
  setTimeout(() => { if (el.textContent === text) el.textContent = ""; }, 3000);
}

// Supprime une agence (mode Organiser). Une agence fournie est seulement
// retirée de la liste : « Restaurer » dans les options la fait revenir.
async function deleteAgency(a) {
  // Pas de fenêtre de confirmation : la suppression est immédiate et annulable.
  const snapshot = await chrome.storage.local.get(UNDO_KEYS);
  const li = list.querySelector(`li.agency[data-id="${CSS.escape(a.id)}"]`);
  const place = li ? { folder: li.closest("li.group").dataset.folder, index: [...li.parentElement.children].indexOf(li) } : null;
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
  // Autorisations libérées seulement à la fin du délai d'annulation.
  offerUndo(t("undo.agency", { name: a.name }), snapshot, place, `li.agency[data-id="${CSS.escape(a.id)}"]`);
}

/* ---------- Suppression annulable ---------- */
/* La ligne supprimée laisse place, au même endroit, à « X supprimée —
   Annuler » pendant quelques secondes (annoncé aux lecteurs d'écran). */
const UNDO_MS = 15000; // le temps de remarquer une suppression par mégarde
const UNDO_KEYS = ["customAgencies", "checkedAgencies", "agencyOrder", "hiddenAgencies", "agencyFolderOf", "agencyFolders", "removedAgencies", "agencyOverrides"];
let undo = null; // { label, snapshot, place, restored, timer }
function offerUndo(label, snapshot, place, restored) {
  if (undo) finishUndo();
  undo = { label, snapshot, place, restored, timer: setTimeout(finishUndo, UNDO_MS) };
  applyUndo();
  announce(`${label} ${t("undo.hint")}`);
}
function finishUndo() {
  if (!undo) return;
  clearTimeout(undo.timer);
  undo = null;
  list.querySelector(".undo-row")?.remove();
  releaseUnusedOrigins();
}
async function doUndo() {
  const u = undo;
  if (!u) return;
  clearTimeout(u.timer);
  undo = null;
  const absent = UNDO_KEYS.filter((k) => !(k in u.snapshot)); // clés créées par la suppression
  if (absent.length) await chrome.storage.local.remove(absent);
  highlightFresh(u.restored);
  await chrome.storage.local.set(u.snapshot); // la liste se reconstruit, la ligne revient surlignée
  announce(t("undo.done"));
}
// Place la ligne « supprimée — Annuler » (après chaque reconstruction de la liste).
function applyUndo() {
  list.querySelector(".undo-row")?.remove();
  if (!undo || !undo.place) return;
  const row = document.createElement("li");
  row.className = "undo-row";
  const text = document.createElement("span");
  text.textContent = undo.label;
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "link inline";
  btn.textContent = t("undo.action");
  btn.dataset.key = "undo";
  btn.addEventListener("click", doUndo);
  row.append(text, btn);
  const { folder, index, listIndex } = undo.place;
  if (listIndex !== undefined) { list.insertBefore(row, list.children[listIndex] || null); return; }
  const items = list.querySelector(`li.group[data-folder="${CSS.escape(folder || "")}"] > .items`);
  if (items) items.insertBefore(row, items.children[index] || null);
}

// Masque ou réaffiche une agence (mode Organiser).
async function setHidden(id, hide) {
  const { [HIDDEN_KEY]: hidden = [] } = await chrome.storage.local.get(HIDDEN_KEY);
  const set = new Set(hidden);
  hide ? set.add(id) : set.delete(id);
  await chrome.storage.local.set({ [HIDDEN_KEY]: [...set] });
}

// Options : agences fournies supprimées, récupérables d'un clic.
// Agences fournies retirées qu'on peut restaurer. Celles mises de côté parce
// que l'utilisateur a déjà la même (ajoutée à la main) n'en font pas partie
// tant que la sienne existe : les restaurer ne ferait qu'un doublon.
async function restorableRemoved() {
  const ag = await loadAgencies();
  const options = await loadOptions();
  return AGENCIES.filter((a) => ag.removed.has(a.id) && !ag.custom.some((c) => sameAgencySite(a, c, options)));
}

async function renderRemoved() {
  const restorable = await restorableRemoved();
  document.getElementById("removedLine").hidden = !restorable.length;
  const names = restorable.map((a) => a.name);
  document.getElementById("removedText").textContent = t("opt.removed.line", { names: names.join(", ") });
}

// Réglages des options (sous-domaine Pixpalace) : enregistrés dès qu'on quitte
// le champ (ou Entrée), avec « ✓ Enregistré » à côté du libellé et l'erreur
// sous le champ. Plus de bouton : une seule façon d'enregistrer, comme la langue.
function renderOptionFields(values) {
  fields.textContent = "";
  for (const o of OPTIONS) {
    const div = document.createElement("div");
    div.className = "field";
    const label = document.createElement("label");
    label.htmlFor = "opt-" + o.id;
    label.className = "with-status";
    label.textContent = t(`opt.${o.id}.label`);
    const saved = document.createElement("span");
    saved.className = "saved";
    saved.setAttribute("role", "status");
    label.append(saved);
    const field = document.createElement("input");
    field.id = "opt-" + o.id;
    field.autocomplete = "off";
    field.spellcheck = false;
    field.value = values[o.id] ?? o.default;
    field.placeholder = o.default;
    const help = document.createElement("p");
    help.className = "help";
    help.id = `opt-${o.id}-help`;
    help.textContent = t(`opt.${o.id}.help`);
    const err = document.createElement("p");
    err.className = "status err field-err";
    err.id = `opt-${o.id}-err`;
    field.setAttribute("aria-describedby", `${help.id} ${err.id}`);
    field.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); field.blur(); } });
    field.addEventListener("input", () => { err.textContent = ""; field.removeAttribute("aria-invalid"); saved.textContent = ""; });
    field.addEventListener("change", () => saveOption(o, field, saved, err));
    div.append(label, field, err, help);
    fields.append(div);
  }
}

async function saveOption(o, field, saved, err) {
  const v = field.value.trim();
  if (v !== "" && !new RegExp(o.pattern).test(v)) {
    err.textContent = t(`opt.${o.id}.invalid`);
    field.setAttribute("aria-invalid", "true");
    return;
  }
  const values = { ...(await loadOptions()), [o.id]: v };
  await chrome.storage.local.set({ [OPTIONS_KEY]: values });
  cachedOptions = values;
  saved.textContent = t("opt.saved");
  setTimeout(() => { if (saved.textContent === t("opt.saved")) saved.textContent = ""; }, 2500);
}

// Valeurs affichées (non perdues si l'on change de langue en cours de saisie).
async function currentOptionValues() {
  const values = { ...(await loadOptions()) };
  for (const o of OPTIONS) { const f = document.getElementById("opt-" + o.id); if (f) values[o.id] = f.value; }
  return values;
}

// À régler : sites qu'il faut encore autoriser, avec le nom des agences.
async function renderAttention() {
  const missing = await missingFillOrigins(await checkedAgencies());
  missingOrigins = [...missing.keys()];
  const names = [...missing.values()].flat().map((a) => a.name);
  document.getElementById("attention").hidden = !names.length;
  document.getElementById("attentionText").textContent = names.length === 1
    ? t("perm.banner.one", { names: names[0] })
    : t("perm.banner.many", { n: names.length, names: names.join(", ") });
  return names.length;
}

// Agences cochées et visibles : seules elles ont besoin de leur site autorisé
// (une agence livrée décochée ne réclame rien tant qu'on ne la coche pas).
async function checkedAgencies() {
  const ag = await loadAgencies();
  const { folders, folderOf } = await loadFolders();
  const hiddenFolders = new Set(folders.filter((f) => f.hidden).map((f) => f.id));
  const { [STORAGE_KEY]: checked } = await chrome.storage.local.get({ [STORAGE_KEY]: DEFAULT_CHECKED });
  return ag.all.filter((a) => checked.includes(a.id) && !ag.hidden.has(a.id) && !hiddenFolders.has(folderOf[a.id]));
}

// Accès rapide : le raccourci réellement défini dans Chrome.
async function renderShortcut() {
  let key = "";
  try { key = ((await chrome.commands.getAll()).find((c) => c.name === "_execute_action") || {}).shortcut || ""; } catch (_) { /* rien */ }
  document.getElementById("shortcutText").textContent = t("access.shortcut", { key: key || t("access.none") });
}
document.getElementById("shortcutBtn").addEventListener("click", () => {
  chrome.tabs.create({ url: "chrome://extensions/shortcuts" });
  if (isPopup) window.close();
});

let cachedOptions = {}; // réglages en mémoire (l'autorisation doit partir directement du clic)
loadOptions().then((o) => { cachedOptions = o; });

// Trois écrans dans la même page : recherche, éditeur d'agence, options.
function showView(view) {
  mainForm.hidden = view !== mainForm;
  editorView.hidden = view !== editorView;
  settingsView.hidden = view !== settingsView;
  scrollTo(0, 0);
}

// Onglets en groupes (un par dossier) : enregistré dès qu'on coche.
// L'autorisation « groupes d'onglets » n'est demandée qu'à ce moment-là
// (Chrome l'annoncerait sinon à l'installation, pour une option désactivée
// par défaut) ; décocher la rend.
const tabGroupsOn = document.getElementById("tabGroupsOn"), tabGroupsCollapse = document.getElementById("tabGroupsCollapse");
async function renderTabGroups() {
  const { [TAB_GROUPS_KEY]: pref = {} } = await chrome.storage.local.get(TAB_GROUPS_KEY);
  const granted = await chrome.permissions.contains(TAB_GROUPS_PERMISSION).catch(() => false);
  tabGroupsOn.checked = Boolean(pref.enabled) && granted; // autorisation retirée dans Chrome : décochée
  tabGroupsCollapse.checked = Boolean(pref.collapsed);
  tabGroupsCollapse.disabled = !tabGroupsOn.checked;
}
function saveTabGroups() {
  tabGroupsCollapse.disabled = !tabGroupsOn.checked;
  return chrome.storage.local.set({ [TAB_GROUPS_KEY]: { enabled: tabGroupsOn.checked, collapsed: tabGroupsCollapse.checked } });
}
function showTabGroupsStatus(text, error = false) {
  const saved = document.getElementById("tabGroupsSaved");
  saved.classList.toggle("is-err", error);
  saved.textContent = text;
  setTimeout(() => { if (saved.textContent === text) saved.textContent = ""; }, 2500);
}
tabGroupsOn.addEventListener("change", async () => {
  if (!tabGroupsOn.checked) {
    await saveTabGroups();
    chrome.permissions.remove(TAB_GROUPS_PERMISSION).catch(() => {});
    return showTabGroupsStatus(t("opt.saved"));
  }
  // La demande part directement du clic ; l'option est enregistrée tout de
  // suite (si la popup se ferme pendant la demande, rien n'est perdu : sans
  // autorisation, les onglets ne sont simplement pas regroupés).
  const asked = chrome.permissions.request(TAB_GROUPS_PERMISSION).catch(() => false);
  await saveTabGroups();
  if (await asked) return showTabGroupsStatus(t("opt.saved"));
  tabGroupsOn.checked = false;
  await saveTabGroups();
  showTabGroupsStatus(t("tabs.refused"), true);
});
tabGroupsCollapse.addEventListener("change", async () => { await saveTabGroups(); showTabGroupsStatus(t("opt.saved")); });

async function showSettings() {
  await renderRemoved();
  await renderAttention(); // sites encore à autoriser (import, refus…)
  await renderShortcut();
  await renderTabGroups();
  renderOptionFields(await loadOptions());
  document.getElementById("restoreMsg").textContent = "";
  hideImportConfirm();
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
  let prefilled = null;
  if (a) startEdit(a);
  else if (!(await restoreDraft())) { resetEditor(); prefilled = await prefillFromActiveTab(); }
  showView(editorView);
  if (draft && draft.editing) ed.name.focus();
  else if (prefilled === "both") detectBtn.focus();     // il ne reste qu'à cliquer « Détecter »
  else if (prefilled === "url") ed.detQ.focus();
  else ed.detUrl.focus();
}

// Ajout : on part de la page ouverte dans l'onglet actif (souvent la page de
// résultats de l'agence) et des derniers mots-clés cherchés s'ils y figurent,
// sinon du paramètre de recherche de l'adresse (q, query, search…).
// Renvoie "both", "url" ou null.
async function prefillFromActiveTab() {
  let tab = null;
  try { [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true }); } catch (_) { /* rien */ }
  const url = tab && (tab.url || tab.pendingUrl);
  if (!url || !/^https:\/\//i.test(url)) return null;
  ed.detUrl.value = url;
  const { [QUERY_KEY]: last = "" } = await chrome.storage.local.get(QUERY_KEY);
  let q = "";
  if (last) {
    const r = await detectSearchUrl(url, last);
    if (!r.error && !r.notFound) q = last;
  }
  if (!q) {
    try {
      const params = new URL(url).searchParams;
      for (const k of ["q", "query", "search", "searchTerm", "keywords", "keyword", "text", "phrase", "term", "qt", "k", "kw", "s"]) {
        const v = (params.get(k) || "").trim();
        if (v) { q = v; break; }
      }
    } catch (_) { /* adresse illisible */ }
  }
  if (q) ed.detQ.value = q;
  ed.detectMsg.className = "status ok";
  ed.detectMsg.textContent = t(q ? "ed.prefilled" : "ed.prefilledUrl");
  return q ? "both" : "url";
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
  folder: $id("newFolder"), login: $id("newLogin"), loginErr: $id("loginErr"), share: $id("shareAgency"),
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
  const { fillDraft, [AGENCY_DRAFT_KEY]: agencyDraft } = await chrome.storage.session.get(["fillDraft", AGENCY_DRAFT_KEY]);
  const pickHost = fillDraft && hostOf(String(fillDraft.url || ""), {});
  if (pickHost) keep.add(originPattern(pickHost));
  // Agence en cours d'ajout dont le champ est déjà repéré (pas encore enregistrée).
  if (agencyDraft && agencyDraft.fill && agencyDraft.pageHost) keep.add(originPattern(agencyDraft.pageHost));
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
  // Un seul bouton principal à la fois : « Repérer » tant que rien n'est repéré.
  ed.pickBtn.className = fill && fill.input ? "secondary" : "primary";
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
  // Page de connexion : facultative, mais une adresse complète si elle est remplie.
  const loginError = ed.login.value.trim() && !cleanLogin(ed.login.value) ? t("spec.login") : "";
  const showLogin = Boolean(loginError && touched.has("login"));
  ed.loginErr.textContent = showLogin ? loginError : "";
  if (showLogin) { ed.login.setAttribute("aria-invalid", "true"); ed.advanced.open = true; } else ed.login.removeAttribute("aria-invalid");
  if (!error && loginError) error = loginError;
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

// Ajout : une fois la détection faite, l'étape 1 se résume en une ligne
// (« site · mots-clés — Modifier ») pour laisser la place à l'étape suivante.
const step1Summary = $id("step1Summary");
function collapseStep1(collapse) {
  if (draft && draft.editing) collapse = false; // en modification, la détection est déjà repliée en bas
  let host = "";
  try { host = new URL(ed.detUrl.value.trim()).hostname; } catch (_) { /* rien */ }
  if (collapse && !host) collapse = false;
  ed.step1.hidden = collapse;
  step1Summary.hidden = !collapse;
  if (collapse) $id("step1Text").textContent = [host, ed.detQ.value.trim()].filter(Boolean).join(" · ");
}
$id("step1Edit").addEventListener("click", () => { collapseStep1(false); ed.detUrl.focus(); });

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
      ...draft, name: ed.name.value, url: ed.url.value, payload: ed.payload.value, encode: ed.encode.value, folder: ed.folder.value, login: ed.login.value,
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
  step1Summary.hidden = true;
  ed.form.reset();
  ed.detUrl.value = ed.detQ.value = "";
  ed.detectMsg.textContent = ed.step2Msg.textContent = addMsg.textContent = pickMsg.textContent = "";
  touched.clear();
  ed.form.hidden = true;
  ed.title.textContent = t("ed.addTitle");
  ed.name.disabled = false;
  ed.reset.hidden = true;
  ed.share.hidden = true;
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
  ed.login.value = a.login || "";
  ed.reset.hidden = !a.modified;
  ed.share.hidden = !isShareable(a); // version enregistrée de l'agence
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
  ed.login.value = saved.login || "";
  ed.submit.textContent = saved.editing ? t("ed.saveEdit") : t("ed.add");
  ed.reset.hidden = !(saved.builtin && ORIGINAL_BY_ID.has(saved.id) && saved.editing);
  ed.share.hidden = !(saved.editing && isShareable(AGENCY_BY_ID.get(saved.id)));
  fillFolderSelect();
  ed.folder.value = saved.folder || "";
  layoutEditor(Boolean(saved.editing));
  if (saved.editing) redetect.open = Boolean(saved.detUrl);
  setMode(saved.mode);
  if (saved.step2) showStep2(saved.step2Msg);
  if (saved.step2 && !saved.editing && saved.detUrl) collapseStep1(true);
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
    showDetectResult("", [t("ed.notInUrl")]); // une mise en garde, pas une réussite
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
  collapseStep1(true);
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
for (const el of [ed.name, ed.url, ed.payload, ed.encode, ed.login]) {
  el.addEventListener("input", () => {
    if (!draft) return;
    touched.add(el === ed.login ? "login" : Object.keys(fieldInput).find((k) => fieldInput[k] === el));
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
  if (fill) {
    // Site pas encore autorisé (ex. agence fournie qui remplit un champ) : on
    // le demande ici, le clic sur « Essayer » le permet.
    const host = hostOf(url, {});
    if (host && !(await chrome.permissions.contains({ origins: [originPattern(host)] }))) {
      const granted = await chrome.permissions.request({ origins: [originPattern(host)] }).catch(() => false);
      if (!granted) return flash(t("ed.permRefused", { host }), addMsg);
    }
  }
  const res = await chrome.runtime.sendMessage({ type: "try", url, q, fill, builtinId: builtin ? builtin.id : null }).catch(() => null);
  flash(res && res.ok ? t("ed.tryStarted", { q }) : (res && res.error) || t("ed.tryFailed"), addMsg);
});

// Annuler : pendant un ajout, revient à l'étape « détecter » ; sinon, à la liste.
ed.cancel.addEventListener("click", () => {
  if (draft && !draft.editing) { resetEditor(); ed.detUrl.focus(); }
  else leaveEditor();
});

ed.share.addEventListener("click", () => { addMsg.className = "status ok"; copyShareCode({ agencyIds: [draft.id] }, addMsg); });

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
  ["name", "url", "payload", "encode", "login"].forEach((k) => touched.add(k));
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
    // Page de connexion : undefined = celle de l'original, false = aucune.
    const login = cleanLogin(ed.login.value);
    // (Agence déplacée sur un autre site : la page de connexion livrée n'y suit que si on la garde explicitement.)
    const movedSite = hostOf(spec.url, cachedOptions) !== hostOf(original.url, cachedOptions);
    const loginOverride = login ? (login === original.login && !movedSite ? undefined : login) : (original.login ? false : undefined);
    const same = spec.url === original.url && (spec.payload || "") === (original.payload || "")
      && (spec.encode || []).join() === (original.encode || []).join() && fillOverride === undefined && !renamed
      && loginOverride === undefined;
    if (same) delete overrides[id];
    else overrides[id] = { ...spec, ...(fillOverride !== undefined ? { fill: fillOverride } : {}), ...(renamed ? { name } : {}),
      ...(loginOverride !== undefined ? { login: loginOverride } : {}) };
    await chrome.storage.local.set({ [OVERRIDES_KEY]: overrides });

  } else {
    const agency = cleanCustomAgency({ id, name, ...raw, fill: draft.mode === "fill" ? draft.fill : undefined, login: ed.login.value });
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

settingsForm.addEventListener("submit", (e) => e.preventDefault()); // Entrée : enregistré au « change »

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
    if (!next.hidden) delete next.hidden;
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
  const snapshot = await chrome.storage.local.get(UNDO_KEYS);
  const group = list.querySelector(`li.group[data-folder="${CSS.escape(f.id)}"]`);
  const place = group ? { listIndex: [...list.children].indexOf(group) } : null;
  const cur = await loadFolders();
  for (const [agencyId, folderId] of Object.entries(cur.folderOf)) if (folderId === f.id) delete cur.folderOf[agencyId];
  await chrome.storage.local.set({ [FOLDERS_KEY]: cur.folders.filter((x) => x.id !== f.id), [FOLDER_OF_KEY]: cur.folderOf });
  offerUndo(t("undo.folder", { name: f.name }), snapshot, place, `li.group[data-folder="${CSS.escape(f.id)}"] > .group-head`);
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
  // Œil : masque le dossier et ses agences en mode normal (comme pour une agence).
  const eye = eyeButton(Boolean(f.hidden), t(f.hidden ? "folder.show" : "folder.hide", { name: f.name }), () => updateFolder(f.id, { hidden: !f.hidden }), "fh:" + f.id);
  eye.classList.add("fhide");
  eye.setAttribute("aria-pressed", String(Boolean(f.hidden)));
  return { nameInput, swatch, del, palette, eye };
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
    o.textContent = f.hidden ? t("folder.hiddenTag", { name: f.name }) : f.name; // y ranger une agence la masque aussi
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
  // Seulement celles qui sont listées : les doublons d'une agence ajoutée restent de côté.
  const restorable = new Set((await restorableRemoved()).map((a) => a.id));
  const n = restorable.size;
  const { [REMOVED_KEY]: removed = [] } = await chrome.storage.local.get(REMOVED_KEY);
  await chrome.storage.local.set({ [REMOVED_KEY]: removed.filter((id) => !restorable.has(id)) });
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
  backupMsg.className = "status ok";
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
  hideImportConfirm(); // une confirmation précédente laissée ouverte
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
  backupMsg.textContent = "";
  showImportConfirm(result);
});

/* Confirmation de l'import, dans la page (et non une fenêtre du navigateur) :
   bien visible, avec le détail de ce qui sera importé, dossiers compris. */
const importConfirm = $id("importConfirm");
let pendingImport = null; // résultat de l'analyse du fichier, en attente de confirmation
let importChoice = null;  // { mode, parts } choisis dans la boîte (gardés si on change de langue)
const importMode = () => importConfirm.querySelector('input[name="importMode"]:checked').value;
// Effets de l'import, calculés d'après la configuration actuelle (importCurrent).
let importCurrent = {};
const fxNames = (list) => (list.length ? " (" + list.slice(0, 3).join(", ") + (list.length > 3 ? ", …" : "") + ")" : "");
const fxJoin = (items) => items.filter(Boolean).join(" · ") || t("backup.fx.none");
// Bilan d'un ajout (fichier ou code), en phrases avec les noms ; rien à zéro.
function addedLines(r) {
  const lines = [
    r.added.length ? t("backup.done.agencies", { n: r.added.length }) + fxNames(r.added) + "." : "",
    r.foldersAdded ? t("backup.done.folders", { n: r.foldersAdded }) + fxNames(r.folderNames || []) + "." : "",
    r.filed ? t("backup.done.filed", { n: r.filed }) : "",
    r.taken.length ? t("backup.added.taken", { n: r.taken.length }) + fxNames(r.taken) + "." : "",
    r.present ? t("backup.added.dupes", { n: r.present }) : "",
    r.full ? t("backup.added.full", { n: r.full, max: MAX_CUSTOM }) : "",
  ].filter(Boolean);
  return lines.length ? lines : [t("backup.done.nothing")];
}
function settingValue(id, v) {
  if (v === null || v === undefined) return t("backup.fx.absent");
  if (id === "language") return t("backup.lang." + v);
  if (id === "tabGroups") return t(v.enabled ? "backup.tg.on" : "backup.tg.off") + (v.enabled && v.collapsed ? t("backup.tg.collapsed") : "");
  return v;
}
const settingLabel = (id) => (id === "language" ? t("backup.set.language") : id === "tabGroups" ? t("backup.set.tabGroups") : t("backup.set." + id.slice(4)));
// Texte de chaque partie et nombre de changements qu'elle apporte.
function importPartFx(part, e, add, pick) {
  if (add && part === "agencies") return { n: e.added.length + e.taken.length, text: fxJoin([e.added.length || !e.taken.length ? t("backup.fx.toAdd", { n: e.added.length }) + fxNames(e.added) : "", e.taken.length ? t("backup.fx.taken", { n: e.taken.length }) + fxNames(e.taken) : "", e.present ? t("backup.fx.present", { n: e.present }) : "", e.full ? t("backup.fx.full", { n: e.full }) : ""]) };
  if (add) return { n: e.added + e.filed, text: fxJoin([t("backup.fx.toAdd", { n: e.added }), e.present ? t("backup.fx.presentF", { n: e.present }) : "", e.filed ? t("backup.fx.filed", { n: e.filed }) : ""]) };
  if (part === "agencies") return { n: e.arrive.length + e.leave.length + e.edited.length, text: fxJoin([e.arrive.length ? t("backup.fx.arrive", { n: e.arrive.length }) + fxNames(e.arrive) : "", e.edited.length ? t("backup.fx.edited", { n: e.edited.length }) + fxNames(e.edited) : "", e.leave.length ? t("backup.fx.leave", { n: e.leave.length }) + fxNames(e.leave) : ""]) };
  if (part === "selection") return { n: e.changed, text: e.changed ? t("backup.fx.boxes", { n: e.changed }) : t("backup.fx.none") };
  if (part === "folders") return { n: e.created + e.removed + e.edited + e.moved, text: fxJoin([e.created ? t("backup.fx.fCreated", { n: e.created }) : "", e.removed ? t("backup.fx.fRemoved", { n: e.removed }) : "", e.edited ? t("backup.fx.fEdited", { n: e.edited }) : "", e.moved ? t("backup.fx.moved", { n: e.moved }) : ""]) };
  const changes = e.items.filter((x) => !x.same && pick.includes(x.id)).length;
  return { n: changes, text: changes ? t("backup.fx.settings", { n: changes }) : t("backup.fx.none") };
}
// Titre, texte, bouton, cases et effets selon le mode et les parties cochées.
function renderImportChoice() {
  const mode = importMode();
  const add = mode === "add";
  importConfirm.classList.toggle("adding", add);
  importConfirm.setAttribute("role", add ? "dialog" : "alertdialog");
  $id("importTitleText").textContent = pendingImport.share ? t("share.add.title") : t(add ? "backup.add.title" : "backup.replace.title");
  const settingsOn = $id("importParts").querySelector('.import-part input[value="settings"]');
  // Réglages choisis : cochés, et présents dans le fichier (un fichier ancien n'a pas les groupes d'onglets).
  const F = pendingImport.storage;
  const inFile = (id) => (id === "language" ? true : id === "tabGroups" ? Boolean(F[TAB_GROUPS_KEY]) : (F[OPTIONS_KEY] || {})[id.slice(4)] !== undefined);
  const pick = [...$id("importSettings").querySelectorAll("input")].filter((b) => b.checked && inFile(b.value)).map((b) => b.value);
  const fx = importEffects(importCurrent, pendingImport, { mode, settings: pick });
  const parts = [];
  let changes = 0;
  for (const box of $id("importParts").querySelectorAll(".import-part input")) {
    const usable = !add || IMPORT_ADD_PARTS.includes(box.value);
    // Partie sans objet en mode Ajouter : décochée à l'écran, son choix est retrouvé en revenant à Remplacer.
    if (!usable && !box.disabled) { box.dataset.wanted = String(box.checked); box.checked = false; }
    if (usable && box.disabled) box.checked = box.dataset.wanted !== "false";
    box.disabled = !usable;
    const row = box.closest(".import-part");
    row.classList.toggle("is-off", !usable);
    // Code d'une agence seule : pas de ligne « Dossiers ».
    row.hidden = Boolean(pendingImport.share && box.value === "folders" && !(F[FOLDERS_KEY] || []).length);
    if (row.hidden) continue;
    const r = usable ? importPartFx(box.value, fx[box.value], add, pick) : { n: 0, text: "" };
    row.querySelector(".detail").textContent = r.text;
    row.classList.toggle("no-change", usable && !r.n);
    const include = usable && box.checked && (box.value !== "settings" || pick.length);
    if (include) { parts.push(box.value); changes += r.n; }
  }
  // Réglages un par un (mode Remplacer, partie « Réglages » cochée).
  const subs = $id("importSettings");
  subs.hidden = add;
  for (const b of subs.querySelectorAll("input")) {
    const item = fx.settings ? fx.settings.items.find((x) => x.id === b.value) : null;
    b.disabled = add || !settingsOn.checked || !inFile(b.value);
    const row = b.closest(".import-sub");
    row.classList.toggle("is-off", b.disabled);
    row.querySelector(".detail").textContent = !item ? "" : !inFile(b.value) ? t("backup.fx.absent")
      : item.same ? t("backup.fx.unchanged", { v: settingValue(item.id, item.from) })
      : settingValue(item.id, item.from) + " → " + settingValue(item.id, item.to);
  }
  importChoice = { mode, parts, settings: pick };
  const nothing = !parts.length ? t("backup.nothing") : !changes ? t(pendingImport.share ? "share.add.nothing" : add ? "backup.add.nothing" : "backup.replace.nothing") : "";
  $id("importConfirmText").textContent = nothing || t(pendingImport.share ? "share.add.text" : add ? "backup.add.text" : "backup.replace.text");
  const ok = $id("importOk");
  ok.textContent = t(add ? "backup.add.ok" : "backup.replace.ok");
  ok.className = add ? "primary" : "danger";
  ok.disabled = Boolean(nothing);
}
async function showImportConfirm(result, { focus = true } = {}) {
  pendingImport = result;
  importCurrent = await chrome.storage.local.get(null);
  if (pendingImport !== result) return; // un autre fichier choisi entre-temps
  const s = result.summary;
  // Code de partage : toujours « Ajouter » (rien n'est retiré ni modifié chez l'utilisateur).
  const previous = result.share ? { mode: "add", parts: IMPORT_ADD_PARTS, settings: IMPORT_SETTINGS }
    : importChoice || { mode: "add", parts: IMPORT_ADD_PARTS, settings: IMPORT_SETTINGS }; // le mode sans risque d'abord
  importConfirm.classList.toggle("share-mode", Boolean(result.share));
  for (const r of importConfirm.querySelectorAll('input[name="importMode"]')) r.checked = r.value === previous.mode;
  const checkbox = (value, checked, onChange) => {
    const box = document.createElement("input");
    box.type = "checkbox";
    box.value = value;
    box.checked = checked;
    box.dataset.wanted = String(checked);
    box.addEventListener("change", onChange);
    return box;
  };
  const row = (cls, box, label) => {
    const el = document.createElement("label");
    el.className = cls;
    const text = document.createElement("span");
    const name = document.createElement("strong");
    name.textContent = label;
    const detail = document.createElement("span");
    detail.className = "help detail";
    const off = document.createElement("span");
    off.className = "help only-replace";
    off.textContent = t("backup.part.replaceOnly");
    text.append(name, " ", detail, off);
    el.append(box, text);
    return el;
  };
  const labels = { agencies: t("backup.part.agencies"), selection: t("backup.part.selection"), folders: t("backup.part.folders"), settings: t("backup.part.settings") };
  $id("importParts").replaceChildren(...IMPORT_PARTS.map((id) =>
    row("import-part", checkbox(id, previous.parts.includes(id) || (previous.mode === "add" && !IMPORT_ADD_PARTS.includes(id)), renderImportChoice), labels[id])));
  $id("importSettings").replaceChildren(...IMPORT_SETTINGS.map((id) =>
    row("import-sub", checkbox(id, previous.settings.includes(id), renderImportChoice), settingLabel(id))));
  renderImportChoice();
  const notes = [s.skipped ? t("backup.skipped", { n: s.skipped }) : "", s.unknown ? t("backup.unknown", { n: s.unknown }) : "", s.newer ? t("backup.newer") : ""].filter(Boolean).join(" ");
  $id("importNotes").textContent = notes;
  $id("importNotes").hidden = !notes;
  importConfirm.hidden = false;
  if (!focus) return; // simple retraduction (changement de langue)
  importConfirm.scrollIntoView({ block: "nearest" });
  $id("importCancel").focus(); // le choix sans risque d'abord
}
for (const r of importConfirm.querySelectorAll('input[name="importMode"]')) r.addEventListener("change", renderImportChoice);
// La boîte vit dans les options ; pour un code collé dans l'éditeur, elle y est déplacée le temps du choix.
const importHome = { parent: importConfirm.parentElement, next: importConfirm.nextSibling };
let importOrigin = "settings"; // "settings" | "editor"
function hideImportConfirm() {
  pendingImport = null;
  importChoice = null;
  importConfirm.hidden = true;
  importConfirm.classList.remove("share-mode");
  importFile.value = ""; // le même fichier pourra être choisi à nouveau
  importHome.parent.insertBefore(importConfirm, importHome.next);
  importOrigin = "settings";
}
const importReturnFocus = () => (importOrigin === "editor" ? ed.detUrl : pendingImport && pendingImport.share ? $id("shareCodeInput") : $id("importBtn"));
$id("importCancel").addEventListener("click", () => { const back = importReturnFocus(); hideImportConfirm(); back.focus(); });
importConfirm.addEventListener("keydown", (e) => { // Échap : annule l'import (sans quitter les options)
  if (e.key !== "Escape") return;
  e.preventDefault();
  const back = importReturnFocus();
  hideImportConfirm();
  back.focus();
});

/* Code de partage collé : dans « + Ajouter une agence » (champ de la page de
   résultats) ou dans les options. La boîte d'import s'ouvre sous le champ. */
async function checkShareCode(field, origin) {
  if (!/TabulaPix:\d+:/.test(field.value)) return false;
  const msgEl = origin === "editor" ? ed.detectMsg : backupMsg;
  if (origin === "editor" && draft && draft.editing) { msgEl.className = "status err"; msgEl.textContent = t("share.err.editing"); return true; }
  const result = (await parseShareCode(field.value)) || { error: "share.err.broken" }; // trop court ou tronqué
  if (result.error) { msgEl.className = "status err"; msgEl.textContent = t(result.error); return true; }
  msgEl.textContent = "";
  field.value = "";
  hideImportConfirm(); // une boîte précédente laissée ouverte
  importOrigin = origin;
  field.closest(".field").after(importConfirm);
  await showImportConfirm(result);
  return true;
}
ed.detUrl.addEventListener("input", () => checkShareCode(ed.detUrl, "editor"));
// Code de partage collé dans les mots-clés : on le passe à « + Ajouter une agence ».
input.addEventListener("input", async () => {
  if (organizing || !/TabulaPix:\d+:/.test(input.value)) return;
  const code = input.value;
  input.value = "";
  await chrome.storage.session.remove(AGENCY_DRAFT_KEY);
  await showEditor();
  ed.detUrl.value = code;
  ed.detUrl.focus();
  checkShareCode(ed.detUrl, "editor");
});
$id("shareCodeInput").addEventListener("input", () => checkShareCode($id("shareCodeInput"), "settings"));
$id("importOk").addEventListener("click", async () => {
  if (!pendingImport || !importChoice || !importChoice.parts.length) return;
  const result = pendingImport, choice = importChoice, origin = importOrigin;
  hideImportConfirm();
  const current = await chrome.storage.local.get(null);
  const merged = mergeConfigImport(current, result, choice);
  // Autorisations demandées tout de suite, le clic le permet : sites des
  // agences importées qui remplissent un champ, et groupes d'onglets si le
  // fichier les active. Sinon, la liste et les options proposent « Autoriser ».
  const wantGroups = Boolean(merged.storage[TAB_GROUPS_KEY] && merged.storage[TAB_GROUPS_KEY].enabled);
  const request = { ...(merged.hosts.length ? { origins: merged.hosts.map(originPattern) } : {}), ...(wantGroups ? { permissions: ["tabGroups"] } : {}) };
  const asked = Object.keys(request).length ? chrome.permissions.request(request).catch(() => false) : Promise.resolve(true);

  await chrome.storage.local.set(merged.storage); // la dernière recherche et le reste sont gardés
  await chrome.storage.session.remove([AGENCY_DRAFT_KEY, PICK_RESULT_KEY, "fillDraft", "pickSession"]);
  await applyNewAgencyDefaults();

  // Autorisations : on retire celles qui ne servent plus, on liste celles à accorder.
  await releaseUnusedOrigins();
  // Code collé dans l'éditeur : retour à la liste, où les agences arrivées apparaissent.
  if (origin === "editor") {
    await leaveEditor();
    const r = merged.report;
    msg.classList.remove("err");
    msg.textContent = addedLines(merged.report).join(" ");
    flashEl(msg);
    return;
  }
  await reloadSettingsView();
  const report = async () => {
    const toAllow = await renderAttention(); // agences cochées dont le site reste à autoriser
    backupMsg.className = "status ok";
    // Résumé écrit après l'import : dans la langue du fichier importé, s'il en change.
    const r = merged.report, s = result.summary;
    const lines = r.mode === "add"
      ? addedLines(r)
      : [t("backup.replaced", { parts: r.parts.map((p) => t("backup.part." + p).toLowerCase()).join(", ") })];
    lines.push(s.skipped ? t("backup.skipped", { n: s.skipped }) : "", s.unknown ? t("backup.unknown", { n: s.unknown }) : "", s.newer ? t("backup.newer") : "");
    backupMsg.textContent = t("backup.imported") + " " + lines.filter(Boolean).join(" ") + (toAllow ? "\n" + t("backup.needPerm") : "");
  };
  await report();
  asked.then(report); // une fois la demande de Chrome acceptée ou refusée
});

// Les autorisations doivent être demandées directement depuis un clic.
authorizeBtn.addEventListener("click", () => {
  chrome.permissions.request({ origins: missingOrigins }).then(async (granted) => {
    await renderAttention(); // accordé : le bloc disparaît
    if (!granted) document.getElementById("attentionText").textContent += " " + t("backup.authRefused");
  }).catch(() => {});
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
  applyI18n(); renderVersion();
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
let currentFolderOf = {}; // dossier de chaque agence (pour les groupes d'onglets)
let keptChecked = []; // coches des agences d'un dossier masqué (absentes de la liste)
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
  login: '<path d="M9.5 2.5h3.5v11H9.5"/><path d="M2.5 8h7.5M7 5l3 3-3 3"/>',
  share: '<path d="M8 2.5v8M5 5.5l3-3 3 3"/><path d="M3.5 8.5v4.5h9V8.5"/>',
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
  // Le mot affiché (« Terminé ») fait partie du nom lu par les lecteurs d'écran.
  organizeBtn.setAttribute("aria-label", on ? `${t("main.organize.done")} — ${t("main.organize")}` : t("main.organize"));
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
  if (e.key !== "Escape" || e.defaultPrevented) return;
  if (organizing && !dragged && !mainForm.hidden) { e.preventDefault(); setOrganizing(false); }
  // Éditeur, options : Échap revient d'un cran (au lieu de fermer la popup).
  else if (!editorView.hidden) { e.preventDefault(); leaveEditor(); }
  else if (!settingsView.hidden) { e.preventDefault(); showMain(); }
});

// Une ligne d'agence : case et nom ; en mode Organiser, une poignée à droite.
function agencyItem(a, checked, isHidden = false, inHiddenFolder = false) {
  const li = document.createElement("li");
  li.className = "agency";
  li.dataset.id = a.id;
  const label = document.createElement("label");
  const box = document.createElement("input");
  box.type = "checkbox";
  box.className = "agency-box";
  if (!isHidden) box.setAttribute("aria-describedby", "organizeKbd"); // consigne clavier lue au focus
  box.value = a.id;
  box.dataset.key = "a:" + a.id;
  box.checked = !isHidden && checked.includes(a.id);
  box.disabled = isHidden || inHiddenFolder; // dossier masqué : coche gardée, mais inactive
  if (isHidden) li.classList.add("is-hidden");
  box.addEventListener("change", save);
  box.addEventListener("keydown", (e) => {
    // Réordonner au clavier, à tout moment (équivalent de la poignée).
    if (!e.altKey || (e.key !== "ArrowUp" && e.key !== "ArrowDown")) return;
    e.preventDefault();
    moveAgency(li, e.key === "ArrowUp");
  });
  let name;
  if (organizing) {
    // Mode Organiser : le nom se modifie sur place, comme celui d'un dossier.
    name = document.createElement("input");
    name.className = "aname-input";
    name.dataset.key = "an:" + a.id;
    name.value = a.name;
    name.maxLength = 40;
    name.autocomplete = "off";
    name.spellcheck = false;
    name.title = a.name;
    name.setAttribute("aria-label", t("ag.rename", { name: a.name }));
    name.addEventListener("keydown", (e) => {
      if (e.key === "Enter") { e.preventDefault(); name.blur(); }
      if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); name.value = a.name; name.blur(); }
    });
    // Sélectionner du texte dans le champ ne doit pas faire glisser la ligne.
    name.addEventListener("focus", () => { li.draggable = false; });
    name.addEventListener("blur", () => { li.draggable = true; });
    name.addEventListener("change", () => renameAgency(a, name));
  } else {
    name = document.createElement("span");
    name.className = "name";
    name.textContent = a.name;
  }
  name.dir = "auto"; // noms en arabe, hébreu… dans le bon sens
  label.append(box, name);
  if (!organizing && newAgencies.has(a.id)) {
    const pill = document.createElement("span");
    pill.className = "new-pill";
    pill.textContent = t("main.new");
    pill.title = t("main.new.title");
    label.append(pill);
  }
  if (isManual(a)) {
    const hint = document.createElement("span");
    hint.className = "hint";
    hint.textContent = t("main.paste");
    hint.title = t("main.paste.title");
    label.append(hint);
  }
  li.append(label);
  if (organizing) {
    const eye = eyeButton(isHidden, t(isHidden ? "ag.show" : "ag.hide", { name: a.name }), () => setHidden(a.id, !isHidden), "h:" + a.id);
    eye.setAttribute("aria-pressed", String(isHidden));
    const edit = toolButton("pencil", t("opt.edit", { name: a.name }), () => showEditor(a));
    const del = toolButton("trash", t("opt.delete", { name: a.name }), () => deleteAgency(a));
    del.classList.add("fdel");
    // Même ordre que sur un dossier : partager, crayon, corbeille, œil. La corbeille
    // n'est plus collée au nom ; l'œil reste en dernier, contre la poignée : quand les
    // autres outils apparaissent au survol (popup étroite), ils s'ajoutent à sa gauche
    // et l'œil ne bouge pas, agence masquée ou non.
    // Partager : seulement les agences ajoutées ou fournies modifiées.
    const share = isShareable(a) ? toolButton("share", t("share.agency", { name: a.name }), () => copyShareCode({ agencyIds: [a.id] }, msg)) : null;
    li.append(...(share ? [share] : []), edit, del, eye, grip(t("main.handle")));
    li.draggable = true; // on la glisse aussi par son nom
    label.title = t("main.handle");
  } else {
    // Hors Organiser : poignée affichée au survol, on réordonne sans changer de mode.
    // Agence avec une page de connexion : l'icône « Se connecter » à côté.
    if (a.login && !isHidden) {
      const login = toolButton("login", t("ag.login", { name: a.name }), () => openLogin(a));
      login.classList.add("login-tool");
      login.dataset.key = "l:" + a.id;
      li.append(login);
    }
    li.append(grip(t("main.handle")));
  }
  return li;
}

// Page de connexion de l'agence, dans son onglet s'il est ouvert (le script
// d'arrière-plan relancera ensuite la dernière recherche de cet onglet).
async function openLogin(a) {
  const res = await chrome.runtime.sendMessage({ type: "login", id: a.id }).catch(() => null);
  if (res && res.ok && isPopup) window.close();
}

// Œil (masquer / réafficher) : au survol ou au focus, il montre l'état qu'on
// obtiendra en cliquant (œil barré pour masquer, œil ouvert pour réafficher).
// Juste après un clic, la liste est reconstruite sous la souris : le nouvel œil
// garde alors l'icône du nouvel état (sinon il remontrerait l'ancienne) jusqu'à
// ce que la souris le quitte ou que le focus parte.
let eyeJustToggled = null;
function eyeButton(hidden, title, onClick, key) {
  const b = toolButton(hidden ? "eyeOff" : "eye", title, () => { eyeJustToggled = key; onClick(); });
  b.dataset.key = key;
  b.classList.add("eye-toggle");
  if (key === eyeJustToggled) {
    b.classList.add("settled");
    const release = () => { b.classList.remove("settled"); eyeJustToggled = null; };
    b.addEventListener("mouseleave", release, { once: true });
    b.addEventListener("blur", release, { once: true });
  }
  b.firstChild.classList.add("ico-now");
  const next = icon(hidden ? "eye" : "eyeOff");
  next.classList.add("ico-next");
  b.append(next);
  return b;
}

// Renommage sur place (mode Organiser). Agence fournie : nom enregistré comme
// une modification (« Rétablir l'original » le défait) ; agence ajoutée : son nom.
async function renameAgency(a, input) {
  const n = input.value.trim();
  if (n === a.name) { input.value = a.name; return; }
  if (!n || n.length > 40) {
    input.value = a.name;
    input.setCustomValidity(t("ed.err.name"));
    input.reportValidity();
    input.addEventListener("input", () => input.setCustomValidity(""), { once: true });
    return;
  }
  if (a.custom) {
    const { [CUSTOM_KEY]: list = [] } = await chrome.storage.local.get(CUSTOM_KEY);
    await chrome.storage.local.set({ [CUSTOM_KEY]: list.map((c) => (c && c.id === a.id ? { ...c, name: n } : c)) });
    return;
  }
  const original = ORIGINAL_BY_ID.get(a.id);
  if (!original) return;
  const { [OVERRIDES_KEY]: overrides = {} } = await chrome.storage.local.get(OVERRIDES_KEY);
  const ov = overrides[a.id] ? { ...overrides[a.id] }
    : { url: original.url, ...(original.payload !== undefined ? { payload: original.payload, encode: original.encode } : {}) };
  if (n === original.name) delete ov.name; else ov.name = n;
  // Plus rien de différent de l'original : la modification disparaît.
  const plain = ov.url === original.url && (ov.payload || "") === (original.payload || "")
    && (ov.encode || []).join() === (original.encode || []).join() && ov.fill === undefined && ov.login === undefined && ov.name === undefined;
  if (plain) delete overrides[a.id]; else overrides[a.id] = ov;
  await chrome.storage.local.set({ [OVERRIDES_KEY]: overrides });
}

// Partage : le code est copié, à coller dans la messagerie de la rédaction.
async function copyShareCode(what, msgEl) {
  let share = null;
  try { share = await buildShareCode(what); } catch (_) { /* rien */ }
  msgEl.classList.remove("err");
  if (!share) { msgEl.textContent = t("share.nothing"); return; }
  try {
    await navigator.clipboard.writeText(share.code);
    msgEl.textContent = t(what.folderId ? "share.copied.folder" : "share.copied", { name: share.name, n: share.agencies });
  } catch (_) {
    msgEl.textContent = t("share.copyFailed");
  }
  flashEl(msgEl);
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
  blockedIds = new Set([...missing.values()].flat().map((a) => a.id));
  updateGoCount();
  const names = [...missing.values()].flat().map((a) => a.name);
  permBanner.hidden = !names.length;
  document.getElementById("permText").dir = "auto";
  const text = document.getElementById("permText");
  text.textContent = names.length === 1 ? t("perm.short.one", { names: names[0] }) : t("perm.short.many", { n: names.length });
  // La phrase complète (et les noms) en infobulle ; les pastilles « à autoriser » montrent lesquelles.
  text.title = names.length === 1
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
  clearNew(li.dataset.id);
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
  const group = li.closest("li.group"), rows = [...group.querySelectorAll("li.agency")];
  const where = group.dataset.folder ? group.querySelector(".fname-input, .folder-name").value || group.querySelector(".folder-name")?.textContent : t("folder.root");
  announce(t("a11y.moved", { name: li.querySelector(".name").textContent, where, pos: rows.indexOf(li) + 1, total: rows.length }));
}

// Annonce pour les lecteurs d'écran (zone #live, polie).
function announce(text) {
  const live = document.getElementById("live");
  live.textContent = "";
  requestAnimationFrame(() => { live.textContent = text; });
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
  box.setAttribute("aria-describedby", "organizeKbd");
  box.setAttribute("aria-label", f.name); // la case seule : le nom n'en fait plus partie
  box.disabled = Boolean(f.hidden); // dossier masqué : rien n'y est cherché
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
    const folders = [...list.querySelectorAll("li.group:not(.root)")];
    announce(t("a11y.folderMoved", { name: f.name, pos: folders.indexOf(group) + 1, total: folders.length }));
  });
  const count = document.createElement("span");
  count.className = "count";
  label.append(box);
  if (organizing) {
    const c = folderControls(f, color, msg);
    c.nameInput.title = f.name;
    const share = toolButton("share", t("share.folder", { name: f.name }), () => copyShareCode({ folderId: f.id }, msg));
    share.classList.add("fshare");
    head.append(toggle, label, c.swatch, c.nameInput, count, share, c.del, c.eye, grip(t("folder.handle"))); // même ordre que les agences ; l'œil reste en place au survol
    group.append(head, c.palette);
  } else {
    const name = document.createElement("span");
    name.className = "folder-name";
    name.dir = "auto";
    name.textContent = f.name;
    name.title = f.name; // nom complet si la colonne est trop étroite
    // Un clic sur le titre plie ou déplie le dossier ; seule la case coche tout
    // (pas de « tout coché » par mégarde en voulant ouvrir le dossier).
    head.classList.add("foldable");
    head.addEventListener("click", (e) => {
      if (e.target.closest("label, input, button, .grip")) return;
      setCollapsed(group, !group.classList.contains("collapsed"), true);
    });
    head.append(toggle, label, name, count, grip(t("folder.handle")));
    group.append(head);
  }
  return head;
}

// Liste : un bloc coloré par dossier, puis les agences sans dossier.
function render(agencies, checked, folders, folderOf, hidden = new Set(), missing = new Map(), withAgencies = new Set()) {
  list.classList.toggle("has-folders", folders.length > 0);
  const groups = folders.map((f) => ({ folder: f, items: [] }));
  const byFolder = new Map(groups.map((g) => [g.folder.id, g]));
  const root = { folder: null, items: [] };
  for (const a of agencies) (byFolder.get(folderOf[a.id]) || root).items.push(a);

  let shownGroups = 0;
  [...groups, root].forEach((g, i) => {
    // Mode normal : un dossier masqué, ou dont toutes les agences sont masquées,
    // n'apparaît pas (il reste visible, grisé, en mode Organiser).
    if (g.folder && !organizing && (g.folder.hidden || (withAgencies.has(g.folder.id) && !g.items.length))) return;
    if (g.folder || g.items.length) shownGroups++;
    const group = document.createElement("li");
    group.className = "group" + (g.folder ? "" : " root") + (g.folder && g.folder.collapsed ? " collapsed" : "") + (g.folder && g.folder.hidden ? " is-hidden" : "");
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
    ul.setAttribute("aria-label", g.folder ? g.folder.name : t("folder.root")); // le dossier de chaque case
    for (const a of g.items) {
      const li = agencyItem(a, checked, hidden.has(a.id), Boolean(g.folder && g.folder.hidden));
      const origin = [...missing].find(([, names]) => names.includes(a))?.[0];
      if (origin && !organizing) li.insertBefore(permPill(origin), li.querySelector(".grip")); // avant la poignée
      ul.append(li);
    }
    const empty = document.createElement("p");
    empty.className = "empty";
    empty.textContent = t(!g.folder ? "folder.root.empty" : "folder.empty");
    group.append(ul, empty);
    list.append(group);
  });
  if (!shownGroups) {
    // Rien à afficher : toutes les agences (ou tous les dossiers) sont masqués.
    const li = document.createElement("li");
    li.className = "empty-list";
    li.textContent = t(organizing ? "main.empty.organize" : "main.empty");
    list.append(li);
  }
  // « + Ajouter une agence » aussi hors Organiser : c'est là qu'on colle le code d'un collègue.
  if (organizing) list.append(newFolderRow(), addAgencyRow());
  else list.append(addAgencyRow());
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
      count.setAttribute("aria-hidden", "true"); // « 2/3 » se lirait « 2 barre oblique 3 »…
      let sr = count.nextElementSibling;
      if (!sr || !sr.classList.contains("sr-only")) { sr = document.createElement("span"); sr.className = "sr-only"; count.after(sr); }
      sr.textContent = t("folder.countSr", { on, total: all.length }); // …« 2 sur 3 cochées »
      count.classList.toggle("some", on > 0);
    }
  }
  updateGoCount();
}
// Le bouton compte les onglets qui s'ouvriront : pas les agences encore à autoriser.
function updateGoCount() {
  const n = readyIds().length;
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
  if (e.target.closest && e.target.closest(".aname-input")) return; // texte glissé depuis le champ du nom
  const g = e.target.closest && (e.target.closest(".grip") || (organizing && e.target.closest("li.agency")));
  if (!g) return;
  const head = g.closest(".group-head");
  dragged = head ? head.parentElement : g.closest("li.agency");
  origin = { parent: dragged.parentElement, next: dragged.nextElementSibling };
  if (!head) list.classList.add("drag-on"); // agence : « Sans dossier » vide redevient visible, comme zone de dépôt
  e.dataTransfer.effectAllowed = "move";
  e.dataTransfer.setData("text/plain", dragged.dataset.id || dragged.dataset.folder);
  // L'image suit la souris là où on l'a saisie (pas de saut vers la case).
  const ghost = head || dragged, r = ghost.getBoundingClientRect();
  e.dataTransfer.setDragImage(ghost, Math.round(e.clientX - r.left), Math.round(e.clientY - r.top));
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
  list.classList.remove("drag-on");
  dragged = null;
  if (e.dataTransfer.dropEffect === "none") { // Échap ou lâché hors de la liste : rien ne change
    origin.next && origin.next.parentElement === origin.parent ? origin.next.before(el) : origin.parent.append(el);
    updateFolderStates();
    return;
  }
  if (wasFolder) saveFolderOrder();
  else { clearNew(el.dataset.id); saveOrder(); saveFolderMembership(); }
  updateFolderStates();
});

/* Défilement pendant un glisser : près du bas de la fenêtre, ou en remontant
   vers l'en-tête (qui reste en haut et cache le début de la liste), la liste
   défile d'elle-même, d'autant plus vite qu'on s'approche du bord, pour
   atteindre un dossier ou une place hors de l'écran. Chrome ne le fait pas
   de lui-même dans la popup. */
const DRAG_EDGE = 48;      // hauteur (px) de la zone de défilement, sous l'en-tête et en bas
const DRAG_MAX_SPEED = 16; // px par image, au bord
let dragScroll = { y: null, seen: 0, frame: 0 };
function dragScrollSpeed(y) {
  const top = masthead.getBoundingClientRect().bottom;
  if (y < top + DRAG_EDGE) return -DRAG_MAX_SPEED * Math.min(1, (top + DRAG_EDGE - y) / DRAG_EDGE);
  if (y > innerHeight - DRAG_EDGE) return DRAG_MAX_SPEED * Math.min(1, (y - (innerHeight - DRAG_EDGE)) / DRAG_EDGE);
  return 0;
}
function dragScrollStep() {
  dragScroll.frame = 0;
  // Plus d'événement depuis un moment (souris sortie de la fenêtre) : on s'arrête.
  if (!dragged || dragScroll.y === null || performance.now() - dragScroll.seen > 500) return;
  const speed = dragScrollSpeed(dragScroll.y);
  if (!speed) return;
  scrollBy(0, Math.round(speed));
  dragScroll.frame = requestAnimationFrame(dragScrollStep);
}
document.addEventListener("dragover", (e) => {
  if (!dragged) return;
  dragScroll.y = e.clientY;
  dragScroll.seen = performance.now();
  if (!dragScroll.frame && dragScrollSpeed(e.clientY)) dragScroll.frame = requestAnimationFrame(dragScrollStep);
});
document.addEventListener("dragend", () => {
  if (dragScroll.frame) cancelAnimationFrame(dragScroll.frame);
  dragScroll = { y: null, seen: 0, frame: 0 };
});

// Cases et ordre sont lus dans la liste affichée.
const boxes = () => Array.from(list.querySelectorAll("input.agency-box"));
const checkedIds = () => boxes().filter((b) => b.checked).map((b) => b.value);
// Agences cochées dont le site attend l'autorisation de Chrome (pastille « à autoriser ») :
// la recherche ne leur ouvre pas d'onglet, qui resterait sans mots-clés.
let blockedIds = new Set();
const readyIds = () => checkedIds().filter((id) => !blockedIds.has(id));

function save() {
  msg.textContent = "";
  for (const id of checkedIds()) clearNew(id); // cochée : plus besoin de la signaler
  updateFolderStates();
  chrome.storage.local.set({ [STORAGE_KEY]: [...new Set(checkedIds().concat(keptChecked))] });
  updatePermUI();
}

// Cocher une agence dont le site n'est pas encore autorisé fait apparaître
// sa pastille et le bandeau ; la décocher les retire.
let permRun = 0;
async function updatePermUI() {
  const run = ++permRun;
  const checked = new Set(checkedIds());
  const missing = await missingFillOrigins(ALL.filter((a) => checked.has(a.id)));
  if (run !== permRun) return; // une coche plus récente a déjà relancé le calcul
  renderPermBanner(missing);
  list.querySelectorAll(".perm-pill").forEach((p) => p.remove());
  if (organizing) return;
  for (const [origin, agencies] of missing) {
    for (const a of agencies) {
      const li = list.querySelector(`li.agency[data-id="${CSS.escape(a.id)}"]`);
      if (li) li.insertBefore(permPill(origin), li.querySelector(".grip"));
    }
  }
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
  // Dossiers absents de la liste (masqués en mode normal) : juste après celui
  // qui les précédait, comme les agences masquées.
  folders.forEach((f, i) => {
    if (order.includes(f)) return;
    const pos = i > 0 ? order.indexOf(folders[i - 1]) : -1;
    order.splice(pos + 1, 0, f);
  });
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
  const ids = readyIds();
  msg.classList.remove("err");
  if (!q) return input.focus();
  if (!ids.length) { msg.classList.add("err"); msg.textContent = t(checkedIds().length ? "main.allBlocked" : "main.noAgency"); return; }

  const selected = ids.map((id) => AGENCY_BY_ID.get(id)); // dans l'ordre affiché
  // Agences « à coller » : copie tout de suite, pendant le clic (aucune
  // autorisation Chrome n'est nécessaire pour une page de l'extension).
  if (selected.some(isManual)) navigator.clipboard.writeText(q).catch(() => { /* sans gravité */ });
  let urls;
  try {
    const options = await loadOptions();
    urls = await Promise.all(selected.map((a) => buildUrl(a, q, options)));
  } catch (err) {
    msg.classList.add("err");
    msg.textContent = t("main.configError", { error: err.message });
    return;
  }

  // L'ouverture des onglets est confiée au script d'arrière-plan : la popup
  // se ferme dès qu'un onglet passe au premier plan.
  chrome.storage.local.set({ [QUERY_KEY]: q });
  // Dossier de chaque agence (nom affiché, couleur) : sert aux groupes d'onglets.
  const jobs = selected.map((a, i) => {
    const job = { id: a.id, url: urls[i] };
    const idx = currentFolders.findIndex((f) => f.id === currentFolderOf[a.id]);
    if (idx >= 0) job.folder = { id: currentFolders[idx].id, name: currentFolders[idx].name, color: folderColor(currentFolders[idx], idx) };
    return job;
  });
  sweeping = true;
  try { await chrome.runtime.sendMessage({ type: "sweep", jobs, q }); }
  catch (_) { msg.classList.add("err"); msg.textContent = t("main.bgError"); return; } // ex. extension en cours de rechargement
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
  currentFolderOf = folderOf;
  // Agences d'un dossier masqué : absentes du mode normal (donc jamais cherchées),
  // grisées en mode Organiser, comme les agences masquées.
  const hiddenFolders = new Set(folders.filter((f) => f.hidden).map((f) => f.id));
  const inHiddenFolder = (a) => hiddenFolders.has(folderOf[a.id]);
  const withAgencies = new Set(ordered.map((a) => folderOf[a.id]).filter(Boolean)); // dossiers non vides
  // Mode Organiser : les agences masquées apparaissent aussi (grisées), pour les réafficher.
  const shown = organizing ? ordered : ordered.filter((a) => !ag.hidden.has(a.id) && !inHiddenFolder(a));
  // Cases cochées hors de la liste affichée (dossier masqué) : gardées pour quand on le réaffiche.
  keptChecked = organizing ? [] : data[STORAGE_KEY].filter((id) => { const a = AGENCY_BY_ID.get(id); return a && inHiddenFolder(a); });
  const missing = await missingFillOrigins(shown.filter((a) => !ag.hidden.has(a.id) && !inHiddenFolder(a) && data[STORAGE_KEY].includes(a.id)));
  // Plus aucune attente ici : vider puis reconstruire d'un seul tenant (sinon
  // deux mises à jour simultanées dupliqueraient les lignes).
  const key = focusKey();
  if (!sweeping) msg.textContent = "";
  list.textContent = "";
  render(shown, data[STORAGE_KEY], folders, folderOf, ag.hidden, missing, withAgencies);
  renderPermBanner(missing);
  restoreFocus(list, key);
  applyFresh();
  applyUndo();
  return data;
}

/* Pastille « Nouveau » : agences arrivées avec une mise à jour. Elle reste
   quelques ouvertures, et disparaît dès qu'on coche ou déplace l'agence. */
let newAgencies = new Set();
async function loadNewAgencies() {
  const { [NEW_KEY]: marks = {} } = await chrome.storage.local.get(NEW_KEY);
  newAgencies = new Set(Object.keys(marks).filter((id) => marks[id] > 0));
  if (!Object.keys(marks).length) return; // rien à décompter
  const next = {};
  for (const id of newAgencies) if (marks[id] - 1 > 0) next[id] = marks[id] - 1; // une ouverture de moins
  await chrome.storage.local.set({ [NEW_KEY]: next });
}
function clearNew(id) {
  if (!id || !newAgencies.delete(id)) return;
  list.querySelector(`li.agency[data-id="${CSS.escape(id)}"] .new-pill`)?.remove();
  chrome.storage.local.get(NEW_KEY).then(({ [NEW_KEY]: marks = {} }) => {
    delete marks[id];
    chrome.storage.local.set({ [NEW_KEY]: marks });
  });
}

langReady.then(applyNewAgencyDefaults).then(loadNewAgencies).then(refreshList).then((data) => {
  // Derniers mots-clés, sélectionnés : on tape pour les remplacer.
  if (data[QUERY_KEY] && !input.value) { input.value = data[QUERY_KEY]; input.select(); }
  // Popup fermée pendant le délai d'annulation d'une suppression : les
  // autorisations devenues inutiles sont libérées à l'ouverture suivante.
  releaseUnusedOrigins().catch(() => {});
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

// Version en cours, dans le pied de page (avant le lien vers le code source).
function renderVersion() {
  const el = document.getElementById("appVersion");
  if (el) el.textContent = t("footer.version", { v: chrome.runtime.getManifest().version });
}
