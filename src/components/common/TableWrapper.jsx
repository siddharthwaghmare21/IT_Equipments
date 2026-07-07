export default function TableWrapper({ children, variant = "default" }) {
  const isReport = variant === "report";

  return (
    <div
      className={`table-grid-shell overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm ${
        isReport ? "" : "dark:border-slate-800 dark:bg-slate-950"
      }`}
    >
      <div
        className={`table-grid-scroll-hint no-print border-b border-slate-100 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-500 ${
          isReport ? "" : "dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"
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
