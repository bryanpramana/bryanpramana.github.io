/* ============================================================
   hero-scene.js — Three.js network mesh hero background
   Deps: THREE (CDN), window.SITE_DATA (data.js)
   ============================================================ */

(function initHeroScene() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const cfg = window.SITE_DATA.heroScene;
  const isMobile = window.innerWidth < 768;
  const NODE_COUNT   = isMobile ? cfg.nodeCountMobile : cfg.nodeCountDesktop;
  const RANGE        = cfg.range;
  const CONNECT_D    = cfg.connectDistance;

  /* ---- Renderer ---- */
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000);
  camera.position.z = cfg.cameraZ;

  /* ---- Resize ---- */
  function resize() {
    const w = canvas.parentElement.offsetWidth || window.innerWidth;
    const h = canvas.parentElement.offsetHeight || window.innerHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  /* ---- Node positions + velocities ---- */
  const positions  = new Float32Array(NODE_COUNT * 3);
  const velocities = new Float32Array(NODE_COUNT * 3);

  for (let i = 0; i < NODE_COUNT; i++) {
    const ix = i * 3;
    positions[ix]     = (Math.random() - 0.5) * RANGE * 2;
    positions[ix + 1] = (Math.random() - 0.5) * RANGE * 2;
    positions[ix + 2] = (Math.random() - 0.5) * RANGE;
    velocities[ix]     = (Math.random() - 0.5) * 0.06;
    velocities[ix + 1] = (Math.random() - 0.5) * 0.06;
    velocities[ix + 2] = (Math.random() - 0.5) * 0.02;
  }

  /* ---- Points ---- */
  const geomPts = new THREE.BufferGeometry();
  geomPts.setAttribute('position', new THREE.BufferAttribute(positions.slice(), 3));
  const points = new THREE.Points(geomPts, new THREE.PointsMaterial({
    color: 0x6c63ff,
    size: 2.4,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.85,
  }));
  scene.add(points);

  /* ---- Lines ---- */
  const MAX_EDGES     = NODE_COUNT * 4;
  const linePositions = new Float32Array(MAX_EDGES * 6);
  const lineColors    = new Float32Array(MAX_EDGES * 6);

  const geomLines = new THREE.BufferGeometry();
  const posAttr   = new THREE.BufferAttribute(linePositions, 3);
  const colAttr   = new THREE.BufferAttribute(lineColors, 3);
  posAttr.setUsage(THREE.DynamicDrawUsage);
  colAttr.setUsage(THREE.DynamicDrawUsage);
  geomLines.setAttribute('position', posAttr);
  geomLines.setAttribute('color', colAttr);

  const lines = new THREE.LineSegments(
    geomLines,
    new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.35 })
  );
  scene.add(lines);

  const cAccent = new THREE.Color(0x6c63ff);
  const cGold   = new THREE.Color(0xffd700);
  const cFaint  = new THREE.Color(0x2a2555);

  /* ---- Mouse/touch parallax ---- */
  const mouse = { x: 0, y: 0 };
  window.addEventListener('mousemove', (e) => {
    mouse.x = (e.clientX / window.innerWidth  - 0.5) * 2;
    mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });
  window.addEventListener('touchmove', (e) => {
    if (!e.touches.length) return;
    mouse.x = (e.touches[0].clientX / window.innerWidth  - 0.5) * 2;
    mouse.y = (e.touches[0].clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  /* ---- Scroll parallax ---- */
  let scrollY = 0;
  window.addEventListener('scroll', () => { scrollY = window.scrollY; }, { passive: true });

  /* ---- Page visibility — pause when tab hidden ---- */
  let paused = false;
  document.addEventListener('visibilitychange', () => { paused = document.hidden; });

  /* ---- Animate ---- */
  let frame = 0;
  const pos = geomPts.attributes.position;

  function animate() {
    requestAnimationFrame(animate);
    if (paused) return;
    frame++;

    for (let i = 0; i < NODE_COUNT; i++) {
      const ix = i * 3;
      pos.array[ix]     += velocities[ix];
      pos.array[ix + 1] += velocities[ix + 1];
      pos.array[ix + 2] += velocities[ix + 2];

      if (Math.abs(pos.array[ix])     > RANGE)     velocities[ix]     *= -1;
      if (Math.abs(pos.array[ix + 1]) > RANGE)     velocities[ix + 1] *= -1;
      if (Math.abs(pos.array[ix + 2]) > RANGE / 2) velocities[ix + 2] *= -1;
    }
    pos.needsUpdate = true;

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
            const col   = alpha > 0.6 ? cAccent : alpha > 0.3 ? cGold : cFaint;
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

    camera.position.x += (mouse.x * cfg.parallaxStrength - camera.position.x) * cfg.parallaxEase;
    camera.position.y += (-mouse.y * cfg.parallaxStrength - camera.position.y) * cfg.parallaxEase;
    scene.position.y   = -scrollY * cfg.scrollParallax;

    renderer.render(scene, camera);
  }
  animate();
})();
