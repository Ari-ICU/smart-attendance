'use client';

import { User } from '@/types/users';

export function UserSummary({ users }: { users: User[] }) {
const totalUsers = users.length;
const activeUsers = users.filter(u => u.status === 'active').length;
const inactiveUsers = users.filter(u => u.status !== 'active').length;

return (
    <div className="mt-6 flex items-center justify-between text-sm text-muted-foreground">
        <p>Showing {totalUsers} users in total</p>
        <div className="flex gap-4">
            <span>Active: {activeUsers}</span>
            <span>Inactive: {inactiveUsers}</span>
        </div>
    </div>
);
}
