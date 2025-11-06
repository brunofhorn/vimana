"use client"

import { useSocialNetworkContext } from "@/context/SocialNetworkContext";
import { useCallback, useEffect } from "react";
import { TitlePage } from "@/components/title-page";
import { Card, CardContent } from "@/components/card";
import VideoForm from "./VideoForm";

export default function Videos() {
    const { fetchSocialNetworks } = useSocialNetworkContext()

    const handleFetchSocialNetworks = useCallback(async () => {
        await fetchSocialNetworks()
    }, [fetchSocialNetworks])

    useEffect(() => {
        (async () => {
            await Promise.all([
                handleFetchSocialNetworks()
            ])
        })()
    }, [handleFetchSocialNetworks])

    return (
        <div>
            <TitlePage title={"Adicionar Novo Vídeo"} />

            <Card>
                <CardContent className="mt-6">
                    <VideoForm />
                </CardContent>
            </Card>
        </div>
    )
}