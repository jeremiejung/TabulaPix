"use strict";
/*
 * Ouvre en arrière-plan les onglets demandés par la popup (ou réutilise
 * l'onglet de l'agence s'il est déjà ouvert) et, pour les agences « fill »,
 * tape les mots-clés dans le champ de recherche une fois la page chargée.
 * Aucune requête réseau : seulement chrome.tabs et chrome.scripting.
 * Les recherches en attente sont gardées en mémoire de session (effacée
 * à la fermeture de Chrome), au cas où Chrome mettrait ce script en veille.
 */

importScripts("config.js"); // AGENCIES : seule source des sites et des champs

const PENDING = "pendingFills";
const AGENCY_BY_ID = new Map(AGENCIES.map((a) => [a.id, a]));

// Nom de domaine d'une agence, d'après config.js (marqueurs neutralisés).
function agencyHost(agency) {
  try { return new URL(agency.url.replace(/\{(q|payload)\}/g, "x")).hostname; }
  catch (_) { return null; }
}
const MAX_ATTEMPTS = 5; // ex. page de connexion ou d'erreur avant la vraie page

async function getPending() {
  return (await chrome.storage.session.get({ [PENDING]: {} }))[PENDING];
}
async function setPending(p) {
  await chrome.storage.session.set({ [PENDING]: p });
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  // N'accepte que la popup / le panneau de l'extension (pas une page web, pas une autre extension).
  if (sender.id !== chrome.runtime.id || sender.url !== chrome.runtime.getURL("popup.html")) return;
  if (!msg || msg.type !== "sweep" || !Array.isArray(msg.jobs) || typeof msg.q !== "string") return;
  sweep(validJobs(msg.jobs), msg.q);
  sendResponse({ ok: true }); // la popup peut se fermer : l'ouverture continue ici
});

// Ne garde que les recherches qui pointent, en https, vers le site déclaré
// dans config.js pour cette agence.
function validJobs(jobs) {
  const out = [];
  for (const job of jobs) {
    const agency = job && AGENCY_BY_ID.get(job.id);
    if (!agency) continue;
    let u;
    try { u = new URL(job.url); } catch (_) { continue; }
    const host = agencyHost(agency);
    if (u.protocol !== "https:" || !host || u.hostname !== host) continue;
    out.push({ id: agency.id, url: job.url, host, fill: agency.fill || null });
  }
  return out;
}

async function sweep(jobs, q) {
  const existing = await chrome.tabs.query({ windowType: "normal" });

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
    const tab = reuse[i]
      ? await chrome.tabs.update(reuse[i].id, { url: job.url })
      : await chrome.tabs.create({ url: job.url, active: false });
    if (job.fill) {
      // Enregistré tout de suite, avant que la page ait fini de charger.
      const current = await getPending();
      current[tab.id] = { q, id: job.id, host: job.host, attempts: 0 };
      await setPending(current);
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
  const pending = await getPending();
  const job = pending[tabId];
  if (!job) return;
  // Retiré avant l'injection : le clic sur « Rechercher » recharge la page.
  delete pending[tabId];
  await setPending(pending);

  // On ne tape que si l'onglet est bien sur le site de l'agence (sinon :
  // page de connexion, page d'erreur… on réessaiera au prochain chargement).
  let host = null;
  try { host = new URL(tab.url).hostname; } catch (_) { /* adresse illisible */ }
  const fill = AGENCY_BY_ID.get(job.id)?.fill;
  if (!fill) return;

  let ok = false;
  if (host === job.host) {
    try {
      const [res] = await chrome.scripting.executeScript({
        target: { tabId },
        func: fillAndSubmit,
        args: [job.q, fill]
      });
      ok = res && res.result === true;
    } catch (_) { /* page non autorisée ou fermée */ }
  }

  if (!ok && job.attempts + 1 < MAX_ATTEMPTS) {
    const again = await getPending();
    again[tabId] = { ...job, attempts: job.attempts + 1 };
    await setPending(again);
  }
});

chrome.tabs.onRemoved.addListener(async (tabId) => {
  const pending = await getPending();
  if (pending[tabId]) { delete pending[tabId]; await setPending(pending); }
});

// Exécutée DANS la page de l'agence.
async function fillAndSubmit(q, fill) {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const deadline = Date.now() + 15000; // les sites « applications » s'affichent après coup
  let input;
  while (!(input = document.querySelector(fill.input))) {
    if (Date.now() > deadline) return false;
    await sleep(250);
  }
  // Laisse au site le temps de finir de s'initialiser (ex. Bloomberg).
  const delay = Number.isFinite(fill.delay) ? fill.delay : 300;
  await sleep(delay);
  input = document.querySelector(fill.input) || input; // le champ a pu être recréé
  input.focus();
  // Passe par le « setter » natif pour que React & co voient la saisie.
  const proto = input instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(proto, "value").set.call(input, q);
  input.dispatchEvent(new Event("input", { bubbles: true }));
  input.dispatchEvent(new Event("change", { bubbles: true }));
  await sleep(delay);

  const button = fill.submit && document.querySelector(fill.submit);
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
