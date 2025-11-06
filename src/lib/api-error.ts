import { NextResponse } from "next/server";
import { ZodError } from "zod";
import {
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
} from "@/generated/prisma/runtime/library";

/**
 * Trata erros comuns (Prisma, Zod, JSON inválido) e devolve um NextResponse.
 * Use direto no catch: `return handleErrorResponse(err, "Mensagem padrão")`.
 */
export function handleErrorResponse(
  err: unknown,
  fallbackMessage = "Erro interno"
) {
  if (err instanceof PrismaClientKnownRequestError) {
    switch (err.code) {
      case "P2025": // record not found
        return NextResponse.json(
          { message: "Recurso não encontrado", code: err.code },
          { status: 404 }
        );
      case "P2002": // unique constraint
        return NextResponse.json(
          {
            message: "Conflito: já existe um registro com esses dados",
            code: err.code,
            target: err.meta?.target,
          },
          { status: 409 }
        );
      case "P2003": // foreign key constraint
        return NextResponse.json(
          { message: "Violação de integridade referencial", code: err.code },
          { status: 400 }
        );
      default:
        return NextResponse.json(
          { message: "Erro de banco de dados", code: err.code },
          { status: 500 }
        );
    }
  }

  if (err instanceof PrismaClientValidationError) {
    return NextResponse.json(
      { message: "Parâmetros inválidos" },
      { status: 400 }
    );
  }

  // Zod: validação de entrada
  if (err instanceof ZodError) {
    return NextResponse.json(
      { message: "Dados inválidos", issues: err.issues },
      { status: 400 }
    );
  }

  // JSON malformado (ex.: body inválido)
  if (err instanceof SyntaxError) {
    return NextResponse.json({ message: "JSON malformado" }, { status: 400 });
  }

  // Genérico
  return NextResponse.json({ message: fallbackMessage }, { status: 500 });
}