// lib/api/apiUrl.ts
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const BASE_URL = {
    AUTH_API: {
        REGISTER: `${API_BASE_URL}/auth/register`,   // optional if you implement registration
        LOGIN: `${API_BASE_URL}/auth/login`,
        REFRESH: `${API_BASE_URL}/auth/refresh-token`, // updated to match backend route
        LOGOUT: `${API_BASE_URL}/auth/logout`,
        GET_ME: `${API_BASE_URL}/auth/profile`,
    },
    USER_API: {
        CREATE_USER: `${API_BASE_URL}/users`,
        GET_USERS: `${API_BASE_URL}/users`,
        GET_USER: (id: string) => `${API_BASE_URL}/users/${id}`,
        UPDATE_USER: (id: string) => `${API_BASE_URL}/users/${id}`,
        DELETE_USER: (id: string) => `${API_BASE_URL}/users/${id}`,
    },
    ATTENDANCE_API: {
        CREATE_ATTENDANCE: `${API_BASE_URL}/attendances`,
        GET_ATTENDANCES: `${API_BASE_URL}/attendances`,
    },
    DEPARTMENT_API: {
        CREATE_DEPARTMENT: `${API_BASE_URL}/departments`,
        GET_DEPARTMENTS: `${API_BASE_URL}/departments`,
        GET_DEPARTMENT: (id: string) => `${API_BASE_URL}/departments/${id}`,
        UPDATE_DEPARTMENT: (id: string) => `${API_BASE_URL}/departments/${id}`,
        DELETE_DEPARTMENT: (id: string) => `${API_BASE_URL}/departments/${id}`,
    },
    ATTENDANCE_SETTINGS_API: {
        GET_ATTENDANCE_SETTINGS: `${API_BASE_URL}/attendance-settings`,
        UPDATE_ATTENDANCE_SETTINGS: `${API_BASE_URL}/attendance-settings`,
        VALIDATE_CHECKIN: `${API_BASE_URL}/attendance-settings/validate-checkin`,
        VALIDATE_CHECKOUT: `${API_BASE_URL}/attendance-settings/validate-checkout`,
        VALIDATE_ATTENDANCE: `${API_BASE_URL}/attendance-settings/validate-attendance`, // ✅ NEW: For combined logic
    },
    TAX_SETTINGS_API: {
        GET_TAX_SETTINGS: `${API_BASE_URL}/tax-settings`,
        UPDATE_TAX_SETTINGS: `${API_BASE_URL}/tax-settings`,
        CREATE_TAX_SETTINGS: `${API_BASE_URL}/tax-settings`, // Optional, if needed for initial creation
    },
    PAYROLL_API: {
        GENERATE: `${API_BASE_URL}/payroll/generate`,             // POST
        GET_ALL: `${API_BASE_URL}/payroll`,                      // GET with optional ?year=&month=
        GET_BY_EMPLOYEE: (id: string) => `${API_BASE_URL}/payroll/${id}`, // GET
        UPDATE_STATUS: (id: string) => `${API_BASE_URL}/payroll/${id}/status`, // PUT
        EXPORT_PAYSLIP: (id: string) => `${API_BASE_URL}/payroll/${id}/payslip`, // GET PDF
    },
};