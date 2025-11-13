'use client';

import { useState, useRef, useEffect, useMemo, useCallback, memo } from 'react';
import { Card } from './ui/card';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Clock, Loader2 } from 'lucide-react';
import { useAttendance } from '@/hooks/attendance.hook';

interface Employee {
    name: string;
    employeeId: string;
}

interface AttendanceRecord {
    id?: string;
    employee?: Employee;
    status?: string;
    time?: string;
    checkInTime?: string;
    checkOutTime?: string | null;
}

const POLLING_INTERVAL = 10000; // 10 seconds

// Memoized skeleton row component
const SkeletonRow = memo(({ index }: { index: number }) => (
    <div
        key={index}
        className="flex items-center justify-between p-3 rounded-lg border border-border animate-pulse"
    >
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-muted-foreground" />
            <div className="flex flex-col gap-1">
                <div className="h-3 w-24 bg-muted-foreground rounded" />
                <div className="h-2 w-16 bg-muted-foreground rounded" />
            </div>
        </div>
        <div className="flex flex-col gap-1 items-end">
            <div className="h-3 w-12 bg-muted-foreground rounded" />
            <div className="h-5 w-16 bg-muted-foreground rounded" />
        </div>
    </div>
));

SkeletonRow.displayName = 'SkeletonRow';

// Memoized attendance item component
const AttendanceItem = memo(({ record, index }: { record: AttendanceRecord; index: number }) => {
    const name = record.employee?.name ?? 'Unknown';
    const id = record.employee?.employeeId ?? 'N/A';
    const status = record.status ?? 'present';
    const checkInTime = record.checkInTime || record.time || '—';
    const checkOutTime = record.checkOutTime || null;
    
    const badgeConfig = useMemo(() => {
        let badgeClass = '';
        let statusSuffix = '';
        
        switch (status) {
            case 'present':
            case 'completed':
                badgeClass = 'bg-green-500/10 text-green-700 dark:text-green-400';
                if (status === 'completed') statusSuffix = ' (Completed)';
                break;
            case 'late':
                badgeClass = 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400';
                break;
            case 'absent':
                badgeClass = 'bg-red-500/10 text-red-700 dark:text-red-400';
                break;
            default:
                badgeClass = 'bg-gray-500/10 text-gray-700 dark:text-gray-400';
        }
        
        return { badgeClass, statusSuffix };
    }, [status]);

    const timeDisplay = checkOutTime 
        ? `${checkInTime} → ${checkOutTime}` 
        : checkInTime;

    const capitalizedStatus = status.charAt(0).toUpperCase() + status.slice(1);
    const initials = name.split(' ').map((n) => n[0]).join('');

    return (
        <div
            key={record.id ?? `${id}-${checkInTime}-${index}`}
            className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors duration-150 will-change-[background-color]"
        >
            <div className="flex items-center gap-3">
                <Avatar className="transition-opacity duration-150">
                    <AvatarFallback className="transition-opacity duration-150">
                        {initials}
                    </AvatarFallback>
                </Avatar>
                <div className="transition-opacity duration-150">
                    <p className="text-sm font-medium">{name}</p>
                    <p className="text-xs text-muted-foreground">{id}</p>
                </div>
            </div>
            <div className="text-right transition-opacity duration-150">
                <p className="text-sm mb-1">{timeDisplay}</p>
                <Badge
                    variant="secondary"
                    className={badgeConfig.badgeClass}
                >
                    {capitalizedStatus}{badgeConfig.statusSuffix}
                </Badge>
            </div>
        </div>
    );
});

AttendanceItem.displayName = 'AttendanceItem';

export function RecentAttendance() {
    const { attendances, isLoading, error, fetchAttendances } = useAttendance() as { 
        attendances: AttendanceRecord[]; 
        isLoading: boolean; 
        error: string | null; 
        fetchAttendances: () => void 
    };
    
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const [hasInitialData, setHasInitialData] = useState(false);
    const [isPollingUpdate, setIsPollingUpdate] = useState(false);

    // Memoized filtered attendances
    const filteredAttendances = useMemo(
        () => attendances.filter((record) => !!record.employee),
        [attendances]
    );

    // Optimized fetch with polling state
    const performFetch = useCallback(async (isPolling = false) => {
        if (isPolling) setIsPollingUpdate(true);
        try {
            await fetchAttendances();
        } finally {
            if (isPolling) {
                // Delay clearing the polling state for smooth UI
                setTimeout(() => setIsPollingUpdate(false), 300);
            }
        }
    }, [fetchAttendances]);

    // Initial fetch
    useEffect(() => {
        performFetch(false);
    }, [performFetch]);

    // Track if we have initial data
    useEffect(() => {
        if (attendances.length > 0 && !hasInitialData) {
            setHasInitialData(true);
        }
    }, [attendances.length, hasInitialData]);

    // Set up optimized polling with requestIdleCallback fallback
    useEffect(() => {
        const schedulePolling = () => {
            intervalRef.current = setInterval(() => {
                if ('requestIdleCallback' in window) {
                    requestIdleCallback(() => performFetch(true), { timeout: 2000 });
                } else {
                    performFetch(true);
                }
            }, POLLING_INTERVAL);
        };

        schedulePolling();

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [performFetch]);

    const isInitialLoading = isLoading && !hasInitialData;
    const skeletonRows = useMemo(() => Array.from({ length: 5 }, (_, i) => i), []);

    // Memoized attendance items
    const attendanceItems = useMemo(() => 
        filteredAttendances.map((record, index) => (
            <AttendanceItem key={record.id ?? `${record.employee?.employeeId}-${index}`} record={record} index={index} />
        )),
        [filteredAttendances]
    );

    if (error) {
        return (
            <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Recent Attendance</h3>
                    <Clock className="w-5 h-5 text-muted-foreground" />
                </div>
                <p className="text-sm text-destructive text-center">Error: {error}</p>
            </Card>
        );
    }

    return (
        <Card className="p-6 relative">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Recent Attendance</h3>
                <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-muted-foreground" />
                    {isPollingUpdate && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground transition-opacity duration-200">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            <span>Updating...</span>
                        </div>
                    )}
                </div>
            </div>

            <ScrollArea className="h-[400px]">
                <div className="space-y-4">
                    {isInitialLoading
                        ? skeletonRows.map((index) => (
                            <SkeletonRow key={index} index={index} />
                        ))
                        : filteredAttendances.length === 0
                            ? (
                                <p className="text-sm text-muted-foreground text-center">
                                    No attendance records found
                                </p>
                            )
                            : attendanceItems
                    }
                </div>
            </ScrollArea>

            {/* Subtle overlay during polling */}
            {isPollingUpdate && hasInitialData && (
                <div className="absolute inset-0 bg-background/40 backdrop-blur-[1px] flex items-center justify-center pointer-events-none transition-opacity duration-200 rounded-lg">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground animate-pulse opacity-60">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Refreshing...</span>
                    </div>
                </div>
            )}
        </Card>
    );
}