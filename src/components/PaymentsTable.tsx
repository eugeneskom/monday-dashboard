'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Board } from '@/types/monday';

// Types
interface PaymentData {
  salary: number;
  hoursSpent: number;
  rate: number;
  additionalPayment: number;
}

interface PaymentsTableProps {
  boards: Board[];
}

interface EmployeeSalary {
  name: string;
  salary: number;
}

// Constants
const DEFAULT_SALARIES: Record<string, number> = {
  'Kateryna Mokhova': 500,
  'Ira Skoryk': 1000,
  'Anastasia Domina': 1500,
  'Мохова': 500,
  'Скорик': 1000,
  'Дьоміна': 1500,
};

const STANDARD_WORKING_HOURS = 160; // Monthly working hours
const STORAGE_KEY = 'employeeSalaries';

// Utility functions
const parseTimeToHours = (timeStr: string): number => {
  if (!timeStr) return 0;
  
  // Handle formats like "01:00:06", "25:00:00", "02:00:00"
  const parts = timeStr.split(':');
  if (parts.length === 3) {
    const hours = parseInt(parts[0]) || 0;
    const minutes = parseInt(parts[1]) || 0;
    const seconds = parseInt(parts[2]) || 0;
    return hours + minutes / 60 + seconds / 3600;
  }
  
  return 0;
};

const extractEmployeesFromBoards = (boards: Board[]): string[] => {
  const employeeSet = new Set<string>();
  
  boards.forEach(board => {
    board.items.forEach(item => {
      if (item.subitems) {
        item.subitems.forEach(subitem => {
          const name = subitem.column_values.find(col => col.id === 'person')?.text;
          if (name && name.trim() && name !== 'Unknown') {
            employeeSet.add(name.trim());
          }
        });
      }
    });
  });
  
  return Array.from(employeeSet).sort();
};

const calculatePayments = (
  boards: Board[], 
  employeeSalaries: Record<string, number>
): Record<string, PaymentData> => {
  const employees: Record<string, PaymentData> = {};

  boards.forEach(board => {
    board.items.forEach(item => {
      // Process subitems where the real employee data is
      if (item.subitems) {
        item.subitems.forEach(subitem => {
          const name = subitem.column_values.find(col => col.id === 'person')?.text || 'Unknown';
          const timeStr = subitem.column_values.find(col => col.id === 'time_tracking__1')?.text || '00:00:00';
          const hourlyRateStr = subitem.column_values.find(col => col.id === 'numbers0__1')?.text || '0';
          
          const hours = parseTimeToHours(timeStr);
          const hourlyRate = parseFloat(hourlyRateStr) || 0;

          if (!employees[name]) {
            const salary = employeeSalaries[name] || DEFAULT_SALARIES[name] || 0;
            employees[name] = {
              salary,
              hoursSpent: 0,
              rate: hourlyRate || (salary > 0 ? salary / STANDARD_WORKING_HOURS : 0),
              additionalPayment: 0
            };
          }

          employees[name].hoursSpent += hours;
          // Update rate if we have a valid hourly rate from the data
          if (hourlyRate > 0) {
            employees[name].rate = hourlyRate;
          }
        });
      }
    });
  });

  // Calculate additional payments: Only for overtime (hours > 160)
  Object.keys(employees).forEach(name => {
    const emp = employees[name];
    
    // Additional payment only if worked more than standard hours
    if (emp.hoursSpent > STANDARD_WORKING_HOURS) {
      const overtimeHours = emp.hoursSpent - STANDARD_WORKING_HOURS;
      emp.additionalPayment = overtimeHours * emp.rate;
    } else {
      emp.additionalPayment = 0; // No additional payment for working less than 160h
    }
  });

  return employees;
};

// Component
const PaymentsTable: React.FC<PaymentsTableProps> = ({ boards }) => {
  // State
  const [localSalaries, setLocalSalaries] = useState<Record<string, number>>({});
  const [editMode, setEditMode] = useState(false);
  
  // Memoized calculations
  const boardEmployees = useMemo(() => extractEmployeesFromBoards(boards), [boards]);
  const payments = useMemo(() => calculatePayments(boards, localSalaries), [boards, localSalaries]);
  
  // Load salary settings from localStorage and merge with board employees
  useEffect(() => {
    const savedSalaries = localStorage.getItem(STORAGE_KEY);
    const savedSalaryData = savedSalaries ? JSON.parse(savedSalaries) : {};
    
    const mergedSalaries: Record<string, number> = {};
    
    // Add board employees
    boardEmployees.forEach((name: string) => {
      mergedSalaries[name] = savedSalaryData[name] || DEFAULT_SALARIES[name] || 0;
    });
    
    setLocalSalaries(mergedSalaries);
  }, [boardEmployees]);

  // Event handlers
  const updateSalary = useCallback((employeeName: string, salary: number) => {
    const newSalaries = {
      ...localSalaries,
      [employeeName]: salary
    };
    setLocalSalaries(newSalaries);
    
    // Save to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSalaries));
  }, [localSalaries]);

  const handleEditMode = useCallback(() => {
    setEditMode(prev => !prev);
  }, []);

  // Utility functions
  const formatCurrency = (amount: number): string => {
    return `$${amount.toFixed(2)}`;
  };

  const formatHours = (hours: number): string => {
    return `${hours.toFixed(1)}h`;
  };

  const getAdditionalPaymentStyle = (amount: number): string => {
    return amount > 0 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  // Render helpers
  const renderCalculationInfo = () => (
    <div className="mb-4 p-3 sm:p-4 bg-blue-50 rounded-lg">
      <h3 className="font-semibold text-blue-800 mb-2 text-sm sm:text-base">
        Calculation Formula:
      </h3>
      <p className="text-blue-700 text-xs sm:text-sm">
        Additional Payment = (Hours Worked - {STANDARD_WORKING_HOURS}) × Hourly Rate (only if hours &gt; {STANDARD_WORKING_HOURS})
      </p>
      <p className="text-blue-600 text-xs mt-1">
        Hourly Rate = Monthly Salary ÷ {STANDARD_WORKING_HOURS} hours
      </p>
    </div>
  );

  const renderPaymentRow = (name: string, payment: PaymentData, index: number) => {
    const expectedEarnings = payment.hoursSpent * payment.rate;
    const isEvenRow = index % 2 === 0;

    return (
      <tr key={name} className={isEvenRow ? 'bg-gray-50' : 'bg-white'}>
        <td className="border border-gray-300 px-2 sm:px-4 py-2 sm:py-3 font-medium">
          {name}
        </td>
        <td className="border border-gray-300 px-2 sm:px-4 py-2 sm:py-3 text-center">
          {formatCurrency(payment.salary)}
        </td>
        <td className="border border-gray-300 px-2 sm:px-4 py-2 sm:py-3 text-center">
          {formatHours(payment.hoursSpent)}
        </td>
        <td className="border border-gray-300 px-2 sm:px-4 py-2 sm:py-3 text-center">
          {formatCurrency(payment.rate)}/h
        </td>
        <td className="border border-gray-300 px-2 sm:px-4 py-2 sm:py-3 text-center">
          {formatCurrency(expectedEarnings)}
        </td>
        <td className={`border border-gray-300 px-2 sm:px-4 py-2 sm:py-3 text-center font-bold ${getAdditionalPaymentStyle(payment.additionalPayment)}`}>
          {formatCurrency(payment.additionalPayment)}
        </td>
      </tr>
    );
  };

  const renderPaymentsTable = () => (
    <div className="overflow-x-auto">
      <table className="w-full table-auto border-collapse text-xs sm:text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 px-2 sm:px-4 py-2 sm:py-3 text-left font-semibold">
              Employee
            </th>
            <th className="border border-gray-300 px-2 sm:px-4 py-2 sm:py-3 text-center font-semibold">
              Salary
            </th>
            <th className="border border-gray-300 px-2 sm:px-4 py-2 sm:py-3 text-center font-semibold">
              Hours
            </th>
            <th className="border border-gray-300 px-2 sm:px-4 py-2 sm:py-3 text-center font-semibold">
              Rate
            </th>
            <th className="border border-gray-300 px-2 sm:px-4 py-2 sm:py-3 text-center font-semibold">
              Expected
            </th>
            <th className="border border-gray-300 px-2 sm:px-4 py-2 sm:py-3 text-center font-semibold bg-green-50">
              Additional
            </th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(payments).map(([name, payment], index) => 
            renderPaymentRow(name, payment, index)
          )}
        </tbody>
      </table>
    </div>
  );

  const renderEmptyState = () => (
    <div className="text-center py-8 text-gray-500">
      No payment data available. Make sure your boards have Person and Hours columns.
    </div>
  );

  const renderSalaryInput = (employeeSalary: EmployeeSalary) => (
    <div key={employeeSalary.name} className="flex items-center space-x-2">
      <label className="font-medium text-gray-700 flex-1 text-xs sm:text-sm">
        {employeeSalary.name}:
      </label>
      <input
        type="number"
        value={employeeSalary.salary}
        onChange={(e) => updateSalary(employeeSalary.name, parseFloat(e.target.value) || 0)}
        className="w-16 sm:w-20 px-1 sm:px-2 py-1 border border-gray-300 rounded text-center text-xs sm:text-sm"
        placeholder="0"
      />
      <span className="text-gray-500 text-xs sm:text-sm">$</span>
    </div>
  );

  const renderSalaryDisplay = (employeeSalary: EmployeeSalary) => (
    <div key={employeeSalary.name} className="text-gray-600">
      <span className="font-medium">{employeeSalary.name}:</span> {formatCurrency(employeeSalary.salary)}
    </div>
  );

  const renderSalaryManagement = () => {
    const employeeSalaries: EmployeeSalary[] = Object.entries(localSalaries).map(([name, salary]) => ({
      name,
      salary
    }));

    return (
      <div className="mt-4 sm:mt-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
          <h3 className="font-semibold text-gray-800 text-sm sm:text-base">
            Employee Salaries (from Monday.com data):
          </h3>
          <button
            onClick={handleEditMode}
            className="px-3 sm:px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-xs sm:text-sm self-start sm:self-auto"
          >
            {editMode ? 'Save Changes' : 'Edit Salaries'}
          </button>
        </div>
        
        <div className="p-3 sm:p-4 bg-gray-50 rounded-lg">
          {editMode ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {employeeSalaries.map(renderSalaryInput)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 text-xs sm:text-sm">
              {employeeSalaries.map(renderSalaryDisplay)}
            </div>
          )}
        </div>
        
        {employeeSalaries.length === 0 && (
          <div className="p-3 sm:p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-yellow-800 text-xs sm:text-sm">
              No employees found in the Monday.com boards. Make sure your boards have Person columns with assigned team members.
            </p>
          </div>
        )}
      </div>
    );
  };

  // Main render
  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-800">
        Additional Payments
      </h2>
      
      {renderCalculationInfo()}
      {Object.keys(payments).length > 0 ? renderPaymentsTable() : renderEmptyState()}
      {renderSalaryManagement()}
    </div>
  );
};

export default PaymentsTable;