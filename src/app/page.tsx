"use client"

import Link from "next/link";
import { Button } from "@/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/card";
import { useVideoContext } from "@/context/VideoContext";
import { FiPlus, FiShare, FiVideo } from "react-icons/fi";
import { useSocialNetworkContext } from "@/context/SocialNetworkContext";

export default function Dashboard() {
    const { videos } = useVideoContext()
    const { socialNetworks } = useSocialNetworkContext()

    const totalVideos = videos?.length
    const totalSocialNetworks = socialNetworks?.length

    return (
        <div className="container mx-auto">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold mb-4">Video Social Manager</h1>
                <p className="text-xl text-muted-foreground">
                    Gerencie seus vídeos e publicações nas redes sociais
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Vídeos Cadastrados</CardTitle>
                        <FiVideo className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalVideos}</div>
                        <div className="flex items-center justify-between mt-4">
                            <p className="text-xs text-muted-foreground">
                                Total de vídeos no sistema
                            </p>
                            <Button asChild size="sm">
                                <Link href="/videos">
                                    <FiPlus className="w-4 h-4 mr-2" />
                                    Adicionar
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Redes Sociais</CardTitle>
                        <FiShare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalSocialNetworks}</div>
                        <div className="flex items-center justify-between mt-4">
                            <p className="text-xs text-muted-foreground">
                                Redes sociais configuradas
                            </p>
                            <Button asChild size="sm">
                                <Link href="/dashboard/social">
                                    <FiPlus className="w-4 h-4 mr-2" />
                                    Configurar
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="text-center">
                <h2 className="text-2xl font-semibold mb-4">Começar</h2>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button asChild size="lg">
                        <Link href="/social-networks">
                            <FiShare className="w-4 h-4 mr-2" />
                            Configurar Redes Sociais
                        </Link>
                    </Button>
                    <Button asChild size="lg" variant="outline">
                        <Link href="/videos">
                            <FiVideo className="w-4 h-4 mr-2" />
                            Gerenciar Vídeos
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    )
}