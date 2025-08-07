export interface ColumnValue {
  id: string;
  text: string;
  value: string;
}

export interface MondayItem {
  id: string;
  name: string;
  column_values: ColumnValue[];
  board: {
    id: string;
    name: string;
  };
  subitems?: MondaySubitem[];
}

export interface MondaySubitem {
  id: string;
  name: string;
  column_values: ColumnValue[];
}

export interface Employee {
  name: string;
  activeTasks: {
    inProgress: number;
    needReview: number;
    leadFeedback: number;
    toPack: number;
    sent: number;
    clientFeedback: number;
    readyForClient: number;
    paused: number;
  };
  workload: number; // IN PROGRESS + NEED REVIEW
  completedTasks: number; // DONE + STOPPED
  totalActiveTasks: number;
  additionalPayment: number;
  monthlyHours: number;
  salary: number;
}

export interface PaymentCalculation {
  employee: string;
  salary: number;
  hoursSpent: number;
  rate: number;
  additionalPayment: number;
}

// Predefined salaries as per requirements
export const EMPLOYEE_SALARIES: Record<string, number> = {
  'Мохова': 500,
  'Скорик': 1000,
  'Дьоміна': 1500,
};

// Task statuses for workload calculation
export const ACTIVE_STATUSES = [
  'IN PROGRESS',
  'NEED REVIEW', 
  'LEAD FEEDBACK',
  'TO PACK',
  'SENT',
  'CLIENT FEEDBACK',
  'READY FOR CLIENT',
  'PAUSED'
];

export const WORKLOAD_STATUSES = ['IN PROGRESS', 'NEED REVIEW'];
export const COMPLETED_STATUSES = ['DONE', 'STOPPED'];

export interface Board {
  id: string;
  name: string;
  items: MondayItem[];
}
