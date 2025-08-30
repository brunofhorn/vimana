// app/api/videos/route.ts
import { NextResponse } from "next/server"
import { z, ZodError } from "zod"
import { prisma } from "@/lib/prisma"
import { JsonArray, PrismaClientKnownRequestError } from "@prisma/client/runtime/library"

export const dynamic = "force-dynamic"

const LinkSchema = z.object({
  socialNetworkId: z.string().min(1),
  url: z.string().url(),
  postedAt: z.string().min(1),
})

const BodySchema = z.object({
  title: z.string().min(1),
  description: z.string().optional().default(""),
  tags: z.array(z.string()).default([]),
  isRepost: z.boolean().default(false),
  isSponsored: z.boolean().default(false),
  coverImageUrl: z.string().url().optional().or(z.literal("").transform(() => undefined)),
  rawVideoUrl: z.string().url().optional().or(z.literal("").transform(() => undefined)),
  links: z.array(LinkSchema).default([]),
})

export async function GET() {
  try {
    const videos = await prisma.video.findMany({
      orderBy: { created_at: "desc" },
      include: {
        links: { include: { social_network: true } }, // nome da relação no seu schema
      },
    })
    return NextResponse.json(videos)
  } catch (err) {
    console.error("[VIDEOS][GET]", err)
    return NextResponse.json({ message: "Erro ao listar vídeos" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const json = await req.json()
    const data = BodySchema.parse(json)

    const created = await prisma.video.create({
      data: {
        title: data.title,
        description: data.description,
        tags: data.tags as unknown as JsonArray,
        is_repost: data.isRepost,
        is_sponsored: data.isSponsored,
        cover_image_url: data.coverImageUrl,
        raw_video_url: data.rawVideoUrl,     
        links: {
          create: data.links.map((l) => ({
            socialnetwork_id: l.socialNetworkId,
            url: l.url,
            posted_at: new Date(l.postedAt),
          })),
        },
      },
      include: {
        links: { include: { social_network: true } },
      },
    })

    return NextResponse.json(created, { status: 201 })
  } catch (err: unknown) {
    if (err instanceof ZodError) {
      return NextResponse.json({ message: "Dados inválidos", issues: err.issues }, { status: 400 })
    }
    if (err instanceof PrismaClientKnownRequestError) {
      return NextResponse.json({ message: `Erro do Prisma (${err.code})` }, { status: 500 })
    }
    console.error("[VIDEOS][POST]", err)
    return NextResponse.json({ message: "Erro ao criar vídeo" }, { status: 500 })
  }
}
