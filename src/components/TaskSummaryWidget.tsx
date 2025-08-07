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
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
      <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">📊 Project Overview</h3>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="bg-blue-50 p-3 sm:p-4 rounded-lg text-center">
          <div className="text-xl sm:text-2xl font-bold text-blue-600">{summary.total}</div>
          <div className="text-blue-700 text-xs sm:text-sm">Total Tasks</div>
        </div>
        <div className="bg-orange-50 p-3 sm:p-4 rounded-lg text-center">
          <div className="text-xl sm:text-2xl font-bold text-orange-600">{activeWorkload}</div>
          <div className="text-orange-700 text-xs sm:text-sm">Active Workload</div>
          <div className="text-orange-600 text-xs hidden sm:block">(In Progress + Need Review)</div>
        </div>
        <div className="bg-green-50 p-3 sm:p-4 rounded-lg text-center">
          <div className="text-xl sm:text-2xl font-bold text-green-600">{completedTasks}</div>
          <div className="text-green-700 text-xs sm:text-sm">Completed</div>
          <div className="text-green-600 text-xs hidden sm:block">(Done + Stopped)</div>
        </div>
        <div className="bg-purple-50 p-3 sm:p-4 rounded-lg text-center">
          <div className="text-xl sm:text-2xl font-bold text-purple-600">
            {summary.total > 0 ? Math.round((completedTasks / summary.total) * 100) : 0}%
          </div>
          <div className="text-purple-700 text-xs sm:text-sm">Completion Rate</div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 text-xs sm:text-sm">
        <div className="bg-yellow-50 p-2 sm:p-3 rounded border-l-4 border-yellow-400">
          <div className="font-semibold text-yellow-700">In Progress</div>
          <div className="text-yellow-600">{summary.inProgress}</div>
        </div>
        <div className="bg-orange-50 p-2 sm:p-3 rounded border-l-4 border-orange-400">
          <div className="font-semibold text-orange-700">Need Review</div>
          <div className="text-orange-600">{summary.needReview}</div>
        </div>
        <div className="bg-blue-50 p-2 sm:p-3 rounded border-l-4 border-blue-400">
          <div className="font-semibold text-blue-700">Lead Feedback</div>
          <div className="text-blue-600">{summary.leadFeedback}</div>
        </div>
        <div className="bg-indigo-50 p-2 sm:p-3 rounded border-l-4 border-indigo-400">
          <div className="font-semibold text-indigo-700">To Pack</div>
          <div className="text-indigo-600">{summary.toPack}</div>
        </div>
        <div className="bg-cyan-50 p-2 sm:p-3 rounded border-l-4 border-cyan-400">
          <div className="font-semibold text-cyan-700">Sent</div>
          <div className="text-cyan-600">{summary.sent}</div>
        </div>
        <div className="bg-teal-50 p-2 sm:p-3 rounded border-l-4 border-teal-400">
          <div className="font-semibold text-teal-700">Client Feedback</div>
          <div className="text-teal-600">{summary.clientFeedback}</div>
        </div>
        <div className="bg-emerald-50 p-2 sm:p-3 rounded border-l-4 border-emerald-400">
          <div className="font-semibold text-emerald-700">Ready for Client</div>
          <div className="text-emerald-600">{summary.readyForClient}</div>
        </div>
        <div className="bg-gray-50 p-2 sm:p-3 rounded border-l-4 border-gray-400">
          <div className="font-semibold text-gray-700">Paused</div>
          <div className="text-gray-600">{summary.paused}</div>
        </div>
        <div className="bg-green-50 p-2 sm:p-3 rounded border-l-4 border-green-400">
          <div className="font-semibold text-green-700">Done</div>
          <div className="text-green-600">{summary.done}</div>
        </div>
        <div className="bg-red-50 p-2 sm:p-3 rounded border-l-4 border-red-400">
          <div className="font-semibold text-red-700">Stopped</div>
          <div className="text-red-600">{summary.stopped}</div>
        </div>
      </div>
    </div>
  );
};

export default TaskSummaryWidget;
