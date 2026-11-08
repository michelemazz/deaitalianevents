/* Gestione consenso cookie / contenuti di terze parti (Provvedimento Garante 10/06/2021, GDPR, ePrivacy).
   Il sito non usa cookie di profilazione né analisi: l'unica categoria opzionale è "contenuti di terze parti" (video Vimeo).
   La scelta è salvata nel browser (localStorage) per 6 mesi. */
(() => {
  const KEY = 'dea_cookie_consent', VERSION = 1, MAX = 182 * 864e5;
  const it = /^it/i.test(navigator.language || '');
  const L = it ? {
    title: 'La tua privacy', text: 'Usiamo solo strumenti tecnici necessari al funzionamento del sito. I contenuti di terze parti (come i video di Vimeo) vengono caricati solo se lo consenti. Puoi cambiare idea in qualsiasi momento da “Preferenze cookie” nel footer.',
    policy: 'Cookie Policy', reject: 'Rifiuta tutto', accept: 'Accetta tutto', custom: 'Personalizza', save: 'Salva preferenze', close: 'Chiudi e rifiuta',
    necT: 'Necessari', necD: 'Servono al funzionamento del sito e a ricordare questa scelta. Sono sempre attivi e non richiedono consenso.',
    medT: 'Contenuti di terze parti', medD: 'Video incorporati da Vimeo. Caricandoli, Vimeo può ricevere il tuo indirizzo IP e impostare propri cookie.',
    vtext: 'Questo video è ospitato da Vimeo, che può ricevere il tuo indirizzo IP e impostare cookie.', play: 'Guarda il video', always: 'Consenti sempre i contenuti di terze parti'
  } : {
    title: 'Your privacy', text: 'We only use technical tools needed to run the site. Third-party content (such as Vimeo videos) is loaded only if you allow it. You can change your mind at any time from “Cookie preferences” in the footer.',
    policy: 'Cookie Policy', reject: 'Reject all', accept: 'Accept all', custom: 'Customize', save: 'Save preferences', close: 'Close and reject',
    necT: 'Necessary', necD: 'Needed for the site to work and to remember this choice. Always on, no consent required.',
    medT: 'Third-party content', medD: 'Videos embedded from Vimeo. When loaded, Vimeo may receive your IP address and set its own cookies.',
    vtext: 'This video is hosted by Vimeo, which may receive your IP address and set cookies.', play: 'Play video', always: 'Always allow third-party content'
  };
  let state = null, box = null, last = null;
  try { const v = JSON.parse(localStorage.getItem(KEY)); if (v && v.v === VERSION && Date.now() - v.ts < MAX) state = v; } catch (e) {}
  const media = () => !!(state && state.media);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const el = (t, c, h) => { const e = document.createElement(t); if (c) e.className = c; if (h != null) e.innerHTML = h; return e; };

  function save(m) {
    state = { v: VERSION, ts: Date.now(), media: !!m };
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
    closeBox(); gate();
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
      box.innerHTML = `<h2 id="cc-t">${L.title}</h2>` + toggle('cc-nec', L.necT, L.necD, true, true) + toggle('cc-med', L.medT, L.medD, media(), false);
      const row = el('div', 'cc-actions');
      row.append(btn('cc-main', L.reject, () => save(false)), btn('cc-main', L.accept, () => save(true)), btn('cc-alt', L.save, () => save(box.querySelector('#cc-med').checked)));
      box.append(row);
    } else {
      box.innerHTML = `<h2 id="cc-t">${L.title}</h2><p>${L.text} <a href="/cookie-policy/">${L.policy}</a></p>`;
      const x = btn('cc-x', '×', () => save(false)); x.setAttribute('aria-label', L.close); box.prepend(x);
      const row = el('div', 'cc-actions');
      row.append(btn('cc-main', L.reject, () => save(false)), btn('cc-main', L.accept, () => save(true)), btn('cc-alt', L.custom, () => open('custom')));
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
      const b2 = el('button', 'cc-btn cc-alt', L.always); b2.type = 'button'; b2.addEventListener('click', () => save(true));
      p.append(b1, b2); wrap.append(p);
    });
  }

  document.addEventListener('click', (e) => { const t = e.target.closest('[data-cookie-settings]'); if (t) { e.preventDefault(); open('custom'); } });
  const start = () => { gate(); if (!state) open(); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
