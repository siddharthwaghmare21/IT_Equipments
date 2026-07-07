import { getStatusStyle } from "@/data/statusStyles";

export default function StatusBadge({ status }) {
  return (
    <span
      className={`status-badge inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getStatusStyle(status)}`}
    >
      {status}
    </span>
  );
}
