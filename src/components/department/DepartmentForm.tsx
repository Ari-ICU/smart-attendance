'use client';

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Upload, X, Plus, Trash2 } from "lucide-react";
import Image from "next/image";

interface DepartmentFormProps {
    onCreate: (data: {
        name: string;
        manager: string;
        positions: string[];
        salary: number;
        image?: File | null;
    }) => Promise<void>;
    onUpdate?: (data: {
        id?: string;
        name: string;
        manager: string;
        positions: string[];
        salary: number;
        image?: File | null;
        removeImage?: boolean;
    }) => Promise<void>;
    open: boolean;
    setOpen: (open: boolean) => void;
    editData?: {
        id?: string;
        name: string;
        manager: string;
        positions?: string[];
        salary?: number;
        image?: string | null | undefined;
    } | null;
}

export function DepartmentForm({ onCreate, onUpdate, open, setOpen, editData }: DepartmentFormProps) {
    const [name, setName] = useState("");
    const [manager, setManager] = useState("");
    const [positions, setPositions] = useState<string[]>([""]);
    const [salary, setSalary] = useState<number>(0);
    const [image, setImage] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [removeImage, setRemoveImage] = useState(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        if (editData) {
            setName(editData.name || "");
            setManager(editData.manager || "");
            setPositions(editData.positions && editData.positions.length > 0 ? editData.positions : [""]);
            setSalary(editData.salary || 0);
            setRemoveImage(false);
            if (editData.image) {
                const imageUrl = editData.image.startsWith("http")
                    ? editData.image
                    : `${process.env.NEXT_PUBLIC_API_URL}/uploads/departments/${editData.image}`;
                setPreview(imageUrl);
            } else setPreview(null);
            setImage(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
        } else {
            resetForm();
        }
    }, [editData, open]);

    const resetForm = () => {
        setName("");
        setManager("");
        setPositions([""]);
        setSalary(0);
        setImage(null);
        setPreview(null);
        setRemoveImage(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setRemoveImage(false);
            setImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleClearImage = () => {
        setRemoveImage(!!editData?.image);
        setImage(null);
        setPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleAddPosition = () => setPositions((prev) => [...prev, ""]);
    const handleRemovePosition = (index: number) => setPositions((prev) => prev.filter((_, i) => i !== index));
    const handlePositionChange = (index: number, value: string) => {
        setPositions((prev) => {
            const updated = [...prev];
            updated[index] = value;
            return updated;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !manager.trim() || positions.some((p) => !p.trim())) return;
        if (salary <= 0) return alert("Salary must be greater than 0");
        const cleanedPositions = positions.filter((p) => p.trim() !== "");
        try {
            if (editData && onUpdate && editData.id) {
                await onUpdate({
                    id: editData.id,
                    name,
                    manager,
                    positions: cleanedPositions,
                    salary,
                    image,
                    removeImage,
                });
            } else {
                await onCreate({
                    name,
                    manager,
                    positions: cleanedPositions,
                    salary,
                    image,
                });
            }
            resetForm();
            setOpen(false);
        } catch (err) {
            console.error("Department form submit error:", err);
        }
    };

    const handleCancel = () => {
        resetForm();
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <div className="fixed inset-0 min-h-full bg-black/30 backdrop-blur-sm z-40" />
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{editData ? "Edit Department" : "Create Department"}</DialogTitle>
                    <DialogDescription>
                        {editData
                            ? "Update the department details below."
                            : "Fill out the form to create a new department."}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Grid for 2-column layout */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Department Name */}
                        <div className="space-y-2">
                            <Label htmlFor="name">Department Name</Label>
                            <Input
                                id="name"
                                placeholder="Enter department name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>

                        {/* Manager */}
                        <div className="space-y-2">
                            <Label htmlFor="manager">Manager</Label>
                            <Input
                                id="manager"
                                placeholder="Enter manager name"
                                value={manager}
                                onChange={(e) => setManager(e.target.value)}
                                required
                            />
                        </div>

                        {/* Salary */}
                        <div className="space-y-2">
                            <Label htmlFor="salary">Base Salary ($)</Label>
                            <Input
                                id="salary"
                                type="number"
                                placeholder="Enter base salary"
                                value={salary || ""}
                                onChange={(e) => setSalary(Number(e.target.value))}
                                required
                                min="1"
                            />
                        </div>

                        {/* Positions */}
                        <div className="space-y-2">
                            <Label>Positions</Label>
                            {positions.map((pos, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <Input
                                        placeholder={`Enter position ${index + 1}`}
                                        value={pos}
                                        onChange={(e) => handlePositionChange(index, e.target.value)}
                                        required
                                    />
                                    {positions.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleRemovePosition(index)}
                                            aria-label="Remove position"
                                        >
                                            <Trash2 size={16} />
                                        </Button>
                                    )}
                                </div>
                            ))}
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="mt-2 flex items-center gap-2"
                                onClick={handleAddPosition}
                            >
                                <Plus size={14} />
                                Add Position
                            </Button>
                        </div>
                        
                        {/* Image Upload */}
                        <div className="space-y-2">
                            <Label htmlFor="image">Department Image</Label>
                            <div className="flex items-center gap-3">
                                <Input
                                    ref={fileInputRef}
                                    id="image"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="flex items-center gap-2"
                                >
                                    <Upload size={16} />
                                    {preview ? "Change Image" : "Upload Image"}
                                </Button>
                                {preview && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={handleClearImage}
                                        aria-label="Remove image"
                                    >
                                        <X size={16} />
                                    </Button>
                                )}
                            </div>

                            {preview && (
                                <div className="mt-3">
                                    <Image
                                        src={preview}
                                        alt="Preview"
                                        width={90}
                                        height={90}
                                        className="rounded-md border object-cover"
                                        unoptimized
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Form Actions */}
                    <DialogFooter className="flex gap-2">
                        <Button type="submit">{editData ? "Update Department" : "Create Department"}</Button>
                        <Button type="button" variant="ghost" onClick={handleCancel}>
                            Cancel
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
