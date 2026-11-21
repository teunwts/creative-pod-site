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
