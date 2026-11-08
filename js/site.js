(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ferma animazioni e autoplay quando l'elemento non è visibile (scroll più fluido) */
  const watched = $$('.bg-slides, .ticker, .reviews, .carousel');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => e.target.classList.toggle('is-offscreen', !e.isIntersecting));
    }, { rootMargin: '100px' });
    watched.forEach((el) => io.observe(el));
  }
  const offscreen = (el) => el.classList.contains('is-offscreen');

  /* le immagini delle slide successive alla prima si scaricano a pagina caricata */
  const loadBg = () => $$('.bg-slide[data-bg]').forEach((s) => {
    const url = s.dataset.bg, im = new Image();
    im.onload = () => { s.style.backgroundImage = 'url("' + url + '")'; delete s.dataset.bg; };
    im.src = url;
  });
  if (document.readyState === 'complete') setTimeout(loadBg, 200);
  else addEventListener('load', () => setTimeout(loadBg, 200));

  /* le sezioni compaiono con una dissolvenza leggera mentre si scorre */
  if ('IntersectionObserver' in window && !reduce) {
    const secs = $$('main section, body > section, body > div > section').filter((s, i) => i > 0);
    const rv = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('rv-in'); rv.unobserve(e.target); }
    }), { threshold: 0.06, rootMargin: '0px 0px -40px 0px' });
    secs.forEach((s) => { s.classList.add('rv'); rv.observe(s); });
  }

  /* menu */
  const header = $('.site-header'), toggle = $('.nav-toggle');
  if (header && toggle) {
    const setOpen = (open) => {
      header.classList.toggle('is-open', open);
      document.documentElement.classList.toggle('menu-open', open);
      toggle.setAttribute('aria-expanded', open);
      document.documentElement.style.setProperty('--header-bottom', header.getBoundingClientRect().bottom + 'px');
    };
    toggle.addEventListener('click', () => setOpen(!header.classList.contains('is-open')));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
    $$('.nav-list a').forEach((a) => a.addEventListener('click', () => setOpen(false)));
    matchMedia('(min-width:1025px)').addEventListener('change', (e) => { if (e.matches) setOpen(false); });
  }

  /* slideshow di sfondo: dissolvenza, intervallo = sosta + transizione (data-interval) */
  $$('.bg-slides').forEach((box) => {
    const slides = $$('.bg-slide', box);
    if (slides.length < 2 || reduce) return;
    const every = +box.dataset.interval || 1500;
    let i = 0;
    setInterval(() => {
      if (offscreen(box)) return;
      if (slides[(i + 1) % slides.length].dataset.bg) return;
      slides[i].classList.toggle('is-active', false);
      i = (i + 1) % slides.length;
      slides[i].classList.toggle('is-active', true);
    }, every);
  });

  /* scritta scorrevole: ~70 px/s come il vecchio <marquee> */
  $$('.ticker').forEach((t) => {
    const txt = $('.ticker-text', t);
    const set = () => t.style.setProperty('--ticker-dur', ((t.clientWidth + txt.scrollWidth) / 70).toFixed(1) + 's');
    set(); addEventListener('resize', set);
    if (document.fonts) document.fonts.ready.then(set);
  });

  /* recensioni */
  $$('.reviews').forEach((root) => {
    const track = $('.reviews-track', root), cards = $$('.review', root), dotsEl = $('.rv-dots', root);
    let idx = 0, paused = false;
    const per = () => +getComputedStyle(root).getPropertyValue('--n') || 1;
    const maxIdx = () => Math.max(0, cards.length - per());
    const dots = cards.map((_, k) => {
      const b = document.createElement('button'); b.type = 'button'; b.setAttribute('role', 'tab'); b.setAttribute('aria-label', 'Review ' + (k + 1));
      b.addEventListener('click', () => go(k)); dotsEl.appendChild(b); return b;
    });
    function go(k) {
      idx = k > maxIdx() ? 0 : k < 0 ? maxIdx() : k;
      const step = cards[0].getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap || 0);
      track.style.transform = 'translateX(' + (-idx * step) + 'px)';
      dots.forEach((d, j) => d.setAttribute('aria-selected', j === idx));
    }
    $('.rv-prev', root).addEventListener('click', () => go(idx - 1));
    $('.rv-next', root).addEventListener('click', () => go(idx + 1));
    root.addEventListener('mouseenter', () => paused = true);
    root.addEventListener('mouseleave', () => paused = false);
    addEventListener('resize', () => go(Math.min(idx, maxIdx())));
    const delay = +root.dataset.autoplay || 0;
    if (delay && !reduce) setInterval(() => { if (!paused && !offscreen(root) && maxIdx() > 0) go(idx + 1); }, delay);
    go(0);
  });

  /* caroselli di immagini (stesse impostazioni di Elementor: n. slide, spazio, autoplay, loop) */
  $$('.carousel').forEach((root) => {
    let cfg = {};
    try { cfg = JSON.parse(root.dataset.cr || '{}'); } catch (e) { cfg = {}; }
    const view = $('.cr-viewport', root), track = $('.cr-track', root);
    if (!view || !track) return;
    const orig = $$('.cr-slide', track), count = orig.length;
    const mqT = matchMedia('(max-width:1024px)'), mqM = matchMedia('(max-width:767px)');
    const pick = () => mqM.matches ? [cfg.nm, cfg.gapm] : mqT.matches ? [cfg.nt, cfg.gapt] : [cfg.n, cfg.gap];
    let n = 3, gap = 10, idx = 0, paused = false, clones = [];
    root.style.setProperty('--cr-speed', (cfg.speed || 500) + 'ms');
    const loop = () => cfg.loop && count > n;
    const maxIdx = () => Math.max(0, count - n);
    const step = () => orig[0].getBoundingClientRect().width + gap;
    function move(animate) {
      track.style.transition = animate ? '' : 'none';
      track.style.transform = 'translateX(' + (-idx * step()) + 'px)';
      if (!animate) void track.offsetWidth;
    }
    function layout() {
      [n, gap] = pick();
      root.style.setProperty('--cr-n', n);
      root.style.setProperty('--cr-gap', gap + 'px');
      clones.forEach((c) => track.removeChild(c));
      clones = [];
      if (loop()) {
        for (let k = 0; k < n; k++) {
          const c = orig[k].cloneNode(true);
          c.setAttribute('aria-hidden', 'true');
          track.appendChild(c);
          clones.push(c);
        }
      }
      idx = loop() ? idx % count : Math.min(idx, maxIdx());
      move(false);
      dots();
    }
    function go(k) {
      if (count <= n && !loop()) return;
      if (loop()) {
        if (k < 0) { idx = count; move(false); idx = count - 1; move(true); return; }
        idx = k; move(true);
        if (idx >= count) {
          setTimeout(() => { idx = 0; move(false); sync(); }, (cfg.speed || 500) + 30);
        }
      } else {
        idx = k > maxIdx() ? 0 : k < 0 ? maxIdx() : k;
        move(true);
      }
      sync();
    }
    const prev = $('.cr-prev', root), next = $('.cr-next', root), dotsEl = $('.cr-dots', root);
    if (prev) prev.addEventListener('click', () => go(idx - 1));
    if (next) next.addEventListener('click', () => go(idx + 1));
    let dotBtns = [];
    function dots() {
      if (!dotsEl) return;
      dotsEl.textContent = '';
      dotBtns = [];
      if (!/dots|both/.test(cfg.nav || '')) return;
      const total = loop() ? count : maxIdx() + 1;
      for (let k = 0; k < total; k++) {
        const b = document.createElement('button');
        b.type = 'button'; b.setAttribute('aria-label', 'Slide ' + (k + 1));
        b.addEventListener('click', () => go(k));
        dotsEl.appendChild(b); dotBtns.push(b);
      }
      sync();
    }
    function sync() { dotBtns.forEach((b, j) => b.setAttribute('aria-selected', j === (idx % (loop() ? count : maxIdx() + 1)))); }
    root.addEventListener('mouseenter', () => { paused = true; });
    root.addEventListener('mouseleave', () => { paused = false; });
    if (cfg.auto && !reduce) setInterval(() => { if (!paused && !document.hidden && !offscreen(root)) go(idx + 1); }, cfg.auto + (cfg.speed || 500));
    mqT.addEventListener('change', layout); mqM.addEventListener('change', layout);
    addEventListener('resize', () => move(false));
    layout();
  });

  /* fisarmoniche: ne tiene aperta una sola per widget, come "max_items_expended: one" */
  $$('.e-n-accordion, details').forEach((d) => {
    if (d.tagName !== 'DETAILS') return;
    d.addEventListener('toggle', () => {
      if (!d.open) return;
      $$('details[open]', d.parentElement).forEach((o) => { if (o !== d) o.open = false; });
    });
  });
})();

/* pagine legali: cambio lingua IT / EN */
document.querySelectorAll('.lg-lang button').forEach((b) => b.addEventListener('click', () => {
  document.querySelectorAll('.lg-lang button').forEach((x) => x.setAttribute('aria-pressed', x === b));
  document.querySelectorAll('.lg-doc').forEach((d) => { d.hidden = d.lang !== b.dataset.lang; });
}));
