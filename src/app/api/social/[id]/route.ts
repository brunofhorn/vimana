import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleErrorResponse } from "@/lib/api-error";
import { SocialNetworkFormCreateSchema } from "@/schemas/social";

export async function PUT(
  req: NextRequest,
  ctx: RouteContext<"/api/social/[id]">
) {
  try {
    const { id } = await ctx.params;

    const json = await req.json();
    const data = SocialNetworkFormCreateSchema.parse(json);

    const updated = await prisma.socialNetworks.update({
      where: { id },
      data: { name: data.name, url: data.url, icon: data.icon },
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (err) {
    console.error("[SOCIAL_NETWORKS][PUT]", err);

    return handleErrorResponse(err, "Erro ao atualizar a rede social.");
  }
}

export async function DELETE(
  _req: NextRequest,
  ctx: RouteContext<"/api/social/[id]">
) {
  try {
    const { id } = await ctx.params;

    await prisma.socialNetworks.delete({ where: { id } });

    return Response.json(undefined, { status: 204 });
  } catch (err) {
    console.error("[SOCIAL_NETWORKS][DELETE]", err);

    return handleErrorResponse(err, "Erro ao remover rede social.");
  }
}
