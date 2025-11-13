import { useState, useEffect, useCallback } from "react";
import { Department } from "../types/department";
import {
    createDepartment,
    getDepartments,
    getDepartment,
    updateDepartment,
    deleteDepartment,
} from "../service/department.service";
import { toast } from "sonner";

// Normalize department data (improved: handle raw API input, always return positions as array)
const normalizeDept = (rawDept: any): Department => {
    const dept = rawDept || {};
    let positions: string[] = [];

    if (Array.isArray(dept.positions)) {
        positions = dept.positions.map((p: any) => String(p).trim()).filter(Boolean);
    } else if (typeof dept.positions === 'string' && dept.positions.trim()) {
        positions = dept.positions.split(',').map((p: string) => p.trim()).filter(Boolean);
    }

    return {
        id: dept._id || dept.id || '',
        _id: dept._id,
        name: String(dept.name || '').trim(),
        manager: String(dept.manager || '').trim(),
        positions,
        salary: Number(dept.salary) || 0,       // Ensure numeric
        image: dept.image || null,
        createdAt: dept.createdAt,
        updatedAt: dept.updatedAt,
    };
};

export const useDepartments = () => {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch all departments
    const fetchDepartments = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const rawDepts = await getDepartments(); // Direct array from service
            if (!Array.isArray(rawDepts)) {
                throw new Error('Expected array of departments from service');
            }
            const normalizedDepts = rawDepts.map(normalizeDept);
            setDepartments(normalizedDepts);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Failed to fetch departments";
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch single department by ID (separate loading if needed; using shared for simplicity)
    const getDepartmentById = async (id: string): Promise<Department | null> => {
        try {
            const rawDept = await getDepartment(id); // Direct object from service
            return normalizeDept(rawDept);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Failed to fetch department";
            setError(msg);
            toast.error(msg);
            return null;
        }
    };

    // Create new department
    const handleCreateDepartment = async (data: FormData) => {
        setIsSubmitting(true);
        setError(null);
        try {
            const rawNewDept = await createDepartment(data); // Direct object from service
            const newDept = normalizeDept(rawNewDept);
            setDepartments((prev) => [...prev, newDept]);
            toast.success("Department created successfully");
            return newDept; // Optional return for caller
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Error creating department";
            setError(msg);
            toast.error(msg);
            throw err; // Re-throw for component handling
        } finally {
            setIsSubmitting(false);
        }
    };

    // Update existing department
    const handleUpdateDepartment = async (id: string, data: FormData) => {
        setIsSubmitting(true);
        setError(null);
        try {
            const rawUpdatedDept = await updateDepartment(id, data); // Direct object from service
            const updatedDept = normalizeDept(rawUpdatedDept);
            setDepartments((prev) =>
                prev.map((dept) => (dept.id === id ? updatedDept : dept))
            );
            toast.success("Department updated successfully");
            return updatedDept; // Optional return for caller
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Error updating department";
            setError(msg);
            toast.error(msg);
            throw err; // Re-throw for component handling
        } finally {
            setIsSubmitting(false);
        }
    };

    // Delete department
    const handleDeleteDepartment = async (id: string) => {
        setIsSubmitting(true);
        setError(null);
        try {
            await deleteDepartment(id); // Service throws on error; no response needed
            setDepartments((prev) => prev.filter((dept) => dept.id !== id));
            toast.success("Department deleted successfully");
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Error deleting department";
            setError(msg);
            toast.error(msg);
            throw err; // Re-throw for component handling
        } finally {
            setIsSubmitting(false);
        }
    };

    // Load departments initially
    useEffect(() => {
        fetchDepartments();
    }, [fetchDepartments]);

    return {
        departments,
        loading,
        error,
        isSubmitting,
        fetchDepartments,
        getDepartmentById,
        handleCreateDepartment,
        handleUpdateDepartment,
        handleDeleteDepartment,
    };
};