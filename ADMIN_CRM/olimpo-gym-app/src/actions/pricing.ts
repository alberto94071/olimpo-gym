"use server";

import { db } from "@/db";
import { gyms, systemUsers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function updateGymPricing(gymId: string, formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("No autorizado");

  const [currentUser] = await db.select().from(systemUsers).where(eq(systemUsers.email, session.user.email!));
  if (currentUser.role !== "admin") throw new Error("No tienes permisos para realizar esta acción");

  const pricingMonthly = formData.get("pricingMonthly") as string;
  const pricingGroupDefault = formData.get("pricingGroupDefault") as string;
  const enrollmentFee = formData.get("enrollmentFee") as string;
  const cardFee = formData.get("cardFee") as string;

  await db.update(gyms)
    .set({
      pricingMonthly,
      pricingGroupDefault,
      enrollmentFee,
      cardFee,
    })
    .where(eq(gyms.id, gymId));

  revalidatePath("/pricing");
  revalidatePath("/members/new");
  revalidatePath("/groups/new");
  return { success: true };
}
