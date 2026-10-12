/**
 * GeoWise dummy data for the MVP.
 * All values are fictional and clearly labeled. No real government datasets
 * are referenced. Used to demonstrate platform behavior end-to-end.
 */

import { ALL_FEATURES, SAMPLE_AOI, DISTRICTS } from "./saudi-geo";

export type Classification = "public" | "internal" | "confidential" | "restricted";
export type GeometryType = "Polygon" | "Point" | "LineString" | "Raster";
export type DetectionType =
  | "new_construction"
  | "demolition"
  | "vegetation_loss"
  | "encroachment"
  | "road_change"
  | "water_change";
export type DetectionStatus = "pending" | "verified" | "rejected";
export type CaseStatus = "new" | "investigating" | "inspection" | "review" | "closed";
export type AlertSeverity = "info" | "warning" | "critical";
export type AuditResult = "success" | "denied" | "error";

export interface Dataset {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  owner: string;
  ownerAr: string;
  source: string;
  sourceAr: string;
  crs: string;
  geometryType: GeometryType;
  classification: Classification;
  version: string;
  featureCount: number;
  qualityScore: number; // 0-100
  lastValidated: string; // ISO date
  updatedAt: string;
  tags: string[];
  lineage: string;
  tenantId: string;
  tenantName: string;
}

export interface Detection {
  id: string;
  type: DetectionType;
  typeName: string;
  typeNameAr: string;
  model: string;
  modelVersion: string;
  confidence: number; // 0-1
  status: DetectionStatus;
  lon: number;
  lat: number;
  district: string;
  districtAr: string;
  detectedAt: string;
  imagerySource: string;
  imageryDate: string;
  reviewQueue: string;
  reviewedBy: string | null;
  caseId: string | null;
  bbox: [number, number, number, number]; // minLon, minLat, maxLon, maxLat
}

export interface Case {
  id: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  status: CaseStatus;
  priority: "low" | "medium" | "high" | "critical";
  district: string;
  districtAr: string;
  assignedTo: string;
  assignedToAr: string;
  createdAt: string;
  dueAt: string;
  slaHours: number;
  slaRemainingHours: number;
  source: "detection" | "alert" | "inspection" | "manual";
  sourceRef: string;
  inspections: { id: string; inspector: string; inspectorAr: string; date: string; outcome: string; outcomeAr: string }[];
  evidenceCount: number;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  actor: string;
  actorAr: string;
  action: string;
  actionAr: string;
  target: string;
  targetAr: string;
  result: AuditResult;
  ip: string;
  tenantId: string;
  tenantName: string;
  module: string;
  details: string;
}

export interface Watchlist {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  schedule: string;
  scheduleAr: string;
  threshold: string;
  thresholdAr: string;
  lastRun: string;
  nextRun: string;
  status: "active" | "paused";
  areaKm2: number;
  alertsTriggered: number;
  monitoredFeatures: number;
}

export interface Alert {
  id: string;
  watchlistId: string;
  watchlistName: string;
  watchlistNameAr: string;
  severity: AlertSeverity;
  message: string;
  messageAr: string;
  triggeredAt: string;
  lon: number;
  lat: number;
  acknowledged: boolean;
  caseId: string | null;
}

export interface AnalysisDefinition {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  category: string;
  categoryAr: string;
  runnable: boolean;
  parameters: { id: string; label: string; labelAr: string; type: "select" | "number" | "text"; options?: { value: string; label: string; labelAr: string }[]; default: string | number }[];
  algorithmVersion: string;
}

export interface AnalysisRun {
  id: string;
  analysisId: string;
  analysisName: string;
  analysisNameAr: string;
  startedAt: string;
  durationMs: number;
  status: "completed" | "running" | "failed";
  userId: string;
  userName: string;
  userNameAr: string;
  inputs: string;
  outputs: string;
  outputsAr: string;
  algorithmVersion: string;
}

export interface ActivityItem {
  id: string;
  kind: "dataset" | "detection" | "case" | "analysis" | "alert" | "audit";
  message: string;
  messageAr: string;
  actor: string;
  actorAr: string;
  timestamp: string;
}

// ───────── Datasets ─────────
export const DATASETS: Dataset[] = [
  {
    id: "ds-parcels",
    name: "Riyadh Municipal Parcels",
    nameAr: "قطع أراضي أمانة الرياض",
    description: "Authoritative cadastral parcel layer maintained by Riyadh Municipality.",
    descriptionAr: "طبقة القطع العقارية المعتمدة لدى أمانة الرياض.",
    owner: "Riyadh Municipality",
    ownerAr: "أمانة الرياض",
    source: "Riyadh Municipal Cadastre",
    sourceAr: "المسح العقاري لأمانة الرياض",
    crs: "EPSG:32638 (UTM 38N)",
    geometryType: "Polygon",
    classification: "confidential",
    version: "v2026.03",
    featureCount: 482910,
    qualityScore: 96,
    lastValidated: "2026-09-12",
    updatedAt: "2026-09-15T08:30:00Z",
    tags: ["cadastral", "parcels", "riyadh"],
    lineage: "Imported from official cadastre; validated against orthoimagery dated 2026-08.",
    tenantId: "t-momrah",
    tenantName: "Ministry of Municipalities & Housing",
  },
  {
    id: "ds-landuse",
    name: "Greater Riyadh Land Use 2026",
    nameAr: "استخدامات الأراضي الرياض الكبرى 2026",
    description: "General land use classification at district granularity.",
    descriptionAr: "تصنيف استخدامات الأراضي على مستوى الحي.",
    owner: "MOMRAH Spatial Planning",
    ownerAr: "التخطيط المكاني بوزارة الشؤون البلدية",
    source: "MOMRAH Annual Land Use Survey",
    sourceAr: "المسح السنوي لاستخدامات الأراضي",
    crs: "EPSG:4326",
    geometryType: "Polygon",
    classification: "internal",
    version: "v2026.01",
    featureCount: 3845,
    qualityScore: 88,
    lastValidated: "2026-08-30",
    updatedAt: "2026-09-10T14:00:00Z",
    tags: ["landuse", "planning", "riyadh"],
    lineage: "Derived from cadastral parcels + field survey 2026 Q2.",
    tenantId: "t-momrah",
    tenantName: "Ministry of Municipalities & Housing",
  },
  {
    id: "ds-roads",
    name: "Riyadh Road Network",
    nameAr: "شبكة طرق الرياض",
    description: "Classified road network with functional class and surface type.",
    descriptionAr: "شبكة الطرق مصنّفة حسب الفئة الوظيفية ونوع السطح.",
    owner: "Riyadh Region Transport Authority",
    ownerAr: "هيئة transport منطقة الرياض",
    source: "Riyadh Road Inventory",
    sourceAr: "جرد طرق الرياض",
    crs: "EPSG:32638",
    geometryType: "LineString",
    classification: "internal",
    version: "v2026.04",
    featureCount: 28114,
    qualityScore: 92,
    lastValidated: "2026-09-01",
    updatedAt: "2026-09-14T09:15:00Z",
    tags: ["transport", "roads", "network"],
    lineage: "GPS-verified survey; merged with municipal cadastral reference.",
    tenantId: "t-momrah",
    tenantName: "Ministry of Municipalities & Housing",
  },
  {
    id: "ds-ortho-2026",
    name: "Riyadh Orthoimagery 2026 Q2",
    nameAr: "الصور الملتقطة المعدلة هندسياً 2026 ربع 2",
    description: "10cm-resolution orthorectified aerial imagery mosaic.",
    descriptionAr: "صور جوية معدّلة هندسياً بدقة 10سم.",
    owner: "Saudi Geospatial Authority",
    ownerAr: "الهيئة السعودية للمساحة",
    source: "SGA Aerial Survey 2026",
    sourceAr: "المسح الجوي للهيئة 2026",
    crs: "EPSG:32638",
    geometryType: "Raster",
    classification: "restricted",
    version: "v2026.q2",
    featureCount: 1,
    qualityScore: 99,
    lastValidated: "2026-07-20",
    updatedAt: "2026-09-05T11:00:00Z",
    tags: ["imagery", "ortho", "raster", "restricted"],
    lineage: "Aerial capture 2026-05; ortho GSD 10cm; QA pass rate 99.4%.",
    tenantId: "t-sga",
    tenantName: "Saudi Geospatial Authority",
  },
  {
    id: "ds-amenities",
    name: "Public Amenities Inventory",
    nameAr: "جرد المرافق العامة",
    description: "Mosques, schools, clinics, parks with capacity attributes.",
    descriptionAr: "المساجد والمدارس والعيادات والحدائق مع سعاتها.",
    owner: "Riyadh Municipality",
    ownerAr: "أمانة الرياض",
    source: "Riyadh Assets Register",
    sourceAr: "سجل أصول أمانة الرياض",
    crs: "EPSG:4326",
    geometryType: "Point",
    classification: "internal",
    version: "v2026.02",
    featureCount: 9247,
    qualityScore: 90,
    lastValidated: "2026-09-08",
    updatedAt: "2026-09-13T16:45:00Z",
    tags: ["amenities", "assets", "points"],
    lineage: "Field-verified inventory; cross-referenced with MOMRAH assets DB.",
    tenantId: "t-momrah",
    tenantName: "Ministry of Municipalities & Housing",
  },
  {
    id: "ds-flood-risk",
    name: "Riyadh Flash Flood Susceptibility",
    nameAr: "قابلية التعرض للسيول بالرياض",
    description: "Derived flood susceptibility raster from terrain & drainage.",
    descriptionAr: "طبقة مشتقّة لقابلية التعرض للسيول من التضاريس والصرف.",
    owner: "Ministry of Environment",
    ownerAr: "وزارة البيئة",
    source: "MOE Hydrology Model v3",
    sourceAr: "نموذج الهيدرولوجيا v3",
    crs: "EPSG:32638",
    geometryType: "Raster",
    classification: "internal",
    version: "v3.1",
    featureCount: 1,
    qualityScore: 82,
    lastValidated: "2026-06-15",
    updatedAt: "2026-09-01T10:20:00Z",
    tags: ["hydrology", "risk", "raster", "derived"],
    lineage: "Derived from DEM 5m + drainage network + historic flood events 2009-2023.",
    tenantId: "t-moe",
    tenantName: "Ministry of Environment",
  },
  {
    id: "ds-suitability",
    name: "Public Facility Site Suitability",
    nameAr: "ملاءمة مواقع المرافق العامة",
    description: "Composite suitability score (0-100) per parcel for facility siting.",
    descriptionAr: "درجة ملاءمة مركّبة (0-100) لكل قطعة لإنشاء مرافق.",
    owner: "MOMRAH Spatial Planning",
    ownerAr: "التخطيط المكاني",
    source: "Internal Suitability Model",
    sourceAr: "نموذج الملاءمة الداخلي",
    crs: "EPSG:32638",
    geometryType: "Polygon",
    classification: "confidential",
    version: "v1.4",
    featureCount: 1240,
    qualityScore: 84,
    lastValidated: "2026-09-04",
    updatedAt: "2026-09-12T12:00:00Z",
    tags: ["suitability", "planning", "derived"],
    lineage: "Inputs: parcels, land use, road access, amenities, flood risk. Model v1.4.",
    tenantId: "t-momrah",
    tenantName: "Ministry of Municipalities & Housing",
  },
];

// ───────── Detections ─────────
const DISTRICTS_BY_ID = Object.fromEntries(DISTRICTS.map((d) => [d.id, d]));

export const DETECTIONS: Detection[] = [
  {
    id: "det-001",
    type: "new_construction",
    typeName: "New construction detected",
    typeNameAr: "بناء جديد مكتشف",
    model: "GW-CDNet",
    modelVersion: "v2.3",
    confidence: 0.94,
    status: "pending",
    lon: 46.688, lat: 24.732, district: "d-olaya", districtAr: "العليا",
    detectedAt: "2026-09-16T03:14:00Z", imagerySource: "ds-ortho-2026", imageryDate: "2026-09-14",
    reviewQueue: "MOMRAH Change Detection",
    reviewedBy: null, caseId: null,
    bbox: [46.685, 24.729, 46.691, 24.735],
  },
  {
    id: "det-002",
    type: "encroachment",
    typeName: "Possible encroachment on right-of-way",
    typeNameAr: "تجاوز محتمل على حق الطريق",
    model: "GW-EncroachNet",
    modelVersion: "v1.1",
    confidence: 0.81,
    status: "pending",
    lon: 46.642, lat: 24.802, district: "d-malqa", districtAr: "الملقا",
    detectedAt: "2026-09-16T03:18:00Z", imagerySource: "ds-ortho-2026", imageryDate: "2026-09-14",
    reviewQueue: "Right-of-way Watch",
    reviewedBy: null, caseId: null,
    bbox: [46.639, 24.799, 46.645, 24.805],
  },
  {
    id: "det-003",
    type: "vegetation_loss",
    typeName: "Vegetation loss in green area",
    typeNameAr: "فقدان غطاء نباتي في منطقة خضراء",
    model: "GW-VegDelta",
    modelVersion: "v3.0",
    confidence: 0.88,
    status: "pending",
    lon: 46.697, lat: 24.731, district: "d-olaya", districtAr: "العليا",
    detectedAt: "2026-09-16T03:22:00Z", imagerySource: "ds-ortho-2026", imageryDate: "2026-09-14",
    reviewQueue: "Green Assets Watch",
    reviewedBy: null, caseId: null,
    bbox: [46.694, 24.728, 46.700, 24.734],
  },
  {
    id: "det-004",
    type: "demolition",
    typeName: "Structure demolition detected",
    typeNameAr: "هدم منشأة مكتشف",
    model: "GW-CDNet",
    modelVersion: "v2.3",
    confidence: 0.91,
    status: "verified",
    lon: 46.624, lat: 24.695, district: "d-nakheel", districtAr: "النخيل",
    detectedAt: "2026-09-15T22:10:00Z", imagerySource: "ds-ortho-2026", imageryDate: "2026-09-13",
    reviewQueue: "MOMRAH Change Detection",
    reviewedBy: "Khalid Al-Otaibi", caseId: "GW-CASE-2041",
    bbox: [46.621, 24.692, 46.627, 24.698],
  },
  {
    id: "det-005",
    type: "road_change",
    typeName: "Unplanned road surface change",
    typeNameAr: "تغيّر غير مُخطط في سطح الطريق",
    model: "GW-RoadWatch",
    modelVersion: "v1.4",
    confidence: 0.72,
    status: "pending",
    lon: 46.731, lat: 24.789, district: "d-rawabi", districtAr: "الربيع",
    detectedAt: "2026-09-15T19:40:00Z", imagerySource: "ds-ortho-2026", imageryDate: "2026-09-13",
    reviewQueue: "Infrastructure Watch",
    reviewedBy: null, caseId: null,
    bbox: [46.728, 24.786, 46.734, 24.792],
  },
  {
    id: "det-006",
    type: "water_change",
    typeName: "Standing water after rainfall",
    typeNameAr: "مياه راكدة بعد هطول الأمطار",
    model: "GW-HydroNet",
    modelVersion: "v2.0",
    confidence: 0.79,
    status: "pending",
    lon: 46.656, lat: 24.641, district: "d-shemaysi", districtAr: "الشميسي",
    detectedAt: "2026-09-15T11:05:00Z", imagerySource: "ds-ortho-2026", imageryDate: "2026-09-13",
    reviewQueue: "Flood Response Watch",
    reviewedBy: null, caseId: null,
    bbox: [46.653, 24.638, 46.659, 24.644],
  },
  {
    id: "det-007",
    type: "new_construction",
    typeName: "New construction detected",
    typeNameAr: "بناء جديد مكتشف",
    model: "GW-CDNet",
    modelVersion: "v2.3",
    confidence: 0.96,
    status: "verified",
    lon: 46.761, lat: 24.706, district: "d-hitra", districtAr: "الهطلة",
    detectedAt: "2026-09-14T23:55:00Z", imagerySource: "ds-ortho-2026", imageryDate: "2026-09-12",
    reviewQueue: "MOMRAH Change Detection",
    reviewedBy: "Khalid Al-Otaibi", caseId: "GW-CASE-2039",
    bbox: [46.758, 24.703, 46.764, 24.709],
  },
  {
    id: "det-008",
    type: "encroachment",
    typeName: "Possible encroachment on right-of-way",
    typeNameAr: "تجاوز محتمل على حق الطريق",
    model: "GW-EncroachNet",
    modelVersion: "v1.1",
    confidence: 0.58,
    status: "rejected",
    lon: 46.636, lat: 24.741, district: "d-sulaymaniyah", districtAr: "السليمانية",
    detectedAt: "2026-09-14T18:20:00Z", imagerySource: "ds-ortho-2026", imageryDate: "2026-09-12",
    reviewQueue: "Right-of-way Watch",
    reviewedBy: "Layla Al-Harbi", caseId: null,
    bbox: [46.633, 24.738, 46.639, 24.744],
  },
];

// ───────── Cases ─────────
export const CASES: Case[] = [
  {
    id: "GW-CASE-2041",
    title: "Demolition without permit — Nakheel district",
    titleAr: "هدم بدون تصريح — حي النخيل",
    description: "AI detection det-004 verified by supervisor. Site inspection required.",
    descriptionAr: "اكتشاف det-004 موثّق من المشرف. مطلوب تفتيش الموقع.",
    status: "inspection",
    priority: "high",
    district: "d-nakheel", districtAr: "النخيل",
    assignedTo: "Inspector Faisal Al-Qahtani", assignedToAr: "المفتش فيصل القحطاني",
    createdAt: "2026-09-15T22:30:00Z",
    dueAt: "2026-09-19T22:30:00Z",
    slaHours: 96, slaRemainingHours: 41,
    source: "detection", sourceRef: "det-004",
    inspections: [{ id: "ins-901", inspector: "Faisal Al-Qahtani", inspectorAr: "فيصل القحطاني", date: "2026-09-17T07:00:00Z", outcome: "On-site verified", outcomeAr: "تم التحقق ميدانياً" }],
    evidenceCount: 4,
  },
  {
    id: "GW-CASE-2039",
    title: "Unauthorized construction — Hitr district",
    titleAr: "بناء غير مُرخص — حي الهطلة",
    description: "Verified detection det-007; enforcement review pending.",
    descriptionAr: "الاكتشاف det-007 موثّق؛ مراجعة الإجراء جارية.",
    status: "review",
    priority: "critical",
    district: "d-hitra", districtAr: "الهطلة",
    assignedTo: "Supervisor Khalid Al-Otaibi", assignedToAr: "المشرف خالد العتيبي",
    createdAt: "2026-09-15T00:10:00Z",
    dueAt: "2026-09-18T00:10:00Z",
    slaHours: 72, slaRemainingHours: 18,
    source: "detection", sourceRef: "det-007",
    inspections: [{ id: "ins-899", inspector: "Faisal Al-Qahtani", inspectorAr: "فيصل القحطاني", date: "2026-09-16T07:00:00Z", outcome: "Confirmed deviation", outcomeAr: "تم تأكيد المخالفة" }],
    evidenceCount: 7,
  },
  {
    id: "GW-CASE-2042",
    title: "Standing water — Shemaysi service yard",
    titleAr: "مياه راكدة — ساحة خدمات الشميسي",
    description: "Hydrology alert triggered; drainage inspection required.",
    descriptionAr: "تنبيه هيدرولوجي؛ مطلوب تفتيش الصرف.",
    status: "new",
    priority: "medium",
    district: "d-shemaysi", districtAr: "الشميسي",
    assignedTo: "Inspector Mona Al-Shehri", assignedToAr: "المفتشة منى الشهري",
    createdAt: "2026-09-15T11:30:00Z",
    dueAt: "2026-09-17T11:30:00Z",
    slaHours: 48, slaRemainingHours: 12,
    source: "alert", sourceRef: "alert-003",
    inspections: [],
    evidenceCount: 0,
  },
  {
    id: "GW-CASE-2038",
    title: "Encroachment on right-of-way — Malqa",
    titleAr: "تجاوز على حق الطريق — الملقا",
    description: "Detection det-002 under manual review.",
    descriptionAr: "الاكتشاف det-002 قيد المراجعة اليدوية.",
    status: "investigating",
    priority: "high",
    district: "d-malqa", districtAr: "الملقا",
    assignedTo: "Inspector Faisal Al-Qahtani", assignedToAr: "فيصل القحطاني",
    createdAt: "2026-09-14T09:00:00Z",
    dueAt: "2026-09-18T09:00:00Z",
    slaHours: 96, slaRemainingHours: 60,
    source: "detection", sourceRef: "det-002",
    inspections: [],
    evidenceCount: 2,
  },
  {
    id: "GW-CASE-2035",
    title: "Vegetation loss — Olaya park",
    titleAr: "فقدان غطاء نباتي — حديقة العليا",
    description: "Closed after corrective landscaping completed.",
    descriptionAr: "أُغلقت بعد إكمال معالجة التنسيق.",
    status: "closed",
    priority: "low",
    district: "d-olaya", districtAr: "العليا",
    assignedTo: "Inspector Mona Al-Shehri", assignedToAr: "منى الشهري",
    createdAt: "2026-09-10T08:00:00Z",
    dueAt: "2026-09-14T08:00:00Z",
    slaHours: 96, slaRemainingHours: 0,
    source: "alert", sourceRef: "alert-001",
    inspections: [{ id: "ins-887", inspector: "Mona Al-Shehri", inspectorAr: "منى الشهري", date: "2026-09-12T08:00:00Z", outcome: "Resolved", outcomeAr: "تم الحل" }],
    evidenceCount: 5,
  },
];

// ───────── Audit ─────────
export const AUDIT_EVENTS: AuditEvent[] = [
  {
    id: "a-10042",
    timestamp: "2026-09-16T08:14:22Z",
    actor: "Khalid Al-Otaibi", actorAr: "خالد العتيبي",
    action: "Detection verified", actionAr: "اعتماد اكتشاف",
    target: "det-004", targetAr: "det-004",
    result: "success", ip: "10.42.7.19",
    tenantId: "t-momrah", tenantName: "MOMRAH",
    module: "M07 — AI Detection",
    details: "Detection promoted to verified; case GW-CASE-2041 auto-linked.",
  },
  {
    id: "a-10041",
    timestamp: "2026-09-16T08:02:11Z",
    actor: "System", actorAr: "النظام",
    action: "Scheduled job completed", actionAr: "اكتملت مهمة مجدولة",
    target: "watch-w-change-detection", targetAr: "قائمة مراقبة تغييرات",
    result: "success", ip: "—",
    tenantId: "t-momrah", tenantName: "MOMRAH",
    module: "M10 — Automation & Monitoring",
    details: "Processed 412 tiles; produced 3 new detections.",
  },
  {
    id: "a-10040",
    timestamp: "2026-09-16T07:51:48Z",
    actor: "Khalid Al-Otaibi", actorAr: "خالد العتيبي",
    action: "Analysis executed", actionAr: "تنفيذ تحليل",
    target: "analysis-site-suitability", targetAr: "تحليل ملاءمة المواقع",
    result: "success", ip: "10.42.7.19",
    tenantId: "t-momrah", tenantName: "MOMRAH",
    module: "M05 — Spatial Analysis",
    details: "Site suitability run completed; 1240 parcels scored; 3.8s.",
  },
  {
    id: "a-10039",
    timestamp: "2026-09-16T07:30:02Z",
    actor: "Layla Al-Harbi", actorAr: "ليلى الحربي",
    action: "Detection rejected (false positive)", actionAr: "رفض اكتشاف (إيجابية كاذبة)",
    target: "det-008", targetAr: "det-008",
    result: "success", ip: "10.42.7.51",
    tenantId: "t-momrah", tenantName: "MOMRAH",
    module: "M07 — AI Detection",
    details: "Marked false positive; fed back to model drift monitor.",
  },
  {
    id: "a-10038",
    timestamp: "2026-09-16T06:48:55Z",
    actor: "System", actorAr: "النظام",
    action: "Alert triggered", actionAr: "إطلاق تنبيه",
    target: "alert-003", targetAr: "alert-003",
    result: "success", ip: "—",
    tenantId: "t-moe", tenantName: "MOE",
    module: "M10 — Automation & Monitoring",
    details: "Standing water threshold exceeded in Shemaysi.",
  },
  {
    id: "a-10037",
    timestamp: "2026-09-16T05:14:00Z",
    actor: "Anonymous", actorAr: "مجهول",
    action: "Unauthorized dataset access attempted", actionAr: "محاولة وصول غير مُصرّح لمجموعة بيانات",
    target: "ds-ortho-2026", targetAr: "ds-ortho-2026",
    result: "denied", ip: "203.0.113.42",
    tenantId: "t-momrah", tenantName: "MOMRAH",
    module: "M15 — Governance",
    details: "Cross-tenant access denied; token scope mismatch.",
  },
  {
    id: "a-10036",
    timestamp: "2026-09-15T22:30:00Z",
    actor: "Khalid Al-Otaibi", actorAr: "خالد العتيبي",
    action: "Case created", actionAr: "إنشاء حالة",
    target: "GW-CASE-2041", targetAr: "GW-CASE-2041",
    result: "success", ip: "10.42.7.19",
    tenantId: "t-momrah", tenantName: "MOMRAH",
    module: "M11 — Case Management",
    details: "Case created from verified detection det-004.",
  },
  {
    id: "a-10035",
    timestamp: "2026-09-15T18:00:00Z",
    actor: "Riyadh Municipality API", actorAr: "واجهة أمانة الرياض",
    action: "Dataset ingested", actionAr: "استيعاب مجموعة بيانات",
    target: "ds-parcels", targetAr: "ds-parcels",
    result: "success", ip: "10.42.0.7",
    tenantId: "t-momrah", tenantName: "MOMRAH",
    module: "M02 — Data Ingestion",
    details: "Scheduled pull completed; 482,910 features; QC pass.",
  },
];

// ───────── Watchlists & Alerts ─────────
export const WATCHLISTS: Watchlist[] = [
  {
    id: "watch-w-change-detection",
    name: "Riyadh Change Detection Watch",
    nameAr: "مراقبة تغييرات الرياض",
    description: "Nightly AI change detection across Riyadh urban extent.",
    descriptionAr: "اكتشاف تغييرات ذكي ليلي على نطاق الرياض الحضري.",
    schedule: "Daily 03:00 AST", scheduleAr: "يومياً 03:00 بتوقيت السعودية",
    threshold: "Confidence ≥ 0.70", thresholdAr: "الثقة ≥ 0.70",
    lastRun: "2026-09-16T03:00:00Z", nextRun: "2026-09-17T03:00:00Z",
    status: "active", areaKm2: 1240, alertsTriggered: 3, monitoredFeatures: 412,
  },
  {
    id: "watch-w-green-assets",
    name: "Green Assets Watch",
    nameAr: "مراقبة الأصول الخضراء",
    description: "Weekly NDVI delta over parks and green corridors.",
    descriptionAr: "أسبوعي: فارق NDVI على الحدائق والممرات الخضراء.",
    schedule: "Weekly Mon 06:00", scheduleAr: "أسبوعياً الاثنين 06:00",
    threshold: "NDVI drop ≥ 15%", thresholdAr: "هبوط NDVI ≥ 15%",
    lastRun: "2026-09-16T06:00:00Z", nextRun: "2026-09-23T06:00:00Z",
    status: "active", areaKm2: 84, alertsTriggered: 1, monitoredFeatures: 142,
  },
  {
    id: "watch-w-row",
    name: "Right-of-Way Encroachment Watch",
    nameAr: "مراقبة تجاوزات حق الطريق",
    description: "Daily encroachment scan along classified road corridors.",
    descriptionAr: "مسح يومي للتجاوزات على ممرات الطرق المُصنّفة.",
    schedule: "Daily 04:30 AST", scheduleAr: "يومياً 04:30",
    threshold: "Overlap ≥ 5m²", thresholdAr: "تداخل ≥ 5م²",
    lastRun: "2026-09-16T04:30:00Z", nextRun: "2026-09-17T04:30:00Z",
    status: "active", areaKm2: 612, alertsTriggered: 1, monitoredFeatures: 281,
  },
  {
    id: "watch-w-flood",
    name: "Flood Response Watch",
    nameAr: "مراقبة الاستجابة للسيول",
    description: "Hourly standing-water detection during rainfall events.",
    descriptionAr: "ساعي: اكتشاف مياه راكدة أثناء هطول الأمطار.",
    schedule: "Hourly (active)", scheduleAr: "ساعي (نشط)",
    threshold: "Water area ≥ 50m²", thresholdAr: "مساحة مياه ≥ 50م²",
    lastRun: "2026-09-16T08:00:00Z", nextRun: "2026-09-16T09:00:00Z",
    status: "active", areaKm2: 1240, alertsTriggered: 1, monitoredFeatures: 96,
  },
  {
    id: "watch-w-paused",
    name: "Heritage Buffer Zone Watch",
    nameAr: "مراقبة منطقة عزل التراث",
    description: "Paused pending Darawiyah buffer re-survey.",
    descriptionAr: "متوقفة بانتظار إعادة مسح عزل الدرعية.",
    schedule: "Daily 05:00 AST", scheduleAr: "يومياً 05:00",
    threshold: "Any change", thresholdAr: "أي تغيير",
    lastRun: "2026-09-10T05:00:00Z", nextRun: "—",
    status: "paused", areaKm2: 12, alertsTriggered: 0, monitoredFeatures: 18,
  },
];

export const ALERTS: Alert[] = [
  {
    id: "alert-005",
    watchlistId: "watch-w-change-detection",
    watchlistName: "Riyadh Change Detection Watch", watchlistNameAr: "مراقبة تغييرات الرياض",
    severity: "warning",
    message: "New construction detected at Olaya (conf. 0.94)",
    messageAr: "بناء جديد في العليا (ثقة 0.94)",
    triggeredAt: "2026-09-16T03:14:00Z",
    lon: 46.688, lat: 24.732, acknowledged: false, caseId: null,
  },
  {
    id: "alert-004",
    watchlistId: "watch-w-row",
    watchlistName: "Right-of-Way Encroachment Watch", watchlistNameAr: "مراقبة تجاوزات حق الطريق",
    severity: "warning",
    message: "Possible ROW encroachment at Malqa (conf. 0.81)",
    messageAr: "تجاوز محتمل في الملقا (ثقة 0.81)",
    triggeredAt: "2026-09-16T03:18:00Z",
    lon: 46.642, lat: 24.802, acknowledged: false, caseId: "GW-CASE-2038",
  },
  {
    id: "alert-003",
    watchlistId: "watch-w-flood",
    watchlistName: "Flood Response Watch", watchlistNameAr: "مراقبة الاستجابة للسيول",
    severity: "critical",
    message: "Standing water at Shemaysi service yard",
    messageAr: "مياه راكدة في ساحة خدمات الشميسي",
    triggeredAt: "2026-09-16T06:48:00Z",
    lon: 46.656, lat: 24.641, acknowledged: false, caseId: "GW-CASE-2042",
  },
  {
    id: "alert-002",
    watchlistId: "watch-w-green-assets",
    watchlistName: "Green Assets Watch", watchlistNameAr: "مراقبة الأصول الخضراء",
    severity: "info",
    message: "Vegetation loss in Olaya park (NDVI -18%)",
    messageAr: "فقدان نباتي في حديقة العليا (NDVI -18%)",
    triggeredAt: "2026-09-16T06:00:00Z",
    lon: 46.697, lat: 24.731, acknowledged: true, caseId: null,
  },
  {
    id: "alert-001",
    watchlistId: "watch-w-change-detection",
    watchlistName: "Riyadh Change Detection Watch", watchlistNameAr: "مراقبة تغييرات الرياض",
    severity: "warning",
    message: "Demolition detected in Nakheel (conf. 0.91)",
    messageAr: "هدم مكتشف في النخيل (ثقة 0.91)",
    triggeredAt: "2026-09-15T22:10:00Z",
    lon: 46.624, lat: 24.695, acknowledged: true, caseId: "GW-CASE-2041",
  },
];

// ───────── Analyses ─────────
export const ANALYSES: AnalysisDefinition[] = [
  {
    id: "analysis-site-suitability",
    name: "Public Facility Site Suitability",
    nameAr: "ملاءمة مواقع المرافق العامة",
    description: "Score parcels 0-100 for siting new public facilities based on access, density and risk.",
    descriptionAr: "تقييم القطع 0-100 لإنشاء مرافق جديدة بناءً على الوصول والكثافة والمخاطر.",
    category: "Suitability", categoryAr: "الملاءمة",
    runnable: true,
    parameters: [
      {
        id: "aoi", label: "Area of interest", labelAr: "نطاق الاهتمام",
        type: "select",
        options: [{ value: "riyadh-urban", label: "Riyadh urban extent", labelAr: "النطاق الحضري للرياض" }],
        default: "riyadh-urban",
      },
      {
        id: "facility-type", label: "Facility type", labelAr: "نوع المرفق",
        type: "select",
        options: [
          { value: "clinic", label: "Primary clinic", labelAr: "عيادة أولية" },
          { value: "school", label: "Primary school", labelAr: "مدرسة ابتدائية" },
          { value: "park", label: "Neighborhood park", labelAr: "حديقة حي" },
        ],
        default: "clinic",
      },
      {
        id: "min-score", label: "Minimum acceptable score", labelAr: "الحد الأدنى للقبول",
        type: "number", default: 70,
      },
    ],
    algorithmVersion: "suitability-v1.4",
  },
  {
    id: "analysis-buffer",
    name: "Buffer & Proximity Analysis",
    nameAr: "تحليل الصدى والتقارب",
    description: "Compute buffer zones and proximity statistics around target features.",
    descriptionAr: "حساب مناطق الصدى وإحصاءات التقارب حول عناصر مستهدفة.",
    category: "Geoprocessing", categoryAr: "المعالجة الجغرافية",
    runnable: true,
    parameters: [
      { id: "buffer-m", label: "Buffer distance (m)", labelAr: "مسافة الصدى (م)", type: "number", default: 500 },
      {
        id: "target", label: "Target layer", labelAr: "الطبقة المستهدفة",
        type: "select",
        options: [
          { value: "roads", label: "Roads", labelAr: "الطرق" },
          { value: "amenities", label: "Amenities", labelAr: "المرافق" },
        ],
        default: "amenities",
      },
    ],
    algorithmVersion: "turf-buffer-7",
  },
  {
    id: "analysis-coverage",
    name: "Service Coverage Analysis",
    nameAr: "تحليل التغطية الخدمية",
    description: "Compute population coverage within service catchments.",
    descriptionAr: "حساب تغطية السكان ضمن نطاقات الخدمة.",
    category: "Network accessibility", categoryAr: "إمكانية الوصول الشبكي",
    runnable: false,
    parameters: [],
    algorithmVersion: "isochrone-v2 (roadmap)",
  },
  {
    id: "analysis-routing",
    name: "Multi-stop Routing",
    nameAr: "مسار متعدد المحطات",
    description: "Optimal inspection route over classified road network.",
    descriptionAr: "مسار تفتيش أمثل عبر شبكة الطرق المُصنّفة.",
    category: "Routing", categoryAr: "التوجيه",
    runnable: false,
    parameters: [],
    algorithmVersion: "osrm-v6 (roadmap)",
  },
  {
    id: "analysis-terrain",
    name: "Terrain & Watershed Analysis",
    nameAr: "تحليل التضاريس والأحواض",
    description: "Slope, aspect and watershed delineation from DEM.",
    descriptionAr: "الميل والاتجاه وتعيين الأحواض من DEM.",
    category: "Terrain", categoryAr: "التضاريس",
    runnable: false,
    parameters: [],
    algorithmVersion: "richdem-v2 (roadmap)",
  },
];

export const ANALYSIS_RUNS: AnalysisRun[] = [
  {
    id: "run-2026-0916-01",
    analysisId: "analysis-site-suitability",
    analysisName: "Public Facility Site Suitability", analysisNameAr: "ملاءمة مواقع المرافق",
    startedAt: "2026-09-16T07:30:02Z", durationMs: 3800, status: "completed",
    userId: "u-001", userName: "Khalid Al-Otaibi", userNameAr: "خالد العتيبي",
    inputs: "aoi=riyadh-urban; facility=clinic; min-score=70",
    outputs: "1,240 parcels scored; 312 above threshold (25.2%)",
    outputsAr: "1,240 قطعة مُقيّمة؛ 312 فوق العتبة (25.2%)",
    algorithmVersion: "suitability-v1.4",
  },
  {
    id: "run-2026-0915-04",
    analysisId: "analysis-buffer",
    analysisName: "Buffer & Proximity Analysis", analysisNameAr: "تحليل الصدى",
    startedAt: "2026-09-15T14:10:00Z", durationMs: 1450, status: "completed",
    userId: "u-001", userName: "Khalid Al-Otaibi", userNameAr: "خالد العتيبي",
    inputs: "buffer=500m; target=amenities",
    outputs: "9,247 amenities buffered; 4.2 km² catchment total",
    outputsAr: "9,247 مرفق بصَدى؛ 4.2 كم² نطاق إجمالي",
    algorithmVersion: "turf-buffer-7",
  },
  {
    id: "run-2026-0914-09",
    analysisId: "analysis-site-suitability",
    analysisName: "Public Facility Site Suitability", analysisNameAr: "ملاءمة مواقع المرافق",
    startedAt: "2026-09-14T09:15:00Z", durationMs: 4250, status: "completed",
    userId: "u-002", userName: "Layla Al-Harbi", userNameAr: "ليلى الحربي",
    inputs: "aoi=riyadh-urban; facility=school; min-score=65",
    outputs: "1,240 parcels scored; 408 above threshold (32.9%)",
    outputsAr: "1,240 قطعة مُقيّمة؛ 408 فوق العتبة (32.9%)",
    algorithmVersion: "suitability-v1.4",
  },
];

// ───────── Activity feed ─────────
export const ACTIVITY: ActivityItem[] = [
  { id: "act-1", kind: "detection", message: "Detection det-001 created (conf. 0.94)", messageAr: "اكتشاف det-001 (ثقة 0.94)", actor: "System", actorAr: "النظام", timestamp: "2026-09-16T03:14:00Z" },
  { id: "act-2", kind: "alert", message: "Critical flood alert in Shemaysi", messageAr: "تنبيه سيول حرج في الشميسي", actor: "System", actorAr: "النظام", timestamp: "2026-09-16T06:48:00Z" },
  { id: "act-3", kind: "case", message: "Case GW-CASE-2041 moved to Inspection", messageAr: "الحالة GW-CASE-2041 انتقلت إلى التفتيش", actor: "Khalid Al-Otaibi", actorAr: "خالد العتيبي", timestamp: "2026-09-16T08:14:00Z" },
  { id: "act-4", kind: "analysis", message: "Site suitability run completed (3.8s)", messageAr: "اكتمل تحليل الملاءمة (3.8 ث)", actor: "Khalid Al-Otaibi", actorAr: "خالد العتيبي", timestamp: "2026-09-16T07:30:00Z" },
  { id: "act-5", kind: "detection", message: "det-008 rejected as false positive", messageAr: "det-008 رُفض كإيجابية كاذبة", actor: "Layla Al-Harbi", actorAr: "ليلى الحربي", timestamp: "2026-09-16T07:51:00Z" },
  { id: "act-6", kind: "dataset", message: "Riyadh Parcels ingested (482,910 features)", messageAr: "قطع الرياض مستوعبة (482,910 عنصر)", actor: "Riyadh Municipality API", actorAr: "واجهة أمانة الرياض", timestamp: "2026-09-15T18:00:00Z" },
  { id: "act-7", kind: "audit", message: "Cross-tenant access attempt denied", messageAr: "رُفضت محاولة وصول بين جهات", actor: "Anonymous", actorAr: "مجهول", timestamp: "2026-09-16T05:14:00Z" },
];

// ───────── Tenants (for admin module) ─────────
export const TENANTS = [
  {
    id: "t-momrah",
    name: "Ministry of Municipalities & Housing",
    nameAr: "وزارة الشؤون البلدية والقروية والإسكان",
    code: "MOMRAH",
    region: "Riyadh Province",
    regionAr: "منطقة الرياض",
    userCount: 1842,
    datasetCount: 38,
    activeCases: 27,
    classification: "confidential",
    dataResidency: "Saudi Arabia (Riyadh DC)",
    dataResidencyAr: "المملكة العربية السعودية (رياض)",
    status: "active",
  },
  {
    id: "t-sga",
    name: "Saudi Geospatial Authority",
    nameAr: "الهيئة السعودية للمساحة",
    code: "SGA",
    region: "National",
    regionAr: "وطني",
    userCount: 412,
    datasetCount: 64,
    activeCases: 3,
    classification: "restricted",
    dataResidency: "Saudi Arabia (Riyadh DC)",
    dataResidencyAr: "المملكة العربية السعودية (رياض)",
    status: "active",
  },
  {
    id: "t-moe",
    name: "Ministry of Environment",
    nameAr: "وزارة البيئة والمياه والزراعة",
    code: "MOE",
    region: "National",
    regionAr: "وطني",
    userCount: 698,
    datasetCount: 21,
    activeCases: 12,
    classification: "internal",
    dataResidency: "Saudi Arabia (Riyadh DC)",
    dataResidencyAr: "المملكة العربية السعودية (رياض)",
    status: "active",
  },
  {
    id: "t-rta",
    name: "Riyadh Transport Authority",
    nameAr: "هيئة transport منطقة الرياض",
    code: "RTA",
    region: "Riyadh Province",
    regionAr: "منطقة الرياض",
    userCount: 354,
    datasetCount: 14,
    activeCases: 8,
    classification: "internal",
    dataResidency: "Saudi Arabia (Riyadh DC)",
    dataResidencyAr: "المملكة العربية السعودية (رياض)",
    status: "active",
  },
];

// ───────── Dashboard KPIs ─────────
export const DASHBOARD_KPIS = {
  activeDatasets: 137,
  detections30d: 1842,
  openCases: 27,
  activeAlerts: 4,
  watchlists: 5,
  avgConfidence: 0.87,
  verifiedRate: 0.62,
  slaCompliance: 0.91,
  newDetectionsTrend: [12, 18, 14, 22, 28, 19, 24, 31, 27, 35, 29, 33], // last 12 days
  caseLoadByStatus: [
    { status: "new", count: 8 },
    { status: "investigating", count: 6 },
    { status: "inspection", count: 7 },
    { status: "review", count: 4 },
    { status: "closed", count: 18 },
  ],
  detectionsByType: [
    { type: "new_construction", count: 742 },
    { type: "encroachment", count: 384 },
    { type: "vegetation_loss", count: 268 },
    { type: "demolition", count: 196 },
    { type: "road_change", count: 142 },
    { type: "water_change", count: 110 },
  ],
  catalogGrowth: [
    { month: "Apr", count: 98 },
    { month: "May", count: 104 },
    { month: "Jun", count: 111 },
    { month: "Jul", count: 119 },
    { month: "Aug", count: 128 },
    { month: "Sep", count: 137 },
  ],
  alertsBySeverity: [
    { severity: "critical", count: 1 },
    { severity: "warning", count: 2 },
    { severity: "info", count: 1 },
  ],
};

// ───────── Map Real-Time Live Alerts (12 Active Riyadh Incidents) ─────────
export interface MapAlertItem {
  id: string;
  title: string;
  titleAr: string;
  category: string;
  severity: "critical" | "warning" | "info";
  lon: number;
  lat: number;
  district: string;
  districtAr: string;
  time: string;
  confidence: number;
  description: string;
  descriptionAr: string;
  recommendation: string;
  recommendationAr: string;
}

export const MAP_LIVE_ALERTS: MapAlertItem[] = [
  {
    id: "alert-003",
    title: "Critical Flash Flood & Standing Water Hazard",
    titleAr: "تجمع مياه سطحي وخطر سيول حرج",
    category: "flood",
    severity: "critical",
    lon: 46.656,
    lat: 24.641,
    district: "Ash Shemaysi",
    districtAr: "الشميسي",
    time: "15m ago",
    confidence: 0.98,
    description: "Hydrological surface sensor network and radar imagery identified severe standing water depth exceeding 48cm blocking the Shemaysi logistical service yard.",
    descriptionAr: "رصدت شبكة الحساسات الهيدرولوجية ورادار الأمطار تجمع مياه بارتفاع يتجاوز 48 سم يعيق ساحة الخدمات اللوجستية بحي الشميسي.",
    recommendation: "Activate municipal emergency drainage units and notify the Civil Defense operations room.",
    recommendationAr: "تفعيل صهاريج ومضخات الطوارئ البلدية وإشعار غرفة عمليات الدفاع المدني فوراً.",
  },
  {
    id: "alert-005",
    title: "Unauthorized Earthwork & Construction",
    titleAr: "حفريات غير مصرح بها وأعمال إنشائية",
    category: "construction",
    severity: "warning",
    lon: 46.688,
    lat: 24.732,
    district: "Al Olaya",
    districtAr: "العليا",
    time: "28m ago",
    confidence: 0.94,
    description: "High-resolution satellite imagery detected unauthorized earthworks and heavy machinery operating without active MOMRAH municipal permit.",
    descriptionAr: "رصدت صور الأقمار الصناعية عالية الدقة أعمال حفر غير مصرح بها ومعدات بناء تعمل دون رخصة بلدية سارية من أمانة الرياض.",
    recommendation: "Dispatch field inspection team from Al Olaya municipality branch and issue an electronic stop-work order.",
    recommendationAr: "توجيه فرقة تفتيش ميدانية من بلدية العليا وإصدار إشعار إيقاف أعمال إلكتروني فوري.",
  },
  {
    id: "alert-004",
    title: "Right-of-Way (ROW) Boundary Encroachment",
    titleAr: "تعدٍ على خط تنظيم وحرم الطريق العام",
    category: "encroachment",
    severity: "warning",
    lon: 46.642,
    lat: 24.802,
    district: "Al Malqa",
    districtAr: "الملقا",
    time: "42m ago",
    confidence: 0.84,
    description: "Perimeter fencing and storage containers erected 3.2 meters past the approved property line into the public right-of-way.",
    descriptionAr: "إقامة سياج مؤقت وحاويات تخزين تتجاوز خط التنظيم المعتمد بـ 3.2 متر داخل حرم الطريق العام بممر الملقا التجاري.",
    recommendation: "Issue 48-hour compliance violation via Balady platform and mandate physical setback.",
    recommendationAr: "إصدار إشعار مخالفة بمهلة 48 ساعة عبر منصة بلدي وإلزام المالك بالارتداد الفوري.",
  },
  {
    id: "alert-002",
    title: "Severe Thermal Anomaly at Industrial Facility",
    titleAr: "شذوذ حراري حرج بمنشأة صناعية",
    category: "thermal",
    severity: "critical",
    lon: 46.72,
    lat: 24.615,
    district: "South Industrial District",
    districtAr: "المدينة الصناعية الجنوبية",
    time: "1h ago",
    confidence: 0.96,
    description: "MODIS & thermal infrared sensors recorded an anomalous surface heat spike of 84°C indicating unventilated flare or material combustion.",
    descriptionAr: "رصدت الحساسات الحرارية بالأشعة تحت الحمراء ارتفاعاً حرارياً مفاجئاً إلى 84 درجة مئوية يشير إلى احتراق مواد غير منضبط.",
    recommendation: "Dispatch MODON industrial safety patrol and cross-reference real-time atmospheric emissions data.",
    recommendationAr: "إرسال دورية السلامة الصناعية من مدن والتحقق من قياسات الانبعاثات البيئية الفورية.",
  },
  {
    id: "alert-006",
    title: "Major Asphalt Rutting & Traffic Obstruction",
    titleAr: "هبوط إسفلتي وحادث مروري بالطريق الدائري",
    category: "traffic",
    severity: "warning",
    lon: 46.73,
    lat: 24.79,
    district: "Northern Ring Road (J3)",
    districtAr: "الطريق الدائري الشمالي (مخرج 3)",
    time: "2h ago",
    confidence: 0.89,
    description: "LiDAR road profiler detected 8.5cm pavement depression causing secondary lane obstruction and heavy localized traffic congestion.",
    descriptionAr: "رصدت كاميرات المراقبة وتحليل الليزر هبوطاً إسفلتياً بعمق 8.5 سم تسبب في إغلاق مسار فرعي وتباطؤ حركة المرور.",
    recommendation: "Dispatch rapid pavement repair contractor and coordinate traffic diversion with Riyadh Traffic Police.",
    recommendationAr: "توجيه مقاول الصيانة السريعة والتنسيق مع مرور منطقة الرياض لتحويل مسار الحركة.",
  },
  {
    id: "alert-001",
    title: "Vegetation Canopy Loss in Public Sector",
    titleAr: "فقدان غطاء نباتي بالحديقة العامة",
    category: "vegetation",
    severity: "info",
    lon: 46.695,
    lat: 24.73,
    district: "King Fahd District Park",
    districtAr: "حديقة حي الملك فهد",
    time: "3h ago",
    confidence: 0.77,
    description: "Automated multispectral NDVI index dropped by 34% over a 1,200m² sector following an irrigation mainline valve rupture.",
    descriptionAr: "انخفاض مؤشر الغطاء النباتي (NDVI) بنسبة 34% على مساحة 1200 م² نتيجة انقطاع في شبكة الري الآلية.",
    recommendation: "Trigger maintenance ticket for Parks Directorate irrigation technician team.",
    recommendationAr: "إصدار تذكرة صيانة لإدارة التشغيل والحدائق لإصلاح خطوط الري واستعادة المسطحات.",
  },
  {
    id: "alert-007",
    title: "Groundwater Seepage & Geotechnical Subsidence Hazard",
    titleAr: "تغلغل مياه جوفية وخطر هبوط أرضي جيوتقني",
    category: "sinkhole",
    severity: "critical",
    lon: 46.577,
    lat: 24.735,
    district: "Historical Diriyah Buffer",
    districtAr: "نطاق الدرعية التاريخية",
    time: "35m ago",
    confidence: 0.95,
    description: "Subsurface InSAR ground deformation radar and moisture probes detected 18mm localized subsidence and subterranean pooling threatening historical mudbrick structures.",
    descriptionAr: "رصدت مجسات قياس الهبوط الراداري (InSAR) ورطوبة التربة هبوطاً موضعياً بمقدار 18 ملم يهدد استقرار الأساسات التراثية بالدرعية.",
    recommendation: "Issue immediate structural preservation alert to Diriyah Gate Development Authority (DGDA) and deploy geotechnical grouting crew.",
    recommendationAr: "إصدار تنبيه حماية إنشائية فوري لهيئة تطوير بوابة الدرعية وتوجيه فريق حقن التربة الهندسي.",
  },
  {
    id: "alert-008",
    title: "Airborne Particulate PM10 Dust Surge",
    titleAr: "ارتفاع حاد في جسيمات الغبار العالقة PM10",
    category: "airquality",
    severity: "warning",
    lon: 46.702,
    lat: 24.954,
    district: "Airport Aviation Corridor",
    districtAr: "ممر مطار الملك خالد الدولي",
    time: "50m ago",
    confidence: 0.91,
    description: "Optical LiDAR and air quality station AP-04 recorded PM10 particulate levels of 245 µg/m³ driven by northeastern winds and unpaved perimeter staging.",
    descriptionAr: "سجلت محطة الرصد البيئي AP-04 تركيز غبار PM10 بلغ 245 ميكروغرام/م³ بسبب الرياح الشمالية ونشاط مشاريع لوجستية غير مرشوشة بالمياه.",
    recommendation: "Mandate automated chemical dust suppressant sprayers on surrounding project contractors and issue aviation advisory.",
    recommendationAr: "إلزام مقاولي المشاريع المحيطة بتشغيل أنظمة رش مثبتات الغبار وإصدار إشعار استباقي لإدارة المطار.",
  },
  {
    id: "alert-009",
    title: "Substation Transformer Thermal Overload",
    titleAr: "إجهاد حراري بمحول محطة التوزيع الكهربائي",
    category: "energy",
    severity: "warning",
    lon: 46.662,
    lat: 24.768,
    district: "KAFD Energy District",
    districtAr: "مركز الملك عبدالله المالي (كافد)",
    time: "1h 15m ago",
    confidence: 0.93,
    description: "SCADA telemetry and satellite thermal cameras identified a 92°C hotspot on Step-Down Transformer T-2 at KAFD Main Substation under 94% peak load.",
    descriptionAr: "رصدت أنظمة سكادا والقمر الصناعي الحراري بؤرة ساخنة بحرارة 92 درجة مئوية على المحول T-2 بمحطة تحويل كافد تحت حمل استهلاك مرتفع.",
    recommendation: "Coordinate load shedding with Saudi Electricity Company (SEC) and dispatch auxiliary mobile liquid nitrogen cooling unit.",
    recommendationAr: "التنسيق مع مركز التحكم بالشركة السعودية للكهرباء لإعادة موازنة الحمل وتوجيه صهريج التبريد السريع للمحطة.",
  },
  {
    id: "alert-010",
    title: "Unpermitted Hazardous Waste Dumping Site",
    titleAr: "موقع تفريغ مخلفات خطرة غير مرخص",
    category: "waste",
    severity: "critical",
    lon: 46.775,
    lat: 24.582,
    district: "Al Aziziyah Logistics Perimeter",
    districtAr: "محيط العزيزية اللوجستي",
    time: "1h 40m ago",
    confidence: 0.97,
    description: "Drone surveillance imagery identified illegal commercial dump trucks discarding 420 tons of construction debris and petrochemical polymers on unzoned desert land.",
    descriptionAr: "رصدت طائرات الاستطلاع المسيرة شاحنات تلقي 420 طناً من مخلفات الهدم وبوليمرات صناعية في أرض فضاء غير مخصصة جنوب الرياض.",
    recommendation: "Issue automated Balady smart plate citations, notify Riyadh Environmental Police, and mandate immediate hazardous site remediation.",
    recommendationAr: "إصدار مخالفات فورية عبر كاميرات الرصد الذكية لمركبات النقل وإشعار القوات الخاصة للأمن البيئي لتطهير الموقع.",
  },
  {
    id: "alert-011",
    title: "Riyadh Metro Line 3 Track Perimeter Intrusion",
    titleAr: "اختراق المحيط الأمني لمسار قطار الرياض (الخط 3)",
    category: "metro",
    severity: "critical",
    lon: 46.722,
    lat: 24.646,
    district: "Al Batha Central Transit",
    districtAr: "مركز البطحاء للنقل العام",
    time: "2h 10m ago",
    confidence: 0.99,
    description: "AI CCTV fence monitoring detected human breach and metal scaffolding encroaching within 1.8m of the 750V third-rail electrified metro track.",
    descriptionAr: "رصدت كاميرات الذكاء الاصطناعي اختراقاً للمحيط الأمني وسقالة حديدية على مسافة 1.8 متر من سكة القطار الكهربائية عالية الجهد.",
    recommendation: "Transmit automated slow-order (20 km/h) to approaching Trainset #308 and dispatch Royal Commission for Riyadh City (RCRC) security.",
    recommendationAr: "إرسال أمر تهدئة آلي (20 كم/س) للقطار القادم رقم 308 وتوجيه دوريات أمن النقل التابعة للهيئة الملكية لمدينة الرياض.",
  },
  {
    id: "alert-012",
    title: "Sky Bridge Dynamic Vibration & Wind Shear Load",
    titleAr: "اهتزازات ديناميكية وهبوب رياح بجسر المملكة المعلق",
    category: "structural",
    severity: "info",
    lon: 46.6744,
    lat: 24.7114,
    district: "Al Olaya Commercial Axis",
    districtAr: "محور العليا التجاري",
    time: "2h 45m ago",
    confidence: 0.88,
    description: "Structural health fiber-optic accelerometers measured 1.42 Hz micro-vibrations during 54 km/h high-altitude gusts at the 300m Kingdom Tower Sky Bridge.",
    descriptionAr: "سجلت حساسات الألياف الضوئية الإنشائية اهتزازات طفيفة بتردد 1.42 هرتز خلال هبات رياح علوية بلغت 54 كم/س بجسر برج المملكة.",
    recommendation: "Automated tuned mass dampers (TMD) verified stabilizing properly; continue sensor logging without visitor capacity restrictions.",
    recommendationAr: "التأكد من تشغيل مخمدات الكتلة الآلية (TMD) بنجاح والاستمرار في تسجيل البيانات دون الحاجة لإجراءات إخلاء.",
  },
];

// ───────── Reports & Publishing Module Data ─────────
export interface ReportItem {
  id: string;
  title: string;
  titleAr: string;
  type: "executive" | "inspection" | "environmental" | "audit" | "satellite";
  typeLabel: string;
  typeLabelAr: string;
  classification: "public" | "restricted" | "confidential";
  status: "draft" | "review" | "approved" | "published";
  district: string;
  districtAr: string;
  author: string;
  authorAr: string;
  approver: string;
  approverAr: string;
  createdAt: string;
  hijriDate: string;
  gregorianDate: string;
  summary: string;
  summaryAr: string;
  metrics: {
    incidentsCovered: number;
    aiConfidenceAvg: number;
    areaCoveredKm2: number;
    verifiedViolations: number;
  };
  keyFindings: string[];
  keyFindingsAr: string[];
  recommendations: string[];
  recommendationsAr: string[];
  signatureHash: string;
  downloadsCount: number;
  tags: string[];
}

export const REPORTS: ReportItem[] = [
  {
    id: "GW-REP-2026-0891",
    title: "Executive Geospatial Risk & Incident Digest",
    titleAr: "إحاطة المخاطر الجيومكانية والحوادث التنفيذية لمنطقة الرياض",
    type: "executive",
    typeLabel: "Executive Briefing",
    typeLabelAr: "إحاطة تنفيذية",
    classification: "confidential",
    status: "published",
    district: "Riyadh Metropolitan Basin",
    districtAr: "حوض الرياض الحضري الشامل",
    author: "Khalid Al-Otaibi",
    authorAr: "خالد العتيبي",
    approver: "H.E. Undersecretary for Urban Affairs",
    approverAr: "معالي وكيل الوزارة للشؤون الحضرية",
    createdAt: "2026-09-16T08:30:00Z",
    hijriDate: "٢٥ ربيع الأول ١٤٤٧هـ",
    gregorianDate: "16 September 2026",
    summary:
      "Comprehensive synthesis of 12 active incidents across the capital, prioritizing high-risk groundwater subsidence in Diriyah, standing water in Shemaysi, and unpermitted hazardous dumping in Al Aziziyah.",
    summaryAr:
      "ملخص تحليلي شامل لـ 12 حادثاً نشطاً بالعاصمة، مع إعطاء الأولوية القصوى للهبوط الأرضي بالدرعية، وتجمعات المياه بالشميسي، والتفريغ غير المرخص بالعزيزية.",
    metrics: {
      incidentsCovered: 12,
      aiConfidenceAvg: 93,
      areaCoveredKm2: 1840,
      verifiedViolations: 8,
    },
    keyFindings: [
      "InSAR radar confirms 18mm cumulative subsidence at Historical Diriyah buffer zone.",
      "Shemaysi standing water ponding reached 48cm depth following localized runoff.",
      "Drone patrol Unit Bravo-3 isolated 420 tons of hazardous polymer dumping in Al Aziziyah.",
      "Overall municipal SLA compliance remains strong at 91% across active inspector dispatches.",
    ],
    keyFindingsAr: [
      "رادار InSAR يؤكد هبوطاً تراكمياً بمقدار 18 ملم بنطاق حماية الدرعية التاريخية.",
      "تجمع مياه الشميسي بلغ عمق 48 سم إثر الجريان السطحي الموضعي.",
      "طائرة الاستطلاع Bravo-3 رصدت 420 طناً من النفايات البوليمرية بالعزيزية.",
      "امتثال اتفاقيات مستوى الخدمة البلدية (SLA) مستقر عند 91% عبر البلاغات الميدانية.",
    ],
    recommendations: [
      "Authorize emergency geotechnical grouting team deployment under DGDA coordination.",
      "Maintain 24-hour pump deployment at Shemaysi logistics yard.",
      "Issue automated commercial truck impound orders via Balady smart plate network.",
    ],
    recommendationsAr: [
      "اعتماد تحريك فريق حقن التربة الجيوتقني العاجل بالتنسيق مع بوابة الدرعية.",
      "إبقاء محطات الضخ المتنقلة بساحة الخدمات بالشميسي على مدار الساعة.",
      "إصدار أوامر حجز الشاحنات المخالفة آلياً عبر شبكة قراءة اللوحات بمنصة بلدي.",
    ],
    signatureHash: "0x8F94B2C819E024F44A39D87E442B0299596E87834CBA1F9",
    downloadsCount: 42,
    tags: ["Executive", "Hazards", "DGDA", "High-Priority"],
  },
  {
    id: "GW-REP-2026-0888",
    title: "Ash Shemaysi Flash Flood & Drainage Infiltration Assessment",
    titleAr: "تقرير تقييم السيول وتجمع المياه وحوض التصريف بحي الشميسي",
    type: "environmental",
    typeLabel: "Environmental Hazard",
    typeLabelAr: "خطر بيئي",
    classification: "restricted",
    status: "approved",
    district: "Ash Shemaysi",
    districtAr: "حي الشميسي",
    author: "Layla Al-Harbi",
    authorAr: "ليلى الحربي",
    approver: "Riyadh Civil Defense Directorate",
    approverAr: "مديرية الدفاع المدني بمنطقة الرياض",
    createdAt: "2026-09-15T14:20:00Z",
    hijriDate: "٢٤ ربيع الأول ١٤٤٧هـ",
    gregorianDate: "15 September 2026",
    summary:
      "Hydrological sensor data and radar precipitation cross-analysis documenting rainwater ponding, storm drain inlet capacity restrictions, and logistics terminal access blockage.",
    summaryAr:
      "تحليل مشترك لقراءات الحساسات الهيدرولوجية ورادار الأمطار يوثق تجمعات المياه واختناق مصائد التصريف وإعاقة مداخل المستودعات اللوجستية.",
    metrics: {
      incidentsCovered: 3,
      aiConfidenceAvg: 98,
      areaCoveredKm2: 14.2,
      verifiedViolations: 2,
    },
    keyFindings: [
      "Surface water reached 48cm depth at low-elevation culvert point CP-14.",
      "Sediment buildup reduced intake capacity by 62% in southern collector mains.",
      "Zero human casualties recorded; emergency service vehicles rerouted successfully.",
    ],
    keyFindingsAr: [
      "منسوب المياه السطحية بلغ 48 سم عند نقطة المفيض المنخفضة CP-14.",
      "تراكم الطمي خفض كفاءة مصائد التصريف بنسبة 62% بالمصبات الجنوبية.",
      "لم تسجل أي خسائر بشرية؛ تم تحويل مركبات الطوارئ بنجاح.",
    ],
    recommendations: [
      "Immediate vacuum excavation of sediment from 18 stormwater catch basins.",
      "Install dual ultrasonic water-level telemetry sensors at intersection J-09.",
    ],
    recommendationsAr: [
      "نزح الرواسب وتنظيف 18 فتحة تصريف فورياً عبر صهاريج الشفط الهيدروليكي.",
      "تركيب مجسين بالموجات فوق الصوتية لقياس المنسوب عند تقاطع J-09.",
    ],
    signatureHash: "0x4A1C92EF301889C5D0774B8A613E99238D4F1288BCA5901",
    downloadsCount: 19,
    tags: ["Drainage", "Rainfall", "Emergency"],
  },
  {
    id: "GW-REP-2026-0884",
    title: "Historical Diriyah Geotechnical Subsidence & InSAR Audit",
    titleAr: "تدقيق الهبوط الجيوتقني ورادار InSAR بنطاق الدرعية التاريخية",
    type: "audit",
    typeLabel: "Geotechnical Audit",
    typeLabelAr: "تدقيق جيوتقني",
    classification: "confidential",
    status: "approved",
    district: "Historical Diriyah Buffer",
    districtAr: "نطاق الدرعية التاريخية",
    author: "Fahad Al-Dossari",
    authorAr: "فهد الدوسري",
    approver: "Diriyah Gate Development Authority (DGDA)",
    approverAr: "هيئة تطوير بوابة الدرعية",
    createdAt: "2026-09-14T11:45:00Z",
    hijriDate: "٢٣ ربيع الأول ١٤٤٧هـ",
    gregorianDate: "14 September 2026",
    summary:
      "Interferometric Synthetic Aperture Radar (InSAR) time-series evaluation identifying subtle sub-centimeter ground deformation in proximity to heritage mudbrick architectural assets.",
    summaryAr:
      "تقييم السلاسل الزمنية للرادار التداخلي (InSAR) لرصد التشوهات الأرضية دون السنتيمترية بالقرب من مباني التراث الطيني القديمة.",
    metrics: {
      incidentsCovered: 1,
      aiConfidenceAvg: 95,
      areaCoveredKm2: 8.5,
      verifiedViolations: 0,
    },
    keyFindings: [
      "18mm localized vertical displacement identified across 4-month observation window.",
      "Groundwater table fluctuations correlated directly with micro-subsidence phases.",
      "Structural tilt sensors on historic watchtowers remain within safe tolerance margins (0.04°).",
    ],
    keyFindingsAr: [
      "هبوط رأسي موضعي قدره 18 ملم رُصد خلال فترة مراقبة امتدت لـ 4 أشهر.",
      "تذبذب منسوب المياه الجوفية ارتبط مباشرة بمراحل الهبوط الدقيق.",
      "حساسات الميل بأبراج المراقبة التراثية لا تزال ضمن حدود الأمان (0.04°).",
    ],
    recommendations: [
      "Deploy non-destructive micro-piling and low-pressure polyurethane grouting.",
      "Establish continuous real-time fiber-optic strain monitoring on primary foundations.",
    ],
    recommendationsAr: [
      "تنفيذ تدعيم دقيق وحقن بولي يوريثان منخفض الضغط لحماية الأساسات.",
      "تركيب ألياف ضوئية لقياس الإجهاد اللحظي على الجدران الحاملة الرئيسية.",
    ],
    signatureHash: "0x7B298E1A0F944CDA630129B729352F94240AA172C9B9844",
    downloadsCount: 31,
    tags: ["InSAR", "Diriyah", "Heritage", "Structural"],
  },
  {
    id: "GW-REP-2026-0879",
    title: "Al Olaya & Al Malqa Right-of-Way Building Encroachment Dossier",
    titleAr: "ملف مخالفات التعدي والارتدادات النظامية بحيي العليا والملقا",
    type: "inspection",
    typeLabel: "Field Inspection",
    typeLabelAr: "تفتيش ميداني",
    classification: "restricted",
    status: "review",
    district: "Al Olaya & Al Malqa",
    districtAr: "حي العليا والملقا",
    author: "Omar Al-Mutairi",
    authorAr: "عمر المطيري",
    approver: "Pending General Secretariat Approval",
    approverAr: "بانتظار اعتماد الأمانة العامة",
    createdAt: "2026-09-13T16:10:00Z",
    hijriDate: "٢٢ ربيع الأول ١٤٤٧هـ",
    gregorianDate: "13 September 2026",
    summary:
      "Satellite photogrammetry and field patrol documentation of unpermitted building line encroachments, unauthorized commercial storage yards, and perimeter fence violations.",
    summaryAr:
      "توثيق بالمسح التصويري الجوي والجولات الميدانية لتجاوزات خطوط التنظيم وساحات التخزين غير المرخصة وتعديات الأسوار على حرم الطريق.",
    metrics: {
      incidentsCovered: 5,
      aiConfidenceAvg: 89,
      areaCoveredKm2: 32.0,
      verifiedViolations: 5,
    },
    keyFindings: [
      "Al Malqa parcel #4811 fence encroaches 3.2m beyond approved masterplan boundary.",
      "Al Olaya commercial site executing excavation without an active municipal excavation permit.",
      "Total right-of-way area compromised exceeds 480 m² across 2 arterial corridors.",
    ],
    keyFindingsAr: [
      "قطعة أرض الملقا 4811 تتجاوز خط التنظيم بـ 3.2 متر في حرم الشارع العام.",
      "موقع تجاري بالعليا ينفذ حفريات دون رخصة حفر بلدية سارية.",
      "إجمالي المساحة المتعدى عليها بحرم الطرق يتجاوز 480 م² بمحورين رئيسيين.",
    ],
    recommendations: [
      "Issue 48-hour electronic compliance demand via Balady smart portal.",
      "Schedule demolition of non-compliant temporary perimeter fencing by municipality team.",
    ],
    recommendationsAr: [
      "إصدار إشعار تصحيح إلكتروني بمهلة 48 ساعة عبر بوابة بلدي.",
      "جدولة إزالة الأسوار المخالفة بواسطة فرق الإزالة البلدية في حال عدم الامتثال.",
    ],
    signatureHash: "0x19934B876DF9001A837C34D916B89832104F5E667ACBD82",
    downloadsCount: 14,
    tags: ["Encroachment", "Zoning", "Balady"],
  },
  {
    id: "GW-REP-2026-0872",
    title: "South Industrial District FLIR Thermal Anomaly & Emissions Dossier",
    titleAr: "ملف الشذوذ الحراري وانبعاثات المدينة الصناعية الثانية بالرياض",
    type: "environmental",
    typeLabel: "Thermal & Emissions",
    typeLabelAr: "حراري وانبعاثات",
    classification: "restricted",
    status: "published",
    district: "South Industrial Zone",
    districtAr: "المدينة الصناعية الثانية (جنوب الرياض)",
    author: "Noura Al-Shehri",
    authorAr: "نورة الشهري",
    approver: "Saudi Authority for Industrial Cities (MODON)",
    approverAr: "الهيئة السعودية للمدن الصناعية (مدن)",
    createdAt: "2026-09-11T09:00:00Z",
    hijriDate: "٢٠ ربيع الأول ١٤٤٧هـ",
    gregorianDate: "11 September 2026",
    summary:
      "Thermal infrared drone radiometry and Sentinel-3 thermal observation identifying anomalous 84°C heat signatures at chemical processing stacks.",
    summaryAr:
      "قياسات الأشعة تحت الحمراء بالمسيرات وقمر Sentinel-3 الحراري ترصد انبعاثات حرارية شاذة بلغت 84°م بمداخن مصانع بتروكيماوية.",
    metrics: {
      incidentsCovered: 4,
      aiConfidenceAvg: 96,
      areaCoveredKm2: 28.5,
      verifiedViolations: 3,
    },
    keyFindings: [
      "Thermal plume exceeds standard operating temperature thresholds by 26°C.",
      "Particulate PM2.5 sensors downwind recorded elevated levels (48 µg/m³).",
      "Factory automated scrubber systems were observed inactive during inspection timeframe.",
    ],
    keyFindingsAr: [
      "الانبعاث الحراري تجاوز المعدل التشغيلي المعتمد بـ 26 درجة مئوية.",
      "حساسات الجسيمات الدقيقة PM2.5 في اتجاه الرياح سجلت ارتفاعاً (48 ميكروغرام/م³).",
      "فلاتر التنقية الآلية للمصنع كانت متوقفة أثناء فترة المسح الجوي.",
    ],
    recommendations: [
      "Mandate immediate thermal stack calibration and report verification to MODON.",
      "Impose environmental safety surcharge as prescribed by National Environmental Executive Regulations.",
    ],
    recommendationsAr: [
      "إلزام المنشأة بمعايرة المداخن وتقديم تقرير تدقيق بيئي فوري لمدن.",
      "تطبيق الغرامات المقررة باللائحة التنفيذية لنظام البيئة الوطني.",
    ],
    signatureHash: "0x5E814A9922B104F5E667ACBD8237C34D916B89832104F5E",
    downloadsCount: 27,
    tags: ["MODON", "Thermal", "Emissions", "Industrial"],
  },
  {
    id: "GW-REP-2026-0865",
    title: "Riyadh Metro Line 3 Transit Safety Perimeter Review",
    titleAr: "مراجعة المحيط الأمني والسلامة التشغيلية لمسار قطار الرياض (الخط 3)",
    type: "satellite",
    typeLabel: "Transit Infrastructure",
    typeLabelAr: "بنية النقل والمترو",
    classification: "restricted",
    status: "draft",
    district: "Al Batha Central Transit Hub",
    districtAr: "مركز البطحاء للنقل العام",
    author: "Ziad Al-Ghamdi",
    authorAr: "زياد الغامدي",
    approver: "Royal Commission for Riyadh City (RCRC)",
    approverAr: "الهيئة الملكية لمدينة الرياض",
    createdAt: "2026-09-10T12:00:00Z",
    hijriDate: "١٩ ربيع الأول ١٤٤٧هـ",
    gregorianDate: "10 September 2026",
    summary:
      "Automated optical surveillance and security clearance evaluation detecting structural scaffolding and personnel within safety clearance buffer of electrified rail corridor.",
    summaryAr:
      "تقييم بالمراقبة البصرية الذكية لرصد سقالات وعمال بناء داخل النطاق الآمن للسكة المكهربة عالية الجهد بممر المترو الحيوي.",
    metrics: {
      incidentsCovered: 2,
      aiConfidenceAvg: 99,
      areaCoveredKm2: 4.8,
      verifiedViolations: 1,
    },
    keyFindings: [
      "Metal scaffold observed within 1.8m of the 750V electrified third rail.",
      "Standard required clearance is 5.0m during active transit operations.",
      "Transit security patrol responded within 6 minutes to establish exclusion zone.",
    ],
    keyFindingsAr: [
      "رصد سقالة معدنية على بعد 1.8 متر من القضيب المكهرب 750 فولت.",
      "المسافة النظامية المطلوبة 5.0 أمتار أثناء حركة القطارات النشطة.",
      "دورية أمن النقل باشرت الموقع خلال 6 دقائق وفرضت طوق العزل.",
    ],
    recommendations: [
      "Issue stop-work notice to facade maintenance contractor.",
      "Reinforce physical perimeter barriers along Batha viaduct corridor.",
    ],
    recommendationsAr: [
      "إصدار إشعار إيقاف أعمال لمقاول صيانة الواجهات.",
      "تعزيز الحواجز الأمنية على طول الجسر المعلق بالبطحاء.",
    ],
    signatureHash: "0x3344F5E667ACBD8237C34D916B89832104F5E667ACBD822",
    downloadsCount: 8,
    tags: ["Metro", "Transit", "RCRC", "Safety"],
  },
];

// Re-export geo for convenience
export { ALL_FEATURES, SAMPLE_AOI, DISTRICTS, DISTRICTS_BY_ID };
