// components/videos/EditVideoLinksDialog.tsx
"use client"

import * as React from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { format, parseISO } from "date-fns"
import { FiEdit2, FiPlus, FiTrash2 } from "react-icons/fi"

import { Button } from "@/components/button"
import { Input } from "@/components/input"
import { Label } from "@/components/label"
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/select"
import {
    Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription, DialogTrigger,
} from "@/components/dialog"
import { DatePickerShadcn } from "@/components/date-picker"
import type { SocialNetworkData } from "@/interfaces/social-networks"

const RowSchema = z.object({
    id: z.string().optional(),
    socialnetwork_id: z.string().min(1, "Selecione a rede"),
    url: z.string().url("URL inválida"),
    posted_at: z.date({ error: "Informe a data" }),
})
const FormSchema = z.object({ links: z.array(RowSchema) })
type FormValues = z.infer<typeof FormSchema>

type LinkDTO = {
    id: string
    socialnetwork_id: string
    url: string
    posted_at: string // ISO
    social_network: { id: string; name: string; icon: string }
}

type Props = {
    videoId: string
    socialNetworks: SocialNetworkData[]
    onSaved?: () => void
    trigger?: React.ReactNode
}

export function EditVideoLinksDialog({ videoId, socialNetworks, onSaved, trigger }: Props) {
    const [open, setOpen] = React.useState(false)
    const [loading, setLoading] = React.useState(false)

    const form = useForm<FormValues>({
        resolver: zodResolver(FormSchema),
        defaultValues: { links: [] },
    })
    const { fields, append, remove, replace } = useFieldArray({ control: form.control, name: "links" })

    async function loadLinks() {
        setLoading(true)
        try {
            const res = await fetch(`/api/video/${videoId}/social`, { cache: "no-store" })
            if (!res.ok) throw new Error("Falha ao carregar links")
            const data = (await res.json()) as LinkDTO[]
            // transforma para o form (posted_at -> Date)
            replace(
                data.map(l => ({
                    id: l.id,
                    socialnetwork_id: l.socialnetwork_id,
                    url: l.url,
                    posted_at: parseISO(l.posted_at),
                }))
            )
            // se não tiver nenhum, cria uma linha vazia
            if (data.length === 0) {
                append({ socialnetwork_id: "", url: "", posted_at: new Date() })
            }
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    // carrega quando abre
    React.useEffect(() => {
        if (open) loadLinks()
    }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

    async function onSubmit(values: FormValues) {
        const payload = {
            links: values.links.map(l => ({
                id: l.id,
                socialnetwork_id: l.socialnetwork_id,
                url: l.url,
                posted_at: format(l.posted_at, "yyyy-MM-dd"),
            })),
        }

        const res = await fetch(`/api/video/${videoId}/social`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        })

        if (!res.ok) {
            const err = await res.json().catch(() => ({}))
            alert(err?.message || "Erro ao salvar")
            return
        }

        setOpen(false)
        onSaved?.()
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {trigger ? (
                <DialogTrigger asChild>{trigger}</DialogTrigger>
            ) : (
                <DialogTrigger asChild>
                    <Button variant="outline" size="sm">Editar</Button>
                </DialogTrigger>
            )}

            <DialogContent className="sm:max-w-5xl"> {/* <-- ficou bem maior */}
                <DialogHeader>
                    <DialogTitle>Editar publicações do vídeo</DialogTitle>
                    <DialogDescription>
                        Altere, remova ou adicione novas redes/publicações para este vídeo.
                    </DialogDescription>
                </DialogHeader>

                {loading ? (
                    <div className="p-6 text-sm text-muted-foreground">Carregando...</div>
                ) : (
                    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
                        <div className="space-y-4">
                            {fields.map((f, idx) => {
                                const isPersisted = !!form.watch(`links.${idx}.id`)
                                return (
                                    <div
                                        key={f.id}
                                        className="grid grid-cols-1 items-end gap-4 md:grid-cols-12"
                                    >
                                        {/* Rede */}
                                        <div className="md:col-span-3">
                                            <Label>Rede</Label>
                                            <Select
                                                value={form.watch(`links.${idx}.socialnetwork_id`)}
                                                onValueChange={(v) =>
                                                    form.setValue(`links.${idx}.socialnetwork_id`, v, { shouldValidate: true })
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {socialNetworks.map((sn) => (
                                                        <SelectItem key={sn.id} value={sn.id??""}>
                                                            {sn.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* URL */}
                                        <div className="md:col-span-6">
                                            <Label>URL</Label>
                                            <Input
                                                placeholder="https://..."
                                                value={form.watch(`links.${idx}.url`)}
                                                onChange={(e) =>
                                                    form.setValue(`links.${idx}.url`, e.target.value, { shouldValidate: true })
                                                }
                                            />
                                        </div>

                                        {/* Data */}
                                        <div className="md:col-span-2">
                                            <Label>Postado em</Label>
                                            <DatePickerShadcn
                                                value={form.watch(`links.${idx}.posted_at`) || null}
                                                onChange={(d) =>
                                                    form.setValue(`links.${idx}.posted_at`, d ?? new Date(), { shouldValidate: true })
                                                }
                                                className="w-full min-w-[160px] tabular-nums"  // <- mais espaço e melhor leitura
                                            />
                                        </div>

                                        {/* Remover */}
                                        <div className="md:col-span-1 flex md:justify-end">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                className="text-destructive"
                                                title="Remover"
                                                onClick={() => {
                                                    // se já existe no banco, confirma; se for nova, remove direto
                                                    if (isPersisted) {
                                                        const ok = window.confirm("Remover esta publicação?")
                                                        if (!ok) return
                                                    }
                                                    remove(idx) // <- sem chamada à API agora
                                                }}
                                            >
                                                <FiTrash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        <div className="flex justify-between">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() =>
                                    append({ id: undefined, socialnetwork_id: "", url: "", posted_at: new Date() })
                                }
                            >
                                <FiPlus className="mr-2 h-4 w-4" />
                                Adicionar outra
                            </Button>

                            <DialogFooter>
                                <Button type="submit">Salvar alterações</Button>
                            </DialogFooter>
                        </div>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    )
}
