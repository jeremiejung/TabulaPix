"use strict";
/*
 * Ouvre les onglets demandés par la popup et, pour les agences « fill »,
 * tape les mots-clés dans le champ de recherche une fois la page chargée.
 * Aucune requête réseau : seulement chrome.tabs et chrome.scripting.
 * Les recherches en attente sont gardées en mémoire de session (effacée
 * à la fermeture de Chrome), au cas où Chrome mettrait ce script en veille.
 */

const PENDING = "pendingFills";
const MAX_ATTEMPTS = 3; // ex. page de connexion avant la vraie page

async function getPending() {
  return (await chrome.storage.session.get({ [PENDING]: {} }))[PENDING];
}
async function setPending(p) {
  await chrome.storage.session.set({ [PENDING]: p });
}

chrome.runtime.onMessage.addListener((msg) => {
  if (msg && msg.type === "sweep") sweep(msg.jobs, msg.q);
});

async function sweep(jobs, q) {
  const pending = await getPending();
  const tabs = [];
  for (const job of jobs) {
    const tab = await chrome.tabs.create({ url: job.url, active: false });
    if (job.fill) pending[tab.id] = { q, fill: job.fill, attempts: 0 };
    tabs.push(tab);
  }
  await setPending(pending);
  if (tabs.length) chrome.tabs.update(tabs[0].id, { active: true });
}

chrome.tabs.onUpdated.addListener(async (tabId, info) => {
  if (info.status !== "complete") return;
  const pending = await getPending();
  const job = pending[tabId];
  if (!job) return;
  // Retiré avant l'injection : le clic sur « Rechercher » recharge la page.
  delete pending[tabId];
  await setPending(pending);

  let ok = false;
  try {
    const [res] = await chrome.scripting.executeScript({
      target: { tabId },
      func: fillAndSubmit,
      args: [job.q, job.fill]
    });
    ok = res && res.result === true;
  } catch (_) { /* page non autorisée ou fermée */ }

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
  input.focus();
  // Passe par le « setter » natif pour que React & co voient la saisie.
  const proto = input instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(proto, "value").set.call(input, q);
  input.dispatchEvent(new Event("input", { bubbles: true }));
  input.dispatchEvent(new Event("change", { bubbles: true }));
  await sleep(300);

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
