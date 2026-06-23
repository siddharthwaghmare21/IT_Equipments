export default function TableWrapper({ children }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="no-print border-b border-gray-100 bg-gray-50 px-4 py-2 text-xs font-semibold text-gray-500">
        Scroll horizontally to view all columns
      </div>
      <div className="overflow-x-auto">
        {children}
      </div>
    </div>
  );
}
