"use client"

import { useState, useMemo, useCallback } from "react"
import { useStore } from "@/lib/store"
import type { LookupValue } from "@/lib/types"
import { toast } from "sonner"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { EntityPanel } from "@/components/entity-panel"
import { DeleteDialog } from "@/components/delete-dialog"

export default function SettingsPage() {
  const lookupValues = useStore((s) => s.lookupValues)
  const addLookupValue = useStore((s) => s.addLookupValue)
  const updateLookupValue = useStore((s) => s.updateLookupValue)
  const deleteLookupValue = useStore((s) => s.deleteLookupValue)

  // Panel state
  const [panelOpen, setPanelOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [currentCategory, setCurrentCategory] = useState("")
  const [formLookupValue, setFormLookupValue] = useState("")
  const [formFeatureType, setFormFeatureType] = useState("")

  // Delete state
  const [deleteId, setDeleteId] = useState<string | null>(null)

  // Group lookup values by category
  const groupedLookups = useMemo(() => {
    const groups: Record<string, LookupValue[]> = {}
    lookupValues.forEach((lv) => {
      if (!groups[lv.lookupCategory]) {
        groups[lv.lookupCategory] = []
      }
      groups[lv.lookupCategory].push(lv)
    })
    return groups
  }, [lookupValues])

  const categories = useMemo(() => Object.keys(groupedLookups).sort(), [groupedLookups])

  const openAdd = (category: string) => {
    setEditingId(null)
    setCurrentCategory(category)
    setFormLookupValue("")
    setFormFeatureType("")
    setPanelOpen(true)
  }

  const openEdit = (lv: LookupValue) => {
    setEditingId(lv.id)
    setCurrentCategory(lv.lookupCategory)
    setFormLookupValue(lv.lookupValue)
    setFormFeatureType(lv.featureType || "")
    setPanelOpen(true)
  }

  const handleSave = useCallback(() => {
    if (!formLookupValue.trim()) {
      toast.error("Lookup value is required")
      return
    }

    if (editingId) {
      updateLookupValue(editingId, {
        lookupValue: formLookupValue.trim(),
        featureType: formFeatureType,
      })
      toast.success("Lookup value updated successfully")
    } else {
      addLookupValue({
        id: crypto.randomUUID(),
        lookupCategory: currentCategory,
        lookupValue: formLookupValue.trim(),
        featureType: formFeatureType,
      })
      toast.success("Lookup value added successfully")
    }
    setPanelOpen(false)
  }, [editingId, currentCategory, formLookupValue, formFeatureType, addLookupValue, updateLookupValue])

  const handleDelete = useCallback(() => {
    if (deleteId) {
      deleteLookupValue(deleteId)
      setDeleteId(null)
      toast.success("Lookup value deleted")
    }
  }, [deleteId, deleteLookupValue])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Lookup Tables</h2>
          <p className="text-sm text-muted-foreground">
            Manage dropdown values used throughout the application
          </p>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-4">
        <Accordion type="multiple" className="w-full">
          {categories.map((category) => (
            <AccordionItem key={category} value={category}>
              <AccordionTrigger className="text-foreground hover:no-underline">
                <div className="flex items-center justify-between w-full pr-4">
                  <span className="font-medium">{category}</span>
                  <span className="text-xs text-muted-foreground">
                    {groupedLookups[category].length} values
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openAdd(category)}
                    className="mb-2"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Add Value
                  </Button>

                  {groupedLookups[category].length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4">
                      No values defined. Click &quot;Add Value&quot; to create one.
                    </p>
                  ) : (
                    <div className="space-y-1">
                      {groupedLookups[category].map((lv) => (
                        <div
                          key={lv.id}
                          className="flex items-center justify-between p-2 rounded-md bg-muted/30 hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex-1">
                            <p className="text-sm font-medium text-foreground">{lv.lookupValue}</p>
                            {lv.featureType && (
                              <p className="text-xs text-muted-foreground">Type: {lv.featureType}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-foreground"
                              onClick={() => openEdit(lv)}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              onClick={() => setDeleteId(lv.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      {/* Add/Edit Panel */}
      <EntityPanel
        open={panelOpen}
        onOpenChange={setPanelOpen}
        title={editingId ? "Edit Lookup Value" : "Add Lookup Value"}
        description={editingId ? `Update value in ${currentCategory}` : `Add new value to ${currentCategory}`}
        onSave={handleSave}
      >
        <div className="space-y-1.5">
          <Label htmlFor="category" className="text-foreground">Category</Label>
          <Input
            id="category"
            value={currentCategory}
            disabled
            className="bg-muted text-foreground"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="lookupValue" className="text-foreground">
            Value <span className="text-destructive">*</span>
          </Label>
          <Input
            id="lookupValue"
            value={formLookupValue}
            onChange={(e) => setFormLookupValue(e.target.value)}
            placeholder="e.g., GTA, Low Rise, etc."
            className="bg-background text-foreground"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="featureType" className="text-foreground">Feature Type (Optional)</Label>
          <Input
            id="featureType"
            value={formFeatureType}
            onChange={(e) => setFormFeatureType(e.target.value)}
            placeholder="Optional sub-categorization"
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
    </div>
  )
}
