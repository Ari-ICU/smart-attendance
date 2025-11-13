'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import RequestDetailModal from "./RequestDetailModal";
import { Request } from "./AllRequests";

export default function DayOffRequests() {
    const [requests, setRequests] = useState<Request[]>([]);
    const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchRequests = async () => {
            const data: Request[] = [
                { id: 1, employeeName: "John Doe", department: "HR", type: "dayoff", date: "2025-11-10", reason: "Family event", status: "Pending" },
                { id: 2, employeeName: "Jane Smith", department: "Finance", type: "dayoff", date: "2025-11-12", reason: "Medical", status: "Approved" },
                { id: 3, employeeName: "Alice Johnson", department: "IT", type: "dayoff", date: "2025-11-15", reason: "Vacation", status: "Pending" },
            ];

            setRequests(data);
        };
        fetchRequests();
    }, []);

    const handleApprove = (id: number) => {
        setRequests(prev => prev.map(r => r.id === id ? { ...r, status: "Approved" } : r));
    };

    const handleReject = (id: number) => {
        setRequests(prev => prev.map(r => r.id === id ? { ...r, status: "Rejected" } : r));
    };

    const getStatusClass = (status: string) => {
        switch (status.toLowerCase()) {
            case "approved": return "bg-green-100 text-green-700";
            case "rejected": return "bg-red-100 text-red-700";
            case "pending":
            default: return "bg-yellow-100 text-yellow-700";
        }
    };

    return (
        <div className="space-y-4">
            <h2 className="text-lg font-semibold">Day-Off Requests</h2>
            <ul className="space-y-3">
                {requests.map(request => (
                    <li
                        key={request.id}
                        className="p-4 bg-white rounded-lg shadow hover:shadow-md cursor-pointer flex justify-between items-center"
                        onClick={() => { setSelectedRequest(request); setIsModalOpen(true); }}
                    >
                        <div>
                            <p className="font-semibold">{request.employeeName}</p>
                            <p className="text-sm text-muted-foreground">{request.department ? request.department + " | " : ""}{request.date} - {request.reason}</p>
                            <span className={`inline-block mt-1 px-2 py-1 text-xs font-semibold rounded ${getStatusClass(request.status)}`}>
                                {request.status}
                            </span>
                        </div>
                        <div className="flex gap-2">
                            {request.status.toLowerCase() === "pending" && (
                                <>
                                    <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); handleApprove(request.id); }}>Approve</Button>
                                    <Button size="sm" variant="destructive" onClick={(e) => { e.stopPropagation(); handleReject(request.id); }}>Reject</Button>
                                </>
                            )}
                        </div>
                    </li>
                ))}
            </ul>

            <RequestDetailModal
                request={selectedRequest}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </div>
    );

}
