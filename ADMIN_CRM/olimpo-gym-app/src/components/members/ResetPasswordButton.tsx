"use client";

import { useState } from "react";
import { resetMemberPassword } from "@/actions/members";
import { KeyRound, Copy, CheckCircle, Loader2 } from "lucide-react";

export function ResetPasswordButton({ memberId }: { memberId: string }) {
  const [loading, setLoading] = useState(false);
  const [newPassword, setNewPassword] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleReset() {
    if (!confirm("¿Generar una nueva contraseña para este miembro? La contraseña anterior quedará inválida.")) return;
    setLoading(true);
    try {
      const res = await resetMemberPassword(memberId);
      setNewPassword(res.password);
    } catch {
      alert("Error al resetear la contraseña.");
    } finally {
      setLoading(false);
    }
  }

  function handleCopy() {
    if (!newPassword) return;
    navigator.clipboard.writeText(newPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (newPassword) {
    return (
      <div className="flex items-center gap-3 bg-olimpo-gold/10 border border-olimpo-gold/30 rounded-lg px-4 py-3">
        <KeyRound className="w-4 h-4 text-olimpo-gold flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-xs text-olimpo-text-muted mb-0.5">Nueva contraseña</p>
          <p className="font-mono font-bold text-olimpo-gold text-sm">{newPassword}</p>
        </div>
        <button onClick={handleCopy} className="flex items-center gap-1 text-xs text-olimpo-gold hover:underline flex-shrink-0">
          {copied ? <CheckCircle className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? "Copiada" : "Copiar"}
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleReset}
      disabled={loading}
      className="flex items-center gap-2 px-4 py-2 rounded-lg border border-olimpo-surface-light text-olimpo-text-muted hover:text-olimpo-gold hover:border-olimpo-gold transition-colors text-sm font-medium disabled:opacity-50"
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
      Resetear contraseña
    </button>
  );
}
