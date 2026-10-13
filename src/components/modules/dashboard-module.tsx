"use client";

import * as React from "react";
import Link from "next/link";
import {
  Database,
  ScanSearch,
  FolderKanban,
  BellRing,
  ArrowUpRight,
  ArrowDownRight,
  Activity as ActivityIcon,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  MapPin,
  ExternalLink,
  ChevronRight,
  Layers,
  Compass,
  PlusCircle,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  FileText,
  type LucideIcon,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip as RTooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { useGeoWiseStore } from "@/stores/app-store";
import { ModuleHeader, ModuleBody } from "./module-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { ACTIVITY, DASHBOARD_KPIS } from "@/lib/dummy-data";

interface Kpi {
  key: string;
  value: number;
  delta: number;
  subtitle: string;
  icon: LucideIcon;
  fmt?: (n: number) => string;
  iconColor: string;
  iconBg: string;
  cardBorder: string;
  accentGradient: string;
  href: string;
}

async function fetchDashboard() {
  const res = await fetch("/api/dashboard");
  if (!res.ok) throw new Error("dashboard");
  return res.json() as Promise<{
    kpis: typeof DASHBOARD_KPIS;
    activity: typeof ACTIVITY;
  }>;
}

const PIE_COLORS = [
  "#0284c7", // Sky 600
  "#7c3aed", // Violet 600
  "#d97706", // Amber 600
  "#0891b2", // Cyan 600
  "#059669", // Emerald 600
];

function getStatusLabel(status: string, lang: "ar" | "en") {
  const map: Record<string, { en: string; ar: string }> = {
    new: { en: "New", ar: "جديدة" },
    investigating: { en: "Investigating", ar: "قيد التحقيق" },
    inspection: { en: "Inspection", ar: "تفتيش ميداني" },
    review: { en: "Review", ar: "قيد المراجعة" },
    closed: { en: "Closed", ar: "مغلقة" },
  };
  return map[status.toLowerCase()]?.[lang] || status;
}

function getActivityMeta(kind: string) {
  switch (kind) {
    case "detection":
      return {
        icon: ScanSearch,
        color: "text-teal-700 dark:text-teal-300",
        bg: "bg-teal-500/15 border-teal-500/30",
        labelEn: "Detection",
        labelAr: "رصد ذكي",
      };
    case "alert":
      return {
        icon: BellRing,
        color: "text-amber-700 dark:text-amber-300",
        bg: "bg-amber-500/15 border-amber-500/30",
        labelEn: "Alert",
        labelAr: "تنبيه",
      };
    case "case":
      return {
        icon: FolderKanban,
        color: "text-purple-700 dark:text-purple-300",
        bg: "bg-purple-500/15 border-purple-500/30",
        labelEn: "Case",
        labelAr: "حالة",
      };
    case "analysis":
      return {
        icon: Sparkles,
        color: "text-sky-700 dark:text-sky-300",
        bg: "bg-sky-500/15 border-sky-500/30",
        labelEn: "Analysis",
        labelAr: "تحليل",
      };
    case "dataset":
      return {
        icon: Database,
        color: "text-emerald-700 dark:text-emerald-300",
        bg: "bg-emerald-500/15 border-emerald-500/30",
        labelEn: "Dataset",
        labelAr: "بيانات",
      };
    case "audit":
    default:
      return {
        icon: ShieldCheck,
        color: "text-rose-700 dark:text-rose-300",
        bg: "bg-rose-500/15 border-rose-500/30",
        labelEn: "Security",
        labelAr: "أمان",
      };
  }
}

function formatActivityTime(ts: string, isAr: boolean) {
  try {
    const d = new Date(ts);
    return d.toLocaleTimeString(isAr ? "ar-SA" : "en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return ts;
  }
}

export function DashboardModule() {
  const t = useGeoWiseStore((s) => s.t);
  const lang = useGeoWiseStore((s) => s.lang);

  const { data } = useQuery({
    queryKey: ["dashboard"],
    queryFn: fetchDashboard,
    initialData: { kpis: DASHBOARD_KPIS, activity: ACTIVITY },
  });

  const { data: statsData } = useQuery({
    queryKey: ["assessmentStats"],
    queryFn: async () => {
      const res = await fetch("/api/assessments/stats");
      if (!res.ok) return null;
      return res.json();
    },
  });

  const assessmentStats = statsData?.stats;

  const kpis: Kpi[] = [
    {
      key: "dash.kpi.datasets",
      value: data.kpis.activeDatasets,
      delta: 7.0,
      subtitle: lang === "ar" ? "طبقات جغرافية موثقة" : "Verified spatial layers",
      icon: Database,
      iconColor: "text-sky-700 dark:text-sky-300",
      iconBg: "bg-sky-500/15 border-sky-500/30",
      cardBorder: "hover:border-sky-500/50",
      accentGradient: "from-sky-500/10 via-transparent to-transparent",
      href: "/catalog",
    },
    {
      key: "dash.kpi.detections",
      value: data.kpis.detections30d,
      delta: 12.4,
      subtitle: lang === "ar" ? "مسوحات الأقمار الصناعية" : "Satellite AI inference runs",
      icon: ScanSearch,
      iconColor: "text-teal-700 dark:text-teal-300",
      iconBg: "bg-teal-500/15 border-teal-500/30",
      cardBorder: "hover:border-teal-500/50",
      accentGradient: "from-teal-500/10 via-transparent to-transparent",
      href: "/detections",
    },
    {
      key: "dash.kpi.openCases",
      value: data.kpis.openCases,
      delta: -8.2,
      subtitle: lang === "ar" ? "تحقيقات ميدانية نشطة" : "Active field investigations",
      icon: FolderKanban,
      iconColor: "text-purple-700 dark:text-purple-300",
      iconBg: "bg-purple-500/15 border-purple-500/30",
      cardBorder: "hover:border-purple-500/50",
      accentGradient: "from-purple-500/10 via-transparent to-transparent",
      href: "/cases",
    },
    {
      key: "dash.kpi.alerts",
      value: data.kpis.activeAlerts,
      delta: -25.0,
      subtitle: lang === "ar" ? "تنبيهات فورية نشطة" : "Active threshold alarms",
      icon: BellRing,
      iconColor: "text-amber-700 dark:text-amber-300",
      iconBg: "bg-amber-500/15 border-amber-500/30",
      cardBorder: "hover:border-amber-500/50",
      accentGradient: "from-amber-500/10 via-transparent to-transparent",
      href: "/monitoring",
    },
  ];

  const detectionTrend = data.kpis.newDetectionsTrend.map((v, i) => ({
    day: lang === "ar" ? `ي-${i + 1}` : `D${i + 1}`,
    count: v,
  }));

  const caseLoad = data.kpis.caseLoadByStatus.map((s) => ({
    name: s.status,
    value: s.count,
  }));

  const totalCases = caseLoad.reduce((acc, c) => acc + c.value, 0);

  const catalogGrowth = data.kpis.catalogGrowth.map((m) => ({
    month: m.month,
    count: m.count,
  }));

  return (
    <div className="flex flex-col h-full min-h-0 bg-background">
      <ModuleHeader
        moduleId="M13"
        titleKey="dash.title"
        subtitleKey="dash.subtitle"
        icon={ActivityIcon}
        actions={
          <div className="flex items-center gap-2">
            <Link href="/assessments/new">
              <Button
                size="sm"
                className="h-8.5 gap-1.5 text-xs font-semibold bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
              >
                <PlusCircle className="size-3.5" />
                <span>{lang === "ar" ? "تقييم موقع جديد" : "New Site Assessment"}</span>
              </Button>
            </Link>

            <Link href="/assessments">
              <Button variant="outline" size="sm" className="h-8.5 gap-1.5 text-xs font-semibold">
                <FolderKanban className="size-3.5 text-primary" />
                <span>{lang === "ar" ? "سجل التقييمات" : "Site Assessments"}</span>
              </Button>
            </Link>

            <Link href="/assistant">
              <Button
                variant="outline"
                size="sm"
                className="h-8.5 gap-1.5 text-xs font-semibold border-primary/50 text-primary hover:bg-primary/10 shadow-xs"
              >
                <Sparkles className="size-3.5" />
                <span>{lang === "ar" ? "المساعد الذكي" : "AI Copilot"}</span>
              </Button>
            </Link>
          </div>
        }
      />

      <ModuleBody className="space-y-6">
        {/* Section 4.A: Development Site Assessments Overview Banner & KPIs */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold flex items-center gap-2 text-foreground">
                <Compass className="size-4 text-primary" />
                <span>
                  {lang === "ar"
                    ? "مؤشرات تقييم طلبات التطوير العقاري (GeoWise Assessment Engine)"
                    : "Property Development Assessment Indicators"}
                </span>
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {lang === "ar"
                  ? "فحص المواقع، الارتفاعات، الارتدادات، استعمالات الأراضي، والمخاطر الهيدرولوجية وفق الأدلة الجغرافية"
                  : "Evidence-based spatial assessment of proposed building heights, setbacks, zoning, and wadi hazard exposure"}
              </p>
            </div>
            <Link href="/assessments" className="text-xs text-primary font-semibold hover:underline flex items-center gap-1">
              <span>{lang === "ar" ? "عرض جميع المواقع" : "View All Sites"}</span>
              <ChevronRight className="size-3 rtl:rotate-180" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <Card className="p-3.5 bg-card/80 border-border/80 shadow-xs">
              <div className="text-[0.7rem] text-muted-foreground font-medium">
                {lang === "ar" ? "إجمالي المواقع المقيمة" : "Total Sites Assessed"}
              </div>
              <div className="text-2xl font-bold font-mono text-primary mt-1">
                {assessmentStats ? assessmentStats.totalSites : 4}
              </div>
              <div className="text-[0.65rem] text-muted-foreground mt-0.5">
                {lang === "ar" ? "مخططات عقارية مسجلة" : "Registered parcels"}
              </div>
            </Card>

            <Card className="p-3.5 bg-card/80 border-emerald-500/30 shadow-xs">
              <div className="text-[0.7rem] text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-1">
                <CheckCircle2 className="size-3" />
                {lang === "ar" ? "مدعوم مكانياً" : "Supportive"}
              </div>
              <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                {assessmentStats ? assessmentStats.completed : 3}
              </div>
              <div className="text-[0.65rem] text-muted-foreground mt-0.5">
                {lang === "ar" ? "قرائن مكانية إيجابية" : "Supported by spatial evidence"}
              </div>
            </Card>

            <Card className="p-3.5 bg-card/80 border-red-500/30 shadow-xs">
              <div className="text-[0.7rem] text-red-700 dark:text-red-400 font-medium flex items-center gap-1">
                <AlertTriangle className="size-3" />
                {lang === "ar" ? "مقيّد مكانياً" : "Constrained Sites"}
              </div>
              <div className="text-2xl font-bold font-mono text-red-600 dark:text-red-400 mt-1">
                {assessmentStats ? assessmentStats.constrained : 1}
              </div>
              <div className="text-[0.65rem] text-muted-foreground mt-0.5">
                {lang === "ar" ? "محددات طيران أو ارتداد" : "Height / Setback conflicts"}
              </div>
            </Card>

            <Card className="p-3.5 bg-card/80 border-blue-500/30 shadow-xs">
              <div className="text-[0.7rem] text-blue-700 dark:text-blue-400 font-medium flex items-center gap-1">
                <HelpCircle className="size-3" />
                {lang === "ar" ? "يتطلب دراسة تفصيلية" : "Requires Further Study"}
              </div>
              <div className="text-2xl font-bold font-mono text-blue-600 dark:text-blue-400 mt-1">
                {assessmentStats ? assessmentStats.requiresStudy : 1}
              </div>
              <div className="text-[0.65rem] text-muted-foreground mt-0.5">
                {lang === "ar" ? "دراسة سيول / مرور" : "Hydrology / TIS required"}
              </div>
            </Card>

            <Card className="p-3.5 bg-card/80 border-purple-500/30 shadow-xs col-span-2 sm:col-span-1">
              <div className="text-[0.7rem] text-purple-700 dark:text-purple-400 font-medium flex items-center gap-1">
                <ActivityIcon className="size-3" />
                {lang === "ar" ? "مواقع بها فجوة بيانات" : "Data Gaps Flagged"}
              </div>
              <div className="text-2xl font-bold font-mono text-purple-600 dark:text-purple-400 mt-1">
                {assessmentStats ? assessmentStats.withDataGaps : 4}
              </div>
              <div className="text-[0.65rem] text-muted-foreground mt-0.5">
                {lang === "ar" ? "سعة مرافق غير مؤكدة" : "Unverified utility telemetry"}
              </div>
            </Card>
          </div>
        </div>

        {/* Recent Site Assessments List */}
        {assessmentStats?.recentAssessments && assessmentStats.recentAssessments.length > 0 && (
          <Card className="bg-card/80 border-border/70 shadow-xs">
            <div className="p-4 pb-2 border-b border-border/50 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-foreground">
                  {lang === "ar" ? "أحدث تقييمات مواقع التطوير العقاري" : "Recent Property Development Assessments"}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {lang === "ar"
                    ? "انقر على أي تقرير للاطلاع على فحص المعايير الـ 11 والأدلة المكانية"
                    : "Click any assessment to inspect 11 spatial criteria, measurements, and evidence"}
                </p>
              </div>

              <Link href="/assessments">
                <Button variant="ghost" size="sm" className="text-xs text-primary h-7">
                  {lang === "ar" ? "فتح السجل كاملاً" : "View All"}
                </Button>
              </Link>
            </div>

            <div className="divide-y divide-border/40 text-xs">
              {assessmentStats.recentAssessments.map((item: any) => (
                <div
                  key={item.id}
                  className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/30 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[0.7rem] px-2 py-0.5 rounded bg-muted font-bold text-muted-foreground">
                        {item.id}
                      </span>
                      <span className="font-semibold text-foreground text-sm">
                        {lang === "ar" ? item.siteNameAr || item.siteName : item.siteName}
                      </span>
                      <Badge
                        variant="outline"
                        className={`text-[0.65rem] ${
                          item.overallSpatialVerdict === "Supportive"
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                            : item.overallSpatialVerdict === "Constrained"
                            ? "bg-red-500/10 text-red-600 border-red-500/30"
                            : "bg-amber-500/10 text-amber-600 border-amber-500/30"
                        }`}
                      >
                        {item.overallSpatialVerdict}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-muted-foreground text-[0.72rem]">
                      <span>{item.district}</span>
                      <span>•</span>
                      <span className="font-mono">
                        {item.areaM2 ? `${(item.areaM2 / 10000).toFixed(2)} ha` : "—"}
                      </span>
                      <span>•</span>
                      <span>{item.applicantName}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <Link href={`/analysis?id=${item.id}`}>
                      <Button variant="outline" size="sm" className="h-7 text-xs gap-1 text-primary">
                        <FileText className="size-3" />
                        <span>{lang === "ar" ? "فحص النتائج" : "Results"}</span>
                      </Button>
                    </Link>

                    <Link href={`/map?siteId=${item.id}`}>
                      <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
                        <Compass className="size-3" />
                        <span>{lang === "ar" ? "الخريطة" : "Map"}</span>
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
        {/* KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((k) => {
            const Icon = k.icon;
            const positive = k.delta >= 0;
            return (
              <Link key={k.key} href={k.href}>
                <Card
                  className={cn(
                    "p-4.5 rounded-2xl border border-border/80 bg-card shadow-xs hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 cursor-pointer group relative overflow-hidden",
                    k.cardBorder
                  )}
                >
                  <div
                    className={cn(
                      "absolute inset-0 bg-gradient-to-br pointer-events-none opacity-60 group-hover:opacity-100 transition-opacity",
                      k.accentGradient
                    )}
                  />

                  <div className="relative z-10">
                    <div className="flex items-start justify-between">
                      <div
                        className={cn(
                          "grid place-items-center size-10.5 rounded-xl border shadow-xs transition-transform group-hover:scale-105",
                          k.iconBg,
                          k.iconColor
                        )}
                      >
                        <Icon className="size-5" />
                      </div>
                      <span
                        className={cn(
                          "inline-flex items-center gap-0.5 text-xs font-extrabold px-2.5 py-1 rounded-full border tabular-nums shadow-2xs",
                          positive
                            ? "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/40"
                            : "bg-rose-500/15 text-rose-800 dark:text-rose-300 border-rose-500/40"
                        )}
                      >
                        {positive ? (
                          <ArrowUpRight className="size-3.5 stroke-[2.5]" />
                        ) : (
                          <ArrowDownRight className="size-3.5 stroke-[2.5]" />
                        )}
                        {Math.abs(k.delta).toFixed(1)}%
                      </span>
                    </div>

                    <div className="mt-4">
                      <div className="text-3xl font-extrabold tracking-tight tabular-nums text-foreground font-mono">
                        {k.fmt ? k.fmt(k.value) : k.value.toLocaleString()}
                      </div>
                      <div className="text-xs font-bold text-foreground/85 mt-1 flex items-center justify-between">
                        <span>{t(k.key as never)}</span>
                        <ChevronRight className="size-4 opacity-0 group-hover:opacity-100 transition-opacity rtl:rotate-180 text-primary" />
                      </div>
                      <div className="text-[0.72rem] text-muted-foreground font-medium mt-0.5">
                        {k.subtitle}
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* AI Detections Trend Area Chart */}
          <Card className="p-5 rounded-2xl border border-border/80 bg-card shadow-xs lg:col-span-2 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div className="flex items-center gap-2.5">
                <div className="grid place-items-center size-8 rounded-lg bg-teal-500/15 border border-teal-500/30 text-teal-700 dark:text-teal-300">
                  <ScanSearch className="size-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    {t("dash.detectionsByType")}
                  </h3>
                  <p className="text-[0.7rem] text-muted-foreground font-medium">
                    {lang === "ar"
                      ? "رصد التغيرات المكانية عبر المعالجة الفضائية"
                      : "Spatial anomalies detected via satellite inference"}
                  </p>
                </div>
              </div>
              <Badge
                variant="outline"
                className="text-xs font-mono font-bold px-2.5 py-1 border-teal-500/40 bg-teal-500/15 text-teal-800 dark:text-teal-200"
              >
                {lang === "ar" ? "بيانات الرصد: آخر ١٢ يوماً" : "Telemetry: Last 12 days"}
              </Badge>
            </div>

            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={detectionTrend}
                  margin={{ top: 12, right: 12, left: -16, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0284c7" stopOpacity={0.45} />
                      <stop offset="90%" stopColor="#0284c7" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="4 4"
                    stroke="currentColor"
                    className="text-border/60"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 11, fontWeight: 600, fill: "currentColor" }}
                    className="text-foreground/75"
                    axisLine={{ stroke: "currentColor", className: "text-border" }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fontWeight: 600, fill: "currentColor" }}
                    className="text-foreground/75"
                    axisLine={false}
                    tickLine={false}
                  />
                  <RTooltip
                    content={({ active, payload, label }) => {
                      if (!active || !payload || !payload.length) return null;
                      return (
                        <div className="bg-popover border border-border px-3 py-2 rounded-xl shadow-xl">
                          <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                            {label}
                          </div>
                          <div className="text-base font-extrabold text-foreground tabular-nums flex items-center gap-1.5 mt-0.5">
                            <span className="size-2 rounded-full bg-sky-500" />
                            <span>{payload[0].value}</span>
                            <span className="text-xs text-muted-foreground font-normal">
                              {lang === "ar" ? "رصد ذكي" : "detections"}
                            </span>
                          </div>
                        </div>
                      );
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#0284c7"
                    strokeWidth={3}
                    fill="url(#areaGrad)"
                    dot={{ fill: "#0284c7", r: 3, strokeWidth: 2, stroke: "var(--card)" }}
                    activeDot={{ r: 5, fill: "#0284c7", stroke: "var(--card)", strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Cases by Status Donut Chart */}
          <Card className="p-5 rounded-2xl border border-border/80 bg-card shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2.5">
                <div className="grid place-items-center size-8 rounded-lg bg-purple-500/15 border border-purple-500/30 text-purple-700 dark:text-purple-300">
                  <FolderKanban className="size-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">{t("dash.caseLoad")}</h3>
                  <p className="text-[0.7rem] text-muted-foreground font-medium">
                    {lang === "ar" ? "توزيع حالات العمل الرقابي" : "Workflow status distribution"}
                  </p>
                </div>
              </div>
              <Link
                href="/cases"
                className="text-xs text-primary hover:underline font-bold flex items-center gap-1"
              >
                <span>{lang === "ar" ? "إدارة" : "Manage"}</span>
                <ChevronRight className="size-3 rtl:rotate-180" />
              </Link>
            </div>

            <div className="relative my-2">
              <ResponsiveContainer width="100%" height={175}>
                <PieChart>
                  <Pie
                    data={caseLoad}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    cornerRadius={4}
                  >
                    {caseLoad.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <RTooltip
                    content={({ active, payload }) => {
                      if (!active || !payload || !payload.length) return null;
                      const item = payload[0];
                      const val = Number(item.value);
                      return (
                        <div className="bg-popover border border-border px-3 py-2 rounded-xl shadow-xl">
                          <div className="text-[11px] font-bold text-muted-foreground capitalize">
                            {getStatusLabel(String(item.name), lang)}
                          </div>
                          <div className="text-base font-extrabold text-foreground tabular-nums flex items-center gap-1.5 mt-0.5">
                            <span
                              className="size-2 rounded-full"
                              style={{ background: item.payload?.fill }}
                            />
                            <span>{val}</span>
                            <span className="text-xs text-muted-foreground font-normal">
                              ({Math.round((val / totalCases) * 100)}%)
                            </span>
                          </div>
                        </div>
                      );
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Centered Donut Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-black tracking-tight tabular-nums text-foreground font-mono">
                  {totalCases}
                </span>
                <span className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">
                  {lang === "ar" ? "إجمالي الحالات" : "Total Cases"}
                </span>
              </div>
            </div>

            {/* High-Contrast Legend */}
            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-border/80">
              {caseLoad.map((c, i) => {
                const color = PIE_COLORS[i % PIE_COLORS.length];
                const pct = Math.round((c.value / totalCases) * 100);
                return (
                  <div
                    key={c.name}
                    className="flex items-center justify-between p-1.5 rounded-lg bg-muted/60 border border-border/70 text-xs"
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span
                        className="size-2.5 rounded-full shrink-0 shadow-2xs"
                        style={{ background: color }}
                      />
                      <span className="font-bold text-foreground/90 truncate">
                        {getStatusLabel(c.name, lang)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 font-mono font-bold text-foreground">
                      <span>{c.value}</span>
                      <span className="text-[0.68rem] text-muted-foreground font-medium">({pct}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Bottom Row: Catalog Growth & Activity Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Catalog Growth Bar Chart */}
          <Card className="p-5 rounded-2xl border border-border/80 bg-card shadow-xs lg:col-span-2 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div className="flex items-center gap-2.5">
                <div className="grid place-items-center size-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300">
                  <Database className="size-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">{t("dash.dataGrowth")}</h3>
                  <p className="text-[0.7rem] text-muted-foreground font-medium">
                    {lang === "ar"
                      ? "إجمالي طبقات البيانات المودعة في الكتالوج الوطني"
                      : "Cumulative geospatial layers indexed across municipalities"}
                  </p>
                </div>
              </div>
              <Link
                href="/catalog"
                className="text-xs text-primary hover:underline font-bold flex items-center gap-1"
              >
                <span>{lang === "ar" ? "كتالوج البيانات" : "Catalog"}</span>
                <ChevronRight className="size-3 rtl:rotate-180" />
              </Link>
            </div>

            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={catalogGrowth}
                  margin={{ top: 12, right: 12, left: -16, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="barGrowth" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#059669" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="#0284c7" stopOpacity={0.7} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="4 4"
                    stroke="currentColor"
                    className="text-border/60"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11, fontWeight: 600, fill: "currentColor" }}
                    className="text-foreground/75"
                    axisLine={{ stroke: "currentColor", className: "text-border" }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fontWeight: 600, fill: "currentColor" }}
                    className="text-foreground/75"
                    axisLine={false}
                    tickLine={false}
                  />
                  <RTooltip
                    content={({ active, payload, label }) => {
                      if (!active || !payload || !payload.length) return null;
                      return (
                        <div className="bg-popover border border-border px-3 py-2 rounded-xl shadow-xl">
                          <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                            {label}
                          </div>
                          <div className="text-base font-extrabold text-foreground tabular-nums flex items-center gap-1.5 mt-0.5">
                            <span className="size-2 rounded-full bg-emerald-500" />
                            <span>{payload[0].value}</span>
                            <span className="text-xs text-muted-foreground font-normal">
                              {lang === "ar" ? "مجموعة بيانات" : "datasets"}
                            </span>
                          </div>
                        </div>
                      );
                    }}
                  />
                  <Bar
                    dataKey="count"
                    fill="url(#barGrowth)"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={48}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Activity Feed */}
          <Card className="p-5 rounded-2xl border border-border/80 bg-card shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="grid place-items-center size-8 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300">
                  <ActivityIcon className="size-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">{t("dash.activity")}</h3>
                  <p className="text-[0.7rem] text-muted-foreground font-medium">
                    {lang === "ar" ? "سجل العمليات المباشرة" : "Live stream of platform actions"}
                  </p>
                </div>
              </div>
              <Link
                href="/audit"
                className="text-xs text-primary hover:underline font-bold flex items-center gap-1"
              >
                <span>{lang === "ar" ? "سجل التدقيق" : "Audit"}</span>
                <ChevronRight className="size-3 rtl:rotate-180" />
              </Link>
            </div>

            <ScrollArea className="h-[220px] pe-2">
              <ol className="space-y-2.5">
                {data.activity.map((a) => {
                  const meta = getActivityMeta(a.kind);
                  const Icon = meta.icon;
                  const message = lang === "ar" ? a.messageAr : a.message;
                  const actor = lang === "ar" ? a.actorAr : a.actor;
                  const time = formatActivityTime(a.timestamp, lang === "ar");

                  return (
                    <li
                      key={a.id}
                      className="flex items-start gap-3 p-2.5 rounded-xl bg-muted/40 border border-border/70 hover:bg-muted/80 hover:border-border transition-all"
                    >
                      <div
                        className={cn(
                          "grid place-items-center size-7.5 rounded-lg border shrink-0 mt-0.5",
                          meta.bg,
                          meta.color
                        )}
                      >
                        <Icon className="size-4" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-xs text-foreground leading-snug">
                          {message}
                        </div>
                        <div className="flex items-center gap-2 text-[0.68rem] text-muted-foreground font-semibold mt-1">
                          <span className="text-foreground/80">{actor}</span>
                          <span>•</span>
                          <span className="font-mono text-muted-foreground/80">{time}</span>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </ScrollArea>
          </Card>
        </div>
      </ModuleBody>
    </div>
  );
}
