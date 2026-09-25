"use client";

import * as React from "react";
import {
  Building2,
  Users,
  ShieldCheck,
  Database,
  Lock,
  Globe,
  Server,
  Database as DbIcon,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useGeoWiseStore } from "@/stores/app-store";
import { ModuleHeader, ModuleBody } from "./module-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { TENANTS } from "@/lib/dummy-data";

const CLASSIFICATION_STYLE: Record<string, string> = {
  public: "bg-chart-3/15 text-chart-3 border-chart-3/30",
  internal: "bg-chart-2/15 text-chart-2 border-chart-2/30",
  confidential: "bg-chart-4/15 text-chart-4 border-chart-4/30",
  restricted: "bg-chart-5/15 text-chart-5 border-chart-5/30",
};

interface Tenant {
  id: string;
  name: string;
  nameAr: string;
  code: string;
  region: string;
  regionAr: string;
  userCount: number;
  datasetCount: number;
  activeCases: number;
  classification: string;
  dataResidency: string;
  dataResidencyAr: string;
  status: string;
}

async function fetchTenants() {
  const res = await fetch("/api/tenants");
  if (!res.ok) throw new Error("tenants");
  return res.json() as Promise<{ tenants: Tenant[] }>;
}

export function AdminModule() {
  const t = useGeoWiseStore((s) => s.t);
  const lang = useGeoWiseStore((s) => s.lang);

  const { data, isLoading } = useQuery({
    queryKey: ["tenants"],
    queryFn: fetchTenants,
    initialData: { tenants: TENANTS as unknown as Tenant[] },
  });

  const tenants = data.tenants;
  const currentTenantId = useGeoWiseStore((s) => s.user.tenantId);
  const totalUsers = tenants.reduce((a, b) => a + b.userCount, 0);
  const totalDatasets = tenants.reduce((a, b) => a + b.datasetCount, 0);
  const totalCases = tenants.reduce((a, b) => a + b.activeCases, 0);

  return (
    <div className="flex flex-col h-full min-h-0">
      <ModuleHeader
        moduleId="M01"
        titleKey="admin.title"
        subtitleKey="admin.subtitle"
        icon={Building2}
      />
      <ModuleBody>
        {/* Platform summary */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          {[
            { icon: Building2, label: t("admin.tenants"), value: tenants.length, color: "var(--chart-2)" },
            { icon: Users, label: t("admin.users"), value: totalUsers, color: "var(--chart-1)" },
            { icon: DbIcon, label: t("mod.catalog"), value: totalDatasets, color: "var(--chart-3)" },
            { icon: ShieldCheck, label: t("mod.cases"), value: totalCases, color: "var(--chart-4)" },
          ].map((kpi) => {
            const Icon = kpi.icon;
            return (
              <Card key={kpi.label} className="p-4">
                <div
                  className="grid place-items-center size-9 rounded-lg mb-3"
                  style={{ background: `color-mix(in oklch, ${kpi.color} 12%, transparent)`, color: kpi.color }}
                >
                  <Icon className="size-4" />
                </div>
                <div className="text-2xl font-semibold tabular-nums">{kpi.value.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{kpi.label}</div>
              </Card>
            );
          })}
        </div>

        {/* Tenants table */}
        <Card className="overflow-hidden">
          <div className="p-4 border-b">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Building2 className="size-4 text-primary" />
              {t("admin.tenants")}
            </h3>
          </div>

          {isLoading ? (
            <div className="p-6 text-center text-sm text-muted-foreground">{t("common.loading")}</div>
          ) : (
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-xs text-muted-foreground">
                  <tr>
                    <th className="text-start font-medium px-4 py-2.5">{t("common.tenant")}</th>
                    <th className="text-start font-medium px-4 py-2.5">{t("common.region")}</th>
                    <th className="text-end font-medium px-4 py-2.5">{t("admin.users")}</th>
                    <th className="text-end font-medium px-4 py-2.5">{t("mod.catalog")}</th>
                    <th className="text-end font-medium px-4 py-2.5">{t("mod.cases")}</th>
                    <th className="text-start font-medium px-4 py-2.5">{t("common.classification")}</th>
                    <th className="text-start font-medium px-4 py-2.5">{lang === "ar" ? "الإقامة" : "Residency"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {tenants.map((tn) => {
                    const isCurrent = tn.id === currentTenantId;
                    return (
                      <tr
                        key={tn.id}
                        className={cn(
                          "hover:bg-muted/30 transition-colors",
                          isCurrent && "bg-primary/5"
                        )}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="grid place-items-center size-8 rounded-md bg-primary/10 text-primary font-semibold text-xs shrink-0">
                              {tn.code.slice(0, 2)}
                            </div>
                            <div>
                              <div className="font-medium leading-tight">
                                {lang === "ar" ? tn.nameAr : tn.name}
                              </div>
                              <div className="text-[0.7rem] text-muted-foreground font-mono">{tn.id}</div>
                            </div>
                            {isCurrent && (
                              <Badge variant="secondary" className="text-[0.6rem] ms-1">
                                {lang === "ar" ? "حاليتي" : "Current"}
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs">{lang === "ar" ? tn.regionAr : tn.region}</td>
                        <td className="px-4 py-3 text-end tabular-nums">{tn.userCount.toLocaleString()}</td>
                        <td className="px-4 py-3 text-end tabular-nums">{tn.datasetCount}</td>
                        <td className="px-4 py-3 text-end tabular-nums">{tn.activeCases}</td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className={cn("text-[0.65rem] capitalize", CLASSIFICATION_STYLE[tn.classification])}>
                            {tn.classification}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-xs flex items-center gap-1.5">
                          <Globe className="size-3 text-muted-foreground" />
                          {lang === "ar" ? tn.dataResidencyAr : tn.dataResidency}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Tenant isolation & governance reminder */}
        <Card className="p-4 mt-4 border-dashed">
          <div className="flex items-start gap-3">
            <div className="grid place-items-center size-10 rounded-lg bg-primary/10 ring-1 ring-primary/20 text-primary shrink-0">
              <Lock className="size-5" />
            </div>
            <div className="text-sm">
              <h4 className="font-semibold mb-1">
                {lang === "ar" ? "عزل الجهات وإدارة الحوكمة" : "Tenant isolation & governance"}
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {lang === "ar"
                  ? "كل جهة معزولة على مستوى قاعدة البيانات. الاشتقاقات ترث التصنيف الأمني لمصادرها. لا تُكشف المعلومات للجهات الأخرى مهما كانت الصلاحية الظاهرية."
                  : "Each tenant is isolated at the database access layer. Derived data inherits the classification of its sources. No information is disclosed across tenants regardless of apparent UI visibility."}
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant="secondary" className="text-[0.65rem] gap-1">
                  <Server className="size-3" /> {lang === "ar" ? "عزل على مستوى DB" : "DB-level isolation"}
                </Badge>
                <Badge variant="secondary" className="text-[0.65rem] gap-1">
                  <Database className="size-3" /> {lang === "ar" ? "وراثة التصنيف" : "Classification inheritance"}
                </Badge>
                <Badge variant="secondary" className="text-[0.65rem] gap-1">
                  <ShieldCheck className="size-3" /> {lang === "ar" ? "تدقيق غير قابل للتعديل" : "Immutable audit"}
                </Badge>
              </div>
            </div>
          </div>
        </Card>
      </ModuleBody>
    </div>
  );
}
