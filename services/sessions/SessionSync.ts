import { EventEmitter } from 'events';

export type SyncStatus = 'offline' | 'connecting' | 'online';

/**
 * SessionSync handles realtime exchange of data between session participants
 * over a WebSocket connection. It provides basic reconnection logic and
 * falls back to queuing messages when offline.
 */
export default class SessionSync extends EventEmitter {
  private ws: WebSocket | null = null;
  private readonly sessionId: string;
  private readonly isHost: boolean;
  private readonly url: string;
  private reconnectTimer: any;
  private readonly reconnectInterval = 5000;
  private manualClose = false;
  private queue: string[] = [];

  public status: SyncStatus = 'offline';
  public participants: string[] = [];

  constructor(sessionId: string, isHost: boolean, url = 'wss://echo.websocket.events') {
    super();
    this.sessionId = sessionId;
    this.isHost = isHost;
    this.url = url;
  }

  /** Establish the socket connection */
  connect() {
    this.status = 'connecting';
    this.emit('status', this.status);

    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        this.status = 'online';
        this.emit('status', this.status);
        this.flushQueue();
        // announce join/host
        const payload = { type: this.isHost ? 'host' : 'join', sessionId: this.sessionId };
        this.ws?.send(JSON.stringify(payload));
      };

      this.ws.onmessage = (event: any) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'participants') {
            this.participants = data.participants;
            this.emit('participants', this.participants);
          } else {
            this.emit('message', data);
          }
        } catch {
          this.emit('message', event.data);
        }
      };

      this.ws.onclose = () => {
        this.status = 'offline';
        this.emit('status', this.status);
        if (!this.manualClose) {
          clearTimeout(this.reconnectTimer);
          this.reconnectTimer = setTimeout(() => this.connect(), this.reconnectInterval);
        }
      };

      this.ws.onerror = () => {
        this.status = 'offline';
        this.emit('status', this.status);
      };
    } catch {
      this.status = 'offline';
      this.emit('status', this.status);
    }
  }

  /** Send data through the socket. If offline, queue messages for later. */
  send(data: any) {
    const payload = JSON.stringify(data);
    if (!this.ws || this.status !== 'online') {
      this.queue.push(payload);
      return;
    }
    try {
      this.ws.send(payload);
    } catch {
      this.queue.push(payload);
    }
  }

  private flushQueue() {
    while (this.queue.length && this.ws && this.status === 'online') {
      this.ws.send(this.queue.shift() as string);
    }
  }

  /** Close the socket connection */
  disconnect() {
    this.manualClose = true;
    clearTimeout(this.reconnectTimer);
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.status = 'offline';
    this.emit('status', this.status);
  }
}

