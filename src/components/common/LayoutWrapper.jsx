"use client";

import { useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";

export default function LayoutWrapper({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:block">
        <Sidebar />
      </div>

      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close sidebar overlay"
            onClick={() => setIsSidebarOpen(false)}
            className="absolute inset-0 bg-black/50"
          />

          <div className="relative h-full">
            <Sidebar onClose={() => setIsSidebarOpen(false)} />
          </div>
        </div>
      )}

      <div className="lg:pl-72">
        <Header onMenuClick={() => setIsSidebarOpen(true)} />

        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}