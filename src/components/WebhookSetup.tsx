'use client';
import React, { useState } from 'react';

interface Props {
  selectedBoardIds: string[];
}

interface WebhookSetupResult {
  boardId: string;
  success: boolean;
  message?: string;
  error?: string;
  webhooks?: Array<{
    id: string;
    board_id: string;
    url: string;
    event: string;
  }>;
}

export default function WebhookSetup({ selectedBoardIds }: Props) {
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [setupResults, setSetupResults] = useState<WebhookSetupResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const setupWebhooks = async () => {
    if (selectedBoardIds.length === 0) {
      setError('Please select at least one board first');
      return;
    }

    setIsSettingUp(true);
    setError(null);
    setSetupResults([]);

    const webhookUrl = `${window.location.origin}/api/webhooks/monday`;

    try {
      const results = [];
      
      for (const boardId of selectedBoardIds) {
        const response = await fetch('/api/webhooks/setup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            boardId,
            webhookUrl
          }),
        });

        const result = await response.json();
        results.push({ boardId, ...result });
      }

      setSetupResults(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to setup webhooks');
    } finally {
      setIsSettingUp(false);
    }
  };

  const getExistingWebhooks = async () => {
    try {
      const response = await fetch('/api/webhooks/setup');
      const data = await response.json();
      console.log('Existing webhooks:', data);
    } catch (err) {
      console.error('Failed to fetch webhooks:', err);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4">Live Updates Setup</h3>
      
      <div className="mb-4 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-medium text-blue-800 mb-2">Monday.com Webhooks</h4>
        <p className="text-blue-700 text-sm mb-3">
          Set up real-time webhooks to get instant updates when your Monday.com boards change,
          instead of waiting for the 30-second refresh.
        </p>
        <div className="text-blue-600 text-xs">
          <strong>Webhook URL:</strong> {typeof window !== 'undefined' ? window.location.origin : ''}/api/webhooks/monday
        </div>
      </div>

      {selectedBoardIds.length === 0 ? (
        <div className="text-yellow-600 bg-yellow-50 p-3 rounded-lg text-sm">
          Please select boards first to set up webhooks.
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-sm text-gray-600">
            Selected boards: {selectedBoardIds.length}
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={setupWebhooks}
              disabled={isSettingUp}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {isSettingUp ? 'Setting up...' : 'Setup Live Updates'}
            </button>
            
            <button
              onClick={getExistingWebhooks}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
            >
              Check Existing
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-red-800 text-sm">{error}</div>
        </div>
      )}

      {setupResults.length > 0 && (
        <div className="mt-6">
          <h4 className="font-medium mb-3">Setup Results:</h4>
          <div className="space-y-2">
            {setupResults.map((result, index) => (
              <div key={index} className={`p-3 rounded-lg text-sm ${
                result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
              }`}>
                <div className={`font-medium ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                  Board {result.boardId}: {result.success ? 'Success' : 'Failed'}
                </div>
                <div className={result.success ? 'text-green-700' : 'text-red-700'}>
                  {result.message || result.error}
                </div>
                {result.webhooks && (
                  <div className="text-green-600 text-xs mt-1">
                    Created {result.webhooks.length} webhooks
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-800 mb-2">What this does:</h4>
        <ul className="text-gray-600 text-sm space-y-1">
          <li>• Creates webhooks for item updates, creations, and deletions</li>
          <li>• Enables real-time data refresh when Monday.com data changes</li>
          <li>• Reduces API calls and improves performance</li>
          <li>• Provides instant feedback for team collaboration</li>
        </ul>
      </div>
    </div>
  );
}
