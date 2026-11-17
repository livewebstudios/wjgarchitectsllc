/* Demo 2: DRAWN TO BUILT.
   The kit runs the reveals, the drag sliders and the counters. This file runs
   the hero (sticky stage, diagonal photo wipe, the PLAY clip), the sheet index,
   the work rail's arrows, the sheet borders and the center line in How we work.
   If GSAP is missing or motion is reduced, everything is left finished. */
(function () {
  'use strict';

  window.WJG_D2 = true;                 /* tells the failsafe in <head> this file ran */
  var W = window.WJG;
  if (!W) { return; }

  var $ = W.$, $$ = W.$$;
  var gsap = window.gsap;
  var motion = !W.reduced && W.hasGsap;

  /* ---------- Sheet borders: drawn as each sheet arrives ---------- */
  $$('.sheet__in').forEach(function (el) {
    if (!motion || !('IntersectionObserver' in window)) { el.classList.add('is-drawn'); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { io.unobserve(el); el.classList.add('is-drawn'); }
      });
    }, { threshold: 0, rootMargin: '0px 0px -12% 0px' });
    io.observe(el);
  });

  /* ---------- Sheet index: fill the sheet you are on ---------- */
  var sheets = $$('[data-sheet]');
  var links = $$('[data-sheet-link]');
  if (sheets.length && links.length) {
    var current = '';
    var ticking = false;
    var mark = function () {
      ticking = false;
      var line = window.innerHeight * 0.45;
      var now = sheets[0].getAttribute('data-sheet');
      sheets.forEach(function (s) {
        if (s.getBoundingClientRect().top <= line) { now = s.getAttribute('data-sheet'); }
      });
      if (now === current) { return; }
      current = now;
      links.forEach(function (a) {
        if (a.getAttribute('data-sheet-link') === now) { a.setAttribute('aria-current', 'true'); }
        else { a.removeAttribute('aria-current'); }
      });
    };
    var queue = function () { if (!ticking) { ticking = true; window.requestAnimationFrame(mark); } };
    mark();
    window.addEventListener('scroll', queue, { passive: true });
    window.addEventListener('resize', queue);
  }

  /* ---------- Work rail: arrow buttons ---------- */
  var rail = $('.rail');
  if (rail) {
    var track = $('.rail__track', rail);
    var prev = $('[data-rail="prev"]');
    var next = $('[data-rail="next"]');
    var wide = window.matchMedia('(min-width: 48rem)');
    var syncTab = function () {          /* only a tab stop while it really scrolls */
      if (wide.matches) { rail.setAttribute('tabindex', '0'); } else { rail.removeAttribute('tabindex'); }
    };
    var stride = function () {
      var card = $('.sc', rail);
      var gap = parseFloat(window.getComputedStyle(track).columnGap) || 0;
      return card ? card.getBoundingClientRect().width + gap : rail.clientWidth * 0.8;
    };
    var syncBtns = function () {
      if (!prev || !next) { return; }
      var max = rail.scrollWidth - rail.clientWidth;
      prev.setAttribute('aria-disabled', rail.scrollLeft <= 2 ? 'true' : 'false');
      next.setAttribute('aria-disabled', rail.scrollLeft >= max - 2 ? 'true' : 'false');
    };
    var go = function (dir) {
      rail.scrollBy({ left: dir * stride(), behavior: W.reduced ? 'auto' : 'smooth' });
    };
    if (prev && next) {
      prev.addEventListener('click', function () { if (prev.getAttribute('aria-disabled') !== 'true') { go(-1); } });
      next.addEventListener('click', function () { if (next.getAttribute('aria-disabled') !== 'true') { go(1); } });
    }
    var railTick = false;
    rail.addEventListener('scroll', function () {
      if (railTick) { return; }
      railTick = true;
      window.requestAnimationFrame(function () { railTick = false; syncBtns(); });
    }, { passive: true });
    window.addEventListener('resize', function () { syncTab(); syncBtns(); });
    window.addEventListener('load', syncBtns);
    syncTab();
    syncBtns();
  }

  /* ---------- Hero ---------- */
  var hero = $('.hero');
  var stick = $('.hero__stick');
  var frame = $('.hero__d2b');

  if (hero && stick && frame && motion) {
    var setP = function (v) { frame.style.setProperty('--p', (Math.round(v * 1000) / 1000).toString()); };
    var mm = gsap.matchMedia();

    /* 64rem and up, tall enough: the stage is sticky inside a 160svh wrapper.
       The photo wipes in over the extra 60svh, then holds for a beat. */
    mm.add('(min-width: 64rem) and (min-height: 40rem)', function () {
      var s = { p: 0 };
      var tl = gsap.timeline({
        scrollTrigger: {
          trigger: hero,
          start: 'top top+=55',
          end: function () { return '+=' + Math.max(1, hero.offsetHeight - stick.offsetHeight); },
          scrub: 0.4,
          invalidateOnRefresh: true
        }
      });
      tl.to(s, { p: 1, duration: 0.84, ease: 'none', onUpdate: function () { setP(s.p); } })
        .to({}, { duration: 0.16 });
      return function () { setP(0); };
    });

    /* Below 64rem the frame sits under the copy. No sticky stage: the wipe is
       scrubbed while the frame climbs the screen. */
    mm.add('(max-width: 63.99rem)', function () {
      var s = { p: 0 };
      var top = function () { return frame.getBoundingClientRect().top + window.scrollY; };
      /* starts after a first nudge of scroll, ends before the frame meets the header */
      var from = function () { return Math.max(24, top() - window.innerHeight * 0.5); };
      var to = function () { return Math.max(from() + 140, top() - 76); };
      gsap.to(s, {
        p: 1, ease: 'none',
        onUpdate: function () { setP(s.p); },
        scrollTrigger: { start: from, end: to, scrub: 0.4, invalidateOnRefresh: true }
      });
      return function () { setP(0); };
    });

    /* Wide but very short screens: no room for a stage. Draw, hold, build. */
    mm.add('(min-width: 64rem) and (max-height: 39.99rem)', function () {
      var s = { p: 0 };
      gsap.to(s, { p: 1, duration: 1.6, delay: 3, ease: 'power2.inOut', onUpdate: function () { setP(s.p); } });
      return function () { setP(0); };
    });
  }

  /* PLAY: the inspected clip, once, in place of the stacked images. Never on its
     own, never looped, never under reduced motion. Then the scroll takes over again. */
  var play = $('.hero__play');
  if (play && frame && !W.reduced) {
    var video = null;
    var busy = false;
    var watchdog = 0;
    var finish = function () {
      if (!busy) { return; }
      window.clearTimeout(watchdog);
      window.setTimeout(function () {
        frame.classList.remove('is-playing');
        busy = false;
        play.setAttribute('aria-disabled', 'false');
      }, 900);
    };
    var build = function () {
      var base = play.getAttribute('data-clip');
      var v = document.createElement('video');
      v.className = 'hero__clip';
      v.muted = true;
      v.playsInline = true;
      v.setAttribute('muted', '');
      v.setAttribute('playsinline', '');
      v.setAttribute('aria-hidden', 'true');
      v.setAttribute('tabindex', '-1');
      v.preload = 'auto';
      v.poster = play.getAttribute('data-poster');
      [['webm', 'video/webm'], ['mp4', 'video/mp4']].forEach(function (t) {
        var src = document.createElement('source');
        src.src = base + '.' + t[0];
        src.type = t[1];
        v.appendChild(src);
      });
      v.addEventListener('ended', finish);
      v.addEventListener('error', finish, true);
      frame.appendChild(v);
      return v;
    };
    play.hidden = false;
    play.setAttribute('aria-disabled', 'false');
    play.addEventListener('click', function () {
      if (busy) { return; }
      busy = true;
      play.setAttribute('aria-disabled', 'true');
      if (!video) { video = build(); }
      try { video.currentTime = 0; } catch (err) { /* not seekable yet */ }
      /* two frames so the poster is painted before the fade starts */
      window.requestAnimationFrame(function () {
        window.requestAnimationFrame(function () { frame.classList.add('is-playing'); });
      });
      watchdog = window.setTimeout(finish, 9000);
      var started = video.play();
      if (started && started.catch) { started.catch(finish); }
    });
  }

  /* ---------- How we work: the center line, inked as you scroll ---------- */
  var steps = $$('.step');
  if (steps.length && motion) {
    steps.forEach(function (step, i) {
      if (i === steps.length - 1) { return; }
      var s = { v: 0 };
      gsap.to(s, {
        v: 1, ease: 'none',
        onUpdate: function () { step.style.setProperty('--seg', (Math.round(s.v * 1000) / 1000).toString()); },
        scrollTrigger: { trigger: step, start: 'top 62%', endTrigger: steps[i + 1], end: 'top 62%', scrub: 0.4 }
      });
    });
  }
})();
