/* ============================================================
   BRYAN RENDRA PRAMANA — Premium Portfolio
   script.js
   ============================================================ */

'use strict';

/* ============================================================
   1. HERO H1 — WORD INJECTION
   ============================================================ */
(function injectHeroWords() {
  const name = 'Bryan Rendra Pramana';
  const h1 = document.getElementById('hero-h1');
  if (!h1) return;
  name.split(' ').forEach((w) => {
    const span = document.createElement('span');
    span.className = 'word';
    span.textContent = w;
    h1.appendChild(span);
  });
})();

/* ============================================================
   2. THREE.JS HERO NETWORK MESH
   ============================================================ */
(function initHeroScene() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000);
  camera.position.z = 220;

  /* ---- Sizing ---- */
  function resize() {
    const w = canvas.parentElement.offsetWidth || window.innerWidth;
    const h = canvas.parentElement.offsetHeight || window.innerHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize);

  /* ---- Node data ---- */
  const NODE_COUNT = window.innerWidth < 768 ? 300 : 600;
  const RANGE      = 200;
  const CONNECT_D  = 55;  // max distance to draw edge

  const positions = new Float32Array(NODE_COUNT * 3);
  const velocities = [];
  for (let i = 0; i < NODE_COUNT; i++) {
    positions[i * 3]     = (Math.random() - 0.5) * RANGE * 2;
    positions[i * 3 + 1] = (Math.random() - 0.5) * RANGE * 2;
    positions[i * 3 + 2] = (Math.random() - 0.5) * RANGE;
    velocities.push(
      (Math.random() - 0.5) * 0.06,
      (Math.random() - 0.5) * 0.06,
      (Math.random() - 0.5) * 0.02
    );
  }

  /* ---- Points ---- */
  const geomPts = new THREE.BufferGeometry();
  geomPts.setAttribute('position', new THREE.BufferAttribute(positions.slice(), 3));
  const matPts = new THREE.PointsMaterial({
    color: 0x6c63ff,
    size: 2.4,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.85,
  });
  const points = new THREE.Points(geomPts, matPts);
  scene.add(points);

  /* ---- Lines (edges) ---- */
  const MAX_EDGES = NODE_COUNT * 4;
  const linePositions = new Float32Array(MAX_EDGES * 6);
  const lineColors    = new Float32Array(MAX_EDGES * 6);

  const geomLines = new THREE.BufferGeometry();
  const posAttr   = new THREE.BufferAttribute(linePositions, 3);
  const colAttr   = new THREE.BufferAttribute(lineColors, 3);
  posAttr.setUsage(THREE.DynamicDrawUsage);
  colAttr.setUsage(THREE.DynamicDrawUsage);
  geomLines.setAttribute('position', posAttr);
  geomLines.setAttribute('color', colAttr);

  const matLines = new THREE.LineSegments(
    geomLines,
    new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.35 })
  );
  scene.add(matLines);

  /* Color helpers */
  const cAccent = new THREE.Color(0x6c63ff);
  const cGold   = new THREE.Color(0xffd700);
  const cFaint  = new THREE.Color(0x2a2555);

  /* ---- Mouse / touch parallax ---- */
  const mouse = { x: 0, y: 0 };
  window.addEventListener('mousemove', (e) => {
    mouse.x = (e.clientX / window.innerWidth  - 0.5) * 2;
    mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
  });
  window.addEventListener('touchmove', (e) => {
    if (!e.touches.length) return;
    mouse.x = (e.touches[0].clientX / window.innerWidth  - 0.5) * 2;
    mouse.y = (e.touches[0].clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  /* ---- Scroll parallax ---- */
  let scrollY = 0;
  window.addEventListener('scroll', () => { scrollY = window.scrollY; }, { passive: true });

  /* ---- Animate ---- */
  let frame = 0;
  const pos = geomPts.attributes.position;

  function animate() {
    requestAnimationFrame(animate);
    frame++;

    /* Move nodes */
    for (let i = 0; i < NODE_COUNT; i++) {
      const ix = i * 3, iy = ix + 1, iz = ix + 2;
      pos.array[ix] += velocities[ix];
      pos.array[iy] += velocities[iy];
      pos.array[iz] += velocities[iz];

      // Bounce at boundary
      if (Math.abs(pos.array[ix]) > RANGE)  velocities[ix]  *= -1;
      if (Math.abs(pos.array[iy]) > RANGE)  velocities[iy]  *= -1;
      if (Math.abs(pos.array[iz]) > RANGE / 2) velocities[iz] *= -1;
    }
    pos.needsUpdate = true;

    /* Rebuild edges every 2 frames */
    if (frame % 2 === 0) {
      let edgeCount = 0;
      for (let i = 0; i < NODE_COUNT && edgeCount < MAX_EDGES; i++) {
        const ax = pos.array[i * 3], ay = pos.array[i * 3 + 1], az = pos.array[i * 3 + 2];
        for (let j = i + 1; j < NODE_COUNT && edgeCount < MAX_EDGES; j++) {
          const bx = pos.array[j * 3], by = pos.array[j * 3 + 1], bz = pos.array[j * 3 + 2];
          const dx = ax - bx, dy = ay - by, dz = az - bz;
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
          if (dist < CONNECT_D) {
            const e = edgeCount * 6;
            linePositions[e]     = ax; linePositions[e + 1] = ay; linePositions[e + 2] = az;
            linePositions[e + 3] = bx; linePositions[e + 4] = by; linePositions[e + 5] = bz;

            const alpha = 1 - dist / CONNECT_D;
            const col = alpha > 0.6 ? cAccent : alpha > 0.3 ? cGold : cFaint;
            lineColors[e]     = col.r; lineColors[e + 1] = col.g; lineColors[e + 2] = col.b;
            lineColors[e + 3] = col.r; lineColors[e + 4] = col.g; lineColors[e + 5] = col.b;
            edgeCount++;
          }
        }
      }
      geomLines.setDrawRange(0, edgeCount * 2);
      posAttr.needsUpdate = true;
      colAttr.needsUpdate = true;
    }

    /* Camera parallax */
    camera.position.x += (mouse.x * 12 - camera.position.x) * 0.04;
    camera.position.y += (-mouse.y * 12 - camera.position.y) * 0.04;
    /* Scroll parallax — scene drifts upward as user scrolls */
    scene.position.y = -scrollY * 0.05;

    renderer.render(scene, camera);
  }
  animate();
})();

/* ============================================================
   3. CURSOR GLOW
   ============================================================ */
(function initCursorGlow() {
  const glow = document.getElementById('cursor-glow');
  const hero = document.getElementById('hero');
  if (!glow || !hero) return;

  let active = false;
  hero.addEventListener('mouseenter', () => { active = true; glow.style.opacity = '1'; });
  hero.addEventListener('mouseleave', () => { active = false; glow.style.opacity = '0'; });

  window.addEventListener('mousemove', (e) => {
    if (!active) return;
    const rect = hero.getBoundingClientRect();
    glow.style.left = (e.clientX - rect.left) + 'px';
    glow.style.top  = (e.clientY - rect.top) + 'px';
  });
  glow.style.opacity = '0';
})();

/* ============================================================
   4. PROJECT CARDS — mouse-tracked radial glow
   ============================================================ */
document.querySelectorAll('.project-card').forEach((card) => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width)  * 100;
    const y = ((e.clientY - rect.top)  / rect.height) * 100;
    card.style.setProperty('--mx', x + '%');
    card.style.setProperty('--my', y + '%');
  });
});

/* ============================================================
   5. NAVIGATION — scroll state + active section
   ============================================================ */
(function initNav() {
  const nav     = document.getElementById('nav');
  const links   = nav.querySelectorAll('.nav-links a');
  const sections = Array.from(document.querySelectorAll('section[id]'));

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  const obs = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        links.forEach((l) => l.classList.toggle('active', l.getAttribute('href') === '#' + id));
      }
    });
  }, { threshold: 0.35 });

  sections.forEach((s) => obs.observe(s));
})();

/* ============================================================
   6. HAMBURGER MENU
   ============================================================ */
(function initHamburger() {
  const btn    = document.getElementById('hamburger');
  const menu   = document.getElementById('mobile-menu');
  const links  = menu.querySelectorAll('.mm-link');
  if (!btn || !menu) return;

  function toggle(open) {
    btn.classList.toggle('open', open);
    menu.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  }

  btn.addEventListener('click', () => toggle(!btn.classList.contains('open')));
  links.forEach((l) => l.addEventListener('click', () => toggle(false)));
})();

/* ============================================================
   7. TYPEWRITER TERMINAL
   ============================================================ */
(function initTypewriter() {
  const el = document.getElementById('terminal-text');
  if (!el) return;

  const lines = [
    { cmd: 'kubectl get pods --all-namespaces', comment: '  # 1,000+ VMs managed' },
    { cmd: 'git push origin main',              comment: '  # 300+ env migrations' },
    { cmd: 'dynatrace --deploy non-prod',       comment: '  # Observability champion' },
    { cmd: 'helm upgrade --install flair .',    comment: '  # Tools built from scratch' },
    { cmd: 'argocd app sync --all',             comment: '  # GitOps at scale' },
  ];

  let li = 0, ci = 0, phase = 'type'; // phases: type | wait | erase
  const SPEED_TYPE  = 55;
  const SPEED_ERASE = 22;
  const WAIT_MS     = 2400;

  function renderLine(lineIdx, charCount) {
    const { cmd, comment } = lines[lineIdx];
    const visible = (cmd + comment).slice(0, charCount);
    const cmdPart = visible.slice(0, cmd.length);
    const cmtPart = visible.slice(cmd.length);
    el.innerHTML =
      `<span class="cmd">${cmdPart}</span>` +
      (cmtPart ? `<span class="comment">${cmtPart}</span>` : '');
  }

  function tick() {
    const total = (lines[li].cmd + lines[li].comment).length;
    if (phase === 'type') {
      ci++;
      renderLine(li, ci);
      if (ci >= total) { phase = 'wait'; setTimeout(tick, WAIT_MS); return; }
      setTimeout(tick, SPEED_TYPE);
    } else if (phase === 'wait') {
      phase = 'erase';
      setTimeout(tick, SPEED_ERASE);
    } else {
      ci--;
      renderLine(li, ci);
      if (ci <= 0) {
        li = (li + 1) % lines.length;
        ci = 0;
        phase = 'type';
      }
      setTimeout(tick, SPEED_ERASE);
    }
  }
  setTimeout(tick, 900);
})();

/* ============================================================
   8. GSAP ANIMATIONS
   ============================================================ */
window.addEventListener('load', function () {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    /* Fallback: just make everything visible */
    document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .hero-eyebrow, .hero-h1 .word, .hero-tagline, .hero-pills, .hero-cta, .skill-chip, .cert-chip').forEach((el) => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  /* ---- Hero entrance ---- */
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  tl.to('.hero-eyebrow', { opacity: 1, y: 0, duration: 0.7, delay: 0.3 })
    .to('#hero-h1 .word', {
      opacity: 1,
      y: 0,
      duration: 0.65,
      stagger: 0.12,
    }, '-=0.2')
    .to('.hero-tagline', { opacity: 1, duration: 0.6 }, '-=0.2')
    .to('.hero-pills',   { opacity: 1, duration: 0.5 }, '-=0.3')
    .to('.hero-cta',     { opacity: 1, y: 0, duration: 0.5 }, '-=0.2');

  /* ---- Generic reveal (fade up) ---- */
  gsap.utils.toArray('.reveal').forEach((el) => {
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 0.75,
      ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' },
    });
  });

  gsap.utils.toArray('.reveal-left').forEach((el) => {
    gsap.to(el, {
      opacity: 1,
      x: 0,
      duration: 0.75,
      ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' },
    });
  });

  gsap.utils.toArray('.reveal-right').forEach((el) => {
    gsap.to(el, {
      opacity: 1,
      x: 0,
      duration: 0.75,
      ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' },
    });
  });

  /* ---- Timeline spine draw ---- */
  const spine = document.getElementById('spine-fill');
  if (spine) {
    const timeline = document.querySelector('.timeline');
    ScrollTrigger.create({
      trigger: timeline,
      start: 'top 80%',
      end: 'bottom 20%',
      onUpdate: (self) => {
        spine.style.height = (self.progress * 100) + '%';
      },
    });
  }

  /* ---- Skill chips — staggered per category ---- */
  document.querySelectorAll('[data-stagger]').forEach((group) => {
    const chips = group.querySelectorAll('.skill-chip');
    gsap.to(chips, {
      opacity: 1,
      y: 0,
      duration: 0.5,
      stagger: 0.06,
      ease: 'back.out(1.4)',
      scrollTrigger: { trigger: group, start: 'top 90%', toggleActions: 'play none none none' },
    });
  });

  /* ---- Cert chips ---- */
  gsap.to('.cert-chip', {
    opacity: 1,
    y: 0,
    duration: 0.5,
    stagger: 0.1,
    ease: 'back.out(1.4)',
    scrollTrigger: { trigger: '.certs-row', start: 'top 90%', toggleActions: 'play none none none' },
  });
});
