"use client";

import * as React from "react";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Filter,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useGeoWiseStore } from "@/stores/app-store";
import { ModuleHeader, ModuleBody } from "./module-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { AuditEvent, AuditResult } from "@/lib/dummy-data";

async function fetchAudit() {
  const res = await fetch("/api/audit");
  if (!res.ok) throw new Error("audit");
  return res.json() as Promise<{ events: AuditEvent[] }>;
}

const RESULT_STYLE: Record<AuditResult, { icon: typeof CheckCircle2; cls: string }> = {
  success: { icon: CheckCircle2, cls: "bg-chart-3/15 text-chart-3 border-chart-3/30" },
  denied: { icon: XCircle, cls: "bg-chart-5/15 text-chart-5 border-chart-5/30" },
  error: { icon: AlertTriangle, cls: "bg-chart-4/15 text-chart-4 border-chart-4/30" },
};

export function AuditModule() {
  const t = useGeoWiseStore((s) => s.t);
  const lang = useGeoWiseStore((s) => s.lang);

  const [search, setSearch] = React.useState("");
  const [resultFilter, setResultFilter] = React.useState<string>("all");
  const [moduleFilter, setModuleFilter] = React.useState<string>("all");

  const { data, isLoading } = useQuery({
    queryKey: ["audit"],
    queryFn: fetchAudit,
    refetchInterval: 15_000,
  });

  const events = data?.events ?? [];
  const modules = Array.from(new Set(events.map((e) => e.module)));

  const filtered = events.filter((e) => {
    if (search) {
      const q = search.toLowerCase();
      if (!e.actor.toLowerCase().includes(q) && !e.action.toLowerCase().includes(q) && !e.target.toLowerCase().includes(q) && !e.details.toLowerCase().includes(q)) return false;
    }
    if (resultFilter !== "all" && e.result !== resultFilter) return false;
    if (moduleFilter !== "all" && e.module !== moduleFilter) return false;
    return true;
  });

  return (
    <div className="flex flex-col h-full min-h-0">
      <ModuleHeader
        moduleId="M15"
        titleKey="audit.title"
        subtitleKey="audit.subtitle"
        icon={ShieldCheck}
        actions={
          <Badge variant="outline" className="gap-1.5 text-chart-3 border-chart-3/40">
            <ShieldCheck className="size-3" />
            {lang === "ar" ? "سجل غير قابل للتعديل" : "Immutable ledger"}
          </Badge>
        }
      />
      <ModuleBody>
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-2 mb-4">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`${t("audit.actor")} / ${t("audit.action")} / ${t("audit.target")}…`}
            className="md:max-w-xs"
          />
          <Select value={resultFilter} onValueChange={setResultFilter}>
            <SelectTrigger className="w-full md:w-40">
              <Filter className="size-3.5 me-1.5 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("common.all")}</SelectItem>
              <SelectItem value="success">{lang === "ar" ? "ناجح" : "Success"}</SelectItem>
              <SelectItem value="denied">{lang === "ar" ? "مرفوض" : "Denied"}</SelectItem>
              <SelectItem value="error">{lang === "ar" ? "خطأ" : "Error"}</SelectItem>
            </SelectContent>
          </Select>
          <Select value={moduleFilter} onValueChange={setModuleFilter}>
            <SelectTrigger className="w-full md:w-52">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("common.all")}</SelectItem>
              {modules.map((m) => (
                <SelectItem key={m} value={m}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="text-xs text-muted-foreground mb-3">
          {filtered.length} / {events.length} {t("common.results")}
          <span className="ms-2">· {lang === "ar" ? "تحديث تلقائي كل ١٥ ث" : "auto-refresh 15s"}</span>
        </div>

        {/* Events timeline */}
        <Card className="p-0 overflow-hidden">
          {isLoading ? (
            <div className="p-6 text-center text-sm text-muted-foreground">{t("common.loading")}</div>
          ) : filtered.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">{t("common.noResults")}</div>
          ) : (
            <ScrollArea className="max-h-[640px]">
              <div className="divide-y">
                {filtered.map((e) => {
                  const rs = RESULT_STYLE[e.result];
                  const Icon = rs.icon;
                  return (
                    <div key={e.id} className="flex items-start gap-3 p-4 hover:bg-muted/30 transition-colors">
                      <div className={cn("grid place-items-center size-7 rounded-md shrink-0 border", rs.cls)}>
                        <Icon className="size-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          <span className="text-sm font-medium">{lang === "ar" ? e.actorAr : e.actor}</span>
                          <span className="text-muted-foreground text-xs">→</span>
                          <span className="text-sm">{lang === "ar" ? e.actionAr : e.action}</span>
                          <span className="text-muted-foreground text-xs">→</span>
                          <span className="font-mono text-xs">{e.target}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{e.details}</p>
                        <div className="flex items-center gap-3 mt-1.5 text-[0.7rem] text-muted-foreground flex-wrap">
                          <span className="font-mono">{new Date(e.timestamp).toLocaleString(lang === "ar" ? "ar-SA" : "en-GB", { dateStyle: "short", timeStyle: "medium" })}</span>
                          <span>·</span>
                          <span className="font-mono">{e.ip}</span>
                          <span>·</span>
                          <Badge variant="outline" className="text-[0.6rem]">{e.module}</Badge>
                          <span>·</span>
                          <span>{e.tenantName}</span>
                        </div>
                      </div>
                      <Badge variant="outline" className={cn("text-[0.65rem] shrink-0 capitalize", rs.cls)}>
                        {e.result}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </Card>
      </ModuleBody>
    </div>
  );
}
