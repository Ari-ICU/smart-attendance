'use client'; // Not needed here since this is a server component/page

import { Suspense } from "react";
import { DepartmentTable } from "@/components/department/DepartmentTable";

export default function DepartmentPage() {
    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Departments</h1>
            <Suspense 
                fallback={
                    <div className="animate-pulse space-y-4">
                        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="h-32 bg-gray-200 rounded"></div>
                            ))}
                        </div>
                    </div>
                }
            >
                <DepartmentTable />
            </Suspense>
        </div>
    );
}