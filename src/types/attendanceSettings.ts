// types/attendanceSettings.ts
export interface AttendanceSettings {
    _id?: string;
    checkInTime: string;
    checkOutTime: string;
    lateTime?: string;
    createdAt?: string;
    updatedAt?: string;
    taxPercentage?: number;
}

export interface CheckInValidationResponse {
    isValidCheckIn: boolean;
    isLate: boolean;
    currentTime: string;
    checkInTime: string;
    lateTime: string;
}

export interface CheckOutValidationResponse {
    isValidCheckOut: boolean;
    currentTime: string;
    checkOutTime: string;
}

export interface UpdateAttendanceSettingsPayload {
    checkInTime?: string;
    checkOutTime?: string;
    lateTime?: string;
}

// ✅ NEW: Combined response type
export interface AttendanceValidationResponse {
    currentTime: string; // 'HH:mm'
    checkInResult: {
        isValid: boolean;
        isLate: boolean;
    };
    checkOutResult: {
        isValid: boolean;
    };
    recommendedAction: 'checkIn' | 'checkOut' | 'blocked' | 'completed';
    status?: 'present' | 'late' | null;
    existingRecord: {
        hasCheckedIn: boolean;
        hasCompleted: boolean;
    } | null;
    settings: {
        checkInTime: string;
        lateTime: string;
        checkOutTime: string;
    };
}