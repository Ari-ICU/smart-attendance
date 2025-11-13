// src/app/not-found.tsx (server component - no 'use client')
import { Suspense } from 'react';
import CustomNotFound from './CustomNotFound'; 

// ✅ Force dynamic rendering to bypass prerender issues with useSearchParams in error pages
export const dynamic = 'force-dynamic';

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <Suspense fallback={<div className="text-center p-8">Loading error details...</div>}>
                <CustomNotFound />
            </Suspense>
        </div>
    );
}