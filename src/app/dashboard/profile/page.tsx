'use client';

import Profile from '@/components/profile/ProfileViews';

export default function ProfilePage() {
    return (
        <div className="max-w-3xl mx-auto p-6">
            <h1 className="text-2xl font-semibold text-gray-800 mb-6">My Profile</h1>
            <Profile />
        </div>
    );
}
