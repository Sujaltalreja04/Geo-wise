/**
 * GeoWise — Assessment Database & Seeding Service
 * Manages Prisma ORM queries, deterministic seeding of realistic Saudi planning assessments,
 * and analysis version tracking.
 */

import { prisma } from "@/lib/db";
import { runSpatialAssessment, type ProposalInput } from "./spatial-assessment-engine";
import { CADASTRAL_PARCELS } from "./development-assessment-data";

export interface CreateAssessmentDto extends ProposalInput {}

/**
 * Deterministic seeding to guarantee pre-populated assessments are available immediately.
 */
export async function ensureSeededAssessments() {
  try {
    const count = await prisma.siteAssessment.count();
    if (count > 0) {
      return;
    }

    // Seed 1: Al Olaya Mixed-Use Commercial Tower (Additional floors request)
    const seed1Input: ProposalInput = {
      siteName: "Al Olaya Prime Commercial Tower",
      siteNameAr: "برج العليا التجاري الاستثماري",
      applicantName: "Riyadh Real Estate Development Co. / شركة تطوير الرياض",
      authority: "Amanat Al-Riyadh (Central Planning Dept)",
      assessmentType: "additional_floors",
      proposedDetails: {
        proposedFloors: 10,
        currentAllowedFloors: 6,
        proposedHeightM: 35,
        currentMaxHeightM: 24,
        proposedLandUse: "Commercial Offices & Luxury Retail",
        currentZonedUse: "C-2 (Commercial Corridor)",
        proposedFAR: 3.2,
        currentMaxFAR: 2.5,
        proposedCoveragePct: 62,
        currentMaxCoveragePct: 60,
        proposedFrontSetbackM: 5.0,
        requiredFrontSetbackM: 6.0,
        proposedSideSetbackM: 2.5,
        requiredSideSetbackM: 2.5,
        notes: "Requesting +4 additional floors under Riyadh Downtown Densification Incentive.",
      },
      boundaryGeoJson: CADASTRAL_PARCELS.features[0].geometry,
    };
    const res1 = runSpatialAssessment(seed1Input);
    res1.id = "ASM-2026-001";
    await saveAssessmentResult(res1);

    // Seed 2: Al Malqa Commercial Strip (Land-use change request)
    const seed2Input: ProposalInput = {
      siteName: "Al Malqa Commercial Plaza & Clinics",
      siteNameAr: "مجمع الملقا التجاري والعيادات التخصصية",
      applicantName: "Al-Dar Urban Investments / شركة الدار للاستثمار العقاري",
      authority: "Amanat Al-Riyadh (North Sub-Municipality)",
      assessmentType: "land_use_change",
      proposedDetails: {
        proposedFloors: 4,
        currentAllowedFloors: 3,
        proposedHeightM: 16,
        currentMaxHeightM: 12,
        proposedLandUse: "Commercial Retail Strip & Day Surgery Clinics",
        currentZonedUse: "R-1 (Low-Density Residential Villa)",
        proposedFAR: 1.8,
        currentMaxFAR: 1.2,
        proposedCoveragePct: 58,
        currentMaxCoveragePct: 50,
        proposedFrontSetbackM: 6.0,
        requiredFrontSetbackM: 4.0,
        proposedSideSetbackM: 3.0,
        requiredSideSetbackM: 2.0,
        notes: "Requesting land use change from residential villa to commercial healthcare strip.",
      },
      boundaryGeoJson: CADASTRAL_PARCELS.features[1].geometry,
    };
    const res2 = runSpatialAssessment(seed2Input);
    res2.id = "ASM-2026-002";
    await saveAssessmentResult(res2);

    // Seed 3: Wadi Hanifah Eco-Hospitality Pavilion (Flood & environmental restriction)
    const seed3Input: ProposalInput = {
      siteName: "Wadi Hanifah Eco-Hospitality Lodge",
      siteNameAr: "نزل وادي حنيفة البيئي للضيافة المستدامة",
      applicantName: "Green Oasis Tourism Group / مجموعة الواحة الخضراء للسياحة",
      authority: "Royal Commission for Riyadh City (RCRC)",
      assessmentType: "general_development",
      proposedDetails: {
        proposedFloors: 2,
        currentAllowedFloors: 2,
        proposedHeightM: 8,
        currentMaxHeightM: 8,
        proposedLandUse: "Eco-Hospitality & Organic Restaurant",
        currentZonedUse: "ENV-R (Environmental Sensitive / Low Impact)",
        proposedFAR: 0.35,
        currentMaxFAR: 0.4,
        proposedCoveragePct: 18,
        currentMaxCoveragePct: 15,
        proposedFrontSetbackM: 12.0,
        requiredFrontSetbackM: 10.0,
        proposedSideSetbackM: 8.0,
        requiredSideSetbackM: 5.0,
        notes: "Eco-friendly pavilion adjacent to natural wadi stream corridor.",
      },
      boundaryGeoJson: CADASTRAL_PARCELS.features[3].geometry,
    };
    const res3 = runSpatialAssessment(seed3Input);
    res3.id = "ASM-2026-003";
    await saveAssessmentResult(res3);

    // Seed 4: An Nakheel Tech Park Hub (Setback variance & density)
    const seed4Input: ProposalInput = {
      siteName: "An Nakheel Innovation Campus",
      siteNameAr: "مجمع النخيل للابتكار والتقنية",
      applicantName: "Future Tech Real Estate / شركة تقنية المستقبل العقارية",
      authority: "Amanat Al-Riyadh (Al-Ma'ather Branch)",
      assessmentType: "setback_variance",
      proposedDetails: {
        proposedFloors: 7,
        currentAllowedFloors: 8,
        proposedHeightM: 28,
        currentMaxHeightM: 32,
        proposedLandUse: "Technology Research Labs & Shared Workspaces",
        currentZonedUse: "MU-3 (Mixed-Use Commercial/Residential)",
        proposedFAR: 2.9,
        currentMaxFAR: 3.0,
        proposedCoveragePct: 55,
        currentMaxCoveragePct: 60,
        proposedFrontSetbackM: 3.5,
        requiredFrontSetbackM: 5.0,
        proposedSideSetbackM: 2.2,
        requiredSideSetbackM: 3.0,
        notes: "Requesting 1.5m front setback variance along collector street curve.",
      },
      boundaryGeoJson: CADASTRAL_PARCELS.features[2].geometry,
    };
    const res4 = runSpatialAssessment(seed4Input);
    res4.id = "ASM-2026-004";
    await saveAssessmentResult(res4);
  } catch (error) {
    console.error("Failed to seed assessments:", error);
  }
}

/**
 * Persists an assessment execution result to SQLite via Prisma.
 */
export async function saveAssessmentResult(res: ReturnType<typeof runSpatialAssessment>) {
  return await prisma.siteAssessment.create({
    data: {
      id: res.id,
      siteName: res.siteName,
      siteNameAr: res.siteNameAr,
      applicantName: res.applicantName,
      authority: res.authority,
      assessmentType: res.assessmentType,
      status: res.status,
      overallSpatialVerdict: res.overallSpatialVerdict,
      executiveSummary: res.executiveSummary,
      executiveSummaryAr: res.executiveSummaryAr,
      address: res.address,
      city: res.city,
      district: res.district,
      latitude: res.latitude,
      longitude: res.longitude,
      areaM2: res.areaM2,
      perimeterM: res.perimeterM,
      administrativeArea: res.administrativeArea,
      crossesAdminBoundary: res.crossesAdminBoundary,
      proposedDetails: JSON.stringify(res.proposedDetails),
      boundaryGeoJson: JSON.stringify(res.boundaryGeoJson),
      originalBoundaryGeoJson: JSON.stringify(res.originalBoundaryGeoJson || res.boundaryGeoJson),
      isBoundaryCorrected: res.isBoundaryCorrected,
      analysisMethodVersion: res.analysisMethodVersion,
      dataFreshnessSummary: res.dataFreshnessSummary,
      criteria: {
        create: res.criteria.map((c) => ({
          criterionKey: c.criterionKey,
          title: c.title,
          titleAr: c.titleAr,
          existingCondition: c.existingCondition,
          proposedCondition: c.proposedCondition,
          measuredFinding: c.measuredFinding,
          status: c.status,
          evidenceSource: c.evidenceSource,
          sourceVersionDate: c.sourceVersionDate,
          analysisMethod: c.analysisMethod,
          limitations: c.limitations,
          followUpRequired: c.followUpRequired,
          sortOrder: c.sortOrder,
        })),
      },
      measurements: {
        create: res.measurements.map((m) => ({
          metricName: m.metricName,
          metricValue: m.metricValue,
          unit: m.unit,
          category: m.category,
          context: m.context,
        })),
      },
      dataGaps: {
        create: res.dataGaps.map((g) => ({
          datasetName: g.datasetName,
          gapType: g.gapType,
          description: g.description,
          severity: g.severity,
          impact: g.impact,
        })),
      },
      followUps: {
        create: res.followUps.map((f) => ({
          investigationType: f.investigationType,
          recommendation: f.recommendation,
          priority: f.priority,
        })),
      },
    },
  });
}

/**
 * Retrieves all assessments with criteria, measurements, data gaps, and follow-ups.
 */
export async function getAllAssessments() {
  await ensureSeededAssessments();
  return await prisma.siteAssessment.findMany({
    include: {
      criteria: { orderBy: { sortOrder: "asc" } },
      measurements: true,
      dataGaps: true,
      followUps: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Retrieves a single assessment by ID.
 */
export async function getAssessmentById(id: string) {
  await ensureSeededAssessments();
  return await prisma.siteAssessment.findUnique({
    where: { id },
    include: {
      criteria: { orderBy: { sortOrder: "asc" } },
      measurements: true,
      dataGaps: true,
      followUps: true,
    },
  });
}
