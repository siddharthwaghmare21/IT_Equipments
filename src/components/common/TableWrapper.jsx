export default function TableWrapper({ children }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        {children}
      </div>
    </div>
  );
}