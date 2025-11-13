// src/service/PayrollService.ts
import api, { getAccessToken } from "@/lib/axiosInstance";
import { EmployeePayroll } from "@/types/payroll"; // Make sure this matches your updated interface

interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

/**
 * Generate payroll for a specific month
 */
export const generatePayroll = async (year: number, month: number): Promise<EmployeePayroll[]> => {
    try {
        const token = getAccessToken();
        const response = await api.post<ApiResponse<EmployeePayroll[]>>(
            "/payroll/generate",
            { year, month },
            { headers: { Authorization: token ? `Bearer ${token}` : "" } }
        );
        return response.data.data;
    } catch (err) {
        const message = err instanceof Error ? err.message : JSON.stringify(err);
        console.error("Error in generatePayroll:", message);
        throw new Error(message);
    }
};

/**
 * Get all payrolls, optionally filtered by year/month
 */
export const getPayrolls = async (year?: number, month?: number): Promise<EmployeePayroll[]> => {
    try {
        const token = getAccessToken();
        const params: any = {};
        if (year) params.year = year;
        if (month) params.month = month;

        const response = await api.get<ApiResponse<EmployeePayroll[]>>(
            "/payroll",
            { headers: { Authorization: token ? `Bearer ${token}` : "" }, params }
        );
        return response.data.data;
    } catch (err) {
        const message = err instanceof Error ? err.message : JSON.stringify(err);
        console.error("Error in getPayrolls:", message);
        throw new Error(message);
    }
};

/**
 * Get payroll for a specific employee
 */
export const getPayrollByEmployee = async (
    employeeId: string,
    year?: number,
    month?: number
): Promise<EmployeePayroll> => {
    try {
        const token = getAccessToken();
        const params: any = {};
        if (year) params.year = year;
        if (month) params.month = month;

        const response = await api.get<ApiResponse<EmployeePayroll>>(
            `/payroll/${employeeId}`,
            { headers: { Authorization: token ? `Bearer ${token}` : "" }, params }
        );
        return response.data.data;
    } catch (err) {
        const message = err instanceof Error ? err.message : JSON.stringify(err);
        console.error("Error in getPayrollByEmployee:", message);
        throw new Error(message);
    }
};

/**
 * Update payroll status (e.g., mark as paid)
 */
export const updatePayrollStatus = async (payrollId: string, status: 'pending' | 'processed' | 'paid'): Promise<EmployeePayroll> => {
    try {
        const token = getAccessToken();
        const response = await api.put<ApiResponse<EmployeePayroll>>(
            `/payroll/${payrollId}/status`,
            { status },
            { headers: { Authorization: token ? `Bearer ${token}` : "" } }
        );
        return response.data.data;
    } catch (err) {
        const message = err instanceof Error ? err.message : JSON.stringify(err);
        console.error("Error in updatePayrollStatus:", message);
        throw new Error(message);
    }
};

/**
 * Export payroll as payslip PDF
 * Returns blob or file URL depending on backend implementation
 */
export const exportPayslip = async (payrollId: string): Promise<Blob> => {
    try {
        const token = getAccessToken();
        const response = await api.get<Blob>(
            `/payroll/${payrollId}/payslip`,
            { headers: { Authorization: token ? `Bearer ${token}` : "" }, responseType: 'blob' }
        );
        return response.data;
    } catch (err) {
        const message = err instanceof Error ? err.message : JSON.stringify(err);
        console.error("Error in exportPayslip:", message);
        throw new Error(message);
    }
};
