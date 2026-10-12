"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  Radio,
  Flame,
} from "lucide-react";
import { useGeoWiseStore } from "@/stores/app-store";
import type { ModuleId } from "@/stores/app-store";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface NavItem {
  id: ModuleId;
  icon: React.ComponentType<{ className?: string }>;
  moduleId: string;
  planned?: boolean;
  badge?: string;
  badgeColor?: string;
}

interface NavGroup {
  labelKey:
    | "nav.group.workspace"
    | "nav.group.intelligence"
    | "nav.group.operations"
    | "nav.group.governance"
    | "nav.group.system";
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
      { id: "detections", icon: ScanSearch, moduleId: "M07", badge: "Live" },
      { id: "predictive", icon: TrendingUp, moduleId: "M08", planned: true },
      { id: "rules", icon: Gavel, moduleId: "M09", planned: true },
    ],
  },
  {
    labelKey: "nav.group.operations",
    items: [
      {
        id: "monitoring",
        icon: BellRing,
        moduleId: "M10",
        badge: "5",
        badgeColor: "bg-red-500/20 text-red-400 border-red-500/40",
      },
      {
        id: "cases",
        icon: FolderKanban,
        moduleId: "M11",
        badge: "4",
        badgeColor: "bg-purple-500/20 text-purple-400 border-purple-500/40",
      },
      {
        id: "assistant",
        icon: Bot,
        moduleId: "M12",
        badge: "AI",
        badgeColor: "bg-teal-500/20 text-teal-300 border-teal-500/40",
      },
    ],
  },
  {
    labelKey: "nav.group.governance",
    items: [
      {
        id: "reports",
        icon: FileText,
        moduleId: "M13.2",
        badge: "Live",
        badgeColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40",
      },
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
  const pathname = usePathname();
  const setActive = useGeoWiseStore((s) => s.setActiveModule);
  const t = useGeoWiseStore((s) => s.t);
  const lang = useGeoWiseStore((s) => s.lang);
  const [collapsed, setCollapsed] = React.useState<Record<string, boolean>>({});

  const toggle = (key: string) =>
    setCollapsed((c) => ({ ...c, [key]: !c[key] }));

  return (
    <aside className="hidden md:flex md:w-64 lg:w-72 shrink-0 flex-col bg-sidebar/95 backdrop-blur-xl text-sidebar-foreground border-e border-sidebar-border h-full shadow-lg z-20">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-5 h-16 border-b border-sidebar-border/80 bg-sidebar/50">
        <div className="relative grid place-items-center size-9 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 text-slate-950 font-bold shadow-md shadow-teal-500/20 ring-1 ring-white/20">
          <Globe className="size-5" />
          <span className="absolute -top-1 -end-1 size-2 rounded-full bg-emerald-400 animate-ping" />
        </div>
        <div className="leading-tight">
          <div className="font-bold text-[0.95rem] tracking-tight text-sidebar-foreground flex items-center gap-1.5">
            <span>{t("brand.name")}</span>
            <span className="text-[0.62rem] font-mono px-1.5 py-0.2 rounded-md bg-primary/20 text-primary border border-primary/30">
              v2.1
            </span>
          </div>
          <div className="text-[0.7rem] text-sidebar-foreground/60 truncate">
            {t("brand.tagline")}
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin py-3.5 px-3 space-y-1">
        {NAV.map((group) => {
          const isCollapsed = collapsed[group.labelKey];
          return (
            <div key={group.labelKey} className="mb-2">
              <button
                onClick={() => toggle(group.labelKey)}
                className="flex items-center w-full gap-1.5 px-3 py-1.5 text-[0.68rem] font-bold uppercase tracking-wider text-sidebar-foreground/50 hover:text-sidebar-foreground/80 transition-colors rounded-md"
                aria-expanded={!isCollapsed}
              >
                <span className="flex-1 text-start">{t(group.labelKey)}</span>
                <ChevronDown
                  className={cn(
                    "size-3.5 transition-transform duration-200",
                    isCollapsed && "rotate-180"
                  )}
                />
              </button>

              {!isCollapsed && (
                <ul className="space-y-0.5 mt-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const href = `/${item.id}`;
                    const isActive =
                      pathname === href ||
                      (pathname === "/" && item.id === "dashboard");

                    return (
                      <li key={item.id}>
                        <Link
                          href={href}
                          onClick={() => setActive(item.id)}
                          className={cn(
                            "group w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs sm:text-sm font-medium transition-all relative",
                            isActive
                              ? "bg-primary text-primary-foreground font-semibold shadow-md shadow-primary/20"
                              : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                          )}
                          aria-current={isActive ? "page" : undefined}
                        >
                          <Icon
                            className={cn(
                              "size-4 shrink-0 transition-transform group-hover:scale-110",
                              isActive
                                ? "text-primary-foreground"
                                : "text-sidebar-foreground/60 group-hover:text-primary"
                            )}
                          />

                          <span className="flex-1 text-start truncate">
                            {t(`mod.${item.id}` as never)}
                          </span>

                          {/* Planned or Live Badges */}
                          {item.planned ? (
                            <span className="text-[0.6rem] px-1.5 py-0.5 rounded-md bg-sidebar-accent/80 text-sidebar-foreground/50 font-mono">
                              {lang === "ar" ? "قادم" : "Soon"}
                            </span>
                          ) : item.badge ? (
                            <span
                              className={cn(
                                "text-[0.62rem] font-mono px-1.5 py-0.2 rounded-md border font-semibold",
                                isActive
                                  ? "bg-white/20 text-white border-white/30"
                                  : item.badgeColor || "bg-sidebar-accent text-sidebar-foreground/70"
                              )}
                            >
                              {item.badge}
                            </span>
                          ) : (
                            <span
                              className={cn(
                                "text-[0.6rem] font-mono",
                                isActive
                                  ? "text-primary-foreground/70"
                                  : "text-sidebar-foreground/35"
                              )}
                            >
                              {item.moduleId}
                            </span>
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </nav>

      {/* Saudi Governance Footer Tag */}
      <div className="border-t border-sidebar-border/80 p-3.5 bg-sidebar/40 text-[0.68rem] text-sidebar-foreground/55 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-4 text-emerald-400 shrink-0" />
          <div className="leading-tight">
            <div className="font-semibold text-sidebar-foreground/80">
              {lang === "ar" ? "سيادة البيانات الوطنية" : "National Data Sovereignty"}
            </div>
            <div className="text-[0.62rem] text-sidebar-foreground/50">
              {lang === "ar" ? "نطاق محمي · KSA-GRF17" : "Tier-2 Protected · KSA-GRF17"}
            </div>
          </div>
        </div>
        <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
      </div>
    </aside>
  );
}
