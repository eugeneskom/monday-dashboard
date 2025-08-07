import { useState, useEffect } from 'react';

interface Employee {
  name: string;
  salary: number;
  department?: string;
}

interface UseEmployeesReturn {
  employees: Employee[];
  loading: boolean;
  error: string | null;
  updateEmployee: (name: string, salary: number, department?: string) => Promise<void>;
  updateMultipleEmployees: (employees: Employee[]) => Promise<void>;
  deleteEmployee: (name: string) => Promise<void>;
  refetch: () => Promise<void>;
}

export function useEmployees(): UseEmployeesReturn {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/employees');
      const data = await response.json();
      
      if (data.success) {
        setEmployees(data.employees);
      } else {
        setError(data.error || 'Failed to fetch employees');
      }
    } catch (err) {
      setError('Failed to fetch employees');
      console.error('Error fetching employees:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateEmployee = async (name: string, salary: number, department?: string) => {
    try {
      const response = await fetch('/api/employees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, salary, department }),
      });

      const data = await response.json();
      
      if (data.success) {
        await fetchEmployees(); // Refetch to update state
      } else {
        throw new Error(data.error || 'Failed to update employee');
      }
    } catch (err) {
      console.error('Error updating employee:', err);
      throw err;
    }
  };

  const updateMultipleEmployees = async (employeesToUpdate: Employee[]) => {
    try {
      const response = await fetch('/api/employees', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ employees: employeesToUpdate }),
      });

      const data = await response.json();
      
      if (data.success) {
        setEmployees(data.employees);
      } else {
        throw new Error(data.error || 'Failed to update employees');
      }
    } catch (err) {
      console.error('Error updating employees:', err);
      throw err;
    }
  };

  const deleteEmployee = async (name: string) => {
    try {
      const response = await fetch(`/api/employees?name=${encodeURIComponent(name)}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      
      if (data.success) {
        await fetchEmployees(); // Refetch to update state
      } else {
        throw new Error(data.error || 'Failed to delete employee');
      }
    } catch (err) {
      console.error('Error deleting employee:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  return {
    employees,
    loading,
    error,
    updateEmployee,
    updateMultipleEmployees,
    deleteEmployee,
    refetch: fetchEmployees,
  };
}
