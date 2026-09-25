"use client";

import * as React from "react";
import { Database, Filter, Shield, GitBranch, Map as MapIcon, FileSearch } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useGeoWiseStore } from "@/stores/app-store";
import { ModuleHeader, ModuleBody } from "./module-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { Dataset } from "@/lib/dummy-data";

async function fetchDatasets() {
  const res = await fetch("/api/datasets");
  if (!res.ok) throw new Error("datasets");
  return res.json() as Promise<{ datasets: Dataset[] }>;
}

const CLASSIFICATION_STYLES: Record<Dataset["classification"], { label: string; cls: string }> = {
  public: { label: "Public", cls: "bg-chart-3/15 text-chart-3 border-chart-3/30" },
  internal: { label: "Internal", cls: "bg-chart-2/15 text-chart-2 border-chart-2/30" },
  confidential: { label: "Confidential", cls: "bg-chart-4/15 text-chart-4 border-chart-4/30" },
  restricted: { label: "Restricted", cls: "bg-chart-5/15 text-chart-5 border-chart-5/30" },
};

const GEO_ICONS: Record<Dataset["geometryType"], string> = {
  Polygon: "▰",
  Point: "•",
  LineString: "—",
  Raster: "▦",
};

export function CatalogModule() {
  const t = useGeoWiseStore((s) => s.t);
  const lang = useGeoWiseStore((s) => s.lang);
  const setActiveModule = useGeoWiseStore((s) => s.setActiveModule);

  const [search, setSearch] = React.useState("");
  const [geom, setGeom] = React.useState<string>("all");
  const [classification, setClassification] = React.useState<string>("all");
  const [selectedId, setSelectedId] = React.useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["datasets"],
    queryFn: fetchDatasets,
  });

  const datasets = data?.datasets ?? [];

  const filtered = datasets.filter((d) => {
    if (search) {
      const q = search.toLowerCase();
      if (!d.name.toLowerCase().includes(q) && !d.nameAr.includes(search) && !d.owner.toLowerCase().includes(q) && !d.tags.includes(q)) return false;
    }
    if (geom !== "all" && d.geometryType !== geom) return false;
    if (classification !== "all" && d.classification !== classification) return false;
    return true;
  });

  const selected = datasets.find((d) => d.id === selectedId) ?? null;

  return (
    <div className="flex flex-col h-full min-h-0">
      <ModuleHeader
        moduleId="M03"
        titleKey="catalog.title"
        subtitleKey="catalog.subtitle"
        icon={Database}
      />
      <ModuleBody>
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-2 mb-4">
          <div className="relative flex-1">
            <FileSearch className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("catalog.searchPlaceholder")}
              className="ps-9"
            />
          </div>
          <Select value={geom} onValueChange={setGeom}>
            <SelectTrigger className="w-full md:w-44">
              <Filter className="size-3.5 me-1.5 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("common.all")}</SelectItem>
              <SelectItem value="Polygon">Polygon</SelectItem>
              <SelectItem value="Point">Point</SelectItem>
              <SelectItem value="LineString">LineString</SelectItem>
              <SelectItem value="Raster">Raster</SelectItem>
            </SelectContent>
          </Select>
          <Select value={classification} onValueChange={setClassification}>
            <SelectTrigger className="w-full md:w-44">
              <Shield className="size-3.5 me-1.5 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("common.all")}</SelectItem>
              <SelectItem value="public">{t("catalog.classification.public")}</SelectItem>
              <SelectItem value="internal">{t("catalog.classification.internal")}</SelectItem>
              <SelectItem value="confidential">{t("catalog.classification.confidential")}</SelectItem>
              <SelectItem value="restricted">{t("catalog.classification.restricted")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="text-xs text-muted-foreground mb-3">
          {filtered.length} / {datasets.length} {t("common.results")}
        </div>

        {/* List + detail */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <div className="space-y-2">
            {isLoading && (
              <>
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-32" />
                ))}
              </>
            )}
            {filtered.map((d) => {
              const cls = CLASSIFICATION_STYLES[d.classification];
              const isSel = selectedId === d.id;
              return (
                <Card
                  key={d.id}
                  className={cn(
                    "p-4 cursor-pointer transition-all hover:shadow-md",
                    isSel && "ring-2 ring-primary/40"
                  )}
                  onClick={() => setSelectedId(d.id)}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <span className="text-2xl leading-none mt-0.5 text-primary/70">
                        {GEO_ICONS[d.geometryType]}
                      </span>
                      <div className="min-w-0">
                        <h3 className="font-medium text-sm leading-tight truncate">
                          {lang === "ar" ? d.nameAr : d.name}
                        </h3>
                        <p className="text-xs text-muted-foreground truncate">
                          {d.id} · {d.crs}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className={cn("text-[0.65rem] shrink-0", cls.cls)}>
                      {lang === "ar" ? t(`catalog.classification.${d.classification}` as never) : cls.label}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[0.7rem] mt-3">
                    <div>
                      <div className="text-muted-foreground">{t("catalog.records")}</div>
                      <div className="font-medium tabular-nums">{d.featureCount.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">{t("catalog.quality")}</div>
                      <div className="font-medium tabular-nums">{d.qualityScore}/100</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">{t("catalog.version")}</div>
                      <div className="font-medium">{d.version}</div>
                    </div>
                  </div>
                  <Progress value={d.qualityScore} className="h-1 mt-2" />
                </Card>
              );
            })}
            {filtered.length === 0 && !isLoading && (
              <div className="text-center text-sm text-muted-foreground py-12">
                {t("common.noResults")}
              </div>
            )}
          </div>

          {/* Detail panel */}
          <Card className="p-5 lg:sticky lg:top-4 h-fit">
            {!selected ? (
              <div className="text-center text-sm text-muted-foreground py-16">
                <Database className="size-8 mx-auto mb-3 opacity-40" />
                {lang === "ar" ? "اختر مجموعة بيانات لعرض تفاصيلها" : "Select a dataset to view its details."}
              </div>
            ) : (
              <DatasetDetail dataset={selected} onOpenInMap={() => setActiveModule("map")} />
            )}
          </Card>
        </div>
      </ModuleBody>
    </div>
  );
}

function DatasetDetail({ dataset, onOpenInMap }: { dataset: Dataset; onOpenInMap: () => void }) {
  const t = useGeoWiseStore((s) => s.t);
  const lang = useGeoWiseStore((s) => s.lang);
  const cls = CLASSIFICATION_STYLES[dataset.classification];

  return (
    <div className="space-y-4 text-sm">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="outline" className={cn("text-[0.65rem]", cls.cls)}>
            {lang === "ar" ? t(`catalog.classification.${dataset.classification}` as never) : cls.label}
          </Badge>
          <Badge variant="secondary" className="text-[0.65rem]">
            {dataset.version}
          </Badge>
        </div>
        <h2 className="text-lg font-semibold leading-tight">
          {lang === "ar" ? dataset.nameAr : dataset.name}
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          {lang === "ar" ? dataset.descriptionAr : dataset.description}
        </p>
      </div>

      <Separator />

      <dl className="grid grid-cols-2 gap-x-3 gap-y-3 text-xs">
        <Field label={t("common.id")} value={dataset.id} mono />
        <Field label={t("catalog.geometry")} value={dataset.geometryType} />
        <Field label={t("catalog.crs")} value={dataset.crs} />
        <Field label={t("catalog.version")} value={dataset.version} />
        <Field label={t("common.owner")} value={lang === "ar" ? dataset.ownerAr : dataset.owner} />
        <Field label={t("catalog.source")} value={lang === "ar" ? dataset.sourceAr : dataset.source} />
        <Field label={t("catalog.records")} value={dataset.featureCount.toLocaleString()} mono />
        <Field label={t("catalog.quality")} value={`${dataset.qualityScore}/100`} mono />
        <Field label={t("catalog.lastValidated")} value={dataset.lastValidated} mono />
        <Field label={t("common.updated")} value={new Date(dataset.updatedAt).toLocaleString(lang === "ar" ? "ar-SA" : "en-GB", { dateStyle: "medium", timeStyle: "short" })} />
        <Field label={t("common.tenant")} value={lang === "ar" ? dataset.tenantName : dataset.tenantName} />
        <Field label={t("common.type")} value={dataset.geometryType} />
      </dl>

      <Separator />

      <div>
        <div className="flex items-center gap-2 text-xs font-semibold mb-1.5">
          <GitBranch className="size-3.5 text-primary" />
          {t("catalog.lineage")}
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">{dataset.lineage}</p>
      </div>

      <div>
        <div className="text-xs font-semibold mb-1.5">{lang === "ar" ? "الوسوم" : "Tags"}</div>
        <div className="flex flex-wrap gap-1">
          {dataset.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-[0.65rem]">
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <Button size="sm" className="flex-1" onClick={onOpenInMap}>
          <MapIcon className="size-3.5 me-1.5" />
          {t("catalog.openInMap")}
        </Button>
        <Button size="sm" variant="outline">
          {lang === "ar" ? "تصدير" : "Export"}
        </Button>
      </div>
    </div>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <dt className="text-muted-foreground text-[0.7rem]">{label}</dt>
      <dd className={cn("font-medium mt-0.5 break-words", mono && "font-mono")}>{value}</dd>
    </div>
  );
}
