/* =====================================================================
   NORML STUDIO — Animation Engine
   Preloader · custom cursor · scroll reveals · counters · marquee
   parallax · tilt · mobile nav · page transitions
   ===================================================================== */
(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(max-width: 900px)').matches;

  /* ---------- Preloader ---------- */
  function preloader() {
    const pre = document.querySelector('.preloader');
    if (!pre) { document.body.classList.remove('no-scroll'); fireReveals(); return; }
    const bar = pre.querySelector('.preloader__bar i');
    const pct = pre.querySelector('.js-pct');
    let p = 0;
    document.body.classList.add('no-scroll');
    const tick = () => {
      p += Math.random() * 18 + 6;
      if (p >= 100) p = 100;
      if (bar) bar.style.width = p + '%';
      if (pct) pct.textContent = Math.floor(p).toString().padStart(3, '0');
      if (p < 100) {
        setTimeout(tick, 120);
      } else {
        setTimeout(() => {
          pre.classList.add('done');
          document.body.classList.remove('no-scroll');
          document.body.classList.add('loaded');
          fireReveals();
        }, 350);
      }
    };
    if (reduce) {
      if (bar) bar.style.width = '100%';
      pre.classList.add('done');
      document.body.classList.remove('no-scroll');
      document.body.classList.add('loaded');
    } else {
      setTimeout(tick, 250);
    }
  }

  /* ---------- Custom cursor ---------- */
  function cursor() {
    if (isTouch) return;
    const dot = document.querySelector('.cursor-dot');
    const ring = document.querySelector('.cursor-ring');
    if (!dot || !ring) return;
    let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;

    addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%,-50%)`;
    });
    (function loop() {
      rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
      ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%,-50%)`;
      requestAnimationFrame(loop);
    })();

    const hov = 'a, button, .card, [data-cursor]';
    document.addEventListener('mouseover', e => {
      const t = e.target.closest(hov);
      if (!t) return;
      const label = t.getAttribute('data-cursor');
      if (label) { ring.classList.add('hover-accent', 'label'); ring.setAttribute('data-label', label); }
      else { ring.classList.add('hover'); }
    });
    document.addEventListener('mouseout', e => {
      if (e.target.closest(hov)) ring.classList.remove('hover', 'hover-accent', 'label');
    });
  }

  /* ---------- Scroll reveals ---------- */
  let revealObs;
  function initReveals() {
    revealObs = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (en.isIntersecting) { en.target.classList.add('in'); revealObs.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    // Hero elements (data-hero) are revealed by the preloader hand-off, not the
    // scroll observer — otherwise they'd animate while hidden behind the preloader.
    document.querySelectorAll('[data-reveal]:not([data-hero]), .reveal-lines:not([data-hero]), .reveal-words:not([data-hero])').forEach(el => revealObs.observe(el));
  }
  function fireReveals() {
    // immediately reveal anything already in the first viewport (hero)
    document.querySelectorAll('[data-hero]').forEach(el => el.classList.add('in'));
  }

  /* ---------- Split text into words (for stagger) ---------- */
  function splitWords() {
    document.querySelectorAll('[data-split]').forEach(el => {
      const words = el.textContent.trim().split(/\s+/);
      el.innerHTML = words.map(w => `<span class="word"><span>${w}</span></span>`).join(' ');
    });
  }

  /* ---------- Number counters ---------- */
  function counters() {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        const el = en.target;
        const target = parseFloat(el.dataset.count);
        const dec = (el.dataset.count.split('.')[1] || '').length;
        const dur = 1600; const t0 = performance.now();
        const step = (now) => {
          const k = Math.min((now - t0) / dur, 1);
          const e = 1 - Math.pow(1 - k, 3);
          el.textContent = (target * e).toFixed(dec);
          if (k < 1) requestAnimationFrame(step);
          else el.textContent = target.toFixed(dec);
        };
        requestAnimationFrame(step);
        obs.unobserve(el);
      });
    }, { threshold: 0.6 });
    document.querySelectorAll('[data-count]').forEach(el => obs.observe(el));
  }

  /* ---------- Parallax on scroll ---------- */
  function parallax() {
    if (reduce) return;
    const items = [...document.querySelectorAll('[data-parallax]')];
    if (!items.length) return;
    let ticking = false;
    const run = () => {
      const vh = innerHeight;
      items.forEach(el => {
        const r = el.getBoundingClientRect();
        const mid = r.top + r.height / 2;
        const off = (mid - vh / 2) / vh;
        const speed = parseFloat(el.dataset.parallax) || 0.15;
        el.style.transform = `translate3d(0, ${(-off * speed * 100).toFixed(2)}px, 0)`;
      });
      ticking = false;
    };
    addEventListener('scroll', () => { if (!ticking) { requestAnimationFrame(run); ticking = true; } }, { passive: true });
    run();
  }

  /* ---------- Magnetic buttons ---------- */
  function magnetic() {
    if (isTouch) return;
    document.querySelectorAll('[data-magnetic]').forEach(el => {
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        el.style.transform = `translate(${x * 0.3}px, ${y * 0.4}px)`;
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
  }

  /* ---------- 3D tilt cards ---------- */
  function tilt() {
    if (isTouch) return;
    document.querySelectorAll('[data-tilt]').forEach(el => {
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = `perspective(900px) rotateY(${px * 8}deg) rotateX(${-py * 8}deg) translateY(-4px)`;
        const glow = el.querySelector('.card__glow');
        if (glow) { glow.style.left = (e.clientX - r.left - 160) + 'px'; glow.style.top = (e.clientY - r.top - 160) + 'px'; }
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
  }

  /* ---------- Nav scroll state + active link ---------- */
  function nav() {
    const n = document.querySelector('.nav');
    if (!n) return;
    const onScroll = () => n.classList.toggle('scrolled', scrollY > 30);
    onScroll(); addEventListener('scroll', onScroll, { passive: true });

    // mobile menu
    const burger = n.querySelector('.nav__burger');
    const menu = document.querySelector('.mobile-menu');
    if (burger && menu) {
      const toggle = () => {
        const open = menu.classList.toggle('open');
        n.classList.toggle('open', open);
        document.body.classList.toggle('no-scroll', open);
      };
      burger.addEventListener('click', toggle);
      menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
        menu.classList.remove('open'); n.classList.remove('open'); document.body.classList.remove('no-scroll');
      }));
    }
  }

  /* ---------- Page transition (leave) ---------- */
  function transitions() {
    if (reduce) return;
    const veil = document.querySelector('.page-veil');
    if (!veil) return;
    document.querySelectorAll('a[href]').forEach(a => {
      const href = a.getAttribute('href');
      const isInternal = href && !href.startsWith('#') && !href.startsWith('http') &&
        !href.startsWith('mailto') && !href.startsWith('tel') && a.target !== '_blank';
      if (!isInternal) return;
      a.addEventListener('click', e => {
        if (e.metaKey || e.ctrlKey || e.shiftKey) return; // let new-tab work
        e.preventDefault();
        veil.classList.add('leaving');
        setTimeout(() => { window.location.href = href; }, 480);
      });
    });
  }

  /* ---------- Scroll progress bar (top) ---------- */
  function progress() {
    const bar = document.querySelector('.scroll-progress');
    if (!bar) return;
    addEventListener('scroll', () => {
      const h = document.documentElement.scrollHeight - innerHeight;
      bar.style.transform = `scaleX(${h > 0 ? scrollY / h : 0})`;
    }, { passive: true });
  }

  /* ---------- Live clock (Miami / EST) ---------- */
  function clock() {
    const el = document.querySelector('.js-clock');
    if (!el) return;
    const upd = () => {
      try {
        el.textContent = new Intl.DateTimeFormat('en-US', {
          hour: '2-digit', minute: '2-digit', second: '2-digit',
          hour12: false, timeZone: 'America/New_York'
        }).format(new Date());
      } catch { el.textContent = ''; }
    };
    upd(); setInterval(upd, 1000);
  }

  /* ---------- Init ---------- */
  document.addEventListener('DOMContentLoaded', () => {
    splitWords();
    preloader();
    cursor();
    initReveals();
    counters();
    parallax();
    magnetic();
    tilt();
    nav();
    transitions();
    progress();
    clock();
  });
})();
