'use client';

import React, { useCallback, useEffect, useState } from 'react';

// Types
interface Board {
  id: string;
  name: string;
  description?: string;
  items_count: number;
}

interface BoardSelectorProps {
  selectedBoardIds: string[];
  onBoardSelectionChange: (boardIds: string[]) => void;
}

// Component
export default function BoardSelector({ 
  selectedBoardIds, 
  onBoardSelectionChange 
}: BoardSelectorProps) {
  // State
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tempSelectedIds, setTempSelectedIds] = useState<string[]>(selectedBoardIds);

  // Derived state
  const hasChanges = JSON.stringify(tempSelectedIds.sort()) !== JSON.stringify(selectedBoardIds.sort());

  // Event handlers
  const handleBoardToggle = useCallback((boardId: string) => {
    setTempSelectedIds(prev => 
      prev.includes(boardId)
        ? prev.filter(id => id !== boardId)
        : [...prev, boardId]
    );
  }, []);

  const handleSelectAll = useCallback(() => {
    setTempSelectedIds(boards.map(board => board.id));
  }, [boards]);

  const handleClearAll = useCallback(() => {
    setTempSelectedIds([]);
  }, []);

  const handleSubmit = useCallback(() => {
    onBoardSelectionChange(tempSelectedIds);
  }, [tempSelectedIds, onBoardSelectionChange]);

  const handleCancel = useCallback(() => {
    setTempSelectedIds(selectedBoardIds);
  }, [selectedBoardIds]);

  // Effects
  useEffect(() => {
    const fetchBoards = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/boards');
        if (!response.ok) {
          throw new Error(`Failed to fetch boards: ${response.status}`);
        }
        
        const data = await response.json();
        setBoards(data.boards || []);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch boards';
        setError(errorMessage);
        console.error('BoardSelector: Error fetching boards:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBoards();
  }, []);

  useEffect(() => {
    setTempSelectedIds(selectedBoardIds);
  }, [selectedBoardIds]);

  // Render helpers
  const renderLoadingState = () => (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Select Boards</h2>
      <div className="animate-pulse space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="h-4 bg-gray-200 rounded w-2/3" />
      </div>
    </div>
  );

  const renderErrorState = () => (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Select Boards</h2>
      <div className="text-red-500 bg-red-50 p-3 rounded border border-red-200">
        <p className="font-medium">Error loading boards</p>
        <p className="text-sm mt-1">{error}</p>
      </div>
    </div>
  );

  const renderBoardItem = (board: Board) => (
    <label
      key={board.id}
      className="flex items-center p-2 border border-gray-200 rounded hover:bg-gray-50 cursor-pointer transition-colors"
    >
      <input
        type="checkbox"
        checked={tempSelectedIds.includes(board.id)}
        onChange={() => handleBoardToggle(board.id)}
        className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
      />
      <div className="flex-1 min-w-0">
        <div className="font-medium text-gray-900 truncate">{board.name}</div>
        <div className="text-xs text-gray-500">
          {board.items_count} {board.items_count === 1 ? 'item' : 'items'}
        </div>
      </div>
    </label>
  );

  // Early returns for loading/error states
  if (loading) return renderLoadingState();
  if (error) return renderErrorState();

  // Main render
  return (
    <div className="p-4 bg-white rounded-lg shadow">
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-semibold">Select Boards</h2>
        <div className="space-x-2">
          <button
            onClick={handleSelectAll}
            className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            disabled={boards.length === 0}
          >
            All
          </button>
          <button
            onClick={handleClearAll}
            className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
            disabled={tempSelectedIds.length === 0}
          >
            None
          </button>
        </div>
      </div>
      
      {/* Board List */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {boards.length === 0 ? (
          <div className="text-gray-500 text-center py-4">
            No boards available
          </div>
        ) : (
          boards.map(renderBoardItem)
        )}
      </div>
      
      {/* Selection Summary */}
      {tempSelectedIds.length > 0 && (
        <div className="mt-3 p-2 bg-blue-50 rounded text-sm text-blue-800">
          {tempSelectedIds.length} board{tempSelectedIds.length !== 1 ? 's' : ''} selected
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-4 flex justify-between items-center">
        <div className="text-xs text-gray-500">
          {hasChanges ? 'Unsaved changes' : 'Saved'}
        </div>
        <div className="space-x-2">
          {hasChanges && (
            <button
              onClick={handleCancel}
              className="px-3 py-1 text-xs border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            onClick={handleSubmit}
            disabled={!hasChanges}
            className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {hasChanges ? 'Apply' : 'Applied'}
          </button>
        </div>
      </div>
    </div>
  );
}
