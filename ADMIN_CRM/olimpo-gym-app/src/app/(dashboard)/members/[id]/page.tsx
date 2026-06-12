import { getMemberById } from "@/actions/members";
import { ArrowLeft, User, Calendar, CreditCard, Clock, ShieldCheck, Dumbbell } from "lucide-react";
import { MemberPhotoEdit } from "@/components/members/MemberPhotoEdit";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function MemberDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const member = await getMemberById(id);

  if (!member) notFound();

  const isMora = member.status === "mora";
  const isActive = member.status === "activo";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/members" className="inline-flex items-center gap-2 text-olimpo-text-muted hover:text-olimpo-gold transition-colors font-medium">
          <ArrowLeft className="w-4 h-4" /> Volver a Miembros
        </Link>
        <button className="bg-olimpo-gold text-black px-4 py-2 rounded-lg font-bold shadow-lg hover:scale-105 transition-transform flex items-center gap-2">
          <CreditCard className="w-4 h-4" />
          Registrar Pago / Renovar
        </button>
      </div>
      
      {/* Perfil Header */}
      <div className="card-olimpo p-6 md:p-8 rounded-2xl flex flex-col md:flex-row items-center gap-6 border-greca">
        <MemberPhotoEdit memberId={id} initialPhotoUrl={member.photoUrl} />
        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center gap-3">
            <h2 className="text-3xl font-serif font-bold text-olimpo-gold">{member.name}</h2>
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${isActive ? "bg-olimpo-green/20 text-olimpo-green" : isMora ? "bg-olimpo-red/20 text-olimpo-red" : "bg-olimpo-surface-light text-olimpo-text-muted"}`}>
              {member.status}
            </span>
          </div>
          <p className="text-olimpo-text-muted mt-2 flex items-center justify-center md:justify-start gap-2">
            <ShieldCheck className="w-4 h-4" /> Código: {member.code} ({member.gymName})
          </p>
        </div>
        <div className="flex gap-4">
          <div className="text-center md:text-right">
            <p className="text-sm text-olimpo-text-muted">Teléfono</p>
            <p className="font-medium text-olimpo-text">{member.phone}</p>
          </div>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card-olimpo p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-4">
            <Dumbbell className="w-5 h-5 text-olimpo-gold" />
            <h3 className="font-medium text-olimpo-text">Plan de Entrenamiento</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-olimpo-text-muted">Tipo:</span>
              <span className="font-medium capitalize">{member.plan}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-olimpo-text-muted">Tarifa:</span>
              <span className="font-medium font-bold text-olimpo-gold">Q {member.price}</span>
            </div>
          </div>
        </div>

        <div className="card-olimpo p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="w-5 h-5 text-olimpo-gold" />
            <h3 className="font-medium text-olimpo-text">Fechas</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-olimpo-text-muted">Inscripción:</span>
              <span className="font-medium">{new Date(member.membershipStart).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-olimpo-text-muted">Vencimiento:</span>
              <span className={`font-medium ${isMora ? "text-olimpo-red font-bold" : "text-olimpo-green"}`}>
                {new Date(member.membershipEnd).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        <div className="card-olimpo p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-5 h-5 text-olimpo-gold" />
            <h3 className="font-medium text-olimpo-text">Última Visita</h3>
          </div>
          <div className="flex flex-col items-center justify-center py-2">
            {member.lastVisit ? (
              <span className="text-xl font-bold">{new Date(member.lastVisit).toLocaleDateString()}</span>
            ) : (
              <span className="text-olimpo-text-muted">Sin visitas registradas</span>
            )}
          </div>
        </div>
      </div>

      {/* Payment History */}
      <div className="card-olimpo rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-olimpo-surface-light">
          <h3 className="text-lg font-serif font-bold text-olimpo-text flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-olimpo-gold" /> Historial de Pagos
          </h3>
        </div>
        <div className="p-0 overflow-x-auto">
          {member.payments.length === 0 ? (
            <div className="p-8 text-center text-olimpo-text-muted">
              No hay pagos registrados para este miembro.
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-olimpo-surface-light/30 border-b border-olimpo-surface-light">
                  <th className="px-6 py-4 text-xs font-semibold text-olimpo-text-muted uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-4 text-xs font-semibold text-olimpo-text-muted uppercase tracking-wider">Monto Total</th>
                  <th className="px-6 py-4 text-xs font-semibold text-olimpo-text-muted uppercase tracking-wider">Período Pagado</th>
                  <th className="px-6 py-4 text-xs font-semibold text-olimpo-text-muted uppercase tracking-wider">Notas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-olimpo-surface-light">
                {member.payments.map((p) => (
                  <tr key={p.id} className="hover:bg-olimpo-surface-light/10 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {new Date(p.paymentDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-olimpo-green">
                      Q {p.amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-olimpo-text-muted">
                      {p.periodStart ? new Date(p.periodStart).toLocaleDateString() : '-'} al {p.periodEnd ? new Date(p.periodEnd).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-olimpo-text-muted">
                      {p.notes || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
