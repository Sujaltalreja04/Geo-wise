import {
  Upload,
  Satellite,
  TrendingUp,
  Gavel,
  Users,
  Webhook,
  Bell,
  ServerCog,
  GraduationCap,
  FileText,
  type LucideIcon,
} from "lucide-react";
import type { DictKey } from "./i18n";

export interface RoadmapDefinition {
  moduleId: string;
  titleKey: DictKey;
  icon: LucideIcon;
  items: { en: string; ar: string }[];
}

export const ROADMAPS: Record<string, RoadmapDefinition> = {
  ingestion: {
    moduleId: "M02",
    titleKey: "mod.ingestion",
    icon: Upload,
    items: [
      {
        en: "Drag-and-drop uploader for Shapefile, GeoPackage, GeoJSON, CSV, KML, GeoTIFF and COG.",
        ar: "محمل سحب وإفلات للصيغ: Shapefile و GeoPackage و GeoJSON و CSV و KML و GeoTIFF و COG.",
      },
      {
        en: "Automatic CRS detection and reprojection to EPSG:32638 for Saudi urban areas.",
        ar: "اكتشاف نظام الإحداثيات تلقائياً وإعادة الإسقاط إلى EPSG:32638 للمناطق الحضرية.",
      },
      {
        en: "Attribute mapping UI with validation against published schemas.",
        ar: "واجهة تعيين الخصائص مع تحقق مقابل المخططات المنشورة.",
      },
      {
        en: "Scheduled connectors (WFS, REST, SFTP) with documented mock adapters until external systems are approved.",
        ar: "وصلات مجدولة (WFS, REST, SFTP) مع محاكاة موثّقة بانتظار اعتماد الأنظمة الخارجية.",
      },
      {
        en: "Full ingestion log with per-record error reporting and retry.",
        ar: "سجل استيعاب كامل مع تقارير أخطاء لكل سجل وإعادة المحاولة.",
      },
    ],
  },
  imagery: {
    moduleId: "M06",
    titleKey: "mod.imagery",
    icon: Satellite,
    items: [
      {
        en: "Imagery catalog with scene-level metadata (sensor, GSD, cloud cover, acquisition date).",
        ar: "كتالوج صور ببيانات وصفية على مستوى المشهد (المستشعر، الدقة، الغطاء السحابي، تاريخ الالتقاط).",
      },
      {
        en: "Coverage mosaicking and temporal organization (before/after compare).",
        ar: "تجميع التغطية والتنظيم الزمني (مقارنة قبل/بعد).",
      },
      {
        en: "Preprocessing pipeline (orthorectification, pansharpen, NDVI) running on workers, not web requests.",
        ar: "خط معالجة مسبقة (تصحيح هندسي، دمج بانكراماتيك، NDVI) يعمل على عاملات منفصلة وليس على طلبات الويب.",
      },
      {
        en: "Licensing restrictions enforced per scene (no redistribution of restricted sources).",
        ar: "تطبيق قيود الترخيص لكل مشهد (يُمنع إعادة توزيع المصادر المُقيّدة).",
      },
    ],
  },
  predictive: {
    moduleId: "M08",
    titleKey: "mod.predictive",
    icon: TrendingUp,
    items: [
      {
        en: "Configurable forecasting models (demand, population, infrastructure load) with documented assumptions.",
        ar: "نماذج تنبؤ قابلة للضبط (الطلب، السكان، حمل البنية) مع افتراضات موثّقة.",
      },
      {
        en: "Scenario comparison view (baseline vs intervention) with explainable risk scores.",
        ar: "عرض مقارنة السيناريوهات (الأساس مقابل التدخل) مع درجات مخاطر قابلة للتفسير.",
      },
      {
        en: "Uncertainty bands and explicit data-gap reporting — never fabricate a prediction.",
        ar: "نطاقات عدم اليقين وتقارير صريحة لفجوات البيانات — لا تختلق أي تنبؤ.",
      },
    ],
  },
  rules: {
    moduleId: "M09",
    titleKey: "mod.rules",
    icon: Gavel,
    items: [
      {
        en: "Machine-readable rules engine with versioning and effective dates.",
        ar: "محرك قواعد قابل للقراءة آلياً مع إصدارات وتواريخ سريان.",
      },
      {
        en: "Conformity checks against approved, versioned Saudi regulations (no invented regulations).",
        ar: "فحوصات امتثال مقابل لوائح سعودية معتمدة ومُصدّرة (بدون اختلاق لوائح).",
      },
      {
        en: "Exceptions, waivers and approval records fully auditable.",
        ar: "الاستثناءات والتنازلات وسجلات الاعتماد قابلة للتدقيق بالكامل.",
      },
    ],
  },
  reports: {
    moduleId: "M13.2",
    titleKey: "mod.reports",
    icon: FileText,
    items: [
      {
        en: "Configurable dashboard system with maps, charts, tables and indicators.",
        ar: "نظام لوحات معلومات قابل للضبط بالخرائط والرسوم والجداول والمؤشرات.",
      },
      {
        en: "Official report generation with provenance, classification and approval workflow.",
        ar: "إنشاء تقارير رسمية مع السلالة والتصنيف وسير الاعتماد.",
      },
      {
        en: "Controlled exports (PDF/XLSX) respecting data classification.",
        ar: "تصدير مُتحكّم (PDF/XLSX) يحترم التصنيف الأمني.",
      },
      {
        en: "Bilingual (AR/EN) report templates with Hijri & Gregorian dates.",
        ar: "قوالب تقارير ثنائية اللغة مع تواريخ هجرية وميلادية.",
      },
    ],
  },
  collaboration: {
    moduleId: "M14",
    titleKey: "mod.collaboration",
    icon: Users,
    items: [
      {
        en: "Shared workspaces with activity history, comments and mentions.",
        ar: "مساحات عمل مشتركة بسجل نشاط وتعليقات وإشارات.",
      },
      {
        en: "Scoped, time-limited external participation tokens.",
        ar: "رموز مشاركة خارجية محدودة النطاق والمدة.",
      },
      {
        en: "Review and approval workflows with provenance.",
        ar: "سير المراجعة والاعتماد مع سلالة.",
      },
    ],
  },
  api: {
    moduleId: "M16",
    titleKey: "mod.api",
    icon: Webhook,
    items: [
      {
        en: "Versioned REST APIs documented via OpenAPI 3.1.",
        ar: "واجهات REST مُصدّرة موثّقة عبر OpenAPI 3.1.",
      },
      {
        en: "Geospatial service interfaces (WMS/WFS/OGC API Features).",
        ar: "واجهات خدمات جغرافية (WMS/WFS/OGC API Features).",
      },
      {
        en: "Webhooks with retry and scoped API credentials.",
        ar: "Webhooks مع إعادة المحاولة وبيانات اعتماد محدودة النطاق.",
      },
      {
        en: "Use-case pack architecture for partner agencies.",
        ar: "بنية حزم حالات استخدام للجهات الشريكة.",
      },
    ],
  },
  notifications: {
    moduleId: "M17",
    titleKey: "mod.notifications",
    icon: Bell,
    items: [
      {
        en: "Multi-channel notifications (in-app, email, SMS) with subscriptions.",
        ar: "إشعارات متعددة القنوات (داخل التطبيق، بريد، SMS) مع اشتراكات.",
      },
      {
        en: "Escalation policies based on severity and SLA.",
        ar: "سياسات تصعيد بناءً على الخطورة و SLA.",
      },
      {
        en: "Never disclose information beyond a recipient's authorization level.",
        ar: "عدم إفشاء أي معلومات تتجاوز صلاحية المستلم.",
      },
    ],
  },
  ops: {
    moduleId: "M18",
    titleKey: "mod.ops",
    icon: ServerCog,
    items: [
      {
        en: "Background job orchestration with resource metering.",
        ar: "تنظيم مهام خلفية مع قياس الموارد.",
      },
      {
        en: "Service monitoring, backup and recovery procedures.",
        ar: "مراقبة الخدمات وإجراءات النسخ الاحتياطي والاستعادة.",
      },
      {
        en: "Operational observability (metrics, traces, logs).",
        ar: "قابلية الملاحظة التشغيلية (المقاييس، التتبع، السجلات).",
      },
    ],
  },
  onboarding: {
    moduleId: "M19",
    titleKey: "mod.onboarding",
    icon: GraduationCap,
    items: [
      {
        en: "Guided entity onboarding with role-aware checklists.",
        ar: "تهيئة موجّهة للجهات مع قوائم تحقق حسب الدور.",
      },
      {
        en: "Contextual Arabic help and analysis explanations.",
        ar: "مساعدة عربية حسب السياق وشروحات للتحليلات.",
      },
      {
        en: "Sandbox training environment (planned release).",
        ar: "بيئة تدريب تجريبية (إصدار مخطط).",
      },
    ],
  },
};
