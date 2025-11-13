'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import Webcam from 'react-webcam';
import * as faceapi from 'face-api.js';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Camera, CameraOff, CheckCircle2, AlertCircle, Loader2, UserPlus, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { useAttendance } from '@/hooks/attendance.hook';
import { useAttendanceSettings } from '@/hooks/AttendanceSettings';

interface Employee {
    name: string;
}

interface AttendanceRecord {
    employee?: Employee;
    faceMatchScore?: number;
    status?: string;
    time?: string;
    checkInTime?: string;
    checkOutTime?: string | null;
}

interface AttendanceResponse {
    success: boolean;
    record?: AttendanceRecord;
    bestDistance?: number;
    message?: string;
    reason?: string;
}

const defaultCooldownMs = 3000;
const DETECTION_INTERVAL = 1000;
const TIME_UPDATE_INTERVAL = 30000;
const POLLING_DEBOUNCE = 100;

// Memoized helper to convert 24-hour time to 12-hour with AM/PM
const formatTo12Hour = (time24: string): string => {
    const [hStr, mStr] = time24.split(':');
    const h = parseInt(hStr, 10);
    const m = parseInt(mStr, 10);
    const period = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 === 0 ? 12 : h % 12;
    return `${hour12.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${period}`;
};

export function LiveCameraView() {
    const [isActive, setIsActive] = useState(false);
    const [recognizedUser, setRecognizedUser] = useState<string | null>(null);
    const [currentTime, setCurrentTime] = useState<string | null>(null);
    const [confirmationImage, setConfirmationImage] = useState<string | null>(null);
    const [isModelLoaded, setIsModelLoaded] = useState(false);
    const [lastDetectedTime, setLastDetectedTime] = useState<number>(0);
    const [hasRecentlyMarked, setHasRecentlyMarked] = useState(false);
    const [isMarking, setIsMarking] = useState(false);
    const [detectionWarning, setDetectionWarning] = useState<string | null>(null);
    const [attendanceType, setAttendanceType] = useState<'check-in' | 'check-out' | null>(null);
    const [isLate, setIsLate] = useState(false);
    const [isAllowedTime, setIsAllowedTime] = useState(true);
    const [checkInTimeDisplay, setCheckInTimeDisplay] = useState<string | null>(null);
    const [isLoadingSettings, setIsLoadingSettings] = useState(true);

    const webcamRef = useRef<Webcam>(null);
    const detectionTimerRef = useRef<NodeJS.Timeout | null>(null);
    const cooldownTimerRef = useRef<NodeJS.Timeout | null>(null);
    const allowedTimeTimerRef = useRef<NodeJS.Timeout | null>(null);

    const { createAttendance, isSubmitting } = useAttendance();
    const { settings: attendanceSettings, fetchAttendanceSettings } = useAttendanceSettings();

    // Memoized settings extraction
    const settingsTimes = useMemo(() => {
        if (!attendanceSettings) return { checkInTime: '09:00', lateTime: '09:30', checkOutTime: '17:00' };
        return {
            checkInTime: attendanceSettings.checkInTime || '09:00',
            lateTime: attendanceSettings.lateTime || '09:30',
            checkOutTime: attendanceSettings.checkOutTime || '17:00',
        };
    }, [attendanceSettings]);

    // Memoized formatted times
    const formattedTimes = useMemo(() => ({
        checkInFormatted: formatTo12Hour(settingsTimes.checkInTime),
        lateFormatted: formatTo12Hour(settingsTimes.lateTime),
        checkOutFormatted: formatTo12Hour(settingsTimes.checkOutTime),
    }), [settingsTimes]);

    // Fetch attendance settings once
    useEffect(() => {
        let mounted = true;
        const loadSettings = async () => {
            await fetchAttendanceSettings();
            if (mounted) setIsLoadingSettings(false);
        };
        loadSettings();
        return () => { mounted = false; };
    }, [fetchAttendanceSettings]);

    // Load face-api models once
    useEffect(() => {
        let mounted = true;
        const loadModels = async () => {
            try {
                await Promise.all([
                    faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
                    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
                    faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
                ]);
                if (mounted) {
                    setIsModelLoaded(true);
                    toast.success('Face recognition models loaded');
                }
            } catch (err) {
                if (mounted) {
                    const message = err instanceof Error ? err.message : String(err);
                    toast.error(`Failed to load models: ${message}`);
                }
            }
        };
        loadModels();
        return () => { mounted = false; };
    }, []);

    // Memoized time calculation helpers
    const minutesSinceMidnight = useCallback((timeStr: string): number => {
        const [h, m] = timeStr.split(':').map(Number);
        return h * 60 + m;
    }, []);

    const getCurrentMinutes = useCallback((): number => {
        const now = new Date();
        const formatter = new Intl.DateTimeFormat('en-US', {
            timeZone: 'Asia/Phnom_Penh',
            hour: 'numeric',
            minute: 'numeric',
            hour12: false
        });
        const parts = formatter.formatToParts(now);
        const hour = parseInt(parts.find((p) => p.type === 'hour')?.value || '0');
        const minute = parseInt(parts.find((p) => p.type === 'minute')?.value || '0');
        return hour * 60 + minute;
    }, []);

    // Determine if attendance is allowed based on checkInTime and lateTime
    useEffect(() => {
        if (isLoadingSettings || !attendanceSettings) return;

        const updateAllowedTime = () => {
            const { checkInTime, lateTime, checkOutTime } = settingsTimes;
            const currentMinutes = getCurrentMinutes();
            const checkInMinutes = minutesSinceMidnight(checkInTime);
            const lateMinutes = minutesSinceMidnight(lateTime);
            const checkOutMinutes = minutesSinceMidnight(checkOutTime);

            const allowed =
                (currentMinutes >= checkInMinutes && currentMinutes <= lateMinutes) ||
                (currentMinutes >= checkOutMinutes);

            setIsAllowedTime(allowed);
        };

        updateAllowedTime();
        allowedTimeTimerRef.current = setInterval(updateAllowedTime, TIME_UPDATE_INTERVAL);
        return () => {
            if (allowedTimeTimerRef.current) clearInterval(allowedTimeTimerRef.current);
        };
    }, [attendanceSettings, getCurrentMinutes, minutesSinceMidnight, settingsTimes, isLoadingSettings]);

    // Clear all timers on unmount
    useEffect(() => {
        return () => {
            if (detectionTimerRef.current) clearInterval(detectionTimerRef.current);
            if (cooldownTimerRef.current) clearTimeout(cooldownTimerRef.current);
            if (allowedTimeTimerRef.current) clearInterval(allowedTimeTimerRef.current);
        };
    }, []);

    // Optimized state reset function
    const resetAttendanceState = useCallback(() => {
        setRecognizedUser(null);
        setCurrentTime(null);
        setCheckInTimeDisplay(null);
        setConfirmationImage(null);
        setAttendanceType(null);
        setIsLate(false);
        setHasRecentlyMarked(false);
        setIsMarking(false);
    }, []);

    // Toggle camera with cleanup
    const handleToggleCamera = useCallback(() => {
        setIsActive(prev => {
            const newState = !prev;
            if (prev) {
                resetAttendanceState();
                setDetectionWarning(null);
                toast.info('Camera deactivated');
            } else {
                toast.success('Camera activated');
            }
            return newState;
        });
    }, [resetAttendanceState]);

    // Helper: Determine type and times from response
    const getAttendanceDetailsFromResponse = useCallback((attendanceResponse: AttendanceResponse, frontendType: 'check-in' | 'check-out', isLateCheckIn: boolean,) => {
        const record = attendanceResponse.record;
        let finalType = frontendType;
        let finalLate = isLateCheckIn;
        let finalCheckInTime = null;

        if (record?.checkOutTime) {
            finalType = 'check-out';
            finalCheckInTime = record.checkInTime || record.time || null;
        } else if (record?.checkInTime && !record.checkOutTime) {
            finalType = 'check-in';
            finalCheckInTime = record.checkInTime || record.time || null;
        }

        return { type: finalType, late: finalLate, checkInTime: finalCheckInTime };
    }, []);

    // Auto-mark attendance
    const handleAutoMark = useCallback(async () => {
        if (isLoadingSettings || !isAllowedTime) {
            const { checkInFormatted, lateFormatted, checkOutFormatted } = formattedTimes;
            toast.warning(`Attendance not allowed now. Try during check-in (${checkInFormatted}–${lateFormatted}) or after ${checkOutFormatted}.`);
            return;
        }
        if (isMarking || hasRecentlyMarked) return;

        const { checkInTime, checkOutTime, lateTime } = settingsTimes;
        const checkInMinutes = minutesSinceMidnight(checkInTime);
        const checkOutMinutes = minutesSinceMidnight(checkOutTime);
        const lateMinutes = minutesSinceMidnight(lateTime);
        const currentMinutes = getCurrentMinutes();

        const isCheckInWindow = currentMinutes >= checkInMinutes && currentMinutes <= lateMinutes;
        const isCheckOutWindow = currentMinutes >= checkOutMinutes;

        if (!isCheckInWindow && !isCheckOutWindow) {
            const { checkInFormatted, lateFormatted, checkOutFormatted } = formattedTimes;
            toast.warning(`Auto-mark allowed only during check-in (${checkInFormatted}–${lateFormatted}) or after ${checkOutFormatted}.`);
            return;
        }

        const frontendType = isCheckInWindow ? 'check-in' : 'check-out';
        const isLateCheckIn = isCheckInWindow && currentMinutes > checkInMinutes;

        try {
            setIsMarking(true);
            const attendanceResult = await createAttendance('');
            const attendanceResponse: AttendanceResponse = (attendanceResult && typeof attendanceResult === 'object' && 'success' in attendanceResult)
                ? attendanceResult as AttendanceResponse
                : { success: true, record: attendanceResult as AttendanceRecord };

            if (!attendanceResponse?.success) {
                toast.warning(`Auto-mark failed: ${attendanceResponse?.message || 'Unknown error'}`);
                setIsMarking(false);
                return;
            }

            const record = attendanceResponse.record;
            const employeeName = record?.employee?.name || 'Auto-Marked Staff';
            const { type: finalType, late: finalLate, checkInTime: finalCheckInTime } = getAttendanceDetailsFromResponse(attendanceResponse, frontendType, isLateCheckIn);

            setIsLate(finalLate);
            setAttendanceType(finalType);
            setRecognizedUser(employeeName);
            setCheckInTimeDisplay(finalCheckInTime);

            const now = new Date();
            setCurrentTime(now.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true, timeZone: 'Asia/Phnom_Penh' }));

            setConfirmationImage(null);
            setHasRecentlyMarked(true);

            toast.success(
                <div className="flex items-center gap-2">
                    <UserPlus className="w-4 h-4" />
                    <span>Auto attendance marked for {employeeName} ({finalType}{finalLate ? ' - Late' : ''}{finalType === 'check-out' ? ' - Completed' : ''})</span>
                </div>
            );

            cooldownTimerRef.current = setTimeout(() => {
                resetAttendanceState();
            }, defaultCooldownMs);
        } catch (err) {
            toast.error(`Failed to auto-mark: ${err instanceof Error ? err.message : String(err)}`);
            setIsMarking(false);
        }
    }, [isAllowedTime, isMarking, hasRecentlyMarked, createAttendance, settingsTimes, minutesSinceMidnight, getCurrentMinutes, getAttendanceDetailsFromResponse, isLoadingSettings, formattedTimes, resetAttendanceState]);

    // Face detection with debouncing
    const detectAndMarkAttendance = useCallback(async () => {
        if (!isActive || !isModelLoaded || !webcamRef.current || hasRecentlyMarked || isMarking || isLoadingSettings) return;

        const { checkInTime, checkOutTime, lateTime } = settingsTimes;
        const currentMinutes = getCurrentMinutes();
        const checkInMinutes = minutesSinceMidnight(checkInTime);
        const lateMinutes = minutesSinceMidnight(lateTime);
        const checkOutMinutes = minutesSinceMidnight(checkOutTime);

        let frontendType: 'check-in' | 'check-out' = 'check-in';
        let isLateCheckIn = false;

        if (currentMinutes >= checkInMinutes && currentMinutes <= lateMinutes) {
            frontendType = 'check-in';
            isLateCheckIn = currentMinutes > checkInMinutes;
        } else if (currentMinutes >= checkOutMinutes) {
            frontendType = 'check-out';
        } else {
            const { checkInFormatted, lateFormatted, checkOutFormatted } = formattedTimes;
            setDetectionWarning(
                `Attendance not allowed at this time. Check-in: ${checkInFormatted}–${lateFormatted}, Check-out: after ${checkOutFormatted}`
            );
            return;
        }

        const nowMs = Date.now();
        if (nowMs - lastDetectedTime < POLLING_DEBOUNCE) return;
        setLastDetectedTime(nowMs);

        const image = webcamRef.current.getScreenshot();
        if (!image) {
            setDetectionWarning('No camera input detected. Please check your camera.');
            return;
        }

        setIsMarking(true);
        setDetectionWarning(null);

        try {
            const img = await faceapi.fetchImage(image);
            const detections = await faceapi.detectAllFaces(img, new faceapi.TinyFaceDetectorOptions());

            if (detections.length !== 1) {
                setDetectionWarning(detections.length === 0 ? 'No face detected.' : 'Multiple faces detected.');
                setIsMarking(false);
                return;
            }

            const imageBase64 = image.replace(/^data:image\/\w+;base64,/, '');
            const attendanceResult = await createAttendance(imageBase64);
            const attendanceResponse: AttendanceResponse =
                typeof attendanceResult === 'object' && 'success' in attendanceResult
                    ? (attendanceResult as AttendanceResponse)
                    : { success: true, record: attendanceResult as AttendanceRecord };

            if (!attendanceResponse?.success || !attendanceResponse.record?.employee?.name) {
                setDetectionWarning(
                    attendanceResponse.message || 'No match found. Please ensure your face is registered and try again.'
                );
                toast.warning(
                    attendanceResponse.message || 'Face not recognized — please ensure your face is registered.'
                );
                setIsMarking(false);
                return;
            }


            const record = attendanceResponse.record;
            const employeeName = record?.employee?.name;
            const { type: finalType, late: finalLate, checkInTime: finalCheckInTime } = getAttendanceDetailsFromResponse(attendanceResponse, frontendType, isLateCheckIn);

            setRecognizedUser(employeeName ?? null);
            setAttendanceType(finalType);
            setIsLate(finalLate);
            setCheckInTimeDisplay(finalCheckInTime);

            const now = new Date();
            setCurrentTime(now.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: 'numeric',
                hour12: true,
                timeZone: 'Asia/Phnom_Penh',
            }));

            setConfirmationImage(image);
            setHasRecentlyMarked(true);

            toast.success(
                <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Attendance marked for {employeeName} ({finalType}{finalLate ? ' - Late' : ''}{finalType === 'check-out' ? ' - Completed' : ''})</span>
                </div>
            );

            cooldownTimerRef.current = setTimeout(() => {
                resetAttendanceState();
            }, defaultCooldownMs);

        } catch (err) {
            toast.error(`Failed to record attendance: ${err instanceof Error ? err.message : String(err)}`);
            setIsMarking(false);
        }
    }, [
        isActive,
        isModelLoaded,
        hasRecentlyMarked,
        isMarking,
        lastDetectedTime,
        settingsTimes,
        getCurrentMinutes,
        minutesSinceMidnight,
        getAttendanceDetailsFromResponse,
        isLoadingSettings,
        formattedTimes,
        createAttendance,
        resetAttendanceState
    ]);

    // Run detection with optimized interval
    useEffect(() => {
        if (!isActive || !isModelLoaded) return;

        detectionTimerRef.current = setInterval(detectAndMarkAttendance, DETECTION_INTERVAL);
        return () => {
            if (detectionTimerRef.current) clearInterval(detectionTimerRef.current);
        };
    }, [isActive, isModelLoaded, detectAndMarkAttendance]);

    // Memoized video content
    const videoContent = useMemo(() => {
        if (hasRecentlyMarked && confirmationImage) {
            return <img src={confirmationImage} className="w-full h-full object-cover" alt="Confirmed attendance frame" />;
        }
        return (
            <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                className="w-full h-full object-cover rounded-lg"
            />
        );
    }, [hasRecentlyMarked, confirmationImage]);

    // Memoized time display
    const timeDisplay = useMemo(() => {
        if (checkInTimeDisplay && attendanceType === 'check-out') {
            return `${checkInTimeDisplay} → ${currentTime}`;
        }
        return currentTime;
    }, [checkInTimeDisplay, attendanceType, currentTime]);

    const isCheckOut = attendanceType === 'check-out';

    return (
        <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Live Face Verification</h3>
                <Badge variant={isActive ? 'default' : 'secondary'}>
                    {isActive ? (hasRecentlyMarked ? 'Paused' : 'Active') : 'Inactive'}
                </Badge>
            </div>

            <div className="aspect-video bg-black rounded-lg mb-4 relative overflow-hidden">
                {isActive ? (
                    <>
                        {videoContent}

                        {isLoadingSettings ? (
                            <div className="absolute inset-0 bg-black/70 flex items-center justify-center text-white">
                                <Loader2 className="w-8 h-8 animate-spin mr-2" />
                                <span>Loading attendance settings...</span>
                            </div>
                        ) : !isAllowedTime ? (
                            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-center text-white p-4">
                                <AlertCircle className="w-10 h-10 mb-2 text-yellow-400" />
                                <p className="text-sm font-medium">
                                    Face scanning disabled outside allowed attendance times.
                                </p>
                                <p className="text-xs text-gray-300">
                                    Check-in: {formattedTimes.checkInFormatted} - {formattedTimes.lateFormatted}<br />
                                    Check-out: after {formattedTimes.checkOutFormatted}
                                </p>
                            </div>
                        ) : null}

                        {isAllowedTime && !hasRecentlyMarked && !isLoadingSettings && (
                            <div
                                className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 aspect-square h-[85%] rounded-lg border-4 transition-all duration-300 ease-in-out
                                ${isMarking ? 'border-yellow-500/50 animate-pulse' : 'border-white/50'}`}
                            />
                        )}

                        {isMarking && (
                            <div className="absolute top-4 left-4 bg-blue-500 text-white px-3 py-1 rounded text-xs flex items-center gap-1">
                                <Loader2 className="w-3 h-3 animate-spin" />
                                <span>Verifying...</span>
                            </div>
                        )}

                        {hasRecentlyMarked && (
                            <div className={`absolute inset-0 flex items-center justify-center rounded-lg transition-all duration-300 ${isCheckOut ? 'bg-green-500/20' : 'bg-black/30'}`}>
                                <CheckCircle2 className={`w-24 h-24 ${isCheckOut ? 'text-green-400 animate-bounce' : 'text-green-500 animate-bounce'}`} />
                            </div>
                        )}

                        {detectionWarning && isAllowedTime && !hasRecentlyMarked && !isLoadingSettings && (
                            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-yellow-500/90 text-black px-4 py-2 rounded-full text-xs max-w-[90%] text-center flex items-center gap-1 shadow-lg">
                                <AlertCircle className="w-3 h-3" />
                                {detectionWarning}
                            </div>
                        )}
                    </>
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
                        <CameraOff className="w-16 h-16 mb-4" />
                        <p>Camera is off</p>
                    </div>
                )}
            </div>

            <div className="space-y-3">
                <Button
                    className="w-full"
                    onClick={handleToggleCamera}
                    variant={isActive ? 'destructive' : 'default'}
                    disabled={isSubmitting || isMarking || hasRecentlyMarked}
                >
                    {isActive ? (
                        <>
                            {isSubmitting || isMarking ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <CameraOff className="w-4 h-4 mr-2" />
                            )}
                            {isSubmitting || isMarking
                                ? 'Processing...'
                                : hasRecentlyMarked
                                    ? `Paused - Wait ${defaultCooldownMs / 1000}s`
                                    : 'Stop Camera'}
                        </>
                    ) : (
                        <>
                            <Camera className="w-4 h-4 mr-2" />
                            Start Camera
                        </>
                    )}
                </Button>

                <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleAutoMark}
                    disabled={isSubmitting || isMarking || hasRecentlyMarked || isLoadingSettings}
                >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Auto Mark (No Face Scan)
                </Button>

                {recognizedUser && currentTime && (
                    <div
                        className={`p-4 border rounded-lg flex items-center gap-3 transition-all duration-300 ${isCheckOut
                            ? 'bg-green-500/10 border-green-500/20'
                            : isLate
                                ? 'bg-yellow-500/10 border-yellow-500/20'
                                : 'bg-green-500/10 border-green-500/20'
                            }`}
                    >
                        <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${isCheckOut
                                ? 'bg-green-500'
                                : isLate
                                    ? 'bg-yellow-500'
                                    : 'bg-green-500'
                                }`}
                        >
                            {isCheckOut ? <Clock className="w-5 h-5 text-white" /> : <CheckCircle2 className="w-5 h-5 text-white" />}
                        </div>
                        <div>
                            <p className="text-sm font-medium">
                                {isCheckOut ? 'Day Completed' : 'Attendance Marked'} ({attendanceType}{isLate ? ' - Late' : ''}{isCheckOut ? ' - Completed' : ''})
                            </p>
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                                {recognizedUser} {timeDisplay ? <span>{timeDisplay}</span> : <span>at {currentTime}</span>}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </Card>
    );
}