/* Demo 1: GOLDEN SECTION. The kit does the work. This file only times the
   hero's leader label so it arrives after the spiral has drawn to its eye. */
(function () {
  'use strict';
  var W = window.WJG;
  if (!W || W.reduced || !W.hasGsap) { return; }
  var eye = document.querySelector('.leader--eye');
  if (eye) { eye.style.setProperty('--delay', '2.4s'); }
})();
