"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createMember } from "@/actions/members";
import { Loader2, Calculator, User } from "lucide-react";
import { PhotoUploader } from "@/components/ui/PhotoUploader";

export function MemberForm({ userRole, gyms }: { userRole: string, gyms: any[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [gymId, setGymId] = useState(gyms[0]?.id || "");
  const [price, setPrice] = useState("150.00");
  const [enrollmentFee, setEnrollmentFee] = useState("0.00");
  const [cardFee, setCardFee] = useState("0.00");
  const [photoUrl, setPhotoUrl] = useState("");

  // Effect to set default fees based on Gym
  useEffect(() => {
    const gym = gyms.find(g => g.id === gymId);
    if (gym) {
      setPrice(gym.pricingMonthly || "150.00");
      setEnrollmentFee(gym.enrollmentFee || "0.00");
      setCardFee(gym.cardFee || "0.00");
    }
  }, [gymId, gyms]);

  const totalToPay = Number(price) + Number(enrollmentFee) + Number(cardFee);
  const isReadOnly = userRole !== "admin";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const formData = new FormData(e.currentTarget);
      // Append fees explicitly since disabled inputs might not send them
      formData.set("enrollmentFee", enrollmentFee);
      formData.set("cardFee", cardFee);
      
      const res = await createMember(formData);
      if (res.success) {
        router.push("/members");
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || "Ocurrió un error al guardar el miembro");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="p-4 bg-olimpo-red/10 border border-olimpo-red/30 rounded-lg text-olimpo-red text-sm">
          {error}
        </div>
      )}

      {/* Sede (Only for Admin) */}
      {userRole === "admin" && (
        <div className="bg-olimpo-surface p-6 rounded-2xl border border-olimpo-surface-light shadow-lg">
          <h3 className="text-lg font-serif font-bold text-olimpo-gold mb-4 border-b border-olimpo-surface-light pb-2">
            Sede
          </h3>
          <div>
            <label className="block text-sm font-medium text-olimpo-text-muted mb-1">Seleccionar Sede *</label>
            <select name="gymId" value={gymId} onChange={(e) => setGymId(e.target.value)} required className="w-full bg-olimpo-bg border border-olimpo-surface-light rounded-lg px-4 py-2 text-olimpo-text focus:outline-none focus:border-olimpo-gold transition-colors">
              {gyms.map(gym => (
                <option key={gym.id} value={gym.id}>{gym.name}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      <input type="hidden" name="photoUrl" value={photoUrl} />

      {/* Fotografía */}
      <div className="bg-olimpo-surface p-6 rounded-2xl border border-olimpo-surface-light shadow-lg flex flex-col items-center">
        <h3 className="text-lg font-serif font-bold text-olimpo-gold mb-4 w-full border-b border-olimpo-surface-light pb-2 text-left">
          Fotografía del Miembro
        </h3>
        <PhotoUploader 
          currentPhotoUrl={photoUrl} 
          onPhotoUploaded={(url) => setPhotoUrl(url)} 
        />
      </div>

      {/* Datos Personales */}
      <div className="bg-olimpo-surface p-6 rounded-2xl border border-olimpo-surface-light shadow-lg">
        <h3 className="text-lg font-serif font-bold text-olimpo-gold mb-4 border-b border-olimpo-surface-light pb-2">
          Datos Personales
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-olimpo-text-muted mb-1">Nombre Completo *</label>
            <input type="text" name="name" required className="w-full bg-olimpo-bg border border-olimpo-surface-light rounded-lg px-4 py-2 text-olimpo-text focus:outline-none focus:border-olimpo-gold transition-colors" />
          </div>
          <div>
            <label className="block text-sm font-medium text-olimpo-text-muted mb-1">Teléfono *</label>
            <input type="tel" name="phone" required className="w-full bg-olimpo-bg border border-olimpo-surface-light rounded-lg px-4 py-2 text-olimpo-text focus:outline-none focus:border-olimpo-gold transition-colors" />
          </div>
          <div>
            <label className="block text-sm font-medium text-olimpo-text-muted mb-1">Fecha de Nacimiento *</label>
            <input type="date" name="birthDate" required className="w-full bg-olimpo-bg border border-olimpo-surface-light rounded-lg px-4 py-2 text-olimpo-text focus:outline-none focus:border-olimpo-gold transition-colors" />
          </div>
          <div>
            <label className="block text-sm font-medium text-olimpo-text-muted mb-1">Sexo *</label>
            <select name="sex" required className="w-full bg-olimpo-bg border border-olimpo-surface-light rounded-lg px-4 py-2 text-olimpo-text focus:outline-none focus:border-olimpo-gold transition-colors">
              <option value="M">Masculino</option>
              <option value="F">Femenino</option>
            </select>
          </div>
        </div>
      </div>

      {/* Membresía y Pagos */}
      <div className="bg-olimpo-surface p-6 rounded-2xl border border-olimpo-surface-light shadow-lg">
        <h3 className="text-lg font-serif font-bold text-olimpo-gold mb-4 border-b border-olimpo-surface-light pb-2 flex items-center gap-2">
          <Calculator className="w-5 h-5" />
          Membresía y Cobros
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-olimpo-text-muted mb-1">Plan *</label>
            <select name="plan" required className="w-full bg-olimpo-bg border border-olimpo-surface-light rounded-lg px-4 py-2 text-olimpo-text focus:outline-none focus:border-olimpo-gold transition-colors">
              <option value="mensual">Mensual (Mes Calendario)</option>
              <option value="trimestral">Trimestral</option>
              <option value="anual">Anual</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-olimpo-text-muted mb-1">Mensualidad (Q) *</label>
            <input type="number" step="0.01" name="price" value={price} onChange={e => setPrice(e.target.value)} readOnly={isReadOnly} className={`w-full bg-olimpo-bg border border-olimpo-surface-light rounded-lg px-4 py-2 text-olimpo-text focus:outline-none focus:border-olimpo-gold ${isReadOnly ? 'opacity-70 cursor-not-allowed' : ''}`} />
          </div>
          <div>
            <label className="block text-sm font-medium text-olimpo-text-muted mb-1">Inscripción (Q) *</label>
            <input type="number" step="0.01" value={enrollmentFee} onChange={e => setEnrollmentFee(e.target.value)} readOnly={isReadOnly} className={`w-full bg-olimpo-bg border border-olimpo-surface-light rounded-lg px-4 py-2 text-olimpo-text focus:outline-none focus:border-olimpo-gold ${isReadOnly ? 'opacity-70 cursor-not-allowed' : ''}`} />
          </div>
          <div>
            <label className="block text-sm font-medium text-olimpo-text-muted mb-1">Carné (Q) *</label>
            <input type="number" step="0.01" value={cardFee} onChange={e => setCardFee(e.target.value)} readOnly={isReadOnly} className={`w-full bg-olimpo-bg border border-olimpo-surface-light rounded-lg px-4 py-2 text-olimpo-text focus:outline-none focus:border-olimpo-gold ${isReadOnly ? 'opacity-70 cursor-not-allowed' : ''}`} />
          </div>
        </div>

        <div className="bg-olimpo-surface-light/30 p-5 rounded-xl border border-olimpo-surface-light flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="paid" value="true" defaultChecked className="w-5 h-5 rounded border-olimpo-gold text-olimpo-gold focus:ring-olimpo-gold bg-olimpo-bg" />
              <span className="text-olimpo-text font-medium">Pagó en recepción hoy</span>
            </label>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-olimpo-text-muted">Método:</span>
              <select name="paymentMethod" className="bg-olimpo-bg border border-olimpo-surface-light rounded-lg px-3 py-1.5 text-sm text-olimpo-text focus:outline-none focus:border-olimpo-gold">
                <option value="efectivo">Efectivo</option>
                <option value="transferencia">Transferencia</option>
              </select>
            </div>
          </div>

          <div className="text-right bg-olimpo-gold/10 px-6 py-3 rounded-lg border border-olimpo-gold/20">
            <p className="text-xs text-olimpo-gold uppercase tracking-wider font-bold mb-1">Total a cobrar</p>
            <p className="text-2xl font-black text-olimpo-gold">Q {totalToPay.toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4 pb-10">
        <button 
          type="button" 
          onClick={() => router.back()}
          className="px-6 py-2 rounded-lg font-medium text-olimpo-text-muted hover:text-olimpo-text hover:bg-olimpo-surface-light transition-colors"
        >
          Cancelar
        </button>
        <button 
          type="submit" 
          disabled={loading}
          className="px-6 py-2 rounded-lg font-medium bg-olimpo-gold text-black hover:bg-olimpo-gold-light transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-olimpo-gold/20"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Registrar Miembro y Cobro"}
        </button>
      </div>
    </form>
  );
}
