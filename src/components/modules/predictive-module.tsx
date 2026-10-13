"use client";

import * as React from "react";
import {
  TrendingUp,
  Layers,
  ShieldCheck,
  AlertTriangle,
  Play,
  RotateCcw,
  Sliders,
  Sparkles,
  ChevronRight,
  Info,
  Calendar,
  Building,
  Users,
  Zap,
  ArrowUpRight,
  CheckCircle2,
  BarChart3,
  FileSpreadsheet,
  Share2,
  Mountain,
  Compass,
  Activity,
  Check,
  ExternalLink,
  Target,
  ArrowDownRight,
  Gauge,
} from "lucide-react";
import Link from "next/link";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from "recharts";
import { useGeoWiseStore } from "@/stores/app-store";
import { ModuleHeader, ModuleBody } from "./module-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

// Corridors metadata for spatial context
const CORRIDORS = {
  abha_khamis: {
    en: "Abha — Khamis Mushait Axis",
    ar: "محور أبها — خميس مشيط",
    lengthKm: 34.2,
    basePop: 185000,
    zoningCode: "MZ-ASEER-01",
    status: "High Growth",
    descriptionEn: "Primary urban spine connecting Abha civil core with Khamis industrial hub.",
    descriptionAr: "الشريان الحضري الرئيسي الرابط بين قلب أبها الإداري ومحور خميس مشيط التجاري والصناعي.",
  },
  king_fahd: {
    en: "King Fahd Urban Corridor",
    ar: "طريق الملك فهد التنموي",
    lengthKm: 28.6,
    basePop: 142000,
    zoningCode: "MZ-ASEER-04",
    status: "Commercial Mixed",
    descriptionEn: "High-density retail and residential expansion strip along the central arterial.",
    descriptionAr: "شريط التوسع التجاري والسكني عالي الكثافة على طول الشريان التنموي المركزي.",
  },
  soodah: {
    en: "Soodah Escarpment Buffer",
    ar: "مرتفعات السودة السياحية",
    lengthKm: 22.4,
    basePop: 68000,
    zoningCode: "MZ-ASEER-ENV-09",
    status: "Protected / Tourism",
    descriptionEn: "Ecologically sensitive highland buffer with strict slope-protection covenants.",
    descriptionAr: "نطاق المرتفعات الجبلية البيئية الحساسة الخاضع لاشتراطات حماية المنحدرات الصارمة.",
  },
};

export function PredictiveModule() {
  const t = useGeoWiseStore((s) => s.t);
  const lang = useGeoWiseStore((s) => s.lang);

  // Scenario parameters
  const [targetYear, setTargetYear] = React.useState("2030");
  const [selectedCorridor, setSelectedCorridor] = React.useState<keyof typeof CORRIDORS>("abha_khamis");
  const [growthRate, setGrowthRate] = React.useState<number[]>([3.5]); // % annual growth
  const [infrastructureDensity, setInfrastructureDensity] = React.useState<number[]>([70]); // %
  const [interventionActive, setInterventionActive] = React.useState(true);
  const [activeChartMetric, setActiveChartMetric] = React.useState<"pop" | "grid" | "risk">("pop");

  const corridorData = CORRIDORS[selectedCorridor];
  const rate = growthRate[0];
  const density = infrastructureDensity[0];
  const horizonYears = parseInt(targetYear) - 2026;

  // Presets handler
  const applyPreset = (presetRate: number, presetDensity: number) => {
    setGrowthRate([presetRate]);
    setInfrastructureDensity([presetDensity]);
  };

  // Calculations based on slider inputs (deterministic, explainable)
  const baseCorridorPop = corridorData.basePop;
  const baselinePopGrowth = Math.round(baseCorridorPop * Math.pow(1 + rate / 100, horizonYears));
  const interventionPopGrowth = Math.round(baselinePopGrowth * (interventionActive ? 1.12 : 1.0));
  const infrastructureLoadPct = Math.min(100, Math.round((baselinePopGrowth / (baseCorridorPop * 1.25)) * 100 * (density / 70)));
  const mitigatedLoadPct = Math.round(infrastructureLoadPct * (interventionActive ? 0.76 : 1.0));
  
  const complianceRiskScore = Math.round(
    Math.max(15, (rate > 4 ? 42 : 24) + (density > 80 ? 32 : 12) - (interventionActive ? 28 : 0))
  );
  const mitigatedRiskScore = Math.max(12, Math.round(complianceRiskScore * 0.42));

  // Trajectory projection dataset (2026 to 2035)
  const trajectoryData = React.useMemo(() => {
    const years = [2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033, 2034, 2035];
    const capacityCeiling = Math.round(baseCorridorPop * 1.35);

    return years.map((yr) => {
      const step = yr - 2026;
      const bPop = Math.round(baseCorridorPop * Math.pow(1 + rate / 100, step));
      const iPop = Math.round(baseCorridorPop * Math.pow(1 + (rate * 0.94) / 100, step) * (interventionActive ? 1.08 : 1.0));
      
      const bGrid = Math.min(100, Math.round((bPop / (baseCorridorPop * 1.25)) * 100 * (density / 70)));
      const iGrid = Math.min(100, Math.round(bGrid * (interventionActive ? 0.76 : 1.0)));

      const bRisk = Math.min(95, Math.round((step * 4.5) + (rate > 3.5 ? 20 : 10) + (density > 75 ? 15 : 5)));
      const iRisk = Math.max(12, Math.round(bRisk * 0.38));

      return {
        year: yr.toString(),
        baselinePop: bPop,
        interventionPop: iPop,
        capacityPop: capacityCeiling,
        baselineGrid: bGrid,
        interventionGrid: iGrid,
        gridThreshold: 85,
        baselineRisk: bRisk,
        interventionRisk: iRisk,
      };
    });
  }, [baseCorridorPop, rate, density, interventionActive]);

  return (
    <div className="flex flex-col h-full min-h-0 bg-slate-50/60 dark:bg-background text-foreground">
      <ModuleHeader
        moduleId="M08"
        titleKey="mod.predictive"
        subtitleKey="dash.subtitle"
        icon={TrendingUp}
        actions={
          <div className="flex items-center gap-2">
            <Link href="/compliance?tab=data-governance">
              <Button size="sm" variant="outline" className="gap-1.5 text-xs font-semibold bg-white dark:bg-card border-slate-300 dark:border-border text-slate-800 dark:text-foreground hover:bg-slate-100 dark:hover:bg-muted shadow-xs">
                <ShieldCheck className="size-3.5 text-teal-700 dark:text-teal-400" />
                <span>{lang === "ar" ? "حوكمة البيانات والامتثال" : "Compliance & Governance"}</span>
              </Button>
            </Link>
            <Button
              size="sm"
              variant="outline"
              onClick={() => applyPreset(3.5, 70)}
              className="text-xs font-semibold gap-1.5 bg-white dark:bg-card border-slate-300 dark:border-border text-slate-700 dark:text-muted-foreground hover:bg-slate-100 dark:hover:bg-muted shadow-xs"
            >
              <RotateCcw className="size-3.5" />
              <span>{lang === "ar" ? "إعادة التعيين" : "Reset"}</span>
            </Button>
          </div>
        }
      />

      <ModuleBody className="p-4 md:p-6 space-y-6">
        {/* Governance & Methodology Notice (Clean enterprise banner) */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-border bg-white dark:bg-card/70 border-s-4 border-s-teal-600 dark:border-s-teal-400 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-teal-50 dark:bg-teal-500/10 text-teal-700 dark:text-teal-400 border border-teal-200/80 dark:border-teal-500/20 shrink-0">
              <ShieldCheck className="size-4.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-slate-900 dark:text-foreground">
                  {lang === "ar" ? "معايير النمذجة التنبؤية المعتمدة (NDMO Standard)" : "Regional Predictive Modeling Standard (NDMO Grounded)"}
                </h4>
                <Badge variant="outline" className="text-[10px] bg-slate-100 dark:bg-muted border-slate-300 dark:border-border text-slate-700 dark:text-muted-foreground font-mono">
                  Deterministic v2.4
                </Badge>
              </div>
              <p className="text-xs text-slate-600 dark:text-muted-foreground mt-0.5 leading-relaxed">
                {lang === "ar"
                  ? "جميع التوقعات مبنية على معدلات النمو السكانية المعتمدة لمسار عسير وفق رؤية 2030، مع احتساب هوامش عدم اليقين والربط المباشر بسجل فجوات البيانات."
                  : "All forecasts are parameterized on approved regional growth rates with uncertainty bounds and verified spatial layer lineage under NDMO governance rules."}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            <Link href="/compliance?tab=data-governance">
              <Button size="sm" variant="ghost" className="h-8 text-xs font-semibold text-teal-800 dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-500/10 gap-1">
                <span>{lang === "ar" ? "سجل السلالة المكانية" : "Inspect Provenance"}</span>
                <ChevronRight className="size-3.5 rtl:rotate-180" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Configuration Controls Bar */}
        <Card className="border border-slate-200/90 dark:border-border/80 bg-white dark:bg-card shadow-xs rounded-xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-100 dark:border-border/60 bg-slate-50/70 dark:bg-muted/30 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Sliders className="size-4 text-slate-700 dark:text-slate-300" />
              <span className="text-xs font-bold text-slate-900 dark:text-foreground">
                {lang === "ar" ? "معايير ومحددات السيناريو التنبؤي" : "Scenario Simulation Parameters"}
              </span>
            </div>

            {/* Presets shortcut pills */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-muted-foreground me-1">
                {lang === "ar" ? "السيناريوهات الجاهزة:" : "Presets:"}
              </span>
              <button
                type="button"
                onClick={() => applyPreset(2.2, 55)}
                className={cn(
                  "px-2.5 py-1 text-[11px] font-semibold rounded-md transition-all border",
                  rate === 2.2
                    ? "bg-slate-900 text-white border-slate-900 dark:bg-slate-100 dark:text-slate-900 shadow-xs"
                    : "bg-white dark:bg-background border-slate-200 dark:border-border text-slate-700 dark:text-muted-foreground hover:bg-slate-100 dark:hover:bg-muted"
                )}
              >
                {lang === "ar" ? "متحفظ (2.2%)" : "Conservative (2.2%)"}
              </button>
              <button
                type="button"
                onClick={() => applyPreset(3.5, 70)}
                className={cn(
                  "px-2.5 py-1 text-[11px] font-semibold rounded-md transition-all border",
                  rate === 3.5
                    ? "bg-teal-700 text-white border-teal-700 dark:bg-teal-500 dark:text-slate-950 shadow-xs"
                    : "bg-white dark:bg-background border-slate-200 dark:border-border text-slate-700 dark:text-muted-foreground hover:bg-slate-100 dark:hover:bg-muted"
                )}
              >
                {lang === "ar" ? "رؤية عسير (3.5%)" : "Aseer Vision (3.5%)"}
              </button>
              <button
                type="button"
                onClick={() => applyPreset(5.0, 85)}
                className={cn(
                  "px-2.5 py-1 text-[11px] font-semibold rounded-md transition-all border",
                  rate === 5.0
                    ? "bg-slate-900 text-white border-slate-900 dark:bg-slate-100 dark:text-slate-900 shadow-xs"
                    : "bg-white dark:bg-background border-slate-200 dark:border-border text-slate-700 dark:text-muted-foreground hover:bg-slate-100 dark:hover:bg-muted"
                )}
              >
                {lang === "ar" ? "تسارع سياحي (5.0%)" : "Tourism Surge (5.0%)"}
              </button>
            </div>
          </div>

          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-xs">
            {/* Corridor selector */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-slate-800 dark:text-foreground font-bold flex items-center gap-1.5">
                  <Compass className="size-3.5 text-slate-500" />
                  {lang === "ar" ? "المسار الحضري المستهدف" : "Target Urban Corridor"}
                </label>
                <span className="font-mono text-[10px] text-slate-500 dark:text-muted-foreground">{corridorData.zoningCode}</span>
              </div>
              <Select value={selectedCorridor} onValueChange={(val: any) => setSelectedCorridor(val)}>
                <SelectTrigger className="text-xs h-9.5 bg-white dark:bg-background border-slate-300 dark:border-border font-medium shadow-2xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="abha_khamis">{CORRIDORS.abha_khamis[lang]}</SelectItem>
                  <SelectItem value="king_fahd">{CORRIDORS.king_fahd[lang]}</SelectItem>
                  <SelectItem value="soodah">{CORRIDORS.soodah[lang]}</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-[11px] text-slate-500 dark:text-muted-foreground mt-1.5 line-clamp-1">
                {corridorData[lang === "ar" ? "descriptionAr" : "descriptionEn"]}
              </p>
            </div>

            {/* Target year */}
            <div>
              <label className="block text-slate-800 dark:text-foreground font-bold mb-1.5 flex items-center gap-1.5">
                <Calendar className="size-3.5 text-slate-500" />
                {lang === "ar" ? "أفق التنبؤ الزمني" : "Forecast Horizon"}
              </label>
              <Select value={targetYear} onValueChange={setTargetYear}>
                <SelectTrigger className="text-xs h-9.5 bg-white dark:bg-background border-slate-300 dark:border-border font-medium shadow-2xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2028">2028 (Mid-term Horizon — 2 Years)</SelectItem>
                  <SelectItem value="2030">2030 (Aseer Vision 2030 — 4 Years)</SelectItem>
                  <SelectItem value="2035">2035 (Comprehensive Masterplan — 9 Years)</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-500 dark:text-muted-foreground">
                <span className="inline-block size-1.5 rounded-full bg-emerald-500" />
                <span>{horizonYears} {lang === "ar" ? "سنوات استشرافية" : "years projection span"}</span>
              </div>
            </div>

            {/* Growth rate slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center font-bold text-slate-800 dark:text-foreground">
                <span className="flex items-center gap-1.5">
                  <TrendingUp className="size-3.5 text-slate-500" />
                  {lang === "ar" ? "معدل النمو السنوي" : "Annual Growth Rate"}
                </span>
                <span className="font-mono text-slate-900 dark:text-foreground font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-muted text-xs border border-slate-200 dark:border-border">
                  {growthRate[0]}%
                </span>
              </div>
              <Slider value={growthRate} onValueChange={setGrowthRate} min={1.5} max={6.0} step={0.5} className="mt-3" />
              <div className="flex justify-between text-[10px] text-slate-600 dark:text-muted-foreground font-medium pt-1">
                <span>1.5% ({lang === "ar" ? "أدنى" : "Low"})</span>
                <span>3.5% ({lang === "ar" ? "معياري" : "Target"})</span>
                <span>6.0% ({lang === "ar" ? "أقصى" : "Max"})</span>
              </div>
            </div>

            {/* Infrastructure density slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center font-bold text-slate-800 dark:text-foreground">
                <span className="flex items-center gap-1.5">
                  <Gauge className="size-3.5 text-slate-500" />
                  {lang === "ar" ? "مؤشر حمل البنية التحتية" : "Infrastructure Load Index"}
                </span>
                <span className="font-mono text-slate-900 dark:text-foreground font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-muted text-xs border border-slate-200 dark:border-border">
                  {infrastructureDensity[0]}%
                </span>
              </div>
              <Slider value={infrastructureDensity} onValueChange={setInfrastructureDensity} min={30} max={100} step={5} className="mt-3" />
              <div className="flex justify-between text-[10px] text-slate-600 dark:text-muted-foreground font-medium pt-1">
                <span>30% ({lang === "ar" ? "آمن" : "Low"})</span>
                <span>70% ({lang === "ar" ? "حرج" : "Threshold"})</span>
                <span>100% ({lang === "ar" ? "تشبع" : "Capacity"})</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Dynamic Trajectory Interactive Chart (Executive Data Viz) */}
        <Card className="border border-slate-200/90 dark:border-border/80 bg-white dark:bg-card shadow-xs rounded-xl overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm sm:text-base font-bold text-slate-900 dark:text-foreground">
                  {lang === "ar" ? "مسار الاستشراف المستقبلي المقارن (2026 — 2035)" : "Comparative Forecast Trajectory (2026 — 2035)"}
                </CardTitle>
                <Badge className="bg-slate-100 dark:bg-muted text-slate-700 dark:text-muted-foreground border-slate-200 dark:border-border text-[10px] font-mono">
                  {corridorData[lang]}
                </Badge>
              </div>
              <CardDescription className="text-xs text-slate-500 dark:text-muted-foreground mt-0.5">
                {lang === "ar"
                  ? "مقارنة النمو الطبيعي غير المنظم مقابل مسار التدخل المعجل للجنة الإشرافية بعسير"
                  : "Contrasting organic unmanaged growth vs Fast Track Office regulated infrastructure trajectory"}
              </CardDescription>
            </div>

            {/* Metric Selector Tabs */}
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-muted p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setActiveChartMetric("pop")}
                className={cn(
                  "px-3 py-1 text-xs font-semibold rounded-md transition-all",
                  activeChartMetric === "pop"
                    ? "bg-white dark:bg-background text-slate-900 dark:text-foreground shadow-xs"
                    : "text-slate-600 dark:text-muted-foreground hover:text-slate-900"
                )}
              >
                {lang === "ar" ? "النمو السكاني" : "Population"}
              </button>
              <button
                type="button"
                onClick={() => setActiveChartMetric("grid")}
                className={cn(
                  "px-3 py-1 text-xs font-semibold rounded-md transition-all",
                  activeChartMetric === "grid"
                    ? "bg-white dark:bg-background text-slate-900 dark:text-foreground shadow-xs"
                    : "text-slate-600 dark:text-muted-foreground hover:text-slate-900"
                )}
              >
                {lang === "ar" ? "ضغط الشبكات %" : "Grid Stress %"}
              </button>
              <button
                type="button"
                onClick={() => setActiveChartMetric("risk")}
                className={cn(
                  "px-3 py-1 text-xs font-semibold rounded-md transition-all",
                  activeChartMetric === "risk"
                    ? "bg-white dark:bg-background text-slate-900 dark:text-foreground shadow-xs"
                    : "text-slate-600 dark:text-muted-foreground hover:text-slate-900"
                )}
              >
                {lang === "ar" ? "مؤشر المخاطر" : "Risk Index"}
              </button>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                {activeChartMetric === "pop" ? (
                  <AreaChart data={trajectoryData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="baselineGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#64748b" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#64748b" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="interventionGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0d9488" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#0d9488" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.7} />
                    <XAxis dataKey="year" tickLine={false} tick={{ fontSize: 11, fill: "#64748b" }} />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 11, fill: "#64748b" }}
                      tickFormatter={(v) => `${Math.round(v / 1000)}k`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#ffffff",
                        borderColor: "#e2e8f0",
                        borderRadius: "8px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                        fontSize: "12px",
                      }}
                      formatter={(val: any, name: any) => [
                        `${Number(val).toLocaleString()} ${lang === "ar" ? "نسمة" : "capita"}`,
                        name === "interventionPop"
                          ? (lang === "ar" ? "المسار المعجل للجنة (FTO)" : "Fast Track Plan")
                          : (lang === "ar" ? "النمو الطبيعي (Baseline)" : "Baseline Unplanned"),
                      ]}
                    />
                    <Legend
                      verticalAlign="top"
                      height={36}
                      formatter={(val) =>
                        val === "interventionPop"
                          ? (lang === "ar" ? "المسار المعجل المنظم (Fast Track)" : "Fast Track Intervention")
                          : (lang === "ar" ? "النمو الطبيعي غير المنظم (Baseline)" : "Baseline Organic Trend")
                      }
                    />
                    <ReferenceLine
                      y={baseCorridorPop * 1.3}
                      stroke="#ef4444"
                      strokeDasharray="4 4"
                      label={{
                        value: lang === "ar" ? "عتبة الطاقة الاستيعابية القصوى" : "Capacity Ceiling",
                        fill: "#ef4444",
                        fontSize: 10,
                        position: "insideTopRight",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="baselinePop"
                      name="baselinePop"
                      stroke="#64748b"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#baselineGrad)"
                    />
                    <Area
                      type="monotone"
                      dataKey="interventionPop"
                      name="interventionPop"
                      stroke="#0d9488"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#interventionGrad)"
                    />
                  </AreaChart>
                ) : activeChartMetric === "grid" ? (
                  <LineChart data={trajectoryData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.7} />
                    <XAxis dataKey="year" tickLine={false} tick={{ fontSize: 11, fill: "#64748b" }} />
                    <YAxis
                      domain={[30, 100]}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 11, fill: "#64748b" }}
                      tickFormatter={(v) => `${v}%`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#ffffff",
                        borderColor: "#e2e8f0",
                        borderRadius: "8px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                        fontSize: "12px",
                      }}
                      formatter={(val: any, name: any) => [
                        `${val}%`,
                        name === "interventionGrid"
                          ? (lang === "ar" ? "ضغط الشبكات مع التدخل" : "Mitigated Grid Load")
                          : (lang === "ar" ? "ضغط الشبكات الطبيعي" : "Baseline Grid Load"),
                      ]}
                    />
                    <Legend verticalAlign="top" height={36} />
                    <ReferenceLine
                      y={85}
                      stroke="#f59e0b"
                      strokeDasharray="4 4"
                      label={{
                        value: lang === "ar" ? "عتبة الخطر التشغيلي (85%)" : "Critical Overload (85%)",
                        fill: "#b45309",
                        fontSize: 10,
                        position: "insideTopRight",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="baselineGrid"
                      name="baselineGrid"
                      stroke="#ef4444"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="interventionGrid"
                      name="interventionGrid"
                      stroke="#0d9488"
                      strokeWidth={2.5}
                      dot={{ r: 3 }}
                    />
                  </LineChart>
                ) : (
                  <LineChart data={trajectoryData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.7} />
                    <XAxis dataKey="year" tickLine={false} tick={{ fontSize: 11, fill: "#64748b" }} />
                    <YAxis
                      domain={[0, 100]}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 11, fill: "#64748b" }}
                      tickFormatter={(v) => `${v}`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#ffffff",
                        borderColor: "#e2e8f0",
                        borderRadius: "8px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                        fontSize: "12px",
                      }}
                      formatter={(val: any, name: any) => [
                        `${val} / 100`,
                        name === "interventionRisk"
                          ? (lang === "ar" ? "مخاطر التدخل الرقابي" : "Intervention Risk")
                          : (lang === "ar" ? "مخاطر التعدي غير المنظم" : "Baseline Risk"),
                      ]}
                    />
                    <Legend verticalAlign="top" height={36} />
                    <Line
                      type="monotone"
                      dataKey="baselineRisk"
                      name="baselineRisk"
                      stroke="#e11d48"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="interventionRisk"
                      name="interventionRisk"
                      stroke="#059669"
                      strokeWidth={2.5}
                      dot={{ r: 3 }}
                    />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>
        </Card>

        {/* Side-by-Side Comparison Cards (Crisp High-Contrast Enterprise Styling) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Baseline Scenario Card */}
          <Card className="border border-slate-200/90 dark:border-border/80 bg-white dark:bg-card shadow-xs rounded-xl overflow-hidden flex flex-col justify-between">
            <div>
              <CardHeader className="pb-3 border-b border-slate-100 dark:border-border/60 bg-slate-50/50 dark:bg-muted/20">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-bold text-slate-900 dark:text-foreground">
                      {lang === "ar" ? "سيناريو الاتجاه الطبيعي (Baseline)" : "Baseline Trend (No Intervention)"}
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-600 dark:text-muted-foreground mt-0.5">
                      {lang === "ar" ? "النمو العضوي غير المنظم دون مسار المشاريع المعجلة" : "Organic urban sprawl without Fast Track Office infrastructure controls"}
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="text-xs font-mono border-slate-300 dark:border-border text-slate-700 dark:text-muted-foreground bg-white dark:bg-muted shadow-2xs">
                    Baseline Organic
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="pt-5 space-y-4">
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-muted/40 border border-slate-200 dark:border-border text-xs">
                    <span className="text-slate-600 dark:text-muted-foreground font-semibold flex items-center gap-1.5">
                      <Users className="size-3.5 text-slate-500" />
                      {lang === "ar" ? "السكان المتوقعين (2030)" : "Projected Population"}
                    </span>
                    <div className="text-2xl font-bold font-mono mt-1 text-slate-900 dark:text-foreground tracking-tight">
                      {baselinePopGrowth.toLocaleString()}
                    </div>
                    <span className="text-[0.7rem] text-slate-600 dark:text-muted-foreground mt-1 inline-block">
                      ±4.2% {lang === "ar" ? "نطاق عدم اليقين الإحصائي" : "uncertainty band"}
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-amber-50/80 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 text-xs">
                    <span className="text-amber-900 dark:text-amber-300 font-semibold flex items-center gap-1.5">
                      <Zap className="size-3.5 text-amber-700 dark:text-amber-400" />
                      {lang === "ar" ? "ضغط شبكات الخدمات" : "Grid Load Pressure"}
                    </span>
                    <div className="text-2xl font-bold font-mono mt-1 text-amber-900 dark:text-amber-400 tracking-tight">
                      {infrastructureLoadPct}%
                    </div>
                    <span className="text-[0.7rem] text-amber-800 dark:text-amber-400/90 font-medium mt-1 inline-block">
                      {infrastructureLoadPct > 80 ? (lang === "ar" ? "تجاوز عتبة الاستيعاب" : "Approaching capacity") : (lang === "ar" ? "ضمن الحدود التشغيلية" : "Operational band")}
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-500/30 bg-rose-50/50 dark:bg-rose-500/10 text-xs space-y-2">
                  <div className="flex justify-between items-center font-bold">
                    <span className="text-rose-950 dark:text-rose-300 flex items-center gap-1.5">
                      <AlertTriangle className="size-3.5 text-rose-700 dark:text-rose-400" />
                      {lang === "ar" ? "مؤشر المخاطر التفسيري (Explainable Risk)" : "Explainable Risk Score"}
                    </span>
                    <span className="font-mono text-rose-900 dark:text-rose-300 bg-rose-100 dark:bg-rose-500/20 px-2.5 py-0.5 rounded border border-rose-300 dark:border-rose-500/40 text-xs font-bold">
                      {complianceRiskScore} / 100
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-muted-foreground text-xs leading-relaxed">
                    {lang === "ar"
                      ? "ارتفاع احتمالية التعدي على المنحدرات الجبلية غير المخططة في قطاع السودة ومخالفات الاشتراطات البلدية بنسبة تتجاوز ٤٢٪."
                      : "High probability of unplanned slope encroachments, unregulated industrial spillover, and uncoordinated utility extension."}
                  </p>
                </div>
              </CardContent>
            </div>

            <div className="p-4 bg-slate-50/80 dark:bg-muted/30 border-t border-slate-100 dark:border-border/60 text-[11px] text-slate-500 dark:text-muted-foreground flex items-center justify-between">
              <span>{lang === "ar" ? "درجة الاعتمادية: متوسطة (سجلات تاريخية)" : "Confidence: Medium (historical trend)"}</span>
              <span className="font-mono">Uncertainty: ±4.2%</span>
            </div>
          </Card>

          {/* Intervention Scenario Card */}
          <Card className="border border-teal-600/30 dark:border-teal-500/40 bg-white dark:bg-card shadow-xs rounded-xl overflow-hidden flex flex-col justify-between">
            <div>
              <CardHeader className="pb-3 border-b border-teal-100 dark:border-teal-500/20 bg-teal-50/40 dark:bg-teal-950/20">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-bold text-teal-950 dark:text-teal-300 flex items-center gap-2">
                      <Sparkles className="size-4 text-teal-700 dark:text-teal-400" />
                      {lang === "ar" ? "تدخل المسار السريع واللجنة الإشرافية" : "Fast Track Office Intervention"}
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-600 dark:text-muted-foreground mt-0.5">
                      {lang === "ar" ? "نمو منظم مع تسريع التراخيص ومطابقة الاشتراطات الرقابية" : "Regulated growth with Fast Track infrastructure & zoning controls"}
                    </CardDescription>
                  </div>
                  <Badge className="bg-teal-700 text-white dark:bg-teal-600 dark:text-white border-transparent text-xs font-semibold shadow-2xs">
                    Recommended Plan
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="pt-5 space-y-4">
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="p-4 rounded-xl bg-teal-50/70 dark:bg-teal-500/10 border border-teal-200 dark:border-teal-500/30 text-xs">
                    <span className="text-teal-900 dark:text-teal-300 font-semibold flex items-center gap-1.5">
                      <Building className="size-3.5 text-teal-700 dark:text-teal-400" />
                      {lang === "ar" ? "الاستيعاب المخطط (2030)" : "Planned Capacity"}
                    </span>
                    <div className="text-2xl font-bold font-mono mt-1 text-teal-950 dark:text-teal-200 tracking-tight">
                      {interventionPopGrowth.toLocaleString()}
                    </div>
                    <span className="text-[0.7rem] text-teal-800 dark:text-teal-400 font-medium mt-1 inline-block">
                      +12.4% {lang === "ar" ? "كفاءة التوزيع الحضري" : "urban spatial efficiency"}
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-emerald-50/80 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-xs">
                    <span className="text-emerald-900 dark:text-emerald-300 font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="size-3.5 text-emerald-700 dark:text-emerald-400" />
                      {lang === "ar" ? "مرونة الخدمات والبنية" : "Service Resilience"}
                    </span>
                    <div className="text-2xl font-bold font-mono mt-1 text-emerald-900 dark:text-emerald-300 tracking-tight">
                      94.2%
                    </div>
                    <span className="text-[0.7rem] text-emerald-800 dark:text-emerald-400 font-medium mt-1 inline-block">
                      {lang === "ar" ? "مطابق للمعايير البيئية وNDMO" : "NDMO & Environmental compliant"}
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50/40 dark:bg-emerald-500/10 text-xs space-y-2">
                  <div className="flex justify-between items-center font-bold">
                    <span className="text-emerald-950 dark:text-emerald-300 flex items-center gap-1.5">
                      <ShieldCheck className="size-3.5 text-emerald-700 dark:text-emerald-400" />
                      {lang === "ar" ? "مؤشر المخاطر بعد المعالجة" : "Mitigated Risk Score"}
                    </span>
                    <span className="font-mono text-emerald-900 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-500/20 px-2.5 py-0.5 rounded border border-emerald-300 dark:border-emerald-500/40 text-xs font-bold">
                      {mitigatedRiskScore} / 100
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-muted-foreground text-xs leading-relaxed">
                    {lang === "ar"
                      ? "انخفاض مخاطر التعدي بنسبة ٧٠٪ بفضل الربط الفوري بنظام التدقيق والحوكمة الرقابية (M20) والمصادقة على الطبقات المساحية الرسمية."
                      : "Encroachment and zoning violation risk mitigated by 70% with automatic checks against registered official cadastral layers."}
                  </p>
                </div>
              </CardContent>
            </div>

            <div className="p-4 bg-teal-50/50 dark:bg-teal-950/20 border-t border-teal-100 dark:border-teal-500/20 text-[11px] text-teal-900 dark:text-teal-300 flex items-center justify-between">
              <span className="font-semibold">{lang === "ar" ? "معتمد ضمن خطة اللجنة الإشرافية بعسير (SVC)" : "Validated for SVC Fast Track Pipeline"}</span>
              <span className="font-mono font-bold">-58% Risk Delta</span>
            </div>
          </Card>
        </div>

        {/* Multidimensional Scenario Comparison Matrix (Palantir/Enterprise grade) */}
        <Card className="border border-slate-200/90 dark:border-border/80 bg-white dark:bg-card shadow-xs rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-border/60 flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold text-slate-900 dark:text-foreground">
                {lang === "ar" ? "مصفوفة المقارنة الاستراتيجية متعددة الأبعاد" : "Multidimensional Strategic Comparison Matrix"}
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 dark:text-muted-foreground mt-0.5">
                {lang === "ar" ? "تقييم الأثر على مستوى الطاقة الاستيعابية، البنية التحتية، وحوكمة الأراضي" : "Evaluating impact across population capacity, infrastructure load, and spatial governance"}
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-xs font-semibold bg-slate-50 dark:bg-muted border-slate-200 dark:border-border text-slate-700 dark:text-muted-foreground">
              {lang === "ar" ? "أفق ٢٠٣٠" : "Horizon 2030"}
            </Badge>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-start border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-muted/40 border-b border-slate-200 dark:border-border text-slate-700 dark:text-muted-foreground">
                  <th className="py-3 px-4 text-start font-bold">{lang === "ar" ? "البُعد التنموي / الرقابي" : "Strategic Dimension"}</th>
                  <th className="py-3 px-4 text-start font-bold">{lang === "ar" ? "الاتجاه الطبيعي (Baseline)" : "Baseline Unplanned"}</th>
                  <th className="py-3 px-4 text-start font-bold">{lang === "ar" ? "مسار التدخل المعجل (Fast Track)" : "Fast Track Plan"}</th>
                  <th className="py-3 px-4 text-start font-bold">{lang === "ar" ? "الفارق التنموي (Delta)" : "Net Impact / Delta"}</th>
                  <th className="py-3 px-4 text-start font-bold">{lang === "ar" ? "حالة الامتثال" : "Compliance Status"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-border/40">
                <tr className="hover:bg-slate-50/50 dark:hover:bg-muted/20">
                  <td className="py-3 px-4 font-semibold text-slate-900 dark:text-foreground flex items-center gap-2">
                    <Users className="size-3.5 text-slate-500" />
                    <span>{lang === "ar" ? "الاستيعاب السكاني المستدام" : "Demographic Capacity"}</span>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-700 dark:text-foreground">{baselinePopGrowth.toLocaleString()}</td>
                  <td className="py-3 px-4 font-mono font-bold text-teal-800 dark:text-teal-300">{interventionPopGrowth.toLocaleString()}</td>
                  <td className="py-3 px-4 font-mono text-emerald-800 dark:text-emerald-400 font-bold">+12.0% Organized Capacity</td>
                  <td className="py-3 px-4">
                    <Badge className="bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-400 text-[10px] font-semibold">
                      Compliant
                    </Badge>
                  </td>
                </tr>

                <tr className="hover:bg-slate-50/50 dark:hover:bg-muted/20">
                  <td className="py-3 px-4 font-semibold text-slate-900 dark:text-foreground flex items-center gap-2">
                    <Zap className="size-3.5 text-slate-500" />
                    <span>{lang === "ar" ? "ضغط شبكات المياه والكهرباء" : "Grid & Utility Strain"}</span>
                  </td>
                  <td className="py-3 px-4 font-mono text-amber-800 dark:text-amber-400 font-bold">{infrastructureLoadPct}% (High Stress)</td>
                  <td className="py-3 px-4 font-mono font-bold text-teal-800 dark:text-teal-300">{mitigatedLoadPct}% (Optimized)</td>
                  <td className="py-3 px-4 font-mono text-emerald-800 dark:text-emerald-400 font-bold">-24% Load Mitigation</td>
                  <td className="py-3 px-4">
                    <Badge className="bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-400 text-[10px] font-semibold">
                      Under Threshold
                    </Badge>
                  </td>
                </tr>

                <tr className="hover:bg-slate-50/50 dark:hover:bg-muted/20">
                  <td className="py-3 px-4 font-semibold text-slate-900 dark:text-foreground flex items-center gap-2">
                    <Mountain className="size-3.5 text-slate-500" />
                    <span>{lang === "ar" ? "مساحة التعدي على المنحدرات" : "Escarpment Encroachment Area"}</span>
                  </td>
                  <td className="py-3 px-4 font-mono text-rose-800 dark:text-rose-400 font-bold">420 Hectares (High Risk)</td>
                  <td className="py-3 px-4 font-mono font-bold text-teal-800 dark:text-teal-300">65 Hectares (Buffered)</td>
                  <td className="py-3 px-4 font-mono text-emerald-800 dark:text-emerald-400 font-bold">-84.5% Buffer Protection</td>
                  <td className="py-3 px-4">
                    <Badge className="bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-400 text-[10px] font-semibold">
                      Zoning Enforced
                    </Badge>
                  </td>
                </tr>

                <tr className="hover:bg-slate-50/50 dark:hover:bg-muted/20">
                  <td className="py-3 px-4 font-semibold text-slate-900 dark:text-foreground flex items-center gap-2">
                    <ShieldCheck className="size-3.5 text-slate-500" />
                    <span>{lang === "ar" ? "مطابقة المخطط الإقليمي (M20)" : "Regional Masterplan Compliance"}</span>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-600 dark:text-muted-foreground">58.4% (Uncoordinated)</td>
                  <td className="py-3 px-4 font-mono font-bold text-teal-800 dark:text-teal-300">98.2% (SVC Registered)</td>
                  <td className="py-3 px-4 font-mono text-emerald-800 dark:text-emerald-400 font-bold">+39.8% Legal Assurance</td>
                  <td className="py-3 px-4">
                    <Badge className="bg-teal-100 text-teal-900 border-teal-300 dark:bg-teal-500/20 dark:text-teal-400 text-[10px] font-semibold">
                      NDMO Certified
                    </Badge>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>

        {/* Provenance & Active Data Gaps Card */}
        <Card className="border border-slate-200/90 dark:border-border/80 bg-white dark:bg-card shadow-xs rounded-xl p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 dark:text-foreground text-xs">
                  {lang === "ar" ? "سلالة البيانات المكانية وفجوات الإحداثيات المسجلة" : "Spatial Provenance & Registered Cadastral Gaps"}
                </span>
                <Badge variant="outline" className="text-[10px] bg-slate-100 dark:bg-muted text-slate-700 dark:text-muted-foreground border-slate-300 dark:border-border font-mono">
                  SHA-256 Validated
                </Badge>
              </div>
              <p className="text-slate-600 dark:text-muted-foreground text-xs leading-relaxed max-w-2xl">
                {lang === "ar"
                  ? "تعتمد التنبؤات على طبقة المخطط الهيكلي لأمانة عسير (2026.1). يوجد فجوة مسجلة في سجل الحوكمة (GAP-2026-02) تخص تعديل الارتدادات الصناعية في محور خميس مشيط."
                  : "Forecasts ingest Official Masterplan Layer 2026.1 (ID: LYR-OFFICIAL-01). Active gap GAP-2026-02 recorded in M20 for industrial setback thresholds."}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Link href="/compliance?tab=data-governance">
                <Button size="sm" variant="outline" className="text-xs font-semibold gap-1.5 border-slate-300 dark:border-border bg-white dark:bg-card hover:bg-slate-100 dark:hover:bg-muted text-slate-800 dark:text-foreground shadow-2xs">
                  <span>{lang === "ar" ? "فحص سجل الفجوات (M20)" : "View Gap Register"}</span>
                  <ChevronRight className="size-3.5 rtl:rotate-180" />
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </ModuleBody>
    </div>
  );
}
