import React from 'react';
import { Board } from '@/types/monday';

interface Props {
  boards: Board[];
}

interface TaskSummary {
  inProgress: number;
  needReview: number;
  leadFeedback: number;
  toPack: number;
  sent: number;
  clientFeedback: number;
  readyForClient: number;
  paused: number;
  done: number;
  stopped: number;
  total: number;
}

const TaskSummaryWidget = ({ boards }: Props) => {
  const calculateTaskSummary = (): TaskSummary => {
    const summary: TaskSummary = {
      inProgress: 0,
      needReview: 0,
      leadFeedback: 0,
      toPack: 0,
      sent: 0,
      clientFeedback: 0,
      readyForClient: 0,
      paused: 0,
      done: 0,
      stopped: 0,
      total: 0
    };

    boards.forEach(board => {
      board.items.forEach(item => {
        summary.total++;
        
        const statusColumn = item.column_values.find(cv => 
          cv.id === 'status' || cv.id === 'status_1__1' || cv.id.includes('status')
        );
        const status = statusColumn?.text?.toLowerCase() || '';

        switch (status) {
          case 'in progress':
          case 'working on it':
            summary.inProgress++;
            break;
          case 'need review':
          case 'needs review':
            summary.needReview++;
            break;
          case 'lead feedback':
            summary.leadFeedback++;
            break;
          case 'to pack':
            summary.toPack++;
            break;
          case 'sent':
            summary.sent++;
            break;
          case 'client feedback':
            summary.clientFeedback++;
            break;
          case 'ready for client':
            summary.readyForClient++;
            break;
          case 'paused':
          case 'waiting for materials':
            summary.paused++;
            break;
          case 'done':
          case 'completed':
            summary.done++;
            break;
          case 'stopped':
            summary.stopped++;
            break;
        }
      });
    });

    return summary;
  };

  const summary = calculateTaskSummary();
  const activeWorkload = summary.inProgress + summary.needReview;
  const completedTasks = summary.done + summary.stopped;

  return (
    <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 mb-4">
      <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-2 sm:mb-3 flex items-center">
        📊 Project Overview
      </h3>
      
      {/* Compact Summary Cards */}
      <div className="grid grid-cols-4 gap-2 sm:gap-3 mb-3 sm:mb-4">
        <div className="bg-blue-50 p-2 sm:p-3 rounded text-center">
          <div className="text-lg sm:text-xl font-bold text-blue-600">{summary.total}</div>
          <div className="text-blue-700 text-xs">Total</div>
        </div>
        <div className="bg-orange-50 p-2 sm:p-3 rounded text-center">
          <div className="text-lg sm:text-xl font-bold text-orange-600">{activeWorkload}</div>
          <div className="text-orange-700 text-xs">Active</div>
        </div>
        <div className="bg-green-50 p-2 sm:p-3 rounded text-center">
          <div className="text-lg sm:text-xl font-bold text-green-600">{completedTasks}</div>
          <div className="text-green-700 text-xs">Complete</div>
        </div>
        <div className="bg-purple-50 p-2 sm:p-3 rounded text-center">
          <div className="text-lg sm:text-xl font-bold text-purple-600">
            {summary.total > 0 ? Math.round((completedTasks / summary.total) * 100) : 0}%
          </div>
          <div className="text-purple-700 text-xs">Rate</div>
        </div>
      </div>

      {/* Compact Status Breakdown */}
      <div className="grid grid-cols-5 sm:grid-cols-10 gap-1 sm:gap-2 text-xs">
        <div className="bg-yellow-50 p-1 sm:p-2 rounded text-center border-l-2 border-yellow-400">
          <div className="font-semibold text-yellow-700 truncate">Progress</div>
          <div className="text-yellow-600 font-bold">{summary.inProgress}</div>
        </div>
        <div className="bg-orange-50 p-1 sm:p-2 rounded text-center border-l-2 border-orange-400">
          <div className="font-semibold text-orange-700 truncate">Review</div>
          <div className="text-orange-600 font-bold">{summary.needReview}</div>
        </div>
        <div className="bg-blue-50 p-1 sm:p-2 rounded text-center border-l-2 border-blue-400">
          <div className="font-semibold text-blue-700 truncate">Lead FB</div>
          <div className="text-blue-600 font-bold">{summary.leadFeedback}</div>
        </div>
        <div className="bg-indigo-50 p-1 sm:p-2 rounded text-center border-l-2 border-indigo-400">
          <div className="font-semibold text-indigo-700 truncate">Pack</div>
          <div className="text-indigo-600 font-bold">{summary.toPack}</div>
        </div>
        <div className="bg-cyan-50 p-1 sm:p-2 rounded text-center border-l-2 border-cyan-400">
          <div className="font-semibold text-cyan-700 truncate">Sent</div>
          <div className="text-cyan-600 font-bold">{summary.sent}</div>
        </div>
        <div className="bg-teal-50 p-1 sm:p-2 rounded text-center border-l-2 border-teal-400">
          <div className="font-semibold text-teal-700 truncate">Client FB</div>
          <div className="text-teal-600 font-bold">{summary.clientFeedback}</div>
        </div>
        <div className="bg-emerald-50 p-1 sm:p-2 rounded text-center border-l-2 border-emerald-400">
          <div className="font-semibold text-emerald-700 truncate">Ready</div>
          <div className="text-emerald-600 font-bold">{summary.readyForClient}</div>
        </div>
        <div className="bg-gray-50 p-1 sm:p-2 rounded text-center border-l-2 border-gray-400">
          <div className="font-semibold text-gray-700 truncate">Paused</div>
          <div className="text-gray-600 font-bold">{summary.paused}</div>
        </div>
        <div className="bg-green-50 p-1 sm:p-2 rounded text-center border-l-2 border-green-400">
          <div className="font-semibold text-green-700 truncate">Done</div>
          <div className="text-green-600 font-bold">{summary.done}</div>
        </div>
        <div className="bg-red-50 p-1 sm:p-2 rounded text-center border-l-2 border-red-400">
          <div className="font-semibold text-red-700 truncate">Stopped</div>
          <div className="text-red-600 font-bold">{summary.stopped}</div>
        </div>
      </div>
    </div>
  );
};

export default TaskSummaryWidget;
