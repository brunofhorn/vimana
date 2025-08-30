"use client"

import * as React from "react"
import type { SocialNetworkData } from "@/interfaces/social-networks"
import { Input } from "@/components/input"
import { Button } from "@/components/button"
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/table"
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/dialog"
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription,
} from "@/components/alert-dialog"
import { IconSelect } from "@/components/icon-selector"
import { FiEdit2, FiTrash2, FiExternalLink, FiVideo } from "react-icons/fi"
import {
    SiInstagram, SiTiktok, SiPinterest, SiYoutube, SiLinkedin,
    SiX, SiThreads, SiFacebook, SiKuaishou,
    SiSnapchat,
} from "react-icons/si"
import type { IconType } from "react-icons"

const SOCIAL_ICON_MAP: Record<string, IconType> = {
    Instagram: SiInstagram,
    Tiktok: SiTiktok,
    Pinterest: SiPinterest,
    Youtube: SiYoutube,
    Linkedin: SiLinkedin,
    Twitter: SiX,
    Threads: SiThreads,
    Facebook: SiFacebook,
    Snapchat: SiSnapchat,
    Kwai: SiKuaishou,
    Video: FiVideo,
}

type Props = {
    data: SocialNetworkData[]
    onChange?: (next: SocialNetworkData[]) => void // opcional: notifica o pai
}

export function SocialNetworksTable({ data, onChange }: Props) {
    const [rows, setRows] = React.useState<SocialNetworkData[]>(data)
    const [search, setSearch] = React.useState("")
    const [editing, setEditing] = React.useState<SocialNetworkData | null>(null)
    const [deleting, setDeleting] = React.useState<SocialNetworkData | null>(null)
    const [saving, setSaving] = React.useState(false)
    const [removing, setRemoving] = React.useState(false)

    React.useEffect(() => setRows(data), [data])

    const filtered = React.useMemo(() => {
        const q = search.trim().toLowerCase()
        if (!q) return rows
        return rows.filter((n) => n.name.toLowerCase().includes(q) || n.url.toLowerCase().includes(q))
    }, [rows, search])

    async function handleSaveEdit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        if (!editing?.id) return
        const form = new FormData(e.currentTarget)
        const next: SocialNetworkData = {
            ...editing,
            name: String(form.get("name") || editing.name),
            url: String(form.get("url") || editing.url),
            icon: String(form.get("icon") || editing.icon),
        }

        setSaving(true)
        try {
            const res = await fetch(`/api/social/${editing.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: next.name, url: next.url, icon: next.icon }),
            })
            if (!res.ok) throw new Error("Falha ao salvar alterações")
            const updated = (await res.json()) as SocialNetworkData

            const nextRows = rows.map((r) => (r.id === updated.id ? updated : r))
            setRows(nextRows)
            onChange?.(nextRows)
            setEditing(null)
        } catch (err) {
            console.error(err)
        } finally {
            setSaving(false)
        }
    }

    async function confirmDelete() {
        if (!deleting?.id) return
        setRemoving(true)
        try {
            const res = await fetch(`/api/social/${deleting.id}`, { method: "DELETE" })
            if (!res.ok) throw new Error("Falha ao remover")
            const nextRows = rows.filter((r) => r.id !== deleting.id)
            setRows(nextRows)
            onChange?.(nextRows)
            setDeleting(null)
        } catch (err) {
            console.error(err)
        } finally {
            setRemoving(false)
        }
    }

    return (
        <div>
            {/* Busca */}
            <div className="mb-3 flex items-center justify-between gap-2">
                <Input
                    placeholder="Buscar por nome ou URL..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="max-w-sm"
                />
            </div>

            {/* Tabela */}
            <div className="overflow-x-auto rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[80px]">Ícone</TableHead>
                            <TableHead>Nome</TableHead>
                            <TableHead>URL</TableHead>
                            <TableHead className="w-[120px] text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filtered.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="py-8 text-center text-sm text-muted-foreground">
                                    Nenhuma rede encontrada.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filtered.map((item) => {
                                const BrandIcon = SOCIAL_ICON_MAP[item.icon] ?? FiVideo
                                const key = item.id ?? `${item.name}-${item.url}`
                                return (
                                    <TableRow key={key}>
                                        <TableCell>
                                            <BrandIcon className="h-5 w-5" />
                                        </TableCell>
                                        <TableCell className="font-medium">{item.name}</TableCell>
                                        <TableCell className="max-w-[420px]">
                                            <a
                                                href={item.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1 text-primary hover:underline"
                                            >
                                                <FiExternalLink className="h-3 w-3" />
                                                <span className="truncate">{item.url}</span>
                                            </a>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => setEditing(item)}
                                                    aria-label={`Editar ${item.name}`}
                                                >
                                                    <FiEdit2 className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-destructive hover:text-destructive"
                                                    onClick={() => setDeleting(item)}
                                                    aria-label={`Remover ${item.name}`}
                                                >
                                                    <FiTrash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )
                            })
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Dialog de Edição */}
            <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Editar rede social</DialogTitle>
                    </DialogHeader>

                    {editing && (
                        <form id="edit-social" onSubmit={handleSaveEdit} className="space-y-4">
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-medium">Nome</label>
                                    <Input name="name" defaultValue={editing.name} required minLength={2} />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-medium">URL</label>
                                    <Input name="url" type="url" defaultValue={editing.url} required />
                                </div>

                                <div className="sm:col-span-2 flex flex-col gap-2">
                                    <label className="text-sm font-medium">Ícone</label>
                                    <IconSelect
                                        selectedIcon={editing.icon}
                                        onIconSelect={(val) => setEditing((e) => (e ? { ...e, icon: val } : e))}
                                        placeholder="Selecione o ícone"
                                    />
                                    {/* input escondido para submit fácil */}
                                    <input type="hidden" name="icon" value={editing.icon} />
                                </div>
                            </div>
                        </form>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditing(null)} disabled={saving}>
                            Cancelar
                        </Button>
                        <Button form="edit-social" type="submit" disabled={saving}>
                            {saving ? "Salvando..." : "Salvar"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Confirmação de Exclusão */}
            <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Remover {deleting?.name}?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta ação não pode ser desfeita. O registro será removido permanentemente.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={removing}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={confirmDelete}
                            disabled={removing}
                        >
                            {removing ? "Removendo..." : "Remover"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
