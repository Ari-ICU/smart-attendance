'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import RequestHeader from "./RequestHeader";
import { useDashboardPage } from "@/hooks/useDashboardPage";
import RequestDetailModal from "./RequestDetailModal";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useRequests } from "@/hooks/request.hook";

export default function AllRequests() {
    const { setPage } = useDashboardPage();
    const { requests, loading, error, approveRequest, rejectRequest, isAdmin, isLoggedIn, user } = useRequests(); 

    const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
    const [filterType, setFilterType] = useState("All");
    const [selectedRequest, setSelectedRequest] = useState<typeof requests[0] | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const groups = Array.from(new Set(requests.map(r => r.type)));
        const initialCollapsed: Record<string, boolean> = {};
        groups.forEach(g => (initialCollapsed[g] = false));
        setCollapsedGroups(initialCollapsed);
    }, [requests]);

    // ✅ Fixed: Handle auth errors (e.g., redirect or show message if not logged in/approved)
    useEffect(() => {
        if (error && (error.includes('401') || error.includes('403'))) {
            // Optionally redirect to login or show toast
            console.error('Auth error:', error);
            // Example: window.location.href = '/login'; // Uncomment if needed
        }
    }, [error]);

    const toggleGroup = (type: string) => {
        setCollapsedGroups(prev => ({ ...prev, [type]: !prev[type] }));
    };

    const handleApprove = async (requestId: string) => {
        if (!isAdmin) {
            alert('Admin permissions required.'); // Or use toast notification
            return;
        }
        try {
            await approveRequest(requestId);
        } catch (err) {
            console.error("Failed to approve request", err);
            // Error already handled in hook
        }
    };

    const handleReject = async (requestId: string) => {
        if (!isAdmin) {
            alert('Admin permissions required.'); // Or use toast notification
            return;
        }
        try {
            await rejectRequest(requestId);
        } catch (err) {
            console.error("Failed to reject request", err);
            // Error already handled in hook
        }
    };

    // ✅ Fixed: Show message if not logged in or not approved
    if (!isLoggedIn || !user?.status || user.status !== 'approved') {
        return (
            <div className="flex items-center justify-center h-64 text-center">
                <div>
                    <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
                    <p className="text-muted-foreground mb-4">You need to be logged in and approved to view requests.</p>
                    <Button onClick={() => window.location.href = '/login'}>Go to Login</Button>
                </div>
            </div>
        );
    }

    // ✅ Fixed: Show error if present
    if (error && !loading) {
        return (
            <div className="flex items-center justify-center h-64 text-center">
                <div>
                    <h2 className="text-xl font-semibold mb-2">Error</h2>
                    <p className="text-destructive mb-4">{error}</p>
                    <Button onClick={() => window.location.reload()}>Retry</Button>
                </div>
            </div>
        );
    }

    const filteredRequests = filterType === "All"
        ? requests
        : requests.filter(r => r.type === filterType);

    const groupedRequests = filteredRequests.reduce<Record<string, typeof requests[0][]>>((acc, req) => {
        if (!acc[req.type]) acc[req.type] = [];
        acc[req.type].push(req);
        return acc;
    }, {});

    const types = Array.from(new Set(requests.map(r => r.type)));

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
        return new Intl.DateTimeFormat(undefined, { year: "numeric", month: "short", day: "numeric" }).format(date);
    };

    if (loading) return <div className="flex items-center justify-center h-64">Loading requests...</div>;

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
                    <button
                        className="w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 font-medium transition-colors"
                        onClick={() => toggleGroup(type)}
                    >
                        <span>{type.toUpperCase()} ({group.length})</span>
                        {collapsedGroups[type] ? <ChevronDown /> : <ChevronUp />}
                    </button>

                    <div className={`transition-all duration-300 ${collapsedGroups[type] ? "max-h-0 overflow-hidden" : "max-h-screen"}`}>
                        <ul className="space-y-3 p-4">
                            {group.map(request => (
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
                                        {/* ✅ Fixed: Conditionally render approve/reject buttons only for admins and pending status */}
                                        {isAdmin && request.status?.toLowerCase() === "pending" && (
                                            <>
                                                <Button 
                                                    size="sm" 
                                                    variant="outline" 
                                                    onClick={(e) => { 
                                                        e.stopPropagation(); 
                                                        handleApprove(request._id); 
                                                    }}
                                                >
                                                    Approve
                                                </Button>
                                                <Button 
                                                    size="sm" 
                                                    variant="destructive" 
                                                    onClick={(e) => { 
                                                        e.stopPropagation(); 
                                                        handleReject(request._id); 
                                                    }}
                                                >
                                                    Reject
                                                </Button>
                                            </>
                                        )}
                                        {/* ✅ Optional: Show info for non-admins */}
                                        {!isAdmin && request.status?.toLowerCase() === "pending" && (
                                            <span className="text-xs text-muted-foreground">Admin Review</span>
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