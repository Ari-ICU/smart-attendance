// services/request.service.ts (Updated: Include createApprovalRequest)
import { BASE_URL } from '@/lib/api/apiUrl';
import { CreateRequestPayload, CreateApprovalRequestPayload, Request } from '@/types/request';

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

export const requestService = {
    async createRequest(payload: CreateRequestPayload): Promise<Request> {
        const response = await fetch(BASE_URL.REQUEST_API.CREATE_REQUEST, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}` // Assume token stored
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const result: ApiResponse<Request> = await response.json();
        if (!result.success) throw new Error(result.message || 'Failed to create request');

        return result.data;
    },

    async createApprovalRequest(payload: CreateApprovalRequestPayload): Promise<Request> {
        const response = await fetch(BASE_URL.REQUEST_API.CREATE_APPROVAL_REQUEST, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}` 
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const result: ApiResponse<Request> = await response.json();
        if (!result.success) throw new Error(result.message || 'Failed to create approval request');

        return result.data;
    },

    async getRequests(): Promise<Request[]> {
        const response = await fetch(BASE_URL.REQUEST_API.GET_REQUESTS, {
            method: 'GET',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}` 
            },
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const result: ApiResponse<Request[]> = await response.json();
        if (!result.success) throw new Error(result.message || 'Failed to fetch requests');

        return result.data;
    },

    async getRequest(id: string): Promise<Request> {
        const response = await fetch(BASE_URL.REQUEST_API.GET_REQUEST(id), {
            method: 'GET',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}` 
            },
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const result: ApiResponse<Request> = await response.json();
        if (!result.success) throw new Error(result.message || 'Failed to fetch request');

        return result.data;
    },

    async approveRequest(id: string): Promise<Request> {
        const response = await fetch(BASE_URL.REQUEST_API.APPROVE_REQUEST(id), {
            method: 'PATCH',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}` 
            },
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const result: ApiResponse<Request> = await response.json();
        if (!result.success) throw new Error(result.message || 'Failed to approve request');

        return result.data;
    },

    async rejectRequest(id: string): Promise<Request> {
        const response = await fetch(BASE_URL.REQUEST_API.REJECT_REQUEST(id), {
            method: 'PATCH',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}` 
            },
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const result: ApiResponse<Request> = await response.json();
        if (!result.success) throw new Error(result.message || 'Failed to reject request');

        return result.data;
    },
};