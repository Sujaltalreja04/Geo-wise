import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureComplianceSeeded, generateSha256 } from "@/lib/compliance-service";

export const dynamic = "force-dynamic";

const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
  "text/csv",
  "image/png",
  "image/jpeg",
  "application/json",
  "text/plain",
]);

const FORBIDDEN_EXTENSIONS = [".exe", ".sh", ".bat", ".cmd", ".vbs", ".msi", ".dll", ".ps1"];

export async function GET(req: Request) {
  try {
    await ensureComplianceSeeded();
    const { searchParams } = new URL(req.url);
    const controlId = searchParams.get("controlId");
    const frameworkId = searchParams.get("frameworkId");
    const status = searchParams.get("status");
    const downloadId = searchParams.get("downloadId");
    const actor = searchParams.get("actor") || "Khalid Al-Otaibi";

    // Secure download simulation with authorization audit event
    if (downloadId) {
      const item = await db.complianceEvidence.findUnique({ where: { id: downloadId } });
      if (!item) return NextResponse.json({ error: "Evidence not found." }, { status: 404 });

      const auditId = `AUD-${Date.now()}`;
      await db.auditEvent.create({
        data: {
          id: auditId,
          actorId: "u-001",
          actorName: actor,
          action: "Evidence Downloaded",
          resourceType: "ComplianceEvidence",
          resourceId: downloadId,
          outcome: "success",
          details: `Authorized download of file ${item.originalFilename} (SHA256: ${item.checksumSha256.slice(0, 12)}...) by ${actor}.`,
          tamperProofHash: generateSha256(`${auditId}-${downloadId}-download`),
          timestamp: new Date(),
        },
      });

      return NextResponse.json({
        evidence: item,
        downloadUrl: `/api/compliance/evidence?stream=1&id=${downloadId}`,
        message: "Secure download authorization verified.",
      });
    }

    const where: Record<string, unknown> = { isArchived: false };
    if (controlId && controlId !== "all") where.controlId = controlId;
    if (frameworkId && frameworkId !== "all") where.frameworkId = frameworkId;
    if (status && status !== "all") where.reviewStatus = status;

    const evidences = await db.complianceEvidence.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ evidences });
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
      action = "upload", // "upload" | "verify" | "reject" | "archive"
      id,
      filename,
      mimeType = "application/pdf",
      fileSize = 1048576,
      frameworkId,
      controlId,
      assessmentId,
      owner,
      reviewNotes,
      expiryDate,
      actor = "Khalid Al-Otaibi",
    } = body;

    if (action === "upload") {
      if (!filename) {
        return NextResponse.json({ error: "Filename is required." }, { status: 400 });
      }

      const lowerName = filename.toLowerCase();
      if (FORBIDDEN_EXTENSIONS.some((ext) => lowerName.endsWith(ext))) {
        return NextResponse.json(
          { error: "Security rejection: Executable or script files are strictly prohibited." },
          { status: 400 }
        );
      }

      if (!ALLOWED_MIME_TYPES.has(mimeType)) {
        return NextResponse.json(
          { error: `Unsupported file type: ${mimeType}. Allowed formats: PDF, DOCX, XLSX, CSV, PNG, JPG, JSON, TXT.` },
          { status: 400 }
        );
      }

      const evidenceId = id || `EVD-${Date.now()}`;
      const safeStorageRef = `private/evidence/${new Date().getFullYear()}/${evidenceId}-${lowerName.replace(/[^a-z0-9_.-]/g, "_")}`;
      const checksum = generateSha256(`${filename}-${fileSize}-${Date.now()}`);

      const created = await db.complianceEvidence.create({
        data: {
          id: evidenceId,
          originalFilename: filename,
          storageRef: safeStorageRef,
          mimeType,
          fileSize: Number(fileSize),
          checksumSha256: checksum,
          frameworkId,
          controlId,
          assessmentId,
          owner: owner || actor,
          uploadedBy: actor,
          reviewStatus: "Pending",
          verificationNotes: "Uploaded into private secure repository. Awaiting formal review.",
          expiryDate: expiryDate || new Date(Date.now() + 365 * 86400000).toISOString().split("T")[0],
          version: 1,
        },
      });

      const auditId = `AUD-${Date.now()}`;
      await db.auditEvent.create({
        data: {
          id: auditId,
          actorId: "u-001",
          actorName: actor,
          action: "Evidence Uploaded",
          resourceType: "ComplianceEvidence",
          resourceId: evidenceId,
          outcome: "success",
          details: `Uploaded evidence ${filename} (${Math.round(fileSize / 1024)} KB) for Control ${controlId || "N/A"}.`,
          tamperProofHash: generateSha256(`${auditId}-${evidenceId}-${checksum}`),
          timestamp: new Date(),
        },
      });

      return NextResponse.json({ evidence: created }, { status: 201 });
    }

    if (action === "verify") {
      const item = await db.complianceEvidence.findUnique({ where: { id } });
      if (!item) return NextResponse.json({ error: "Evidence not found." }, { status: 404 });

      const updated = await db.complianceEvidence.update({
        where: { id },
        data: {
          reviewStatus: "Verified",
          verificationNotes: reviewNotes || `Verified by ${actor} on ${new Date().toISOString().split("T")[0]}`,
        },
      });

      const auditId = `AUD-${Date.now()}`;
      await db.auditEvent.create({
        data: {
          id: auditId,
          actorId: "u-001",
          actorName: actor,
          action: "Evidence Verified",
          resourceType: "ComplianceEvidence",
          resourceId: id,
          outcome: "success",
          details: `Evidence ${item.originalFilename} verified by ${actor}.`,
          tamperProofHash: generateSha256(`${auditId}-${id}-Verified`),
          timestamp: new Date(),
        },
      });

      return NextResponse.json({ evidence: updated });
    }

    if (action === "reject") {
      const item = await db.complianceEvidence.findUnique({ where: { id } });
      if (!item) return NextResponse.json({ error: "Evidence not found." }, { status: 404 });

      const updated = await db.complianceEvidence.update({
        where: { id },
        data: {
          reviewStatus: "Rejected",
          verificationNotes: reviewNotes || "Rejected during compliance review.",
        },
      });

      const auditId = `AUD-${Date.now()}`;
      await db.auditEvent.create({
        data: {
          id: auditId,
          actorId: "u-001",
          actorName: actor,
          action: "Evidence Rejected",
          resourceType: "ComplianceEvidence",
          resourceId: id,
          outcome: "success",
          details: `Evidence ${item.originalFilename} rejected. Reason: ${reviewNotes || "Not specified"}`,
          tamperProofHash: generateSha256(`${auditId}-${id}-Rejected`),
          timestamp: new Date(),
        },
      });

      return NextResponse.json({ evidence: updated });
    }

    if (action === "archive") {
      const item = await db.complianceEvidence.update({
        where: { id },
        data: { isArchived: true },
      });

      return NextResponse.json({ evidence: item });
    }

    return NextResponse.json({ error: "Unknown evidence action." }, { status: 400 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
