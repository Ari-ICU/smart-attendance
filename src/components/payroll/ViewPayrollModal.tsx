// File: components/payroll/ViewPayrollModal.tsx
import React from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Download, X } from 'lucide-react';
import { EmployeePayroll } from '@/types/payroll';
import { Badge } from '../ui/badge';

interface ViewPayrollModalProps {
    isOpen: boolean;
    onClose: () => void;
    payroll: EmployeePayroll | null;
    formatHours: (hours?: number) => string;
    formatCurrency: (value?: number) => string;
    getStatusBadge: (status: 'pending' | 'processed' | 'paid') => React.JSX.Element;
    exportPayslip: (id: string) => void;
}

export const ViewPayrollModal = ({
    isOpen,
    onClose,
    payroll,
    formatHours,
    formatCurrency,
    getStatusBadge,
    exportPayslip,
}: ViewPayrollModalProps) => {
    if (!isOpen || !payroll) return null;

    const WORKING_DAYS_PER_MONTH = 22;
    const STANDARD_WORK_HOURS_PER_DAY = 8;
    const LATE_PENALTY_RATE = 0.10;

    const dailyRate = payroll.baseSalary / WORKING_DAYS_PER_MONTH;
    const absentDeduction = payroll.absentDays * dailyRate;
    const lateDays = payroll.totalLateHours / STANDARD_WORK_HOURS_PER_DAY;
    const latePenalty = lateDays * dailyRate * LATE_PENALTY_RATE;
    const taxDeductions = Math.max(0, payroll.deductions - absentDeduction - latePenalty);
    const grossPay = payroll.grossPay;

    const variants = {
        pending: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:border-yellow-800 dark:text-yellow-400',
        processed: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-400',
        paid: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:border-green-800 dark:text-green-400',
    };

    const getStatusBadgeLocal = (status: 'pending' | 'processed' | 'paid') => (
        <Badge className={`border ${variants[status]}`}>{status}</Badge>
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <Card className="w-full max-w-2xl p-6 relative border max-h-[90vh] overflow-y-auto">
                <button
                    className="absolute top-3 right-3 rounded-full p-1 hover:bg-muted transition-colors"
                    onClick={onClose}
                >
                    <X className="w-5 h-5" />
                </button>
                <div className="mb-6">
                    <h3 className="text-xl font-semibold">Payroll Details</h3>
                    <p className="text-muted-foreground text-sm">View detailed payroll information</p>
                </div>
                <div className="space-y-6">
                    <div>
                        <h4 className="font-medium mb-2">Employee Information</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <span className="text-sm text-muted-foreground">Employee ID:</span>
                                <p className="font-medium">{payroll.user?.employeeId ?? '-'}</p>
                            </div>
                            <div className="space-y-1">
                                <span className="text-sm text-muted-foreground">Name:</span>
                                <p className="font-medium">{payroll.user?.name ?? '-'}</p>
                            </div>
                            <div className="space-y-1">
                                <span className="text-sm text-muted-foreground">Department:</span>
                                <p>{payroll.user?.department ?? '-'}</p>
                            </div>
                            <div className="space-y-1">
                                <span className="text-sm text-muted-foreground">Position:</span>
                                <p>{payroll.user?.position ?? '-'}</p>
                            </div>
                        </div>
                    </div>
                    <div>
                        <h4 className="font-medium mb-2">Pay Period</h4>
                        <p className="text-lg">{payroll.month}/{payroll.year}</p>
                    </div>
                    <div>
                        <h4 className="font-medium mb-2">Hours Worked</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <span className="text-sm text-muted-foreground">Total Hours:</span>
                                <p className="font-medium">{formatHours(payroll.totalHoursWorked)}</p>
                            </div>
                            <div className="space-y-1">
                                <span className="text-sm text-muted-foreground">Overtime Hours:</span>
                                <p className="font-medium">{formatHours(payroll.overtimeHours)}</p>
                            </div>
                        </div>
                    </div>
                    <div>
                        <h4 className="font-medium mb-2">Earnings</h4>
                        <div className="space-y-2">
                            <div className="flex justify-between py-1">
                                <span>Base Salary</span>
                                <span>{formatCurrency(payroll.baseSalary)}</span>
                            </div>
                            {payroll.tax && (
                                <div className="flex justify-between py-0.5 text-xs text-muted-foreground">
                                    <span>Overtime Rate: {payroll.tax.overtimeRate}/h</span>
                                </div>
                            )}
                            <div className="flex justify-between py-1">
                                <span className="text-green-600">Overtime Pay</span>
                                <span className="text-green-600 font-medium">{formatCurrency(payroll.overtimePay)}</span>
                            </div>
                            <div className="flex justify-between py-1 font-semibold border-t pt-1">
                                <span>Gross Pay</span>
                                <span>{formatCurrency(payroll.grossPay)}</span>
                            </div>
                        </div>
                    </div>
                    <div>
                        <h4 className="font-medium mb-2">Deductions Breakdown</h4>
                        <div className="space-y-2">
                            <div className="flex justify-between py-1">
                                <span>Absent Deduction ({payroll.absentDays} days)</span>
                                <span className="text-red-500">{formatCurrency(absentDeduction)}</span>
                            </div>
                            <div className="flex justify-between py-1">
                                <span>Late Penalty ({Math.round(lateDays)} days)</span>
                                <span className="text-red-500">{formatCurrency(latePenalty)}</span>
                            </div>
                            {/* FIXED: Detailed Tax Breakdown using payroll.tax */}
                            {payroll.tax && (
                                <div className="space-y-1 border-t pt-1">
                                    <h5 className="text-sm font-medium text-muted-foreground">Taxes & Insurance (Total: {formatCurrency(taxDeductions)})</h5>
                                    <div className="flex justify-between py-0.5 text-xs">
                                        <span>General Tax ({payroll.tax.taxPercentage}%)</span>
                                        <span className="text-red-500">{formatCurrency(grossPay * (payroll.tax.taxPercentage / 100))}</span>
                                    </div>
                                    <div className="flex justify-between py-0.5 text-xs">
                                        <span>Income Tax ({payroll.tax.incomeTax}%)</span>
                                        <span className="text-red-500">{formatCurrency(grossPay * (payroll.tax.incomeTax / 100))}</span>
                                    </div>
                                    <div className="flex justify-between py-0.5 text-xs">
                                        <span>Health Insurance ({payroll.tax.healthInsurance}%)</span>
                                        <span className="text-red-500">{formatCurrency(grossPay * (payroll.tax.healthInsurance / 100))}</span>
                                    </div>
                                    <div className="flex justify-between py-0.5 text-xs">
                                        <span>Other Deductions ({payroll.tax.otherDeductions}%)</span>
                                        <span className="text-red-500">{formatCurrency(grossPay * (payroll.tax.otherDeductions / 100))}</span>
                                    </div>
                                </div>
                            )}
                            <div className="flex justify-between py-1 font-semibold border-t pt-1">
                                <span>Total Deductions</span>
                                <span className="text-red-500 font-bold">{formatCurrency(payroll.deductions)}</span>
                            </div>
                        </div>
                    </div>
                    <div>
                        <h4 className="font-medium mb-2">Net Pay</h4>
                        <p className="text-2xl font-bold text-primary">{formatCurrency(payroll.netPay)}</p>
                    </div>
                    <div>
                        <h4 className="font-medium mb-2">Status</h4>
                        <div>{getStatusBadge(payroll.status)}</div>
                    </div>
                    {payroll.notes && (
                        <div>
                            <h4 className="font-medium mb-2">Notes</h4>
                            <p className="text-sm text-muted-foreground">{payroll.notes}</p>
                        </div>
                    )}
                </div>
                <div className="flex gap-3 pt-6">
                    <Button
                        onClick={() => exportPayslip(payroll._id.toString())}
                        className="flex-1 flex items-center gap-2"
                    >
                        <Download className="w-4 h-4" /> Download Payslip
                    </Button>
                    <Button variant="outline" onClick={onClose} className="flex-1">
                        Close
                    </Button>
                </div>
            </Card>
        </div>
    );
};