"use strict";

const fields = document.getElementById("fields");
const status = document.getElementById("status");

function render(values) {
  for (const o of OPTIONS) {
    const div = document.createElement("div");
    div.className = "field";
    const label = document.createElement("label");
    label.htmlFor = "opt-" + o.id;
    label.textContent = o.label;
    const input = document.createElement("input");
    input.id = "opt-" + o.id;
    input.name = o.id;
    input.autocomplete = "off";
    input.spellcheck = false;
    input.value = values[o.id] ?? o.default;
    input.placeholder = o.default || "(vide)";
    input.pattern = o.pattern.replace(/^\^|\$$/g, ""); // l'attribut HTML ajoute ^…$ lui-même
    const help = document.createElement("p");
    help.className = "help";
    help.textContent = o.help;
    div.append(label, input, help);
    fields.append(div);
  }
}

document.getElementById("form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const values = {};
  for (const o of OPTIONS) {
    const v = document.getElementById("opt-" + o.id).value.trim();
    if (v !== "" && !new RegExp(o.pattern).test(v)) {
      status.textContent = `Valeur invalide pour « ${o.label} ».`;
      return;
    }
    values[o.id] = v;
  }
  await chrome.storage.local.set({ [OPTIONS_KEY]: values });
  status.textContent = "Enregistré.";
  setTimeout(() => (status.textContent = ""), 2500);
});

loadOptions().then(render);
