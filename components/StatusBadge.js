const STYLES = {
  Ticketed: "bg-noori-success/10 text-noori-success",
  Confirmed: "bg-noori-info/10 text-noori-info",
  Pending: "bg-noori-warning/10 text-noori-warning",
  Cancelled: "bg-noori-danger/10 text-noori-danger",
  "Awaiting Approval": "bg-noori-warning/10 text-noori-warning",
  Approved: "bg-noori-success/10 text-noori-success",
  Rejected: "bg-noori-danger/10 text-noori-danger",
  "N/A": "bg-gray-100 text-gray-500",
  // User account status (stored uppercase, alongside role which is USER/ADMIN)
  PENDING: "bg-noori-warning/10 text-noori-warning",
  ACTIVE: "bg-noori-success/10 text-noori-success",
  REJECTED: "bg-noori-danger/10 text-noori-danger",
};

export default function StatusBadge({ status }) {
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STYLES[status] || "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
}
