"use client";

import { toggleAnnouncementStatus, deleteAnnouncement } from "@/actions/announcements";
import { Megaphone, Globe, Trash2, Power, PowerOff, Smartphone } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function AnnouncementTable({ announcements }: { announcements: any[] }) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    setLoadingId(id);
    try {
      await toggleAnnouncementStatus(id, !currentStatus);
      router.refresh();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este anuncio?")) return;
    setLoadingId(id);
    try {
      await deleteAnnouncement(id);
      router.refresh();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {announcements.map((row) => {
        const { announcement, gym, creatorName } = row;
        const isGlobal = !announcement.gymId;

        return (
          <div key={announcement.id} className="bg-olimpo-surface border border-olimpo-surface-light rounded-2xl p-5 flex flex-col shadow-lg transition-all hover:border-olimpo-gold/30">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                {isGlobal ? (
                  <span className="inline-flex items-center gap-1 bg-blue-500/10 text-blue-400 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    <Globe className="w-3 h-3" /> Global
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 bg-olimpo-gold/10 text-olimpo-gold text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {gym?.name}
                  </span>
                )}

                {announcement.sendPush && (
                  <span className="inline-flex items-center gap-1 bg-purple-500/10 text-purple-400 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider" title="Se envió como notificación Push">
                    <Smartphone className="w-3 h-3" /> Push
                  </span>
                )}
              </div>
              
              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                announcement.published ? "bg-olimpo-green/10 text-olimpo-green" : "bg-olimpo-red/10 text-olimpo-red"
              }`}>
                {announcement.published ? "Visible" : "Oculto"}
              </span>
            </div>

            <h3 className="text-lg font-bold text-olimpo-text mb-2 line-clamp-2">
              <Megaphone className="w-4 h-4 inline-block mr-2 text-olimpo-gold" />
              {announcement.title}
            </h3>
            
            <p className="text-sm text-olimpo-text-muted mb-4 flex-1 line-clamp-3">
              {announcement.body}
            </p>

            <div className="flex items-center justify-between mt-auto pt-4 border-t border-olimpo-surface-light">
              <div className="text-xs text-olimpo-text-muted">
                Por: <span className="font-semibold text-olimpo-text/80">{creatorName}</span>
              </div>
              
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => handleToggleStatus(announcement.id, announcement.published)}
                  disabled={loadingId === announcement.id}
                  title={announcement.published ? "Ocultar" : "Mostrar"}
                  className={`p-1.5 rounded-lg transition-colors ${
                    announcement.published 
                      ? "text-olimpo-text-muted hover:text-olimpo-gold hover:bg-olimpo-gold/10" 
                      : "text-olimpo-text-muted hover:text-white hover:bg-olimpo-surface-light"
                  }`}
                >
                  {announcement.published ? <Power className="w-4 h-4" /> : <PowerOff className="w-4 h-4" />}
                </button>
                
                <button 
                  onClick={() => handleDelete(announcement.id)}
                  disabled={loadingId === announcement.id}
                  title="Eliminar"
                  className="p-1.5 text-olimpo-text-muted hover:text-olimpo-red hover:bg-olimpo-red/10 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        );
      })}

      {announcements.length === 0 && (
        <div className="col-span-full py-12 text-center text-olimpo-text-muted bg-olimpo-surface border border-olimpo-surface-light rounded-2xl border-dashed">
          No hay anuncios publicados.
        </div>
      )}
    </div>
  );
}
