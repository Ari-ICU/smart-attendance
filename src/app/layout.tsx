import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeProvider";
import { Toaster } from '@/components/ui/sonner';
import { LoadingProvider } from "@/context/LoadingContext";
import RouteChangeLoader from "@/common/RouteChangeLoader";
import { AuthProvider } from "@/context/AuthContext";
import { Suspense } from 'react';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Smart Attendance - Face Recognition Dashboard",
  description: "Manage attendance, users, departments, payroll, and permissions with AI-powered face recognition.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        suppressHydrationWarning // ✅ Suppresses global hydration warnings (e.g., from dates/auth)
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <LoadingProvider>
            <AuthProvider key="auth-provider"> {/* ✅ Key forces re-mount if auth changes */}
              <RouteChangeLoader />
              <Toaster />
              <Suspense fallback={<div className="min-h-screen flex items-center justify-center p-4">Loading app...</div>}>
                {children}
              </Suspense>
            </AuthProvider>
          </LoadingProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}