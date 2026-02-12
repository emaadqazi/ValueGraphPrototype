"use client"

import { useState, useMemo } from "react"
import { useStore } from "@/lib/store"
import { formatCurrency, formatDate } from "@/lib/format"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { FileSpreadsheet, FileText, FileDown, Download } from "lucide-react"

type EntityType = "builders" | "products" | "communities" | "floorPlans" | "features"
type ExportFormat = "xlsx" | "csv" | "pdf"

export default function ExportPage() {
  const builders = useStore((s) => s.builders)
  const products = useStore((s) => s.products)
  const communities = useStore((s) => s.communities)
  const floorPlans = useStore((s) => s.floorPlans)
  const features = useStore((s) => s.features)
  const lookupValues = useStore((s) => s.lookupValues)

  const [selectedEntity, setSelectedEntity] = useState<EntityType>("builders")
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>("xlsx")
  const [divisionFilter, setDivisionFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [communityFilter, setCommunityFilter] = useState("all")

  // Column selection for each entity
  const [selectedColumns, setSelectedColumns] = useState<Set<string>>(new Set())

  const divisions = lookupValues.filter((lv) => lv.lookupCategory === "Division").map((lv) => lv.lookupValue)

  const entityColumns: Record<EntityType, string[]> = {
    builders: ["builderName", "division", "createdAt"],
    products: ["productName", "productType", "division", "condoType", "createdAt"],
    communities: ["communityName", "division", "city", "address", "status", "totalLots", "totalSold", "createdAt"],
    floorPlans: ["floorPlanName", "builder", "productType", "community", "squareFeet", "bed", "bath", "price", "netPrice", "pricePerSqFt", "floorPlanStatus"],
    features: ["featureName", "featureCategory", "division", "retailPrice", "createdAt"],
  }

  const entityData = useMemo(() => {
    switch (selectedEntity) {
      case "builders": return builders
      case "products": return products
      case "communities": return communities
      case "floorPlans": return floorPlans
      case "features": return features
      default: return []
    }
  }, [selectedEntity, builders, products, communities, floorPlans, features])

  const filteredData = useMemo(() => {
    let data = [...entityData]

    if (divisionFilter !== "all") {
      data = data.filter((item: any) => item.division === divisionFilter)
    }

    if (selectedEntity === "communities" && statusFilter !== "all") {
      data = data.filter((item: any) => item.status === statusFilter)
    }

    if (selectedEntity === "floorPlans") {
      if (statusFilter !== "all") {
        data = data.filter((item: any) => item.floorPlanStatus === statusFilter)
      }
      if (communityFilter !== "all") {
        data = data.filter((item: any) => item.community === communityFilter)
      }
    }

    return data
  }, [entityData, divisionFilter, statusFilter, communityFilter, selectedEntity])

  const previewData = useMemo(() => filteredData.slice(0, 5), [filteredData])

  const columns = entityColumns[selectedEntity]

  // Initialize columns when entity changes
  useMemo(() => {
    setSelectedColumns(new Set(columns))
  }, [selectedEntity])

  const toggleColumn = (column: string) => {
    setSelectedColumns((prev) => {
      const next = new Set(prev)
      if (next.has(column)) {
        next.delete(column)
      } else {
        next.add(column)
      }
      return next
    })
  }

  const toggleAllColumns = () => {
    if (selectedColumns.size === columns.length) {
      setSelectedColumns(new Set())
    } else {
      setSelectedColumns(new Set(columns))
    }
  }

  const handleExport = () => {
    if (selectedColumns.size === 0) {
      toast.error("Please select at least one column to export")
      return
    }

    // Simulate export
    toast.success(`Exporting ${filteredData.length} records as ${selectedFormat.toUpperCase()}...`)

    // In a real implementation, this would generate and download the file
    setTimeout(() => {
      toast.success(`Export complete! ${filteredData.length} records downloaded.`)
    }, 1500)
  }

  const formatCellValue = (column: string, value: any) => {
    if (value === null || value === undefined) return "-"

    if (column.includes("price") || column.includes("Price") || column === "maintenance" || column === "carryingCost") {
      return formatCurrency(value)
    }

    if (column.includes("createdAt") || column.includes("updatedAt") || column.includes("date")) {
      return formatDate(value)
    }

    if (column === "builder" || column === "productType" || column === "community") {
      // In real implementation, lookup the actual names
      return value
    }

    return String(value)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Export Data</h2>
        <p className="text-sm text-muted-foreground">
          Export entity data in various formats with customizable filters and column selection
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel: Export Configuration */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Export Configuration</CardTitle>
              <CardDescription>Select entity, filters, and format</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="entity" className="text-foreground">Entity Type</Label>
                <Select value={selectedEntity} onValueChange={(v) => setSelectedEntity(v as EntityType)}>
                  <SelectTrigger className="bg-background text-foreground">
                    <SelectValue placeholder="Select entity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="builders">Builders ({builders.length})</SelectItem>
                    <SelectItem value="products">Products ({products.length})</SelectItem>
                    <SelectItem value="communities">Communities ({communities.length})</SelectItem>
                    <SelectItem value="floorPlans">Floor Plans ({floorPlans.length})</SelectItem>
                    <SelectItem value="features">Features ({features.length})</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="division" className="text-foreground">Division Filter</Label>
                <Select value={divisionFilter} onValueChange={setDivisionFilter}>
                  <SelectTrigger className="bg-background text-foreground">
                    <SelectValue placeholder="All divisions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Divisions</SelectItem>
                    {divisions.map((d) => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {(selectedEntity === "communities" || selectedEntity === "floorPlans") && (
                <div className="space-y-2">
                  <Label htmlFor="status" className="text-foreground">Status Filter</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="bg-background text-foreground">
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Proposed">Proposed</SelectItem>
                      <SelectItem value="Sold Out">Sold Out</SelectItem>
                      <SelectItem value="Not on VG">Not on VG</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {selectedEntity === "floorPlans" && (
                <div className="space-y-2">
                  <Label htmlFor="community" className="text-foreground">Community Filter</Label>
                  <Select value={communityFilter} onValueChange={setCommunityFilter}>
                    <SelectTrigger className="bg-background text-foreground">
                      <SelectValue placeholder="All communities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Communities</SelectItem>
                      {communities.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.communityName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="pt-4 border-t">
                <p className="text-sm font-medium text-foreground mb-3">Export Format</p>
                <div className="grid grid-cols-3 gap-2">
                  <Card
                    className={`cursor-pointer transition-all ${
                      selectedFormat === "xlsx"
                        ? "ring-2 ring-[#0066b3] bg-blue-50 dark:bg-blue-950"
                        : "hover:bg-muted/50"
                    }`}
                    onClick={() => setSelectedFormat("xlsx")}
                  >
                    <CardContent className="p-4 flex flex-col items-center gap-2">
                      <FileSpreadsheet className={`h-8 w-8 ${selectedFormat === "xlsx" ? "text-[#0066b3]" : "text-muted-foreground"}`} />
                      <p className="text-xs font-medium">Excel</p>
                    </CardContent>
                  </Card>
                  <Card
                    className={`cursor-pointer transition-all ${
                      selectedFormat === "csv"
                        ? "ring-2 ring-[#0066b3] bg-blue-50 dark:bg-blue-950"
                        : "hover:bg-muted/50"
                    }`}
                    onClick={() => setSelectedFormat("csv")}
                  >
                    <CardContent className="p-4 flex flex-col items-center gap-2">
                      <FileText className={`h-8 w-8 ${selectedFormat === "csv" ? "text-[#0066b3]" : "text-muted-foreground"}`} />
                      <p className="text-xs font-medium">CSV</p>
                    </CardContent>
                  </Card>
                  <Card
                    className={`cursor-pointer transition-all ${
                      selectedFormat === "pdf"
                        ? "ring-2 ring-[#0066b3] bg-blue-50 dark:bg-blue-950"
                        : "hover:bg-muted/50"
                    }`}
                    onClick={() => setSelectedFormat("pdf")}
                  >
                    <CardContent className="p-4 flex flex-col items-center gap-2">
                      <FileDown className={`h-8 w-8 ${selectedFormat === "pdf" ? "text-[#0066b3]" : "text-muted-foreground"}`} />
                      <p className="text-xs font-medium">PDF</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Column Selection</CardTitle>
              <CardDescription>Choose which columns to include</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center space-x-2 pb-2 border-b">
                <Checkbox
                  id="select-all"
                  checked={selectedColumns.size === columns.length}
                  onCheckedChange={toggleAllColumns}
                />
                <Label
                  htmlFor="select-all"
                  className="text-sm font-medium cursor-pointer"
                >
                  Select All
                </Label>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {columns.map((col) => (
                  <div key={col} className="flex items-center space-x-2">
                    <Checkbox
                      id={col}
                      checked={selectedColumns.has(col)}
                      onCheckedChange={() => toggleColumn(col)}
                    />
                    <Label
                      htmlFor={col}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {col}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel: Preview */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Export Summary</CardTitle>
              <CardDescription>
                Exporting <span className="font-semibold text-foreground">{filteredData.length}</span> of{" "}
                <span className="font-semibold text-foreground">{entityData.length}</span> total records
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Preview</CardTitle>
              <CardDescription>First 5 rows of export data</CardDescription>
            </CardHeader>
            <CardContent>
              {previewData.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No data to preview with current filters
                </p>
              ) : (
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {Array.from(selectedColumns).map((col) => (
                          <TableHead key={col} className="font-medium">
                            {col}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {previewData.map((row: any, idx) => (
                        <TableRow key={idx}>
                          {Array.from(selectedColumns).map((col) => (
                            <TableCell key={col} className="text-sm">
                              {formatCellValue(col, row[col])}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button
              onClick={handleExport}
              size="lg"
              className="bg-[#f0932b] hover:bg-[#f0932b]/90"
              disabled={selectedColumns.size === 0 || filteredData.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Export {filteredData.length} Records
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
