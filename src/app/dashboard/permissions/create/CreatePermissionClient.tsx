// src/app/dashboard/permissions/create/CreatePermissionClient.tsx
'use client';

import { useDashboardPage } from "@/hooks/useDashboardPage";
import RequestForm from "@/components/request/RequestForm";

export default function CreatePermissionClient() {
    const { setPage } = useDashboardPage();

    const handleSubmit = (data: { type: string; date: string; reason: string }) => {
        // TODO: Replace this with real API call
        console.log("New permission request submitted:", data);

        // After creating, redirect back to All Requests page
        setPage("permissions/all");
    };

    const handleCancel = () => {
        setPage("permissions/all");
    };

    // Define the types of requests available
    const requestTypes = ["dayoff", "employee"];

    return (
        <div className="p-6 max-w-md mx-auto">
            <RequestForm
                types={requestTypes}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
            />
        </div>
    );
}