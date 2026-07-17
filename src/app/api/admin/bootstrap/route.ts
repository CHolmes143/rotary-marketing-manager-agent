import { NextResponse } from "next/server";
import { bootstrapDatabase } from "@/lib/bootstrap-database";

export const runtime = "nodejs";

function isAuthorized(request: Request) {
  const expectedToken = process.env.ADMIN_BOOTSTRAP_TOKEN;
  const providedToken = request.headers.get("x-bootstrap-token");

  return Boolean(expectedToken && providedToken === expectedToken);
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await bootstrapDatabase();

  return NextResponse.json({
    ok: true,
    persistence: "database",
    ...result,
  });
}
