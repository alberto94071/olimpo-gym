"use client";

import { toggleUserStatus, deleteSystemUser } from "@/actions/users";
import { ShieldCheck, User as UserIcon, Trash2, Power, PowerOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function UserTable({ users }: { users: any[] }) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    setLoadingId(id);
    try {
      await toggleUserStatus(id, !currentStatus);
      router.refresh();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este usuario? No podrá volver a ingresar al sistema.")) return;
    setLoadingId(id);
    try {
      await deleteSystemUser(id);
      router.refresh();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="bg-olimpo-surface border border-olimpo-surface-light rounded-2xl shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-olimpo-surface-light/50 border-b border-olimpo-surface-light text-xs uppercase tracking-wider text-olimpo-text-muted">
              <th className="p-4 font-semibold">Usuario</th>
              <th className="p-4 font-semibold">Rol / Sede</th>
              <th className="p-4 font-semibold text-center">Estado</th>
              <th className="p-4 font-semibold text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-olimpo-surface-light">
            {users.map((row) => {
              const { user, gym } = row;
              const isAdmin = user.role === "admin";
              
              return (
                <tr key={user.id} className="hover:bg-olimpo-surface-light/20 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isAdmin ? 'bg-olimpo-gold/20 text-olimpo-gold' : 'bg-olimpo-surface-light text-olimpo-text-muted'}`}>
                        {isAdmin ? <ShieldCheck className="w-5 h-5" /> : <UserIcon className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="font-bold text-olimpo-text truncate max-w-[200px] sm:max-w-xs">{user.name}</p>
                        <p className="text-xs text-olimpo-text-muted truncate max-w-[200px] sm:max-w-xs">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  
                  <td className="p-4">
                    {isAdmin ? (
                      <span className="inline-flex items-center gap-1 bg-olimpo-gold/10 text-olimpo-gold text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                        Administrador
                      </span>
                    ) : (
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-olimpo-text">Secretaria</span>
                        <span className="text-xs text-olimpo-text-muted">{gym?.name}</span>
                      </div>
                    )}
                  </td>
                  
                  <td className="p-4 text-center">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      user.active ? "bg-olimpo-green/10 text-olimpo-green" : "bg-olimpo-red/10 text-olimpo-red"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${user.active ? "bg-olimpo-green" : "bg-olimpo-red"}`} />
                      {user.active ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => handleToggleStatus(user.id, user.active)}
                        disabled={loadingId === user.id}
                        title={user.active ? "Desactivar Acceso" : "Activar Acceso"}
                        className={`p-2 rounded-lg transition-colors ${
                          user.active 
                            ? "text-olimpo-gold hover:bg-olimpo-gold/10" 
                            : "text-olimpo-text-muted hover:text-white hover:bg-olimpo-surface-light"
                        }`}
                      >
                        {user.active ? <Power className="w-4 h-4" /> : <PowerOff className="w-4 h-4" />}
                      </button>
                      
                      <button 
                        onClick={() => handleDelete(user.id)}
                        disabled={loadingId === user.id}
                        title="Eliminar Usuario"
                        className="p-2 text-olimpo-text-muted hover:text-olimpo-red hover:bg-olimpo-red/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            
            {users.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-olimpo-text-muted">
                  No hay usuarios registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
