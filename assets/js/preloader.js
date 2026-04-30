/* ============================================================
   preloader.js — Loading counter 0→100 before site reveals
   No external deps. Runs immediately before any CDN scripts.
   ============================================================ */

(function initPreloader() {
  'use strict';

  const loader  = document.getElementById('preloader');
  const counter = document.getElementById('preloader-counter');
  const bar     = document.getElementById('preloader-bar');
  if (!loader) return;

  document.body.style.overflow = 'hidden';

  let current = 0;

  function setProgress(n) {
    current = Math.min(n, 100);
    if (counter) counter.textContent = Math.round(current);
    if (bar)     bar.style.width = current + '%';
  }

  /* Tick to 85 quickly while CDN scripts load */
  var interval = setInterval(function () {
    if (current < 85) {
      setProgress(current + (Math.random() * 4 + 1));
    } else {
      clearInterval(interval);
    }
  }, 40);

  /* Complete to 100 when all resources are loaded */
  window.addEventListener('load', function () {
    clearInterval(interval);
    setProgress(100);
    setTimeout(function () {
      loader.classList.add('done');
      document.body.style.overflow = '';
      setTimeout(function () { loader.remove(); }, 700);
    }, 300);
  });
})();
