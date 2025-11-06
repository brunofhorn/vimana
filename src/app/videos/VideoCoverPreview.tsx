import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/dialog"
import { ImageWithFallback } from "@/components/image-fallback"
import { VideoCoverPreviewProps } from "@/interfaces/videos"

export default function VideoCoverPreview({ coverPreview, setCoverPreview }: VideoCoverPreviewProps) {
    return (
        <Dialog open={!!coverPreview} onOpenChange={(o) => !o && setCoverPreview(null)}>
            <DialogContent className="max-w-4xl">
                <DialogHeader>
                    <DialogTitle>{coverPreview?.alt}</DialogTitle>
                </DialogHeader>
                {coverPreview && (
                    <ImageWithFallback
                        sources={coverPreview.srcs}
                        alt={coverPreview.alt}
                        className="mx-auto max-h-[80vh] w-auto rounded-md object-contain"
                        referrerPolicy="no-referrer"
                    />
                )}
            </DialogContent>
        </Dialog>
    )
}