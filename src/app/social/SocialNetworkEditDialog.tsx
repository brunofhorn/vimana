import { Button } from "@/components/button";
import * as Modal from "@/components/dialog";
import { IconSelect } from "@/components/icon-selector";
import { Input } from "@/components/input";
import { useLoadingsContext } from "@/context/LoadingsContext";
import { useSocialNetworkContext } from "@/context/SocialNetworkContext";
import { SocialNetworkEditDialogProps } from "@/interfaces/social-networks";
import { SocialNetworkFormCreateSchema, SocialNetworksFormCreateValues } from "@/schemas/social";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { CiEraser } from "react-icons/ci";
import { FiCheck, FiLoader } from "react-icons/fi";
import { toast } from "sonner";

export function SocialNetworkEditDialog({ editing, setEditing }: SocialNetworkEditDialogProps) {
    const { loadings, handleLoadings } = useLoadingsContext()
    const { updateSocialNetwork } = useSocialNetworkContext()
    const form = useForm<SocialNetworksFormCreateValues>({
        resolver: zodResolver(SocialNetworkFormCreateSchema),
        defaultValues: { name: "", url: "", icon: "" },
        mode: "onChange",
    })

    const { control, handleSubmit, register, reset, formState: { errors, isSubmitting } } = form

    async function handleSaveEdit(socialData: SocialNetworksFormCreateValues) {
        if (!editing?.id) {
            return
        } else {
            handleLoadings({
                key: "social_editing",
                value: true
            })

            try {
                await updateSocialNetwork({ id: editing.id, data: socialData })
                setEditing(null)
                toast.success("Sucesso!", { description: "A rede social foi atualizada com sucesso." })
            } catch (error) {
                console.error("[SOCIAL_NETWORKS][UPDATE]", error)
                const message = error instanceof Error
                    ? error.message
                    : "Ocorreu um erro ao tentar atualizar a rede social."
                toast.error("Erro!", { description: message })
            } finally {
                handleLoadings({
                    key: "social_editing",
                    value: false
                })
            }
        }
    }

    const isEditing = useMemo(
        () => Boolean(loadings?.social_editing) || isSubmitting,
        [loadings?.social_editing, isSubmitting]
    );

    useEffect(() => {
        if (editing) {
            reset({
                name: editing.name ?? "",
                url: editing.url ?? "",
                icon: editing.icon ?? "",
            });
        }
    }, [editing, reset]);

    return (
        <Modal.Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
            <Modal.DialogContent className="sm:max-w-lg">
                <Modal.DialogHeader>
                    <Modal.DialogTitle className="text-primary">Editar rede social</Modal.DialogTitle>
                </Modal.DialogHeader>

                {editing && (
                    <form id="edit-social" onSubmit={handleSubmit(handleSaveEdit)} className="space-y-4">
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div className="flex flex-col gap-2">
                                <label className="text-sm text-foreground font-medium">Nome</label>
                                <Input
                                    id="name"
                                    placeholder="Ex: YouTube, Instagram, TikTok"
                                    defaultValue={editing.name}
                                    minLength={2}
                                    {...register("name")}
                                    className="text-foreground"
                                />
                                {errors.name && (
                                    <span className="text-xs text-red-600">{errors.name.message}</span>
                                )}
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm text-foreground font-medium">URL</label>
                                <Input
                                    id="url"
                                    type="url"
                                    defaultValue={editing.url}
                                    placeholder="https://..."
                                    {...register("url")}
                                    className="text-foreground"
                                />
                                {errors.url && (
                                    <span className="text-xs text-red-600">{errors.url.message}</span>
                                )}
                            </div>

                            <div className="sm:col-span-2 flex flex-col gap-2">
                                <label className="text-sm text-foreground font-medium">Ícone</label>
                                <Controller
                                    name="icon"
                                    control={control}
                                    render={({ field }) => (
                                        <IconSelect
                                            selectedIcon={field.value}
                                            onIconSelect={(value) => field.onChange(value)}
                                            placeholder="Selecione o ícone"
                                            className="text-foreground border border-foreground"
                                        />
                                    )}
                                />
                                {errors.icon && (
                                    <span className="text-xs text-red-600">{errors.icon.message}</span>
                                )}
                            </div>
                        </div>
                    </form>
                )}

                <Modal.DialogFooter>
                    <Button variant="destructive" onClick={() => setEditing(null)} disabled={isEditing}>
                        <CiEraser />
                        <span>Cancelar</span>
                    </Button>
                    <Button form="edit-social" type="submit" disabled={isEditing}>
                        {isEditing ? (
                            <>
                                <FiLoader />
                                <span>Salvando...</span>
                            </>
                        ) : (
                            <>
                                <FiCheck />
                                <span>Salvar</span>
                            </>
                        )}
                    </Button>
                </Modal.DialogFooter>
            </Modal.DialogContent>
        </Modal.Dialog>
    )
}
