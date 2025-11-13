'use client';

import { AttendanceRecord } from '@/types/attendance';

interface AttendanceSummaryProps {
    filteredAttendance: AttendanceRecord[];
}

export function AttendanceSummary({ filteredAttendance }: AttendanceSummaryProps) {
    const total = filteredAttendance.length;
    const presentCount = filteredAttendance.filter(r => r.status?.toLowerCase() === 'present').length;
    const absentCount = filteredAttendance.filter(r => r.status?.toLowerCase() === 'absent').length;
    const lateCount = filteredAttendance.filter(r => r.status?.toLowerCase() === 'late').length;

    return (
        <div className="mt-6 flex items-center justify-between text-sm text-muted-foreground">
            <p>Showing {total} record{total !== 1 ? 's' : ''}</p>
            <div className="flex gap-4">
                <span>Present: {presentCount}</span>
                <span>Absent: {absentCount}</span>
                <span>Late: {lateCount}</span>
            </div>
        </div>
    );
}
