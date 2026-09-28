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

// Re-export geo for convenience
export { ALL_FEATURES, SAMPLE_AOI, DISTRICTS, DISTRICTS_BY_ID };
