'use client';
import { useRef, useCallback, useEffect, useState } from 'react';

export interface WebhookEvent {
  type: string;
  boardId?: string;
  itemId?: string;
  timestamp: string;
  event?: {
    type: string;
    boardId: string;
    itemId?: string;
    columnId?: string;
    value?: unknown;
  };
}

interface WebhookOptions {
  onBoardUpdate?: (event: WebhookEvent) => void;
  onConnectionStatus?: (connected: boolean) => void;
}

export function useMondayWebhookLiveUpdates(options?: WebhookOptions) {
  const eventSourceRef = useRef<EventSource | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { onBoardUpdate, onConnectionStatus } = options || {};

  const triggerRefresh = useCallback(() => {
    // let the caller decide how to refresh (e.g., SWR mutate)
    // kept for backward compatibility
    console.log('Webhook live update triggered');
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Close any existing connection first
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    // Connect to SSE endpoint
    const es = new EventSource('/api/webhooks/stream', { withCredentials: false });
    eventSourceRef.current = es;

    es.onopen = () => {
      setIsConnected(true);
      onConnectionStatus?.(true);
      console.log('[SSE] connected');
    };

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        // broadcast to consumers
        onBoardUpdate?.(data as WebhookEvent);
        triggerRefresh();
      } catch (e) {
        console.warn('[SSE] non-JSON message', event.data);
      }
    };

    es.onerror = () => {
      console.error('[SSE] error; closing and will rely on fallback if any');
      setIsConnected(false);
      onConnectionStatus?.(false);
      es.close();
    };

    return () => {
      if (eventSourceRef.current) {
        console.log('[SSE] cleanup');
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [onBoardUpdate, onConnectionStatus, triggerRefresh]);

  return {
    triggerRefresh,
    isConnected,
  };
}