"use client"

import { useSocialNetworkContext } from "@/context/SocialNetworkContext";
import { useCallback, useEffect } from "react";
import { TitlePage } from "@/components/title-page";
import { Card, CardContent } from "@/components/card";
import VideoForm from "./VideoForm";
import { toast } from "sonner";

export default function Videos() {
    const { ensureSocialNetworks } = useSocialNetworkContext()

    const handleInitialData = useCallback(async () => {
        try {
            await ensureSocialNetworks()
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Falha ao carregar redes sociais.";
            toast.error("Erro!", { description: message })
        }
    }, [ensureSocialNetworks])

    useEffect(() => {
        handleInitialData()
    }, [handleInitialData])

    return (
        <div>
            <TitlePage title={"Adicionar Novo Vídeo"} />

            <Card className="bg-white/5 border-white/5">
                <CardContent className="mt-6">
                    <VideoForm />
                </CardContent>
            </Card>
        </div>
    )
}
