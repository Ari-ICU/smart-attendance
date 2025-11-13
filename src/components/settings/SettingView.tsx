'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Save } from 'lucide-react';
import { toast } from 'sonner';
import { useTheme } from '@/context/ThemeProvider';
import { useAttendanceSettings } from '@/hooks/AttendanceSettings';
import { useTaxSettings } from '@/hooks/tax.hook'; // ✅ Import tax hook

import { AppearanceSettings } from './AppearanceSettings';
import { NotificationSettings } from './NotificationSettings';
import { CameraSettings } from './CameraSettings';
import AttendanceTimeSettings from './AttendanceTimeSettings';
import { SecurityDataSettings } from './SecurityDataSettings';
import { SystemInformation } from './SystemInformation';

// ✅ Import TaxSettings component and its type
import { TaxSettings, TaxSettingsData } from './TaxSettings';

const SETTINGS_KEY = 'attendance-settings';
const SYSTEM_INFO_KEY = 'system-info';

export function SettingsView() {
    const { theme, toggleTheme } = useTheme();
    const { settings: attendanceSettings, fetchAttendanceSettings, updateAttendanceSettings, isLoading: attendanceLoading } = useAttendanceSettings();
    const { settings: taxSettings, fetchTaxSettings, updateTaxSettings, isLoading: taxLoading, isSubmitting: taxSubmitting } = useTaxSettings(); // ✅ Use tax hook

    // ✅ Local state for attendance-related settings
    const [localSettings, setLocalSettings] = useState({
        notifications: true,
        autoCapture: false,
        faceDetection: true,
        dataBackup: true,
        checkInTime: '09:00',
        checkOutTime: '17:00',
        lateTime: '09:15',
    });

    // ✅ Local state for tax settings (loaded from hook)
    const [localTaxSettings, setLocalTaxSettings] = useState<TaxSettingsData>({
        taxPercentage: 10,
        incomeTax: 0,
        healthInsurance: 0,
        otherDeductions: 0,
        overtimeRate: 0,
    });

    const [systemInfo, setSystemInfo] = useState({
        version: 'v1.0.0',
        lastUpdated: '2025-11-07',
        databaseStatus: 'Connected',
    });

    const loadedRef = useRef(false);

    useEffect(() => {
        const savedSettings = localStorage.getItem(SETTINGS_KEY);
        const savedSystemInfo = localStorage.getItem(SYSTEM_INFO_KEY);
        if (savedSettings) setLocalSettings(JSON.parse(savedSettings));
        if (savedSystemInfo) setSystemInfo(JSON.parse(savedSystemInfo));
        if (!loadedRef.current) {
            fetchAttendanceSettings();
            fetchTaxSettings(); // ✅ Fetch tax settings
            loadedRef.current = true;
        }
    }, [fetchAttendanceSettings, fetchTaxSettings]);

    useEffect(() => {
        if (attendanceSettings) {
            setLocalSettings(prev => ({
                ...prev,
                checkInTime: attendanceSettings.checkInTime || '09:00',
                checkOutTime: attendanceSettings.checkOutTime || '17:00',
                lateTime: attendanceSettings.lateTime || '09:15',
            }));
        }
    }, [attendanceSettings]);

    // ✅ Update local tax settings when hook updates
    useEffect(() => {
        if (taxSettings) {
            setLocalTaxSettings({
                taxPercentage: taxSettings.taxPercentage || 10,
                incomeTax: taxSettings.incomeTax || 0,
                healthInsurance: taxSettings.healthInsurance || 0,
                otherDeductions: taxSettings.otherDeductions || 0,
                overtimeRate: taxSettings.overtimeRate || 0,
            });
        }
    }, [taxSettings]);

    const handleSave = async () => {
        try {
            // Save local settings to localStorage
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(localSettings));
            localStorage.setItem(SYSTEM_INFO_KEY, JSON.stringify(systemInfo));
            localStorage.setItem('theme', theme);

            // Update attendance settings if changed
            if (attendanceSettings) {
                const attendancePayload = {
                    checkInTime: localSettings.checkInTime,
                    checkOutTime: localSettings.checkOutTime,
                    lateTime: localSettings.lateTime,
                };
                await updateAttendanceSettings(attendancePayload);
            }

            // Update tax settings - map null to 0 for payload
            const taxPayload = {
                taxPercentage: localTaxSettings.taxPercentage ?? 0,
                incomeTax: localTaxSettings.incomeTax ?? 0,
                healthInsurance: localTaxSettings.healthInsurance ?? 0,
                otherDeductions: localTaxSettings.otherDeductions ?? 0,
                overtimeRate: localTaxSettings.overtimeRate ?? 0,
            };
            await updateTaxSettings(taxPayload);

            toast.success('Settings saved successfully!');
        } catch (err: any) {
            toast.error('Failed to save settings');
        }
    };

    const isOverallLoading = attendanceLoading || taxLoading;

    if (isOverallLoading) return <div className="p-6">Loading settings...</div>;

    return (
        <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AppearanceSettings theme={theme} toggleTheme={toggleTheme} />
                <NotificationSettings localSettings={localSettings} setLocalSettings={setLocalSettings} />
                <CameraSettings localSettings={localSettings} setLocalSettings={setLocalSettings} />
                <SecurityDataSettings localSettings={localSettings} setLocalSettings={setLocalSettings} />

                <div className='col-span-2'>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Save className="h-4 w-4" />
                                Attendance Schedule
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <AttendanceTimeSettings
                                localSettings={localSettings}
                                setLocalSettings={setLocalSettings}
                                updateAttendanceSettings={updateAttendanceSettings}
                                isSettingsLoading={attendanceLoading}
                            />
                        </CardContent>
                    </Card>
                </div>

                {/* ✅ Tax Settings Card - Integrated with hook */}
                <div className='col-span-2'>
                    <Card>
                        <CardHeader>
                            <CardTitle>Tax & Deduction Settings</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <TaxSettings
                                localSettings={localTaxSettings}
                                setLocalSettings={setLocalTaxSettings}
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>

            <SystemInformation systemInfo={systemInfo} setSystemInfo={setSystemInfo} />

            <div className="flex justify-end">
                <Button onClick={handleSave} size="lg" className="px-8" disabled={taxSubmitting}>
                    <Save className="w-4 h-4 mr-2" /> Save Changes
                </Button>
            </div>
        </div>
    );
}