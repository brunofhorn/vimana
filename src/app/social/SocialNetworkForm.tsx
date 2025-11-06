"use client"

import { Button } from "@/components/button";
import { IconSelect } from "@/components/icon-selector";
import { Input } from "@/components/input";
import { Label } from "@/components/label";
import { useLoadingsContext } from "@/context/LoadingsContext";
import { useSocialNetworkContext } from "@/context/SocialNetworkContext";
import { SocialNetworkFormCreateSchema, SocialNetworksFormCreateValues } from "@/schemas/social";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

export function SocialNetworkForm() {
    const { handleLoadings } = useLoadingsContext()
    const { createSocialNetwork } = useSocialNetworkContext()
    const form = useForm<SocialNetworksFormCreateValues>({
        resolver: zodResolver(SocialNetworkFormCreateSchema),
        defaultValues: { name: "", url: "", icon: "" },
        mode: "onChange",
    })

    const { control, handleSubmit, register, formState: { errors, isSubmitting } } = form

    const onSubmit = async (socialData: SocialNetworksFormCreateValues) => {
        try {
            handleLoadings({
                key: 'social',
                value: true
            })

            await createSocialNetwork(socialData)
            form.reset()
            toast.success("Sucesso!", { description: "A rede social foi cadastrada com sucesso." })
        } catch (error) {
            console.error("[SOCIAL_NETWORKS][CREATE]", error)
            toast.error("Erro!", { description: "Ocorreu um erro ao tentar cadastrar a rede social." })
        } finally {
            handleLoadings({
                key: 'social',
                value: false
            })
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-row gap-4 items-start">
            <div className="flex flex-col flex-1 gap-3">
                <Label htmlFor="name">Nome</Label>
                <Input
                    id="name"
                    placeholder="Ex: YouTube, Instagram, TikTok"
                    {...register("name")}
                />
                {errors.name && (
                    <span className="text-xs text-red-600">{errors.name.message}</span>
                )}
            </div>

            <div className="flex flex-col flex-1 gap-3">
                <Label htmlFor="url">URL Base</Label>
                <Input id="url" type="url" placeholder="https://..." {...register("url")} />
                {errors.url && (
                    <span className="text-xs text-red-600">{errors.url.message}</span>
                )}
            </div>

            <div className="flex flex-col flex-1 gap-3">
                <Label>Ícone</Label>
                <Controller
                    name="icon"
                    control={control}
                    render={({ field }) => (
                        <IconSelect
                            selectedIcon={field.value}
                            onIconSelect={field.onChange}
                            placeholder="Selecione o ícone"
                        />
                    )}
                />
                {errors.icon && (
                    <span className="text-xs text-red-600">{errors.icon.message}</span>
                )}
            </div>

            <div className="flex gap-2 items-center mt-6">
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Cadastrando..." : "Criar"}
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => form.reset()}
                    disabled={isSubmitting}
                >
                    Cancelar
                </Button>
            </div>
        </form>
    )
}