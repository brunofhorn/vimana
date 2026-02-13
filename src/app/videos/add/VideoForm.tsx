"use client"

import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { Label } from "@/components/label";
import { Switch } from "@/components/switch";
import { Tags } from "@/components/tags";
import { Textarea } from "@/components/textarea";
import { VideoFormCreateInput, VideoFormCreateSchema, VideoFormCreateValues } from "@/schemas/video";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, FormProvider, useFieldArray, useForm } from "react-hook-form";
import { FiCheck, FiPlus } from "react-icons/fi";
import { CiEraser } from 'react-icons/ci'
import VideoSocialNetwork from "./VideoSocialNetwork";
import { useSocialNetworkContext } from "@/context/SocialNetworkContext";
import { useVideoContext } from "@/context/VideoContext";
import { toast } from "sonner";
import { TagsInput } from "@/components/taginput";

export default function VideoForm() {
    const { socialNetworks } = useSocialNetworkContext()
    const { addNewVideo } = useVideoContext()

    const form = useForm<VideoFormCreateInput>({
        resolver: zodResolver(VideoFormCreateSchema),
        defaultValues: {
            title: "",
            description: "",
            tags: [],
            is_repost: false,
            is_sponsored: false,
            cover_image_url: "",
            raw_video_url: "",
            links: [{ socialnetwork_id: "", url: "", posted_at: new Date() }],
        },
    })

    const { control, handleSubmit, register, reset, formState: { errors, isSubmitting } } = form


    const { fields, append, remove } = useFieldArray({
        control,
        name: "links",
    });

    const onSubmit = async (raw: VideoFormCreateInput) => {
        const data: VideoFormCreateValues = VideoFormCreateSchema.parse(raw)

        if (!data.title.trim()) {
            window.alert("Título é obrigatório.")
            return
        }

        for (const l of data.links) {
            if (!l.socialnetwork_id || !l.url || !l.posted_at) {
                window.alert("Preencha rede, URL e data de postagem em todas as linhas.")
                return
            }
        }

        try {
            await addNewVideo(data)
            reset()

            toast.success("Sucesso!", { description: "O vídeo foi adicionado com sucesso." })
        } catch (e: unknown) {
            let message = "Erro ao adicionar o vídeo."
            if (e instanceof Error) {
                message = e.message
            }

            toast.error("Error!", { description: message })
        }
    }

    return (
        <FormProvider {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="flex flex-col gap-3">
                    <Label htmlFor="title">Título</Label>
                    <Input
                        id="title"
                        placeholder="Título do vídeo"
                        {...register("title")}
                    />
                    {errors.title && (
                        <span className="text-xs text-red-600">{errors.title.message}</span>
                    )}
                </div>
                <div className="flex flex-col gap-3">
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                        id="description"
                        placeholder="Descrição do vídeo"
                        rows={3}
                        {...register("description")}
                    />
                    {errors.description && (
                        <span className="text-xs text-red-600">{errors.description.message}</span>
                    )}
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div>
                        <Label htmlFor="tags">Tags</Label>
                        <Controller
                            name="tags"
                            control={control}
                            render={({ field }) => {
                                const valueAsArray = Array.isArray(field.value) ? field.value : []

                                return (
                                    <TagsInput
                                        id="tags"
                                        name="tags"              
                                        value={valueAsArray}
                                        onValueChange={field.onChange}
                                        onBlur={field.onBlur}    
                                        ref={field.ref}          
                                        placeholder="Digite as tags"
                                    />
                                )
                            }}
                        />
                    </div>
                    <div>
                        <Label htmlFor="cover">Capa (link do Drive)</Label>
                        <Input
                            id="cover"
                            type="url"
                            placeholder="https://drive.google.com/..."
                            {...register("cover_image_url")}
                        />
                        {errors.cover_image_url && (
                            <span className="text-xs text-red-600">{errors.cover_image_url.message}</span>
                        )}
                    </div>
                    <div>
                        <Label htmlFor="raw">Vídeo bruto (link do Drive)</Label>
                        <Input
                            id="raw"
                            type="url"
                            placeholder="https://drive.google.com/..."
                            {...register("raw_video_url")}
                        />
                        {errors.raw_video_url && (
                            <span className="text-xs text-red-600">{errors.raw_video_url.message}</span>
                        )}
                    </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="flex items-center justify-between rounded-md border border-white/5 p-3">
                        <div>
                            <Label className="text-sm font-medium">É repostagem?</Label>
                            <p className="text-xs text-muted-foreground">
                                Marque se este vídeo já foi postado anteriormente.
                            </p>
                        </div>
                        <Controller
                            name="is_repost"
                            control={control}
                            defaultValue={false}
                            render={({ field: { value, onChange, onBlur } }) => (
                                <Switch
                                    id="is_repost"
                                    checked={!!value}
                                    onCheckedChange={onChange}
                                    onBlur={onBlur}
                                />
                            )}
                        />
                        {errors.is_repost && (
                            <span className="text-xs text-red-600">{errors.is_repost.message}</span>
                        )}
                    </div>

                    <div className="flex items-center justify-between rounded-md border border-white/5 p-3">
                        <div>
                            <Label className="text-sm font-medium">É publi?</Label>
                            <p className="text-xs text-muted-foreground">
                                Indique se o vídeo é conteúdo patrocinado.
                            </p>
                        </div>
                        <Controller
                            name="is_sponsored"
                            control={control}
                            defaultValue={false}
                            render={({ field: { value, onChange, onBlur } }) => (
                                <Switch
                                    id="is_sponsored"
                                    checked={!!value}
                                    onCheckedChange={onChange}
                                    onBlur={onBlur}
                                />
                            )}
                        />
                        {errors.is_sponsored && (
                            <span className="text-xs text-red-600">{errors.is_sponsored.message}</span>
                        )}
                    </div>
                </div>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <Label>Redes Sociais</Label>
                        <Button type="button" variant="outline" size="sm" onClick={() => append({ socialnetwork_id: "", url: "", posted_at: new Date() })}>
                            <FiPlus className="mr-2 h-4 w-4" />
                            Adicionar rede
                        </Button>
                    </div>

                    {fields.map((field, index) => (
                        <VideoSocialNetwork
                            key={field.id}
                            index={index}
                            socialNetworks={socialNetworks ?? []}
                            onRemove={() => remove(index)}
                        />
                    ))}

                    {typeof errors.links?.message === "string" && (
                        <span className="text-xs text-red-600">{errors.links?.message}</span>
                    )}
                </div>
                <div className="flex gap-2">
                    <Button type="submit" variant="secondary" className="bg-green-600 text-white hover:bg-green-300 hover:text-green-900" disabled={isSubmitting}>
                        <FiCheck />
                        {isSubmitting ? "Criando..." : "Criar"}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => console.log('on success')} disabled={isSubmitting}>
                        <CiEraser />
                        Cancelar
                    </Button>
                </div>
            </form>
        </FormProvider>
    )
}