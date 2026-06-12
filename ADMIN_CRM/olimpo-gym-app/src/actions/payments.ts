"use server";

import { db } from "@/db";
import { members, payments, systemUsers, groups } from "@/db/schema";
import { eq, ilike, or, and, desc } from "drizzle-orm";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function searchMembersForPayment(query: string, gymFilter?: string) {
  const session = await auth();
  if (!session?.user) throw new Error("No autorizado");

  const [currentUser] = await db.select().from(systemUsers).where(eq(systemUsers.email, session.user.email!));

  const conditions = [];
  if (currentUser.role !== "admin") {
    conditions.push(eq(members.gymId, currentUser.gymId!));
  } else if (gymFilter) {
    conditions.push(eq(members.gymId, gymFilter));
  }

  if (query) {
    conditions.push(or(ilike(members.name, `%${query}%`), ilike(members.code, `%${query}%`))!);
  }

  const dbQuery = db.select().from(members);
  if (conditions.length > 0) dbQuery.where(and(...conditions));
  
  // limit to 20 to avoid huge payloads
  dbQuery.limit(20);

  return await dbQuery;
}

export async function registerPayment(data: {
  memberId: string;
  paymentType: "mensualidad" | "reposicion_carne";
  paymentMonth?: string;
  amount: string;
  paymentMethod: "efectivo" | "transferencia";
  notes?: string;
}) {
  const session = await auth();
  if (!session?.user) throw new Error("No autorizado");

  const [currentUser] = await db.select().from(systemUsers).where(eq(systemUsers.email, session.user.email!));
  
  const [member] = await db.select().from(members).where(eq(members.id, data.memberId));
  if (!member) throw new Error("Miembro no encontrado");

  await db.transaction(async (tx) => {
    const today = new Date();
    let newEndDate = new Date(member.membershipEnd);
    
    if (data.paymentType === "mensualidad" && data.paymentMonth) {
      const [yyyy, mm] = data.paymentMonth.split("-").map(Number);
      
      // newEndDate should be the last day of the selected month
      newEndDate = new Date(yyyy, mm, 0);

      // Update the member
      await tx.update(members)
        .set({ 
          membershipEnd: newEndDate.toISOString().split("T")[0],
          status: "activo", // Clear any mora status
          paid: true
        })
        .where(eq(members.id, member.id));

      // Also update the group if this is a group payment? 
      // Wait, if it's a representative paying, we should update all group members!
      if (member.groupId && member.isRepresentative) {
         await tx.update(members)
          .set({
            membershipEnd: newEndDate.toISOString().split("T")[0],
            status: "activo",
            paid: true
          })
          .where(eq(members.groupId, member.groupId));
         
         await tx.update(groups)
          .set({ paidFull: true })
          .where(eq(groups.id, member.groupId));
      }
    }

    // Insert payment record
    await tx.insert(payments).values({
      gymId: member.gymId,
      memberId: member.id,
      groupId: member.groupId,
      amount: data.amount,
      monthlyAmount: data.paymentType === "mensualidad" ? data.amount : "0",
      cardAmount: data.paymentType === "reposicion_carne" ? data.amount : "0",
      paymentDate: today.toISOString().split("T")[0],
      paymentMethod: data.paymentMethod,
      periodStart: data.paymentType === "mensualidad" ? member.membershipEnd : null,
      periodEnd: data.paymentType === "mensualidad" ? newEndDate.toISOString().split("T")[0] : null,
      registeredBy: currentUser.id,
      notes: data.notes || (data.paymentType === "mensualidad" ? "Renovación de membresía" : "Reposición de carné"),
    });
  });

  revalidatePath("/payments");
  revalidatePath("/members");
  revalidatePath("/groups");
  return { success: true };
}

export async function getGroupDetailsForPayment(groupId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("No autorizado");

  const [group] = await db.select().from(groups).where(eq(groups.id, groupId));
  if (!group) throw new Error("Grupo no encontrado");

  const groupMembers = await db.select().from(members).where(eq(members.groupId, groupId));
  
  // Calculate total monthly payment
  const totalAmount = groupMembers.reduce((sum, m) => sum + Number(m.price), 0);

  return {
    group,
    groupMembers,
    totalAmount: totalAmount.toString()
  };
}
