"use client";

import * as React from "react";
import {
  Workflow,
  Play,
  History,
  CheckCircle2,
  Clock,
  Loader2,
  FileOutput,
  Cpu,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useGeoWiseStore } from "@/stores/app-store";
import { ModuleHeader, ModuleBody } from "./module-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { AnalysisDefinition, AnalysisRun } from "@/lib/dummy-data";

async function fetchAnalyses() {
  const res = await fetch("/api/analyses");
  if (!res.ok) throw new Error("analyses");
  return res.json() as Promise<{ analyses: AnalysisDefinition[]; runs: AnalysisRun[] }>;
}

async function runAnalysis(payload: { analysisId: string; params: Record<string, unknown> }) {
  const res = await fetch("/api/analyses/runs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("run failed");
  return res.json() as Promise<{ run: AnalysisRun }>;
}

export function AnalysisModule() {
  const t = useGeoWiseStore((s) => s.t);
  const lang = useGeoWiseStore((s) => s.lang);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["analyses"],
    queryFn: fetchAnalyses,
  });

  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [params, setParams] = React.useState<Record<string, string | number>>({});

  const analyses = data?.analyses ?? [];
  const runs = data?.runs ?? [];

  const selected = analyses.find((a) => a.id === selectedId) ?? null;

  // pick first runnable analysis on load
  React.useEffect(() => {
    if (!selectedId && analyses.length) {
      const first = analyses.find((a) => a.runnable);
      if (first) {
        setSelectedId(first.id);
        const defaults: Record<string, string | number> = {};
        first.parameters.forEach((p) => (defaults[p.id] = p.default));
        setParams(defaults);
      }
    }
  }, [analyses, selectedId]);

  const mutation = useMutation({
    mutationFn: runAnalysis,
    onMutate: () => {
      const toastId = toast.loading(t("analysis.run") + "…");
      return { toastId };
    },
    onSuccess: (data, _vars, ctx) => {
      toast.success(
        lang === "ar"
          ? `اكتمل التحليل خلال ${(data.run.durationMs / 1000).toFixed(1)} ث`
          : `Analysis completed in ${(data.run.durationMs / 1000).toFixed(1)}s`,
        { id: ctx?.toastId }
      );
      qc.invalidateQueries({ queryKey: ["analyses"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      qc.invalidateQueries({ queryKey: ["audit"] });
    },
    onError: (_e, _v, ctx) => {
      toast.error(lang === "ar" ? "فشل التحليل" : "Analysis failed", { id: ctx?.toastId });
    },
  });

  return (
    <div className="flex flex-col h-full min-h-0">
      <ModuleHeader
        moduleId="M05"
        titleKey="analysis.title"
        subtitleKey="analysis.subtitle"
        icon={Workflow}
      />
      <ModuleBody>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {/* Left: analysis list */}
          <Card className="p-3">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              {t("analysis.runnable")}
            </div>
            <div className="space-y-1.5">
              {isLoading && <div className="text-xs text-muted-foreground p-2">{t("common.loading")}</div>}
              {analyses.map((a) => {
                const isSel = selectedId === a.id;
                return (
                  <button
                    key={a.id}
                    onClick={() => {
                      setSelectedId(a.id);
                      const defaults: Record<string, string | number> = {};
                      a.parameters.forEach((p) => (defaults[p.id] = p.default));
                      setParams(defaults);
                    }}
                    className={cn(
                      "w-full text-start p-3 rounded-md border transition-colors",
                      isSel ? "bg-primary/10 border-primary/40" : "border-transparent hover:bg-muted/50"
                    )}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-sm font-medium truncate">
                        {lang === "ar" ? a.nameAr : a.name}
                      </span>
                      {a.runnable ? (
                        <CheckCircle2 className="size-3.5 text-chart-3 shrink-0" />
                      ) : (
                        <Clock className="size-3.5 text-muted-foreground shrink-0" />
                      )}
                    </div>
                    <div className="text-[0.7rem] text-muted-foreground truncate">
                      {lang === "ar" ? a.categoryAr : a.category} · {a.algorithmVersion}
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Center: parameter form */}
          <Card className="p-4 lg:col-span-2 flex flex-col">
            {!selected ? (
              <div className="m-auto text-sm text-muted-foreground py-12">
                {t("analysis.noRuns")}
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <Badge variant="secondary" className="text-[0.65rem] mb-1.5">
                    {lang === "ar" ? selected.categoryAr : selected.category}
                  </Badge>
                  <h2 className="text-base font-semibold">
                    {lang === "ar" ? selected.nameAr : selected.name}
                  </h2>
                  <p className="text-xs text-muted-foreground mt-1">
                    {lang === "ar" ? selected.descriptionAr : selected.description}
                  </p>
                </div>

                <Separator className="mb-4" />

                <div className="space-y-4">
                  <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {t("analysis.parameters")}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selected.parameters.map((p) => (
                      <div key={p.id} className="space-y-1.5">
                        <Label htmlFor={p.id} className="text-xs">
                          {lang === "ar" ? p.labelAr : p.label}
                        </Label>
                        {p.type === "select" ? (
                          <Select
                            value={String(params[p.id] ?? "")}
                            onValueChange={(v) => setParams((s) => ({ ...s, [p.id]: v }))}
                          >
                            <SelectTrigger id={p.id}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {p.options?.map((o) => (
                                <SelectItem key={o.value} value={o.value}>
                                  {lang === "ar" ? o.labelAr : o.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : p.type === "number" ? (
                          <Input
                            id={p.id}
                            type="number"
                            value={String(params[p.id] ?? "")}
                            onChange={(e) => setParams((s) => ({ ...s, [p.id]: Number(e.target.value) }))}
                            className="tabular-nums"
                          />
                        ) : (
                          <Input
                            id={p.id}
                            value={String(params[p.id] ?? "")}
                            onChange={(e) => setParams((s) => ({ ...s, [p.id]: e.target.value }))}
                          />
                        )}
                      </div>
                    ))}
                    {selected.parameters.length === 0 && (
                      <p className="text-xs text-muted-foreground">
                        {lang === "ar" ? "لا معاملات لهذا التحليل." : "No parameters for this analysis."}
                      </p>
                    )}
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Cpu className="size-3.5" />
                  <span>{t("analysis.algorithmVersion")}: <span className="font-mono text-foreground">{selected.algorithmVersion}</span></span>
                </div>

                <div className="mt-auto pt-4">
                  <Button
                    className="w-full"
                    disabled={!selected.runnable || mutation.isPending}
                    onClick={() =>
                      selected.runnable &&
                      mutation.mutate({ analysisId: selected.id, params })
                    }
                  >
                    {mutation.isPending ? (
                      <Loader2 className="size-4 me-2 animate-spin" />
                    ) : (
                      <Play className="size-4 me-2" />
                    )}
                    {t("analysis.run")}
                  </Button>
                  {!selected.runnable && (
                    <p className="text-[0.7rem] text-muted-foreground mt-2 text-center">
                      {lang === "ar" ? "هذا التحليل في خارطة الطريق." : "This analysis is on the roadmap."}
                    </p>
                  )}
                </div>
              </>
            )}
          </Card>
        </div>

        {/* Results / history */}
        <Card className="p-4 mt-3">
          <div className="flex items-center gap-2 text-sm font-semibold mb-3">
            <History className="size-4 text-primary" />
            {t("analysis.history")}
          </div>
          {runs.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground py-8">
              {t("analysis.noRuns")}
            </div>
          ) : (
            <ScrollArea className="max-h-[320px]">
              <div className="space-y-2">
                {runs.map((r) => (
                  <div
                    key={r.id}
                    className="flex flex-col sm:flex-row sm:items-center gap-2 p-3 rounded-md border bg-muted/20"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <FileOutput className="size-4 text-primary shrink-0" />
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate">
                          {lang === "ar" ? r.analysisNameAr : r.analysisName}
                        </div>
                        <div className="text-[0.7rem] text-muted-foreground font-mono truncate">
                          {r.id} · {r.inputs}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-xs shrink-0">
                      <span className="text-muted-foreground">
                        {lang === "ar" ? r.outputsAr : r.outputs}
                      </span>
                      <Badge variant="outline" className="text-[0.65rem] tabular-nums">
                        <Clock className="size-3 me-1" />
                        {(r.durationMs / 1000).toFixed(2)}s
                      </Badge>
                      <span className="text-[0.7rem] text-muted-foreground hidden sm:inline">
                        {new Date(r.startedAt).toLocaleString(
                          lang === "ar" ? "ar-SA" : "en-GB",
                          { dateStyle: "short", timeStyle: "short" }
                        )}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </Card>
      </ModuleBody>
    </div>
  );
}
