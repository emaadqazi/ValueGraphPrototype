"use client"

import { usePathname } from "next/navigation"

const pageTitles: Record<string, string> = {
  "/": "Dashboard",
  "/builders": "Builders",
  "/products": "Products",
  "/communities": "Communities",
  "/floor-plans": "Floor Plans",
  "/features": "Features",
  "/import": "Import Data",
  "/export": "Export Data",
  "/settings": "Settings",
}

export function AppHeader() {
  const pathname = usePathname()
  const title = pageTitles[pathname] || "Value Graph"

  return (
    <header className="flex h-14 shrink-0 items-center border-b bg-card px-6">
      <h1 className="text-lg font-semibold text-foreground">{title}</h1>
    </header>
  )
}
