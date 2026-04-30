/* ============================================================
   smooth-scroll.js — Lenis smooth scroll initialisation
   Deps: Lenis (CDN). Runs before animations.js.
   Exposes: window._lenis, window.lenisScrollY
   ============================================================ */

(function initLenis() {
  'use strict';

  if (typeof Lenis === 'undefined') return;

  var lenis = new Lenis({
    duration:    1.2,
    easing:      function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
    smoothTouch: false,
  });

  window._lenis = lenis;

  function raf(time) {
    lenis.raf(time);
    window.lenisScrollY = lenis.scroll;
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  /* Keep GSAP ScrollTrigger in sync with Lenis scroll position */
  lenis.on('scroll', function () {
    if (typeof ScrollTrigger !== 'undefined') {
      ScrollTrigger.update();
    }
  });
})();
