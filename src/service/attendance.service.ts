import axios from "axios";
import { AttendanceRecord } from "@/types/attendance";
import { BASE_URL } from "@/lib/api/apiUrl";

const api = axios.create({
    timeout: 60000,
    headers: { "Content-Type": "application/json" },
});

interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

interface AttendanceApiResponse {
    success: boolean;
    message?: string;
    data?: AttendanceRecord;
    reason?: string;
    bestDistance?: number;
    bestUser?: any;
    checkInTime?: string;
}

export const createAttendance = async (data: { imageBase64: string }): Promise<AttendanceApiResponse> => {
    try {
        const response = await api.post(BASE_URL.ATTENDANCE_API.CREATE_ATTENDANCE, data);
        return response.data;
    } catch (err: unknown) {
        if (axios.isAxiosError(err) && err.response?.status === 400 && err.response?.data) {
            return err.response.data as AttendanceApiResponse;
        }
        const message = err instanceof Error ? err.message : JSON.stringify(err);
        console.error("Error creating attendance:", message);
        throw new Error(message);
    }
};

export const getAttendances = async (): Promise<AttendanceRecord[]> => {
    try {
        const response = await api.get<ApiResponse<AttendanceRecord[]>>(BASE_URL.ATTENDANCE_API.GET_ATTENDANCES);
        return response.data.data || [];
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : JSON.stringify(err);
        console.error("Error fetching attendances:", message);
        throw new Error(message);
    }
};