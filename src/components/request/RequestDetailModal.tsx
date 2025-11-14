'use client';

import { Button } from "@/components/ui/button";
import { Request } from "@/types/request";

type RequestDetailModalProps = {
    request: Request | null;
    isOpen: boolean;
    onClose: () => void;
};

export default function RequestDetailModal({ request, isOpen, onClose }: RequestDetailModalProps) {
    if (!isOpen || !request) return null;

    const getStatusClass = (status?: string) => {
        switch ((status || "pending").toLowerCase()) {
            case "approved":
                return "text-green-600";
            case "rejected":
                return "text-red-600";
            case "pending":
            default:
                return "text-yellow-600";
        }
    };

    // Format date to local-friendly format
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return new Intl.DateTimeFormat(undefined, { year: "numeric", month: "short", day: "numeric" }).format(date);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-md shadow-lg w-96 max-w-full p-6 relative">
                <h2 className="text-xl font-semibold mb-4">Request Details</h2>

                <div className="space-y-2">
                    <p><span className="font-semibold">Employee Name:</span> {request.user.name}</p>
                    <p><span className="font-semibold">Type:</span> {request.type.toUpperCase()}</p>
                    <p><span className="font-semibold">Department:</span> {request.department.name}</p>
                    <p><span className="font-semibold">Date:</span> {formatDate(request.date)}</p>
                    <p><span className="font-semibold">Reason:</span> {request.reason}</p>
                    <p className={`font-semibold ${getStatusClass(request.status)}`}>Status: {request.status}</p>
                </div>

                <div className="flex justify-end mt-4">
                    <Button variant="outline" onClick={onClose}>Close</Button>
                </div>
            </div>
        </div>
    );
}
