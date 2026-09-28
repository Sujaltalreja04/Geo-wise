"use client";

import * as React from "react";
import {
  Database,
  ScanSearch,
  FolderKanban,
  BellRing,
  ArrowUpRight,
  ArrowDownRight,
  Activity as ActivityIcon,
  type LucideIcon,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip as RTooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { useGeoWiseStore } from "@/stores/app-store";
import { ModuleHeader, ModuleBody } from "./module-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { ACTIVITY, DASHBOARD_KPIS } from "@/lib/dummy-data";

interface Kpi {
  key: string;
  value: number;
  delta: number;
  icon: LucideIcon;
  fmt?: (n: number) => string;
  color: string;
}

async function fetchDashboard() {
  const res = await fetch("/api/dashboard");
  if (!res.ok) throw new Error("dashboard");
  return res.json() as Promise<{
    kpis: typeof DASHBOARD_KPIS;
    activity: typeof ACTIVITY;
  }>;
}

const PIE_COLORS = ["#14b8a6", "#0ea5e9", "#84cc16", "#f59e0b", "#a855f7", "#ef4444"];

export function DashboardModule() {
  const t = useGeoWiseStore((s) => s.t);
  const lang = useGeoWiseStore((s) => s.lang);
  const setActiveModule = useGeoWiseStore((s) => s.setActiveModule);

  const { data } = useQuery({
    queryKey: ["dashboard"],
    queryFn: fetchDashboard,
    initialData: { kpis: DASHBOARD_KPIS, activity: ACTIVITY },
  });

  const kpis: Kpi[] = [
    { key: "dash.kpi.datasets", value: data.kpis.activeDatasets, delta: 7.0, icon: Database, color: "var(--chart-2)" },
    { key: "dash.kpi.detections", value: data.kpis.detections30d, delta: 12.4, icon: ScanSearch, color: "var(--chart-1)" },
    { key: "dash.kpi.openCases", value: data.kpis.openCases, delta: -8.2, icon: FolderKanban, color: "var(--chart-4)" },
    { key: "dash.kpi.alerts", value: data.kpis.activeAlerts, delta: -25.0, icon: BellRing, color: "var(--chart-5)" },
  ];

  const detectionTrend = data.kpis.newDetectionsTrend.map((v, i) => ({
    day: lang === "ar" ? `ي-${i + 1}` : `D${i + 1}`,
    count: v,
  }));

  const caseLoad = data.kpis.caseLoadByStatus.map((s) => ({
    name: s.status,
    value: s.count,
  }));

  const detByType = data.kpis.detectionsByType.map((d) => ({
    name: d.type.replace(/_/g, " "),
    value: d.count,
  }));

  const catalogGrowth = data.kpis.catalogGrowth.map((m) => ({
    month: m.month,
    count: m.count,
  }));

  return (
    <div className="flex flex-col h-full min-h-0">
      <ModuleHeader
        moduleId="M13"
        titleKey="dash.title"
        subtitleKey="dash.subtitle"
        icon={ActivityIcon}
        actions={
          <Button variant="outline" size="sm" onClick={() => setActiveModule("reports")}>
            {t("dash.viewAll")}
          </Button>
        }
      />
      <ModuleBody>
        {/* KPI grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          {kpis.map((k) => {
            const Icon = k.icon;
            const positive = k.delta >= 0;
            return (
              <Card key={k.key} className="p-4">
                <div className="flex items-start justify-between">
                  <div
                    className="grid place-items-center size-9 rounded-lg"
                    style={{ background: `color-mix(in oklch, ${k.color} 12%, transparent)`, color: k.color }}
                  >
                    <Icon className="size-4.5" />
                  </div>
                  <span
                    className={cn(
                      "inline-flex items-center gap-0.5 text-xs font-medium tabular-nums",
                      positive ? "text-chart-3" : "text-chart-5"
                    )}
                  >
                    {positive ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
                    {Math.abs(k.delta).toFixed(1)}%
                  </span>
                </div>
                <div className="mt-3">
                  <div className="text-2xl font-semibold tabular-nums">
                    {k.fmt ? k.fmt(k.value) : k.value.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">{t(k.key as never)}</div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-4">
          <Card className="p-4 lg:col-span-2">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold">{t("dash.detectionsByType")}</h3>
              <Badge variant="secondary" className="text-[0.65rem]">
                {lang === "ar" ? "آخر ١٢ يومًا" : "Last 12 days"}
              </Badge>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={detectionTrend} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gDet" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                <RTooltip
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Area type="monotone" dataKey="count" stroke="var(--chart-1)" strokeWidth={2} fill="url(#gDet)" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-4">
            <h3 className="text-sm font-semibold mb-3">{t("dash.caseLoad")}</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={caseLoad}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={2}
                >
                  {caseLoad.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <RTooltip
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-1 mt-2 text-[0.65rem]">
              {caseLoad.map((c, i) => (
                <div key={c.name} className="flex items-center gap-1.5">
                  <span className="size-2 rounded-sm" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                  <span className="capitalize text-muted-foreground">{c.name}</span>
                  <span className="ms-auto font-medium tabular-nums">{c.value}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Bottom row: catalog growth + activity feed */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <Card className="p-4 lg:col-span-2">
            <h3 className="text-sm font-semibold mb-3">{t("dash.dataGrowth")}</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={catalogGrowth} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                <RTooltip
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="count" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-4 flex flex-col">
            <h3 className="text-sm font-semibold mb-3">{t("dash.activity")}</h3>
            <ScrollArea className="flex-1 max-h-[260px]">
              <ol className="space-y-2.5">
                {data.activity.map((a) => (
                  <li key={a.id} className="flex items-start gap-2.5 text-xs">
                    <span
                      className={cn(
                        "mt-1 size-1.5 rounded-full shrink-0",
                        a.kind === "audit" ? "bg-chart-5" :
                        a.kind === "alert" ? "bg-chart-4" :
                        a.kind === "detection" ? "bg-chart-1" :
                        a.kind === "case" ? "bg-chart-2" :
                        a.kind === "analysis" ? "bg-chart-3" : "bg-muted-foreground"
                      )}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-foreground">{lang === "ar" ? a.messageAr : a.message}</div>
                      <div className="text-muted-foreground text-[0.65rem] mt-0.5">
                        {lang === "ar" ? a.actorAr : a.actor} ·{" "}
                        {new Date(a.timestamp).toLocaleString(
                          lang === "ar" ? "ar-SA" : "en-GB",
                          { dateStyle: "short", timeStyle: "short" }
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </ScrollArea>
          </Card>
        </div>

        {/* Detection breakdown by type */}
        <Card className="p-4 mt-4">
          <h3 className="text-sm font-semibold mb-3">{t("dash.detectionsByType")} (30d)</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={detByType} layout="vertical" margin={{ top: 0, right: 8, left: 30, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} width={90} />
              <RTooltip
                contentStyle={{
                  background: "var(--popover)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {detByType.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </ModuleBody>
    </div>
  );
}
