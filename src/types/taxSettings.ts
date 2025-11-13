// @/types/taxSettings.ts

export interface TaxSettings {
    _id: string;
    taxPercentage: number;
    incomeTax: number;
    healthInsurance: number;
    otherDeductions: number;
    overtimeRate: number;
    createdAt: string;
    updatedAt: string;
}

export interface UpdateTaxSettingsPayload {
    taxPercentage: number;
    incomeTax: number;
    healthInsurance: number;
    otherDeductions: number;
    overtimeRate: number;
}