"use client"

import { Button } from "@/components/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/card"
import { SocialNetworkData } from "@/interfaces/social-networks"

// Feather (ações)
import { FiTrash2, FiExternalLink, FiVideo } from "react-icons/fi"
// Simple Icons (marcas)
import {
    SiInstagram,
    SiTiktok,
    SiPinterest,
    SiYoutube,
    SiLinkedin,
    SiX,
    SiThreads,
    SiFacebook,
    SiKuaishou, // Kwai
} from "react-icons/si"
import type { IconType } from "react-icons"

// Mapa: valor salvo em network.icon -> componente do ícone
const SOCIAL_ICON_MAP: Record<string, IconType> = {
    Instagram: SiInstagram,
    Tiktok: SiTiktok,      // label "TikTok"
    Pinterest: SiPinterest,
    Youtube: SiYoutube,    // label "YouTube"
    Linkedin: SiLinkedin,
    Twitter: SiX,    // troque por SiX se preferir o X (se existir na sua versão)
    Threads: SiThreads,
    Facebook: SiFacebook,
    Kwai: SiKuaishou,      // Kwai = Kuaishou
    Video: FiVideo,        // fallback genérico
}

interface SocialNetworkCardProps {
    network: SocialNetworkData
    onDelete: () => void
}

export const SocialNetworkCard = ({ network, onDelete }: SocialNetworkCardProps) => {
    const BrandIcon = SOCIAL_ICON_MAP[network.icon] ?? FiVideo

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <BrandIcon className="h-5 w-5" />
                    {network.name}
                </CardTitle>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onDelete}
                    className="text-destructive hover:text-destructive"
                    aria-label={`Excluir ${network.name}`}
                >
                    <FiTrash2 className="h-4 w-4" />
                </Button>
            </CardHeader>

            <CardContent>
                <div className="flex items-center justify-between">
                    <a
                        href={network.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-primary hover:underline"
                    >
                        <FiExternalLink className="h-3 w-3" />
                        Visitar
                    </a>
                </div>
            </CardContent>
        </Card>
    )
}
