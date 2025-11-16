// types/request.ts (Updated: Include role in user)
export interface CreateRequestPayload {
    user: string;
    department: string;
    type: string;
    date: string;
    reason: string;
}

export interface CreateApprovalRequestPayload {
    user: string;
    department: string;
    reason: string;
}

export interface Request {
    _id: string;
    user: { _id: string; name: string; role?: string };
    department: { _id: string; name: string };
    type: string;
    date: string;
    reason: string;
    status: "pending" | "approved" | "rejected";
    createdAt: string;
    updatedAt: string;
}