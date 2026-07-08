"use client";

export default function AppLogoMark({ compact = false }) {
  return (
    <div className={`flex items-center gap-3 ${compact ? "gap-2" : ""}`}>
      <div className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-[#f2f6ff]">
        <span className="absolute left-[10px] top-[8px] h-6 w-[5px] rounded-full bg-emerald-400" />
        <span className="absolute left-[17px] top-[8px] h-6 w-[5px] rounded-full bg-[#5e35f2]" />
        <span className="absolute left-[25px] top-[12px] h-[18px] w-[5px] rounded-full bg-[#8d46ff]" />
        <span className="absolute left-[13px] top-[18px] h-[5px] w-[18px] rounded-full bg-[#5e35f2]" />
      </div>

      <div className="min-w-0">
        <p className="truncate text-base font-bold text-slate-900 dark:text-white">
          IT Equipment
        </p>
        {!compact && (
          <p className="truncate text-xs text-slate-500 dark:text-slate-300">
            Management System
          </p>
        )}
      </div>
    </div>
  );
}
