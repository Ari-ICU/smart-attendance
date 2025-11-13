'use client';

import { useState, useRef, useEffect } from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Search, Download, Calendar } from 'lucide-react';

export function AttendanceFilters({
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    startDate,
    endDate,
    setStartDate,
    setEndDate,
}: {
    searchQuery: string;
    setSearchQuery: (value: string) => void;
    statusFilter: string;
    setStatusFilter: (value: string) => void;
    startDate: string;
    endDate: string;
    setStartDate: (date: string) => void;
    setEndDate: (date: string) => void;
}) {
    const [showDatePicker, setShowDatePicker] = useState(false);
    const pickerRef = useRef<HTMLDivElement>(null);

    // Close date picker when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
                setShowDatePicker(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="flex flex-col sm:flex-row gap-4 mb-6 items-start sm:items-center">
            {/* Search */}
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                    placeholder="Search by name or ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                />
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="present">Present</SelectItem>
                    <SelectItem value="absent">Absent</SelectItem>
                    <SelectItem value="late">Late</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem> {/* ✅ Added */}
                </SelectContent>
            </Select>

            {/* Date Range Picker */}
            <div className="relative" ref={pickerRef}>
                <Button
                    variant="outline"
                    onClick={() => setShowDatePicker(!showDatePicker)}
                    className="flex items-center gap-2"
                >
                    <Calendar className="w-4 h-4" />
                    {startDate && endDate ? `${startDate} → ${endDate}` : 'Date Range'}
                </Button>

                {showDatePicker && (
                    <div className="absolute left-0 z-20 mt-2 p-4 bg-background border border-border rounded shadow-lg w-64 flex flex-col gap-4">
                        <div className="flex flex-col">
                            <label className="text-xs text-muted-foreground mb-1">Start Date</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            />
                        </div>
                        <div className="flex flex-col">
                            <label className="text-xs text-muted-foreground mb-1">End Date</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            />
                        </div>
                        <Button
                            variant="outline"
                            onClick={() => setShowDatePicker(false)}
                            className="self-end mt-2"
                        >
                            Apply
                        </Button>
                    </div>
                )}
            </div>

            {/* Export Button */}
            <Button variant="outline" className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export
            </Button>
        </div>
    );
}
