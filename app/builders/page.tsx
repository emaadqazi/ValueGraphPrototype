"use client"

import { useState, useMemo, useCallback } from "react"
import { useStore } from "@/lib/store"
import type { Builder } from "@/lib/types"
import { formatDate } from "@/lib/format"
import { toast } from "sonner"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Pencil, Copy, Trash2, ArrowUpDown } from "lucide-react"
import { EntityPanel } from "@/components/entity-panel"
import { DeleteDialog } from "@/components/delete-dialog"
import { DataTableToolbar } from "@/components/data-table-toolbar"
import { DataTablePagination } from "@/components/data-table-pagination"

const PAGE_SIZE = 50

type SortKey = "builderName" | "division" | "createdAt"

export default function BuildersPage() {
  const builders = useStore((s) => s.builders)
  const lookupValues = useStore((s) => s.lookupValues)
  const addBuilder = useStore((s) => s.addBuilder)
  const updateBuilder = useStore((s) => s.updateBuilder)
  const deleteBuilder = useStore((s) => s.deleteBuilder)
  const deleteBuilders = useStore((s) => s.deleteBuilders)

  const divisions = useMemo(
    () => lookupValues.filter((lv) => lv.lookupCategory === "Division").map((lv) => lv.lookupValue),
    [lookupValues]
  )

  const [search, setSearch] = useState("")
  const [divisionFilter, setDivisionFilter] = useState("all")
  const [sortKey, setSortKey] = useState<SortKey>("builderName")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc")
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<Set<string>>(new Set())

  // Panel state
  const [panelOpen, setPanelOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formName, setFormName] = useState("")
  const [formDivision, setFormDivision] = useState("")

  // Delete state
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)

  const filtered = useMemo(() => {
    let data = [...builders]
    if (search) {
      const s = search.toLowerCase()
      data = data.filter((b) => b.builderName.toLowerCase().includes(s))
    }
    if (divisionFilter !== "all") {
      data = data.filter((b) => b.division === divisionFilter)
    }
    data.sort((a, b) => {
      const aVal = a[sortKey] || ""
      const bVal = b[sortKey] || ""
      const cmp = String(aVal).localeCompare(String(bVal))
      return sortDir === "asc" ? cmp : -cmp
    })
    return data
  }, [builders, search, divisionFilter, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc")
    } else {
      setSortKey(key)
      setSortDir("asc")
    }
  }

  const openAdd = () => {
    setEditingId(null)
    setFormName("")
    setFormDivision("GTA")
    setPanelOpen(true)
  }

  const openEdit = (b: Builder) => {
    setEditingId(b.id)
    setFormName(b.builderName)
    setFormDivision(b.division)
    setPanelOpen(true)
  }

  const openDuplicate = (b: Builder) => {
    setEditingId(null)
    setFormName(`${b.builderName} (Copy)`)
    setFormDivision(b.division)
    setPanelOpen(true)
  }

  const handleSave = useCallback(() => {
    if (!formName.trim()) {
      toast.error("Builder name is required")
      return
    }
    const now = new Date().toISOString()
    if (editingId) {
      updateBuilder(editingId, { builderName: formName.trim(), division: formDivision })
      toast.success("Builder updated successfully")
    } else {
      addBuilder({
        id: crypto.randomUUID(),
        builderName: formName.trim(),
        division: formDivision,
        createdAt: now,
        updatedAt: now,
      })
      toast.success("Builder added successfully")
    }
    setPanelOpen(false)
  }, [editingId, formName, formDivision, addBuilder, updateBuilder])

  const handleDelete = useCallback(() => {
    if (deleteId) {
      deleteBuilder(deleteId)
      setDeleteId(null)
      toast.success("Builder deleted")
    }
  }, [deleteId, deleteBuilder])

  const handleBulkDelete = useCallback(() => {
    deleteBuilders(Array.from(selected))
    setSelected(new Set())
    setBulkDeleteOpen(false)
    toast.success(`${selected.size} builders deleted`)
  }, [selected, deleteBuilders])

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleAll = () => {
    if (selected.size === paginated.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(paginated.map((b) => b.id)))
    }
  }

  return (
    <div className="space-y-4">
      <DataTableToolbar
        search={search}
        onSearchChange={(v) => { setSearch(v); setPage(1) }}
        onAdd={openAdd}
        entityName="Builder"
        selectedCount={selected.size}
        onBulkDelete={() => setBulkDeleteOpen(true)}
      >
        <Select value={divisionFilter} onValueChange={(v) => { setDivisionFilter(v); setPage(1) }}>
          <SelectTrigger className="w-[160px] bg-card text-foreground">
            <SelectValue placeholder="Division" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Divisions</SelectItem>
            {divisions.map((d) => (
              <SelectItem key={d} value={d}>{d}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </DataTableToolbar>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-12">
                <Checkbox
                  checked={paginated.length > 0 && selected.size === paginated.length}
                  onCheckedChange={toggleAll}
                />
              </TableHead>
              <TableHead>
                <button onClick={() => toggleSort("builderName")} className="flex items-center gap-1 font-medium">
                  Builder Name <ArrowUpDown className="h-3.5 w-3.5" />
                </button>
              </TableHead>
              <TableHead>
                <button onClick={() => toggleSort("division")} className="flex items-center gap-1 font-medium">
                  Division <ArrowUpDown className="h-3.5 w-3.5" />
                </button>
              </TableHead>
              <TableHead>
                <button onClick={() => toggleSort("createdAt")} className="flex items-center gap-1 font-medium">
                  Created <ArrowUpDown className="h-3.5 w-3.5" />
                </button>
              </TableHead>
              <TableHead className="w-28 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                  No builders found. Click &quot;Add Builder&quot; to create one.
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((b) => (
                <TableRow key={b.id} data-state={selected.has(b.id) ? "selected" : undefined}>
                  <TableCell>
                    <Checkbox
                      checked={selected.has(b.id)}
                      onCheckedChange={() => toggleSelect(b.id)}
                    />
                  </TableCell>
                  <TableCell className="font-medium text-foreground">{b.builderName}</TableCell>
                  <TableCell className="text-muted-foreground">{b.division || "-"}</TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(b.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => openEdit(b)}>
                        <Pencil className="h-3.5 w-3.5" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => openDuplicate(b)}>
                        <Copy className="h-3.5 w-3.5" />
                        <span className="sr-only">Duplicate</span>
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => setDeleteId(b.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {filtered.length > 0 && (
          <DataTablePagination
            page={page}
            totalPages={totalPages}
            totalRecords={filtered.length}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        )}
      </div>

      {/* Add/Edit Panel */}
      <EntityPanel
        open={panelOpen}
        onOpenChange={setPanelOpen}
        title={editingId ? "Edit Builder" : "Add Builder"}
        description={editingId ? "Update builder details" : "Create a new builder record"}
        onSave={handleSave}
      >
        <div className="space-y-1.5">
          <Label htmlFor="builderName" className="text-foreground">
            Builder Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="builderName"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            placeholder="e.g., Mattamy Homes (Mississauga)"
            className="bg-background text-foreground"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="division" className="text-foreground">Division</Label>
          <Select value={formDivision} onValueChange={setFormDivision}>
            <SelectTrigger className="bg-background text-foreground">
              <SelectValue placeholder="Select division" />
            </SelectTrigger>
            <SelectContent>
              {divisions.map((d) => (
                <SelectItem key={d} value={d}>{d}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </EntityPanel>

      {/* Delete Confirmation */}
      <DeleteDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
      />
      <DeleteDialog
        open={bulkDeleteOpen}
        onOpenChange={setBulkDeleteOpen}
        onConfirm={handleBulkDelete}
        title={`Delete ${selected.size} builders?`}
        description="This action cannot be undone. All selected builders will be permanently removed."
      />
    </div>
  )
}
