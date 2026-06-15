import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { announcements, gyms } from "@/db/schema";
import { eq, or, isNull, and, desc, count } from "drizzle-orm";
import { getMobileAuth } from "@/lib/mobile-auth";

export async function GET(req: NextRequest) {
  try {
    const auth = await getMobileAuth(req);
    if (!auth) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20")));
    const offset = (page - 1) * limit;

    const gymFilter = and(
      or(eq(announcements.gymId, auth.gymId), isNull(announcements.gymId)),
      eq(announcements.published, true)
    );

    const [{ total }] = await db
      .select({ total: count() })
      .from(announcements)
      .where(gymFilter);

    const rows = await db
      .select({
        id: announcements.id,
        title: announcements.title,
        body: announcements.body,
        imageUrl: announcements.imageUrl,
        pinned: announcements.pinned,
        createdAt: announcements.createdAt,
        gymName: gyms.name,
      })
      .from(announcements)
      .leftJoin(gyms, eq(announcements.gymId, gyms.id))
      .where(gymFilter)
      .orderBy(desc(announcements.pinned), desc(announcements.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({
      data: rows,
      totalCount: Number(total),
      page,
      totalPages: Math.ceil(Number(total) / limit),
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Error interno";
    console.error("[mobile/announcements]", error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
