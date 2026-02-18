import * as Alert from "@/components/alert-dialog";
import { useLoadingsContext } from "@/context/LoadingsContext";
import { useSocialNetworkContext } from "@/context/SocialNetworkContext";
import { SocialNetworkDeleteDialogProps } from "@/interfaces/social-networks";
import { useMemo } from "react";
import { CiEraser } from "react-icons/ci";
import { FiCheck, FiLoader } from "react-icons/fi";
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
                const message = error instanceof Error
                    ? error.message
                    : "Ocorreu um erro ao tentar excluir a rede social."
                toast.error("Erro!", { description: message })
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
                    <Alert.AlertDialogTitle className="text-foreground">Remover {deleting?.name}?</Alert.AlertDialogTitle>
                    <Alert.AlertDialogDescription>
                        Esta ação não pode ser desfeita. O registro será removido permanentemente.
                    </Alert.AlertDialogDescription>
                </Alert.AlertDialogHeader>
                <Alert.AlertDialogFooter>
                    <Alert.AlertDialogCancel disabled={isDeleting} className="bg-destructive hover:bg-destructive/80">
                        <CiEraser />
                        <span>Cancelar</span>
                    </Alert.AlertDialogCancel>
                    <Alert.AlertDialogAction
                        className="bg-primary text-white hover:bg-primary/80"
                        onClick={handleDelete}
                        disabled={isDeleting}
                    >
                        {isDeleting ? (
                            <>
                                <FiLoader />
                                <span>Removendo...</span>
                            </>
                        ) : (
                            <>
                                <FiCheck />
                                <span>Remover</span>
                            </>
                        )}
                    </Alert.AlertDialogAction>
                </Alert.AlertDialogFooter>
            </Alert.AlertDialogContent>
        </Alert.AlertDialog>
    )
}
