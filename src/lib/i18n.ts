/**
 * GeoWise bilingual dictionary (Arabic + English).
 * Arabic strings use proper Arabic phrasing suitable for a government context.
 * Access via `t(key)` from the `useT` hook or the app store.
 */

export type Lang = "ar" | "en";

export const dictionary = {
  // Brand
  "brand.name": { en: "GeoWise", ar: "جيو وايز" },
  "brand.tagline": {
    en: "Geospatial Intelligence Platform",
    ar: "منصة الذكاء المكاني",
  },

  // Generic
  "common.search": { en: "Search", ar: "بحث" },
  "common.filter": { en: "Filter", ar: "تصفية" },
  "common.all": { en: "All", ar: "الكل" },
  "common.actions": { en: "Actions", ar: "إجراءات" },
  "common.status": { en: "Status", ar: "الحالة" },
  "common.type": { en: "Type", ar: "النوع" },
  "common.owner": { en: "Owner", ar: "المسؤول" },
  "common.updated": { en: "Updated", ar: "آخر تحديث" },
  "common.created": { en: "Created", ar: "تاريخ الإنشاء" },
  "common.viewDetails": { en: "View details", ar: "عرض التفاصيل" },
  "common.open": { en: "Open", ar: "فتح" },
  "common.close": { en: "Close", ar: "إغلاق" },
  "common.save": { en: "Save", ar: "حفظ" },
  "common.cancel": { en: "Cancel", ar: "إلغاء" },
  "common.confirm": { en: "Confirm", ar: "تأكيد" },
  "common.submit": { en: "Submit", ar: "إرسال" },
  "common.send": { en: "Send", ar: "إرسال" },
  "common.clear": { en: "Clear", ar: "مسح" },
  "common.results": { en: "results", ar: "نتيجة" },
  "common.noResults": { en: "No results found", ar: "لا توجد نتائج" },
  "common.loading": { en: "Loading…", ar: "جارٍ التحميل…" },
  "common.comingSoon": { en: "Planned for upcoming release", ar: "مجدول لإصدار قادم" },
  "common.classification": { en: "Classification", ar: "التصنيف الأمني" },
  "common.tenant": { en: "Organization", ar: "الجهة" },
  "common.role": { en: "Role", ar: "الدور" },
  "common.user": { en: "User", ar: "المستخدم" },
  "common.settings": { en: "Settings", ar: "الإعدادات" },
  "common.signOut": { en: "Sign out", ar: "تسجيل الخروج" },
  "common.profile": { en: "Profile", ar: "الملف الشخصي" },
  "common.help": { en: "Help", ar: "المساعدة" },
  "common.theme": { en: "Theme", ar: "السمة" },
  "common.language": { en: "Language", ar: "اللغة" },
  "common.english": { en: "English", ar: "الإنجليزية" },
  "common.arabic": { en: "Arabic", ar: "العربية" },
  "common.light": { en: "Light", ar: "فاتح" },
  "common.dark": { en: "Dark", ar: "داكن" },
  "common.id": { en: "ID", ar: "المعرّف" },
  "common.name": { en: "Name", ar: "الاسم" },
  "common.description": { en: "Description", ar: "الوصف" },
  "common.region": { en: "Region", ar: "المنطقة" },
  "common.priority": { en: "Priority", ar: "الأولوية" },
  "common.assignedTo": { en: "Assigned to", ar: "مُسند إلى" },
  "common.dueDate": { en: "Due date", ar: "تاريخ الاستحقاق" },
  "common.area": { en: "Area", ar: "المساحة" },
  "common.km2": { en: "km²", ar: "كم²" },

  // Nav groups
  "nav.group.workspace": { en: "Workspace", ar: "مساحة العمل" },
  "nav.group.intelligence": { en: "Intelligence", ar: "الذكاء" },
  "nav.group.operations": { en: "Operations", ar: "العمليات" },
  "nav.group.governance": { en: "Governance", ar: "الحوكمة" },
  "nav.group.system": { en: "System", ar: "النظام" },

  // Modules
  "mod.dashboard": { en: "Dashboard", ar: "لوحة المعلومات" },
  "mod.map": { en: "Map Workspace", ar: "مساحة العمل الخريطية" },
  "mod.catalog": { en: "Data Catalog", ar: "كتالوج البيانات" },
  "mod.analysis": { en: "Spatial Analysis", ar: "التحليل المكاني" },
  "mod.ingestion": { en: "Data Ingestion", ar: "استيعاب البيانات" },
  "mod.imagery": { en: "Imagery & EO", ar: "الصور والرصد" },
  "mod.detections": { en: "AI Detections", ar: "الاكتشافات الذكية" },
  "mod.predictive": { en: "Predictive & Scenarios", ar: "التنبؤ والسيناريوهات" },
  "mod.rules": { en: "Rules & Compliance", ar: "القواعد والامتثال" },
  "mod.monitoring": { en: "Monitoring & Alerts", ar: "المراقبة والتنبيهات" },
  "mod.cases": { en: "Case Management", ar: "إدارة الحالات" },
  "mod.assistant": { en: "Arabic AI Assistant", ar: "المساعد الذكي" },
  "mod.reports": { en: "Reports & Publishing", ar: "التقارير والنشر" },
  "mod.collaboration": { en: "Collaboration", ar: "التعاون" },
  "mod.audit": { en: "Audit & Governance", ar: "التدقيق والحوكمة" },
  "mod.admin": { en: "Administration", ar: "الإدارة" },
  "mod.api": { en: "APIs & SDK", ar: "واجهات و SDK" },
  "mod.notifications": { en: "Notifications", ar: "الإشعارات" },
  "mod.ops": { en: "System Operations", ar: "عمليات النظام" },
  "mod.onboarding": { en: "Onboarding & Help", ar: "التهيئة والمساعدة" },

  // Dashboard
  "dash.title": { en: "Executive Dashboard", ar: "لوحة المعلومات التنفيذية" },
  "dash.subtitle": {
    en: "Operational overview across datasets, detections, cases and audit activity.",
    ar: "نظرة تشغيلية شاملة على البيانات والاكتشافات والحالات وسجل التدقيق.",
  },
  "dash.kpi.datasets": { en: "Active Datasets", ar: "مجموعات البيانات النشطة" },
  "dash.kpi.detections": { en: "AI Detections (30d)", ar: "الاكتشافات الذكية (٣٠ يوم)" },
  "dash.kpi.openCases": { en: "Open Cases", ar: "الحالات المفتوحة" },
  "dash.kpi.alerts": { en: "Active Alerts", ar: "التنبيهات النشطة" },
  "dash.activity": { en: "Recent Activity", ar: "النشاط الأخير" },
  "dash.detectionsByType": { en: "Detections by Type", ar: "الاكتشافات حسب النوع" },
  "dash.caseLoad": { en: "Case Load by Status", ar: "توزيع الحالات حسب الحالة" },
  "dash.dataGrowth": { en: "Catalog Growth (6 mo)", ar: "نمو الكتالوج (٦ أشهر)" },
  "dash.alertsBySeverity": { en: "Alerts by Severity", ar: "التنبيهات حسب الخطورة" },
  "dash.viewAll": { en: "View all", ar: "عرض الكل" },

  // Map workspace
  "map.title": { en: "Map Workspace", ar: "مساحة العمل الخريطية" },
  "map.layers": { en: "Layers", ar: "الطبقات" },
  "map.basemap": { en: "Basemap", ar: "الخريطة الأساسية" },
  "map.tools": { en: "Tools", ar: "الأدوات" },
  "map.measure": { en: "Measure", ar: "قياس" },
  "map.draw": { en: "Draw", ar: "رسم" },
  "map.select": { en: "Select", ar: "تحديد" },
  "map.pan": { en: "Pan", ar: "تحريك" },
  "map.featureInfo": { en: "Feature Information", ar: "معلومات العنصر" },
  "map.noSelection": { en: "Click a feature on the map to inspect.", ar: "انقر على عنصر على الخريطة لعرض تفاصيله." },
  "map.bookmarks": { en: "Bookmarks", ar: "الإشارات المرجعية" },
  "map.legend": { en: "Legend", ar: "مفتاح الخريطة" },
  "map.attributeTable": { en: "Attribute Table", ar: "جدول الخصائص" },
  "map.distance": { en: "Distance", ar: "المسافة" },
  "map.area": { en: "Area", ar: "المساحة" },
  "map.print": { en: "Print Layout", ar: "تخطيط الطباعة" },
  "map.compare": { en: "Before / After", ar: "قبل / بعد" },

  // Catalog
  "catalog.title": { en: "Geospatial Data Catalog", ar: "كتالوج البيانات المكانية" },
  "catalog.subtitle": {
    en: "Searchable inventory of datasets with ownership, lineage and quality indicators.",
    ar: "جرد قابل للبحث من مجموعات البيانات مع الملكية والسلالة ومؤشرات الجودة.",
  },
  "catalog.searchPlaceholder": {
    en: "Search datasets by name, owner, or tag…",
    ar: "ابحث عن مجموعة بيانات بالاسم أو المسؤول أو الوسم…",
  },
  "catalog.geometry": { en: "Geometry", ar: "نوع الهندسة" },
  "catalog.crs": { en: "CRS", ar: "نظام الإحداثيات" },
  "catalog.source": { en: "Source", ar: "المصدر" },
  "catalog.version": { en: "Version", ar: "الإصدار" },
  "catalog.quality": { en: "Quality", ar: "الجودة" },
  "catalog.lineage": { en: "Lineage", ar: "سلالة البيانات" },
  "catalog.records": { en: "Features", ar: "العناصر" },
  "catalog.lastValidated": { en: "Last validated", ar: "آخر تحقق" },
  "catalog.openInMap": { en: "Open in Map", ar: "افتح في الخريطة" },
  "catalog.classification.restricted": { en: "Restricted", ar: "مقيّد" },
  "catalog.classification.confidential": { en: "Confidential", ar: "سري" },
  "catalog.classification.internal": { en: "Internal", ar: "داخلي" },
  "catalog.classification.public": { en: "Public", ar: "عام" },

  // Analysis
  "analysis.title": { en: "Spatial Analysis Engine", ar: "محرك التحليل المكاني" },
  "analysis.subtitle": {
    en: "Reproducible geoprocessing with full input/output lineage.",
    ar: "معالجة جغرافية قابلة للتكرار مع سلالة كاملة للمدخلات والمخرجات.",
  },
  "analysis.run": { en: "Run Analysis", ar: "تنفيذ التحليل" },
  "analysis.runnable": { en: "Available analyses", ar: "التحليلات المتاحة" },
  "analysis.parameters": { en: "Parameters", ar: "المعاملات" },
  "analysis.results": { en: "Results", ar: "النتائج" },
  "analysis.history": { en: "Execution History", ar: "سجل التنفيذ" },
  "analysis.duration": { en: "Duration", ar: "المدة" },
  "analysis.algorithmVersion": { en: "Algorithm", ar: "إصدار الخوارزمية" },
  "analysis.noRuns": { en: "No runs yet. Run an analysis to see results.", ar: "لا توجد عمليات تنفيذ بعد." },

  // Detections
  "detections.title": { en: "AI Detection & Review", ar: "الاكتشاف الذكي والمراجعة" },
  "detections.subtitle": {
    en: "Model-generated detections awaiting human verification. Detections are not verified facts.",
    ar: "اكتشافات مُولّدة بالنماذج بانتظار التحقق البشري. الاكتشافات ليست حقائق موثقة.",
  },
  "detections.confidence": { en: "Confidence", ar: "نسبة الثقة" },
  "detections.model": { en: "Model", ar: "النموذج" },
  "detections.review": { en: "Review", ar: "مراجعة" },
  "detections.verify": { en: "Mark verified", ar: "اعتماد" },
  "detections.reject": { en: "Mark false positive", ar: "رفض (إيجابية كاذبة)" },
  "detections.createCase": { en: "Create case", ar: "إنشاء حالة" },
  "detections.verified": { en: "Verified", ar: "موثّق" },
  "detections.pending": { en: "Pending review", ar: "بانتظار المراجعة" },
  "detections.rejected": { en: "Rejected", ar: "مرفوض" },

  // Cases
  "cases.title": { en: "Case Management & Field Operations", ar: "إدارة الحالات والعمليات الميدانية" },
  "cases.subtitle": {
    en: "Operational cases derived from detections, alerts and inspections.",
    ar: "حالات تشغيلية ناتجة عن الاكتشافات والتنبيهات والتفتيشات.",
  },
  "cases.new": { en: "New case", ar: "حالة جديدة" },
  "cases.caseId": { en: "Case ID", ar: "رقم الحالة" },
  "cases.sla": { en: "SLA", ar: "اتفاقية مستوى الخدمة" },
  "cases.lifecycle": { en: "Lifecycle", ar: "دورة الحياة" },
  "cases.inspections": { en: "Inspections", ar: "التفتيشات" },
  "cases.evidence": { en: "Evidence", ar: "الأدلة" },

  // Monitoring
  "monitoring.title": { en: "Monitoring & Alerts", ar: "المراقبة والتنبيهات" },
  "monitoring.subtitle": {
    en: "Recurring watchlists over areas and assets with configurable thresholds.",
    ar: "قوائم مراقبة متكررة على المناطق والأصول مع عتبات قابلة للضبط.",
  },
  "monitoring.watchlists": { en: "Watchlists", ar: "قوائم المراقبة" },
  "monitoring.alerts": { en: "Live Alerts", ar: "التنبيهات الحية" },
  "monitoring.newWatchlist": { en: "New watchlist", ar: "قائمة مراقبة جديدة" },
  "monitoring.threshold": { en: "Threshold", ar: "العتبة" },
  "monitoring.lastRun": { en: "Last run", ar: "آخر تشغيل" },
  "monitoring.nextRun": { en: "Next run", ar: "التشغيل القادم" },
  "monitoring.schedule": { en: "Schedule", ar: "الجدولة" },
  "monitoring.severity": { en: "Severity", ar: "الخطورة" },

  // Assistant
  "assistant.title": { en: "GeoWise Assistant", ar: "مساعد جيو وايز" },
  "assistant.subtitle": {
    en: "Bilingual assistant. Respects your permissions and cites its sources.",
    ar: "مساعد ثنائي اللغة. يحترم صلاحياتك ويوثّق مصادره.",
  },
  "assistant.placeholder": {
    en: "Ask about datasets, detections, cases, or regulations…",
    ar: "اسأل عن البيانات أو الاكتشافات أو الحالات أو اللوائح…",
  },
  "assistant.disclaimer": {
    en: "AI outputs are decision support only. Verify before enforcement.",
    ar: "مخرجات الذكاء الاصطناعي لدعم القرار فقط. يجب التحقق قبل التنفيذ.",
  },
  "assistant.welcome": {
    en: "Welcome. I can summarize datasets, explain analyses, draft reports and cite approved regulations. How can I help?",
    ar: "مرحبًا. يمكنني تلخيص البيانات وشرح التحليلات وصياغة التقارير والاستشهاد باللوائح المعتمدة. كيف أساعدك؟",
  },
  "assistant.thinking": { en: "Consulting the knowledge base…", ar: "جارٍ الرجوع إلى قاعدة المعرفة…" },

  // Reports & Publishing
  "reports.title": { en: "Reports & Publishing", ar: "التقارير والنشر الرسمي" },
  "reports.subtitle": {
    en: "Official municipal intelligence dossiers, spatial analytics summaries, and cryptographically verified exports.",
    ar: "ملفات الاستخبارات المكانية البلدية الرسمية والتحليلات الجغرافية والتصدير الموثق رقمياً.",
  },
  "reports.new": { en: "Generate New Dossier", ar: "إنشاء ملف تقرير جديد" },
  "reports.filter.all": { en: "All Reports", ar: "كافة التقارير" },
  "reports.filter.published": { en: "Published", ar: "التقارير المنشورة" },
  "reports.filter.approved": { en: "Approved", ar: "المعتمدة" },
  "reports.filter.review": { en: "In Review", ar: "قيد المراجعة" },
  "reports.filter.draft": { en: "Drafts", ar: "المسودات" },
  "reports.search": { en: "Search reports by title, ID, district or author...", ar: "ابحث بالاسم أو المعرف أو الحي أو المسؤول..." },
  "reports.exportPdf": { en: "Print / Official PDF", ar: "طباعة / ملف PDF رسمي" },
  "reports.exportXlsx": { en: "Export CSV / Excel", ar: "تصدير CSV / إكسل" },
  "reports.viewDossier": { en: "View Dossier", ar: "عرض الملف الكامل" },
  "reports.provenance": { en: "Provenance & Digital Signatures", ar: "سلالة البيانات والتوقيع الرقمي" },
  "reports.approver": { en: "Approval Authority", ar: "جهة الاعتماد" },
  "reports.author": { en: "Lead Analyst / Author", ar: "المحلل الرئيسي / المعدّ" },
  "reports.metrics": { en: "Spatial Metrics & Scope", ar: "المؤشرات المكانية والنطاق" },
  "reports.findings": { en: "Key Geospatial Findings", ar: "أبرز النتائج الجيومكانية" },
  "reports.recommendations": { en: "Enforcement Recommendations", ar: "توصيات الضبط والإنفاذ" },

  // Audit
  "audit.title": { en: "Audit & Governance Log", ar: "سجل التدقيق والحوكمة" },
  "audit.subtitle": {
    en: "Immutable record of every privileged action across the platform.",
    ar: "سجل غير قابل للتعديل لكل إجراء متميّز عبر المنصة.",
  },
  "audit.actor": { en: "Actor", ar: "المنفّذ" },
  "audit.action": { en: "Action", ar: "الإجراء" },
  "audit.target": { en: "Target", ar: "الهدف" },
  "audit.timestamp": { en: "Timestamp", ar: "الطابع الزمني" },
  "audit.ip": { en: "IP", ar: "IP" },
  "audit.result": { en: "Result", ar: "النتيجة" },

  // Admin
  "admin.title": { en: "Administration", ar: "الإدارة" },
  "admin.subtitle": {
    en: "Tenants, users, roles, retention and platform settings.",
    ar: "الجهات والمستخدمون والأدوار والاستبقاء وإعدادات المنصة.",
  },
  "admin.tenants": { en: "Tenants", ar: "الجهات" },
  "admin.users": { en: "Users", ar: "المستخدمون" },
  "admin.roles": { en: "Roles & Permissions", ar: "الأدوار والصلاحيات" },
  "admin.retention": { en: "Retention Policies", ar: "سياسات الاستبقاء" },

  // Footer
  "footer.classified": {
    en: "This system contains Saudi-resident government data. Distribution is restricted.",
    ar: "يحتوي هذا النظام على بيانات حكومية مقيمة في المملكة. التوزيع مقيّد.",
  },
  "footer.version": { en: "GeoWise MVP · Build 1.0", ar: "جيو وايز النسخة التجريبية · الإصدار 1.0" },
} as const;

export type DictKey = keyof typeof dictionary;

export function translate(key: DictKey, lang: Lang): string {
  const entry = dictionary[key];
  if (!entry) return key;
  return entry[lang] ?? entry.en ?? key;
}
