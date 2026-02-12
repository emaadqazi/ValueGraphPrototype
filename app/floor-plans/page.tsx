"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import { useStore } from "@/lib/store"
import type { FloorPlan, HistoricalPricing } from "@/lib/types"
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
import { Pencil, Copy, Trash2, ArrowUpDown, Plus, X } from "lucide-react"
import { EntityPanel } from "@/components/entity-panel"
import { DeleteDialog } from "@/components/delete-dialog"
import { DataTableToolbar } from "@/components/data-table-toolbar"
import { DataTablePagination } from "@/components/data-table-pagination"
import { StatusBadge } from "@/components/status-badge"

const PAGE_SIZE = 50

type SortKey = "floorPlanName" | "builder" | "productType" | "community" | "floorPlanStatus" | "squareFeet" | "price"

export default function FloorPlansPage() {
  const floorPlans = useStore((s) => s.floorPlans)
  const builders = useStore((s) => s.builders)
  const products = useStore((s) => s.products)
  const communities = useStore((s) => s.communities)
  const lookupValues = useStore((s) => s.lookupValues)
  const addFloorPlan = useStore((s) => s.addFloorPlan)
  const updateFloorPlan = useStore((s) => s.updateFloorPlan)
  const deleteFloorPlan = useStore((s) => s.deleteFloorPlan)
  const deleteFloorPlans = useStore((s) => s.deleteFloorPlans)

  const divisions = useMemo(
    () => lookupValues.filter((lv) => lv.lookupCategory === "Division").map((lv) => lv.lookupValue),
    [lookupValues]
  )

  const elevations = useMemo(
    () => lookupValues.filter((lv) => lv.lookupCategory === "Elevation Style").map((lv) => lv.lookupValue),
    [lookupValues]
  )

  const condoAmenitiesList = useMemo(
    () => lookupValues.filter((lv) => lv.lookupCategory === "Condo Amenities").map((lv) => lv.lookupValue),
    [lookupValues]
  )

  const [search, setSearch] = useState("")
  const [divisionFilter, setDivisionFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [communityFilter, setCommunityFilter] = useState("all")
  const [builderFilter, setBuilderFilter] = useState("all")
  const [productFilter, setProductFilter] = useState("all")
  const [sortKey, setSortKey] = useState<SortKey>("floorPlanName")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc")
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<Set<string>>(new Set())

  // Panel state
  const [panelOpen, setPanelOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  // Section A: Plan Identity
  const [formDivision, setFormDivision] = useState("GTA")
  const [formCommunity, setFormCommunity] = useState("")
  const [formBuilder, setFormBuilder] = useState("")
  const [formProductType, setFormProductType] = useState("")
  const [formFloorPlanName, setFormFloorPlanName] = useState("")
  const [formFloorPlanStatus, setFormFloorPlanStatus] = useState<"Active" | "Proposed" | "Sold Out" | "Not on VG">("Active")

  // Section B: Plan Specifications
  const [formSquareFeet, setFormSquareFeet] = useState("")
  const [formStories, setFormStories] = useState("")
  const [formBed, setFormBed] = useState("")
  const [formBath, setFormBath] = useState("")
  const [formGarageParking, setFormGarageParking] = useState("")
  const [formPrimaryBedroomFloor, setFormPrimaryBedroomFloor] = useState("")
  const [formModelHome, setFormModelHome] = useState("")
  const [formElevation, setFormElevation] = useState("")
  const [formCondoFreehold, setFormCondoFreehold] = useState("")
  const [formInteriorSF, setFormInteriorSF] = useState("")
  const [formExteriorSF, setFormExteriorSF] = useState("")
  const [formCondoAmenities, setFormCondoAmenities] = useState("")

  // Section C: Pricing
  const [formPrice, setFormPrice] = useState("")
  const [formBonus, setFormBonus] = useState("")
  const [formMaintenance, setFormMaintenance] = useState("")
  const [formCarryingCost, setFormCarryingCost] = useState("")

  // Section D: Historical Pricing
  const [formHistoricalPricing, setFormHistoricalPricing] = useState<HistoricalPricing[]>([])

  // Delete state
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)

  // Calculated fields
  const calcNetPrice = useMemo(() => {
    const price = parseFloat(formPrice) || 0
    const bonus = parseFloat(formBonus) || 0
    return price + bonus
  }, [formPrice, formBonus])

  const calcPricePerSqFt = useMemo(() => {
    const price = parseFloat(formPrice) || 0
    const sqft = parseFloat(formSquareFeet) || 0
    return sqft > 0 ? price / sqft : 0
  }, [formPrice, formSquareFeet])

  const calcNetPricePerSqFt = useMemo(() => {
    const sqft = parseFloat(formSquareFeet) || 0
    return sqft > 0 ? calcNetPrice / sqft : 0
  }, [calcNetPrice, formSquareFeet])

  // Filter dropdowns based on division
  const filteredCommunities = useMemo(() => {
    return communities.filter((c) => formDivision === "" || c.division === formDivision)
  }, [communities, formDivision])

  const filteredBuilders = useMemo(() => {
    return builders.filter((b) => formDivision === "" || b.division === formDivision)
  }, [builders, formDivision])

  const filteredProducts = useMemo(() => {
    return products.filter((p) => formDivision === "" || p.division === formDivision)
  }, [products, formDivision])

  const filtered = useMemo(() => {
    let data = [...floorPlans]
    if (search) {
      const s = search.toLowerCase()
      data = data.filter((fp) => fp.floorPlanName.toLowerCase().includes(s))
    }
    if (divisionFilter !== "all") {
      data = data.filter((fp) => fp.division === divisionFilter)
    }
    if (statusFilter !== "all") {
      data = data.filter((fp) => fp.floorPlanStatus === statusFilter)
    }
    if (communityFilter !== "all") {
      data = data.filter((fp) => fp.community === communityFilter)
    }
    if (builderFilter !== "all") {
      data = data.filter((fp) => fp.builder === builderFilter)
    }
    if (productFilter !== "all") {
      data = data.filter((fp) => fp.productType === productFilter)
    }
    data.sort((a, b) => {
      const aVal = a[sortKey] || ""
      const bVal = b[sortKey] || ""
      const cmp = String(aVal).localeCompare(String(bVal))
      return sortDir === "asc" ? cmp : -cmp
    })
    return data
  }, [floorPlans, search, divisionFilter, statusFilter, communityFilter, builderFilter, productFilter, sortKey, sortDir])

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

  const resetForm = () => {
    setFormDivision("GTA")
    setFormCommunity("")
    setFormBuilder("")
    setFormProductType("")
    setFormFloorPlanName("")
    setFormFloorPlanStatus("Active")
    setFormSquareFeet("")
    setFormStories("")
    setFormBed("")
    setFormBath("")
    setFormGarageParking("")
    setFormPrimaryBedroomFloor("")
    setFormModelHome("")
    setFormElevation("")
    setFormCondoFreehold("")
    setFormInteriorSF("")
    setFormExteriorSF("")
    setFormCondoAmenities("")
    setFormPrice("")
    setFormBonus("")
    setFormMaintenance("")
    setFormCarryingCost("")
    setFormHistoricalPricing([])
  }

  const openAdd = () => {
    setEditingId(null)
    resetForm()
    setPanelOpen(true)
  }

  const openEdit = (fp: FloorPlan) => {
    setEditingId(fp.id)
    setFormDivision(fp.division)
    setFormCommunity(fp.community)
    setFormBuilder(fp.builder)
    setFormProductType(fp.productType)
    setFormFloorPlanName(fp.floorPlanName)
    setFormFloorPlanStatus(fp.floorPlanStatus)
    setFormSquareFeet(String(fp.squareFeet || ""))
    setFormStories(String(fp.stories || ""))
    setFormBed(String(fp.bed || ""))
    setFormBath(String(fp.bath || ""))
    setFormGarageParking(fp.garageParking || "")
    setFormPrimaryBedroomFloor(fp.primaryBedroomFloor || "")
    setFormModelHome(fp.modelHome || "")
    setFormElevation(fp.elevation || "")
    setFormCondoFreehold(fp.condoFreehold || "")
    setFormInteriorSF(String(fp.interiorSF || ""))
    setFormExteriorSF(String(fp.exteriorSF || ""))
    setFormCondoAmenities(fp.condoAmenities || "")
    setFormPrice(String(fp.price || ""))
    setFormBonus(String(fp.bonus || ""))
    setFormMaintenance(String(fp.maintenance || ""))
    setFormCarryingCost(String(fp.carryingCost || ""))
    setFormHistoricalPricing(fp.historicalPricing || [])
    setPanelOpen(true)
  }

  const openDuplicate = (fp: FloorPlan) => {
    setEditingId(null)
    setFormDivision(fp.division)
    setFormCommunity(fp.community)
    setFormBuilder(fp.builder)
    setFormProductType(fp.productType)
    setFormFloorPlanName(`${fp.floorPlanName} (Copy)`)
    setFormFloorPlanStatus(fp.floorPlanStatus)
    setFormSquareFeet(String(fp.squareFeet || ""))
    setFormStories(String(fp.stories || ""))
    setFormBed(String(fp.bed || ""))
    setFormBath(String(fp.bath || ""))
    setFormGarageParking(fp.garageParking || "")
    setFormPrimaryBedroomFloor(fp.primaryBedroomFloor || "")
    setFormModelHome(fp.modelHome || "")
    setFormElevation(fp.elevation || "")
    setFormCondoFreehold(fp.condoFreehold || "")
    setFormInteriorSF(String(fp.interiorSF || ""))
    setFormExteriorSF(String(fp.exteriorSF || ""))
    setFormCondoAmenities(fp.condoAmenities || "")
    setFormPrice(String(fp.price || ""))
    setFormBonus(String(fp.bonus || ""))
    setFormMaintenance(String(fp.maintenance || ""))
    setFormCarryingCost(String(fp.carryingCost || ""))
    setFormHistoricalPricing(fp.historicalPricing || [])
    setPanelOpen(true)
  }

  const handleSave = useCallback(() => {
    if (!formFloorPlanName.trim()) {
      toast.error("Floor Plan name is required")
      return
    }
    if (!formDivision) {
      toast.error("Division is required")
      return
    }
    if (!formCommunity) {
      toast.error("Community is required")
      return
    }
    if (!formBuilder) {
      toast.error("Builder is required")
      return
    }
    if (!formProductType) {
      toast.error("Product Type is required")
      return
    }
    if (!formSquareFeet || parseFloat(formSquareFeet) <= 0) {
      toast.error("Valid Square Feet is required")
      return
    }
    if (!formElevation) {
      toast.error("Elevation is required")
      return
    }

    const now = new Date().toISOString()
    const floorPlanData = {
      division: formDivision,
      community: formCommunity,
      builder: formBuilder,
      productType: formProductType,
      floorPlanName: formFloorPlanName.trim(),
      floorPlanStatus: formFloorPlanStatus,
      squareFeet: parseFloat(formSquareFeet) || 0,
      stories: parseFloat(formStories) || 0,
      bed: parseFloat(formBed) || 0,
      bath: parseFloat(formBath) || 0,
      garageParking: formGarageParking,
      primaryBedroomFloor: formPrimaryBedroomFloor,
      modelHome: formModelHome,
      elevation: formElevation,
      condoFreehold: formCondoFreehold,
      interiorSF: parseFloat(formInteriorSF) || 0,
      exteriorSF: parseFloat(formExteriorSF) || 0,
      condoAmenities: formCondoAmenities,
      price: parseFloat(formPrice) || 0,
      bonus: parseFloat(formBonus) || 0,
      netPrice: calcNetPrice,
      pricePerSqFt: calcPricePerSqFt,
      netPricePerSqFt: calcNetPricePerSqFt,
      maintenance: parseFloat(formMaintenance) || 0,
      carryingCost: parseFloat(formCarryingCost) || 0,
      historicalPricing: formHistoricalPricing,
    }

    if (editingId) {
      updateFloorPlan(editingId, floorPlanData)
      toast.success("Floor Plan updated successfully")
    } else {
      addFloorPlan({
        id: crypto.randomUUID(),
        ...floorPlanData,
        createdAt: now,
        updatedAt: now,
      })
      toast.success("Floor Plan added successfully")
    }
    setPanelOpen(false)
  }, [
    editingId,
    formDivision,
    formCommunity,
    formBuilder,
    formProductType,
    formFloorPlanName,
    formFloorPlanStatus,
    formSquareFeet,
    formStories,
    formBed,
    formBath,
    formGarageParking,
    formPrimaryBedroomFloor,
    formModelHome,
    formElevation,
    formCondoFreehold,
    formInteriorSF,
    formExteriorSF,
    formCondoAmenities,
    formPrice,
    formBonus,
    formMaintenance,
    formCarryingCost,
    formHistoricalPricing,
    calcNetPrice,
    calcPricePerSqFt,
    calcNetPricePerSqFt,
    addFloorPlan,
    updateFloorPlan,
  ])

  const handleDelete = useCallback(() => {
    if (deleteId) {
      deleteFloorPlan(deleteId)
      setDeleteId(null)
      toast.success("Floor Plan deleted")
    }
  }, [deleteId, deleteFloorPlan])

  const handleBulkDelete = useCallback(() => {
    deleteFloorPlans(Array.from(selected))
    setSelected(new Set())
    setBulkDeleteOpen(false)
    toast.success(`${selected.size} floor plans deleted`)
  }, [selected, deleteFloorPlans])

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
      setSelected(new Set(paginated.map((fp) => fp.id)))
    }
  }

  const addHistoricalPricing = () => {
    setFormHistoricalPricing([...formHistoricalPricing, { month: "", year: "", basePrice: 0 }])
  }

  const removeHistoricalPricing = (index: number) => {
    setFormHistoricalPricing(formHistoricalPricing.filter((_, i) => i !== index))
  }

  const updateHistoricalPricing = (index: number, field: keyof HistoricalPricing, value: string | number) => {
    const updated = [...formHistoricalPricing]
    updated[index] = { ...updated[index], [field]: value }
    setFormHistoricalPricing(updated)
  }

  // Get display names
  const getBuilderName = (id: string) => builders.find((b) => b.id === id)?.builderName || id
  const getProductName = (id: string) => products.find((p) => p.id === id)?.productName || id
  const getCommunityName = (id: string) => communities.find((c) => c.id === id)?.communityName || id

  return (
    <div className="space-y-4">
      <DataTableToolbar
        search={search}
        onSearchChange={(v) => { setSearch(v); setPage(1) }}
        onAdd={openAdd}
        entityName="Floor Plan"
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
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1) }}>
          <SelectTrigger className="w-[160px] bg-card text-foreground">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Proposed">Proposed</SelectItem>
            <SelectItem value="Sold Out">Sold Out</SelectItem>
            <SelectItem value="Not on VG">Not on VG</SelectItem>
          </SelectContent>
        </Select>
        <Select value={communityFilter} onValueChange={(v) => { setCommunityFilter(v); setPage(1) }}>
          <SelectTrigger className="w-[200px] bg-card text-foreground">
            <SelectValue placeholder="Community" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Communities</SelectItem>
            {communities.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.communityName}</SelectItem>
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
                <button onClick={() => toggleSort("floorPlanName")} className="flex items-center gap-1 font-medium">
                  Floor Plan Name <ArrowUpDown className="h-3.5 w-3.5" />
                </button>
              </TableHead>
              <TableHead>
                <button onClick={() => toggleSort("builder")} className="flex items-center gap-1 font-medium">
                  Builder <ArrowUpDown className="h-3.5 w-3.5" />
                </button>
              </TableHead>
              <TableHead>
                <button onClick={() => toggleSort("productType")} className="flex items-center gap-1 font-medium">
                  Product <ArrowUpDown className="h-3.5 w-3.5" />
                </button>
              </TableHead>
              <TableHead>
                <button onClick={() => toggleSort("community")} className="flex items-center gap-1 font-medium">
                  Community <ArrowUpDown className="h-3.5 w-3.5" />
                </button>
              </TableHead>
              <TableHead>
                <button onClick={() => toggleSort("floorPlanStatus")} className="flex items-center gap-1 font-medium">
                  Status <ArrowUpDown className="h-3.5 w-3.5" />
                </button>
              </TableHead>
              <TableHead className="text-right">
                <button onClick={() => toggleSort("squareFeet")} className="flex items-center gap-1 font-medium ml-auto">
                  Sq Ft <ArrowUpDown className="h-3.5 w-3.5" />
                </button>
              </TableHead>
              <TableHead className="text-center">Bed</TableHead>
              <TableHead className="text-center">Bath</TableHead>
              <TableHead className="text-right">
                <button onClick={() => toggleSort("price")} className="flex items-center gap-1 font-medium ml-auto">
                  Price <ArrowUpDown className="h-3.5 w-3.5" />
                </button>
              </TableHead>
              <TableHead className="text-right">Net Price</TableHead>
              <TableHead className="text-right">$/SF</TableHead>
              <TableHead className="w-28 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={13} className="h-32 text-center text-muted-foreground">
                  No floor plans found. Click &quot;Add Floor Plan&quot; to create one.
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((fp) => (
                <TableRow key={fp.id} data-state={selected.has(fp.id) ? "selected" : undefined}>
                  <TableCell>
                    <Checkbox
                      checked={selected.has(fp.id)}
                      onCheckedChange={() => toggleSelect(fp.id)}
                    />
                  </TableCell>
                  <TableCell className="font-medium text-foreground">{fp.floorPlanName}</TableCell>
                  <TableCell className="text-muted-foreground">{getBuilderName(fp.builder)}</TableCell>
                  <TableCell className="text-muted-foreground">{getProductName(fp.productType)}</TableCell>
                  <TableCell className="text-muted-foreground">{getCommunityName(fp.community)}</TableCell>
                  <TableCell>
                    <StatusBadge status={fp.floorPlanStatus} />
                  </TableCell>
                  <TableCell className="text-right text-foreground">{fp.squareFeet?.toLocaleString()}</TableCell>
                  <TableCell className="text-center text-muted-foreground">{fp.bed || "-"}</TableCell>
                  <TableCell className="text-center text-muted-foreground">{fp.bath || "-"}</TableCell>
                  <TableCell className="text-right text-foreground">{formatCurrency(fp.price)}</TableCell>
                  <TableCell className="text-right text-foreground font-medium">{formatCurrency(fp.netPrice)}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{formatCurrency(fp.pricePerSqFt)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => openEdit(fp)}>
                        <Pencil className="h-3.5 w-3.5" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => openDuplicate(fp)}>
                        <Copy className="h-3.5 w-3.5" />
                        <span className="sr-only">Duplicate</span>
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => setDeleteId(fp.id)}>
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
        title={editingId ? "Edit Floor Plan" : "Add Floor Plan"}
        description={editingId ? "Update floor plan details" : "Create a new floor plan record"}
        onSave={handleSave}
      >
        <div className="space-y-6">
          {/* Section A: Plan Identity */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground border-b pb-2">Plan Identity</h3>
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
              <Label htmlFor="community" className="text-foreground">
                Community <span className="text-destructive">*</span>
              </Label>
              <Select value={formCommunity} onValueChange={setFormCommunity}>
                <SelectTrigger className="bg-background text-foreground">
                  <SelectValue placeholder="Select community" />
                </SelectTrigger>
                <SelectContent>
                  {filteredCommunities.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.communityName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="builder" className="text-foreground">
                Builder <span className="text-destructive">*</span>
              </Label>
              <Select value={formBuilder} onValueChange={setFormBuilder}>
                <SelectTrigger className="bg-background text-foreground">
                  <SelectValue placeholder="Select builder" />
                </SelectTrigger>
                <SelectContent>
                  {filteredBuilders.map((b) => (
                    <SelectItem key={b.id} value={b.id}>{b.builderName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="productType" className="text-foreground">
                Product Type <span className="text-destructive">*</span>
              </Label>
              <Select value={formProductType} onValueChange={setFormProductType}>
                <SelectTrigger className="bg-background text-foreground">
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent>
                  {filteredProducts.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.productName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="floorPlanName" className="text-foreground">
                Floor Plan Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="floorPlanName"
                value={formFloorPlanName}
                onChange={(e) => setFormFloorPlanName(e.target.value)}
                placeholder="e.g., Aldgate End"
                className="bg-background text-foreground"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="floorPlanStatus" className="text-foreground">
                Status <span className="text-destructive">*</span>
              </Label>
              <Select value={formFloorPlanStatus} onValueChange={(v) => setFormFloorPlanStatus(v as any)}>
                <SelectTrigger className="bg-background text-foreground">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Proposed">Proposed</SelectItem>
                  <SelectItem value="Sold Out">Sold Out</SelectItem>
                  <SelectItem value="Not on VG">Not on VG</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Section B: Plan Specifications */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground border-b pb-2">Plan Specifications</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="squareFeet" className="text-foreground">
                  Square Feet <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="squareFeet"
                  type="number"
                  value={formSquareFeet}
                  onChange={(e) => setFormSquareFeet(e.target.value)}
                  placeholder="1343"
                  className="bg-background text-foreground"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="stories" className="text-foreground">Stories</Label>
                <Input
                  id="stories"
                  type="number"
                  value={formStories}
                  onChange={(e) => setFormStories(e.target.value)}
                  placeholder="3"
                  className="bg-background text-foreground"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="bed" className="text-foreground">Bedrooms</Label>
                <Input
                  id="bed"
                  type="number"
                  value={formBed}
                  onChange={(e) => setFormBed(e.target.value)}
                  placeholder="3"
                  className="bg-background text-foreground"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="bath" className="text-foreground">Bathrooms</Label>
                <Input
                  id="bath"
                  type="number"
                  step="0.5"
                  value={formBath}
                  onChange={(e) => setFormBath(e.target.value)}
                  placeholder="2.5"
                  className="bg-background text-foreground"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="garageParking" className="text-foreground">Garage/Parking</Label>
              <Input
                id="garageParking"
                value={formGarageParking}
                onChange={(e) => setFormGarageParking(e.target.value)}
                placeholder="1 Car Garage & 1 Driveway"
                className="bg-background text-foreground"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="primaryBedroomFloor" className="text-foreground">Primary Bedroom Floor</Label>
                <Select value={formPrimaryBedroomFloor} onValueChange={setFormPrimaryBedroomFloor}>
                  <SelectTrigger className="bg-background text-foreground">
                    <SelectValue placeholder="Select floor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1st">1st</SelectItem>
                    <SelectItem value="2nd">2nd</SelectItem>
                    <SelectItem value="3rd">3rd</SelectItem>
                    <SelectItem value="Main">Main</SelectItem>
                    <SelectItem value="Upper">Upper</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="modelHome" className="text-foreground">Model Home</Label>
                <Select value={formModelHome} onValueChange={setFormModelHome}>
                  <SelectTrigger className="bg-background text-foreground">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Yes">Yes</SelectItem>
                    <SelectItem value="No">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="elevation" className="text-foreground">
                Elevation <span className="text-destructive">*</span>
              </Label>
              <Select value={formElevation} onValueChange={setFormElevation}>
                <SelectTrigger className="bg-background text-foreground">
                  <SelectValue placeholder="Select elevation" />
                </SelectTrigger>
                <SelectContent>
                  {elevations.map((e) => (
                    <SelectItem key={e} value={e}>{e}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="condoFreehold" className="text-foreground">Condo/Freehold</Label>
              <Select value={formCondoFreehold} onValueChange={setFormCondoFreehold}>
                <SelectTrigger className="bg-background text-foreground">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Condo">Condo</SelectItem>
                  <SelectItem value="Freehold">Freehold</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="interiorSF" className="text-foreground">Interior SF</Label>
                <Input
                  id="interiorSF"
                  type="number"
                  value={formInteriorSF}
                  onChange={(e) => setFormInteriorSF(e.target.value)}
                  placeholder="1200"
                  className="bg-background text-foreground"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="exteriorSF" className="text-foreground">Exterior SF</Label>
                <Input
                  id="exteriorSF"
                  type="number"
                  value={formExteriorSF}
                  onChange={(e) => setFormExteriorSF(e.target.value)}
                  placeholder="143"
                  className="bg-background text-foreground"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="condoAmenities" className="text-foreground">Condo Amenities</Label>
              <Select value={formCondoAmenities} onValueChange={setFormCondoAmenities}>
                <SelectTrigger className="bg-background text-foreground">
                  <SelectValue placeholder="Select amenities" />
                </SelectTrigger>
                <SelectContent>
                  {condoAmenitiesList.map((a) => (
                    <SelectItem key={a} value={a}>{a}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Section C: Pricing */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground border-b pb-2">Pricing</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="price" className="text-foreground">List Price</Label>
                <Input
                  id="price"
                  type="number"
                  value={formPrice}
                  onChange={(e) => setFormPrice(e.target.value)}
                  placeholder="771990"
                  className="bg-background text-foreground"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="bonus" className="text-foreground">Bonus/Incentive</Label>
                <Input
                  id="bonus"
                  type="number"
                  value={formBonus}
                  onChange={(e) => setFormBonus(e.target.value)}
                  placeholder="-17424"
                  className="bg-background text-foreground"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-foreground">Net Price (Calculated)</Label>
                <div className="px-3 py-2 rounded-md bg-blue-50 dark:bg-blue-950 text-foreground font-medium">
                  {formatCurrency(calcNetPrice)}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-foreground">Price/SF (Calculated)</Label>
                <div className="px-3 py-2 rounded-md bg-blue-50 dark:bg-blue-950 text-foreground font-medium">
                  {formatCurrency(calcPricePerSqFt)}
                </div>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-foreground">Net Price/SF (Calculated)</Label>
              <div className="px-3 py-2 rounded-md bg-blue-50 dark:bg-blue-950 text-foreground font-medium">
                {formatCurrency(calcNetPricePerSqFt)}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="maintenance" className="text-foreground">Maintenance Fee</Label>
                <Input
                  id="maintenance"
                  type="number"
                  value={formMaintenance}
                  onChange={(e) => setFormMaintenance(e.target.value)}
                  placeholder="106"
                  className="bg-background text-foreground"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="carryingCost" className="text-foreground">Carrying Cost</Label>
                <Input
                  id="carryingCost"
                  type="number"
                  value={formCarryingCost}
                  onChange={(e) => setFormCarryingCost(e.target.value)}
                  placeholder="3538.78"
                  className="bg-background text-foreground"
                />
              </div>
            </div>
          </div>

          {/* Section D: Historical Pricing */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-sm font-semibold text-foreground">Historical Base Pricing</h3>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={addHistoricalPricing}
                className="h-7 text-xs"
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                Add Price
              </Button>
            </div>
            {formHistoricalPricing.length === 0 ? (
              <p className="text-xs text-muted-foreground">No historical pricing records. Click &quot;Add Price&quot; to add one.</p>
            ) : (
              <div className="space-y-2">
                {formHistoricalPricing.map((hp, idx) => (
                  <div key={idx} className="flex gap-2 items-start p-2 rounded-md bg-muted/30">
                    <div className="flex-1 grid grid-cols-3 gap-2">
                      <Input
                        placeholder="Month"
                        value={hp.month}
                        onChange={(e) => updateHistoricalPricing(idx, "month", e.target.value)}
                        className="bg-background text-foreground text-xs"
                      />
                      <Input
                        placeholder="Year"
                        value={hp.year}
                        onChange={(e) => updateHistoricalPricing(idx, "year", e.target.value)}
                        className="bg-background text-foreground text-xs"
                      />
                      <Input
                        type="number"
                        placeholder="Base Price"
                        value={hp.basePrice || ""}
                        onChange={(e) => updateHistoricalPricing(idx, "basePrice", parseFloat(e.target.value) || 0)}
                        className="bg-background text-foreground text-xs"
                      />
                    </div>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => removeHistoricalPricing(idx)}
                      className="h-7 w-7 text-destructive"
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
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
        title={`Delete ${selected.size} floor plans?`}
        description="This action cannot be undone. All selected floor plans will be permanently removed."
      />
    </div>
  )
}
