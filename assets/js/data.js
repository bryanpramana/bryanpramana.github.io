/* ============================================================
   data.js — All site content: terminal lines, config
   No DOM access. No external deps. Loaded first.
   ============================================================ */

window.SITE_DATA = {

  /* ---- Three.js scene config ---- */
  heroScene: {
    nodeCountDesktop: 600,
    nodeCountMobile:  300,
    range:            200,
    connectDistance:  55,
    cameraZ:          220,
    parallaxStrength: 12,
    parallaxEase:     0.04,
    scrollParallax:   0.05,
  },

  /* ---- Typewriter terminal lines ---- */
  terminalLines: [
    { cmd: 'kubectl get pods --all-namespaces',    comment: '  # 1,000+ VMs managed'        },
    { cmd: 'git push origin main',                 comment: '  # 300+ env migrations'        },
    { cmd: 'dynatrace --deploy non-prod',          comment: '  # Observability champion'     },
    { cmd: 'helm upgrade --install flair .',       comment: '  # Tools built from scratch'   },
    { cmd: 'argocd app sync --all',                comment: '  # GitOps at scale'            },
    { cmd: 'velero backup get --all-namespaces',   comment: '  # Disaster recovery ready'    },
  ],

  /* ---- Typewriter speeds (ms) ---- */
  typewriter: {
    speedType:  55,
    speedErase: 22,
    waitMs:     2400,
    startDelay: 900,
  },

  /* ---- GSAP animation config ---- */
  gsap: {
    revealDuration:    0.75,
    revealEase:        'power2.out',
    staggerDuration:   0.50,
    staggerEase:       'back.out(1.4)',
    chipStagger:       0.06,
    certStagger:       0.10,
    heroWordDuration:  0.65,
    heroWordStagger:   0.12,
    scrollStart:       'top 88%',
    chipScrollStart:   'top 90%',
  },

};
