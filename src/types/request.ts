// types/request.ts (Updated: Added CreateApprovalRequestPayload; made user optional in Request; added PendingUser)
export interface CreateRequestPayload {
    user: string;       // userId (existing user)
    department: string; // departmentId
    type: string;
    date: string;
    reason: string;
}

// ✅ Added: Payload for approval requests (flexible: with userId for existing, or full data for new registrations)
export interface CreateApprovalRequestPayload {
    userId?: string; // Optional: for existing users
    name?: string;   // For new registrations
    email?: string;
    password?: string; // Plain password (hashed on backend)
    employeeId?: string;
    department: string; // Required
    phoneNumber?: string;
    location?: string;
    image?: string;
    reason?: string;
    type?: string; // Optional, defaults to 'approval' or 'registration_approval' on backend
}

export interface PendingUser {
    name: string;
    email: string;
    password?: string; // Not returned in responses
    employeeId: string;
    department: string; // ID
    phoneNumber?: string;
    location?: string;
    image?: string;
}

export interface Request {
    _id: string;
    user?: { _id: string; name: string }; // ✅ Updated: Optional (null for pending registrations)
    department: { _id: string; name: string };
    type: string;
    date: string;
    reason: string;
    status: "pending" | "approved" | "rejected"; // Updated to lowercase to match backend
    pendingUser?: PendingUser; // ✅ Added: For pending registrations (embedded data)
    createdAt: string;
    updatedAt: string;
}