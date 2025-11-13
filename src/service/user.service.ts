import { BASE_URL } from '@/lib/api/apiUrl';
import type { User } from '@/types/users';

// Create user
export const createUser = async (data: FormData): Promise<User> => {
    const response = await fetch(BASE_URL.USER_API.CREATE_USER, {
        method: 'POST',
        body: data,
    });

    // Parse response as JSON if possible
    let result;
    try {
        result = await response.json();
    } catch {
        // fallback if response is not JSON
        result = null;
    }

    if (!response.ok) {
        // Prefer backend message if available
        const message = result?.error || result?.message || 'Unknown error';
        console.error('Create user error:', message);
        throw new Error(message);
    }

    const newUser = result.data;
    return { ...newUser, id: newUser._id };
};

// Get all users
export const getUsers = async (): Promise<User[]> => {
    const response = await fetch(BASE_URL.USER_API.GET_USERS);
    if (!response.ok) throw new Error(await response.text());

    const res = await response.json();
    return res.data.map((u: User) => ({ ...u, id: u._id }));
};

// Get single user
export const getUser = async (id: string): Promise<User> => {
    const response = await fetch(BASE_URL.USER_API.GET_USER(id));
    if (!response.ok) throw new Error(await response.text());

    const user = await response.json();
    return user.data; // return raw user; hook will normalize _id → id
};

// Update user
export const updateUser = async (id: string, data: FormData): Promise<User> => {
    const response = await fetch(BASE_URL.USER_API.UPDATE_USER(id), {
        method: 'PUT',
        body: data,
    });

    if (!response.ok) throw new Error(await response.text());

    const updatedUser = await response.json();
    return updatedUser.data;
};

// Delete user
export const deleteUser = async (id: string): Promise<void> => {
    const response = await fetch(BASE_URL.USER_API.DELETE_USER(id), {
        method: 'DELETE',
    });

    if (!response.ok) throw new Error(await response.text());
};
