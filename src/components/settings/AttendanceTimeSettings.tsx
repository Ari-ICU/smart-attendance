'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "../ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../ui/select";
import { Clock, X, Save } from 'lucide-react';
import { toast } from 'sonner';
import { UpdateAttendanceSettingsPayload } from '@/types/attendanceSettings';

interface Props {
    localSettings: {
        checkInTime: string;
        checkOutTime: string;
        lateTime?: string;
        [k: string]: any;
    };
    setLocalSettings: React.Dispatch<React.SetStateAction<any>>;
    updateAttendanceSettings: (payload: UpdateAttendanceSettingsPayload) => Promise<any>;
    isSettingsLoading?: boolean;
}

const LOG_KEY = 'attendance-time-change-log';

export default function AttendanceTimeSettings({
    localSettings,
    setLocalSettings,
    updateAttendanceSettings,
    isSettingsLoading = false
}: Props) {
    const [dialog, setDialog] = useState<'checkIn' | 'checkOut' | 'late' | null>(null);
    const [tempHour, setTempHour] = useState(9);
    const [tempMinute, setTempMinute] = useState(0);
    const [tempPeriod, setTempPeriod] = useState<'AM' | 'PM'>('AM');

    /** ====================
     *  🕒 Helpers
     * ===================== */
    const to24Hour = useCallback((hour: number, period: 'AM' | 'PM') => {
        let h = hour % 12;
        if (period === 'PM') h += 12;
        if (period === 'AM' && hour === 12) h = 0;
        return h;
    }, []);

    const from24Hour = useCallback((time24: string) => {
        const [hStr, mStr] = time24.split(':');
        const h = Number(hStr);
        const m = Number(mStr || 0);
        const period = h >= 12 ? 'PM' : 'AM';
        const hour12 = h % 12 === 0 ? 12 : h % 12;
        return { hour: hour12, minute: m, period };
    }, []);

    const format24 = useCallback(
        (hour24: number, minute: number) =>
            `${hour24.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
        []
    );

    const format12Hour = useCallback((time24: string) => {
        const { hour, minute, period } = from24Hour(time24);
        return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} ${period}`;
    }, [from24Hour]);

    const minutesSinceMidnight = useCallback((time24: string) => {
        const [h, m] = time24.split(':').map(Number);
        return h * 60 + m;
    }, []);

    const formatDuration = useCallback((totalMinutes: number) => {
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }, []);

    const incrementLog = useCallback((type: 'checkIn' | 'checkOut' | 'late') => {
        try {
            const raw = localStorage.getItem(LOG_KEY);
            const logs = raw ? JSON.parse(raw) : { count: 0 };
            logs.count += 1;
            logs.lastType = type;
            logs.lastAt = new Date().toISOString();
            localStorage.setItem(LOG_KEY, JSON.stringify(logs));
            return logs.count;
        } catch {
            return null;
        }
    }, []);

    const getPreviewTime = useCallback(
        (hour: number, minute: number, period: 'AM' | 'PM') => {
            const hour24 = to24Hour(hour, period);
            return format12Hour(format24(hour24, minute));
        },
        [to24Hour, format24, format12Hour]
    );

    const initTempFromType = useCallback(
        (type: 'checkIn' | 'checkOut' | 'late') => {
            const sourceTime =
                type === 'checkIn'
                    ? localSettings.checkInTime || '09:00'
                    : type === 'checkOut'
                        ? localSettings.checkOutTime || '17:00'
                        : localSettings.lateTime || '09:15';
            const { hour, minute, period } = from24Hour(sourceTime);
            setTempHour(hour);
            setTempMinute(minute);
            setTempPeriod(period as 'AM' | 'PM');
        },
        [localSettings, from24Hour]
    );

    useEffect(() => {
        if (dialog) initTempFromType(dialog);
    }, [dialog, initTempFromType]);

    /** ====================
     *  🔄 Update Function
     * ===================== */
    const handleUpdateTime = async (type: 'checkIn' | 'checkOut' | 'late') => {
        const hour24 = to24Hour(tempHour, tempPeriod);
        const newTime = format24(hour24, tempMinute);

        let payload: UpdateAttendanceSettingsPayload = {};
        if (type === 'checkIn') payload.checkInTime = newTime;
        if (type === 'checkOut') payload.checkOutTime = newTime;
        if (type === 'late') payload.lateTime = newTime;

        setLocalSettings((prev: typeof localSettings) => ({ ...prev, ...payload }));

        try {
            await updateAttendanceSettings(payload);
            const count = incrementLog(type);
            toast.success(
                `${type.charAt(0).toUpperCase() + type.slice(1)} time updated — change #${count ?? 'unknown'}`
            );
        } catch {
            toast.error(`Failed to update ${type} time`);
        } finally {
            setDialog(null);
        }
    };

    /** ====================
     *  🧠 Constants
     * ===================== */
    const hours = useMemo(() => Array.from({ length: 12 }, (_, i) => i + 1), []);
    const minutes = useMemo(() => Array.from({ length: 12 }, (_, i) => i * 5), []);

    const timeConfigs = useMemo(
        () => [
            { key: 'checkIn', label: 'Check In Time', description: 'Default start time for check-in.', icon: <Clock className="h-4 w-4" /> },
            { key: 'late', label: 'Late Time', description: 'Time considered as late threshold.', icon: <Clock className="h-4 w-4 rotate-180" /> },
            { key: 'checkOut', label: 'Check Out Time', description: 'Default time for check-out.', icon: <Clock className="h-4 w-4" /> },
        ],
        []
    );

    const workHoursCalc = useMemo(() => {
        const checkIn = localSettings.checkInTime || '09:00';
        const checkOut = localSettings.checkOutTime || '17:00';
        const late = localSettings.lateTime || '09:15';

        const ciMin = minutesSinceMidnight(checkIn);
        let coMin = minutesSinceMidnight(checkOut);
        if (coMin <= ciMin) coMin += 1440; // handle next day

        const ltMin = minutesSinceMidnight(late);
        const totalWorkMinutes = coMin - ciMin;
        const graceMinutes = ltMin - ciMin;

        return {
            totalWorkHours: totalWorkMinutes >= 0 ? formatDuration(totalWorkMinutes) : 'Invalid',
            gracePeriod: graceMinutes >= 0 ? `${graceMinutes} min` : 'Invalid',
        };
    }, [localSettings, minutesSinceMidnight, formatDuration]);

    const renderTimePicker = useCallback(() => (
        <div className="flex items-center justify-center space-x-2">
            <Select value={tempHour.toString()} onValueChange={(v) => setTempHour(Number(v))}>
                <SelectTrigger className="w-[80px] h-10"><SelectValue placeholder="HH" /></SelectTrigger>
                <SelectContent>
                    {hours.map((hour) => (
                        <SelectItem key={hour} value={hour.toString()}>{hour.toString().padStart(2, '0')}</SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <span className="text-muted-foreground text-lg font-mono">:</span>

            <Select value={tempMinute.toString()} onValueChange={(v) => setTempMinute(Number(v))}>
                <SelectTrigger className="w-[80px] h-10"><SelectValue placeholder="MM" /></SelectTrigger>
                <SelectContent>
                    {minutes.map((minute) => (
                        <SelectItem key={minute} value={minute.toString()}>{minute.toString().padStart(2, '0')}</SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Select value={tempPeriod} onValueChange={(v) => setTempPeriod(v as 'AM' | 'PM')}>
                <SelectTrigger className="w-[60px] h-10"><SelectValue /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="AM">AM</SelectItem>
                    <SelectItem value="PM">PM</SelectItem>
                </SelectContent>
            </Select>
        </div>
    ), [tempHour, tempMinute, tempPeriod, hours, minutes]);

    /** ====================
     *  🧩 UI
     * ===================== */
    return (
        <div className="space-y-6">
            <Card className="w-full">
                <CardHeader className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="w-5 h-5" /> Attendance Times
                    </CardTitle>
                    <CardDescription>
                        Configure default times for check-in, late threshold, and check-out.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {timeConfigs.map(({ key, label, description, icon }) => (
                        <div key={key} className="space-y-3">
                            <Label className="text-sm font-medium">{label}</Label>
                            <Dialog open={dialog === key} onOpenChange={(o) => setDialog(o ? (key as any) : null)}>
                                <DialogTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="w-full h-12 justify-start text-left font-normal group hover:bg-accent/50"
                                        disabled={isSettingsLoading}
                                    >
                                        <div className="flex items-center justify-between w-full">
                                            <div className="flex items-center gap-2">
                                                {icon}
                                                <span className="text-sm">
                                                    {localSettings[`${key}Time`] ? format12Hour(localSettings[`${key}Time`]) : 'Not set'}
                                                </span>
                                            </div>
                                            <Clock className="h-4 w-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[425px] p-6">
                                    <DialogHeader className="space-y-2">
                                        <DialogTitle className="flex items-center gap-2">
                                            <Clock className="h-5 w-5" /> Set {label}
                                        </DialogTitle>
                                        <DialogDescription className="text-sm">
                                            Choose the default {description.toLowerCase()}
                                        </DialogDescription>
                                    </DialogHeader>

                                    <div className="space-y-4 py-4">
                                        {renderTimePicker()}
                                        <div className="p-3 bg-accent/20 rounded-lg text-center border border-accent/30">
                                            <p className="text-sm font-mono text-foreground">
                                                Preview: <span className="font-semibold">{getPreviewTime(tempHour, tempMinute, tempPeriod)}</span>
                                            </p>
                                        </div>
                                    </div>

                                    <DialogFooter className="gap-2">
                                        <Button
                                            variant="outline"
                                            onClick={() => setDialog(null)}
                                            className="flex items-center gap-2 h-10 px-4"
                                        >
                                            <X className="h-4 w-4" />
                                            Cancel
                                        </Button>
                                        <Button
                                            onClick={() => handleUpdateTime(key as 'checkIn' | 'checkOut' | 'late')}
                                            disabled={isSettingsLoading}
                                            className="flex items-center gap-2 h-10 px-4"
                                        >
                                            {isSettingsLoading ? (
                                                <>
                                                    <Clock className="h-4 w-4 animate-spin" />
                                                    Saving...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="h-4 w-4" />
                                                    Set Time
                                                </>
                                            )}
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                            <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* Work Hours Calculation Summary */}
            <Card className="w-full">
                <CardHeader className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="w-5 h-5" /> Work Hours Summary
                    </CardTitle>
                    <CardDescription>
                        Expected daily work duration and late grace period based on your settings.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">Expected Work Hours</p>
                            <p className="text-2xl font-bold text-foreground">
                                {workHoursCalc.totalWorkHours}
                            </p>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">Late Grace Period</p>
                            <p className="text-2xl font-bold text-foreground">
                                {workHoursCalc.gracePeriod}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}