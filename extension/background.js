"use strict";
/*
 * Ouvre en arrière-plan les onglets demandés par la popup (ou réutilise
 * l'onglet de l'agence s'il est déjà ouvert) et, pour les agences « fill »,
 * tape les mots-clés dans le champ de recherche une fois la page chargée.
 * Aucune requête réseau : seulement chrome.tabs et chrome.scripting.
 * Les recherches en attente sont gardées en mémoire de session (effacée
 * à la fermeture de Chrome), au cas où Chrome mettrait ce script en veille.
 */

importScripts("config.js", "i18n.js", "shared.js"); // AGENCIES/OPTIONS : seule source des sites et des champs

// Langue des messages : celle choisie dans les réglages (ou du navigateur).
loadLang();
chrome.storage.onChanged.addListener((changes, area) => { if (area === "local" && changes[LANG_KEY]) loadLang(); });

const PENDING = "pendingFills";
const AGENCY_BY_ID = new Map(AGENCIES.map((a) => [a.id, a]));

// Nom de domaine d'une agence, d'après son adresse effective et les options.
const agencyHost = (agency, options) => hostOf(agency.url, options);
const MAX_ATTEMPTS = 5; // ex. page de connexion ou d'erreur avant la vraie page

async function getPending() {
  return (await chrome.storage.session.get({ [PENDING]: {} }))[PENDING];
}
async function setPending(p) {
  await chrome.storage.session.set({ [PENDING]: p });
}
// Les modifications des recherches en attente passent une par une : plusieurs
// onglets qui finissent de charger en même temps ne s'écrasent plus.
let pendingLock = Promise.resolve();
function updatePending(change) {
  const run = pendingLock.then(async () => {
    const pending = await getPending();
    const result = await change(pending);
    await setPending(pending);
    return result;
  });
  pendingLock = run.catch(() => {});
  return run;
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (sender.id !== chrome.runtime.id || !msg) return;
  // (LANG est tenu à jour par loadLang() au démarrage et à chaque changement.)

  // Messages de la popup / du panneau de l'extension.
  // (L'adresse peut porter un #, ex. popup.html#import ouverte dans un onglet.)
  if (String(sender.url || "").split(/[?#]/)[0] === chrome.runtime.getURL("popup.html")) {
    if (msg.type === "sweep" && Array.isArray(msg.jobs) && typeof msg.q === "string") {
      loadOptions()
        .then((options) => loadAgencies(options).then((agencies) => sweep(validJobs(msg.jobs, options, agencies.all), msg.q)))
        .catch(() => { /* onglet fermé, Chrome occupé… : rien à faire de plus */ });
      sendResponse({ ok: true }); // la popup peut se fermer : l'ouverture continue ici
    } else if (msg.type === "pick") {
      startPick(msg.draft).then(sendResponse);
      return true;
    } else if (msg.type === "try") {
      tryAgency(msg).then(sendResponse);
      return true;
    } else if (msg.type === "panelOpened") {
      syncActionWithPanel().then(() => sendResponse({ ok: true }), () => sendResponse({ ok: false }));
      return true;
    }
    return;
  }

  // Messages du bandeau de repérage, depuis l'onglet du site.
  if (sender.tab && (msg.type === "picked" || msg.type === "pickCancel")) {
    handlePicked(sender, msg).then(sendResponse);
    return true;
  }
});

/* Colonne latérale ouverte : un clic sur l'icône de l'extension agit sur la
   colonne (Chrome l'ouvre ou la ferme) au lieu d'ouvrir une popup par-dessus.
   Colonne fermée partout : la popup revient. */
async function syncActionWithPanel() {
  let open;
  try { open = (await chrome.runtime.getContexts({ contextTypes: ["SIDE_PANEL"] })).length > 0; }
  catch (_) { return; } // Chrome trop ancien : comportement par défaut
  await chrome.action.setPopup({ popup: open ? "" : "popup.html" });
  try { await chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: open }); } catch (_) { /* sans colonne */ }
}
// Quand revérifier : ouverture signalée par la colonne, ouverture et
// fermeture de la colonne (Chrome récent), changement d'onglet ou de fenêtre
// (Chrome plus ancien : la fermeture se remarque au plus tard là), démarrage.
if (chrome.sidePanel && chrome.sidePanel.onOpened) chrome.sidePanel.onOpened.addListener(() => syncActionWithPanel());
if (chrome.sidePanel && chrome.sidePanel.onClosed) chrome.sidePanel.onClosed.addListener(() => setTimeout(syncActionWithPanel, 100));
chrome.tabs.onActivated.addListener(() => syncActionWithPanel());
chrome.windows.onFocusChanged.addListener(() => syncActionWithPanel());
syncActionWithPanel();

// Ne garde que les recherches qui pointent, en https, vers le site déclaré
// pour cette agence (config.js ou agence ajoutée par l'utilisateur).
function validJobs(jobs, options, agencies) {
  const byId = new Map(agencies.map((a) => [a.id, a]));
  const out = [];
  for (const job of jobs) {
    const agency = job && byId.get(job.id);
    if (!agency) continue;
    let u;
    try { u = new URL(job.url); } catch (_) { continue; }
    const host = agencyHost(agency, options);
    if (u.protocol !== "https:" || !host || u.hostname !== host) continue;
    out.push({ id: agency.id, url: job.url, host, fill: agency.fill || null });
  }
  return out;
}

async function sweep(jobs, q) {
  // L'onglet d'un repérage en cours n'est jamais réutilisé.
  const { [PICK_KEY]: pick } = await chrome.storage.session.get(PICK_KEY);
  const existing = (await chrome.tabs.query({ windowType: "normal" })).filter((tab) => !pick || tab.id !== pick.tabId);

  // Onglet à réutiliser pour chaque agence : d'abord ceux qui sont sur la
  // même page (même site + même chemin), puis ceux qui sont juste sur le
  // même site. Un onglet ne sert qu'à une seule agence (ex. Getty Creative
  // et Getty Actu partagent le même site).
  const claimed = new Set();
  const reuse = new Array(jobs.length).fill(null);
  for (const minScore of [2, 1]) {
    jobs.forEach((job, i) => {
      if (reuse[i]) return;
      const t = findTab(existing, job.url, claimed, minScore);
      if (t) { reuse[i] = t; claimed.add(t.id); }
    });
  }

  // Les onglets s'ouvrent en arrière-plan : l'utilisateur reste sur son onglet.
  for (const [i, job] of jobs.entries()) {
    let tab;
    try {
      tab = reuse[i]
        ? await chrome.tabs.update(reuse[i].id, { url: job.url })
        : await chrome.tabs.create({ url: job.url, active: false });
    } catch (_) {
      // Onglet fermé entre-temps : on en ouvre un nouveau, sans bloquer les autres agences.
      try { tab = await chrome.tabs.create({ url: job.url, active: false }); } catch (_) { continue; }
    }
    if (job.fill) {
      // Enregistré tout de suite, avant que la page ait fini de charger.
      await updatePending((pending) => { pending[tab.id] = { q, id: job.id, host: job.host, fill: job.fill, attempts: 0 }; });
    }
  }
}

// Score 2 : même site et même chemin ; 1 : même site ; 0 : autre site.
function matchScore(tabUrl, target) {
  let u;
  try { u = new URL(tabUrl); } catch (_) { return 0; }
  if (u.hostname !== target.hostname) return 0;
  return u.pathname === target.pathname ? 2 : 1;
}

function findTab(tabs, url, claimed, minScore) {
  let target;
  try { target = new URL(url); } catch (_) { return null; }
  return tabs.find((t) => !claimed.has(t.id) && t.url && matchScore(t.url, target) >= minScore) || null;
}

chrome.tabs.onUpdated.addListener(async (tabId, info, tab) => {
  if (info.status !== "complete") return;
  injectPickerIfNeeded(tabId, tab);
  let host = null;
  try { host = new URL(tab.url).hostname; } catch (_) { /* adresse illisible */ }

  // On ne tape que si l'onglet est sur le site de l'agence. Sinon (page de
  // connexion, page d'erreur…), la recherche reste en attente du prochain
  // chargement. Sur le bon site, elle est retirée avant de taper : le clic
  // sur « Rechercher » recharge la page.
  const job = await updatePending((pending) => {
    const j = pending[tabId];
    if (!j) return null;
    if (host !== j.host) {
      if (j.attempts + 1 < MAX_ATTEMPTS) pending[tabId] = { ...j, attempts: j.attempts + 1 };
      else delete pending[tabId];
      return null;
    }
    delete pending[tabId];
    return j;
  });
  if (!job) return;

  const fill = cleanFill(job.fill); // repères effectifs de l'agence, relevés au lancement
  if (!fill) return;

  let ok = false;
  try {
    const [res] = await chrome.scripting.executeScript({
      target: { tabId },
      func: fillAndSubmit,
      args: [job.q, fill]
    });
    ok = res && res.result === true;
  } catch (_) { /* page non autorisée ou fermée */ }

  if (!ok && job.attempts + 1 < MAX_ATTEMPTS) {
    await updatePending((pending) => { if (!pending[tabId]) pending[tabId] = { ...job, attempts: job.attempts + 1 }; });
  }
});

chrome.tabs.onRemoved.addListener(async (tabId) => {
  updatePending((pending) => { delete pending[tabId]; });
  // Repérage abandonné (onglet fermé) : on l'oublie.
  const { pickSession } = await chrome.storage.session.get("pickSession");
  if (pickSession && pickSession.tabId === tabId) chrome.storage.session.remove(["pickSession", "fillDraft"]);
});

/* ---------- Repérage du champ et du bouton d'un site ---------- */
/*
 * La popup enregistre un brouillon (nom, adresse), demande l'autorisation
 * Chrome pour ce site, puis demande le repérage. Si la popup s'est fermée
 * pendant la demande d'autorisation, l'ajout de l'autorisation déclenche le
 * repérage à sa place (chrome.permissions.onAdded).
 */
const DRAFT_KEY = "fillDraft";
const PICK_KEY = "pickSession";

function cleanDraft(d, options) {
  // Agence fournie : repérage sur la page donnée, comme pour une agence
  // ajoutée (son site peut avoir changé d'adresse ou de fonctionnement).
  const builtin = d && AGENCY_BY_ID.get(d.id);
  if (builtin) {
    let u;
    try { u = new URL(String(d.url)); } catch (_) { return null; }
    const host = u.hostname;
    if (u.protocol !== "https:" || !host) return null;
    const name = String(d.name || "").trim();
    return { id: builtin.id, name: name && name.length <= 40 ? name : builtin.name, url: u.href, host };
  }
  const agency = cleanCustomAgency({ ...(d || {}), fill: { input: "x" } });
  if (!agency) return null;
  const host = hostOf(agency.url, {});
  return host ? { id: agency.id, name: agency.name, url: agency.url, host } : null;
}

async function startPick(rawDraft) {
  const draft = cleanDraft(rawDraft, await loadOptions());
  if (!draft) return { ok: false, error: t("bg.invalidAgency") };
  if (!(await chrome.permissions.contains({ origins: [originPattern(draft.host)] }))) {
    return { ok: false, error: t("bg.permRefused") };
  }
  const { [PICK_KEY]: current } = await chrome.storage.session.get(PICK_KEY);
  if (current && current.draft.id === draft.id) {
    try { await chrome.tabs.get(current.tabId); return { ok: true }; } catch (_) { /* onglet fermé : on recommence */ }
  }
  const tab = await chrome.tabs.create({ url: draft.url, active: true });
  await chrome.storage.session.set({ [PICK_KEY]: { tabId: tab.id, draft } });
  return { ok: true };
}

chrome.permissions.onAdded.addListener(async (perms) => {
  const { [DRAFT_KEY]: draft } = await chrome.storage.session.get(DRAFT_KEY);
  const clean = cleanDraft(draft, await loadOptions());
  if (clean && (perms.origins || []).includes(originPattern(clean.host))) startPick(clean);
});

async function injectPickerIfNeeded(tabId, tab) {
  const { [PICK_KEY]: pick } = await chrome.storage.session.get(PICK_KEY);
  if (!pick || pick.tabId !== tabId) return;
  let host = null;
  try { host = new URL(tab.url).hostname; } catch (_) { return; }
  if (host !== pick.draft.host) return; // page de connexion… : on attend le retour sur le site
  try {
    await loadLang();
    const texts = Object.fromEntries(["pick.step1", "pick.step2", "pick.notField", "pick.noButton", "pick.cancel", "pick.close", "pick.move", "pick.failed"].map((k) => [k, t(k)]));
    texts["pick.done"] = t("pick.done", { name: pick.draft.name });
    await chrome.scripting.executeScript({ target: { tabId }, func: pickerUI, args: [pick.draft.name, texts] });
  } catch (_) { /* autorisation retirée ou onglet fermé */ }
}

async function handlePicked(sender, msg) {
  const { [PICK_KEY]: pick } = await chrome.storage.session.get(PICK_KEY);
  if (!pick || pick.tabId !== sender.tab.id) return { ok: false, error: t("bg.pickExpired") };
  let host = null;
  try { host = new URL(sender.url).hostname; } catch (_) { /* rien */ }
  if (host !== pick.draft.host) return { ok: false, error: t("bg.wrongSite") };
  if (msg.type === "pickCancel") {
    await chrome.storage.session.remove([PICK_KEY, DRAFT_KEY]);
    return { ok: true };
  }
  const fill = cleanFill({ input: msg.input, submit: msg.submit });
  if (!fill) return { ok: false, error: t("bg.pickInvalid") };
  // Le résultat va dans le brouillon : l'agence n'est ajoutée qu'une fois
  // vérifiée par l'utilisateur dans TabulaPix.
  await chrome.storage.session.set({ pickResult: { draftId: pick.draft.id, ...fill } });
  await chrome.storage.session.remove([PICK_KEY, DRAFT_KEY]);
  // Rouvre TabulaPix sur l'étape « vérifier », sauf s'il est déjà ouvert dans
  // cette fenêtre (colonne latérale ou popup) : il s'y met à jour tout seul.
  let alreadyOpen = false;
  try {
    const open = await chrome.runtime.getContexts({ contextTypes: ["SIDE_PANEL", "POPUP"] });
    // Fenêtre non précisée par Chrome (-1) : elle ne compte que s'il n'y a qu'une fenêtre.
    const single = (await chrome.windows.getAll({ windowTypes: ["normal"] })).length === 1;
    alreadyOpen = open.some((c) => c.windowId === sender.tab.windowId || (c.windowId === -1 && single));
  } catch (_) { /* Chrome trop ancien : on tente l'ouverture */ }
  if (!alreadyOpen) {
    try { await chrome.action.openPopup({ windowId: sender.tab.windowId }); } catch (_) { /* l'utilisateur la rouvrira */ }
  }
  return { ok: true, name: pick.draft.name };
}

/* Essai : une recherche avec les réglages en cours de saisie (agence pas encore
   enregistrée). Mêmes contrôles que pour une vraie recherche. */
async function tryAgency(msg) {
  const q = typeof msg.q === "string" ? msg.q.trim().slice(0, 200) : "";
  let u;
  try { u = new URL(msg.url); } catch (_) { return { ok: false, error: t("bg.badUrl") }; }
  if (!q || u.protocol !== "https:") return { ok: false, error: t("bg.https") };
  // Repères en cours de modification (agence fournie ou ajoutée, même règle) ;
  // le délai propre au site d'une agence fournie est gardé sur ce même site.
  let fill = null;
  if (msg.fill) {
    fill = cleanFill(msg.fill);
    if (!fill) return { ok: false, error: t("bg.pickInvalidShort") };
    delete fill.delay;
    const builtin = msg.builtinId ? AGENCY_BY_ID.get(msg.builtinId) : null;
    if (msg.builtinId && !builtin) return { ok: false, error: t("bg.unknownAgency") };
    if (builtin && builtin.fill && builtin.fill.delay !== undefined && u.hostname === hostOf(builtin.url, await loadOptions())) {
      fill.delay = builtin.fill.delay;
    }
    if (!(await chrome.permissions.contains({ origins: [originPattern(u.hostname)] }))) {
      return { ok: false, error: t("bg.permMissing") };
    }
  }
  await sweep([{ id: "essai", url: u.href, host: u.hostname, fill }], q);
  return { ok: true };
}

// Exécutée DANS la page du site : bandeau qui guide le repérage.
function pickerUI(agencyName, T) {
  if (window.__tabulaPixPicker) return;
  window.__tabulaPixPicker = true;

  const host = document.createElement("div");
  host.style.cssText = "all:initial;position:fixed;inset:0;z-index:2147483647;pointer-events:none;";
  const root = host.attachShadow({ mode: "closed" });
  root.innerHTML = `<style>
    .panel{pointer-events:auto;position:fixed;top:12px;left:50%;transform:translateX(-50%);max-width:520px;
      background:#111;color:#fff;font:14px/1.4 system-ui,sans-serif;padding:12px 16px;border-radius:9px;
      border:2px solid #fff;cursor:grab;touch-action:none;user-select:none;
      box-shadow:inset 0 3px 0 #D7141A,0 0 0 1px rgba(0,0,0,.55),0 6px 20px rgba(0,0,0,.4)}
    .panel.dragging{cursor:grabbing}
    .t{font-weight:700;margin-bottom:4px}.t::before{content:"";display:inline-block;width:8px;height:8px;margin-right:7px;border-radius:50%;background:#D7141A;vertical-align:1px}.msg{margin:2px 0 8px}.err{color:#ff8a80}
    button{font:600 13px system-ui,sans-serif;margin-right:6px;padding:4px 10px;border-radius:4px;border:0;cursor:pointer}
    .alt{background:#444;color:#fff}.ok{background:#D7141A;color:#fff}
    .panel.bottom{top:auto;bottom:12px}
    .box{position:fixed;border:3px solid #D7141A;background:rgba(215,20,26,.12);border-radius:3px;display:none}
  </style>
  <div class="box"></div>
  <div class="panel"><div class="t"></div><div class="msg"></div><div class="actions"></div></div>`;
  document.documentElement.append(host);
  const $ = (s) => root.querySelector(s);
  const box = $(".box");

  // Le bandeau se déplace aussi en le faisant glisser (ailleurs que sur ses boutons).
  const panel = $(".panel");
  const resetPosition = () => { panel.style.left = panel.style.top = panel.style.bottom = panel.style.transform = ""; };
  panel.addEventListener("pointerdown", (e) => {
    if (e.button !== 0 || e.target.closest("button")) return;
    const r = panel.getBoundingClientRect();
    const dx = e.clientX - r.left, dy = e.clientY - r.top;
    panel.setPointerCapture(e.pointerId);
    panel.classList.add("dragging");
    const move = (ev) => {
      const x = Math.min(Math.max(0, ev.clientX - dx), innerWidth - r.width);
      const y = Math.min(Math.max(0, ev.clientY - dy), innerHeight - r.height);
      Object.assign(panel.style, { left: x + "px", top: y + "px", bottom: "auto", transform: "none" });
    };
    const up = () => {
      panel.classList.remove("dragging");
      panel.removeEventListener("pointermove", move);
      panel.removeEventListener("pointerup", up);
      panel.removeEventListener("pointercancel", up);
    };
    panel.addEventListener("pointermove", move);
    panel.addEventListener("pointerup", up);
    panel.addEventListener("pointercancel", up);
    e.preventDefault();
  });

  let step = "input";
  let picked = { input: "", submit: "" };

  const isField = (el) => el && (el.matches("input:not([type=hidden]):not([type=checkbox]):not([type=radio]):not([type=submit]):not([type=button]), textarea"));
  const asButton = (el) => el.closest("button, input[type=submit], input[type=button], input[type=image], a, [role=button]") || el;

  // Valeur « stable » : sans code généré (ex. « __bfac60392382 », « 63149406… »)
  // qui changerait au prochain chargement de la page.
  const unstableToken = (t) => /\d{4,}/.test(t)
    || (t.length >= 6 && /^[0-9a-f]+$/i.test(t) && /\d/.test(t) && /[a-f]/i.test(t))
    || (t.length >= 12 && /\d/.test(t) && /[a-z]/i.test(t));
  const stable = (v) => Boolean(v) && v.length <= 200 && !String(v).split(/[^A-Za-z0-9]+/).some(unstableToken);
  const stablePrefix = (v) => {
    let out = "";
    for (const part of String(v).match(/[A-Za-z0-9]+|[^A-Za-z0-9]+/g) || []) {
      if (/^[A-Za-z0-9]+$/.test(part) && unstableToken(part)) break;
      out += part;
    }
    return out;
  };
  const quote = (v) => `"${String(v).replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;

  // Sélecteur CSS qui retrouvera l'élément aux prochains chargements :
  // uniquement des valeurs stables ; s'il en désigne plusieurs (formulaires
  // identiques), la recherche prendra le premier visible.
  function selectorFor(el) {
    const tag = el.tagName.toLowerCase();
    const count = (sel) => { try { return el.matches(sel) ? document.querySelectorAll(sel).length : 0; } catch (_) { return 0; } };
    const parts = []; // morceaux combinables : [attr="…"], .classe
    if (stable(el.id)) parts.push("#" + CSS.escape(el.id));
    for (const attr of ["name", "aria-label", "placeholder", "data-testid", "title", "type", "role", "value"]) {
      const v = el.getAttribute(attr);
      if (v && stable(v) && !(attr === "value" && !/^(submit|button)$/i.test(el.type || ""))) parts.push(`[${attr}=${quote(v)}]`);
    }
    for (const c of [...el.classList].filter(stable).slice(0, 4)) parts.push("." + CSS.escape(c));
    if (el.id && !stable(el.id) && stablePrefix(el.id).length >= 3) parts.push(`[id^=${quote(stablePrefix(el.id))}]`);

    const candidates = [];
    parts.forEach((a, i) => {
      candidates.push(a.startsWith("#") ? a : tag + a);
      parts.slice(i + 1).forEach((b) => { if (!a.startsWith("#") && !b.startsWith("#")) candidates.push(tag + a + b); });
    });
    // Dans un formulaire ou une zone de recherche repérable : on le précise.
    const scope = el.closest("form[role=search], [role=search], form");
    if (scope && scope !== el) {
      const sTag = scope.tagName.toLowerCase();
      const sParts = [...scope.classList].filter(stable).slice(0, 2).map((c) => "." + CSS.escape(c));
      if (scope.getAttribute("role")) sParts.unshift(`[role=${quote(scope.getAttribute("role"))}]`);
      if (stable(scope.id)) sParts.unshift("#" + CSS.escape(scope.id));
      if (sParts.length) candidates.slice().forEach((c) => candidates.push(`${sTag}${sParts[0]} ${c}`));
    }
    const scored = candidates.map((sel) => ({ sel, n: count(sel) })).filter((c) => c.n > 0)
      .sort((a, b) => a.n - b.n || a.sel.length - b.sel.length);
    if (scored.length) return scored[0].sel;

    // Dernier recours : chemin dans la page, sans identifiants générés.
    const path = [];
    for (let cur = el; cur && cur.nodeType === 1 && cur !== document.documentElement; cur = cur.parentElement) {
      if (cur !== el && stable(cur.id)) { path.unshift("#" + CSS.escape(cur.id)); break; }
      let part = cur.tagName.toLowerCase();
      const same = cur.parentElement ? [...cur.parentElement.children].filter((c) => c.tagName === cur.tagName) : [];
      if (same.length > 1) part += `:nth-of-type(${same.indexOf(cur) + 1})`;
      path.unshift(part);
      if (count(path.join(" > ")) === 1) break;
    }
    return path.join(" > ");
  }

  function render(message, isError) {
    $(".t").textContent = `TabulaPix — ${agencyName}`;
    const m = $(".msg");
    m.className = "msg" + (isError ? " err" : "");
    const actions = $(".actions");
    actions.textContent = "";
    const btn = (label, cls, fn, title) => { const b = document.createElement("button"); b.className = cls; b.textContent = label; if (title) b.title = title; b.addEventListener("click", fn); actions.append(b); };
    const moveBtn = () => btn("⇅", "alt", () => { resetPosition(); $(".panel").classList.toggle("bottom"); }, T["pick.move"]);
    if (step === "input") {
      m.textContent = message || T["pick.step1"];
      btn(T["pick.cancel"], "alt", cancel);
      moveBtn();
    } else if (step === "submit") {
      m.textContent = message || T["pick.step2"];
      btn(T["pick.noButton"], "alt", () => finish(""));
      btn(T["pick.cancel"], "alt", cancel);
      moveBtn();
    } else {
      m.textContent = message;
      btn(T["pick.close"], "ok", stop);
    }
  }

  function highlight(el) {
    if (!el) { box.style.display = "none"; return; }
    const r = el.getBoundingClientRect();
    Object.assign(box.style, { display: "block", left: r.left - 3 + "px", top: r.top - 3 + "px", width: r.width + "px", height: r.height + "px" });
  }

  const inPanel = (e) => e.composedPath().includes(host);
  const target = (e) => (step === "input" ? (isField(e.target) ? e.target : null) : asButton(e.target));

  function onMove(e) { if (step === "done" || inPanel(e)) return; highlight(target(e)); }
  function block(e) {
    if (step === "done" || inPanel(e)) return;
    e.preventDefault(); e.stopImmediatePropagation();
  }
  function onClick(e) {
    if (step === "done" || inPanel(e)) return;
    e.preventDefault(); e.stopImmediatePropagation();
    if (step === "input") {
      if (!isField(e.target)) return render(T["pick.notField"], true);
      picked.input = selectorFor(e.target);
      step = "submit";
      highlight(null);
      render();
    } else if (step === "submit") {
      finish(selectorFor(asButton(e.target)));
    }
  }

  const events = [["mousemove", onMove], ["click", onClick], ["mousedown", block], ["mouseup", block], ["pointerdown", block], ["pointerup", block], ["submit", block]];
  events.forEach(([t, fn]) => document.addEventListener(t, fn, true));

  function stop() {
    events.forEach(([t, fn]) => document.removeEventListener(t, fn, true));
    host.remove();
    window.__tabulaPixPicker = false;
  }

  async function finish(submitSelector) {
    picked.submit = submitSelector;
    step = "done";
    highlight(null);
    events.forEach(([t, fn]) => document.removeEventListener(t, fn, true));
    let res;
    try { res = await chrome.runtime.sendMessage({ type: "picked", ...picked }); } catch (_) { res = null; }
    render(res && res.ok
      ? T["pick.done"]
      : "✗ " + ((res && res.error) || T["pick.failed"]), !(res && res.ok));
  }

  async function cancel() {
    try { await chrome.runtime.sendMessage({ type: "pickCancel" }); } catch (_) { /* rien */ }
    stop();
  }

  render();
}

// Exécutée DANS la page de l'agence.
async function fillAndSubmit(q, fill) {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const all = (sel, root = document) => { try { return [...root.querySelectorAll(sel)]; } catch (_) { return []; } };
  const visible = (el) => el.getClientRects().length > 0 && getComputedStyle(el).visibility !== "hidden";
  // Premier élément visible (un site peut avoir plusieurs formulaires identiques).
  const find = (sel) => { const list = all(sel); return list.find(visible) || list[0] || null; };
  // Bouton le plus proche du champ : dans son formulaire, sinon en remontant.
  const nearest = (sel, from) => {
    for (let node = from.parentElement; node; node = node.parentElement) {
      const list = all(sel, node);
      if (list.length) return list.find(visible) || list[0];
    }
    return null;
  };
  const deadline = Date.now() + 15000; // les sites « applications » s'affichent après coup
  let input;
  while (!(input = find(fill.input))) {
    if (Date.now() > deadline) return false;
    await sleep(250);
  }
  // Laisse au site le temps de finir de s'initialiser (ex. Bloomberg).
  const delay = Number.isFinite(fill.delay) ? fill.delay : 300;
  await sleep(delay);
  input = find(fill.input) || input; // le champ a pu être recréé
  if (!(input instanceof HTMLInputElement || input instanceof HTMLTextAreaElement)) return false;
  input.focus();
  // Passe par le « setter » natif pour que React & co voient la saisie.
  const proto = input instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(proto, "value").set.call(input, q);
  input.dispatchEvent(new Event("input", { bubbles: true }));
  input.dispatchEvent(new Event("change", { bubbles: true }));
  await sleep(delay);

  const button = fill.submit && nearest(fill.submit, input);
  if (button) {
    button.click();
  } else if (input.form) {
    input.form.requestSubmit();
  } else {
    for (const type of ["keydown", "keypress", "keyup"]) {
      input.dispatchEvent(new KeyboardEvent(type, { key: "Enter", code: "Enter", keyCode: 13, which: 13, bubbles: true }));
    }
  }
  return true;
}
