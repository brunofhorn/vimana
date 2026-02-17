"use client"

import { useForm, useFieldArray } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { format, parseISO } from "date-fns"
import { FiPlus, FiTrash2 } from "react-icons/fi"

import { Button } from "@/components/button"
import { Input } from "@/components/input"
import { Label } from "@/components/label"
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/select"
import {
    Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription
} from "@/components/dialog"
import { VideoEditDialogProps } from "@/interfaces/videos"
import { useSocialNetworkContext } from "@/context/SocialNetworkContext"
import { useLoadingsContext } from "@/context/LoadingsContext"
import { useCallback, useEffect } from "react"
import { InputDatePicker } from "@/components/input-date-picker"
import { useVideoContext } from "@/context/VideoContext"
import { toast } from "sonner"
import { getHttpErrorMessage } from "@/services/http-error"

const RowSchema = z.object({
    id: z.string().optional(),
    social_network_id: z.string().min(1, "Selecione a rede"),
    url: z.string().url("URL invÃ¡lida"),
    posted_at: z.date({ error: "Informe a data" }),
})
const FormSchema = z.object({ links: z.array(RowSchema) })
type FormValues = z.infer<typeof FormSchema>

type LinkDTO = {
    id: string
    social_network_id: string
    url: string
    posted_at: string // ISO
    social_network: { id: string; name: string; icon: string }
}

export default function VideoEditDialog({ videoEditing, setVideoEditing }: VideoEditDialogProps) {
    const { socialNetworks } = useSocialNetworkContext()
    const { loadings, handleLoadings } = useLoadingsContext()
    const { updateVideoSocial } = useVideoContext()

    const form = useForm<FormValues>({
        resolver: zodResolver(FormSchema),
        defaultValues: { links: [] },
    })
    const { fields, append, remove, replace } = useFieldArray({ control: form.control, name: "links" })

    const loadLinks = useCallback(async () => {
        try {
            const res = await fetch(`/api/video/${videoEditing?.id}/social`, { cache: "no-store" })
            if (!res.ok) {
                throw new Error(await getHttpErrorMessage(res, "Falha ao carregar links"))
            }
            const data = (await res.json()) as LinkDTO[]
            // transforma para o form (posted_at -> Date)
            replace(
                data.map(l => ({
                    id: l.id,
                    social_network_id: l.social_network_id,
                    url: l.url,
                    posted_at: parseISO(l.posted_at),
                }))
            )
            // se nÃ£o tiver nenhum, cria uma linha vazia
            if (data.length === 0) {
                append({ social_network_id: "", url: "", posted_at: new Date() })
            }
        } catch (e) {
            console.error(e)
            const msg = e instanceof Error ? e.message : "Falha ao carregar links";
            toast.error("Erro", { description: msg })
        } finally {
        }
    }, [append, replace, videoEditing?.id])

    useEffect(() => {
        if (videoEditing) loadLinks()
    }, [loadLinks, videoEditing])

    async function onSubmit(values: FormValues) {
        handleLoadings({
            key: "video_social_networks",
            value: true
        })

        if (!videoEditing?.id) {
            return;
        }

        const payload = {
            links: values.links.map(l => ({
                id: l.id,
                social_network_id: l.social_network_id,
                url: l.url,
                posted_at: format(l.posted_at, "yyyy-MM-dd"),
            })),
        };

        try {
            await updateVideoSocial(videoEditing.id, payload);
            
            toast.success("Sucesso!", { description: "Redes sociais alteradas com sucesso." })

            setVideoEditing(null);
        } catch (e) {
            const msg = e instanceof Error ? e.message : "Erro ao salvar";
            toast.error("Erro!", { description: msg })
        }finally{
            handleLoadings({
                key: "video_social_networks",
                value: false
            })
        }
    }


    return (
        <Dialog open={!!videoEditing} onOpenChange={(o) => !o && setVideoEditing(null)}>
            <DialogContent className="sm:max-w-5xl"> {/* <-- ficou bem maior */}
                <DialogHeader>
                    <DialogTitle>Editar publicaÃ§Ãµes do vÃ­deo</DialogTitle>
                    <DialogDescription>
                        Altere, remova ou adicione novas redes/publicaÃ§Ãµes para este vÃ­deo.
                    </DialogDescription>
                </DialogHeader>

                {loadings.video_editing ? (
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
                                        <div className="md:col-span-3">
                                            <Label>Rede</Label>
                                            <Select
                                                value={form.watch(`links.${idx}.social_network_id`)}
                                                onValueChange={(v) =>
                                                    form.setValue(`links.${idx}.social_network_id`, v, { shouldValidate: true })
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {socialNetworks?.map((sn) => (
                                                        <SelectItem key={sn.id} value={sn.id ?? ""}>
                                                            {sn.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

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

                                        <div className="md:col-span-2">
                                            <Label>Postado em</Label>
                                            <InputDatePicker
                                                value={form.watch(`links.${idx}.posted_at`) || null}
                                                onChange={(d) =>
                                                    form.setValue(`links.${idx}.posted_at`, d ?? new Date(), { shouldValidate: true })
                                                }
                                                isClearable={false}
                                                className="w-full min-w-[160px] tabular-nums"
                                            />
                                        </div>

                                        <div className="md:col-span-1 flex md:justify-end">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                className="text-destructive"
                                                title="Remover"
                                                onClick={() => {
                                                    if (isPersisted) {
                                                        const ok = window.confirm("Remover esta publicaÃ§Ã£o?")
                                                        if (!ok) return
                                                    }
                                                    remove(idx)
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
                                    append({ id: undefined, social_network_id: "", url: "", posted_at: new Date() })
                                }
                            >
                                <FiPlus className="mr-2 h-4 w-4" />
                                Adicionar outra
                            </Button>

                            <DialogFooter>
                                <Button type={loadings.video_social_networks ? 'button': 'submit'}>
                                    {loadings.video_social_networks ? 'Salvando...' : 'Salvar alteraÃ§Ãµes'}
                                </Button>
                            </DialogFooter>
                        </div>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    )
}
