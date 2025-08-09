'use client';

import React, { useMemo } from 'react';
import { Board } from '@/types/monday';

// Types
interface StatusCount {
  [key: string]: number;
}

interface SummaryStats {
  totalTasks: number;
  totalBoards: number;
  completedTasks: number;
  inProgressTasks: number;
  completionRate: number;
  statusCounts: StatusCount;
}

interface TaskSummaryWidgetProps {
  data?: Board[];
  loading?: boolean;
  error?: string | null;
}

// Constants
const STATUS_COLORS: Record<string, string> = {
  // Exact matches from your console log (ALL CAPS)
  'DONE': 'border-l-4 border-green-600 bg-green-100',
  'IN PROGRESS': 'border-l-4 border-yellow-500 bg-yellow-50',
  'WAITING FOR MATERIALS': 'border-l-4 border-blue-500 bg-blue-50',
  'READY FOR CLIENT': 'border-l-4 border-green-500 bg-green-50',
  'TO DO': 'border-l-4 border-gray-400 bg-gray-50',
  
  // Lowercase versions (from individual item processing)
  'done': 'border-l-4 border-green-600 bg-green-100',
  'in progress': 'border-l-4 border-yellow-500 bg-yellow-50',
  'waiting for materials': 'border-l-4 border-blue-500 bg-blue-50',
  'ready for client': 'border-l-4 border-green-500 bg-green-50',
  'to do': 'border-l-4 border-gray-400 bg-gray-50',
  'not set': 'border-l-4 border-gray-300 bg-gray-100',
  
  // Additional status variations from your original screenshot
  'Need Review': 'border-l-4 border-orange-500 bg-orange-50',
  'Lead Feedback': 'border-l-4 border-blue-500 bg-blue-50',
  'To Pack': 'border-l-4 border-purple-500 bg-purple-50',
  'Sent': 'border-l-4 border-cyan-500 bg-cyan-50',
  'Client Feedback': 'border-l-4 border-teal-500 bg-teal-50',
  'Paused': 'border-l-4 border-gray-500 bg-gray-50',
  'Stopped': 'border-l-4 border-red-500 bg-red-50',
  'Working on it': 'border-l-4 border-yellow-500 bg-yellow-50',
  'Stuck': 'border-l-4 border-red-400 bg-red-50',
  'Not Started': 'border-l-4 border-gray-400 bg-gray-50',
  
  // Empty or fallback
  '': 'border-l-4 border-gray-300 bg-gray-50',
  'Other': 'border-l-4 border-gray-300 bg-gray-50'
};

const SUMMARY_CARD_CONFIGS = [
  { key: 'totalTasks', label: 'Total Tasks', color: 'text-blue-600' },
  { key: 'totalBoards', label: 'Boards', color: 'text-green-600' },
  { key: 'completedTasks', label: 'Completed', color: 'text-purple-600' },
  { key: 'inProgressTasks', label: 'In Progress', color: 'text-orange-600' }
] as const;

// Component
export default function TaskSummaryWidget({ 
  data = [], 
  loading = false, 
  error = null 
}: TaskSummaryWidgetProps) {
  // Memoized calculations
 const summaryStats = useMemo((): SummaryStats => {
  if (!data || data.length === 0) {
    return {
      totalTasks: 0,
      totalBoards: 0,
      completedTasks: 0,
      inProgressTasks: 0,
      completionRate: 0,
      statusCounts: {}
    };
  }

  const seenIds = new Set<string>(); // To prevent counting the same task twice
  let totalTasks = 0;
  let completedTasks = 0;
  let inProgressTasks = 0;
  const statusCounts: StatusCount = {};

  data.forEach((board: Board) => {
    board.items?.forEach(item => {
      // Helper to process a single task/subtask
      type TaskLike = {
        name?: string;
        column_values?: { id: string; text?: string | null }[];
        subitems?: TaskLike[];
      };

      const processTask = (task: TaskLike) => {
        const statusCol = task.column_values?.find(
          (col) =>
            col.id === 'status' ||
            col.id === 'status_1__1' ||
            col.id.includes('status')
        );
        if (!statusCol?.text) return;

        const statusText = statusCol.text;
        totalTasks++;
        statusCounts[statusText] = (statusCounts[statusText] || 0) + 1;

        const statusLower = statusText.toLowerCase();
        if (statusLower.includes('done') || statusLower.includes('complete')) {
          completedTasks++;
        } else if (statusLower.includes('working') || statusLower.includes('progress')) {
          inProgressTasks++;
        }
      };

      if (item.subitems && item.subitems.length > 0) {
        // count only subitems; do not count the parent
        item.subitems.forEach((sub) => processTask(sub));
      } else {
        processTask(item as TaskLike);
      }
    });
  });

  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return {
    totalTasks,
    totalBoards: data.length,
    completedTasks,
    inProgressTasks,
    completionRate,
    statusCounts
  };
}, [data]);


  // Render helpers
  const renderLoadingState = () => (
    <div className="p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-3">Project Overview</h3>
      <div className="animate-pulse space-y-3">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-16 bg-gray-200 rounded" />
          ))}
        </div>
        <div className="h-24 bg-gray-200 rounded" />
      </div>
    </div>
  );

  const renderErrorState = () => (
    <div className="p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-3">Project Overview</h3>
      <div className="text-red-500 bg-red-50 p-3 rounded border border-red-200">
        <p className="font-medium">Error loading data</p>
        <p className="text-sm mt-1">{error}</p>
      </div>
    </div>
  );

  const renderSummaryCard = (config: typeof SUMMARY_CARD_CONFIGS[number]) => {
    const value = summaryStats[config.key as keyof SummaryStats];
    const displayValue = value.toString();

    return (
      <div key={config.key} className="text-center p-2 bg-gray-50 rounded">
        <div className={`text-lg font-bold ${config.color}`}>
          {displayValue}
        </div>
        <div className="text-xs text-gray-600 mt-1">
          {config.label}
        </div>
      </div>
    );
  };

  const renderStatusBreakdown = () => {
    const { statusCounts, totalTasks } = summaryStats;
    
    if (totalTasks === 0) {
      return (
        <div className="text-center text-gray-500 py-4">
          No tasks found
        </div>
      );
    }

    // Helper function to get color classes with fallback
    const getStatusColor = (status: string): string => {
      // Direct match first
      if (STATUS_COLORS[status]) {
        return STATUS_COLORS[status];
      }
      
      // Trim whitespace and try again
      const trimmedStatus = status.trim();
      if (STATUS_COLORS[trimmedStatus]) {
        return STATUS_COLORS[trimmedStatus];
      }
      
      // Case-insensitive match
      const exactMatch = Object.keys(STATUS_COLORS).find(
        key => key.toLowerCase() === status.toLowerCase()
      );
      if (exactMatch) {
        return STATUS_COLORS[exactMatch];
      }
      
      // Default fallback
      return STATUS_COLORS['Other'];
    };

    return (
      <div className="flex flex-wrap gap-1 text-xs">
        {Object.entries(statusCounts).map(([status, count]) => {
          const percentage = ((count / totalTasks) * 100).toFixed(1);
          const colorClasses = getStatusColor(status);
          
          return (
            <div key={status} className={`text-center p-2 rounded whitespace-nowrap ${colorClasses}`}>
              <div className="font-semibold text-gray-800">{count}</div>
              <div className="text-gray-700 font-medium" title={`${status}: ${percentage}%`}>
                {status}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Early returns for loading/error states
  if (loading) return renderLoadingState();
  if (error) return renderErrorState();

  // Main render
  return (
    <div className="p-4 bg-white rounded-lg shadow">
      {/* Header */}
      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
        Project Overview
        {data && data.length > 0 && (
          <span className="animate-pulse text-green-500 text-xs">
            🔄 Live Data
          </span>
        )}
      </h3>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
        {SUMMARY_CARD_CONFIGS.map(renderSummaryCard)}
      </div>
      
      {/* Status Breakdown */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Status Breakdown</h4>
        {renderStatusBreakdown()}
      </div>
    </div>
  );
}
