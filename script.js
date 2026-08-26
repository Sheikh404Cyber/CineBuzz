const API_KEY = "86cff657a8380ef42761bf8b5530faa4";
const BASE_URL = "https://api.themoviedb.org/3";
const IMG_URL = "https://image.tmdb.org/t/p/w500";
const BACKDROP_URL = "https://image.tmdb.org/t/p/original";

window.addEventListener('load', () => {
  document.getElementById('preloader').classList.add('hide');
});

// Theme
const themeToggle = document.getElementById('themeToggle');
const htmlEl = document.documentElement;
if (localStorage.getItem('theme') === 'light') {
  htmlEl.setAttribute('data-theme','light');
  themeToggle.textContent = '☀️';
}
themeToggle.addEventListener('click', () => {
  const isDark = htmlEl.getAttribute('data-theme') !== 'light';
  htmlEl.setAttribute('data-theme', isDark ? 'light' : 'dark');
  themeToggle.textContent = isDark ? '☀️' : '🌙';
  localStorage.setItem('theme', isDark ? 'light' : 'dark');
});

document.getElementById('menuToggle').addEventListener('click', () => {
  document.getElementById('navLinks').classList.toggle('active');
});

window.addEventListener('scroll', () => {
  document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 40);
  document.getElementById('backToTop').classList.toggle('show', window.scrollY > 400);
});
document.getElementById('backToTop').addEventListener('click', () => window.scrollTo({top:0, behavior:'smooth'}));

async function fetchTMDB(endpoint) {
  try {
    const sep = endpoint.includes('?') ? '&' : '?';
    const res = await fetch(`${BASE_URL}${endpoint}${sep}api_key=${API_KEY}&language=en-US`);
    if (!res.ok) throw new Error('API error: ' + res.status);
    return await res.json();
  } catch (err) {
    console.error(err);
    return null;
  }
}

function createCard(item) {
  const title = item.title || item.name || 'Untitled';
  const date = item.release_date || item.first_air_date || '';
  const poster = item.poster_path ? IMG_URL + item.poster_path : 'https://via.placeholder.com/300x450/1a1f2e/ffffff?text=No+Image';
  const rating = item.vote_average ? item.vote_average.toFixed(1) : 'N/A';
  const mediaType = item.media_type || (item.title ? 'movie' : 'tv');

  const card = document.createElement('div');
  card.className = 'movie-card';
  card.innerHTML = `
    <div class="poster-wrap">
      <img src="${poster}" alt="${title}" loading="lazy">
      <div class="rating-badge">⭐ ${rating}</div>
      <div class="card-overlay"><button class="play-btn">▶</button></div>
    </div>
    <h3 class="card-title">${title}</h3>
    <p class="card-date">${date ? new Date(date).getFullYear() : ''}</p>
  `;
  card.addEventListener('click', () => openModal(item.id, mediaType));
  return card;
}

function renderRow(containerId, items) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  if (!items || !items.length) {
    container.innerHTML = '<p class="empty-note">No data found.</p>';
    return;
  }
  items.forEach(item => container.appendChild(createCard(item)));
}

async function loadTrending() {
  const data = await fetchTMDB('/trending/all/day');
  if (data) {
    renderRow('trendingRow', data.results);
    const heroPool = data.results.filter(i => i.backdrop_path).slice(0, 6);
    if (heroPool.length) setHero(heroPool[Math.floor(Math.random() * heroPool.length)]);
  }
}
async function loadNetflix() {
  const data = await fetchTMDB('/discover/tv?with_networks=213&sort_by=popularity.desc');
  if (data) renderRow('netflixRow', data.results);
}
async function loadPrime() {
  const data = await fetchTMDB('/discover/movie?with_watch_providers=9&watch_region=US&sort_by=popularity.desc');
  if (data) renderRow('primeRow', data.results);
}
async function loadSeries() {
  const data = await fetchTMDB('/tv/popular');
  if (data) renderRow('seriesRow', data.results);
}
async function loadTopRated() {
  const data = await fetchTMDB('/movie/top_rated');
  if (data) renderRow('topratedRow', data.results);
}
async function loadUpcoming() {
  const data = await fetchTMDB('/movie/upcoming');
  if (data) renderRow('upcomingRow', data.results);
}

function setHero(item) {
  const title = item.title || item.name;
  const backdrop = item.backdrop_path ? BACKDROP_URL + item.backdrop_path : '';
  document.getElementById('heroBg').style.backgroundImage = `url(${backdrop})`;
  document.getElementById('heroTitle').textContent = title;
  document.getElementById('heroOverview').textContent = item.overview ? item.overview.slice(0, 200) + '...' : '';
  document.getElementById('heroDetailsBtn').onclick = () => openModal(item.id, item.media_type || (item.title ? 'movie' : 'tv'));
}

const modalOverlay = document.getElementById('modalOverlay');
async function openModal(id, type) {
  modalOverlay.classList.add('active');
  document.getElementById('modalContent').innerHTML = '<div class="loader-inline">Loading...</div>';
  const data = await fetchTMDB(`/${type}/${id}?append_to_response=credits,videos,watch/providers`);
  if (!data) { document.getElementById('modalContent').innerHTML = '<p class="empty-note">Failed to load details.</p>'; return; }

  const title = data.title || data.name;
  const poster = data.poster_path ? IMG_URL + data.poster_path : '';
  const trailer = data.videos?.results?.find(v => v.type === 'Trailer' && v.site === 'YouTube');
  const cast = data.credits?.cast?.slice(0, 6) || [];
  const providers = data['watch/providers']?.results?.US?.flatrate || [];
  const year = (data.release_date || data.first_air_date || '').split('-')[0] || '';

  document.getElementById('modalContent').innerHTML = `
    <div class="modal-grid">
      <img src="${poster}" class="modal-poster" alt="${title}">
      <div class="modal-info">
        <h2>${title}</h2>
        <p class="modal-rating">⭐ ${data.vote_average ? data.vote_average.toFixed(1) : 'N/A'} | ${year}</p>
        <p class="modal-overview">${data.overview || 'No description available.'}</p>
        <div class="modal-cast">${cast.map(c => `<span class="cast-chip">${c.name}</span>`).join('')}</div>
        <div class="modal-providers">
          ${providers.length ? 'Available on: ' + providers.map(p => `<img src="${IMG_URL + p.logo_path}" class="provider-logo" title="${p.provider_name}">`).join('') : 'Streaming info not available for this title.'}
        </div>
        ${trailer ? `<a href="https://www.youtube.com/watch?v=${trailer.key}" target="_blank" class="btn-primary">▶ Watch Trailer</a>` : ''}
      </div>
    </div>
  `;
}
document.getElementById('modalClose').addEventListener('click', () => modalOverlay.classList.remove('active'));
modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) modalOverlay.classList.remove('active'); });

// Search
let searchTimeout;
document.getElementById('searchInput').addEventListener('input', (e) => {
  clearTimeout(searchTimeout);
  const query = e.target.value.trim();
  const resultsBox = document.getElementById('searchResults');
  if (!query) { resultsBox.classList.remove('active'); return; }
  searchTimeout = setTimeout(async () => {
    const data = await fetchTMDB(`/search/multi?query=${encodeURIComponent(query)}`);
    if (data && data.results.length) {
      resultsBox.innerHTML = data.results.slice(0, 8).map(item => {
        const title = item.title || item.name;
        const poster = item.poster_path ? IMG_URL + item.poster_path : 'https://via.placeholder.com/60x90';
        return `<div class="search-result-item" data-id="${item.id}" data-type="${item.media_type}">
          <img src="${poster}"><span>${title}</span></div>`;
      }).join('');
      resultsBox.classList.add('active');
      resultsBox.querySelectorAll('.search-result-item').forEach(el => {
        el.addEventListener('click', () => {
          openModal(el.dataset.id, el.dataset.type);
          resultsBox.classList.remove('active');
          document.getElementById('searchInput').value = '';
        });
      });
    } else {
      resultsBox.innerHTML = '<p class="no-result">No results found</p>';
      resultsBox.classList.add('active');
    }
  }, 450);
});
document.addEventListener('click', (e) => {
  if (!e.target.closest('.search-box')) document.getElementById('searchResults').classList.remove('active');
});

// Scroll reveal
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('visible'); });
}, { threshold: 0.1 });
document.querySelectorAll('.content-row').forEach(el => observer.observe(el));

// Init all sections
loadTrending();
loadNetflix();
loadPrime();
loadSeries();
loadTopRated();
loadUpcoming();
