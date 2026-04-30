/* ============================================================
   cursor.js — LERP custom cursor (dot + lagging ring)
   No external deps. Runs last so all interactive elements exist.
   ============================================================ */

(function initCursor() {
  'use strict';

  var dot  = document.getElementById('cursor-dot');
  var ring = document.getElementById('cursor-ring');

  /* Skip on touch-only devices */
  if (!dot || !ring || window.matchMedia('(hover: none)').matches) return;

  var mx = -100, my = -100;
  var rx = -100, ry = -100;

  window.addEventListener('mousemove', function (e) {
    mx = e.clientX;
    my = e.clientY;
  }, { passive: true });

  /* Expand ring when hovering interactive elements */
  var interactives = document.querySelectorAll(
    'a, button, [role="button"], .skill-chip, .project-card, input, textarea, .cert-chip'
  );
  interactives.forEach(function (el) {
    el.addEventListener('mouseenter', function () {
      document.body.classList.add('cursor-hover');
    });
    el.addEventListener('mouseleave', function () {
      document.body.classList.remove('cursor-hover');
    });
  });

  /* LERP loop — dot snaps, ring lags */
  (function loop() {
    dot.style.left  = mx + 'px';
    dot.style.top   = my + 'px';
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(loop);
  })();
})();
