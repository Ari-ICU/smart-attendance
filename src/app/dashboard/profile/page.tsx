import { Suspense } from "react";
import Profile from '@/components/profile/ProfileViews';

// ✅ Force dynamic rendering to bypass prerender issues with useSearchParams in child components
export const dynamic = 'force-dynamic';

export default function ProfilePage() {
    return (
        <div className="max-w-3xl mx-auto p-6">
            <h1 className="text-2xl font-semibold text-gray-800 mb-6">My Profile</h1>
            <Suspense fallback={<div className="text-center p-4">Loading profile...</div>}>
                <Profile />
            </Suspense>
        </div>
    );
}