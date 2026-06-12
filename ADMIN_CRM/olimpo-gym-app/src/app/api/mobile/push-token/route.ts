import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { pushSubscriptions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getMobileAuth } from "@/lib/mobile-auth";

export async function PUT(req: NextRequest) {
  try {
    const auth = await getMobileAuth(req);
    if (!auth) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const { expoPushToken, platform } = body;

    if (!expoPushToken) {
      return NextResponse.json({ error: "expoPushToken requerido" }, { status: 400 });
    }

    const existing = await db.query.pushSubscriptions.findFirst({
      where: eq(pushSubscriptions.expoPushToken, expoPushToken),
    });

    if (existing) {
      await db
        .update(pushSubscriptions)
        .set({ memberId: auth.memberId, active: true, platform: platform || existing.platform })
        .where(eq(pushSubscriptions.id, existing.id));
    } else {
      await db.insert(pushSubscriptions).values({
        memberId: auth.memberId,
        expoPushToken,
        platform: platform || null,
        active: true,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Error interno";
    console.error("[mobile/push-token]", error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
