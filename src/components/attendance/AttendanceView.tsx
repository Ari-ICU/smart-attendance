'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import { Card } from '../ui/card';
import { AttendanceFilters } from './AttendanceFilters';
import { AttendanceTable } from './AttendanceTable';
import { useAttendance } from '@/hooks/attendance.hook';
import { Clock } from 'lucide-react';

export function AttendanceView() {
    const { attendances, fetchAttendances } = useAttendance();
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const isMounted = useRef(true);

    useEffect(() => {
        isMounted.current = true;
        fetchAttendances().then(() => {
            if (!isMounted.current) return;
        });
        return () => {
            isMounted.current = false;
        };
    }, [fetchAttendances]);

    const filteredAttendance = useMemo(() => {
        return attendances.filter((record) => {
            const name = record.employee?.name?.toLowerCase() || '';
            const employeeId = record.employee?.employeeId?.toLowerCase() || '';

            const matchesSearch = searchQuery
                ? name.includes(searchQuery.toLowerCase()) || employeeId.includes(searchQuery.toLowerCase())
                : true;

            // ✅ Normalize status for robust filtering, including "completed"
            const recordStatus = record.status?.trim().toLowerCase() || '';
            const matchesStatus =
                statusFilter === 'all'
                    ? true
                    : recordStatus === statusFilter.toLowerCase();

            const recordDate = new Date(record.date);
            const start = startDate ? new Date(startDate) : null;
            const end = endDate ? new Date(endDate) : null;

            const matchesStartDate = start ? recordDate >= start : true;
            const matchesEndDate = end ? recordDate <= end : true;

            return matchesSearch && matchesStatus && matchesStartDate && matchesEndDate;
        });
    }, [attendances, searchQuery, statusFilter, startDate, endDate]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <Card className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 gap-4 border-0 shadow-sm">
                <div className="space-y-1 flex items-center gap-2">
                    <Clock className="w-6 h-6 text-primary" />
                    <h2 className="text-3xl font-bold tracking-tight">Attendance Records</h2>
                </div>
                <p className="text-muted-foreground text-sm">
                    View and manage attendance records in the system.
                </p>
            </Card>

            {/* Filters */}
            <AttendanceFilters
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                startDate={startDate}
                endDate={endDate}
                setStartDate={setStartDate}
                setEndDate={setEndDate}
            />

            {/* Table */}
            <AttendanceTable filteredAttendance={filteredAttendance} />
        </div>
    );
}
