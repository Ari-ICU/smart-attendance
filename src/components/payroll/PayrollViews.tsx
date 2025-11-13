'use client';
import { useEffect, useMemo, useState } from 'react';
import { usePayroll } from '@/hooks/payroll.hook';
import { Card } from '../ui/card';
import { PayrollTable } from './PayrollTable';
import { PayrollSummary } from './PayrollSummary';
import { EmployeePayroll } from '@/types/payroll';

export default function PayrollView() {
    const {
        payrolls,
        isLoading,
        isSubmitting,
        fetchPayrolls,
        generatePayroll,
        updatePayrollStatus,
        exportPayslip,
    } = usePayroll();

    const currentDate = new Date();
    const [year, setYear] = useState<number | ''>(currentDate.getFullYear());
    const [month, setMonth] = useState<number | ''>(currentDate.getMonth() + 1);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchPayrolls().catch(console.error);
    }, [fetchPayrolls]);

    const filteredPayrolls = useMemo(() => {
        return payrolls.filter(p => {
            const matchesName = p.user?.name?.toLowerCase().includes(search.toLowerCase()) ?? true;
            const matchesYear = year ? p.year === year : true;
            const matchesMonth = month ? p.month === month : true;
            return matchesName && matchesYear && matchesMonth;
        });
    }, [payrolls, search, year, month]);

    return (
        <div className="space-y-6">
            <Card className="space-y-2">
                <PayrollTable
                    payrolls={payrolls}
                    filteredPayrolls={filteredPayrolls}
                    year={year}
                    setYear={setYear}
                    month={month}
                    setMonth={setMonth}
                    search={search}
                    setSearch={setSearch}
                    isLoading={isLoading}
                    isSubmitting={isSubmitting}
                    fetchPayrolls={fetchPayrolls}
                    generatePayroll={generatePayroll}
                    updatePayrollStatus={updatePayrollStatus}
                    exportPayslip={exportPayslip}
                />
                <div className="px-6">
                    <PayrollSummary payrolls={filteredPayrolls} />
                </div>
            </Card>
        </div>
    );
}