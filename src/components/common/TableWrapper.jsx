export default function TableWrapper({ children, variant = "default" }) {
  const isReport = variant === "report";

  return (
    <div
      className={`table-grid-shell overflow-hidden rounded-[26px] border shadow-[0_18px_38px_rgba(6,12,24,0.14)] ${
        isReport
          ? "border-slate-200 bg-white"
          : "border-[#2c3f63] bg-[#18253d]"
      }`}
    >
      <div
        className={`table-grid-scroll-hint no-print border-b px-4 py-2.5 text-xs font-semibold ${
          isReport
            ? "border-slate-100 bg-slate-50 text-slate-500"
            : "border-[#2c3f63] bg-[#142033] text-[#92a7cb]"
        }`}
      >
        Scroll horizontally to view all columns
      </div>
      <div className="table-grid-scroll overflow-x-auto">
        {children}
      </div>
    </div>
  );
}
