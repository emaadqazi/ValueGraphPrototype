"use client"

import { useState, useMemo, useCallback } from "react"
import { useStore } from "@/lib/store"
import type { Product } from "@/lib/types"
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
import { Badge } from "@/components/ui/badge"
import { Pencil, Copy, Trash2, ArrowUpDown } from "lucide-react"
import { EntityPanel } from "@/components/entity-panel"
import { DeleteDialog } from "@/components/delete-dialog"
import { DataTableToolbar } from "@/components/data-table-toolbar"
import { DataTablePagination } from "@/components/data-table-pagination"

const PAGE_SIZE = 50
type SortKey = "productName" | "productType" | "division" | "condoType"

export default function ProductsPage() {
  const products = useStore((s) => s.products)
  const lookupValues = useStore((s) => s.lookupValues)
  const addProduct = useStore((s) => s.addProduct)
  const updateProduct = useStore((s) => s.updateProduct)
  const deleteProduct = useStore((s) => s.deleteProduct)
  const deleteProducts = useStore((s) => s.deleteProducts)

  const divisions = useMemo(
    () => lookupValues.filter((lv) => lv.lookupCategory === "Division").map((lv) => lv.lookupValue),
    [lookupValues]
  )

  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [sortKey, setSortKey] = useState<SortKey>("productName")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc")
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const [panelOpen, setPanelOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formName, setFormName] = useState("")
  const [formType, setFormType] = useState<"Attached" | "Detached">("Attached")
  const [formDivision, setFormDivision] = useState("")
  const [formCondoType, setFormCondoType] = useState("")

  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)

  const filtered = useMemo(() => {
    let data = [...products]
    if (search) {
      const s = search.toLowerCase()
      data = data.filter((p) => p.productName.toLowerCase().includes(s))
    }
    if (typeFilter !== "all") data = data.filter((p) => p.productType === typeFilter)
    data.sort((a, b) => {
      const aVal = a[sortKey] || ""
      const bVal = b[sortKey] || ""
      return sortDir === "asc" ? String(aVal).localeCompare(String(bVal)) : String(bVal).localeCompare(String(aVal))
    })
    return data
  }, [products, search, typeFilter, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(sortDir === "asc" ? "desc" : "asc")
    else { setSortKey(key); setSortDir("asc") }
  }

  const openAdd = () => {
    setEditingId(null); setFormName(""); setFormType("Attached"); setFormDivision("GTA"); setFormCondoType("")
    setPanelOpen(true)
  }
  const openEdit = (p: Product) => {
    setEditingId(p.id); setFormName(p.productName); setFormType(p.productType); setFormDivision(p.division); setFormCondoType(p.condoType)
    setPanelOpen(true)
  }
  const openDuplicate = (p: Product) => {
    setEditingId(null); setFormName(`${p.productName} (Copy)`); setFormType(p.productType); setFormDivision(p.division); setFormCondoType(p.condoType)
    setPanelOpen(true)
  }

  const handleSave = useCallback(() => {
    if (!formName.trim()) { toast.error("Product name is required"); return }
    const now = new Date().toISOString()
    if (editingId) {
      updateProduct(editingId, { productName: formName.trim(), productType: formType, division: formDivision, condoType: formCondoType })
      toast.success("Product updated")
    } else {
      addProduct({ id: crypto.randomUUID(), productName: formName.trim(), productType: formType, division: formDivision, condoType: formCondoType, createdAt: now, updatedAt: now })
      toast.success("Product added")
    }
    setPanelOpen(false)
  }, [editingId, formName, formType, formDivision, formCondoType, addProduct, updateProduct])

  const handleDelete = useCallback(() => { if (deleteId) { deleteProduct(deleteId); setDeleteId(null); toast.success("Product deleted") } }, [deleteId, deleteProduct])
  const handleBulkDelete = useCallback(() => { deleteProducts(Array.from(selected)); setSelected(new Set()); setBulkDeleteOpen(false); toast.success(`${selected.size} products deleted`) }, [selected, deleteProducts])

  const toggleSelect = (id: string) => setSelected((p) => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n })
  const toggleAll = () => selected.size === paginated.length ? setSelected(new Set()) : setSelected(new Set(paginated.map((p) => p.id)))

  return (
    <div className="space-y-4">
      <DataTableToolbar search={search} onSearchChange={(v) => { setSearch(v); setPage(1) }} onAdd={openAdd} entityName="Product" selectedCount={selected.size} onBulkDelete={() => setBulkDeleteOpen(true)}>
        <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(1) }}>
          <SelectTrigger className="w-[140px] bg-card text-foreground"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="Attached">Attached</SelectItem>
            <SelectItem value="Detached">Detached</SelectItem>
          </SelectContent>
        </Select>
      </DataTableToolbar>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-12"><Checkbox checked={paginated.length > 0 && selected.size === paginated.length} onCheckedChange={toggleAll} /></TableHead>
              <TableHead><button onClick={() => toggleSort("productName")} className="flex items-center gap-1 font-medium">Product Name <ArrowUpDown className="h-3.5 w-3.5" /></button></TableHead>
              <TableHead><button onClick={() => toggleSort("productType")} className="flex items-center gap-1 font-medium">Category <ArrowUpDown className="h-3.5 w-3.5" /></button></TableHead>
              <TableHead><button onClick={() => toggleSort("division")} className="flex items-center gap-1 font-medium">Division <ArrowUpDown className="h-3.5 w-3.5" /></button></TableHead>
              <TableHead><button onClick={() => toggleSort("condoType")} className="flex items-center gap-1 font-medium">Condo Type <ArrowUpDown className="h-3.5 w-3.5" /></button></TableHead>
              <TableHead className="w-28 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="h-32 text-center text-muted-foreground">No products found.</TableCell></TableRow>
            ) : paginated.map((p) => (
              <TableRow key={p.id} data-state={selected.has(p.id) ? "selected" : undefined}>
                <TableCell><Checkbox checked={selected.has(p.id)} onCheckedChange={() => toggleSelect(p.id)} /></TableCell>
                <TableCell className="font-medium text-foreground">{p.productName}</TableCell>
                <TableCell>
                  <Badge className={p.productType === "Detached" ? "bg-amber-100 text-amber-800 hover:bg-amber-100" : "bg-blue-100 text-blue-800 hover:bg-blue-100"}>
                    {p.productType}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">{p.division || "-"}</TableCell>
                <TableCell className="text-muted-foreground">{p.condoType || "-"}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => openEdit(p)}><Pencil className="h-3.5 w-3.5" /><span className="sr-only">Edit</span></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => openDuplicate(p)}><Copy className="h-3.5 w-3.5" /><span className="sr-only">Duplicate</span></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => setDeleteId(p.id)}><Trash2 className="h-3.5 w-3.5" /><span className="sr-only">Delete</span></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {filtered.length > 0 && <DataTablePagination page={page} totalPages={totalPages} totalRecords={filtered.length} pageSize={PAGE_SIZE} onPageChange={setPage} />}
      </div>

      <EntityPanel open={panelOpen} onOpenChange={setPanelOpen} title={editingId ? "Edit Product" : "Add Product"} description={editingId ? "Update product details" : "Create a new product record"} onSave={handleSave}>
        <div className="space-y-1.5">
          <Label className="text-foreground">Product Name <span className="text-destructive">*</span></Label>
          <Input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="e.g., 3-Storey Back to Back Condo Village Homes" className="bg-background text-foreground" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-foreground">Division</Label>
          <Select value={formDivision} onValueChange={setFormDivision}>
            <SelectTrigger className="bg-background text-foreground"><SelectValue placeholder="Select division" /></SelectTrigger>
            <SelectContent>{divisions.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-foreground">Category <span className="text-destructive">*</span></Label>
          <Select value={formType} onValueChange={(v) => setFormType(v as "Attached" | "Detached")}>
            <SelectTrigger className="bg-background text-foreground"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Attached">Attached</SelectItem>
              <SelectItem value="Detached">Detached</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-foreground">Condo Type</Label>
          <Select value={formCondoType || "none"} onValueChange={(v) => setFormCondoType(v === "none" ? "" : v)}>
            <SelectTrigger className="bg-background text-foreground"><SelectValue placeholder="Select type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="Low Rise">Low Rise</SelectItem>
              <SelectItem value="Mid Rise">Mid Rise</SelectItem>
              <SelectItem value="High Rise">High Rise</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </EntityPanel>

      <DeleteDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)} onConfirm={handleDelete} />
      <DeleteDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen} onConfirm={handleBulkDelete} title={`Delete ${selected.size} products?`} description="All selected products will be permanently removed." />
    </div>
  )
}
