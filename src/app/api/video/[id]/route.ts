// app/api/videos/[id]/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library"

type Params = { params: { id: string } }

export async function DELETE(_req: Request, { params }: Params) {
  try {
    await prisma.video.delete({ where: { id: params.id } })
    return NextResponse.json({ ok: true })
  } catch (err: unknown) {
    if (err instanceof PrismaClientKnownRequestError && err.code === "P2025") {
      return NextResponse.json({ message: "Vídeo não encontrado" }, { status: 404 })
    }
    console.error("[VIDEOS][DELETE]", err)
    return NextResponse.json({ message: "Erro ao excluir vídeo" }, { status: 500 })
  }
}
