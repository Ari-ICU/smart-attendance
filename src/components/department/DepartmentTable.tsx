'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DepartmentHeader } from "@/components/department/DepartmentHeader";
import { DepartmentForm } from "@/components/department/DepartmentForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import Image from "next/image";
import { Edit, Trash2 } from "lucide-react";
import { Department } from "@/types/department";
import { useDepartments } from "@/hooks/department.hook";
import { useUsers } from "@/hooks/user.hook";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export function DepartmentTable() {
    const {
        departments,
        loading,
        error,
        handleCreateDepartment,
        handleUpdateDepartment,
        handleDeleteDepartment,
    } = useDepartments();

    const { users, fetchUsers } = useUsers();

    const [filter, setFilter] = useState("all");
    const [showForm, setShowForm] = useState(false);
    const [editData, setEditData] = useState<Department | null>(null);
    const [viewData, setViewData] = useState<Department | null>(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleAddDepartment = () => {
        setEditData(null);
        setShowForm(true);
    };

    const handleSubmit = async (data: {
        id?: string;
        name: string;
        manager: string;
        positions: string[];
        salary: number;
        image?: File | null;
        removeImage?: boolean;
    }) => {
        if (!data.name || !data.manager || data.positions.length === 0 || !data.salary) {
            toast.error("Name, Manager, Salary, and at least one Position are required.");
            return;
        }

        try {
            const formData = new FormData();
            formData.append("name", data.name);
            formData.append("manager", data.manager);
            formData.append("salary", data.salary.toString());
            data.positions.forEach((p, i) => formData.append(`positions[${i}]`, p));
            if (data.image instanceof File) formData.append("image", data.image);
            if (data.removeImage) formData.append("removeImage", "true");

            if (data.id) {
                await handleUpdateDepartment(data.id, formData);
                toast.success("Department updated successfully!");
            } else {
                await handleCreateDepartment(formData);
                toast.success("Department created successfully!");
            }

            setShowForm(false);
            setEditData(null);
        } catch (err: unknown) {
            console.error("Department submission error:", err);
            if (err instanceof Error) {
                toast.error(err.message.includes("duplicate")
                    ? "Department name already exists."
                    : err.message || "Failed to submit department");
            } else {
                toast.error("An unexpected error occurred");
            }
        }
    };

    const handleEdit = (dept: Department, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditData(dept);
        setShowForm(true);
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm("Are you sure you want to delete this department?")) return;

        try {
            await handleDeleteDepartment(id);
            toast.success("Department deleted successfully.");
        } catch (err) {
            console.error("Delete department error:", err);
            toast.error("Failed to delete department.");
        }
    };

    const handleRowClick = (dept: Department) => setViewData(dept);
    const handleCloseView = () => setViewData(null);

    const handleFilterChange = (value: string) => setFilter(value);
    const filteredDepartments =
        filter === "all" ? departments : departments.filter((d) => d.name === filter);

    const getEmployeeCount = (deptName: string) =>
        users.filter((u) => u.department === deptName).length;

    const formatSalary = (amount?: number) =>
        amount ? `$${amount.toLocaleString()}` : "-";

    return (
        <div className="space-y-6">
            <DepartmentHeader
                title="Department Management"
                description="Manage all company departments, managers, positions, and their assigned employees."
                buttonLabel="+ Add Department"
                onButtonClick={handleAddDepartment}
                onFilterChange={handleFilterChange}
                departments={departments}
            />

            {showForm && (
                <DepartmentForm
                    open={showForm}
                    setOpen={setShowForm}
                    onCreate={handleSubmit}
                    onUpdate={handleSubmit}
                    editData={
                        editData
                            ? {
                                id: editData.id,
                                name: editData.name,
                                manager: editData.manager,
                                positions: Array.isArray(editData.positions)
                                    ? editData.positions
                                    : [editData.positions ?? ""],
                                salary: editData.salary,
                                image: editData.image,
                            }
                            : undefined
                    }
                />
            )}

            {viewData && (
                <Dialog open={!!viewData} onOpenChange={handleCloseView}>
                    <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" />
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Department Details</DialogTitle>
                            <DialogDescription>View department information below.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 mt-4 grid grid-cols-2">
                            {viewData.image && (
                                <div className="flex justify-center">
                                    <Image
                                        src={viewData.image}
                                        alt={viewData.name}
                                        width={72}
                                        height={72}
                                        unoptimized
                                        className="rounded-lg border object-cover"
                                    />
                                </div>
                            )}
                            <div className="space-y-4">
                                <div>
                                    <p className="font-medium">Department Name:</p>
                                    <p className="text-muted-foreground">{viewData.name}</p>
                                </div>
                                <div>
                                    <p className="font-medium">Manager Name:</p>
                                    <p className="text-muted-foreground">{viewData.manager}</p>
                                </div>
                                <div>
                                    <p className="font-medium">Salary:</p>
                                    <p className="text-muted-foreground">{formatSalary(viewData.salary)}</p>
                                </div>
                            </div>
                            <div>
                                <p className="font-medium">Positions:</p>
                                {Array.isArray(viewData.positions) && viewData.positions.length > 0 ? (
                                    <ul className="list-disc list-inside text-muted-foreground">
                                        {viewData.positions.map((pos, i) => (
                                            <li key={i}>{pos}</li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-muted-foreground italic">No positions listed</p>
                                )}
                            </div>
                            <div>
                                <p className="font-medium">Employees:</p>
                                <p className="text-muted-foreground">{getEmployeeCount(viewData.name)}</p>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Departments</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <p className="text-center text-muted-foreground">Loading departments...</p>
                    ) : error ? (
                        <p className="text-center text-destructive">{error}</p>
                    ) : (
                        <table className="w-full text-sm border-collapse">
                            <thead>
                                <tr className="border-b text-left">
                                    <th className="p-2">#</th>
                                    <th className="p-2">Image</th>
                                    <th className="p-2">Name</th>
                                    <th className="p-2">Manager</th>
                                    <th className="p-2">Positions</th>
                                    <th className="p-2">Salary</th>
                                    <th className="p-2">Employees</th>
                                    <th className="p-2 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <AnimatePresence>
                                    {filteredDepartments.length === 0 ? (
                                        <motion.tr
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                        >
                                            <td colSpan={8} className="p-4 text-center text-muted-foreground">
                                                No departments found.
                                            </td>
                                        </motion.tr>
                                    ) : (
                                        filteredDepartments.map((dept, index) => (
                                            <motion.tr
                                                key={dept.id || index}
                                                onClick={() => handleRowClick(dept)}
                                                className="border-b hover:bg-muted/50 cursor-pointer transition-colors"
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, x: -50 }}
                                                layout
                                            >
                                                <td className="p-2">{index + 1}</td>
                                                <td className="p-2">
                                                    {dept.image ? (
                                                        <img
                                                            src={dept.image}
                                                            alt={dept.name}
                                                            className="w-10 h-10 rounded object-cover border"
                                                        />
                                                    ) : (
                                                        <span className="text-muted-foreground">No Image</span>
                                                    )}
                                                </td>
                                                <td className="p-2">{dept.name}</td>
                                                <td className="p-2">{dept.manager}</td>
                                                <td className="p-2">
                                                    {Array.isArray(dept.positions)
                                                        ? dept.positions.join(", ")
                                                        : dept.positions || "-"}
                                                </td>
                                                <td className="p-2">{formatSalary(dept.salary)}</td>
                                                <td className="p-2">{getEmployeeCount(dept.name)}</td>
                                                <td className="p-2 text-center space-x-1">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={(e) => handleEdit(dept, e)}
                                                        className="h-8 w-8 p-0"
                                                        title="Edit Department"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={(e) => handleDelete(dept.id!, e)}
                                                        className="h-8 w-8 p-0"
                                                        title="Delete Department"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </td>
                                            </motion.tr>
                                        ))
                                    )}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
