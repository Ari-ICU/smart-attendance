// /src/service/AttendanceSettings.ts (or wherever this lives)

import api, { getAccessToken } from "@/lib/axiosInstance";
import {
    AttendanceSettings,
    CheckInValidationResponse,
    CheckOutValidationResponse,
    UpdateAttendanceSettingsPayload,
    // ✅ NEW: Add types for combined validation
    AttendanceValidationResponse,
} from "@/types/attendanceSettings";

interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

// The return type is Promise<AttendanceSettings>, meaning we must return data or throw an error.
export const getAttendanceSettings = async (): Promise<AttendanceSettings> => {
    try {
        const token = getAccessToken();
        const response = await api.get<ApiResponse<AttendanceSettings>>(
            "/attendance-settings",
            { headers: { Authorization: token ? `Bearer ${token}` : "" } }
        );
        return response.data.data;
    } catch (err) {
        // Error handling logic moved directly into the catch block
        const message = err instanceof Error ? err.message : JSON.stringify(err);
        console.error("Error in getAttendanceSettings:", message);
        throw new Error(message); // Must re-throw the error to satisfy the return type Promise<AttendanceSettings>
    }
};

export const updateAttendanceSettings = async (
    data: UpdateAttendanceSettingsPayload
): Promise<AttendanceSettings> => {
    try {
        const token = getAccessToken();
        const response = await api.put<ApiResponse<AttendanceSettings>>(
            "/attendance-settings",
            data,
            { headers: { Authorization: token ? `Bearer ${token}` : "" } }
        );
        return response.data.data;
    } catch (err) {
        // Error handling logic moved directly into the catch block
        const message = err instanceof Error ? err.message : JSON.stringify(err);
        console.error("Error in updateAttendanceSettings:", message);
        throw new Error(message); // Must re-throw
    }
};

export const validateCheckIn = async (): Promise<CheckInValidationResponse> => {
    try {
        const token = getAccessToken();
        const response = await api.get<ApiResponse<CheckInValidationResponse>>(
            "/attendance-settings/validate-checkin",
            { headers: { Authorization: token ? `Bearer ${token}` : "" } }
        );
        return response.data.data;
    } catch (err) {
        // Error handling logic moved directly into the catch block
        const message = err instanceof Error ? err.message : JSON.stringify(err);
        console.error("Error in validateCheckIn:", message);
        throw new Error(message); // Must re-throw
    }
};

export const validateCheckOut = async (): Promise<CheckOutValidationResponse> => {
    try {
        const token = getAccessToken();
        const response = await api.get<ApiResponse<CheckOutValidationResponse>>(
            "/attendance-settings/validate-checkout",
            { headers: { Authorization: token ? `Bearer ${token}` : "" } }
        );
        return response.data.data;
    } catch (err) {
        // Error handling logic moved directly into the catch block
        const message = err instanceof Error ? err.message : JSON.stringify(err);
        console.error("Error in validateCheckOut:", message);
        throw new Error(message); // Must re-throw
    }
};

// ✅ NEW: Combined validation - Use this in components (e.g., LiveCameraView) for auto action switching
export const validateAttendance = async (): Promise<AttendanceValidationResponse> => {
    try {
        const token = getAccessToken();
        const response = await api.get<ApiResponse<AttendanceValidationResponse>>(
            "/attendance-settings/validate-attendance",
            { headers: { Authorization: token ? `Bearer ${token}` : "" } }
        );
        return response.data.data;
    } catch (err) {
        // Error handling logic moved directly into the catch block
        const message = err instanceof Error ? err.message : JSON.stringify(err);
        console.error("Error in validateAttendance:", message);
        throw new Error(message); // Must re-throw
    }
};