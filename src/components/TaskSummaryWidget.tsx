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
const STATUS_LABELS: Record<string, string> = {
  'Done': 'Done',
  'Working on it': 'Progress',
  'Stuck': 'Stuck',
  'Not Started': 'New',
  '': 'None',
  'default': 'Other'
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

    const statusCounts: StatusCount = {};
    let totalTasks = 0;
    let completedTasks = 0;
    let inProgressTasks = 0;

    data.forEach(board => {
      if (board?.items) {
        board.items.forEach((item) => {
          if (item?.subitems) {
            item.subitems.forEach((subitem) => {
              totalTasks++;
              const status = subitem?.column_values
                ?.find((col) => col.id === 'status')?.text || '';
              
              statusCounts[status] = (statusCounts[status] || 0) + 1;
              
              if (status === 'Done') {
                completedTasks++;
              } else if (status === 'Working on it') {
                inProgressTasks++;
              }
            });
          }
        });
      }
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

    return (
      <div className="grid grid-cols-5 sm:grid-cols-10 gap-1 text-xs">
        {Object.entries(statusCounts).map(([status, count]) => {
          const percentage = ((count / totalTasks) * 100).toFixed(1);
          const label = STATUS_LABELS[status] || STATUS_LABELS.default;
          
          return (
            <div key={status} className="text-center p-1 bg-gray-50 rounded">
              <div className="font-semibold text-gray-800">{count}</div>
              <div className="text-gray-600 truncate" title={`${status}: ${percentage}%`}>
                {label}
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
      <h3 className="text-lg font-semibold mb-3">Project Overview</h3>
      
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
