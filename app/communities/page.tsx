"use client"

import { useState, useMemo, useCallback } from "react"
import { useStore } from "@/lib/store"
import type { Community } from "@/lib/types"
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
import { StatusBadge } from "@/components/status-badge"
import { EntityPanel } from "@/components/entity-panel"
import { DeleteDialog } from "@/components/delete-dialog"
import { DataTableToolbar } from "@/components/data-table-toolbar"
import { DataTablePagination } from "@/components/data-table-pagination"

const PAGE_SIZE = 50
type SortKey = "communityName" | "city" | "division" | "status" | "totalSold"

const STATUSES = ["Active", "Proposed", "Sold Out", "Not on VG"] as const

export default function CommunitiesPage() {
  const communities = useStore((s) => s.communities)
  const lookupValues = useStore((s) => s.lookupValues)
  const addCommunity = useStore((s) => s.addCommunity)
  const updateCommunity = useStore((s) => s.updateCommunity)
  const deleteCommunity = useStore((s) => s.deleteCommunity)
  const deleteCommunities = useStore((s) => s.deleteCommunities)

  const divisions = useMemo(
    () => lookupValues.filter((lv) => lv.lookupCategory === "Division").map((lv) => lv.lookupValue),
    [lookupValues]
  )
  const cities = useMemo(
    () => Array.from(new Set(communities.map((c) => c.city).filter(Boolean))).sort(),
    [communities]
  )

  const [search, setSearch] = useState("")
  const [divisionFilter, setDivisionFilter] = useState("all")
  const [cityFilter, setCityFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortKey, setSortKey] = useState<SortKey>("communityName")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc")
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<Set<string>>(new Set())

  // Panel form state
  const [panelOpen, setPanelOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({
    division: "GTA", communityName: "", address: "", city: "", postalCode: "",
    status: "Active" as Community["status"], dateOpened: "", dateSoldOut: "",
    totalLots: 0, totalSold: 0,
  })

  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)

  const updateForm = (key: string, value: string | number) => setForm((f) => ({ ...f, [key]: value }))

  const filtered = useMemo(() => {
    let data = [...communities]
    if (search) { const s = search.toLowerCase(); data = data.filter((c) => c.communityName.toLowerCase().includes(s) || c.address.toLowerCase().includes(s)) }
    if (divisionFilter !== "all") data = data.filter((c) => c.division === divisionFilter)
    if (cityFilter !== "all") data = data.filter((c) => c.city === cityFilter)
    if (statusFilter !== "all") data = data.filter((c) => c.status === statusFilter)
    data.sort((a, b) => {
      let aVal: string | number = ""
      let bVal: string | number = ""
      if (sortKey === "totalSold") { aVal = a.totalLots > 0 ? a.totalSold / a.totalLots : 0; bVal = b.totalLots > 0 ? b.totalSold / b.totalLots : 0 }
      else { aVal = a[sortKey] || ""; bVal = b[sortKey] || "" }
      const cmp = typeof aVal === "number" ? aVal - (bVal as number) : String(aVal).localeCompare(String(bVal))
      return sortDir === "asc" ? cmp : -cmp
    })
    return data
  }, [communities, search, divisionFilter, cityFilter, statusFilter, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(sortDir === "asc" ? "desc" : "asc")
    else { setSortKey(key); setSortDir("asc") }
  }

  const openAdd = () => {
    setEditingId(null)
    setForm({ division: "GTA", communityName: "", address: "", city: "", postalCode: "", status: "Active", dateOpened: "", dateSoldOut: "", totalLots: 0, totalSold: 0 })
    setPanelOpen(true)
  }
  const openEdit = (c: Community) => {
    setEditingId(c.id)
    setForm({ division: c.division, communityName: c.communityName, address: c.address, city: c.city, postalCode: c.postalCode, status: c.status, dateOpened: c.dateOpened, dateSoldOut: c.dateSoldOut, totalLots: c.totalLots, totalSold: c.totalSold })
    setPanelOpen(true)
  }
  const openDuplicate = (c: Community) => {
    setEditingId(null)
    setForm({ division: c.division, communityName: `${c.communityName} (Copy)`, address: c.address, city: c.city, postalCode: c.postalCode, status: c.status, dateOpened: c.dateOpened, dateSoldOut: c.dateSoldOut, totalLots: c.totalLots, totalSold: c.totalSold })
    setPanelOpen(true)
  }

  const handleSave = useCallback(() => {
    if (!form.communityName.trim()) { toast.error("Community name is required"); return }
    if (!form.address.trim()) { toast.error("Address is required"); return }
    if (!form.city.trim()) { toast.error("City is required"); return }
    const now = new Date().toISOString()
    if (editingId) {
      updateCommunity(editingId, { ...form })
      toast.success("Community updated")
    } else {
      addCommunity({ id: crypto.randomUUID(), ...form, createdAt: now, updatedAt: now })
      toast.success("Community added")
    }
    setPanelOpen(false)
  }, [editingId, form, addCommunity, updateCommunity])

  const handleDelete = useCallback(() => { if (deleteId) { deleteCommunity(deleteId); setDeleteId(null); toast.success("Community deleted") } }, [deleteId, deleteCommunity])
  const handleBulkDelete = useCallback(() => { deleteCommunities(Array.from(selected)); setSelected(new Set()); setBulkDeleteOpen(false); toast.success(`${selected.size} communities deleted`) }, [selected, deleteCommunities])
  const toggleSelect = (id: string) => setSelected((p) => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n })
  const toggleAll = () => selected.size === paginated.length ? setSelected(new Set()) : setSelected(new Set(paginated.map((c) => c.id)))

  return (
    <div className="space-y-4">
      <DataTableToolbar search={search} onSearchChange={(v) => { setSearch(v); setPage(1) }} onAdd={openAdd} entityName="Community" selectedCount={selected.size} onBulkDelete={() => setBulkDeleteOpen(true)}>
        <Select value={divisionFilter} onValueChange={(v) => { setDivisionFilter(v); setPage(1) }}>
          <SelectTrigger className="w-[140px] bg-card text-foreground"><SelectValue placeholder="Division" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Divisions</SelectItem>
            {divisions.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={cityFilter} onValueChange={(v) => { setCityFilter(v); setPage(1) }}>
          <SelectTrigger className="w-[140px] bg-card text-foreground"><SelectValue placeholder="City" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Cities</SelectItem>
            {cities.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1) }}>
          <SelectTrigger className="w-[130px] bg-card text-foreground"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </DataTableToolbar>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-12"><Checkbox checked={paginated.length > 0 && selected.size === paginated.length} onCheckedChange={toggleAll} /></TableHead>
              <TableHead><button onClick={() => toggleSort("communityName")} className="flex items-center gap-1 font-medium">Community <ArrowUpDown className="h-3.5 w-3.5" /></button></TableHead>
              <TableHead><button onClick={() => toggleSort("city")} className="flex items-center gap-1 font-medium">City <ArrowUpDown className="h-3.5 w-3.5" /></button></TableHead>
              <TableHead><button onClick={() => toggleSort("division")} className="flex items-center gap-1 font-medium">Division <ArrowUpDown className="h-3.5 w-3.5" /></button></TableHead>
              <TableHead><button onClick={() => toggleSort("status")} className="flex items-center gap-1 font-medium">Status <ArrowUpDown className="h-3.5 w-3.5" /></button></TableHead>
              <TableHead><button onClick={() => toggleSort("totalSold")} className="flex items-center gap-1 font-medium">Sales Progress <ArrowUpDown className="h-3.5 w-3.5" /></button></TableHead>
              <TableHead className="hidden lg:table-cell">Address</TableHead>
              <TableHead className="w-28 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.length === 0 ? (
              <TableRow><TableCell colSpan={8} className="h-32 text-center text-muted-foreground">No communities found.</TableCell></TableRow>
            ) : paginated.map((c) => {
              const pct = c.totalLots > 0 ? Math.round((c.totalSold / c.totalLots) * 100) : 0
              return (
                <TableRow key={c.id} data-state={selected.has(c.id) ? "selected" : undefined}>
                  <TableCell><Checkbox checked={selected.has(c.id)} onCheckedChange={() => toggleSelect(c.id)} /></TableCell>
                  <TableCell className="max-w-[250px] font-medium text-foreground">
                    <span className="truncate block">{c.communityName}</span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{c.city}</TableCell>
                  <TableCell className="text-muted-foreground">{c.division}</TableCell>
                  <TableCell><StatusBadge status={c.status} /></TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-20 overflow-hidden rounded-full bg-muted">
                        <div
                          className={`h-full rounded-full transition-all ${pct >= 100 ? "bg-emerald-500" : pct >= 75 ? "bg-amber-500" : "bg-blue-500"}`}
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">{c.totalSold}/{c.totalLots}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-muted-foreground text-xs">{c.address}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => openEdit(c)}><Pencil className="h-3.5 w-3.5" /><span className="sr-only">Edit</span></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => openDuplicate(c)}><Copy className="h-3.5 w-3.5" /><span className="sr-only">Duplicate</span></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => setDeleteId(c.id)}><Trash2 className="h-3.5 w-3.5" /><span className="sr-only">Delete</span></Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
        {filtered.length > 0 && <DataTablePagination page={page} totalPages={totalPages} totalRecords={filtered.length} pageSize={PAGE_SIZE} onPageChange={setPage} />}
      </div>

      <EntityPanel open={panelOpen} onOpenChange={setPanelOpen} title={editingId ? "Edit Community" : "Add Community"} description={editingId ? "Update community details" : "Create a new community"} onSave={handleSave}>
        {/* Section: Location */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-foreground border-b pb-2">Location</h3>
          <div className="space-y-1.5">
            <Label className="text-foreground">Division <span className="text-destructive">*</span></Label>
            <Select value={form.division} onValueChange={(v) => updateForm("division", v)}>
              <SelectTrigger className="bg-background text-foreground"><SelectValue /></SelectTrigger>
              <SelectContent>{divisions.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-foreground">Community Name <span className="text-destructive">*</span></Label>
            <Input value={form.communityName} onChange={(e) => updateForm("communityName", e.target.value)} className="bg-background text-foreground" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-foreground">Address <span className="text-destructive">*</span></Label>
            <Input value={form.address} onChange={(e) => updateForm("address", e.target.value)} className="bg-background text-foreground" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-foreground">City <span className="text-destructive">*</span></Label>
              <Input value={form.city} onChange={(e) => updateForm("city", e.target.value)} className="bg-background text-foreground" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-foreground">Postal Code</Label>
              <Input value={form.postalCode} onChange={(e) => updateForm("postalCode", e.target.value)} placeholder="A1A 1A1" className="bg-background text-foreground" />
            </div>
          </div>
        </div>

        {/* Section: Sales Information */}
        <div className="space-y-4 pt-4">
          <h3 className="text-sm font-semibold text-foreground border-b pb-2">Sales Information</h3>
          <div className="space-y-1.5">
            <Label className="text-foreground">Status</Label>
            <Select value={form.status} onValueChange={(v) => updateForm("status", v)}>
              <SelectTrigger className="bg-background text-foreground"><SelectValue /></SelectTrigger>
              <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-foreground">Date Opened</Label>
              <Input type="date" value={form.dateOpened} onChange={(e) => updateForm("dateOpened", e.target.value)} className="bg-background text-foreground" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-foreground">Date Sold Out</Label>
              <Input type="date" value={form.dateSoldOut} onChange={(e) => updateForm("dateSoldOut", e.target.value)} className="bg-background text-foreground" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-foreground">Total Lots</Label>
              <Input type="number" min={0} value={form.totalLots} onChange={(e) => updateForm("totalLots", parseInt(e.target.value) || 0)} className="bg-background text-foreground" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-foreground">Total Sold</Label>
              <Input type="number" min={0} value={form.totalSold} onChange={(e) => updateForm("totalSold", parseInt(e.target.value) || 0)} className="bg-background text-foreground" />
            </div>
          </div>
        </div>
      </EntityPanel>

      <DeleteDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)} onConfirm={handleDelete} />
      <DeleteDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen} onConfirm={handleBulkDelete} title={`Delete ${selected.size} communities?`} description="All selected communities will be permanently removed." />
    </div>
  )
}
