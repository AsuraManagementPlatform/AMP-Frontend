import keycloakService from '@/services/keycloak.service';

export type InvalidationHandler = (resources: string[]) => void;

const RECONNECT_BASE_MS = 1000;
const RECONNECT_MAX_MS = 30000;
const PING_INTERVAL_MS = 25000;

export const BEARER_SUBPROTOCOL = 'bearer';

/** Only the dedicated realtime service speaks websocket, so an unset URL means the feature is off. */
function buildUrl(): string | null {
    const base = import.meta.env.VITE_REALTIME_URL;
    if (!base) return null;

    const url = new URL(base, window.location.origin);
    url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
    url.pathname = '/ws/updates';
    url.search = '';
    return url.toString();
}

/**
 * Keeps one websocket open and reports which resources changed.
 * The server sends names only, never data, so the app refetches through the usual endpoints.
 */
class RealtimeService {
    private socket: WebSocket | null = null;
    private handlers = new Set<InvalidationHandler>();
    private reconnectAttempt = 0;
    private reconnectTimer: number | null = null;
    private pingTimer: number | null = null;
    private stopped = true;

    subscribe(handler: InvalidationHandler): () => void {
        this.handlers.add(handler);
        return () => this.handlers.delete(handler);
    }

    connect(): void {
        this.stopped = false;
        if (this.socket && this.socket.readyState <= WebSocket.OPEN) return;

        const url = buildUrl();
        const token = keycloakService.token;
        if (!url || !token) return;

        try {
            // The token travels as a subprotocol so it never lands in a URL, which servers log.
            this.socket = new WebSocket(url, [BEARER_SUBPROTOCOL, token]);
        } catch {
            this.scheduleReconnect();
            return;
        }

        this.socket.onopen = () => {
            this.reconnectAttempt = 0;
            this.startPing();
        };

        this.socket.onmessage = (event) => {
            try {
                const payload = JSON.parse(event.data);
                if (payload?.type === 'invalidate' && Array.isArray(payload.resources)) {
                    this.handlers.forEach(handler => handler(payload.resources));
                }
            } catch {
                // A malformed frame is not worth interrupting the session for
            }
        };

        this.socket.onclose = () => {
            this.stopPing();
            this.socket = null;
            this.scheduleReconnect();
        };

        this.socket.onerror = () => this.socket?.close();
    }

    disconnect(): void {
        this.stopped = true;
        this.stopPing();
        if (this.reconnectTimer) {
            window.clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
        this.socket?.close();
        this.socket = null;
    }

    private scheduleReconnect(): void {
        if (this.stopped || this.reconnectTimer) return;

        const delay = Math.min(RECONNECT_BASE_MS * 2 ** this.reconnectAttempt, RECONNECT_MAX_MS);
        this.reconnectAttempt += 1;
        this.reconnectTimer = window.setTimeout(() => {
            this.reconnectTimer = null;
            this.connect();
        }, delay);
    }

    private startPing(): void {
        this.stopPing();
        this.pingTimer = window.setInterval(() => {
            if (this.socket?.readyState === WebSocket.OPEN) {
                this.socket.send(JSON.stringify({ type: 'ping' }));
            }
        }, PING_INTERVAL_MS);
    }

    private stopPing(): void {
        if (this.pingTimer) {
            window.clearInterval(this.pingTimer);
            this.pingTimer = null;
        }
    }
}

export const realtimeService = new RealtimeService();
