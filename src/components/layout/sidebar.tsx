"use client";

import * as React from "react";
import {
  LayoutDashboard,
  Map as MapIcon,
  Database,
  Workflow,
  Upload,
  Satellite,
  ScanSearch,
  TrendingUp,
  Gavel,
  BellRing,
  FolderKanban,
  Bot,
  FileText,
  Users,
  ShieldCheck,
  Building2,
  Webhook,
  Bell,
  ServerCog,
  GraduationCap,
  ChevronDown,
  Globe,
} from "lucide-react";
import { useGeoWiseStore } from "@/stores/app-store";
import type { ModuleId } from "@/stores/app-store";
import { cn } from "@/lib/utils";

interface NavItem {
  id: ModuleId;
  icon: React.ComponentType<{ className?: string }>;
  moduleId: string;
  planned?: boolean;
}

interface NavGroup {
  labelKey: "nav.group.workspace" | "nav.group.intelligence" | "nav.group.operations" | "nav.group.governance" | "nav.group.system";
  items: NavItem[];
}

const NAV: NavGroup[] = [
  {
    labelKey: "nav.group.workspace",
    items: [
      { id: "dashboard", icon: LayoutDashboard, moduleId: "M13" },
      { id: "map", icon: MapIcon, moduleId: "M04" },
      { id: "catalog", icon: Database, moduleId: "M03" },
      { id: "analysis", icon: Workflow, moduleId: "M05" },
      { id: "ingestion", icon: Upload, moduleId: "M02", planned: true },
      { id: "imagery", icon: Satellite, moduleId: "M06", planned: true },
    ],
  },
  {
    labelKey: "nav.group.intelligence",
    items: [
      { id: "detections", icon: ScanSearch, moduleId: "M07" },
      { id: "predictive", icon: TrendingUp, moduleId: "M08", planned: true },
      { id: "rules", icon: Gavel, moduleId: "M09", planned: true },
    ],
  },
  {
    labelKey: "nav.group.operations",
    items: [
      { id: "monitoring", icon: BellRing, moduleId: "M10" },
      { id: "cases", icon: FolderKanban, moduleId: "M11" },
      { id: "assistant", icon: Bot, moduleId: "M12" },
    ],
  },
  {
    labelKey: "nav.group.governance",
    items: [
      { id: "reports", icon: FileText, moduleId: "M13.2", planned: true },
      { id: "collaboration", icon: Users, moduleId: "M14", planned: true },
      { id: "audit", icon: ShieldCheck, moduleId: "M15" },
      { id: "admin", icon: Building2, moduleId: "M01" },
    ],
  },
  {
    labelKey: "nav.group.system",
    items: [
      { id: "api", icon: Webhook, moduleId: "M16", planned: true },
      { id: "notifications", icon: Bell, moduleId: "M17", planned: true },
      { id: "ops", icon: ServerCog, moduleId: "M18", planned: true },
      { id: "onboarding", icon: GraduationCap, moduleId: "M19", planned: true },
    ],
  },
];

export function Sidebar() {
  const active = useGeoWiseStore((s) => s.activeModule);
  const setActive = useGeoWiseStore((s) => s.setActiveModule);
  const t = useGeoWiseStore((s) => s.t);
  const lang = useGeoWiseStore((s) => s.lang);
  const [collapsed, setCollapsed] = React.useState<Record<string, boolean>>({});

  const toggle = (key: string) =>
    setCollapsed((c) => ({ ...c, [key]: !c[key] }));

  return (
    <aside className="hidden md:flex md:w-64 lg:w-72 shrink-0 flex-col bg-sidebar text-sidebar-foreground border-e border-sidebar-border h-full">
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 h-16 border-b border-sidebar-border">
        <div className="grid place-items-center size-9 rounded-lg bg-primary/15 ring-1 ring-primary/30 text-primary">
          <Globe className="size-5" />
        </div>
        <div className="leading-tight">
          <div className="font-semibold text-[0.95rem] text-sidebar-foreground">
            {t("brand.name")}
          </div>
          <div className="text-[0.7rem] text-sidebar-foreground/60 truncate">
            {t("brand.tagline")}
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin py-3 px-3">
        {NAV.map((group) => {
          const isCollapsed = collapsed[group.labelKey];
          return (
            <div key={group.labelKey} className="mb-1.5">
              <button
                onClick={() => toggle(group.labelKey)}
                className="flex items-center w-full gap-1 px-3 py-1.5 text-[0.7rem] font-semibold uppercase tracking-wider text-sidebar-foreground/55 hover:text-sidebar-foreground/80 transition-colors"
                aria-expanded={!isCollapsed}
              >
                <span className="flex-1 text-start">{t(group.labelKey)}</span>
                <ChevronDown
                  className={cn(
                    "size-3.5 transition-transform",
                    isCollapsed && "rotate-180"
                  )}
                />
              </button>
              {!isCollapsed && (
                <ul className="space-y-0.5 mt-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = active === item.id;
                    return (
                      <li key={item.id}>
                        <button
                          onClick={() => setActive(item.id)}
                          className={cn(
                            "group w-full flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors relative",
                            isActive
                              ? "bg-primary/15 text-sidebar-foreground ring-1 ring-inset ring-primary/40"
                              : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                          )}
                          aria-current={isActive ? "page" : undefined}
                        >
                          {isActive && (
                            <span
                              className={cn(
                                "absolute top-1.5 bottom-1.5 w-0.5 rounded-full bg-primary",
                                lang === "ar" ? "right-1" : "left-1"
                              )}
                            />
                          )}
                          <Icon className="size-4 shrink-0" />
                          <span className="flex-1 text-start truncate">
                            {t(`mod.${item.id}` as never)}
                          </span>
                          {item.planned ? (
                            <span className="text-[0.6rem] px-1.5 py-0.5 rounded bg-sidebar-accent text-sidebar-foreground/55">
                              {lang === "ar" ? "قادم" : "Soon"}
                            </span>
                          ) : (
                            <span className="text-[0.6rem] text-sidebar-foreground/40">
                              {item.moduleId}
                            </span>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer info */}
      <div className="border-t border-sidebar-border px-4 py-3 text-[0.7rem] text-sidebar-foreground/55 leading-relaxed">
        <div className="font-medium text-sidebar-foreground/75">
          {lang === "ar" ? "بيانات مقيمة في المملكة" : "Saudi-resident data"}
        </div>
        <div className="mt-0.5">
          {lang === "ar"
            ? "توزيع البيانات مقيّد حسب التصنيف"
            : "Distribution restricted by classification"}
        </div>
      </div>
    </aside>
  );
}
