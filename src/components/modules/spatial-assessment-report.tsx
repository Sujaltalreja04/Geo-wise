"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  FileText,
  Printer,
  Download,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  MapPin,
  Building,
  Ruler,
  Calendar,
  Layers,
  Compass,
  ArrowLeft,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useGeoWiseStore } from "@/stores/app-store";
import { toast } from "sonner";
import { jsPDF } from "jspdf";

export function SpatialAssessmentReportViewer() {
  const searchParams = useSearchParams();
  const requestedId = searchParams.get("id");
  const lang = useGeoWiseStore((s) => s.lang);
  const isAr = lang === "ar";

  const [assessments, setAssessments] = React.useState<any[]>([]);
  const [selectedId, setSelectedId] = React.useState<string>(requestedId || "ASM-2026-001");
  const [currentAssessment, setCurrentAssessment] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  // Fetch all assessments for dropdown
  React.useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await fetch("/api/assessments");
        const data = await res.json();
        if (data.success && data.assessments?.length > 0) {
          setAssessments(data.assessments);
          const match = data.assessments.find((a: any) => a.id === selectedId) || data.assessments[0];
          setSelectedId(match.id);
          setCurrentAssessment(match);
        }
      } catch (err) {
        console.error("Failed to load assessments:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [selectedId]);

  const handleSelectChange = (id: string) => {
    setSelectedId(id);
    const match = assessments.find((a) => a.id === id);
    if (match) setCurrentAssessment(match);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    if (!currentAssessment) return;
    try {
      const doc = new jsPDF();
      let y = 18;

      doc.setFillColor(30, 41, 59);
      doc.rect(0, 0, 210, 26, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.text("GEOWISE - STANDARDIZED SPATIAL ASSESSMENT REPORT", 14, 12);
      doc.setFontSize(8.5);
      doc.text(`ID: ${currentAssessment.id} | Method: v2.4-SpatialEngine | Generated: ${new Date().toISOString().split("T")[0]}`, 14, 20);

      y = 34;
      doc.setFillColor(254, 243, 199);
      doc.rect(14, y, 182, 10, "F");
      doc.setTextColor(146, 64, 14);
      doc.setFontSize(8);
      doc.text("MANDATORY NOTICE: GeoWise provides spatial evidence only. It does NOT approve or reject development requests.", 16, y + 6);

      y = 50;
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(10);
      doc.text(`1. SITE & PROPOSAL: ${currentAssessment.siteName}`, 14, y);
      doc.setFontSize(8);
      y += 5;
      doc.text(`Applicant: ${currentAssessment.applicantName} | Jurisdiction: ${currentAssessment.authority}`, 14, y);
      y += 4;
      doc.text(`District: ${currentAssessment.district} | Area: ${currentAssessment.areaM2?.toLocaleString()} m2 (${(currentAssessment.areaM2 / 10000).toFixed(2)} ha)`, 14, y);
      y += 4;
      doc.text(`Overall Spatial Verdict: ${currentAssessment.overallSpatialVerdict}`, 14, y);

      y += 8;
      doc.setFontSize(10);
      doc.text("2. EXECUTIVE SPATIAL SUMMARY", 14, y);
      doc.setFontSize(7.5);
      y += 5;
      const splitText = doc.splitTextToSize(currentAssessment.executiveSummary, 180);
      doc.text(splitText, 14, y);
      y += splitText.length * 4 + 4;

      doc.setFontSize(10);
      doc.text("3. CORE CRITERIA FINDINGS (11 DIMENSIONS)", 14, y);
      y += 5;
      currentAssessment.criteria?.slice(0, 6).forEach((c: any) => {
        doc.setFontSize(8);
        doc.setTextColor(30, 41, 59);
        doc.text(`- [${c.status}] ${c.title}`, 14, y);
        y += 4;
        doc.setFontSize(7);
        doc.setTextColor(100, 116, 139);
        const fText = doc.splitTextToSize(`Finding: ${c.measuredFinding} (Source: ${c.evidenceSource})`, 180);
        doc.text(fText, 14, y);
        y += fText.length * 3.5 + 2;
      });

      doc.save(`GeoWise_StandardReport_${currentAssessment.id}.pdf`);
      toast.success(isAr ? "تم تحميل التقرير بصيغة PDF بنجاح" : "Report PDF downloaded successfully");
    } catch (err: any) {
      toast.error(`Error generating PDF: ${err.message}`);
    }
  };

  if (loading || !currentAssessment) {
    return (
      <div className="space-y-4 animate-pulse p-6">
        <div className="h-8 bg-muted rounded w-1/3" />
        <div className="h-96 bg-muted rounded" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto print:p-0 print:max-w-none">
      {/* Top Action Bar (Hidden on Print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/50 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild className="h-8 px-2 text-xs">
              <Link href="/assessments">
                <ArrowLeft className="size-3.5 me-1 rtl:rotate-180" />
                {isAr ? "سجل التقييمات" : "Assessments"}
              </Link>
            </Button>
            <span className="text-muted-foreground">•</span>
            <span className="font-mono text-xs font-bold text-primary">{currentAssessment.id}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight mt-1">
            {isAr ? "التقرير التخطيطي المكاني الموحد (14 قسماً)" : "Standardized Spatial Assessment Report"}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Assessment Selector */}
          <select
            value={selectedId}
            onChange={(e) => handleSelectChange(e.target.value)}
            className="text-xs bg-background border border-input rounded-md px-3 py-1.5 text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
          >
            {assessments.map((a) => (
              <option key={a.id} value={a.id}>
                {a.id} — {isAr ? a.siteNameAr || a.siteName : a.siteName}
              </option>
            ))}
          </select>

          <Button variant="outline" size="sm" onClick={handlePrint} className="gap-1.5 text-xs">
            <Printer className="size-3.5" />
            {isAr ? "طباعة التقرير" : "Print"}
          </Button>

          <Button size="sm" onClick={handleDownloadPdf} className="gap-1.5 text-xs bg-primary text-primary-foreground shadow-sm">
            <Download className="size-3.5" />
            {isAr ? "تصدير PDF" : "Export PDF"}
          </Button>
        </div>
      </div>

      {/* 14-SECTION STANDARDIZED SPATIAL REPORT CONTAINER */}
      <div className="bg-card border border-border/80 shadow-md rounded-2xl overflow-hidden print:border-none print:shadow-none print:rounded-none">
        {/* Document Header with Emblems & ID */}
        <div className="bg-slate-900 text-slate-100 p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                GeoWise Spatial Intelligence Platform
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-xs font-mono text-slate-400">Method {currentAssessment.analysisMethodVersion}</span>
            </div>
            <h2 className="text-xl md:text-2xl font-black tracking-tight text-white">
              {isAr ? "تقرير التقييم المكاني لطلب التطوير العقاري" : "Property Development Spatial Assessment Report"}
            </h2>
            <p className="text-xs text-slate-400">
              {currentAssessment.authority} — Kingdom of Saudi Arabia
            </p>
          </div>

          <div className="text-end font-mono space-y-1 shrink-0">
            <div className="text-xs text-slate-400">{isAr ? "رقم التقييم الرسمي:" : "Assessment Reference:"}</div>
            <div className="text-base font-bold text-white bg-slate-800/80 px-3 py-1 rounded border border-slate-700">
              {currentAssessment.id}
            </div>
            <div className="text-[0.68rem] text-slate-400">
              {new Date(currentAssessment.createdAt).toLocaleDateString(isAr ? "ar-SA" : "en-US")}
            </div>
          </div>
        </div>

        {/* Section 14: Prominent Advisory Disclaimer */}
        <div className="bg-amber-500/10 border-b border-amber-500/30 p-4 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-3">
          <AlertTriangle className="size-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold uppercase tracking-wider">
              {isAr ? "إشعار استرشادي قانوني إلزامي (القسم 14):" : "MANDATORY ADVISORY STATEMENT (Section 14):"}
            </span>{" "}
            {isAr
              ? "يقدم هذا التقرير قرائن جغرافية ومؤشرات مكانية مستخلصة من الطبقات الرسمية المعتمَدة. لا يمثل هذا التقرير قراراً مستقلاً بالاعتماد أو الرفض للطلب، ويُعتبر وثيقة استرشادية فنية لجهات التخطيط واللجان المختصة."
              : "This report presents geospatial evidence, verified measurements, and identified constraints derived from official spatial datasets. GeoWise provides evidence to support human decision-making and must never independently approve or reject a development request."}
          </div>
        </div>

        <div className="p-6 md:p-8 space-y-8 text-foreground">
          {/* Section 1 & 2: Assessment Identification & Location Summary */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-primary uppercase tracking-wider">
              {isAr ? "1. هوية التقييم وملخص الموقع الجغرافي" : "1. Assessment Identification & Site Summary"}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl bg-muted/40 border border-border/50 text-xs">
              <div>
                <span className="text-muted-foreground block text-[0.7rem]">{isAr ? "اسم المشروع / الموقع" : "Site Name"}</span>
                <span className="font-bold text-sm text-foreground mt-0.5 block">
                  {isAr ? currentAssessment.siteNameAr || currentAssessment.siteName : currentAssessment.siteName}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[0.7rem]">{isAr ? "المطور / مقدم الطلب" : "Applicant"}</span>
                <span className="font-semibold text-foreground mt-0.5 block">{currentAssessment.applicantName}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[0.7rem]">{isAr ? "المساحة المعتمدة" : "Parcel Area"}</span>
                <span className="font-mono font-bold text-primary text-sm mt-0.5 block">
                  {currentAssessment.areaM2?.toLocaleString()} m² ({(currentAssessment.areaM2 / 10000).toFixed(2)} ha)
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[0.7rem]">{isAr ? "النطاق الإداري والبلدي" : "District & Municipality"}</span>
                <span className="font-semibold text-foreground mt-0.5 block">{currentAssessment.district}</span>
              </div>
            </div>
          </div>

          {/* Section 3: Proposed Development Change */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-primary uppercase tracking-wider">
              {isAr ? "2. التغيير التطويري المقترح (نوع الطلب)" : "2. Proposed Development Change"}
            </div>
            <div className="p-4 rounded-xl bg-muted/40 border border-border/50 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="font-bold text-sm text-foreground">{currentAssessment.assessmentType}</div>
                <div className="text-muted-foreground text-xs mt-0.5">
                  {currentAssessment.address}
                </div>
              </div>
              <Badge className="bg-primary/10 text-primary border-primary/20 text-xs font-mono py-1 px-3 self-start sm:self-auto">
                {currentAssessment.overallSpatialVerdict}
              </Badge>
            </div>
          </div>

          {/* Section 4: Executive Spatial Summary */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-primary uppercase tracking-wider">
              {isAr ? "3. الملخص المكاني التنفيذي" : "3. Executive Spatial Summary"}
            </div>
            <div className="p-4 rounded-xl bg-card border border-border/80 text-xs leading-relaxed font-medium text-foreground/90 shadow-2xs">
              {isAr ? currentAssessment.executiveSummaryAr : currentAssessment.executiveSummary}
            </div>
          </div>

          {/* Section 5 & 6: Assessment Criteria & Statuses (11 Dimensions) */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-primary uppercase tracking-wider">
              {isAr ? "4. معايير التقييم المكاني التفصيلية (الأبعاد الـ 11)" : "4. Detailed Spatial Criteria & Findings (11 Dimensions)"}
            </div>
            <div className="border border-border/80 rounded-xl overflow-hidden divide-y divide-border/60 text-xs">
              {currentAssessment.criteria?.map((c: any, index: number) => (
                <div key={c.id || index} className="p-3.5 bg-card/60 hover:bg-muted/30 transition-colors space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-foreground">
                      {index + 1}. {isAr ? c.titleAr : c.title}
                    </span>
                    <Badge variant="outline" className="text-[0.65rem] font-semibold">
                      {c.status}
                    </Badge>
                  </div>
                  <p className="text-foreground/90 font-medium text-[0.72rem] leading-relaxed">
                    {c.measuredFinding}
                  </p>
                  <div className="flex flex-wrap items-center justify-between text-[0.68rem] text-muted-foreground pt-1">
                    <span className="font-mono">
                      {isAr ? "المصدر: " : "Source: "}
                      {c.evidenceSource} ({c.sourceVersionDate})
                    </span>
                    {c.followUpRequired && (
                      <span className="text-amber-600 dark:text-amber-400 font-semibold">
                        {isAr ? "الإجراء: " : "Action: "}
                        {c.followUpRequired}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 7: Relevant Measurements */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-primary uppercase tracking-wider">
              {isAr ? "5. القياسات الجغرافية الدقيقة" : "5. Relevant Measurements"}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {currentAssessment.measurements?.map((m: any) => (
                <div key={m.id} className="p-3 rounded-lg bg-muted/40 border border-border/50 text-xs">
                  <div className="text-[0.68rem] text-muted-foreground">{m.metricName}</div>
                  <div className="text-base font-bold font-mono text-primary mt-0.5">
                    {m.metricValue.toLocaleString()} {m.unit}
                  </div>
                  <div className="text-[0.65rem] text-muted-foreground truncate" title={m.context}>
                    {m.context}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 9: Identified Geographic Constraints */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="size-4" />
              <span>{isAr ? "6. المحددات والمخاطر المكانية المرصودة" : "6. Identified Geographic Constraints & Risks"}</span>
            </div>
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-xs space-y-2 text-red-900 dark:text-red-200">
              <p>
                {isAr
                  ? "• ارتفاع المبنى المقترح يتجاوز السقف المحدد في بعض المحاور أو يتطلب مراجعة أسطح حماية الطيران المدني (GACA)."
                  : "• Proposed height requires GACA Airport Obstacle Limitation Surface clearance review."}
              </p>
              <p>
                {isAr
                  ? "• الارتداد الأمامي المقترح يقل عن خط التنظيم المعتمد، مما قد يعيق أي توسعة مستقبلية لحرم الطريق."
                  : "• Proposed front setback is tighter than mandatory street right-of-way building line."}
              </p>
            </div>
          </div>

          {/* Section 10 & 11: Missing Data (Data Gaps) & Follow-up Investigations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                <AlertCircle className="size-4" />
                <span>{isAr ? "7. فجوات البيانات ومحدودية التغطية (Data Gaps)" : "7. Missing Data & Spatial Data Gaps"}</span>
              </div>
              <div className="space-y-2">
                {currentAssessment.dataGaps?.map((g: any) => (
                  <div key={g.id} className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20 text-xs">
                    <div className="font-semibold text-purple-800 dark:text-purple-300">{g.datasetName}</div>
                    <div className="text-[0.72rem] text-muted-foreground mt-0.5">{g.description}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Compass className="size-4" />
                <span>{isAr ? "8. الدراسات التخصصية المطلوبة" : "8. Required Specialist Follow-up Studies"}</span>
              </div>
              <div className="space-y-2">
                {currentAssessment.followUps?.map((f: any) => (
                  <div key={f.id} className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs">
                    <div className="font-semibold text-amber-800 dark:text-amber-300">{f.investigationType}</div>
                    <div className="text-[0.72rem] text-muted-foreground mt-0.5">{f.recommendation}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section 12 & 13: Source Datasets & Versions & Signoff */}
          <div className="pt-4 border-t border-border/60 text-xs text-muted-foreground flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div>
                <span className="font-semibold text-foreground">{isAr ? "قاعدة البيانات والتحليل: " : "Analysis Engine: "}</span>
                Turf.js Geodesic Calculations v2.4 (WGS84 EPSG:4326)
              </div>
              <div>
                <span className="font-semibold text-foreground">{isAr ? "الطبقات المعتمدة: " : "Validated Layers: "}</span>
                MOMRAH Cadastre, RCRC Masterplan, GACA OLS, Civil Defense Wadis, NCEC Reserves
              </div>
            </div>

            <div className="text-end font-mono">
              <div className="text-foreground font-semibold">{currentAssessment.assessorName || "Eng. Tariq Al-Mansoor"}</div>
              <div className="text-[0.7rem]">{currentAssessment.assessorRole || "Senior Spatial Planning Officer"}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
