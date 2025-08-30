import { NextResponse } from "next/server";
import { z, ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

export const dynamic = "force-dynamic";

const BodySchema = z.object({
  name: z.string().min(2, "Informe um nome válido"),
  url: z.string().url("Informe uma URL válida"),
  icon: z.string().min(1, "Selecione um ícone"),
});

export async function GET() {
  try {
    const items = await prisma.socialNetworks.findMany({
      orderBy: { created_at: "desc" },
    });

    return NextResponse.json(items);
  } catch (err: unknown) {
    if (err instanceof PrismaClientKnownRequestError) {
      return NextResponse.json(
        { message: `Erro do Prisma (${err.code}) ao listar redes sociais` },
        { status: 500 }
      );
    }

    console.error("[SOCIAL_NETWORKS][GET]", err);
    return NextResponse.json(
      { message: "Erro ao listar redes sociais" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const data = BodySchema.parse(json);

    const created = await prisma.socialNetworks.create({
      data: {
        name: data.name,
        url: data.url,
        icon: data.icon,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (err: unknown) {
    // Validação Zod
    if (err instanceof ZodError) {
      return NextResponse.json(
        { message: "Dados inválidos", issues: err.issues },
        { status: 400 }
      );
    }

    // Erros conhecidos do Prisma (ex.: unique constraint)
    if (err instanceof PrismaClientKnownRequestError) {
      if (err.code === "P2002") {
        return NextResponse.json(
          { message: "Já existe uma rede social com esse nome ou URL" },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { message: `Erro do Prisma (${err.code}) ao criar rede social` },
        { status: 500 }
      );
    }

    // Fallback genérico
    console.error("[SOCIAL_NETWORKS][POST]", err);
    return NextResponse.json(
      { message: "Erro ao criar rede social" },
      { status: 500 }
    );
  }
}
