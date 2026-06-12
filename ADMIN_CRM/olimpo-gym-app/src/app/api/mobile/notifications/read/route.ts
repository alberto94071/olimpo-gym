import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { memberNotifications } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getMobileAuth } from "@/lib/mobile-auth";

export async function PUT(req: NextRequest) {
  try {
    const auth = await getMobileAuth(req);
    if (!auth) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await req.json();

    if (body.all === true) {
      // Marcar todas como leídas
      await db
        .update(memberNotifications)
        .set({ read: true })
        .where(eq(memberNotifications.memberId, auth.memberId));
    } else if (body.notificationId) {
      // Marcar una específica (verificar que pertenece al miembro)
      await db
        .update(memberNotifications)
        .set({ read: true })
        .where(
          and(
            eq(memberNotifications.id, body.notificationId),
            eq(memberNotifications.memberId, auth.memberId)
          )
        );
    } else {
      return NextResponse.json(
        { error: "Requerido: notificationId o { all: true }" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Error interno";
    console.error("[mobile/notifications/read]", error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
