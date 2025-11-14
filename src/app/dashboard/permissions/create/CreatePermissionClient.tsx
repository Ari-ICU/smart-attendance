// src/app/dashboard/permissions/create/CreatePermissionClient.tsx
'use client';

import { useDashboardPage } from "@/hooks/useDashboardPage";
import { useRequests } from "@/hooks/request.hook";
import RequestForm from "@/components/request/RequestForm";

type RequestData = {
    user: string;
    department: string;
    type: string;
    date: string;
    reason: string;
};

export default function CreatePermissionClient() {
    const { setPage } = useDashboardPage();
    const { createRequest } = useRequests();

    const handleSubmit = async (data: RequestData) => {
        try {
            await createRequest(data);
            // After creating, redirect back to All Requests page
            setPage("permissions/all");
        } catch (error) {
            console.error("Failed to create permission request:", error);
            // Optionally show error toast or message
        }
    };

    const handleCancel = () => {
        setPage("permissions/all");
    };

    // Define the types of requests available
    const requestTypes = ["dayoff", "staff_registration"];

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