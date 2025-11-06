"use client"

import { HandleLoadingParams, Loadings } from "@/interfaces/components";
import { createContext, FC, PropsWithChildren, useCallback, useContext, useMemo, useState } from "react";

type LoadingsContextProps = {
    loadings: Loadings,
    handleLoadings: (params: HandleLoadingParams) => void
}

export const LoadingsContext = createContext<LoadingsContextProps>(
    {} as LoadingsContextProps
)

export const LoadingsContextProvider: FC<PropsWithChildren> = ({ children }) => {
    const [loadings, setLoadings] = useState<Loadings>({
        social: false,
        social_editing: false,
        social_deleting: false,
        video: false,
        video_editing: false,
        video_deleting: false,
        video_social_networks: false
    })

    const handleLoadings = useCallback(({ key, value }: HandleLoadingParams) => {
        setLoadings(prev => {
            if (prev[key] === value) return prev;
            return { ...prev, [key]: value };
        });
    }, []);

    const ctx = useMemo(() => ({ loadings, handleLoadings }), [loadings, handleLoadings]);

    return (
        <LoadingsContext.Provider value={ctx}>
            {children}
        </LoadingsContext.Provider>
    )
}

export const useLoadingsContext = () => {
    const context = useContext(LoadingsContext)

    return context
}