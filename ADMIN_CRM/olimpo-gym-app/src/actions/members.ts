"use server";

import { db } from "@/db";
import { members, gyms, systemUsers, payments } from "@/db/schema";
import { eq, desc, ilike, or, and, sql } from "drizzle-orm";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

function generatePassword(length = 10): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let pwd = "";
  for (let i = 0; i < length; i++) {
    pwd += chars[Math.floor(Math.random() * chars.length)];
  }
  return pwd;
}

export async function createMember(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("No autorizado");

  const [currentUser] = await db.select().from(systemUsers).where(eq(systemUsers.email, session.user.email!));
  
  let targetGymId = currentUser.gymId;
  if (currentUser.role === "admin") {
    const selectedGym = formData.get("gymId") as string;
    if (selectedGym) targetGymId = selectedGym;
  }
  
  if (!targetGymId) throw new Error("No se pudo determinar la sede");

  const [gym] = await db.select().from(gyms).where(eq(gyms.id, targetGymId));
  if (!gym) throw new Error("Sede no encontrada");

  const groupStr = "0000";
  const seqStr = String(gym.nextMemberSeq).padStart(4, '0');
  const memberCode = `${gym.codePrefix}-${groupStr}-${seqStr}`;

  const startDate = new Date();
  let endDate = new Date(startDate);
  const plan = formData.get("plan") as "mensual" | "trimestral" | "anual";
  
  if (plan === "mensual") endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0); 
  else if (plan === "trimestral") endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 3, 0);
  else if (plan === "anual") endDate = new Date(startDate.getFullYear() + 1, startDate.getMonth(), 0);

  const price = formData.get("price") as string;
  const enrollmentFee = formData.get("enrollmentFee") as string || "0";
  const cardFee = formData.get("cardFee") as string || "0";
  const totalAmount = (Number(price) + Number(enrollmentFee) + Number(cardFee)).toString();
  const hasPaid = formData.get("paid") === "true";
  const paymentMethod = formData.get("paymentMethod") as any || null;

  const plainPassword = generatePassword();
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  const [insertedMember] = await db.insert(members).values({
    code: memberCode,
    gymId: gym.id,
    name: formData.get("name") as string,
    phone: formData.get("phone") as string,
    email: (formData.get("email") as string) || "sin_correo@olimpo.com",
    birthDate: formData.get("birthDate") as string,
    sex: formData.get("sex") as "M" | "F",
    plan: plan,
    price: price,
    membershipStart: startDate.toISOString().split("T")[0],
    membershipEnd: endDate.toISOString().split("T")[0],
    status: "activo",
    paid: hasPaid,
    paymentMethod: paymentMethod,
    photoUrl: (formData.get("photoUrl") as string) || null,
    password: hashedPassword,
    registeredBy: currentUser.id,
  }).returning();

  if (hasPaid) {
    await db.insert(payments).values({
      gymId: gym.id,
      memberId: insertedMember.id,
      monthlyAmount: price,
      enrollmentAmount: enrollmentFee,
      cardAmount: cardFee,
      amount: totalAmount,
      paymentDate: startDate.toISOString().split("T")[0],
      paymentMethod: paymentMethod,
      periodStart: startDate.toISOString().split("T")[0],
      periodEnd: endDate.toISOString().split("T")[0],
      registeredBy: currentUser.id,
      notes: "Primer pago de inscripción",
    });
  }

  await db.update(gyms)
    .set({ nextMemberSeq: gym.nextMemberSeq + 1 })
    .where(eq(gyms.id, gym.id));

  revalidatePath("/members");
  return { success: true, code: memberCode, password: plainPassword };
}

export async function resetMemberPassword(memberId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("No autorizado");

  const plainPassword = generatePassword();
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  await db.update(members)
    .set({ password: hashedPassword })
    .where(eq(members.id, memberId));

  revalidatePath(`/members/${memberId}`);
  return { password: plainPassword };
}

export async function getMembers(params?: { searchQuery?: string, statusFilter?: string, gymIdFilter?: string, limit?: number, offset?: number }) {
  const session = await auth();
  if (!session?.user) throw new Error("No autorizado");
  const [currentUser] = await db.select().from(systemUsers).where(eq(systemUsers.email, session.user.email!));
  
  const conditions = [];
  if (currentUser.role !== "admin") {
    conditions.push(eq(members.gymId, currentUser.gymId!));
  } else if (params?.gymIdFilter) {
    conditions.push(eq(members.gymId, params.gymIdFilter));
  }

  if (params?.searchQuery) {
    conditions.push(or(ilike(members.name, `%${params.searchQuery}%`), ilike(members.code, `%${params.searchQuery}%`))!);
  }
  if (params?.statusFilter && params.statusFilter !== "todos") {
    conditions.push(eq(members.status, params.statusFilter as any));
  }

  // Get total count
  const countQuery = db.select({ count: sql`count(*)` }).from(members);
  if (conditions.length > 0) countQuery.where(and(...conditions));
  const [countRes] = await countQuery;
  const totalCount = Number(countRes?.count || 0);

  // Get paginated data
  const query = db.select({
      member: members,
      gymPrefix: gyms.codePrefix,
    })
    .from(members)
    .innerJoin(gyms, eq(members.gymId, gyms.id));
    
  if (conditions.length > 0) query.where(and(...conditions));
  
  query.orderBy(desc(members.createdAt));

  if (params?.limit) query.limit(params.limit);
  if (params?.offset) query.offset(params.offset);

  const data = await query;

  return {
    data: data.map(d => ({ ...d.member, gymPrefix: d.gymPrefix })),
    totalCount
  };
}

export async function getMemberById(id: string) {
  const session = await auth();
  if (!session?.user) throw new Error("No autorizado");

  const [member] = await db.select({
    member: members,
    gymPrefix: gyms.codePrefix,
    gymName: gyms.name,
  })
  .from(members)
  .innerJoin(gyms, eq(members.gymId, gyms.id))
  .where(eq(members.id, id));

  if (!member) return null;

  const paymentHistory = await db.select()
    .from(payments)
    .where(eq(payments.memberId, id))
    .orderBy(desc(payments.paymentDate));

  return {
    ...member.member,
    gymPrefix: member.gymPrefix,
    gymName: member.gymName,
    payments: paymentHistory
  };
}

export async function updateMemberPhoto(id: string, photoUrl: string) {
  const session = await auth();
  if (!session?.user) throw new Error("No autorizado");

  await db.update(members)
    .set({ photoUrl })
    .where(eq(members.id, id));

  revalidatePath(`/members/${id}`);
  revalidatePath("/members");
  return { success: true };
}
