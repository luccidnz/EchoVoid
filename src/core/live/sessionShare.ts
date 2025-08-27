// WebSocket client for live session sharing
export type Participant = { id: string; name: string };

type MessageHandler = (data: { text: string; id?: string }) => void;
type AnomalyHandler = (data: any) => void;

let socket: WebSocket | null = null;
let msgHandlers: MessageHandler[] = [];
let anomalyHandlers: AnomalyHandler[] = [];

function setupSocket(id: string) {
  // Using a public echo server for demo purposes
  const url = `wss://echo.websocket.events/?session=${id}`;
  socket = new WebSocket(url);
  socket.onmessage = (ev) => {
    try {
      const payload = JSON.parse(ev.data);
      if (payload.type === 'message') {
        msgHandlers.forEach((h) => h(payload));
      } else if (payload.type === 'anomaly') {
        anomalyHandlers.forEach((h) => h(payload.data));
      }
    } catch (e) {
      // ignore malformed messages
    }
  };
  socket.onclose = () => {
    socket = null;
  };
}

export function createLiveSession() {
  const id = Date.now().toString();
  setupSocket(id);
  return { id, participants: [] as Participant[] };
}

export function joinLiveSession(id: string) {
  setupSocket(id);
  return { success: true };
}

export function leaveLiveSession() {
  if (socket) {
    socket.close();
    socket = null;
  }
}

export function sendMessage(text: string) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({ type: 'message', text }));
  }
}

export function sendAnomaly(data: any) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({ type: 'anomaly', data }));
  }
}

export function onMessage(cb: MessageHandler) {
  msgHandlers.push(cb);
}

export function onAnomaly(cb: AnomalyHandler) {
  anomalyHandlers.push(cb);
}

