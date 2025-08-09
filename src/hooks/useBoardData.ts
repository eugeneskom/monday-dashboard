'use client';
import useSWR from 'swr';
import { useMondayWebhookLiveUpdates } from './useMondayWebhookLiveUpdates';
import { Board } from '@/types/monday';
import { useCallback, useState } from 'react';

interface MondayBoardResponse {
  id: string;
  name: string;
  items_page: {
    items: Array<{
      id: string;
      name: string;
      column_values: Array<{
        id: string;
        text: string;
        value: string;
      }>;
      subitems?: Array<{
        id: string;
        name: string;
        column_values: Array<{
          id: string;
          text: string;
          value: string;
        }>;
      }>;
    }>;
  };
}

const fetchBoards = async (boardIds: string[]): Promise<Board[]> => {
  console.log('fetchBoards called with:', boardIds);
  
  const query = `
    query GetBoards($boardIds: [ID!]!) {
      boards(ids: $boardIds) {
        id
        name
        items_page {
          items {
            id
            name
            column_values {
              id
              text
              value
            }
            subitems {
              id
              name
              column_values {
                id
                text
                value
              }
            }
          }
        }
      }
    }
  `;

  console.log('Making request to /api/monday...');
  
  const response = await fetch('/api/monday', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables: { boardIds }
    }),
  });

  console.log('Response status:', response.status);

  if (!response.ok) {
    console.error('Response not ok:', response.statusText);
    throw new Error('Failed to fetch boards');
  }

  const result = await response.json();
  console.log('Raw result:', result);
  
  // Transform the response to match our expected Board interface
  const boards = result.data.boards.map((board: MondayBoardResponse) => {
    // Combine main items and subitems into a single items array
    type MondayItem = {
      id: string;
      name: string;
      column_values: Array<{
        id: string;
        text: string;
        value: string;
      }>;
    };
    
    const allItems: MondayItem[] = [];
    
    board.items_page?.items.forEach(item => {
      // Add the main item
      allItems.push(item);
      
      // Add all subitems if they exist
      if (item.subitems && item.subitems.length > 0) {
        allItems.push(...item.subitems);
      }
    });
    
    return {
      id: board.id,
      name: board.name,
      items: allItems
    };
  });
  
  return boards;
};

interface UseBoardDataResult {
  boards: Board[];
  isLoading: boolean;
  error: string | null;
  isLiveConnected: boolean;
  triggerRefresh: () => void;
}

export function useBoardData(boardIds: string[]): UseBoardDataResult {
  console.log('useBoardData called with boardIds:', boardIds);

  const swrKey = boardIds.length > 0 ? `boards-${boardIds.slice().sort().join(',')}` : null;

  const fetcher = async () => {
    console.log('SWR fetcher called for boards:', boardIds);
    return fetchBoards(boardIds);
  };

  const [isLiveConnected, setIsLiveConnected] = useState(false);

  // Get SWR first
  const { data, error, mutate, isLoading } = useSWR(swrKey, fetcher, {
    refreshInterval: 0,          // live-only; no polling
    revalidateOnFocus: true,
  });

  // Wire SSE/webhooks, revalidate on events
  const { triggerRefresh: sseTrigger } = useMondayWebhookLiveUpdates({
    onBoardUpdate: () => {
      void mutate();
    },
    onConnectionStatus: setIsLiveConnected,
  });

  const manualRefresh = useCallback(() => {
    sseTrigger();
    void mutate();
  }, [sseTrigger, mutate]);

  console.log('useBoardData SWR result:', { data, error, isLoading });

  return {
    boards: data || [],
    isLoading,
    error: error?.message || null,
    isLiveConnected,
    triggerRefresh: manualRefresh,
  };
}