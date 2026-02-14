"use client"

import { useCallback, useEffect, useState } from "react"
import { useLoadingsContext } from "@/context/LoadingsContext"
import { useVideoContext } from "@/context/VideoContext"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/table"
import { FiCheck, FiEdit2, FiFile, FiTrash2, FiVideo, FiX } from "react-icons/fi"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/tooltip"
import { Badge } from "@/components/badge"
import { Loader } from "@/components/loading"
import { CoverPreview, IVideo, IVideoLinks } from "@/interfaces/videos"
import { normalizeTags } from "@/utils/normalize-tags"
import { drivePreviewCandidates, driveThumb } from "@/utils/drive-url"
import { getBrandIcon } from "@/components/social-icons"
import { formatDateBR } from "@/utils/format-date-to-br"
import VideoCoverPreview from "./VideoCoverPreview"
import { Button } from "@/components/button"
import VideoDeleteDialog from "./VideoDeleteDialog"
import VideoEditDialog from "./VideoEditDialog"
import { useRouter } from "next/navigation"

export default function VideoTable() {
    const router = useRouter()
    const { loadings, handleLoadings } = useLoadingsContext()
    const { videos, fetchVideos, filteredVideos, pageVideos } = useVideoContext()
    const [coverPreview, setCoverPreview] = useState<CoverPreview | null>(null)
    const [videoEditing, setVideoEditing] = useState<IVideo | null>(null)
    const [videoDeleting, setVideoDeleting] = useState<IVideo | null>(null)

    const handleFetchVideos = useCallback(async () => {
        try {
            handleLoadings({
                key: "video",
                value: true
            })

            await fetchVideos()
        } catch (error) {
            console.error("[SOCIAL_NETWORKS][FETCH]", error)
        } finally {
            handleLoadings({
                key: "video",
                value: false
            })
        }
    }, [fetchVideos, handleLoadings])

    useEffect(() => {
        (async () => {
            await Promise.all([
                handleFetchVideos()
            ])
        })()
    }, [handleFetchVideos])

    return (
        <div className="overflow-x-auto rounded-md border">
            <TooltipProvider delayDuration={0}>
                <Table>
                    <TableHeader className="bg-white text-slate-600">
                        <TableRow>
                            <TableHead className="w-40">Vídeo</TableHead>
                            <TableHead className="w-96">Título</TableHead>
                            <TableHead>Redes sociais</TableHead>
                            <TableHead className="text-center">Publi</TableHead>
                            <TableHead className="text-center">Repost</TableHead>
                            <TableHead>Tags</TableHead>
                            <TableHead className="w-20 text-center">Excluir</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {loadings.video ? (
                            <TableRow>
                                <TableCell colSpan={7} className="py-8 text-center text-sm text-muted-foreground">
                                    <Loader label="Carregando vídeos..." />
                                </TableCell>
                            </TableRow>
                        ) : !videos || videos.length === 0 ? (
                            // nenhum vídeo cadastrado ainda
                            <TableRow>
                                <TableCell colSpan={7} className="py-8 text-center text-sm text-muted-foreground">
                                    Nenhum vídeo cadastrado.
                                </TableCell>
                            </TableRow>
                        ) : filteredVideos.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="py-8 text-center text-sm text-muted-foreground">
                                    Nenhum vídeo encontrado com os filtros atuais.
                                </TableCell>
                            </TableRow>
                        ) : (
                            pageVideos?.map((video: IVideo) => {
                                const {
                                    id,
                                    title,
                                    description,
                                    tags: videoTags,
                                    cover_image_url,
                                    raw_video_url,
                                    links,
                                    is_sponsored,
                                    is_repost
                                } = video

                                const coverThumbSm = cover_image_url ? driveThumb(cover_image_url, "w200-h112") : null
                                const coverCandidates = cover_image_url ? drivePreviewCandidates(cover_image_url) : []
                                const tags = normalizeTags(videoTags)
                                const visibleTags = tags.slice(0, 3)
                                const hiddenTags = tags.slice(3)
                                const socialLinks: IVideoLinks[] = (links ?? []) as IVideoLinks[]
                                const publi = is_sponsored ? "S" : "N"
                                const repost = is_repost ? "S" : "N"

                                return (
                                    <TableRow key={id} className="hover:bg-slate-900">
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <button
                                                    type="button"
                                                    className="flex h-12 w-20 cursor-pointer items-center justify-center overflow-hidden rounded bg-muted focus:outline-none focus:ring-2 focus:ring-ring"
                                                    onClick={() =>
                                                        coverCandidates.length && setCoverPreview({ srcs: coverCandidates, alt: title })
                                                    }
                                                    title={title}
                                                    disabled={!coverCandidates.length}
                                                >
                                                    {coverThumbSm ? (
                                                        <img src={coverThumbSm} alt={title} className="h-full w-full object-cover" />
                                                    ) : (
                                                        <FiVideo className="h-5 w-5 opacity-60" />
                                                    )}
                                                </button>

                                                {raw_video_url && (
                                                    <a
                                                        href={raw_video_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1 text-sm text-white hover:underline "
                                                        title="Abrir arquivo bruto no Drive"
                                                    >
                                                        <FiFile className="h-4 w-4" />
                                                        Drive
                                                    </a>
                                                )}
                                            </div>
                                        </TableCell>

                                        <TableCell>
                                            <div className="font-medium">{title}</div>
                                            {description && (
                                                <div className="text-xs text-muted-foreground line-clamp-2">
                                                    {description}
                                                </div>
                                            )}
                                        </TableCell>

                                        <TableCell>
                                            <div className="flex flex-wrap items-center gap-2">
                                                {socialLinks.length === 0 ? (
                                                    <span className="text-xs text-muted-foreground">—</span>
                                                ) : (
                                                    socialLinks.map((link) => {
                                                        const Icon = getBrandIcon(link.social_network?.icon)
                                                        const label = `${link.social_network?.name ?? "Link"} - ${formatDateBR(link.posted_at)}`

                                                        return (
                                                            <Tooltip key={link.id}>
                                                                <TooltipTrigger asChild>
                                                                    <a
                                                                        href={link.url}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="inline-flex"
                                                                        aria-label={label}
                                                                    >
                                                                        <Icon className="h-4 w-4" />
                                                                    </a>
                                                                </TooltipTrigger>
                                                                <TooltipContent>{label}</TooltipContent>
                                                            </Tooltip>
                                                        )
                                                    })
                                                )}
                                            </div>
                                        </TableCell>

                                        <TableCell>
                                            <div className="flex justify-center">
                                                {publi === "S" ? <FiCheck size={20} color={"green"} /> : <FiX size={20} color={"red"} />}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex justify-center">
                                                {repost === "S" ? <FiCheck size={20} color={"green"} /> : <FiX size={20} color={"red"} />}
                                            </div>
                                        </TableCell>

                                        <TableCell>
                                            {tags.length === 0 ? (
                                                <span className="text-xs text-muted-foreground">—</span>
                                            ) : (
                                                <div className="flex flex-wrap items-center gap-1">
                                                    {visibleTags.map((t, i) => (
                                                        <Badge key={`${id}-tag-${i}`} variant="secondary">
                                                            {t}
                                                        </Badge>
                                                    ))}
                                                    {hiddenTags.length > 0 && (
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Badge variant="secondary">+{hiddenTags.length}</Badge>
                                                            </TooltipTrigger>
                                                            <TooltipContent>{hiddenTags.join(", ")}</TooltipContent>
                                                        </Tooltip>
                                                    )}
                                                </div>
                                            )}
                                        </TableCell>

                                        <TableCell className="flex flex-row gap-2 items-center justify-center">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                title="Editar publicações"
                                                aria-label="Editar publicações"
                                                onClick={() => router.push(`/videos/${video.id}/edit`)}
                                            >
                                                <FiEdit2 className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="text-destructive hover:text-destructive"
                                                onClick={() => setVideoDeleting(video)}
                                                aria-label={`Excluir ${title}`}
                                            >
                                                <FiTrash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                )
                            })
                        )}
                    </TableBody>
                </Table>
            </TooltipProvider>

            <VideoCoverPreview coverPreview={coverPreview} setCoverPreview={setCoverPreview} />
            <VideoDeleteDialog videoDeleting={videoDeleting} setVideoDeleting={setVideoDeleting} />
            <VideoEditDialog videoEditing={videoEditing} setVideoEditing={setVideoEditing} />
        </div>
    )
}