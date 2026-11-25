/* tabulapix.com — horloge du bandeau et démonstration du fil.
   Tout se passe dans la page : aucune recherche n'est envoyée nulle part. */
(function () {
  "use strict";
  var lang = document.documentElement.lang === "en" ? "en" : "fr";
  var T = {
    fr: {
      locale: "fr-FR",
      ready: "PRÊT",
      total: function (n) { return n + " onglets ouverts en arrière-plan · vous restez sur votre page"; },
      empty: "estonie frontière",
      folders: ["Actualité", "Actualité", "Actualité", "Reportage", "Agrégateur", "People", "Stock"]
    },
    en: {
      locale: "en-GB",
      ready: "READY",
      total: function (n) { return n + " tabs opened in the background · you stay on your page"; },
      empty: "estonia border",
      folders: ["News", "News", "News", "Documentary", "Aggregator", "Celebrity", "Stock"]
    }
  }[lang];
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Horloge du bandeau et date des dépêches (heure locale de l'ordinateur).
  function two(n) { return (n < 10 ? "0" : "") + n; }
  function stamp(d) { return two(d.getHours()) + ":" + two(d.getMinutes()) + ":" + two(d.getSeconds()); }
  function tick() {
    var now = new Date();
    var date = now.toLocaleDateString(T.locale, { day: "2-digit", month: "short", year: "numeric" }).toUpperCase().replace(/\./g, "");
    var clock = document.getElementById("clock");
    if (clock) clock.textContent = date + " · " + two(now.getHours()) + ":" + two(now.getMinutes());
    var nodes = document.querySelectorAll("[data-today]");
    for (var i = 0; i < nodes.length; i++) nodes[i].textContent = date;
  }
  tick();
  setInterval(tick, 20000);

  // Démonstration : les mots-clés tapés une fois, une ligne par onglet.
  var form = document.getElementById("demo");
  var feed = document.getElementById("feed");
  if (!form || !feed) return;
  var input = form.querySelector("input");
  var button = form.querySelector("button");
  var timers = [];

  function line(cls, parts) {
    var li = document.createElement("li");
    if (cls) li.className = cls;
    for (var i = 0; i < parts.length; i++) {
      var span = document.createElement("span");
      span.className = parts[i][0];
      if (parts[i][2]) {
        // Les mots-clés d'abord : c'est ce que la démonstration doit montrer en entier.
        var q = document.createElement("q");
        q.textContent = parts[i][2];
        span.appendChild(q);
        span.appendChild(document.createTextNode(" · " + parts[i][1]));
      } else span.textContent = parts[i][1];
      li.appendChild(span);
    }
    return li;
  }

  function spool(words, animate) {
    for (var t = 0; t < timers.length; t++) clearTimeout(timers[t]);
    timers = [];
    var q = (words || "").replace(/\s+/g, " ").trim().slice(0, 80) || T.empty;
    var start = new Date();
    var rows = T.folders.map(function (folder, i) {
      var at = new Date(start.getTime() + i * 400);
      return line(animate ? "print" : "", [["t", stamp(at)], ["tab", (i + 1) + "/" + T.folders.length], ["what", folder, q], ["ok", T.ready]]);
    });
    rows.push(line(animate ? "total print" : "total", [["t", stamp(new Date(start.getTime() + T.folders.length * 400))], ["what", T.total(T.folders.length)]]));
    feed.textContent = "";
    if (!animate) { rows.forEach(function (r) { feed.appendChild(r); }); return; }
    button.disabled = true;
    rows.forEach(function (r, i) {
      timers.push(setTimeout(function () {
        feed.appendChild(r);
        if (i === rows.length - 1) button.disabled = false;
      }, 140 + i * 170));
    });
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    spool(input.value, !reduce);
  });

  // Première impression quand le terminal arrive à l'écran ; d'ici là, les lignes
  // déjà écrites dans la page restent visibles.
  if (!reduce && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) { io.disconnect(); spool(input.value, true); }
    }, { threshold: 0.35 });
    io.observe(feed);
  }
})();
