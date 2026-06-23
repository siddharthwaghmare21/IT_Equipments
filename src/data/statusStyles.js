export const statusStyles = {
  Active: "bg-green-100 text-green-700 border-green-200",
  Available: "bg-green-100 text-green-700 border-green-200",
  Approved: "bg-green-100 text-green-700 border-green-200",
  Completed: "bg-green-100 text-green-700 border-green-200",
  Returned: "bg-green-100 text-green-700 border-green-200",
  Success: "bg-green-100 text-green-700 border-green-200",
  Assigned: "bg-blue-100 text-blue-700 border-blue-200",
  Delivered: "bg-blue-100 text-blue-700 border-blue-200",
  Ordered: "bg-blue-100 text-blue-700 border-blue-200",
  "In Progress": "bg-blue-100 text-blue-700 border-blue-200",
  Pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
  "Pending Return": "bg-yellow-100 text-yellow-700 border-yellow-200",
  "Pending Inspection": "bg-yellow-100 text-yellow-700 border-yellow-200",
  Maintenance: "bg-yellow-100 text-yellow-700 border-yellow-200",
  Warning: "bg-yellow-100 text-yellow-700 border-yellow-200",
  Rejected: "bg-red-100 text-red-700 border-red-200",
  Damaged: "bg-red-100 text-red-700 border-red-200",
  Failed: "bg-red-100 text-red-700 border-red-200",
  Cancelled: "bg-red-100 text-red-700 border-red-200",
  Blocked: "bg-red-100 text-red-700 border-red-200",
  Inactive: "bg-gray-100 text-gray-700 border-gray-200",
  Scrapped: "bg-gray-100 text-gray-700 border-gray-200",
};

export function getStatusStyle(status) {
  return statusStyles[status] || "bg-gray-100 text-gray-700 border-gray-200";
}
