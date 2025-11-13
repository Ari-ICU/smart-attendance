'use client';

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";

type RequestHeaderProps = {
    title: string;
    types: string[]; // all available types
    selectedType: string;
    onTypeChange: (type: string) => void;
    onCreate?: () => void;
};

export default function RequestHeader({ title, types, selectedType, onTypeChange, onCreate }: RequestHeaderProps) {
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const handleSelect = (type: string) => {
        onTypeChange(type);
        setOpen(false);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
            <h2 className="text-xl font-semibold">{title}</h2>

            <div className="relative flex items-center gap-2" ref={dropdownRef}>
                {/* Dropdown button */}
                <Button
                    size="sm"
                    variant="outline"
                    className="flex justify-between items-center w-36"
                    onClick={() => setOpen(!open)}
                >
                    {selectedType.toUpperCase()}
                    <span className="ml-2 text-sm">{open ? "▲" : "▼"}</span>
                </Button>

                {/* Dropdown menu */}
                {open && (
                    <ul className="absolute top-full left-0 mt-1 w-36 bg-white border rounded-md shadow-md z-20 overflow-auto max-h-60">
                        {["All", ...types].map(type => (
                            <li key={type}>
                                <button
                                    className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${
                                        selectedType === type ? "font-semibold bg-gray-200" : ""
                                    }`}
                                    onClick={() => handleSelect(type)}
                                >
                                    {type.toUpperCase()}
                                </button>
                            </li>
                        ))}
                    </ul>
                )}

                {onCreate && (
                    <Button size="sm" variant="default" onClick={onCreate}>
                        Create New Request
                    </Button>
                )}
            </div>
        </div>
    );
}
