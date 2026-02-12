"use client"

import { useState, useMemo, useCallback } from "react"
import { useStore } from "@/lib/store"
import type { Feature } from "@/lib/types"
import { formatCurrency, formatDate } from "@/lib/format"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Pencil, Copy, Trash2, ArrowUpDown } from "lucide-react"
import { EntityPanel } from "@/components/entity-panel"
import { DeleteDialog } from "@/components/delete-dialog"
import { DataTableToolbar } from "@/components/data-table-toolbar"
import { DataTablePagination } from "@/components/data-table-pagination"

const PAGE_SIZE = 50

type SortKey = "featureName" | "featureCategory" | "retailPrice" | "division" | "createdAt"
type FeatureTabType = "standard" | "plan-specific" | "plan-base"

export default function FeaturesPage() {
  const features = useStore((s) => s.features)
  const lookupValues = useStore((s) => s.lookupValues)
  const addFeature = useStore((s) => s.addFeature)
  const updateFeature = useStore((s) => s.updateFeature)
  const deleteFeature = useStore((s) => s.deleteFeature)
  const deleteFeatures = useStore((s) => s.deleteFeatures)

  const divisions = useMemo(
    () => lookupValues.filter((lv) => lv.lookupCategory === "Division").map((lv) => lv.lookupValue),
    [lookupValues]
  )

  const featureCategories = useMemo(
    () => lookupValues.filter((lv) => lv.lookupCategory === "Feature Category").map((lv) => lv.lookupValue),
    [lookupValues]
  )

  const [activeTab, setActiveTab] = useState<FeatureTabType>("plan-specific")
  const [search, setSearch] = useState("")
  const [divisionFilter, setDivisionFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [sortKey, setSortKey] = useState<SortKey>("featureName")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc")
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<Set<string>>(new Set())

  // Panel state
  const [panelOpen, setPanelOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formDivision, setFormDivision] = useState("GTA")
  const [formFeatureCategory, setFormFeatureCategory] = useState("")
  const [formFeatureName, setFormFeatureName] = useState("")
  const [formRetailPrice, setFormRetailPrice] = useState("")
  const [formFeatureType, setFormFeatureType] = useState("")

  // Delete state
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)

  // Filter by tab (featureType field can be used to differentiate tabs)
  const tabFilteredFeatures = useMemo(() => {
    // For now, we'll show all features in each tab since featureType isn't strictly defined
    // In production, you'd filter by featureType matching the tab
    return features
  }, [features])

  const filtered = useMemo(() => {
    let data = [...tabFilteredFeatures]
    if (search) {
      const s = search.toLowerCase()
      data = data.filter((f) => f.featureName.toLowerCase().includes(s))
    }
    if (divisionFilter !== "all") {
      data = data.filter((f) => f.division === divisionFilter)
    }
    if (categoryFilter !== "all") {
      data = data.filter((f) => f.featureCategory === categoryFilter)
    }
    data.sort((a, b) => {
      const aVal = a[sortKey] || ""
      const bVal = b[sortKey] || ""
      if (sortKey === "retailPrice") {
        return sortDir === "asc" ? (a.retailPrice - b.retailPrice) : (b.retailPrice - a.retailPrice)
      }
      const cmp = String(aVal).localeCompare(String(bVal))
      return sortDir === "asc" ? cmp : -cmp
    })
    return data
  }, [tabFilteredFeatures, search, divisionFilter, categoryFilter, sortKey, sortDir])

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
    setFormDivision("GTA")
    setFormFeatureCategory("")
    setFormFeatureName("")
    setFormRetailPrice("")
    setFormFeatureType(activeTab)
    setPanelOpen(true)
  }

  const openEdit = (f: Feature) => {
    setEditingId(f.id)
    setFormDivision(f.division)
    setFormFeatureCategory(f.featureCategory)
    setFormFeatureName(f.featureName)
    setFormRetailPrice(String(f.retailPrice))
    setFormFeatureType(f.featureType)
    setPanelOpen(true)
  }

  const openDuplicate = (f: Feature) => {
    setEditingId(null)
    setFormDivision(f.division)
    setFormFeatureCategory(f.featureCategory)
    setFormFeatureName(`${f.featureName} (Copy)`)
    setFormRetailPrice(String(f.retailPrice))
    setFormFeatureType(f.featureType)
    setPanelOpen(true)
  }

  const handleSave = useCallback(() => {
    if (!formFeatureName.trim()) {
      toast.error("Feature name is required")
      return
    }
    if (!formDivision) {
      toast.error("Division is required")
      return
    }
    if (!formFeatureCategory) {
      toast.error("Feature category is required")
      return
    }

    const now = new Date().toISOString()
    if (editingId) {
      updateFeature(editingId, {
        division: formDivision,
        featureCategory: formFeatureCategory,
        featureName: formFeatureName.trim(),
        retailPrice: parseFloat(formRetailPrice) || 0,
        featureType: formFeatureType,
      })
      toast.success("Feature updated successfully")
    } else {
      addFeature({
        id: crypto.randomUUID(),
        division: formDivision,
        featureCategory: formFeatureCategory,
        featureName: formFeatureName.trim(),
        retailPrice: parseFloat(formRetailPrice) || 0,
        featureType: formFeatureType,
        createdAt: now,
        updatedAt: now,
      })
      toast.success("Feature added successfully")
    }
    setPanelOpen(false)
  }, [editingId, formDivision, formFeatureCategory, formFeatureName, formRetailPrice, formFeatureType, addFeature, updateFeature])

  const handleDelete = useCallback(() => {
    if (deleteId) {
      deleteFeature(deleteId)
      setDeleteId(null)
      toast.success("Feature deleted")
    }
  }, [deleteId, deleteFeature])

  const handleBulkDelete = useCallback(() => {
    deleteFeatures(Array.from(selected))
    setSelected(new Set())
    setBulkDeleteOpen(false)
    toast.success(`${selected.size} features deleted`)
  }, [selected, deleteFeatures])

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
      setSelected(new Set(paginated.map((f) => f.id)))
    }
  }

  const renderTable = () => (
    <>
      <DataTableToolbar
        search={search}
        onSearchChange={(v) => { setSearch(v); setPage(1) }}
        onAdd={openAdd}
        entityName="Feature"
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
        <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setPage(1) }}>
          <SelectTrigger className="w-[200px] bg-card text-foreground">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {featureCategories.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
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
                <button onClick={() => toggleSort("featureName")} className="flex items-center gap-1 font-medium">
                  Feature Name <ArrowUpDown className="h-3.5 w-3.5" />
                </button>
              </TableHead>
              <TableHead>
                <button onClick={() => toggleSort("featureCategory")} className="flex items-center gap-1 font-medium">
                  Category <ArrowUpDown className="h-3.5 w-3.5" />
                </button>
              </TableHead>
              <TableHead>
                <button onClick={() => toggleSort("division")} className="flex items-center gap-1 font-medium">
                  Division <ArrowUpDown className="h-3.5 w-3.5" />
                </button>
              </TableHead>
              <TableHead className="text-right">
                <button onClick={() => toggleSort("retailPrice")} className="flex items-center gap-1 font-medium ml-auto">
                  Retail Price <ArrowUpDown className="h-3.5 w-3.5" />
                </button>
              </TableHead>
              <TableHead className="w-28 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  No features found. Click &quot;Add Feature&quot; to create one.
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((f) => (
                <TableRow key={f.id} data-state={selected.has(f.id) ? "selected" : undefined}>
                  <TableCell>
                    <Checkbox
                      checked={selected.has(f.id)}
                      onCheckedChange={() => toggleSelect(f.id)}
                    />
                  </TableCell>
                  <TableCell className="font-medium text-foreground">{f.featureName}</TableCell>
                  <TableCell className="text-muted-foreground">{f.featureCategory}</TableCell>
                  <TableCell className="text-muted-foreground">{f.division || "-"}</TableCell>
                  <TableCell className={`text-right font-medium ${f.retailPrice < 0 ? 'text-destructive' : 'text-green-600'}`}>
                    {formatCurrency(f.retailPrice)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => openEdit(f)}>
                        <Pencil className="h-3.5 w-3.5" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => openDuplicate(f)}>
                        <Copy className="h-3.5 w-3.5" />
                        <span className="sr-only">Duplicate</span>
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => setDeleteId(f.id)}>
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
    </>
  )

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as FeatureTabType)} className="w-full">
        <TabsList className="grid w-full max-w-2xl grid-cols-3 bg-muted">
          <TabsTrigger value="standard">Standard Features</TabsTrigger>
          <TabsTrigger value="plan-specific">Plan Specific Features</TabsTrigger>
          <TabsTrigger value="plan-base">Plan Base Features</TabsTrigger>
        </TabsList>

        <TabsContent value="standard" className="space-y-4 mt-4">
          {renderTable()}
        </TabsContent>

        <TabsContent value="plan-specific" className="space-y-4 mt-4">
          {renderTable()}
        </TabsContent>

        <TabsContent value="plan-base" className="space-y-4 mt-4">
          {renderTable()}
        </TabsContent>
      </Tabs>

      {/* Add/Edit Panel */}
      <EntityPanel
        open={panelOpen}
        onOpenChange={setPanelOpen}
        title={editingId ? "Edit Feature" : "Add Feature"}
        description={editingId ? "Update feature details" : "Create a new feature record"}
        onSave={handleSave}
      >
        <div className="space-y-1.5">
          <Label htmlFor="division" className="text-foreground">
            Division <span className="text-destructive">*</span>
          </Label>
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
        <div className="space-y-1.5">
          <Label htmlFor="featureCategory" className="text-foreground">
            Feature Category <span className="text-destructive">*</span>
          </Label>
          <Select value={formFeatureCategory} onValueChange={setFormFeatureCategory}>
            <SelectTrigger className="bg-background text-foreground">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              {featureCategories.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="featureName" className="text-foreground">
            Feature Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="featureName"
            value={formFeatureName}
            onChange={(e) => setFormFeatureName(e.target.value)}
            placeholder="e.g., Granite Countertop Upgrade"
            className="bg-background text-foreground"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="retailPrice" className="text-foreground">
            Retail Price <span className="text-destructive">*</span>
          </Label>
          <Input
            id="retailPrice"
            type="number"
            step="0.01"
            value={formRetailPrice}
            onChange={(e) => setFormRetailPrice(e.target.value)}
            placeholder="e.g., 2500 or -1500"
            className="bg-background text-foreground"
          />
          <p className="text-xs text-muted-foreground">
            Negative = Mattamy spec is better, Positive = competitor is better
          </p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="featureType" className="text-foreground">Feature Type</Label>
          <Input
            id="featureType"
            value={formFeatureType}
            onChange={(e) => setFormFeatureType(e.target.value)}
            placeholder="Optional feature type"
            className="bg-background text-foreground"
          />
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
        title={`Delete ${selected.size} features?`}
        description="This action cannot be undone. All selected features will be permanently removed."
      />
    </div>
  )
}
