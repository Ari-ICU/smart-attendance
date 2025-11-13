'use client';

import { useState } from "react";
import {
    LayoutDashboard,
    ClipboardList,
    Users,
    Settings,
    Scan,
    DollarSign,
    Building2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardPage, useDashboardPage } from "@/hooks/useDashboardPage";

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
    const { page, setPage } = useDashboardPage();
    const [permissionsOpen, setPermissionsOpen] = useState(
        page?.startsWith("permissions") ?? false
    );

    const menuItems = [
        { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
        { id: "attendance", label: "Attendance", icon: ClipboardList },
        { id: "users", label: "Users", icon: Users },
        { id: "department", label: "Department", icon: Building2 },
        { id: "payroll", label: "Payroll", icon: DollarSign },
        {
            id: "permissions",
            label: "Permissions",
            icon: Users,
            subMenu: [
                { id: "permissions/all", label: "All Requests" },
                { id: "permissions/dayoff", label: "Day-Off Requests" },
            ]
        },
        { id: "settings", label: "Settings", icon: Settings },
    ];

    return (
        <>
            {/* Overlay (mobile) */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-30 md:hidden"
                    onClick={onClose}
                ></div>
            )}

            {/* Sidebar */}
            <aside
                className={`fixed md:static inset-y-0 left-0 z-40 w-64 border-r border-gray-200 transform transition-transform duration-300 ease-in-out flex flex-col
                    ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
            >
                {/* Logo */}
                <div className="p-6 border-b border-gray-200 flex items-center gap-2 flex-shrink-0">
                    <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
                        <Scan className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-lg font-semibold">Smart Attendance</h1>
                        <p className="text-xs text-gray-500">Face Recognition</p>
                    </div>
                </div>

                {/* Menu */}
                <nav className="flex-1 p-4 overflow-y-auto">
                    <ul className="space-y-2">
                        {menuItems.map((item) => {
                            const Icon = item.icon;

                            if (item.subMenu) {
                                return (
                                    <li key={item.id}>
                                        <Button
                                            variant={page?.startsWith(item.id) ? "default" : "ghost"}
                                            className="w-full justify-between"
                                            onClick={() => setPermissionsOpen(!permissionsOpen)}
                                        >
                                            <div className="flex items-center">
                                                <Icon className="w-4 h-4 mr-3" />
                                                {item.label}
                                            </div>
                                            <span>{permissionsOpen ? "▲" : "▼"}</span>
                                        </Button>

                                        {permissionsOpen && (
                                            <ul className="pl-4 mt-2 space-y-1">
                                                {item.subMenu.map((sub) => (
                                                    <li key={sub.id}>
                                                        <Button
                                                            variant={page === sub.id ? "default" : "ghost"}
                                                            className="w-full justify-start text-sm"
                                                            onClick={() => {
                                                                setPage(sub.id as DashboardPage);
                                                                onClose(); // close on mobile
                                                            }}
                                                        >
                                                            <Users className="w-3 h-3 mr-2 text-gray-500" />
                                                            {sub.label}
                                                        </Button>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </li>
                                );
                            }

                            return (
                                <li key={item.id}>
                                    <Button
                                        variant={page === item.id ? "default" : "ghost"}
                                        className="w-full justify-start"
                                        onClick={() => {
                                            setPage(item.id as DashboardPage);
                                            onClose(); // close on mobile
                                        }}
                                    >
                                        <Icon className="w-4 h-4 mr-3" />
                                        {item.label}
                                    </Button>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                {/* Footer - Pinned to bottom */}
                <div className="p-4 border-t border-gray-200 text-center text-xs text-gray-500 flex-shrink-0 mt-auto">
                    © 2025 Smart Attendance
                </div>
            </aside>
        </>
    );
}