import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleErrorResponse } from "@/lib/api-error";
import { SocialNetworkFormCreateSchema } from "@/schemas/social";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const items = await prisma.socialNetworks.findMany({
      orderBy: { created_at: "desc" },
    });

    return NextResponse.json(items, { status: 200 });
  } catch (err) {
    console.error("[SOCIAL_NETWORKS][GET]", err);

    return handleErrorResponse(err, "Erro ao listar as redes sociais.");
  }
}

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const data = SocialNetworkFormCreateSchema.parse(json);

    const created = await prisma.socialNetworks.create({
      data: {
        name: data.name,
        url: data.url,
        icon: data.icon,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (err: unknown) {
    console.error("[SOCIAL_NETWORKS][POST]", err);

    return handleErrorResponse(err, "Erro ao cadastrar a rede social.");
  }
}
