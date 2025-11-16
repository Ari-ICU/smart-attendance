// hooks/request.hook.ts (Updated: Integrated user permission checks for login/auth; exposes admin-only actions conditionally)
import { useState, useEffect } from 'react';
import { requestService } from '@/service/request.service'
import { Request, CreateRequestPayload } from '@/types/request';

export const useRequests = () => {
    const [requests, setRequests] = useState<Request[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // ✅ Fixed: Get user from localStorage (assumes set after login: localStorage.setItem('user', JSON.stringify(user)))
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    const isLoggedIn = !!localStorage.getItem('token');
    const isAdmin = user?.role === 'admin';
    const isApproved = user?.status === 'approved';

    const fetchRequests = async () => {
        if (!isLoggedIn || !isApproved) {
            setError('User not authenticated or approved. Please login.');
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const data = await requestService.getRequests();
            setRequests(data);
        } catch (err: any) {
            // ✅ Enhanced: Handle permission errors specifically
            if (err.message.includes('401') || err.message.includes('403')) {
                setError('Access denied. Insufficient permissions or not approved.');
                localStorage.removeItem('token'); // Logout on auth failure
                localStorage.removeItem('user');
            } else {
                setError(err.message || 'Failed to fetch requests');
            }
        } finally {
            setLoading(false);
        }
    };

    const createRequest = async (payload: CreateRequestPayload): Promise<Request> => {
        if (!isLoggedIn || !isApproved) {
            throw new Error('User not authenticated or approved.');
        }
        setError(null);
        try {
            const newRequest = await requestService.createRequest(payload);
            // Update local state immediately without refetching
            setRequests(prev => [newRequest, ...prev]);
            return newRequest;
        } catch (err: any) {
            // ✅ Enhanced: Handle permission errors
            if (err.message.includes('401') || err.message.includes('403')) {
                setError('Access denied. Please login or contact admin.');
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            } else {
                setError(err.message || 'Failed to create request');
            }
            throw err;
        }
    };

    const approveRequest = async (id: string): Promise<Request> => {
        if (!isAdmin) {
            throw new Error('Insufficient permissions. Admin only.');
        }
        setError(null);
        try {
            const updatedRequest = await requestService.approveRequest(id);
            // Update local state with the updated request
            setRequests(prev => prev.map(r => r._id === id ? updatedRequest : r));
            return updatedRequest;
        } catch (err: any) {
            // ✅ Enhanced: Handle permission errors
            if (err.message.includes('401') || err.message.includes('403')) {
                setError('Access denied. Admin permissions required.');
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            } else {
                setError(err.message || 'Failed to approve request');
            }
            throw err;
        }
    };

    const rejectRequest = async (id: string): Promise<Request> => {
        if (!isAdmin) {
            throw new Error('Insufficient permissions. Admin only.');
        }
        setError(null);
        try {
            const updatedRequest = await requestService.rejectRequest(id);
            // Update local state with the updated request
            setRequests(prev => prev.map(r => r._id === id ? updatedRequest : r));
            return updatedRequest;
        } catch (err: any) {
            // ✅ Enhanced: Handle permission errors
            if (err.message.includes('401') || err.message.includes('403')) {
                setError('Access denied. Admin permissions required.');
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            } else {
                setError(err.message || 'Failed to reject request');
            }
            throw err;
        }
    };

    useEffect(() => {
        if (isLoggedIn && isApproved) {
            fetchRequests();
        } else {
            setError('User not logged in or approved. Redirecting to login...');
        }
    }, [isLoggedIn, isApproved]); // ✅ Fixed: Depend on auth state

    const refetch = fetchRequests;

    return { 
        requests, 
        loading, 
        error, 
        createRequest, 
        approveRequest,  // Only callable if isAdmin (checked in component or here)
        rejectRequest,   // Only callable if isAdmin
        refetch,
        isAdmin,         // ✅ Added: Expose for UI conditional rendering (e.g., show buttons if isAdmin)
        isLoggedIn,
        user             // ✅ Added: Full user for other uses
    };
};