"use client";

import { useRouter, useSearchParams } from "next/navigation";

export function GymFilter({ gyms, currentGymId }: { gyms: any[], currentGymId: string }) {
  const router = useRouter();
  
  return (
    <select 
      value={currentGymId}
      onChange={(e) => {
        if (e.target.value) {
          router.push(`/dashboard?gymId=${e.target.value}`);
        } else {
          router.push(`/dashboard`);
        }
      }}
      className="bg-olimpo-bg border border-olimpo-surface-light rounded-xl px-4 py-2 text-sm text-olimpo-text focus:outline-none focus:border-olimpo-gold shadow-sm"
    >
      <option value="">Todas las Sedes</option>
      {gyms.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
    </select>
  );
}
