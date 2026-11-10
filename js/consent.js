/* Gestione consenso cookie / contenuti di terze parti (Provvedimento Garante 10/06/2021, GDPR, ePrivacy).
   Il sito non usa cookie di profilazione né analisi: l'unica categoria opzionale è "contenuti di terze parti" (video Vimeo).
   La scelta è salvata nel browser (localStorage) per 6 mesi. */
(() => {
  const KEY = 'dea_cookie_consent', VERSION = 1, MAX = 182 * 864e5;
  const it = /^it/i.test(navigator.language || '');
  const L = it ? {
    title: 'La tua privacy', text: 'Usiamo strumenti tecnici necessari al funzionamento del sito. Gli strumenti di analisi (Microsoft Clarity, Google), di marketing (Google Ads) e i contenuti di terze parti (come i video di Vimeo) si attivano solo se lo consenti. Puoi cambiare idea in qualsiasi momento da “Preferenze cookie” nel footer.',
    anaT: 'Analisi statistica', anaD: 'Microsoft Clarity e Google Analytics ci aiutano a capire come viene usato il sito (pagine viste, clic, scorrimento) per migliorarlo. Impostano cookie e possono registrare sessioni di navigazione.',
    marT: 'Marketing', marD: 'Google Ads misura l’efficacia delle nostre campagne pubblicitarie (conversioni). Imposta cookie e può associare la visita al tuo account Google.',
    policy: 'Cookie Policy', reject: 'Rifiuta tutto', accept: 'Accetta tutto', custom: 'Personalizza', save: 'Salva preferenze', close: 'Chiudi e rifiuta',
    necT: 'Necessari', necD: 'Servono al funzionamento del sito e a ricordare questa scelta. Sono sempre attivi e non richiedono consenso.',
    medT: 'Contenuti di terze parti', medD: 'Video incorporati da Vimeo. Caricandoli, Vimeo può ricevere il tuo indirizzo IP e impostare propri cookie.',
    vtext: 'Questo video è ospitato da Vimeo, che può ricevere il tuo indirizzo IP e impostare cookie.', play: 'Guarda il video', always: 'Consenti sempre i contenuti di terze parti'
  } : {
    title: 'Your privacy', text: 'We use technical tools needed to run the site. Analytics (Microsoft Clarity, Google), marketing (Google Ads) and third-party content (such as Vimeo videos) are switched on only if you allow it. You can change your mind at any time from “Cookie preferences” in the footer.',
    anaT: 'Analytics', anaD: 'Microsoft Clarity and Google Analytics help us understand how the site is used (pages viewed, clicks, scrolling) so we can improve it. They set cookies and may record browsing sessions.',
    marT: 'Marketing', marD: 'Google Ads measures how well our advertising campaigns perform (conversions). It sets cookies and may link your visit to your Google account.',
    policy: 'Cookie Policy', reject: 'Reject all', accept: 'Accept all', custom: 'Customize', save: 'Save preferences', close: 'Close and reject',
    necT: 'Necessary', necD: 'Needed for the site to work and to remember this choice. Always on, no consent required.',
    medT: 'Third-party content', medD: 'Videos embedded from Vimeo. When loaded, Vimeo may receive your IP address and set its own cookies.',
    vtext: 'This video is hosted by Vimeo, which may receive your IP address and set cookies.', play: 'Play video', always: 'Always allow third-party content'
  };
  let state = null, box = null, last = null;
  try { const v = JSON.parse(localStorage.getItem(KEY)); if (v && v.v === VERSION && Date.now() - v.ts < MAX) state = v; } catch (e) {}
  const media = () => !!(state && state.media);
  const analytics = () => !!(state && state.analytics);
  const marketing = () => !!(state && state.marketing);
  let clarityOn = false, googleOn = false;

  /* Microsoft Clarity: caricato solo dopo il consenso; alla revoca si cancellano i cookie e si ricarica la pagina */
  function loadClarity() {
    if (clarityOn) return; clarityOn = true;
    (function (c, l, a, r, i, t, y) {
      c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
      t = l.createElement(r); t.async = 1; t.src = 'https://www.clarity.ms/tag/' + i;
      y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
    })(window, document, 'clarity', 'script', 'v2uc0xyyuu');
    try { window.clarity('consent'); } catch (e) {}
  }

  /* Google tag (Analytics + Ads) con Consent Mode v2: si carica solo dopo il consenso */
  function loadGoogle() {
    window.dataLayer = window.dataLayer || [];
    const gt = function () { window.dataLayer.push(arguments); };
    window.gtag = window.gtag || gt;
    const ok = (v) => (v ? 'granted' : 'denied');
    if (!googleOn) {
      googleOn = true;
      window.gtag('consent', 'default', { ad_storage: 'denied', analytics_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
      const s = document.createElement('script'); s.async = true; s.src = 'https://www.googletagmanager.com/gtag/js?id=GT-MJJMLGK2'; document.head.appendChild(s);
      window.gtag('js', new Date());
    }
    window.gtag('consent', 'update', { analytics_storage: ok(analytics()), ad_storage: ok(marketing()), ad_user_data: ok(marketing()), ad_personalization: ok(marketing()) });
    if (analytics() && !window.__gtA) { window.__gtA = 1; window.gtag('config', 'GT-MJJMLGK2'); }
    if (marketing() && !window.__gtM) { window.__gtM = 1; window.gtag('config', 'AW-17749454721'); }
  }
  function expireCookies(names, prefixes) {
    const host = location.hostname, p = host.split('.'), roots = [host, '.' + host, '.' + p.slice(-2).join('.')];
    document.cookie.split(';').map((c) => c.split('=')[0].trim()).forEach((n) => {
      if (names.indexOf(n) > -1 || prefixes.some((x) => n.indexOf(x) === 0)) roots.forEach((d) => { document.cookie = n + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=' + d; });
    });
  }
  function stopClarity() {
    try { window.clarity('consent', false); } catch (e) {}
    const host = location.hostname, parts = host.split('.'), roots = [host, '.' + host, '.' + parts.slice(-2).join('.'), '.' + parts.slice(-3).join('.')];
    ['_clck', '_clsk', 'CLID', 'ANONCHK', 'MR', 'MUID', 'SM', 'SRM_B'].forEach((n) => roots.forEach((d) => {
      document.cookie = n + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=' + d;
    }));
    location.reload();
  }
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const el = (t, c, h) => { const e = document.createElement(t); if (c) e.className = c; if (h != null) e.innerHTML = h; return e; };

  function save(m, a, k) {
    const wasGoogle = googleOn;
    state = { v: VERSION, ts: Date.now(), media: !!m, analytics: !!a, marketing: !!k };
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
    closeBox(); gate();
    if (analytics() || marketing()) loadGoogle();
    if (analytics()) loadClarity();
    const dropG = wasGoogle && (!analytics() || !marketing()), dropC = clarityOn && !analytics();
    if (dropG) expireCookies(['_ga', '_gid', '_gat', 'FPLC'], ['_ga_', '_gcl_', '_gac_', '_gat_']);
    if (dropC) { stopClarity(); return; }
    if (dropG) location.reload();
  }
  function closeBox() {
    if (box) { box.parentNode.removeChild(box); box = null; }
    if (last && last.focus) last.focus({ preventScroll: true });
  }

  function open(view) {
    if (box) box.parentNode.removeChild(box);
    last = document.activeElement;
    box = el('div', 'cc'); box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'false'); box.setAttribute('aria-labelledby', 'cc-t');
    const btn = (cls, txt, fn) => { const b = el('button', 'cc-btn ' + cls, txt); b.type = 'button'; b.addEventListener('click', fn); return b; };
    if (view === 'custom') {
      const toggle = (id, t, d, on, dis) => `<label class="cc-row" for="${id}"><span><b>${t}</b><small>${d}</small></span><input type="checkbox" id="${id}"${on ? ' checked' : ''}${dis ? ' disabled' : ''}><i class="cc-sw"></i></label>`;
      box.innerHTML = `<h2 id="cc-t">${L.title}</h2>` + toggle('cc-nec', L.necT, L.necD, true, true) + toggle('cc-ana', L.anaT, L.anaD, analytics(), false) + toggle('cc-mar', L.marT, L.marD, marketing(), false) + toggle('cc-med', L.medT, L.medD, media(), false);
      const row = el('div', 'cc-actions');
      row.append(btn('cc-main', L.reject, () => save(false, false, false)), btn('cc-main', L.accept, () => save(true, true, true)), btn('cc-alt', L.save, () => save(box.querySelector('#cc-med').checked, box.querySelector('#cc-ana').checked, box.querySelector('#cc-mar').checked)));
      box.append(row);
    } else {
      box.innerHTML = `<h2 id="cc-t">${L.title}</h2><p>${L.text} <a href="/cookie-policy/">${L.policy}</a></p>`;
      const x = btn('cc-x', '×', () => save(false, false, false)); x.setAttribute('aria-label', L.close); box.prepend(x);
      const row = el('div', 'cc-actions');
      row.append(btn('cc-main', L.reject, () => save(false, false, false)), btn('cc-main', L.accept, () => save(true, true, true)), btn('cc-alt', L.custom, () => open('custom')));
      box.append(row);
    }
    document.body.append(box);
    const f = box.querySelector('.cc-main'); if (f) f.focus({ preventScroll: true });
  }

  /* video di terze parti: caricati solo con consenso o dopo clic esplicito */
  function gate() {
    $$('.video-wrap iframe[data-src]').forEach((f) => {
      const wrap = f.parentElement, ph = wrap.querySelector('.cc-video');
      const load = () => { f.src = f.dataset.src; if (ph) ph.hidden = true; const p2 = wrap.querySelector('.cc-video'); if (p2) p2.hidden = true; };
      if (media()) { load(); return; }
      if (f.getAttribute('src')) f.removeAttribute('src');
      if (ph) { ph.hidden = false; return; }
      const p = el('div', 'cc-video', `<p>${L.vtext}</p>`);
      const b1 = el('button', 'cc-btn cc-main', L.play); b1.type = 'button'; b1.addEventListener('click', load);
      const b2 = el('button', 'cc-btn cc-alt', L.always); b2.type = 'button'; b2.addEventListener('click', () => save(true, analytics(), marketing()));
      p.append(b1, b2); wrap.append(p);
    });
  }

  document.addEventListener('click', (e) => { const t = e.target.closest('[data-cookie-settings]'); if (t) { e.preventDefault(); open('custom'); } });
  const start = () => { gate(); if (analytics() || marketing()) loadGoogle(); if (analytics()) loadClarity(); if (!state) open(); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
