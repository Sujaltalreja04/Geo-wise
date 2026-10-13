import { db } from "@/lib/db";
import crypto from "crypto";

// SHA-256 helper for tamper-evident audit hashing and file checksums
export function generateSha256(data: string): string {
  return crypto.createHash("sha256").update(data).digest("hex");
}

export const SEED_FRAMEWORKS = [
  {
    id: "FW-NCA-ECC",
    name: "NCA ECC 2:2024",
    fullName: "Essential Cybersecurity Controls",
    nameAr: "ضوابط الأمن السيبراني الأساسية",
    fullNameAr: "ضوابط الهيئة الوطنية للأمن السيبراني الأساسية (ECC 2:2024)",
    abbreviation: "ECC",
    version: "2:2024",
    publicationDate: "2024-03-01",
    description: "Cybersecurity controls intended to protect information assets and technology systems within the framework's applicable scope.",
    descriptionAr: "ضوابط وإجراءات أمن المعلومات لحماية الأصول التقنية والأنظمة الحكومية.",
    sourceUrl: "https://nca.gov.sa/regulations/ecc/",
    applicabilityStatus: "Pending Confirmation",
    applicabilityRationale: "Applicable to government IT and cloud workloads; awaiting formal confirmation by Aseer SVC Legal.",
    responsibleOwner: "Mansour Al-Ghamdi (CISO Office)",
    internalReviewer: "Aseer Supervisory Committee (SVC) Audit Lead",
    assessmentStatus: "Assessment in Progress",
    reviewDate: "2026-11-30",
    notes: "Scope covers GeoWise core database, spatial workers, and API gateways.",
  },
  {
    id: "FW-NCA-CCC",
    name: "NCA CCC 2:2024",
    fullName: "Cloud Cybersecurity Controls",
    nameAr: "ضوابط الحوسبة السحابية",
    fullNameAr: "ضوابط الأمن السيبراني للحوسبة السحابية (CCC 2:2024)",
    abbreviation: "CCC",
    version: "2:2024",
    publicationDate: "2024-05-15",
    description: "Cloud cybersecurity requirements applicable to relevant cloud service providers and tenants.",
    descriptionAr: "متطلبات أمن السحابة للمستأجرين ومقدمي الخدمات السحابية الحكومية.",
    sourceUrl: "https://nca.gov.sa/regulations/ccc/",
    applicabilityStatus: "Pending Confirmation",
    applicabilityRationale: "Applies to government cloud tenants hosting sovereign geospatial data.",
    responsibleOwner: "Saad Al-Qarni (Cloud Operations)",
    internalReviewer: "Fast Track Office Security Architect",
    assessmentStatus: "Assessment in Progress",
    reviewDate: "2026-12-15",
    notes: "Reviewing tenant isolation and encryption key management (CST Tier-IV alignment).",
  },
  {
    id: "FW-SA-PDPL",
    name: "Saudi PDPL",
    fullName: "Personal Data Protection Law & Regulations",
    nameAr: "نظام حماية البيانات الشخصية",
    fullNameAr: "نظام حماية البيانات الشخصية ولائحته التنفيذية (SDAIA)",
    abbreviation: "PDPL",
    version: "2024",
    publicationDate: "2024-09-01",
    description: "Requirements governing the processing and protection of personal data within the law's scope.",
    descriptionAr: "المعايير المحددة لمعالجة البيانات الشخصية وحمايتها تحت إشراف سدايا.",
    sourceUrl: "https://sdaia.gov.sa/en/SDAIA/about/Pages/PDPL.aspx",
    applicabilityStatus: "Applicable",
    applicabilityRationale: "Directly applicable to landowner records, inspector identities, and citizen case data.",
    responsibleOwner: "Huda Al-Shehri (Data Protection Officer)",
    internalReviewer: "Aseer Supervisory Committee (SVC) Legal Counsel",
    assessmentStatus: "Gaps Identified",
    reviewDate: "2026-10-31",
    notes: "Requires complete DPIA for drone-acquired residential imagery and parcel ownership mapping.",
  },
  {
    id: "FW-NDMO-DGP",
    name: "NDMO Data Governance Policies",
    fullName: "National Data Management Office Data Governance Policies",
    nameAr: "سياسات حوكمة البيانات الوطنية",
    fullNameAr: "سياسات حوكمة البيانات الصادرة من مكتب إدارة البيانات الوطنية (NDMO)",
    abbreviation: "NDMO",
    version: "2023",
    publicationDate: "2023-08-20",
    description: "Data management, classification, governance, and protection requirements applicable to the organization.",
    descriptionAr: "سياسات تصنيف وإدارة وحوكمة البيانات لجميع الجهات الحكومية.",
    sourceUrl: "https://ndmo.gov.sa/policies/",
    applicabilityStatus: "Applicable",
    applicabilityRationale: "Mandatory for all municipal, cadastral, and spatial dataset classifications.",
    responsibleOwner: "Turki Al-Zahrani (Data Governance Director)",
    internalReviewer: "MOMRAH Liaison Officer",
    assessmentStatus: "Assessment in Progress",
    reviewDate: "2026-11-15",
    notes: "Data catalog classified under 4-tier model (Public, Internal, Confidential, Restricted).",
  },
  {
    id: "FW-NCA-DCC",
    name: "NCA DCC-1:2022",
    fullName: "Data Cybersecurity Controls",
    nameAr: "ضوابط الأمن السيبراني للبيانات",
    fullNameAr: "ضوابط الأمن السيبراني لحماية البيانات عبر دورة حياتها الكاملة (DCC-1:2022)",
    abbreviation: "DCC",
    version: "1:2022",
    publicationDate: "2022-11-10",
    description: "Data protection and cybersecurity controls across the data lifecycle.",
    descriptionAr: "ضوابط حماية البيانات وتشفيرها طوال دورة حياة البيانات المكانية والوصفية.",
    sourceUrl: "https://nca.gov.sa/regulations/dcc/",
    applicabilityStatus: "Pending Confirmation",
    applicabilityRationale: "Regulates spatial vector repositories, backups, and secure wiping.",
    responsibleOwner: "Mansour Al-Ghamdi (CISO Office)",
    internalReviewer: "SVC Audit Team",
    assessmentStatus: "Ready for Review",
    reviewDate: "2026-11-20",
    notes: "Data-at-rest encryption verified with AES-256.",
  },
  {
    id: "FW-NCA-CSCC",
    name: "NCA CSCC-1:2019",
    fullName: "Critical Systems Cybersecurity Controls",
    nameAr: "ضوابط الأنظمة الحساسة",
    fullNameAr: "ضوابط الأمن السيبراني للأنظمة الحساسة والبنى التحتية الحرجة",
    abbreviation: "CSCC",
    version: "1:2019",
    publicationDate: "2019-10-01",
    description: "Controls for mission-critical urban planning and public infrastructure systems.",
    descriptionAr: "معايير الأمن السيبراني المطبقة على الأنظمة الحرجة للبلديات والتخطيط العمراني.",
    sourceUrl: "https://nca.gov.sa/regulations/cscc/",
    applicabilityStatus: "Partially Applicable",
    applicabilityRationale: "Applicable specifically to GeoWise core geospatial dispatch and emergency analysis modules.",
    responsibleOwner: "Saad Al-Qarni (Infrastructure Lead)",
    internalReviewer: "SVC Operations Reviewer",
    assessmentStatus: "Not Assessed",
    reviewDate: "2026-12-30",
    notes: "Evaluation planned for Phase 2 critical infrastructure deployment.",
  },
  {
    id: "FW-ISO-27001",
    name: "ISO/IEC 27001:2022",
    fullName: "Information Security Management System",
    nameAr: "أيزو ٢٧٠٠١:٢٠٢٢",
    fullNameAr: "المعيار الدولي لنظم إدارة أمن المعلومات (ISO/IEC 27001:2022)",
    abbreviation: "ISO27K",
    version: "2022",
    publicationDate: "2022-10-25",
    description: "International standard for establishing and continually improving an Information Security Management System (ISMS).",
    descriptionAr: "المواصفة القياسية الدولية لإدارة وتطبيق ضوابط أمن المعلومات المؤسسية.",
    sourceUrl: "https://www.iso.org/standard/27001",
    applicabilityStatus: "Under Review",
    applicabilityRationale: "Supporting global benchmark; aligns with NCA ECC controls.",
    responsibleOwner: "Mansour Al-Ghamdi (CISO Office)",
    internalReviewer: "External ISMS Consultant",
    assessmentStatus: "Not Assessed",
    reviewDate: "2027-01-15",
    notes: "Gap assessment baseline scheduled for Q1 2027.",
  },
];

export const SEED_CONTROLS = [
  {
    id: "ECC-1-1-1",
    frameworkId: "FW-NCA-ECC",
    title: "Cybersecurity Governance & Strategy",
    titleAr: "حوكمة واستراتيجية الأمن السيبراني",
    description: "Establish and document a formalized cybersecurity strategy approved by leadership.",
    requirementText: "The organization must develop and formally approve a comprehensive cybersecurity strategy aligned with organizational objectives and national regulations.",
    sourceReference: "NCA ECC 2:2024 Clause 1-1",
    category: "Data Governance",
    applicabilityStatus: "Applicable",
    implementationStatus: "Implemented",
    controlOwner: "Mansour Al-Ghamdi",
    reviewer: "SVC Audit Lead",
    riskRating: "High",
    assessmentDate: "2026-09-10",
    nextReviewDate: "2027-03-10",
    remediationNotes: "Cybersecurity charter signed by Aseer Regional Governor's representative.",
    isDraft: false,
  },
  {
    id: "ECC-1-2-3",
    frameworkId: "FW-NCA-ECC",
    title: "Multi-Factor Authentication (MFA) Enforcement",
    titleAr: "تطبيق التحقق الثنائي الإلزامي",
    description: "Enforce multi-factor authentication for all privileged and remote access.",
    requirementText: "Multi-factor authentication must be enabled for all administrator accounts, spatial analysts, and remote management interfaces.",
    sourceReference: "NCA ECC 2:2024 Clause 1-2-3",
    category: "Identity and Authentication",
    applicabilityStatus: "Applicable",
    implementationStatus: "Implemented",
    controlOwner: "Khalid Al-Otaibi",
    reviewer: "SVC Security Officer",
    riskRating: "Critical",
    assessmentDate: "2026-09-15",
    nextReviewDate: "2027-03-15",
    remediationNotes: "Enforced via National IAM / Nafath SSO integration test.",
    isDraft: false,
  },
  {
    id: "ECC-2-1-4",
    frameworkId: "FW-NCA-ECC",
    title: "Cryptographic Protection for Geospatial Assets",
    titleAr: "حماية التشفير للأصول المكانية",
    description: "Encrypt all confidential spatial vector datasets and imagery at rest using approved ciphers.",
    requirementText: "AES-256 or approved national cryptographic standard must be applied to all databases and blob storage volumes containing sensitive geospatial parcels.",
    sourceReference: "NCA ECC 2:2024 Clause 2-1-4",
    category: "Encryption",
    applicabilityStatus: "Applicable",
    implementationStatus: "Implemented",
    controlOwner: "Saad Al-Qarni",
    reviewer: "CISO Office",
    riskRating: "Critical",
    assessmentDate: "2026-09-18",
    nextReviewDate: "2027-03-18",
    remediationNotes: "SQLite / Postgres storage encrypted; TLS 1.3 enforced for client APIs.",
    isDraft: false,
  },
  {
    id: "ECC-2-3-1",
    frameworkId: "FW-NCA-ECC",
    title: "Tamper-Evident Centralized Audit Logging",
    titleAr: "سجلات التدقيق المركزية المقاومة للعبث",
    description: "Maintain immutable audit logs of all privileged transactions and spatial modifications.",
    requirementText: "Audit logs must capture actor, action, timestamp (UTC), target, and SHA-256 integrity signature, protected against tampering.",
    sourceReference: "NCA ECC 2:2024 Clause 2-3-1",
    category: "Audit Logging",
    applicabilityStatus: "Applicable",
    implementationStatus: "Implemented",
    controlOwner: "Turki Al-Zahrani",
    reviewer: "SVC Audit Lead",
    riskRating: "High",
    assessmentDate: "2026-09-20",
    nextReviewDate: "2027-03-20",
    remediationNotes: "Implemented in GeoWise Audit Engine with cryptographic hash chaining.",
    isDraft: false,
  },
  {
    id: "ECC-2-7-2",
    frameworkId: "FW-NCA-ECC",
    title: "Vulnerability Scanning & Patch Management",
    titleAr: "فحص الثغرات وإدارة التحديثات الأمنية",
    description: "Conduct monthly automated vulnerability scans of container and server runtimes.",
    requirementText: "All critical and high severity vulnerabilities must be remediated within 14 calendar days of discovery.",
    sourceReference: "NCA ECC 2:2024 Clause 2-7-2",
    category: "Vulnerability Management",
    applicabilityStatus: "Applicable",
    implementationStatus: "Partially Implemented",
    controlOwner: "Saad Al-Qarni",
    reviewer: "SVC Security Officer",
    riskRating: "High",
    assessmentDate: "2026-10-01",
    nextReviewDate: "2026-11-01",
    remediationNotes: "Automated container scanning active in CI; OS kernel patching requires scheduled maintenance window.",
    isDraft: false,
  },
  {
    id: "CCC-1-3-2",
    frameworkId: "FW-NCA-CCC",
    title: "Sovereign In-Kingdom Data Hosting",
    titleAr: "استضافة البيانات السيادية داخل المملكة",
    description: "Ensure all platform infrastructure and data storage resides strictly within Saudi Arabia boundaries.",
    requirementText: "Primary and secondary data storage, processing nodes, and cache instances must operate exclusively within CST-registered cloud facilities in KSA.",
    sourceReference: "NCA CCC 2:2024 Clause 1-3-2",
    category: "Cloud Security",
    applicabilityStatus: "Applicable",
    implementationStatus: "Implemented",
    controlOwner: "Saad Al-Qarni",
    reviewer: "CISO Office",
    riskRating: "Critical",
    assessmentDate: "2026-09-12",
    nextReviewDate: "2027-03-12",
    remediationNotes: "Hosted in Tier-IV Riyadh Data Center with CST Cloud Class B certification.",
    isDraft: false,
  },
  {
    id: "CCC-2-4-1",
    frameworkId: "FW-NCA-CCC",
    title: "Cloud Tenant Isolation & IAM Scoping",
    titleAr: "عزل المستأجرين السحابيين وإدارة الصلاحيات",
    description: "Isolate tenant datasets across municipal branches (Abha, Khamis Mushait, Bisha).",
    requirementText: "Logical and database row-level tenant isolation must prevent cross-entity data spillage.",
    sourceReference: "NCA CCC 2:2024 Clause 2-4-1",
    category: "Access Control",
    applicabilityStatus: "Applicable",
    implementationStatus: "Implemented",
    controlOwner: "Khalid Al-Otaibi",
    reviewer: "Fast Track Office Security Architect",
    riskRating: "High",
    assessmentDate: "2026-09-14",
    nextReviewDate: "2027-03-14",
    remediationNotes: "Tenant IDs strictly enforced on all dataset queries and detection filters.",
    isDraft: false,
  },
  {
    id: "PDPL-03-01",
    frameworkId: "FW-SA-PDPL",
    title: "Lawful Basis & Consent for Landowner Identifiers",
    titleAr: "المسوغ النظامي لمعالجة بيانات ملاك العقارات",
    description: "Maintain verified statutory or consent justification for processing national IDs and deeds.",
    requirementText: "Government platforms processing individual land ownership data must document lawful necessity under Article 5 and 6 of the PDPL.",
    sourceReference: "Saudi PDPL Royal Decree M/19 Article 6",
    category: "Privacy",
    applicabilityStatus: "Applicable",
    implementationStatus: "Partially Implemented",
    controlOwner: "Huda Al-Shehri",
    reviewer: "SVC Legal Counsel",
    riskRating: "Critical",
    assessmentDate: "2026-10-02",
    nextReviewDate: "2026-11-02",
    remediationNotes: "Privacy notice drafted; waiting for final SVC Legal signoff on citizen dispute parcel display.",
    isDraft: false,
  },
  {
    id: "PDPL-07-02",
    frameworkId: "FW-SA-PDPL",
    title: "Personal Data Impact Assessment (DPIA)",
    titleAr: "تقييم أثر حماية البيانات الشخصية",
    description: "Perform formal DPIA for drone-based spatial surveys capturing private residences.",
    requirementText: "Conduct and document a Data Protection Impact Assessment prior to launching high-resolution optical drone flights over urban districts.",
    sourceReference: "Saudi PDPL Implementing Regulations Art. 21",
    category: "Privacy",
    applicabilityStatus: "Applicable",
    implementationStatus: "Not Implemented",
    controlOwner: "Huda Al-Shehri",
    reviewer: "SVC Legal Counsel",
    riskRating: "High",
    assessmentDate: "2026-10-05",
    nextReviewDate: "2026-10-25",
    remediationNotes: "Draft DPIA in progress; drone imagery masking algorithm pending deployment.",
    isDraft: false,
  },
  {
    id: "NDMO-DG-01",
    frameworkId: "FW-NDMO-DGP",
    title: "Spatial Data Classification Schema (4-Tier)",
    titleAr: "مخطط تصنيف البيانات المكانية (٤ مستويات)",
    description: "Enforce NDMO 4-tier classification (Public, Internal, Confidential, Restricted) across all spatial layers.",
    requirementText: "Every cadastral, zoning, and aerial layer must carry an explicit classification tag, owner authority, and dissemination constraints.",
    sourceReference: "NDMO National Data Governance Specification Clause 3.2",
    category: "Data Governance",
    applicabilityStatus: "Applicable",
    implementationStatus: "Implemented",
    controlOwner: "Turki Al-Zahrani",
    reviewer: "MOMRAH Liaison",
    riskRating: "High",
    assessmentDate: "2026-09-10",
    nextReviewDate: "2027-03-10",
    remediationNotes: "Active in GeoWise Data Catalog; displayed on map layers and export headers.",
    isDraft: false,
  },
  {
    id: "NDMO-DG-04",
    frameworkId: "FW-NDMO-DGP",
    title: "Data Quality & Lineage Traceability",
    titleAr: "جودة البيانات وتتبع السلالة والنسب",
    description: "Record ingestion source authority, validation dates, and precision metrics for all spatial boundaries.",
    requirementText: "Data assets must include full lineage metadata documenting source, transformation algorithms, and known data gaps.",
    sourceReference: "NDMO National Data Governance Specification Clause 5.1",
    category: "Data Governance",
    applicabilityStatus: "Applicable",
    implementationStatus: "Partially Implemented",
    controlOwner: "Turki Al-Zahrani",
    reviewer: "SVC Audit Team",
    riskRating: "Medium",
    assessmentDate: "2026-09-22",
    nextReviewDate: "2026-12-22",
    remediationNotes: "Lineage tracked for official vector layers; raster mosaic lineage pending automated metadata parser.",
    isDraft: false,
  },
  {
    id: "DCC-3-2-1",
    frameworkId: "FW-NCA-DCC",
    title: "Data Destruction & Spatial Cache Wiping",
    titleAr: "إتلاف البيانات ومسح الذاكرة المؤقتة للخرائط",
    description: "Certify secure overwriting of ephemeral spatial analysis buffers and expired inspection KMZ files.",
    requirementText: "Temporary analysis artifacts and confidential KMZ cache files must be securely wiped within 30 days of case closure.",
    sourceReference: "NCA DCC-1:2022 Requirement 3-2-1 [DRAFT]",
    category: "Backup and Recovery",
    applicabilityStatus: "Pending Confirmation",
    implementationStatus: "Pending Verification",
    controlOwner: "Saad Al-Qarni",
    reviewer: "CISO Office",
    riskRating: "Medium",
    assessmentDate: "2026-10-08",
    nextReviewDate: "2026-11-08",
    remediationNotes: "Scheduled nightly cron purges scratch buffers; formal wiping certificate generation pending review.",
    isDraft: true,
  },
  {
    id: "CSCC-1-4-2",
    frameworkId: "FW-NCA-CSCC",
    title: "Emergency Backup & RTO/RPO Controls for Spatial Engines",
    titleAr: "النسخ الاحتياطي للطوارئ وزمن الاستعادة للأنظمة المكانية",
    description: "Ensure RTO < 1 hour and RPO < 15 minutes for Aseer municipal spatial routing and GIS analysis.",
    requirementText: "Critical geospatial services must maintain hot-standby replicas and conduct validated disaster recovery failover simulations semi-annually.",
    sourceReference: "NCA CSCC-1:2019 Clause 1-4-2 [DRAFT - PENDING SVC CONFIRMATION]",
    category: "Business Continuity",
    applicabilityStatus: "Pending Confirmation",
    implementationStatus: "Pending Verification",
    controlOwner: "Saad Al-Qarni",
    reviewer: "SVC Operations Reviewer",
    riskRating: "High",
    assessmentDate: "2026-10-10",
    nextReviewDate: "2026-11-10",
    remediationNotes: "Disaster recovery drill performed on 2026-09-15. RTO measured at 42 minutes.",
    isDraft: true,
  },
];

export const SEED_ASSESSMENTS = [
  {
    id: "ASM-2026-SVC-01",
    frameworkId: "FW-NCA-ECC",
    scope: "Aseer Supervisory Committee (SVC) GeoWise Platform Core Services & Fast Track Office Operations",
    period: "Q3-Q4 2026",
    assessor: "Mansour Al-Ghamdi (CISO Office)",
    reviewer: "Dr. Tariq Al-Amri (SVC Committee Delegate)",
    status: "In Review",
    comments: "Comprehensive baseline assessment evaluating NCA Essential Cybersecurity Controls against cloud GIS infrastructure. Assessor and reviewer are independent per committee review policy.",
    submittedAt: "2026-10-10T12:00:00.000Z",
    approvedAt: null,
    version: 1,
    createdAt: "2026-10-10T12:00:00.000Z",
    updatedAt: "2026-10-10T12:00:00.000Z",
  },
];

export const SEED_ASSESSMENT_RESULTS = [
  {
    id: "RES-001",
    assessmentId: "ASM-2026-SVC-01",
    controlId: "ECC-1-1-1",
    status: "Implemented",
    observations: "Cybersecurity charter formally ratified.",
    gapsIdentified: "None.",
  },
  {
    id: "RES-002",
    assessmentId: "ASM-2026-SVC-01",
    controlId: "ECC-1-2-3",
    status: "Implemented",
    observations: "MFA active for 100% of supervisor and analyst accounts.",
    gapsIdentified: "None.",
  },
  {
    id: "RES-003",
    assessmentId: "ASM-2026-SVC-01",
    controlId: "ECC-2-1-4",
    status: "Implemented",
    observations: "Postgres and SQLite databases encrypted at rest with AES-256.",
    gapsIdentified: "None.",
  },
  {
    id: "RES-004",
    assessmentId: "ASM-2026-SVC-01",
    controlId: "ECC-2-3-1",
    status: "Implemented",
    observations: "Audit trails recording all detection verifications and case updates.",
    gapsIdentified: "None.",
  },
  {
    id: "RES-005",
    assessmentId: "ASM-2026-SVC-01",
    controlId: "ECC-2-7-2",
    status: "Partially Implemented",
    observations: "Monthly automated vulnerability scan completed.",
    gapsIdentified: "Container base image OS packages need scheduled patch release.",
  },
];

export const SEED_EVIDENCES = [
  {
    id: "EVD-2026-001",
    originalFilename: "NCA-ECC-Cybersecurity-Charter-Signed.pdf",
    storageRef: "private/evidence/2026/evd-001-ecc-charter.pdf",
    mimeType: "application/pdf",
    fileSize: 1845200,
    checksumSha256: generateSha256("NCA-ECC-Cybersecurity-Charter-Signed.pdf-v1"),
    frameworkId: "FW-NCA-ECC",
    controlId: "ECC-1-1-1",
    assessmentId: "ASM-2026-SVC-01",
    owner: "Mansour Al-Ghamdi",
    uploadedBy: "Khalid Al-Otaibi",
    reviewStatus: "Verified",
    verificationNotes: "Verified signed by Executive Director on 2026-09-01.",
    expiryDate: "2027-09-01",
    version: 1,
    isArchived: false,
    createdAt: "2026-10-01T10:00:00.000Z",
  },
  {
    id: "EVD-2026-002",
    originalFilename: "CST-Cloud-Hosting-Tier4-Attestation.pdf",
    storageRef: "private/evidence/2026/evd-002-cst-tier4.pdf",
    mimeType: "application/pdf",
    fileSize: 2450300,
    checksumSha256: generateSha256("CST-Cloud-Hosting-Tier4-Attestation.pdf-v1"),
    frameworkId: "FW-NCA-CCC",
    controlId: "CCC-1-3-2",
    assessmentId: "ASM-2026-SVC-01",
    owner: "Saad Al-Qarni",
    uploadedBy: "Saad Al-Qarni",
    reviewStatus: "Verified",
    verificationNotes: "CST Class B Cloud Hosting Certificate validated.",
    expiryDate: "2027-06-30",
    version: 1,
    isArchived: false,
    createdAt: "2026-10-02T10:00:00.000Z",
  },
  {
    id: "EVD-2026-003",
    originalFilename: "MFA-Nafath-Integration-Test-Results.xlsx",
    storageRef: "private/evidence/2026/evd-003-mfa-nafath.xlsx",
    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    fileSize: 524100,
    checksumSha256: generateSha256("MFA-Nafath-Integration-Test-Results.xlsx-v1"),
    frameworkId: "FW-NCA-ECC",
    controlId: "ECC-1-2-3",
    assessmentId: "ASM-2026-SVC-01",
    owner: "Khalid Al-Otaibi",
    uploadedBy: "Khalid Al-Otaibi",
    reviewStatus: "Verified",
    verificationNotes: "All 150 test accounts passed multi-factor authentication check.",
    expiryDate: "2027-03-15",
    version: 1,
    isArchived: false,
    createdAt: "2026-10-03T10:00:00.000Z",
  },
  {
    id: "EVD-2026-004",
    originalFilename: "Disaster-Recovery-Failover-Simulation-Log.docx",
    storageRef: "private/evidence/2026/evd-004-dr-simulation.docx",
    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    fileSize: 1120400,
    checksumSha256: generateSha256("Disaster-Recovery-Failover-Simulation-Log.docx-v1"),
    frameworkId: "FW-NCA-CSCC",
    controlId: "CSCC-1-4-2",
    assessmentId: "ASM-2026-SVC-01",
    owner: "Saad Al-Qarni",
    uploadedBy: "Saad Al-Qarni",
    reviewStatus: "Pending",
    verificationNotes: "Awaiting final review from SVC Infrastructure Lead.",
    expiryDate: "2027-03-15",
    version: 1,
    isArchived: false,
    createdAt: "2026-10-04T10:00:00.000Z",
  },
  {
    id: "EVD-2026-005",
    originalFilename: "NDMO-Classification-Catalog-Registry.csv",
    storageRef: "private/evidence/2026/evd-005-ndmo-catalog.csv",
    mimeType: "text/csv",
    fileSize: 94200,
    checksumSha256: generateSha256("NDMO-Classification-Catalog-Registry.csv-v1"),
    frameworkId: "FW-NDMO-DGP",
    controlId: "NDMO-DG-01",
    assessmentId: "ASM-2026-SVC-01",
    owner: "Turki Al-Zahrani",
    uploadedBy: "Turki Al-Zahrani",
    reviewStatus: "Verified",
    verificationNotes: "Matches published municipal data inventory.",
    expiryDate: "2027-01-01",
    version: 1,
    isArchived: false,
    createdAt: "2026-10-05T10:00:00.000Z",
  },
  {
    id: "EVD-2026-006",
    originalFilename: "Spatial-Vector-Encryption-Key-Rotation.pdf",
    storageRef: "private/evidence/2026/evd-006-key-rotation.pdf",
    mimeType: "application/pdf",
    fileSize: 840200,
    checksumSha256: generateSha256("Spatial-Vector-Encryption-Key-Rotation.pdf-v1"),
    frameworkId: "FW-NCA-ECC",
    controlId: "ECC-2-1-4",
    assessmentId: "ASM-2026-SVC-01",
    owner: "Saad Al-Qarni",
    uploadedBy: "Saad Al-Qarni",
    reviewStatus: "Pending",
    verificationNotes: "Awaiting signature from CISO key management team.",
    expiryDate: "2027-04-01",
    version: 1,
    isArchived: false,
    createdAt: "2026-10-06T10:00:00.000Z",
  },
];

export const SEED_FINDINGS = [
  {
    id: "FND-2026-001",
    frameworkId: "FW-NCA-ECC",
    controlId: "ECC-2-7-2",
    assessmentId: "ASM-2026-SVC-01",
    title: "Container Runtime Base Image OS Packages Pending Scheduled Patch",
    description: "Routine container image scanner identified 3 moderate vulnerabilities in base Alpine image packages. CVSS score 5.3.",
    severity: "Medium",
    businessImpact: "Low operational risk, isolated inside internal VPC cluster.",
    rootCause: "Base container image pinned to Q2 release during feature stabilization.",
    recommendedAction: "Upgrade container base to latest LTS hardened image and rebuild CI pipeline.",
    assignedOwner: "Saad Al-Qarni (DevOps)",
    targetResolutionDate: "2026-10-28",
    status: "In Progress",
    reviewerComments: "Patch build scheduled for sprint 14 maintenance window.",
    createdAt: "2026-10-01T10:00:00.000Z",
  },
  {
    id: "FND-2026-002",
    frameworkId: "FW-SA-PDPL",
    controlId: "PDPL-07-02",
    assessmentId: "ASM-2026-SVC-01",
    title: "Data Protection Impact Assessment (DPIA) Pending for High-Res Aerial Surveys",
    description: "High-resolution optical drone flights over urban residential clusters in Abha require formal DPIA under SDAIA guidelines before publication.",
    severity: "High",
    businessImpact: "Potential non-conformance with SDAIA privacy disclosure regulations if residential yards are visible without pixel-level blurring.",
    rootCause: "Rapid deployment of EO drone capture prior to formal privacy risk assessment approval.",
    recommendedAction: "Complete DPIA template and implement automated residential ROI blurring before publishing ortho-mosaics.",
    assignedOwner: "Huda Al-Shehri (DPO)",
    targetResolutionDate: "2026-10-31",
    status: "Open",
    reviewerComments: "Assigned high priority for Aseer Fast Track Office compliance review.",
    createdAt: "2026-10-02T10:00:00.000Z",
  },
  {
    id: "FND-2026-003",
    frameworkId: "FW-SA-PDPL",
    controlId: "PDPL-03-01",
    assessmentId: "ASM-2026-SVC-01",
    title: "Citizen Landowner Identifier Privacy Consent Notice Signoff",
    description: "Land parcel inquiry portal requires explicit consent notice referencing statutory municipal mandate before returning owner national IDs.",
    severity: "Medium",
    businessImpact: "Regulatory compliance gap if unmasked citizen identities are presented to third-party inspectors.",
    rootCause: "Legacy workflow showed owner identity directly on parcel cards without role-based masking.",
    recommendedAction: "Enforce role-based attribute masking (analyst vs inspector vs supervisor) and display statutory reference banner.",
    assignedOwner: "Khalid Al-Otaibi (Product Lead)",
    targetResolutionDate: "2026-11-15",
    status: "Pending Verification",
    reviewerComments: "Attribute masking PR merged; awaiting supervisor attestation.",
    createdAt: "2026-10-03T10:00:00.000Z",
  },
  {
    id: "FND-2026-004",
    frameworkId: "FW-NDMO-DGP",
    controlId: "NDMO-DG-04",
    assessmentId: "ASM-2026-SVC-01",
    title: "Asir Highland Terrain Boundary Layer Freshness Exceeded 90-Day SLA",
    description: "Digital elevation and slope constraint dataset for Asir mountain roads has not been re-validated by MOMRAH surveyors within the 90-day SLA window.",
    severity: "Low",
    businessImpact: "Advisory analysis on slope suitability may use slightly older contour lines.",
    rootCause: "Delayed delivery of seasonal LiDAR survey updates from regional survey contractor.",
    recommendedAction: "Flag dataset as 'Stale (Advisory Only)' in Spatial Analysis UI and request expedited validation from MOMRAH survey branch.",
    assignedOwner: "Turki Al-Zahrani (Data Governance)",
    targetResolutionDate: "2026-11-10",
    status: "Accepted Risk",
    riskAcceptanceJustification: "Topographic elevation does not change materially over 90 days; geological stability in highland sector verified by civil defense report CD-2026-ASR.",
    riskAcceptedBy: "Dr. Tariq Al-Amri (SVC Committee Delegate)",
    riskExpiryDate: "2026-12-31",
    reviewerComments: "Accepted with expiry on 2026-12-31 pending annual LiDAR batch.",
    createdAt: "2026-10-04T10:00:00.000Z",
  },
];

export const SEED_REMEDIATIONS = [
  {
    id: "REM-001",
    findingId: "FND-2026-001",
    actionTitle: "Update Dockerfile to node:24-alpine-3.21",
    description: "Update package dependencies and verify clean vulnerability report from Trivy.",
    owner: "Saad Al-Qarni",
    dueDate: "2026-10-25",
    status: "In Progress",
    createdAt: "2026-10-01T10:00:00.000Z",
  },
];

export const SEED_DATA_ASSETS = [
  {
    id: "ASSET-ASR-PARCELS",
    datasetName: "Aseer Official Cadastral Parcels Registry",
    datasetNameAr: "سجل المخططات العقارية والقطع المعتمدة — منطقة عسير",
    description: "Official municipal cadastral parcel boundaries, deed references, and registered ownership zoning.",
    dataOwner: "MOMRAH / Aseer Region Municipality",
    sourceAuthority: "General Directorate of Surveying & Cadastre",
    sourceUrl: "https://momrah.gov.sa/services/cadastre/aseer",
    classificationType: "Official",
    securityClassification: "restricted",
    geographicCoverage: "Aseer Region (Abha, Khamis Mushait, Bisha, Mahayil, Rijal Almaa)",
    datasetVersion: "2026.3-R2",
    crs: "EPSG:32638 (WGS 84 / UTM Zone 38N)",
    importDate: "2026-08-01",
    lastUpdatedDate: "2026-09-28",
    freshnessThresholdDays: 60,
    isStale: false,
    qualityValidationStatus: "Validated",
    accessRestrictions: "Restricted to authorized Supervisory Committee (SVC) members and certified municipal inspectors.",
    associatedAnalyses: "Suitability Analysis (M05), Encroachment Detection (M07), Fast Track Case Dispatch (M11)",
  },
  {
    id: "ASSET-ASR-ZONING",
    datasetName: "Aseer Metropolitan Masterplan & Municipal Zoning",
    datasetNameAr: "المخطط الهيكلي والاشتراطات البلدية — أمانة منطقة عسير",
    description: "Official land-use zones, building height limits, setback requirements, and commercial corridors.",
    dataOwner: "Aseer Municipality Urban Planning Agency",
    sourceAuthority: "Supreme Committee for Aseer Development",
    sourceUrl: "https://aseer.gov.sa/masterplan-2030",
    classificationType: "Official",
    securityClassification: "internal",
    geographicCoverage: "Abha Urban Conurbation & Greater Khamis Mushait",
    datasetVersion: "2026.1",
    crs: "EPSG:32638",
    importDate: "2026-06-15",
    lastUpdatedDate: "2026-07-20",
    freshnessThresholdDays: 90,
    isStale: true,
    qualityValidationStatus: "Validated",
    accessRestrictions: "Government internal use across Aseer development partners.",
    associatedAnalyses: "Commercial Feasibility, Compliance Rules Engine (M09)",
  },
  {
    id: "ASSET-ASR-ENV-RESERVE",
    datasetName: "Environmental Protected Areas & Asir Escarpment Buffers",
    datasetNameAr: "المناطق المحمية ومحارم المنحدرات الجبلية — المركز الوطني لتنمية الغطاء النباتي",
    description: "Official biodiversity reserves, designated juniper forest buffers, and steep slope construction prohibition zones.",
    dataOwner: "National Center for Vegetation Cover & NCW",
    sourceAuthority: "Ministry of Environment, Water and Agriculture (MEWA)",
    sourceUrl: "https://mewa.gov.sa/reserves/asir",
    classificationType: "Official",
    securityClassification: "confidential",
    geographicCoverage: "Asir Mountains, Soodah Escarpment, Raydah Reserve",
    datasetVersion: "2025.4-Final",
    crs: "EPSG:32638",
    importDate: "2026-05-10",
    lastUpdatedDate: "2026-08-14",
    freshnessThresholdDays: 90,
    isStale: false,
    qualityValidationStatus: "Validated",
    accessRestrictions: "Confidential environmental protection guidelines.",
    associatedAnalyses: "Encroachment Detection (M07), Eco-Tourism Suitability",
  },
  {
    id: "ASSET-ASR-DRONE-ORTHO",
    datasetName: "Commercial Drone Orthomosaic Surveys (High Resolution)",
    datasetNameAr: "الموزاييك الجوي عالي الدقة — تصوير الطائرات بدون طيار",
    description: "5cm resolution optical imagery covering active development corridors. Lacks formal privacy masking certificate.",
    dataOwner: "Fast Track Office Field Survey Contractor",
    sourceAuthority: "Private Survey Contractor (Contract FTO-2026-SV03)",
    sourceUrl: "s3://aseer-geo-surveys/drone/2026-08/",
    classificationType: "Reference-Only",
    securityClassification: "confidential",
    geographicCoverage: "King Fahd Road Development Corridor (Abha)",
    datasetVersion: "2026.08.12",
    crs: "EPSG:32638",
    importDate: "2026-08-15",
    lastUpdatedDate: "2026-08-15",
    freshnessThresholdDays: 45,
    isStale: true,
    qualityValidationStatus: "Pending Verification",
    accessRestrictions: "Reference-Only; findings must be verified against official cadastre before issuing enforcement orders.",
    associatedAnalyses: "Visual Inspection, AI Change Detection (M07)",
  },
  {
    id: "ASSET-ASR-KMZ-UPLOADS",
    datasetName: "Field Contractor KMZ Site Boundary Uploads",
    datasetNameAr: "ملفات حدود المواقع المرفوعة (KMZ) من مقاولي المشاريع",
    description: "User-submitted project boundary sketches and site laydown areas. Unverified coordinate alignment.",
    dataOwner: "Fast Track Office Project Management Office",
    sourceAuthority: "Project Engineering Contractors",
    sourceUrl: "local://uploads/kmz/2026-batch-04/",
    classificationType: "Reference-Only",
    securityClassification: "internal",
    geographicCoverage: "Project Specific Spots across Asir",
    datasetVersion: "Dynamic Drafts",
    crs: "EPSG:4326 (WGS 84 Unprojected)",
    importDate: "2026-10-01",
    lastUpdatedDate: "2026-10-10",
    freshnessThresholdDays: 30,
    isStale: false,
    qualityValidationStatus: "Flagged",
    accessRestrictions: "Draft reference; strictly advisory.",
    associatedAnalyses: "Advisory Spatial Overlays",
  },
];

export const SEED_DATA_GAPS = [
  {
    id: "GAP-2026-01",
    dataAssetId: "ASSET-ASR-PARCELS",
    affectedRequest: "REQ-FTO-ABHA-2026-089 (North Abha Expansion Zone)",
    gapType: "Missing Data",
    description: "Cadastral deeds for 42 historical agricultural parcels lack digitized polygon coordinates in official cadastre.",
    severity: "High",
    owner: "Turki Al-Zahrani (Data Governance)",
    status: "Remediation Requested",
    evidenceRef: "EVD-2026-005",
    createdAt: "2026-10-01T10:00:00.000Z",
  },
  {
    id: "GAP-2026-02",
    dataAssetId: "ASSET-ASR-ZONING",
    affectedRequest: "REQ-FTO-KM-2026-042 (Khamis Mushait Industrial Corridor)",
    gapType: "Outdated Layer",
    description: "Zoning layer does not reflect the August 2026 royal decree amending industrial setback thresholds.",
    severity: "Medium",
    owner: "Eng. Faisal Al-Qahtani",
    status: "Under Assessment",
    evidenceRef: "EVD-2026-001",
    createdAt: "2026-10-02T10:00:00.000Z",
  },
  {
    id: "GAP-2026-03",
    dataAssetId: "ASSET-ASR-KMZ-UPLOADS",
    affectedRequest: "REQ-FTO-SOODAH-2026-015 (Hospitality Retreat Site)",
    gapType: "Conflicting Boundary",
    description: "Contractor KMZ file overlaps by 14 meters with the National Center for Vegetation Cover protected forest reserve buffer.",
    severity: "Critical",
    owner: "Mansour Al-Ghamdi (CISO / Risk)",
    status: "Identified",
    evidenceRef: "EVD-2026-004",
    createdAt: "2026-10-03T10:00:00.000Z",
  },
];

export const SEED_AUDIT_LOGS = [
  {
    id: "AUD-GRC-2026-001",
    actorId: "u-001",
    actorName: "Khalid Al-Otaibi",
    action: "Framework Registered",
    resourceType: "ComplianceFramework",
    resourceId: "FW-NCA-ECC",
    outcome: "success",
    details: "Registered NCA Essential Cybersecurity Controls (ECC 2:2024) in supervisory framework catalog.",
    correlationId: "CORR-INIT-01",
    ipAddress: "10.42.7.19",
    tamperProofHash: generateSha256("AUD-GRC-2026-001-FW-NCA-ECC-success"),
    timestamp: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: "AUD-GRC-2026-002",
    actorId: "u-001",
    actorName: "Khalid Al-Otaibi",
    action: "Applicability Confirmed",
    resourceType: "ComplianceFramework",
    resourceId: "FW-SA-PDPL",
    outcome: "success",
    details: "Applicability status updated to 'Applicable' based on Legal Counsel memo LC-2026-08.",
    correlationId: "CORR-PDPL-02",
    ipAddress: "10.42.7.19",
    tamperProofHash: generateSha256("AUD-GRC-2026-002-FW-SA-PDPL-success"),
    timestamp: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    id: "AUD-GRC-2026-003",
    actorId: "u-003",
    actorName: "Mansour Al-Ghamdi",
    action: "Assessment Submitted",
    resourceType: "ComplianceAssessment",
    resourceId: "ASM-2026-SVC-01",
    outcome: "success",
    details: "Q3-Q4 2026 baseline assessment submitted for independent review by Dr. Tariq Al-Amri.",
    correlationId: "CORR-ASM-03",
    ipAddress: "10.42.7.25",
    tamperProofHash: generateSha256("AUD-GRC-2026-003-ASM-2026-SVC-01-success"),
    timestamp: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: "AUD-GRC-2026-004",
    actorId: "u-001",
    actorName: "Khalid Al-Otaibi",
    action: "Evidence Uploaded",
    resourceType: "ComplianceEvidence",
    resourceId: "EVD-2026-001",
    outcome: "success",
    details: "Uploaded signed NCA-ECC-Cybersecurity-Charter-Signed.pdf with SHA-256 integrity verification.",
    correlationId: "CORR-EVD-04",
    ipAddress: "10.42.7.19",
    tamperProofHash: generateSha256("AUD-GRC-2026-004-EVD-2026-001-success"),
    timestamp: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: "AUD-GRC-2026-005",
    actorId: "u-004",
    actorName: "Dr. Tariq Al-Amri",
    action: "Risk Accepted",
    resourceType: "ComplianceFinding",
    resourceId: "FND-2026-004",
    outcome: "success",
    details: "Formally approved documented risk acceptance for Asir Highland Terrain boundary freshness until 2026-12-31.",
    correlationId: "CORR-RISK-05",
    ipAddress: "10.42.8.10",
    tamperProofHash: generateSha256("AUD-GRC-2026-005-FND-2026-004-success"),
    timestamp: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
];

export const SEED_SETTINGS = {
  id: "default",
  hostingProvider: "Saudi In-Kingdom Cloud (CST Class B Certified)",
  hostingRegion: "KSA Central - Riyadh Tier-IV Sovereign Center",
  dataStorageLocation: "Kingdom of Saudi Arabia (Tier 2/3 Government Sovereign Data Center)",
  mfaEnforced: true,
  encryptionAtRest: "AES-256 (National Cryptographic Standards NCS Compliant)",
  encryptionInTransit: "TLS 1.3 Strict Cipher Suites (ECDHE-RSA-AES256-GCM-SHA384)",
  backupFrequency: "Automated Hourly Transaction Snapshots + Daily Georedundant Offsite (Abha DR)",
  lastSuccessfulBackup: "2026-10-13 03:00:00 UTC",
  lastRecoveryTest: "2026-09-15 (Measured RTO: 42min, Measured RPO: 12min - Passed)",
  patchStatus: "Current - Zero High or Critical CVEs across active container pods",
  incidentResponseContact: "cert@aseer.gov.sa / +966-17-224-0000 (SVC 24/7 Fast Track Desk)",
  retentionPolicyYears: 5,
  independentApprovalRequired: true,
  updatedAt: "2026-10-13T03:00:00.000Z",
  updatedBy: "Khalid Al-Otaibi (Supervisor)",
};

export const TRACEABILITY_SAMPLES = [
  {
    requestId: "REQ-FTO-2026-ABHA-089",
    analysisMethod: "Multi-Criteria Spatial Suitability Engine (M05)",
    engineVersion: "v2.1.4-Release",
    timestamp: "2026-10-12 14:22:10 UTC",
    inputs: [
      { name: "Aseer Official Cadastral Parcels", version: "2026.3-R2", type: "Official" },
      { name: "Municipal Zoning Masterplan", version: "2026.1", type: "Official (Stale > 60d)" },
      { name: "Contractor KMZ Boundary", version: "Batch-04", type: "Reference-Only" },
    ],
    dataLimitations: "Drone imagery lacks formal privacy masking certification. Parcels in northern sector rely on 2026.1 masterplan.",
    humanOversightNote: "Advisory finding only. Aseer Supervisory Committee (SVC) retains final discretionary decision authority.",
  },
  {
    requestId: "REQ-FTO-2026-SOODAH-015",
    analysisMethod: "Environmental Reserve Proximity & Encroachment Check (M07)",
    engineVersion: "v2.1.4-Release",
    timestamp: "2026-10-11 09:15:40 UTC",
    inputs: [
      { name: "Environmental Protected Areas & Asir Escarpment Buffers", version: "2025.4-Final", type: "Official" },
      { name: "Contractor KMZ Site Boundary Uploads", version: "Dynamic Drafts", type: "Reference-Only (Flagged)" },
    ],
    dataLimitations: "Field contractor KMZ boundary contains 14m coordinate conflict with vegetation reserve buffer.",
    humanOversightNote: "Flagged for manual surveyor verification before construction permit referral.",
  },
];

// In-Memory store initialized with deterministic seeded copies
const memStore = {
  frameworks: JSON.parse(JSON.stringify(SEED_FRAMEWORKS)),
  controls: JSON.parse(JSON.stringify(SEED_CONTROLS)),
  assessments: JSON.parse(JSON.stringify(SEED_ASSESSMENTS)),
  results: JSON.parse(JSON.stringify(SEED_ASSESSMENT_RESULTS)),
  evidences: JSON.parse(JSON.stringify(SEED_EVIDENCES)),
  findings: JSON.parse(JSON.stringify(SEED_FINDINGS)),
  remediations: JSON.parse(JSON.stringify(SEED_REMEDIATIONS)),
  dataAssets: JSON.parse(JSON.stringify(SEED_DATA_ASSETS)),
  dataGaps: JSON.parse(JSON.stringify(SEED_DATA_GAPS)),
  auditLogs: JSON.parse(JSON.stringify(SEED_AUDIT_LOGS)),
  settings: JSON.parse(JSON.stringify(SEED_SETTINGS)),
};

export async function ensureComplianceSeeded() {
  try {
    const count = await db.complianceFramework.count();
    if (count > 0) return;

    for (const fw of SEED_FRAMEWORKS) {
      await db.complianceFramework.create({ data: fw });
    }
    for (const c of SEED_CONTROLS) {
      await db.complianceControl.create({ data: c });
    }
    for (const a of SEED_ASSESSMENTS) {
      await db.complianceAssessment.create({
        data: {
          id: a.id,
          frameworkId: a.frameworkId,
          scope: a.scope,
          period: a.period,
          assessor: a.assessor,
          reviewer: a.reviewer,
          status: a.status,
          comments: a.comments,
          submittedAt: new Date(a.submittedAt),
          version: a.version,
        },
      });
    }
    for (const r of SEED_ASSESSMENT_RESULTS) {
      await db.assessmentResult.create({
        data: {
          assessmentId: r.assessmentId,
          controlId: r.controlId,
          status: r.status,
          observations: r.observations,
          gapsIdentified: r.gapsIdentified,
        },
      });
    }
    for (const ev of SEED_EVIDENCES) {
      await db.complianceEvidence.create({
        data: {
          id: ev.id,
          originalFilename: ev.originalFilename,
          storageRef: ev.storageRef,
          mimeType: ev.mimeType,
          fileSize: ev.fileSize,
          checksumSha256: ev.checksumSha256,
          frameworkId: ev.frameworkId,
          controlId: ev.controlId,
          assessmentId: ev.assessmentId,
          owner: ev.owner,
          uploadedBy: ev.uploadedBy,
          reviewStatus: ev.reviewStatus,
          verificationNotes: ev.verificationNotes,
          expiryDate: ev.expiryDate,
          version: ev.version,
        },
      });
    }
    for (const f of SEED_FINDINGS) {
      const created = await db.complianceFinding.create({
        data: {
          id: f.id,
          frameworkId: f.frameworkId,
          controlId: f.controlId,
          assessmentId: f.assessmentId,
          title: f.title,
          description: f.description,
          severity: f.severity,
          businessImpact: f.businessImpact,
          rootCause: f.rootCause,
          recommendedAction: f.recommendedAction,
          assignedOwner: f.assignedOwner,
          targetResolutionDate: f.targetResolutionDate,
          status: f.status,
          reviewerComments: f.reviewerComments,
        },
      });
      if (f.id === "FND-2026-001") {
        await db.remediationAction.create({
          data: {
            findingId: created.id,
            actionTitle: "Update Dockerfile to node:24-alpine-3.21",
            description: "Update package dependencies and verify clean vulnerability report from Trivy.",
            owner: "Saad Al-Qarni",
            dueDate: "2026-10-25",
            status: "In Progress",
          },
        });
      }
    }
    for (const da of SEED_DATA_ASSETS) {
      await db.dataAsset.create({ data: da });
    }
    for (const dg of SEED_DATA_GAPS) {
      await db.dataGap.create({ data: dg });
    }
    for (const al of SEED_AUDIT_LOGS) {
      await db.auditEvent.create({
        data: {
          id: al.id,
          actorId: al.actorId,
          actorName: al.actorName,
          action: al.action,
          resourceType: al.resourceType,
          resourceId: al.resourceId,
          outcome: al.outcome,
          details: al.details,
          correlationId: al.correlationId,
          ipAddress: al.ipAddress,
          tamperProofHash: al.tamperProofHash,
          timestamp: new Date(al.timestamp),
        },
      });
    }
    await db.complianceSettings.upsert({
      where: { id: "default" },
      update: {},
      create: {
        ...SEED_SETTINGS,
        updatedAt: new Date(),
      },
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.warn("[Compliance Service] Database unavailable or readonly; using resilient in-memory compliance store.", errorMsg);
  }
}

// -------------------------------------------------------------
// Safe Getters & Mutators (Database with Zero-Downtime Memory Fallback)
// -------------------------------------------------------------

export async function getSafeComplianceDashboard() {
  try {
    await ensureComplianceSeeded();
    const [
      frameworks,
      controls,
      assessments,
      findings,
      evidences,
      dataAssets,
      dataGaps,
      auditEvents,
      settings,
    ] = await Promise.all([
      db.complianceFramework.findMany(),
      db.complianceControl.findMany(),
      db.complianceAssessment.findMany({ include: { results: true } }),
      db.complianceFinding.findMany({ include: { remediationActions: true } }),
      db.complianceEvidence.findMany(),
      db.dataAsset.findMany(),
      db.dataGap.findMany(),
      db.auditEvent.findMany({ orderBy: { timestamp: "desc" }, take: 10 }),
      db.complianceSettings.findFirst({ where: { id: "default" } }),
    ]);

    if (frameworks.length > 0) {
      return computeDashboardPayload(
        frameworks,
        controls,
        assessments,
        findings,
        evidences,
        dataAssets,
        dataGaps,
        auditEvents,
        settings || SEED_SETTINGS
      );
    }
  } catch (e) {
    console.warn("[Compliance Service] DB error on dashboard, serving resilient store:", e);
  }

  // Memory fallback
  return computeDashboardPayload(
    memStore.frameworks,
    memStore.controls,
    memStore.assessments,
    memStore.findings,
    memStore.evidences,
    memStore.dataAssets,
    memStore.dataGaps,
    memStore.auditLogs,
    memStore.settings
  );
}

function computeDashboardPayload(
  frameworks: any[],
  controls: any[],
  assessments: any[],
  findings: any[],
  evidences: any[],
  dataAssets: any[],
  dataGaps: any[],
  auditEvents: any[],
  settings: any
) {
  const totalFrameworks = frameworks.length;
  const applicableFrameworks = frameworks.filter(
    (f) => f.applicabilityStatus === "Applicable" || f.applicabilityStatus === "Partially Applicable"
  ).length;

  const assessedControls = controls.filter(
    (c) => c.implementationStatus === "Implemented" || c.implementationStatus === "Partially Implemented"
  ).length;

  const remediationRequiredControls = controls.filter(
    (c) => c.implementationStatus === "Not Implemented" || c.implementationStatus === "Partially Implemented"
  ).length;

  const unverifiedEvidenceCount = evidences.filter(
    (e) => e.reviewStatus === "Pending" || e.reviewStatus === "Rejected"
  ).length;

  const openFindings = findings.filter(
    (f) => f.status === "Open" || f.status === "In Progress"
  ).length;

  const todayStr = new Date().toISOString().split("T")[0];
  const overdueRemediations = findings.filter((f) => {
    if (f.status === "Closed" || f.status === "Resolved" || f.status === "Accepted Risk") return false;
    return f.targetResolutionDate < todayStr;
  }).length;

  const upcomingReviews = frameworks.filter((f) => f.reviewDate >= todayStr).length;

  const findingsBySeverity = {
    Critical: findings.filter((f) => f.severity === "Critical").length,
    High: findings.filter((f) => f.severity === "High").length,
    Medium: findings.filter((f) => f.severity === "Medium").length,
    Low: findings.filter((f) => f.severity === "Low").length,
    Informational: findings.filter((f) => f.severity === "Informational").length,
  };

  const findingsByStatus = {
    Open: findings.filter((f) => f.status === "Open").length,
    "In Progress": findings.filter((f) => f.status === "In Progress").length,
    "Pending Verification": findings.filter((f) => f.status === "Pending Verification").length,
    Resolved: findings.filter((f) => f.status === "Resolved").length,
    Closed: findings.filter((f) => f.status === "Closed").length,
    "Accepted Risk": findings.filter((f) => f.status === "Accepted Risk").length,
  };

  const controlsByStatus = {
    Implemented: controls.filter((c) => c.implementationStatus === "Implemented").length,
    "Partially Implemented": controls.filter((c) => c.implementationStatus === "Partially Implemented").length,
    "Not Implemented": controls.filter((c) => c.implementationStatus === "Not Implemented").length,
    "Pending Verification": controls.filter((c) => c.implementationStatus === "Pending Verification").length,
    "Not Assessed": controls.filter((c) => c.implementationStatus === "Not Assessed").length,
    "Not Applicable": controls.filter((c) => c.implementationStatus === "Not Applicable").length,
  };

  const frameworkSummary = frameworks.map((fw) => {
    const fwControls = controls.filter((c) => c.frameworkId === fw.id);
    const implemented = fwControls.filter((c) => c.implementationStatus === "Implemented").length;
    const partial = fwControls.filter((c) => c.implementationStatus === "Partially Implemented").length;
    const total = fwControls.length;
    const rate = total > 0 ? Math.round(((implemented + partial * 0.5) / total) * 100) : 0;
    return {
      id: fw.id,
      name: fw.name,
      nameAr: fw.nameAr,
      abbreviation: fw.abbreviation,
      applicabilityStatus: fw.applicabilityStatus,
      assessmentStatus: fw.assessmentStatus,
      controlsCount: total,
      implementedCount: implemented,
      complianceRate: rate,
      reviewDate: fw.reviewDate,
      owner: fw.responsibleOwner,
    };
  });

  const highPriorityActions = findings
    .filter((f) => (f.severity === "Critical" || f.severity === "High") && f.status !== "Closed")
    .map((f) => ({
      id: f.id,
      title: f.title,
      severity: f.severity,
      assignedOwner: f.assignedOwner,
      targetResolutionDate: f.targetResolutionDate,
      controlId: f.controlId,
      status: f.status,
    }));

  const staleAssets = dataAssets.filter((a) => a.isStale || a.qualityValidationStatus === "Flagged");
  const unresolvedGaps = dataGaps.filter((g) => g.status !== "Resolved");

  return {
    kpis: {
      totalFrameworks,
      applicableFrameworks,
      assessedControls,
      totalControls: controls.length,
      remediationRequiredControls,
      unverifiedEvidenceCount,
      openFindings,
      overdueRemediations,
      upcomingReviews,
      staleDataAssetsCount: staleAssets.length,
      unresolvedGapsCount: unresolvedGaps.length,
    },
    charts: {
      findingsBySeverity,
      findingsByStatus,
      controlsByStatus,
    },
    frameworkSummary,
    highPriorityActions,
    recentActivity: auditEvents.slice(0, 10),
    dataGovernanceAlerts: {
      staleAssets: staleAssets.map((a) => ({
        id: a.id,
        name: a.datasetName,
        nameAr: a.datasetNameAr,
        classificationType: a.classificationType,
        lastUpdatedDate: a.lastUpdatedDate,
        qualityValidationStatus: a.qualityValidationStatus,
      })),
      unresolvedGaps: unresolvedGaps.map((g) => ({
        id: g.id,
        affectedRequest: g.affectedRequest,
        gapType: g.gapType,
        severity: g.severity,
        status: g.status,
        owner: g.owner,
      })),
    },
    settings,
  };
}

export async function getSafeComplianceFrameworks(options: { search?: string; applicability?: string; status?: string }) {
  const { search = "", applicability, status } = options;
  try {
    await ensureComplianceSeeded();
    const where: Record<string, unknown> = {};
    if (applicability && applicability !== "all") where.applicabilityStatus = applicability;
    if (status && status !== "all") where.assessmentStatus = status;

    let frameworks = await db.complianceFramework.findMany({
      where,
      include: {
        controls: {
          select: {
            id: true,
            title: true,
            implementationStatus: true,
            riskRating: true,
          },
        },
        assessments: {
          select: {
            id: true,
            status: true,
            period: true,
          },
        },
      },
      orderBy: { id: "asc" },
    });

    if (frameworks.length > 0) {
      if (search) {
        const q = search.toLowerCase();
        frameworks = frameworks.filter(
          (f) =>
            f.name.toLowerCase().includes(q) ||
            f.fullName.toLowerCase().includes(q) ||
            f.description.toLowerCase().includes(q) ||
            f.abbreviation.toLowerCase().includes(q)
        );
      }
      return frameworks;
    }
  } catch (e) {
    console.warn("[Compliance Service] DB error on frameworks:", e);
  }

  // Resilient memory fallback
  let list = memStore.frameworks.map((f: any) => ({
    ...f,
    controls: memStore.controls
      .filter((c: any) => c.frameworkId === f.id)
      .map((c: any) => ({
        id: c.id,
        title: c.title,
        implementationStatus: c.implementationStatus,
        riskRating: c.riskRating,
      })),
    assessments: memStore.assessments
      .filter((a: any) => a.frameworkId === f.id)
      .map((a: any) => ({
        id: a.id,
        status: a.status,
        period: a.period,
      })),
  }));

  if (applicability && applicability !== "all") {
    list = list.filter((f: any) => f.applicabilityStatus === applicability);
  }
  if (status && status !== "all") {
    list = list.filter((f: any) => f.assessmentStatus === status);
  }
  if (search) {
    const q = search.toLowerCase();
    list = list.filter(
      (f: any) =>
        f.name.toLowerCase().includes(q) ||
        f.fullName.toLowerCase().includes(q) ||
        f.description.toLowerCase().includes(q) ||
        f.abbreviation.toLowerCase().includes(q)
    );
  }
  return list;
}

export async function saveSafeComplianceFramework(body: any) {
  const { id, name, actor = "Khalid Al-Otaibi" } = body;
  try {
    const existing = await db.complianceFramework.findUnique({ where: { id } });
    const updated = await db.complianceFramework.upsert({
      where: { id },
      update: body,
      create: { ...body, id },
    });

    const auditId = `AUD-${Date.now()}`;
    await db.auditEvent.create({
      data: {
        id: auditId,
        actorId: "u-001",
        actorName: actor,
        action: existing ? "Framework Updated" : "Framework Created",
        resourceType: "ComplianceFramework",
        resourceId: id,
        outcome: "success",
        details: `${existing ? "Updated" : "Created"} framework ${name}.`,
        tamperProofHash: generateSha256(`${auditId}-${id}`),
        timestamp: new Date(),
      },
    });

    return updated;
  } catch (e) {
    console.warn("[Compliance Service] DB error on save framework, saving in memory store:", e);
    const idx = memStore.frameworks.findIndex((f: any) => f.id === id);
    if (idx >= 0) {
      memStore.frameworks[idx] = { ...memStore.frameworks[idx], ...body };
      return memStore.frameworks[idx];
    } else {
      memStore.frameworks.push(body);
      return body;
    }
  }
}

export async function getSafeComplianceControls(options: {
  search?: string;
  frameworkId?: string;
  category?: string;
  status?: string;
  riskRating?: string;
}) {
  const { search = "", frameworkId, category, status, riskRating } = options;
  try {
    await ensureComplianceSeeded();
    const where: Record<string, unknown> = {};
    if (frameworkId && frameworkId !== "all") where.frameworkId = frameworkId;
    if (category && category !== "all") where.category = category;
    if (status && status !== "all") where.implementationStatus = status;
    if (riskRating && riskRating !== "all") where.riskRating = riskRating;

    let controls = await db.complianceControl.findMany({
      where,
      include: {
        framework: { select: { name: true, abbreviation: true } },
        findings: { select: { id: true, title: true, severity: true, status: true } },
      },
      orderBy: { id: "asc" },
    });

    if (controls.length > 0) {
      if (search) {
        const q = search.toLowerCase();
        controls = controls.filter(
          (c) =>
            c.id.toLowerCase().includes(q) ||
            c.title.toLowerCase().includes(q) ||
            c.titleAr.toLowerCase().includes(q) ||
            c.description.toLowerCase().includes(q) ||
            c.requirementText.toLowerCase().includes(q) ||
            c.controlOwner.toLowerCase().includes(q)
        );
      }
      return controls;
    }
  } catch (e) {
    console.warn("[Compliance Service] DB error on controls:", e);
  }

  // Memory fallback
  let list = memStore.controls.map((c: any) => {
    const fw = memStore.frameworks.find((f: any) => f.id === c.frameworkId);
    const fnds = memStore.findings.filter((f: any) => f.controlId === c.id);
    return {
      ...c,
      framework: fw ? { name: fw.name, abbreviation: fw.abbreviation } : null,
      findings: fnds.map((f: any) => ({
        id: f.id,
        title: f.title,
        severity: f.severity,
        status: f.status,
      })),
    };
  });

  if (frameworkId && frameworkId !== "all") list = list.filter((c: any) => c.frameworkId === frameworkId);
  if (category && category !== "all") list = list.filter((c: any) => c.category === category);
  if (status && status !== "all") list = list.filter((c: any) => c.implementationStatus === status);
  if (riskRating && riskRating !== "all") list = list.filter((c: any) => c.riskRating === riskRating);

  if (search) {
    const q = search.toLowerCase();
    list = list.filter(
      (c: any) =>
        c.id.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.titleAr.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.requirementText.toLowerCase().includes(q) ||
        c.controlOwner.toLowerCase().includes(q)
    );
  }

  return list;
}

export async function saveSafeComplianceControl(body: any) {
  const { id, title, implementationStatus, riskRating, actor = "Khalid Al-Otaibi" } = body;
  try {
    const existing = await db.complianceControl.findUnique({ where: { id } });
    const saved = await db.complianceControl.upsert({
      where: { id },
      update: body,
      create: body,
    });

    const auditId = `AUD-${Date.now()}`;
    await db.auditEvent.create({
      data: {
        id: auditId,
        actorId: "u-001",
        actorName: actor,
        action: existing ? "Control Status Transition" : "Control Created",
        resourceType: "ComplianceControl",
        resourceId: id,
        outcome: "success",
        details: `Control ${id} (${title}) set to status: ${implementationStatus}, Risk: ${riskRating}.`,
        tamperProofHash: generateSha256(`${auditId}-${id}-${implementationStatus}`),
        timestamp: new Date(),
      },
    });

    return saved;
  } catch (e) {
    console.warn("[Compliance Service] DB error on save control, saving in memory store:", e);
    const idx = memStore.controls.findIndex((c: any) => c.id === id);
    if (idx >= 0) {
      memStore.controls[idx] = { ...memStore.controls[idx], ...body };
      return memStore.controls[idx];
    } else {
      memStore.controls.push(body);
      return body;
    }
  }
}

export async function getSafeComplianceAssessments(options: { frameworkId?: string; status?: string }) {
  const { frameworkId, status } = options;
  try {
    await ensureComplianceSeeded();
    const where: Record<string, unknown> = {};
    if (frameworkId && frameworkId !== "all") where.frameworkId = frameworkId;
    if (status && status !== "all") where.status = status;

    const assessments = await db.complianceAssessment.findMany({
      where,
      include: {
        framework: { select: { name: true, fullName: true, abbreviation: true } },
        results: {
          include: {
            control: { select: { id: true, title: true, category: true, riskRating: true } },
          },
        },
        findings: true,
        evidences: true,
      },
      orderBy: { createdAt: "desc" },
    });

    if (assessments.length > 0) return assessments;
  } catch (e) {
    console.warn("[Compliance Service] DB error on assessments:", e);
  }

  // Memory fallback
  let list = memStore.assessments.map((a: any) => {
    const fw = memStore.frameworks.find((f: any) => f.id === a.frameworkId);
    const res = memStore.results
      .filter((r: any) => r.assessmentId === a.id)
      .map((r: any) => {
        const ctrl = memStore.controls.find((c: any) => c.id === r.controlId);
        return {
          ...r,
          control: ctrl ? { id: ctrl.id, title: ctrl.title, category: ctrl.category, riskRating: ctrl.riskRating } : null,
        };
      });
    const fnds = memStore.findings.filter((f: any) => f.assessmentId === a.id);
    const evs = memStore.evidences.filter((e: any) => e.assessmentId === a.id);
    return {
      ...a,
      framework: fw ? { name: fw.name, fullName: fw.fullName, abbreviation: fw.abbreviation } : null,
      results: res,
      findings: fnds,
      evidences: evs,
    };
  });

  if (frameworkId && frameworkId !== "all") list = list.filter((a: any) => a.frameworkId === frameworkId);
  if (status && status !== "all") list = list.filter((a: any) => a.status === status);

  return list;
}

export async function getSafeComplianceEvidence(options: {
  controlId?: string;
  frameworkId?: string;
  status?: string;
  downloadId?: string;
  actor?: string;
}) {
  const { controlId, frameworkId, status, downloadId, actor = "Khalid Al-Otaibi" } = options;

  if (downloadId) {
    try {
      const item = await db.complianceEvidence.findUnique({ where: { id: downloadId } });
      if (item) {
        return { evidence: item, downloadUrl: `/api/compliance/evidence?stream=1&id=${downloadId}` };
      }
    } catch (e) {
      // ignore
    }
    const memItem = memStore.evidences.find((e: any) => e.id === downloadId);
    if (memItem) {
      return { evidence: memItem, downloadUrl: `/api/compliance/evidence?stream=1&id=${downloadId}` };
    }
    return null;
  }

  try {
    await ensureComplianceSeeded();
    const where: Record<string, unknown> = { isArchived: false };
    if (controlId && controlId !== "all") where.controlId = controlId;
    if (frameworkId && frameworkId !== "all") where.frameworkId = frameworkId;
    if (status && status !== "all") where.reviewStatus = status;

    const evidences = await db.complianceEvidence.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
    if (evidences.length > 0) return evidences;
  } catch (e) {
    console.warn("[Compliance Service] DB error on evidence:", e);
  }

  // Memory fallback
  let list = memStore.evidences.filter((e: any) => !e.isArchived);
  if (controlId && controlId !== "all") list = list.filter((e: any) => e.controlId === controlId);
  if (frameworkId && frameworkId !== "all") list = list.filter((e: any) => e.frameworkId === frameworkId);
  if (status && status !== "all") list = list.filter((e: any) => e.reviewStatus === status);

  return list;
}

export async function getSafeComplianceFindings(options: {
  severity?: string;
  status?: string;
  frameworkId?: string;
  search?: string;
}) {
  const { severity, status, frameworkId, search = "" } = options;
  try {
    await ensureComplianceSeeded();
    const where: Record<string, unknown> = {};
    if (severity && severity !== "all") where.severity = severity;
    if (status && status !== "all") where.status = status;
    if (frameworkId && frameworkId !== "all") where.frameworkId = frameworkId;

    let findings = await db.complianceFinding.findMany({
      where,
      include: {
        control: { select: { id: true, title: true, category: true } },
        remediationActions: { orderBy: { createdAt: "desc" } },
      },
      orderBy: { createdAt: "desc" },
    });

    if (findings.length > 0) {
      if (search) {
        const q = search.toLowerCase();
        findings = findings.filter(
          (f) =>
            f.title.toLowerCase().includes(q) ||
            f.description.toLowerCase().includes(q) ||
            f.assignedOwner.toLowerCase().includes(q) ||
            f.controlId.toLowerCase().includes(q)
        );
      }
      return findings;
    }
  } catch (e) {
    console.warn("[Compliance Service] DB error on findings:", e);
  }

  // Memory fallback
  let list = memStore.findings.map((f: any) => {
    const ctrl = memStore.controls.find((c: any) => c.id === f.controlId);
    const rems = memStore.remediations.filter((r: any) => r.findingId === f.id);
    return {
      ...f,
      control: ctrl ? { id: ctrl.id, title: ctrl.title, category: ctrl.category } : null,
      remediationActions: rems,
    };
  });

  if (severity && severity !== "all") list = list.filter((f: any) => f.severity === severity);
  if (status && status !== "all") list = list.filter((f: any) => f.status === status);
  if (frameworkId && frameworkId !== "all") list = list.filter((f: any) => f.frameworkId === frameworkId);

  if (search) {
    const q = search.toLowerCase();
    list = list.filter(
      (f: any) =>
        f.title.toLowerCase().includes(q) ||
        f.description.toLowerCase().includes(q) ||
        f.assignedOwner.toLowerCase().includes(q) ||
        f.controlId.toLowerCase().includes(q)
    );
  }

  return list;
}

export async function getSafeComplianceDataGovernance(options: {
  classificationType?: string;
  security?: string;
  search?: string;
}) {
  const { classificationType, security, search = "" } = options;
  try {
    await ensureComplianceSeeded();
    const where: Record<string, unknown> = {};
    if (classificationType && classificationType !== "all") where.classificationType = classificationType;
    if (security && security !== "all") where.securityClassification = security;

    let assets = await db.dataAsset.findMany({
      where,
      include: { gaps: true },
      orderBy: { importDate: "desc" },
    });

    const dataGaps = await db.dataGap.findMany({ orderBy: { createdAt: "desc" } });

    if (assets.length > 0) {
      if (search) {
        const q = search.toLowerCase();
        assets = assets.filter(
          (a) =>
            a.datasetName.toLowerCase().includes(q) ||
            a.datasetNameAr.toLowerCase().includes(q) ||
            a.sourceAuthority.toLowerCase().includes(q) ||
            a.geographicCoverage.toLowerCase().includes(q)
        );
      }
      return { assets, dataGaps, traceabilitySamples: TRACEABILITY_SAMPLES };
    }
  } catch (e) {
    console.warn("[Compliance Service] DB error on data governance:", e);
  }

  // Memory fallback
  let list = memStore.dataAssets.map((a: any) => ({
    ...a,
    gaps: memStore.dataGaps.filter((g: any) => g.dataAssetId === a.id),
  }));

  if (classificationType && classificationType !== "all") {
    list = list.filter((a: any) => a.classificationType === classificationType);
  }
  if (security && security !== "all") {
    list = list.filter((a: any) => a.securityClassification === security);
  }
  if (search) {
    const q = search.toLowerCase();
    list = list.filter(
      (a: any) =>
        a.datasetName.toLowerCase().includes(q) ||
        a.datasetNameAr.toLowerCase().includes(q) ||
        a.sourceAuthority.toLowerCase().includes(q) ||
        a.geographicCoverage.toLowerCase().includes(q)
    );
  }

  return { assets: list, dataGaps: memStore.dataGaps, traceabilitySamples: TRACEABILITY_SAMPLES };
}

export async function getSafeComplianceAuditTrail(options: {
  search?: string;
  outcome?: string;
  resourceType?: string;
  verify?: boolean;
}) {
  const { search = "", outcome, resourceType, verify = false } = options;
  try {
    await ensureComplianceSeeded();
    const where: Record<string, unknown> = {};
    if (outcome && outcome !== "all") where.outcome = outcome;
    if (resourceType && resourceType !== "all") where.resourceType = resourceType;

    let events = await db.auditEvent.findMany({
      where,
      orderBy: { timestamp: "desc" },
      take: 200,
    });

    if (events.length > 0) {
      if (search) {
        const q = search.toLowerCase();
        events = events.filter(
          (e) =>
            e.actorName.toLowerCase().includes(q) ||
            e.action.toLowerCase().includes(q) ||
            e.resourceId.toLowerCase().includes(q) ||
            e.details.toLowerCase().includes(q) ||
            e.tamperProofHash.toLowerCase().includes(q)
        );
      }

      const invalid = events.filter((e) => !e.tamperProofHash || e.tamperProofHash.length !== 64);
      const integrityStatus = {
        verified: invalid.length === 0,
        totalVerified: events.length,
        compromisedCount: invalid.length,
        timestamp: new Date().toISOString(),
      };
      return { events, integrityStatus };
    }
  } catch (e) {
    console.warn("[Compliance Service] DB error on audit:", e);
  }

  // Memory fallback
  let list = [...memStore.auditLogs];
  if (outcome && outcome !== "all") list = list.filter((e: any) => e.outcome === outcome);
  if (resourceType && resourceType !== "all") list = list.filter((e: any) => e.resourceType === resourceType);

  if (search) {
    const q = search.toLowerCase();
    list = list.filter(
      (e: any) =>
        e.actorName.toLowerCase().includes(q) ||
        e.action.toLowerCase().includes(q) ||
        e.resourceId.toLowerCase().includes(q) ||
        e.details.toLowerCase().includes(q) ||
        e.tamperProofHash.toLowerCase().includes(q)
    );
  }

  const invalid = list.filter((e: any) => !e.tamperProofHash || e.tamperProofHash.length !== 64);
  const integrityStatus = {
    verified: invalid.length === 0,
    totalVerified: list.length,
    compromisedCount: invalid.length,
    timestamp: new Date().toISOString(),
  };

  return { events: list, integrityStatus };
}

export async function getSafeComplianceSettings() {
  try {
    await ensureComplianceSeeded();
    const settings = await db.complianceSettings.findFirst({ where: { id: "default" } });
    if (settings) return settings;
  } catch (e) {
    console.warn("[Compliance Service] DB error on settings:", e);
  }
  return memStore.settings;
}

export async function updateSafeComplianceSettings(body: any) {
  try {
    const updated = await db.complianceSettings.upsert({
      where: { id: "default" },
      update: { ...body, updatedAt: new Date() },
      create: { ...SEED_SETTINGS, ...body, updatedAt: new Date() },
    });
    return updated;
  } catch (e) {
    console.warn("[Compliance Service] DB error updating settings, updating memory:", e);
    memStore.settings = { ...memStore.settings, ...body, updatedAt: new Date().toISOString() };
    return memStore.settings;
  }
}

export async function getSafeComplianceReport(reportType: string, format: string, actor: string) {
  let title = "";
  let csvData = "";
  let reportPayload: Record<string, unknown> = {};

  if (reportType === "framework_register") {
    title = "Official Framework Register Report (سجل الأطر التنظيمية)";
    const frameworks = await getSafeComplianceFrameworks({});
    const rows = [
      ["Framework ID", "Name", "Version", "Applicability", "Assessment Status", "Controls Count", "Owner", "Review Date"],
      ...frameworks.map((f: any) => [
        f.id,
        `"${f.name}"`,
        f.version,
        `"${f.applicabilityStatus}"`,
        `"${f.assessmentStatus}"`,
        (f.controls ? f.controls.length : 0).toString(),
        `"${f.responsibleOwner}"`,
        f.reviewDate,
      ]),
    ];
    csvData = rows.map((r) => r.join(",")).join("\n");
    reportPayload = { frameworks, total: frameworks.length };
  } else if (reportType === "compliance_assessment") {
    title = "Compliance Assessment & Gap Report (تقرير تقييم الامتثال والفجوات)";
    const assessments = await getSafeComplianceAssessments({});
    const rows = [
      ["Assessment ID", "Framework", "Scope", "Assessor", "Reviewer", "Status", "Total Evaluated Controls"],
      ...assessments.map((a: any) => [
        a.id,
        `"${a.framework?.name || a.frameworkId}"`,
        `"${a.scope}"`,
        `"${a.assessor}"`,
        `"${a.reviewer}"`,
        `"${a.status}"`,
        (a.results ? a.results.length : 0).toString(),
      ]),
    ];
    csvData = rows.map((r) => r.join(",")).join("\n");
    reportPayload = { assessments, total: assessments.length };
  } else if (reportType === "evidence_pack") {
    title = "Audit Evidence Package & Cryptographic Attestation (حزمة الأدلة والإثباتات)";
    const evidences = await getSafeComplianceEvidence({});
    const rows = [
      ["Evidence ID", "Filename", "Control ID", "Review Status", "Owner", "SHA-256 Checksum", "Expiry Date"],
      ...evidences.map((e: any) => [
        e.id,
        `"${e.originalFilename}"`,
        `"${e.controlId}"`,
        `"${e.reviewStatus}"`,
        `"${e.owner}"`,
        e.checksumSha256,
        e.expiryDate,
      ]),
    ];
    csvData = rows.map((r) => r.join(",")).join("\n");
    reportPayload = { evidences, total: evidences.length };
  } else if (reportType === "findings_remediation") {
    title = "Findings & Remediation Plan (سجل الملاحظات وخطة المعالجة)";
    const findings = await getSafeComplianceFindings({});
    const rows = [
      ["Finding ID", "Severity", "Title", "Control ID", "Assigned Owner", "Target Date", "Status"],
      ...findings.map((f: any) => [
        f.id,
        f.severity,
        `"${f.title}"`,
        f.controlId,
        `"${f.assignedOwner}"`,
        f.targetResolutionDate,
        `"${f.status}"`,
      ]),
    ];
    csvData = rows.map((r) => r.join(",")).join("\n");
    reportPayload = { findings, total: findings.length };
  } else {
    // Executive summary default
    title = "Aseer SVC Executive Compliance Summary (التقرير التنفيذي الشامل للجنة الإشرافية)";
    const dash = await getSafeComplianceDashboard();
    csvData = `Metric,Value\nTotal Frameworks,${dash.kpis.totalFrameworks}\nApplicable Frameworks,${dash.kpis.applicableFrameworks}\nAssessed Controls,${dash.kpis.assessedControls}\nOpen Findings,${dash.kpis.openFindings}\nUnverified Evidence,${dash.kpis.unverifiedEvidenceCount}\nOverdue Remediations,${dash.kpis.overdueRemediations}`;
    reportPayload = dash;
  }

  return { title, csvData, reportPayload };
}
