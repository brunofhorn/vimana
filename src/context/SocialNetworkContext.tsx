"use client"

import { createContext, FC, PropsWithChildren, useCallback, useContext, useRef, useState } from "react"
import { ISocialNetwork, SocialNetworkUpdateInput } from "@/interfaces/social-networks"
import { SocialNetworksFormCreateValues } from "@/schemas/social"
import { deleteSocialNetwork, getSocialNetworks, postSocialNetwork, putSocialNetwork } from "@/services/social"

type SocialNetworkContextProps = {
    socialNetworks: ISocialNetwork[] | null
    fetchSocialNetworks: () => Promise<void>
    ensureSocialNetworks: (force?: boolean) => Promise<void>
    createSocialNetwork: (params: SocialNetworksFormCreateValues) => Promise<void>
    updateSocialNetwork: (params: SocialNetworkUpdateInput) => Promise<void>
    removeSocialNetwork: (id: string) => Promise<void>
}

export const SocialNetworkContext = createContext<SocialNetworkContextProps>(
    {} as SocialNetworkContextProps
)

export const SocialNetworkContextProvider: FC<PropsWithChildren> = ({ children }) => {
    const [socialNetworks, setSocialNetworks] = useState<ISocialNetwork[] | null>(null)
    const backupRef = useRef<ISocialNetwork[] | null>(null);
    const inFlightFetchRef = useRef<Promise<void> | null>(null);

    const fetchSocialNetworks = useCallback(async () => {
        const socialNetworkResponse = await getSocialNetworks()

        setSocialNetworks(socialNetworkResponse)
    }, [])

    const ensureSocialNetworks = useCallback(async (force = false) => {
        if (!force && socialNetworks !== null) return;

        if (inFlightFetchRef.current) {
            await inFlightFetchRef.current;
            return;
        }

        inFlightFetchRef.current = (async () => {
            try {
                await fetchSocialNetworks();
            } finally {
                inFlightFetchRef.current = null;
            }
        })();

        await inFlightFetchRef.current;
    }, [fetchSocialNetworks, socialNetworks]);

    const createSocialNetwork = useCallback(async (newSocialNetwork: SocialNetworksFormCreateValues) => {
        const tempId = `tmp_${Math.random().toString(36).slice(2)}`;
        const now = new Date().toISOString();

        const optimistic: ISocialNetwork = {
            id: tempId,
            name: newSocialNetwork.name,
            url: newSocialNetwork.url,
            icon: newSocialNetwork.icon,
            created_at: now,
            updated_at: now,
        };

        setSocialNetworks(prev => (prev ? [optimistic, ...prev] : [optimistic]));

        try {
            const saved = await postSocialNetwork(newSocialNetwork)
            setSocialNetworks(prev => prev?.map(s => (s.id === tempId ? saved : s)) ?? [saved]);
        } catch (e) {
            setSocialNetworks(prev => prev?.filter(s => s.id !== tempId) ?? []);
            throw e;
        }
    }, [setSocialNetworks]);

    const updateSocialNetwork = useCallback(async ({ id, data }: SocialNetworkUpdateInput) => {
        setSocialNetworks(prev => {
            backupRef.current = prev ?? [];
            const list = prev ?? [];
            const optimisticUpdatedAt = new Date().toISOString();

            const exists = list.some(s => s.id === id);
            if (!exists) return list;

            return list.map(s =>
                s.id === id
                    ? { ...s, ...data, updated_at: optimisticUpdatedAt }
                    : s
            );
        });

        try {
            const saved = await putSocialNetwork({ id, data });

            setSocialNetworks(prev => {
                const list = prev ?? [];
                if (!list.some(s => s.id === saved.id)) return [saved, ...list];
                return list.map(s => (s.id === saved.id ? saved : s));
            });
        } catch (e) {
            setSocialNetworks(backupRef.current ?? []);
            throw e;
        } finally {
            backupRef.current = null;
        }
    }, []);


    const removeSocialNetwork = useCallback(async (id: string) => {
        setSocialNetworks(prev => {
            backupRef.current = prev ?? [];
            return (prev ?? []).filter(l => l.id !== id);
        });

        try {
            await deleteSocialNetwork(id)
        } catch (e) {
            setSocialNetworks(backupRef.current ?? []);
            throw e;
        }
    }, []);

    return (
        <SocialNetworkContext.Provider value={{
            socialNetworks,
            fetchSocialNetworks,
            ensureSocialNetworks,
            createSocialNetwork,
            updateSocialNetwork,
            removeSocialNetwork
        }}>
            {children}
        </SocialNetworkContext.Provider>
    )
}

export const useSocialNetworkContext = () => {
    const context = useContext(SocialNetworkContext)

    return context
}
