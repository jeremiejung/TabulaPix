/* tabulapix.com — démonstration : une recherche, un onglet par agence.
   Tout se passe dans la page : aucune recherche n'est envoyée nulle part. */
(function () {
  "use strict";
  var lang = document.documentElement.lang === "en" ? "en" : "fr";
  var T = {
    fr: {
      empty: "estonie frontière",
      sep: " : ",
      opened: function (n) { return n + " onglets ouverts en arrière-plan"; },
      // Un onglet par agence cochée, à la couleur de son dossier (comme dans la popup)
      tabs: [["Actualité", "--c-blue"], ["Actualité", "--c-blue"], ["Actualité", "--c-blue"], ["Reportage & auteurs", "--c-green"], ["Agrégateurs", "--c-amber"], ["People", "--c-pink"], ["Stock", "--c-violet"]]
    },
    en: {
      empty: "estonia border",
      sep: ": ",
      opened: function (n) { return n + " tabs opened in the background"; },
      tabs: [["News", "--c-blue"], ["News", "--c-blue"], ["News", "--c-blue"], ["Documentary", "--c-green"], ["Aggregators", "--c-amber"], ["Celebrity", "--c-pink"], ["Stock", "--c-violet"]]
    }
  }[lang];
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var form = document.getElementById("demo");
  var bar = document.getElementById("tabbar");
  var status = document.getElementById("opened");
  if (!form || !bar) return;
  var input = form.querySelector("input");
  var timers = [];

  // Le titre de l'onglet est la recherche, comme dans le navigateur ;
  // le dossier se lit à la couleur de la pastille (et en toutes lettres pour les lecteurs d'écran).
  function tab(words, folder, color, animate) {
    var el = document.createElement("span");
    el.className = "tab" + (animate ? " opening" : "");
    el.style.setProperty("--fc", "var(" + color + ")");
    var dot = document.createElement("span");
    dot.className = "dot";
    var sr = document.createElement("span");
    sr.className = "sr";
    sr.textContent = folder + T.sep;
    var t = document.createElement("span");
    t.className = "t";
    t.textContent = words;
    el.appendChild(dot);
    el.appendChild(sr);
    el.appendChild(t);
    return el;
  }

  function open(words, animate) {
    for (var i = 0; i < timers.length; i++) clearTimeout(timers[i]);
    timers = [];
    var q = (words || "").replace(/\s+/g, " ").trim().slice(0, 80);
    if (!q) { q = T.empty; input.value = q; } // champ vide : on remet l'exemple, visiblement
    var keep = bar.querySelector(".current");
    bar.textContent = "";
    bar.appendChild(keep);
    var tabs = T.tabs.map(function (x) { return tab(q, x[0], x[1], animate); });
    if (!animate) { tabs.forEach(function (el) { bar.appendChild(el); }); status.textContent = T.opened(tabs.length); return; }
    // Le bouton reste actif (et garde le focus) : relancer recommence simplement l'ouverture.
    form.setAttribute("aria-busy", "true");
    status.textContent = "…";
    tabs.forEach(function (el, i) {
      timers.push(setTimeout(function () {
        bar.appendChild(el);
        if (i === tabs.length - 1) { status.textContent = T.opened(tabs.length); form.removeAttribute("aria-busy"); }
      }, 120 + i * 150));
    });
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    open(input.value, !reduce);
  });

  // Première ouverture quand la barre arrive à l'écran ; d'ici là, les onglets
  // déjà écrits dans la page restent visibles.
  if (!reduce && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) { io.disconnect(); open(input.value, true); }
    }, { threshold: 0.5 });
    io.observe(bar);
  }
})();
