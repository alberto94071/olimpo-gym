"use client";

import { useState } from "react";
import { createAnnouncement } from "@/actions/announcements";
import { X, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function AnnouncementFormModal({ gyms, userRole, onClose }: { gyms: any[], userRole: string, onClose: () => void }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [gymId, setGymId] = useState(""); // empty means all gyms
  const [sendPush, setSendPush] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await createAnnouncement({
        title,
        body,
        gymId: gymId === "" ? undefined : gymId,
        sendPush
      });

      if (res.success) {
        router.refresh();
        onClose();
      }
    } catch (err: any) {
      setError(err.message || "Error al crear anuncio");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="bg-olimpo-surface border border-olimpo-surface-light p-6 rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-olimpo-gold font-serif">Nuevo Anuncio</h2>
          <button onClick={onClose} className="text-olimpo-text-muted hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-olimpo-red/10 border border-olimpo-red/30 rounded-lg text-olimpo-red text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-olimpo-text-muted mb-1">Título del Anuncio</label>
            <input 
              type="text" 
              required 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              placeholder="Ej: Cerramos mañana por mantenimiento"
              className="w-full bg-olimpo-bg border border-olimpo-surface-light rounded-lg px-3 py-2 text-olimpo-text focus:border-olimpo-gold focus:outline-none" 
            />
          </div>

          <div>
            <label className="block text-sm text-olimpo-text-muted mb-1">Mensaje</label>
            <textarea 
              required 
              value={body} 
              onChange={e => setBody(e.target.value)} 
              rows={4}
              placeholder="Escribe los detalles aquí..."
              className="w-full bg-olimpo-bg border border-olimpo-surface-light rounded-lg px-3 py-2 text-olimpo-text focus:border-olimpo-gold focus:outline-none resize-none" 
            />
          </div>

          {userRole === "admin" && (
            <div>
              <label className="block text-sm text-olimpo-text-muted mb-1">Público Objetivo (Sede)</label>
              <select value={gymId} onChange={e => setGymId(e.target.value)} className="w-full bg-olimpo-bg border border-olimpo-surface-light rounded-lg px-3 py-2 text-olimpo-text focus:border-olimpo-gold focus:outline-none">
                <option value="">Todas las Sedes (Anuncio Global)</option>
                {gyms.map(g => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={sendPush} onChange={e => setSendPush(e.target.checked)} className="w-5 h-5 rounded border-olimpo-gold text-olimpo-gold bg-olimpo-bg focus:ring-olimpo-gold" />
              <span className="text-sm font-medium text-olimpo-text">Enviar notificación Push a los teléfonos</span>
            </label>
            <p className="text-xs text-olimpo-text-muted ml-7 mt-1">Los miembros recibirán un aviso en su celular cuando lancemos la App.</p>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-olimpo-text-muted hover:bg-olimpo-surface-light transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="px-4 py-2 rounded-lg bg-olimpo-gold text-black font-medium hover:bg-olimpo-gold-light transition-colors flex items-center gap-2 shadow-lg shadow-olimpo-gold/20">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Publicar Anuncio"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
