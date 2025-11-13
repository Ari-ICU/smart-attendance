'use client';

import { useState, useRef, useEffect } from 'react';
import { Menu, User, Bell, LogOut } from 'lucide-react';
import { useDashboardPage } from '@/hooks/useDashboardPage';
import { useAuthContext } from '@/context/AuthContext';

interface HeaderProps {
    onMenuToggle: () => void;
}

export default function Header({ onMenuToggle }: HeaderProps) {
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const { setPage } = useDashboardPage();
    const { user, logout, isAuthenticated, isLoading } = useAuthContext(); // ✅ access auth state

    const handleProfile = () => {
        setPage('profiles');
        setUserMenuOpen(false);
    };

    const handleLogout = async () => {
        try {
            await logout(); // ✅ logout using auth hook
            setPage('login');
        } catch (err) {
            console.error('[Header] Logout failed:', err);
        } finally {
            setUserMenuOpen(false);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setUserMenuOpen(false);
            }
        };

        if (userMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [userMenuOpen]);

    return (
        <header className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
            <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
                {/* Left: Mobile Menu Button + Logo */}
                <div className="flex items-center gap-3">
                    <button
                        className="p-2 text-gray-500 hover:text-gray-700 rounded-md md:hidden"
                        onClick={onMenuToggle}
                        aria-label="Toggle Menu"
                    >
                        <Menu size={22} />
                    </button>
                    <button
                        onClick={() => setPage('dashboard')}
                        className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition"
                    >
                        Smart Attendance
                    </button>
                </div>

                {/* Right: Icons */}
                <div className="flex items-center gap-4 relative">
                    {/* Notifications */}
                    <button className="relative p-2 text-gray-500 hover:text-gray-700 rounded-full">
                        <Bell size={20} />
                        <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
                    </button>

                    {/* User Menu */}
                    <div className="relative">
                        <button
                            onClick={() => setUserMenuOpen(!userMenuOpen)}
                            className="flex items-center gap-2 p-2 rounded-full hover:bg-gray-100 transition"
                            disabled={isLoading}
                        >
                            <User size={20} />
                            <span className="hidden sm:block text-sm font-medium text-gray-700">
                                {isLoading ? 'Loading...' : isAuthenticated ? user?.name || 'User' : 'Guest'}
                            </span>
                        </button>

                        {userMenuOpen && (
                            <div
                                ref={menuRef}
                                className="absolute right-0 mt-2 w-44 bg-white border border-gray-100 rounded-md shadow-md py-1 z-50"
                            >
                                {isAuthenticated ? (
                                    <>
                                        <button
                                            onClick={handleProfile}
                                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                                        >
                                            <User size={16} className="mr-2" /> View Profile
                                        </button>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                                        >
                                            <LogOut size={16} className="mr-2" /> Logout
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={() => setPage('login')}
                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                                    >
                                        <User size={16} className="mr-2" /> Login
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
