import { Suspense } from "react";

// ✅ Force dynamic rendering
export const dynamic = 'force-dynamic';

import CreatePermissionClient from './CreatePermissionClient'; // Child client component

export default function CreatePermissionPage() {
    return (
        <Suspense fallback={<div className="p-6 text-center">Loading form...</div>}>
            <CreatePermissionClient />
        </Suspense>
    );
}