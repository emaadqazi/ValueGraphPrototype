"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Building2,
  Package,
  Home,
  Ruler,
  Star,
  Download,
  Upload,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const navItems = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Builders", href: "/builders", icon: Building2 },
  { label: "Products", href: "/products", icon: Package },
  { label: "Communities", href: "/communities", icon: Home },
  { label: "Floor Plans", href: "/floor-plans", icon: Ruler },
  { label: "Features", href: "/features", icon: Star },
  { label: "Import", href: "/import", icon: Upload },
  { label: "Export", href: "/export", icon: Download },
  { label: "Settings", href: "/settings", icon: Settings },
]

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "flex flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-all duration-200",
          collapsed ? "w-16" : "w-56"
        )}
      >
        {/* Logo area */}
        <div className="flex h-14 items-center justify-between px-4">
          {!collapsed && (
            <span className="text-sm font-bold tracking-wide text-sidebar-foreground">
              VALUE GRAPH
            </span>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-sidebar-foreground hover:bg-sidebar-accent"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            <span className="sr-only">Toggle sidebar</span>
          </Button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 space-y-1 px-2 py-4">
          {navItems.map((item) => {
            const isActive =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
            const linkContent = (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            )

            if (collapsed) {
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                  <TooltipContent side="right" className="bg-foreground text-background">
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              )
            }

            return linkContent
          })}
        </nav>

        {/* Footer */}
        {!collapsed && (
          <div className="border-t border-sidebar-border p-4">
            <p className="text-xs text-sidebar-foreground/60">Mattamy Homes</p>
            <p className="text-xs text-sidebar-foreground/40">v1.0.0</p>
          </div>
        )}
      </aside>
    </TooltipProvider>
  )
}
