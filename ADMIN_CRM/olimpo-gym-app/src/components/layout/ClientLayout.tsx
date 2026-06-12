"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export default function ClientLayout({
  children,
  user,
}: {
  children: React.ReactNode;
  user: any;
}) {
  // Mobile overlay state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // Desktop collapsed state
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);

  return (
    <div className="min-h-screen text-olimpo-text flex flex-col md:flex-row">
      <Topbar 
        user={user} 
        onOpenMobileMenu={() => setMobileMenuOpen(true)} 
      />
      
      <Sidebar 
        userRole={user.role} 
        mobileOpen={mobileMenuOpen} 
        onCloseMobile={() => setMobileMenuOpen(false)}
        desktopCollapsed={desktopCollapsed}
        onToggleDesktop={() => setDesktopCollapsed(!desktopCollapsed)}
      />

      {/* Main Content Area */}
      <main 
        className={`flex-1 transition-all duration-300 pt-16 min-h-screen w-full relative overflow-hidden ${
          desktopCollapsed ? "md:pl-20" : "md:pl-64"
        }`}
      >
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full relative z-10">
          {children}
        </div>
      </main>
      
      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}
