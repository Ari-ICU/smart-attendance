'use client';

import { useLoading } from "@/context/LoadingContext";
import { Loader2, CheckCircle, Sparkles } from "lucide-react";

export default function GlobalLoading() {
    const { isLoading } = useLoading();

    if (!isLoading) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 dark:bg-black/50 backdrop-blur-md transition-all duration-700 ease-out-quint"
            aria-label="Loading Smart Attendance"
            role="status"
        >
            <div className="relative p-8 bg-white/95 dark:bg-gray-900/95 rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 flex flex-col items-center gap-8 text-center max-w-md w-full animate-in slide-in-from-bottom-4 duration-700 fade-in">

                {/* Logo with particle-like sparkle effect */}
                <div className="space-y-3 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-indigo-500/10 rounded-2xl blur animate-pulse"></div>
                    <div className="relative z-10 space-y-1">
                        <h1 className="text-5xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-400 dark:via-purple-400 dark:to-indigo-400 bg-clip-text text-transparent drop-shadow-lg">
                            Smart
                        </h1>
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 tracking-tight">
                            Attendance
                        </h2>
                    </div>
                    {/* Subtle sparkles for magic feel */}
                    <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-blue-400 opacity-60 animate-ping" />
                    <Sparkles className="absolute -bottom-2 left-4 w-5 h-5 text-purple-400 opacity-50 animate-pulse delay-500" />
                </div>

                {/* Premium multi-stage loader with trail effect */}
                <div className="relative w-20 h-20 flex items-center justify-center group">
                    <div className="absolute inset-0 rounded-full border-4 border-transparent bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur animate-spin-slow"></div>
                    <div className="absolute w-20 h-20 rounded-full border-4 border-gray-200/30 dark:border-gray-700/50 border-t-blue-600 dark:border-t-blue-400 animate-spin"></div>
                    <div className="absolute w-12 h-12 rounded-full border-4 border-transparent border-t-purple-600 dark:border-t-purple-400 animate-spin-reverse delay-200"></div>
                    <Loader2 className="w-8 h-8 text-blue-600 dark:text-blue-400 relative z-10" />
                    {/* Success tease */}
                    <CheckCircle className="absolute w-6 h-6 text-green-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-1500" />
                </div>

                <div className="space-y-4">
                    <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 leading-snug">
                        Crafting your personalized dashboard
                    </p>

                    {/* Enhanced progress dots with color gradient and stagger */}
                    <div className="flex items-center justify-center space-x-2">
                        <div className="flex space-x-1.5">
                            <span className="w-3 h-3 bg-gradient-to-t from-blue-600 to-blue-400 dark:from-blue-400 dark:to-blue-200 rounded-full animate-bounce [animation-delay:0.1s]"></span>
                            <span className="w-3 h-3 bg-gradient-to-t from-purple-600 to-purple-400 dark:from-purple-400 dark:to-purple-200 rounded-full animate-bounce [animation-delay:0.3s]"></span>
                            <span className="w-3 h-3 bg-gradient-to-t from-indigo-600 to-indigo-400 dark:from-indigo-400 dark:to-indigo-200 rounded-full animate-bounce [animation-delay:0.5s]"></span>
                        </div>
                    </div>
                </div>

                {/* Contextual tip with fade-in */}
                <div className="absolute -bottom-6 text-xs text-gray-500 dark:text-gray-400 font-medium opacity-0 animate-in fade-in delay-1000">
                    Almost there—hang tight! ✨
                </div>
            </div>
        </div>
    );
}