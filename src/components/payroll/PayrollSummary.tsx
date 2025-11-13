'use client';
import { EmployeePayroll } from '@/types/payroll';
import { Badge } from '../ui/badge';

export function PayrollSummary({ payrolls }: { payrolls: EmployeePayroll[] }) {
    const total = payrolls.length;
    const paidCount = payrolls.filter(p => p.status === 'paid').length;
    const pendingCount = payrolls.filter(p => p.status === 'pending').length;
    const processedCount = payrolls.filter(p => p.status === 'processed').length;

    const getStatusBadge = (status: 'paid' | 'pending' | 'processed') => {
        const variants = {
            paid: 'bg-green-500/10 text-green-700 dark:text-green-400',
            pending: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
            processed: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
        };
        return <Badge className={variants[status]}>{status}</Badge>;
    };

    return (
        <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-sm text-muted-foreground">
            <p>Showing {total} payroll records</p>
            <div className="flex gap-4">
                <span>Paid: {getStatusBadge('paid')} ({paidCount})</span>
                <span>Processed: {getStatusBadge('processed')} ({processedCount})</span>
                <span>Pending: {getStatusBadge('pending')} ({pendingCount})</span>
            </div>
        </div>
    );
}