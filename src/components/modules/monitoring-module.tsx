"use client";

import * as React from "react";
import {
  BellRing,
  Activity,
  Clock,
  Gauge,
  MapPin,
  Check,
  Pause,
  Play,
  Plus,
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
import type { Watchlist, Alert, AlertSeverity } from "@/lib/dummy-data";

async function fetchMonitoring() {
  const res = await fetch("/api/monitoring");
  if (!res.ok) throw new Error("monitoring");
  return res.json() as Promise<{ watchlists: Watchlist[]; alerts: Alert[] }>;
}

async function ackAlert(id: string) {
  const res = await fetch(`/api/monitoring/alerts`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  });
  if (!res.ok) throw new Error("ack failed");
  return res.json();
}

const SEVERITY_STYLE: Record<AlertSeverity, { dot: string; cls: string; label: { en: string; ar: string } }> = {
  critical: { dot: "bg-chart-5", cls: "bg-chart-5/15 text-chart-5 border-chart-5/30", label: { en: "Critical", ar: "حرج" } },
  warning: { dot: "bg-chart-4", cls: "bg-chart-4/15 text-chart-4 border-chart-4/30", label: { en: "Warning", ar: "تحذير" } },
  info: { dot: "bg-chart-2", cls: "bg-chart-2/15 text-chart-2 border-chart-2/30", label: { en: "Info", ar: "معلومة" } },
};

export function MonitoringModule() {
  const t = useGeoWiseStore((s) => s.t);
  const lang = useGeoWiseStore((s) => s.lang);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({ queryKey: ["monitoring"], queryFn: fetchMonitoring });
  const watchlists = data?.watchlists ?? [];
  const alerts = data?.alerts ?? [];

  const ackMut = useMutation({
    mutationFn: ackAlert,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["monitoring"] });
      qc.invalidateQueries({ queryKey: ["audit"] });
      toast.success(lang === "ar" ? "تم اعتماد التنبيه" : "Alert acknowledged");
    },
  });

  const unack = alerts.filter((a) => !a.acknowledged);

  return (
    <div className="flex flex-col h-full min-h-0">
      <ModuleHeader
        moduleId="M10"
        titleKey="monitoring.title"
        subtitleKey="monitoring.subtitle"
        icon={BellRing}
        actions={
          <Button size="sm" onClick={() => toast.info(lang === "ar" ? "محاكاة إنشاء قائمة مراقبة" : "Mock watchlist creation")}>
            <Plus className="size-3.5 me-1.5" />
            {t("monitoring.newWatchlist")}
          </Button>
        }
      />
      <ModuleBody>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {/* Live alerts */}
          <Card className="p-4 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Activity className="size-4 text-chart-5" />
                {t("monitoring.alerts")}
              </h3>
              <Badge variant="secondary" className="text-[0.65rem]">
                {unack.length} {lang === "ar" ? "غير معتمد" : "unack"}
              </Badge>
            </div>

            {isLoading ? (
              <div className="text-xs text-muted-foreground p-4">{t("common.loading")}</div>
            ) : alerts.length === 0 ? (
              <div className="text-center text-sm text-muted-foreground py-8">{t("common.noResults")}</div>
            ) : (
              <ScrollArea className="flex-1 max-h-[520px]">
                <ul className="space-y-2">
                  {alerts.map((a) => {
                    const sv = SEVERITY_STYLE[a.severity];
                    return (
                      <li
                        key={a.id}
                        className={cn(
                          "p-3 rounded-md border bg-muted/20",
                          a.acknowledged && "opacity-60"
                        )}
                      >
                        <div className="flex items-start gap-2.5">
                          <span className={cn("mt-1 size-2 rounded-full shrink-0", sv.dot)} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <Badge variant="outline" className={cn("text-[0.6rem]", sv.cls)}>
                                {lang === "ar" ? sv.label.ar : sv.label.en}
                              </Badge>
                              <span className="font-mono text-[0.65rem] text-muted-foreground">{a.id}</span>
                              {a.caseId && (
                                <Badge variant="secondary" className="text-[0.6rem]">{a.caseId}</Badge>
                              )}
                            </div>
                            <p className="text-sm font-medium">{lang === "ar" ? a.messageAr : a.message}</p>
                            <p className="text-[0.7rem] text-muted-foreground mt-1 flex items-center gap-1.5 flex-wrap">
                              <span className="inline-flex items-center gap-1">
                                <MapPin className="size-3" />
                                {a.lon.toFixed(4)}, {a.lat.toFixed(4)}
                              </span>
                              <span>·</span>
                              <span className="inline-flex items-center gap-1">
                                <Clock className="size-3" />
                                {new Date(a.triggeredAt).toLocaleString(lang === "ar" ? "ar-SA" : "en-GB", { dateStyle: "short", timeStyle: "short" })}
                              </span>
                              <span>·</span>
                              <span>{lang === "ar" ? a.watchlistNameAr : a.watchlistName}</span>
                            </p>
                          </div>
                          {!a.acknowledged && (
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={ackMut.isPending}
                              onClick={() => ackMut.mutate(a.id)}
                              className="shrink-0 h-7"
                            >
                              <Check className="size-3 me-1" />
                              {lang === "ar" ? "اعتماد" : "Ack"}
                            </Button>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </ScrollArea>
            )}
          </Card>

          {/* Watchlists */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <BellRing className="size-4 text-primary" />
                {t("monitoring.watchlists")}
              </h3>
              <Badge variant="secondary" className="text-[0.65rem]">
                {watchlists.filter((w) => w.status === "active").length}/{watchlists.length} {lang === "ar" ? "نشط" : "active"}
              </Badge>
            </div>

            <div className="space-y-2">
              {watchlists.map((w) => (
                <div key={w.id} className="p-3 rounded-md border bg-muted/20">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`size-1.5 rounded-full ${w.status === "active" ? "bg-chart-3" : "bg-muted-foreground"}`} />
                        <span className="font-mono text-[0.65rem] text-muted-foreground">{w.id}</span>
                      </div>
                      <h4 className="text-sm font-medium leading-tight">{lang === "ar" ? w.nameAr : w.name}</h4>
                      <p className="text-[0.7rem] text-muted-foreground mt-0.5">{lang === "ar" ? w.descriptionAr : w.description}</p>
                    </div>
                    <Badge variant={w.status === "active" ? "default" : "secondary"} className="text-[0.65rem] shrink-0">
                      {w.status === "active" ? (
                        <Play className="size-2.5 me-1" />
                      ) : (
                        <Pause className="size-2.5 me-1" />
                      )}
                      {w.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-[0.7rem] mt-2">
                    <div>
                      <div className="text-muted-foreground flex items-center gap-1">
                        <Clock className="size-2.5" />
                        {t("monitoring.schedule")}
                      </div>
                      <div className="font-medium mt-0.5">{lang === "ar" ? w.scheduleAr : w.schedule}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground flex items-center gap-1">
                        <Gauge className="size-2.5" />
                        {t("monitoring.threshold")}
                      </div>
                      <div className="font-medium mt-0.5">{lang === "ar" ? w.thresholdAr : w.threshold}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">{lang === "ar" ? "التنبيهات" : "Alerts"}</div>
                      <div className="font-medium tabular-nums mt-0.5">{w.alertsTriggered}</div>
                    </div>
                  </div>

                  <Separator className="my-2" />

                  <div className="flex items-center justify-between text-[0.7rem] text-muted-foreground">
                    <span>
                      {t("monitoring.lastRun")}: <span className="text-foreground font-medium">{w.status === "active" ? new Date(w.lastRun).toLocaleString(lang === "ar" ? "ar-SA" : "en-GB", { dateStyle: "short", timeStyle: "short" }) : "—"}</span>
                    </span>
                    <span>
                      {t("monitoring.nextRun")}: <span className="text-foreground font-medium">{w.nextRun === "—" ? "—" : new Date(w.nextRun).toLocaleString(lang === "ar" ? "ar-SA" : "en-GB", { dateStyle: "short", timeStyle: "short" })}</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </ModuleBody>
    </div>
  );
}
