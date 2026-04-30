/* ============================================================
   ui.js — Nav, hamburger, typewriter, cursor glow, project glow
   No external deps beyond window.SITE_DATA
   ============================================================ */

'use strict';

/* ============================================================
   Hero H1 — word injection (runs before DOM ready check)
   ============================================================ */
(function injectHeroWords() {
  const h1 = document.getElementById('hero-h1');
  if (!h1) return;
  'Bryan Rendra Pramana'.split(' ').forEach(function (w) {
    const span = document.createElement('span');
    span.className   = 'word';
    span.textContent = w;
    h1.appendChild(span);
  });
})();

/* ============================================================
   Cursor glow — hero section only
   ============================================================ */
(function initCursorGlow() {
  const glow = document.getElementById('cursor-glow');
  const hero = document.getElementById('hero');
  if (!glow || !hero) return;

  hero.addEventListener('mouseenter', function () { glow.style.opacity = '1'; });
  hero.addEventListener('mouseleave', function () { glow.style.opacity = '0'; });

  window.addEventListener('mousemove', function (e) {
    if (glow.style.opacity === '0') return;
    const rect = hero.getBoundingClientRect();
    glow.style.left = (e.clientX - rect.left) + 'px';
    glow.style.top  = (e.clientY - rect.top)  + 'px';
  }, { passive: true });
})();

/* ============================================================
   Project cards — mouse-tracked radial glow
   ============================================================ */
document.querySelectorAll('.project-card').forEach(function (card) {
  card.addEventListener('mousemove', function (e) {
    const rect = card.getBoundingClientRect();
    card.style.setProperty('--mx', ((e.clientX - rect.left) / rect.width  * 100) + '%');
    card.style.setProperty('--my', ((e.clientY - rect.top)  / rect.height * 100) + '%');
  });
});

/* ============================================================
   Navigation — scroll state + active section highlight
   ============================================================ */
(function initNav() {
  const nav     = document.getElementById('nav');
  const links   = nav ? nav.querySelectorAll('.nav-links a') : [];
  const sections = Array.from(document.querySelectorAll('section[id]'));
  if (!nav) return;

  window.addEventListener('scroll', function () {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  if (!sections.length || !links.length) return;

  const obs = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        links.forEach(function (l) {
          l.classList.toggle('active', l.getAttribute('href') === '#' + id);
        });
      }
    });
  }, { threshold: 0.35 });

  sections.forEach(function (s) { obs.observe(s); });
})();

/* ============================================================
   Hamburger menu — mobile nav overlay
   ============================================================ */
(function initHamburger() {
  const btn   = document.getElementById('hamburger');
  const menu  = document.getElementById('mobile-menu');
  const links = menu ? menu.querySelectorAll('.mm-link') : [];
  if (!btn || !menu) return;

  function toggle(open) {
    btn.classList.toggle('open', open);
    menu.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
    btn.setAttribute('aria-expanded', String(open));
  }

  btn.addEventListener('click', function () {
    toggle(!btn.classList.contains('open'));
  });

  links.forEach(function (l) {
    l.addEventListener('click', function () { toggle(false); });
  });

  /* Close on Escape */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && btn.classList.contains('open')) toggle(false);
  });
})();

/* ============================================================
   Typewriter — terminal card
   ============================================================ */
(function initTypewriter() {
  const el  = document.getElementById('terminal-text');
  if (!el) return;

  const lines = window.SITE_DATA.terminalLines;
  const cfg   = window.SITE_DATA.typewriter;

  let li = 0, ci = 0, phase = 'type';

  function renderLine(lineIdx, charCount) {
    const { cmd, comment } = lines[lineIdx];
    const full    = cmd + comment;
    const visible = full.slice(0, charCount);
    const cmdPart = visible.slice(0, cmd.length);
    const cmtPart = visible.slice(cmd.length);
    /* Using textContent for cmd + comment spans to avoid XSS risk */
    el.innerHTML = '';
    const cmdSpan = document.createElement('span');
    cmdSpan.className   = 'cmd';
    cmdSpan.textContent = cmdPart;
    el.appendChild(cmdSpan);
    if (cmtPart) {
      const cmtSpan = document.createElement('span');
      cmtSpan.className   = 'comment';
      cmtSpan.textContent = cmtPart;
      el.appendChild(cmtSpan);
    }
  }

  function tick() {
    const total = (lines[li].cmd + lines[li].comment).length;
    if (phase === 'type') {
      ci++;
      renderLine(li, ci);
      if (ci >= total) { phase = 'wait'; setTimeout(tick, cfg.waitMs); return; }
      setTimeout(tick, cfg.speedType);
    } else if (phase === 'wait') {
      phase = 'erase';
      setTimeout(tick, cfg.speedErase);
    } else {
      ci--;
      renderLine(li, ci);
      if (ci <= 0) { li = (li + 1) % lines.length; ci = 0; phase = 'type'; }
      setTimeout(tick, cfg.speedErase);
    }
  }

  setTimeout(tick, cfg.startDelay);
})();
