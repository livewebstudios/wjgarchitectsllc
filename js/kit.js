/* WJG Architects. Kit behavior shared by every demo.
   Vanilla JS. GSAP and ScrollTrigger are optional: if they never load, the
   failsafe in <head> adds .motion-failed and the CSS shows everything finished. */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var gsap = window.gsap;
  var ST = window.ScrollTrigger;
  var hasGsap = !!(gsap && ST);
  if (hasGsap) { gsap.registerPlugin(ST); }
  if (reduced) { root.classList.add('reduced'); }

  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  /* Run cb once, the first time el is `amount` in view. */
  function onEnter(el, cb, amount) {
    if (!('IntersectionObserver' in window)) { cb(el); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { io.unobserve(e.target); cb(e.target); }
      });
    }, { threshold: amount == null ? 0.2 : amount, rootMargin: '0px 0px -6% 0px' });
    io.observe(el);
  }

  /* ---------- Header: shrink on scroll ---------- */
  var header = $('[data-header]');
  if (header) {
    var setScrolled = function () { header.classList.toggle('is-scrolled', window.scrollY > 34); };
    setScrolled();
    window.addEventListener('scroll', setScrolled, { passive: true });
  }

  /* ---------- Mobile menu ---------- */
  var toggle = $('[data-menu-toggle]');
  var menu = $('[data-menu]');
  if (toggle && menu) {
    var closeMenu = function (returnFocus) {
      menu.hidden = true;
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Open menu');
      root.classList.remove('menu-open');
      if (returnFocus) { toggle.focus(); }
    };
    var openMenu = function () {
      menu.hidden = false;
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-label', 'Close menu');
      root.classList.add('menu-open');
    };
    toggle.addEventListener('click', function () {
      if (menu.hidden) { openMenu(); } else { closeMenu(false); }
    });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) { closeMenu(false); } });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !menu.hidden) { closeMenu(true); }
    });
    window.matchMedia('(min-width: 64rem)').addEventListener('change', function (e) {
      if (e.matches && !menu.hidden) { closeMenu(false); }
    });
  }

  /* ---------- Reveal, line draw, leader labels ---------- */
  $$('[data-stagger]').forEach(function (group) {
    $$(group.getAttribute('data-stagger') || ':scope > *', group).forEach(function (child, i) {
      child.style.setProperty('--i', i);
    });
  });
  /* Inline SVGs marked data-draw: give every stroke a unit path length. */
  $$('svg[data-draw]:not(.ico), [data-draw] svg:not(.ico)').forEach(function (svg) {
    $$('path, line, rect, circle, polyline', svg).forEach(function (s) {
      if (!s.hasAttribute('pathLength')) { s.setAttribute('pathLength', '1'); }
    });
  });
  $$('[data-reveal], [data-draw]').forEach(function (el) {
    if (reduced) { el.classList.add('is-in'); return; }
    onEnter(el, function (t) { t.classList.add('is-in'); }, el.hasAttribute('data-reveal-now') ? 0 : 0.2);
  });

  /* ---------- Drawn to built ---------- */
  function setD2b(el, pct) { el.style.setProperty('--d2b', pct + '%'); }

  function tweenD2b(el, from, to, dur, delay, ease) {
    if (!hasGsap) { setD2b(el, to); return null; }
    var o = { v: from };
    return gsap.to(o, {
      v: to, duration: dur, delay: delay || 0, ease: ease || 'power2.inOut', overwrite: true,
      onStart: function () { setD2b(el, from); },
      onUpdate: function () { setD2b(el, o.v); }
    });
  }

  function initD2b(el) {
    var mode = el.getAttribute('data-d2b');
    if (el.getAttribute('data-d2b-mobile') && window.matchMedia('(max-width: 47.99rem)').matches) {
      mode = el.getAttribute('data-d2b-mobile');
    }
    if (reduced || !hasGsap) { setD2b(el, 100); return; }

    if (mode === 'wipe') {
      onEnter(el, function () { tweenD2b(el, 0, 100, 1.4, 0.25); }, 0.35);

    } else if (mode === 'fade') {
      onEnter(el, function () {
        var o = { v: 0 };
        gsap.to(o, { v: 1, duration: 1.2, delay: 0.3, ease: 'power2.inOut',
          onUpdate: function () { el.style.setProperty('--d2b-o', o.v); } });
      }, 0.35);

    } else if (mode === 'hover') {
      /* Rests on the photo. Plays drawing-to-photo once on enter, then shows
         the drawing again whenever the visitor hovers or focuses the host. */
      var host = el.closest('[data-d2b-host]') || el;
      var played = false;
      onEnter(el, function () {
        var t = tweenD2b(el, 0, 100, 1.2, 0.2);
        if (t) { t.eventCallback('onComplete', function () { played = true; }); }
      }, 0.3);
      var show = function () { if (played) { tweenD2b(el, parseFloat(el.style.getPropertyValue('--d2b')) || 100, 0, 0.55, 0, 'power2.out'); } };
      var hide = function () { if (played) { tweenD2b(el, parseFloat(el.style.getPropertyValue('--d2b')) || 0, 100, 0.7, 0, 'power2.inOut'); } };
      if (window.matchMedia('(hover: hover)').matches) {
        host.addEventListener('mouseenter', show);
        host.addEventListener('mouseleave', hide);
      }
      host.addEventListener('focusin', show);
      host.addEventListener('focusout', hide);

    } else if (mode === 'scrub') {
      var o2 = { v: 0 };
      gsap.to(o2, {
        v: 100, ease: 'none',
        onUpdate: function () { setD2b(el, o2.v); },
        scrollTrigger: { trigger: el, start: 'top 75%', end: 'center 40%', scrub: 0.4 }
      });

    } else if (mode === 'drag') {
      var label = el.getAttribute('data-d2b-label') || 'Drawing to photo';
      var range = document.createElement('input');
      range.type = 'range'; range.min = '0'; range.max = '100'; range.step = '1'; range.value = '0';
      range.className = 'd2b__range';
      range.setAttribute('aria-label', label);
      range.setAttribute('aria-valuetext', '0 percent photo');
      var handle = document.createElement('span');
      handle.className = 'd2b__handle';
      handle.setAttribute('aria-hidden', 'true');
      handle.innerHTML = '<svg class="ico" focusable="false"><use href="#i-move-horizontal"/></svg>';
      el.appendChild(range);
      el.appendChild(handle);
      el.classList.add('is-drag');
      var apply = function (v) {
        setD2b(el, v);
        range.setAttribute('aria-valuetext', Math.round(v) + ' percent photo');
      };
      var intro = null;
      range.addEventListener('input', function () {
        if (intro) { intro.kill(); intro = null; }
        apply(parseFloat(range.value));
      });
      onEnter(el, function () {
        var o3 = { v: 0 };
        intro = gsap.to(o3, { v: 50, duration: 1.3, delay: 0.25, ease: 'power2.inOut',
          onUpdate: function () { range.value = o3.v; apply(o3.v); } });
      }, 0.4);
    }
  }
  $$('.d2b[data-d2b]').forEach(initD2b);

  /* ---------- Golden spiral and overlays ----------
     data-phi="load | enter | scrub | hover". data-phi-rest sets the opacity
     the art settles to once drawn. */
  function setPhi(el, draw, sq) {
    el.style.setProperty('--draw', draw);
    if (sq != null) { el.style.setProperty('--sq', sq); }
  }
  function drawPhi(el, dur, delay) {
    var o = { d: 1 };
    var rest = parseFloat(el.getAttribute('data-phi-rest') || '1');
    var tl = gsap.timeline({ delay: delay || 0 });
    tl.to(o, { d: 0, duration: dur, ease: 'power2.inOut', onUpdate: function () { setPhi(el, o.d); } });
    var s = { v: 0 };
    tl.to(s, { v: 0.6, duration: 0.9, ease: 'power2.out', onUpdate: function () { el.style.setProperty('--sq', s.v); } }, '-=0.3');
    if (rest < 1) { tl.to(el, { opacity: rest, duration: 0.9, ease: 'power2.out' }, '<'); }
    return tl;
  }
  $$('[data-phi]').forEach(function (el) {
    var mode = el.getAttribute('data-phi');
    var rest = el.getAttribute('data-phi-rest');
    if (reduced || !hasGsap) {
      setPhi(el, 0, 0.6);
      if (rest) { el.style.opacity = rest; }
      return;
    }
    if (mode === 'load') {
      drawPhi(el, 2.2, 0.5);
    } else if (mode === 'enter') {
      onEnter(el, function () { drawPhi(el, 1.6, 0.1); }, 0.3);
    } else if (mode === 'scrub') {
      var trig = el.closest('[data-phi-trigger]') || el;
      var o = { d: 1 };
      gsap.to(o, {
        d: 0, ease: 'none',
        onUpdate: function () { setPhi(el, o.d, 0.25 + (1 - o.d) * 0.35); },
        scrollTrigger: { trigger: trig, start: 'top 70%', end: 'bottom 75%', scrub: 0.4 }
      });
    } else if (mode === 'hover') {
      var host = el.closest('[data-phi-host]') || el.parentElement;
      var state = { d: 1 };
      var to = function (v, dur) {
        gsap.to(state, { d: v, duration: dur, ease: 'power2.inOut', overwrite: true,
          onUpdate: function () { setPhi(el, state.d, (1 - state.d) * 0.6); } });
      };
      if (window.matchMedia('(hover: hover)').matches) {
        host.addEventListener('mouseenter', function () { to(0, 0.7); });
        host.addEventListener('mouseleave', function () { if (!host.contains(document.activeElement)) { to(1, 0.5); } });
        host.addEventListener('focusin', function () { to(0, 0.7); });
        host.addEventListener('focusout', function () { to(1, 0.5); });
      } else {
        onEnter(el, function () { to(0, 1.1); }, 0.45);   /* touch: draw once, stay drawn */
      }
    }
  });

  /* ---------- Count up ---------- */
  $$('[data-count]').forEach(function (el) {
    var to = parseFloat(el.getAttribute('data-count'));
    var from = parseFloat(el.getAttribute('data-from') || '0');
    var plain = el.hasAttribute('data-plain');   /* years: no thousands separator */
    var fmt = function (v) { v = Math.round(v); return plain ? String(v) : v.toLocaleString('en-US'); };
    if (reduced || !hasGsap) { el.textContent = fmt(to); return; }
    onEnter(el, function () {
      var o = { v: from };
      gsap.to(o, { v: to, duration: 1.6, ease: 'power2.out',
        onUpdate: function () { el.textContent = fmt(o.v); },
        onComplete: function () { el.textContent = fmt(to); } });
    }, 0.6);
  });

  /* ---------- Contact form: inline errors, inline success, no redirect ---------- */
  $$('[data-form]').forEach(function (form) {
    form.noValidate = true;
    var status = $('.form__status', form);
    var button = $('[type="submit"]', form);

    var setError = function (field, msg) {
      var err = document.getElementById(field.id + '-err');
      field.setAttribute('aria-invalid', msg ? 'true' : 'false');
      if (err) { err.textContent = msg || ''; err.hidden = !msg; }
    };
    var check = function (field) {
      var v = field.value.trim();
      var msg = '';
      if (field.required && !v) {
        msg = field.type === 'email' ? 'Enter your email address.' : 'Enter your name.';
      } else if (field.type === 'email' && v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
        msg = 'That email address does not look right.';
      }
      setError(field, msg);
      return !msg;
    };
    $$('[required]', form).forEach(function (field) {
      field.addEventListener('blur', function () { check(field); });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var bad = $$('[required]', form).filter(function (f) { return !check(f); });
      if (bad.length) { bad[0].focus(); return; }

      var done = function (ok) {
        button.disabled = false;
        if (ok) {
          form.reset();
          status.textContent = 'Got it. We will be in touch.';
        } else {
          status.textContent = 'That did not send. Call 201.497.8075 or email waynegk@wjgarch.com.';
        }
        form.classList.toggle('is-sent', ok);
      };
      button.disabled = true;
      status.textContent = 'Sending.';

      /* Preview build: the Formspree ID is still a placeholder, so show the
         success state without a network call. Real IDs post for real. */
      if (form.action.indexOf('REPLACE_ME') !== -1) {
        window.setTimeout(function () { done(true); }, 500);
        return;
      }
      fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
        .then(function (r) { done(r.ok); })
        .catch(function () { done(false); });
    });
  });

  /* ---------- Shared with the demo scripts ---------- */
  window.WJG = { reduced: reduced, hasGsap: hasGsap, onEnter: onEnter, $: $, $$: $$, setD2b: setD2b, tweenD2b: tweenD2b };

  if (hasGsap) { window.addEventListener('load', function () { ST.refresh(); }); }
})();
