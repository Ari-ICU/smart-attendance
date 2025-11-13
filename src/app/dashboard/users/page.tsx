import { Suspense } from "react";
import { UsersView } from "@/components/user/UsersView";

// ✅ Force dynamic rendering to bypass prerender issues with useSearchParams in child components
export const dynamic = 'force-dynamic';

export default function UsersPage() {
    return (
        <div className="">
            <Suspense fallback={<div className="p-6 text-center">Loading users...</div>}>
                <UsersView />
            </Suspense>
        </div>
    );
}