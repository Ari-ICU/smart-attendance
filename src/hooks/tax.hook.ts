import { useState, useCallback, useMemo } from "react";
import {
    getTaxSettings as getTaxSettingsService,
    updateTaxSettings as updateTaxSettingsService,
} from "@/service/tax.service";
import {
    TaxSettings,
    UpdateTaxSettingsPayload,
} from "@/types/taxSettings";
import { toast } from "sonner";

export const useTaxSettings = () => {
    const [settings, setSettings] = useState<TaxSettings | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(false); // Added for fetch loading
    const [error, setError] = useState<string | null>(null);

    const fetchTaxSettings = useCallback(async () => {
        setIsLoading(true); // Start loading
        setError(null);
        try {
            const data = await getTaxSettingsService();
            setSettings(data);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err);
            setError(message);
            setSettings(null); // Clear settings on error
            toast.error(`Failed to fetch tax settings: ${message}`);
        } finally {
            setIsLoading(false); // End loading
        }
    }, []);

    const updateTaxSettings = useCallback(async (payload: UpdateTaxSettingsPayload) => {
        setIsSubmitting(true);
        setError(null);
        try {
            const updated = await updateTaxSettingsService(payload);
            if (updated) setSettings(updated);
            toast.success("Tax settings updated successfully");
            return updated;
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err);
            setError(message);
            toast.error(`Failed to update tax settings: ${message}`);
        } finally {
            setIsSubmitting(false);
        }
    }, []);

    return useMemo(() => ({
        settings,
        isSubmitting,
        isLoading, // Exposed
        error,
        fetchTaxSettings,
        updateTaxSettings,
    }), [settings, isSubmitting, isLoading, error, fetchTaxSettings, updateTaxSettings]);
};