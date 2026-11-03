/* Pyramidion — scripts du site. Vanilla JS, aucune dépendance.
   1. Menu mobile (bouton + liste, accessible au clavier)
   2. En-tête transparent sur les pages avec hero sombre, opaque dès le scroll
   3. Filtres de la collection par famille
*/
(function () {
  "use strict";

  // 1. Menu mobile
  var btn = document.querySelector(".menu-btn");
  var nav = document.querySelector(".nav");
  if (btn && nav) {
    btn.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      btn.textContent = open ? (btn.dataset.close || "Close") : (btn.dataset.menu || "Menu");
    });
  }

  // 2. En-tête : transparent sur le hero, opaque ensuite
  var header = document.querySelector(".site-header");
  var hero = document.querySelector(".hero");
  if (header && hero) {
    var update = function () {
      var past = window.scrollY > hero.offsetHeight - 72;
      header.classList.toggle("on-dark", !past);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
  }

  // 3. Filtres de la collection (boutons aria-pressed, cartes data-family)
  var filters = document.querySelector(".filters");
  if (filters) {
    var cards = document.querySelectorAll("[data-family]");
    filters.addEventListener("click", function (e) {
      var b = e.target.closest("button");
      if (!b) return;
      filters.querySelectorAll("button").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
      var f = b.dataset.filter;
      cards.forEach(function (c) { c.hidden = f !== "all" && c.dataset.family !== f; });
    });
  }
})();

/* ---------- Mouvement -------------------------------------------------
   4. Apparitions au scroll : les blocs reçoivent .reveal et un délai en cascade
   5. Compteurs sur les chiffres clés
   6. Parallaxe douce du hero de fiche, zoom lent des photos pleine largeur,
      effacement du texte du hero d'accueil au scroll
   7. En-tête qui se cache en descendant
   8. Phrase d'accroche (.statement) qui s'allume mot à mot au fil du scroll
   Tout est désactivé si l'utilisateur préfère réduire les animations.
*/
(function () {
  "use strict";
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce || !("IntersectionObserver" in window)) return;

  // 4. Marquage des blocs à révéler (en cascade à l'intérieur d'une même grille)
  var groups = [".section-head", ".grid", ".split", ".rows", ".spec", ".facts", ".filters", ".form", ".site-footer .top", ".matrix tbody"];
  document.querySelectorAll(groups.join(",")).forEach(function (g) {
    var kids = g.children.length > 1 ? Array.prototype.slice.call(g.children) : [g];
    kids.forEach(function (k, i) { k.classList.add("reveal"); k.style.setProperty("--d", Math.min(i * 70, 560) + "ms"); });
  });
  document.querySelectorAll(".statement, .lead, .breadcrumb, .full, .cap, .stone-title, .good, .note, .rule, .thumb, h1, main > .section > .wrap > h2").forEach(function (el) {
    if (!el.classList.contains("reveal") && !el.closest(".hero")) el.classList.add("reveal");
  });
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add("in");
      if (e.target.parentElement) e.target.parentElement.classList.add("in");
      io.unobserve(e.target);
    });
  }, { rootMargin: "0px 0px -10% 0px", threshold: 0.06 });
  document.querySelectorAll(".reveal").forEach(function (el) { io.observe(el); });

  // 5. Compteurs : "50+", "6+", "300 × 195", "1 – 20" comptent depuis zéro en 1,4 s
  function count(el) {
    var txt = el.textContent.trim(), m = txt.match(/^(\d[\d ]*)(.*)$/);
    if (!m) return;
    var target = parseInt(m[1].replace(/\s/g, ""), 10), suffix = m[2], t0 = null, dur = 1400;
    function tick(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1), ease = 1 - Math.pow(1 - p, 4);
      el.textContent = Math.round(target * ease).toLocaleString("en-GB").replace(/,/g, " ") + suffix;
      if (p < 1) requestAnimationFrame(tick); else el.textContent = txt;
    }
    requestAnimationFrame(tick);
  }
  var cio = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { if (e.isIntersecting) { count(e.target); cio.unobserve(e.target); } });
  }, { threshold: 0.5 });
  document.querySelectorAll(".facts .n").forEach(function (n) { cio.observe(n); });

  // 8. Phrase d'accroche : chaque mot s'allume quand la phrase passe le centre de l'écran
  var statements = [];
  document.querySelectorAll(".statement").forEach(function (s) {
    if (s.querySelector(".w")) return;
    var words = s.textContent.trim().split(/\s+/);
    s.innerHTML = words.map(function (w) { return '<span class="w">' + w + "</span>"; }).join(" ");
    statements.push({ el: s, words: s.querySelectorAll(".w") });
  });

  // 6 + 8. Tout ce qui dépend de la position de scroll, dans un seul rAF
  var sh = document.querySelector(".stone-hero img:not(.contain)");
  var hero = document.querySelector(".hero");
  var fulls = document.querySelectorAll(".full");
  var ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      var y = window.scrollY, vh = window.innerHeight;
      if (sh) sh.style.setProperty("--py", Math.round(y * 0.22) + "px");
      if (hero) hero.style.setProperty("--hp", Math.max(0, Math.min(1, y / (hero.offsetHeight * 0.7))).toFixed(3));
      fulls.forEach(function (f) {
        var r = f.getBoundingClientRect();
        var p = Math.max(0, Math.min(1, 1 - (r.top + r.height / 2) / (vh + r.height)));
        f.style.setProperty("--z", (1 + p * 0.05).toFixed(3));
      });
      statements.forEach(function (s) {
        var r = s.el.getBoundingClientRect();
        // 0 quand le haut de la phrase entre dans le tiers bas de l'écran, 1 quand il atteint le tiers haut
        var p = Math.max(0, Math.min(1, (vh * 0.78 - r.top) / (vh * 0.45)));
        var n = Math.round(p * s.words.length);
        s.words.forEach(function (w, i) { w.classList.toggle("on", i < n); });
      });
      ticking = false;
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true }); window.addEventListener("resize", onScroll); onScroll();

  // 7. En-tête : disparaît en descendant, revient dès qu'on remonte
  var header = document.querySelector(".site-header"), last = window.scrollY;
  window.addEventListener("scroll", function () {
    var y = window.scrollY;
    if (header && !document.querySelector(".nav.open")) header.classList.toggle("hide", y > last && y > 160);
    last = y;
  }, { passive: true });
})();
