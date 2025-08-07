'use client';
import React, { useEffect, useState } from 'react';

interface Board {
  id: string;
  name: string;
  description?: string;
  items_count: number;
}

interface Props {
  selectedBoardIds: string[];
  onBoardSelectionChange: (boardIds: string[]) => void;
}

export default function BoardSelector({ selectedBoardIds, onBoardSelectionChange }: Props) {
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tempSelectedIds, setTempSelectedIds] = useState<string[]>(selectedBoardIds);

  useEffect(() => {
    const fetchBoards = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/boards');
        if (!response.ok) {
          throw new Error('Failed to fetch boards');
        }
        const data = await response.json();
        setBoards(data.boards || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch boards');
      } finally {
        setLoading(false);
      }
    };

    fetchBoards();
  }, []);

  const handleBoardToggle = (boardId: string) => {
    const newSelection = tempSelectedIds.includes(boardId)
      ? tempSelectedIds.filter(id => id !== boardId)
      : [...tempSelectedIds, boardId];
    
    setTempSelectedIds(newSelection);
  };

  const handleSelectAll = () => {
    setTempSelectedIds(boards.map(board => board.id));
  };

  const handleClearAll = () => {
    setTempSelectedIds([]);
  };

  const handleSubmit = () => {
    onBoardSelectionChange(tempSelectedIds);
  };

  const handleCancel = () => {
    setTempSelectedIds(selectedBoardIds);
  };

  // Update temp selection when props change
  useEffect(() => {
    setTempSelectedIds(selectedBoardIds);
  }, [selectedBoardIds]);

  const hasChanges = JSON.stringify(tempSelectedIds.sort()) !== JSON.stringify(selectedBoardIds.sort());

  if (loading) {
    return (
      <div className="p-4 bg-white rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Select Boards</h2>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-white rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Select Boards</h2>
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-semibold">Select Boards</h2>
        <div className="space-x-2">
          <button
            onClick={handleSelectAll}
            className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            All
          </button>
          <button
            onClick={handleClearAll}
            className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
          >
            None
          </button>
        </div>
      </div>
      
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {boards.map(board => (
          <label
            key={board.id}
            className="flex items-center p-2 border border-gray-200 rounded hover:bg-gray-50 cursor-pointer"
          >
            <input
              type="checkbox"
              checked={tempSelectedIds.includes(board.id)}
              onChange={() => handleBoardToggle(board.id)}
              className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <div className="flex-1 min-w-0">
              <div className="font-medium text-gray-900 truncate">{board.name}</div>
              <div className="text-xs text-gray-500">{board.items_count} items</div>
            </div>
          </label>
        ))}
      </div>
      
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
