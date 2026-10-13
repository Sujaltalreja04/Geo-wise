"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FolderKanban,
  Search,
  Filter,
  PlusCircle,
  MapPin,
  Building,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  FileText,
  Compass,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  SlidersHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useGeoWiseStore } from "@/stores/app-store";

interface AssessmentListItem {
  id: string;
  siteName: string;
  siteNameAr?: string;
  applicantName: string;
  authority: string;
  assessmentType: string;
  status: string;
  overallSpatialVerdict: string;
  district: string;
  areaM2: number;
  latitude: number;
  longitude: number;
  createdAt: string;
  criteria?: any[];
  dataGaps?: any[];
}

export function AssessmentsListModule() {
  const router = useRouter();
  const lang = useGeoWiseStore((s) => s.lang);
  const isAr = lang === "ar";

  const [assessments, setAssessments] = React.useState<AssessmentListItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState("all");
  const [statusFilter, setStatusFilter] = React.useState("all");

  const fetchAssessments = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/assessments");
      const data = await res.json();
      if (data.success) {
        setAssessments(data.assessments);
      }
    } catch (err) {
      console.error("Error fetching assessments:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchAssessments();
  }, [fetchAssessments]);

  const filtered = assessments.filter((item) => {
    const matchesSearch =
      search === "" ||
      item.siteName.toLowerCase().includes(search.toLowerCase()) ||
      (item.siteNameAr && item.siteNameAr.toLowerCase().includes(search.toLowerCase())) ||
      item.id.toLowerCase().includes(search.toLowerCase()) ||
      item.district.toLowerCase().includes(search.toLowerCase()) ||
      item.applicantName.toLowerCase().includes(search.toLowerCase());

    const matchesType = typeFilter === "all" || item.assessmentType === typeFilter;
    const matchesStatus =
      statusFilter === "all" ||
      item.overallSpatialVerdict === statusFilter ||
      item.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  const getVerdictBadge = (verdict: string) => {
    switch (verdict) {
      case "Supportive":
        return (
          <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 flex items-center gap-1">
            <CheckCircle2 className="size-3" />
            {isAr ? "مدعوم مكانياً" : "Supportive"}
          </Badge>
        );
      case "Supportive with Conditions":
        return (
          <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 flex items-center gap-1">
            <AlertCircle className="size-3" />
            {isAr ? "مدعوم باشتراطات" : "Supportive with Conditions"}
          </Badge>
        );
      case "Constrained":
        return (
          <Badge className="bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30 flex items-center gap-1">
            <AlertTriangle className="size-3" />
            {isAr ? "مقيّد مكانياً" : "Constrained"}
          </Badge>
        );
      case "Requires Further Study":
        return (
          <Badge className="bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30 flex items-center gap-1">
            <HelpCircle className="size-3" />
            {isAr ? "يتطلب دراسة تفصيلية" : "Requires Further Study"}
          </Badge>
        );
      case "Data Gap":
        return (
          <Badge className="bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30 flex items-center gap-1">
            <AlertCircle className="size-3" />
            {isAr ? "فجوة بيانات" : "Data Gap"}
          </Badge>
        );
      default:
        return <Badge variant="outline">{verdict}</Badge>;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "additional_floors":
        return isAr ? "أدوار إضافية وارتفاعات" : "Additional Floors / Height";
      case "land_use_change":
        return isAr ? "تعديل استعمال الأراضي" : "Land-Use Change";
      case "increased_density":
        return isAr ? "زيادة الكثافة ومعامل البناء" : "Increased Density / FAR";
      case "setback_variance":
        return isAr ? "استثناء ارتدادات نظامية" : "Setback Variance";
      default:
        return isAr ? "تطوير شامل" : "General Development";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/50">
        <div>
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
              <FolderKanban className="size-4" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              {isAr ? "سجل تقييمات المواقع والتطوير" : "Site Assessments Registry"}
            </h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {isAr
              ? "استعراض والبحث في تقييمات المواقع التخطيطية، وفحص القرائن الجغرافية والمحددات المكانية"
              : "Search, filter, and review spatial development assessments, boundary verifications, and geographic evidence"}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchAssessments}
            disabled={loading}
            className="gap-1.5"
          >
            <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
            {isAr ? "تحديث" : "Refresh"}
          </Button>

          <Button
            asChild
            className="bg-primary text-primary-foreground shadow-sm gap-2"
          >
            <Link href="/assessments/new">
              <PlusCircle className="size-4" />
              {isAr ? "بدء تقييم جديد" : "New Site Assessment"}
            </Link>
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="bg-card/60 backdrop-blur-sm border-border/60 shadow-sm">
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute start-3 top-2.5 size-4 text-muted-foreground" />
              <Input
                placeholder={
                  isAr
                    ? "البحث باسم الموقع، رقم التقييم، الحي، أو اسم المطور..."
                    : "Search by site name, assessment ID, district, or applicant..."
                }
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="ps-9 bg-background/80"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="text-xs bg-background/80 border border-input rounded-md px-3 py-2 text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
              >
                <option value="all">{isAr ? "جميع أنواع الطلبات" : "All Assessment Types"}</option>
                <option value="additional_floors">{isAr ? "أدوار إضافية" : "Additional Floors"}</option>
                <option value="land_use_change">{isAr ? "تعديل استعمال" : "Land-Use Change"}</option>
                <option value="increased_density">{isAr ? "كثافة ومعامل بناء" : "Increased Density"}</option>
                <option value="setback_variance">{isAr ? "استثناء ارتدادات" : "Setback Variance"}</option>
                <option value="general_development">{isAr ? "تطوير شامل" : "General Development"}</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs bg-background/80 border border-input rounded-md px-3 py-2 text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
              >
                <option value="all">{isAr ? "جميع الحالات المكانية" : "All Spatial Verdicts"}</option>
                <option value="Supportive">{isAr ? "مدعوم مكانياً" : "Supportive"}</option>
                <option value="Supportive with Conditions">{isAr ? "مدعوم باشتراطات" : "Supportive with Conditions"}</option>
                <option value="Constrained">{isAr ? "مقيّد مكانياً" : "Constrained"}</option>
                <option value="Requires Further Study">{isAr ? "يتطلب دراسة تفصيلية" : "Requires Further Study"}</option>
                <option value="Data Gap">{isAr ? "فجوة بيانات" : "Data Gap"}</option>
              </select>

              {(search || typeFilter !== "all" || statusFilter !== "all") && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearch("");
                    setTypeFilter("all");
                    setStatusFilter("all");
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  {isAr ? "إعادة ضبط" : "Reset"}
                </Button>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/40">
            <span>
              {isAr ? `إجمالي النتائج: ${filtered.length} موقع مسجل` : `Showing ${filtered.length} assessed development sites`}
            </span>
            <span className="flex items-center gap-1 font-mono">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              {isAr ? "النظام يعمل وفق محددات الأدلة الجغرافية" : "Advisory-only Evidence Engine"}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Assessments Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse h-48 bg-muted/40" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="text-center py-12 border-dashed">
          <CardContent className="space-y-3">
            <div className="size-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
              <FolderKanban className="size-6" />
            </div>
            <h3 className="font-semibold text-lg">
              {isAr ? "لم يتم العثور على تقييمات مطابقة" : "No Assessments Found"}
            </h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              {isAr
                ? "جرب تعديل معايير البحث أو ابدأ تقييم موقع جديد باستخدام محددات الحدود الجغرافية."
                : "Try adjusting your search criteria or register a new property assessment with GIS boundary."}
            </p>
            <Button asChild size="sm" className="mt-2">
              <Link href="/assessments/new">
                <PlusCircle className="size-4 me-1.5" />
                {isAr ? "بدء تقييم جديد" : "Create New Assessment"}
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => (
            <Card
              key={item.id}
              className="hover:border-primary/50 transition-all hover:shadow-md flex flex-col justify-between group bg-card/80"
            >
              <CardHeader className="p-4 pb-2 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-muted text-muted-foreground">
                    {item.id}
                  </span>
                  {getVerdictBadge(item.overallSpatialVerdict)}
                </div>

                <div>
                  <CardTitle className="text-base font-semibold group-hover:text-primary transition-colors line-clamp-1">
                    {isAr ? item.siteNameAr || item.siteName : item.siteName}
                  </CardTitle>
                  <CardDescription className="text-xs line-clamp-1 mt-0.5">
                    {item.applicantName}
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent className="p-4 pt-2 pb-3 space-y-2.5 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5 text-foreground/80 font-medium">
                  <Building className="size-3.5 text-primary shrink-0" />
                  <span>{getTypeLabel(item.assessmentType)}</span>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-border/40">
                  <div className="flex items-center gap-1">
                    <MapPin className="size-3 text-muted-foreground" />
                    <span>{item.district}</span>
                  </div>
                  <span className="font-mono">
                    {item.areaM2 ? `${(item.areaM2 / 10000).toFixed(2)} ha` : "—"}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[0.7rem] text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="size-3" />
                    <span>{new Date(item.createdAt).toLocaleDateString(isAr ? "ar-SA" : "en-US")}</span>
                  </div>
                  <span>{item.authority?.split("(")[0] || "Amanat Al-Riyadh"}</span>
                </div>
              </CardContent>

              <div className="p-3 bg-muted/30 border-t border-border/40 flex items-center justify-between gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs gap-1 text-primary hover:text-primary hover:bg-primary/10"
                  asChild
                >
                  <Link href={`/analysis?id=${item.id}`}>
                    <FileText className="size-3.5" />
                    {isAr ? "تقرير التحليل" : "View Analysis"}
                  </Link>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs gap-1"
                  asChild
                >
                  <Link href={`/map?siteId=${item.id}`}>
                    <Compass className="size-3.5" />
                    {isAr ? "المستكشف" : "Open Map"}
                  </Link>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
