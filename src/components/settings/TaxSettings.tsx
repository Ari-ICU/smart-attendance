'use client';

import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface TaxSettingsProps {
    localSettings: TaxSettingsData;
    setLocalSettings: React.Dispatch<React.SetStateAction<TaxSettingsData>>;
}


// Define proper types instead of using 'any'
export interface TaxSettingsData {
    taxPercentage: number | null;
    incomeTax: number | null;
    healthInsurance: number | null;
    otherDeductions: number | null;
    overtimeRate: number | null;
}

export function TaxSettings({ localSettings, setLocalSettings }: TaxSettingsProps) {
    const fields: { label: string; key: keyof TaxSettingsData }[] = [
        { label: 'Tax Percentage (%)', key: 'taxPercentage' },
        { label: 'Income Tax (%)', key: 'incomeTax' },
        { label: 'Health Insurance (%)', key: 'healthInsurance' },
        { label: 'Other Deductions (%)', key: 'otherDeductions' },
        { label: 'Overtime Rate ($/hour)', key: 'overtimeRate' },
    ];

    const handleClear = () => {
        setLocalSettings({
            taxPercentage: null,
            incomeTax: null,
            healthInsurance: null,
            otherDeductions: null,
            overtimeRate: null,
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Tax & Deduction Settings</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {fields.map((field) => (
                        <div key={field.key} className="flex flex-col gap-1">
                            <label className="font-medium">{field.label}</label>
                            <Input
                                type="number"
                                min={0}
                                max={field.key === 'overtimeRate' ? undefined : 100}
                                step={field.key === 'overtimeRate' ? 0.01 : 0.1}
                                value={localSettings[field.key] ?? ''}
                                onChange={(e) =>
                                    setLocalSettings((prev) => ({
                                        ...prev,
                                        [field.key]: e.target.value === '' ? null : parseFloat(e.target.value) || 0,
                                    }))
                                }
                            />
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}