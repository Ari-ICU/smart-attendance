import { useState, useCallback, useMemo } from "react";
import { createAttendance as createAttendanceService, getAttendances as getAttendancesService } from "@/service/attendance.service";
import { AttendanceRecord } from "@/types/attendance";
import { toast } from "sonner";
import { AttendanceApiResponse } from "@/types/attendance"; // Assuming you add this to types

export const useAttendance = () => {
    const [attendances, setAttendances] = useState<AttendanceRecord[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(false); // Added for fetch loading
    const [error, setError] = useState<string | null>(null);

    const fetchAttendances = useCallback(async () => {
        setIsLoading(true); // Start loading
        setError(null);
        try {
            const data = await getAttendancesService();
            setAttendances(data);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err);
            setError(message);
            setAttendances([]); // Clear attendances on error
            toast.error(`Failed to fetch attendances: ${message}`);
        } finally {
            setIsLoading(false); // End loading
        }
    }, []);

    const createAttendance = useCallback(async (imageBase64: string): Promise<AttendanceApiResponse> => {
        setIsSubmitting(true);
        setError(null);
        try {
            const response = await createAttendanceService({ imageBase64 });
            if (response.success && response.data) {
                // Map _id to id if needed
                const mappedRecord = {
                    ...response.data,
                    id: response.data._id || response.data.id,
                    // Ensure employee is set
                    employee: response.data.employee || null
                };
                setAttendances(prev => [mappedRecord, ...prev]);
                if (mappedRecord?.employee?.name) {
                    toast.success(`Attendance marked for ${mappedRecord.employee.name}`);
                }
            } else {
                toast.error(response.message || 'Failed to mark attendance');
            }
            return response;
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err);
            setError(message);
            toast.error(`Failed to mark attendance: ${message}`);
            throw err; // Re-throw to allow caller to handle
        } finally {
            setIsSubmitting(false);
        }
    }, []);

    return useMemo(() => ({
        attendances,
        isSubmitting,
        isLoading, // Exposed
        error,
        fetchAttendances,
        createAttendance
    }), [attendances, isSubmitting, isLoading, error, fetchAttendances, createAttendance]);
};