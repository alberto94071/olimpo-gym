"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function Pagination({ total, limit, currentPage }: { total: number, limit: number, currentPage: number }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const totalPages = Math.ceil(total / limit) || 1;

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`?${params.toString()}`);
  };

  const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLimit = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    params.set("limit", newLimit);
    params.set("page", "1"); // reset to page 1 on limit change
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-olimpo-surface p-4 rounded-xl border border-olimpo-surface-light mt-4">
      <div className="flex items-center gap-2 text-sm text-olimpo-text-muted">
        <span>Mostrando página {currentPage} de {totalPages}</span>
        <span>({total} registros en total)</span>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-xs text-olimpo-text-muted">Registros:</label>
          <select 
            value={limit}
            onChange={handleLimitChange}
            className="bg-olimpo-bg border border-olimpo-surface-light rounded-lg px-2 py-1 text-sm text-olimpo-text focus:outline-none focus:border-olimpo-gold"
          >
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="30">30</option>
            <option value="50">50</option>
          </select>
        </div>

        <div className="flex gap-1">
          <button 
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-1 rounded-lg bg-olimpo-surface-light text-olimpo-text hover:bg-olimpo-gold hover:text-black disabled:opacity-30 disabled:hover:bg-olimpo-surface-light disabled:hover:text-olimpo-text transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button 
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-1 rounded-lg bg-olimpo-surface-light text-olimpo-text hover:bg-olimpo-gold hover:text-black disabled:opacity-30 disabled:hover:bg-olimpo-surface-light disabled:hover:text-olimpo-text transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
