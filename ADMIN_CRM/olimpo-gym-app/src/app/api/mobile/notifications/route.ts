import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { memberNotifications } from "@/db/schema";
import { eq, desc, count, and } from "drizzle-orm";
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

    const memberFilter = eq(memberNotifications.memberId, auth.memberId);

    const [{ total }] = await db
      .select({ total: count() })
      .from(memberNotifications)
      .where(memberFilter);

    const [{ unread }] = await db
      .select({ unread: count() })
      .from(memberNotifications)
      .where(and(memberFilter, eq(memberNotifications.read, false)));

    const rows = await db
      .select({
        id: memberNotifications.id,
        title: memberNotifications.title,
        body: memberNotifications.body,
        type: memberNotifications.type,
        read: memberNotifications.read,
        sentAt: memberNotifications.sentAt,
      })
      .from(memberNotifications)
      .where(memberFilter)
      .orderBy(desc(memberNotifications.sentAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({
      data: rows,
      unreadCount: Number(unread),
      totalCount: Number(total),
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Error interno";
    console.error("[mobile/notifications]", error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
