import { Suspense } from "react";
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RecentAttendance } from '@/components/RecentAttendance';
import { Users, UserCheck, UserX, TrendingUp } from 'lucide-react';
import { LiveCameraView } from '@/components/LiveCameraView';

// ✅ Force dynamic rendering to bypass prerender issues with useSearchParams in child components
export const dynamic = 'force-dynamic';

const stats = [
    {
        title: 'Total Users',
        value: '248',
        icon: Users,
        trend: '+12%',
        color: 'text-blue-500'
    },
    {
        title: 'Present Today',
        value: '187',
        icon: UserCheck,
        trend: '+5%',
        color: 'text-green-500'
    },
    {
        title: 'Absent Today',
        value: '61',
        icon: UserX,
        trend: '-3%',
        color: 'text-red-500'
    },
    {
        title: 'Attendance Rate',
        value: '75.4%',
        icon: TrendingUp,
        trend: '+2.1%',
        color: 'text-purple-500'
    },
];

export default function DashboardPage() {
    return (
        <div className="p-6 space-y-6">
            <div>
                <h2 className="text-2xl mb-1">Dashboard</h2>
                <p className="text-muted-foreground">Welcome back! Here your attendance overview.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <Card key={stat.title} className="p-6">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                                    <p className="text-2xl mb-2">{stat.value}</p>
                                    <Badge variant="secondary" className="text-xs">
                                        {stat.trend} from last week
                                    </Badge>
                                </div>
                                <div className={`p-3 rounded-lg bg-muted ${stat.color}`}>
                                    <Icon className="w-6 h-6" />
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>
            {/* Main Content Grid - Wrapped in Suspense for useSearchParams in children */}
            <Suspense fallback={<div className="animate-pulse grid grid-cols-1 lg:grid-cols-2 gap-6 h-64"><div className="h-full bg-gray-200 rounded-lg"></div><div className="h-full bg-gray-200 rounded-lg"></div></div>}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Live Camera */}
                    <LiveCameraView />
                    
                    {/* Recent Attendance */}
                    <RecentAttendance />
                </div>
            </Suspense>
        </div>
    );
}