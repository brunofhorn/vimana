import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from "@/components/alert-dialog"
import { useLoadingsContext } from "@/context/LoadingsContext"
import { useVideoContext } from "@/context/VideoContext"
import { VideoDeleteDialogProps } from "@/interfaces/videos"
import { toast } from "sonner"

export default function VideoDeleteDialog({ videoDeleting, setVideoDeleting }: VideoDeleteDialogProps) {
    const { loadings, handleLoadings } = useLoadingsContext()
    const { removeVideo } = useVideoContext()

    const handleRemoveVideo = async () => {
        if (!videoDeleting) {
            return
        }

        try {
            handleLoadings({
                key: "video_deleting",
                value: true
            })

            await removeVideo(videoDeleting.id)
            setVideoDeleting(null)
            toast.success("Sucesso!", { description: "O vídeo foi excluído com sucesso." })
        } catch (error) {
            console.log("[VIDEOS][DELETE]", error)
            toast.error("Erro!", { description: "Ocorreu um erro ao tentar excluir o vídeo." })
        } finally {
            handleLoadings({
                key: "video_deleting",
                value: false
            })
        }
    }

    return (
        <AlertDialog open={!!videoDeleting} onOpenChange={(o) => !o && setVideoDeleting(null)}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-slate-700">Excluir “{videoDeleting?.title}”?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Esta ação não pode ser desfeita. O vídeo será removido permanentemente.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        onClick={() => loadings.video_deleting ? null : handleRemoveVideo()}
                    >
                        {loadings.video_deleting ? "Excluindo Vídeo" : "Excluir"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}