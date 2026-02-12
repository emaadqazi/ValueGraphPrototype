import type { Builder, Product, Community, FloorPlan, Feature, LookupValue } from "./types"

function uid(): string {
  return crypto.randomUUID()
}

const now = new Date().toISOString()

export const seedBuilders: Builder[] = [
  "Centra Homes (Mississauga)", "Dunpar Homes (Mississauga)", "Greenpark Group (Mississauga)",
  "Khanani Developments (Mississauga)", "Marlin Spring Developments (Mississauga)",
  "Mattamy Homes (Brampton)", "Mattamy Homes (Milton)", "Mattamy Homes (Milton) - GTU",
  "Mattamy Homes (Mississauga)", "Mattamy Homes (Oakville)", "Mattamy Homes (Oakville) - GTU",
  "National Homes (Mississauga)", "Resale (Milton) <5 years old",
  "Resale (Mississauga - City Centre)", "Resale (Mississauga - Erin Mills)",
  "Resale (Mississauga)", "Resale (Mississauga) - Churchill Meadows/Erin Mills",
  "Resale (Mississauga) - Hurontario", "Resale (North Oakville) <5 years old",
].map((name) => ({
  id: uid(),
  builderName: name,
  division: "GTA",
  createdAt: now,
  updatedAt: now,
}))

export const seedProducts: Product[] = [
  { name: "12-Storey Condo", type: "Attached" as const },
  { name: "14-Storey Condo", type: "Attached" as const },
  { name: "16' 3-Storey Condo Street Townhomes (Woodland Collection)", type: "Attached" as const },
  { name: "18' 3-Storey Condo Street Townhomes (River Collection)", type: "Attached" as const },
  { name: "2-Storey Freehold Townhomes", type: "Attached" as const },
  { name: "2-Storey Semi-Detached", type: "Detached" as const },
  { name: "2-Storey Townhomes", type: "Attached" as const },
  { name: "3-Storey Back to Back Condo Village Homes", type: "Attached" as const },
  { name: "3-Storey Back to Back Rooftop Townhomes", type: "Attached" as const },
  { name: "3-Storey Back to Back Village Homes", type: "Attached" as const },
  { name: "3-Storey Condo Duplexes", type: "Attached" as const },
  { name: "3-Storey Condo Street Townhomes - C/E", type: "Attached" as const },
  { name: "3-Storey Condo Street Townhomes - Freehold", type: "Attached" as const },
  { name: "3-Storey Condo Townhomes", type: "Attached" as const },
  { name: "3-Storey Dual Front Condo Townhomes", type: "Attached" as const },
  { name: "3-Storey Rear Lane Townhomes without Rooftop", type: "Attached" as const },
  { name: "Condominium", type: "Attached" as const },
  { name: "Stacked Townhomes", type: "Attached" as const },
  { name: "Village Homes", type: "Attached" as const },
].map((p) => ({
  id: uid(),
  productName: p.name,
  productType: p.type,
  division: "GTA",
  condoType: "",
  createdAt: now,
  updatedAt: now,
}))

export const seedCommunities: Community[] = [
  { division: "GTA", communityName: "The Nine 3 (Derry & Britannia Phase 1A)", address: "Ninth Line & Derry Road", city: "Mississauga", status: "Active" as const, totalLots: 48, totalSold: 28 },
  { division: "GTA", communityName: "Mile & Creek Phase 1", address: "Derry Rd W & Tremaine Rd", city: "Milton", status: "Active" as const, totalLots: 126, totalSold: 118 },
  { division: "GTA", communityName: "Upper Joshua Creek Phase 5", address: "Dundas St W & Neyagawa Blvd", city: "Oakville", status: "Active" as const, totalLots: 58, totalSold: 0 },
  { division: "GTA", communityName: "Clockwork 3", address: "Trafalgar Rd & Dundas St", city: "Oakville", status: "Active" as const, totalLots: 72, totalSold: 45 },
  { division: "GTA", communityName: "Hawthorne East Village Phase 8", address: "Main St E & Thompson Rd", city: "Milton", status: "Active" as const, totalLots: 64, totalSold: 51 },
  { division: "GTA", communityName: "Union 3 (Feedmill)", address: "Queen St E & Main St N", city: "Brampton", status: "Proposed" as const, totalLots: 90, totalSold: 0 },
  { division: "GTA", communityName: "Artisan Towns", address: "Derry Rd & Mavis Rd", city: "Mississauga", status: "Active" as const, totalLots: 55, totalSold: 38 },
  { division: "GTA", communityName: "Whitehorn Woods", address: "Britannia Rd W & Creditview Rd", city: "Mississauga", status: "Active" as const, totalLots: 80, totalSold: 80 },
  { division: "GTA", communityName: "Addington Park Condos", address: "Sheppard Ave W & Addington Ave", city: "North York", status: "Sold Out" as const, totalLots: 120, totalSold: 120 },
  { division: "GTA", communityName: "Gallery Condos", address: "Finch Ave W & Bathurst St", city: "Toronto", status: "Active" as const, totalLots: 200, totalSold: 145 },
].map((c) => ({
  id: uid(),
  ...c,
  postalCode: "",
  dateOpened: "",
  dateSoldOut: "",
  createdAt: now,
  updatedAt: now,
}))

export const seedFloorPlans: FloorPlan[] = [
  { builder: "Mattamy Homes (Mississauga)", productType: "3-Storey Back to Back Condo Village Homes", community: "The Nine 3 (Derry & Britannia Phase 1A)", floorPlanName: "Aldgate End", status: "Active", squareFeet: 1343, bed: 3, bath: 2.5, elevation: "TA", price: 771990, bonus: -17424, maintenance: 106, carryingCost: 3538.78 },
  { builder: "Mattamy Homes (Mississauga)", productType: "3-Storey Back to Back Condo Village Homes", community: "The Nine 3 (Derry & Britannia Phase 1A)", floorPlanName: "Brixton", status: "Active", squareFeet: 1442, bed: 3, bath: 2.5, elevation: "TA", price: 749990, bonus: -17424, maintenance: 106, carryingCost: 3440.95 },
  { builder: "Mattamy Homes (Mississauga)", productType: "3-Storey Back to Back Condo Village Homes", community: "The Nine 3 (Derry & Britannia Phase 1A)", floorPlanName: "Brondesbury Corner", status: "Active", squareFeet: 1607, bed: 3, bath: 2.5, elevation: "TA", price: 816990, bonus: -17424, maintenance: 106, carryingCost: 3738.88 },
  { builder: "Mattamy Homes (Mississauga)", productType: "3-Storey Back to Back Condo Village Homes", community: "The Nine 3 (Derry & Britannia Phase 1A)", floorPlanName: "Richmond End", status: "Active", squareFeet: 1634, bed: 3, bath: 2.5, elevation: "TA", price: 831990, bonus: -17424, maintenance: 106, carryingCost: 3805.58 },
  { builder: "Mattamy Homes (Mississauga)", productType: "3-Storey Condo Street Townhomes - C/E", community: "The Nine 3 (Derry & Britannia Phase 1A)", floorPlanName: "Northwick", status: "Active", squareFeet: 1793, bed: 3, bath: 3.5, elevation: "A", price: 849990, bonus: -17424, maintenance: 0, carryingCost: 3893.15 },
  { builder: "Mattamy Homes (Mississauga)", productType: "3-Storey Condo Street Townhomes - C/E", community: "The Nine 3 (Derry & Britannia Phase 1A)", floorPlanName: "Paddington", status: "Active", squareFeet: 1940, bed: 4, bath: 3.5, elevation: "B", price: 874990, bonus: -17424, maintenance: 0, carryingCost: 4004.18 },
  { builder: "Mattamy Homes (Mississauga)", productType: "3-Storey Condo Street Townhomes - C/E", community: "The Nine 3 (Derry & Britannia Phase 1A)", floorPlanName: "Preston End", status: "Active", squareFeet: 2198, bed: 4, bath: 3.5, elevation: "C", price: 939990, bonus: -17424, maintenance: 0, carryingCost: 4293.15 },
  { builder: "Mattamy Homes (Mississauga)", productType: "3-Storey Condo Street Townhomes - C/E", community: "The Nine 3 (Derry & Britannia Phase 1A)", floorPlanName: "Uxbridge End", status: "Active", squareFeet: 2420, bed: 4, bath: 3.5, elevation: "D", price: 969990, bonus: -17424, maintenance: 0, carryingCost: 4426.42 },
].map((fp) => ({
  id: uid(),
  division: "GTA",
  ...fp,
  floorPlanStatus: fp.status as FloorPlan["floorPlanStatus"],
  stories: 3,
  garageParking: "",
  primaryBedroomFloor: "",
  modelHome: "",
  condoFreehold: "Condo",
  interiorSF: 0,
  exteriorSF: 0,
  condoAmenities: "",
  netPrice: fp.price + fp.bonus,
  pricePerSqFt: Math.round((fp.price / fp.squareFeet) * 100) / 100,
  netPricePerSqFt: Math.round(((fp.price + fp.bonus) / fp.squareFeet) * 100) / 100,
  historicalPricing: [],
  createdAt: now,
  updatedAt: now,
}))

export const seedFeatures: Feature[] = [
  { featureCategory: "Kitchen", featureName: "Granite Countertop Upgrade", retailPrice: 2500 },
  { featureCategory: "Bathroom - Owner's", featureName: "Frameless Glass Shower Enclosure", retailPrice: 1800 },
  { featureCategory: "Flooring", featureName: "Engineered Hardwood Throughout Main Floor", retailPrice: 3200 },
  { featureCategory: "Exterior", featureName: "Stone Veneer Accent on Front Elevation", retailPrice: 4500 },
  { featureCategory: "Smart Home", featureName: "Smart Home Package (Thermostat, Doorbell, Locks)", retailPrice: -1500 },
  { featureCategory: "Energy-Efficiency", featureName: "Upgraded Insulation Package", retailPrice: -2000 },
  { featureCategory: "Appliances", featureName: "Stainless Steel Appliance Package", retailPrice: 1200 },
  { featureCategory: "Lighting", featureName: "Pot Light Package (12 Lights)", retailPrice: 900 },
].map((f) => ({
  id: uid(),
  division: "GTA",
  ...f,
  featureType: "",
  createdAt: now,
  updatedAt: now,
}))

export const seedLookupValues: LookupValue[] = [
  // Divisions
  ...["Charlotte", "Dallas", "Jacksonville", "Orlando", "Phoenix", "Raleigh", "Southeast Florida", "Tampa", "Tucson", "Alberta", "GTA", "SouthwestFlorida", "Ottawa"].map(v => ({ id: uid(), lookupCategory: "Division", lookupValue: v, featureType: "" })),
  // Elevation Style
  ...["1", "2", "3", "4", "A", "B", "C", "D", "TA", "EM", "A1", "A2", "MO"].map(v => ({ id: uid(), lookupCategory: "Elevation Style", lookupValue: v, featureType: "" })),
  // Condo Amenities
  ...["Co-Working Lounge", "Fitness Centre", "Lobby", "Pet Spa", "Social Lounge"].map(v => ({ id: uid(), lookupCategory: "Condo Amenities", lookupValue: v, featureType: "" })),
  // Condo Freehold
  ...["Condo", "Freehold"].map(v => ({ id: uid(), lookupCategory: "Condo Freehold", lookupValue: v, featureType: "" })),
  // Incentive Type
  ...["Decor Dollars", "Off Purchase Price"].map(v => ({ id: uid(), lookupCategory: "Incentive Type", lookupValue: v, featureType: "" })),
  // Note Category
  ...["Amenity", "Community", "Estimated Closing Date", "Finance", "Maintenance Fee", "Spec Level 1", "Spec Level 2", "Spec Level 3"].map(v => ({ id: uid(), lookupCategory: "Note Category", lookupValue: v, featureType: "" })),
  // School Type
  ...["Elementary", "High", "Middle"].map(v => ({ id: uid(), lookupCategory: "School Type", lookupValue: v, featureType: "" })),
  // Feature Category
  ...["Appliances", "Bathroom - Owner's", "Bathroom - Secondary", "Construction", "Electrical", "Energy-Efficiency", "Exterior", "Flooring", "Garage", "Interior", "Kitchen", "Laundry", "Lighting", "Outdoor Living", "Smart Home"].map(v => ({ id: uid(), lookupCategory: "Feature Category", lookupValue: v, featureType: "" })),
]
