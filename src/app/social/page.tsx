"use client";

import { Card, CardContent } from "@/components/card";
import { SocialNetworkTable } from "./SocialNetworkTable";
import { TitlePage } from "@/components/title-page";
import { SocialNetworkForm } from "./SocialNetworkForm";
import { useSocialNetworkContext } from "@/context/SocialNetworkContext";
import { useLoadingsContext } from "@/context/LoadingsContext";
import { useCallback, useEffect } from "react";
import { toast } from "sonner";

export default function Social() {
    const { ensureSocialNetworks } = useSocialNetworkContext();
    const { handleLoadings } = useLoadingsContext();

    const handleInitialData = useCallback(async () => {
        try {
            handleLoadings({ key: "social", value: true });
            await ensureSocialNetworks();
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Falha ao buscar redes sociais.";
            toast.error("Erro!", { description: message });
        } finally {
            handleLoadings({ key: "social", value: false });
        }
    }, [ensureSocialNetworks, handleLoadings]);

    useEffect(() => {
        handleInitialData();
    }, [handleInitialData]);

    return (
        <div>
            <TitlePage title={"Redes Sociais"} />

            <Card className="bg-white/5 border-white/5">
                <CardContent className="mt-6">
                    <SocialNetworkForm />
                </CardContent>
            </Card>

            <Card className="mt-6 bg-white/5 border-white/5">
                <CardContent className="mt-6">
                    <SocialNetworkTable />
                </CardContent>
            </Card>
        </div>
    )
}
