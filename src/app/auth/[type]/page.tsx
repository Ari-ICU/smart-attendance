'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthContext } from "@/context/AuthContext"; // <-- use context
import { useUsers } from "@/hooks/user.hook";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { User, Mail, Lock, Eye, EyeOff, Building, MapPin, Phone, IdCard, ImagePlus, Clock, Users } from "lucide-react";
import { toast } from "sonner";
import { useDashboardPage } from '@/hooks/useDashboardPage';
import Link from 'next/link';

export default function AuthPage() {
    const params = useParams();
    const { setPage } = useDashboardPage();
    const type = params?.type ?? 'login';
    const { login, register, isLoading, isAuthenticated } = useAuthContext(); // <-- use context
    const { users, loading: usersLoading } = useUsers();
    const router = useRouter();

    /** Redirect authenticated users */
    useEffect(() => {
        if (isAuthenticated && !isLoading) {
            router.replace('/dashboard?page=dashboard');
        }
    }, [isAuthenticated, isLoading, router]);

    /** Department filter logic */
    const [availableDepartments, setAvailableDepartments] = useState<string[]>([]);
    const [selectedDepartment, setSelectedDepartment] = useState<string>('__all__');
    const [filteredUsers, setFilteredUsers] = useState(users);

    useEffect(() => {
        if (users.length > 0) {
            const departments = Array.from(new Set(users.map(user => user.department).filter(Boolean)));
            setAvailableDepartments(departments);

            if (selectedDepartment === '__all__') setFilteredUsers(users);
            else setFilteredUsers(users.filter(user => user.department === selectedDepartment));
        }
    }, [users, selectedDepartment]);

    /** Login state */
    const [loginData, setLoginData] = useState({ email: '', password: '' });
    const [showLoginPassword, setShowLoginPassword] = useState(false);

    const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setLoginData(prev => ({ ...prev, [name]: value }));
    };

    const toggleLoginPassword = () => setShowLoginPassword(prev => !prev);

    const handleLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await login(loginData); // AuthResponse
            toast.success('Login successful!');
        } catch (err: any) {
            toast.error(err.message || 'Login failed');
        }
    };


    /** Register state */
    const [registerData, setRegisterData] = useState({
        name: '',
        image: '',
        employeeId: '',
        department: '',
        email: '',
        phoneNumber: '',
        location: '',
        password: '',
        role: 'user'
    });
    const [showRegisterPassword, setShowRegisterPassword] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<string>('');

    const handleUserSelect = (userId: string) => {
        if (userId === '__new__') {
            setSelectedUserId('');
            setRegisterData({
                name: '',
                image: '',
                employeeId: '',
                department: selectedDepartment === '__all__' ? '' : selectedDepartment,
                email: '',
                phoneNumber: '',
                location: '',
                password: '',
                role: 'user'
            });
        } else {
            setSelectedUserId(userId);
            const selectedUser = filteredUsers.find(u => u._id === userId);
            if (selectedUser) {
                setRegisterData({
                    name: selectedUser.name || '',
                    image: selectedUser.image || '',
                    employeeId: selectedUser.employeeId || '',
                    department: selectedUser.department || '',
                    email: selectedUser.email || '',
                    phoneNumber: selectedUser.phoneNumber || '',
                    location: selectedUser.location || '',
                    password: '',
                    role: selectedUser.role || 'user'
                });
            }
        }
    };

    const handleDepartmentFilter = (department: string) => {
        setSelectedDepartment(department);
        setSelectedUserId('');
        setRegisterData({
            name: '',
            image: '',
            employeeId: '',
            department: department === '__all__' ? '' : department,
            email: '',
            phoneNumber: '',
            location: '',
            password: '',
            role: 'user'
        });
    };

    const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setRegisterData(prev => ({ ...prev, [name]: value }));
    };

    const handleRegisterImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            setRegisterData(prev => ({ ...prev, image: reader.result as string }));
        };
        reader.readAsDataURL(file);
    };

    const toggleRegisterPassword = () => setShowRegisterPassword(prev => !prev);

    const handleRegisterSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate required fields
        if (!registerData.name || !registerData.email || !registerData.password) {
            toast.error('Please fill in all required fields');
            return;
        }

        if (registerData.password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        try {
            console.log('[AuthPage] Submitting registration:', { ...registerData, password: '***' });
            const result = await register(registerData);
            console.log('[AuthPage] Registration result:', result);

            if (result.success !== false) {
                toast.success('Registration successful! You are now logged in.');
                // Optionally redirect
                // router.push('/dashboard?page=dashboard');
            } else {
                toast.error(result.error || 'Registration failed');
            }
        } catch (err: any) {
            console.error('[AuthPage] Registration error:', err);
            toast.error(err.message || 'Registration failed');
        }
    };

    if (type === 'login') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
                <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                    <CardHeader className="text-center">
                        <div className="flex items-center justify-center gap-3 mb-4">
                            <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full shadow-lg">
                                <Clock className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent tracking-tight">Smart</div>
                                <div className="text-2xl font-semibold text-gray-600">Attendance</div>
                            </div>
                        </div>
                        <CardTitle className="text-xl font-bold text-gray-800">Welcome Back</CardTitle>
                        <p className="text-sm text-gray-500">Sign in to your account</p>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleLoginSubmit} className="space-y-4">
                            <div className="space-y-1">
                                <Label htmlFor="email">Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={loginData.email}
                                        onChange={handleLoginChange}
                                        placeholder="Enter your email"
                                        className="pl-10"
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="password">Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="password"
                                        name="password"
                                        type={showLoginPassword ? "text" : "password"}
                                        value={loginData.password}
                                        onChange={handleLoginChange}
                                        placeholder="Enter your password"
                                        className="pl-10 pr-10"
                                        required
                                        disabled={isLoading}
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-2 top-2 h-6 w-6 p-0"
                                        onClick={toggleLoginPassword}
                                        disabled={isLoading}
                                    >
                                        {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </Button>
                                </div>
                            </div>
                            <Button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700" disabled={isLoading}>
                                {isLoading ? 'Logging in...' : 'Sign In'}
                            </Button>
                        </form>
                        <div className="mt-4 text-center">
                            <button
                                onClick={() => setPage('registers')}
                                className="text-sm text-blue-600 hover:underline"
                            >
                                Don&apos;t have an account? Register
                            </button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (type === 'register') {
        console.log('[AuthPage] Rendering register form', { usersLoading, filteredUsersLength: filteredUsers.length });
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
                <Card className="w-full max-w-4xl shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                    <CardHeader className="text-center">
                        <div className="flex items-center justify-center gap-3 mb-4">
                            <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full shadow-lg">
                                <Users className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent tracking-tight">Smart</div>
                                <div className="text-2xl font-semibold text-gray-600">Attendance</div>
                            </div>
                        </div>
                        <CardTitle className="text-xl font-bold text-gray-800">Create Account</CardTitle>
                        <p className="text-sm text-gray-500">Join our attendance system</p>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleRegisterSubmit} className="space-y-6">
                            {/* Department Filter */}
                            <div className="space-y-1">
                                <Label htmlFor="departmentFilter">Filter by Department</Label>
                                <Select
                                    value={selectedDepartment}
                                    onValueChange={handleDepartmentFilter}
                                    disabled={isLoading || usersLoading}
                                >
                                    <SelectTrigger className="w-full bg-blue-50">
                                        <SelectValue placeholder="-- All Departments --" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="__all__">-- All Departments --</SelectItem>
                                        {availableDepartments.map((dept) => (
                                            <SelectItem key={dept} value={dept}>
                                                {dept}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {selectedDepartment !== '__all__' && (
                                    <p className="text-xs text-blue-600 mt-1">
                                        Showing {filteredUsers.length} staff from {selectedDepartment}
                                    </p>
                                )}
                            </div>
                            {/* User Selection Dropdown */}
                            <div className="space-y-1">
                                <Label htmlFor="userSelect">Select Existing User (Optional)</Label>
                                <Select
                                    value={selectedUserId}
                                    onValueChange={handleUserSelect}
                                    disabled={isLoading || usersLoading}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="-- Create New User --" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="__new__">-- Create New User --</SelectItem>
                                        {filteredUsers.map((user) => (
                                            <SelectItem key={user.id} value={user.id}>
                                                {user.name} ({user.email}) - {user.department}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {usersLoading && (
                                    <p className="text-xs text-gray-500 mt-1">Loading users...</p>
                                )}
                                {!usersLoading && filteredUsers.length === 0 && selectedDepartment !== '__all__' && (
                                    <p className="text-xs text-orange-600 mt-1">No users found in this department</p>
                                )}
                            </div>
                            {/* Grid for profile fields */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Name */}
                                <div className="space-y-1">
                                    <Label htmlFor="name">Full Name</Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="name"
                                            name="name"
                                            type="text"
                                            value={registerData.name}
                                            onChange={handleRegisterChange}
                                            placeholder="Enter your full name"
                                            className="pl-10"
                                            required
                                            disabled={isLoading}
                                        />
                                    </div>
                                </div>
                                {/* Employee ID */}
                                <div className="space-y-1">
                                    <Label htmlFor="employeeId">Employee ID</Label>
                                    <div className="relative">
                                        <IdCard className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="employeeId"
                                            name="employeeId"
                                            type="text"
                                            value={registerData.employeeId}
                                            onChange={handleRegisterChange}
                                            placeholder="Enter employee ID"
                                            className="pl-10"
                                            required
                                            disabled={isLoading}
                                        />
                                    </div>
                                </div>
                                {/* Department */}
                                <div className="space-y-1">
                                    <Label htmlFor="department">Department</Label>
                                    <div className="relative">
                                        <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="department"
                                            name="department"
                                            type="text"
                                            value={registerData.department}
                                            onChange={handleRegisterChange}
                                            placeholder="Enter department"
                                            className="pl-10"
                                            required
                                            disabled={isLoading}
                                        />
                                    </div>
                                </div>
                                {/* Email */}
                                <div className="space-y-1">
                                    <Label htmlFor="email">Email</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            value={registerData.email}
                                            onChange={handleRegisterChange}
                                            placeholder="Enter your email"
                                            className="pl-10"
                                            required
                                            disabled={isLoading}
                                        />
                                    </div>
                                </div>
                                {/* Phone Number */}
                                <div className="space-y-1">
                                    <Label htmlFor="phoneNumber">Phone Number</Label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="phoneNumber"
                                            name="phoneNumber"
                                            type="tel"
                                            value={registerData.phoneNumber}
                                            onChange={handleRegisterChange}
                                            placeholder="Enter phone number"
                                            className="pl-10"
                                            required
                                            disabled={isLoading}
                                        />
                                    </div>
                                </div>
                                {/* Location */}
                                <div className="space-y-1">
                                    <Label htmlFor="location">Location</Label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="location"
                                            name="location"
                                            type="text"
                                            value={registerData.location}
                                            onChange={handleRegisterChange}
                                            placeholder="Enter location"
                                            className="pl-10"
                                            required
                                            disabled={isLoading}
                                        />
                                    </div>
                                </div>
                            </div>
                            {/* Full-width fields */}
                            <div className="space-y-4">
                                {/* Password */}
                                <div className="space-y-1">
                                    <Label htmlFor="password">Password</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="password"
                                            name="password"
                                            type={showRegisterPassword ? "text" : "password"}
                                            value={registerData.password}
                                            onChange={handleRegisterChange}
                                            placeholder="Enter password (min 6 chars)"
                                            className="pl-10 pr-10"
                                            minLength={6}
                                            required
                                            disabled={isLoading}
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="absolute right-2 top-2 h-6 w-6 p-0"
                                            onClick={toggleRegisterPassword}
                                            disabled={isLoading}
                                        >
                                            {showRegisterPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                </div>
                                {/* Image Upload */}
                                <div className="space-y-1">
                                    <Label htmlFor="image">Profile Image</Label>
                                    <div className="relative">
                                        <Input
                                            id="image"
                                            name="image"
                                            type="file"
                                            accept="image/*"
                                            onChange={handleRegisterImageChange}
                                            className="block w-full"
                                            disabled={isLoading}
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="absolute right-0 top-0 mt-1 mr-1"
                                            disabled={isLoading}
                                        >
                                            <ImagePlus className="h-4 w-4 mr-1" />
                                            Upload
                                        </Button>
                                    </div>
                                    {registerData.image && (
                                        <img src={registerData.image} alt="Preview" className="w-20 h-20 rounded-full mt-2" />
                                    )}
                                </div>
                                {/* Role */}
                                <div className="space-y-1">
                                    <Label htmlFor="role">Role</Label>
                                    <Select
                                        value={registerData.role}
                                        onValueChange={(value) => {
                                            setRegisterData((prev) => ({ ...prev, role: value }));
                                            console.log('[AuthPage] Role changed to:', value);
                                        }}
                                        disabled={isLoading}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select a role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="user">User</SelectItem>
                                            <SelectItem value="manager">Manager</SelectItem>
                                            <SelectItem value="admin">Admin</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <Button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700" disabled={isLoading}>
                                {isLoading ? 'Registering...' : 'Create Account'}
                            </Button>
                        </form>
                        <div className="mt-4 text-center">
                            <button
                                onClick={() => {
                                    console.log('[AuthPage] Navigating to login');
                                    setPage('login')
                                }}
                                className="text-sm text-blue-600 hover:underline"
                            >
                                Already have an account? Login
                            </button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Default fallback (invalid type)
    console.log('[AuthPage] Invalid type fallback:', type);
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <h1 className="text-2xl font-bold">Invalid Auth Type</h1>
                <Link href="/auth/login" className="text-blue-600 hover:underline mt-4 block">
                    Go to Login
                </Link>
            </div>
        </div>
    );
}