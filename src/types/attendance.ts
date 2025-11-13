import { User } from './users';

export type AttendanceRecord = {
    id: string;                       // Unique attendance record ID
    _id?: string;                     // Backend _id for compatibility
    employee: User | null;            // Can be null if no match was found
    date: string;                     // Formatted date string
    time: string;  
    checkInTime: string;
    checkOutTime: string;                   // Formatted time string
    faceMatchScore?: number;          // Confidence score from face recognition (0 to 1)
    bestDistance?: number;            // Optional closest distance if no match found
    status: 'present' | 'absent' | 'late'; // Attendance status
};

export interface AttendanceApiResponse {
    success: boolean;
    data?: AttendanceRecord;
    message?: string;
    reason?: string;
    bestDistance?: number;
    bestUser?: any;
}