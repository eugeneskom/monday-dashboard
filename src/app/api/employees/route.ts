import { NextRequest, NextResponse } from 'next/server';

// This would typically come from a database
// For now, using a simple in-memory store
const employees: Record<string, { name: string; salary: number; department?: string }> = {
  'Kateryna Mokhova': { name: 'Kateryna Mokhova', salary: 500, department: 'Design' },
  'Ira Skoryk': { name: 'Ira Skoryk', salary: 1000, department: 'Development' },
  'Anastasia Domina': { name: 'Anastasia Domina', salary: 1500, department: 'Management' },
  'Мохова': { name: 'Мохова', salary: 500, department: 'Design' },
  'Скорик': { name: 'Скорик', salary: 1000, department: 'Development' },
  'Дьоміна': { name: 'Дьоміна', salary: 1500, department: 'Management' },
};

// GET: Fetch all employees
export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      employees: Object.values(employees)
    });
  } catch (error) {
    console.error('Error fetching employees:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch employees' },
      { status: 500 }
    );
  }
}

// POST: Add or update employee
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, salary, department } = body;

    if (!name || typeof salary !== 'number') {
      return NextResponse.json(
        { success: false, error: 'Name and salary are required' },
        { status: 400 }
      );
    }

    employees[name] = {
      name,
      salary,
      department: department || 'Unknown'
    };

    return NextResponse.json({
      success: true,
      message: 'Employee saved successfully',
      employee: employees[name]
    });
  } catch (error) {
    console.error('Error saving employee:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save employee' },
      { status: 500 }
    );
  }
}

// PUT: Update multiple employees at once
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { employees: updatedEmployees } = body;

    if (!Array.isArray(updatedEmployees)) {
      return NextResponse.json(
        { success: false, error: 'Employees must be an array' },
        { status: 400 }
      );
    }

    // Update employees
    updatedEmployees.forEach(emp => {
      if (emp.name && typeof emp.salary === 'number') {
        employees[emp.name] = {
          name: emp.name,
          salary: emp.salary,
          department: emp.department || employees[emp.name]?.department || 'Unknown'
        };
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Employees updated successfully',
      employees: Object.values(employees)
    });
  } catch (error) {
    console.error('Error updating employees:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update employees' },
      { status: 500 }
    );
  }
}

// DELETE: Remove employee
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const name = url.searchParams.get('name');

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Employee name is required' },
        { status: 400 }
      );
    }

    if (employees[name]) {
      delete employees[name];
      return NextResponse.json({
        success: true,
        message: 'Employee deleted successfully'
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Employee not found' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Error deleting employee:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete employee' },
      { status: 500 }
    );
  }
}
