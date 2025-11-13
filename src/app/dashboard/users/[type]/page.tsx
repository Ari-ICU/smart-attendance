'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { UserRegistrationForm, UserFormData } from '@/components/user/UserRegistrationForm';
import { useDashboardPage } from '@/hooks/useDashboardPage';
import { useUsers } from '@/hooks/user.hook';

export default function UserFormPage() {
    const { page, setPage } = useDashboardPage();
    const { handleCreateUser, handleUpdateUser, getUserById, isSubmitting } = useUsers();

    // Determine mode
    const type = page?.startsWith("users/edit") ? "edit" : "create";

    // Extract userId from page string
    const userId = type === "edit" ? page!.split("id=")[1] : undefined;

    const [formData, setFormData] = useState<UserFormData>({
        name: '',
        employeeId: '',
        email: '',
        position: '',
        department: '',
        phoneNumber: '',
        location: '',
        salary: '',
        image: ''
    });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [initialData, setInitialData] = useState<UserFormData | undefined>();

    // Fetch user data if editing
    useEffect(() => {
        if (type === 'edit' && userId) {
            getUserById(userId).then((user) => {
                if (user) {
                    const safeUser: UserFormData = {
                        name: user.name || '',
                        employeeId: user.employeeId || '',
                        email: user.email || '',
                        position: user.position || '',   // fallback to empty string
                        department: user.department || '',
                        phoneNumber: user.phoneNumber || '',
                        location: user.location || '',
                        salary: user.salary !== undefined ? String(user.salary) : '',
                        image: user.image || ''
                    };

                    setFormData(safeUser);
                    setInitialData(safeUser);
                } else {
                    toast.error('User not found');
                    setPage('users');
                }
            });
        }
    }, [type, userId]);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const data = new FormData();
        data.append('name', formData.name || '');
        data.append('employeeId', formData.employeeId || '');
        data.append('email', formData.email || '');
        data.append('position', formData.position || '');  // Keep this—handles empty fallback

        // Conditional appends for optional fields (no duplicate for position!)
        if (formData.department) data.append('department', formData.department);
        if (formData.phoneNumber) data.append('phoneNumber', formData.phoneNumber);
        if (formData.salary) data.append('salary', formData.salary);
        if (formData.location) data.append('location', formData.location);
        if (selectedFile) data.append('image', selectedFile);

        try {
            if (type === 'edit' && userId) {
                await handleUpdateUser(userId, data);
                toast.success('User updated successfully');
            } else {
                await handleCreateUser(data);
                toast.success('User created successfully');
                console.log('User created successfully : ', formData);
            }
            setPage('users');
        } catch {
            toast.error('Operation failed');
        }
    };

    return (
        <div className="p-6">
            <UserRegistrationForm
                formData={formData}
                setFormData={setFormData}
                selectedFile={selectedFile}
                setSelectedFile={setSelectedFile}
                initialData={initialData}
                onSubmit={handleSubmit}
                disabled={isSubmitting}
            />
        </div>
    );
}