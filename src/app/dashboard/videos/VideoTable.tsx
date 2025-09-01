/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import * as React from "react"
import { Button } from "@/components/button"
import { Badge } from "@/components/badge"
import { Input } from "@/components/input"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/select"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/table"
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/tooltip"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/alert-dialog"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/dialog"
import { getBrandIcon } from "@/components/social-icons"
import { ImageWithFallback } from "@/components/image-fallback"
import { driveThumb, drivePreviewCandidates } from "@/utils/drive-url"
import { FiTrash2, FiVideo, FiFile } from "react-icons/fi"
import type { Video } from "@/interfaces/videos"

type AnyLink = {
  id: string
  url: string
  posted_at?: string | null
  postedAt?: string | null
  social_network?: { id?: string; name: string; icon: string }
  socialNetwork?: { id?: string; name: string; icon: string }
}

type Props = {
  data: Video[]
  onDelete?: (video: Video) => Promise<void> | void
}

function toDate(d?: string | Date | null) {
  if (!d) return null
  if (d instanceof Date) return d
  const dt = new Date(d)
  return isNaN(dt.getTime()) ? null : dt
}
function ymd(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const da = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${da}`
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
    } catch { }
    return tags.split(",").map((t) => t.trim()).filter(Boolean)
  }
  return []
}

export function VideosTable({ data, onDelete }: Props) {
  const [confirm, setConfirm] = React.useState<Video | null>(null)
  const [preview, setPreview] = React.useState<{ srcs: string[]; alt: string } | null>(null)

  // ------ filtros ------
  const [query, setQuery] = React.useState("")
  const [postedDate, setPostedDate] = React.useState<string>("") // YYYY-MM-DD
  const [social, setSocial] = React.useState<string>("")           // "" = sem filtro
  const [publi, setPubli] = React.useState<"" | "S" | "N">("")   // "" = todos
  const [repost, setRepost] = React.useState<"" | "S" | "N">("")   // "" = todos

  // redes disponíveis (derivado dos dados)
  const socialOptions = React.useMemo(() => {
    const set = new Set<string>()
    for (const v of data as any[]) {
      const links: AnyLink[] = (v.links ?? v.socialNetworks ?? []) as AnyLink[]
      for (const l of links) {
        const sn = l.social_network ?? l.socialNetwork
        if (sn?.name) set.add(sn.name)
      }
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b))
  }, [data])

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()

    return (data as any[]).filter((v) => {
      const title = String(v.title ?? "")
      const description = String(v.description ?? "")
      const tags = normalizeTags(v.tags)
      const cover = String(v.cover_image_url ?? v.coverImageUrl ?? "")
      const raw = String(v.raw_video_url ?? v.rawVideoUrl ?? "")

      // texto: título, descrição, tags, links do drive (cover/raw)
      const textHit =
        !q ||
        title.toLowerCase().includes(q) ||
        description.toLowerCase().includes(q) ||
        tags.join(" ").toLowerCase().includes(q) ||
        cover.toLowerCase().includes(q) ||
        raw.toLowerCase().includes(q)

      if (!textHit) return false

      // filtros S/N
      const isSponsored = (v.is_sponsored ?? v.isSponsored) ? "S" : "N"
      const isRepost = (v.is_repost ?? v.isRepost) ? "S" : "N"
      if (publi && isSponsored !== publi) return false
      if (repost && isRepost !== repost) return false

      const links: AnyLink[] = (v.links ?? v.socialNetworks ?? []) as AnyLink[]

      // filtro por rede social (nome)
      if (social) {
        const hasNetwork = links.some((l) => {
          const sn = l.social_network ?? l.socialNetwork
          return sn?.name === social
        })
        if (!hasNetwork) return false
      }

      // filtro por data (qualquer link com a data)
      if (postedDate) {
        const hasDate = links.some((l) => {
          const dt = toDate(l.posted_at ?? l.postedAt)
          return dt ? ymd(dt) === postedDate : false
        })
        if (!hasDate) return false
      }

      return true
    })
  }, [data, query, social, postedDate, publi, repost])

  return (
    <TooltipProvider delayDuration={0}>
      {/* filtros */}
      <div className="mb-3 grid grid-cols-1 gap-2 md:grid-cols-5">
        <Input
          placeholder="Buscar por título, descrição, tag ou link do Drive..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="md:col-span-2"
        />

        <Select value={social || undefined} onValueChange={(v) => setSocial(v === "ALL" ? "" : v)}>
          <SelectTrigger>
            <SelectValue placeholder="Filtrar por rede social" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todas</SelectItem>
            {socialOptions.map((name) => (
              <SelectItem key={name} value={name}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          type="date"
          value={postedDate}
          onChange={(e) => setPostedDate(e.target.value)}
          placeholder="Data de publicação"
        />

        <div className="grid grid-cols-2 gap-2">
          {/* Publi */}
          <Select value={publi || undefined} onValueChange={(v) => setPubli((v as any) === "ALL" ? "" : (v as "S" | "N"))}>
            <SelectTrigger>
              <SelectValue placeholder="Publi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos</SelectItem>
              <SelectItem value="S">Sim</SelectItem>
              <SelectItem value="N">Não</SelectItem>
            </SelectContent>
          </Select>

          {/* Repost */}
          <Select value={repost || undefined} onValueChange={(v) => setRepost((v as any) === "ALL" ? "" : (v as "S" | "N"))}>
            <SelectTrigger>
              <SelectValue placeholder="Repost" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos</SelectItem>
              <SelectItem value="S">Sim</SelectItem>
              <SelectItem value="N">Não</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setQuery("")
              setSocial("")
              setPostedDate("")
              setPubli("")
              setRepost("")
            }}
          >
            Limpar filtros
          </Button>
        </div>
      </div>

      {/* tabela */}
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
                const coverShare = v.cover_image_url ?? v.coverImageUrl ?? null
                const driveUrl = v.raw_video_url ?? v.rawVideoUrl ?? null
                const publi = (v.is_sponsored ?? v.isSponsored) ? "S" : "N"
                const repost = (v.is_repost ?? v.isRepost) ? "S" : "N"

                const coverThumbSm = coverShare ? driveThumb(coverShare, "w200-h112") : null
                const coverCandidates = coverShare ? drivePreviewCandidates(coverShare) : []

                const visibleTags = tags.slice(0, 3)
                const hiddenTags = tags.slice(3)

                return (
                  <TableRow key={id}>
                    {/* Vídeo: capa + link do drive */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          className="flex h-12 w-20 items-center justify-center overflow-hidden rounded bg-muted focus:outline-none focus:ring-2 focus:ring-ring"
                          onClick={() =>
                            coverCandidates.length && setPreview({ srcs: coverCandidates, alt: title })
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

                    {/* Redes sociais com tooltip nome + data */}
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

                    {/* Tags com tooltip no +N */}
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
                              <TooltipContent>{hiddenTags.join(", ")}</TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      )}
                    </TableCell>

                    {/* Excluir */}
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

      {/* preview da capa */}
      <Dialog open={!!preview} onOpenChange={(o) => !o && setPreview(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{preview?.alt}</DialogTitle>
          </DialogHeader>
          {preview && (
            <ImageWithFallback
              sources={preview.srcs}
              alt={preview.alt}
              className="mx-auto max-h-[80vh] w-auto rounded-md object-contain"
              referrerPolicy="no-referrer"
            />
          )}
        </DialogContent>
      </Dialog>

      {/* confirmação de exclusão */}
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
