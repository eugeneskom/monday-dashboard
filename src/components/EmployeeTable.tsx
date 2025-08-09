import React from 'react';
import { Board } from '@/types/monday';

interface EmployeeStats {
  name: string;
  totalItems: number;
  inProgress: number;
  needReview: number;
  leadFeedback: number;
  toPack: number;
  sent: number;
  clientFeedback: number;
  readyForClient: number;
  paused: number;
  completed: number;
  workload: number;
  timeSpent: number;
}

interface EmployeeTableProps {
  boards: Board[];
}

const EmployeeTable: React.FC<EmployeeTableProps> = ({ boards }) => {
  const extractEmployeeStats = (): EmployeeStats[] => {
    const employees: Record<string, EmployeeStats> = {};
    
    console.log('Processing boards:', boards.length);

    boards.forEach(board => {
      console.log(`Processing board: ${board.name} with ${board.items.length} items`);
      board.items.forEach(item => {
        console.log(`Processing item: ${item.name}`);
        
        // Extract person from column values
        const personColumn = item.column_values.find(cv => 
          cv.id === 'person' || cv.id === 'people__1' || cv.id === 'people' || cv.id.includes('people')
        );
        
        // If no person is assigned, use the item name or "Unassigned"
        let personName = 'Unassigned';
        if (personColumn && personColumn.text && personColumn.text.trim() !== '') {
          personName = personColumn.text.trim();
        }
        
        console.log(`Person: ${personName}`);
        
        if (!employees[personName]) {
          employees[personName] = {
            name: personName,
            totalItems: 0,
            inProgress: 0,
            needReview: 0,
            leadFeedback: 0,
            toPack: 0,
            sent: 0,
            clientFeedback: 0,
            readyForClient: 0,
            paused: 0,
            completed: 0,
            workload: 0,
            timeSpent: 0
          };
        }

        employees[personName].totalItems++;

        // Extract status
        const statusColumn = item.column_values.find(cv => 
          cv.id === 'status' || cv.id === 'status_1__1' || cv.id.includes('status')
        );
        const status = statusColumn?.text?.toLowerCase() || 'not set';
        
        // console.log(`Status: ${status}`);

        // Map status to specific counters
        switch (status) {
          case 'in progress':
          case 'working on it':
            employees[personName].inProgress++;
            employees[personName].workload++;
            break;
          case 'need review':
          case 'needs review':
            employees[personName].needReview++;
            employees[personName].workload++;
            break;
          case 'lead feedback':
            employees[personName].leadFeedback++;
            employees[personName].workload++;
            break;
          case 'to pack':
            employees[personName].toPack++;
            employees[personName].workload++;
            break;
          case 'sent':
            employees[personName].sent++;
            break;
          case 'client feedback':
            employees[personName].clientFeedback++;
            employees[personName].workload++;
            break;
          case 'ready for client':
            employees[personName].readyForClient++;
            break;
          case 'paused':
            employees[personName].paused++;
            break;
          case 'done':
          case 'completed':
            employees[personName].completed++;
            break;
          case 'waiting for materials':
            employees[personName].paused++;
            break;
          case 'none':
            // Do nothing for none status
            break;
          default:
            // For any other status, count as workload
            employees[personName].workload++;
            break;
        }

        // Extract time tracking
        const timeColumn = item.column_values.find(cv => 
          cv.id === 'time_tracking__1' || cv.id === 'subitems_time_tracking__1' || cv.id === 'numbers' || cv.id.includes('time')
        );
        if (timeColumn && timeColumn.text) {
          // Parse time in format "HH:MM:SS" to hours
          if (timeColumn.text.includes(':')) {
            const timeParts = timeColumn.text.split(':');
            const hours = parseInt(timeParts[0]) || 0;
            const minutes = parseInt(timeParts[1]) || 0;
            const seconds = parseInt(timeParts[2]) || 0;
            const totalHours = hours + (minutes / 60) + (seconds / 3600);
            employees[personName].timeSpent += totalHours;
          } else {
            // Fallback to parsing as number
            const timeValue = parseFloat(timeColumn.text);
            if (!isNaN(timeValue)) {
              employees[personName].timeSpent += timeValue;
            }
          }
        }
      });
    });

    const result = Object.values(employees).sort((a, b) => b.workload - a.workload);
    console.log('Final employee stats:', result);
    return result;
  };

  const stats = extractEmployeeStats();

  const getWorkloadColor = (workload: number): string => {
    if (workload >= 15) return 'bg-red-100 text-red-800';
    if (workload >= 10) return 'bg-yellow-100 text-yellow-800';
    if (workload >= 5) return 'bg-blue-100 text-blue-800';
    return 'bg-green-100 text-green-800';
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 border-b">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Employee Workload Analysis</h2>
        <p className="text-gray-600 text-xs sm:text-sm mt-1">
          Real-time breakdown of tasks by status and employee
        </p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-xs sm:text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="border border-gray-300 px-2 sm:px-4 py-2 sm:py-3 text-left font-semibold text-gray-900">Employee</th>
              <th className="border border-gray-300 px-2 sm:px-4 py-2 sm:py-3 text-center font-semibold text-gray-900">Total</th>
              <th className="border border-gray-300 px-2 sm:px-4 py-2 sm:py-3 text-center font-semibold text-gray-900">Progress</th>
              <th className="border border-gray-300 px-2 sm:px-4 py-2 sm:py-3 text-center font-semibold text-gray-900">Review</th>
              <th className="border border-gray-300 px-2 sm:px-4 py-2 sm:py-3 text-center font-semibold text-gray-900 hidden sm:table-cell">Lead FB</th>
              <th className="border border-gray-300 px-2 sm:px-4 py-2 sm:py-3 text-center font-semibold text-gray-900 hidden sm:table-cell">Pack</th>
              <th className="border border-gray-300 px-2 sm:px-4 py-2 sm:py-3 text-center font-semibold text-gray-900 hidden lg:table-cell">Sent</th>
              <th className="border border-gray-300 px-2 sm:px-4 py-2 sm:py-3 text-center font-semibold text-gray-900 hidden lg:table-cell">Client FB</th>
              <th className="border border-gray-300 px-2 sm:px-4 py-2 sm:py-3 text-center font-semibold text-gray-900 hidden lg:table-cell">Ready</th>
              <th className="border border-gray-300 px-2 sm:px-4 py-2 sm:py-3 text-center font-semibold text-gray-900 hidden sm:table-cell">Paused</th>
              <th className="border border-gray-300 px-2 sm:px-4 py-2 sm:py-3 text-center font-semibold text-gray-900">Workload</th>
              <th className="border border-gray-300 px-2 sm:px-4 py-2 sm:py-3 text-center font-semibold text-gray-900">Done</th>
              <th className="border border-gray-300 px-2 sm:px-4 py-2 sm:py-3 text-center font-semibold text-gray-900">Hours</th>
            </tr>
          </thead>
          <tbody>
            {stats.map((stat, index) => (
              <tr key={stat.name} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="border border-gray-300 px-2 sm:px-4 py-2 sm:py-3 font-medium text-gray-900">{stat.name}</td>
                <td className="border border-gray-300 px-2 sm:px-4 py-2 sm:py-3 text-center">{stat.totalItems}</td>
                <td className="border border-gray-300 px-2 sm:px-4 py-2 sm:py-3 text-center">{stat.inProgress}</td>
                <td className="border border-gray-300 px-2 sm:px-4 py-2 sm:py-3 text-center">{stat.needReview}</td>
                <td className="border border-gray-300 px-2 sm:px-4 py-2 sm:py-3 text-center hidden sm:table-cell">{stat.leadFeedback}</td>
                <td className="border border-gray-300 px-2 sm:px-4 py-2 sm:py-3 text-center hidden sm:table-cell">{stat.toPack}</td>
                <td className="border border-gray-300 px-2 sm:px-4 py-2 sm:py-3 text-center hidden lg:table-cell">{stat.sent}</td>
                <td className="border border-gray-300 px-2 sm:px-4 py-2 sm:py-3 text-center hidden lg:table-cell">{stat.clientFeedback}</td>
                <td className="border border-gray-300 px-2 sm:px-4 py-2 sm:py-3 text-center hidden lg:table-cell">{stat.readyForClient}</td>
                <td className="border border-gray-300 px-2 sm:px-4 py-2 sm:py-3 text-center hidden sm:table-cell">{stat.paused}</td>
                <td className="border border-gray-300 px-2 sm:px-4 py-2 sm:py-3 text-center">
                  <span className={`px-1 sm:px-2 py-1 rounded-full text-xs sm:text-sm font-medium ${getWorkloadColor(stat.workload)}`}>
                    {stat.workload}
                  </span>
                </td>
                <td className="border border-gray-300 px-2 sm:px-4 py-2 sm:py-3 text-center">
                  {stat.completed}
                </td>
                <td className="border border-gray-300 px-2 sm:px-4 py-2 sm:py-3 text-center">{stat.timeSpent.toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {stats.length === 0 && (
        <div className="p-6 sm:p-8 text-center text-gray-500">
          <p className="text-sm sm:text-base">No employee data found in the connected boards.</p>
          <p className="text-xs sm:text-sm mt-1">Make sure your boards have person and status columns.</p>
        </div>
      )}
    </div>
  );
};

export default EmployeeTable;
