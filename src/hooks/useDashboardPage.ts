'use client';
import { useSearchParams, useRouter } from "next/navigation";
import { useMemo } from "react";

export type DashboardPage =
    | "dashboard"
    | "attendance"
    | "users"
    | "users/create"
    | `users/edit?id=${string}`
    | "login"
    | "registers"
    | "settings"
    | "payroll"
    | "profiles"
    | "department"
    | "permissions"
    | "permissions/all"
    | "permissions/dayoff"
    | "permissions/create";

export function useDashboardPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const page = useMemo<DashboardPage | null>(() => {
        const raw = searchParams?.get("page");
        if (!raw) return null;

        if (
            [
                "dashboard",
                "attendance",
                "users",
                "users/create",
                "login",
                "registers",
                "settings",
                "payroll",
                "profiles",
                "department",
                "permissions",
                "permissions/all",
                "permissions/dayoff",
                "permissions/create",
            ].includes(raw)
        ) return raw as DashboardPage;

        if (raw.startsWith("users/edit?id=")) return raw as DashboardPage;

        return null;
    }, [searchParams]);

    const setPage = (newPage: DashboardPage) => {
        const params = new URLSearchParams();

        if (newPage === "login") {
            params.set("page", "login");
            router.push(`/auth/login?${params.toString()}`);
            return;
        }
        if (newPage === "registers") {
            params.set("page", "registers");
            router.push(`/auth/register?${params.toString()}`);
            return;
        }

        // Dashboard pages
        params.set("page", newPage);
        router.push(`/dashboard?${params.toString()}`);
    };

    return { page, setPage };
}
