/**
 * In-memory mutable data store for the GeoWise MVP.
 *
 * Seeds from the static dummy data on first access. Mutations persist for
 * the lifetime of the dev-server process, which is sufficient to demonstrate
 * end-to-end interactivity. In production this would be backed by Postgres +
 * PostGIS via Prisma.
 */

import {
  DATASETS,
  DETECTIONS,
  CASES,
  AUDIT_EVENTS,
  WATCHLISTS,
  ALERTS,
  ANALYSES,
  ANALYSIS_RUNS,
  ACTIVITY,
  TENANTS,
  DASHBOARD_KPIS,
  REPORTS,
  type Dataset,
  type Detection,
  type Case,
  type AuditEvent,
  type Alert,
  type AnalysisRun,
  type ReportItem,
} from "./dummy-data";

// Mutable copies (so callers can't mutate the seed directly)
const store = {
  datasets: [...DATASETS] as Dataset[],
  detections: [...DETECTIONS] as Detection[],
  cases: [...CASES] as Case[],
  audit: [...AUDIT_EVENTS] as AuditEvent[],
  watchlists: [...WATCHLISTS],
  alerts: [...ALERTS] as Alert[],
  analyses: [...ANALYSES],
  runs: [...ANALYSIS_RUNS] as AnalysisRun[],
  activity: [...ACTIVITY],
  tenants: [...TENANTS],
  reports: [...REPORTS] as ReportItem[],
  kpis: structuredClone(DASHBOARD_KPIS),
};

export type Store = typeof store;

// ─── Read helpers ───
export function getStore() {
  return store;
}

// ─── Mutation helpers ───

export function updateDetection(
  id: string,
  patch: Partial<Pick<Detection, "status" | "reviewedBy" | "caseId">>
): Detection | null {
  const det = store.detections.find((d) => d.id === id);
  if (!det) return null;
  Object.assign(det, patch);

  // Append an audit event for governance traceability.
  const action =
    patch.status === "verified"
      ? "Detection verified"
      : patch.status === "rejected"
        ? "Detection rejected (false positive)"
        : "Detection updated";
  pushAudit({
    id: `a-${Date.now()}`,
    timestamp: new Date().toISOString(),
    actor: "Khalid Al-Otaibi",
    actorAr: "خالد العتيبي",
    action,
    actionAr: action,
    target: det.id,
    targetAr: det.id,
    result: "success",
    ip: "10.42.7.19",
    tenantId: "t-momrah",
    tenantName: "MOMRAH",
    module: "M07 — AI Detection",
    details: `Detection ${det.id} set to ${det.status}.`,
  });
  return det;
}

export function createCaseFromDetection(detectionId: string): Case | null {
  const det = store.detections.find((d) => d.id === detectionId);
  if (!det) return null;

  const caseId = `GW-CASE-${2043 + store.cases.length}`;
  const newCase: Case = {
    id: caseId,
    title: `${det.typeName} — ${det.districtAr}`,
    titleAr: `${det.typeNameAr} — ${det.districtAr}`,
    description: `Auto-created from verified detection ${det.id}.`,
    descriptionAr: `منشأة تلقائياً من الاكتشاف ${det.id}.`,
    status: "new",
    priority: det.confidence > 0.85 ? "high" : "medium",
    district: det.district,
    districtAr: det.districtAr,
    assignedTo: "Inspector Faisal Al-Qahtani",
    assignedToAr: "المفتش فيصل القحطاني",
    createdAt: new Date().toISOString(),
    dueAt: new Date(Date.now() + 96 * 3600_000).toISOString(),
    slaHours: 96,
    slaRemainingHours: 96,
    source: "detection",
    sourceRef: det.id,
    inspections: [],
    evidenceCount: 0,
  };
  store.cases.unshift(newCase);
  det.caseId = caseId;

  pushAudit({
    id: `a-${Date.now() + 1}`,
    timestamp: new Date().toISOString(),
    actor: "Khalid Al-Otaibi",
    actorAr: "خالد العتيبي",
    action: "Case created",
    actionAr: "إنشاء حالة",
    target: caseId,
    targetAr: caseId,
    result: "success",
    ip: "10.42.7.19",
    tenantId: "t-momrah",
    tenantName: "MOMRAH",
    module: "M11 — Case Management",
    details: `Case ${caseId} created from detection ${det.id}.`,
  });
  return newCase;
}

export function updateCaseStatus(id: string, status: Case["status"]): Case | null {
  const c = store.cases.find((x) => x.id === id);
  if (!c) return null;
  c.status = status;
  pushAudit({
    id: `a-${Date.now()}`,
    timestamp: new Date().toISOString(),
    actor: "Khalid Al-Otaibi",
    actorAr: "خالد العتيبي",
    action: `Case moved to ${status}`,
    actionAr: `الحالة انتقلت إلى ${status}`,
    target: c.id,
    targetAr: c.id,
    result: "success",
    ip: "10.42.7.19",
    tenantId: "t-momrah",
    tenantName: "MOMRAH",
    module: "M11 — Case Management",
    details: `Case ${c.id} → ${status}.`,
  });
  return c;
}

export function acknowledgeAlert(id: string): Alert | null {
  const a = store.alerts.find((x) => x.id === id);
  if (!a) return null;
  a.acknowledged = true;
  return a;
}

export function createAnalysisRun(
  analysisId: string,
  params: Record<string, unknown>
): AnalysisRun | null {
  const def = store.analyses.find((a) => a.id === analysisId);
  if (!def) return null;

  const paramStr = Object.entries(params)
    .map(([k, v]) => `${k}=${v}`)
    .join("; ");

  // Simulate a deterministic result from params so the demo looks real.
  const hash = JSON.stringify(params).length;
  const durationMs = 1200 + (hash % 4000);
  const aboveThreshold = 200 + (hash % 250);
  const total = 1240;
  const pct = ((aboveThreshold / total) * 100).toFixed(1);

  const run: AnalysisRun = {
    id: `run-${Date.now()}`,
    analysisId: def.id,
    analysisName: def.name,
    analysisNameAr: def.nameAr,
    startedAt: new Date().toISOString(),
    durationMs,
    status: "completed",
    userId: "u-001",
    userName: "Khalid Al-Otaibi",
    userNameAr: "خالد العتيبي",
    inputs: paramStr,
    outputs: `${total.toLocaleString()} parcels scored; ${aboveThreshold} above threshold (${pct}%)`,
    outputsAr: `${total.toLocaleString()} قطعة مُقيّمة؛ ${aboveThreshold} فوق العتبة (${pct}%)`,
    algorithmVersion: def.algorithmVersion,
  };
  store.runs.unshift(run);

  pushAudit({
    id: `a-${Date.now() + 2}`,
    timestamp: new Date().toISOString(),
    actor: "Khalid Al-Otaibi",
    actorAr: "خالد العتيبي",
    action: "Analysis executed",
    actionAr: "تنفيذ تحليل",
    target: def.id,
    targetAr: def.id,
    result: "success",
    ip: "10.42.7.19",
    tenantId: "t-momrah",
    tenantName: "MOMRAH",
    module: "M05 — Spatial Analysis",
    details: `${def.name} run completed in ${durationMs}ms.`,
  });
  return run;
}

export function pushAudit(event: AuditEvent) {
  store.audit.unshift(event);
}

export function updateReport(
  id: string,
  patch: Partial<Pick<ReportItem, "status" | "approver" | "approverAr">>
): ReportItem | null {
  const rep = store.reports.find((r) => r.id === id);
  if (!rep) return null;
  Object.assign(rep, patch);
  pushAudit({
    id: `a-${Date.now()}`,
    timestamp: new Date().toISOString(),
    actor: "Khalid Al-Otaibi",
    actorAr: "خالد العتيبي",
    action: `Report ${patch.status ?? "updated"}`,
    actionAr: `تحديث حالة التقرير إلى ${patch.status ?? ""}`,
    target: id,
    targetAr: id,
    result: "success",
    ip: "10.42.7.19",
    tenantId: "t-momrah",
    tenantName: "MOMRAH",
    module: "M13.2 — Reports & Publishing",
    details: `Report status transitioned to ${patch.status}`,
  });
  return rep;
}

export function createReport(newReport: ReportItem): ReportItem {
  store.reports.unshift(newReport);
  pushAudit({
    id: `a-${Date.now()}`,
    timestamp: new Date().toISOString(),
    actor: newReport.author,
    actorAr: newReport.authorAr,
    action: "Report generated",
    actionAr: "إنشاء تقرير واستخبارات مكانية",
    target: newReport.id,
    targetAr: newReport.id,
    result: "success",
    ip: "10.42.7.19",
    tenantId: "t-momrah",
    tenantName: "MOMRAH",
    module: "M13.2 — Reports & Publishing",
    details: `Official report ${newReport.id} (${newReport.title}) compiled with signature ${newReport.signatureHash.slice(0, 10)}...`,
  });
  return newReport;
}

