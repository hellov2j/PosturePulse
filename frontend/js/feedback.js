import { COLORS, FORM_SCORE_THRESHOLDS } from './config.js';

let speechSynth = null;
let voices = [];
let lastSpoken = '';
let lastSpokenTime = 0;
const SPEECH_COOLDOWN = 3000;

let alertContainer = null;

export function initFeedback() {
  speechSynth = window.speechSynthesis;
  alertContainer = document.getElementById('feedback-alerts');

  function loadVoices() {
    voices = speechSynth.getVoices();
  }

  loadVoices();
  speechSynth.onvoiceschanged = loadVoices;
}

export function speakCorrection(message) {
  if (!speechSynth) return;

  const now = Date.now();
  if (message === lastSpoken && now - lastSpokenTime < SPEECH_COOLDOWN) return;

  speechSynth.cancel();

  const utterance = new SpeechSynthesisUtterance(message);
  utterance.rate = 1.1;
  utterance.pitch = 1.0;
  utterance.volume = 0.9;

  const englishVoice = voices.find(
    (v) => v.lang.startsWith('en') && v.name.includes('Female')
  ) || voices.find((v) => v.lang.startsWith('en'));
  if (englishVoice) utterance.voice = englishVoice;

  speechSynth.speak(utterance);
  lastSpoken = message;
  lastSpokenTime = now;
}

export function showAlert(message, severity) {
  if (!alertContainer) return;

  alertContainer.innerHTML = '';

  const alert = document.createElement('div');
  alert.className = `feedback-alert feedback-alert--${severity}`;

  const icon = getSeverityIcon(severity);
  alert.innerHTML = `
    <span class="feedback-alert__icon">${icon}</span>
    <span class="feedback-alert__text">${message}</span>
  `;

  alertContainer.appendChild(alert);

  requestAnimationFrame(() => alert.classList.add('feedback-alert--visible'));

  setTimeout(() => {
    alert.classList.remove('feedback-alert--visible');
    setTimeout(() => alert.remove(), 300);
  }, 3500);
}

function getSeverityIcon(severity) {
  switch (severity) {
    case 'danger':
      return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;
    case 'warning':
      return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;
    default:
      return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>`;
  }
}

export function updateHUDPanel(data) {
  if (!data) return;

  updateAngleDisplays(data.angles || {});
  updateFormScore(data.form_score ?? 0);
  updateRepCount(data.rep_count ?? 0, data.set_count ?? 1);
  updateCorrectionStatus(data.is_correct, data.corrections || []);
}

function updateAngleDisplays(angles) {
  for (const [name, value] of Object.entries(angles)) {
    const el = document.getElementById(`angle-${name}`);
    if (!el) continue;

    const valueEl = el.querySelector('.hud-angle__value');
    const barEl = el.querySelector('.hud-angle__bar-fill');

    if (valueEl) valueEl.textContent = `${Math.round(value)}\u00B0`;

    if (barEl) {
      const percentage = Math.min(100, (value / 180) * 100);
      barEl.style.width = `${percentage}%`;
    }
  }
}

function updateFormScore(score) {
  const el = document.getElementById('form-score-value');
  const barEl = document.getElementById('form-score-bar');
  const labelEl = document.getElementById('form-score-label');

  if (el) el.textContent = score;
  if (barEl) {
    barEl.style.width = `${score}%`;
    barEl.style.backgroundColor = getScoreColor(score);
  }
  if (labelEl) {
    labelEl.textContent = getScoreLabel(score);
    labelEl.style.color = getScoreColor(score);
  }
}

function updateRepCount(reps, sets) {
  const repsEl = document.getElementById('rep-count');
  const setsEl = document.getElementById('set-count');
  const repsBarEl = document.getElementById('reps-bar');

  if (repsEl) repsEl.textContent = reps;
  if (setsEl) setsEl.textContent = sets;
  if (repsBarEl) {
    const maxReps = 10;
    repsBarEl.style.width = `${Math.min(100, (reps / maxReps) * 100)}%`;
  }
}

function updateCorrectionStatus(isCorrect, corrections) {
  const statusEl = document.getElementById('correction-status');
  if (!statusEl) return;

  if (isCorrect && corrections.length === 0) {
    statusEl.innerHTML = `
      <span class="correction-status correction-status--good">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
        Form looks good
      </span>
    `;
  } else if (corrections.length > 0) {
    statusEl.innerHTML = `
      <span class="correction-status correction-status--bad">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        ${corrections[0]}
      </span>
    `;
  }
}

function getScoreColor(score) {
  if (score >= FORM_SCORE_THRESHOLDS.excellent) return COLORS.correct;
  if (score >= FORM_SCORE_THRESHOLDS.good) return COLORS.good;
  if (score >= FORM_SCORE_THRESHOLDS.warning) return COLORS.warning;
  return COLORS.danger;
}

function getScoreLabel(score) {
  if (score >= FORM_SCORE_THRESHOLDS.excellent) return 'Excellent';
  if (score >= FORM_SCORE_THRESHOLDS.good) return 'Good';
  if (score >= FORM_SCORE_THRESHOLDS.warning) return 'Adjust Form';
  return 'Poor Form';
}
