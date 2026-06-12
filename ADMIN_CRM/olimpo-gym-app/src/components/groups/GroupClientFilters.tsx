"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { useState, useEffect } from "react";

export function GroupClientFilters({ userRole, gyms }: { userRole: string, gyms: any[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [gymId, setGymId] = useState(searchParams.get("gymId") || "");

  // Debounce text search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (query) params.set("q", query);
      else params.delete("q");
      params.set("page", "1"); // reset to page 1 on search
      router.push(`?${params.toString()}`);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleGymChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setGymId(val);
    const params = new URLSearchParams(searchParams.toString());
    if (val) params.set("gymId", val);
    else params.delete("gymId");
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 bg-olimpo-surface p-4 rounded-2xl border border-olimpo-surface-light shadow-lg">
      <div className="relative flex-1">
        <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-olimpo-text-muted" />
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por representante o código..." 
          className="w-full pl-10 pr-4 py-2 bg-olimpo-bg border border-olimpo-surface-light rounded-lg text-olimpo-text focus:outline-none focus:border-olimpo-gold transition-colors"
        />
      </div>
      <div className="flex flex-col sm:flex-row gap-2">
        {userRole === "admin" && (
          <select 
            value={gymId}
            onChange={handleGymChange}
            className="bg-olimpo-bg border border-olimpo-surface-light rounded-lg px-4 py-2 text-olimpo-text focus:outline-none focus:border-olimpo-gold transition-colors"
          >
            <option value="">Todas las Sedes</option>
            {gyms.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
        )}
      </div>
    </div>
  );
}
