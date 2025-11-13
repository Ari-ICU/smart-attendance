import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeProvider";
import { Toaster } from '@/components/ui/sonner';
import { LoadingProvider } from "@/context/LoadingContext";
import RouteChangeLoader from "@/common/RouteChangeLoader"; // Adjust path as needed
import { AuthProvider } from "@/context/AuthContext"; // <-- import AuthProvider

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
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <LoadingProvider>
            <AuthProvider> {/* <-- Wrap children with AuthProvider */}
              <RouteChangeLoader />
              <Toaster />
              {children}
            </AuthProvider>
          </LoadingProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
