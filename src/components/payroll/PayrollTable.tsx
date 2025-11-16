// File: components/payroll/PayrollTable.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Table, TableHeader, TableHead, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { EmployeePayroll } from '@/types/payroll';
import { Dispatch, SetStateAction } from 'react';
import { useDepartments } from '@/hooks/department.hook';
import { PayrollHeader } from './PayrollHeader';
import { PayrollFilters } from './PayrollFilters';
import { PayrollStats } from './PayrollStats';
import { PayrollTableRows } from './PayrollTableRows';
import { GeneratePayrollModal } from './GeneratePayrollModal';
import { ViewPayrollModal } from './ViewPayrollModal';
import { toast } from 'sonner';

interface PayrollTableProps {
    payrolls: EmployeePayroll[];
    filteredPayrolls: EmployeePayroll[];
    year: number | '';
    setYear: Dispatch<SetStateAction<number | ''>>;
    month: number | '';
    setMonth: Dispatch<SetStateAction<number | ''>>;
    search: string;
    setSearch: Dispatch<SetStateAction<string>>;
    isLoading: boolean;
    isSubmitting: boolean;
    fetchPayrolls: (year?: number, month?: number) => Promise<EmployeePayroll[]>;
    generatePayroll: (year: number, month: number) => Promise<EmployeePayroll[]>;
    updatePayrollStatus: (payrollId: string, status: 'pending' | 'processed' | 'paid') => Promise<EmployeePayroll>;
    exportPayslip: (id: string) => void;
}

export function PayrollTable(props: PayrollTableProps) {
    // ✅ Mounted flag to prevent SSR/client mismatch
    const [mounted, setMounted] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedPayroll, setSelectedPayroll] = useState<EmployeePayroll | null>(null);
    const [message, setMessage] = useState('');
    const [modalYear, setModalYear] = useState<number | ''>(props.year);
    const [modalMonth, setModalMonth] = useState<number | ''>(props.month);

    const { departments: allDepartments } = useDepartments();

    // ✅ Set mounted after first render
    useEffect(() => {
        setMounted(true);
    }, []);

    // -----------------------
    // Helpers
    // -----------------------
    const formatHours = (hours?: number) => {
        const totalMinutes = Math.round((hours ?? 0) * 60);
        const hh = Math.floor(totalMinutes / 60);
        const mm = totalMinutes % 60;
        return `${hh}h ${mm}m`;
    };

    const formatCurrency = (value?: number) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value ?? 0);

    const getStatusBadge = (status: 'pending' | 'processed' | 'paid') => {
        const variants = {
            pending: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:border-yellow-800 dark:text-yellow-400',
            processed: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-400',
            paid: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:border-green-800 dark:text-green-400',
        };
        return <Badge className={`border ${variants[status]}`}>{status}</Badge>;
    };

    // -----------------------
    // Handlers
    // -----------------------
    const handleView = (payroll: EmployeePayroll) => {
        setSelectedPayroll(payroll);
        setIsViewModalOpen(true);
    };

    const handleGeneratePayroll = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');
        const { payrolls, fetchPayrolls, generatePayroll } = props;
        if (!modalYear || !modalMonth || modalMonth < 1 || modalMonth > 12) {
            toast.error('Please enter a valid year and month (1-12)');
            return;
        }
        const existingPayrolls = payrolls.filter(p => p.year === modalYear && p.month === modalMonth);
        if (existingPayrolls.length > 0) {
            setMessage(`Payroll already exists for ${modalMonth}/${modalYear}`);
            return;
        }
        try {
            await generatePayroll(modalYear, modalMonth);
            toast.success(`Payroll generated for ${modalMonth}/${modalYear}`);
            await fetchPayrolls();
            setIsModalOpen(false);
            setModalYear('');
            setModalMonth('');
        } catch (err: any) {
            console.error('Error generating payroll:', err);
            toast.error(err.message || 'Failed to generate payroll');
        }
    };

    const handlePay = async (id: string) => {
        const { updatePayrollStatus, fetchPayrolls } = props;
        try {
            await updatePayrollStatus(id, 'paid');
            await fetchPayrolls();
        } catch (err) {
            console.error(err);
            toast.error('Failed to update payroll status');
        }
    };

    const handlePayAllPending = async () => {
        const pendingPayrolls = props.filteredPayrolls.filter(p => p.status !== 'paid');
        for (const p of pendingPayrolls) {
            await handlePay(p._id.toString());
        }
    };

    const handleDownload = () => {
        props.filteredPayrolls.forEach(p => props.exportPayslip(p._id.toString()));
    };

    // -----------------------
    // Render (only after mount)
    // -----------------------
    if (!mounted) return null;

    const filteredPayrollsSafe = props.filteredPayrolls ?? [];

    return (
        <div className="px-4 py-6 max-w-full">
            <PayrollHeader />
            <PayrollFilters
                year={props.year}
                setYear={props.setYear}
                month={props.month}
                setMonth={props.setMonth}
                search={props.search}
                setSearch={props.setSearch}
                isLoading={props.isLoading}
                setIsModalOpen={setIsModalOpen}
                handleDownload={handleDownload}
                handlePayAllPending={handlePayAllPending}
                filteredPayrolls={filteredPayrollsSafe}
            />
            <PayrollStats filteredPayrolls={filteredPayrollsSafe} />
            <Card className="overflow-hidden border px-2">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Employee ID</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Department</TableHead>
                                <TableHead>Position</TableHead>
                                <TableHead className="text-right">Hours</TableHead>
                                <TableHead className="text-right">Overtime Hours</TableHead>
                                <TableHead className="text-right">Salary</TableHead>
                                <TableHead className="text-right">Gross Pay</TableHead>
                                <TableHead className="text-right">Overtime Pay</TableHead>
                                <TableHead className="text-right">Deductions</TableHead>
                                <TableHead className="text-right">Net Pay</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <PayrollTableRows
                            filteredPayrolls={filteredPayrollsSafe}
                            isLoading={props.isLoading}
                            formatHours={formatHours}
                            formatCurrency={formatCurrency}
                            getStatusBadge={getStatusBadge}
                            handlePay={handlePay}
                            handleView={handleView}
                        />
                    </Table>
                </div>
            </Card>

            <GeneratePayrollModal
                isModalOpen={isModalOpen}
                setIsModalOpen={setIsModalOpen}
                modalYear={modalYear}
                setModalYear={setModalYear}
                modalMonth={modalMonth}
                setModalMonth={setModalMonth}
                message={message}
                setMessage={setMessage}
                handleGeneratePayroll={handleGeneratePayroll}
                isSubmitting={props.isSubmitting}
            />

            <ViewPayrollModal
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                payroll={selectedPayroll}
                formatHours={formatHours}
                formatCurrency={formatCurrency}
                getStatusBadge={getStatusBadge}
                exportPayslip={props.exportPayslip}
            />
        </div>
    );
}
