/* Customer Success Copilot case study — page behavior.
   Four things: scroll reveal, count-up stats, the hover-to-source demo,
   and the nav progress bar. No dependencies. */
(function () {
  'use strict';

  var EASE = 'cubic-bezier(.2,.8,.2,1)';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasIO = 'IntersectionObserver' in window;

  document.addEventListener('DOMContentLoaded', function () {
    var root = document.querySelector('[data-root]');
    if (!root) return;

    primeVideo(root);
    wireReveal(root);
    wireCounts(root);
    wireHover(root);
    wireNav(root);
  });

  /* Autoplay needs the properties set on the element, not just the
     attributes, or Safari refuses the play() call. */
  function primeVideo(root) {
    root.querySelectorAll('video').forEach(function (v) {
      v.muted = true; v.loop = true; v.controls = true; v.playsInline = true;
      var p = v.play();
      if (p && p.catch) p.catch(function () {});
    });
  }

  function show(el) {
    el.style.opacity = '1';
    el.style.transform = 'none';
  }

  function wireReveal(root) {
    var els = Array.prototype.slice.call(root.querySelectorAll('[data-reveal]'));
    if (!els.length) return;

    if (reduce || !hasIO) {
      els.forEach(function (el) { el.style.transition = 'none'; show(el); });
      root.querySelectorAll('[data-strike]').forEach(function (s) { s.style.transition = 'none'; s.style.width = '100%'; });
      root.querySelectorAll('[data-killed-img]').forEach(function (k) {
        k.style.transition = 'none';
        k.style.filter = 'grayscale(1) contrast(0.96)';
        k.style.opacity = '0.66';
      });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        show(e.target);
        io.unobserve(e.target);
        e.target.querySelectorAll('[data-strike]').forEach(function (s) { s.style.width = '100%'; });
        e.target.querySelectorAll('[data-killed-img]').forEach(function (k) {
          k.style.filter = 'grayscale(1) contrast(0.96)';
          k.style.opacity = '0.66';
        });
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });

    els.forEach(function (el) { io.observe(el); });

    /* Safety net. Content is hidden by default, so an observer that never
       fires would leave the page blank. Non-negotiable. */
    setTimeout(function () {
      els.forEach(function (el) { if (el.style.opacity === '0') show(el); });
    }, 3000);

    /* The killed-proposal figures desaturate as a pair. */
    root.querySelectorAll('[data-killed]').forEach(function (f) {
      if (!f.querySelectorAll('[data-strike], [data-killed-img]').length) return;
      var io2 = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (!e.isIntersecting) return;
          f.querySelectorAll('[data-strike]').forEach(function (s) { s.style.width = '100%'; });
          f.querySelectorAll('[data-killed-img]').forEach(function (k) {
            k.style.filter = 'grayscale(1) contrast(0.96)';
            k.style.opacity = '0.66';
          });
          io2.unobserve(e.target);
        });
      }, { threshold: 0.25 });
      io2.observe(f);
    });
  }

  /* Each numeral is observed on its own at a high threshold. Observing the
     section instead fires the roll while the numbers are still below the
     fold, so nobody sees it. */
  function wireCounts(root) {
    var nodes = Array.prototype.slice.call(root.querySelectorAll('[data-count]'));
    if (!nodes.length || reduce || !hasIO) return;

    nodes.forEach(function (n) {
      n.dataset.final = n.textContent;
      n.textContent = (n.dataset.prefix || '') + '0' + (n.dataset.suffix || '');
    });

    function start(node) {
      if (node.dataset.done) return;
      var group = node.closest('[data-reveal]') || root;
      var peers = Array.prototype.slice.call(group.querySelectorAll('[data-count]'));
      var i = Math.max(0, peers.indexOf(node));
      setTimeout(function () { countUp(node); }, i * 110);
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        start(e.target);
      });
    }, { threshold: 0.85, rootMargin: '0px 0px -6% 0px' });

    nodes.forEach(function (n) { io.observe(n); });

    /* A jump past a number — anchor link, fast flick, restored scroll
       position — can leave it primed at zero with the observer never
       firing. Anything already above the viewport gets its final value
       outright; anything on screen animates. */
    function sweep() {
      var pending = 0;
      nodes.forEach(function (n) {
        if (n.dataset.done) return;
        var r = n.getBoundingClientRect();
        if (r.bottom <= 0) {
          io.unobserve(n);
          n.dataset.done = '1';
          n.textContent = n.dataset.final;
        } else if (r.top < window.innerHeight) {
          io.unobserve(n);
          start(n);
        } else {
          pending++;
        }
      });
      if (!pending) window.removeEventListener('scroll', sweep);
    }
    window.addEventListener('scroll', sweep, { passive: true });
    setTimeout(sweep, 4000);
  }

  function countUp(node) {
    if (node.dataset.done) return;
    node.dataset.done = '1';
    var target = parseFloat(node.dataset.count);
    if (!isFinite(target)) return;
    var prefix = node.dataset.prefix || '';
    var suffix = node.dataset.suffix || '';
    var dur = 1100;
    var t0 = performance.now();
    (function step(now) {
      var t = Math.min(1, (now - t0) / dur);
      var eased = 1 - Math.pow(1 - t, 3);
      node.textContent = prefix + Math.round(target * eased) + suffix;
      if (t < 1) requestAnimationFrame(step);
      else node.textContent = node.dataset.final || (prefix + target + suffix);
    })(t0);
  }

  /* Hover-to-source: cross-fade the two stacked stills. Touch devices have
     no hover, so the rest state stays the meaningful one. */
  function wireHover(root) {
    var box = root.querySelector('[data-hoverswap]');
    if (!box) return;
    var rest = box.querySelector('[data-swap="rest"]');
    var active = box.querySelector('[data-swap="active"]');
    var hint = box.querySelector('[data-hint]');
    if (!rest || !active) return;

    var on = function () {
      rest.style.opacity = '0';
      active.style.opacity = '1';
      if (hint) hint.style.opacity = '0';
    };
    var off = function () {
      rest.style.opacity = '1';
      active.style.opacity = '0';
    };

    box.addEventListener('pointerenter', on);
    box.addEventListener('pointerleave', off);
    box.addEventListener('focusin', on);
    box.addEventListener('focusout', off);
    off();
  }

  function wireNav(root) {
    var bar = root.querySelector('[data-progress]');
    var links = Array.prototype.slice.call(root.querySelectorAll('[data-navlink]'));
    var sections = links
      .map(function (l) { return root.querySelector('#' + l.dataset.navlink); })
      .filter(Boolean);

    function onScroll() {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      if (bar) bar.style.width = (h > 0 ? Math.min(100, (window.scrollY / h) * 100) : 0) + '%';
      var current = null;
      sections.forEach(function (s) {
        if (s.getBoundingClientRect().top <= 140) current = s.id;
      });
      links.forEach(function (l) {
        var isOn = l.dataset.navlink === current;
        l.style.color = isOn ? '#111111' : '#5C5C5C';
        l.style.fontWeight = isOn ? '500' : '400';
      });
    }

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
  }
})();
