"use client"

import { Button } from "@/components/button";
import { Card, CardContent } from "@/components/card";
import { Input } from "@/components/input";
import { Label } from "@/components/label";
import { useEffect, useState } from "react";
import { SocialNetworkCard } from "./SocialNetworkCard";
import { IconSelect } from "@/components/icon-selector";
import { SocialNetworkData } from "@/interfaces/social-networks";
import { z } from 'zod'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

const schema = z.object({
    name: z.string().min(2, "Informe um nome válido"),
    url: z.string().url("Informe uma URL válida"),
    icon: z.string().min(1, "Selecione um ícone"),
})

type FormValues = z.infer<typeof schema>

export default function Social() {
    const [socialNetworks, setSocialNetworks] = useState<SocialNetworkData[]>([])

    const form = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: { name: "", url: "", icon: "" },
        mode: "onChange",
    })

    const onSubmit = async (data: FormValues) => {
        const optimistic: SocialNetworkData = {
            name: data.name,
            url: data.url,
            icon: data.icon,
        }

        // otimistico na UI
        setSocialNetworks((prev) => [optimistic, ...prev])

        try {
            const res = await fetch("/api/social", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(optimistic),
            })

            if (!res.ok) {
                // rollback simples
                setSocialNetworks((prev) => prev.filter((n) => n !== optimistic))
                console.error("Falha ao criar rede social")
                return
            }

            // se sua API devolver o recurso criado com id, substitua o otimista
            const created = (await res.json()) as SocialNetworkData
            setSocialNetworks((prev) => [created, ...prev.filter((n) => n !== optimistic)])
            form.reset()
        } catch (err) {
            setSocialNetworks((prev) => prev.filter((n) => n !== optimistic))
            console.error(err)
        }
    }

    const {
        register,
        control,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = form

    async function fetchSocialNetworks() {
        try {
            const response = await fetch("/api/social", {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            })

            if (!response.ok) throw new Error("Falha ao buscar redes sociais")
            const data = (await response.json()) as SocialNetworkData[]
            setSocialNetworks(data)
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        fetchSocialNetworks()
    }, [])

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Redes Sociais</h1>
            </div>

            <Card>
                <CardContent className="mt-6">
                    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-row gap-4 items-center">
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
                                {isSubmitting ? "Enviando..." : "Criar"}
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
                </CardContent>
            </Card>

            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {socialNetworks?.map((network) => (
                    <SocialNetworkCard
                        key={network.name} // use um id real se tiver
                        network={network}
                        onDelete={() => { }}
                    />
                ))}
            </div>

            {socialNetworks?.length === 0 && (
                <div className="py-12 text-center">
                    <p className="text-muted-foreground">
                        Nenhuma rede social cadastrada. Clique em Criar para começar.
                    </p>
                </div>
            )}
        </div>
    )
}