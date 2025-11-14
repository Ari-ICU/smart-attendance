'use client';

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRequests } from "@/hooks/request.hook";
import { useUsers } from "@/hooks/user.hook";
import { useDepartments } from "@/hooks/department.hook";

type RequestFormProps = {
    types?: string[];
    onCancel?: () => void;
    onSubmit: (data: { user: string; department: string; type: string; date: string; reason: string }) => void;
};


export default function RequestForm({ types = [], onCancel }: RequestFormProps) {
    const [userId, setUserId] = useState("");
    const [deptId, setDeptId] = useState("");
    const [type, setType] = useState(types[0] || "");
    const [date, setDate] = useState("");
    const [reason, setReason] = useState("");

    const [openName, setOpenName] = useState(false);
    const [openDept, setOpenDept] = useState(false);
    const [openType, setOpenType] = useState(false);

    const nameRef = useRef<HTMLDivElement>(null);
    const deptRef = useRef<HTMLDivElement>(null);
    const typeRef = useRef<HTMLDivElement>(null);

    const { users, loading: loadingUsers } = useUsers();
    const { departments, loading: loadingDepartments } = useDepartments();
    const { createRequest, loading: loadingRequest } = useRequests();

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClick = (event: MouseEvent) => {
            if (nameRef.current && !nameRef.current.contains(event.target as Node)) setOpenName(false);
            if (deptRef.current && !deptRef.current.contains(event.target as Node)) setOpenDept(false);
            if (typeRef.current && !typeRef.current.contains(event.target as Node)) setOpenType(false);
        };
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    const selectedEmployee = users.find(e => e._id === userId);
    const selectedDepartment = departments.find(d => d._id === deptId);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userId || !deptId || !type || !date || !reason) return;

        await createRequest({ user: userId, department: deptId, type, date, reason });

        setUserId("");
        setDeptId("");
        setType(types[0] || "");
        setDate("");
        setReason("");
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 border p-4 rounded-md bg-white shadow-sm">

            {/* Employee Dropdown */}
            <div className="relative" ref={nameRef}>
                <Label>Employee Name</Label>
                <Button
                    type="button"
                    variant="outline"
                    className="w-full mt-1 justify-between"
                    onClick={() => setOpenName(!openName)}
                    disabled={loadingUsers}
                >
                    {selectedEmployee ? selectedEmployee.name : "Select Employee"}
                    <span>{openName ? "▲" : "▼"}</span>
                </Button>

                {openName && (
                    <div className="absolute z-20 w-full mt-1 border rounded-md bg-white shadow max-h-60 overflow-auto">
                        {users.map(user => (
                            <div
                                key={user._id}
                                className={`px-3 py-2 cursor-pointer hover:bg-blue-50 ${userId === user._id ? "bg-blue-100" : ""}`}
                                onClick={() => {
                                    setUserId(user._id);
                                    setOpenName(false);
                                }}
                            >
                                {user.name}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Department Dropdown */}
            <div className="relative" ref={deptRef}>
                <Label>Department</Label>
                <Button
                    type="button"
                    variant="outline"
                    className="w-full mt-1 justify-between"
                    onClick={() => setOpenDept(!openDept)}
                    disabled={loadingDepartments}
                >
                    {selectedDepartment ? selectedDepartment.name : "Select Department"}
                    <span>{openDept ? "▲" : "▼"}</span>
                </Button>

                {openDept && (
                    <div className="absolute z-20 w-full mt-1 border rounded-md bg-white shadow max-h-60 overflow-auto">
                        {departments.map(dep => (
                            <div
                                key={dep._id}
                                className={`px-3 py-2 cursor-pointer hover:bg-blue-50 ${deptId === dep._id ? "bg-blue-100" : ""}`}
                                onClick={() => {
                                    setDeptId(dep._id);
                                    setOpenDept(false);
                                }}
                            >
                                {dep.name}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Type Dropdown */}
            <div className="relative" ref={typeRef}>
                <Label>Type</Label>
                <Button
                    type="button"
                    variant="outline"
                    className="w-full mt-1 justify-between"
                    onClick={() => setOpenType(!openType)}
                >
                    {type || "Select Type"}
                    <span>{openType ? "▲" : "▼"}</span>
                </Button>

                {openType && (
                    <div className="absolute z-20 w-full mt-1 border rounded-md bg-white shadow max-h-60 overflow-auto">
                        {types.map(t => (
                            <div
                                key={t}
                                className={`px-3 py-2 cursor-pointer hover:bg-blue-50 ${type === t ? "bg-blue-100" : ""}`}
                                onClick={() => {
                                    setType(t);
                                    setOpenType(false);
                                }}
                            >
                                {t}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Date */}
            <div>
                <Label>Date</Label>
                <Input type="date" value={date} onChange={e => setDate(e.target.value)} required />
            </div>

            {/* Reason */}
            <div>
                <Label>Reason</Label>
                <Textarea value={reason} onChange={e => setReason(e.target.value)} placeholder="Enter reason" required />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2">
                {onCancel && <Button variant="outline" onClick={onCancel}>Cancel</Button>}
                <Button type="submit" disabled={loadingRequest}>{loadingRequest ? "Submitting..." : "Submit"}</Button>
            </div>
        </form>
    );
}
