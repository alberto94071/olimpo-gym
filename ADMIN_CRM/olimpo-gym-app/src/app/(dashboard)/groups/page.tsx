import { getGroups } from "@/actions/groups";
import { GroupTable } from "@/components/groups/GroupTable";
import { GroupClientFilters } from "@/components/groups/GroupClientFilters";
import { Pagination } from "@/components/ui/Pagination";
import { Plus } from "lucide-react";
import Link from "next/link";
import { db } from "@/db";
import { systemUsers, gyms } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function GroupsPage({ searchParams }: { searchParams: Promise<{ q?: string, gymId?: string, limit?: string, page?: string }> }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const sp = await searchParams;

  const [currentUser] = await db.select().from(systemUsers).where(eq(systemUsers.email, session.user.email!));
  const allGyms = await db.select().from(gyms);

  const q = sp.q || "";
  const gymId = sp.gymId || "";
  const limit = parseInt(sp.limit || "10", 10);
  const page = parseInt(sp.page || "1", 10);
  const offset = (page - 1) * limit;

  const { data, totalCount } = await getGroups({ searchQuery: q, gymIdFilter: gymId, limit, offset });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-olimpo-gold">
            Grupos
          </h2>
          <p className="text-sm sm:text-base text-olimpo-text-muted mt-1">
            Gestiona los grupos de entrenamiento y sus pagos unificados.
          </p>
        </div>
        <Link 
          href="/groups/new"
          className="inline-flex items-center justify-center gap-2 bg-olimpo-gold text-black px-4 py-2 rounded-lg font-medium hover:bg-olimpo-gold-light transition-colors shadow-lg shadow-olimpo-gold/20"
        >
          <Plus className="w-5 h-5" />
          Crear Grupo
        </Link>
      </div>

      <GroupClientFilters userRole={currentUser.role} gyms={allGyms} />

      <GroupTable groups={data} />
      
      {totalCount > 0 && (
        <Pagination total={totalCount} limit={limit} currentPage={page} />
      )}
    </div>
  );
}
