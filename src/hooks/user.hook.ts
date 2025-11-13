import { useState, useEffect, useCallback } from 'react';
import type { User } from '@/types/users';
import { getUsers, getUser, createUser, updateUser, deleteUser } from '@/service/user.service';
import { toast } from 'sonner';

export const useUsers = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    // Fetch all users
    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const usersArray = await getUsers();
            setUsers(usersArray);
            setError(null);
        } catch (err) {
            setError((err as Error).message);
            toast.error('Failed to fetch users');
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch single user by ID for edit
    const getUserById = async (id: string): Promise<User | null> => {
        setLoading(true);
        try {
            const user = await getUser(id);
            if (!user._id) {
                throw new Error('User ID is missing');
            }
            // Normalize _id to id
            const normalizedUser = { ...user, id: user._id };
            setError(null);
            return normalizedUser;
        } catch (err) {
            setError((err as Error).message);
            toast.error('Failed to fetch user');
            return null;
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUser = async (data: FormData) => {
        setIsSubmitting(true);
        try {
            const newUser = await createUser(data);
            setUsers((prev) => [...prev, newUser]);
            toast.success('User created successfully');
        } catch {
            toast.error('Error creating user');
        } finally {
            setIsSubmitting(false);
        }
    };


    const handleUpdateUser = async (id: string, data: FormData) => {
        setIsSubmitting(true);
        try {
            const updatedUser = await updateUser(id, data);
            setUsers((prev) =>
                prev.map((user) => (user.id === updatedUser._id ? { ...updatedUser, id: updatedUser._id } : user))
            );
            toast.success('User updated successfully');
        } catch (err: unknown) {
            let message = 'Error updating user';

            if (err instanceof Error) {
                message = err.message;
            } else if (typeof err === 'string') {
                message = err;
            }
            toast.error(message);
            setError(message);
        }
        finally {
            setIsSubmitting(false);
        }
    };


    const handleDeleteUser = async (id: string) => {
        setIsSubmitting(true);
        try {
            await deleteUser(id);
            setUsers((prev) => prev.filter((user) => user.id !== id));
        } catch (err) {
            toast.error('Error deleting user');
            setError((err as Error).message);
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    return {
        users,
        loading,
        error,
        isSubmitting,
        fetchUsers,
        getUserById,
        handleCreateUser,
        handleUpdateUser,
        handleDeleteUser,
    };
};
