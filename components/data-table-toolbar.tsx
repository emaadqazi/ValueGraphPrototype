"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Plus, Trash2, X } from "lucide-react"

interface DataTableToolbarProps {
  search: string
  onSearchChange: (value: string) => void
  onAdd: () => void
  entityName: string
  selectedCount: number
  onBulkDelete?: () => void
  children?: React.ReactNode
}

export function DataTableToolbar({
  search,
  onSearchChange,
  onAdd,
  entityName,
  selectedCount,
  onBulkDelete,
  children,
}: DataTableToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-[200px] max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={`Search ${entityName.toLowerCase()}...`}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 bg-card text-foreground"
        />
        {search && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      {children}

      <div className="ml-auto flex items-center gap-2">
        {selectedCount > 0 && onBulkDelete && (
          <Button
            variant="outline"
            size="sm"
            onClick={onBulkDelete}
            className="border-destructive text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="mr-1.5 h-3.5 w-3.5" />
            Delete ({selectedCount})
          </Button>
        )}
        <Button
          onClick={onAdd}
          size="sm"
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          Add {entityName}
        </Button>
      </div>
    </div>
  )
}
