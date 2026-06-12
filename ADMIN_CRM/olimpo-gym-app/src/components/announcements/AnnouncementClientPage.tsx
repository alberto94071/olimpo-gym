"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { AnnouncementFormModal } from "./AnnouncementFormModal";

export function AnnouncementClientPage({ gyms, userRole }: { gyms: any[], userRole: string }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsModalOpen(true)}
        className="inline-flex items-center justify-center gap-2 bg-olimpo-gold text-black px-4 py-2 rounded-lg font-medium hover:bg-olimpo-gold-light transition-colors shadow-lg shadow-olimpo-gold/20"
      >
        <Plus className="w-5 h-5" />
        Nuevo Anuncio
      </button>

      {isModalOpen && (
        <AnnouncementFormModal gyms={gyms} userRole={userRole} onClose={() => setIsModalOpen(false)} />
      )}
    </>
  );
}
