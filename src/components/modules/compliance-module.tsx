"use client";

import * as React from "react";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  AlertCircle,
  FileText,
  Database,
  Lock,
  Scale,
  Layers,
  Calendar,
  Download,
  Upload,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Clock,
  User,
  ExternalLink,
  Eye,
  Archive,
  CheckSquare,
  Sliders,
  Server,
  HardDrive,
  Building2,
  FileCheck2,
  ChevronRight,
  Info,
  HelpCircle,
  Hash,
  Activity,
  Check,
  ChevronDown,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useGeoWiseStore } from "@/stores/app-store";
import { ModuleHeader, ModuleBody } from "./module-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { usePathname, useSearchParams } from "next/navigation";
import { toast } from "sonner";

// ─── API Fetchers ───
async function fetchComplianceDashboard() {
  const res = await fetch("/api/compliance/dashboard");
  if (!res.ok) throw new Error("Failed to load compliance dashboard");
  return res.json();
}

async function fetchFrameworks(search = "", applicability = "all", status = "all") {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (applicability !== "all") params.set("applicability", applicability);
  if (status !== "all") params.set("status", status);
  const res = await fetch(`/api/compliance/frameworks?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to load frameworks");
  return res.json();
}

async function fetchControls(search = "", frameworkId = "all", category = "all", status = "all") {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (frameworkId !== "all") params.set("frameworkId", frameworkId);
  if (category !== "all") params.set("category", category);
  if (status !== "all") params.set("status", status);
  const res = await fetch(`/api/compliance/controls?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to load controls");
  return res.json();
}

async function fetchAssessments() {
  const res = await fetch("/api/compliance/assessments");
  if (!res.ok) throw new Error("Failed to load assessments");
  return res.json();
}

async function fetchEvidence() {
  const res = await fetch("/api/compliance/evidence");
  if (!res.ok) throw new Error("Failed to load evidence");
  return res.json();
}

async function fetchFindings(search = "", severity = "all", status = "all") {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (severity !== "all") params.set("severity", severity);
  if (status !== "all") params.set("status", status);
  const res = await fetch(`/api/compliance/findings?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to load findings");
  return res.json();
}

async function fetchDataGovernance() {
  const res = await fetch("/api/compliance/data-governance");
  if (!res.ok) throw new Error("Failed to load spatial data governance");
  return res.json();
}

async function fetchAuditTrail(search = "", outcome = "all", verify = false) {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (outcome !== "all") params.set("outcome", outcome);
  if (verify) params.set("verify", "1");
  const res = await fetch(`/api/compliance/audit?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to load audit trail");
  return res.json();
}

async function fetchComplianceSettings() {
  const res = await fetch("/api/compliance/settings");
  if (!res.ok) throw new Error("Failed to load compliance settings");
  return res.json();
}

// ─── Main Component ───
export function ComplianceModule() {
  const t = useGeoWiseStore((s) => s.t);
  const lang = useGeoWiseStore((s) => s.lang);
  const user = useGeoWiseStore((s) => s.user);
  const queryClient = useQueryClient();

  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [activeTab, setActiveTab] = React.useState<string>("overview");

  React.useEffect(() => {
    const tabParam = searchParams?.get("tab");
    if (tabParam) {
      setActiveTab(tabParam);
      return;
    }
    if (pathname) {
      const parts = pathname.split("/").filter(Boolean);
      if (parts[0] === "compliance" && parts[1]) {
        setActiveTab(parts[1]);
      }
    }
  }, [pathname, searchParams]);

  // Search & Filter States
  const [fwSearch, setFwSearch] = React.useState("");
  const [fwApplicability, setFwApplicability] = React.useState("all");
  const [fwStatus, setFwStatus] = React.useState("all");

  const [ctrlSearch, setCtrlSearch] = React.useState("");
  const [ctrlFw, setCtrlFw] = React.useState("all");
  const [ctrlCat, setCtrlCat] = React.useState("all");
  const [ctrlStatus, setCtrlStatus] = React.useState("all");

  const [findSearch, setFindSearch] = React.useState("");
  const [findSeverity, setFindSeverity] = React.useState("all");
  const [findStatus, setFindStatus] = React.useState("all");

  const [auditSearch, setAuditSearch] = React.useState("");
  const [auditOutcome, setAuditOutcome] = React.useState("all");
  const [auditVerify, setAuditVerify] = React.useState(false);

  // Modals
  const [selectedFramework, setSelectedFramework] = React.useState<any>(null);
  const [selectedControl, setSelectedControl] = React.useState<any>(null);
  const [selectedAssessment, setSelectedAssessment] = React.useState<any>(null);
  const [showNewAssessmentModal, setShowNewAssessmentModal] = React.useState(false);
  const [showUploadEvidenceModal, setShowUploadEvidenceModal] = React.useState(false);
  const [showNewFindingModal, setShowNewFindingModal] = React.useState(false);
  const [showAcceptRiskModal, setShowAcceptRiskModal] = React.useState<any>(null);
  const [showReportViewModal, setShowReportViewModal] = React.useState<any>(null);
  const [showNewDataGapModal, setShowNewDataGapModal] = React.useState(false);

  // Queries
  const dashQuery = useQuery({ queryKey: ["comp-dashboard"], queryFn: fetchComplianceDashboard, refetchInterval: 30_000 });
  const fwQuery = useQuery({
    queryKey: ["comp-frameworks", fwSearch, fwApplicability, fwStatus],
    queryFn: () => fetchFrameworks(fwSearch, fwApplicability, fwStatus),
  });
  const ctrlQuery = useQuery({
    queryKey: ["comp-controls", ctrlSearch, ctrlFw, ctrlCat, ctrlStatus],
    queryFn: () => fetchControls(ctrlSearch, ctrlFw, ctrlCat, ctrlStatus),
  });
  const assessQuery = useQuery({ queryKey: ["comp-assessments"], queryFn: fetchAssessments });
  const evQuery = useQuery({ queryKey: ["comp-evidence"], queryFn: fetchEvidence });
  const findQuery = useQuery({
    queryKey: ["comp-findings", findSearch, findSeverity, findStatus],
    queryFn: () => fetchFindings(findSearch, findSeverity, findStatus),
  });
  const dgQuery = useQuery({ queryKey: ["comp-datagov"], queryFn: fetchDataGovernance });
  const auditQuery = useQuery({
    queryKey: ["comp-audit", auditSearch, auditOutcome, auditVerify],
    queryFn: () => fetchAuditTrail(auditSearch, auditOutcome, auditVerify),
  });
  const setQuery = useQuery({ queryKey: ["comp-settings"], queryFn: fetchComplianceSettings });

  // Mutations
  const refreshAll = () => {
    queryClient.invalidateQueries();
    toast.success(lang === "ar" ? "تم تحديث البيانات بنجاح" : "Compliance data refreshed");
  };

  // Helper for applicability badge
  const renderApplicabilityBadge = (status: string) => {
    switch (status) {
      case "Applicable":
        return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/40 font-semibold">{lang === "ar" ? "مطبق" : "Applicable"}</Badge>;
      case "Pending Confirmation":
        return <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/40 font-semibold">{lang === "ar" ? "قيد التأكيد" : "Pending Confirmation"}</Badge>;
      case "Partially Applicable":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/40 font-semibold">{lang === "ar" ? "مطبق جزئياً" : "Partially Applicable"}</Badge>;
      case "Not Applicable":
        return <Badge variant="outline" className="text-slate-600 dark:text-muted-foreground bg-slate-50 dark:bg-muted border-slate-200 dark:border-border">{lang === "ar" ? "غير مطبق" : "Not Applicable"}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Helper for implementation status badge
  const renderImplementationBadge = (status: string) => {
    switch (status) {
      case "Implemented":
        return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/40 gap-1 font-semibold"><CheckCircle2 className="size-3 text-emerald-700 dark:text-emerald-400" />{lang === "ar" ? "مطبق" : "Implemented"}</Badge>;
      case "Partially Implemented":
        return <Badge className="bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/40 gap-1 font-semibold"><Clock className="size-3 text-amber-700 dark:text-amber-400" />{lang === "ar" ? "مطبق جزئياً" : "Partially Implemented"}</Badge>;
      case "Not Implemented":
        return <Badge className="bg-red-100 text-red-800 border-red-300 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/40 gap-1 font-semibold"><XCircle className="size-3 text-red-700 dark:text-red-400" />{lang === "ar" ? "غير مطبق" : "Not Implemented"}</Badge>;
      case "Pending Verification":
        return <Badge className="bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-500/20 dark:text-purple-300 dark:border-purple-500/40 gap-1 font-semibold"><HelpCircle className="size-3 text-purple-700 dark:text-purple-300" />{lang === "ar" ? "قيد التحقق" : "Pending Verification"}</Badge>;
      case "Not Applicable":
        return <Badge variant="outline" className="text-slate-600 dark:text-muted-foreground bg-slate-50 dark:bg-muted border-slate-200 dark:border-border">{lang === "ar" ? "غير ملزم" : "N/A"}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Helper for severity badge
  const renderSeverityBadge = (sev: string) => {
    switch (sev) {
      case "Critical":
        return <Badge className="bg-red-100 text-red-900 border-red-300 dark:bg-red-600/25 dark:text-red-400 dark:border-red-500/50 font-bold">{lang === "ar" ? "حرج" : "Critical"}</Badge>;
      case "High":
        return <Badge className="bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-500/25 dark:text-amber-400 dark:border-amber-500/50 font-semibold">{lang === "ar" ? "مرتفع" : "High"}</Badge>;
      case "Medium":
        return <Badge className="bg-blue-100 text-blue-900 border-blue-300 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/40 font-semibold">{lang === "ar" ? "متوسط" : "Medium"}</Badge>;
      case "Low":
        return <Badge variant="outline" className="text-slate-600 dark:text-muted-foreground bg-slate-50 dark:bg-muted border-slate-200 dark:border-border">{lang === "ar" ? "منخفض" : "Low"}</Badge>;
      default:
        return <Badge variant="outline">{sev}</Badge>;
    }
  };

  const kpis = dashQuery.data?.kpis;
  const recentActivity = dashQuery.data?.recentActivity || [];
  const highPriorityActions = dashQuery.data?.highPriorityActions || [];

  return (
    <div className="flex flex-col h-full min-h-0 bg-background text-foreground">
      {/* Module Header */}
      <ModuleHeader
        moduleId="GRC — M20"
        titleKey="compliance.title"
        subtitleKey="compliance.subtitle"
        icon={ShieldCheck}
        actions={
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-teal-50 text-teal-800 border-teal-200 dark:bg-teal-500/10 dark:text-teal-400 dark:border-teal-500/30 gap-1.5 py-1">
              <Building2 className="size-3.5" />
              <span>{lang === "ar" ? "اللجنة الإشرافية بعسير (SVC)" : "Aseer SVC Oversight"}</span>
            </Badge>
            <Button size="sm" variant="outline" onClick={refreshAll} className="gap-1.5">
              <RefreshCw className="size-3.5" />
              <span className="hidden sm:inline">{lang === "ar" ? "تحديث" : "Refresh"}</span>
            </Button>
          </div>
        }
      />

      {/* Main Tabbed Layout */}
      <ModuleBody className="p-3 md:p-6 flex flex-col space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex flex-col flex-1">
          {/* Navigation Pill Strip */}
          <div className="border-b border-border/70 pb-2 mb-4 overflow-x-auto scrollbar-none">
            <TabsList className="bg-muted/60 p-1 rounded-xl h-auto flex flex-wrap gap-1">
              <TabsTrigger value="overview" className="gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Activity className="size-3.5" />
                {lang === "ar" ? "لوحة القيادة" : "Overview"}
              </TabsTrigger>
              <TabsTrigger value="frameworks" className="gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Scale className="size-3.5" />
                {lang === "ar" ? "الأطر التنظيمية" : "Frameworks"}
              </TabsTrigger>
              <TabsTrigger value="controls" className="gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <CheckSquare className="size-3.5" />
                {lang === "ar" ? "سجل الضوابط" : "Control Register"}
              </TabsTrigger>
              <TabsTrigger value="assessments" className="gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <FileCheck2 className="size-3.5" />
                {lang === "ar" ? "التقييمات والتدقيق" : "Assessments"}
              </TabsTrigger>
              <TabsTrigger value="evidence" className="gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <FileText className="size-3.5" />
                {lang === "ar" ? "مستودع الأدلة" : "Evidence"}
              </TabsTrigger>
              <TabsTrigger value="findings" className="gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <AlertCircle className="size-3.5" />
                {lang === "ar" ? "الملاحظات والمعالجة" : "Findings & Remediation"}
              </TabsTrigger>
              <TabsTrigger value="data-governance" className="gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Layers className="size-3.5" />
                {lang === "ar" ? "حوكمة البيانات المكانية" : "Data Governance"}
              </TabsTrigger>
              <TabsTrigger value="audit" className="gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Lock className="size-3.5" />
                {lang === "ar" ? "سجل العمليات" : "Audit Trail"}
              </TabsTrigger>
              <TabsTrigger value="reports" className="gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Download className="size-3.5" />
                {lang === "ar" ? "التقارير والتصدير" : "Reports & Exports"}
              </TabsTrigger>
              <TabsTrigger value="settings" className="gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Sliders className="size-3.5" />
                {lang === "ar" ? "الإعدادات" : "Settings"}
              </TabsTrigger>
            </TabsList>
          </div>

          {/* ══════════════════════════════════════════════════════════════
              SECTION 1: OVERVIEW DASHBOARD
             ══════════════════════════════════════════════════════════════ */}
          <TabsContent value="overview" className="space-y-6 focus-visible:outline-none">
            {/* Advisory Alert Banner */}
            <div className="flex items-start gap-3 p-4 rounded-xl border border-teal-200 bg-teal-50/90 text-teal-950 dark:border-teal-500/30 dark:bg-teal-500/10 dark:text-teal-200 shadow-xs">
              <Info className="size-4 shrink-0 mt-0.5 text-teal-700 dark:text-teal-400" />
              <div className="text-xs leading-relaxed">
                <span className="font-bold text-teal-900 dark:text-teal-300">{lang === "ar" ? "تنبيه رقابي مؤسسي: " : "Governance Advisory: "}</span>
                {lang === "ar"
                  ? "جميع المؤشرات والبيانات مستخرجة مباشرة من السجلات الفعلية للنظام وقاعدة بيانات اللجنة الإشرافية بعسير (SVC). تقييمات الامتثال هي لأغراض رقابية وتوجيهية ولا تُعد شهادة رسمية حتى اعتمادها من الجهات التنظيمية المختصة."
                  : "All compliance KPIs and evidence metrics are computed from persisted supervisory database records. GeoWise outcomes remain advisory for the Aseer Supervisory Committee (SVC) and do not constitute formal legal certification."}
              </div>
            </div>

            {/* KPI Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
              <Card
                onClick={() => setActiveTab("frameworks")}
                className="cursor-pointer border border-slate-200/90 dark:border-border/80 bg-white dark:bg-card/70 shadow-xs hover:shadow-md hover:border-primary/50 transition-all rounded-xl"
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-600 dark:text-muted-foreground">{lang === "ar" ? "الأطر المسجلة" : "Frameworks"}</span>
                    <Scale className="size-4 text-primary" />
                  </div>
                  <div className="text-2xl font-black text-slate-900 dark:text-foreground mt-2">{kpis?.totalFrameworks ?? 0}</div>
                  <div className="text-[0.7rem] text-slate-600 dark:text-muted-foreground mt-1 flex items-center gap-1 font-medium">
                    <span className="text-emerald-700 dark:text-emerald-400 font-bold">{kpis?.applicableFrameworks ?? 0}</span> {lang === "ar" ? "مطبق / قيد التأكيد" : "Applicable"}
                  </div>
                </CardContent>
              </Card>

              <Card
                onClick={() => setActiveTab("controls")}
                className="cursor-pointer border border-slate-200/90 dark:border-border/80 bg-white dark:bg-card/70 shadow-xs hover:shadow-md hover:border-primary/50 transition-all rounded-xl"
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-600 dark:text-muted-foreground">{lang === "ar" ? "الضوابط المقيمة" : "Controls Assessed"}</span>
                    <CheckSquare className="size-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="text-2xl font-black text-slate-900 dark:text-foreground mt-2">
                    {kpis?.assessedControls ?? 0} <span className="text-sm font-semibold text-slate-500 dark:text-muted-foreground">/ {kpis?.totalControls ?? 0}</span>
                  </div>
                  <div className="text-[0.7rem] text-slate-600 dark:text-muted-foreground mt-1 font-medium">
                    {Math.round(((kpis?.assessedControls ?? 0) / (kpis?.totalControls || 1)) * 100)}% {lang === "ar" ? "نسبة التغطية" : "coverage rate"}
                  </div>
                </CardContent>
              </Card>

              <Card
                onClick={() => setActiveTab("findings")}
                className="cursor-pointer border border-slate-200/90 dark:border-border/80 bg-white dark:bg-card/70 shadow-xs hover:shadow-md hover:border-amber-400/50 transition-all rounded-xl"
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-600 dark:text-muted-foreground">{lang === "ar" ? "الملاحظات المفتوحة" : "Open Findings"}</span>
                    <AlertCircle className="size-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="text-2xl font-black text-amber-800 dark:text-amber-400 mt-2">{kpis?.openFindings ?? 0}</div>
                  <div className="text-[0.7rem] text-red-700 dark:text-red-400 font-semibold mt-1">
                    {kpis?.overdueRemediations ?? 0} {lang === "ar" ? "متأخر عن الموعد" : "overdue actions"}
                  </div>
                </CardContent>
              </Card>

              <Card
                onClick={() => setActiveTab("evidence")}
                className="cursor-pointer border border-slate-200/90 dark:border-border/80 bg-white dark:bg-card/70 shadow-xs hover:shadow-md hover:border-blue-400/50 transition-all rounded-xl"
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-600 dark:text-muted-foreground">{lang === "ar" ? "أدلة قيد التحقق" : "Unverified Evidence"}</span>
                    <FileText className="size-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="text-2xl font-black text-slate-900 dark:text-foreground mt-2">{kpis?.unverifiedEvidenceCount ?? 0}</div>
                  <div className="text-[0.7rem] text-slate-600 dark:text-muted-foreground mt-1 font-medium">
                    {lang === "ar" ? "تتطلب مراجعة مستقلة" : "Requires auditor signoff"}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Framework Summary Cards & High Priority Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Framework Progress Summary */}
              <div className="lg:col-span-2 space-y-4">
                <Card className="border border-slate-200/90 dark:border-border/80 bg-white dark:bg-card/60 shadow-xs rounded-xl">
                  <CardHeader className="pb-3 border-b border-slate-100 dark:border-border/50">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base font-bold text-slate-900 dark:text-foreground flex items-center gap-2">
                          <Scale className="size-4 text-primary" />
                          {lang === "ar" ? "حالة الأطر التنظيمية الوطنية" : "National Framework Conformance"}
                        </CardTitle>
                        <CardDescription className="text-xs text-slate-500 dark:text-muted-foreground mt-0.5">
                          {lang === "ar" ? "متابعة الالتزام بضوابط الهيئة الوطنية للأمن السيبراني وسدايا" : "Supervisory tracking across NCA ECC, CCC, DCC, PDPL & NDMO"}
                        </CardDescription>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => setActiveTab("frameworks")} className="text-xs h-8 border-slate-300 dark:border-border">
                        {lang === "ar" ? "عرض الكل" : "View All"}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-4">
                    {(dashQuery.data?.frameworkSummary || []).map((fw: any) => (
                      <div
                        key={fw.id}
                        className="p-3.5 rounded-xl border border-slate-200/80 dark:border-border/60 bg-slate-50/70 dark:bg-background/50 hover:bg-white dark:hover:bg-background/80 hover:border-primary/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-slate-900 dark:text-foreground">{fw.name}</span>
                            {renderApplicabilityBadge(fw.applicabilityStatus)}
                            <Badge variant="outline" className="text-[0.65rem] font-mono text-slate-600 dark:text-muted-foreground bg-white dark:bg-muted border-slate-200 dark:border-border">
                              {fw.assessmentStatus}
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-muted-foreground line-clamp-1">{fw.owner}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-end">
                            <div className="text-xs font-bold text-slate-900 dark:text-foreground">{fw.implementedCount} / {fw.controlsCount} {lang === "ar" ? "ضابط" : "controls"}</div>
                            <div className="text-[0.7rem] text-slate-500 dark:text-muted-foreground">
                              {lang === "ar" ? "مراجعة: " : "Review: "} {fw.reviewDate}
                            </div>
                          </div>
                          <div className="w-16 bg-slate-200 dark:bg-muted rounded-full h-2 overflow-hidden">
                            <div className="bg-primary h-full transition-all" style={{ width: `${fw.complianceRate}%` }} />
                          </div>
                          <span className="text-xs font-mono font-black text-slate-900 dark:text-foreground w-10 text-end">{fw.complianceRate}%</span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Spatial Data Governance Alerts */}
                <Card className="border border-slate-200/90 dark:border-border/80 bg-white dark:bg-card/60 shadow-xs rounded-xl">
                  <CardHeader className="pb-3 border-b border-slate-100 dark:border-border/50">
                    <CardTitle className="text-base font-bold text-slate-900 dark:text-foreground flex items-center gap-2">
                      <Layers className="size-4 text-teal-600 dark:text-teal-400" />
                      {lang === "ar" ? "تنبيهات حوكمة البيانات المكانية" : "Spatial Data-Governance Alerts"}
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500 dark:text-muted-foreground">
                      {lang === "ar" ? "مراقبة حداثة الطبقات وفجوات الإحداثيات وتداخلات المخططات" : "Layer freshness alerts and unverified contractor boundary overlays"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2.5 pt-4">
                    {(dashQuery.data?.dataGovernanceAlerts?.unresolvedGaps || []).map((gap: any) => (
                      <div key={gap.id} className="p-3.5 rounded-lg border border-amber-200 dark:border-amber-500/20 bg-amber-50/70 dark:bg-amber-500/5 flex items-start gap-3">
                        <AlertTriangle className="size-4 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
                        <div className="flex-1 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-amber-950 dark:text-foreground">{gap.affectedRequest}</span>
                            {renderSeverityBadge(gap.severity)}
                          </div>
                          <p className="text-amber-900/80 dark:text-muted-foreground mt-1 font-medium">{gap.gapType} — {lang === "ar" ? "المسؤول: " : "Owner: "} {gap.owner}</p>
                        </div>
                      </div>
                    ))}
                    {(dashQuery.data?.dataGovernanceAlerts?.staleAssets || []).map((ast: any) => (
                      <div key={ast.id} className="p-3.5 rounded-lg border border-slate-200 dark:border-border/60 bg-slate-50/80 dark:bg-background/40 flex items-start gap-3">
                        <Clock className="size-4 text-slate-500 dark:text-muted-foreground shrink-0 mt-0.5" />
                        <div className="flex-1 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 dark:text-foreground">{ast.name}</span>
                            <Badge variant="outline" className="text-amber-800 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border-amber-300 dark:border-amber-500/30 text-[0.65rem] font-semibold">{lang === "ar" ? "تجاوزت صلاحية الحداثة" : "Stale Layer"}</Badge>
                          </div>
                          <p className="text-slate-600 dark:text-muted-foreground mt-0.5 font-medium">{lang === "ar" ? "آخر تحديث: " : "Last updated: "} {ast.lastUpdatedDate} ({ast.classificationType})</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* High Priority Actions & Live Audit Feed */}
              <div className="space-y-4">
                <Card className="border border-slate-200/90 dark:border-border/80 bg-white dark:bg-card/60 shadow-xs rounded-xl">
                  <CardHeader className="pb-3 border-b border-slate-100 dark:border-border/50">
                    <CardTitle className="text-base font-bold text-slate-900 dark:text-foreground flex items-center gap-2">
                      <AlertCircle className="size-4 text-red-600 dark:text-red-400" />
                      {lang === "ar" ? "الإجراءات العاجلة" : "High-Priority Actions"}
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500 dark:text-muted-foreground">
                      {lang === "ar" ? "الملاحظات الحرجة ذات الأثر المباشر على قرارات اللجنة" : "Critical and high findings requiring immediate supervisor remediation"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-4">
                    {highPriorityActions.length === 0 ? (
                      <p className="text-xs text-slate-500 dark:text-muted-foreground py-4 text-center">{lang === "ar" ? "لا توجد ملاحظات حرجة مفتوحة" : "No open critical findings."}</p>
                    ) : (
                      highPriorityActions.map((act: any) => (
                        <div key={act.id} className="p-3.5 rounded-xl border border-red-200 dark:border-red-500/20 bg-red-50/70 dark:bg-red-500/5 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-xs font-bold text-red-800 dark:text-red-400">{act.id}</span>
                            {renderSeverityBadge(act.severity)}
                          </div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-foreground leading-tight line-clamp-2">{act.title}</h4>
                          <div className="flex items-center justify-between text-[0.7rem] text-slate-600 dark:text-muted-foreground pt-1 font-medium">
                            <span>{act.assignedOwner}</span>
                            <span className="text-red-700 dark:text-red-400 font-mono font-bold">{act.targetResolutionDate}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>

                {/* Audit Activity Feed */}
                <Card className="border border-slate-200/90 dark:border-border/80 bg-white dark:bg-card/60 shadow-xs rounded-xl">
                  <CardHeader className="pb-3 border-b border-slate-100 dark:border-border/50">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base font-bold text-slate-900 dark:text-foreground flex items-center gap-2">
                        <Lock className="size-4 text-teal-600 dark:text-teal-400" />
                        {lang === "ar" ? "سجل التدقيق الأخير" : "Recent Audit Ledger"}
                      </CardTitle>
                      <Button size="sm" variant="ghost" onClick={() => setActiveTab("audit")} className="text-xs h-7 text-slate-700 dark:text-foreground">
                        {lang === "ar" ? "السجل الكامل" : "View Ledger"}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2.5 pt-4">
                    {recentActivity.slice(0, 5).map((log: any) => (
                      <div key={log.id} className="text-xs border-b border-slate-100 dark:border-border/40 pb-2.5 last:border-0 last:pb-0">
                        <div className="flex items-center justify-between font-semibold">
                          <span className="text-slate-900 dark:text-foreground truncate max-w-[160px]">{log.action}</span>
                          <span className="text-[0.65rem] text-slate-500 dark:text-muted-foreground font-mono">
                            {new Date(log.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                        <p className="text-[0.7rem] text-slate-600 dark:text-muted-foreground line-clamp-1 mt-0.5">{log.details}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* ══════════════════════════════════════════════════════════════
              SECTION 2: COMPLIANCE FRAMEWORKS REGISTRY
             ══════════════════════════════════════════════════════════════ */}
          <TabsContent value="frameworks" className="space-y-4 focus-visible:outline-none">
            {/* Search & Filters */}
            <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
              <div className="flex flex-1 flex-wrap gap-2 items-center">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="size-3.5 absolute start-3 top-3 text-muted-foreground" />
                  <Input
                    value={fwSearch}
                    onChange={(e) => setFwSearch(e.target.value)}
                    placeholder={lang === "ar" ? "بحث في الأطر التنظيمية والمراجع..." : "Search frameworks by name or ID..."}
                    className="ps-9 text-xs h-9"
                  />
                </div>
                <Select value={fwApplicability} onValueChange={setFwApplicability}>
                  <SelectTrigger className="w-[160px] text-xs h-9">
                    <SelectValue placeholder="Applicability" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{lang === "ar" ? "جميع الحالات" : "All Applicability"}</SelectItem>
                    <SelectItem value="Applicable">{lang === "ar" ? "مطبق" : "Applicable"}</SelectItem>
                    <SelectItem value="Pending Confirmation">{lang === "ar" ? "قيد التأكيد" : "Pending Confirmation"}</SelectItem>
                    <SelectItem value="Partially Applicable">{lang === "ar" ? "مطبق جزئياً" : "Partially Applicable"}</SelectItem>
                    <SelectItem value="Not Applicable">{lang === "ar" ? "غير مطبق" : "Not Applicable"}</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={fwStatus} onValueChange={setFwStatus}>
                  <SelectTrigger className="w-[160px] text-xs h-9">
                    <SelectValue placeholder="Assessment Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{lang === "ar" ? "جميع التقييمات" : "All Assessment Status"}</SelectItem>
                    <SelectItem value="Assessed">{lang === "ar" ? "تم التقييم" : "Assessed"}</SelectItem>
                    <SelectItem value="Assessment in Progress">{lang === "ar" ? "التقييم جارٍ" : "In Progress"}</SelectItem>
                    <SelectItem value="Gaps Identified">{lang === "ar" ? "تم رصد فجوات" : "Gaps Identified"}</SelectItem>
                    <SelectItem value="Ready for Review">{lang === "ar" ? "جاهز للمراجعة" : "Ready for Review"}</SelectItem>
                    <SelectItem value="Not Assessed">{lang === "ar" ? "غير مقيم" : "Not Assessed"}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Frameworks Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(fwQuery.data?.frameworks || []).map((fw: any) => (
                <Card key={fw.id} className="border border-slate-200/90 dark:border-border/80 bg-white dark:bg-card shadow-xs hover:shadow-md hover:border-primary/50 transition-all rounded-xl flex flex-col">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-primary px-1.5 py-0.5 rounded bg-primary/10 border border-primary/20">
                            {fw.abbreviation}
                          </span>
                          <CardTitle className="text-base font-bold">{fw.name}</CardTitle>
                        </div>
                        <CardDescription className="text-xs mt-1 font-medium text-foreground/80">
                          {lang === "ar" ? fw.fullNameAr : fw.fullName}
                        </CardDescription>
                      </div>
                      {renderApplicabilityBadge(fw.applicabilityStatus)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 flex-1 flex flex-col justify-between">
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                      {lang === "ar" ? fw.descriptionAr : fw.description}
                    </p>

                    <div className="grid grid-cols-2 gap-2 text-[0.75rem] py-2 border-y border-border/50">
                      <div>
                        <span className="text-muted-foreground">{lang === "ar" ? "الإصدار: " : "Version: "}</span>
                        <span className="font-mono font-semibold">{fw.version}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">{lang === "ar" ? "حالة التقييم: " : "Status: "}</span>
                        <span className="font-semibold">{fw.assessmentStatus}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-muted-foreground">{lang === "ar" ? "مسؤول الالتزام: " : "Owner: "}</span>
                        <span className="font-medium">{fw.responsibleOwner}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <a
                        href={fw.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-primary hover:underline flex items-center gap-1 font-medium"
                      >
                        <ExternalLink className="size-3" />
                        {lang === "ar" ? "المصدر الرسمي" : "Official Source"}
                      </a>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setSelectedFramework(fw)}
                        className="text-xs h-8 gap-1"
                      >
                        <Eye className="size-3.5" />
                        {lang === "ar" ? "عرض التفاصيل" : "View Details"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* ══════════════════════════════════════════════════════════════
              SECTION 3: CONTROL REGISTER
             ══════════════════════════════════════════════════════════════ */}
          <TabsContent value="controls" className="space-y-4 focus-visible:outline-none">
            {/* Control Register Filters */}
            <div className="flex flex-wrap gap-2.5 items-center justify-between">
              <div className="flex flex-1 flex-wrap gap-2 items-center">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="size-3.5 absolute start-3 top-3 text-muted-foreground" />
                  <Input
                    value={ctrlSearch}
                    onChange={(e) => setCtrlSearch(e.target.value)}
                    placeholder={lang === "ar" ? "بحث في الضوابط والمعايير..." : "Search controls by ID, title, requirement..."}
                    className="ps-9 text-xs h-9"
                  />
                </div>
                <Select value={ctrlFw} onValueChange={setCtrlFw}>
                  <SelectTrigger className="w-[140px] text-xs h-9">
                    <SelectValue placeholder="Framework" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{lang === "ar" ? "جميع الأطر" : "All Frameworks"}</SelectItem>
                    <SelectItem value="FW-NCA-ECC">NCA ECC</SelectItem>
                    <SelectItem value="FW-NCA-CCC">NCA CCC</SelectItem>
                    <SelectItem value="FW-SA-PDPL">Saudi PDPL</SelectItem>
                    <SelectItem value="FW-NDMO-DGP">NDMO</SelectItem>
                    <SelectItem value="FW-NCA-DCC">NCA DCC</SelectItem>
                    <SelectItem value="FW-NCA-CSCC">NCA CSCC</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={ctrlCat} onValueChange={setCtrlCat}>
                  <SelectTrigger className="w-[150px] text-xs h-9">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{lang === "ar" ? "جميع الفئات" : "All Categories"}</SelectItem>
                    <SelectItem value="Access Control">Access Control</SelectItem>
                    <SelectItem value="Identity and Authentication">Identity & Auth</SelectItem>
                    <SelectItem value="Data Protection">Data Protection</SelectItem>
                    <SelectItem value="Encryption">Encryption</SelectItem>
                    <SelectItem value="Cloud Security">Cloud Security</SelectItem>
                    <SelectItem value="Audit Logging">Audit Logging</SelectItem>
                    <SelectItem value="Data Governance">Data Governance</SelectItem>
                    <SelectItem value="Privacy">Privacy</SelectItem>
                    <SelectItem value="Vulnerability Management">Vulnerability Mgmt</SelectItem>
                    <SelectItem value="Business Continuity">Business Continuity</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={ctrlStatus} onValueChange={setCtrlStatus}>
                  <SelectTrigger className="w-[150px] text-xs h-9">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{lang === "ar" ? "جميع الحالات" : "All Status"}</SelectItem>
                    <SelectItem value="Implemented">{lang === "ar" ? "مطبق" : "Implemented"}</SelectItem>
                    <SelectItem value="Partially Implemented">{lang === "ar" ? "مطبق جزئياً" : "Partially Implemented"}</SelectItem>
                    <SelectItem value="Not Implemented">{lang === "ar" ? "غير مطبق" : "Not Implemented"}</SelectItem>
                    <SelectItem value="Pending Verification">{lang === "ar" ? "قيد التحقق" : "Pending Verification"}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Controls Table */}
            <Card className="border border-slate-200/90 dark:border-border/80 bg-white dark:bg-card shadow-xs rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-start border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-border bg-slate-50 dark:bg-muted/50 text-slate-700 dark:text-muted-foreground font-bold">
                      <th className="p-3 text-start w-28">{lang === "ar" ? "رمز الضابط" : "Control ID"}</th>
                      <th className="p-3 text-start">{lang === "ar" ? "عنوان الضابط والمتطلب" : "Title & Requirement"}</th>
                      <th className="p-3 text-start w-36">{lang === "ar" ? "الفئة" : "Category"}</th>
                      <th className="p-3 text-start w-32">{lang === "ar" ? "حالة التطبيق" : "Status"}</th>
                      <th className="p-3 text-start w-24">{lang === "ar" ? "الخطورة" : "Risk"}</th>
                      <th className="p-3 text-start w-32">{lang === "ar" ? "المسؤول" : "Owner"}</th>
                      <th className="p-3 text-end w-24">{lang === "ar" ? "إجراءات" : "Actions"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-border/60">
                    {(ctrlQuery.data?.controls || []).map((ctrl: any) => (
                      <tr key={ctrl.id} className="hover:bg-slate-50/60 dark:hover:bg-muted/30 transition-colors">
                        <td className="p-3 font-mono font-bold text-primary">
                          <div className="flex flex-col gap-0.5">
                            <span>{ctrl.id}</span>
                            {ctrl.isDraft && (
                              <Badge variant="outline" className="text-[0.6rem] text-amber-800 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border-amber-300 dark:border-amber-500/40 w-fit">
                                {lang === "ar" ? "مسودة" : "Draft"}
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="font-semibold text-foreground">{ctrl.title}</div>
                          <p className="text-[0.7rem] text-muted-foreground line-clamp-1 mt-0.5">{ctrl.requirementText}</p>
                        </td>
                        <td className="p-3 text-muted-foreground">{ctrl.category}</td>
                        <td className="p-3">{renderImplementationBadge(ctrl.implementationStatus)}</td>
                        <td className="p-3">{renderSeverityBadge(ctrl.riskRating)}</td>
                        <td className="p-3 text-muted-foreground truncate max-w-[120px]">{ctrl.controlOwner}</td>
                        <td className="p-3 text-end">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedControl(ctrl)}
                            className="size-7 p-0"
                          >
                            <Eye className="size-3.5" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          {/* ══════════════════════════════════════════════════════════════
              SECTION 4: ASSESSMENTS WORKFLOW
             ══════════════════════════════════════════════════════════════ */}
          <TabsContent value="assessments" className="space-y-4 focus-visible:outline-none">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold">{lang === "ar" ? "سير عمليات تقييم الامتثال" : "Compliance Assessment Workflows"}</h3>
                <p className="text-xs text-muted-foreground">
                  {lang === "ar" ? "إنهاء التقييم يتطلب مراجعة مستقلة ومصادقة من ممثل اللجنة الإشرافية" : "Assessments require independent reviewer approval per Aseer SVC governance policy"}
                </p>
              </div>
              <Button size="sm" onClick={() => setShowNewAssessmentModal(true)} className="gap-1.5 text-xs">
                <Plus className="size-3.5" />
                {lang === "ar" ? "بدء تقييم جديد" : "New Assessment"}
              </Button>
            </div>

            <div className="space-y-3">
              {(assessQuery.data?.assessments || []).map((asm: any) => (
                <Card key={asm.id} className="border border-slate-200/90 dark:border-border/80 bg-white dark:bg-card shadow-xs rounded-xl p-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-border/60">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-primary">{asm.id}</span>
                        <Badge variant="outline" className="font-semibold text-xs border-slate-300 dark:border-border bg-slate-50 dark:bg-muted text-slate-700 dark:text-muted-foreground">{asm.framework?.name}</Badge>
                        <Badge className={cn("text-xs font-semibold", asm.status === "Approved" ? "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/40" : asm.status === "In Review" ? "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/40" : "bg-slate-100 text-slate-700 dark:bg-muted dark:text-muted-foreground")}>
                          {asm.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-foreground/80 mt-1">{asm.scope}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => setSelectedAssessment(asm)} className="text-xs">
                        {lang === "ar" ? "استعراض الضوابط والنتائج" : "Inspect Results"}
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 text-xs text-muted-foreground">
                    <div>
                      <span className="block font-medium text-foreground">{lang === "ar" ? "المقيّم: " : "Assessor: "}</span>
                      {asm.assessor}
                    </div>
                    <div>
                      <span className="block font-medium text-foreground">{lang === "ar" ? "المراجع المستقل: " : "Independent Reviewer: "}</span>
                      {asm.reviewer}
                    </div>
                    <div>
                      <span className="block font-medium text-foreground">{lang === "ar" ? "الفترة: " : "Period: "}</span>
                      {asm.period}
                    </div>
                    <div>
                      <span className="block font-medium text-foreground">{lang === "ar" ? "الضوابط المسجلة: " : "Evaluated Controls: "}</span>
                      {asm.results?.length ?? 0} {lang === "ar" ? "ضوابط" : "controls"}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* ══════════════════════════════════════════════════════════════
              SECTION 5: EVIDENCE REPOSITORY
             ══════════════════════════════════════════════════════════════ */}
          <TabsContent value="evidence" className="space-y-4 focus-visible:outline-none">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold">{lang === "ar" ? "مستودع الأدلة والوثائق الثبوتية" : "Secure Evidence Repository"}</h3>
                <p className="text-xs text-muted-foreground">
                  {lang === "ar" ? "وثائق مشفرة مع مطابقة البصمة الرقمية (SHA-256) وسجل تدقيق التحميل" : "Encrypted repository with SHA-256 cryptographic verification and access auditing"}
                </p>
              </div>
              <Button size="sm" onClick={() => setShowUploadEvidenceModal(true)} className="gap-1.5 text-xs">
                <Upload className="size-3.5" />
                {lang === "ar" ? "رفع دليل إثبات" : "Upload Evidence"}
              </Button>
            </div>

            <Card className="border border-slate-200/90 dark:border-border/80 bg-white dark:bg-card shadow-xs rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-start border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-border bg-slate-50 dark:bg-muted/50 text-slate-700 dark:text-muted-foreground font-bold">
                      <th className="p-3 text-start">{lang === "ar" ? "اسم الملف" : "File Name"}</th>
                      <th className="p-3 text-start w-32">{lang === "ar" ? "الضابط المرتبط" : "Linked Control"}</th>
                      <th className="p-3 text-start w-28">{lang === "ar" ? "الحجم" : "Size"}</th>
                      <th className="p-3 text-start w-32">{lang === "ar" ? "حالة التدقيق" : "Review Status"}</th>
                      <th className="p-3 text-start w-48">{lang === "ar" ? "بصمة SHA-256" : "SHA-256 Integrity Hash"}</th>
                      <th className="p-3 text-end w-28">{lang === "ar" ? "تحميل آمن" : "Download"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-border/60">
                    {(evQuery.data?.evidences || []).map((ev: any) => (
                      <tr key={ev.id} className="hover:bg-slate-50/60 dark:hover:bg-muted/30 transition-colors">
                        <td className="p-3 font-semibold text-slate-900 dark:text-foreground">
                          <div className="flex items-center gap-2">
                            <FileText className="size-4 text-primary shrink-0" />
                            <span className="truncate max-w-[220px]">{ev.originalFilename}</span>
                          </div>
                        </td>
                        <td className="p-3 font-mono font-bold text-primary">{ev.controlId || "—"}</td>
                        <td className="p-3 font-mono text-slate-600 dark:text-muted-foreground">{Math.round(ev.fileSize / 1024)} KB</td>
                        <td className="p-3">
                          <Badge className={cn("text-[0.65rem] font-semibold", ev.reviewStatus === "Verified" ? "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/40" : "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/40")}>
                            {ev.reviewStatus}
                          </Badge>
                        </td>
                        <td className="p-3 font-mono text-[0.65rem] text-muted-foreground truncate max-w-[180px]">
                          {ev.checksumSha256}
                        </td>
                        <td className="p-3 text-end">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={async () => {
                              try {
                                const res = await fetch(`/api/compliance/evidence?downloadId=${ev.id}&actor=${encodeURIComponent(user.name)}`);
                                const data = await res.json();
                                toast.success(data.message || "Authorized download initiated and logged.");
                              } catch {
                                toast.error("Download failed");
                              }
                            }}
                            className="text-xs h-7 gap-1"
                          >
                            <Download className="size-3" />
                            {lang === "ar" ? "تحميل" : "Download"}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          {/* ══════════════════════════════════════════════════════════════
              SECTION 6: FINDINGS & REMEDIATION
             ══════════════════════════════════════════════════════════════ */}
          <TabsContent value="findings" className="space-y-4 focus-visible:outline-none">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-1 flex-wrap gap-2 items-center">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="size-3.5 absolute start-3 top-3 text-muted-foreground" />
                  <Input
                    value={findSearch}
                    onChange={(e) => setFindSearch(e.target.value)}
                    placeholder={lang === "ar" ? "بحث في الملاحظات والفجوات..." : "Search findings by title or owner..."}
                    className="ps-9 text-xs h-9"
                  />
                </div>
                <Select value={findSeverity} onValueChange={setFindSeverity}>
                  <SelectTrigger className="w-[140px] text-xs h-9">
                    <SelectValue placeholder="Severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{lang === "ar" ? "جميع درجات الخطورة" : "All Severities"}</SelectItem>
                    <SelectItem value="Critical">{lang === "ar" ? "حرج" : "Critical"}</SelectItem>
                    <SelectItem value="High">{lang === "ar" ? "مرتفع" : "High"}</SelectItem>
                    <SelectItem value="Medium">{lang === "ar" ? "متوسط" : "Medium"}</SelectItem>
                    <SelectItem value="Low">{lang === "ar" ? "منخفض" : "Low"}</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={findStatus} onValueChange={setFindStatus}>
                  <SelectTrigger className="w-[150px] text-xs h-9">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{lang === "ar" ? "جميع الحالات" : "All Status"}</SelectItem>
                    <SelectItem value="Open">{lang === "ar" ? "مفتوح" : "Open"}</SelectItem>
                    <SelectItem value="In Progress">{lang === "ar" ? "قيد المعالجة" : "In Progress"}</SelectItem>
                    <SelectItem value="Pending Verification">{lang === "ar" ? "بانتظار التحقق" : "Pending Verification"}</SelectItem>
                    <SelectItem value="Accepted Risk">{lang === "ar" ? "مخاطرة مقبولة" : "Accepted Risk"}</SelectItem>
                    <SelectItem value="Resolved">{lang === "ar" ? "تم الحل" : "Resolved"}</SelectItem>
                    <SelectItem value="Closed">{lang === "ar" ? "مغلق" : "Closed"}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button size="sm" onClick={() => setShowNewFindingModal(true)} className="gap-1.5 text-xs h-9">
                <Plus className="size-3.5" />
                {lang === "ar" ? "تسجيل ملاحظة رقابية" : "Create Finding"}
              </Button>
            </div>

            <div className="space-y-3">
              {(findQuery.data?.findings || []).map((fnd: any) => (
                <Card key={fnd.id} className="border border-slate-200/90 dark:border-border/80 bg-white dark:bg-card shadow-xs rounded-xl p-4 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-amber-800 dark:text-amber-300">{fnd.id}</span>
                        <span className="font-mono text-xs text-slate-500 dark:text-muted-foreground">({fnd.controlId})</span>
                        {renderSeverityBadge(fnd.severity)}
                        <Badge variant="outline" className="text-xs bg-slate-50 dark:bg-muted border-slate-300 dark:border-border text-slate-700 dark:text-muted-foreground">{fnd.status}</Badge>
                      </div>
                      <h4 className="font-semibold text-sm text-slate-900 dark:text-foreground">{fnd.title}</h4>
                      <p className="text-xs text-slate-600 dark:text-muted-foreground leading-relaxed">{fnd.description}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {fnd.status !== "Accepted Risk" && fnd.status !== "Closed" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setShowAcceptRiskModal(fnd)}
                          className="text-xs h-8"
                        >
                          {lang === "ar" ? "قبول المخاطرة" : "Accept Risk"}
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={async () => {
                          const nextStatus = fnd.status === "Open" ? "In Progress" : fnd.status === "In Progress" ? "Resolved" : "Closed";
                          await fetch("/api/compliance/findings", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ action: "update_status", id: fnd.id, status: nextStatus, actor: user.name }),
                          });
                          queryClient.invalidateQueries({ queryKey: ["comp-findings"] });
                          toast.success(`Finding status updated to ${nextStatus}`);
                        }}
                        className="text-xs h-8"
                      >
                        {lang === "ar" ? "تحديث الحالة" : "Next Step"}
                      </Button>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-muted/40 border border-border/50 text-xs grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <span className="text-muted-foreground">{lang === "ar" ? "الإجراء الموصى به: " : "Recommended Action: "}</span>
                      <span className="font-medium text-foreground">{fnd.recommendedAction}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">{lang === "ar" ? "المسؤول: " : "Owner: "}</span>
                      <span className="font-medium">{fnd.assignedOwner}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">{lang === "ar" ? "الموعد المستهدف: " : "Target Date: "}</span>
                      <span className="font-mono font-medium">{fnd.targetResolutionDate}</span>
                    </div>
                  </div>

                  {fnd.status === "Accepted Risk" && (
                    <div className="p-2.5 rounded-lg border border-purple-500/30 bg-purple-500/10 text-xs space-y-1">
                      <div className="font-bold text-purple-300 flex items-center gap-1.5">
                        <Check className="size-3.5" />
                        {lang === "ar" ? "مخاطرة مقبولة نظامياً بموافقة المفوض:" : "Formally Accepted Risk:"}
                      </div>
                      <p className="text-foreground/90">{fnd.riskAcceptanceJustification}</p>
                      <div className="text-[0.7rem] text-muted-foreground pt-1 flex items-center gap-3">
                        <span>{lang === "ar" ? "المفوض: " : "Approver: "} {fnd.riskAcceptedBy}</span>
                        <span>{lang === "ar" ? "تاريخ انتهاء القبول: " : "Expiry: "} {fnd.riskExpiryDate}</span>
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* ══════════════════════════════════════════════════════════════
              SECTION 7: DATA GOVERNANCE & SPATIAL INTEGRATION
             ══════════════════════════════════════════════════════════════ */}
          <TabsContent value="data-governance" className="space-y-6 focus-visible:outline-none">
            {/* Spatial Integration Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <Layers className="size-4 text-teal-400" />
                  {lang === "ar" ? "حوكمة وسلالة البيانات المكانية لمنطقة عسير" : "Aseer Spatial Data Governance & Provenance"}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {lang === "ar" ? "تمييز الطبقات الرسمية المعتمدة عن المواد الاسترشادية وسجل فجوات الإحداثيات" : "Official cadastral layers vs reference-only contractor datasets & boundary traceability"}
                </p>
              </div>
              <Button size="sm" onClick={() => setShowNewDataGapModal(true)} className="gap-1.5 text-xs">
                <Plus className="size-3.5" />
                {lang === "ar" ? "تسجيل فجوة بيانات مكانية" : "Log Data Gap"}
              </Button>
            </div>

            {/* Spatial Assets Register */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(dgQuery.data?.assets || []).map((ast: any) => (
                <Card key={ast.id} className="border border-slate-200/90 dark:border-border/80 bg-white dark:bg-card shadow-xs rounded-xl p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-primary">{ast.id}</span>
                        {ast.classificationType === "Official" ? (
                          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/40 font-semibold">{lang === "ar" ? "طبقة رسمية معتمدة" : "Official"}</Badge>
                        ) : (
                          <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30 font-semibold">{lang === "ar" ? "للاستئناس فقط" : "Reference-Only"}</Badge>
                        )}
                        <Badge variant="outline" className="text-[0.65rem] font-mono uppercase bg-slate-50 dark:bg-muted border-slate-300 dark:border-border text-slate-700 dark:text-muted-foreground">{ast.securityClassification}</Badge>
                      </div>
                      <h4 className="font-bold text-sm mt-1 text-slate-900 dark:text-foreground">{lang === "ar" ? ast.datasetNameAr : ast.datasetName}</h4>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-muted-foreground line-clamp-2">{ast.description}</p>

                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-muted/30 border border-slate-200 dark:border-border/40 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 dark:text-muted-foreground">{lang === "ar" ? "المرجعية ونظام الإحداثيات: " : "CRS & Authority: "}</span>
                      <span className="font-mono font-medium text-slate-900 dark:text-foreground">{ast.crs}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 dark:text-muted-foreground">{lang === "ar" ? "الجهة المصدرة: " : "Source Authority: "}</span>
                      <span className="font-medium text-slate-900 dark:text-foreground truncate max-w-[200px]">{ast.sourceAuthority}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 dark:text-muted-foreground">{lang === "ar" ? "تاريخ التحديث والحداثة: " : "Updated & Freshness: "}</span>
                      <span className={cn("font-medium", ast.isStale ? "text-amber-800 dark:text-amber-300 font-bold" : "text-emerald-800 dark:text-emerald-300")}>
                        {ast.lastUpdatedDate} {ast.isStale && `(${lang === "ar" ? "متأخر > 90 يوم" : "Stale > 90d"})`}
                      </span>
                    </div>
                  </div>

                  <div className="text-[0.7rem] text-muted-foreground border-t border-border/40 pt-2">
                    <span className="font-semibold">{lang === "ar" ? "التحليلات المرتبطة: " : "Linked Analyses: "}</span>
                    {ast.associatedAnalyses || "Spatial overlays"}
                  </div>
                </Card>
              ))}
            </div>

            {/* Analysis Traceability Engine Log */}
            <Card className="border border-slate-200/90 dark:border-border/80 bg-white dark:bg-card shadow-xs rounded-xl overflow-hidden">
              <CardHeader className="pb-3 border-b border-slate-100 dark:border-border/60">
                <CardTitle className="text-base font-bold text-slate-900 dark:text-foreground flex items-center gap-2">
                  <Activity className="size-4 text-teal-700 dark:text-teal-400" />
                  {lang === "ar" ? "سجل تتبع التحليلات المكانية وسلالة المخرجات (Provenance Trace)" : "Spatial Analysis Traceability & Source Provenance Log"}
                </CardTitle>
                <CardDescription className="text-xs text-slate-600 dark:text-muted-foreground">
                  {lang === "ar" ? "ربط كل نتيجة استعلام بالطبقات والنسخ المستخدمة مع توثيق قيود البيانات" : "Trace every automated spatial score back to source layers and documented model assumptions"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 pt-4">
                {(dgQuery.data?.traceabilitySamples || []).map((trace: any) => (
                  <div key={trace.requestId} className="p-3.5 rounded-xl border border-slate-200 dark:border-border/60 bg-slate-50/60 dark:bg-background/50 text-xs space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 font-semibold">
                      <span className="text-primary font-mono">{trace.requestId} — {trace.analysisMethod}</span>
                      <span className="text-[0.7rem] text-slate-500 dark:text-muted-foreground font-mono">{trace.timestamp}</span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {trace.inputs.map((inp: any, idx: number) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-white dark:bg-muted text-[0.68rem] border border-slate-200 dark:border-border flex items-center gap-1 font-medium">
                          {inp.name} <span className="text-slate-500 dark:text-muted-foreground font-mono">({inp.version})</span>
                          <span className={cn("text-[0.6rem] font-bold", inp.type.includes("Official") ? "text-emerald-800 dark:text-emerald-400" : "text-amber-800 dark:text-amber-400")}>
                            [{inp.type}]
                          </span>
                        </span>
                      ))}
                    </div>

                    <div className="p-2 rounded bg-amber-500/5 border border-amber-500/20 text-amber-300 text-[0.7rem] space-y-0.5">
                      <span className="font-bold">{lang === "ar" ? "قيود البيانات: " : "Data Limitations: "}</span>
                      {trace.dataLimitations}
                    </div>

                    <p className="text-[0.68rem] text-teal-400 font-medium">
                      {trace.humanOversightNote}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ══════════════════════════════════════════════════════════════
              SECTION 8: AUDIT TRAIL
             ══════════════════════════════════════════════════════════════ */}
          <TabsContent value="audit" className="space-y-4 focus-visible:outline-none">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <Lock className="size-4 text-primary" />
                  {lang === "ar" ? "سجل التدقيق غير القابل للتعديل (Tamper-Evident Ledger)" : "Tamper-Evident Audit Ledger"}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {lang === "ar" ? "جميع العمليات مسجلة ببصمة مشفرة لمنع التلاعب بسجلات قرارات اللجنة" : "Immutable audit trail with SHA-256 cryptographic signatures"}
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setAuditVerify(true);
                  setTimeout(() => setAuditVerify(false), 2000);
                  toast.success(lang === "ar" ? "تم التحقق من سلامة جميع السجلات المشفرة" : "All audit SHA-256 hashes verified intact.");
                }}
                className="gap-1.5 text-xs"
              >
                <CheckCircle2 className="size-3.5 text-emerald-400" />
                {lang === "ar" ? "فحص سلامة التشفير" : "Verify Hashes"}
              </Button>
            </div>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="size-3.5 absolute start-3 top-3 text-muted-foreground" />
                <Input
                  value={auditSearch}
                  onChange={(e) => setAuditSearch(e.target.value)}
                  placeholder={lang === "ar" ? "بحث في سجل العمليات..." : "Search audit events..."}
                  className="ps-9 text-xs h-9"
                />
              </div>
              <Select value={auditOutcome} onValueChange={setAuditOutcome}>
                <SelectTrigger className="w-[140px] text-xs h-9">
                  <SelectValue placeholder="Outcome" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{lang === "ar" ? "جميع النتائج" : "All Outcomes"}</SelectItem>
                  <SelectItem value="success">{lang === "ar" ? "نجاح" : "Success"}</SelectItem>
                  <SelectItem value="denied">{lang === "ar" ? "مرفوض" : "Denied"}</SelectItem>
                  <SelectItem value="error">{lang === "ar" ? "خطأ" : "Error"}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Card className="border border-slate-200/90 dark:border-border/80 bg-white dark:bg-card shadow-xs rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-start border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-border bg-slate-50 dark:bg-muted/50 text-slate-700 dark:text-muted-foreground font-bold">
                      <th className="p-3 text-start w-36">{lang === "ar" ? "الوقت (UTC)" : "Timestamp (UTC)"}</th>
                      <th className="p-3 text-start w-32">{lang === "ar" ? "المستخدم" : "Actor"}</th>
                      <th className="p-3 text-start w-36">{lang === "ar" ? "الإجراء" : "Action"}</th>
                      <th className="p-3 text-start">{lang === "ar" ? "التفاصيل" : "Details"}</th>
                      <th className="p-3 text-start w-20">{lang === "ar" ? "النتيجة" : "Outcome"}</th>
                      <th className="p-3 text-start w-40">{lang === "ar" ? "بصمة التشفير" : "Tamper Hash"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-border/60">
                    {(auditQuery.data?.events || []).map((ev: any) => (
                      <tr key={ev.id} className="hover:bg-slate-50/60 dark:hover:bg-muted/30 transition-colors">
                        <td className="p-3 font-mono text-slate-600 dark:text-muted-foreground">
                          {new Date(ev.timestamp).toISOString().replace("T", " ").slice(0, 19)}
                        </td>
                        <td className="p-3 font-semibold text-slate-900 dark:text-foreground truncate max-w-[120px]">{ev.actorName}</td>
                        <td className="p-3 font-medium text-primary">{ev.action}</td>
                        <td className="p-3 text-slate-600 dark:text-muted-foreground line-clamp-1">{ev.details}</td>
                        <td className="p-3">
                          <Badge className={cn("text-[0.65rem] font-semibold", ev.outcome === "success" ? "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/40" : "bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-500/20 dark:text-rose-400 dark:border-rose-500/40")}>
                            {ev.outcome}
                          </Badge>
                        </td>
                        <td className="p-3 font-mono text-[0.65rem] text-muted-foreground truncate max-w-[140px]">
                          {ev.tamperProofHash}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          {/* ══════════════════════════════════════════════════════════════
              SECTION 9: REPORTS & EXPORTS
             ══════════════════════════════════════════════════════════════ */}
          <TabsContent value="reports" className="space-y-4 focus-visible:outline-none">
            <div>
              <h3 className="text-sm font-bold">{lang === "ar" ? "التقارير الرقابية والتصدير المعتمد" : "Compliance Reports & Certified Exports"}</h3>
              <p className="text-xs text-muted-foreground">
                {lang === "ar" ? "إنشاء وتصدير التقارير الرسمية الموثقة لرفعها للجنة الإشرافية بعسير" : "Generate official reports compiled from persisted database records"}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { type: "framework_register", title: lang === "ar" ? "تقرير سجل الأطر التنظيمية" : "Framework Register Report", desc: "Official inventory of registered Saudi cyber and data frameworks." },
                { type: "compliance_assessment", title: lang === "ar" ? "تقرير تقييم الامتثال والفجوات" : "Compliance Assessment Report", desc: "Detailed control-by-control assessment results and gap findings." },
                { type: "control_status", title: lang === "ar" ? "تقرير حالة الضوابط الشامل" : "Control Status Report", desc: "Implementation status across all categories with risk ratings." },
                { type: "findings_remediation", title: lang === "ar" ? "تقرير الملاحظات وخطة المعالجة" : "Findings & Remediation Report", desc: "Corrective actions, assigned owners, and target resolution dates." },
                { type: "evidence_index", title: lang === "ar" ? "فهرس الأدلة والوثائق الثبوتية" : "Evidence Repository Index", desc: "Master evidence index with SHA-256 hashes and control links." },
                { type: "data_governance", title: lang === "ar" ? "تقرير حوكمة وسلالة البيانات" : "Data Governance Report", desc: "Official vs reference dataset provenance and access rules." },
                { type: "data_gap", title: lang === "ar" ? "سجل فجوات البيانات المكانية" : "Data-Gap Register Report", desc: "Missing coordinates, outdated overlays, and boundary disputes." },
                { type: "audit_trail", title: lang === "ar" ? "تقرير سجل التدقيق المشفر" : "Tamper-Evident Audit Report", desc: "Cryptographic ledger export for external supervisory audit." },
              ].map((rep) => (
                <Card key={rep.type} className="border border-slate-200/90 dark:border-border/80 bg-white dark:bg-card shadow-xs rounded-xl p-4 flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <FileText className="size-5 text-primary" />
                    <h4 className="font-bold text-sm text-slate-900 dark:text-foreground">{rep.title}</h4>
                    <p className="text-xs text-slate-600 dark:text-muted-foreground leading-relaxed">{rep.desc}</p>
                  </div>
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-border/50">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={async () => {
                        const res = await fetch(`/api/compliance/reports?type=${rep.type}&actor=${encodeURIComponent(user.name)}`);
                        const data = await res.json();
                        setShowReportViewModal(data);
                      }}
                      className="text-xs flex-1 h-8 border-slate-300 dark:border-border"
                    >
                      <Eye className="size-3 me-1" />
                      {lang === "ar" ? "معاينة" : "View"}
                    </Button>
                    <a
                      href={`/api/compliance/reports?type=${rep.type}&format=csv&actor=${encodeURIComponent(user.name)}`}
                      download
                      className="inline-flex items-center justify-center rounded-lg border border-slate-300 dark:border-border bg-white dark:bg-background px-2.5 py-1 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-muted h-8"
                    >
                      <Download className="size-3 me-1" />
                      CSV
                    </a>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* ══════════════════════════════════════════════════════════════
              SECTION 10: SETTINGS & OPERATIONAL READINESS
             ══════════════════════════════════════════════════════════════ */}
          <TabsContent value="settings" className="space-y-4 focus-visible:outline-none">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-foreground">{lang === "ar" ? "إعدادات الأمان والجاهزية التشغيلية" : "Security Configuration & Operational Readiness"}</h3>
              <p className="text-xs text-slate-600 dark:text-muted-foreground">
                {lang === "ar" ? "توثيق ضوابط الاستضافة السيادية، التشفير، النسخ الاحتياطي، وإجراءات الطوارئ" : "Technical attestation and configuration records for Aseer Sovereign Cloud infrastructure"}
              </p>
            </div>

            <Card className="border border-slate-200/90 dark:border-border/80 bg-white dark:bg-card shadow-xs rounded-xl p-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-3 rounded-xl border border-slate-200 dark:border-border/60 bg-slate-50/70 dark:bg-background/50 space-y-1">
                  <span className="text-slate-600 dark:text-muted-foreground font-medium">{lang === "ar" ? "مزود الاستضافة السحابية:" : "Cloud Provider & Tier:"}</span>
                  <div className="font-semibold text-slate-900 dark:text-foreground text-sm flex items-center gap-2">
                    <Server className="size-4 text-teal-700 dark:text-teal-400" />
                    {setQuery.data?.settings?.hostingProvider}
                  </div>
                  <span className="text-[0.7rem] text-slate-500 dark:text-muted-foreground">{setQuery.data?.settings?.hostingRegion}</span>
                </div>

                <div className="p-3 rounded-xl border border-slate-200 dark:border-border/60 bg-slate-50/70 dark:bg-background/50 space-y-1">
                  <span className="text-slate-600 dark:text-muted-foreground font-medium">{lang === "ar" ? "مقر استضافة البيانات السيادية:" : "Sovereign Storage Location:"}</span>
                  <div className="font-semibold text-slate-900 dark:text-foreground text-sm flex items-center gap-2">
                    <HardDrive className="size-4 text-emerald-700 dark:text-emerald-400" />
                    {setQuery.data?.settings?.dataStorageLocation}
                  </div>
                  <span className="text-[0.7rem] text-emerald-800 dark:text-emerald-400 font-semibold">{lang === "ar" ? "محلية ١٠٠٪ داخل المملكة" : "100% In-Kingdom Sovereign Residency"}</span>
                </div>

                <div className="p-3 rounded-xl border border-border/60 bg-background/50 space-y-1">
                  <span className="text-muted-foreground font-medium">{lang === "ar" ? "معايير التشفير:" : "Cryptographic Standards:"}</span>
                  <div className="font-semibold text-foreground">{setQuery.data?.settings?.encryptionAtRest}</div>
                  <span className="text-[0.7rem] text-muted-foreground">{setQuery.data?.settings?.encryptionInTransit}</span>
                </div>

                <div className="p-3 rounded-xl border border-border/60 bg-background/50 space-y-1">
                  <span className="text-muted-foreground font-medium">{lang === "ar" ? "النسخ الاحتياطي والتعافي:" : "Backup & DR Testing:"}</span>
                  <div className="font-semibold text-foreground">{setQuery.data?.settings?.lastSuccessfulBackup}</div>
                  <span className="text-[0.7rem] text-teal-400 font-mono">{setQuery.data?.settings?.lastRecoveryTest}</span>
                </div>

                <div className="p-3 rounded-xl border border-border/60 bg-background/50 space-y-1 md:col-span-2">
                  <span className="text-muted-foreground font-medium">{lang === "ar" ? "فريق الاستجابة للحوادث (CERT):" : "Incident Response & CERT Contact:"}</span>
                  <div className="font-semibold text-foreground">{setQuery.data?.settings?.incidentResponseContact}</div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-teal-500/30 bg-teal-500/10 text-xs flex items-center justify-between">
                <div>
                  <div className="font-bold text-teal-300">{lang === "ar" ? "سياسة الفصل بين التقييم والاعتماد" : "Independent Approval Policy"}</div>
                  <p className="text-muted-foreground">{lang === "ar" ? "إلزامية اعتماد شخص مستقل عن المقيّم لأي تقرير امتثال" : "Enforces that the assessor cannot approve their own assessment"}</p>
                </div>
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/40">
                  {setQuery.data?.settings?.independentApprovalRequired ? (lang === "ar" ? "مفعل إجبارياً" : "Enforced") : "Disabled"}
                </Badge>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </ModuleBody>

      {/* ══════════════════════════════════════════════════════════════
          MODALS & DIALOGS
         ══════════════════════════════════════════════════════════════ */}

      {/* Framework Details Dialog */}
      <Dialog open={!!selectedFramework} onOpenChange={() => setSelectedFramework(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Scale className="size-4 text-primary" />
              {selectedFramework?.name}
            </DialogTitle>
            <DialogDescription>{selectedFramework?.fullName}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-xs py-2">
            <div>
              <span className="font-semibold">{lang === "ar" ? "الوصف: " : "Description: "}</span>
              <p className="text-muted-foreground mt-0.5">{selectedFramework?.description}</p>
            </div>
            <div className="p-2.5 rounded-lg bg-muted/40 border border-border space-y-1">
              <span className="font-semibold">{lang === "ar" ? "مسوغ التطبيق والأثر: " : "Applicability Rationale: "}</span>
              <p className="text-muted-foreground">{selectedFramework?.applicabilityRationale}</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="font-semibold">{lang === "ar" ? "المسؤول: " : "Owner: "}</span>
                <span className="text-muted-foreground block">{selectedFramework?.responsibleOwner}</span>
              </div>
              <div>
                <span className="font-semibold">{lang === "ar" ? "المراجع الداخلي: " : "Internal Reviewer: "}</span>
                <span className="text-muted-foreground block">{selectedFramework?.internalReviewer}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button size="sm" variant="outline" onClick={() => setSelectedFramework(null)}>
              {lang === "ar" ? "إغلاق" : "Close"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Control Details Dialog */}
      <Dialog open={!!selectedControl} onOpenChange={() => setSelectedControl(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckSquare className="size-4 text-primary" />
              {selectedControl?.id} — {selectedControl?.title}
            </DialogTitle>
            <DialogDescription>{selectedControl?.category}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-xs py-2">
            <div>
              <span className="font-semibold">{lang === "ar" ? "نص المتطلب الرقابي: " : "Regulatory Requirement Text: "}</span>
              <p className="text-muted-foreground mt-1 p-2 rounded bg-muted/40 border border-border leading-relaxed">
                {selectedControl?.requirementText}
              </p>
            </div>
            <div>
              <span className="font-semibold">{lang === "ar" ? "المرجع النظامي: " : "Source Reference: "}</span>
              <span className="text-muted-foreground block mt-0.5 font-mono">{selectedControl?.sourceReference}</span>
            </div>
            {selectedControl?.remediationNotes && (
              <div>
                <span className="font-semibold">{lang === "ar" ? "ملاحظات المعالجة: " : "Remediation Notes: "}</span>
                <p className="text-muted-foreground mt-0.5">{selectedControl?.remediationNotes}</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button size="sm" variant="outline" onClick={() => setSelectedControl(null)}>
              {lang === "ar" ? "إغلاق" : "Close"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Accept Risk Dialog */}
      <Dialog open={!!showAcceptRiskModal} onOpenChange={() => setShowAcceptRiskModal(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-amber-400 flex items-center gap-2">
              <AlertTriangle className="size-4" />
              {lang === "ar" ? "توثيق قبول المخاطرة الرقابية" : "Document Risk Acceptance"}
            </DialogTitle>
            <DialogDescription>
              {lang === "ar"
                ? "يتطلب نظام الحوكمة توثيق مبرر صريح، واسم المفوض المعتمد، وتاريخ انتهاء محدد."
                : "Committee policy mandates a formal justification, authorized approver name, and expiry date."}
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              const justification = fd.get("justification") as string;
              const approver = fd.get("approver") as string;
              const expiry = fd.get("expiry") as string;

              if (!justification || !approver || !expiry) {
                toast.error("Please fill all required fields");
                return;
              }

              await fetch("/api/compliance/findings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  action: "accept_risk",
                  id: showAcceptRiskModal.id,
                  riskAcceptanceJustification: justification,
                  riskAcceptedBy: approver,
                  riskExpiryDate: expiry,
                  actor: user.name,
                }),
              });

              setShowAcceptRiskModal(null);
              queryClient.invalidateQueries({ queryKey: ["comp-findings"] });
              toast.success("Risk formally accepted and recorded in audit ledger.");
            }}
            className="space-y-3 text-xs"
          >
            <div>
              <Label>{lang === "ar" ? "مبرر القبول الفني / التشغيلي" : "Documented Justification"}</Label>
              <Textarea name="justification" required className="mt-1 text-xs" placeholder="Detail operational necessity and mitigating safeguards..." />
            </div>
            <div>
              <Label>{lang === "ar" ? "اسم المفوض المعتمد باللجنة (SVC)" : "Authorized Approver Name"}</Label>
              <Input name="approver" defaultValue="Dr. Tariq Al-Amri (SVC Committee Delegate)" required className="mt-1 text-xs" />
            </div>
            <div>
              <Label>{lang === "ar" ? "تاريخ انتهاء قبول المخاطرة" : "Risk Expiry Date"}</Label>
              <Input type="date" name="expiry" defaultValue="2026-12-31" required className="mt-1 text-xs" />
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" size="sm" variant="outline" onClick={() => setShowAcceptRiskModal(null)}>
                {lang === "ar" ? "إلغاء" : "Cancel"}
              </Button>
              <Button type="submit" size="sm" className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold">
                {lang === "ar" ? "تأكيد وقيد بالسجل" : "Confirm Acceptance"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Upload Evidence Dialog */}
      <Dialog open={showUploadEvidenceModal} onOpenChange={setShowUploadEvidenceModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="size-4 text-primary" />
              {lang === "ar" ? "رفع دليل إثبات جديد" : "Upload Supporting Evidence"}
            </DialogTitle>
            <DialogDescription>
              {lang === "ar" ? "الصيغ المدعومة: PDF, DOCX, XLSX, CSV, PNG, JPG (البرامج والملفات التنفيذية محظورة)" : "Permitted formats: PDF, DOCX, XLSX, CSV, PNG, JPG. Executables strictly prohibited."}
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              const filename = fd.get("filename") as string;
              const controlId = fd.get("controlId") as string;
              const mimeType = fd.get("mimeType") as string;

              await fetch("/api/compliance/evidence", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  action: "upload",
                  filename,
                  controlId,
                  mimeType,
                  fileSize: 1542000,
                  actor: user.name,
                }),
              });

              setShowUploadEvidenceModal(false);
              queryClient.invalidateQueries({ queryKey: ["comp-evidence"] });
              toast.success("Evidence registered with SHA-256 integrity hash.");
            }}
            className="space-y-3 text-xs"
          >
            <div>
              <Label>{lang === "ar" ? "اسم الملف الأصلي" : "File Name"}</Label>
              <Input name="filename" required placeholder="e.g. Asir-Cadastral-Boundary-Survey-Signed.pdf" className="mt-1 text-xs" />
            </div>
            <div>
              <Label>{lang === "ar" ? "نوع الملف (MIME Type)" : "File Type"}</Label>
              <Select name="mimeType" defaultValue="application/pdf">
                <SelectTrigger className="mt-1 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="application/pdf">PDF Document (.pdf)</SelectItem>
                  <SelectItem value="application/vnd.openxmlformats-officedocument.wordprocessingml.document">Word Document (.docx)</SelectItem>
                  <SelectItem value="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet">Excel Spreadsheet (.xlsx)</SelectItem>
                  <SelectItem value="text/csv">CSV Table (.csv)</SelectItem>
                  <SelectItem value="image/png">PNG Image (.png)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{lang === "ar" ? "الضابط المرتبط" : "Linked Control"}</Label>
              <Select name="controlId" defaultValue="ECC-1-2-3">
                <SelectTrigger className="mt-1 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ECC-1-1-1">ECC-1-1-1 (Cyber Strategy)</SelectItem>
                  <SelectItem value="ECC-1-2-3">ECC-1-2-3 (MFA Enforcement)</SelectItem>
                  <SelectItem value="ECC-2-1-4">ECC-2-1-4 (Cryptographic Protection)</SelectItem>
                  <SelectItem value="CCC-1-3-2">CCC-1-3-2 (Sovereign Hosting)</SelectItem>
                  <SelectItem value="PDPL-07-02">PDPL-07-02 (DPIA Aerial Surveys)</SelectItem>
                  <SelectItem value="NDMO-DG-01">NDMO-DG-01 (Spatial Classification)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" size="sm" variant="outline" onClick={() => setShowUploadEvidenceModal(false)}>
                {lang === "ar" ? "إلغاء" : "Cancel"}
              </Button>
              <Button type="submit" size="sm">
                {lang === "ar" ? "رفع وحفظ" : "Upload & Hash"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* New Finding Dialog */}
      <Dialog open={showNewFindingModal} onOpenChange={setShowNewFindingModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="size-4 text-amber-400" />
              {lang === "ar" ? "تسجيل ملاحظة رقابية جديدة" : "Log Compliance Finding"}
            </DialogTitle>
            <DialogDescription>
              {lang === "ar" ? "ربط الملاحظة بالضابط المسؤول وتحديد الموعد المستهدف للمعالجة" : "Record control gap or deficiency with assigned owner and due date"}
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              const title = fd.get("title") as string;
              const controlId = fd.get("controlId") as string;
              const severity = fd.get("severity") as string;
              const description = fd.get("description") as string;
              const recommendedAction = fd.get("recommendedAction") as string;
              const assignedOwner = fd.get("assignedOwner") as string;

              await fetch("/api/compliance/findings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  action: "create",
                  title,
                  controlId,
                  severity,
                  description,
                  recommendedAction,
                  assignedOwner,
                  actor: user.name,
                }),
              });

              setShowNewFindingModal(false);
              queryClient.invalidateQueries({ queryKey: ["comp-findings"] });
              toast.success("Finding recorded successfully.");
            }}
            className="space-y-3 text-xs"
          >
            <div>
              <Label>{lang === "ar" ? "عنوان الملاحظة" : "Title"}</Label>
              <Input name="title" required placeholder="e.g. Unverified Parcel Boundary Discrepancy" className="mt-1 text-xs" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>{lang === "ar" ? "الضابط المعني" : "Control"}</Label>
                <Select name="controlId" defaultValue="ECC-2-7-2">
                  <SelectTrigger className="mt-1 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ECC-2-7-2">ECC-2-7-2 (Vulnerability)</SelectItem>
                    <SelectItem value="PDPL-07-02">PDPL-07-02 (DPIA)</SelectItem>
                    <SelectItem value="PDPL-03-01">PDPL-03-01 (Consent)</SelectItem>
                    <SelectItem value="NDMO-DG-04">NDMO-DG-04 (Lineage)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{lang === "ar" ? "درجة الخطورة" : "Severity"}</Label>
                <Select name="severity" defaultValue="Medium">
                  <SelectTrigger className="mt-1 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Critical">Critical</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>{lang === "ar" ? "التفاصيل والأثر" : "Description & Impact"}</Label>
              <Textarea name="description" required className="mt-1 text-xs" placeholder="Describe the deficiency..." />
            </div>
            <div>
              <Label>{lang === "ar" ? "الإجراء التصحيحي الموصى به" : "Recommended Corrective Action"}</Label>
              <Input name="recommendedAction" required placeholder="Corrective remediation plan..." className="mt-1 text-xs" />
            </div>
            <div>
              <Label>{lang === "ar" ? "المسؤول عن المعالجة" : "Assigned Owner"}</Label>
              <Input name="assignedOwner" defaultValue="Saad Al-Qarni (DevOps Lead)" required className="mt-1 text-xs" />
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" size="sm" variant="outline" onClick={() => setShowNewFindingModal(false)}>
                {lang === "ar" ? "إلغاء" : "Cancel"}
              </Button>
              <Button type="submit" size="sm">
                {lang === "ar" ? "حفظ الملاحظة" : "Save Finding"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Log Data Gap Dialog */}
      <Dialog open={showNewDataGapModal} onOpenChange={setShowNewDataGapModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Layers className="size-4 text-teal-400" />
              {lang === "ar" ? "تسجيل فجوة بيانات مكانية" : "Log Spatial Data Gap"}
            </DialogTitle>
            <DialogDescription>
              {lang === "ar" ? "توثيق غياب إحداثيات أو تعارض حدود مقاول أو عدم تحديث طبقة" : "Record missing geometries, stale survey layers, or boundary conflicts"}
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              const affectedRequest = fd.get("affectedRequest") as string;
              const gapType = fd.get("gapType") as string;
              const severity = fd.get("severity") as string;
              const description = fd.get("description") as string;
              const owner = fd.get("owner") as string;

              await fetch("/api/compliance/data-governance", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  action: "create_gap",
                  affectedRequest,
                  gapType,
                  severity,
                  gapDescription: description,
                  owner,
                  actor: user.name,
                }),
              });

              setShowNewDataGapModal(false);
              queryClient.invalidateQueries({ queryKey: ["comp-datagov"] });
              toast.success("Spatial data gap recorded.");
            }}
            className="space-y-3 text-xs"
          >
            <div>
              <Label>{lang === "ar" ? "الطلب أو المنطقة المتأثرة" : "Affected Request / Sector"}</Label>
              <Input name="affectedRequest" required placeholder="e.g. REQ-FTO-ABHA-2026-112" className="mt-1 text-xs" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>{lang === "ar" ? "نوع الفجوة" : "Gap Type"}</Label>
                <Select name="gapType" defaultValue="Missing Data">
                  <SelectTrigger className="mt-1 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Missing Data">Missing Boundary</SelectItem>
                    <SelectItem value="Outdated Layer">Outdated Layer</SelectItem>
                    <SelectItem value="Conflicting Boundary">Conflicting Boundary</SelectItem>
                    <SelectItem value="Unverified Reference">Unverified Reference</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{lang === "ar" ? "درجة الخطورة" : "Severity"}</Label>
                <Select name="severity" defaultValue="High">
                  <SelectTrigger className="mt-1 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Critical">Critical</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>{lang === "ar" ? "وصف الفجوة والتناقض" : "Description of Discrepancy"}</Label>
              <Textarea name="description" required placeholder="Detail coordinate conflict or missing cadastral polygon..." className="mt-1 text-xs" />
            </div>
            <div>
              <Label>{lang === "ar" ? "المسؤول عن المتابعة" : "Owner"}</Label>
              <Input name="owner" defaultValue="Turki Al-Zahrani (Data Governance)" required className="mt-1 text-xs" />
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" size="sm" variant="outline" onClick={() => setShowNewDataGapModal(false)}>
                {lang === "ar" ? "إلغاء" : "Cancel"}
              </Button>
              <Button type="submit" size="sm">
                {lang === "ar" ? "حفظ الفجوة" : "Save Gap"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Report View Modal */}
      <Dialog open={!!showReportViewModal} onOpenChange={() => setShowReportViewModal(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="size-4 text-primary" />
              {showReportViewModal?.title}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {lang === "ar" ? "تاريخ الإصدار: " : "Generated at: "} {showReportViewModal?.generatedAt} | {showReportViewModal?.generatedBy}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto space-y-3 text-xs p-1">
            <div className="p-2.5 rounded-lg bg-teal-500/10 border border-teal-500/30 text-teal-300 text-[0.7rem] leading-relaxed">
              {showReportViewModal?.legalDisclaimer}
            </div>
            <div className="p-3 rounded-lg border border-border bg-muted/30 font-mono text-[0.7rem] overflow-x-auto">
              <pre>{JSON.stringify(showReportViewModal?.data, null, 2)}</pre>
            </div>
          </div>
          <DialogFooter className="pt-2">
            <Button size="sm" variant="outline" onClick={() => setShowReportViewModal(null)}>
              {lang === "ar" ? "إغلاق" : "Close"}
            </Button>
            <Button
              size="sm"
              onClick={() => {
                window.print();
              }}
              className="gap-1.5"
            >
              <Download className="size-3.5" />
              {lang === "ar" ? "طباعة / تصدير PDF" : "Print / Export PDF"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
