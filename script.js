// PRELOADER
window.addEventListener('load', () => {
  const pre = document.getElementById('preloader');
  setTimeout(() => { pre.style.opacity = '0'; setTimeout(() => pre.style.display='none', 500); }, 400);
});

// THEME TOGGLE
const themeToggle = document.getElementById('themeToggle');
const html = document.documentElement;
const savedTheme = localStorage.getItem('cinebuzz-theme') || 'dark';
html.setAttribute('data-theme', savedTheme);
themeToggle.textContent = savedTheme === 'dark' ? '🌙' : '☀️';

themeToggle.addEventListener('click', () => {
  const current = html.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  themeToggle.textContent = next === 'dark' ? '🌙' : '☀️';
  localStorage.setItem('cinebuzz-theme', next);
});

// MOBILE NAV
const burger = document.getElementById('burger');
const navLinks = document.getElementById('navLinks');
burger.addEventListener('click', () => navLinks.classList.toggle('open'));

// NAVBAR SCROLL EFFECT
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
  document.getElementById('backToTop').classList.toggle('show', window.scrollY > 400);
});

// BACK TO TOP
document.getElementById('backToTop').addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// SCROLL REVEAL
const revealEls = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('active');
  });
}, { threshold: 0.15 });
revealEls.forEach(el => observer.observe(el));

// COUNTDOWN TIMER (Coming Soon section)
document.querySelectorAll('.countdown').forEach(el => {
  const target = new Date(el.dataset.date).getTime();
  function update() {
    const now = Date.now();
    const diff = target - now;
    if (diff <= 0) { el.textContent = 'Released!'; return; }
    const days = Math.floor(diff / (1000*60*60*24));
    el.textContent = `${days} days to go`;
  }
  update();
  setInterval(update, 1000*60*60);
});

// NEWSLETTER FORM (frontend only demo)
document.getElementById('newsletterForm').addEventListener('submit', (e) => {
  e.preventDefault();
  document.getElementById('newsletterMsg').textContent = "🎉 Thanks! You're subscribed.";
  e.target.reset();
});

// PARTICLE BACKGROUND (Hero canvas)
const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');
function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
resize();
window.addEventListener('resize', resize);

let particles = Array.from({length: 60}, () => ({
  x: Math.random()*canvas.width,
  y: Math.random()*canvas.height,
  r: Math.random()*2+0.5,
  dx: (Math.random()-0.5)*0.3,
  dy: (Math.random()-0.5)*0.3
}));

function animate() {
  ctx.clearRect(0,0,canvas.width, canvas.height);
  particles.forEach(p => {
    p.x += p.dx; p.y += p.dy;
    if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
    if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
    ctx.fillStyle = 'rgba(229,9,20,0.5)';
    ctx.fill();
  });
  requestAnimationFrame(animate);
}
animate();
