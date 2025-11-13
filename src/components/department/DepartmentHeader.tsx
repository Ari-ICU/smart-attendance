'use client';

import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Department } from "@/types/department";

interface DepartmentHeaderProps {
    title?: string;
    description?: string;
    departments?: Department[];
    buttonLabel?: string;
    onButtonClick?: () => void;
    onFilterChange?: (value: string) => void;
}

export function DepartmentHeader({
    title = "Departments",
    description,
    departments = [],
    buttonLabel,
    onButtonClick,
    onFilterChange,
}: DepartmentHeaderProps) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            {/* 🔹 Title + Description */}
            <div className="mb-4 sm:mb-0">
                <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
                {description && (
                    <p className="text-sm text-muted-foreground mt-1">{description}</p>
                )}
            </div>

            {/* 🔹 Actions (Filter + Button) */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                {/* Department Filter Dropdown */}
                <Select onValueChange={(value) => onFilterChange?.(value)}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by department" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem key="all" value="all">All Departments</SelectItem>
                        {departments.map((dept, index) => (
                            <SelectItem key={dept.id || index} value={dept.name}>
                                {dept.name}
                            </SelectItem>
                        ))}
                    </SelectContent>

                </Select>

                {/* Add Department Button */}
                {buttonLabel && (
                    <Button onClick={onButtonClick}>{buttonLabel}</Button>
                )}
            </div>
        </div>
    );
}
