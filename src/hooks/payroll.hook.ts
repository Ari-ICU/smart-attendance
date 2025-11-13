// src/hooks/usePayroll.ts
import { useState, useCallback, useMemo } from "react";
import {
    generatePayroll as generatePayrollService,
    getPayrolls as getPayrollsService,
    getPayrollByEmployee as getPayrollByEmployeeService,
    updatePayrollStatus as updatePayrollStatusService,
    exportPayslip as exportPayslipService,
} from "@/service/payroll.service";
import { EmployeePayroll } from "@/types/payroll";
import { toast } from "sonner";

export const usePayroll = () => {
    const [payrolls, setPayrolls] = useState<EmployeePayroll[]>([]);
    const [selectedPayroll, setSelectedPayroll] = useState<EmployeePayroll | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /** Fetch all payrolls from backend (already includes hours, OT, etc.) */
    const fetchPayrolls = useCallback(async (year?: number, month?: number) => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await getPayrollsService(year, month);
            setPayrolls(data);
            return data;
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err);
            setError(message);
            toast.error(`Failed to fetch payrolls: ${message}`);
            setPayrolls([]);
            throw new Error(message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    /** Generate payroll for a month (backend calculates all totals) */
    const generatePayroll = useCallback(async (year: number, month: number) => {
        if (!year || isNaN(year)) throw new Error("Invalid year");
        if (!month || isNaN(month) || month < 1 || month > 12) throw new Error("Invalid month");

        setIsSubmitting(true);
        setError(null);
        try {
            const data = await generatePayrollService(year, month);
            setPayrolls(data);
            toast.success("Payroll generated successfully");
            return data;
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err);
            setError(message);
            toast.error(`Failed to generate payroll: ${message}`);
            throw new Error(message);
        } finally {
            setIsSubmitting(false);
        }
    }, []);

    /** Fetch payroll for a specific employee */
    const fetchPayrollByEmployee = useCallback(async (employeeId: string, year?: number, month?: number) => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await getPayrollByEmployeeService(employeeId, year, month);
            setSelectedPayroll(data);
            return data;
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err);
            setError(message);
            toast.error(`Failed to fetch payroll: ${message}`);
            setSelectedPayroll(null);
            throw new Error(message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    /** Update payroll status */
    const updatePayrollStatus = useCallback(async (payrollId: string, status: "pending" | "processed" | "paid") => {
        setIsSubmitting(true);
        setError(null);
        try {
            const updated = await updatePayrollStatusService(payrollId, status);
            setPayrolls(prev => prev.map(p => (p.id === payrollId ? updated : p)));
            toast.success(`Payroll status updated to ${status}`);
            return updated;
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err);
            setError(message);
            toast.error(`Failed to update payroll status: ${message}`);
            throw new Error(message);
        } finally {
            setIsSubmitting(false);
        }
    }, []);

    /** Export payroll payslip as PDF */
    const exportPayslip = useCallback(async (payrollId: string) => {
        setIsSubmitting(true);
        setError(null);
        try {
            const blob = await exportPayslipService(payrollId);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `payslip-${payrollId}.pdf`;
            link.click();
            window.URL.revokeObjectURL(url);
            toast.success("Payslip downloaded successfully");
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err);
            setError(message);
            toast.error(`Failed to export payslip: ${message}`);
            throw new Error(message);
        } finally {
            setIsSubmitting(false);
        }
    }, []);

    return useMemo(
        () => ({
            payrolls,
            selectedPayroll,
            isLoading,
            isSubmitting,
            error,
            fetchPayrolls,
            generatePayroll,
            fetchPayrollByEmployee,
            updatePayrollStatus,
            exportPayslip,
            setSelectedPayroll,
        }),
        [
            payrolls,
            selectedPayroll,
            isLoading,
            isSubmitting,
            error,
            fetchPayrolls,
            generatePayroll,
            fetchPayrollByEmployee,
            updatePayrollStatus,
            exportPayslip,
        ]
    );
};
