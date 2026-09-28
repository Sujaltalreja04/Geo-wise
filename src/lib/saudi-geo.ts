/**
 * GeoWise dummy geospatial data.
 * Simplified polygons for districts of Riyadh, KSA, plus POIs.
 * Coordinates are WGS84 (lon, lat). Realistic but not survey-grade.
 * This is explicitly dummy data for the MVP — not a government dataset.
 */

export interface GeoFeature {
  id: string;
  name: string;
  nameAr: string;
  type: "district" | "poi" | "parcel" | "road";
  subtype?: string;
  geometry: {
    type: "Polygon" | "Point" | "LineString";
    coordinates: number[] | number[][] | number[][][];
  };
  properties: Record<string, string | number>;
}

// Riyadh bounding box (approx)
export const RIYADH_BBOX = {
  minLon: 46.55,
  minLat: 24.55,
  maxLon: 46.85,
  maxLat: 24.85,
};

// Center of Riyadh
export const RIYADH_CENTER = { lon: 46.6753, lat: 24.7136 };

/**
 * District polygons (simplified to ~5-7 vertices each).
 * Coordinates: array of [lon, lat] rings.
 */
export const DISTRICTS: GeoFeature[] = [
  {
    id: "d-olaya",
    name: "Al Olaya",
    nameAr: "العليا",
    type: "district",
    geometry: { type: "Polygon", coordinates: [[[46.67, 24.71], [46.72, 24.71], [46.72, 24.75], [46.67, 24.75], [46.67, 24.71]]] },
    properties: { population: 185000, area_km2: 9.8, district_code: "RYD-01" },
  },
  {
    id: "d-malqa",
    name: "Al Malqa",
    nameAr: "الملقا",
    type: "district",
    geometry: { type: "Polygon", coordinates: [[[46.62, 24.78], [46.67, 24.78], [46.67, 24.83], [46.62, 24.83], [46.62, 24.78]]] },
    properties: { population: 78000, area_km2: 6.2, district_code: "RYD-02" },
  },
  {
    id: "d-nakheel",
    name: "An Nakheel",
    nameAr: "النخيل",
    type: "district",
    geometry: { type: "Polygon", coordinates: [[[46.60, 24.68], [46.65, 24.68], [46.65, 24.71], [46.60, 24.71], [46.60, 24.68]]] },
    properties: { population: 95000, area_km2: 7.1, district_code: "RYD-03" },
  },
  {
    id: "d-rawabi",
    name: "Al Rawabi",
    nameAr: "الربيع",
    type: "district",
    geometry: { type: "Polygon", coordinates: [[[46.66, 24.76], [46.71, 24.76], [46.71, 24.81], [46.66, 24.81], [46.66, 24.76]]] },
    properties: { population: 112000, area_km2: 8.4, district_code: "RYD-04" },
  },
  {
    id: "d-hitra",
    name: "Al Hitr",
    nameAr: "الهطلة",
    type: "district",
    geometry: { type: "Polygon", coordinates: [[[46.73, 24.68], [46.79, 24.68], [46.79, 24.73], [46.73, 24.73], [46.73, 24.68]]] },
    properties: { population: 67000, area_km2: 5.5, district_code: "RYD-05" },
  },
  {
    id: "d-nasim",
    name: "An Nasim",
    nameAr: "النسيم",
    type: "district",
    geometry: { type: "Polygon", coordinates: [[[46.74, 24.62], [46.80, 24.62], [46.80, 24.67], [46.74, 24.67], [46.74, 24.62]]] },
    properties: { population: 134000, area_km2: 9.0, district_code: "RYD-06" },
  },
  {
    id: "d-sulaymaniyah",
    name: "As Sulimaniyyah",
    nameAr: "السليمانية",
    type: "district",
    geometry: { type: "Polygon", coordinates: [[[46.61, 24.72], [46.66, 24.72], [46.66, 24.76], [46.61, 24.76], [46.61, 24.72]]] },
    properties: { population: 88000, area_km2: 6.8, district_code: "RYD-07" },
  },
  {
    id: "d-murabba",
    name: "Al Murabba",
    nameAr: "المرّ",
    type: "district",
    geometry: { type: "Polygon", coordinates: [[[46.69, 24.63], [46.74, 24.63], [46.74, 24.68], [46.69, 24.68], [46.69, 24.63]]] },
    properties: { population: 92000, area_km2: 7.3, district_code: "RYD-08" },
  },
  {
    id: "d-shemaysi",
    name: "Ash Shemaysi",
    nameAr: "الشميسي",
    type: "district",
    geometry: { type: "Polygon", coordinates: [[[46.63, 24.62], [46.68, 24.62], [46.68, 24.66], [46.63, 24.66], [46.63, 24.62]]] },
    properties: { population: 71000, area_km2: 5.7, district_code: "RYD-09" },
  },
  {
    id: "d-darawiyah",
    name: "Ad Darawiyah",
    nameAr: "الدرعية",
    type: "district",
    geometry: { type: "Polygon", coordinates: [[[46.56, 24.75], [46.61, 24.75], [46.61, 24.80], [46.56, 24.80], [46.56, 24.75]]] },
    properties: { population: 58000, area_km2: 4.9, district_code: "RYD-10" },
  },
];

/** Points of interest used by AI-detection demo & map layer. */
export const POIS: GeoFeature[] = [
  { id: "p-001", name: "King Fahd District Park", nameAr: "حديقة حي طريق الملك فهد", type: "poi", subtype: "park", geometry: { type: "Point", coordinates: [46.695, 24.730] }, properties: { category: "park", status: "active" } },
  { id: "p-002", name: "Riyadh Municipality HQ", nameAr: "أمانة الرياض", type: "poi", subtype: "government", geometry: { type: "Point", coordinates: [46.710, 24.685] }, properties: { category: "government", status: "active" } },
  { id: "p-003", name: "King Saud University Gate", nameAr: "بوابة جامعة الملك سعود", type: "poi", subtype: "education", geometry: { type: "Point", coordinates: [46.620, 24.740] }, properties: { category: "education", status: "active" } },
  { id: "p-004", name: "Olaya Towers Complex", nameAr: "مجمع أبراج العليا", type: "poi", subtype: "commercial", geometry: { type: "Point", coordinates: [46.685, 24.725] }, properties: { category: "commercial", status: "active" } },
  { id: "p-005", name: "Al Malqa Bridge", nameAr: "جسر الملقا", type: "poi", subtype: "infrastructure", geometry: { type: "Point", coordinates: [46.640, 24.805] }, properties: { category: "infrastructure", status: "monitoring" } },
  { id: "p-006", name: "Northern Ring Road J3", nameAr: "تقاطع الطوق الشمالي", type: "poi", subtype: "infrastructure", geometry: { type: "Point", coordinates: [46.730, 24.790] }, properties: { category: "infrastructure", status: "monitoring" } },
  { id: "p-007", name: "Nakheel District Market", nameAr: "سوق حي النخيل", type: "poi", subtype: "commercial", geometry: { type: "Point", coordinates: [46.625, 24.695] }, properties: { category: "commercial", status: "active" } },
  { id: "p-008", name: "Sulimaniyyah Office Block", nameAr: "مكاتب السليمانية", type: "poi", subtype: "commercial", geometry: { type: "Point", coordinates: [46.635, 24.740] }, properties: { category: "commercial", status: "active" } },
  { id: "p-009", name: "Murabba Cultural Centre", nameAr: "مركز المر الثقافي", type: "poi", subtype: "government", geometry: { type: "Point", coordinates: [46.715, 24.655] }, properties: { category: "government", status: "active" } },
  { id: "p-010", name: "Shemaysi Service Yard", nameAr: "ساحة خدمات الشميسي", type: "poi", subtype: "industrial", geometry: { type: "Point", coordinates: [46.655, 24.640] }, properties: { category: "industrial", status: "active" } },
  { id: "p-011", name: "Darawiyah Heritage Zone", nameAr: "منطقة الدرعية التراثية", type: "poi", subtype: "heritage", geometry: { type: "Point", coordinates: [46.585, 24.775] }, properties: { category: "heritage", status: "restricted" } },
  { id: "p-012", name: "Hitr Residential Plot", nameAr: "قطعة سكنية الهطلة", type: "poi", subtype: "residential", geometry: { type: "Point", coordinates: [46.760, 24.705] }, properties: { category: "residential", status: "monitoring" } },
];

/** All map features combined. */
export const ALL_FEATURES: GeoFeature[] = [...DISTRICTS, ...POIS];

/** A sample polygon area of interest used in the analysis demo. */
export const SAMPLE_AOI: number[][] = [
  [46.66, 24.70],
  [46.71, 24.70],
  [46.71, 24.74],
  [46.66, 24.74],
  [46.66, 24.70],
];
