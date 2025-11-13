'use client';

import { Link } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

export default function CustomNotFound() {
    const searchParams = useSearchParams(); // This is the hook causing the error
    const errorCode = searchParams?.get('error'); // Example usage

    return (
        <div className="text-center p-8 max-w-md mx-auto">
            <h1 className="text-4xl font-bold text-red-600 mb-4">404 - Page Not Found</h1>
            <p className="text-gray-600 mb-4">
                {errorCode ? `Error: ${errorCode}` : 'Sorry, this page doesn\'t exist.'}
            </p>
            <Link href="/" className="text-blue-500 hover:underline">Go Home</Link>
        </div>
    );
}