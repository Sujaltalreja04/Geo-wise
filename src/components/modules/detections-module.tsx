"use client";

import * as React from "react";
import {
  ScanSearch,
  CheckCircle2,
  XCircle,
  FolderPlus,
  Clock,
  ShieldAlert,
  Loader2,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useGeoWiseStore } from "@/stores/app-store";
import { ModuleHeader, ModuleBody } from "./module-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { Detection } from "@/lib/dummy-data";

async function fetchDetections() {
  const res = await fetch("/api/detections");
  if (!res.ok) throw new Error("detections");
  return res.json() as Promise<{ detections: Detection[] }>;
}

async function patchDetection(id: string, action: "verify" | "reject" | "createCase") {
  const res = await fetch(`/api/detections/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action }),
  });
  if (!res.ok) throw new Error("patch failed");
  return res.json();
}

const STATUS_STYLES: Record<Detection["status"], { label: string; labelAr: string; cls: string; icon: typeof CheckCircle2 }> = {
  pending: { label: "Pending review", labelAr: "بانتظار المراجعة", cls: "bg-chart-4/15 text-chart-4 border-chart-4/30", icon: Clock },
  verified: { label: "Verified", labelAr: "موثّق", cls: "bg-chart-3/15 text-chart-3 border-chart-3/30", icon: CheckCircle2 },
  rejected: { label: "Rejected", labelAr: "مرفوض", cls: "bg-muted text-muted-foreground border-border", icon: XCircle },
};

function confColor(c: number) {
  if (c >= 0.9) return "text-chart-3";
  if (c >= 0.7) return "text-chart-4";
  return "text-chart-5";
}

export function DetectionsModule() {
  const t = useGeoWiseStore((s) => s.t);
  const lang = useGeoWiseStore((s) => s.lang);
  const qc = useQueryClient();

  const [filter, setFilter] = React.useState<"all" | Detection["status"]>("pending");

  const { data, isLoading } = useQuery({
    queryKey: ["detections"],
    queryFn: fetchDetections,
  });

  const detections = data?.detections ?? [];
  const filtered = filter === "all" ? detections : detections.filter((d) => d.status === filter);

  const counts = {
    pending: detections.filter((d) => d.status === "pending").length,
    verified: detections.filter((d) => d.status === "verified").length,
    rejected: detections.filter((d) => d.status === "rejected").length,
  };

  const mut = useMutation({
    mutationFn: ({ id, action }: { id: string; action: "verify" | "reject" | "createCase" }) =>
      patchDetection(id, action),
    onSuccess: (data, vars) => {
      qc.invalidateQueries({ queryKey: ["detections"] });
      qc.invalidateQueries({ queryKey: ["audit"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      if (vars.action === "verify") toast.success(lang === "ar" ? "تم اعتماد الاكتشاف" : "Detection verified");
      if (vars.action === "reject") toast.success(lang === "ar" ? "تم رفض الاكتشاف" : "Detection rejected");
      if (vars.action === "createCase") {
        toast.success(lang === "ar" ? `تم إنشاء الحالة ${data.case?.id}` : `Case ${data.case?.id} created`);
        qc.invalidateQueries({ queryKey: ["cases"] });
      }
    },
    onError: () => toast.error(lang === "ar" ? "فشل الإجراء" : "Action failed"),
  });

  return (
    <div className="flex flex-col h-full min-h-0">
      <ModuleHeader
        moduleId="M07"
        titleKey="detections.title"
        subtitleKey="detections.subtitle"
        icon={ScanSearch}
        actions={
          <Badge variant="outline" className="gap-1.5 text-chart-5 border-chart-5/40">
            <ShieldAlert className="size-3" />
            {lang === "ar" ? "ليست حقائق موثقة" : "Not verified facts"}
          </Badge>
        }
      />
      <ModuleBody>
        {/* Filter tabs */}
        <div className="flex items-center gap-1.5 mb-4 flex-wrap">
          {([
            ["pending", counts.pending],
            ["verified", counts.verified],
            ["rejected", counts.rejected],
            ["all", detections.length],
          ] as const).map(([s, n]) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-medium border transition-colors",
                filter === s
                  ? "bg-primary/15 text-primary border-primary/40"
                  : "bg-muted/30 hover:bg-muted/60 border-transparent"
              )}
            >
              {s === "all" ? t("common.all") : STATUS_STYLES[s as Detection["status"]][lang === "ar" ? "labelAr" : "label"]}
              <span className="ms-1.5 tabular-nums opacity-70">{n}</span>
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="text-center text-sm text-muted-foreground py-12">{t("common.loading")}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground py-12">{t("common.noResults")}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {filtered.map((d) => {
              const st = STATUS_STYLES[d.status];
              const Icon = st.icon;
              return (
                <Card key={d.id} className="p-4 flex flex-col">
                  {/* header */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-[0.65rem] text-muted-foreground">{d.id}</span>
                        <Badge variant="outline" className={cn("text-[0.65rem]", st.cls)}>
                          <Icon className="size-2.5 me-1" />
                          {lang === "ar" ? st.labelAr : st.label}
                        </Badge>
                      </div>
                      <h3 className="text-sm font-medium leading-tight">
                        {lang === "ar" ? d.typeNameAr : d.typeName}
                      </h3>
                      <p className="text-[0.7rem] text-muted-foreground mt-0.5">
                        {lang === "ar" ? d.districtAr : d.district} · {d.lon.toFixed(4)}°, {d.lat.toFixed(4)}°
                      </p>
                    </div>
                  </div>

                  <Separator className="my-2" />

                  {/* meta */}
                  <dl className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-[0.7rem] flex-1">
                    <div>
                      <dt className="text-muted-foreground">{t("detections.model")}</dt>
                      <dd className="font-mono font-medium">{d.model}@{d.modelVersion}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">{t("common.updated")}</dt>
                      <dd className="font-medium">{new Date(d.detectedAt).toLocaleDateString(lang === "ar" ? "ar-SA" : "en-GB")}</dd>
                    </div>
                    <div className="col-span-2">
                      <dt className="text-muted-foreground">{lang === "ar" ? "مصدر الصورة" : "Imagery"}</dt>
                      <dd className="font-medium font-mono">{d.imagerySource} · {d.imageryDate}</dd>
                    </div>
                  </dl>

                  {/* confidence bar */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-[0.7rem] mb-1">
                      <span className="text-muted-foreground">{t("detections.confidence")}</span>
                      <span className={cn("font-semibold tabular-nums", confColor(d.confidence))}>
                        {(d.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          d.confidence >= 0.9 ? "bg-chart-3" : d.confidence >= 0.7 ? "bg-chart-4" : "bg-chart-5"
                        )}
                        style={{ width: `${d.confidence * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* actions */}
                  {d.status === "pending" ? (
                    <div className="grid grid-cols-3 gap-1.5 mt-3">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={mut.isPending}
                        onClick={() => mut.mutate({ id: d.id, action: "verify" })}
                        className="text-chart-3 border-chart-3/40 hover:bg-chart-3/10"
                      >
                        {mut.isPending && mut.variables?.id === d.id && mut.variables?.action === "verify" ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : (
                          <CheckCircle2 className="size-3.5 me-1" />
                        )}
                        {t("detections.verify")}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={mut.isPending}
                        onClick={() => mut.mutate({ id: d.id, action: "reject" })}
                      >
                        <XCircle className="size-3.5 me-1" />
                        {t("detections.reject")}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={mut.isPending}
                        onClick={() => mut.mutate({ id: d.id, action: "createCase" })}
                      >
                        <FolderPlus className="size-3.5 me-1" />
                        {t("detections.createCase")}
                      </Button>
                    </div>
                  ) : (
                    <div className="mt-3 text-[0.7rem] text-muted-foreground text-center py-1.5 border rounded-md bg-muted/30">
                      {lang === "ar"
                        ? `راجع ${d.reviewedBy ?? "—"}`
                        : `Reviewed by ${d.reviewedBy ?? "—"}`}
                      {d.caseId && (
                        <span className="ms-1.5">· {d.caseId}</span>
                      )}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </ModuleBody>
    </div>
  );
}
