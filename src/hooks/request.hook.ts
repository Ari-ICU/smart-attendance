// hooks/request.hook.ts
import { useState, useEffect } from 'react';
import { requestService } from '@/service/request.service'
import {  Request, CreateRequestPayload } from '@/types/request';

export const useRequests = () => {
    const [requests, setRequests] = useState<Request[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchRequests = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await requestService.getRequests();
            setRequests(data);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch requests');
        } finally {
            setLoading(false);
        }
    };

    const createRequest = async (payload: CreateRequestPayload): Promise<Request> => {
        setError(null);
        try {
            const newRequest = await requestService.createRequest(payload);
            // Update local state immediately without refetching
            setRequests(prev => [newRequest, ...prev]);
            return newRequest;
        } catch (err: any) {
            setError(err.message || 'Failed to create request');
            throw err;
        }
    };

    const approveRequest = async (id: string): Promise<Request> => {
        setError(null);
        try {
            const updatedRequest = await requestService.approveRequest(id);
            // Update local state with the updated request
            setRequests(prev => prev.map(r => r._id === id ? updatedRequest : r));
            return updatedRequest;
        } catch (err: any) {
            setError(err.message || 'Failed to approve request');
            throw err;
        }
    };

    const rejectRequest = async (id: string): Promise<Request> => {
        setError(null);
        try {
            const updatedRequest = await requestService.rejectRequest(id);
            // Update local state with the updated request
            setRequests(prev => prev.map(r => r._id === id ? updatedRequest : r));
            return updatedRequest;
        } catch (err: any) {
            setError(err.message || 'Failed to reject request');
            throw err;
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const refetch = fetchRequests;

    return { requests, loading, error, createRequest, approveRequest, rejectRequest, refetch };
};