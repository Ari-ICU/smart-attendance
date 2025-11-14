// File: components/payroll/PayrollStats.tsx
import React from 'react';
import { EmployeePayroll } from '@/types/payroll';

interface PayrollStatsProps {
    filteredPayrolls: EmployeePayroll[];
}

export const PayrollStats = ({ filteredPayrolls }: PayrollStatsProps) => {
    const stats = [
        { label: 'Total Records', count: filteredPayrolls.length },
        { label: 'Pending', count: filteredPayrolls.filter(p => p.status === 'pending').length, color: 'text-yellow-600 dark:text-yellow-400' },
        { label: 'Processed', count: filteredPayrolls.filter(p => p.status === 'processed').length, color: 'text-blue-600 dark:text-blue-400' },
        { label: 'Paid', count: filteredPayrolls.filter(p => p.status === 'paid').length, color: 'text-green-600 dark:text-green-400' },
    ];
    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {stats.map((s) => (
                <div key={s.label} className="bg-card border rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">{s.label}</p>
                    <p className={`text-2xl font-bold ${s.color ?? ''}`}>{s.count}</p>
                </div>
            ))}
        </div>
    );
};