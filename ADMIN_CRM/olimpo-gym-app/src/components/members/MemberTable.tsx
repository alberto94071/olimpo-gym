import { Search, Plus, Filter, MoreVertical, CreditCard } from "lucide-react";
import Link from "next/link";

export function MemberTable({ members }: { members: any[] }) {
  if (members.length === 0) {
    return (
      <div className="bg-olimpo-surface rounded-2xl border border-olimpo-surface-light p-8 text-center">
        <p className="text-olimpo-text-muted mb-4">No hay miembros registrados todavía.</p>
        <Link 
          href="/members/new" 
          className="inline-flex items-center gap-2 bg-olimpo-gold text-black px-4 py-2 rounded-lg font-medium hover:bg-olimpo-gold-light transition-colors"
        >
          <Plus className="w-5 h-5" />
          Registrar el Primer Miembro
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-olimpo-surface rounded-2xl border border-olimpo-surface-light shadow-lg overflow-hidden">
      {/* Top Bar for Desktop/Mobile filters can be added here */}
      
      {/* Mobile View (Cards) */}
      <div className="block md:hidden divide-y divide-olimpo-surface-light">
        {members.map((m) => (
          <div key={m.id} className="p-4 flex flex-col gap-2">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs text-olimpo-gold font-mono mb-1 block">{m.code}</span>
                <h3 className="font-medium text-olimpo-text text-lg">{m.name}</h3>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-medium uppercase tracking-wider ${
                m.status === "activo" ? "bg-olimpo-green/20 text-olimpo-green" :
                m.status === "mora" ? "bg-olimpo-red/20 text-olimpo-red" :
                "bg-olimpo-surface-light text-olimpo-text-muted"
              }`}>
                {m.status}
              </span>
            </div>
            
            <div className="flex justify-between text-sm text-olimpo-text-muted">
              <span>Plan: {m.plan}</span>
              <span>Vence: {new Date(m.membershipEnd).toLocaleDateString()}</span>
            </div>
            
            <div className="flex justify-between items-center mt-2 pt-2 border-t border-olimpo-surface-light">
              <span className="font-bold text-olimpo-text">Q {m.price}</span>
              <Link href={`/members/${m.id}`} className="text-olimpo-gold hover:text-olimpo-gold-light text-sm font-medium">
                Gestionar
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop View (Table) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-olimpo-surface-light/50 border-b border-olimpo-surface-light">
              <th className="px-6 py-4 text-xs font-semibold text-olimpo-text-muted uppercase tracking-wider">Código</th>
              <th className="px-6 py-4 text-xs font-semibold text-olimpo-text-muted uppercase tracking-wider">Nombre</th>
              <th className="px-6 py-4 text-xs font-semibold text-olimpo-text-muted uppercase tracking-wider">Plan</th>
              <th className="px-6 py-4 text-xs font-semibold text-olimpo-text-muted uppercase tracking-wider">Vencimiento</th>
              <th className="px-6 py-4 text-xs font-semibold text-olimpo-text-muted uppercase tracking-wider">Estado</th>
              <th className="px-6 py-4 text-xs font-semibold text-olimpo-text-muted uppercase tracking-wider text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-olimpo-surface-light">
            {members.map((m) => (
              <tr key={m.id} className="hover:bg-olimpo-surface-light/20 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-olimpo-gold">
                  {m.code}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-olimpo-text">{m.name}</div>
                  <div className="text-xs text-olimpo-text-muted">{m.phone}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-olimpo-text-muted capitalize">
                  {m.plan}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-olimpo-text-muted">
                  {new Date(m.membershipEnd).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full uppercase tracking-wider ${
                    m.status === "activo" ? "bg-olimpo-green/10 text-olimpo-green" :
                    m.status === "mora" ? "bg-olimpo-red/10 text-olimpo-red" :
                    "bg-olimpo-surface-light text-olimpo-text-muted"
                  }`}>
                    {m.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link href={`/members/${m.id}`} className="text-olimpo-gold hover:text-olimpo-gold-light transition-colors p-2 text-sm font-bold tracking-widest uppercase">
                    Gestionar
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
