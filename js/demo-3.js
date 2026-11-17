/* Demo 3: COMPOSITION. The kit draws the overlays (on hover and focus with a
   mouse, once on scroll for touch). This file adds two things:
   1. the hero's GOLDEN SPIRAL label arrives after the spiral has drawn,
   2. on touch screens, the plate nearest the middle of the screen gets its
      color back, which is the closest thing a phone has to "looking at it". */
(function () {
  'use strict';
  var W = window.WJG;
  if (!W) { return; }

  var touch = window.matchMedia('(hover: none)').matches;
  if (touch && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var plate = e.target.closest('.plate');
        if (plate) { plate.classList.toggle('is-look', e.isIntersecting); }
      });
    }, { rootMargin: '-40% 0px -40% 0px', threshold: 0 });
    W.$$('.plate__art').forEach(function (art) { io.observe(art); });
  }

  if (W.reduced || !W.hasGsap) { return; }
  var label = W.$('.leader--spiral');
  if (label) { label.style.setProperty('--delay', '2.3s'); }
})();
