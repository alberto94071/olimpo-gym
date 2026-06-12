import { db } from "@/db";
import { systemUsers, gyms } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { PricingForm } from "@/components/pricing/PricingForm";
import { Settings } from "lucide-react";

export default async function PricingPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [currentUser] = await db.select().from(systemUsers).where(eq(systemUsers.email, session.user.email!));
  
  if (currentUser.role !== "admin") {
    redirect("/dashboard");
  }

  const allGyms = await db.select().from(gyms).orderBy(asc(gyms.name));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-olimpo-gold flex items-center gap-2">
          <Settings className="w-8 h-8" />
          Configuración de Precios
        </h2>
        <p className="text-sm sm:text-base text-olimpo-text-muted mt-1">
          Administra los costos base de cada sede. Estos valores se aplicarán automáticamente al registrar nuevos miembros o grupos.
        </p>
      </div>

      <div className="max-w-4xl">
        <PricingForm gyms={allGyms} />
      </div>
    </div>
  );
}
