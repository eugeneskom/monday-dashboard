'use client';
import { useRef, useCallback, useEffect } from 'react';

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
  const triggerRefresh = useCallback(() => {
    console.log('Webhook live update triggered');
  }, []);

  const { onBoardUpdate, onConnectionStatus } = options || {};

  useEffect(() => {
    // Only run in browser environment
    if (typeof window === 'undefined') {
      return;
    }

    // Connect to SSE endpoint
    eventSourceRef.current = new EventSource('/api/webhooks/monday');
    
    eventSourceRef.current.onopen = () => {
      console.log('EventSource connected');
      if (onConnectionStatus) {
        onConnectionStatus(true);
      }
    };
    
    eventSourceRef.current.onmessage = (event) => {
      console.log('Webhook received:', event.data);
      try {
        const webhookData: WebhookEvent = JSON.parse(event.data);
        console.log('Parsed webhook data:', webhookData);
        
        // Call the onBoardUpdate callback if provided
        if (onBoardUpdate) {
          onBoardUpdate(webhookData);
        }
        
        // Trigger refresh when webhook is received
        triggerRefresh();
      } catch (error) {
        console.error('Error parsing webhook data:', error);
      }
    };
    
    eventSourceRef.current.onerror = (error) => {
      console.error('EventSource error:', error);
      if (onConnectionStatus) {
        onConnectionStatus(false);
      }
    };
    
    return () => {
      eventSourceRef.current?.close();
      if (onConnectionStatus) {
        onConnectionStatus(false);
      }
    };
  }, [triggerRefresh, onBoardUpdate, onConnectionStatus]);

  return {
    triggerRefresh,
    isConnected: typeof window !== 'undefined' && eventSourceRef.current?.readyState === EventSource.OPEN
  };
}