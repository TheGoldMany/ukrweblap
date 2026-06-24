/* ═══════════════════════════════════════════════════════════════
   UKR — Landing interactions
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  /* ── Navbar scroll state ───────────────────────────────────── */
  const navbar = $('#navbar');
  const onScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 16);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ── Mobile menu ───────────────────────────────────────────── */
  const burger = $('#burger');
  const menu = $('#mobileMenu');
  const toggleMenu = (open) => {
    const isOpen = open ?? !menu.classList.contains('open');
    menu.classList.toggle('open', isOpen);
    burger.classList.toggle('open', isOpen);
    burger.setAttribute('aria-expanded', String(isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  };
  burger.addEventListener('click', () => toggleMenu());
  $$('.mobile-link').forEach(l => l.addEventListener('click', () => toggleMenu(false)));

  /* ── Announcement bar close ────────────────────────────────── */
  const announce = $('#announce');
  const closeBtn = $('#announceClose');
  if (sessionStorage.getItem('ukr_announce') === 'closed') announce.classList.add('hidden');
  closeBtn?.addEventListener('click', () => {
    announce.classList.add('hidden');
    sessionStorage.setItem('ukr_announce', 'closed');
  });

  /* ── Portfolio filter ──────────────────────────────────────── */
  const filterBtns = $$('.filter-btn');
  const cards = $$('.portfolio-card');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const f = btn.dataset.filter;
      cards.forEach(card => {
        const show = f === 'all' || card.dataset.cat === f;
        card.style.display = show ? '' : 'none';
      });
    });
  });

  /* ── Scroll reveal ─────────────────────────────────────────── */
  const revealEls = $$('section, .service-card, .portfolio-card, .why-card, .testi-card, .step, .palyazat-box');
  const hasIO = 'IntersectionObserver' in window;
  if (hasIO) {
    revealEls.forEach(el => el.classList.add('reveal'));
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(el => io.observe(el));
  }

  /* ── Animated counters ─────────────────────────────────────── */
  const counters = $$('.hl-num[data-count]');
  const setFinal = (el) => {
    el.textContent = (el.dataset.prefix || '') + el.dataset.count + (el.dataset.suffix || '');
  };
  if (!hasIO) {
    counters.forEach(setFinal);
  } else {
  const countIO = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const target = parseFloat(el.dataset.count);
      const suffix = el.dataset.suffix || '';
      const prefix = el.dataset.prefix || '';
      const dur = 1400;
      const start = performance.now();
      const tick = (now) => {
        const p = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = prefix + Math.round(target * eased) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      countIO.unobserve(el);
    });
  }, { threshold: 0.5 });
  counters.forEach(c => countIO.observe(c));
  }

  /* ── FAQ accordion (close others) ──────────────────────────── */
  const faqItems = $$('.faq-item');
  faqItems.forEach(item => {
    item.addEventListener('toggle', () => {
      if (item.open) faqItems.forEach(o => { if (o !== item) o.open = false; });
    });
  });

  /* ── Active nav link ───────────────────────────────────────── */
  const sections = $$('main section[id]');
  const navLinks = $$('.nav-links a');
  const spy = () => {
    let cur = '';
    sections.forEach(s => { if (window.scrollY >= s.offsetTop - 140) cur = s.id; });
    navLinks.forEach(a => a.style.color = a.getAttribute('href') === '#' + cur ? '#fff' : '');
  };
  window.addEventListener('scroll', spy, { passive: true });

  /* ── Conversion tracking (PPC ready) ───────────────────────── */
  const track = (action, label) => {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: 'ukr_cta', cta_action: action, cta_label: label || '' });
    /* Google Ads conversion (töltsd ki):
       gtag('event','conversion',{ 'send_to':'AW-XXXXXXX/XXXX' });
       Meta Pixel: fbq('track','Lead'); */
  };
  $$('[data-cta]').forEach(el => {
    el.addEventListener('click', () => track('click', el.dataset.cta));
  });

  /* ── Contact form ──────────────────────────────────────────── */
  const form = $('#contactForm');
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const required = $$('[required]', form);
    let ok = true;
    required.forEach(field => {
      const valid = field.type === 'checkbox' ? field.checked : field.value.trim() !== '';
      field.classList.toggle('invalid', !valid);
      if (!valid) ok = false;
    });
    const email = $('#email', form);
    if (email && email.value && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.value)) {
      email.classList.add('invalid'); ok = false;
    }
    if (!ok) { form.querySelector('.invalid')?.focus(); return; }

    track('lead', 'contact_form');
    window.dataLayer.push({ event: 'generate_lead' });

    const btn = form.querySelector('button[type=submit]');
    const original = btn.innerHTML;
    btn.innerHTML = '<span>Elküldve! ✓</span>';
    btn.style.background = 'linear-gradient(135deg,#22c55e,#16a34a)';
    btn.disabled = true;
    /* TODO: ide jön a valódi küldés (pl. Formspree / saját endpoint / e-mail) */
    setTimeout(() => {
      btn.innerHTML = original; btn.style.background = ''; btn.disabled = false; form.reset();
    }, 3500);
  });
  $$('[required]', form || document).forEach(f => f.addEventListener('input', () => f.classList.remove('invalid')));

  /* ── Cookie consent ────────────────────────────────────────── */
  const cookie = $('#cookie');
  if (cookie && !localStorage.getItem('ukr_cookie')) {
    setTimeout(() => cookie.hidden = false, 1200);
  }
  const setCookie = (val) => { localStorage.setItem('ukr_cookie', val); cookie.hidden = true; };
  $('#cookieAccept')?.addEventListener('click', () => {
    setCookie('accepted');
    window.dataLayer.push({ event: 'consent_granted' });
    /* itt indíthatod a hirdetési pixeleket consent után */
  });
  $('#cookieDecline')?.addEventListener('click', () => setCookie('declined'));

  /* ── Current year ──────────────────────────────────────────── */
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

})();
