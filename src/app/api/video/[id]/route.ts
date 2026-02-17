import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { VideoFormCreateSchema } from "@/schemas/video";
import { Prisma } from "@/generated/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type VideoWithLinks = Prisma.VideoGetPayload<{
  include: { links: { include: { social_network: true } } };
}>;

function toTagsArray(tags: Prisma.JsonValue | null): string[] {
  if (!Array.isArray(tags)) return [];

  return tags
    .map((tag) => (typeof tag === "string" ? tag.trim() : ""))
    .filter(Boolean);
}

function serializeVideo(video: VideoWithLinks) {
  return {
    ...video,
    tags: toTagsArray((video.tags as Prisma.JsonValue | null) ?? null),
    links: video.links.map((link) => {
      const { socialnetwork_id, ...rest } = link;
      return {
        ...rest,
        social_network_id: socialnetwork_id,
      };
    }),
  };
}

export async function GET(_req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;

    const video = await prisma.video.findUnique({
      where: { id },
      include: {
        links: { include: { social_network: true } },
      },
    });

    if (!video) {
      return NextResponse.json({ message: "Video nao encontrado" }, { status: 404 });
    }

    return NextResponse.json(serializeVideo(video), { status: 200 });
  } catch (err) {
    console.error("[VIDEOS][GET_BY_ID]", err);
    return NextResponse.json({ message: "Erro ao buscar video" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const json = await req.json();
    const data = VideoFormCreateSchema.parse(json);

    const existing = await prisma.video.findUnique({ where: { id }, select: { id: true } });

    if (!existing) {
      return NextResponse.json({ message: "Video nao encontrado" }, { status: 404 });
    }

    const updated = await prisma.$transaction(async (tx) => {
      await tx.video.update({
        where: { id },
        data: {
          title: data.title,
          description: data.description,
          tags: data.tags as unknown as Prisma.JsonArray,
          is_repost: data.is_repost,
          is_sponsored: data.is_sponsored,
          cover_image_url: data.cover_image_url,
          raw_video_url: data.raw_video_url,
        },
      });

      await tx.videoLink.deleteMany({ where: { video_id: id } });

      if (data.links.length > 0) {
        await tx.videoLink.createMany({
          data: data.links.map((link) => ({
            video_id: id,
            socialnetwork_id: link.social_network_id,
            url: link.url,
            posted_at: link.posted_at,
          })),
        });
      }

      return tx.video.findUnique({
        where: { id },
        include: {
          links: { include: { social_network: true } },
        },
      });
    });

    if (!updated) {
      return NextResponse.json({ message: "Video nao encontrado" }, { status: 404 });
    }

    return NextResponse.json(serializeVideo(updated), { status: 200 });
  } catch (err: unknown) {
    if (err instanceof PrismaClientKnownRequestError) {
      if (err.code === "P2002") {
        return NextResponse.json(
          { message: "Ja existe uma postagem para essa rede neste video." },
          { status: 409 }
        );
      }

      return NextResponse.json({ message: `Erro do Prisma (${err.code})` }, { status: 500 });
    }

    console.error("[VIDEOS][PUT]", err);
    return NextResponse.json({ message: "Erro ao atualizar video" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;

    await prisma.video.delete({ where: { id } });

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    if (err instanceof PrismaClientKnownRequestError && err.code === "P2025") {
      return NextResponse.json({ message: "Video nao encontrado" }, { status: 404 });
    }

    console.error("[VIDEOS][DELETE]", err);
    return NextResponse.json({ message: "Erro ao excluir video" }, { status: 500 });
  }
}
