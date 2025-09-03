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
import { FiTrash2, FiVideo, FiFile, FiChevronLeft, FiChevronRight, FiCheck, FiX, FiEdit2 } from "react-icons/fi"
import type { Video } from "@/interfaces/videos"
import { registerLocale, setDefaultLocale } from "react-datepicker"
import { ptBR } from "date-fns/locale"
import { DatePickerShadcn } from "@/components/date-picker"
import { EditVideoLinksDialog } from "./EditVideo"
import { SocialNetworkData } from "@/interfaces/social-networks"

registerLocale("pt-BR", ptBR)
setDefaultLocale("pt-BR") // opcional

// ----------------- utils/aux -----------------
type AnyLink = {
  id: string
  url: string
  posted_at?: string | null
  postedAt?: string | null
  social_network?: { id?: string; name: string; icon: string }
  socialNetwork?: { id?: string; name: string; icon: string }
}

function toDate(d?: string | Date | null) {
  if (!d) return null
  if (d instanceof Date) return d
  const dt = new Date(d)
  return isNaN(dt.getTime()) ? null : dt
}
function ymd(d: Date) {
  const y = d.getFullYear()
  const m = `${d.getMonth() + 1}`.padStart(2, "0")
  const da = `${d.getDate()}`.padStart(2, "0")
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

// ----------------- componente -----------------
export function VideosTable({ videos, socialNetworks, onDelete }: { videos: Video[]; socialNetworks: SocialNetworkData[]; onDelete?: (v: Video) => Promise<void> | void }) {
  const [confirm, setConfirm] = React.useState<Video | null>(null)
  const [preview, setPreview] = React.useState<{ srcs: string[]; alt: string } | null>(null)

  // filtros
  const [query, setQuery] = React.useState("")
  const [social, setSocial] = React.useState<string>("")
  const [postedDate, setPostedDate] = React.useState<Date | null>(null)
  const [publi, setPubli] = React.useState<"" | "S" | "N">("")
  const [repost, setRepost] = React.useState<"" | "S" | "N">("")
  const [order, setOrder] = React.useState<"desc" | "asc">("desc")

  // paginação
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState<"10" | "20" | "50" | "100" | "ALL">("10")

  const wantedISO = (() => {
    if (!postedDate) return null

    // Date (ex.: react-datepicker)
    if (postedDate instanceof Date) return ymd(postedDate)

    const s = String(postedDate).trim()

    // Já está em ISO
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s

    // dd/MM/yyyy
    const m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
    if (m) return `${m[3]}-${m[2]}-${m[1]}`

    // fallback: tenta parsear e normalizar
    const d = toDate(s)
    return d ? ymd(d) : null
  })()

  // redes disponíveis p/ filtro
  const socialOptions = React.useMemo(() => {
    const set = new Set<string>()
    for (const v of videos as any[]) {
      const links: AnyLink[] = (v.links ?? v.socialNetworks ?? []) as AnyLink[]
      for (const l of links) {
        const sn = l.social_network ?? l.socialNetwork
        if (sn?.name) set.add(sn.name)
      }
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b))
  }, [videos])

  // aplica filtros + ordenação
  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()

    const out = (videos as any[]).filter((v) => {
      const title = String(v.title ?? "")
      const description = String(v.description ?? "")
      const tags = normalizeTags(v.tags)
      const cover = String(v.cover_image_url ?? v.coverImageUrl ?? "")
      const raw = String(v.raw_video_url ?? v.rawVideoUrl ?? "")

      const textHit =
        !q ||
        title.toLowerCase().includes(q) ||
        description.toLowerCase().includes(q) ||
        tags.join(" ").toLowerCase().includes(q) ||
        cover.toLowerCase().includes(q) ||
        raw.toLowerCase().includes(q)
      if (!textHit) return false

      const isSponsored = (v.is_sponsored ?? v.isSponsored) ? "S" : "N"
      const isRepost = (v.is_repost ?? v.isRepost) ? "S" : "N"
      if (publi && isSponsored !== publi) return false
      if (repost && isRepost !== repost) return false

      const links: AnyLink[] = (v.links ?? v.socialNetworks ?? []) as AnyLink[]
      if (social) {
        const hasNetwork = links.some((l) => {
          const sn = l.social_network ?? l.socialNetwork
          return sn?.name === social
        })
        if (!hasNetwork) return false
      }

      if (wantedISO) {
        const links: AnyLink[] = (v.links ?? v.socialNetworks ?? []) as AnyLink[]

        const hasDate = links.some((l) => {
          const dt = toDate(l.posted_at ?? l.postedAt) // string/Date -> Date | null
          return dt ? ymd(dt) === wantedISO : false
        })

        if (!hasDate) return false
      }

      return true
    })

    // ordena por data de cadastro
    out.sort((a, b) => {
      const ta = toDate((a as any).created_at ?? (a as any).createdAt)?.getTime() ?? 0
      const tb = toDate((b as any).created_at ?? (b as any).createdAt)?.getTime() ?? 0
      return order === "desc" ? tb - ta : ta - tb
    })

    return out
  }, [videos, query, social, postedDate, publi, repost, order])

  // reseta/clampa página quando filtros/ordem/tamanho mudam
  React.useEffect(() => {
    setPage(1)
  }, [query, social, postedDate, publi, repost, order, pageSize])

  // calcula paginação
  const pageSizeNum = pageSize === "ALL" ? Infinity : parseInt(pageSize, 10)
  const total = filtered.length
  const totalPages = pageSizeNum === Infinity ? 1 : Math.max(1, Math.ceil(total / pageSizeNum))
  const currentPage = Math.min(page, totalPages)
  const startIdx = pageSizeNum === Infinity ? 0 : (currentPage - 1) * pageSizeNum
  const endIdx = pageSizeNum === Infinity ? total : Math.min(startIdx + pageSizeNum, total)
  const pageItems = filtered.slice(startIdx, endIdx)



  return (
    <TooltipProvider delayDuration={0}>
      {/* filtros */}
      <div className="flex flex-row mb-3 gap-2">
        <Input
          placeholder="Buscar por título, descrição, tag ou link do Drive..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-2/6"
        />

        <Select value={social || undefined} onValueChange={(v) => setSocial(v === "ALL" ? "" : v)}>
          <SelectTrigger className="w-1/6">
            <SelectValue placeholder="Filtrar por rede social" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todas</SelectItem>
            {socialNetworks.map((social) => (
              <SelectItem key={social.id} value={social.name}>
                {social.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="relative w-[200px]">
          <DatePickerShadcn value={postedDate} onChange={setPostedDate} className="w-[200px]" />
          {postedDate && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 h-7 w-7"
              onClick={() => setPostedDate(null)}
              aria-label="Limpar data"
            >
              <FiX className="h-4 w-4" />
            </Button>
          )}
        </div>

        <Select value={publi || undefined} onValueChange={(v) => setPubli((v as any) === "ALL" ? "" : (v as "S" | "N"))}>
          <SelectTrigger className="w-1/6">
            <SelectValue placeholder="Publi" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todos</SelectItem>
            <SelectItem value="S">Sim</SelectItem>
            <SelectItem value="N">Não</SelectItem>
          </SelectContent>
        </Select>

        <Select value={repost || undefined} onValueChange={(v) => setRepost((v as any) === "ALL" ? "" : (v as "S" | "N"))}>
          <SelectTrigger className="w-1/6">
            <SelectValue placeholder="Repost" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todos</SelectItem>
            <SelectItem value="S">Sim</SelectItem>
            <SelectItem value="N">Não</SelectItem>
          </SelectContent>
        </Select>
        <Button
          type="button"
          className="w-1/6"
          variant="outline"
          onClick={() => {
            setQuery("")
            setSocial("")
            setPostedDate(null)
            setPubli("")
            setRepost("")
            setOrder("desc")
            setPage(1)
            setPageSize("10")
          }}
        >
          Limpar filtros
        </Button>
      </div>

      {/* tabela */}
      <div className="flex flex-col gap-4 mt-6">
        <div className="mb-2 flex items-center justify-between gap-2">
          <Select value={order} onValueChange={(v: "asc" | "desc") => setOrder(v)}>
            <SelectTrigger className="w-[350px]">
              <SelectValue placeholder="Ordenar por cadastro" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">Últimos cadastrados (mais novos)</SelectItem>
              <SelectItem value="asc">Primeiros cadastrados (mais antigos)</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex flex-row gap-3 items-center">
            <span className="text-sm text-muted-foreground">Mostrar:</span>
            <Select value={pageSize} onValueChange={(v: any) => setPageSize(v)}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
                <SelectItem value="ALL">Todos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>


        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[160px]">Vídeo</TableHead>
                <TableHead className="w-[500px]">Título</TableHead>
                <TableHead>Redes sociais</TableHead>
                <TableHead>Publi</TableHead>
                <TableHead>Repost</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead className="w-[80px] text-right">Excluir</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {pageItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-sm text-muted-foreground">
                    Nenhum vídeo encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                pageItems.map((v: any) => {
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
                      <TableCell>
                        {publi === "S" ? <FiCheck size={20} color={"green"} /> : <FiX size={20} color={"red"} />}
                      </TableCell>
                      <TableCell>
                        {repost === "S" ? <FiCheck size={20} color={"green"} /> : <FiX size={20} color={"red"} />}
                      </TableCell>

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
                      <TableCell className="flex flex-row gap-2 items-center justify-center">
                        <EditVideoLinksDialog
                          videoId={v.id}
                          socialNetworks={socialNetworks

                          } // lista carregada no topo da página
                          onSaved={() => { }}
                          trigger={
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              title="Editar publicações"
                              aria-label="Editar publicações"
                            >
                              <FiEdit2 className="h-4 w-4" />
                            </Button>
                          }
                        />
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
      </div>


      {/* barra de paginação */}
      <div className="flex items-center justify-between px-2 py-3">
        <div className="text-sm text-muted-foreground">
          {total === 0
            ? "Mostrando 0 de 0"
            : `Mostrando ${startIdx + 1}–${endIdx} de ${total}`}
        </div>

        {pageSize !== "ALL" && (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage(1)} disabled={currentPage === 1}>
              «
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <FiChevronLeft className="h-4 w-4" />
            </Button>

            <span className="text-sm">
              {currentPage} / {totalPages}
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <FiChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(totalPages)}
              disabled={currentPage === totalPages}
            >
              »
            </Button>
          </div>
        )}
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
