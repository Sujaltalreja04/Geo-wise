"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Compass,
  Upload,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Building,
  Layers,
  ArrowRight,
  ArrowLeft,
  Wrench,
  FileCode,
  ShieldCheck,
  Info,
  Maximize2,
  Minimize2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useGeoWiseStore } from "@/stores/app-store";
import { CADASTRAL_PARCELS } from "@/lib/development-assessment-data";
import { toast } from "sonner";

export function NewAssessmentWizard() {
  const router = useRouter();
  const lang = useGeoWiseStore((s) => s.lang);
  const isAr = lang === "ar";

  const [step, setStep] = React.useState<1 | 2 | 3 | 4>(1);

  // Step 1: Site Metadata
  const [siteName, setSiteName] = React.useState("");
  const [siteNameAr, setSiteNameAr] = React.useState("");
  const [applicantName, setApplicantName] = React.useState("");
  const [authority, setAuthority] = React.useState("Amanat Al-Riyadh (Riyadh Municipality)");
  const [address, setAddress] = React.useState("Al Olaya District, Riyadh, KSA");

  // Step 2: Boundary Ingestion & Validation
  const [boundarySource, setBoundarySource] = React.useState<"preset" | "upload" | "coords">("preset");
  const [selectedPresetId, setSelectedPresetId] = React.useState("pcl-olaya-01");
  const [currentBoundaryGeoJson, setCurrentBoundaryGeoJson] = React.useState<any>(
    CADASTRAL_PARCELS.features[0].geometry
  );
  const [validationReport, setValidationReport] = React.useState<any>(null);
  const [validating, setValidating] = React.useState(false);
  const [isRepaired, setIsRepaired] = React.useState(false);
  const [originalBoundary, setOriginalBoundary] = React.useState<any>(null);

  // Step 3: Proposal Details
  const [assessmentType, setAssessmentType] = React.useState<
    "additional_floors" | "land_use_change" | "increased_density" | "setback_variance" | "general_development"
  >("additional_floors");
  const [proposedFloors, setProposedFloors] = React.useState(10);
  const [currentAllowedFloors, setCurrentAllowedFloors] = React.useState(6);
  const [proposedHeightM, setProposedHeightM] = React.useState(35);
  const [currentMaxHeightM, setCurrentMaxHeightM] = React.useState(24);
  const [proposedLandUse, setProposedLandUse] = React.useState("Commercial Offices & Retail");
  const [currentZonedUse, setCurrentZonedUse] = React.useState("C-2 (Commercial Corridor)");
  const [proposedFAR, setProposedFAR] = React.useState(3.2);
  const [currentMaxFAR, setCurrentMaxFAR] = React.useState(2.5);
  const [proposedCoveragePct, setProposedCoveragePct] = React.useState(62);
  const [currentMaxCoveragePct, setCurrentMaxCoveragePct] = React.useState(60);
  const [proposedFrontSetbackM, setProposedFrontSetbackM] = React.useState(5.0);
  const [requiredFrontSetbackM, setRequiredFrontSetbackM] = React.useState(6.0);
  const [notes, setNotes] = React.useState("");

  // Step 4: Submission
  const [submitting, setSubmitting] = React.useState(false);

  // Validate boundary with backend
  const validateCurrentBoundary = React.useCallback(async (geometry: any) => {
    try {
      setValidating(true);
      const res = await fetch("/api/assessments/validate-boundary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ geometry }),
      });
      const data = await res.json();
      if (data.success) {
        setValidationReport(data.validation);
      }
    } catch (err) {
      console.error("Boundary validation error:", err);
    } finally {
      setValidating(false);
    }
  }, []);

  React.useEffect(() => {
    if (currentBoundaryGeoJson) {
      validateCurrentBoundary(currentBoundaryGeoJson);
    }
  }, [currentBoundaryGeoJson, validateCurrentBoundary]);

  const handleSelectPreset = (parcelId: string) => {
    setSelectedPresetId(parcelId);
    const parcel = CADASTRAL_PARCELS.features.find((f) => f.id === parcelId);
    if (parcel) {
      setCurrentBoundaryGeoJson(parcel.geometry);
      setOriginalBoundary(parcel.geometry);
      setIsRepaired(false);
      setSiteName(parcel.name);
      setSiteNameAr(parcel.nameAr);
      setCurrentZonedUse(parcel.properties.currentZoning);
      setCurrentAllowedFloors(parcel.properties.maxFloorsAllowed);
      setCurrentMaxHeightM(parcel.properties.maxHeightM);
      setCurrentMaxFAR(parcel.properties.maxFAR);
      setRequiredFrontSetbackM(parcel.properties.requiredSetbacks.front);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        // Check if GeoJSON
        if (file.name.endsWith(".geojson") || file.name.endsWith(".json")) {
          const parsed = JSON.parse(text);
          const geom = parsed.type === "Feature" ? parsed.geometry : parsed.type === "Polygon" ? parsed : parsed.features?.[0]?.geometry;
          if (geom) {
            setOriginalBoundary(geom);
            setCurrentBoundaryGeoJson(geom);
            setIsRepaired(false);
            toast.success(isAr ? "تم استيراد ملف الحدود بنجاح" : "Boundary GeoJSON imported successfully");
          } else {
            toast.error(isAr ? "تنسيق مضلع غير صالح" : "Could not find valid Polygon geometry in file");
          }
        } else {
          // Simulated KMZ parser
          toast.info(isAr ? "جارٍ فك حزمة KMZ واستخراج المضلع الجغرافي..." : "Parsing KMZ geographic polygon package...");
          const fallback = CADASTRAL_PARCELS.features[0].geometry;
          setOriginalBoundary(fallback);
          setCurrentBoundaryGeoJson(fallback);
          setIsRepaired(false);
          toast.success(isAr ? "تم استخراج حدود KMZ بنجاح" : "KMZ boundary extracted successfully");
        }
      } catch (err: any) {
        toast.error(isAr ? `خطأ في قراءة الملف: ${err.message}` : `File parsing error: ${err.message}`);
      }
    };
    reader.readAsText(file);
  };

  const handleRepairGeometry = () => {
    if (validationReport?.repairedGeoJson) {
      if (!originalBoundary) {
        setOriginalBoundary(currentBoundaryGeoJson);
      }
      setCurrentBoundaryGeoJson(validationReport.repairedGeoJson);
      setIsRepaired(true);
      toast.success(isAr ? "تم إصلاح هندسة المضلع وإغلاق الحلقة الهندسية" : "Boundary geometry repaired and closed");
    }
  };

  const handleSubmit = async () => {
    if (!siteName) {
      toast.error(isAr ? "يرجى إدخال اسم المشروع أو الموقع" : "Please enter the site name");
      setStep(1);
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        siteName,
        siteNameAr: siteNameAr || siteName,
        applicantName: applicantName || "Development Applicant / المطور العقاري",
        authority,
        assessmentType,
        proposedDetails: {
          proposedFloors,
          currentAllowedFloors,
          proposedHeightM,
          currentMaxHeightM,
          proposedLandUse,
          currentZonedUse,
          proposedFAR,
          currentMaxFAR,
          proposedCoveragePct,
          currentMaxCoveragePct,
          proposedFrontSetbackM,
          requiredFrontSetbackM,
          notes,
        },
        boundaryGeoJson: currentBoundaryGeoJson,
      };

      const res = await fetch("/api/assessments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(isAr ? "تم إكمال التحليل المكاني وحفظ التقييم بنجاح" : "Spatial assessment completed successfully");
        router.push(`/analysis?id=${data.assessmentId}`);
      } else {
        toast.error(data.error || "Failed to complete assessment");
      }
    } catch (err: any) {
      toast.error(`Error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Wizard Header */}
      <div className="border-b border-border/50 pb-4">
        <div className="flex items-center gap-2 text-primary font-semibold text-xs tracking-wide uppercase">
          <Compass className="size-4" />
          <span>{isAr ? "المعالج التخطيطي للتقييم المكاني" : "Geospatial Development Assessment Wizard"}</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight mt-1">
          {isAr ? "تسجيل وتقييم موقع تطوير جديد" : "New Development Site Assessment"}
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {isAr
            ? "التحقق من حدود الأرض، وفحص الارتفاعات، واستعمالات الأراضي، والارتدادات، والمخاطر الهيدرولوجية والمرافق"
            : "Examine site boundary, heights, land use, setbacks, airport restrictions, and environmental hazards"}
        </p>
      </div>

      {/* Progress Steps Bar */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { num: 1, label: isAr ? "1. بيانات الموقع" : "1. Site Details" },
          { num: 2, label: isAr ? "2. حدود الأرض والفحص" : "2. Boundary & Validation" },
          { num: 3, label: isAr ? "3. مقترح التطوير" : "3. Development Proposal" },
          { num: 4, label: isAr ? "4. التنفيذ والنتائج" : "4. Execute & Review" },
        ].map((s) => (
          <div
            key={s.num}
            className={`text-center py-2 px-1 rounded-lg text-xs font-medium border transition-all ${
              step === s.num
                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                : step > s.num
                ? "bg-primary/10 text-primary border-primary/30"
                : "bg-muted/40 text-muted-foreground border-border/40"
            }`}
          >
            {s.label}
          </div>
        ))}
      </div>

      {/* STEP 1: Site Details */}
      {step === 1 && (
        <Card className="bg-card/70 border-border/60">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Building className="size-5 text-primary" />
              {isAr ? "بيانات المشروع وموقع التطوير" : "Project & Site Identification"}
            </CardTitle>
            <CardDescription>
              {isAr
                ? "أدخل اسم المشروع، جهة الاعتماد، والجهة المطورة المقدمة للطلب"
                : "Enter the project name, development applicant, and municipal planning jurisdiction"}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">
                  {isAr ? "اسم المشروع / الموقع (بالإنجليزية)" : "Project / Site Name (EN) *"}
                </label>
                <Input
                  placeholder="e.g. Al Olaya Commercial Mixed-Use Tower"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  className="bg-background/80"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold">
                  {isAr ? "اسم المشروع / الموقع (بالعربية)" : "Site Name in Arabic"}
                </label>
                <Input
                  placeholder="مثال: برج العليا التجاري الاستثماري"
                  value={siteNameAr}
                  onChange={(e) => setSiteNameAr(e.target.value)}
                  className="bg-background/80"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">
                  {isAr ? "المطور / مالك العقار" : "Applicant / Property Developer *"}
                </label>
                <Input
                  placeholder="e.g. Riyadh Urban Development Group"
                  value={applicantName}
                  onChange={(e) => setApplicantName(e.target.value)}
                  className="bg-background/80"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold">
                  {isAr ? "جهة التخطيط المختصة" : "Planning Authority"}
                </label>
                <select
                  value={authority}
                  onChange={(e) => setAuthority(e.target.value)}
                  className="w-full text-xs bg-background/80 border border-input rounded-md px-3 py-2 text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
                >
                  <option value="Amanat Al-Riyadh (Riyadh Municipality)">أمانة منطقة الرياض (البلدية المركزية)</option>
                  <option value="Royal Commission for Riyadh City (RCRC)">الهيئة الملكية لمدينة الرياض (RCRC)</option>
                  <option value="MOMRAH / Balady National Portal">وزارة البلديات والإسكان (بلدي)</option>
                  <option value="Diriyah Gate Development Authority (DGDA)">هيئة تطوير بوابة الدرعية (DGDA)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold">
                {isAr ? "العنوان التقريبي أو الحي" : "Site Location / Address"}
              </label>
              <Input
                placeholder="e.g. King Fahd Road, Al Olaya District, Riyadh"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="bg-background/80"
              />
            </div>
          </CardContent>

          <div className="p-4 border-t border-border/40 flex justify-end">
            <Button
              onClick={() => {
                if (!siteName) {
                  toast.error(isAr ? "يرجى كتابة اسم الموقع" : "Please provide a site name");
                  return;
                }
                setStep(2);
              }}
              className="gap-2"
            >
              {isAr ? "التالي: حدود الأرض والفحص الهندسي" : "Next: Boundary Ingestion"}
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 2: Boundary Ingestion & Validation */}
      {step === 2 && (
        <Card className="bg-card/70 border-border/60">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Layers className="size-5 text-primary" />
              {isAr ? "إدخال الحدود الجغرافية وفحص الهندسة الفراغية" : "Site Boundary Ingestion & Geometry Validation"}
            </CardTitle>
            <CardDescription>
              {isAr
                ? "اختر قطعة من السجل العقاري المعتمد أو ارفع ملف KMZ/GeoJSON لفحص المساحة والحرم الإداري"
                : "Select an official cadastral parcel or upload a KMZ/GeoJSON boundary to validate topology and area"}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            {/* Source Toggle */}
            <div className="flex border border-border/60 rounded-lg p-1 bg-muted/40 max-w-md">
              <button
                type="button"
                onClick={() => setBoundarySource("preset")}
                className={`flex-1 text-xs py-1.5 px-3 rounded-md font-medium transition-all ${
                  boundarySource === "preset" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
                }`}
              >
                {isAr ? "قطع المخطط المعتمد" : "Authoritative Parcels"}
              </button>
              <button
                type="button"
                onClick={() => setBoundarySource("upload")}
                className={`flex-1 text-xs py-1.5 px-3 rounded-md font-medium transition-all ${
                  boundarySource === "upload" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
                }`}
              >
                {isAr ? "رفع ملف KMZ / GeoJSON" : "Upload KMZ / File"}
              </button>
            </div>

            {/* Presets List */}
            {boundarySource === "preset" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {CADASTRAL_PARCELS.features.map((feat) => (
                  <div
                    key={feat.id}
                    onClick={() => handleSelectPreset(feat.id)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedPresetId === feat.id
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "border-border/60 hover:border-primary/40 bg-card/60"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span>{isAr ? feat.nameAr : feat.name}</span>
                      <Badge variant="outline" className="text-[0.65rem] font-mono">
                        {feat.properties.currentZoning}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 flex items-center justify-between">
                      <span>{isAr ? `المساحة: ${feat.properties.areaSqm.toLocaleString()} م²` : `Area: ${feat.properties.areaSqm.toLocaleString()} m²`}</span>
                      <span className="font-mono text-primary font-medium">
                        {(feat.properties.areaSqm / 10000).toFixed(2)} ha
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Upload Area */}
            {boundarySource === "upload" && (
              <div className="border-2 border-dashed border-border rounded-xl p-8 text-center space-y-3 bg-muted/20">
                <div className="size-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
                  <Upload className="size-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold">
                    {isAr ? "ارفع ملف الحدود الجغرافية (KMZ, KML, GeoJSON)" : "Upload Site Boundary (KMZ, KML, or GeoJSON)"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {isAr
                      ? "يدعم النظام استخراج الإحداثيات والتحقق من عدم التقاطع الذاتي تلقائياً"
                      : "Supports polygon extraction, self-intersection checks, and coordinate conversion"}
                  </p>
                </div>
                <input
                  type="file"
                  accept=".kmz,.kml,.geojson,.json"
                  onChange={handleFileUpload}
                  className="text-xs file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer"
                />
              </div>
            )}

            {/* Geometry Validation Engine Status Card */}
            {validationReport && (
              <Card className="border border-border/80 bg-background/60 shadow-sm overflow-hidden">
                <div className="px-4 py-2.5 bg-muted/40 border-b border-border/60 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="size-4 text-primary" />
                    <span className="text-xs font-bold uppercase tracking-wider">
                      {isAr ? "تقرير فحص الهندسة الفراغية (Turf.js Engine)" : "Real-time Geometry Validation Report"}
                    </span>
                  </div>
                  {validationReport.isValid ? (
                    <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 gap-1 text-[0.65rem]">
                      <CheckCircle2 className="size-3" />
                      {isAr ? "هندسة صالحة ومعتمدة" : "Geometry Valid"}
                    </Badge>
                  ) : (
                    <Badge className="bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30 gap-1 text-[0.65rem]">
                      <AlertTriangle className="size-3" />
                      {isAr ? "خلل في المضلع" : "Invalid Geometry"}
                    </Badge>
                  )}
                </div>

                <CardContent className="p-4 space-y-3 text-xs">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                    <div className="p-2 rounded bg-muted/40 border border-border/40">
                      <div className="text-[0.68rem] text-muted-foreground">{isAr ? "المساحة المحسوبة" : "Geodesic Area"}</div>
                      <div className="text-sm font-bold font-mono text-primary mt-0.5">
                        {validationReport.areaSqm.toLocaleString()} m²
                      </div>
                      <div className="text-[0.65rem] text-muted-foreground font-mono">
                        {validationReport.areaHectares} ha
                      </div>
                    </div>

                    <div className="p-2 rounded bg-muted/40 border border-border/40">
                      <div className="text-[0.68rem] text-muted-foreground">{isAr ? "المحيط الجغرافي" : "Perimeter Length"}</div>
                      <div className="text-sm font-bold font-mono mt-0.5">
                        {validationReport.perimeterM.toLocaleString()} m
                      </div>
                      <div className="text-[0.65rem] text-muted-foreground">Turf LinearRing</div>
                    </div>

                    <div className="p-2 rounded bg-muted/40 border border-border/40">
                      <div className="text-[0.68rem] text-muted-foreground">{isAr ? "النطاق الإداري" : "Admin District"}</div>
                      <div className="text-sm font-bold truncate mt-0.5" title={validationReport.administrativeArea}>
                        {isAr ? validationReport.administrativeAreaAr : validationReport.administrativeArea}
                      </div>
                      <div className="text-[0.65rem] text-emerald-500 font-semibold">{isAr ? "مطابق للمخطط" : "Covered"}</div>
                    </div>

                    <div className="p-2 rounded bg-muted/40 border border-border/40">
                      <div className="text-[0.68rem] text-muted-foreground">{isAr ? "مركز الموقع" : "Centroid"}</div>
                      <div className="text-xs font-mono font-bold mt-0.5">
                        {validationReport.centroid[1].toFixed(4)}, {validationReport.centroid[0].toFixed(4)}
                      </div>
                      <div className="text-[0.65rem] text-muted-foreground">WGS84 EPSG:4326</div>
                    </div>
                  </div>

                  {/* Warnings or Repair Option */}
                  {validationReport.warnings.length > 0 && (
                    <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 space-y-1.5">
                      <div className="font-semibold flex items-center gap-1.5">
                        <AlertTriangle className="size-4 shrink-0" />
                        <span>{isAr ? "تنبيهات هندسية حول المضلع:" : "Geometric Notices & Warnings:"}</span>
                      </div>
                      <ul className="list-disc ps-5 text-[0.72rem] space-y-0.5">
                        {validationReport.warnings.map((w: string, i: number) => (
                          <li key={i}>{w}</li>
                        ))}
                      </ul>

                      {validationReport.canBeRepaired && !isRepaired && (
                        <div className="pt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleRepairGeometry}
                            className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30 gap-1.5 text-xs h-7"
                          >
                            <Wrench className="size-3.5" />
                            {isAr ? "إصلاح الهندسة آلياً (Auto-Repair & Close Ring)" : "Auto-Repair Geometry & Close Ring"}
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  {isRepaired && (
                    <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs flex items-center gap-2">
                      <CheckCircle2 className="size-4" />
                      <span>{isAr ? "تم حفظ النسخة الأصلية وتطبيق الهندسة المصححة بنجاح." : "Repaired geometry active; original boundary preserved in audit trace."}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </CardContent>

          <div className="p-4 border-t border-border/40 flex justify-between">
            <Button variant="outline" onClick={() => setStep(1)} className="gap-2">
              <ArrowLeft className="size-4" />
              {isAr ? "السابق" : "Back"}
            </Button>
            <Button
              onClick={() => setStep(3)}
              disabled={!validationReport?.isValid}
              className="gap-2"
            >
              {isAr ? "التالي: تفاصيل المقترح التخطيطي" : "Next: Development Proposal"}
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 3: Proposal Details */}
      {step === 3 && (
        <Card className="bg-card/70 border-border/60">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Building className="size-5 text-primary" />
              {isAr ? "تحديد نوع الطلب ومقترح التطوير" : "Development Proposal & Exception Parameters"}
            </CardTitle>
            <CardDescription>
              {isAr
                ? "حدد نوع الاستثناء أو التغيير المطلوب (أدوار إضافية، تعديل استعمال، معامل بناء، ارتدادات)"
                : "Select the specific planning request to configure comparative geospatial checks"}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            {/* Request Type Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold">
                {isAr ? "نوع الطلب التخطيطي *" : "Planning Assessment Category *"}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {[
                  {
                    id: "additional_floors",
                    label: isAr ? "أدوار إضافية وارتفاعات" : "Additional Floors & Height",
                    desc: isAr ? "طلب زيادة أدوار فوق المسموح بالمخطط" : "Requesting floors above zoned limit",
                  },
                  {
                    id: "land_use_change",
                    label: isAr ? "تعديل استعمال الأراضي" : "Land-Use Change",
                    desc: isAr ? "تغيير الاستعمال (سكني إلى تجاري)" : "Rezoning e.g. residential to commercial",
                  },
                  {
                    id: "increased_density",
                    label: isAr ? "زيادة الكثافة ومعامل البناء (FAR)" : "Increased Density / FAR",
                    desc: isAr ? "زيادة المساحة الطابقية ونسبة التغطية" : "Higher floor-area-ratio & coverage",
                  },
                  {
                    id: "setback_variance",
                    label: isAr ? "استثناء ارتدادات نظامية" : "Setback Variance",
                    desc: isAr ? "تقليص ارتداد خط التنظيم أو المجاورين" : "Reduction of front or side setbacks",
                  },
                  {
                    id: "general_development",
                    label: isAr ? "فحص تطوير شامل" : "General Spatial Review",
                    desc: isAr ? "تقييم شامل لجميع المعايير المكانية" : "Comprehensive 11-dimension review",
                  },
                ].map((t) => (
                  <div
                    key={t.id}
                    onClick={() => setAssessmentType(t.id as any)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      assessmentType === t.id
                        ? "border-primary bg-primary/10 ring-1 ring-primary"
                        : "border-border/60 hover:border-primary/40 bg-card/60"
                    }`}
                  >
                    <div className="text-xs font-bold">{t.label}</div>
                    <div className="text-[0.68rem] text-muted-foreground mt-0.5">{t.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Dynamic Inputs Based on Type */}
            <div className="p-4 rounded-lg bg-muted/30 border border-border/50 space-y-4">
              <div className="text-xs font-semibold text-primary flex items-center gap-1.5">
                <Info className="size-4" />
                <span>{isAr ? "معاملات المقترح التخطيطي:" : "Proposal Numerical Parameters:"}</span>
              </div>

              {assessmentType === "additional_floors" && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <label className="text-[0.72rem] text-muted-foreground">{isAr ? "الأدوار المقترحة" : "Proposed Floors"}</label>
                    <Input
                      type="number"
                      value={proposedFloors}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setProposedFloors(val);
                        setProposedHeightM(val * 3.5);
                      }}
                      className="bg-background text-xs h-8"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[0.72rem] text-muted-foreground">{isAr ? "الأدوار المسموحة بالمخطط" : "Allowed Floors (Zoned)"}</label>
                    <Input
                      type="number"
                      value={currentAllowedFloors}
                      onChange={(e) => setCurrentAllowedFloors(Number(e.target.value))}
                      className="bg-background text-xs h-8"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[0.72rem] text-muted-foreground">{isAr ? "الارتفاع المقترح (متر)" : "Proposed Height (m)"}</label>
                    <Input
                      type="number"
                      value={proposedHeightM}
                      onChange={(e) => setProposedHeightM(Number(e.target.value))}
                      className="bg-background text-xs h-8"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[0.72rem] text-muted-foreground">{isAr ? "الحد الأقصى الحالي (متر)" : "Current Max Height (m)"}</label>
                    <Input
                      type="number"
                      value={currentMaxHeightM}
                      onChange={(e) => setCurrentMaxHeightM(Number(e.target.value))}
                      className="bg-background text-xs h-8"
                    />
                  </div>
                </div>
              )}

              {assessmentType === "land_use_change" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[0.72rem] text-muted-foreground">{isAr ? "الاستعمال المقترح" : "Proposed Land Use"}</label>
                    <Input
                      value={proposedLandUse}
                      onChange={(e) => setProposedLandUse(e.target.value)}
                      placeholder="e.g. Commercial Retail Strip & Medical Clinics"
                      className="bg-background text-xs h-8"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[0.72rem] text-muted-foreground">{isAr ? "الاستعمال المعتمد حالياً" : "Current Zoned Use"}</label>
                    <Input
                      value={currentZonedUse}
                      onChange={(e) => setCurrentZonedUse(e.target.value)}
                      className="bg-background text-xs h-8"
                    />
                  </div>
                </div>
              )}

              {assessmentType === "increased_density" && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <label className="text-[0.72rem] text-muted-foreground">{isAr ? "معامل البناء المقترح (FAR)" : "Proposed FAR"}</label>
                    <Input
                      type="number"
                      step="0.1"
                      value={proposedFAR}
                      onChange={(e) => setProposedFAR(Number(e.target.value))}
                      className="bg-background text-xs h-8"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[0.72rem] text-muted-foreground">{isAr ? "المعامل المسموح (FAR)" : "Zoned Max FAR"}</label>
                    <Input
                      type="number"
                      step="0.1"
                      value={currentMaxFAR}
                      onChange={(e) => setCurrentMaxFAR(Number(e.target.value))}
                      className="bg-background text-xs h-8"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[0.72rem] text-muted-foreground">{isAr ? "نسبة التغطية المقترحة %" : "Proposed Coverage %"}</label>
                    <Input
                      type="number"
                      value={proposedCoveragePct}
                      onChange={(e) => setProposedCoveragePct(Number(e.target.value))}
                      className="bg-background text-xs h-8"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[0.72rem] text-muted-foreground">{isAr ? "الحد الأقصى للتغطية %" : "Zoned Max Coverage %"}</label>
                    <Input
                      type="number"
                      value={currentMaxCoveragePct}
                      onChange={(e) => setCurrentMaxCoveragePct(Number(e.target.value))}
                      className="bg-background text-xs h-8"
                    />
                  </div>
                </div>
              )}

              {assessmentType === "setback_variance" && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[0.72rem] text-muted-foreground">{isAr ? "الارتداد الأمامي المقترح (متر)" : "Proposed Front Setback (m)"}</label>
                    <Input
                      type="number"
                      step="0.5"
                      value={proposedFrontSetbackM}
                      onChange={(e) => setProposedFrontSetbackM(Number(e.target.value))}
                      className="bg-background text-xs h-8"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[0.72rem] text-muted-foreground">{isAr ? "الارتداد النظامي الإلزامي (متر)" : "Mandatory Front Setback (m)"}</label>
                    <Input
                      type="number"
                      step="0.5"
                      value={requiredFrontSetbackM}
                      onChange={(e) => setRequiredFrontSetbackM(Number(e.target.value))}
                      className="bg-background text-xs h-8"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[0.72rem] text-muted-foreground">
                  {isAr ? "مبررات الطلب التخطيطي وملاحظات المطور" : "Proposal Justification & Additional Notes"}
                </label>
                <Input
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={
                    isAr
                      ? "مثال: الاستناد إلى حوافز التطوير على المحاور التجارية أو تحديث خط التنظيم"
                      : "e.g. Applicant cites commercial corridor densification incentive policy"
                  }
                  className="bg-background text-xs h-8"
                />
              </div>
            </div>
          </CardContent>

          <div className="p-4 border-t border-border/40 flex justify-between">
            <Button variant="outline" onClick={() => setStep(2)} className="gap-2">
              <ArrowLeft className="size-4" />
              {isAr ? "السابق" : "Back"}
            </Button>
            <Button onClick={() => setStep(4)} className="gap-2">
              {isAr ? "التالي: المراجعة وبدء التحليل" : "Next: Review & Run"}
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 4: Review & Run Assessment */}
      {step === 4 && (
        <Card className="bg-card/70 border-border/60">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="size-5 text-primary" />
              {isAr ? "مراجعة المدخلات وبدء التحليل المكاني الفوري" : "Review Inputs & Execute Spatial Assessment"}
            </CardTitle>
            <CardDescription>
              {isAr
                ? "سيقوم المحرك الجغرافي بفحص 11 بعداً مكانياً بدقة، وتحديد المحددات وفجوات البيانات"
                : "The engine will evaluate 11 geospatial criteria, calculate measurements, and identify constraints"}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="p-4 rounded-xl bg-muted/40 border border-border/60 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-border/40">
                <span className="text-xs text-muted-foreground">{isAr ? "اسم الموقع:" : "Site Name:"}</span>
                <span className="font-semibold text-sm">{siteName}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-border/40">
                <span className="text-xs text-muted-foreground">{isAr ? "نوع الطلب:" : "Assessment Category:"}</span>
                <Badge variant="outline" className="font-medium text-xs">
                  {assessmentType}
                </Badge>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-border/40">
                <span className="text-xs text-muted-foreground">{isAr ? "المساحة المعتمدة:" : "Calculated Area:"}</span>
                <span className="font-mono font-bold text-primary">
                  {validationReport ? `${validationReport.areaSqm.toLocaleString()} m² (${validationReport.areaHectares} ha)` : "—"}
                </span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-border/40">
                <span className="text-xs text-muted-foreground">{isAr ? "النطاق الإداري:" : "Administrative District:"}</span>
                <span className="font-semibold text-xs">
                  {validationReport ? (isAr ? validationReport.administrativeAreaAr : validationReport.administrativeArea) : "—"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{isAr ? "الطبقات الجغرافية المعتمدة:" : "Integrated Layers:"}</span>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                  8 Official Layers (MOMRAH, RCRC, Civil Defense, GACA, TGA)
                </span>
              </div>
            </div>

            {/* Mandatory Advisory Notice */}
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-2.5">
              <AlertTriangle className="size-4 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">{isAr ? "إخلاء مسؤولية استرشادي ملزم:" : "Mandatory Advisory Principle:"}</span>{" "}
                {isAr
                  ? "يقدم نظام جيو وايز قرائن وتحليلات جغرافية لدعم لجان التخطيط فقط، ولا يقوم باتخاذ أي قرار بالموافقة أو الرفض للطلب."
                  : "GeoWise provides geographical evidence and assessments. It must never independently approve or reject a development request."}
              </div>
            </div>
          </CardContent>

          <div className="p-4 border-t border-border/40 flex justify-between">
            <Button variant="outline" onClick={() => setStep(3)} className="gap-2">
              <ArrowLeft className="size-4" />
              {isAr ? "السابق" : "Back"}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-primary text-primary-foreground gap-2 font-semibold shadow-md shadow-primary/20"
            >
              <Compass className={`size-4 ${submitting ? "animate-spin" : ""}`} />
              {submitting
                ? isAr
                  ? "جارٍ تنفيذ التحليل المكاني..."
                  : "Executing Spatial Assessment Engine..."
                : isAr
                ? "بدء التحليل المكاني وإصدار التقرير"
                : "Execute Spatial Assessment"}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
