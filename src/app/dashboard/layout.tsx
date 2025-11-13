'use client';

import { useState, useEffect, useLayoutEffect, useRef } from "react";
// Removed dynamic import for Next.js/React components
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/context/AuthContext';
import { useDashboardPage } from "@/hooks/useDashboardPage";
import dynamic from "next/dynamic";

import Header from "@/common/Header";

// Static imports for all dashboard page components
import Sidebar from "@/common/Sidebar";

const DashboardPage = dynamic(() => import("./page"), { ssr: false });
const AttendancePage = dynamic(() => import("./attendance/page"), { ssr: false });
const UsersPage = dynamic(() => import("./users/page"), { ssr: false });
const CreateUserPage = dynamic(() => import("./users/[type]/page"), { ssr: false });
const PayrollPage = dynamic(() => import("./payroll/page"), { ssr: false });
const SettingsPage = dynamic(() => import("./settings/page"), { ssr: false });
const PermissionsTypePage = dynamic(() => import("./permissions/[type]/page"), { ssr: false });
const DepartmentPage = dynamic(() => import("./department/page"), { ssr: false });
const ProfilePage = dynamic(() => import("./profile/page"), { ssr: false });


export default function DashboardLayout() {
    const { page: currentPage, setPage } = useDashboardPage();
    const { isAuthenticated, isLoading, error } = useAuthContext();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const router = useRouter();
    const hasInitializedRef = useRef(false);

    // ---------------------------
    // Pre-render guard
    // ---------------------------
    useLayoutEffect(() => {
        if (isLoading || hasInitializedRef.current) return;

        if (!isAuthenticated) {
            // Delay redirect until auth initialization is complete
            router.replace('/auth/login?page=login');
        }

        hasInitializedRef.current = true;
    }, [isLoading, isAuthenticated, router]);

    // ---------------------------
    // Post-render: Set default page
    // ---------------------------
    useEffect(() => {
        if (isLoading || !hasInitializedRef.current) return;
        if (!isAuthenticated) return;

        if (!currentPage) setPage('dashboard');
    }, [isLoading, isAuthenticated, currentPage, setPage]);

    // ---------------------------
    // Loading / Error fallback
    // ---------------------------
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-tr from-blue-50 via-white to-indigo-100 relative overflow-hidden">
                {/* Glass card */}
                <div className="backdrop-blur-md bg-white/40 p-8 rounded-2xl shadow-xl border border-white/30 flex flex-col items-center space-y-6">
                    {/* Animated spinner */}
                    <div className="relative w-14 h-14">
                        <div className="absolute inset-0 border-4 border-transparent border-t-indigo-500 border-r-indigo-400 rounded-full animate-spin"></div>
                        <div className="absolute inset-2 bg-white rounded-full shadow-inner"></div>
                    </div>

                    {/* Animated title */}
                    <h2 className="text-xl font-semibold text-gray-700 animate-pulse">
                        Preparing your experience...
                    </h2>

                    {/* Small description */}
                    <p className="text-sm text-gray-500 text-center max-w-xs">
                        This won’t take long — making sure everything is ready for you.
                    </p>
                </div>

                {/* Background glow effect */}
                <div className="absolute w-64 h-64 bg-indigo-400/30 blur-3xl rounded-full top-1/3 left-1/4 animate-[pulseGlow_4s_ease-in-out_infinite]" />
                <div className="absolute w-80 h-80 bg-blue-300/30 blur-3xl rounded-full bottom-1/3 right-1/4 animate-[pulseGlow_5s_ease-in-out_infinite]" />

                <style jsx>{`
                @keyframes pulseGlow {
                    0%, 100% { opacity: 0.4; transform: scale(1); }
                    50% { opacity: 0.7; transform: scale(1.1); }
                }
            `}</style>
            </div>
        );
    }


    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-red-50 to-rose-100 text-gray-700 relative overflow-hidden">
                {/* Error card */}
                <div className="backdrop-blur-md bg-white/60 p-8 rounded-2xl shadow-xl border border-white/30 flex flex-col items-center space-y-5">
                    {/* Icon */}
                    <div className="w-14 h-14 flex items-center justify-center bg-red-100 text-red-500 rounded-full shadow-inner">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-8 w-8"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 9v4m0 4h.01M10.29 3.86l-7.18 12.42A2 2 0 005 19h14a2 2 0 001.71-2.72L13.53 3.86a2 2 0 00-3.24 0z"
                            />
                        </svg>
                    </div>

                    {/* Error text */}
                    <h2 className="text-xl font-semibold text-gray-800">Something went wrong</h2>
                    <p className="text-sm text-gray-600 text-center max-w-md">
                        {typeof error === "string" ? error : "An unexpected error occurred. Please try again."}
                    </p>

                    {/* Retry button (optional) */}
                    <button
                        onClick={() => window.location.reload()}
                        className="px-5 py-2 bg-red-500 text-white rounded-lg font-medium shadow-md hover:bg-red-600 transition"
                    >
                        Retry
                    </button>
                </div>

                {/* Background glow effects */}
                <div className="absolute w-64 h-64 bg-red-300/40 blur-3xl rounded-full top-1/4 left-1/3 animate-[pulseGlow_4s_ease-in-out_infinite]" />
                <div className="absolute w-72 h-72 bg-rose-300/30 blur-3xl rounded-full bottom-1/3 right-1/4 animate-[pulseGlow_5s_ease-in-out_infinite]" />

                <style jsx>{`
                @keyframes pulseGlow {
                    0%, 100% { opacity: 0.4; transform: scale(1); }
                    50% { opacity: 0.7; transform: scale(1.1); }
                }
            `}</style>
            </div>
        );
    }


    if (!isAuthenticated) {
        // Don't render protected content until auth confirmed
        return null;
    }

    // ---------------------------
    // Main layout
    // ---------------------------
    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            <div className="flex flex-col flex-1 overflow-hidden">
                <Header onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
                <main className="flex-1 p-6 overflow-auto ">
                    {currentPage === "dashboard" && <DashboardPage />}
                    {currentPage === "attendance" && <AttendancePage />}
                    {currentPage === "users" && <UsersPage />}
                    {(currentPage === "users/create" || currentPage?.startsWith("users/edit")) && <CreateUserPage />}
                    {currentPage === "payroll" && <PayrollPage />}
                    {currentPage === "department" && <DepartmentPage />}
                    {currentPage === "profiles" && <ProfilePage />}
                    {currentPage === "settings" && <SettingsPage />}
                    {currentPage?.startsWith("permissions") && <PermissionsTypePage />}

                    {/* Fallback for invalid pages */}
                    {currentPage && ![
                        "dashboard", "attendance", "users", "users/create", "payroll",
                        "department", "profiles", "settings", "permissions"
                    ].some(p => currentPage.startsWith(p)) && (
                        <div className="text-center text-gray-500">
                            Invalid page.{" "}
                            <button
                                onClick={() => setPage('dashboard')}
                                className="text-blue-600 underline"
                            >
                                Go to Dashboard
                            </button>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}