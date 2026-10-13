/**
 * GeoWise — Development Assessment Platform Data Library
 * Authoritative and reference spatial datasets for Saudi Arabian municipal planning (Riyadh & Regions).
 * Strictly adheres to advisory-only principles, source tracking, and explicit data gaps.
 */

export interface SpatialLayer {
  id: string;
  name: string;
  nameAr: string;
  category: "planning" | "environmental" | "hazards" | "infrastructure" | "facilities" | "restrictions";
  provider: string;
  providerAr: string;
  classification: "Official" | "Reference-Only";
  crs: string;
  version: string;
  lastUpdated: string;
  freshnessStatus: "Fresh" | "Review Needed" | "Stale";
  color: string;
  geometryType: "Polygon" | "LineString" | "Point";
  visibleDefault: boolean;
  features: {
    id: string;
    name: string;
    nameAr: string;
    geometry: {
      type: "Polygon" | "LineString" | "Point";
      coordinates: any;
    };
    properties: Record<string, any>;
  }[];
}

// 1. Authoritative Cadastral Parcels (MOMRAH / Balady)
export const CADASTRAL_PARCELS: SpatialLayer = {
  id: "cadastral_parcels",
  name: "Cadastral Parcels Registry",
  nameAr: "السجل العقاري ومخططات الأراضي",
  category: "planning",
  provider: "Ministry of Municipalities and Housing (MOMRAH / Balady)",
  providerAr: "وزارة البلديات والإسكان (بلدي)",
  classification: "Official",
  crs: "EPSG:4326 (WGS84) / Transverse Mercator (Ain el Abd)",
  version: "v2026.3-Riyadh",
  lastUpdated: "2026-09-20",
  freshnessStatus: "Fresh",
  color: "#3b82f6",
  geometryType: "Polygon",
  visibleDefault: true,
  features: [
    {
      id: "pcl-olaya-01",
      name: "Parcel 4812/Al-Olaya",
      nameAr: "قطعة رقم 4812 - حي العليا",
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [46.6812, 24.7115],
            [46.6854, 24.7115],
            [46.6854, 24.7162],
            [46.6812, 24.7162],
            [46.6812, 24.7115],
          ],
        ],
      },
      properties: {
        parcelNumber: "4812",
        blockNumber: "14",
        deedNumber: "310492819",
        areaSqm: 21450,
        currentZoning: "C-2 (Commercial Corridor)",
        maxFloorsAllowed: 6,
        maxHeightM: 24,
        maxFAR: 2.5,
        requiredSetbacks: { front: 6.0, side: 2.5, rear: 3.0 },
      },
    },
    {
      id: "pcl-malqa-02",
      name: "Parcel 1093/Al-Malqa",
      nameAr: "قطعة رقم 1093 - حي الملقا",
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [46.632, 24.791],
            [46.6375, 24.791],
            [46.6375, 24.796],
            [46.632, 24.796],
            [46.632, 24.791],
          ],
        ],
      },
      properties: {
        parcelNumber: "1093",
        blockNumber: "88",
        deedNumber: "419082311",
        areaSqm: 28900,
        currentZoning: "R-1 (Low-Density Residential Villa)",
        maxFloorsAllowed: 3,
        maxHeightM: 12,
        maxFAR: 1.2,
        requiredSetbacks: { front: 4.0, side: 2.0, rear: 2.0 },
      },
    },
    {
      id: "pcl-nakheel-03",
      name: "Parcel 772/An-Nakheel",
      nameAr: "قطعة رقم 772 - حي النخيل",
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [46.618, 24.698],
            [46.6235, 24.698],
            [46.6235, 24.703],
            [46.618, 24.703],
            [46.618, 24.698],
          ],
        ],
      },
      properties: {
        parcelNumber: "772",
        blockNumber: "03",
        deedNumber: "220918455",
        areaSqm: 26100,
        currentZoning: "MU-3 (Mixed-Use Commercial/Residential)",
        maxFloorsAllowed: 8,
        maxHeightM: 32,
        maxFAR: 3.0,
        requiredSetbacks: { front: 5.0, side: 3.0, rear: 3.0 },
      },
    },
    {
      id: "pcl-hanifah-04",
      name: "Parcel 554/Wadi Hanifah Eco-Zone",
      nameAr: "قطعة رقم 554 - وادي حنيفة",
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [46.572, 24.762],
            [46.578, 24.762],
            [46.578, 24.768],
            [46.572, 24.768],
            [46.572, 24.762],
          ],
        ],
      },
      properties: {
        parcelNumber: "554",
        blockNumber: "02",
        deedNumber: "119803482",
        areaSqm: 35200,
        currentZoning: "ENV-R (Environmental Sensitive / Low Impact)",
        maxFloorsAllowed: 2,
        maxHeightM: 8,
        maxFAR: 0.4,
        requiredSetbacks: { front: 10.0, side: 5.0, rear: 5.0 },
      },
    },
  ],
};

// 2. Master Plan Zoning & Permitted Uses (Riyadh Royal Commission / Amanat Al-Riyadh)
export const MASTER_PLAN_ZONING: SpatialLayer = {
  id: "master_plan_zoning",
  name: "Riyadh Masterplan Land Use & Zoning",
  nameAr: "المخطط الهيكلي لاستعمالات الأراضي والاشتراطات",
  category: "planning",
  provider: "Royal Commission for Riyadh City (RCRC)",
  providerAr: "الهيئة الملكية لمدينة الرياض",
  classification: "Official",
  crs: "EPSG:4326 (WGS84)",
  version: "Riyadh-MasterPlan-2030-v4",
  lastUpdated: "2026-08-15",
  freshnessStatus: "Fresh",
  color: "#f59e0b",
  geometryType: "Polygon",
  visibleDefault: true,
  features: [
    {
      id: "zone-olaya-comm",
      name: "King Fahd / Olaya Commercial Spine (C-2)",
      nameAr: "المحور التجاري لطريق الملك فهد والعليا (تجاري C-2)",
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [46.678, 24.708],
            [46.688, 24.708],
            [46.688, 24.725],
            [46.678, 24.725],
            [46.678, 24.708],
          ],
        ],
      },
      properties: {
        zoneCode: "C-2",
        permittedUses: ["Retail", "Offices", "Hotels", "Residential Apartments (Upper Floors)"],
        prohibitedUses: ["Heavy Industrial", "Warehousing", "Fuel Stations on Minor Roads"],
        maxHeight: "36m or 9 floors along main avenue; 24m elsewhere",
        groundCoverageLimit: "60%",
      },
    },
    {
      id: "zone-malqa-res",
      name: "Al-Malqa North Residential Cluster (R-1)",
      nameAr: "نطاق شمال الملقا السكني (سكني منخفض R-1)",
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [46.625, 24.785],
            [46.645, 24.785],
            [46.645, 24.81],
            [46.625, 24.81],
            [46.625, 24.785],
          ],
        ],
      },
      properties: {
        zoneCode: "R-1",
        permittedUses: ["Single Family Residential Villas", "Neighborhood Mosques", "Small Parks"],
        prohibitedUses: ["Commercial Stores", "Event Halls", "High-Density Multi-Family"],
        maxHeight: "12m (3 floors)",
        groundCoverageLimit: "50%",
      },
    },
    {
      id: "zone-hanifah-prot",
      name: "Wadi Hanifah Protected Corridor (ENV-1)",
      nameAr: "نطاق حماية وادي حنيفة البيئي (بيئي ENV-1)",
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [46.565, 24.75],
            [46.585, 24.75],
            [46.585, 24.785],
            [46.565, 24.785],
            [46.565, 24.75],
          ],
        ],
      },
      properties: {
        zoneCode: "ENV-1",
        permittedUses: ["Low-impact Eco Tourism", "Organic Agriculture", "Public Nature Paths"],
        prohibitedUses: ["Any Multi-story Construction", "Industrial", "Impervious Paving >20%"],
        maxHeight: "8m (2 floors max, traditional vernacular stone)",
        groundCoverageLimit: "15%",
      },
    },
  ],
};

// 3. Flood, Wadis & Drainage Hazards (Civil Defense & Hydrology Authority)
export const FLOOD_AND_WADIS: SpatialLayer = {
  id: "flood_and_wadis",
  name: "Authoritative Wadis & 100-Year Flood Hazard Basins",
  nameAr: "مسارات الأودية ومخاطر السيول وتجمعات المياه (100 عام)",
  category: "hazards",
  provider: "General Directorate of Civil Defense & MOMRAH Stormwater Agency",
  providerAr: "المديرية العامة للدفاع المدني ووكالة تصريف السيول",
  classification: "Official",
  crs: "EPSG:4326 (WGS84)",
  version: "Hydrology-KSA-2025.2",
  lastUpdated: "2026-07-10",
  freshnessStatus: "Fresh",
  color: "#06b6d4",
  geometryType: "LineString",
  visibleDefault: true,
  features: [
    {
      id: "wadi-hanifah-main",
      name: "Wadi Hanifah Main Channel",
      nameAr: "مجرى وادي حنيفة الرئيسي",
      geometry: {
        type: "LineString",
        coordinates: [
          [46.568, 24.745],
          [46.573, 24.76],
          [46.577, 24.775],
          [46.582, 24.79],
        ],
      },
      properties: {
        catchmentAreaKm2: 4400,
        flowPeak100YrM3s: 1850,
        bufferSetbackRequirementM: 150,
        riskTier: "High",
        hydrologyStudyMandatory: true,
      },
    },
    {
      id: "wadi-alysen-branch",
      name: "Wadi Al-Aysen Secondary Drainage Line",
      nameAr: "مسيل وادي الأيسن الثانوي",
      geometry: {
        type: "LineString",
        coordinates: [
          [46.615, 24.73],
          [46.63, 24.745],
          [46.645, 24.755],
        ],
      },
      properties: {
        catchmentAreaKm2: 320,
        flowPeak100YrM3s: 140,
        bufferSetbackRequirementM: 50,
        riskTier: "Moderate",
        hydrologyStudyMandatory: false,
      },
    },
  ],
};

// 4. Airport Obstacle Limitation Surfaces (GACA / KKIA - King Khalid International Airport)
export const AIRPORT_OLS: SpatialLayer = {
  id: "airport_ols",
  name: "Airport Obstacle Limitation Surfaces (OLS / OAM)",
  nameAr: "أسطح تحديد الارتفاعات الجوية والملاحة (هيئة الطيران المدني)",
  category: "restrictions",
  provider: "General Authority of Civil Aviation (GACA)",
  providerAr: "الهيئة العامة للطيران المدني",
  classification: "Official",
  crs: "EPSG:4326 (WGS84)",
  version: "GACA-KKIA-OLS-v2.1",
  lastUpdated: "2026-06-01",
  freshnessStatus: "Fresh",
  color: "#ef4444",
  geometryType: "Polygon",
  visibleDefault: true,
  features: [
    {
      id: "ols-inner-horizontal",
      name: "KKIA Inner Horizontal Surface (Max 680m AMSL)",
      nameAr: "سطح المراقبة الأفقي الداخلي لمطار الملك خالد (680م فوق البحر)",
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [46.65, 24.77],
            [46.75, 24.77],
            [46.75, 24.87],
            [46.65, 24.87],
            [46.65, 24.77],
          ],
        ],
      },
      properties: {
        authority: "GACA",
        ceilingElevationAMSL: 680,
        groundElevationAvg: 625,
        maxPermissibleStructureHeightM: 55,
        clearancePermitRequired: true,
        radarLineOfSightProtected: true,
      },
    },
    {
      id: "ols-conical-surface",
      name: "KKIA Conical Outer Surface (Max 730m AMSL)",
      nameAr: "سطح المراقبة المخروطي الخارجي (730م فوق البحر)",
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [46.6, 24.7],
            [46.8, 24.7],
            [46.8, 24.9],
            [46.6, 24.9],
            [46.6, 24.7],
          ],
        ],
      },
      properties: {
        authority: "GACA",
        ceilingElevationAMSL: 730,
        maxPermissibleStructureHeightM: 105,
        clearancePermitRequired: false,
      },
    },
  ],
};

// 5. Sensitive Facilities (Schools, Hospitals, Mosques, Government)
export const SENSITIVE_FACILITIES: SpatialLayer = {
  id: "sensitive_facilities",
  name: "Sensitive Facilities Registry (500m Buffer Criteria)",
  nameAr: "سجل المرافق الحساسة (نطاق التحليل 500 متر)",
  category: "facilities",
  provider: "Ministry of Education, Ministry of Health, Ministry of Islamic Affairs",
  providerAr: "وزارة التعليم، وزارة الصحة، وزارة الشؤون الإسلامية",
  classification: "Official",
  crs: "EPSG:4326 (WGS84)",
  version: "v2026.1",
  lastUpdated: "2026-08-30",
  freshnessStatus: "Fresh",
  color: "#8b5cf6",
  geometryType: "Point",
  visibleDefault: true,
  features: [
    {
      id: "fac-sch-01",
      name: "Al-Olaya Comprehensive Secondary School for Girls",
      nameAr: "ثانوية العليا الشاملة للبنات",
      geometry: { type: "Point", coordinates: [46.6828, 24.7142] },
      properties: {
        category: "School",
        categoryAr: "مدرسة",
        capacity: 950,
        bufferEnforcement: "Strict privacy screening required; no commercial alcohol/tobacco/industrial within 200m",
      },
    },
    {
      id: "fac-hosp-02",
      name: "King Faisal Specialist Hospital & Research Centre Outpatient Annex",
      nameAr: "مستشفى الملك فيصل التخصصي - عيادات خارجية",
      geometry: { type: "Point", coordinates: [46.6865, 24.7185] },
      properties: {
        category: "Hospital",
        categoryAr: "مستشفى",
        capacity: 340,
        bufferEnforcement: "Noise mitigation and emergency ambulance corridor clearance mandatory",
      },
    },
    {
      id: "fac-sch-03",
      name: "Al-Malqa Primary International School",
      nameAr: "مدرسة الملقا الابتدائية الدولية",
      geometry: { type: "Point", coordinates: [46.6348, 24.7938] },
      properties: {
        category: "School",
        categoryAr: "مدرسة",
        capacity: 620,
        bufferEnforcement: "Traffic congestion study required for adjacent commercial uses",
      },
    },
    {
      id: "fac-mosq-04",
      name: "An-Nakheel Central Jumaa Mosque",
      nameAr: "جامع النخيل المركزي",
      geometry: { type: "Point", coordinates: [46.6212, 24.7015] },
      properties: {
        category: "Mosque",
        categoryAr: "جامع",
        capacity: 1800,
        bufferEnforcement: "Dedicated parking integration and acoustic harmony",
      },
    },
  ],
};

// 6. Road Network & Hierarchy (Transport General Authority & Municipality)
export const ROAD_NETWORK: SpatialLayer = {
  id: "road_network",
  name: "Classified Road Network & Rights-of-Way (ROW)",
  nameAr: "شبكة الطرق المعتمدة وحرم الطريق (أمانة الرياض)",
  category: "infrastructure",
  provider: "Transport General Authority (TGA) & Riyadh Municipality",
  providerAr: "الهيئة العامة للنقل وأمانة منطقة الرياض",
  classification: "Official",
  crs: "EPSG:4326 (WGS84)",
  version: "Riyadh-Roads-v5.3",
  lastUpdated: "2026-09-01",
  freshnessStatus: "Fresh",
  color: "#64748b",
  geometryType: "LineString",
  visibleDefault: true,
  features: [
    {
      id: "road-kfahd-arterial",
      name: "King Fahd Road (Primary Freeway / Arterial)",
      nameAr: "طريق الملك فهد (محور شرياني رئيسي)",
      geometry: {
        type: "LineString",
        coordinates: [
          [46.685, 24.7],
          [46.685, 24.73],
          [46.685, 24.76],
        ],
      },
      properties: {
        hierarchy: "Arterial Freeway",
        hierarchyAr: "طريق شرياني سريع",
        widthROW_m: 80,
        speedLimitKmH: 100,
        directCurbCutPermitted: false,
        serviceRoadAccessMandatory: true,
      },
    },
    {
      id: "road-olaya-main",
      name: "Al-Olaya Main Street (Commercial Collector)",
      nameAr: "شارع العليا العام (شارع جامع تجاري)",
      geometry: {
        type: "LineString",
        coordinates: [
          [46.682, 24.705],
          [46.682, 24.72],
          [46.682, 24.735],
        ],
      },
      properties: {
        hierarchy: "Commercial Collector",
        hierarchyAr: "طريق جامع تجاري",
        widthROW_m: 36,
        speedLimitKmH: 60,
        directCurbCutPermitted: true,
        frontSetbackRequirementM: 6.0,
      },
    },
    {
      id: "road-malqa-local",
      name: "Anas Ibn Malik Road Access",
      nameAr: "طريق أنس بن مالك (شرياني رئيسي)",
      geometry: {
        type: "LineString",
        coordinates: [
          [46.62, 24.795],
          [46.65, 24.795],
          [46.68, 24.795],
        ],
      },
      properties: {
        hierarchy: "Major Urban Arterial",
        hierarchyAr: "طريق شرياني حضري",
        widthROW_m: 60,
        speedLimitKmH: 80,
        directCurbCutPermitted: false,
      },
    },
  ],
};

// 7. Utility & Infrastructure Networks (SEC & NWC)
export const UTILITIES_INFRASTRUCTURE: SpatialLayer = {
  id: "utilities_infrastructure",
  name: "Utility Corridors & Substation Service Zones",
  nameAr: "محاور المرافق وشبكات الكهرباء والمياه (الشركة السعودية للكهرباء والمياه الوطنية)",
  category: "infrastructure",
  provider: "Saudi Electricity Company (SEC) & National Water Company (NWC)",
  providerAr: "الشركة السعودية للكهرباء وشركة المياه الوطنية",
  classification: "Reference-Only",
  crs: "EPSG:4326 (WGS84)",
  version: "SEC-NWC-2025.4-Ref",
  lastUpdated: "2026-05-18",
  freshnessStatus: "Review Needed",
  color: "#10b981",
  geometryType: "Point",
  visibleDefault: false,
  features: [
    {
      id: "util-sub-olaya",
      name: "Olaya Primary Electrical Substation 132/13.8kV #8042",
      nameAr: "محطة تحويل كهرباء العليا الرئيسية #8042",
      geometry: { type: "Point", coordinates: [46.6835, 24.7175] },
      properties: {
        capacityMVA: 120,
        spareCapacityStatus: "Capacity Data Unverified (Requires SEC Formal Confirmation)",
        bufferSafetyZoneM: 25,
        waterMainsProximity: "Connected (300mm ductile iron mains)",
      },
    },
    {
      id: "util-sub-malqa",
      name: "Al-Malqa Substation #8199",
      nameAr: "محطة كهرباء الملقا #8199",
      geometry: { type: "Point", coordinates: [46.636, 24.794] },
      properties: {
        capacityMVA: 80,
        spareCapacityStatus: "High Local Load (Capacity Study Required)",
        bufferSafetyZoneM: 20,
      },
    },
  ],
};

// 8. Environmental, Heritage & Protected Areas (NCEC & UNESCO)
export const ENVIRONMENTAL_HERITAGE: SpatialLayer = {
  id: "environmental_heritage",
  name: "Environmental Reserves & Historic Heritage Buffers",
  nameAr: "المحميات البيئية والمواقع التراثية (المركز الوطني للرقابة البيئية وهيئة التراث)",
  category: "environmental",
  provider: "National Center for Environmental Compliance (NCEC) & Heritage Commission",
  providerAr: "المركز الوطني للرقابة على الالتزام البيئي وهيئة التراث",
  classification: "Official",
  crs: "EPSG:4326 (WGS84)",
  version: "NCEC-Heritage-2026.1",
  lastUpdated: "2026-08-01",
  freshnessStatus: "Fresh",
  color: "#22c55e",
  geometryType: "Polygon",
  visibleDefault: true,
  features: [
    {
      id: "env-diriyah-unesco",
      name: "At-Turaif UNESCO World Heritage Buffer Zone",
      nameAr: "منطقة حماية حي الطريف التراثي بالدرعية (اليونسكو)",
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [46.56, 24.73],
            [46.59, 24.73],
            [46.59, 24.77],
            [46.56, 24.77],
            [46.56, 24.73],
          ],
        ],
      },
      properties: {
        heritageLevel: "UNESCO World Heritage Inscription #1329",
        maxBuildingHeightAllowedM: 10,
        mandatoryArchitecturalStyle: "Traditional Najdi Vernacular Mud-brick Texture",
        excavationPermitRequired: true,
      },
    },
    {
      id: "env-king-salman-park",
      name: "King Salman Park Green Boundary Buffer",
      nameAr: "نطاق حماية حديقة الملك سلمان الخضراء",
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [46.7, 24.71],
            [46.74, 24.71],
            [46.74, 24.74],
            [46.7, 24.74],
            [46.7, 24.71],
          ],
        ],
      },
      properties: {
        initiative: "Green Riyadh Initiative",
        environmentalProtectionTier: "Tier-1 Urban Ecological Reserve",
        imperviousSurfacesRestricted: true,
      },
    },
  ],
};

// All layers exported as a unified catalog
export const ALL_SPATIAL_LAYERS: SpatialLayer[] = [
  CADASTRAL_PARCELS,
  MASTER_PLAN_ZONING,
  FLOOD_AND_WADIS,
  AIRPORT_OLS,
  SENSITIVE_FACILITIES,
  ROAD_NETWORK,
  UTILITIES_INFRASTRUCTURE,
  ENVIRONMENTAL_HERITAGE,
];
