"use client";

import * as React from "react";
import {
  FolderKanban,
  Clock,
  MapPin,
  FileText,
  Image as ImageIcon,
  ArrowRight,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { Case, CaseStatus } from "@/lib/dummy-data";

async function fetchCases() {
  const res = await fetch("/api/cases");
  if (!res.ok) throw new Error("cases");
  return res.json() as Promise<{ cases: Case[] }>;
}

async function patchCase(id: string, status: CaseStatus) {
  const res = await fetch(`/api/cases/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error("patch failed");
  return res.json();
}

const STATUS_FLOW: CaseStatus[] = ["new", "investigating", "inspection", "review", "closed"];

const STATUS_STYLE: Record<CaseStatus, string> = {
  new: "bg-chart-2/15 text-chart-2 border-chart-2/30",
  investigating: "bg-chart-1/15 text-chart-1 border-chart-1/30",
  inspection: "bg-chart-4/15 text-chart-4 border-chart-4/30",
  review: "bg-purple-500/15 text-purple-500 border-purple-500/30",
  closed: "bg-muted text-muted-foreground border-border",
};

const STATUS_LABEL: Record<CaseStatus, { en: string; ar: string }> = {
  new: { en: "New", ar: "جديد" },
  investigating: { en: "Investigating", ar: "قيد التحقيق" },
  inspection: { en: "Inspection", ar: "تفتيش" },
  review: { en: "Review", ar: "مراجعة" },
  closed: { en: "Closed", ar: "مغلق" },
};

const PRIORITY_STYLE: Record<Case["priority"], string> = {
  low: "bg-muted text-muted-foreground border-border",
  medium: "bg-chart-2/15 text-chart-2 border-chart-2/30",
  high: "bg-chart-4/15 text-chart-4 border-chart-4/30",
  critical: "bg-chart-5/15 text-chart-5 border-chart-5/30",
};

export function CasesModule() {
  const t = useGeoWiseStore((s) => s.t);
  const lang = useGeoWiseStore((s) => s.lang);
  const qc = useQueryClient();

  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [statusFilter, setStatusFilter] = React.useState<string>("all");

  const { data, isLoading } = useQuery({ queryKey: ["cases"], queryFn: fetchCases });
  const cases = data?.cases ?? [];
  const filtered = statusFilter === "all" ? cases : cases.filter((c) => c.status === statusFilter);

  const selected = cases.find((c) => c.id === selectedId) ?? null;

  const mut = useMutation({
    mutationFn: ({ id, status }: { id: string; status: CaseStatus }) => patchCase(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cases"] });
      qc.invalidateQueries({ queryKey: ["audit"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success(lang === "ar" ? "تم تحديث الحالة" : "Status updated");
    },
    onError: () => toast.error(lang === "ar" ? "فشل التحديث" : "Update failed"),
  });

  return (
    <div className="flex flex-col h-full min-h-0">
      <ModuleHeader
        moduleId="M11"
        titleKey="cases.title"
        subtitleKey="cases.subtitle"
        icon={FolderKanban}
        actions={
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40 h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("common.all")}</SelectItem>
              {STATUS_FLOW.map((s) => (
                <SelectItem key={s} value={s}>
                  {lang === "ar" ? STATUS_LABEL[s].ar : STATUS_LABEL[s].en}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />
      <ModuleBody>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-3">
          {/* Cases list */}
          <div className="space-y-2">
            {isLoading && <div className="text-sm text-muted-foreground p-2">{t("common.loading")}</div>}
            {filtered.map((c) => {
              const isSel = selectedId === c.id;
              const slaPct = Math.max(0, Math.min(100, (c.slaRemainingHours / c.slaHours) * 100));
              return (
                <Card
                  key={c.id}
                  className={cn(
                    "p-4 cursor-pointer transition-all hover:shadow-md",
                    isSel && "ring-2 ring-primary/40"
                  )}
                  onClick={() => setSelectedId(c.id)}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-mono text-[0.7rem] text-muted-foreground">{c.id}</span>
                        <Badge variant="outline" className={cn("text-[0.65rem]", STATUS_STYLE[c.status])}>
                          {lang === "ar" ? STATUS_LABEL[c.status].ar : STATUS_LABEL[c.status].en}
                        </Badge>
                        <Badge variant="outline" className={cn("text-[0.65rem] capitalize", PRIORITY_STYLE[c.priority])}>
                          {c.priority}
                        </Badge>
                      </div>
                      <h3 className="text-sm font-medium leading-tight">
                        {lang === "ar" ? c.titleAr : c.title}
                      </h3>
                      <p className="text-[0.7rem] text-muted-foreground mt-0.5 flex items-center gap-1">
                        <MapPin className="size-3" />
                        {lang === "ar" ? c.districtAr : c.district} · {lang === "ar" ? c.assignedToAr : c.assignedTo}
                      </p>
                    </div>
                  </div>

                  {/* SLA */}
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-[0.7rem] mb-1">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Clock className="size-3" />
                        {t("cases.sla")}
                      </span>
                      <span className={cn("font-medium tabular-nums", c.slaRemainingHours < 24 ? "text-chart-5" : "text-foreground")}>
                        {c.slaRemainingHours > 0 ? `${c.slaRemainingHours}h` : (lang === "ar" ? "منتهٍ" : "overdue")}
                      </span>
                    </div>
                    <div className="h-1 rounded-full bg-muted overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          slaPct < 25 ? "bg-chart-5" : slaPct < 50 ? "bg-chart-4" : "bg-chart-3"
                        )}
                        style={{ width: `${slaPct}%` }}
                      />
                    </div>
                  </div>
                </Card>
              );
            })}
            {filtered.length === 0 && !isLoading && (
              <div className="text-center text-sm text-muted-foreground py-12">{t("common.noResults")}</div>
            )}
          </div>

          {/* Detail */}
          <Card className="p-4 h-fit lg:sticky lg:top-4">
            {!selected ? (
              <div className="text-center text-sm text-muted-foreground py-16">
                <FolderKanban className="size-8 mx-auto mb-3 opacity-40" />
                {lang === "ar" ? "اختر حالة لعرض تفاصيلها" : "Select a case to view its details."}
              </div>
            ) : (
              <CaseDetail
                c={selected}
                onAdvance={(s) => mut.mutate({ id: selected.id, status: s })}
                busy={mut.isPending}
              />
            )}
          </Card>
        </div>
      </ModuleBody>
    </div>
  );
}

function CaseDetail({
  c,
  onAdvance,
  busy,
}: {
  c: Case;
  onAdvance: (s: CaseStatus) => void;
  busy: boolean;
}) {
  const t = useGeoWiseStore((s) => s.t);
  const lang = useGeoWiseStore((s) => s.lang);
  const currentIdx = STATUS_FLOW.indexOf(c.status);
  const nextStatus = STATUS_FLOW[currentIdx + 1];

  return (
    <div className="space-y-4 text-sm">
      <div>
        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
          <Badge variant="outline" className={cn("text-[0.65rem]", STATUS_STYLE[c.status])}>
            {lang === "ar" ? STATUS_LABEL[c.status].ar : STATUS_LABEL[c.status].en}
          </Badge>
          <Badge variant="outline" className={cn("text-[0.65rem] capitalize", PRIORITY_STYLE[c.priority])}>
            {c.priority}
          </Badge>
        </div>
        <span className="font-mono text-[0.7rem] text-muted-foreground">{c.id}</span>
        <h2 className="text-base font-semibold leading-tight mt-1">
          {lang === "ar" ? c.titleAr : c.title}
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          {lang === "ar" ? c.descriptionAr : c.description}
        </p>
      </div>

      <Separator />

      <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
        <div>
          <dt className="text-muted-foreground text-[0.7rem]">{t("common.assignedTo")}</dt>
          <dd className="font-medium">{lang === "ar" ? c.assignedToAr : c.assignedTo}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground text-[0.7rem]">{t("common.region")}</dt>
          <dd className="font-medium">{lang === "ar" ? c.districtAr : c.district}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground text-[0.7rem]">{t("common.created")}</dt>
          <dd className="font-medium">{new Date(c.createdAt).toLocaleString(lang === "ar" ? "ar-SA" : "en-GB", { dateStyle: "medium", timeStyle: "short" })}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground text-[0.7rem]">{t("common.dueDate")}</dt>
          <dd className="font-medium">{new Date(c.dueAt).toLocaleDateString(lang === "ar" ? "ar-SA" : "en-GB")}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground text-[0.7rem]">{t("cases.sla")}</dt>
          <dd className="font-medium tabular-nums">{c.slaRemainingHours > 0 ? `${c.slaRemainingHours}h / ${c.slaHours}h` : (lang === "ar" ? "منتهٍ" : "Overdue")}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground text-[0.7rem]">{lang === "ar" ? "المصدر" : "Source"}</dt>
          <dd className="font-medium capitalize">{c.source} · <span className="font-mono">{c.sourceRef}</span></dd>
        </div>
      </dl>

      <Separator />

      {/* Lifecycle progress */}
      <div>
        <div className="text-xs font-semibold mb-2">{t("cases.lifecycle")}</div>
        <div className="flex items-center gap-1">
          {STATUS_FLOW.map((s, i) => {
            const done = i <= currentIdx;
            const isCurrent = i === currentIdx;
            return (
              <React.Fragment key={s}>
                <div
                  className={cn(
                    "size-2.5 rounded-full shrink-0",
                    done ? "bg-primary" : "bg-muted-foreground/30",
                    isCurrent && "ring-4 ring-primary/20"
                  )}
                />
                {i < STATUS_FLOW.length - 1 && (
                  <div className={cn("h-0.5 flex-1", i < currentIdx ? "bg-primary" : "bg-muted-foreground/20")} />
                )}
              </React.Fragment>
            );
          })}
        </div>
        <div className="flex justify-between mt-1.5 text-[0.6rem] text-muted-foreground">
          {STATUS_FLOW.map((s) => (
            <span key={s} className="flex-1 text-center">{lang === "ar" ? STATUS_LABEL[s].ar : STATUS_LABEL[s].en}</span>
          ))}
        </div>
      </div>

      {/* Inspections */}
      {c.inspections.length > 0 && (
        <>
          <Separator />
          <div>
            <div className="text-xs font-semibold mb-2 flex items-center gap-1.5">
              <FileText className="size-3.5 text-primary" />
              {t("cases.inspections")}
            </div>
            <ul className="space-y-2">
              {c.inspections.map((ins) => (
                <li key={ins.id} className="text-xs p-2 rounded-md bg-muted/30">
                  <div className="font-medium">{lang === "ar" ? ins.inspectorAr : ins.inspector}</div>
                  <div className="text-muted-foreground text-[0.7rem] mt-0.5">
                    {new Date(ins.date).toLocaleString(lang === "ar" ? "ar-SA" : "en-GB", { dateStyle: "medium", timeStyle: "short" })}
                  </div>
                  <div className="mt-1 text-foreground">{lang === "ar" ? ins.outcomeAr : ins.outcome}</div>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}

      {/* Evidence summary */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground p-2 rounded-md bg-muted/30">
        <ImageIcon className="size-3.5" />
        <span>{t("cases.evidence")}: <span className="font-medium text-foreground">{c.evidenceCount}</span></span>
        <span className="ms-1 text-[0.65rem]">({lang === "ar" ? "محمية ضد التعديل" : "tamper-protected"})</span>
      </div>

      {/* Advance lifecycle */}
      {nextStatus && c.status !== "closed" && (
        <Button className="w-full" disabled={busy} onClick={() => onAdvance(nextStatus)}>
          {busy ? <Loader2 className="size-4 me-2 animate-spin" /> : <ArrowRight className="size-4 me-2 rtl:rotate-180" />}
          {lang === "ar" ? `انتقل إلى ${STATUS_LABEL[nextStatus].ar}` : `Advance to ${STATUS_LABEL[nextStatus].en}`}
        </Button>
      )}
    </div>
  );
}
