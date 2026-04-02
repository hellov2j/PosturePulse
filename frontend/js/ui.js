import { EXERCISE_CONFIGS } from './config.js';

let currentView = 'landing';

export function initUI() {
  setupNavigation();
  setupExerciseCards();
  setupScrollAnimations();
  setupLandingAnimations();
}

function setupNavigation() {
  document.querySelectorAll('[data-nav]').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const target = el.dataset.nav;
      switchView(target);
    });
  });
}

export function switchView(viewId) {
  const views = document.querySelectorAll('.view');
  views.forEach((v) => v.classList.remove('view--active'));

  const target = document.getElementById(`view-${viewId}`);
  if (target) {
    target.classList.add('view--active');
    currentView = viewId;
  }

  if (viewId === 'dashboard') {
    loadDashboardData();
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function setupExerciseCards() {
  const container = document.getElementById('exercise-cards');
  if (!container) return;

  for (const [key, config] of Object.entries(EXERCISE_CONFIGS)) {
    const card = document.createElement('button');
    card.className = 'exercise-card';
    card.dataset.exercise = key;
    card.innerHTML = `
      <div class="exercise-card__icon">${config.icon}</div>
      <h3 class="exercise-card__name">${config.name}</h3>
      <p class="exercise-card__desc">${config.description}</p>
      <div class="exercise-card__meta">
        <span class="exercise-card__duration">${config.duration}</span>
        <span class="exercise-card__muscles">${config.muscles[0]}</span>
      </div>
      <div class="exercise-card__hover-detail">
        <p>Targets: ${config.muscles.join(', ')}</p>
        <p>Angles: ${config.keyAngles.join(', ')}</p>
      </div>
    `;
    container.appendChild(card);
  }
}

function setupScrollAnimations() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
  );

  document.querySelectorAll('.scroll-reveal').forEach((el) => {
    observer.observe(el);
  });
}

function setupLandingAnimations() {
  const heroTitle = document.querySelector('.hero__title');
  if (heroTitle) {
    heroTitle.classList.add('hero__title--animate');
  }
}

export function getCurrentView() {
  return currentView;
}

export function updateExerciseHeader(exercise) {
  const config = EXERCISE_CONFIGS[exercise];
  if (!config) return;

  const nameEl = document.getElementById('current-exercise-name');
  const iconEl = document.getElementById('current-exercise-icon');

  if (nameEl) nameEl.textContent = config.name.toUpperCase();
  if (iconEl) iconEl.innerHTML = config.icon;
}

export function initAnglePanels(exercise) {
  const config = EXERCISE_CONFIGS[exercise];
  if (!config) return;

  const container = document.getElementById('angle-panels');
  if (!container) return;

  container.innerHTML = '';

  for (const angleName of config.keyAngles) {
    const panel = document.createElement('div');
    panel.className = 'hud-angle';
    panel.id = `angle-${angleName}`;
    panel.innerHTML = `
      <div class="hud-angle__header">
        <span class="hud-angle__label">${formatAngleName(angleName)}</span>
        <span class="hud-angle__value">--\u00B0</span>
      </div>
      <div class="hud-angle__bar">
        <div class="hud-angle__bar-fill" style="width: 0%"></div>
      </div>
    `;
    container.appendChild(panel);
  }
}

function formatAngleName(name) {
  return name
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

async function loadDashboardData() {
  try {
    const response = await fetch('/api/sessions/stats/summary');
    const data = await response.json();
    updateDashboardStats(data);

    const sessionsRes = await fetch('/api/sessions/?limit=10');
    const sessions = await sessionsRes.json();
    updateSessionList(sessions);
  } catch (e) {
    console.error('Failed to load dashboard:', e);
  }
}

function updateDashboardStats(data) {
  const els = {
    'stat-total-reps': data.total_reps || 0,
    'stat-avg-score': data.avg_form_score || 0,
    'stat-total-hours': data.total_time_hours || 0,
    'stat-total-sessions': data.total_sessions || 0,
  };

  for (const [id, value] of Object.entries(els)) {
    const el = document.getElementById(id);
    if (el) animateCounter(el, value);
  }
}

function animateCounter(el, target) {
  const isFloat = target % 1 !== 0;
  const duration = 800;
  const start = 0;
  const startTime = performance.now();

  function update(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = start + (target - start) * eased;

    el.textContent = isFloat ? current.toFixed(1) : Math.round(current);

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

function updateSessionList(sessions) {
  const container = document.getElementById('session-list');
  if (!container) return;

  if (sessions.length === 0) {
    container.innerHTML = '<p class="text-dim">No sessions yet. Start your first workout!</p>';
    return;
  }

  container.innerHTML = sessions
    .map(
      (s) => `
    <div class="session-row">
      <div class="session-row__exercise">${EXERCISE_CONFIGS[s.exercise]?.name || s.exercise}</div>
      <div class="session-row__reps">${s.total_reps} reps</div>
      <div class="session-row__score">${Math.round(s.avg_form_score)}%</div>
      <div class="session-row__date">${formatDate(s.started_at)}</div>
    </div>
  `
    )
    .join('');
}

function formatDate(isoString) {
  if (!isoString) return '';
  const d = new Date(isoString);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
