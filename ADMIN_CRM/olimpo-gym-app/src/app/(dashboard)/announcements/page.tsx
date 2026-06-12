import { db } from "@/db";
import { systemUsers, gyms } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getAnnouncements } from "@/actions/announcements";
import { AnnouncementTable } from "@/components/announcements/AnnouncementTable";
import { AnnouncementClientPage } from "@/components/announcements/AnnouncementClientPage";
import { Megaphone } from "lucide-react";

export default async function AnnouncementsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [currentUser] = await db.select().from(systemUsers).where(eq(systemUsers.email, session.user.email!));
  const allGyms = await db.select().from(gyms);
  const announcementsList = await getAnnouncements();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-olimpo-gold flex items-center gap-2">
            <Megaphone className="w-8 h-8" />
            Anuncios
          </h2>
          <p className="text-sm sm:text-base text-olimpo-text-muted mt-1">
            Redacta comunicados y avisos para los miembros.
          </p>
        </div>
        
        <AnnouncementClientPage gyms={allGyms} userRole={currentUser.role} />
      </div>

      <AnnouncementTable announcements={announcementsList} />
    </div>
  );
}
