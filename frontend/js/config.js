export const POSE_CONNECTIONS = [
  [11, 12], [11, 13], [13, 15], [12, 14], [14, 16],
  [11, 23], [12, 24], [23, 24],
  [23, 25], [25, 27], [24, 26], [26, 28],
  [27, 29], [29, 31], [28, 30], [30, 32],
  [27, 28], [31, 32],
  [0, 1], [1, 2], [2, 3], [3, 7],
  [0, 4], [4, 5], [5, 6], [6, 8],
  [9, 10],
];

export const JOINT_RADIUS = 6;

export const COLORS = {
  correct: '#22C55E',
  good: '#60A5FA',
  warning: '#F59E0B',
  danger: '#EF4444',
  skeleton: 'rgba(248, 250, 252, 0.8)',
  skeletonDim: 'rgba(248, 250, 252, 0.3)',
  accent: '#EF4444',
  canvas: '#000000',
  surface: '#0A0A0F',
};

export const EXERCISE_CONFIGS = {
  squat: {
    name: 'Squat',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="4" r="2.5"/><path d="M8 8h8l1 5h-2l-1 4h-2l-1-4h-2l-1 4H9l-1-4H6l1-5z"/><path d="M9 17l-2 4M15 17l2 4"/></svg>`,
    description: 'Knee depth & back alignment',
    muscles: ['Quadriceps', 'Glutes', 'Hamstrings'],
    duration: '4 min',
    keyAngles: ['knee', 'back'],
  },
  pushup: {
    name: 'Push-Up',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="6" cy="10" r="2"/><path d="M8 10h14M6 13l4 5M20 13l-4 5"/><circle cx="18" cy="10" r="0.5"/></svg>`,
    description: 'Elbow bend & body line',
    muscles: ['Chest', 'Triceps', 'Shoulders'],
    duration: '5 min',
    keyAngles: ['elbow', 'body_line'],
  },
  lunge: {
    name: 'Lunge',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="8" cy="4" r="2.5"/><path d="M6 7l2 5-2 4 1 4M10 7l2 4 3 3-1 5"/><path d="M15 14l3-2"/></svg>`,
    description: 'Knee angles & torso upright',
    muscles: ['Quadriceps', 'Glutes', 'Core'],
    duration: '3 min',
    keyAngles: ['front_knee', 'back_knee', 'torso'],
  },
  deadlift: {
    name: 'Deadlift',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="4" r="2.5"/><path d="M9 7l3 5 3-5M9 12l-1 6h8l-1-6"/><line x1="5" y1="20" x2="19" y2="20"/></svg>`,
    description: 'Hip hinge & back straight',
    muscles: ['Back', 'Hamstrings', 'Glutes'],
    duration: '6 min',
    keyAngles: ['hip', 'knee', 'back'],
  },
  plank: {
    name: 'Plank',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="5" cy="12" r="2"/><path d="M7 12h14"/><path d="M7 14l-2 4M21 14l-2 4"/></svg>`,
    description: 'Body line alignment',
    muscles: ['Core', 'Shoulders', 'Glutes'],
    duration: '3 min',
    keyAngles: ['body_line'],
  },
  curl: {
    name: 'Bicep Curl',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="6" r="2.5"/><path d="M10 9l-2 7h2l2-4 2 4h2l-2-7"/><path d="M8 16l-1 4M16 16l1 4"/></svg>`,
    description: 'Elbow isolation & full range',
    muscles: ['Biceps', 'Forearms'],
    duration: '4 min',
    keyAngles: ['elbow'],
  },
};

const wsProtocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
export const WS_URL = `${wsProtocol}://${window.location.host}/ws`;

export const ANGLE_LANDMARK_MAP = {
  squat: {
    knee: [23, 25, 27],
    back: [11, 23, 25],
  },
  pushup: {
    elbow: [11, 13, 15],
    body_line: [11, 23, 27],
  },
  lunge: {
    front_knee: [23, 25, 27],
    back_knee: [24, 26, 28],
    torso: [11, 23, 25],
  },
  deadlift: {
    hip: [11, 23, 25],
    knee: [23, 25, 27],
    back: [11, 23, 25],
  },
  plank: {
    body_line: [11, 23, 27],
  },
  curl: {
    elbow: [11, 13, 15],
  },
};

export const FORM_SCORE_THRESHOLDS = {
  excellent: 90,
  good: 75,
  warning: 50,
};
