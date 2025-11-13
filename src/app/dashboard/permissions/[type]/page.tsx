'use client';

import { useDashboardPage } from "@/hooks/useDashboardPage";
import DayOffRequests from "@/components/request/DayOffRequests";
import AllRequests from "@/components/request/AllRequests";
import CreatePermissionPage from "../create/page";

export default function PermissionTypePage() {
    const { page } = useDashboardPage();

    // Extract type from page
    const type = page?.split("/")[1] || "";

    const permissionComponents: Record<string, React.ReactNode> = {
        dayoff: <DayOffRequests />,
        all: <AllRequests   />,
        create: <CreatePermissionPage />,
        // employee: <EmployeeRequests />,
    };

    return (
        <div className="p-6">
            {permissionComponents[type] || (
                <p className="text-muted-foreground">
                    No permissions found for this type.
                </p>
            )}
        </div>
    );
}
