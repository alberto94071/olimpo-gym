export type MemberStatus = "activo" | "mora" | "vencido" | "bloqueado";
export type Plan = "mensual" | "trimestral" | "anual";

export interface Gym {
  id: string;
  name: string;
  address?: string | null;
  phone?: string | null;
  schedule?: string | null;
}

export interface Group {
  id: string;
  groupNumber: number;
  repName: string | null;
  repPhone: string | null;
  paidFull: boolean;
  memberCount: number;
}

export interface Payment {
  id: string;
  amount: string;
  date: string;
  method: "efectivo" | "transferencia";
  notes?: string | null;
}

export interface Member {
  id: string;
  code: string;
  name: string;
  phone: string;
  email: string;
  birthDate: string;
  sex: "M" | "F";
  photoUrl?: string | null;
  gym: Gym;
  plan: Plan;
  price: string;
  membershipStart: string;
  membershipEnd: string;
  daysRemaining: number;
  status: MemberStatus;
  paid: boolean;
  group: Group | null;
  paymentHistory: Payment[];
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  gymName?: string | null;
  createdAt: string;
}

export interface MemberNotification {
  id: string;
  title: string;
  body: string;
  type: string;
  read: boolean;
  sentAt: string;
}

export interface AuthMember {
  id: string;
  name: string;
  code: string;
  gym: { id: string; name: string | null };
  status: MemberStatus;
  photoUrl?: string | null;
}
