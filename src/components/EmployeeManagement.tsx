import React, { useState } from 'react';
import { useEmployees } from '../hooks/useEmployees';

const EmployeeManagement = () => {
  const { employees, loading, error, updateEmployee, deleteEmployee } = useEmployees();
  const [newEmployee, setNewEmployee] = useState({ name: '', salary: 0, department: '' });
  const [editingEmployee, setEditingEmployee] = useState<string | null>(null);
  const [editData, setEditData] = useState({ name: '', salary: 0, department: '' });

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmployee.name.trim()) return;

    try {
      await updateEmployee(newEmployee.name, newEmployee.salary, newEmployee.department);
      setNewEmployee({ name: '', salary: 0, department: '' });
    } catch (error) {
      console.error('Failed to add employee:', error);
    }
  };

  const handleEditEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmployee) return;

    try {
      await updateEmployee(editData.name, editData.salary, editData.department);
      setEditingEmployee(null);
    } catch (error) {
      console.error('Failed to update employee:', error);
    }
  };

  const startEditing = (employee: { name: string; salary: number; department?: string }) => {
    setEditingEmployee(employee.name);
    setEditData({
      name: employee.name,
      salary: employee.salary,
      department: employee.department || ''
    });
  };

  const handleDeleteEmployee = async (name: string) => {
    if (confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        await deleteEmployee(name);
      } catch (error) {
        console.error('Failed to delete employee:', error);
      }
    }
  };

  if (loading) {
    return <div className="p-6">Loading employees...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-600">Error: {error}</div>;
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Employee Management</h2>

      {/* Add New Employee Form */}
      <div className="mb-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Add New Employee</h3>
        <form onSubmit={handleAddEmployee} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Employee Name"
            value={newEmployee.name}
            onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            required
          />
          <input
            type="number"
            placeholder="Salary"
            value={newEmployee.salary || ''}
            onChange={(e) => setNewEmployee({ ...newEmployee, salary: parseFloat(e.target.value) || 0 })}
            className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            required
          />
          <input
            type="text"
            placeholder="Department"
            value={newEmployee.department}
            onChange={(e) => setNewEmployee({ ...newEmployee, department: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Add Employee
          </button>
        </form>
      </div>

      {/* Employee List */}
      <div className="overflow-x-auto">
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Name</th>
              <th className="border border-gray-300 px-4 py-3 text-center font-semibold">Salary</th>
              <th className="border border-gray-300 px-4 py-3 text-center font-semibold">Department</th>
              <th className="border border-gray-300 px-4 py-3 text-center font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((employee, index) => (
              <tr key={employee.name} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                {editingEmployee === employee.name ? (
                  <>
                    <td className="border border-gray-300 px-4 py-3">
                      <input
                        type="text"
                        value={editData.name}
                        onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                        className="w-full px-2 py-1 border border-gray-300 rounded"
                      />
                    </td>
                    <td className="border border-gray-300 px-4 py-3">
                      <input
                        type="number"
                        value={editData.salary || ''}
                        onChange={(e) => setEditData({ ...editData, salary: parseFloat(e.target.value) || 0 })}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-center"
                      />
                    </td>
                    <td className="border border-gray-300 px-4 py-3">
                      <input
                        type="text"
                        value={editData.department}
                        onChange={(e) => setEditData({ ...editData, department: e.target.value })}
                        className="w-full px-2 py-1 border border-gray-300 rounded"
                      />
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-center">
                      <button
                        onClick={handleEditEmployee}
                        className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 mr-2"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingEmployee(null)}
                        className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                      >
                        Cancel
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="border border-gray-300 px-4 py-3 font-medium">{employee.name}</td>
                    <td className="border border-gray-300 px-4 py-3 text-center">${employee.salary}</td>
                    <td className="border border-gray-300 px-4 py-3 text-center">{employee.department || 'N/A'}</td>
                    <td className="border border-gray-300 px-4 py-3 text-center">
                      <button
                        onClick={() => startEditing(employee)}
                        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 mr-2"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteEmployee(employee.name)}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {employees.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No employees found. Add some employees to get started.
        </div>
      )}
    </div>
  );
};

export default EmployeeManagement;
