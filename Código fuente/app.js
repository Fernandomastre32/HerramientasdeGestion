/* ==========================================================================
   TICO INTERACTIVE LOGIC — app.js
   Premium interactions: Sticky scroll, bubble game, testimonials,
   reveal animations, scroll progress, nav scrollspy, Tico widget
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* =====================================================================
     1. SCROLL PROGRESS BAR
     ===================================================================== */
  const progressBar = document.getElementById('scroll-progress');

  function updateProgressBar() {
    if (!progressBar) return;
    const totalH = document.documentElement.scrollHeight - window.innerHeight;
    const pct = totalH > 0 ? (window.scrollY / totalH) * 100 : 0;
    progressBar.style.width = pct + '%';
  }

  /* =====================================================================
     2. NAVBAR SCROLLED STATE + SCROLLSPY
     ===================================================================== */
  const nav = document.getElementById('main-nav');
  const navLinks = document.querySelectorAll('.nav-link');

  function updateNav() {
    if (window.scrollY > 60) {
      nav?.classList.add('scrolled');
    } else {
      nav?.classList.remove('scrolled');
    }
  }

  function updateScrollspy() {
    const sections = document.querySelectorAll('section[id]');
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 120;
      if (window.scrollY >= sectionTop) current = section.id;
    });
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  }

  /* =====================================================================
     3. MOBILE MENU TOGGLE
     ===================================================================== */
  const menuToggle = document.getElementById('menu-toggle');
  const navLinksContainer = document.getElementById('nav-links');

  if (menuToggle && navLinksContainer) {
    menuToggle.addEventListener('click', () => {
      const isOpen = navLinksContainer.classList.toggle('open');
      menuToggle.classList.toggle('open', isOpen);
      menuToggle.setAttribute('aria-expanded', isOpen);
    });

    navLinksContainer.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navLinksContainer.classList.remove('open');
        menuToggle.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', false);
      });
    });

    // Close menu on backdrop click
    document.addEventListener('click', (e) => {
      if (navLinksContainer.classList.contains('open')
          && !navLinksContainer.contains(e.target)
          && !menuToggle.contains(e.target)) {
        navLinksContainer.classList.remove('open');
        menuToggle.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', false);
      }
    });
  }

  /* =====================================================================
     4. REVEAL ON SCROLL (IntersectionObserver)
     ===================================================================== */
  const revealElements = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const delay = parseInt(entry.target.dataset.delay || '0');
          setTimeout(() => {
            entry.target.classList.add('visible');
          }, delay);
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.10, rootMargin: '0px 0px -40px 0px' });

    revealElements.forEach(el => revealObserver.observe(el));
  } else {
    revealElements.forEach(el => el.classList.add('visible'));
  }

  /* =====================================================================
     5. COUNTER ANIMATION FOR STATS BAND
     ===================================================================== */
  const counters = document.querySelectorAll('.stat-number[data-target]');

  function animateCounter(el) {
    const target = parseFloat(el.dataset.target);
    const duration = 1800;
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = eased * target;

      el.textContent = Number.isInteger(target) ? Math.round(current) : current.toFixed(1);

      if (progress < 1) requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
  }

  if ('IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(counter => counterObserver.observe(counter));
  }

  /* =====================================================================
     6. TESTIMONIALS SLIDER
     ===================================================================== */
  const tSlides = document.querySelectorAll('.testimonial-slide');
  const tDots   = document.querySelectorAll('.t-dot');
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  let currentSlide = 0;
  let autoSlideTimer;

  function showSlide(idx) {
    if (idx >= tSlides.length) idx = 0;
    if (idx < 0) idx = tSlides.length - 1;
    currentSlide = idx;

    tSlides.forEach(s => s.classList.remove('active'));
    tDots.forEach(d => d.classList.remove('active'));

    tSlides[currentSlide]?.classList.add('active');
    tDots[currentSlide]?.classList.add('active');
  }

  function startAutoSlide() {
    clearInterval(autoSlideTimer);
    autoSlideTimer = setInterval(() => showSlide(currentSlide + 1), 7000);
  }

  prevBtn?.addEventListener('click', () => { showSlide(currentSlide - 1); startAutoSlide(); });
  nextBtn?.addEventListener('click', () => { showSlide(currentSlide + 1); startAutoSlide(); });

  tDots.forEach((dot, idx) => {
    dot.addEventListener('click', () => { showSlide(idx); startAutoSlide(); });
  });

  if (tSlides.length > 0) startAutoSlide();

  // Swipe support for testimonials
  const testimonialCard = document.querySelector('.testimonial-card');
  if (testimonialCard) {
    let touchStartX = 0;
    testimonialCard.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
    testimonialCard.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].screenX - touchStartX;
      if (Math.abs(dx) > 50) {
        dx < 0 ? showSlide(currentSlide + 1) : showSlide(currentSlide - 1);
        startAutoSlide();
      }
    }, { passive: true });
  }

  /* =====================================================================
     7. STICKY SCROLL SCREENSHOTS
     ===================================================================== */
  const stickySection = document.getElementById('screenshots-section');
  const tabSlides     = document.querySelectorAll('.tab-slide');
  const indicators    = document.querySelectorAll('.scroll-indicator');
  const captionText   = document.getElementById('caption-text');

  const captions = [
    'Pantalla de inicio: Conoce a Tico el robot amigo',
    'Diálogo de bienvenida e introducción interactiva',
    'Instrucciones interactivas para el niño',
    'Detección y explosión de burbujas en pantalla',
    'Mensajes motivadores: "¡Excelente! ¡Sigue así!"',
    'Reforzamiento conductual en tiempo real',
    'Pantalla final de métricas y puntuación clínica'
  ];

  function updateStickyScroll() {
    if (!stickySection) return;

    const isMobile = window.innerWidth <= 1100;
    if (isMobile) return;

    const rect = stickySection.getBoundingClientRect();
    const sectionH = stickySection.clientHeight;
    const vpH = window.innerHeight;
    const totalScrollable = sectionH - vpH;
    if (totalScrollable <= 0) return;

    let progress = -rect.top / totalScrollable;
    progress = Math.max(0, Math.min(1, progress));

    const totalSteps = tabSlides.length;
    const activeIdx = Math.min(Math.floor(progress * totalSteps), totalSteps - 1);

    tabSlides.forEach((img, i) => {
      img.classList.toggle('active', i === activeIdx);
    });

    indicators.forEach((ind, i) => {
      ind.classList.toggle('active', i === activeIdx);
    });

    if (captionText && captions[activeIdx]) {
      captionText.textContent = captions[activeIdx];
    }
  }

  // Indicator click-to-scroll
  indicators.forEach((ind, idx) => {
    ind.addEventListener('click', () => {
      if (!stickySection || window.innerWidth <= 1100) return;
      const sectionH = stickySection.clientHeight;
      const vpH = window.innerHeight;
      const totalScrollable = sectionH - vpH;
      const targetY = stickySection.offsetTop + (idx / tabSlides.length) * totalScrollable;
      window.scrollTo({ top: targetY, behavior: 'smooth' });
    });
  });

  // On mobile: use a simple auto-cycling carousel instead of sticky scroll
  let mobileCarouselIdx = 0;
  let mobileCarouselTimer;

  function startMobileCarousel() {
    if (window.innerWidth > 1100) return;
    mobileCarouselTimer = setInterval(() => {
      mobileCarouselIdx = (mobileCarouselIdx + 1) % tabSlides.length;
      tabSlides.forEach((img, i) => img.classList.toggle('active', i === mobileCarouselIdx));
      indicators.forEach((ind, i) => ind.classList.toggle('active', i === mobileCarouselIdx));
      if (captionText) captionText.textContent = captions[mobileCarouselIdx];
    }, 2500);
  }

  function stopMobileCarousel() { clearInterval(mobileCarouselTimer); }

  if (window.innerWidth <= 1100) {
    startMobileCarousel();
  }

  /* =====================================================================
     8. INTERACTIVE BUBBLE GAME
     ===================================================================== */
  const startOverlay   = document.getElementById('game-start-overlay');
  const startGameBtn   = document.getElementById('start-game-btn');
  const restartGameBtn = document.getElementById('restart-game-btn');
  const gameArea       = document.getElementById('bubble-game-area');
  const scoreDisplay   = document.getElementById('game-score');

  let gameScore = 0;
  let isGameActive = false;
  let activeBubbles = [];
  let spawnTimer, updateTimer;

  // Web Audio API pop sound
  function playPopSound() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(350, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1500, ctx.currentTime + 0.07);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.09);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch (_) { /* silently ignore */ }
  }

  function showScoreParticle(x, y, points) {
    if (!gameArea) return;
    const p = document.createElement('div');
    p.className = 'game-pop-particle';
    p.textContent = `+${points}`;
    p.style.left = `${x}px`;
    p.style.bottom = `${y}px`;
    p.style.color = ['#6FBBB9', '#E7AFB5', '#B9D2B1', '#B388FF', '#FFB74D'][Math.floor(Math.random() * 5)];
    gameArea.appendChild(p);
    setTimeout(() => p.remove(), 700);
  }

  function spawnBubble() {
    if (!isGameActive || !gameArea) return;

    const types = [
      { bg: 'rgba(179,136,255,0.75)', border: '#B388FF' },
      { bg: 'rgba(129,199,132,0.75)', border: '#81C784' },
      { bg: 'rgba(255,183,77,0.75)',  border: '#FFB74D' },
      { bg: 'rgba(111,187,185,0.75)', border: '#6FBBB9' },
      { bg: 'rgba(231,175,181,0.75)', border: '#E7AFB5' }
    ];
    const type  = types[Math.floor(Math.random() * types.length)];
    const size  = Math.floor(Math.random() * 24) + 34; // 34–58 px
    const speed = Math.random() * 1.8 + 1.0;

    const el = document.createElement('div');
    el.className = 'game-bubble';
    el.style.cssText = `
      width:${size}px; height:${size}px;
      background:${type.bg};
      border:2.5px solid ${type.border};
      box-shadow:0 4px 14px ${type.border}55;
    `;

    const areaW = gameArea.clientWidth;
    const startX = Math.max(0, Math.floor(Math.random() * (areaW - size)));
    el.style.left   = `${startX}px`;
    el.style.bottom = '-70px';

    let posY = -70;

    const bubbleObj = { el, posY, speed };

    el.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!isGameActive) return;

      playPopSound();
      showScoreParticle(startX + size / 2, posY + size / 2, 10);

      gameScore += 10;
      if (scoreDisplay) scoreDisplay.textContent = gameScore;

      // Milestone messages
      if (gameScore > 0 && gameScore % 50 === 0) {
        showTicoMessage(`¡Increíble! Llevas ${gameScore} puntos. ¡Sigue así! 🎉`);
      }

      el.style.transform = 'scale(0)';
      el.style.opacity = '0';
      setTimeout(() => el.remove(), 160);

      activeBubbles = activeBubbles.filter(b => b !== bubbleObj);
    });

    gameArea.appendChild(el);
    activeBubbles.push(bubbleObj);
  }

  function moveBubbles() {
    if (!isGameActive || !gameArea) return;
    const areaH = gameArea.clientHeight;

    activeBubbles = activeBubbles.filter(b => {
      b.posY += b.speed;
      b.el.style.bottom = `${b.posY}px`;

      if (b.posY > areaH + 10) {
        b.el.remove();
        return false;
      }
      return true;
    });
  }

  function startGame() {
    isGameActive = true;
    gameScore = 0;
    if (scoreDisplay) scoreDisplay.textContent = 0;
    activeBubbles.forEach(b => b.el.remove());
    activeBubbles = [];

    spawnTimer  = setInterval(spawnBubble, 1200);
    updateTimer = setInterval(moveBubbles, 16); // ~60fps
  }

  function stopGame() {
    isGameActive = false;
    clearInterval(spawnTimer);
    clearInterval(updateTimer);
    activeBubbles.forEach(b => b.el.remove());
    activeBubbles = [];
  }

  startGameBtn?.addEventListener('click', () => {
    startOverlay.style.opacity = '0';
    setTimeout(() => {
      startOverlay.style.display = 'none';
      startGame();
    }, 280);
  });

  restartGameBtn?.addEventListener('click', () => {
    stopGame();
    if (startOverlay) {
      startOverlay.style.display = 'flex';
      startOverlay.style.opacity = '1';
    }
  });

  /* =====================================================================
     9. TICO CHAT WIDGET
     ===================================================================== */
  const ticoWidget = document.getElementById('tico-widget');
  const ticoDialog = document.getElementById('tico-dialog');
  const ticoBtn    = document.getElementById('tico-btn');
  const ticoClose  = document.getElementById('tico-close');
  const ticoMsg    = document.getElementById('tico-msg');

  const sectionMessages = {
    'inicio': '¡Hola! Soy Tico, tu robot amigo. ¿Quieres conocer mi plataforma terapéutica?',
    'tdo': '¿Sabías que el 7.7% de niños en México presenta rasgos del TDO sin diagnóstico formal?',
    'propuesta': 'Mis 6 módulos de evaluación están diseñados con base en metodologías de TCC clínica. 🧠',
    'videojuego': '¡Prueba el juego de burbujas a tu lado! Mide tu concentración jugando. 🎮',
    'nosotros': 'Somos tecnología y psicología unidas para ayudar a los niños. ¡Una misión increíble!',
    'contacto': '¡Hagamos alianzas! Llena el formulario y charlemos sobre cómo colaborar. 🚀'
  };

  const funFacts = [
    '¡Hola! ¿Tienes alguna pregunta sobre TICO? ¡Pulsa aquí para saber más!',
    'El TDO es uno de los trastornos conductuales más frecuentes en la infancia. ¡Podemos detectarlo! 🔍',
    'Mi videojuego evalúa la tolerancia a la frustración y el control de impulsos en tiempo real. 🎮',
    'Los terapeutas reciben reportes clínicos detallados al finalizar cada sesión de juego. 📊',
    'Estoy diseñado para niños de 5 a 17 años, la etapa más vulnerable para el TDO. 👦',
    '¿Te interesa una demostración? ¡Llena el formulario y hablemos! 🤝'
  ];

  let factIdx = 0;
  let currentSection = 'inicio';
  let dialogVisible = false;

  function showTicoMessage(msg) {
    if (!ticoMsg || !ticoDialog) return;
    ticoMsg.textContent = msg;
    ticoDialog.classList.add('show');
    dialogVisible = true;
  }

  function hideTicoDialog() {
    ticoDialog?.classList.remove('show');
    dialogVisible = false;
  }

  // Show welcome message after 3s
  setTimeout(() => {
    showTicoMessage(sectionMessages[currentSection] || funFacts[0]);
    setTimeout(hideTicoDialog, 8000);
  }, 3000);

  ticoBtn?.addEventListener('click', () => {
    if (dialogVisible) {
      hideTicoDialog();
    } else {
      factIdx = (factIdx + 1) % funFacts.length;
      showTicoMessage(funFacts[factIdx]);
      setTimeout(hideTicoDialog, 8000);
    }
  });

  ticoClose?.addEventListener('click', (e) => {
    e.stopPropagation();
    hideTicoDialog();
  });

  // Update Tico message on section change
  function updateTicoOnSection(sectionId) {
    if (sectionId !== currentSection && sectionMessages[sectionId]) {
      currentSection = sectionId;
      if (dialogVisible && ticoDialog) {
        showTicoMessage(sectionMessages[sectionId]);
      }
    }
  }

  /* =====================================================================
     10. CONTACT FORM WITH VALIDATION
     ===================================================================== */
  const allianceForm = document.getElementById('alliance-form');
  const submitBtn    = document.getElementById('submit-btn');
  const formSuccess  = document.getElementById('form-success');

  allianceForm?.querySelectorAll('input, textarea').forEach(field => {
    field.addEventListener('focus', () => {
      field.closest('.form-group')?.classList.add('focused');
    });
    field.addEventListener('blur', () => {
      field.closest('.form-group')?.classList.remove('focused');
    });
    field.addEventListener('input', () => {
      field.closest('.form-group')?.classList.remove('invalid');
    });
  });

  allianceForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    let isValid = true;

    allianceForm.querySelectorAll('input[required], textarea[required]').forEach(field => {
      const group = field.closest('.form-group');
      let fieldValid = field.value.trim() !== '';

      if (field.type === 'email' && field.value.trim()) {
        fieldValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value.trim());
      }

      if (!fieldValid) {
        group?.classList.add('invalid');
        isValid = false;
      } else {
        group?.classList.remove('invalid');
      }
    });

    if (!isValid) {
      const firstError = allianceForm.querySelector('.form-group.invalid input, .form-group.invalid textarea');
      firstError?.focus();
      return;
    }

    // Simulate submit
    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando...';

    setTimeout(() => {
      allianceForm.reset();
      submitBtn.disabled = false;
      submitBtn.textContent = 'Enviar Mensaje';

      if (formSuccess) {
        formSuccess.classList.add('show');
        setTimeout(() => formSuccess.classList.remove('show'), 6000);
      }

      showTicoMessage('¡He recibido tu mensaje! Te escribiré muy pronto al correo. 🚀');
      setTimeout(hideTicoDialog, 8000);
    }, 1800);
  });

  /* =====================================================================
     11. MAIN SCROLL HANDLER (RAF-throttled)
     ===================================================================== */
  let rafPending = false;

  function onScroll() {
    if (rafPending) return;
    rafPending = true;
    requestAnimationFrame(() => {
      updateProgressBar();
      updateNav();
      updateScrollspy();
      updateStickyScroll();

      // Update Tico widget based on active section
      const sections = document.querySelectorAll('section[id]');
      let visibleSection = 'inicio';
      sections.forEach(sec => {
        if (window.scrollY >= sec.offsetTop - 150) visibleSection = sec.id;
      });
      updateTicoOnSection(visibleSection);

      rafPending = false;
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  // Initial calls
  updateProgressBar();
  updateNav();
  updateScrollspy();

  /* =====================================================================
     12. KEYBOARD ACCESSIBILITY (ESC to close menus/dialogs)
     ===================================================================== */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      navLinksContainer?.classList.remove('open');
      menuToggle?.classList.remove('open');
      hideTicoDialog();
    }
  });

  /* =====================================================================
     13. RESIZE HANDLER
     ===================================================================== */
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      // Stop/start mobile carousel based on viewport
      if (window.innerWidth <= 1100) {
        if (!mobileCarouselTimer) startMobileCarousel();
      } else {
        stopMobileCarousel();
      }
    }, 200);
  });

  /* =====================================================================
     14. SMOOTH HOVER TILT ON CARDS (service cards)
     ===================================================================== */
  document.querySelectorAll('.service-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      const maxTilt = 6;
      const rotateX = -(y / rect.height) * maxTilt;
      const rotateY = (x / rect.width) * maxTilt;
      card.style.transform = `translateY(-8px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      card.style.transition = 'box-shadow 0.3s, border-color 0.3s';
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
    });
  });

  /* =====================================================================
     15. ARTICLE CARD PARALLAX EFFECT
     ===================================================================== */
  document.querySelectorAll('.article-card .article-img').forEach(img => {
    const card = img.closest('.article-card');
    card?.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const y = (e.clientY - rect.top) / rect.height;
      img.style.transform = `scale(1.07) translateY(${(y - 0.5) * -10}px)`;
    });
    card?.addEventListener('mouseleave', () => {
      img.style.transform = '';
    });
  });

});
