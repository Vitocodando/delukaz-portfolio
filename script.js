/* ============================================
   DJ NOVA — Portfolio Website
   JavaScript — Interactivity & Animations
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initScrollReveal();
  initParticles();
  initGalleryCarousel();
  initLightbox();
  initMiniPlayer();
  initContactForm();
  initSmoothScroll();
});

/* ============================================
   NAVBAR
   ============================================ */
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');

  // Scroll effect
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;
    if (currentScroll > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    lastScroll = currentScroll;
  }, { passive: true });

  // Mobile toggle
  navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    navLinks.classList.toggle('open');
    document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
  });

  // Close mobile nav on link click
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navToggle.classList.remove('active');
      navLinks.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
}

/* ============================================
   SCROLL REVEAL ANIMATIONS
   ============================================ */
function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  });

  reveals.forEach(el => observer.observe(el));
}

/* ============================================
   PARTICLE CANVAS (Hero Background)
   ============================================ */
function initParticles() {
  const canvas = document.getElementById('hero-particles');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let particles = [];
  let animationId;
  let mouseX = 0;
  let mouseY = 0;

  function resize() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }

  resize();
  window.addEventListener('resize', resize);

  // Track mouse position
  canvas.parentElement.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
  });

  class Particle {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 2 + 0.5;
      this.speedX = (Math.random() - 0.5) * 0.5;
      this.speedY = (Math.random() - 0.5) * 0.5;
      this.opacity = Math.random() * 0.5 + 0.1;
      this.hue = Math.random() > 0.5 ? 22 : 319; // peach or magenta
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;

      // Mouse interaction — gentle push
      const dx = this.x - mouseX;
      const dy = this.y - mouseY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 120) {
        const force = (120 - dist) / 120 * 0.3;
        this.x += dx / dist * force;
        this.y += dy / dist * force;
      }

      // Wrap around
      if (this.x < 0) this.x = canvas.width;
      if (this.x > canvas.width) this.x = 0;
      if (this.y < 0) this.y = canvas.height;
      if (this.y > canvas.height) this.y = 0;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${this.hue}, 100%, 70%, ${this.opacity})`;
      ctx.fill();
    }
  }

  // Create particles
  const particleCount = Math.min(80, Math.floor(canvas.width * canvas.height / 15000));
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 150) {
          const opacity = (1 - dist / 150) * 0.15;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(237, 158, 111, ${opacity})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(p => {
      p.update();
      p.draw();
    });

    drawConnections();
    animationId = requestAnimationFrame(animate);
  }

  animate();

  // Cleanup on page hide
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(animationId);
    } else {
      animate();
    }
  });
}

/* ============================================
   GALLERY CAROUSEL
   ============================================ */
function initGalleryCarousel() {
  const track = document.querySelector('.gallery-track');
  const slides = document.querySelectorAll('.gallery-slide');
  const dots = document.querySelectorAll('.gallery-dot');
  const prevBtn = document.querySelector('.gallery-nav.prev');
  const nextBtn = document.querySelector('.gallery-nav.next');

  if (!track || slides.length === 0) return;

  let currentSlide = 0;
  let startX = 0;
  let isDragging = false;
  let autoplayTimer;

  function goToSlide(index) {
    if (index < 0) index = slides.length - 1;
    if (index >= slides.length) index = 0;
    currentSlide = index;
    track.style.transform = `translateX(-${currentSlide * 100}%)`;

    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === currentSlide);
    });
  }

  function nextSlide() {
    goToSlide(currentSlide + 1);
  }

  function prevSlide() {
    goToSlide(currentSlide - 1);
  }

  // Navigation buttons
  if (nextBtn) nextBtn.addEventListener('click', () => { nextSlide(); resetAutoplay(); });
  if (prevBtn) prevBtn.addEventListener('click', () => { prevSlide(); resetAutoplay(); });

  // Dots
  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => { goToSlide(i); resetAutoplay(); });
  });

  // Touch/Swipe support
  const carousel = document.querySelector('.gallery-carousel');
  if (carousel) {
    carousel.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      isDragging = true;
    }, { passive: true });

    carousel.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
    }, { passive: true });

    carousel.addEventListener('touchend', (e) => {
      if (!isDragging) return;
      isDragging = false;
      const endX = e.changedTouches[0].clientX;
      const diff = startX - endX;

      if (Math.abs(diff) > 50) {
        if (diff > 0) nextSlide();
        else prevSlide();
        resetAutoplay();
      }
    });
  }

  // Keyboard
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { prevSlide(); resetAutoplay(); }
    if (e.key === 'ArrowRight') { nextSlide(); resetAutoplay(); }
  });

  // Autoplay
  function startAutoplay() {
    autoplayTimer = setInterval(nextSlide, 5000);
  }

  function resetAutoplay() {
    clearInterval(autoplayTimer);
    startAutoplay();
  }

  startAutoplay();
}

/* ============================================
   LIGHTBOX
   ============================================ */
function initLightbox() {
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxClose = document.querySelector('.lightbox-close');
  const gallerySlides = document.querySelectorAll('.gallery-slide img');

  if (!lightbox) return;

  gallerySlides.forEach(img => {
    img.style.cursor = 'zoom-in';
    img.addEventListener('click', () => {
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
      lightbox.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  });

  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('open')) {
      closeLightbox();
    }
  });
}

/* ============================================
   MINI PLAYER
   ============================================ */
function initMiniPlayer() {
  const miniPlayer = document.querySelector('.mini-player');
  const playerSection = document.querySelector('.player-section');

  if (!miniPlayer || !playerSection) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      // Show mini player when player section is NOT visible
      if (!entry.isIntersecting && window.scrollY > playerSection.offsetTop) {
        miniPlayer.classList.add('visible');
      } else {
        miniPlayer.classList.remove('visible');
      }
    });
  }, {
    threshold: 0.1
  });

  observer.observe(playerSection);
}

/* ============================================
   CONTACT FORM
   ============================================ */
function initContactForm() {
  const form = document.getElementById('booking-form');
  const formContent = document.querySelector('.form-fields');
  const formSuccess = document.querySelector('.form-success');

  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Validate required fields
    const requiredFields = form.querySelectorAll('[required]');
    let valid = true;

    requiredFields.forEach(field => {
      if (!field.value.trim()) {
        valid = false;
        field.style.borderColor = 'var(--accent-magenta)';
        field.addEventListener('input', function handler() {
          field.style.borderColor = '';
          field.removeEventListener('input', handler);
        });
      }
    });

    if (!valid) return;

    // Extract data for WhatsApp
    const date = document.getElementById('contact-date').value;
    
    const eventTypeSelect = document.getElementById('contact-event-type');
    const eventType = eventTypeSelect.options[eventTypeSelect.selectedIndex].text;
    
    const city = document.getElementById('contact-city').value;
    
    const budgetSelect = document.getElementById('contact-budget');
    const budget = budgetSelect.value ? budgetSelect.options[budgetSelect.selectedIndex].text : 'Não informado';
    
    const message = document.getElementById('contact-message').value || 'Sem mensagem adicional';

    // Create WhatsApp text
    let waText = `Olá, DLUKZ! Gostaria de solicitar um orçamento:\n\n`;
    waText += `*Data do Evento:* ${date}\n`;
    waText += `*Tipo de Evento:* ${eventType}\n`;
    waText += `*Cidade:* ${city}\n`;
    waText += `*Orçamento Previsto:* ${budget}\n`;
    waText += `*Mensagem:* ${message}`;

    // NOTA: Substitua pelo número real do WhatsApp (apenas números, com DDI + DDD. Ex: 5511999999999)
    const waNumber = '556285524044'; 
    const waLink = `https://wa.me/${waNumber}?text=${encodeURIComponent(waText)}`;

    // Update button state
    const submitBtn = form.querySelector('.btn-primary');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="btn-icon" style="animation: spin 1s linear infinite">
        <path d="M12 2a10 10 0 1 0 10 10" stroke-linecap="round"/>
      </svg>
      Redirecionando...
    `;
    submitBtn.disabled = true;

    setTimeout(() => {
      if (formContent) formContent.style.display = 'none';
      if (formSuccess) formSuccess.classList.add('show');
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
      
      // Open WhatsApp in a new tab
      window.open(waLink, '_blank');
    }, 1000);
  });

  // Real-time validation feedback
  form.querySelectorAll('.form-input').forEach(input => {
    input.addEventListener('blur', () => {
      if (input.hasAttribute('required') && !input.value.trim()) {
        input.style.borderColor = 'rgba(224, 64, 251, 0.5)';
      } else {
        input.style.borderColor = '';
      }
    });

    input.addEventListener('focus', () => {
      input.style.borderColor = '';
    });
  });
}

/* ============================================
   SMOOTH SCROLL
   ============================================ */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = anchor.getAttribute('href');
      const target = document.querySelector(targetId);
      if (target) {
        const offset = 80; // navbar height
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });
}

/* ============================================
   SPIN ANIMATION (for loading button)
   ============================================ */
const spinStyle = document.createElement('style');
spinStyle.textContent = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(spinStyle);
