export default function TableWrapper({ children }) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="no-print border-b border-slate-100 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-500">
        Scroll horizontally to view all columns
      </div>
      <div className="overflow-x-auto">
        {children}
      </div>
    </div>
  );
}
