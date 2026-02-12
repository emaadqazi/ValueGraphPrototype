export interface Builder {
  id: string
  builderName: string
  division: string
  createdAt: string
  updatedAt: string
}

export interface Product {
  id: string
  productName: string
  productType: "Attached" | "Detached"
  division: string
  condoType: string
  createdAt: string
  updatedAt: string
}

export interface Community {
  id: string
  division: string
  communityName: string
  address: string
  city: string
  postalCode: string
  status: "Active" | "Proposed" | "Sold Out" | "Not on VG"
  dateOpened: string
  dateSoldOut: string
  totalLots: number
  totalSold: number
  createdAt: string
  updatedAt: string
}

export interface HistoricalPricing {
  month: string
  year: string
  basePrice: number
}

export interface FloorPlan {
  id: string
  division: string
  community: string
  builder: string
  productType: string
  floorPlanName: string
  floorPlanStatus: "Active" | "Proposed" | "Sold Out" | "Not on VG"
  squareFeet: number
  stories: number
  bed: number
  bath: number
  garageParking: string
  primaryBedroomFloor: string
  modelHome: string
  elevation: string
  condoFreehold: string
  interiorSF: number
  exteriorSF: number
  condoAmenities: string
  price: number
  bonus: number
  netPrice: number
  pricePerSqFt: number
  netPricePerSqFt: number
  maintenance: number
  carryingCost: number
  historicalPricing: HistoricalPricing[]
  createdAt: string
  updatedAt: string
}

export interface Feature {
  id: string
  division: string
  featureCategory: string
  featureName: string
  retailPrice: number
  featureType: string
  createdAt: string
  updatedAt: string
}

export interface LookupValue {
  id: string
  lookupCategory: string
  lookupValue: string
  featureType: string
}
