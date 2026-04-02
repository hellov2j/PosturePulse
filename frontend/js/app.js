import { initPoseLandmarker, detectPose, landmarksToArray } from './pose.js';
import { initCanvas, resizeCanvas, drawSkeleton, updateCanvasState, drawIdleFrame } from './canvas.js';
import { connectWebSocket, startSession, sendLandmarks, sendNextSet, endSession, isWSConnected } from './websocket.js';
import { initFeedback, speakCorrection, showAlert, updateHUDPanel } from './feedback.js';
import { initUI, switchView, getCurrentView, updateExerciseHeader, initAnglePanels } from './ui.js';

let videoElement, canvasElement;
let isModelReady = false;
let isSessionActive = false;
let currentExercise = null;
let animationFrameId = null;
let frameSkip = 0;
let pendingExercise = null;

async function init() {
  videoElement = document.getElementById('webcam');
  canvasElement = document.getElementById('pose-canvas');

  initCanvas(canvasElement);
  initFeedback();
  initUI();

  setupEventListeners();

  try {
    await initPoseLandmarker();
    isModelReady = true;
    updateStatus('Model loaded', 'ready');
  } catch (e) {
    console.error('Failed to load pose model:', e);
    updateStatus('Model failed to load', 'error');
    showAlert('AI model failed to load. Try refreshing the page.', 'danger');
  }

  connectWebSocket(
    handleWSMessage,
    () => {
      updateStatus('Connected', 'ready');
      if (pendingExercise) {
        startSession(pendingExercise);
        pendingExercise = null;
      }
    },
    () => updateStatus('Disconnected', 'error')
  );
}

function setupEventListeners() {
  document.getElementById('exercise-cards')?.addEventListener('click', (e) => {
    const card = e.target.closest('[data-exercise]');
    if (card) {
      const exercise = card.dataset.exercise;
      selectExercise(exercise);
    }
  });

  document.getElementById('btn-end-session')?.addEventListener('click', stopWorkout);
  document.getElementById('btn-next-set')?.addEventListener('click', () => {
    sendNextSet();
    initAnglePanels(currentExercise);
  });

  document.getElementById('btn-start-hero')?.addEventListener('click', () => {
    switchView('select');
  });
}

async function selectExercise(exercise) {
  currentExercise = exercise;
  frameSkip = 0;
  updateExerciseHeader(exercise);
  initAnglePanels(exercise);
  switchView('workout');

  await startWebcam();

  if (isWSConnected()) {
    startSession(exercise);
  } else {
    pendingExercise = exercise;
  }
}

async function startWebcam() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    showAlert('Camera access not available. Use HTTPS or localhost.', 'danger');
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
      audio: false,
    });

    videoElement.srcObject = stream;

    await new Promise((resolve) => {
      videoElement.onloadedmetadata = () => {
        videoElement.play();
        resizeCanvas(videoElement.videoWidth, videoElement.videoHeight);
        resolve();
      };
    });

    isSessionActive = true;
    runDetectionLoop();
  } catch (e) {
    console.error('Webcam error:', e);
    showAlert('Cannot access webcam. Please allow camera permissions.', 'danger');
  }
}

function runDetectionLoop() {
  if (!isSessionActive) return;

  const timestamp = performance.now();

  if (isModelReady) {
    const result = detectPose(videoElement, timestamp);

    if (result && result.landmarks && result.landmarks.length > 0) {
      const landmarks = result.landmarks[0];

      drawSkeleton(landmarks, videoElement);

      frameSkip++;
      if (frameSkip % 2 === 0 && isWSConnected()) {
        sendLandmarks(landmarksToArray(landmarks), currentExercise);
      }
    } else {
      drawIdleFrame(videoElement);
    }
  } else {
    drawIdleFrame(videoElement);
  }

  animationFrameId = requestAnimationFrame(runDetectionLoop);
}

function stopWorkout() {
  isSessionActive = false;

  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }

  if (videoElement && videoElement.srcObject) {
    videoElement.srcObject.getTracks().forEach((track) => track.stop());
    videoElement.srcObject = null;
  }

  if (isWSConnected()) {
    endSession();
  }

  pendingExercise = null;
  switchView('select');
}

function handleWSMessage(data) {
  switch (data.type) {
    case 'session_started':
      updateStatus(`Session: ${data.exercise}`, 'active');
      break;

    case 'feedback':
      updateHUDPanel(data);
      updateCanvasState(
        data.angles,
        [],
        data.severity
      );
      break;

    case 'correction':
      showAlert(data.message, data.severity);
      speakCorrection(data.message);
      break;

    case 'set_started':
      showAlert(`Set ${data.set_count} started!`, 'info');
      break;

    case 'session_ended':
      if (data.stats) {
        showAlert(
          `Workout complete! ${data.stats.total_reps} reps at ${Math.round(data.stats.avg_form_score)}% form.`,
          'info'
        );
      }
      break;

    case 'pong':
      break;

    default:
      break;
  }
}

function updateStatus(text, state) {
  const el = document.getElementById('connection-status');
  if (!el) return;

  el.textContent = text;
  el.className = `status-indicator status-indicator--${state}`;
}

document.addEventListener('DOMContentLoaded', init);
