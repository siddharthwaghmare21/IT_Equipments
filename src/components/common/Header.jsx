"use client";

export default function Header({ onMenuClick }) {
  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-gray-200 px-4 sm:px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-100"
          aria-label="Open menu"
        >
          ☰
        </button>

        <div>
          <h1 className="text-base sm:text-lg font-bold text-gray-900">
            IT Equipment Management
          </h1>
          <p className="hidden sm:block text-xs text-gray-500">
            Assets, purchases, deliveries and reports
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:block text-right">
          <p className="text-sm font-medium text-gray-900">IT Department</p>
          <p className="text-xs text-gray-500">Admin Panel</p>
        </div>

        <div className="h-10 w-10 rounded-full bg-gray-900 text-white flex items-center justify-center text-sm font-bold">
          IT
        </div>
      </div>
    </header>
  );
}