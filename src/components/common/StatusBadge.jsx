export default function StatusBadge({ status }) {
  const statusStyles = {
    Available: "bg-green-100 text-green-700 border-green-200",
    Assigned: "bg-blue-100 text-blue-700 border-blue-200",
    Maintenance: "bg-yellow-100 text-yellow-700 border-yellow-200",
    Damaged: "bg-red-100 text-red-700 border-red-200",
    Scrapped: "bg-gray-100 text-gray-700 border-gray-200",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
        statusStyles[status] || "bg-gray-100 text-gray-700 border-gray-200"
      }`}
    >
      {status}
    </span>
  );
}