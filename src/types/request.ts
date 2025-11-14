
export interface CreateRequestPayload {
    user: string;       // userId
    department: string; // departmentId
    type: string;
    date: string;
    reason: string;
}

export interface Request {
    _id: string;
    user: { _id: string; name: string };
    department: { _id: string; name: string };
    type: string;
    date: string;
    reason: string;
    status: "pending" | "approved" | "rejected"; // Updated to lowercase to match backend
    createdAt: string;
    updatedAt: string;
}