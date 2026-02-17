import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import {
  PrismaClientKnownRequestError,
} from "@prisma/client/runtime/library";
import { handleErrorResponse } from "@/lib/api-error";
import { VideoFormCreateSchema } from "@/schemas/video";
import { Prisma } from "@/generated/prisma";

export const dynamic = "force-dynamic";

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

function parseYesNo(value: string | null): boolean | null {
  if (value === "S") return true;
  if (value === "N") return false;
  return null;
}

function parsePositiveInt(value: string | null, fallback: number): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return Math.floor(parsed);
}

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams;

    const query = (sp.get("query") ?? "").trim();
    const social = (sp.get("social") ?? "").trim();
    const postedDate = (sp.get("postedDate") ?? "").trim();
    const publi = parseYesNo(sp.get("publi"));
    const repost = parseYesNo(sp.get("repost"));
    const order = sp.get("order") === "asc" ? "asc" : "desc";
    const page = parsePositiveInt(sp.get("page"), 1);
    const rawPageSize = (sp.get("pageSize") ?? "20").trim().toUpperCase();
    const isAll = rawPageSize === "ALL";
    const pageSize = isAll
      ? 0
      : Math.min(parsePositiveInt(rawPageSize, 20), 100);

    const where: Prisma.VideoWhereInput = {};

    if (query) {
      where.OR = [
        { title: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
        { raw_video_url: { contains: query, mode: "insensitive" } },
        {
          links: {
            some: {
              OR: [
                { url: { contains: query, mode: "insensitive" } },
                {
                  social_network: { name: { contains: query, mode: "insensitive" } },
                },
              ],
            },
          },
        },
      ];
    }

    if (social) {
      where.links = { some: { socialnetwork_id: social } };
    }

    if (postedDate) {
      const d = new Date(`${postedDate}T00:00:00.000Z`);
      if (!Number.isNaN(d.getTime())) {
        const end = new Date(d);
        end.setUTCDate(end.getUTCDate() + 1);

        where.links = {
          some: {
            ...(social ? { socialnetwork_id: social } : {}),
            posted_at: {
              gte: d,
              lt: end,
            },
          },
        };
      }
    }

    if (publi !== null) {
      where.is_sponsored = publi;
    }

    if (repost !== null) {
      where.is_repost = repost;
    }

    const [videos, total] = await prisma.$transaction([
      prisma.video.findMany({
        where,
        orderBy: { created_at: order },
        include: {
          links: { include: { social_network: true } },
        },
        ...(isAll
          ? {}
          : {
              skip: (page - 1) * pageSize,
              take: pageSize,
            }),
      }),
      prisma.video.count({ where }),
    ]);

    return NextResponse.json(
      {
        items: videos.map(serializeVideo),
        total,
        page,
        pageSize: isAll ? "ALL" : pageSize,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("[VIDEOS][GET]", err);

    return handleErrorResponse(err, "Erro ao listar os vÃ­deos.");
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
            socialnetwork_id: l.social_network_id,
            url: l.url,
            posted_at: l.posted_at,
          })),
        },
      },
      include: {
        links: { include: { social_network: true } },
      },
    });

    return NextResponse.json(serializeVideo(created), { status: 201 });
  } catch (err: unknown) {
    if (err instanceof ZodError) {
      return NextResponse.json(
        { message: "Dados invÃ¡lidos", issues: err.issues },
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
      { message: "Erro ao criar vÃ­deo" },
      { status: 500 }
    );
  }
}
