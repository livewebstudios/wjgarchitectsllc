/* Demo 4: GET SET.
   1. The selector: six chips become real ARIA tabs. Chips respond at once,
      the photo wipes in from its drawing, the proof line slides up (CSS).
   2. S, E and T fill in sequence the first time the bento enters.
   3. The progress line in How we work fills as you scroll.
   The tabs do not need GSAP or the kit. Without them the swap is instant. */
(function () {
  'use strict';

  var W = window.WJG || {};
  var gsap = window.gsap;
  var motion = !!(W.hasGsap && gsap && !W.reduced);
  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };
  var setVar = function (el, name, v) { el.style.setProperty(name, v); };

  function tweenVar(el, name, from, to, dur, delay, ease, onDone, onStart) {
    var o = { v: from };
    setVar(el, name, from);
    return gsap.to(o, {
      v: to, duration: dur, delay: delay || 0, ease: ease || 'power2.out',
      onStart: onStart || null,
      onUpdate: function () { setVar(el, name, o.v); },
      onComplete: onDone || null
    });
  }

  /* ---------- 1. The selector ---------- */
  (function () {
    var root = $('[data-pick]');
    var list = root && $('[data-tabs]', root);
    if (!list) { return; }
    var tabs = $$('[data-tab]', list);
    var keys = tabs.map(function (t) { return t.getAttribute('data-tab'); });
    var panels = keys.map(function (k) { return document.getElementById(k); });
    if (!tabs.length || panels.indexOf(null) !== -1) { return; }
    var figs = panels.map(function (p) { return $('.pick__fig', p); });

    var current = 0;
    var seq = 0;
    var live = [];
    var warmed = false;

    /* Roles go on here, not in the HTML: with JS off the chips are plain
       anchor links to six stacked panels, and should be announced as links. */
    list.setAttribute('role', 'tablist');
    list.setAttribute('aria-labelledby', 'pick-legend');
    tabs.forEach(function (t, i) {
      t.setAttribute('role', 'tab');
      t.setAttribute('aria-controls', keys[i]);
      panels[i].setAttribute('role', 'tabpanel');
      panels[i].setAttribute('aria-labelledby', t.id);
    });

    function mark(i) {
      tabs.forEach(function (t, k) {
        var on = k === i;
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.tabIndex = on ? 0 : -1;
        t.classList.toggle('is-selected', on);
      });
    }

    function rest(f) {            /* a figure in its finished state */
      setVar(f, '--o', 1);
      setVar(f, '--d2b', '100%');
      setVar(f, '--was', 0);
      f.classList.remove('is-before');
      f.classList.remove('is-after');
    }

    function settle() {           /* finish whatever is mid-flight */
      live.forEach(function (t) { if (t) { t.kill(); } });
      live = [];
      panels.forEach(function (p) { p.classList.remove('is-under'); });
      figs.forEach(rest);
    }

    function load(f) {
      $$('img', f).forEach(function (im) { im.loading = 'eager'; });
    }
    function ready(f) {           /* resolves when the figure's images can paint, or after 1.5s */
      load(f);
      var all = Promise.all($$('img', f).map(function (im) {
        if (im.complete) {
          return im.decode ? im.decode().catch(function () {}) : null;
        }
        return new Promise(function (res) {
          im.addEventListener('load', res, { once: true });
          im.addEventListener('error', res, { once: true });
        });
      }));
      var cap = new Promise(function (res) { window.setTimeout(res, 1500); });
      return Promise.race([all, cap]);
    }
    function warm() {             /* first sign of intent: fetch the other photos */
      if (warmed) { return; }
      warmed = true;
      figs.forEach(load);
    }

    function center(t) {          /* keep the chosen chip in view inside the strip. Never moves the page. */
      var max = list.scrollWidth - list.clientWidth;
      if (max <= 0) { return; }
      var x = t.offsetLeft - (list.clientWidth - t.offsetWidth) / 2;
      x = Math.max(0, Math.min(max, x));
      if (list.scrollTo) { list.scrollTo({ left: x, behavior: motion ? 'smooth' : 'auto' }); } else { list.scrollLeft = x; }
    }
    function edges() {
      var max = list.scrollWidth - list.clientWidth;
      list.classList.toggle('has-more-l', list.scrollLeft > 2);
      list.classList.toggle('has-more-r', list.scrollLeft < max - 2);
    }

    function select(i, o) {
      o = o || {};
      if (o.focus) { tabs[i].focus({ preventScroll: false }); }
      if (i === current && !o.first) { return; }

      var prev = current;
      var f = figs[i];
      var run = ++seq;
      settle();
      root.classList.add('is-swapped');
      current = i;
      mark(i);
      center(tabs[i]);
      if (o.hash && window.history && history.replaceState) { history.replaceState(null, '', '#' + keys[i]); }

      panels[prev].classList.remove('is-active');
      panels[i].classList.add('is-active');
      if (!motion) { load(f); return; }

      var drawn = !!$('.d2b__drawing', f);
      var was = !!$('.pick__was', f);
      if (!o.first) {
        panels[prev].classList.add('is-under');   /* the old photo stays underneath while the new one arrives */
        setVar(f, '--o', 0);
      }
      if (drawn) { setVar(f, '--d2b', '0%'); }
      if (was) { setVar(f, '--was', 1); f.classList.add('is-before'); }

      ready(f).then(function () {
        if (run !== seq) { return; }
        var done = function () { panels[prev].classList.remove('is-under'); };
        if (!o.first) {
          live.push(tweenVar(f, '--o', 0, 1, drawn ? 0.25 : 0.5, 0, 'power1.out', done));
        }
        if (drawn) {
          var o2 = { v: 0 };
          live.push(gsap.to(o2, { v: 100, duration: 1.2, delay: o.first ? 0.5 : 0.1, ease: 'power2.inOut',
            onUpdate: function () { setVar(f, '--d2b', o2.v + '%'); } }));
        }
        if (was) {                                 /* before first, then the finished house */
          live.push(tweenVar(f, '--was', 1, 0, 0.9, 1.5, 'power2.inOut'));
          live.push(gsap.delayedCall(1.95, function () {   /* the tag flips halfway through the crossfade */
            f.classList.remove('is-before');
            f.classList.add('is-after');
          }));
        }
      });
    }

    tabs.forEach(function (t, i) {
      t.addEventListener('click', function (e) {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) { return; }
        e.preventDefault();
        select(i, { hash: true });
      });
    });

    list.addEventListener('keydown', function (e) {
      var i = tabs.indexOf(document.activeElement);
      if (i < 0 || e.metaKey || e.ctrlKey || e.altKey) { return; }
      var n = tabs.length;
      var to = -1;
      if (e.key === 'ArrowRight') { to = (i + 1) % n; }
      else if (e.key === 'ArrowLeft') { to = (i - 1 + n) % n; }
      else if (e.key === 'Home') { to = 0; }
      else if (e.key === 'End') { to = n - 1; }
      else if (e.key === ' ' || e.key === 'Spacebar' || e.key === 'Enter') { to = i; }
      if (to < 0) { return; }
      e.preventDefault();
      warm();
      select(to, { focus: to !== i, hash: true });
    });

    ['pointerenter', 'touchstart', 'focusin'].forEach(function (ev) {
      list.addEventListener(ev, warm, { passive: true });
    });
    list.addEventListener('scroll', edges, { passive: true });
    window.addEventListener('resize', edges);

    /* Deep links. Only the six chip names are ours: #work, #contact, #main and
       #top are left to the browser. */
    function fromHash() { return keys.indexOf(decodeURIComponent(location.hash.replace('#', ''))); }

    mark(0);
    root.classList.add('is-ready');
    edges();
    var start = fromHash();
    if (start > 0) { select(start, { first: true }); }
    window.addEventListener('hashchange', function () {
      var k = fromHash();
      if (k < 0) { return; }
      select(k);
      root.scrollIntoView({ block: 'start' });
    });
  })();

  /* ---------- Arriving on #contact or #work from another page ----------
     The browser's own jump to the anchor can be cut short when ScrollTrigger
     refreshes on load. If the page is still at the top just after load, and
     the hash names a section (never one of the six chips), finish the jump. */
  window.addEventListener('load', function () {
    window.setTimeout(function () {
      var id = decodeURIComponent(location.hash.replace('#', ''));
      var el = id && document.getElementById(id);
      if (!el || el.classList.contains('pick__panel')) { return; }
      if (window.scrollY < 8 && el.getBoundingClientRect().top > window.innerHeight * 0.5) {
        el.scrollIntoView({ block: 'start' });
      }
    }, 150);
  });

  /* ---------- Before and after: say what the slider value means ----------
     The kit words the value for a drawing ("40 percent photo"). Here both
     layers are photos, so reword it once the kit has built the control. */
  (function () {
    var range = $('.ba__fig .d2b__range');
    if (!range || !('MutationObserver' in window)) { return; }
    var say = function () {
      var now = range.getAttribute('aria-valuetext') || '';
      var want = Math.round(parseFloat(range.value) || 0) + ' percent after';
      if (now !== want) { range.setAttribute('aria-valuetext', want); }
    };
    say();
    new MutationObserver(say).observe(range, { attributes: true, attributeFilter: ['aria-valuetext'] });
  })();

  /* ---------- 2. S, E, T fill in sequence ---------- */
  (function () {
    var bento = $('[data-bento]');
    if (!bento || !motion || !W.onEnter) { return; }
    bento.classList.add('is-armed');
    $$('[data-set]', bento).forEach(function (card) {
      W.onEnter(card, function () { card.classList.add('is-set'); }, 0.45);
    });
  })();

  /* ---------- 3. How we work: the line fills, the badges switch on ---------- */
  (function () {
    var list = $('[data-steps]');
    if (!list || !motion) { return; }
    var steps = $$('.step', list);
    var state = { p: 0 };
    list.classList.add('is-armed');

    function draw() {
      var y = state.p * list.offsetHeight;       /* how far down the list the reader is */
      steps.forEach(function (s, i) {
        var badge = s.firstElementChild;
        var top = s.offsetTop;
        var h = badge.offsetHeight;
        s.classList.toggle('is-on', i === 0 || y >= top + h / 2);
        var next = steps[i + 1];
        if (next) {
          var len = next.offsetTop - top - h;
          setVar(s, '--sp', Math.max(0, Math.min(1, (y - top - h) / len)));
        }
      });
    }
    draw();
    gsap.to(state, {
      p: 1, ease: 'none', onUpdate: draw,
      scrollTrigger: { trigger: list, start: 'top 58%', end: 'bottom 58%', scrub: 0.4 }
    });
  })();
})();
