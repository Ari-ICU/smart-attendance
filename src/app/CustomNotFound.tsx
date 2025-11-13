// src/app/CustomNotFound.tsx (client component)
'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react'; // Use lucide-react icon for the link
import { useSearchParams } from 'next/navigation';

export default function CustomNotFound() {
    const searchParams = useSearchParams();
    const errorCode = searchParams?.get('error'); // Example usage of useSearchParams

    return (
        <div className="text-center p-8 max-w-md mx-auto">
            <h1 className="text-4xl font-bold text-red-600 mb-4">404 - Page Not Found</h1>
            <p className="text-gray-600 mb-4">
                {errorCode ? `Error: ${errorCode}` : 'Sorry, this page doesn\'t exist.'}
            </p>
            <Link href="/" className="inline-flex items-center gap-2 text-blue-500 hover:underline">
                <ArrowLeft className="w-4 h-4" />
                Go Home
            </Link>
        </div>
    );
}