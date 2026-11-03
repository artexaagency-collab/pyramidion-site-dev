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
