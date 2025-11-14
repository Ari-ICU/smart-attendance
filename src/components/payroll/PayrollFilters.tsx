// File: components/payroll/PayrollFilters.tsx
import React from 'react';
import { Dispatch, SetStateAction } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Calendar, Download, DollarSign, Search } from 'lucide-react';
import { EmployeePayroll } from '@/types/payroll';

interface PayrollFiltersProps {
    year: number | '';
    setYear: Dispatch<SetStateAction<number | ''>>;
    month: number | '';
    setMonth: Dispatch<SetStateAction<number | ''>>;
    search: string;
    setSearch: Dispatch<SetStateAction<string>>;
    isLoading: boolean;
    setIsModalOpen: Dispatch<SetStateAction<boolean>>;
    handleDownload: () => void;
    handlePayAllPending: () => void;
    filteredPayrolls: EmployeePayroll[];
}

export const PayrollFilters = ({
    year,
    setYear,
    month,
    setMonth,
    search,
    setSearch,
    isLoading,
    setIsModalOpen,
    handleDownload,
    handlePayAllPending,
    filteredPayrolls,
}: PayrollFiltersProps) => (
    <Card className="p-4 mb-6 border-0 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                        placeholder="Search by name..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <div className="flex gap-2">
                    <Input
                        type="number"
                        placeholder="Year"
                        value={year}
                        onChange={e => setYear(e.target.value ? parseInt(e.target.value, 10) : '')}
                        className="w-[100px]"
                    />
                    <Input
                        type="number"
                        placeholder="Month"
                        min={1}
                        max={12}
                        value={month}
                        onChange={e => setMonth(e.target.value ? parseInt(e.target.value, 10) : '')}
                        className="w-[90px]"
                    />
                </div>
            </div>
            <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> Generate Payroll
                </Button>
                <Button
                    variant="outline"
                    onClick={handleDownload}
                    disabled={isLoading || filteredPayrolls.length === 0}
                    className="flex items-center gap-2"
                >
                    <Download className="w-4 h-4" /> Download Reports
                </Button>
                <Button
                    variant="default"
                    onClick={handlePayAllPending}
                    disabled={isLoading || filteredPayrolls.every(p => p.status === 'paid')}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                >
                    <DollarSign className="w-4 h-4" /> Pay All Pending
                </Button>
            </div>
        </div>
    </Card>
);