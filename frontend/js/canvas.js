import { POSE_CONNECTIONS, JOINT_RADIUS, COLORS } from './config.js';

let canvas, ctx;
let currentAngles = {};
let highlightJoints = [];
let currentSeverity = 'info';

export function initCanvas(canvasElement) {
  canvas = canvasElement;
  ctx = canvas.getContext('2d');
}

export function resizeCanvas(videoWidth, videoHeight) {
  canvas.width = videoWidth;
  canvas.height = videoHeight;
}

export function drawSkeleton(landmarks, videoElement) {
  if (!ctx || !canvas) return;

  ctx.save();
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

  if (!landmarks || landmarks.length === 0) {
    ctx.restore();
    return;
  }

  drawConnections(landmarks);
  drawJoints(landmarks);
  drawAngleAnnotations(landmarks);

  ctx.restore();
}

function drawConnections(landmarks) {
  for (const [i, j] of POSE_CONNECTIONS) {
    if (i >= landmarks.length || j >= landmarks.length) continue;

    const a = landmarks[i];
    const b = landmarks[j];

    const isHighlighted = highlightJoints.includes(i) || highlightJoints.includes(j);
    const color = isHighlighted ? getColorForSeverity() : COLORS.skeleton;

    ctx.beginPath();
    ctx.moveTo(a.x * canvas.width, a.y * canvas.height);
    ctx.lineTo(b.x * canvas.width, b.y * canvas.height);
    ctx.strokeStyle = color;
    ctx.lineWidth = isHighlighted ? 4 : 2;
    ctx.stroke();
  }
}

function drawJoints(landmarks) {
  for (let i = 0; i < landmarks.length; i++) {
    const lm = landmarks[i];
    const x = lm.x * canvas.width;
    const y = lm.y * canvas.height;
    const isHighlighted = highlightJoints.includes(i);

    const radius = isHighlighted ? JOINT_RADIUS + 2 : JOINT_RADIUS;
    const color = isHighlighted ? getColorForSeverity() : COLORS.skeleton;

    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();

    if (isHighlighted) {
      ctx.beginPath();
      ctx.arc(x, y, radius + 6, 0, 2 * Math.PI);
      ctx.strokeStyle = getColorForSeverity();
      ctx.lineWidth = 1.5;
      ctx.globalAlpha = 0.4;
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }
}

function drawAngleAnnotations(landmarks) {
  for (const [angleName, angleValue] of Object.entries(currentAngles)) {
    const jointIdx = getJointForAngle(angleName);
    if (jointIdx === null || jointIdx >= landmarks.length) continue;

    const lm = landmarks[jointIdx];
    const x = lm.x * canvas.width;
    const y = lm.y * canvas.height;

    ctx.font = '600 14px "JetBrains Mono", monospace';
    ctx.fillStyle = '#F8FAFC';
    ctx.textAlign = 'center';

    const label = `${Math.round(angleValue)}\u00B0`;
    ctx.fillText(label, x + 20, y - 15);
  }
}

function getJointForAngle(angleName) {
  const map = {
    knee: 25,
    back: 23,
    elbow: 13,
    body_line: 23,
    front_knee: 25,
    back_knee: 26,
    torso: 23,
    hip: 23,
  };
  return map[angleName] ?? null;
}

function getColorForSeverity() {
  switch (currentSeverity) {
    case 'danger': return COLORS.danger;
    case 'warning': return COLORS.warning;
    default: return COLORS.correct;
  }
}

export function updateCanvasState(angles, highlightIndices, severity) {
  currentAngles = angles || {};
  highlightJoints = highlightIndices || [];
  currentSeverity = severity || 'info';
}

export function drawIdleFrame(videoElement) {
  if (!ctx || !canvas) return;
  ctx.save();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
  ctx.restore();
}
