import { TaxSettings } from "./taxSettings";
import { User } from "./users";

export interface EmployeePayroll {
    _id: string;
    id: string; // Payroll document ID
    employeeId: string; // User ID
    user: User;
    year: number;
    month: number;
    totalHoursWorked: number;
    totalLateHours: number;
    absentDays: number;
    overtimeHours: number; // NEW: Overtime hours worked
    baseSalary: number;
    hourlyRate?: number;
    grossPay: number;
    overtimePay: number; 
    deductions: number;
    tax: TaxSettings;
    netPay: number;
    status: 'pending' | 'processed' | 'paid';
    notes?: string;
}
