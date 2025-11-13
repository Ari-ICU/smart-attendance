'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import RequestHeader from "./RequestHeader";
import { useDashboardPage } from "@/hooks/useDashboardPage";
import RequestDetailModal from "./RequestDetailModal";
import { ChevronDown, ChevronUp } from "lucide-react";

export type Request = {
    id: number;
    employeeName: string;
    type: string; // e.g., "dayoff", "employee"
    department: string;
    date: string;
    reason: string;
    status: "Pending" | "Approved" | "Rejected";
};

export default function AllRequests() {
    const { setPage } = useDashboardPage();

    const [requests, setRequests] = useState<Request[]>([]);
    const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
    const [filterType, setFilterType] = useState("All");
    const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchRequests = async () => {
            const data: Request[] = [
                { id: 1, employeeName: "John Doe", type: "dayoff", department: "HR", date: "2025-11-10", reason: "Family event", status: "Pending" },
                { id: 2, employeeName: "Jane Smith", type: "dayoff", department: "Finance", date: "2025-11-12", reason: "Medical", status: "Approved" },
                { id: 3, employeeName: "Alice Johnson", type: "employee", department: "IT", date: "2025-11-15", reason: "Training", status: "Pending" },
                { id: 4, employeeName: "Bob Brown", type: "employee", department: "Marketing", date: "2025-11-16", reason: "Workshop", status: "Approved" },
            ];
            setRequests(data);

            const groups = Array.from(new Set(data.map(r => r.type)));
            const initialCollapsed: Record<string, boolean> = {};
            groups.forEach(g => (initialCollapsed[g] = false));
            setCollapsedGroups(initialCollapsed);
        };

        fetchRequests();
    }, []);

    const toggleGroup = (type: string) => {
        setCollapsedGroups(prev => ({ ...prev, [type]: !prev[type] }));
    };

    const handleApprove = (id: number) => {
        setRequests(prev =>
            prev.map(r => r.id === id ? { ...r, status: "Approved" } : r)
        );
    };

    const handleReject = (id: number) => {
        setRequests(prev =>
            prev.map(r => r.id === id ? { ...r, status: "Rejected" } : r)
        );
    };

    const filteredRequests = filterType === "All"
        ? requests
        : requests.filter(r => r.type === filterType);

    const groupedRequests = filteredRequests.reduce<Record<string, Request[]>>((acc, req) => {
        if (!acc[req.type]) acc[req.type] = [];
        acc[req.type].push(req);
        return acc;
    }, {});

    const types = Array.from(new Set(requests.map(r => r.type)));

    const getStatusClass = (status: string) => {
        switch (status.toLowerCase()) {
            case "approved": return "bg-green-100 text-green-700";
            case "rejected": return "bg-red-100 text-red-700";
            case "pending":
            default: return "bg-yellow-100 text-yellow-700";
        }
    };

    return (
        <div className="space-y-6">
            <RequestHeader
                title="All Permission Requests"
                types={types}
                selectedType={filterType}
                onTypeChange={setFilterType}
                onCreate={() => setPage("permissions/create")}
            />

            {Object.entries(groupedRequests).map(([type, group]) => (
                <div key={type} className="border rounded-lg shadow-sm overflow-hidden">
                    {/* Group Header */}
                    <button
                        className="w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 font-medium transition-colors"
                        onClick={() => toggleGroup(type)}
                    >
                        <span>{type.toUpperCase()} ({group.length})</span>
                        {collapsedGroups[type] ? <ChevronDown /> : <ChevronUp />}
                    </button>

                    {/* Group Content */}
                    <div className={`transition-all duration-300 ${collapsedGroups[type] ? "max-h-0 overflow-hidden" : "max-h-screen"}`}>
                        <ul className="space-y-3 p-4">
                            {group.map(request => (
                                <li
                                    key={request.id}
                                    className="p-4 bg-white rounded-lg shadow hover:shadow-md cursor-pointer flex justify-between items-center"
                                    onClick={() => { setSelectedRequest(request); setIsModalOpen(true); }}
                                >
                                    <div>
                                        <p className="font-semibold">{request.employeeName}</p>
                                        <p className="text-sm text-muted-foreground">{request.department} | {request.date} - {request.reason}</p>
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
                    </div>
                </div>
            ))}

            <RequestDetailModal
                request={selectedRequest}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </div>
    );

}
