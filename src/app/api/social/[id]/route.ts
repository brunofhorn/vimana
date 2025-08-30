import { NextResponse } from "next/server";
import { z, ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

const BodySchema = z.object({
  name: z.string().min(2, "Informe um nome válido"),
  url: z.string().url("Informe uma URL válida"),
  icon: z.string().min(1, "Selecione um ícone"),
});

type Params = { params: { id: string } };

export async function PATCH(req: Request, { params }: Params) {
  try {
    const json = await req.json();
    const data = BodySchema.parse(json);

    const updated = await prisma.socialNetworks.update({
      where: { id: params.id },
      data: { name: data.name, url: data.url, icon: data.icon },
    });

    return NextResponse.json(updated);
  } catch (err: unknown) {
    if (err instanceof ZodError) {
      return NextResponse.json(
        { message: "Dados inválidos", issues: err.issues },
        { status: 400 }
      );
    }
    if (err instanceof PrismaClientKnownRequestError) {
      if (err.code === "P2025") {
        return NextResponse.json(
          { message: "Registro não encontrado" },
          { status: 404 }
        );
      }
      if (err.code === "P2002") {
        return NextResponse.json(
          { message: "Nome/URL já em uso" },
          { status: 409 }
        );
      }
    }
    console.error("[SOCIAL_NETWORKS][PATCH]", err);
    return NextResponse.json({ message: "Erro ao atualizar" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    await prisma.socialNetworks.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    if (err instanceof PrismaClientKnownRequestError && err.code === "P2025") {
      return NextResponse.json(
        { message: "Registro não encontrado" },
        { status: 404 }
      );
    }
    console.error("[SOCIAL_NETWORKS][DELETE]", err);
    return NextResponse.json({ message: "Erro ao remover" }, { status: 500 });
  }
}
