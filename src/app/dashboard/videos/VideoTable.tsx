/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import * as React from "react"
import { Button } from "@/components/button"
import { Badge } from "@/components/badge"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/table"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/alert-dialog"
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/tooltip"
import { getBrandIcon } from "@/components/social-icons"
import { FiTrash2, FiVideo, FiFile } from "react-icons/fi"
import type { Video } from "@/interfaces/videos"

type AnyLink = {
  id: string
  url: string
  posted_at?: string | null
  postedAt?: string | null
  social_network?: { name: string; icon: string }
  socialNetwork?: { name: string; icon: string }
}

type Props = {
  data: Video[]
  query?: string
  onDelete?: (video: Video) => Promise<void> | void
}

function toDate(d?: string | Date | null) {
  if (!d) return null
  if (d instanceof Date) return d
  const dt = new Date(d)
  return isNaN(dt.getTime()) ? null : dt
}
function formatBR(d?: string | Date | null) {
  const dt = toDate(d)
  return dt ? dt.toLocaleDateString("pt-BR") : "—"
}
function normalizeTags(tags: unknown): string[] {
  if (!tags) return []
  if (Array.isArray(tags)) return tags.filter((t): t is string => typeof t === "string")
  if (typeof tags === "string") {
    try {
      const arr = JSON.parse(tags)
      if (Array.isArray(arr)) return arr.filter((t): t is string => typeof t === "string")
    } catch {}
    return tags.split(",").map((t) => t.trim()).filter(Boolean)
  }
  return []
}

export function VideosTable({ data, query, onDelete }: Props) {
  const [confirm, setConfirm] = React.useState<Video | null>(null)

  const filtered = React.useMemo(() => {
    const q = (query ?? "").trim().toLowerCase()
    if (!q) return data
    return data.filter((v: any) => {
      const title = String(v.title ?? "").toLowerCase()
      const desc = String(v.description ?? "").toLowerCase()
      const tags = normalizeTags(v.tags).join(" ").toLowerCase()
      return title.includes(q) || desc.includes(q) || tags.includes(q)
    })
  }, [data, query])

  return (
    <TooltipProvider delayDuration={0}>
      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[160px]">Vídeo</TableHead>
              <TableHead>Título</TableHead>
              <TableHead>Redes sociais</TableHead>
              <TableHead>Publi</TableHead>
              <TableHead>Repost</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead className="w-[80px] text-right">Excluir</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                {/* colSpan atualizado: agora são 7 colunas */}
                <TableCell colSpan={7} className="py-8 text-center text-sm text-muted-foreground">
                  Nenhum vídeo encontrado.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((v: any) => {
                const id = v.id
                const title = v.title
                const description = v.description
                const tags = normalizeTags(v.tags)
                const links: AnyLink[] = (v.links ?? v.socialNetworks ?? []) as AnyLink[]
                const cover = v.cover_image_url ?? v.coverImageUrl ?? null
                const driveUrl = v.raw_video_url ?? v.rawVideoUrl ?? null
                const publi = (v.is_sponsored ?? v.isSponsored) ? "S" : "N"
                const repost = (v.is_repost ?? v.isRepost) ? "S" : "N"

                const visibleTags = tags.slice(0, 3)
                const hiddenTags = tags.slice(3)

                return (
                  <TableRow key={id}>
                    {/* Vídeo: capa + link do drive */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-20 items-center justify-center overflow-hidden rounded bg-muted">
                          {cover ? (
                            <img src={cover} alt={title} className="h-full w-full object-cover" />
                          ) : (
                            <FiVideo className="h-5 w-5 opacity-60" />
                          )}
                        </div>
                        {driveUrl && (
                          <a
                            href={driveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                            title="Abrir arquivo bruto no Drive"
                          >
                            <FiFile className="h-4 w-4" />
                            Drive
                          </a>
                        )}
                      </div>
                    </TableCell>

                    {/* Título / Descrição */}
                    <TableCell>
                      <div className="font-medium">{title}</div>
                      {description && (
                        <div className="text-xs text-muted-foreground line-clamp-2">
                          {description}
                        </div>
                      )}
                    </TableCell>

                    {/* Redes sociais: ícones com tooltip de nome + data */}
                    <TableCell>
                      <div className="flex flex-wrap items-center gap-2">
                        {links.length === 0 ? (
                          <span className="text-xs text-muted-foreground">—</span>
                        ) : (
                          links.map((link) => {
                            const sn = link.social_network ?? link.socialNetwork
                            const Icon = getBrandIcon(sn?.icon)
                            const dateLabel = formatBR(link.posted_at ?? link.postedAt)
                            const label = `${sn?.name ?? "Link"} - ${dateLabel}`

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

                    {/* Publi / Repost */}
                    <TableCell>{publi}</TableCell>
                    <TableCell>{repost}</TableCell>

                    {/* Tags: até 3 + tooltip no +N */}
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
                                <Badge variant="outline">+{hiddenTags.length}</Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                {hiddenTags.join(", ")}
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      )}
                    </TableCell>

                    {/* Excluir (confirmação) */}
                    <TableCell className="text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setConfirm(v)}
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
      </div>

      {/* Confirmação de exclusão */}
      <AlertDialog open={!!confirm} onOpenChange={(o) => !o && setConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir “{confirm?.title}”?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O vídeo será removido permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async () => {
                if (!confirm) return
                try {
                  if (onDelete) {
                    await onDelete(confirm)
                  } else {
                    await fetch(`/api/videos/${(confirm as any).id}`, { method: "DELETE" })
                  }
                } catch (e) {
                  console.error(e)
                } finally {
                  setConfirm(null)
                }
              }}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TooltipProvider>
  )
}
