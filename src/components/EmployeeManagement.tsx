'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { useEmployees } from '../hooks/useEmployees';

// Types
interface Employee {
  name: string;
  salary: number;
  department?: string;
}

interface EmployeeFormData {
  name: string;
  salary: string;
  department: string;
}

// Constants
const INITIAL_FORM_DATA: EmployeeFormData = {
  name: '',
  salary: '',
  department: ''
};

const DEFAULT_SALARY = 0;

// Component
const EmployeeManagement: React.FC = () => {
  // Hooks
  const { employees, loading, error, updateEmployee, deleteEmployee } = useEmployees();
  
  // State
  const [newEmployee, setNewEmployee] = useState<EmployeeFormData>(INITIAL_FORM_DATA);
  const [editingEmployee, setEditingEmployee] = useState<string | null>(null);
  const [editData, setEditData] = useState<EmployeeFormData>(INITIAL_FORM_DATA);

  // Memoized calculations
  const employeeStats = useMemo(() => {
    const totalSalary = employees.reduce((sum, emp) => sum + emp.salary, 0);
    const avgSalary = employees.length > 0 ? totalSalary / employees.length : 0;
    const departments = [...new Set(employees.map(emp => emp.department).filter(Boolean))];
    
    return {
      totalEmployees: employees.length,
      totalSalary,
      avgSalary,
      departmentCount: departments.length,
      departments
    };
  }, [employees]);

  // Event handlers
  const handleAddEmployee = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmployee.name.trim()) return;

    try {
      const salary = parseFloat(newEmployee.salary) || DEFAULT_SALARY;
      await updateEmployee(newEmployee.name.trim(), salary, newEmployee.department.trim());
      setNewEmployee(INITIAL_FORM_DATA);
    } catch (error) {
      console.error('Failed to add employee:', error);
    }
  }, [newEmployee, updateEmployee]);

  const handleEditEmployee = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmployee || !editData.name.trim()) return;

    try {
      const salary = parseFloat(editData.salary) || DEFAULT_SALARY;
      await updateEmployee(editData.name.trim(), salary, editData.department.trim());
      setEditingEmployee(null);
      setEditData(INITIAL_FORM_DATA);
    } catch (error) {
      console.error('Failed to update employee:', error);
    }
  }, [editingEmployee, editData, updateEmployee]);

  const startEditing = useCallback((employee: Employee) => {
    setEditingEmployee(employee.name);
    setEditData({
      name: employee.name,
      salary: employee.salary.toString(),
      department: employee.department || ''
    });
  }, []);

  const cancelEditing = useCallback(() => {
    setEditingEmployee(null);
    setEditData(INITIAL_FORM_DATA);
  }, []);

  const handleDeleteEmployee = useCallback(async (name: string) => {
    if (confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        await deleteEmployee(name);
      } catch (error) {
        console.error('Failed to delete employee:', error);
      }
    }
  }, [deleteEmployee]);

  const updateNewEmployeeField = useCallback((field: keyof EmployeeFormData, value: string) => {
    setNewEmployee(prev => ({ ...prev, [field]: value }));
  }, []);

  const updateEditDataField = useCallback((field: keyof EmployeeFormData, value: string) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  }, []);

  // Utility functions
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const isFormValid = (formData: EmployeeFormData): boolean => {
    return formData.name.trim().length > 0;
  };

  // Render helpers
  const renderLoadingState = () => (
    <div className="p-6 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      <span className="ml-2 text-gray-600">Loading employees...</span>
    </div>
  );

  const renderErrorState = () => (
    <div className="p-6">
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading employees</h3>
            <p className="mt-1 text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderFormField = (
    label: string,
    type: string,
    value: string,
    onChange: (value: string) => void,
    placeholder?: string,
    required: boolean = false
  ) => (
    <div className="flex flex-col">
      <label className="text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        required={required}
      />
    </div>
  );

  const renderAddEmployeeForm = () => (
    <div className="mb-8 p-4 bg-gray-50 rounded-lg border">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Add New Employee</h3>
      <form onSubmit={handleAddEmployee} className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {renderFormField(
          'Name *',
          'text',
          newEmployee.name,
          (value) => updateNewEmployeeField('name', value),
          'Employee Name',
          true
        )}
        {renderFormField(
          'Salary',
          'number',
          newEmployee.salary,
          (value) => updateNewEmployeeField('salary', value),
          '50000'
        )}
        {renderFormField(
          'Department',
          'text',
          newEmployee.department,
          (value) => updateNewEmployeeField('department', value),
          'Engineering'
        )}
        <div className="flex items-end">
          <button
            type="submit"
            disabled={!isFormValid(newEmployee)}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors w-full"
          >
            Add Employee
          </button>
        </div>
      </form>
    </div>
  );

  const renderEmployeeRow = (employee: Employee, index: number) => {
    const isEditing = editingEmployee === employee.name;
    const isEvenRow = index % 2 === 0;

    if (isEditing) {
      return (
        <tr key={employee.name} className={isEvenRow ? 'bg-gray-50' : 'bg-white'}>
          <td className="border border-gray-300 px-4 py-3">
            <input
              type="text"
              value={editData.name}
              onChange={(e) => updateEditDataField('name', e.target.value)}
              className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
          </td>
          <td className="border border-gray-300 px-4 py-3">
            <input
              type="number"
              value={editData.salary}
              onChange={(e) => updateEditDataField('salary', e.target.value)}
              className="w-full px-2 py-1 border border-gray-300 rounded-md text-center focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </td>
          <td className="border border-gray-300 px-4 py-3">
            <input
              type="text"
              value={editData.department}
              onChange={(e) => updateEditDataField('department', e.target.value)}
              className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </td>
          <td className="border border-gray-300 px-4 py-3 text-center">
            <div className="flex justify-center space-x-2">
              <button
                onClick={handleEditEmployee}
                disabled={!isFormValid(editData)}
                className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm"
              >
                Save
              </button>
              <button
                onClick={cancelEditing}
                className="px-3 py-1 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors text-sm"
              >
                Cancel
              </button>
            </div>
          </td>
        </tr>
      );
    }

    return (
      <tr key={employee.name} className={isEvenRow ? 'bg-gray-50' : 'bg-white'}>
        <td className="border border-gray-300 px-4 py-3 font-medium text-gray-900">
          {employee.name}
        </td>
        <td className="border border-gray-300 px-4 py-3 text-center font-semibold text-green-600">
          {formatCurrency(employee.salary)}
        </td>
        <td className="border border-gray-300 px-4 py-3 text-center text-gray-700">
          {employee.department || 'N/A'}
        </td>
        <td className="border border-gray-300 px-4 py-3 text-center">
          <div className="flex justify-center space-x-2">
            <button
              onClick={() => startEditing(employee)}
              className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm"
            >
              Edit
            </button>
            <button
              onClick={() => handleDeleteEmployee(employee.name)}
              className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-sm"
            >
              Delete
            </button>
          </div>
        </td>
      </tr>
    );
  };

  const renderEmployeeTable = () => (
    <div className="overflow-x-auto">
      <table className="w-full table-auto border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700">
              Name
            </th>
            <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-700">
              Salary
            </th>
            <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-700">
              Department
            </th>
            <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-700">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {employees.map(renderEmployeeRow)}
        </tbody>
      </table>
    </div>
  );

  const renderEmptyState = () => (
    <div className="text-center py-12">
      <div className="flex flex-col items-center">
        <svg className="h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.196-2.121M9 8a3 3 0 100 6 3 3 0 000-6zM17 8a3 3 0 100 6 3 3 0 000-6z" />
        </svg>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No employees found</h3>
        <p className="text-gray-500">Add some employees to get started with team management.</p>
      </div>
    </div>
  );

  const renderStats = () => (
    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
      <h3 className="font-semibold text-blue-900 mb-3">Team Statistics</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div>
          <span className="text-blue-700">Total Employees:</span>
          <div className="font-semibold text-blue-900">{employeeStats.totalEmployees}</div>
        </div>
        <div>
          <span className="text-blue-700">Total Salary:</span>
          <div className="font-semibold text-blue-900">{formatCurrency(employeeStats.totalSalary)}</div>
        </div>
        <div>
          <span className="text-blue-700">Average Salary:</span>
          <div className="font-semibold text-blue-900">{formatCurrency(employeeStats.avgSalary)}</div>
        </div>
        <div>
          <span className="text-blue-700">Departments:</span>
          <div className="font-semibold text-blue-900">{employeeStats.departmentCount}</div>
        </div>
      </div>
    </div>
  );

  // Early returns for loading/error states
  if (loading) return renderLoadingState();
  if (error) return renderErrorState();

  // Main render
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Employee Management</h2>
        <p className="text-gray-600 mt-1">Manage your team members and their information</p>
      </div>

      {employees.length > 0 && renderStats()}
      {renderAddEmployeeForm()}
      {employees.length > 0 ? renderEmployeeTable() : renderEmptyState()}
    </div>
  );
};

export default EmployeeManagement;
