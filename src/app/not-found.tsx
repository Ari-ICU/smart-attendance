// src/app/not-found.tsx (server component - no 'use client')
import { Suspense } from 'react';
import CustomNotFound from './CustomNotFound'; // Your client component with useSearchParams

export default function NotFound() {
    return (
        <html lang="en">
            <body>
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                    <Suspense fallback={<div className="text-center p-8">Loading error details...</div>}>
                        <CustomNotFound />
                    </Suspense>
                </div>
            </body>
        </html>
    );
}