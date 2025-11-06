import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import {
  PrismaClientKnownRequestError,
} from "@prisma/client/runtime/library";
import { handleErrorResponse } from "@/lib/api-error";
import { VideoFormCreateSchema } from "@/schemas/video";
import { Prisma } from "@/generated/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const videos = await prisma.video.findMany({
      orderBy: { created_at: "desc" },
      include: {
        links: { include: { social_network: true } },
      },
    });

    return NextResponse.json(videos, { status: 200 });
  } catch (err) {
    console.error("[VIDEOS][GET]", err);

    return handleErrorResponse(err, "Erro ao listar os vídeos.");
  }
}

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const data = VideoFormCreateSchema.parse(json);

    const created = await prisma.video.create({
      data: {
        title: data.title,
        description: data.description,
        tags: data.tags as unknown as Prisma.JsonArray,
        is_repost: data.is_repost,
        is_sponsored: data.is_sponsored,
        cover_image_url: data.cover_image_url,
        raw_video_url: data.raw_video_url,
        links: {
          create: data.links.map((l) => ({
            socialnetwork_id: l.socialnetwork_id,
            url: l.url,
            posted_at: l.posted_at,
          })),
        },
      },
      include: {
        links: { include: { social_network: true } },
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof ZodError) {
      return NextResponse.json(
        { message: "Dados inválidos", issues: err.issues },
        { status: 400 }
      );
    }
    if (err instanceof PrismaClientKnownRequestError) {
      return NextResponse.json(
        { message: `Erro do Prisma (${err.code})` },
        { status: 500 }
      );
    }
    console.error("[VIDEOS][POST]", err);
    return NextResponse.json(
      { message: "Erro ao criar vídeo" },
      { status: 500 }
    );
  }
}
