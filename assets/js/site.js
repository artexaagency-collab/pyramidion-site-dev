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
      btn.textContent = open ? "Close" : "Menu";
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
   6. Parallaxe douce sur le hero des fiches, zoom lent sur les photos pleine largeur
   7. En-tête qui se cache en descendant
   Tout est désactivé si l'utilisateur préfère réduire les animations.
*/
(function () {
  "use strict";
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce || !("IntersectionObserver" in window)) return;

  // 4. Marquage des blocs à révéler (en cascade à l'intérieur d'une même grille)
  var groups = [".section-head", ".grid", ".split", ".rows", ".spec", ".facts", ".filters", ".form", ".site-footer .top"];
  document.querySelectorAll(groups.join(",")).forEach(function (g) {
    var kids = g.children.length > 1 ? Array.prototype.slice.call(g.children) : [g];
    kids.forEach(function (k, i) { k.classList.add("reveal"); k.style.setProperty("--d", Math.min(i * 90, 540) + "ms"); });
  });
  document.querySelectorAll(".statement, .lead, .breadcrumb, .full, .cap, .stone-title, .good, .note, .rule").forEach(function (el) {
    if (!el.classList.contains("reveal")) el.classList.add("reveal");
  });
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add("in");
      if (e.target.parentElement) e.target.parentElement.classList.add("in");
      io.unobserve(e.target);
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
  document.querySelectorAll(".reveal").forEach(function (el) { io.observe(el); });

  // 5. Compteurs : "14", "50+", "300 × 195" comptent depuis zéro en 1,2 s
  function count(el) {
    var txt = el.textContent.trim(), m = txt.match(/^(\d[\d ]*)(.*)$/);
    if (!m) return;
    var target = parseInt(m[1].replace(/\s/g, ""), 10), suffix = m[2], t0 = null, dur = 1200;
    function tick(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1), ease = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * ease).toLocaleString("en-GB").replace(/,/g, " ") + suffix;
      if (p < 1) requestAnimationFrame(tick); else el.textContent = txt;
    }
    requestAnimationFrame(tick);
  }
  var cio = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { if (e.isIntersecting) { count(e.target); cio.unobserve(e.target); } });
  }, { threshold: 0.5 });
  document.querySelectorAll(".facts .n").forEach(function (n) { cio.observe(n); });

  // 6. Parallaxe du hero de fiche et zoom des photos pleine largeur, calés sur le scroll
  var sh = document.querySelector(".stone-hero img:not(.contain)");
  var fulls = document.querySelectorAll(".full");
  var ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      if (sh) sh.style.setProperty("--py", Math.round(window.scrollY * 0.18) + "px");
      fulls.forEach(function (f) {
        var r = f.getBoundingClientRect(), vh = window.innerHeight;
        var p = Math.max(0, Math.min(1, 1 - (r.top + r.height / 2) / (vh + r.height)));
        f.style.setProperty("--z", (1 + p * 0.06).toFixed(3));
      });
      ticking = false;
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();

  // 7. En-tête : disparaît en descendant, revient dès qu'on remonte
  var header = document.querySelector(".site-header"), last = window.scrollY;
  window.addEventListener("scroll", function () {
    var y = window.scrollY;
    if (header && !document.querySelector(".nav.open")) header.classList.toggle("hide", y > last && y > 160);
    last = y;
  }, { passive: true });
})();
