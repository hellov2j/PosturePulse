import { WS_URL } from './config.js';

let socket = null;
let reconnectAttempts = 0;
const MAX_RECONNECT = 5;
let onMessageCallback = null;
let onConnectCallback = null;
let onDisconnectCallback = null;

export function connectWebSocket(onMessage, onConnect, onDisconnect) {
  onMessageCallback = onMessage;
  onConnectCallback = onConnect;
  onDisconnectCallback = onDisconnect;

  createConnection();
}

function createConnection() {
  socket = new WebSocket(WS_URL);

  socket.onopen = () => {
    reconnectAttempts = 0;
    if (onConnectCallback) onConnectCallback();
  };

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (onMessageCallback) onMessageCallback(data);
    } catch (e) {
      console.error('WS parse error:', e);
    }
  };

  socket.onclose = () => {
    if (onDisconnectCallback) onDisconnectCallback();
    if (reconnectAttempts < MAX_RECONNECT) {
      reconnectAttempts++;
      setTimeout(createConnection, 1000 * reconnectAttempts);
    }
  };

  socket.onerror = () => {
    if (socket) socket.close();
  };
}

export function sendWSMessage(message) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(message));
  }
}

export function startSession(exercise) {
  sendWSMessage({ type: 'start', exercise });
}

export function sendLandmarks(landmarks, exercise) {
  sendWSMessage({
    type: 'landmarks',
    exercise,
    landmarks,
    timestamp: Date.now(),
  });
}

export function sendNextSet() {
  sendWSMessage({ type: 'next_set' });
}

export function endSession() {
  sendWSMessage({ type: 'end' });
}

export function isWSConnected() {
  return socket && socket.readyState === WebSocket.OPEN;
}
