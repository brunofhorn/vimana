"use client"

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/card";
import { TitlePage } from "@/components/title-page";
import VideoForm from "../../add/VideoForm";
import { Loader } from "@/components/loading";
import { getVideoById } from "@/services/video";
import { useSocialNetworkContext } from "@/context/SocialNetworkContext";
import { VideoFormCreateInput } from "@/schemas/video";
import { IVideo } from "@/interfaces/videos";
import { toast } from "sonner";

function mapVideoToForm(video: IVideo): VideoFormCreateInput {
  return {
    title: video.title ?? "",
    description: video.description ?? "",
    tags: Array.isArray(video.tags) ? video.tags : [],
    is_repost: Boolean(video.is_repost),
    is_sponsored: Boolean(video.is_sponsored),
    cover_image_url: video.cover_image_url ?? "",
    raw_video_url: video.raw_video_url ?? "",
    links: (video.links ?? []).map((link) => ({
      social_network_id: link.social_network_id ?? "",
      url: link.url,
      posted_at: link.posted_at ? new Date(link.posted_at) : new Date(),
    })),
  };
}

export default function VideoEditPage() {
  const params = useParams<{ id: string }>();
  const { ensureSocialNetworks } = useSocialNetworkContext();
  const [initialValues, setInitialValues] = useState<VideoFormCreateInput | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const videoId = useMemo(() => {
    const rawId = params?.id;
    return Array.isArray(rawId) ? rawId[0] : rawId;
  }, [params]);

  const loadVideoData = useCallback(async () => {
    if (!videoId) return;

    setIsLoading(true);

    try {
      const [video] = await Promise.all([getVideoById(videoId), ensureSocialNetworks()]);
      setInitialValues(mapVideoToForm(video));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao carregar video.";
      toast.error("Error!", { description: message });
    } finally {
      setIsLoading(false);
    }
  }, [ensureSocialNetworks, videoId]);

  useEffect(() => {
    loadVideoData();
  }, [loadVideoData]);

  return (
    <div>
      <TitlePage title="Editar Vídeo" />

      <Card className="bg-white/5 border-white/5">
        <CardContent className="mt-6">
          {isLoading ? (
            <div className="py-4">
              <Loader label="Carregando video..." />
            </div>
          ) : !videoId || !initialValues ? (
            <p className="text-sm text-muted-foreground">Nao foi possivel carregar os dados do video.</p>
          ) : (
            <VideoForm mode="edit" videoId={videoId} initialValues={initialValues} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
