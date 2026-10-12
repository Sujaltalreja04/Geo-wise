"use client";

import * as React from "react";
import { ChevronRight } from "lucide-react";
import { useGeoWiseStore } from "@/stores/app-store";
import { cn } from "@/lib/utils";

interface ModuleHeaderProps {
  moduleId: string;
  titleKey: string;
  subtitleKey: string;
  icon?: React.ComponentType<{ className?: string }>;
  actions?: React.ReactNode;
}

export function ModuleHeader({
  moduleId,
  titleKey,
  subtitleKey,
  icon: Icon,
  actions,
}: ModuleHeaderProps) {
  const t = useGeoWiseStore((s) => s.t);

  return (
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 px-4 md:px-6 pt-4 pb-3 border-b">
      <div className="flex items-start gap-3">
        {Icon && (
          <div className="grid place-items-center size-10 rounded-lg bg-primary/10 ring-1 ring-primary/20 text-primary shrink-0">
            <Icon className="size-5" />
          </div>
        )}
        <div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold mb-1">
            <span className="hover:text-foreground transition-colors">GeoWise</span>
            <ChevronRight className="size-3 text-muted-foreground/60 rtl:rotate-180" />
            <span className="font-mono px-1.5 py-0.5 rounded bg-muted text-[0.7rem] text-foreground font-bold">{moduleId}</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground leading-tight">
            {t(titleKey as never)}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-3xl leading-relaxed font-normal">
            {t(subtitleKey as never)}
          </p>
        </div>
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}

interface ModuleBodyProps {
  children: React.ReactNode;
  className?: string;
}

export function ModuleBody({ children, className }: ModuleBodyProps) {
  return (
    <div className={cn("flex-1 overflow-y-auto scrollbar-thin p-4 md:p-6", className)}>
      {children}
    </div>
  );
}
