'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { useDashboardPage } from '@/hooks/useDashboardPage';
import { useDepartments } from '@/hooks/department.hook';

export interface UserFormData {
    name: string;
    employeeId: string;
    email: string;
    position: string;
    department: string;
    phoneNumber: string;
    location: string;
    salary: string; // now included
    image: string | null;
}

interface UserRegistrationFormProps {
    initialData?: UserFormData;
    formData: UserFormData;
    setFormData: React.Dispatch<React.SetStateAction<UserFormData>>;
    selectedFile: File | null;
    setSelectedFile: (file: File | null) => void;
    onSubmit: (e: React.FormEvent) => void;
    disabled?: boolean;
}

export function UserRegistrationForm({
    initialData,
    formData,
    setFormData,
    selectedFile,
    setSelectedFile,
    onSubmit,
    disabled = false,
}: UserRegistrationFormProps) {
    const { setPage } = useDashboardPage();
    const { departments, fetchDepartments } = useDepartments();
    const [positions, setPositions] = useState<string[]>([]);

    useEffect(() => {
        if (initialData) setFormData(initialData);
    }, [initialData, setFormData]);

    useEffect(() => {
        fetchDepartments();
    }, [fetchDepartments]);

    useEffect(() => {
        if (!departments || departments.length === 0) return; // wait for departments

        const dept = departments.find((d) => d.name === formData.department);
        if (dept && Array.isArray(dept.positions)) {
            setPositions(dept.positions);
            if (formData.position && !dept.positions.includes(formData.position)) {
                setFormData((prev) => ({ ...prev, position: '' }));
            }
        } else {
            setPositions([]);
            setFormData((prev) => ({ ...prev, position: '' }));
        }
    }, [formData.department, departments, setFormData]);


    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
            toast.success('Image selected successfully');
        }
    };

    const removeImage = () => {
        setSelectedFile(null);
        setFormData((prev) => ({ ...prev, image: '' }));
        toast.info('Image removed');
    };

    const handleCancel = () => setPage('users');

    const handleSubmitWithValidation = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name.trim()) return toast.error('Full Name is required');
        if (!formData.employeeId.trim()) return toast.error('Employee ID is required');
        if (!formData.email.trim()) return toast.error('Email is required');
        if (!formData.department) return toast.error('Department is required');
        if (!formData.position) return toast.error('Position is required');
        if (!initialData && !selectedFile) return toast.error('Face Image is required');

        if (formData.phoneNumber && !/^\+?[0-9\s\-()]+$/.test(formData.phoneNumber)) {
            return toast.error('Invalid phone number format');
        }

        if (!formData.salary || isNaN(Number(formData.salary))) {
            return toast.error('Salary must be a valid number');
        }

        onSubmit(e);
    };

    return (
        <Card className="p-6">
            <h3 className="text-lg mb-6 font-semibold">
                {initialData ? 'Edit User' : 'Register New User'}
            </h3>
            <form onSubmit={handleSubmitWithValidation} className="space-y-6">
                {/* Image Upload */}
                <div className="space-y-2">
                    <Label>Face Image</Label>
                    <div className="flex items-center gap-4">
                        <div className="relative w-32 h-32 rounded-lg border-2 border-dashed border-border bg-muted flex items-center justify-center overflow-hidden">
                            {selectedFile ? (
                                <>
                                    <img
                                        src={URL.createObjectURL(selectedFile)}
                                        alt="Preview"
                                        className="w-full h-full object-cover"
                                    />
                                    <button
                                        type="button"
                                        onClick={removeImage}
                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                    >
                                        <X size={14} />
                                    </button>
                                </>
                            ) : initialData?.image ? (
                                <img
                                    src={initialData.image}
                                    alt="Preview"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <Upload className="w-8 h-8 text-muted-foreground" />
                            )}
                        </div>
                        <div className="flex-1">
                            <Input
                                id="file-upload"
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                            <Label htmlFor="file-upload">
                                <Button type="button" variant="outline" asChild>
                                    <span className="cursor-pointer">
                                        <Upload className="w-4 h-4 mr-2" />
                                        {initialData ? 'Change Image' : 'Upload Image'}
                                    </span>
                                </Button>
                            </Label>
                            <p className="text-xs text-muted-foreground mt-2">
                                Upload a clear front-facing photo for identification.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                            id="name"
                            placeholder="Enter full name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="employeeId">Employee ID</Label>
                        <Input
                            id="employeeId"
                            placeholder="EMP001"
                            value={formData.employeeId}
                            onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="user@example.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="department">Department</Label>
                        <Select
                            value={formData.department}
                            onValueChange={(value) => setFormData({ ...formData, department: value })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select department" />
                            </SelectTrigger>
                            <SelectContent>
                                {departments.length > 0 ? (
                                    departments.map((dept) => (
                                        <SelectItem key={dept.id} value={dept.name}>
                                            {dept.name}
                                        </SelectItem>
                                    ))
                                ) : (
                                    <SelectItem value="loading" disabled>
                                        Loading...
                                    </SelectItem>
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Position */}
                    <div className="space-y-2">
                        <Label htmlFor="position">Position</Label>
                        <Select
                            value={formData.position || ''}
                            onValueChange={(value) => setFormData({ ...formData, position: value })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select position" />
                            </SelectTrigger>
                            <SelectContent>
                                {positions.length > 0 ? (
                                    positions.map((pos, idx) => (
                                        <SelectItem key={idx} value={pos}>
                                            {pos}
                                        </SelectItem>
                                    ))
                                ) : (
                                    <SelectItem value="disabled" disabled>
                                        Select department first
                                    </SelectItem>
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Phone Number */}
                    <div className="space-y-2">
                        <Label htmlFor="phoneNumber">Phone Number</Label>
                        <Input
                            id="phoneNumber"
                            type="tel"
                            placeholder="+855 12 345 678"
                            value={formData.phoneNumber || ''}
                            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                        />
                    </div>

                    {/* Location */}
                    <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input
                            id="location"
                            placeholder="Phnom Penh, Cambodia"
                            value={formData.location || ''}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        />
                    </div>

                    {/* Salary */}
                    <div className="space-y-2">
                        <Label htmlFor="salary">Salary</Label>
                        <Input
                            id="salary"
                            type="number"
                            placeholder="Enter salary in USD"
                            value={formData.salary || ''}
                            onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <Button type="submit" className="flex-1" disabled={disabled}>
                        {disabled
                            ? initialData ? 'Updating...' : 'Submitting...'
                            : initialData ? 'Update User' : 'Register User'}
                    </Button>
                    <Button type="button" variant="outline" onClick={handleCancel} disabled={disabled}>
                        Cancel
                    </Button>
                </div>
            </form>
        </Card>
    );
}
