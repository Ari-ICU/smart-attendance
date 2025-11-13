'use client';

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type RequestFormProps = {
    types?: string[];         // optional
    departments?: string[];   // optional
    onSubmit: (data: { name: string; department: string; type: string; date: string; reason: string }) => void;
    onCancel?: () => void;
};

export default function RequestForm({ types = [], departments = [], onSubmit, onCancel }: RequestFormProps) {
    const [name, setName] = useState("");
    const [department, setDepartment] = useState(departments[0] || "");
    const [type, setType] = useState(types[0] || "");
    const [date, setDate] = useState("");
    const [reason, setReason] = useState("");
    const [typeOpen, setTypeOpen] = useState(false);
    const [deptOpen, setDeptOpen] = useState(false);

    const typeRef = useRef<HTMLDivElement>(null);
    const deptRef = useRef<HTMLDivElement>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !date || !reason) return;
        onSubmit({ name, department, type, date, reason });
        setName("");
        setDepartment(departments[0] || "");
        setType(types[0] || "");
        setDate("");
        setReason("");
        setTypeOpen(false);
        setDeptOpen(false);
    };

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (typeRef.current && !typeRef.current.contains(event.target as Node)) setTypeOpen(false);
            if (deptRef.current && !deptRef.current.contains(event.target as Node)) setDeptOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <form onSubmit={handleSubmit} className="space-y-4 border p-4 rounded-md bg-white shadow-sm">
            {/* Employee Name */}
            <div>
                <Label htmlFor="name">Employee Name</Label>
                <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="mt-1 w-full"
                    placeholder="Enter employee name"
                />
            </div>

            {/* Department dropdown */}
            <div className="relative" ref={deptRef}>
                <Label>Department</Label>
                <Button
                    type="button"
                    variant="outline"
                    className="w-full text-left mt-1 flex justify-between items-center"
                    onClick={() => setDeptOpen(!deptOpen)}
                    disabled={departments.length === 0} // disable if no departments
                >
                    {department ? department.toUpperCase() : "Select Department"}
                    <span className="ml-2">{deptOpen ? "▲" : "▼"}</span>
                </Button>
                {deptOpen && (
                    <div className="absolute z-20 mt-1 w-full border rounded-md bg-white shadow-lg max-h-60 overflow-auto">
                        {departments.map((d) => (
                            <div
                                key={d}
                                className={`px-3 py-2 cursor-pointer hover:bg-blue-50 ${
                                    d === department ? "bg-blue-100 font-medium" : ""
                                }`}
                                onClick={() => {
                                    setDepartment(d);
                                    setDeptOpen(false);
                                }}
                            >
                                {d.toUpperCase()}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Type dropdown */}
            <div className="relative" ref={typeRef}>
                <Label>Type</Label>
                <Button
                    type="button"
                    variant="outline"
                    className="w-full text-left mt-1 flex justify-between items-center"
                    onClick={() => setTypeOpen(!typeOpen)}
                    disabled={types.length === 0} // disable if no types
                >
                    {type ? type.toUpperCase() : "Select Type"}
                    <span className="ml-2">{typeOpen ? "▲" : "▼"}</span>
                </Button>
                {typeOpen && (
                    <div className="absolute z-20 mt-1 w-full border rounded-md bg-white shadow-lg max-h-60 overflow-auto">
                        {types.map((t) => (
                            <div
                                key={t}
                                className={`px-3 py-2 cursor-pointer hover:bg-blue-50 ${
                                    t === type ? "bg-blue-100 font-medium" : ""
                                }`}
                                onClick={() => {
                                    setType(t);
                                    setTypeOpen(false);
                                }}
                            >
                                {t.toUpperCase()}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Date input */}
            <div>
                <Label htmlFor="date">Date</Label>
                <Input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="mt-1 w-full"
                />
            </div>

            {/* Reason textarea */}
            <div>
                <Label htmlFor="reason">Reason</Label>
                <Textarea
                    id="reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    required
                    className="mt-1 w-full"
                    placeholder="Enter reason for request"
                />
            </div>

            {/* Actions */}
            <div className="flex gap-2 justify-end">
                {onCancel && (
                    <Button variant="outline" onClick={onCancel}>Cancel</Button>
                )}
                <Button type="submit" variant="default">Submit</Button>
            </div>
        </form>
    );
}
