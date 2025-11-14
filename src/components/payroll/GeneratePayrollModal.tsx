// File: components/payroll/GeneratePayrollModal.tsx
import React from 'react';
import { Dispatch, SetStateAction } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { X } from 'lucide-react';

interface GeneratePayrollModalProps {
    isModalOpen: boolean;
    setIsModalOpen: Dispatch<SetStateAction<boolean>>;
    modalYear: number | '';
    setModalYear: Dispatch<SetStateAction<number | ''>>;
    modalMonth: number | '';
    setModalMonth: Dispatch<SetStateAction<number | ''>>;
    message: string;
    setMessage: Dispatch<SetStateAction<string>>;
    handleGeneratePayroll: (e: React.FormEvent) => void;
    isSubmitting: boolean;
}

export const GeneratePayrollModal = ({
    isModalOpen,
    setIsModalOpen,
    modalYear,
    setModalYear,
    modalMonth,
    setModalMonth,
    message,
    setMessage,
    handleGeneratePayroll,
    isSubmitting,
}: GeneratePayrollModalProps) => {
    if (!isModalOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <Card className="w-full max-w-md p-6 relative border">
                <button
                    className="absolute top-3 right-3 rounded-full p-1 hover:bg-muted transition-colors"
                    onClick={() => setIsModalOpen(false)}
                >
                    <X className="w-5 h-5" />
                </button>
                <div className="mb-6">
                    <h3 className="text-xl font-semibold">Generate Payroll</h3>
                    <p className="text-muted-foreground text-sm">Create payroll for a specific month</p>
                </div>
                <form className="space-y-4" onSubmit={handleGeneratePayroll}>
                    {message && (
                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-700 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-400">
                            {message}
                        </div>
                    )}
                    <div className="flex gap-2">
                        <Input
                            type="number"
                            placeholder="Year (e.g., 2025)"
                            value={modalYear}
                            onChange={(e) => setModalYear(e.target.value ? parseInt(e.target.value, 10) : '')}
                            required
                        />
                        <Input
                            type="number"
                            placeholder="Month (1-12)"
                            min={1}
                            max={12}
                            value={modalMonth}
                            onChange={(e) => setModalMonth(e.target.value ? parseInt(e.target.value, 10) : '')}
                            required
                        />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <Button type="submit" variant="default" className="flex-1 bg-primary hover:bg-primary/90" disabled={isSubmitting}>
                            {isSubmitting ? 'Generating...' : 'Generate Payroll'}
                        </Button>
                        <Button type="button" variant="outline" className="flex-1" onClick={() => setIsModalOpen(false)}>
                            Cancel
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};