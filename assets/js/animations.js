/* ============================================================
   animations.js — GSAP ScrollTrigger animations
   Deps: gsap (CDN), ScrollTrigger (CDN), window.SITE_DATA
   ============================================================ */

window.addEventListener('load', function () {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    /* Fallback: make everything visible immediately */
    document.querySelectorAll(
      '.reveal, .reveal-left, .reveal-right, ' +
      '.hero-eyebrow, .hero-h1 .word, .hero-tagline, ' +
      '.hero-pills, .hero-cta, .skill-chip, .cert-chip'
    ).forEach(function (el) {
      el.style.opacity   = '1';
      el.style.transform = 'none';
    });
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  const d   = window.SITE_DATA.gsap;
  const tl  = gsap.timeline({ defaults: { ease: 'power3.out' } });

  /* ---- Hero entrance sequence ---- */
  tl.to('.hero-eyebrow', { opacity: 1, y: 0, duration: 0.7, delay: 0.3 })
    .to('#hero-h1 .word', {
      opacity:  1,
      y:        0,
      duration: d.heroWordDuration,
      stagger:  d.heroWordStagger,
    }, '-=0.2')
    .to('.hero-tagline', { opacity: 1, duration: 0.6 }, '-=0.2')
    .to('.hero-pills',   { opacity: 1, duration: 0.5 }, '-=0.3')
    .to('.hero-cta',     { opacity: 1, y: 0, duration: 0.5 }, '-=0.2');

  /* ---- Generic reveal (fade up) ---- */
  gsap.utils.toArray('.reveal').forEach(function (el) {
    gsap.to(el, {
      opacity:  1,
      y:        0,
      duration: d.revealDuration,
      ease:     d.revealEase,
      scrollTrigger: { trigger: el, start: d.scrollStart, toggleActions: 'play none none none' },
    });
  });

  /* ---- Reveal from left ---- */
  gsap.utils.toArray('.reveal-left').forEach(function (el) {
    gsap.to(el, {
      opacity:  1,
      x:        0,
      duration: d.revealDuration,
      ease:     d.revealEase,
      scrollTrigger: { trigger: el, start: d.scrollStart, toggleActions: 'play none none none' },
    });
  });

  /* ---- Reveal from right ---- */
  gsap.utils.toArray('.reveal-right').forEach(function (el) {
    gsap.to(el, {
      opacity:  1,
      x:        0,
      duration: d.revealDuration,
      ease:     d.revealEase,
      scrollTrigger: { trigger: el, start: d.scrollStart, toggleActions: 'play none none none' },
    });
  });

  /* ---- Timeline spine draw ---- */
  const spine    = document.getElementById('spine-fill');
  const timeline = document.querySelector('.timeline');
  if (spine && timeline) {
    ScrollTrigger.create({
      trigger: timeline,
      start:   'top 80%',
      end:     'bottom 20%',
      onUpdate: function (self) {
        spine.style.height = (self.progress * 100) + '%';
      },
    });
  }

  /* ---- Skill chips — staggered per category ---- */
  document.querySelectorAll('[data-stagger]').forEach(function (group) {
    gsap.to(group.querySelectorAll('.skill-chip'), {
      opacity:  1,
      y:        0,
      duration: d.staggerDuration,
      stagger:  d.chipStagger,
      ease:     d.staggerEase,
      scrollTrigger: { trigger: group, start: d.chipScrollStart, toggleActions: 'play none none none' },
    });
  });

  /* ---- Cert chips ---- */
  gsap.to('.cert-chip', {
    opacity:  1,
    y:        0,
    duration: d.staggerDuration,
    stagger:  d.certStagger,
    ease:     d.staggerEase,
    scrollTrigger: { trigger: '.certs-row', start: d.chipScrollStart, toggleActions: 'play none none none' },
  });
});
