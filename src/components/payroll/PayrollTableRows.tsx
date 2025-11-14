// File: components/payroll/PayrollTableRows.tsx
import React from 'react';
import { TableBody, TableCell, TableRow } from '../ui/table';
import { Button } from '../ui/button';
import { EmployeePayroll } from '@/types/payroll';

interface PayrollTableRowsProps {
    filteredPayrolls: EmployeePayroll[];
    isLoading: boolean;
    formatHours: (hours?: number) => string;
    formatCurrency: (value?: number) => string;
    getStatusBadge: (status: 'pending' | 'processed' | 'paid') => React.JSX.Element;
    handlePay: (id: string) => void;
    handleView: (payroll: EmployeePayroll) => void;
}

export const PayrollTableRows = ({
    filteredPayrolls,
    isLoading,
    formatHours,
    formatCurrency,
    getStatusBadge,
    handlePay,
    handleView,
}: PayrollTableRowsProps) => (
    <TableBody>
        {filteredPayrolls.length === 0 ? (
            <TableRow>
                <TableCell colSpan={14} className="h-24 text-center">
                    {isLoading ? (
                        <div className="flex justify-center items-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                        </div>
                    ) : (
                        'No payroll records found'
                    )}
                </TableCell>
            </TableRow>
        ) : (
            filteredPayrolls.map((p, idx) => (
                <TableRow
                    key={p._id.toString()}
                    className="hover:bg-muted/10 transition-colors cursor-pointer"
                    onClick={() => handleView(p)}
                >
                    <TableCell>{idx + 1}</TableCell>
                    <TableCell>{p.user?.employeeId ?? '-'}</TableCell>
                    <TableCell>{p.user?.name ?? '-'}</TableCell>
                    <TableCell className="text-muted-foreground">{p.user?.department ?? '-'}</TableCell>
                    <TableCell className="text-muted-foreground">{p.user?.position ?? '-'}</TableCell>
                    <TableCell className="text-right">{formatHours(p.totalHoursWorked)}</TableCell>
                    <TableCell className="text-right">{formatHours(p.overtimeHours)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(p.baseSalary)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(p.grossPay)}</TableCell>
                    <TableCell className="text-right text-green-600">{formatCurrency(p.overtimePay)}</TableCell>
                    <TableCell className="text-right text-red-500">{formatCurrency(p.deductions)}</TableCell>
                    <TableCell className="text-right font-semibold">{formatCurrency(p.netPay)}</TableCell>
                    <TableCell>{getStatusBadge(p.status)}</TableCell>
                    <TableCell>
                        <div className="flex gap-1">
                            {p.status !== 'paid' ? (
                                <Button
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handlePay(p._id);
                                    }}
                                    className="min-w-[50px] bg-green-600 hover:bg-green-700"
                                >
                                    Pay
                                </Button>
                            ) : (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    disabled
                                    onClick={(e) => e.stopPropagation()}
                                    className="min-w-[50px] cursor-not-allowed"
                                >
                                    Paid
                                </Button>
                            )}
                        </div>
                    </TableCell>
                </TableRow>
            ))
        )}
    </TableBody>
);