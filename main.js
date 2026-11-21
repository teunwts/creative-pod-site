// Taalwissel EN/NL: Engels staat in de HTML, Nederlands in i18n.js
(() => {
  const en = {}; document.querySelectorAll('[data-t]').forEach(e => { en[e.dataset.t] = e.innerHTML; });
  const btn = document.getElementById('lang');
  const set = lang => {
    document.querySelectorAll('[data-t]').forEach(e => { const k = e.dataset.t; e.innerHTML = lang === 'nl' && window.NL && window.NL[k] ? window.NL[k] : en[k]; });
    document.documentElement.lang = lang;
    if (btn) btn.setAttribute('aria-checked', String(lang === 'nl'));
    try { localStorage.setItem('lang', lang); } catch (e) {}
  };
  let saved = null; try { saved = localStorage.getItem('lang'); } catch (e) {}
  const start = location.hash === '#nl' ? 'nl' : (saved || 'en');
  if (start === 'nl') set('nl');
  if (btn) btn.addEventListener('click', () => set(document.documentElement.lang === 'nl' ? 'en' : 'nl'));
})();
// Reveal only animates when JS runs; without it everything stays visible
document.documentElement.classList.add('js');

// Mobile nav toggle
const toggle = document.querySelector('.nav-toggle');
const nav = document.getElementById('nav');
const setNav = open => {
  nav.classList.toggle('open', open);
  toggle.textContent = open ? '✕' : '☰';
  toggle.setAttribute('aria-expanded', String(open));
};
toggle.addEventListener('click', () => setNav(!nav.classList.contains('open')));
nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setNav(false)));

// Fade sections in as they scroll into view
const io = new IntersectionObserver((entries, obs) => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in');
    obs.unobserve(e.target);
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => {
  const sibs = [...el.parentElement.children].filter(c => c.classList.contains('reveal'));
  el.style.transitionDelay = (sibs.indexOf(el) % 4) * 80 + 'ms';
  io.observe(el);
});

// Results screenshot opens full size; <dialog> handles focus trap, Esc and focus return
const box = document.querySelector('.lightbox');
document.querySelectorAll('[data-zoom]').forEach(btn => btn.addEventListener('click', () => {
  const img = btn.querySelector('img');
  box.querySelector('img').src = img.src;
  box.querySelector('img').alt = img.alt;
  box.showModal();
}));
box.addEventListener('click', e => { if (e.target === box) box.close(); });

// Liquid glass: glare follows the pointer, glows drift with scroll (both off for reduced motion)
const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!still && window.matchMedia('(pointer: fine)').matches) {
  let queued = false;
  document.addEventListener('pointermove', e => {
    const target = e.target.closest('.top-in, .card, .stats div, .ph-frame, .btn');
    if (!target || queued) return;
    const x = e.clientX, y = e.clientY;
    queued = true;
    requestAnimationFrame(() => {
      const r = target.getBoundingClientRect();
      target.style.setProperty('--mx', (x - r.left) + 'px');
      target.style.setProperty('--my', (y - r.top) + 'px');
      queued = false;
    });
  }, { passive: true });
}
// Parallax re-blurs every glass panel each frame, so only on wider screens
const glows = [...document.querySelectorAll('.glow i')];
if (!still && window.matchMedia('(min-width: 901px)').matches) {
  let ticking = false;
  const drift = () => {
    const t = window.scrollY / 1400;
    glows.forEach((g, i) => { g.style.transform = `translate3d(${Math.cos(t + i * 2) * 60}px, ${Math.sin(t + i * 2) * 120}px, 0)`; });
    ticking = false;
  };
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(drift); } }, { passive: true });
  drift();
}

// Videoband: dubbele set kaarten voor een naadloze loop; tikken pauzeert (mobiel)
const reel = document.querySelector('.reel');
if (reel) {
  const track = reel.querySelector('.reel-track');
  [...track.children].forEach(c => { const k = c.cloneNode(true); k.setAttribute('aria-hidden', 'true'); k.querySelectorAll('img').forEach(i => i.alt = ''); track.appendChild(k); });
  reel.addEventListener('click', () => reel.classList.toggle('paused'));
}

// Videos: play muted while visible; tap toggles sound
const soundTxt = on => document.documentElement.lang === 'nl' ? (on ? 'Geluid aan' : 'Tik voor geluid') : (on ? 'Sound on' : 'Tap for sound');
document.getElementById('lang')?.addEventListener('click', () => setTimeout(() => document.querySelectorAll('.sound').forEach(s => s.textContent = soundTxt(s.textContent === 'Sound on' || s.textContent === 'Geluid aan')), 0));
const vids = [...document.querySelectorAll('.iph video')];
vids.forEach(v => {
  const tag = document.createElement('span'); tag.className = 'sound'; tag.textContent = soundTxt();
  v.parentElement.appendChild(tag);
  v.addEventListener('click', () => {
    const on = v.muted;
    vids.forEach(o => { o.muted = true; o.parentElement.querySelector('.sound').textContent = soundTxt(); });
    v.muted = !on; if (on) { v.play().catch(() => {}); tag.textContent = soundTxt(true); }
  });
});
if ('IntersectionObserver' in window) {
  const vo = new IntersectionObserver(es => es.forEach(e => { const v = e.target; if (e.isIntersecting && !still) v.play().catch(() => {}); else v.pause(); }), { threshold: 0.35 });
  vids.forEach(v => vo.observe(v));
}

// Tellers: tellen op vanaf 0 telkens als de cijferbalk in beeld komt, met de notatie van de gekozen taal
const counters = [...document.querySelectorAll('.count')];
const fmt = n => n.toLocaleString(document.documentElement.lang === 'nl' ? 'nl-NL' : 'en-US');
const runCount = el => {
  const to = +el.dataset.to, dur = 2200, t0 = performance.now(), id = (el._run = (el._run || 0) + 1);
  const step = t => { if (el._run !== id) return; const p = Math.min(1, (t - t0) / dur); el.textContent = fmt(Math.round(to * (1 - Math.pow(1 - p, 3)))); if (p < 1) requestAnimationFrame(step); };
  requestAnimationFrame(step);
};
const fixWidth = () => counters.forEach(c => { const cur = c.textContent; c.style.minWidth = ''; c.textContent = fmt(+c.dataset.to); c.style.minWidth = c.getBoundingClientRect().width + 'px'; c.textContent = cur; });
fixWidth();
if (document.fonts) document.fonts.ready.then(fixWidth);
let rz; addEventListener("resize", () => { clearTimeout(rz); rz = setTimeout(fixWidth, 150); });
if (!still && 'IntersectionObserver' in window) {
  counters.forEach(c => c.textContent = '0');
  const co = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) runCount(e.target);
    else { e.target._run = (e.target._run || 0) + 1; e.target.textContent = '0'; }
  }), { threshold: 0.6 });
  counters.forEach(c => co.observe(c));
} else counters.forEach(c => c.textContent = fmt(+c.dataset.to));
// Taalwissel: zet scheidingstekens meteen goed (3,000 of 3.000)
document.getElementById('lang')?.addEventListener('click', () => setTimeout(() => {
  fixWidth();
  counters.forEach(c => { const n = +c.textContent.replace(/\D/g, ''); c.textContent = fmt(n); });
}, 0));

// Batchvenster: alle video's van Parvum batch 1, per script, volgens de naming convention
const BATCH = [
  ['S1', 'Founding story', ['H1', 'H2', 'H3'], 'TOFU', 'Founder content that stops the scroll with a real face and builds trust before anyone sees a price.'],
  ['S2', 'What are you really paying for?', ['H1', 'H2', 'H3'], 'MOFU', 'A price and value angle that answers the biggest objection before it comes up.'],
  ['S3', 'The five questions', ['H1', 'H2', 'H3'], 'MOFU', 'Education: the five questions to ask before you buy, which positions the brand as the expert.'],
  ['S4', 'Which one fits you?', ['V1', 'V2', 'V3'], 'BOFU', 'One variant per model, built to send people to the product page and the Fit Finder.'],
  ['S5', 'The powerhouse', ['H1', 'H2', 'H3'], 'MOFU', 'Talent-led product hero that shows the strongest model in real use.'],
  ['S6', 'Out of the box', ['H1', 'H2', 'H3', 'H4'], 'BOFU', 'Unboxing and ASMR that remove the last doubt about delivery and quality.']
];
const batchDlg = document.getElementById('batch');
const batchBtn = document.getElementById('open-batch');
if (batchDlg && batchBtn) {
  let built = false, bo = null;
  const build = () => {
    const list = document.getElementById('batch-list');
    list.innerHTML = BATCH.map(([s, title, takes, stage, why]) => `
      <section class="script"><h4><span>${s}</span>${title} <i class="stage stage-${stage.toLowerCase()}">${stage}</i></h4><p class="why">${why}</p>
        <div class="script-row">${takes.map(t => {
          const code = `PARVUM_B1_${s}_${t}`;
          const label = t.startsWith('V') ? `Variant ${t.slice(1)}` : `Hook ${t.slice(1)}`;
          return `<figure class="iph"><div class="iph-body"><video data-src="assets/batch/parvum/${code}.mp4" muted loop playsinline preload="none" aria-label="${title}, ${label}"></video></div><figcaption>${label}</figcaption><p class="code">${code}</p></figure>`;
        }).join('')}</div></section>`).join('');
    const bv = [...list.querySelectorAll('video')];
    bv.forEach(v => v.addEventListener('click', () => {
      const on = v.muted; bv.forEach(o => o.muted = true); v.muted = !on; v.play().catch(() => {});
    }));
    bo = new IntersectionObserver(es => es.forEach(e => {
      const v = e.target;
      if (e.isIntersecting) { if (!v.src) v.src = v.dataset.src; if (!still) v.play().catch(() => {}); }
      else v.pause();
    }), { root: batchDlg.querySelector('.batch-in'), threshold: 0.3 });
    bv.forEach(v => bo.observe(v));
    built = true;
  };
  batchBtn.addEventListener('click', () => { if (!built) build(); batchDlg.showModal(); });
  batchDlg.addEventListener('click', e => { if (e.target === batchDlg) batchDlg.close(); });
  batchDlg.addEventListener('close', () => batchDlg.querySelectorAll('video').forEach(v => v.pause()));
}

// Scroll-hero: --p loopt van 0 naar 1 terwijl je door de hero scrollt
const hero2 = document.querySelector('.hero2');
if (hero2 && !still) {
  let tick = false;
  const upd = () => {
    const r = hero2.getBoundingClientRect();
    const span = hero2.offsetHeight - innerHeight;
    const p = Math.min(1, Math.max(0, -r.top / (span || 1)));
    hero2.style.setProperty('--p', p.toFixed(3));
    tick = false;
  };
  addEventListener('scroll', () => { if (!tick) { tick = true; requestAnimationFrame(upd); } }, { passive: true });
  addEventListener('resize', upd);
  upd();
}

// Tekst-hero: vier regels die elkaar opvolgen terwijl je scrollt
const hero3 = document.querySelector('.hero3');
if (hero3 && !still) {
  const L = [...hero3.querySelectorAll('.hl')];
  const hint = hero3.querySelector('.hero3-hint');
  // per regel: [in-start, in-eind, uit-start, uit-eind] als fractie van de scroll
  const T = [[-1, 0, 2, 3], [.08, .28, 2, 3], [.34, .54, 2, 3], [.6, .8, 2, 3]];
  const ramp = (p, a, b) => Math.min(1, Math.max(0, (p - a) / (b - a)));
  let tick = false;
  const upd = () => {
    const span = hero3.offsetHeight - innerHeight;
    const p = Math.min(1, Math.max(0, -hero3.getBoundingClientRect().top / (span || 1)));
    L.forEach((el, i) => {
      const [a, b, c, d] = T[i];
      const inn = ramp(p, a, b), out = ramp(p, c, d), o = inn * (1 - out);
      el.style.opacity = o.toFixed(3);
      el.style.transform = `translateY(${((1 - inn) * 30).toFixed(1)}px)`;
      el.style.pointerEvents = o > .5 ? 'auto' : 'none';
    });
    if (hint) hint.style.opacity = (0.7 * (1 - ramp(p, 0, .1))).toFixed(2);
    tick = false;
  };
  addEventListener('scroll', () => { if (!tick) { tick = true; requestAnimationFrame(upd); } }, { passive: true });
  addEventListener('resize', upd);
  upd();
}

// Logobalk: set dubbel, zodat hij naadloos doorloopt
const mt = document.querySelector('.marquee-track');
if (mt) { [...mt.children].forEach(c => { const k = c.cloneNode(true); k.setAttribute('aria-hidden', 'true'); k.querySelectorAll('img').forEach(i => i.alt = ''); mt.appendChild(k); }); }

// GIF-tegels: korte loops die spelen zolang ze in beeld zijn
const gifs = [...document.querySelectorAll('.gif video')];
if (gifs.length && 'IntersectionObserver' in window) {
  const go = new IntersectionObserver(es => es.forEach(e => { const v = e.target; if (e.isIntersecting && !still) { v.preload = 'auto'; v.play().catch(() => {}); } else v.pause(); }), { threshold: 0.25 });
  gifs.forEach(v => go.observe(v));
}

// Vereenvoudigde tellers (3.5M, 65M, 2.5K): vaste breedte, tellen op als ze in beeld komen
const c2 = [...document.querySelectorAll('.count2')];
const fmt2 = (v, d) => v.toLocaleString(document.documentElement.lang === 'nl' ? 'nl-NL' : 'en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
const run2 = el => {
  const to = +el.dataset.to, d = +el.dataset.dec || 0, t0 = performance.now(), id = (el._r = (el._r || 0) + 1);
  const step = t => { if (el._r !== id) return; const p = Math.min(1, (t - t0) / 1800); el.textContent = fmt2(to * (1 - Math.pow(1 - p, 3)), d); if (p < 1) requestAnimationFrame(step); };
  requestAnimationFrame(step);
};
c2.forEach(el => { el.textContent = fmt2(+el.dataset.to, +el.dataset.dec || 0); el.style.minWidth = el.getBoundingClientRect().width + 'px'; });
if (!still && 'IntersectionObserver' in window) {
  const o2 = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) run2(e.target); }), { threshold: 0.6 });
  c2.forEach(el => o2.observe(el));
}
document.getElementById('lang')?.addEventListener('click', () => setTimeout(() => c2.forEach(el => el.textContent = fmt2(+el.dataset.to, +el.dataset.dec || 0)), 0));
