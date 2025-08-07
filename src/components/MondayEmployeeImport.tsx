import React, { useState, useEffect } from 'react';
import { Board } from '@/types/monday';

interface Props {
  boards: Board[];
}

interface EmployeeData {
  name: string;
  salary: number;
  department?: string;
  hoursWorked: number;
  projectsCount: number;
}

const extractEmployeesFromMonday = (boards: Board[]): EmployeeData[] => {
  const employeeMap = new Map<string, EmployeeData>();
  
  boards.forEach(board => {
    board.items.forEach(item => {
      if (item.subitems) {
        item.subitems.forEach(subitem => {
          const name = subitem.column_values.find(col => col.id === 'person')?.text;
          const timeStr = subitem.column_values.find(col => col.id === 'time_tracking__1')?.text || '00:00:00';
          
          if (name && name.trim() && name !== 'Unknown') {
            const cleanName = name.trim();
            
            // Parse time to hours
            const parseTimeToHours = (timeStr: string): number => {
              if (!timeStr) return 0;
              const parts = timeStr.split(':');
              if (parts.length === 3) {
                const hours = parseInt(parts[0]) || 0;
                const minutes = parseInt(parts[1]) || 0;
                const seconds = parseInt(parts[2]) || 0;
                return hours + minutes / 60 + seconds / 3600;
              }
              return 0;
            };
            
            const hours = parseTimeToHours(timeStr);
            
            if (!employeeMap.has(cleanName)) {
              employeeMap.set(cleanName, {
                name: cleanName,
                salary: 0, // Will be set manually for salary management
                department: board.name, // Use board name as department
                hoursWorked: 0,
                projectsCount: 0
              });
            }
            
            const employee = employeeMap.get(cleanName)!;
            employee.hoursWorked += hours;
            employee.projectsCount += 1;
            
            // If this board has a different department, mark as "Multiple"
            if (employee.department !== board.name) {
              employee.department = 'Multiple Departments';
            }
          }
        });
      }
    });
  });
  
  return Array.from(employeeMap.values()).sort((a, b) => a.name.localeCompare(b.name));
};

const MondayEmployeeImport = ({ boards }: Props) => {
  const [employees, setEmployees] = useState<EmployeeData[]>([]);
  const [salarySettings, setSalarySettings] = useState<Record<string, number>>({});
  const [editMode, setEditMode] = useState(false);

  // Extract employees from Monday.com boards
  useEffect(() => {
    const extractedEmployees = extractEmployeesFromMonday(boards);
    setEmployees(extractedEmployees);
    
    // Load saved salary settings from localStorage
    const savedSalaries = localStorage.getItem('employeeSalaries');
    const savedSalaryData = savedSalaries ? JSON.parse(savedSalaries) : {};
    
    // Merge with default salaries for the Ukrainian names
    const defaultSalaries = {
      'Мохова': 500,
      'Скорик': 1000, 
      'Дьоміна': 1500,
      'Kateryna Mokhova': 500,
      'Ira Skoryk': 1000,
      'Anastasia Domina': 1500
    };
    
    const mergedSalaries = { ...defaultSalaries, ...savedSalaryData };
    setSalarySettings(mergedSalaries);
  }, [boards]);

  const updateSalary = (employeeName: string, salary: number) => {
    const newSalarySettings = {
      ...salarySettings,
      [employeeName]: salary
    };
    setSalarySettings(newSalarySettings);
    localStorage.setItem('employeeSalaries', JSON.stringify(newSalarySettings));
  };

  const exportEmployeeData = () => {
    const employeeDataWithSalaries = employees.map(emp => ({
      ...emp,
      salary: salarySettings[emp.name] || 0
    }));
    
    const dataStr = JSON.stringify(employeeDataWithSalaries, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'monday-employees.json';
    link.click();
    
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 sm:p-6 bg-white rounded-lg shadow-md">
      <div className="mb-4 sm:mb-6">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-4 space-y-3 lg:space-y-0">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Monday.com Employee Data</h2>
            <p className="text-sm sm:text-base text-gray-600">
              Employees automatically imported from your Monday.com boards. Set salaries for payment calculations.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <button
              onClick={() => setEditMode(!editMode)}
              className="px-3 sm:px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-xs sm:text-sm"
            >
              {editMode ? 'Save Changes' : 'Edit Salaries'}
            </button>
            <button
              onClick={exportEmployeeData}
              className="px-3 sm:px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors text-xs sm:text-sm"
            >
              Export Data
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6 p-3 sm:p-4 bg-blue-50 rounded-lg">
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold text-blue-600">{employees.length}</div>
            <div className="text-blue-700 text-xs sm:text-sm">Active Employees</div>
          </div>
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold text-blue-600">
              {employees.reduce((total, emp) => total + emp.hoursWorked, 0).toFixed(1)}h
            </div>
            <div className="text-blue-700 text-xs sm:text-sm">Total Hours Tracked</div>
          </div>
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold text-blue-600">
              {employees.reduce((total, emp) => total + emp.projectsCount, 0)}
            </div>
            <div className="text-blue-700 text-xs sm:text-sm">Total Project Tasks</div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full table-auto border-collapse text-xs sm:text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-2 sm:px-4 py-2 sm:py-3 text-left font-semibold">Employee Name</th>
              <th className="border border-gray-300 px-2 sm:px-4 py-2 sm:py-3 text-center font-semibold">Department</th>
              <th className="border border-gray-300 px-2 sm:px-4 py-2 sm:py-3 text-center font-semibold">Hours Worked</th>
              <th className="border border-gray-300 px-2 sm:px-4 py-2 sm:py-3 text-center font-semibold">Projects</th>
              <th className="border border-gray-300 px-2 sm:px-4 py-2 sm:py-3 text-center font-semibold">Monthly Salary</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((employee, index) => (
              <tr key={employee.name} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                <td className="border border-gray-300 px-2 sm:px-4 py-2 sm:py-3 font-medium">{employee.name}</td>
                <td className="border border-gray-300 px-2 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm">{employee.department}</td>
                <td className="border border-gray-300 px-2 sm:px-4 py-2 sm:py-3 text-center">{employee.hoursWorked.toFixed(1)}h</td>
                <td className="border border-gray-300 px-2 sm:px-4 py-2 sm:py-3 text-center">{employee.projectsCount}</td>
                <td className="border border-gray-300 px-2 sm:px-4 py-2 sm:py-3 text-center">
                  {editMode ? (
                    <input
                      type="number"
                      value={salarySettings[employee.name] || ''}
                      onChange={(e) => updateSalary(employee.name, parseFloat(e.target.value) || 0)}
                      className="w-16 sm:w-20 px-1 sm:px-2 py-1 border border-gray-300 rounded text-center text-xs sm:text-sm"
                      placeholder="0"
                    />
                  ) : (
                    <span>${salarySettings[employee.name] || 0}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {employees.length === 0 && (
        <div className="text-center py-6 sm:py-8 text-gray-500">
          <div className="mb-2 text-2xl sm:text-3xl">📋</div>
          <p className="text-sm sm:text-base">No employees found in Monday.com boards.</p>
          <p className="text-xs sm:text-sm">Make sure your boards have Person columns with assigned team members.</p>
        </div>
      )}

      <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">How it works:</h3>
        <ul className="text-xs sm:text-sm text-gray-600 space-y-1">
          <li>• Employees are automatically discovered from your Monday.com boards</li>
          <li>• Hours and project counts are calculated from time tracking data</li>
          <li>• Departments are inferred from board names</li>
          <li>• Set monthly salaries here for payment calculations</li>
          <li>• Data syncs automatically when boards update</li>
        </ul>
      </div>
    </div>
  );
};

export default MondayEmployeeImport;
