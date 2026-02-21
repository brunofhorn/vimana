import { NextRequest, NextResponse } from "next/server";

type UnauthorizedReason =
  | "missing_token"
  | "invalid_authorization_format"
  | "invalid_token";

function unauthorized(reason: UnauthorizedReason) {
  return NextResponse.json(
    {
      message: "Não autorizado.",
      reason,
    },
    { status: 401 }
  );
}

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
  const hasAuthorizationHeader = authorization !== null;
  const bearerToken = authorization?.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length).trim()
    : null;
  const headerToken = req.headers.get("x-api-token")?.trim() ?? null;

  if (!bearerToken && !headerToken) {
    if (hasAuthorizationHeader) {
      return unauthorized("invalid_authorization_format");
    }
    return unauthorized("missing_token");
  }

  const providedToken = bearerToken ?? headerToken;

  if (providedToken !== expectedToken) {
    return unauthorized("invalid_token");
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
