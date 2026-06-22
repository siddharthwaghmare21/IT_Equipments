"use client";

function getInitials(name) {
  if (!name) return "IT";

  const words = name.trim().split(" ");

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return `${words[0][0]}${words[1][0]}`.toUpperCase();
}

export default function Header({
  onMenuClick,
  currentUser,
  isSuperAdmin = false,
  onLogout,
}) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-100 lg:hidden"
          aria-label="Open menu"
        >
          <span className="flex w-5 flex-col gap-1" aria-hidden="true">
            <span className="h-0.5 rounded-full bg-current" />
            <span className="h-0.5 rounded-full bg-current" />
            <span className="h-0.5 rounded-full bg-current" />
          </span>
        </button>

        <div>
          <h1 className="text-base font-bold text-gray-900 sm:text-lg">
            IT Equipment Management
          </h1>

          <p className="hidden text-xs text-gray-500 sm:block">
            Assets, purchases, deliveries and reports
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden text-right sm:block">
          <div className="flex items-center justify-end gap-2">
            <p className="text-sm font-semibold text-gray-900">
              {currentUser?.fullName || "IT Department"}
            </p>

            {isSuperAdmin && (
              <span className="rounded-full border border-purple-200 bg-purple-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-purple-700">
                Super Admin
              </span>
            )}
          </div>

          <p className="text-xs text-gray-500">
            {currentUser?.role || "Admin Panel"}
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-900 text-sm font-bold text-white">
          {getInitials(currentUser?.fullName)}
        </div>

        {onLogout && (
          <button
            type="button"
            onClick={onLogout}
            className="hidden rounded-xl border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 md:inline-flex"
          >
            Logout
          </button>
        )}
      </div>
    </header>
  );
}
