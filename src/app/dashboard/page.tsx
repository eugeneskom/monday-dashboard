'use client';
import React, { useState, useEffect } from 'react';
import { useBoardData } from '@/hooks/useBoardData';
import EmployeeTable from '@/components/EmployeeTable';
import PaymentsTable from '@/components/PaymentsTable';
import MondayEmployeeImport from '@/components/MondayEmployeeImport';
import TaskSummaryWidget from '@/components/TaskSummaryWidget';
import BoardSelector from '@/components/BoardSelector';
import { Board } from '@/types/monday';

const DashboardPage = () => {
  const [activeTab, setActiveTab] = useState<'setup' | 'workload' | 'payments' | 'employees'>('setup');
  const [selectedBoardIds, setSelectedBoardIds] = useState<string[]>([]);
  
  // Load saved board selection from localStorage on mount
  useEffect(() => {
    const savedBoards = localStorage.getItem('selectedBoardIds');
    if (savedBoards) {
      const boardIds = JSON.parse(savedBoards);
      setSelectedBoardIds(boardIds);
      if (boardIds.length > 0) {
        setActiveTab('workload');
      }
    }
  }, []);
  
  const { boards, isLoading, error, isLiveConnected, triggerRefresh } = useBoardData(selectedBoardIds);
  
  console.log('Dashboard state:', { boards: boards.length, isLoading, error });

  const handleBoardSelectionChange = (boardIds: string[]) => {
    setSelectedBoardIds(boardIds);
    // Save to localStorage
    localStorage.setItem('selectedBoardIds', JSON.stringify(boardIds));
  };

  // Show setup tab if no boards are selected
  if (selectedBoardIds.length === 0) {
    return (
      <div className="max-w-6xl mx-auto mt-8 p-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Live Team Dashboard</h1>
          <p className="text-gray-600">
            Real-time employee workload and payment calculations from Monday.com boards.
          </p>
        </div>

        {/* Board Selection */}
        <BoardSelector
          selectedBoardIds={selectedBoardIds}
          onBoardSelectionChange={handleBoardSelectionChange}
        />

        {selectedBoardIds.length === 0 && (
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center">
              <div className="text-yellow-600 mr-2">ℹ️</div>
              <div>
                <h3 className="text-yellow-800 font-medium">Get Started</h3>
                <p className="text-yellow-700 text-sm">
                  Select one or more boards above to start analyzing your team&apos;s workload and calculate additional payments.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto mt-8 p-4">
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">Loading Monday.com data...</span>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="max-w-6xl mx-auto mt-8 p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-semibold">Error Loading Data</h3>
          <p className="text-red-700">{error}</p>
          <p className="text-red-600 text-sm mt-2">
            Make sure your Monday.com API token is valid and you have access to the boards.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto mt-4 p-3 sm:mt-8 sm:p-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Live Team Dashboard</h1>
        <p className="text-sm sm:text-base text-gray-600">
          Real-time employee workload and payment calculations from Monday.com boards.
          <br className="hidden sm:block" />
          <span className="text-xs sm:text-sm text-green-600">✓ Live updates enabled - changes sync automatically</span>
        </p>
      </div>

      {/* Board Selection */}
      <div className="mb-4 sm:mb-6 bg-white rounded-lg shadow-md p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 space-y-2 sm:space-y-0">
          <h3 className="text-base sm:text-lg font-semibold">Connected Boards</h3>
          <button
            onClick={() => setActiveTab('setup')}
            className="px-3 py-1 text-xs sm:text-sm bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors self-start sm:self-auto"
          >
            Change Boards
          </button>
        </div>
        <div className="flex flex-wrap gap-1 sm:gap-2">
          {boards.map((board: Board) => (
            <div key={board.id} className="bg-blue-100 text-blue-800 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm">
              {board.name}
            </div>
          ))}
        </div>
        <p className="text-gray-500 text-xs sm:text-sm mt-2">
          Total items: {boards.reduce((total: number, board: Board) => total + board.items.length, 0)}
        </p>
      </div>

      {/* Setup Tab */}
      {activeTab === 'setup' && (
        <div className="mb-6">
          <BoardSelector
            selectedBoardIds={selectedBoardIds}
            onBoardSelectionChange={handleBoardSelectionChange}
          />
          <div className="mt-4 text-center">
            <button
              onClick={() => setActiveTab('workload')}
              disabled={selectedBoardIds.length === 0}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Continue to Dashboard
            </button>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      {activeTab !== 'setup' && (
        <div className="mb-4 sm:mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-4 sm:space-x-8 overflow-x-auto">
              <button
                onClick={() => setActiveTab('workload')}
                className={`py-2 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                  activeTab === 'workload'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Employee Workload
              </button>
              <button
                onClick={() => setActiveTab('payments')}
                className={`py-2 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                  activeTab === 'payments'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Additional Payments
              </button>
              <button
                onClick={() => setActiveTab('employees')}
                className={`py-2 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                  activeTab === 'employees'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Monday.com Employees
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* Content */}
      {activeTab !== 'setup' && (
        <div className="space-y-6">
          {activeTab === 'workload' && (
            <>
              <TaskSummaryWidget boards={boards} />
              <EmployeeTable boards={boards} />
            </>
          )}
          {activeTab === 'payments' && <PaymentsTable boards={boards} />}
          {activeTab === 'employees' && <MondayEmployeeImport boards={boards} />}
        </div>
      )}

      {/* Auto-refresh indicator with live status */}
      {activeTab !== 'setup' && (
        <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row sm:justify-between sm:items-center text-xs sm:text-sm text-gray-500 space-y-2 sm:space-y-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isLiveConnected ? 'bg-green-400 animate-pulse' : 'bg-yellow-400'}`}></div>
              <span className="text-xs sm:text-sm">
                {isLiveConnected 
                  ? 'Live updates active' 
                  : 'Auto-refresh every 30s'
                }
              </span>
            </div>
            <button
              onClick={triggerRefresh}
              className="px-2 sm:px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors self-start sm:self-auto"
            >
              Refresh Now
            </button>
          </div>
          <div className="text-xs">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
