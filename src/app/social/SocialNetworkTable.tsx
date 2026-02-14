"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { ISocialNetwork, SOCIAL_ICON_MAP } from "@/interfaces/social-networks"
import { Input } from "@/components/input"
import { Button } from "@/components/button"
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/table"
import { FiEdit2, FiTrash2, FiExternalLink, FiVideo } from "react-icons/fi"
import { Loader } from "@/components/loading"
import { SocialNetworkEditDialog } from "./SocialNetworkEditDialog"
import { SocialNetworkDeleteDialog } from "./SocialNetworkDeleteDialog"
import { useSocialNetworkContext } from "@/context/SocialNetworkContext"
import { useLoadingsContext } from "@/context/LoadingsContext"

export function SocialNetworkTable() {
    const { loadings, handleLoadings } = useLoadingsContext()
    const { socialNetworks, fetchSocialNetworks } = useSocialNetworkContext()
    const [inputSearch, setInputSearch] = useState("")
    const [editing, setEditing] = useState<ISocialNetwork | null>(null)
    const [deleting, setDeleting] = useState<ISocialNetwork | null>(null)

    const filteredSocialNetworks = useMemo(() => {
        const q = inputSearch.trim().toLowerCase()
        if (!q) return socialNetworks ?? []
        return socialNetworks?.filter((n) => n.name.toLowerCase().includes(q) || n.url.toLowerCase().includes(q))
    }, [socialNetworks, inputSearch])

    const handleFetchSocialNetworks = useCallback(async () => {
        try {
            handleLoadings({
                key: "social",
                value: true
            })

            await fetchSocialNetworks()
        } catch (error) {
            console.error("[SOCIAL_NETWORKS][FETCH]", error)
        } finally {
            handleLoadings({
                key: "social",
                value: false
            })
        }
    }, [fetchSocialNetworks, handleLoadings])

    useEffect(() => {
        (async () => {
            await Promise.all([
                handleFetchSocialNetworks()
            ])
        })()
    }, [handleFetchSocialNetworks])

    return (
        <div>
            <div className="mb-4 flex items-center justify-between gap-2">
                <Input
                    placeholder="Buscar por nome ou URL..."
                    value={inputSearch}
                    onChange={(e) => setInputSearch(e.target.value)}
                    className="w-full md:max-w-sm"
                />
            </div>

            <div className="overflow-x-auto rounded-md border border-white/10 bg-black/20">
                <Table>
                    <TableHeader className="bg-white text-slate-600">
                        <TableRow>
                            <TableHead className="w-[80px]">Ícone</TableHead>
                            <TableHead>Nome</TableHead>
                            <TableHead>URL</TableHead>
                            <TableHead className="w-[120px] text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loadings.social ? (
                            <TableRow>
                                <TableCell colSpan={4} className="py-8 text-center text-sm text-muted-foreground">
                                    <Loader label="Carregando redes sociais..." />
                                </TableCell>
                            </TableRow>
                        ) : (
                            <>
                                {filteredSocialNetworks?.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="py-8 text-center text-sm text-muted-foreground">
                                            Nenhuma rede encontrada.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredSocialNetworks?.map((social) => {
                                        const SocialIcon = SOCIAL_ICON_MAP[social.icon] ?? FiVideo
                                        const key = social.id ?? `${social.name}-${social.url}`

                                        return (
                                            <TableRow key={key}>
                                                <TableCell>
                                                    <SocialIcon className="h-5 w-5" />
                                                </TableCell>
                                                <TableCell className="font-medium">{social.name}</TableCell>
                                                <TableCell className="max-w-[420px]">
                                                    <a
                                                        href={social.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1 text-primary hover:underline"
                                                    >
                                                        <FiExternalLink className="h-3 w-3" />
                                                        <span className="truncate">{social.url}</span>
                                                    </a>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-1">
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => setEditing(social)}
                                                            aria-label={`Editar ${social.name}`}
                                                        >
                                                            <FiEdit2 className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            className="text-destructive hover:text-destructive"
                                                            onClick={() => setDeleting(social)}
                                                            aria-label={`Remover ${social.name}`}
                                                        >
                                                            <FiTrash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })
                                )}
                            </>
                        )}
                    </TableBody>
                </Table>
            </div>

            <SocialNetworkEditDialog editing={editing} setEditing={setEditing} />

            <SocialNetworkDeleteDialog deleting={deleting} setDeleting={setDeleting} />
        </div>
    )
}
