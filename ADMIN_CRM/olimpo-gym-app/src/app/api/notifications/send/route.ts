import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { pushSubscriptions, members, notifications, memberNotifications, systemUsers } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/auth";
import { sendExpoPush } from "@/lib/expo-push";

export async function POST(req: NextRequest) {
  try {
    // Verificar que es un system_user autenticado
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const [sysUser] = await db
      .select({ id: systemUsers.id, gymId: systemUsers.gymId, role: systemUsers.role })
      .from(systemUsers)
      .where(eq(systemUsers.email, session.user.email))
      .limit(1);

    if (!sysUser) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const { title, body: msgBody, targetGymId, targetMemberId, type } = body;

    if (!title || !msgBody || !type) {
      return NextResponse.json(
        { error: "Requerido: title, body, type" },
        { status: 400 }
      );
    }

    // Secretarias solo pueden enviar a su sede
    const finalGymId =
      sysUser.role !== "admin" ? sysUser.gymId : (targetGymId ?? null);

    // Obtener tokens según target
    let tokenQuery = db
      .select({ token: pushSubscriptions.expoPushToken, memberId: pushSubscriptions.memberId })
      .from(pushSubscriptions)
      .innerJoin(members, eq(pushSubscriptions.memberId, members.id))
      .$dynamic();

    const conditions = [eq(pushSubscriptions.active, true)];

    if (targetMemberId) {
      conditions.push(eq(members.id, targetMemberId));
    } else if (finalGymId) {
      conditions.push(eq(members.gymId, finalGymId));
    }

    const subs = await tokenQuery.where(and(...conditions));

    const tokens = subs.map((s) => s.token).filter(Boolean);

    if (tokens.length > 0) {
      await sendExpoPush(tokens, title, msgBody, { type });
    }

    // Registrar en member_notifications (inbox) para cada miembro
    const memberIds = [...new Set(subs.map((s) => s.memberId))];
    if (memberIds.length > 0) {
      await db.insert(memberNotifications).values(
        memberIds.map((memberId) => ({
          memberId,
          title,
          body: msgBody,
          type,
        }))
      );
    }

    // Registrar en tabla notifications (log del CRM)
    await db.insert(notifications).values({
      type: type as "payment_reminder" | "motivation" | "birthday" | "group_reminder" | "custom" | "announcement",
      title,
      message: msgBody,
      gymId: finalGymId ?? null,
      targetMemberId: targetMemberId ?? null,
      channel: "push",
      sentAt: new Date(),
      sentBy: sysUser.id,
      deliveredCount: tokens.length,
    });

    return NextResponse.json({ success: true, sentCount: tokens.length });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Error interno";
    console.error("[notifications/send]", error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
