"use client"

import { useState, useCallback } from "react"
import { useStore } from "@/lib/store"
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, XCircle, AlertCircle, Upload, ArrowLeft, ArrowRight, FileSpreadsheet, FileText } from "lucide-react"

type EntityType = "builders" | "products" | "communities" | "floorPlans" | "features"
type ImportMode = "add" | "update"
type Step = 1 | 2 | 3 | 4

interface FieldMapping {
  source: string
  target: string
}

interface ValidationIssue {
  row: number
  field: string
  message: string
  severity: "error" | "warning"
}

export default function ImportPage() {
  const lookupValues = useStore((s) => s.lookupValues)
  const [currentStep, setCurrentStep] = useState<Step>(1)
  const [selectedEntity, setSelectedEntity] = useState<EntityType>("builders")
  const [selectedDivision, setSelectedDivision] = useState("GTA")
  const [importMode, setImportMode] = useState<ImportMode>("add")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  // Step 2: Field mapping
  const [fieldMappings, setFieldMappings] = useState<FieldMapping[]>([])
  const [sourceColumns, setSourceColumns] = useState<string[]>([])

  // Step 3: Validation
  const [validationIssues, setValidationIssues] = useState<ValidationIssue[]>([])
  const [validRecords, setValidRecords] = useState(0)

  // Step 4: Import progress
  const [importProgress, setImportProgress] = useState(0)
  const [importComplete, setImportComplete] = useState(false)
  const [importedCount, setImportedCount] = useState(0)
  const [skippedCount, setSkippedCount] = useState(0)
  const [errorCount, setErrorCount] = useState(0)

  const divisions = lookupValues.filter((lv) => lv.lookupCategory === "Division").map((lv) => lv.lookupValue)

  const entityFieldMap: Record<EntityType, string[]> = {
    builders: ["builderName", "division"],
    products: ["productName", "productType", "division", "condoType"],
    communities: ["communityName", "division", "address", "city", "postalCode", "status", "totalLots", "totalSold"],
    floorPlans: ["floorPlanName", "division", "community", "builder", "productType", "squareFeet", "bed", "bath", "price"],
    features: ["featureName", "division", "featureCategory", "retailPrice"],
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleFileSelect = (file: File) => {
    const validExtensions = [".xlsx", ".xls", ".csv"]
    const fileExtension = file.name.substring(file.name.lastIndexOf("."))

    if (!validExtensions.includes(fileExtension.toLowerCase())) {
      toast.error("Invalid file format. Please upload .xlsx, .xls, or .csv files.")
      return
    }

    setSelectedFile(file)
    // Simulate parsing columns from the file
    setSourceColumns(["Column 1", "Column 2", "Column 3", "Name", "Type", "Status"])
    toast.success(`File "${file.name}" uploaded successfully`)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const goToNextStep = () => {
    if (currentStep === 1) {
      if (!selectedFile) {
        toast.error("Please upload a file to continue")
        return
      }
      // Initialize field mappings
      const targetFields = entityFieldMap[selectedEntity]
      setFieldMappings(targetFields.map((target) => ({ source: "", target })))
    }

    if (currentStep === 2) {
      // Simulate validation
      const mockIssues: ValidationIssue[] = [
        { row: 5, field: "division", message: "Division value 'XYZ' is not valid", severity: "error" },
        { row: 12, field: "postalCode", message: "Postal code format appears incorrect", severity: "warning" },
      ]
      setValidationIssues(mockIssues)
      setValidRecords(18)
    }

    if (currentStep === 3) {
      // Start import simulation
      simulateImport()
    }

    if (currentStep < 4) {
      setCurrentStep((currentStep + 1) as Step)
    }
  }

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as Step)
    }
  }

  const simulateImport = () => {
    setImportProgress(0)
    setImportComplete(false)

    // Simulate progress
    const interval = setInterval(() => {
      setImportProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setImportComplete(true)
          setImportedCount(18)
          setSkippedCount(0)
          setErrorCount(2)
          toast.success("Import completed successfully!")
          return 100
        }
        return prev + 10
      })
    }, 200)
  }

  const updateFieldMapping = (target: string, source: string) => {
    setFieldMappings(fieldMappings.map((fm) =>
      fm.target === target ? { ...fm, source } : fm
    ))
  }

  const resetWizard = () => {
    setCurrentStep(1)
    setSelectedFile(null)
    setFieldMappings([])
    setSourceColumns([])
    setValidationIssues([])
    setValidRecords(0)
    setImportProgress(0)
    setImportComplete(false)
    setImportedCount(0)
    setSkippedCount(0)
    setErrorCount(0)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Import Data</h2>
        <p className="text-sm text-muted-foreground">
          Import records from Excel or CSV files in 4 easy steps
        </p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center justify-between max-w-3xl mx-auto">
        {[1, 2, 3, 4].map((step, idx) => (
          <div key={step} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                  currentStep >= step
                    ? "bg-[#0066b3] text-white"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {step}
              </div>
              <p className={`text-xs mt-2 ${currentStep >= step ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                {step === 1 && "Upload"}
                {step === 2 && "Map Fields"}
                {step === 3 && "Validate"}
                {step === 4 && "Import"}
              </p>
            </div>
            {idx < 3 && (
              <div
                className={`h-1 flex-1 transition-colors ${
                  currentStep > step ? "bg-[#0066b3]" : "bg-muted"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle>
            {currentStep === 1 && "Step 1: Upload File"}
            {currentStep === 2 && "Step 2: Map Fields"}
            {currentStep === 3 && "Step 3: Validate Data"}
            {currentStep === 4 && "Step 4: Import"}
          </CardTitle>
          <CardDescription>
            {currentStep === 1 && "Select entity type, division, and upload your data file"}
            {currentStep === 2 && "Map source columns to target fields"}
            {currentStep === 3 && "Review validation results before importing"}
            {currentStep === 4 && "Import in progress..."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1: Upload */}
          {currentStep === 1 && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="entity" className="text-foreground">Entity Type *</Label>
                  <Select value={selectedEntity} onValueChange={(v) => setSelectedEntity(v as EntityType)}>
                    <SelectTrigger className="bg-background text-foreground">
                      <SelectValue placeholder="Select entity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="builders">Builders</SelectItem>
                      <SelectItem value="products">Products</SelectItem>
                      <SelectItem value="communities">Communities</SelectItem>
                      <SelectItem value="floorPlans">Floor Plans</SelectItem>
                      <SelectItem value="features">Features</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="division" className="text-foreground">Division *</Label>
                  <Select value={selectedDivision} onValueChange={setSelectedDivision}>
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
              </div>

              <div className="space-y-2">
                <Label className="text-foreground">Import Mode *</Label>
                <RadioGroup value={importMode} onValueChange={(v) => setImportMode(v as ImportMode)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="add" id="add" />
                    <Label htmlFor="add" className="font-normal cursor-pointer">
                      Add new records (create new entries)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="update" id="update" />
                    <Label htmlFor="update" className="font-normal cursor-pointer">
                      Update existing records (match and update by ID or name)
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label className="text-foreground">Upload File *</Label>
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    isDragging
                      ? "border-[#0066b3] bg-blue-50/50"
                      : "border-border hover:border-[#0066b3] bg-muted/20"
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  {selectedFile ? (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-foreground flex items-center justify-center gap-2">
                        <FileSpreadsheet className="h-4 w-4 text-[#0066b3]" />
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {(selectedFile.size / 1024).toFixed(2)} KB
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedFile(null)}
                        className="text-destructive"
                      >
                        Remove file
                      </Button>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm text-foreground mb-2">
                        Drag and drop your file here, or click to browse
                      </p>
                      <p className="text-xs text-muted-foreground mb-4">
                        Accepted formats: .xlsx, .xls, .csv
                      </p>
                      <input
                        type="file"
                        id="file-upload"
                        className="hidden"
                        accept=".xlsx,.xls,.csv"
                        onChange={handleFileInputChange}
                      />
                      <Button variant="outline" onClick={() => document.getElementById("file-upload")?.click()}>
                        Browse Files
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Step 2: Map Fields */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Map columns from your source file to the target fields in the database. Required fields are marked with *.
              </p>
              <div className="grid gap-3">
                {fieldMappings.map((mapping) => (
                  <div key={mapping.target} className="grid grid-cols-2 gap-4 items-center p-3 rounded-md bg-muted/30">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#0066b3]" />
                      <Label className="text-foreground font-medium">{mapping.target}</Label>
                    </div>
                    <Select value={mapping.source} onValueChange={(v) => updateFieldMapping(mapping.target, v)}>
                      <SelectTrigger className="bg-background text-foreground">
                        <SelectValue placeholder="Select source column" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">-- Not Mapped --</SelectItem>
                        {sourceColumns.map((col) => (
                          <SelectItem key={col} value={col}>{col}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Validate */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <Card className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2 text-green-700 dark:text-green-300">
                      <CheckCircle2 className="h-4 w-4" />
                      Valid Records
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-green-700 dark:text-green-300">{validRecords}</p>
                  </CardContent>
                </Card>

                <Card className="bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2 text-yellow-700 dark:text-yellow-300">
                      <AlertCircle className="h-4 w-4" />
                      Warnings
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                      {validationIssues.filter((i) => i.severity === "warning").length}
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2 text-red-700 dark:text-red-300">
                      <XCircle className="h-4 w-4" />
                      Errors
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-red-700 dark:text-red-300">
                      {validationIssues.filter((i) => i.severity === "error").length}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {validationIssues.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-foreground">Validation Issues</h4>
                  <div className="max-h-64 overflow-y-auto space-y-2 border rounded-md p-3 bg-muted/20">
                    {validationIssues.map((issue, idx) => (
                      <div
                        key={idx}
                        className={`flex items-start gap-3 p-2 rounded-md ${
                          issue.severity === "error"
                            ? "bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800"
                            : "bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800"
                        }`}
                      >
                        {issue.severity === "error" ? (
                          <XCircle className="h-4 w-4 text-red-600 mt-0.5" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                        )}
                        <div className="flex-1 text-xs">
                          <p className="font-medium">Row {issue.row} - {issue.field}</p>
                          <p className="text-muted-foreground">{issue.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Import */}
          {currentStep === 4 && (
            <div className="space-y-6">
              {!importComplete ? (
                <>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-foreground">Importing records...</span>
                      <span className="text-muted-foreground">{importProgress}%</span>
                    </div>
                    <Progress value={importProgress} className="h-2" />
                  </div>
                </>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-center py-6">
                    <CheckCircle2 className="h-16 w-16 text-green-600" />
                  </div>
                  <div className="text-center space-y-2">
                    <h3 className="text-xl font-semibold text-foreground">Import Complete!</h3>
                    <p className="text-sm text-muted-foreground">Your data has been successfully imported.</p>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Imported</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold text-green-600">{importedCount}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Skipped</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold text-yellow-600">{skippedCount}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Errors</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold text-red-600">{errorCount}</p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="flex gap-3 justify-center">
                    <Button onClick={() => {/* Navigate to entity list */}}>
                      View Imported Records
                    </Button>
                    <Button variant="outline" onClick={resetWizard}>
                      Import More Data
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      {currentStep < 4 && (
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={goToPreviousStep}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          <Button
            onClick={goToNextStep}
            className="bg-[#f0932b] hover:bg-[#f0932b]/90"
          >
            {currentStep === 3 ? "Start Import" : "Next"}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  )
}
