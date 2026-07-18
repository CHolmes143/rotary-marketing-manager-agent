import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/db";

export const runtime = "nodejs";

function isAuthorized(request: Request) {
  const expectedToken = process.env.ADMIN_BOOTSTRAP_TOKEN;
  const providedToken = request.headers.get("x-bootstrap-token");

  return Boolean(expectedToken && providedToken === expectedToken);
}

export async function DELETE(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const prisma = getPrisma();

  if (!prisma) {
    return NextResponse.json(
      { error: "DATABASE_URL is not configured." },
      { status: 500 },
    );
  }

  const url = new URL(request.url);
  const count = Number(url.searchParams.get("count") ?? "0");

  if (!Number.isInteger(count) || count < 1 || count > 50) {
    return NextResponse.json(
      { error: "Provide a count between 1 and 50." },
      { status: 400 },
    );
  }

  const records = await prisma.learningRecord.findMany({
    orderBy: { createdAt: "desc" },
    take: count,
    select: { id: true },
  });

  const result = await prisma.learningRecord.deleteMany({
    where: { id: { in: records.map((record) => record.id) } },
  });

  const remainingCount = await prisma.learningRecord.count();

  return NextResponse.json({
    ok: true,
    requestedCount: count,
    deletedCount: result.count,
    remainingCount,
  });
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const prisma = getPrisma();

  if (!prisma) {
    return NextResponse.json(
      { error: "DATABASE_URL is not configured." },
      { status: 500 },
    );
  }

  const url = new URL(request.url);
  const count = Number(url.searchParams.get("count") ?? "10");

  if (!Number.isInteger(count) || count < 1 || count > 50) {
    return NextResponse.json(
      { error: "Provide a count between 1 and 50." },
      { status: 400 },
    );
  }

  const records = await prisma.learningRecord.findMany({
    orderBy: { createdAt: "desc" },
    take: count,
    include: { contentType: true },
  });

  return NextResponse.json({
    ok: true,
    records: records.map((record) => ({
      id: record.id,
      platform: record.platform,
      postType: record.postType,
      contentType: record.contentType?.name ?? null,
      subject: record.subject,
      objective: record.objective,
      finalCopy: record.finalCopy,
      editReason: record.editReason,
      createdAt: record.createdAt,
    })),
  });
}
