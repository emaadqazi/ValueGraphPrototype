"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Builder, Product, Community, FloorPlan, Feature, LookupValue } from "./types"
import { seedBuilders, seedProducts, seedCommunities, seedFloorPlans, seedFeatures, seedLookupValues } from "./seed-data"

interface AppState {
  builders: Builder[]
  products: Product[]
  communities: Community[]
  floorPlans: FloorPlan[]
  features: Feature[]
  lookupValues: LookupValue[]

  // Builder actions
  addBuilder: (b: Builder) => void
  updateBuilder: (id: string, b: Partial<Builder>) => void
  deleteBuilder: (id: string) => void
  deleteBuilders: (ids: string[]) => void

  // Product actions
  addProduct: (p: Product) => void
  updateProduct: (id: string, p: Partial<Product>) => void
  deleteProduct: (id: string) => void
  deleteProducts: (ids: string[]) => void

  // Community actions
  addCommunity: (c: Community) => void
  updateCommunity: (id: string, c: Partial<Community>) => void
  deleteCommunity: (id: string) => void
  deleteCommunities: (ids: string[]) => void

  // Floor Plan actions
  addFloorPlan: (fp: FloorPlan) => void
  updateFloorPlan: (id: string, fp: Partial<FloorPlan>) => void
  deleteFloorPlan: (id: string) => void
  deleteFloorPlans: (ids: string[]) => void

  // Feature actions
  addFeature: (f: Feature) => void
  updateFeature: (id: string, f: Partial<Feature>) => void
  deleteFeature: (id: string) => void
  deleteFeatures: (ids: string[]) => void

  // Lookup actions
  addLookupValue: (lv: LookupValue) => void
  updateLookupValue: (id: string, lv: Partial<LookupValue>) => void
  deleteLookupValue: (id: string) => void
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      builders: seedBuilders,
      products: seedProducts,
      communities: seedCommunities,
      floorPlans: seedFloorPlans,
      features: seedFeatures,
      lookupValues: seedLookupValues,

      addBuilder: (b) => set((s) => ({ builders: [...s.builders, b] })),
      updateBuilder: (id, b) => set((s) => ({ builders: s.builders.map((x) => (x.id === id ? { ...x, ...b, updatedAt: new Date().toISOString() } : x)) })),
      deleteBuilder: (id) => set((s) => ({ builders: s.builders.filter((x) => x.id !== id) })),
      deleteBuilders: (ids) => set((s) => ({ builders: s.builders.filter((x) => !ids.includes(x.id)) })),

      addProduct: (p) => set((s) => ({ products: [...s.products, p] })),
      updateProduct: (id, p) => set((s) => ({ products: s.products.map((x) => (x.id === id ? { ...x, ...p, updatedAt: new Date().toISOString() } : x)) })),
      deleteProduct: (id) => set((s) => ({ products: s.products.filter((x) => x.id !== id) })),
      deleteProducts: (ids) => set((s) => ({ products: s.products.filter((x) => !ids.includes(x.id)) })),

      addCommunity: (c) => set((s) => ({ communities: [...s.communities, c] })),
      updateCommunity: (id, c) => set((s) => ({ communities: s.communities.map((x) => (x.id === id ? { ...x, ...c, updatedAt: new Date().toISOString() } : x)) })),
      deleteCommunity: (id) => set((s) => ({ communities: s.communities.filter((x) => x.id !== id) })),
      deleteCommunities: (ids) => set((s) => ({ communities: s.communities.filter((x) => !ids.includes(x.id)) })),

      addFloorPlan: (fp) => set((s) => ({ floorPlans: [...s.floorPlans, fp] })),
      updateFloorPlan: (id, fp) => set((s) => ({ floorPlans: s.floorPlans.map((x) => (x.id === id ? { ...x, ...fp, updatedAt: new Date().toISOString() } : x)) })),
      deleteFloorPlan: (id) => set((s) => ({ floorPlans: s.floorPlans.filter((x) => x.id !== id) })),
      deleteFloorPlans: (ids) => set((s) => ({ floorPlans: s.floorPlans.filter((x) => !ids.includes(x.id)) })),

      addFeature: (f) => set((s) => ({ features: [...s.features, f] })),
      updateFeature: (id, f) => set((s) => ({ features: s.features.map((x) => (x.id === id ? { ...x, ...f, updatedAt: new Date().toISOString() } : x)) })),
      deleteFeature: (id) => set((s) => ({ features: s.features.filter((x) => x.id !== id) })),
      deleteFeatures: (ids) => set((s) => ({ features: s.features.filter((x) => !ids.includes(x.id)) })),

      addLookupValue: (lv) => set((s) => ({ lookupValues: [...s.lookupValues, lv] })),
      updateLookupValue: (id, lv) => set((s) => ({ lookupValues: s.lookupValues.map((x) => (x.id === id ? { ...x, ...lv } : x)) })),
      deleteLookupValue: (id) => set((s) => ({ lookupValues: s.lookupValues.filter((x) => x.id !== id) })),
    }),
    {
      name: "value-graph-storage",
    }
  )
)
