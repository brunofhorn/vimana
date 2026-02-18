"use client";

import { useEffect, useMemo, useState } from "react";
import { TitlePage } from "@/components/title-page";
import { Card, CardContent } from "@/components/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/select";
import { Badge } from "@/components/badge";
import { Loader } from "@/components/loading";
import { IVideo } from "@/interfaces/videos";
import { formatDateBR } from "@/utils/format-date-to-br";
import { getVideos } from "@/services/video";
import { toast } from "sonner";

type PeriodValue = "7" | "30" | "90" | "ALL";

type VideoLinkRow = {
  id: string;
  social_network_id: string;
  socialName: string;
  posted_at: string | Date;
  video: IVideo;
};

type SocialOption = {
  id: string;
  name: string;
};

function parseDate(value?: string | Date | null): Date | null {
  if (!value) return null;

  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return null;

  return d;
}

function isWithinPeriod(value?: string | Date | null, period?: PeriodValue): boolean {
  if (!period || period === "ALL") return true;

  const d = parseDate(value);
  if (!d) return false;

  const days = Number(period);
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - (days - 1));
  start.setHours(0, 0, 0, 0);

  return d >= start && d <= now;
}

function pct(value: number, total: number): string {
  if (total <= 0) return "0%";
  return `${((value / total) * 100).toFixed(1)}%`;
}

function buildLast7Days() {
  const now = new Date();
  return Array.from({ length: 7 }).map((_, idx) => {
    const d = new Date(now);
    d.setDate(now.getDate() - (6 - idx));
    d.setHours(0, 0, 0, 0);
    const key = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString("pt-BR", { weekday: "short" });

    return { key, label, date: d };
  });
}

function toLinkRows(videos: IVideo[]): VideoLinkRow[] {
  return videos.flatMap((video) =>
    (video.links ?? []).map((link) => ({
      id: link.id,
      social_network_id: link.social_network_id,
      socialName: link.social_network?.name ?? "Sem rede",
      posted_at: link.posted_at,
      video,
    }))
  );
}

export default function ReportsPage() {
  const [videos, setVideos] = useState<IVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState<PeriodValue>("30");
  const [socialId, setSocialId] = useState<string>("ALL");

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const response = await getVideos({
          page: 1,
          pageSize: "ALL",
          order: "desc",
        });
        setVideos(response.items);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Falha ao carregar dados de relatorios.";
        toast.error("Erro!", { description: message });
      } finally {
        setIsLoading(false);
      }
    }

    load();
  }, []);

  const allVideos = useMemo(() => videos ?? [], [videos]);

  const socialOptions = useMemo<SocialOption[]>(() => {
    const map = new Map<string, string>();

    for (const video of allVideos) {
      for (const link of video.links ?? []) {
        map.set(link.social_network_id, link.social_network?.name ?? "Sem nome");
      }
    }

    return Array.from(map.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [allVideos]);

  const periodVideos = useMemo(() => {
    return allVideos.filter((video) => {
      const createdPass = isWithinPeriod(video.created_at, period);
      if (!createdPass) return false;

      if (socialId === "ALL") return true;

      return (video.links ?? []).some((link) => link.social_network_id === socialId);
    });
  }, [allVideos, period, socialId]);

  const periodLinks = useMemo(() => {
    return toLinkRows(allVideos).filter((link) => {
      const periodPass = isWithinPeriod(link.posted_at, period);
      if (!periodPass) return false;

      if (socialId === "ALL") return true;

      return link.social_network_id === socialId;
    });
  }, [allVideos, period, socialId]);

  const networkDistribution = useMemo(() => {
    const counter = new Map<string, number>();

    for (const link of periodLinks) {
      counter.set(link.socialName, (counter.get(link.socialName) ?? 0) + 1);
    }

    return Array.from(counter.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [periodLinks]);

  const last7Days = useMemo(() => {
    const days = buildLast7Days();
    const counter = new Map<string, number>();

    for (const link of periodLinks) {
      const d = parseDate(link.posted_at);
      if (!d) continue;

      const key = new Date(d.getFullYear(), d.getMonth(), d.getDate())
        .toISOString()
        .slice(0, 10);

      counter.set(key, (counter.get(key) ?? 0) + 1);
    }

    return days.map((day) => ({
      ...day,
      count: counter.get(day.key) ?? 0,
    }));
  }, [periodLinks]);

  const topVideos = useMemo(() => {
    const byVideo = periodVideos
      .map((video) => {
        const links = (video.links ?? []).filter((link) => {
          const inPeriod = isWithinPeriod(link.posted_at, period);
          if (!inPeriod) return false;
          if (socialId === "ALL") return true;

          return link.social_network_id === socialId;
        });

        return {
          video,
          posts: links.length,
          networks: new Set(links.map((l) => l.social_network_id)).size,
        };
      })
      .filter((row) => row.posts > 0)
      .sort((a, b) => b.posts - a.posts)
      .slice(0, 8);

    return byVideo;
  }, [periodVideos, period, socialId]);

  const kpis = useMemo(() => {
    const totalVideos = periodVideos.length;
    const totalPosts = periodLinks.length;
    const publiCount = periodVideos.filter((v) => v.is_sponsored).length;
    const repostCount = periodVideos.filter((v) => v.is_repost).length;
    const videosWithoutPosts = periodVideos.filter((v) => {
      const posts = (v.links ?? []).filter((link) => isWithinPeriod(link.posted_at, period));
      return posts.length === 0;
    }).length;

    return {
      totalVideos,
      totalPosts,
      publiRate: pct(publiCount, totalVideos),
      repostRate: pct(repostCount, totalVideos),
      videosWithoutPosts,
      avgPostsPerVideo: totalVideos > 0 ? (totalPosts / totalVideos).toFixed(2) : "0.00",
    };
  }, [periodVideos, periodLinks, period]);

  const maxDistribution = Math.max(...networkDistribution.map((n) => n.value), 0);
  const maxDayCount = Math.max(...last7Days.map((d) => d.count), 0);

  return (
    <div>
      <TitlePage title="Relatorios" />

      <Card className="bg-white/5 border-white/5 text-white">
        <CardContent className="mt-6">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">Período</p>
              <Select value={period} onValueChange={(v) => setPeriod(v as PeriodValue)}>
                <SelectTrigger className="w-full md:max-w-xs">
                  <SelectValue placeholder="Selecione o periodo" />
                </SelectTrigger>
                <SelectContent className="bg-white text-slate-900 border-slate-200">
                  <SelectItem value="7">Ultimos 7 dias</SelectItem>
                  <SelectItem value="30">Ultimos 30 dias</SelectItem>
                  <SelectItem value="90">Ultimos 90 dias</SelectItem>
                  <SelectItem value="ALL">Todo o periodo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">Rede social</p>
              <Select value={socialId} onValueChange={setSocialId}>
                <SelectTrigger className="w-full md:max-w-xs">
                  <SelectValue placeholder="Todas as redes" />
                </SelectTrigger>
                <SelectContent className="bg-white text-slate-900 border-slate-200">
                  <SelectItem value="ALL">Todas</SelectItem>
                  {socialOptions.map((social) => (
                    <SelectItem key={social.id} value={social.id}>
                      {social.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card className="bg-white/5 border-white/5 text-white">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Vídeos cadastrados</p>
            <p className="text-3xl font-bold">{kpis.totalVideos}</p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/5 text-white">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Postagens nas redes</p>
            <p className="text-3xl font-bold">{kpis.totalPosts}</p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/5 text-white">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Taxa de publi</p>
            <p className="text-3xl font-bold">{kpis.publiRate}</p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/5 text-white">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Taxa de repost</p>
            <p className="text-3xl font-bold">{kpis.repostRate}</p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/5 text-white">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Vídeos sem postagem</p>
            <p className="text-3xl font-bold">{kpis.videosWithoutPosts}</p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/5 text-white">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Média de postagens por vídeo</p>
            <p className="text-3xl font-bold">{kpis.avgPostsPerVideo}</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card className="bg-white/5 border-white/5 text-white">
          <CardContent className="pt-6">
            <p className="mb-4 text-base font-semibold">Distribuição de postagens por rede</p>

            {isLoading ? (
              <Loader label="Carregando dados..." />
            ) : networkDistribution.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sem dados para os filtros selecionados.</p>
            ) : (
              <div className="space-y-3">
                {networkDistribution.map((network) => {
                  const width = maxDistribution > 0 ? Math.max((network.value / maxDistribution) * 100, 6) : 0;

                  return (
                    <div key={network.name}>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span>{network.name}</span>
                        <span className="text-muted-foreground">{network.value}</span>
                      </div>
                      <div className="h-2 rounded bg-white/10">
                        <div className="h-2 rounded bg-cyan-400" style={{ width: `${width}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/5 text-white">
          <CardContent className="pt-6">
            <p className="mb-4 text-base font-semibold">Postagens nos ultimos 7 dias</p>

            {isLoading ? (
              <Loader label="Carregando dados..." />
            ) : (
              <div className="grid grid-cols-7 items-end gap-2">
                {last7Days.map((day) => {
                  const height = maxDayCount > 0 ? Math.max((day.count / maxDayCount) * 120, day.count > 0 ? 16 : 4) : 4;

                  return (
                    <div key={day.key} className="flex flex-col items-center gap-2">
                      <span className="text-xs text-muted-foreground">{day.count}</span>
                      <div className="w-full rounded bg-white/10" style={{ height: "120px" }}>
                        <div
                          className="w-full rounded bg-emerald-400"
                          style={{ height: `${height}px`, marginTop: `${120 - height}px` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">{day.label.replace(".", "")}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6 bg-white/5 border-white/5 text-white">
        <CardContent className="mt-6">
          <p className="mb-4 text-base font-semibold">Top vídeos por volume de postagens</p>

          {isLoading ? (
            <Loader label="Carregando dados..." />
          ) : topVideos.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sem vídeos com postagens neste filtro.</p>
          ) : (
            <div className="overflow-x-auto rounded-md border border-white/10 bg-black/20">
              <table className="w-full text-sm">
                <thead className="bg-white text-slate-600">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Vídeo</th>
                    <th className="px-4 py-3 text-left font-medium">Cadastro</th>
                    <th className="px-4 py-3 text-left font-medium">Redes</th>
                    <th className="px-4 py-3 text-left font-medium">Postagens</th>
                    <th className="px-4 py-3 text-left font-medium">Flags</th>
                  </tr>
                </thead>
                <tbody>
                  {topVideos.map((row) => (
                    <tr key={row.video.id} className="border-t border-white/10">
                      <td className="px-4 py-3">
                        <div className="max-w-[360px] truncate font-medium">{row.video.title}</div>
                      </td>
                      <td className="px-4 py-3">{formatDateBR(row.video.created_at)}</td>
                      <td className="px-4 py-3">{row.networks}</td>
                      <td className="px-4 py-3">{row.posts}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {row.video.is_sponsored && <Badge variant="secondary">Publi</Badge>}
                          {row.video.is_repost && <Badge variant="secondary">Repost</Badge>}
                          {!row.video.is_sponsored && !row.video.is_repost && (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
