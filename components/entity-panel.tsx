"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

interface EntityPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  onSave: () => void
  children: React.ReactNode
  saving?: boolean
}

export function EntityPanel({
  open,
  onOpenChange,
  title,
  description,
  onSave,
  children,
  saving = false,
}: EntityPanelProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 p-0 sm:max-w-[520px] bg-card"
      >
        <SheetHeader className="border-b px-6 py-4">
          <SheetTitle className="text-foreground">{title}</SheetTitle>
          {description && <SheetDescription>{description}</SheetDescription>}
        </SheetHeader>

        <ScrollArea className="flex-1 px-6 py-4">
          <div className="space-y-4 pb-4">{children}</div>
        </ScrollArea>

        <div className="flex items-center justify-end gap-3 border-t bg-muted/30 px-6 py-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-secondary text-secondary hover:bg-secondary/10"
          >
            Cancel
          </Button>
          <Button
            onClick={onSave}
            disabled={saving}
            className="bg-accent text-accent-foreground hover:bg-accent/90"
          >
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
