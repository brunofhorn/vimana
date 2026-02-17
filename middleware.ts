import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const expectedToken = process.env.API_AUTH_TOKEN;

  // Dev fallback: do not block local development if token is not configured.
  if (!expectedToken) {
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { message: "API_AUTH_TOKEN não configurado no ambiente." },
        { status: 500 }
      );
    }
    return NextResponse.next();
  }

  const authorization = req.headers.get("authorization");
  const bearerToken = authorization?.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length).trim()
    : null;
  const headerToken = req.headers.get("x-api-token")?.trim() ?? null;

  const providedToken = bearerToken ?? headerToken;

  if (!providedToken || providedToken !== expectedToken) {
    return NextResponse.json(
      { message: "Não autorizado." },
      { status: 401 }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
