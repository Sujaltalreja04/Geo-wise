import assert from "node:assert";

const BASE_URL = process.env.TEST_URL || "http://localhost:3000";

async function runTests() {
  console.log("🚀 Starting GeoWise Compliance & Governance Module Integration Tests...\n");

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`✅ [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`❌ [FAIL] ${name}:`, err.message);
      failed++;
    }
  }

  // 1. Dashboard API
  await test("GET /api/compliance/dashboard returns real aggregated metrics", async () => {
    const res = await fetch(`${BASE_URL}/api/compliance/dashboard`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert(data.kpis, "kpis missing");
    assert(data.kpis.totalFrameworks >= 5, "expected at least 5 frameworks");
    assert(data.charts, "charts missing");
    assert(data.frameworkSummary, "frameworkSummary missing");
    assert(data.dataGovernanceAlerts, "dataGovernanceAlerts missing");
  });

  // 2. Frameworks API
  await test("GET /api/compliance/frameworks returns registered frameworks", async () => {
    const res = await fetch(`${BASE_URL}/api/compliance/frameworks`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert(Array.isArray(data.frameworks), "frameworks must be array");
    const ecc = data.frameworks.find((f) => f.id === "FW-NCA-ECC");
    assert(ecc, "NCA ECC framework missing");
    assert(ecc.name.includes("ECC"), "Expected ECC in name");
  });

  await test("POST /api/compliance/frameworks updates applicability status & logs audit", async () => {
    const res = await fetch(`${BASE_URL}/api/compliance/frameworks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: "FW-NCA-ECC",
        name: "NCA ECC 2:2024",
        applicabilityStatus: "Applicable",
        applicabilityRationale: "Ratified by Aseer SVC Legal Counsel memo LC-2026-14.",
        actor: "Dr. Tariq Al-Amri",
      }),
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.framework.applicabilityStatus, "Applicable");
  });

  // 3. Controls API
  await test("GET /api/compliance/controls supports category and status filters", async () => {
    const res = await fetch(`${BASE_URL}/api/compliance/controls?category=Data%20Governance`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert(Array.isArray(data.controls), "controls must be array");
    assert(data.controls.some((c) => c.category === "Data Governance"));
  });

  await test("POST /api/compliance/controls updates implementation status", async () => {
    const res = await fetch(`${BASE_URL}/api/compliance/controls`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: "ECC-2-1-4",
        frameworkId: "FW-NCA-ECC",
        title: "Cryptographic Protection for Geospatial Assets",
        implementationStatus: "Implemented",
        riskRating: "Critical",
        actor: "Saad Al-Qarni",
      }),
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.control.implementationStatus, "Implemented");
  });

  // 4. Assessments Workflow & Independent Approval Policy
  await test("POST /api/compliance/assessments rejects self-approval by assessor", async () => {
    // If assessor tries to approve their own assessment
    const res = await fetch(`${BASE_URL}/api/compliance/assessments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "approve",
        id: "ASM-2026-SVC-01",
        actor: "Mansour Al-Ghamdi (CISO Office)", // identical to assessor
      }),
    });
    assert.strictEqual(res.status, 403, "Assessor must not be permitted to self-approve");
  });

  await test("POST /api/compliance/assessments allows independent reviewer approval", async () => {
    const res = await fetch(`${BASE_URL}/api/compliance/assessments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "approve",
        id: "ASM-2026-SVC-01",
        actor: "Dr. Tariq Al-Amri", // independent reviewer
      }),
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.assessment.status, "Approved");
  });

  // 5. Evidence Security & Upload Restrictions
  await test("POST /api/compliance/evidence blocks forbidden executable file formats", async () => {
    const res = await fetch(`${BASE_URL}/api/compliance/evidence`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "upload",
        filename: "malicious_payload.exe",
        mimeType: "application/x-msdownload",
        actor: "Khalid Al-Otaibi",
      }),
    });
    assert.strictEqual(res.status, 400, "Executable extensions must be blocked");
  });

  await test("POST /api/compliance/evidence accepts valid PDF with SHA-256 hash", async () => {
    const res = await fetch(`${BASE_URL}/api/compliance/evidence`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "upload",
        filename: "SVC-Audit-Resolution-14.pdf",
        mimeType: "application/pdf",
        fileSize: 1240000,
        controlId: "ECC-1-1-1",
        actor: "Khalid Al-Otaibi",
      }),
    });
    assert.strictEqual(res.status, 201);
    const data = await res.json();
    assert(data.evidence.checksumSha256, "checksum must be computed");
    assert.strictEqual(data.evidence.checksumSha256.length, 64);
  });

  // 6. Findings & Risk Acceptance Workflow
  await test("POST /api/compliance/findings enforces justification & approver for risk acceptance", async () => {
    // Missing required justification
    const resInvalid = await fetch(`${BASE_URL}/api/compliance/findings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "accept_risk",
        id: "FND-2026-001",
      }),
    });
    assert.strictEqual(resInvalid.status, 400);

    // Valid acceptance with documented justification
    const resValid = await fetch(`${BASE_URL}/api/compliance/findings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "accept_risk",
        id: "FND-2026-001",
        riskAcceptanceJustification: "Mitigated by VPC ingress firewall rules while awaiting base image sprint.",
        riskAcceptedBy: "Dr. Tariq Al-Amri (SVC Committee)",
        riskExpiryDate: "2026-11-30",
        actor: "Khalid Al-Otaibi",
      }),
    });
    assert.strictEqual(resValid.status, 200);
    const data = await resValid.json();
    assert.strictEqual(data.finding.status, "Accepted Risk");
  });

  // 7. Spatial Data Governance & Data Gap Lifecycle
  await test("GET /api/compliance/data-governance returns official layers and gap register", async () => {
    const res = await fetch(`${BASE_URL}/api/compliance/data-governance`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert(Array.isArray(data.assets), "assets must be array");
    assert(Array.isArray(data.dataGaps), "dataGaps must be array");
    assert(data.assets.some((a) => a.classificationType === "Official"));
    assert(data.assets.some((a) => a.classificationType === "Reference-Only"));
  });

  // 8. Audit Trail & Cryptographic Tamper Protection
  await test("GET /api/compliance/audit returns tamper-evident events with hash validation", async () => {
    const res = await fetch(`${BASE_URL}/api/compliance/audit?verify=1`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert(Array.isArray(data.events), "events must be array");
    assert.strictEqual(data.integrityStatus.verified, true, "integrity check must pass");
    assert.strictEqual(data.integrityStatus.compromisedCount, 0);
  });

  // 9. Reports & Exports
  await test("GET /api/compliance/reports generates official reports with disclaimer", async () => {
    const res = await fetch(`${BASE_URL}/api/compliance/reports?type=framework_register`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert(data.title.includes("Framework Register"));
    assert(data.legalDisclaimer.includes("CONFIDENTIAL & ADVISORY"));
    assert(data.data.frameworks.length > 0);
  });

  await test("GET /api/compliance/reports?format=csv generates valid CSV export", async () => {
    const res = await fetch(`${BASE_URL}/api/compliance/reports?type=framework_register&format=csv`);
    assert.strictEqual(res.status, 200);
    assert(res.headers.get("content-type")?.includes("text/csv"));
    const text = await res.text();
    assert(text.startsWith("Framework ID,Name,Version"));
  });

  console.log(`\n========================================`);
  console.log(`📊 Test Results: ${passed} Passed, ${failed} Failed`);
  console.log(`========================================\n`);

  if (failed > 0) process.exit(1);
}

runTests();
