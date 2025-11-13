'use client';

import { Suspense } from "react";
import { DepartmentTable } from "@/components/department/DepartmentTable";

export default function DepartmentPage() {
    return (
        <Suspense fallback={<p>Loading departments...</p>}>
            <DepartmentTable />
        </Suspense>
    );
}
