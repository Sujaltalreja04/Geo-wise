import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureComplianceSeeded, generateSha256 } from "@/lib/compliance-service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await ensureComplianceSeeded();
    const settings = await db.complianceSettings.findFirst({ where: { id: "default" } });
    return NextResponse.json({ settings });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await ensureComplianceSeeded();
    const body = await req.json();
    const {
      hostingProvider,
      hostingRegion,
      dataStorageLocation,
      mfaEnforced,
      encryptionAtRest,
      encryptionInTransit,
      backupFrequency,
      lastSuccessfulBackup,
      lastRecoveryTest,
      patchStatus,
      incidentResponseContact,
      retentionPolicyYears,
      independentApprovalRequired,
      actor = "Khalid Al-Otaibi",
    } = body;

    const updated = await db.complianceSettings.upsert({
      where: { id: "default" },
      update: {
        hostingProvider,
        hostingRegion,
        dataStorageLocation,
        mfaEnforced: Boolean(mfaEnforced),
        encryptionAtRest,
        encryptionInTransit,
        backupFrequency,
        lastSuccessfulBackup,
        lastRecoveryTest,
        patchStatus,
        incidentResponseContact,
        retentionPolicyYears: Number(retentionPolicyYears) || 5,
        independentApprovalRequired: Boolean(independentApprovalRequired),
        updatedAt: new Date(),
        updatedBy: actor,
      },
      create: {
        id: "default",
        hostingProvider: hostingProvider || "Saudi In-Kingdom Cloud (CST Classified)",
        hostingRegion: hostingRegion || "KSA Region - Riyadh Tier-IV Data Center",
        dataStorageLocation: dataStorageLocation || "In-Kingdom Sovereign Storage (Tier 2/3 Certified)",
        mfaEnforced: Boolean(mfaEnforced),
        encryptionAtRest: encryptionAtRest || "AES-256",
        encryptionInTransit: encryptionInTransit || "TLS 1.3 Strict Suite",
        backupFrequency: backupFrequency || "Automated Hourly Snapshots + Daily Georedundant Offsite",
        lastSuccessfulBackup: lastSuccessfulBackup || "2026-10-13 03:00:00 UTC",
        lastRecoveryTest: lastRecoveryTest || "2026-09-15 Passed",
        patchStatus: patchStatus || "Current",
        incidentResponseContact: incidentResponseContact || "cert@aseer.gov.sa",
        retentionPolicyYears: Number(retentionPolicyYears) || 5,
        independentApprovalRequired: Boolean(independentApprovalRequired),
        updatedBy: actor,
      },
    });

    const auditId = `AUD-${Date.now()}`;
    await db.auditEvent.create({
      data: {
        id: auditId,
        actorId: "u-001",
        actorName: actor,
        action: "Security Settings Updated",
        resourceType: "ComplianceSettings",
        resourceId: "default",
        outcome: "success",
        details: `Updated operational security controls and attestation records by ${actor}.`,
        tamperProofHash: generateSha256(`${auditId}-Settings-${actor}`),
        timestamp: new Date(),
      },
    });

    return NextResponse.json({ settings: updated });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
