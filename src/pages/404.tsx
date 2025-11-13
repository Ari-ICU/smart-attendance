'use client'; // add this at the very top

import Link from 'next/link';

export default function Custom404() {
    return (
        <div className="flex flex-col items-center justify-center h-screen text-center px-4">
            <h1 className="text-5xl md:text-6xl font-extrabold mb-4 text-red-600">
                404
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-6">
                The page you are looking for does not exist.
            </p>
            <Link
                href="/"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors"
            >
                Return Home
            </Link>
        </div>
    );
}
