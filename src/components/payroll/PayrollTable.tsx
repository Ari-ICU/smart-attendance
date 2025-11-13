'use client';
import { useState, useMemo } from 'react';
import { Card } from '../ui/card';
import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { DollarSign, Download, Calendar, X, Search } from 'lucide-react';
import { toast } from 'sonner';
import { EmployeePayroll } from '@/types/payroll';
import { Dispatch, SetStateAction } from 'react';
import { useDepartments } from '@/hooks/department.hook'; // Adjust path as needed
import { Department } from '@/types/department'; // Adjust path as needed

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
    generatePayroll: (year: number, month: number, department?: string) => Promise<EmployeePayroll[]>;
    updatePayrollStatus: (payrollId: string, status: 'pending' | 'processed' | 'paid') => Promise<EmployeePayroll>;
    exportPayslip: (id: string) => void;
}

const PayrollHeader = () => (
    <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Payroll Management</h2>
        <p className="text-muted-foreground">Manage employee payroll and payments</p>
    </div>
);

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

const PayrollFilters = ({
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

interface PayrollStatsProps {
    filteredPayrolls: EmployeePayroll[];
}

const PayrollStats = ({ filteredPayrolls }: PayrollStatsProps) => {
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

interface PayrollTableRowsProps {
    filteredPayrolls: EmployeePayroll[];
    isLoading: boolean;
    formatHours: (hours?: number) => string;
    formatCurrency: (value?: number) => string;
    getStatusBadge: (status: 'pending' | 'processed' | 'paid') => JSX.Element;
    handlePay: (id: string) => void;
    handleView: (payroll: EmployeePayroll) => void;
}

const PayrollTableRows = ({
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

interface GeneratePayrollModalProps {
    isModalOpen: boolean;
    setIsModalOpen: Dispatch<SetStateAction<boolean>>;
    modalYear: number | '';
    setModalYear: Dispatch<SetStateAction<number | ''>>;
    modalMonth: number | '';
    setModalMonth: Dispatch<SetStateAction<number | ''>>;
    modalDepartment: string;
    setModalDepartment: Dispatch<SetStateAction<string>>;
    departmentNames: string[];
    message: string;
    setMessage: Dispatch<SetStateAction<string>>;
    handleGeneratePayroll: (e: React.FormEvent) => void;
    isSubmitting: boolean;
}

const GeneratePayrollModal = ({
    isModalOpen,
    setIsModalOpen,
    modalYear,
    setModalYear,
    modalMonth,
    setModalMonth,
    modalDepartment,
    setModalDepartment,
    departmentNames,
    message,
    setMessage,
    handleGeneratePayroll,
    isSubmitting,
}: GeneratePayrollModalProps) => {
    if (!isModalOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <Card className="w-full max-w-md p-6 relative border">
                <button
                    className="absolute top-3 right-3 rounded-full p-1 hover:bg-muted transition-colors"
                    onClick={() => setIsModalOpen(false)}
                >
                    <X className="w-5 h-5" />
                </button>
                <div className="mb-6">
                    <h3 className="text-xl font-semibold">Generate Payroll</h3>
                    <p className="text-muted-foreground text-sm">Create payroll for a specific month by department or all staff</p>
                </div>
                <form className="space-y-4" onSubmit={handleGeneratePayroll}>
                    {message && (
                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-700 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-400">
                            {message}
                        </div>
                    )}
                    <div className="flex gap-2">
                        <Input
                            type="number"
                            placeholder="Year (e.g., 2025)"
                            value={modalYear}
                            onChange={(e) => setModalYear(e.target.value ? parseInt(e.target.value, 10) : '')}
                            required
                        />
                        <Input
                            type="number"
                            placeholder="Month (1-12)"
                            min={1}
                            max={12}
                            value={modalMonth}
                            onChange={(e) => setModalMonth(e.target.value ? parseInt(e.target.value, 10) : '')}
                            required
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-2 block">Department (Select All for all staff)</label>
                        <Select value={modalDepartment} onValueChange={setModalDepartment}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select department" />
                            </SelectTrigger>
                            <SelectContent>
                                {departmentNames.map((dept) => (
                                    <SelectItem key={dept} value={dept}>
                                        {dept}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex gap-3 pt-2">
                        <Button type="submit" variant="default" className="flex-1 bg-primary hover:bg-primary/90" disabled={isSubmitting}>
                            {isSubmitting ? 'Generating...' : 'Generate Payroll'}
                        </Button>
                        <Button type="button" variant="outline" className="flex-1" onClick={() => setIsModalOpen(false)}>
                            Cancel
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

interface ViewPayrollModalProps {
    isOpen: boolean;
    onClose: () => void;
    payroll: EmployeePayroll | null;
    formatHours: (hours?: number) => string;
    formatCurrency: (value?: number) => string;
    getStatusBadge: (status: 'pending' | 'processed' | 'paid') => JSX.Element;
    exportPayslip: (id: string) => void;
}

const ViewPayrollModal = ({
    isOpen,
    onClose,
    payroll,
    formatHours,
    formatCurrency,
    getStatusBadge,
    exportPayslip,
}: ViewPayrollModalProps) => {
    if (!isOpen || !payroll) return null;
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
                            <div className="flex justify-between py-1">
                                <span>Gross Pay</span>
                                <span>{formatCurrency(payroll.grossPay)}</span>
                            </div>
                            <div className="flex justify-between py-1">
                                <span className="text-green-600">Overtime Pay</span>
                                <span className="text-green-600 font-medium">{formatCurrency(payroll.overtimePay)}</span>
                            </div>
                        </div>
                    </div>
                    <div>
                        <h4 className="font-medium mb-2">Deductions</h4>
                        <div className="flex justify-between py-1">
                            <span>Total Deductions</span>
                            <span className="text-red-500 font-medium">{formatCurrency(payroll.deductions)}</span>
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

export function PayrollTable(props: PayrollTableProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedPayroll, setSelectedPayroll] = useState<EmployeePayroll | null>(null);
    const [message, setMessage] = useState('');
    const [modalYear, setModalYear] = useState<number | ''>(props.year);
    const [modalMonth, setModalMonth] = useState<number | ''>(props.month);
    const [modalDepartment, setModalDepartment] = useState('All');

    const { departments: allDepartments } = useDepartments();

    const departmentNames = useMemo(
        () => ['All', ...allDepartments.map((d: Department) => d.name)],
        [allDepartments]
    );

    const formatHours = (hours?: number) => {
        const totalMinutes = Math.round((hours ?? 0) * 60);
        const hh = Math.floor(totalMinutes / 60);
        const mm = totalMinutes % 60;
        return `${hh}h ${mm}m`;
    };

    const formatCurrency = (value?: number) =>
        (value ?? 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' });

    const getStatusBadge = (status: 'pending' | 'processed' | 'paid') => {
        const variants = {
            pending: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:border-yellow-800 dark:text-yellow-400',
            processed: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-400',
            paid: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:border-green-800 dark:text-green-400',
        };
        return <Badge className={`border ${variants[status]}`}>{status}</Badge>;
    };

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
        const department = modalDepartment === 'All' ? undefined : modalDepartment;
        const existingPayrolls = payrolls.filter(p => p.year === modalYear && p.month === modalMonth);
        if (department) {
            if (existingPayrolls.some(p => p.user?.department === department)) {
                setMessage(`Payroll already exists for ${department} in ${modalMonth}/${modalYear}`);
                return;
            }
        } else {
            if (existingPayrolls.length > 0) {
                setMessage(`Payroll already exists for ${modalMonth}/${modalYear}`);
                return;
            }
        }
        try {
            await generatePayroll(modalYear, modalMonth, department);
            const deptText = department ? ` for ${department}` : ' for all staff';
            toast.success(`Payroll generated${deptText} for ${modalMonth}/${modalYear}`);
            await fetchPayrolls();
            setIsModalOpen(false);
            setModalYear('');
            setModalMonth('');
            setModalDepartment('All');
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
            await handlePay(p._id);
        }
    };

    const handleDownload = () => {
        props.filteredPayrolls.forEach(p => props.exportPayslip(p._id.toString()));
    };

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
                filteredPayrolls={props.filteredPayrolls}
            />
            <PayrollStats filteredPayrolls={props.filteredPayrolls} />
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
                            filteredPayrolls={props.filteredPayrolls}
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
                modalDepartment={modalDepartment}
                setModalDepartment={setModalDepartment}
                departmentNames={departmentNames}
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