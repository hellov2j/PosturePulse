import { FilesetResolver, PoseLandmarker } from 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/vision_bundle.mjs';

let poseLandmarker = null;
let lastVideoTime = -1;

export async function initPoseLandmarker() {
  const vision = await FilesetResolver.forVisionTasks(
    'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/wasm'
  );

  const options = {
    baseOptions: {
      modelAssetPath:
        'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
      delegate: 'GPU',
    },
    runningMode: 'VIDEO',
    numPoses: 1,
    minPoseDetectionConfidence: 0.5,
    minPosePresenceConfidence: 0.5,
    minTrackingConfidence: 0.5,
  };

  try {
    poseLandmarker = await PoseLandmarker.createFromOptions(vision, options);
  } catch (e) {
    console.warn('GPU delegate failed, falling back to CPU:', e);
    options.baseOptions.delegate = 'CPU';
    poseLandmarker = await PoseLandmarker.createFromOptions(vision, options);
  }

  return poseLandmarker;
}

export function detectPose(video, timestamp) {
  if (!poseLandmarker) return null;
  if (timestamp === lastVideoTime) return null;

  lastVideoTime = timestamp;
  const result = poseLandmarker.detectForVideo(video, timestamp);
  return result;
}

export function landmarksToArray(landmarks) {
  return landmarks.map((lm) => [lm.x, lm.y, lm.z, lm.visibility ?? 1.0]);
}
