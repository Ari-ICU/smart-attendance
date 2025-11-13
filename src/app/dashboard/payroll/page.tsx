import { Suspense } from "react";
import PayrollView from '@/components/payroll/PayrollViews';

// ✅ Force dynamic rendering to bypass prerender issues with useSearchParams in child components
export const dynamic = 'force-dynamic';

export default function PayrollPage() {
    return (
        <div>
            <Suspense fallback={<div className="p-6 text-center">Loading payroll...</div>}>
                <PayrollView />
            </Suspense>
        </div>
    );
}