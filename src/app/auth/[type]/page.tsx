'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthContext } from "@/context/AuthContext";
import { useUsers } from "@/hooks/user.hook";
import { useDepartments } from "@/hooks/department.hook"; // ✅ Added: Proper departments hook
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
import { User, Mail, Lock, Eye, EyeOff, Building, MapPin, Phone, IdCard, ImagePlus, Clock, Users, Upload } from "lucide-react";
import { toast } from "sonner";
import { useDashboardPage } from '@/hooks/useDashboardPage';
import Link from 'next/link';

interface User {
    _id: string;
    id?: string; // Fallback for legacy
    name: string;
    email: string;
    department?: string;
    role?: string;
    image?: string;
    employeeId?: string;
    phoneNumber?: string;
    location?: string;
    status?: string;
}

interface RegisterData {
    name: string;
    image: string;
    employeeId: string;
    department: string;
    email: string;
    phoneNumber: string;
    location: string;
    password: string;
    role: string;
}

export default function AuthPage() {
    const params = useParams();
    const { setPage } = useDashboardPage();
    const type = params?.type ?? 'login';
    const { login, register, isLoading, isAuthenticated } = useAuthContext();
    const { users, loading: usersLoading } = useUsers() as { users: User[]; loading: boolean };
    const { departments: availableDepartments, loading: deptsLoading } = useDepartments(); // ✅ Updated: Use proper departments hook
    const router = useRouter();

    /** Redirect authenticated users */
    useEffect(() => {
        if (isAuthenticated && !isLoading) {
            router.replace('/dashboard?page=dashboard');
        }
    }, [isAuthenticated, isLoading, router]);

    /** Department filter logic (now from users for filter, but select from depts) */
    const [selectedDepartment, setSelectedDepartment] = useState<string>('__all__');
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);

    useEffect(() => {
        if (users.length > 0) {
            const filtered = selectedDepartment === '__all__'
                ? users
                : users.filter(user => user.department === selectedDepartment);
            setFilteredUsers(filtered);
        }
    }, [users, selectedDepartment]);

    /** Login state */
    const [loginData, setLoginData] = useState({ email: '', password: '' });
    const [showLoginPassword, setShowLoginPassword] = useState(false);

    const handleLoginChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setLoginData(prev => ({ ...prev, [name]: value }));
    }, []);

    const toggleLoginPassword = useCallback(() => setShowLoginPassword(prev => !prev), []);

    const handleLoginSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!loginData.email || !loginData.password) {
            toast.error('Please fill in all fields');
            return;
        }
        try {
            await login(loginData);
            toast.success('Login successful!');
            router.replace('/dashboard?page=dashboard'); // Ensure redirect
        } catch (err: any) {
            const message = err.message || 'Login failed';
            toast.error(message);

            // Optional: More user-friendly handling for pending status
            if (message.includes('not approved')) {
                toast.info('Your account is pending admin approval. Please contact your administrator.');
            }
        }
    }, [loginData, login, router]);

    /** Register state */
    const [registerData, setRegisterData] = useState<RegisterData>({
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
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [uploadingImage, setUploadingImage] = useState(false);

    // Reset form for new registration
    const resetRegisterForm = useCallback((dept?: string) => {
        setRegisterData({
            name: '',
            image: '',
            employeeId: '',
            department: dept || '',
            email: '',
            phoneNumber: '',
            location: '',
            password: '',
            role: 'user'
        });
        setImageFile(null);
        setSelectedUserId('');
    }, []);

    const handleUserSelect = useCallback((userId: string) => {
        if (userId === '__new__') {
            resetRegisterForm(selectedDepartment === '__all__' ? undefined : selectedDepartment);
        } else {
            const selectedUser = filteredUsers.find(u => u._id === userId || u.id === userId);
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
                setSelectedUserId(userId);
                setImageFile(null); // Reset file for existing user
            }
        }
    }, [filteredUsers, selectedDepartment, resetRegisterForm]);

    const handleDepartmentFilter = useCallback((department: string) => {
        setSelectedDepartment(department);
        resetRegisterForm(department === '__all__' ? undefined : department);
    }, [resetRegisterForm]);

    const handleRegisterChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => { // ✅ Removed HTMLSelectElement since no free-text selects
        const { name, value } = e.target;
        setRegisterData(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleImageUpload = useCallback(async (file: File) => {
        if (!file) return;
        setUploadingImage(true);
        try {
            // TODO: Implement actual upload to backend endpoint (e.g., /api/upload/image)
            // For now, simulate with base64 preview; replace with fetch POST to get URL
            const reader = new FileReader();
            reader.onload = () => {
                setRegisterData(prev => ({ ...prev, image: reader.result as string })); // Temp base64
                toast.success('Image preview loaded (upload to server in production)');
            };
            reader.readAsDataURL(file);
            // Example upload logic (uncomment and adjust endpoint):
            // const formData = new FormData();
            // formData.append('image', file);
            // const res = await fetch('/api/upload/image', { method: 'POST', body: formData });
            // if (res.ok) {
            //     const { url } = await res.json();
            //     setRegisterData(prev => ({ ...prev, image: url }));
            //     toast.success('Image uploaded successfully');
            // }
        } catch (err) {
            toast.error('Image upload failed');
        } finally {
            setUploadingImage(false);
        }
    }, []);

    const handleRegisterImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            handleImageUpload(file);
        }
    }, [handleImageUpload]);

    const toggleRegisterPassword = useCallback(() => setShowRegisterPassword(prev => !prev), []);

    const handleRegisterSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();

        // Enhanced validation
        const requiredFields = ['name', 'email', 'employeeId', 'password', 'department'];
        const missingFields = requiredFields.filter(field => !registerData[field as keyof RegisterData]);
        if (missingFields.length > 0) {
            toast.error(`Please fill in: ${missingFields.join(', ')}`);
            return;
        }

        if (registerData.password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerData.email)) {
            toast.error('Please enter a valid email');
            return;
        }

        try {
            // Prepare payload (backend ignores role/status if not admin; adds status: 'pending')
            const payload = {
                ...registerData,
                status: 'pending' as const,
                // Note: image should be URL from upload, not base64 in production
            };

            console.log('[AuthPage] Submitting registration:', { ...payload, password: '***' }); // Keep for dev; remove in prod
            const result = await register(payload);
            console.log('[AuthPage] Registration result:', result); // Keep for dev

            // Backend returns { user, message } on success, throws on error
            toast.success(result?.message || 'Registration successful! Please wait for admin approval.');
            resetRegisterForm(); // Reset form on success
            // Optionally switch to login: setPage('login');
        } catch (err: any) {
            console.error('[AuthPage] Registration error:', err); // Keep for dev
            toast.error(err.message || 'Registration failed');
        }
    }, [registerData, register, resetRegisterForm]);

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
                                            <SelectItem key={dept.id || dept._id || dept.name} value={dept.name}>
                                                {dept.name}
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
                                            <SelectItem key={user._id || user.id} value={user._id || user.id || ''}>
                                                {user.name} ({user.email}) - {user.department || 'N/A'}
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
                                {/* Name - Updated to Select from existing users */}
                                <div className="space-y-1">
                                    <Label htmlFor="name">Full Name <span className="text-red-500">*</span></Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Select
                                            value={registerData.name}
                                            onValueChange={(value) => setRegisterData(prev => ({ ...prev, name: value }))}
                                            disabled={isLoading}
                                        >
                                            <SelectTrigger className="pl-10">
                                                <SelectValue placeholder="Select name from existing users" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {users.map((user) => (
                                                    <SelectItem key={user._id || user.id} value={user.name}>
                                                        {user.name} ({user.email})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                {/* Employee ID */}
                                <div className="space-y-1">
                                    <Label htmlFor="employeeId">Employee ID <span className="text-red-500">*</span></Label>
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
                                {/* Department - Updated Select from proper departments hook */}
                                <div className="space-y-1">
                                    <Label htmlFor="department">Department <span className="text-red-500">*</span></Label>
                                    <div className="relative">
                                        <Select
                                            value={registerData.department}
                                            onValueChange={(value) => setRegisterData(prev => ({ ...prev, department: value }))}
                                            disabled={isLoading || deptsLoading}
                                        >
                                            <SelectTrigger className="pl-10">
                                                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                <SelectValue placeholder="Select department" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="">Other</SelectItem>
                                                {availableDepartments.map((dept) => (
                                                    <SelectItem key={dept.id || dept._id || dept.name} value={dept.name}>
                                                        {dept.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    {deptsLoading && <p className="text-xs text-gray-500 mt-1">Loading departments...</p>}
                                </div>
                                {/* Email */}
                                <div className="space-y-1">
                                    <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
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
                                {/* Phone Number - Made optional with visual cue */}
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
                                            placeholder="Enter phone number (optional)"
                                            className="pl-10"
                                            disabled={isLoading}
                                        />
                                    </div>
                                </div>
                                {/* Location - Made optional */}
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
                                            placeholder="Enter location (optional)"
                                            className="pl-10"
                                            disabled={isLoading}
                                        />
                                    </div>
                                </div>
                            </div>
                            {/* Full-width fields */}
                            <div className="space-y-4">
                                {/* Password */}
                                <div className="space-y-1">
                                    <Label htmlFor="password">Password <span className="text-red-500">*</span></Label>
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
                                {/* Image Upload - Improved with upload button and progress */}
                                <div className="space-y-1">
                                    <Label htmlFor="image">Profile Image (Optional)</Label>
                                    <div className="relative">
                                        <Input
                                            id="image"
                                            name="image"
                                            type="file"
                                            accept="image/*"
                                            onChange={handleRegisterImageChange}
                                            className="block w-full"
                                            disabled={isLoading || uploadingImage}
                                        />
                                        {uploadingImage && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 rounded">
                                                <Upload className="h-5 w-5 text-white animate-spin" />
                                            </div>
                                        )}
                                    </div>
                                    {registerData.image && (
                                        <div className="mt-2 flex items-center gap-2">
                                            <img src={registerData.image} alt="Preview" className="w-20 h-20 rounded-full object-cover" />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => { setRegisterData(prev => ({ ...prev, image: '' })); setImageFile(null); }}
                                                disabled={isLoading}
                                            >
                                                Remove
                                            </Button>
                                        </div>
                                    )}
                                </div>
                                {/* Role - Limited to 'user' for registration; admin only via backend */}
                                <div className="space-y-1">
                                    <Label htmlFor="role">Role</Label>
                                    <Input
                                        id="role"
                                        name="role"
                                        type="text"
                                        value={registerData.role}
                                        onChange={handleRegisterChange}
                                        placeholder="Default: user"
                                        className="bg-gray-50"
                                        disabled
                                        title="Role set by admin on approval"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Default: user (Admin/Manager roles assigned post-approval)</p>
                                </div>
                            </div>
                            <Button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700" disabled={isLoading || uploadingImage}>
                                {isLoading ? 'Registering...' : 'Create Account'}
                            </Button>
                        </form>
                        <div className="mt-4 text-center">
                            <button
                                onClick={() => setPage('login')}
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

    // Default fallback
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <h1 className="text-2xl font-bold">Invalid Auth Type</h1>
                <button
                    onClick={() => setPage('login')}
                    className="text-blue-600 hover:underline mt-4 block"
                >
                    Go to Login
                </button>
            </div>
        </div>
    );
}