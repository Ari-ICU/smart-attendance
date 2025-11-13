'use client';

import { Card } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { AttendanceSummary } from './AttendanceSummary';
import { AttendanceRecord } from '@/types/attendance';
import { Users as AttendanceIcon } from 'lucide-react';
import { Button } from '../ui/button';

interface Props {
    filteredAttendance: AttendanceRecord[];
    error?: boolean;
    fetchAttendances?: () => void;
    lateTime?: string; // optional prop to define late time threshold
}

export function AttendanceTable({ filteredAttendance, error, fetchAttendances, lateTime = '09:15' }: Props) {
    const getStatusBadge = (status?: string) => {
        const normalized = status?.trim().toLowerCase();
        const variants = {
            present: 'bg-green-500/10 text-green-700 dark:text-green-400',
            absent: 'bg-red-500/10 text-red-700 dark:text-red-400',
            late: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
            completed: 'bg-blue-500/10 text-blue-700 dark:text-blue-400', // ✅ Added
        };
        return (
            <Badge variant="secondary" className={variants[normalized as keyof typeof variants] || variants.present}>
                {status ? status.charAt(0).toUpperCase() + status.slice(1) : ''}
            </Badge>
        );
    };



    const parseTimeToMinutes = (time: string): number => {
        const t = time.trim().toUpperCase();
        const match = t.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/);
        if (!match) return NaN;
        let hours = parseInt(match[1], 10);
        const minutes = parseInt(match[2], 10);
        const ampm = match[3];
        if (ampm === 'PM' && hours < 12) hours += 12;
        if (ampm === 'AM' && hours === 12) hours = 0;
        return hours * 60 + minutes;
    };

    const calculateWorkMinutes = (checkIn?: string, checkOut?: string): number => {
        if (!checkIn || !checkOut) return NaN;
        const start = parseTimeToMinutes(checkIn);
        const end = parseTimeToMinutes(checkOut);
        if (isNaN(start) || isNaN(end)) return NaN;
        let diff = end - start;
        if (diff < 0) diff += 24 * 60; // overnight
        return diff;
    };

    const formatMinutes = (minutes: number): string => {
        if (isNaN(minutes)) return '-';
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        return `${h}h ${m}m`;
    };

    const calculateWorkHour = (checkIn?: string, checkOut?: string) => {
        return formatMinutes(calculateWorkMinutes(checkIn, checkOut));
    };

    const calculateOT = (checkIn?: string, checkOut?: string) => {
        const totalMinutes = calculateWorkMinutes(checkIn, checkOut);
        if (isNaN(totalMinutes)) return '-';
        const ot = totalMinutes - 8 * 60;
        return ot > 0 ? formatMinutes(ot) : '-';
    };

    const getCheckInStatus = (checkIn?: string) => {
        if (!checkIn) return 'Absent';
        const checkInMinutes = parseTimeToMinutes(checkIn);
        const lateMinutes = parseTimeToMinutes(lateTime);
        if (isNaN(checkInMinutes)) return 'Absent';
        return checkInMinutes <= lateMinutes ? 'On time' : 'Late';
    };

    const getCheckInBadge = (checkIn?: string) => {
        const status = getCheckInStatus(checkIn);
        const variants = {
            'On time': 'bg-green-500/10 text-green-700 dark:text-green-400',
            Late: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
            Absent: 'bg-red-500/10 text-red-700 dark:text-red-400',
        };
        return <Badge variant="secondary" className={variants[status]}>{status}</Badge>;
    };

    return (
        <div className="space-y-8 relative min-h-screen bg-gradient-to-br from-background to-muted/50">
            <Card className="border-0 shadow-sm px-4">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Index</TableHead><TableHead>Name</TableHead><TableHead>Employee ID</TableHead>
                                <TableHead>Department</TableHead><TableHead>Date</TableHead><TableHead>Check-in</TableHead>
                                <TableHead>Check-out</TableHead><TableHead>Check-in Status</TableHead><TableHead>Status</TableHead>
                                <TableHead>Work Hour</TableHead><TableHead>OT</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {error ? (
                                <TableRow>
                                    <TableCell colSpan={11} className="h-24 text-center">
                                        <AttendanceIcon className="mx-auto w-12 h-12 text-destructive mb-4" />
                                        Failed to load attendance records.
                                        {fetchAttendances && <Button onClick={fetchAttendances} className="mt-4" variant="destructive">Retry</Button>}
                                    </TableCell>
                                </TableRow>
                            ) : filteredAttendance.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={11} className="h-24 text-center">
                                        <AttendanceIcon className="mx-auto w-12 h-12 text-muted-foreground mb-4" />
                                        No attendance records found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredAttendance.map((record, idx) => (
                                    <TableRow key={record.id ?? `attendance-${idx}`}>
                                        <TableCell>{idx + 1}</TableCell><TableCell>{record.employee?.name || ''}</TableCell>
                                        <TableCell className="text-muted-foreground">{record.employee?.employeeId || ''}</TableCell>
                                        <TableCell className="text-muted-foreground">{record.employee?.department || ''}</TableCell>
                                        <TableCell className="text-muted-foreground">{record.date || ''}</TableCell>
                                        <TableCell className="text-muted-foreground">{record.checkInTime || '-'}</TableCell>
                                        <TableCell className="text-muted-foreground">{record.checkOutTime || '-'}</TableCell>
                                        <TableCell>{getCheckInBadge(record.checkInTime)}</TableCell>
                                        <TableCell>{getStatusBadge(record.status)}</TableCell>
                                        <TableCell className="text-muted-foreground">{calculateWorkHour(record.checkInTime, record.checkOutTime)}</TableCell>
                                        <TableCell className="text-muted-foreground font-medium text-blue-600 dark:text-blue-400">{calculateOT(record.checkInTime, record.checkOutTime)}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {filteredAttendance.length > 0 && <AttendanceSummary filteredAttendance={filteredAttendance} />}
            </Card>
        </div>
    );
}
