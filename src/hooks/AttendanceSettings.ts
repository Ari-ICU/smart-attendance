import { useState, useCallback, useMemo } from "react";
import {
    getAttendanceSettings as getAttendanceSettingsService,
    updateAttendanceSettings as updateAttendanceSettingsService,
    validateCheckIn as validateCheckInService,
    validateCheckOut as validateCheckOutService,
    validateAttendance as validateAttendanceService, // ✅ NEW: Import combined validation
} from "@/service/AttendanceSettings";
import { 
    AttendanceSettings, 
    UpdateAttendanceSettingsPayload, 
    CheckInValidationResponse, 
    CheckOutValidationResponse,
    AttendanceValidationResponse,
} from "@/types/attendanceSettings";
import { toast } from "sonner";

export const useAttendanceSettings = () => {
    const [settings, setSettings] = useState<AttendanceSettings | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(false); // Added for fetch loading
    const [error, setError] = useState<string | null>(null);

    const fetchAttendanceSettings = useCallback(async () => {
        setIsLoading(true); // Start loading
        setError(null);
        try {
            const data = await getAttendanceSettingsService();
            setSettings(data);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err);
            setError(message);
            setSettings(null); // Clear settings on error
            toast.error(`Failed to fetch attendance settings: ${message}`);
        } finally {
            setIsLoading(false); // End loading
        }
    }, []);

    const updateAttendanceSettings = useCallback(async (payload: UpdateAttendanceSettingsPayload) => {
        setIsSubmitting(true);
        setError(null);
        try {
            const updated = await updateAttendanceSettingsService(payload);
            if (updated) setSettings(updated);
            toast.success("Attendance settings updated successfully");
            return updated;
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err);
            setError(message);
            toast.error(`Failed to update attendance settings: ${message}`);
        } finally {
            setIsSubmitting(false);
        }
    }, []);

    const validateCheckIn = useCallback(async (): Promise<CheckInValidationResponse | null> => {
        try {
            const response = await validateCheckInService();
            if (response?.isValidCheckIn) {
                if (response.isLate) {
                    toast.warning("Valid check-in but late");
                } else {
                    toast.success("Valid check-in time");
                }
            } else {
                toast.warning("Check-in time not valid");
            }
            return response;
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err);
            toast.error(`Failed to validate check-in: ${message}`);
            throw new Error(message);
        }
    }, []);

    const validateCheckOut = useCallback(async (): Promise<CheckOutValidationResponse | null> => {
        try {
            const response = await validateCheckOutService();
            if (response?.isValidCheckOut) {
                toast.success("Valid check-out time");
            } else {
                toast.warning("Check-out time not valid");
            }
            return response;
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err);
            toast.error(`Failed to validate check-out: ${message}`);
            throw new Error(message);
        }
    }, []);

    // ✅ NEW: Combined validation - Use this in components for auto action switching (e.g., LiveCameraView)
    const validateAttendance = useCallback(async (): Promise<AttendanceValidationResponse | null> => {
        try {
            const response = await validateAttendanceService();
            const { recommendedAction, status, checkInResult, checkOutResult } = response || {};

            switch (recommendedAction) {
                case 'checkIn':
                    toast.success(status === 'late' ? "Late check-in allowed" : "Check-in time valid");
                    break;
                case 'checkOut':
                    toast.success("Check-out time valid");
                    break;
                case 'completed':
                    toast.info("Attendance already completed today");
                    break;
                case 'blocked':
                    toast.warning("Outside allowed attendance window");
                    break;
                default:
                    toast.warning("Validation unclear—check time");
            }
            return response;
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err);
            toast.error(`Failed to validate attendance: ${message}`);
            throw new Error(message);
        }
    }, []);

    return useMemo(() => ({
        settings,
        isSubmitting,
        isLoading, // Exposed
        error,
        fetchAttendanceSettings,
        updateAttendanceSettings,
        validateCheckIn,
        validateCheckOut,
        validateAttendance, // ✅ NEW: Exposed for use in components
    }), [settings, isSubmitting, isLoading, error, fetchAttendanceSettings, updateAttendanceSettings, validateCheckIn, validateCheckOut, validateAttendance]);
};