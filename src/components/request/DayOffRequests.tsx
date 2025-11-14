'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import RequestDetailModal from "./RequestDetailModal";
import { useRequests } from "@/hooks/request.hook";

export type Request = {
    _id: string;
    user: { _id: string; name: string };
    department: { _id: string; name: string };
    type: string; // "dayoff" | "employee"
    date: string;
    reason: string;
    status: "pending" | "approved" | "rejected"; // Updated to lowercase to match backend
    createdAt: string;
    updatedAt: string;
};

export default function DayOffRequests() {
    const { requests, loading, approveRequest, rejectRequest } = useRequests();
    const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleApprove = async (id: string) => {
        try {
            await approveRequest(id);
        } catch (err) {
            console.error("Failed to approve request", err);
        }
    };

    const handleReject = async (id: string) => {
        try {
            await rejectRequest(id);
        } catch (err) {
            console.error("Failed to reject request", err);
        }
    };

    const getStatusClass = (status?: string) => {
        switch ((status || "pending").toLowerCase()) {
            case "approved": return "bg-green-100 text-green-700";
            case "rejected": return "bg-red-100 text-red-700";
            case "pending":
            default: return "bg-yellow-100 text-yellow-700";
        }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return new Intl.DateTimeFormat(undefined, { 
            year: "numeric", month: "short", day: "numeric" 
        }).format(date);
    };

    if (loading) return <div>Loading day-off requests...</div>;

    const dayOffRequests = requests.filter(r => r.type === "dayoff");

    return (
        <div className="space-y-4">
            <h2 className="text-lg font-semibold">Day-Off Requests</h2>
            {dayOffRequests.length === 0 ? (
                <p className="text-muted-foreground">No day-off requests found.</p>
            ) : (
                <ul className="space-y-3">
                    {dayOffRequests.map(request => (
                        <li
                            key={request._id}
                            className="p-4 bg-white rounded-lg shadow hover:shadow-md cursor-pointer flex justify-between items-center"
                            onClick={() => { setSelectedRequest(request); setIsModalOpen(true); }}
                        >
                            <div>
                                <p className="font-semibold">{request.user.name}</p>
                                <p className="text-sm text-muted-foreground">
                                    {request.department.name} | {formatDate(request.date)} - {request.reason}
                                </p>
                                <span className={`inline-block mt-1 px-2 py-1 text-xs font-semibold rounded ${getStatusClass(request.status)}`}>
                                    {request.status ? request.status.charAt(0).toUpperCase() + request.status.slice(1) : "Pending"}
                                </span>
                            </div>
                            <div className="flex gap-2">
                                {request.status === "pending" && (
                                    <>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={(e) => { e.stopPropagation(); handleApprove(request._id); }}
                                        >
                                            Approve
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            onClick={(e) => { e.stopPropagation(); handleReject(request._id); }}
                                        >
                                            Reject
                                        </Button>
                                    </>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            <RequestDetailModal
                request={selectedRequest}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </div>
    );
}