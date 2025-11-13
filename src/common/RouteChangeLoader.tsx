'use client';

import { useEffect, useRef } from "react";
import { useLoading } from "@/context/LoadingContext";
import { useDashboardPage } from "@/hooks/useDashboardPage";
import { useAuthContext } from "@/context/AuthContext"; // <- use context instead of useAuth
import GlobalLoading from "@/common/GlobalLoading";

const RouteChangeLoader = () => {
    const { page } = useDashboardPage();
    const { isLoading, setLoading } = useLoading();
    const { isLoading: authIsLoading } = useAuthContext(); // <- use context here
    const prevPage = useRef(page);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        console.log(
            '[RouteChangeLoader] Effect - page:', page,
            'authLoading:', authIsLoading,
            'loaderLoading:', isLoading
        );

        if (authIsLoading) return; // wait for auth

        if (prevPage.current !== page) {
            prevPage.current = page;

            if (!isLoading) setLoading(true);

            if (timerRef.current) clearTimeout(timerRef.current);

            timerRef.current = setTimeout(() => {
                setLoading(false);
                timerRef.current = null;
            }, 1000);
        }
    }, [page, isLoading, setLoading, authIsLoading]);

    useEffect(() => () => {
        if (timerRef.current) clearTimeout(timerRef.current);
    }, []);

    return <GlobalLoading />;
};

export default RouteChangeLoader;
