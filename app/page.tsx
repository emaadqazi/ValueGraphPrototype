"use client"

import { useStore } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Package, Home, Ruler, Star, TrendingUp, DollarSign, BarChart3 } from "lucide-react"
import { formatCurrency } from "@/lib/format"

export default function DashboardPage() {
  const builders = useStore((s) => s.builders)
  const products = useStore((s) => s.products)
  const communities = useStore((s) => s.communities)
  const floorPlans = useStore((s) => s.floorPlans)
  const features = useStore((s) => s.features)

  const activeCommunities = communities.filter((c) => c.status === "Active").length
  const activeFloorPlans = floorPlans.filter((fp) => fp.floorPlanStatus === "Active").length
  const avgPrice = floorPlans.length > 0
    ? floorPlans.reduce((sum, fp) => sum + (fp.price || 0), 0) / floorPlans.length
    : 0
  const avgPSF = floorPlans.length > 0
    ? floorPlans.reduce((sum, fp) => sum + (fp.pricePerSqFt || 0), 0) / floorPlans.length
    : 0

  const cards = [
    { title: "Builders", value: builders.length, icon: Building2, desc: "Registered builders" },
    { title: "Products", value: products.length, icon: Package, desc: "Property types" },
    { title: "Communities", value: communities.length, icon: Home, desc: `${activeCommunities} active` },
    { title: "Floor Plans", value: floorPlans.length, icon: Ruler, desc: `${activeFloorPlans} active` },
    { title: "Features", value: features.length, icon: Star, desc: "Plan features" },
    { title: "Avg. List Price", value: formatCurrency(avgPrice), icon: DollarSign, desc: "Across all plans" },
    { title: "Avg. $/SF", value: `$${avgPSF.toFixed(0)}`, icon: TrendingUp, desc: "Price per sq ft" },
    { title: "Total Units", value: communities.reduce((s, c) => s + c.totalLots, 0), icon: BarChart3, desc: `${communities.reduce((s, c) => s + c.totalSold, 0)} sold` },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">Overview</h2>
        <p className="text-sm text-muted-foreground">Value Graph data management summary</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.title} className="border bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
              <card.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{card.value}</div>
              <p className="text-xs text-muted-foreground">{card.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border bg-card">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-foreground">Active Communities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {communities
                .filter((c) => c.status === "Active")
                .slice(0, 5)
                .map((c) => {
                  const pct = c.totalLots > 0 ? Math.round((c.totalSold / c.totalLots) * 100) : 0
                  return (
                    <div key={c.id} className="flex items-center gap-4">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">{c.communityName}</p>
                        <p className="text-xs text-muted-foreground">{c.city}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-3">
                        <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
                          <div
                            className={`h-full rounded-full ${pct >= 100 ? "bg-emerald-500" : pct >= 75 ? "bg-amber-500" : "bg-blue-500"}`}
                            style={{ width: `${Math.min(pct, 100)}%` }}
                          />
                        </div>
                        <span className="w-12 text-right text-xs text-muted-foreground">
                          {c.totalSold}/{c.totalLots}
                        </span>
                      </div>
                    </div>
                  )
                })}
            </div>
          </CardContent>
        </Card>

        <Card className="border bg-card">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-foreground">Recent Floor Plans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {floorPlans.slice(0, 5).map((fp) => (
                <div key={fp.id} className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{fp.floorPlanName}</p>
                    <p className="text-xs text-muted-foreground">{fp.community}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-medium text-foreground">{formatCurrency(fp.price)}</p>
                    <p className="text-xs text-muted-foreground">{fp.squareFeet} SF</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
