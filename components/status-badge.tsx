import { cn } from "@/lib/utils"

const statusColors: Record<string, string> = {
  Active: "bg-emerald-100 text-emerald-800",
  Proposed: "bg-blue-100 text-blue-800",
  "Sold Out": "bg-red-100 text-red-800",
  "Not on VG": "bg-gray-100 text-gray-600",
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        statusColors[status] || "bg-gray-100 text-gray-600"
      )}
    >
      {status}
    </span>
  )
}
