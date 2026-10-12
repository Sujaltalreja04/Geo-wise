"use client";

import * as React from "react";
import {
  FileText,
  Shield,
  Download,
  Printer,
  Plus,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  Eye,
  MapPin,
  Calendar,
  Layers,
  Sparkles,
  FileSpreadsheet,
  AlertTriangle,
  QrCode,
  FileCheck,
  Check,
  Building,
  UserCheck,
  ExternalLink,
  ChevronDown,
  LayoutGrid,
  List,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useGeoWiseStore } from "@/stores/app-store";
import { ModuleHeader, ModuleBody } from "./module-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { ReportItem } from "@/lib/dummy-data";

async function fetchReports(): Promise<{ reports: ReportItem[] }> {
  const res = await fetch("/api/reports");
  if (!res.ok) throw new Error("Failed to load reports");
  return res.json();
}

async function postReportMutation(body: { action?: string; report?: ReportItem; id?: string; status?: string; approver?: string; approverAr?: string }) {
  const res = await fetch("/api/reports", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Report mutation failed");
  return res.json();
}

export function ReportsModule() {
  const t = useGeoWiseStore((s) => s.t);
  const lang = useGeoWiseStore((s) => s.lang);
  const user = useGeoWiseStore((s) => s.user);
  const queryClient = useQueryClient();

  // Queries
  const { data, isLoading } = useQuery({
    queryKey: ["reports"],
    queryFn: fetchReports,
  });

  const reports = data?.reports || [];

  // Mutations
  const updateStatusMutation = useMutation({
    mutationFn: postReportMutation,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      queryClient.invalidateQueries({ queryKey: ["audit"] });
      toast.success(
        lang === "ar"
          ? `تم تحديث حالة الملف بنجاح إلى: ${variables.status}`
          : `Report status updated to ${variables.status}`
      );
    },
    onError: () => {
      toast.error(lang === "ar" ? "فشل تحديث التقرير" : "Failed to update report");
    },
  });

  const createReportMutation = useMutation({
    mutationFn: postReportMutation,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      queryClient.invalidateQueries({ queryKey: ["audit"] });
      setIsCreateOpen(false);
      setSelectedReport(res.report);
      toast.success(
        lang === "ar"
          ? "تم إنشاء ملف التقرير وتوثيقه رقمياً بنجاح"
          : "Report dossier created and signed successfully"
      );
    },
    onError: () => {
      toast.error(lang === "ar" ? "فشل إنشاء التقرير" : "Failed to create report");
    },
  });

  // State
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [classificationFilter, setClassificationFilter] = React.useState<string>("all");
  const [typeFilter, setTypeFilter] = React.useState<string>("all");
  const [viewMode, setViewMode] = React.useState<"grid" | "table">("grid");

  const [selectedReport, setSelectedReport] = React.useState<ReportItem | null>(null);
  const [isDossierOpen, setIsDossierOpen] = React.useState(false);
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);

  // New Report Form State
  const [newTitleEn, setNewTitleEn] = React.useState("");
  const [newTitleAr, setNewTitleAr] = React.useState("");
  const [newType, setNewType] = React.useState<ReportItem["type"]>("executive");
  const [newClassification, setNewClassification] = React.useState<ReportItem["classification"]>("restricted");
  const [newDistrictEn, setNewDistrictEn] = React.useState("Riyadh Metropolitan");
  const [newDistrictAr, setNewDistrictAr] = React.useState("النطاق الحضري لمنطقة الرياض");
  const [newApproverEn, setNewApproverEn] = React.useState("MOMRAH Spatial Planning Division");
  const [newApproverAr, setNewApproverAr] = React.useState("الإدارة العامة للتخطيط المكاني - بلدي");
  const [newSummaryEn, setNewSummaryEn] = React.useState("");
  const [newSummaryAr, setNewSummaryAr] = React.useState("");
  const [newFinding1En, setNewFinding1En] = React.useState("");
  const [newFinding1Ar, setNewFinding1Ar] = React.useState("");
  const [newRec1En, setNewRec1En] = React.useState("");
  const [newRec1Ar, setNewRec1Ar] = React.useState("");

  // Filtering
  const filteredReports = React.useMemo(() => {
    return reports.filter((r) => {
      const matchesSearch =
        search.trim() === "" ||
        r.id.toLowerCase().includes(search.toLowerCase()) ||
        r.title.toLowerCase().includes(search.toLowerCase()) ||
        r.titleAr.includes(search) ||
        r.district.toLowerCase().includes(search.toLowerCase()) ||
        r.districtAr.includes(search) ||
        r.author.toLowerCase().includes(search.toLowerCase()) ||
        r.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase()));

      const matchesStatus = statusFilter === "all" || r.status === statusFilter;
      const matchesClassification = classificationFilter === "all" || r.classification === classificationFilter;
      const matchesType = typeFilter === "all" || r.type === typeFilter;

      return matchesSearch && matchesStatus && matchesClassification && matchesType;
    });
  }, [reports, search, statusFilter, classificationFilter, typeFilter]);

  // Aggregate KPIs
  const totalCount = reports.length;
  const publishedCount = reports.filter((r) => r.status === "published").length;
  const approvedCount = reports.filter((r) => r.status === "approved").length;
  const inReviewCount = reports.filter((r) => r.status === "review").length;
  const confidentialCount = reports.filter((r) => r.classification === "confidential").length;
  const totalMonitoredArea = reports.reduce((acc, r) => acc + (r.metrics?.areaCoveredKm2 || 0), 0).toFixed(0);

  // Helper status color badges
  const getStatusBadge = (status: ReportItem["status"]) => {
    switch (status) {
      case "published":
        return (
          <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 gap-1 font-semibold text-xs py-0.5">
            <CheckCircle2 className="size-3.5" />
            {lang === "ar" ? "منشور رسمي" : "Published"}
          </Badge>
        );
      case "approved":
        return (
          <Badge className="bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30 gap-1 font-semibold text-xs py-0.5">
            <FileCheck className="size-3.5" />
            {lang === "ar" ? "معتمد" : "Approved"}
          </Badge>
        );
      case "review":
        return (
          <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 gap-1 font-semibold text-xs py-0.5">
            <Clock className="size-3.5" />
            {lang === "ar" ? "قيد المراجعة" : "In Review"}
          </Badge>
        );
      case "draft":
      default:
        return (
          <Badge className="bg-muted text-muted-foreground border-border gap-1 font-semibold text-xs py-0.5">
            {lang === "ar" ? "مسودة" : "Draft"}
          </Badge>
        );
    }
  };

  const getClassificationBadge = (classification: ReportItem["classification"]) => {
    switch (classification) {
      case "confidential":
        return (
          <Badge className="bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30 font-mono text-[0.7rem] uppercase tracking-wider font-bold">
            <Shield className="size-3 me-1" />
            {lang === "ar" ? "سري للغاية" : "Confidential"}
          </Badge>
        );
      case "restricted":
        return (
          <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 font-mono text-[0.7rem] uppercase tracking-wider font-bold">
            <Shield className="size-3 me-1" />
            {lang === "ar" ? "مقيّد — للاستخدام الرسمي" : "Restricted"}
          </Badge>
        );
      case "public":
      default:
        return (
          <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 font-mono text-[0.7rem] uppercase tracking-wider font-bold">
            {lang === "ar" ? "عام" : "Public"}
          </Badge>
        );
    }
  };

  // CSV / XLSX Export Handler
  const handleExportXLSX = () => {
    const headers = [
      "Report ID",
      "Title (EN)",
      "Title (AR)",
      "Type",
      "Classification",
      "Status",
      "District",
      "Author",
      "Approval Authority",
      "Gregorian Date",
      "Hijri Date",
      "Incidents Covered",
      "AI Confidence (%)",
      "Area Covered (km²)",
      "Digital Signature Hash",
    ];

    const rows = filteredReports.map((r) => [
      `"${r.id}"`,
      `"${r.title.replace(/"/g, '""')}"`,
      `"${r.titleAr.replace(/"/g, '""')}"`,
      `"${r.type}"`,
      `"${r.classification}"`,
      `"${r.status}"`,
      `"${r.district}"`,
      `"${r.author}"`,
      `"${r.approver}"`,
      `"${r.gregorianDate}"`,
      `"${r.hijriDate}"`,
      r.metrics?.incidentsCovered ?? 0,
      r.metrics?.aiConfidenceAvg ?? 0,
      r.metrics?.areaCoveredKm2 ?? 0,
      `"${r.signatureHash}"`,
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((row) => row.join(","))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `GeoWise_Reports_Registry_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(
      lang === "ar" ? "تم تصدير سجل التقارير كملف إكسل بنجاح" : "Reports registry exported as Excel/CSV successfully"
    );
  };

  // Print dossier handler
  const handlePrintDossier = () => {
    window.print();
  };

  // Create submission handler
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitleEn && !newTitleAr) {
      toast.error(lang === "ar" ? "يرجى كتابة عنوان التقرير" : "Please provide a report title");
      return;
    }

    const reportId = `GW-REP-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const randomHash = "0x" + Array.from({ length: 48 }, () => Math.floor(Math.random() * 16).toString(16)).join("").toUpperCase();

    const createdReport: ReportItem = {
      id: reportId,
      title: newTitleEn || newTitleAr,
      titleAr: newTitleAr || newTitleEn,
      type: newType,
      typeLabel: newType.toUpperCase(),
      typeLabelAr: newType === "executive" ? "إحاطة تنفيذية" : newType === "environmental" ? "خطر بيئي" : "تفتيش ميداني",
      classification: newClassification,
      status: "review",
      district: newDistrictEn,
      districtAr: newDistrictAr,
      author: user?.name || "Khalid Al-Otaibi",
      authorAr: user?.nameAr || "خالد العتيبي",
      approver: newApproverEn,
      approverAr: newApproverAr,
      createdAt: new Date().toISOString(),
      hijriDate: "٢٥ ربيع الأول ١٤٤٧هـ",
      gregorianDate: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }),
      summary: newSummaryEn || "Executive geospatial intelligence evaluation generated through integrated sensor telemetry.",
      summaryAr: newSummaryAr || "تقييم استخباري مكاني تنفيذي مستخرج عبر تكامل البيانات الفضائية والميدانية.",
      metrics: {
        incidentsCovered: Math.floor(2 + Math.random() * 8),
        aiConfidenceAvg: 94,
        areaCoveredKm2: Math.floor(10 + Math.random() * 80),
        verifiedViolations: Math.floor(1 + Math.random() * 5),
      },
      keyFindings: [
        newFinding1En || "Spatial monitoring confirmed localized surface deviation exceeding standard municipal threshold.",
        "Automated edge telemetry correlated with real-time field dispatch units.",
      ],
      keyFindingsAr: [
        newFinding1Ar || "أكدت المراقبة المكانية وجود انحراف سطحي موضعي يتجاوز العتبة البلدية المعتمدة.",
        "تكامل القراءات الاستشعارية آلياً مع فرق التفتيش الميداني في النطاق.",
      ],
      recommendations: [
        newRec1En || "Schedule prioritized municipal follow-up and formal notification through Balady ecosystem.",
        "Maintain automated satellite change detection surveillance over the parcel.",
      ],
      recommendationsAr: [
        newRec1Ar || "جدولة زيارة رقابية عاجلة وإصدار إشعار نظامي عبر منظومة بلدي.",
        "استمرار المراقبة الفضائية الآلية الدورية لتغيرات الموقع.",
      ],
      signatureHash: randomHash,
      downloadsCount: 1,
      tags: ["Generated", "MOMRAH", newType, newClassification],
    };

    createReportMutation.mutate({ report: createdReport });
  };

  return (
    <div className="flex flex-col h-full bg-background text-foreground">
      {/* Module Top Bar */}
      <ModuleHeader
        moduleId="M13.2"
        titleKey="reports.title"
        subtitleKey="reports.subtitle"
        icon={FileText}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportXLSX}
              className="gap-2 font-medium shadow-sm hover:bg-muted"
            >
              <FileSpreadsheet className="size-4 text-emerald-500" />
              <span>{t("reports.exportXlsx" as never)}</span>
            </Button>
            <Button
              size="sm"
              onClick={() => setIsCreateOpen(true)}
              className="gap-2 bg-primary text-primary-foreground font-semibold shadow-md shadow-primary/20 hover:bg-primary/90"
            >
              <Plus className="size-4" />
              <span>{t("reports.new" as never)}</span>
            </Button>
          </div>
        }
      />

      <ModuleBody className="space-y-6">
        {/* Executive KPI Overview Strip */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4">
          <Card className="border-border/80 bg-card/60 backdrop-blur shadow-sm">
            <CardHeader className="p-3 pb-1">
              <span className="text-xs font-medium text-muted-foreground">
                {lang === "ar" ? "إجمالي التقارير" : "Total Dossiers"}
              </span>
            </CardHeader>
            <CardContent className="p-3 pt-0 flex items-baseline justify-between">
              <span className="text-2xl font-bold font-mono tracking-tight text-foreground">
                {totalCount}
              </span>
              <FileText className="size-4 text-muted-foreground/60" />
            </CardContent>
          </Card>

          <Card className="border-emerald-500/20 bg-emerald-500/5 backdrop-blur shadow-sm">
            <CardHeader className="p-3 pb-1">
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                {lang === "ar" ? "منشور ومعتمد" : "Published & Active"}
              </span>
            </CardHeader>
            <CardContent className="p-3 pt-0 flex items-baseline justify-between">
              <span className="text-2xl font-bold font-mono tracking-tight text-emerald-600 dark:text-emerald-400">
                {publishedCount}
              </span>
              <CheckCircle2 className="size-4 text-emerald-500/80" />
            </CardContent>
          </Card>

          <Card className="border-amber-500/20 bg-amber-500/5 backdrop-blur shadow-sm">
            <CardHeader className="p-3 pb-1">
              <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
                {lang === "ar" ? "قيد المراجعة" : "Under Governance Review"}
              </span>
            </CardHeader>
            <CardContent className="p-3 pt-0 flex items-baseline justify-between">
              <span className="text-2xl font-bold font-mono tracking-tight text-amber-600 dark:text-amber-400">
                {inReviewCount}
              </span>
              <Clock className="size-4 text-amber-500/80" />
            </CardContent>
          </Card>

          <Card className="border-red-500/20 bg-red-500/5 backdrop-blur shadow-sm">
            <CardHeader className="p-3 pb-1">
              <span className="text-xs font-medium text-red-600 dark:text-red-400">
                {lang === "ar" ? "سري ومحمي" : "Confidential / Tier 2"}
              </span>
            </CardHeader>
            <CardContent className="p-3 pt-0 flex items-baseline justify-between">
              <span className="text-2xl font-bold font-mono tracking-tight text-red-600 dark:text-red-400">
                {confidentialCount}
              </span>
              <Shield className="size-4 text-red-500/80" />
            </CardContent>
          </Card>

          <Card className="border-teal-500/20 bg-teal-500/5 backdrop-blur shadow-sm col-span-2 md:col-span-1">
            <CardHeader className="p-3 pb-1">
              <span className="text-xs font-medium text-teal-600 dark:text-teal-400">
                {lang === "ar" ? "المساحة المشمولة" : "Coverage Scope"}
              </span>
            </CardHeader>
            <CardContent className="p-3 pt-0 flex items-baseline justify-between">
              <span className="text-2xl font-bold font-mono tracking-tight text-teal-600 dark:text-teal-400">
                {totalMonitoredArea} <span className="text-xs font-normal">km²</span>
              </span>
              <Layers className="size-4 text-teal-500/80" />
            </CardContent>
          </Card>
        </div>

        {/* Filter and Query Control Bar */}
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between p-3 rounded-xl bg-card border border-border/80 shadow-sm">
          {/* Search */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/70" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("reports.search" as never)}
              className="ps-9 bg-background/80 text-sm h-9 border-border/70"
            />
          </div>

          {/* Filter Dropdowns and Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Status Tabs */}
            <div className="flex items-center rounded-lg bg-muted/60 p-1 border border-border/60">
              {[
                { id: "all", label: lang === "ar" ? "الكل" : "All" },
                { id: "published", label: lang === "ar" ? "منشور" : "Published" },
                { id: "approved", label: lang === "ar" ? "معتمد" : "Approved" },
                { id: "review", label: lang === "ar" ? "مراجعة" : "In Review" },
                { id: "draft", label: lang === "ar" ? "مسودات" : "Drafts" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id)}
                  className={cn(
                    "px-2.5 py-1 text-xs font-medium rounded-md transition-all",
                    statusFilter === tab.id
                      ? "bg-background text-foreground font-semibold shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Classification Filter */}
            <Select value={classificationFilter} onValueChange={setClassificationFilter}>
              <SelectTrigger className="w-[140px] h-9 text-xs bg-background">
                <SelectValue placeholder={lang === "ar" ? "التصنيف" : "Classification"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{lang === "ar" ? "كافة التصنيفات" : "All Security"}</SelectItem>
                <SelectItem value="public">{lang === "ar" ? "عام" : "Public"}</SelectItem>
                <SelectItem value="restricted">{lang === "ar" ? "مقيّد" : "Restricted"}</SelectItem>
                <SelectItem value="confidential">{lang === "ar" ? "سري" : "Confidential"}</SelectItem>
              </SelectContent>
            </Select>

            {/* View Mode Toggle */}
            <div className="flex items-center rounded-lg bg-muted/60 p-0.5 border border-border/60">
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="icon"
                className="size-7"
                onClick={() => setViewMode("grid")}
                title={lang === "ar" ? "عرض البطاقات" : "Card Grid View"}
              >
                <LayoutGrid className="size-3.5" />
              </Button>
              <Button
                variant={viewMode === "table" ? "secondary" : "ghost"}
                size="icon"
                className="size-7"
                onClick={() => setViewMode("table")}
                title={lang === "ar" ? "عرض الجدول" : "Registry Table View"}
              >
                <List className="size-3.5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Reports Content View */}
        {isLoading ? (
          <div className="grid place-items-center py-24 text-muted-foreground">
            <div className="flex flex-col items-center gap-2">
              <span className="size-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-sm">{lang === "ar" ? "جارٍ تحميل سجل التقارير..." : "Loading reports registry..."}</span>
            </div>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="p-12 text-center border rounded-2xl bg-card/40 border-dashed">
            <FileText className="size-10 mx-auto text-muted-foreground/40 mb-3" />
            <h3 className="text-base font-semibold text-foreground">
              {lang === "ar" ? "لا توجد تقارير مطابقة لمعايير البحث" : "No matching reports found"}
            </h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
              {lang === "ar"
                ? "يمكنك تعديل خيارات التصفية أو إنشاء ملف تقرير استخباري جديد الآن."
                : "Try clearing filters or create a new municipal intelligence dossier."}
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setSearch("");
                setStatusFilter("all");
                setClassificationFilter("all");
                setTypeFilter("all");
              }}
              className="mt-4"
            >
              {lang === "ar" ? "إعادة تعيين الفلاتر" : "Reset Filters"}
            </Button>
          </div>
        ) : viewMode === "grid" ? (
          /* Cards Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredReports.map((report) => (
              <Card
                key={report.id}
                className="group border border-border/80 bg-card hover:border-primary/50 transition-all shadow-sm hover:shadow-md flex flex-col justify-between"
              >
                <CardHeader className="p-4 pb-3 space-y-2">
                  {/* Card Header Top Badges */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-muted text-muted-foreground">
                      {report.id}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {getClassificationBadge(report.classification)}
                      {getStatusBadge(report.status)}
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-bold text-foreground leading-snug line-clamp-2 pt-1 group-hover:text-primary transition-colors">
                    {lang === "ar" ? report.titleAr : report.title}
                  </h3>

                  {/* District & Authority */}
                  <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-muted-foreground pt-1">
                    <span className="flex items-center gap-1">
                      <MapPin className="size-3 text-primary shrink-0" />
                      <span>{lang === "ar" ? report.districtAr : report.district}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Building className="size-3 text-muted-foreground/70 shrink-0" />
                      <span className="truncate max-w-[160px]">{lang === "ar" ? report.approverAr : report.approver}</span>
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="p-4 pt-0 space-y-3 flex-1 flex flex-col justify-between">
                  {/* Summary */}
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                    {lang === "ar" ? report.summaryAr : report.summary}
                  </p>

                  {/* Spatial Metrics Mini Bar */}
                  <div className="grid grid-cols-4 gap-2 py-2 px-2.5 rounded-lg bg-muted/40 border border-border/50 text-center font-mono text-[0.72rem]">
                    <div>
                      <span className="block text-[0.65rem] text-muted-foreground font-sans">
                        {lang === "ar" ? "الحوادث" : "Events"}
                      </span>
                      <span className="font-bold text-foreground">{report.metrics?.incidentsCovered ?? 0}</span>
                    </div>
                    <div>
                      <span className="block text-[0.65rem] text-muted-foreground font-sans">
                        {lang === "ar" ? "الثقة الذكية" : "AI Conf."}
                      </span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {report.metrics?.aiConfidenceAvg ?? 0}%
                      </span>
                    </div>
                    <div>
                      <span className="block text-[0.65rem] text-muted-foreground font-sans">
                        {lang === "ar" ? "المساحة" : "Area"}
                      </span>
                      <span className="font-bold text-foreground">{report.metrics?.areaCoveredKm2 ?? 0} km²</span>
                    </div>
                    <div>
                      <span className="block text-[0.65rem] text-muted-foreground font-sans">
                        {lang === "ar" ? "المخالفات" : "Violations"}
                      </span>
                      <span className="font-bold text-amber-600 dark:text-amber-400">
                        {report.metrics?.verifiedViolations ?? 0}
                      </span>
                    </div>
                  </div>

                  {/* Dual Hijri & Gregorian Dates */}
                  <div className="flex items-center justify-between text-[0.7rem] text-muted-foreground/80 pt-1 border-t border-border/40 font-mono">
                    <span className="flex items-center gap-1 font-sans">
                      <Calendar className="size-3 text-muted-foreground/60" />
                      <span>{report.hijriDate}</span>
                    </span>
                    <span>{report.gregorianDate}</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedReport(report);
                        setIsDossierOpen(true);
                      }}
                      className="flex-1 text-xs gap-1.5 h-8 font-semibold hover:bg-primary/10 hover:text-primary hover:border-primary/40"
                    >
                      <Eye className="size-3.5" />
                      <span>{t("reports.viewDossier" as never)}</span>
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-muted-foreground hover:text-foreground"
                      onClick={() => {
                        setSelectedReport(report);
                        setIsDossierOpen(true);
                        setTimeout(() => window.print(), 300);
                      }}
                      title={t("reports.exportPdf" as never)}
                    >
                      <Printer className="size-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          /* Registry Table View */
          <div className="border border-border/80 rounded-xl overflow-hidden bg-card shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-start">
                <thead className="bg-muted/70 text-muted-foreground uppercase text-[0.68rem] tracking-wider border-b border-border/60">
                  <tr>
                    <th className="py-3 px-4 text-start font-semibold">{lang === "ar" ? "المعرف" : "ID"}</th>
                    <th className="py-3 px-4 text-start font-semibold">{lang === "ar" ? "عنوان الملف" : "Dossier Title"}</th>
                    <th className="py-3 px-4 text-start font-semibold">{lang === "ar" ? "التصنيف" : "Security"}</th>
                    <th className="py-3 px-4 text-start font-semibold">{lang === "ar" ? "الحالة" : "Status"}</th>
                    <th className="py-3 px-4 text-start font-semibold">{lang === "ar" ? "النطاق / الحي" : "District"}</th>
                    <th className="py-3 px-4 text-start font-semibold">{lang === "ar" ? "التاريخ الهجري" : "Hijri Date"}</th>
                    <th className="py-3 px-4 text-end font-semibold">{lang === "ar" ? "الإجراءات" : "Actions"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredReports.map((report) => (
                    <tr key={report.id} className="hover:bg-muted/40 transition-colors">
                      <td className="py-3 px-4 font-mono font-semibold text-foreground whitespace-nowrap">
                        {report.id}
                      </td>
                      <td className="py-3 px-4 font-medium text-foreground max-w-sm truncate">
                        {lang === "ar" ? report.titleAr : report.title}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {getClassificationBadge(report.classification)}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {getStatusBadge(report.status)}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground whitespace-nowrap">
                        {lang === "ar" ? report.districtAr : report.district}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground font-mono whitespace-nowrap">
                        {report.hijriDate}
                      </td>
                      <td className="py-3 px-4 text-end whitespace-nowrap">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedReport(report);
                            setIsDossierOpen(true);
                          }}
                          className="h-7 text-xs font-semibold gap-1 text-primary hover:text-primary hover:bg-primary/10"
                        >
                          <Eye className="size-3" />
                          <span>{lang === "ar" ? "عرض" : "Open"}</span>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </ModuleBody>

      {/* ========================================================================= */}
      {/* FULL OFFICIAL DOSSIER MODAL WITH PRINT & WATERMARK STYLING */}
      {/* ========================================================================= */}
      <Dialog open={isDossierOpen} onOpenChange={setIsDossierOpen}>
        <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto scrollbar-thin p-0 border border-border/80 shadow-2xl bg-card">
          {selectedReport && (
            <div className="relative p-6 sm:p-8 space-y-6 print:p-0">
              {/* Official Classification Banner */}
              <div
                className={cn(
                  "p-2.5 rounded-lg text-center font-mono text-xs uppercase tracking-widest font-bold border",
                  selectedReport.classification === "confidential"
                    ? "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30"
                    : selectedReport.classification === "restricted"
                    ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
                    : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                )}
              >
                <span>
                  {selectedReport.classification === "confidential"
                    ? "★ SAUDI DATA SOVEREIGNTY: CONFIDENTIAL TIER 2 — STRICTLY RESTRICTED ACCESS ★"
                    : selectedReport.classification === "restricted"
                    ? "★ RESTRICTED GOVERNMENT INTELLIGENCE — INTERNAL OFFICIAL USE ONLY ★"
                    : "PUBLIC RELEASE GEOSPATIAL INTELLIGENCE DOSSIER"}
                </span>
              </div>

              {/* Header with MOMRAH emblem & Document Provenance */}
              <div className="flex flex-col sm:flex-row items-start justify-between gap-4 border-b pb-5 border-border/80">
                <div className="flex items-start gap-4">
                  <div className="grid place-items-center size-14 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-600 text-slate-950 font-bold shadow-md ring-2 ring-primary/20 shrink-0">
                    <FileText className="size-7" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs px-2 py-0.5 rounded bg-primary/10 text-primary font-bold">
                        {selectedReport.id}
                      </span>
                      <span className="text-xs text-muted-foreground font-mono">
                        {selectedReport.typeLabel.toUpperCase()}
                      </span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight leading-tight">
                      {lang === "ar" ? selectedReport.titleAr : selectedReport.title}
                    </h2>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                      <MapPin className="size-3 text-primary" />
                      <span>{lang === "ar" ? selectedReport.districtAr : selectedReport.district}</span>
                      <span>•</span>
                      <span>{selectedReport.hijriDate} ({selectedReport.gregorianDate})</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrintDossier}
                    className="gap-2 font-medium"
                  >
                    <Printer className="size-4" />
                    <span>{lang === "ar" ? "طباعة PDF رسمي" : "Print PDF"}</span>
                  </Button>
                </div>
              </div>

              {/* Status & Approval Sign-off Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-muted/50 border border-border/60">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground font-medium">
                    {lang === "ar" ? "حالة الاعتماد:" : "Workflow Status:"}
                  </span>
                  {getStatusBadge(selectedReport.status)}
                </div>

                {/* Status Transitions */}
                <div className="flex items-center gap-2">
                  {selectedReport.status === "review" && (
                    <Button
                      size="sm"
                      onClick={() => {
                        updateStatusMutation.mutate({
                          action: "update",
                          id: selectedReport.id,
                          status: "approved",
                          approver: user?.name || "Khalid Al-Otaibi",
                          approverAr: user?.nameAr || "خالد العتيبي",
                        });
                        setSelectedReport((prev) => (prev ? { ...prev, status: "approved" } : null));
                      }}
                      className="h-8 text-xs font-semibold gap-1.5 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <UserCheck className="size-3.5" />
                      <span>{lang === "ar" ? "اعتماد رسمي" : "Sign & Approve"}</span>
                    </Button>
                  )}

                  {selectedReport.status === "approved" && (
                    <Button
                      size="sm"
                      onClick={() => {
                        updateStatusMutation.mutate({
                          action: "update",
                          id: selectedReport.id,
                          status: "published",
                        });
                        setSelectedReport((prev) => (prev ? { ...prev, status: "published" } : null));
                      }}
                      className="h-8 text-xs font-semibold gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      <CheckCircle2 className="size-3.5" />
                      <span>{lang === "ar" ? "نشر رسمي بالبوابة" : "Publish to Portal"}</span>
                    </Button>
                  )}
                </div>
              </div>

              {/* Scope & Spatial Telemetry Metrics Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-card border border-border/70 text-center">
                  <span className="text-xs text-muted-foreground block mb-0.5">
                    {lang === "ar" ? "الحوادث الموثقة" : "Incidents Covered"}
                  </span>
                  <span className="text-xl font-bold font-mono text-foreground">
                    {selectedReport.metrics?.incidentsCovered ?? 0}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-card border border-border/70 text-center">
                  <span className="text-xs text-muted-foreground block mb-0.5">
                    {lang === "ar" ? "دقة الذكاء المكاني" : "AI Confidence"}
                  </span>
                  <span className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                    {selectedReport.metrics?.aiConfidenceAvg ?? 0}%
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-card border border-border/70 text-center">
                  <span className="text-xs text-muted-foreground block mb-0.5">
                    {lang === "ar" ? "المساحة الممسوحة" : "Covered Surface"}
                  </span>
                  <span className="text-xl font-bold font-mono text-foreground">
                    {selectedReport.metrics?.areaCoveredKm2 ?? 0} <span className="text-xs font-normal">km²</span>
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-card border border-border/70 text-center">
                  <span className="text-xs text-muted-foreground block mb-0.5">
                    {lang === "ar" ? "المخالفات المؤكدة" : "Verified Violations"}
                  </span>
                  <span className="text-xl font-bold font-mono text-amber-600 dark:text-amber-400">
                    {selectedReport.metrics?.verifiedViolations ?? 0}
                  </span>
                </div>
              </div>

              {/* Executive Summary */}
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <FileText className="size-4 text-primary" />
                  <span>{lang === "ar" ? "الملخص التنفيذي والاستخباري" : "Executive Intelligence Summary"}</span>
                </h4>
                <div className="p-4 rounded-xl bg-muted/30 border border-border/60 text-sm leading-relaxed text-foreground/90">
                  {lang === "ar" ? selectedReport.summaryAr : selectedReport.summary}
                </div>
              </div>

              {/* Key Geospatial Findings */}
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Sparkles className="size-4 text-amber-500" />
                  <span>{t("reports.findings" as never)}</span>
                </h4>
                <ul className="space-y-2">
                  {(lang === "ar" ? selectedReport.keyFindingsAr : selectedReport.keyFindings)?.map(
                    (finding, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2.5 p-3 rounded-lg bg-card border border-border/60 text-xs sm:text-sm text-foreground/90"
                      >
                        <span className="size-5 rounded-full bg-primary/10 text-primary grid place-items-center text-xs font-bold shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="leading-relaxed">{finding}</span>
                      </li>
                    )
                  )}
                </ul>
              </div>

              {/* Enforcement Recommendations */}
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <AlertTriangle className="size-4 text-red-500" />
                  <span>{t("reports.recommendations" as never)}</span>
                </h4>
                <ul className="space-y-2">
                  {(lang === "ar" ? selectedReport.recommendationsAr : selectedReport.recommendations)?.map(
                    (rec, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2.5 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-xs sm:text-sm text-foreground/90"
                      >
                        <Check className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{rec}</span>
                      </li>
                    )
                  )}
                </ul>
              </div>

              {/* Provenance & Cryptographic Signature Hash */}
              <div className="p-4 rounded-xl bg-muted/60 border border-border/70 space-y-3 font-mono text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/40 pb-2">
                  <div className="flex items-center gap-2">
                    <QrCode className="size-4 text-primary" />
                    <span className="font-bold text-foreground font-sans">
                      {lang === "ar" ? "سلالة الاعتماد والختم الرقمي" : "Cryptographic Provenance & Verification"}
                    </span>
                  </div>
                  <Badge variant="outline" className="bg-background text-[0.68rem]">
                    Ed25519 / SHA-256 Validated
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[0.7rem] text-muted-foreground font-sans">
                  <div>
                    <span className="text-muted-foreground/70 block">{lang === "ar" ? "المعدّ:" : "Author:"}</span>
                    <span className="font-semibold text-foreground">
                      {lang === "ar" ? selectedReport.authorAr : selectedReport.author}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground/70 block">{lang === "ar" ? "جهة الاعتماد:" : "Approver:"}</span>
                    <span className="font-semibold text-foreground">
                      {lang === "ar" ? selectedReport.approverAr : selectedReport.approver}
                    </span>
                  </div>
                </div>

                <div className="pt-1">
                  <span className="text-[0.65rem] text-muted-foreground block mb-0.5">
                    {lang === "ar" ? "بصمة التوقيع الرقمي الحكومي (Digital Hash):" : "Official Digital Signature Hash:"}
                  </span>
                  <p className="p-2 rounded bg-background/80 border border-border/60 text-[0.68rem] text-foreground font-mono break-all select-all">
                    {selectedReport.signatureHash}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* GENERATE NEW DOSSIER MODAL */}
      {/* ========================================================================= */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-thin p-6 border border-border/80 shadow-2xl bg-card">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <FileText className="size-5 text-primary" />
              <span>{t("reports.new" as never)}</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {lang === "ar"
                ? "توليد ملف استخباري مكاني رسمي مع اعتماد السلالة والتصنيف الأمني والأختام الرقمية."
                : "Compile an official municipal intelligence dossier with full cryptographic provenance."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateSubmit} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">
                  {lang === "ar" ? "عنوان التقرير (إنجليزي)" : "Report Title (English)"}
                </label>
                <Input
                  required
                  value={newTitleEn}
                  onChange={(e) => setNewTitleEn(e.target.value)}
                  placeholder="e.g. Al Olaya Geotechnical Subsidence Audit"
                  className="text-xs h-9"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">
                  {lang === "ar" ? "عنوان التقرير (عربي)" : "Report Title (Arabic)"}
                </label>
                <Input
                  required
                  value={newTitleAr}
                  onChange={(e) => setNewTitleAr(e.target.value)}
                  placeholder="مثال: تدقيق الهبوط الجيوتقني بحي العليا"
                  className="text-xs h-9"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">
                  {lang === "ar" ? "نوع التقرير" : "Dossier Type"}
                </label>
                <Select value={newType} onValueChange={(v) => setNewType(v as ReportItem["type"])}>
                  <SelectTrigger className="text-xs h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="executive">{lang === "ar" ? "إحاطة تنفيذية" : "Executive Briefing"}</SelectItem>
                    <SelectItem value="inspection">{lang === "ar" ? "تفتيش ميداني" : "Field Inspection"}</SelectItem>
                    <SelectItem value="environmental">{lang === "ar" ? "خطر بيئي" : "Environmental Hazard"}</SelectItem>
                    <SelectItem value="audit">{lang === "ar" ? "تدقيق جيوتقني" : "Geotechnical Audit"}</SelectItem>
                    <SelectItem value="satellite">{lang === "ar" ? "بنية تحتية ونقل" : "Transit & Satellite"}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">
                  {lang === "ar" ? "التصنيف الأمني" : "Security Classification"}
                </label>
                <Select
                  value={newClassification}
                  onValueChange={(v) => setNewClassification(v as ReportItem["classification"])}
                >
                  <SelectTrigger className="text-xs h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">{lang === "ar" ? "عام (Public)" : "Public"}</SelectItem>
                    <SelectItem value="restricted">{lang === "ar" ? "مقيّد (Restricted)" : "Restricted"}</SelectItem>
                    <SelectItem value="confidential">{lang === "ar" ? "سري للغاية (Confidential)" : "Confidential"}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">
                  {lang === "ar" ? "النطاق / الحي" : "District"}
                </label>
                <Input
                  value={newDistrictEn}
                  onChange={(e) => {
                    setNewDistrictEn(e.target.value);
                    if (!newDistrictAr) setNewDistrictAr(e.target.value);
                  }}
                  placeholder="e.g. Al Malqa / Olaya"
                  className="text-xs h-9"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">
                {lang === "ar" ? "جهة الاعتماد المستهدفة" : "Target Approval Authority"}
              </label>
              <Input
                value={newApproverEn}
                onChange={(e) => setNewApproverEn(e.target.value)}
                placeholder="e.g. MOMRAH Spatial Planning Division"
                className="text-xs h-9"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">
                {lang === "ar" ? "الملخص التنفيذي (عربي أو إنجليزي)" : "Executive Summary"}
              </label>
              <Textarea
                rows={2}
                value={newSummaryEn}
                onChange={(e) => setNewSummaryEn(e.target.value)}
                placeholder="Summary of geospatial telemetry and findings..."
                className="text-xs resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">
                  {lang === "ar" ? "أبرز النتائج الجغرافية" : "Primary Geospatial Finding"}
                </label>
                <Input
                  value={newFinding1En}
                  onChange={(e) => setNewFinding1En(e.target.value)}
                  placeholder="e.g. InSAR radar confirmed 14mm displacement"
                  className="text-xs h-9"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">
                  {lang === "ar" ? "التوصية الإجرائية" : "Enforcement Recommendation"}
                </label>
                <Input
                  value={newRec1En}
                  onChange={(e) => setNewRec1En(e.target.value)}
                  placeholder="e.g. Issue immediate stop-work order via Balady"
                  className="text-xs h-9"
                />
              </div>
            </div>

            <DialogFooter className="pt-3 gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsCreateOpen(false)}
              >
                {lang === "ar" ? "إلغاء" : "Cancel"}
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={createReportMutation.isPending}
                className="gap-2 bg-primary text-primary-foreground font-semibold"
              >
                <FileCheck className="size-4" />
                <span>
                  {createReportMutation.isPending
                    ? lang === "ar"
                      ? "جارٍ الإنشاء والتوثيق..."
                      : "Generating..."
                    : lang === "ar"
                    ? "تأكيد وإنشاء الملف"
                    : "Compile & Sign Dossier"}
                </span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
