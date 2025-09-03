"use client"

import { Input } from "@/components/input";
import { useEffect, useState } from "react";
import { FiSearch } from "react-icons/fi";
import { VideoForm } from "./VideoForm";
import { VideoCard } from "../VideoCard";
import { Video } from "@/interfaces/videos";
import { SocialNetworkData } from "@/interfaces/social-networks";

export default function Videos() {
    const [socialNetworks, setSocialNetworks] = useState<SocialNetworkData[]>([])
    const [searchTerm, setSearchTerm] = useState("");
    const isLoading = false;
    
    async function fetchSocialNetworks() {
        try {
            const response = await fetch("/api/social", {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            })

            if (!response.ok) throw new Error("Falha ao buscar redes sociais")
            const data = (await response.json()) as SocialNetworkData[]
            setSocialNetworks(data)
        } catch (error) {
            console.log(error)
        }
    }

    
    useEffect(() => {
        fetchSocialNetworks()
    }, [])

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-lg">Carregando...</div>
            </div>
        );
    }

    return (
        <div>
            <VideoForm
                socialNetworks={socialNetworks}
                onSuccess={() => { }}
            />
        </div>
    )
}