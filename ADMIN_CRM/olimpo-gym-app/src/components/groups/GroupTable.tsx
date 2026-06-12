import { Users, Plus, AlertTriangle, ShieldCheck } from "lucide-react";
import Link from "next/link";

export function GroupTable({ groups }: { groups: any[] }) {
  if (groups.length === 0) {
    return (
      <div className="bg-olimpo-surface rounded-2xl border border-olimpo-surface-light p-8 text-center">
        <p className="text-olimpo-text-muted mb-4">No hay grupos registrados todavía.</p>
        <Link 
          href="/groups/new" 
          className="inline-flex items-center gap-2 bg-olimpo-gold text-black px-4 py-2 rounded-lg font-medium hover:bg-olimpo-gold-light transition-colors"
        >
          <Plus className="w-5 h-5" />
          Crear el Primer Grupo
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-olimpo-surface rounded-2xl border border-olimpo-surface-light shadow-lg overflow-hidden">
      
      {/* Mobile View */}
      <div className="block md:hidden divide-y divide-olimpo-surface-light">
        {groups.map((g) => (
          <div key={g.id} className="p-4 flex flex-col gap-2">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs text-olimpo-gold font-mono mb-1 block">
                  Grupo {g.gymPrefix}-{String(g.groupNumber).padStart(4, '0')}
                </span>
                <h3 className="font-medium text-olimpo-text text-lg flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-olimpo-gold" />
                  {g.representativeName}
                </h3>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-medium uppercase tracking-wider ${
                g.paidFull ? "bg-olimpo-green/20 text-olimpo-green" : "bg-olimpo-red/20 text-olimpo-red"
              }`}>
                {g.paidFull ? "Solvente" : "Mora"}
              </span>
            </div>
            
            <div className="flex justify-between text-sm text-olimpo-text-muted">
              <span>{g.memberCount} Integrantes</span>
              <span>Total: Q {Number(g.pricePerPerson) * g.memberCount}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-olimpo-surface-light/50 border-b border-olimpo-surface-light">
              <th className="px-6 py-4 text-xs font-semibold text-olimpo-text-muted uppercase tracking-wider">Grupo</th>
              <th className="px-6 py-4 text-xs font-semibold text-olimpo-text-muted uppercase tracking-wider">Representante</th>
              <th className="px-6 py-4 text-xs font-semibold text-olimpo-text-muted uppercase tracking-wider">Integrantes</th>
              <th className="px-6 py-4 text-xs font-semibold text-olimpo-text-muted uppercase tracking-wider">Total/Mes</th>
              <th className="px-6 py-4 text-xs font-semibold text-olimpo-text-muted uppercase tracking-wider">Estado</th>
              <th className="px-6 py-4 text-xs font-semibold text-olimpo-text-muted uppercase tracking-wider text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-olimpo-surface-light">
            {groups.map((g) => (
              <tr key={g.id} className="hover:bg-olimpo-surface-light/20 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-olimpo-gold">
                  {g.gymPrefix}-{String(g.groupNumber).padStart(4, '0')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-olimpo-text flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-olimpo-gold" />
                    {g.representativeName}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-olimpo-text-muted flex items-center gap-2">
                  <Users className="w-4 h-4" /> {g.memberCount}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-olimpo-text">
                  Q {Number(g.pricePerPerson) * g.memberCount}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full uppercase tracking-wider ${
                    g.paidFull ? "bg-olimpo-green/10 text-olimpo-green" : "bg-olimpo-red/10 text-olimpo-red"
                  }`}>
                    {g.paidFull ? "Solvente" : "Mora"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link href={`/groups/${g.id}`} className="text-olimpo-gold hover:text-olimpo-gold-light transition-colors font-bold uppercase tracking-widest">
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
