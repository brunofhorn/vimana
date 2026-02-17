/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function toDate(value: unknown): Date {
  if (value instanceof Date) return value;
  if (typeof value === "string") {
    // aceita dd/MM/yyyy
    const m = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (m) return new Date(`${m[3]}-${m[2]}-${m[1]}T00:00:00.000Z`);
    const d = new Date(value);
    if (!isNaN(d.getTime())) return d;
  }
  throw new Error("Invalid date");
}

const LinkInputSchema = z.object({
  id: z.string().optional(),
  social_network_id: z.string().min(1, "Selecione a rede"),
  url: z.string().url("URL invÃƒÂ¡lida"),
  posted_at: z.preprocess(toDate, z.date()),
});

const BodySchema = z.object({
  links: z.array(LinkInputSchema),
});

/** Carrega as postagens do vÃƒÂ­deo (com dados da rede) */
export async function GET(_req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;

    const links = await prisma.videoLink.findMany({
      where: { video_id: id },
      include: { social_network: true },
      orderBy: { posted_at: "desc" },
    });
    return NextResponse.json(
      links.map((link) => ({
        id: link.id,
        video_id: link.video_id,
        social_network_id: link.socialnetwork_id,
        url: link.url,
        posted_at: link.posted_at,
        social_network: link.social_network,
      }))
    );
  } catch (err) {
    console.error("[VIDEO_LINKS][GET]", err);
    return NextResponse.json(
      { message: "Erro ao buscar links" },
      { status: 500 }
    );
  }
}

/** Substitui o conjunto de links do vÃƒÂ­deo por `links` (create/update/delete) */
export async function PUT(_req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const json = await _req.json();
    const { links } = BodySchema.parse(json);

    // garante vÃƒÂ­deo existente
    const video = await prisma.video.findUnique({ where: { id: id } });
    if (!video) {
      return NextResponse.json(
        { message: "VÃƒÂ­deo nÃƒÂ£o encontrado" },
        { status: 404 }
      );
    }

    // transaÃƒÂ§ÃƒÂ£o: delete removidos + upsert/updates + creates
    const updated = await prisma.$transaction(async (tx) => {
      const existing = await tx.videoLink.findMany({
        where: { video_id: id },
        select: { id: true, socialnetwork_id: true },
      });

      const incomingIds = new Set(links.filter((l) => l.id).map((l) => l.id!));
      const toDeleteIds = existing
        .filter((e) => !incomingIds.has(e.id))
        .map((e) => e.id);

      if (toDeleteIds.length) {
        await tx.videoLink.deleteMany({ where: { id: { in: toDeleteIds } } });
      }

      // checar duplicidades (video, social_network) no payload
      const seen = new Set<string>();
      for (const l of links) {
        const key = `${id}::${l.social_network_id}`;
        if (seen.has(key)) {
          return Promise.reject(
            new Error("Redes duplicadas no formulÃƒÂ¡rio para o mesmo vÃƒÂ­deo.")
          );
        }
        seen.add(key);
      }

      // Atualiza/cria
      for (const l of links) {
        if (l.id) {
          // evitar colisÃƒÂ£o com outra linha do mesmo vÃƒÂ­deo/rede
          const other = await tx.videoLink.findFirst({
            where: {
              video_id: id,
              socialnetwork_id: l.social_network_id,
              id: { not: l.id },
            },
            select: { id: true },
          });
          if (other) {
            return Promise.reject(
              new Error("JÃƒÂ¡ existe uma postagem para essa rede neste vÃƒÂ­deo.")
            );
          }

          await tx.videoLink.update({
            where: { id: l.id },
            data: {
              socialnetwork_id: l.social_network_id,
              url: l.url,
              posted_at: l.posted_at,
            },
          });
        } else {
          // criar nova (respeita @@unique(video_id, socialnetwork_id))
          await tx.videoLink.create({
            data: {
              video_id: id,
              socialnetwork_id: l.social_network_id,
              url: l.url,
              posted_at: l.posted_at,
            },
          });
        }
      }

      const current = await tx.videoLink.findMany({
        where: { video_id: id },
        include: { social_network: true },
        orderBy: { posted_at: "desc" },
      });
      return current;
    });

    return NextResponse.json({
      video_id: id,
      links: updated.map((link) => ({
        id: link.id,
        social_network_id: link.socialnetwork_id,
        url: link.url,
        posted_at: link.posted_at,
        social_network: link.social_network,
      })),
    });
  } catch (err: any) {
    console.error("[VIDEO_LINKS][PUT]", err);

    if (err?.name === "ZodError") {
      return NextResponse.json(
        { message: "Dados invÃƒÂ¡lidos", issues: err.issues },
        { status: 400 }
      );
    }
    if (err?.code === "P2002") {
      // quebra de unique (video_id, socialnetwork_id)
      return NextResponse.json(
        { message: "JÃƒÂ¡ existe uma postagem para essa rede neste vÃƒÂ­deo." },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { message: err?.message ?? "Erro ao salvar" },
      { status: 500 }
    );
  }
}
