"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  FileText,
  Compass,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  HelpCircle,
  MapPin,
  Building,
  Ruler,
  Layers,
  ArrowRight,
  Printer,
  Download,
  Share2,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Info,
  Calendar,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useGeoWiseStore } from "@/stores/app-store";
import { toast } from "sonner";
import { jsPDF } from "jspdf";

interface Criterion {
  id: string;
  criterionKey: string;
  title: string;
  titleAr: string;
  existingCondition: string;
  proposedCondition: string | null;
  measuredFinding: string;
  status: string;
  evidenceSource: string;
  sourceVersionDate: string;
  analysisMethod: string;
  limitations: string | null;
  followUpRequired: string | null;
}

interface Measurement {
  id: string;
  metricName: string;
  metricValue: number;
  unit: string;
  category: string;
  context: string;
}

interface DataGap {
  id: string;
  datasetName: string;
  gapType: string;
  description: string;
  severity: string;
  impact: string;
}

interface FollowUp {
  id: string;
  investigationType: string;
  recommendation: string;
  priority: string;
}

interface AssessmentDetail {
  id: string;
  siteName: string;
  siteNameAr?: string;
  applicantName: string;
  authority: string;
  assessmentType: string;
  status: string;
  overallSpatialVerdict: string;
  executiveSummary: string;
  executiveSummaryAr: string;
  address: string;
  city: string;
  district: string;
  latitude: number;
  longitude: number;
  areaM2: number;
  perimeterM: number;
  administrativeArea: string;
  crossesAdminBoundary: boolean;
  proposedDetails: string;
  boundaryGeoJson: string;
  analysisMethodVersion: string;
  dataFreshnessSummary: string;
  createdAt: string;
  criteria: Criterion[];
  measurements: Measurement[];
  dataGaps: DataGap[];
  followUps: FollowUp[];
}

export function AssessmentDetailModule({ initialId }: { initialId?: string }) {
  const searchParams = useSearchParams();
  const assessmentIdFromQuery = searchParams.get("id");
  const assessmentId = initialId || assessmentIdFromQuery || "ASM-2026-001";

  const lang = useGeoWiseStore((s) => s.lang);
  const isAr = lang === "ar";

  const [assessment, setAssessment] = React.useState<AssessmentDetail | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [criteriaFilter, setCriteriaFilter] = React.useState<string>("all");
  const [selectedCriterionKey, setSelectedCriterionKey] = React.useState<string | null>(null);

  const fetchAssessment = React.useCallback(async (id: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/assessments/${id}`);
      const data = await res.json();
      if (data.success && data.assessment) {
        setAssessment(data.assessment);
      } else {
        // Fallback to first available
        const listRes = await fetch("/api/assessments");
        const listData = await listRes.json();
        if (listData.success && listData.assessments?.length > 0) {
          setAssessment(listData.assessments[0]);
        }
      }
    } catch (err) {
      console.error("Error loading assessment:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchAssessment(assessmentId);
  }, [assessmentId, fetchAssessment]);

  const getVerdictBadge = (verdict: string) => {
    switch (verdict) {
      case "Supportive":
        return (
          <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 gap-1.5 text-xs py-1 px-2.5">
            <CheckCircle2 className="size-3.5" />
            {isAr ? "مدعوم مكانياً" : "Supportive"}
          </Badge>
        );
      case "Supportive with Conditions":
        return (
          <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 gap-1.5 text-xs py-1 px-2.5">
            <AlertCircle className="size-3.5" />
            {isAr ? "مدعوم باشتراطات" : "Supportive with Conditions"}
          </Badge>
        );
      case "Constrained":
        return (
          <Badge className="bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30 gap-1.5 text-xs py-1 px-2.5">
            <AlertTriangle className="size-3.5" />
            {isAr ? "مقيّد مكانياً" : "Constrained"}
          </Badge>
        );
      case "Requires Further Study":
        return (
          <Badge className="bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30 gap-1.5 text-xs py-1 px-2.5">
            <HelpCircle className="size-3.5" />
            {isAr ? "يتطلب دراسة تفصيلية" : "Requires Further Study"}
          </Badge>
        );
      case "Data Gap":
        return (
          <Badge className="bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30 gap-1.5 text-xs py-1 px-2.5">
            <AlertCircle className="size-3.5" />
            {isAr ? "فجوة بيانات" : "Data Gap"}
          </Badge>
        );
      default:
        return <Badge variant="outline">{verdict}</Badge>;
    }
  };

  const generatePdfReport = () => {
    if (!assessment) return;

    try {
      const doc = new jsPDF();
      let y = 20;

      // Header Banner
      doc.setFillColor(30, 41, 59);
      doc.rect(0, 0, 210, 28, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(15);
      doc.text("GEOWISE - SPATIAL DEVELOPMENT ASSESSMENT REPORT", 14, 13);
      doc.setFontSize(9);
      doc.text(`Official Advisory Assessment ID: ${assessment.id} | Date: ${new Date().toISOString().split("T")[0]}`, 14, 22);

      // Advisory Disclaimer
      y = 36;
      doc.setFillColor(254, 243, 199);
      doc.rect(14, y, 182, 12, "F");
      doc.setTextColor(146, 64, 14);
      doc.setFontSize(8);
      doc.text(
        "MANDATORY NOTICE: GeoWise provides spatial evidence and indicators. It does NOT approve or reject proposals.",
        18,
        y + 7
      );

      // Site Information
      y = 56;
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(12);
      doc.text(`1. Site: ${assessment.siteName}`, 14, y);
      doc.setFontSize(9);
      y += 6;
      doc.text(`Applicant: ${assessment.applicantName} | Authority: ${assessment.authority}`, 14, y);
      y += 5;
      doc.text(`Location: ${assessment.district}, ${assessment.city} | Area: ${assessment.areaM2?.toLocaleString()} m2 (${(assessment.areaM2 / 10000).toFixed(2)} ha)`, 14, y);
      y += 5;
      doc.text(`Spatial Verdict: ${assessment.overallSpatialVerdict} | Category: ${assessment.assessmentType}`, 14, y);

      // Executive Summary
      y += 10;
      doc.setFontSize(11);
      doc.text("2. Executive Spatial Summary", 14, y);
      doc.setFontSize(8);
      y += 6;
      const splitSummary = doc.splitTextToSize(assessment.executiveSummary, 180);
      doc.text(splitSummary, 14, y);
      y += splitSummary.length * 4 + 6;

      // Key Criteria Table
      doc.setFontSize(11);
      doc.text("3. Core Geospatial Assessment Criteria", 14, y);
      y += 6;

      assessment.criteria?.slice(0, 7).forEach((c, idx) => {
        doc.setFontSize(8.5);
        doc.setTextColor(30, 41, 59);
        doc.text(`[${c.status}] ${c.title}`, 14, y);
        doc.setFontSize(7.5);
        doc.setTextColor(100, 116, 139);
        y += 4;
        const finding = doc.splitTextToSize(`Finding: ${c.measuredFinding} (Source: ${c.evidenceSource})`, 180);
        doc.text(finding, 14, y);
        y += finding.length * 3.5 + 3;
      });

      // Data gaps & follow-ups
      if (y < 250) {
        y += 4;
        doc.setFontSize(10);
        doc.setTextColor(15, 23, 42);
        doc.text("4. Identified Data Gaps & Recommended Investigations", 14, y);
        y += 5;
        assessment.dataGaps?.forEach((g) => {
          doc.setFontSize(7.5);
          doc.setTextColor(185, 28, 28);
          doc.text(`- [${g.severity}] ${g.datasetName}: ${g.description}`, 14, y);
          y += 4;
        });
      }

      // Save PDF
      doc.save(`GeoWise_Assessment_${assessment.id}.pdf`);
      toast.success(isAr ? "تم تصدير تقرير التقييم بصيغة PDF بنجاح" : "PDF Spatial Report downloaded successfully");
    } catch (err: any) {
      toast.error(`PDF generation failed: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse p-4">
        <div className="h-8 bg-muted rounded w-1/3" />
        <div className="h-24 bg-muted rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-64 bg-muted rounded" />
          <div className="h-64 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (!assessment) {
    return (
      <Card className="text-center py-12">
        <CardContent className="space-y-3">
          <AlertTriangle className="size-10 text-amber-500 mx-auto" />
          <h2 className="text-lg font-bold">{isAr ? "لم يتم العثور على التقييم" : "Assessment Not Found"}</h2>
          <Button asChild size="sm">
            <Link href="/assessments">{isAr ? "العودة لقائمة التقييمات" : "Back to Assessments"}</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const filteredCriteria = assessment.criteria?.filter((c) => {
    if (criteriaFilter === "all") return true;
    return c.status === criteriaFilter;
  });

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-border/50">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20">
              {assessment.id}
            </span>
            {getVerdictBadge(assessment.overallSpatialVerdict)}
            <Badge variant="outline" className="text-xs font-medium">
              {assessment.assessmentType}
            </Badge>
          </div>

          <h1 className="text-2xl font-bold tracking-tight">
            {isAr ? assessment.siteNameAr || assessment.siteName : assessment.siteName}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mt-1">
            <span className="flex items-center gap-1">
              <MapPin className="size-3.5 text-primary" />
              {assessment.district}, {assessment.city}
            </span>
            <span className="flex items-center gap-1 font-mono">
              <Ruler className="size-3.5" />
              {assessment.areaM2 ? `${assessment.areaM2.toLocaleString()} m² (${(assessment.areaM2 / 10000).toFixed(2)} ha)` : "—"}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="size-3.5" />
              {new Date(assessment.createdAt).toLocaleDateString(isAr ? "ar-SA" : "en-US")}
            </span>
            <span>{assessment.applicantName}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={generatePdfReport}
            className="gap-1.5 text-xs"
          >
            <Download className="size-3.5 text-primary" />
            {isAr ? "تحميل تقرير PDF" : "Download PDF Report"}
          </Button>

          <Button
            variant="outline"
            size="sm"
            asChild
            className="gap-1.5 text-xs"
          >
            <Link href={`/map?siteId=${assessment.id}`}>
              <Compass className="size-3.5" />
              {isAr ? "عرض على الخريطة" : "Explore on Map"}
            </Link>
          </Button>

          <Button
            asChild
            size="sm"
            className="bg-primary text-primary-foreground gap-1.5 text-xs shadow-sm"
          >
            <Link href={`/reports?id=${assessment.id}`}>
              <FileText className="size-3.5" />
              {isAr ? "عرض التقرير الكامل" : "Official Report"}
            </Link>
          </Button>
        </div>
      </div>

      {/* Mandatory Advisory-Only Principle Banner */}
      <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 flex items-start gap-3 text-xs leading-relaxed">
        <AlertTriangle className="size-5 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
        <div>
          <span className="font-bold uppercase tracking-wider text-[0.72rem]">
            {isAr ? "المبدأ الاسترشادي الملزم للمنصة:" : "MANDATORY ADVISORY PRINCIPLE:"}
          </span>
          <p className="mt-0.5">
            {isAr
              ? "يقدم نظام جيو وايز قرائن وتحليلات مكانية لدعم اللجان وأصحاب القرار، ولا يقوم إطلاقاً بإصدار قرارات مستقلة بالقبول أو الرفض للطلبات التخطيطية."
              : "GeoWise provides geographical evidence, measurements, and identified constraints. It must NEVER independently approve or reject a development request."}
          </p>
        </div>
      </div>

      {/* Executive Spatial Summary Card */}
      <Card className="bg-card/70 border-border/60 shadow-sm">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Info className="size-4 text-primary" />
            {isAr ? "الملخص المكاني التنفيذي للطلب" : "Executive Spatial Summary"}
          </CardTitle>
          <CardDescription className="text-xs">
            {isAr ? "شرح مبسط للأدلة الداعمة والمحددات وما يتطلب مزيداً من الدراسة" : "Synthesis of spatial findings, identified constraints, and unverified data"}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-1 text-xs leading-relaxed text-foreground/90">
          <p className="bg-muted/40 p-3.5 rounded-lg border border-border/40">
            {isAr ? assessment.executiveSummaryAr : assessment.executiveSummary}
          </p>
        </CardContent>
      </Card>

      {/* 2-Column Main Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): 11 Assessment Criteria */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h2 className="text-base font-bold flex items-center gap-2">
              <Layers className="size-4 text-primary" />
              <span>{isAr ? "معايير التقييم المكاني (11 معياراً)" : "11 Geospatial Assessment Criteria"}</span>
            </h2>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-1">
              {[
                { id: "all", label: isAr ? "الكل" : "All" },
                { id: "Constrained", label: isAr ? "مقيّد" : "Constrained" },
                { id: "Supportive with Conditions", label: isAr ? "باشتراطات" : "With Conditions" },
                { id: "Supportive", label: isAr ? "مدعوم" : "Supportive" },
                { id: "Data Gap", label: isAr ? "فجوة" : "Data Gap" },
              ].map((pill) => (
                <button
                  key={pill.id}
                  type="button"
                  onClick={() => setCriteriaFilter(pill.id)}
                  className={`text-[0.68rem] px-2 py-0.5 rounded-full border transition-all ${
                    criteriaFilter === pill.id
                      ? "bg-primary text-primary-foreground border-primary font-semibold"
                      : "bg-muted/40 text-muted-foreground border-border/40 hover:text-foreground"
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {filteredCriteria?.map((criterion) => {
              const isSelected = selectedCriterionKey === criterion.criterionKey;
              return (
                <Card
                  key={criterion.id}
                  className={`transition-all border ${
                    isSelected
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "border-border/60 hover:border-primary/40 bg-card/70"
                  }`}
                >
                  <CardContent className="p-4 space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-sm">
                          {isAr ? criterion.titleAr : criterion.title}
                        </h3>
                        <div className="text-[0.7rem] text-muted-foreground mt-0.5">
                          {isAr ? criterion.title : criterion.titleAr}
                        </div>
                      </div>
                      {getVerdictBadge(criterion.status)}
                    </div>

                    <div className="text-xs p-2.5 rounded bg-muted/40 border border-border/40 text-foreground/90 leading-relaxed font-medium">
                      {criterion.measuredFinding}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[0.72rem] text-muted-foreground pt-1 border-t border-border/40">
                      <div>
                        <span className="font-semibold text-foreground/80">{isAr ? "الوضع القائم: " : "Existing: "}</span>
                        {criterion.existingCondition}
                      </div>
                      {criterion.proposedCondition && (
                        <div>
                          <span className="font-semibold text-foreground/80">{isAr ? "المقترح: " : "Proposed: "}</span>
                          {criterion.proposedCondition}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center justify-between text-[0.68rem] text-muted-foreground pt-1">
                      <span className="flex items-center gap-1 font-mono">
                        <ShieldCheck className="size-3 text-emerald-500" />
                        {criterion.evidenceSource} ({criterion.sourceVersionDate})
                      </span>

                      {criterion.followUpRequired && (
                        <span className="text-amber-600 dark:text-amber-400 font-medium">
                          {isAr ? "إجراء مطلوب: " : "Action: "}
                          {criterion.followUpRequired}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Right Column: Measurements, Data Gaps & Follow-ups */}
        <div className="space-y-5">
          {/* Relevant Measurements */}
          <Card className="bg-card/70 border-border/60 shadow-sm">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Ruler className="size-4 text-primary" />
                {isAr ? "القياسات المكانية المعتمدة" : "Relevant Measurements"}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-1 space-y-2">
              <div className="divide-y divide-border/40 text-xs">
                {assessment.measurements?.map((m) => (
                  <div key={m.id} className="py-2 flex items-center justify-between gap-2">
                    <div>
                      <div className="font-medium text-foreground">{m.metricName}</div>
                      <div className="text-[0.68rem] text-muted-foreground">{m.context}</div>
                    </div>
                    <div className="text-end font-mono font-bold text-primary shrink-0">
                      {m.metricValue.toLocaleString()} {m.unit}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Explicit Data Gaps */}
          <Card className="bg-card/70 border-border/60 shadow-sm">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-purple-600 dark:text-purple-400">
                <AlertCircle className="size-4" />
                {isAr ? "فجوات ومحدودية البيانات الجغرافية" : "Identified Spatial Data Gaps"}
              </CardTitle>
              <CardDescription className="text-xs">
                {isAr ? "بيانات غير متوفرة أو تتطلب مسحاً ميدانياً تخصصياً" : "Information not verified from available layers"}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-1 space-y-2.5">
              {assessment.dataGaps?.map((gap) => (
                <div key={gap.id} className="p-2.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-xs space-y-1">
                  <div className="flex items-center justify-between font-semibold">
                    <span className="text-purple-700 dark:text-purple-300">{gap.datasetName}</span>
                    <Badge variant="outline" className="text-[0.65rem] border-purple-500/40 text-purple-600 dark:text-purple-400">
                      {gap.severity}
                    </Badge>
                  </div>
                  <p className="text-[0.72rem] text-muted-foreground">{gap.description}</p>
                  <p className="text-[0.7rem] font-medium text-foreground/80">{gap.impact}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recommended Follow-up Investigations */}
          <Card className="bg-card/70 border-border/60 shadow-sm">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-amber-600 dark:text-amber-400">
                <Compass className="size-4" />
                {isAr ? "الدراسات التخصصية الموصى بها" : "Recommended Follow-up Studies"}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-1 space-y-2 text-xs">
              {assessment.followUps?.map((f) => (
                <div key={f.id} className="p-2.5 rounded-lg bg-muted/40 border border-border/40 space-y-1">
                  <div className="flex items-center justify-between font-semibold">
                    <span>{f.investigationType}</span>
                    <Badge variant="outline" className="text-[0.65rem]">
                      {f.priority} Priority
                    </Badge>
                  </div>
                  <p className="text-[0.72rem] text-muted-foreground">{f.recommendation}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
