import { Suspense } from 'react';
import { AttendanceView } from "@/components/attendance/AttendanceView";

export const dynamic = 'force-dynamic';

export default function AttendancePage() {
    return (
        <div className="">
            <Suspense fallback={<div className="p-6 text-center">Loading attendance...</div>}>
                <AttendanceView />
            </Suspense>
        </div>
    );
}