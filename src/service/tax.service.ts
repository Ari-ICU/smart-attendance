// /src/service/tax.service.ts

import api, { getAccessToken } from "@/lib/axiosInstance";
import { TaxSettings, UpdateTaxSettingsPayload } from "@/types/taxSettings";

interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

// The return type is Promise<TaxSettings>, meaning we must return data or throw an error.
export const getTaxSettings = async (): Promise<TaxSettings> => {
    try {
        const token = getAccessToken();
        const response = await api.get<ApiResponse<TaxSettings>>(
            "/tax-settings",
            { headers: { Authorization: token ? `Bearer ${token}` : "" } }
        );
        return response.data.data;
    } catch (err) {
        // Error handling logic moved directly into the catch block
        const message = err instanceof Error ? err.message : JSON.stringify(err);
        console.error("Error in getTaxSettings:", message);
        throw new Error(message); // Must re-throw the error to satisfy the return type Promise<TaxSettings>
    }
};

export const updateTaxSettings = async (
    data: UpdateTaxSettingsPayload
): Promise<TaxSettings> => {
    try {
        const token = getAccessToken();
        const response = await api.put<ApiResponse<TaxSettings>>(
            "/tax-settings",
            data,
            { headers: { Authorization: token ? `Bearer ${token}` : "" } }
        );
        return response.data.data;
    } catch (err) {
        // Error handling logic moved directly into the catch block
        const message = err instanceof Error ? err.message : JSON.stringify(err);
        console.error("Error in updateTaxSettings:", message);
        throw new Error(message); // Must re-throw
    }
};