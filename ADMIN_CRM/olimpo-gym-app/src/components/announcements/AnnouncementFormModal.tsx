"use client";

import { useState, useRef } from "react";
import { createAnnouncement } from "@/actions/announcements";
import { X, Loader2, Bold, Italic, List, Pin, Image as ImageIcon } from "lucide-react";
import { useRouter } from "next/navigation";

function insertHtml(
  textarea: HTMLTextAreaElement,
  open: string,
  close: string,
  setValue: (v: string) => void
) {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selected = textarea.value.substring(start, end);
  const newVal =
    textarea.value.substring(0, start) +
    open + selected + close +
    textarea.value.substring(end);
  setValue(newVal);
  setTimeout(() => {
    textarea.focus();
    textarea.selectionStart = start + open.length;
    textarea.selectionEnd = start + open.length + selected.length;
  }, 0);
}

export function AnnouncementFormModal({ gyms, userRole, onClose }: { gyms: any[]; userRole: string; onClose: () => void }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [gymId, setGymId] = useState("");
  const [sendPush, setSendPush] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [preview, setPreview] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await createAnnouncement({
        title,
        body,
        imageUrl: imageUrl || undefined,
        gymId: gymId || undefined,
        sendPush,
        pinned,
      });
      if (res.success) { router.refresh(); onClose(); }
    } catch (err: any) {
      setError(err.message || "Error al crear anuncio");
    } finally {
      setLoading(false);
    }
  };

  const tool = (label: string, icon: React.ReactNode, open: string, close: string) => (
    <button
      type="button"
      title={label}
      onClick={() => textareaRef.current && insertHtml(textareaRef.current, open, close, setBody)}
      className="px-2 py-1 rounded text-olimpo-text-muted hover:text-olimpo-text hover:bg-olimpo-surface-light transition-colors text-xs font-bold"
    >
      {icon}
    </button>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="bg-olimpo-surface border border-olimpo-surface-light p-6 rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-bold text-olimpo-gold font-serif">Nuevo Anuncio</h2>
          <button onClick={onClose} className="text-olimpo-text-muted hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-olimpo-red/10 border border-olimpo-red/30 rounded-lg text-olimpo-red text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-olimpo-text-muted uppercase tracking-wider mb-1.5">Título</label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Nuevos precios a partir de Julio"
              className="w-full bg-olimpo-bg border border-olimpo-surface-light rounded-lg px-3 py-2.5 text-olimpo-text focus:border-olimpo-gold focus:outline-none text-sm"
            />
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-xs font-semibold text-olimpo-text-muted uppercase tracking-wider mb-1.5">
              <span className="flex items-center gap-1.5"><ImageIcon className="w-3.5 h-3.5" /> Imagen (opcional)</span>
            </label>
            <input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://... (URL de imagen de portada)"
              className="w-full bg-olimpo-bg border border-olimpo-surface-light rounded-lg px-3 py-2.5 text-olimpo-text focus:border-olimpo-gold focus:outline-none text-sm"
            />
            {imageUrl && (
              <img src={imageUrl} alt="preview" className="mt-2 w-full h-32 object-cover rounded-lg border border-olimpo-surface-light" />
            )}
          </div>

          {/* Body with HTML toolbar */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-olimpo-text-muted uppercase tracking-wider">
                Mensaje (soporta HTML)
              </label>
              <button
                type="button"
                onClick={() => setPreview(!preview)}
                className="text-xs text-olimpo-gold hover:underline"
              >
                {preview ? "✏️ Editar" : "👁 Vista previa"}
              </button>
            </div>

            {/* Toolbar */}
            {!preview && (
              <div className="flex items-center gap-1 mb-1 p-1.5 bg-olimpo-bg border border-olimpo-surface-light rounded-t-lg border-b-0">
                {tool("Negrita", <Bold className="w-3.5 h-3.5" />, "<b>", "</b>")}
                {tool("Cursiva", <Italic className="w-3.5 h-3.5" />, "<i>", "</i>")}
                {tool("Título", <span className="text-xs">H2</span>, "<h2>", "</h2>")}
                {tool("Subtítulo", <span className="text-xs">H3</span>, "<h3>", "</h3>")}
                <div className="w-px h-4 bg-olimpo-surface-light mx-1" />
                {tool("Lista", <List className="w-3.5 h-3.5" />, "<ul>\n  <li>", "</li>\n</ul>")}
                {tool("Ítem", <span className="text-xs">LI</span>, "<li>", "</li>")}
                <div className="w-px h-4 bg-olimpo-surface-light mx-1" />
                {tool("Línea horizontal", <span className="text-xs">HR</span>, "<hr/>", "")}
                {tool("Salto de línea", <span className="text-xs">BR</span>, "<br/>", "")}
                <div className="w-px h-4 bg-olimpo-surface-light mx-1" />
                <button
                  type="button"
                  onClick={() => textareaRef.current && insertHtml(textareaRef.current, '<p style="color:#D4AF37;font-weight:bold;">', "</p>", setBody)}
                  className="px-2 py-1 rounded text-olimpo-gold text-xs font-bold hover:bg-olimpo-surface-light"
                >
                  Dorado
                </button>
                <button
                  type="button"
                  onClick={() => textareaRef.current && insertHtml(textareaRef.current, '<p style="color:#ef4444;font-weight:bold;">', "</p>", setBody)}
                  className="px-2 py-1 rounded text-red-400 text-xs font-bold hover:bg-olimpo-surface-light"
                >
                  Rojo
                </button>
              </div>
            )}

            {preview ? (
              <div
                className="w-full min-h-[120px] bg-olimpo-bg border border-olimpo-surface-light rounded-lg px-3 py-2.5 text-olimpo-text text-sm prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: body }}
              />
            ) : (
              <textarea
                ref={textareaRef}
                required
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={6}
                placeholder={"Escribe el mensaje aquí...\n\nPuedes usar HTML:\n<b>negrita</b>, <i>cursiva</i>\n<ul><li>elemento de lista</li></ul>"}
                className="w-full bg-olimpo-bg border border-olimpo-surface-light rounded-b-lg px-3 py-2.5 text-olimpo-text focus:border-olimpo-gold focus:outline-none resize-none text-sm font-mono"
              />
            )}
            <p className="text-[10px] text-olimpo-text-muted mt-1">
              Tip: selecciona texto y usa los botones para dar formato. En la app se verá con estilos aplicados.
            </p>
          </div>

          {/* Options row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {userRole === "admin" && (
              <div>
                <label className="block text-xs font-semibold text-olimpo-text-muted uppercase tracking-wider mb-1.5">Sede</label>
                <select
                  value={gymId}
                  onChange={(e) => setGymId(e.target.value)}
                  className="w-full bg-olimpo-bg border border-olimpo-surface-light rounded-lg px-3 py-2.5 text-olimpo-text focus:border-olimpo-gold focus:outline-none text-sm"
                >
                  <option value="">Todas las sedes (global)</option>
                  {gyms.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
              </div>
            )}
          </div>

          {/* Toggles */}
          <div className="space-y-3 pt-1">
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => setPinned(!pinned)}
                className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${pinned ? "bg-olimpo-gold" : "bg-olimpo-surface-light"}`}
              >
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${pinned ? "translate-x-5" : "translate-x-0.5"}`} />
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-sm font-medium text-olimpo-text">
                  <Pin className="w-3.5 h-3.5 text-olimpo-gold" /> Fijar anuncio al tope
                </div>
                <p className="text-[10px] text-olimpo-text-muted">Aparece siempre primero, ideal para precios o cambios importantes.</p>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => setSendPush(!sendPush)}
                className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${sendPush ? "bg-olimpo-gold" : "bg-olimpo-surface-light"}`}
              >
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${sendPush ? "translate-x-5" : "translate-x-0.5"}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-olimpo-text">Enviar notificación push</p>
                <p className="text-[10px] text-olimpo-text-muted">Los miembros reciben un aviso en su celular al instante.</p>
              </div>
            </label>
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-olimpo-text-muted hover:bg-olimpo-surface-light transition-colors text-sm">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="px-5 py-2 rounded-lg bg-olimpo-gold text-black font-bold hover:bg-olimpo-gold-light transition-colors flex items-center gap-2 text-sm">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Publicar Anuncio"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
