import * as Alert from "@/components/alert-dialog";
import { useLoadingsContext } from "@/context/LoadingsContext";
import { useSocialNetworkContext } from "@/context/SocialNetworkContext";
import { SocialNetworkDeleteDialogProps } from "@/interfaces/social-networks";
import { useMemo } from "react";
import { toast } from "sonner";

export function SocialNetworkDeleteDialog({ deleting, setDeleting }: SocialNetworkDeleteDialogProps) {
    const { loadings, handleLoadings } = useLoadingsContext()
    const { removeSocialNetwork } = useSocialNetworkContext()

    async function handleDelete() {
        if (!deleting?.id) {

        } else {
            handleLoadings({
                key: "social_deleting",
                value: true
            })

            try {
                await removeSocialNetwork(deleting.id)
                setDeleting(null)
                toast.success("Sucesso!", { description: "A rede social foi excluída com sucesso." })
            } catch (error) {
                console.error("[SOCIAL_NETWORKS][DELETE]", error)
                toast.error("Erro!", { description: "Ocorreu um erro ao tentar excluir a rede social." })
            } finally {
                handleLoadings({
                    key: "social_deleting",
                    value: false
                })
            }
        }
    }

    const isDeleting = useMemo(
        () => Boolean(loadings?.social_deleting),
        [loadings?.social_deleting]
    );

    return (
        <Alert.AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
            <Alert.AlertDialogContent>
                <Alert.AlertDialogHeader>
                    <Alert.AlertDialogTitle>Remover {deleting?.name}?</Alert.AlertDialogTitle>
                    <Alert.AlertDialogDescription>
                        Esta ação não pode ser desfeita. O registro será removido permanentemente.
                    </Alert.AlertDialogDescription>
                </Alert.AlertDialogHeader>
                <Alert.AlertDialogFooter>
                    <Alert.AlertDialogCancel disabled={isDeleting}>Cancelar</Alert.AlertDialogCancel>
                    <Alert.AlertDialogAction
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        onClick={handleDelete}
                        disabled={isDeleting}
                    >
                        {isDeleting ? "Removendo..." : "Remover"}
                    </Alert.AlertDialogAction>
                </Alert.AlertDialogFooter>
            </Alert.AlertDialogContent>
        </Alert.AlertDialog>
    )
}