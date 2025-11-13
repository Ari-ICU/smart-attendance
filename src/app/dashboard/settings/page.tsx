import { Suspense } from "react";
import { SettingsView } from '@/components/settings/SettingView';

// ✅ Force dynamic rendering to bypass prerender issues with useSearchParams in child components
export const dynamic = 'force-dynamic';

export default function SettingsPage() {
    return (
        <div className="">
            <Suspense fallback={<div className="p-6 text-center">Loading settings...</div>}>
                <SettingsView />
            </Suspense>
        </div>
    );
}