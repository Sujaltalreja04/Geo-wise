"use client";

import * as React from "react";
import { Clock, Construction, Wrench } from "lucide-react";
import { useGeoWiseStore } from "@/stores/app-store";
import { ModuleHeader, ModuleBody } from "./module-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PlannedModuleProps {
  moduleId: string;
  titleKey: string;
  subtitleKey?: string;
  icon?: React.ComponentType<{ className?: string }>;
  /** Bulleted roadmap notes for what this module will deliver. */
  roadmap: { en: string; ar: string }[];
}

export function PlannedModule({
  moduleId,
  titleKey,
  subtitleKey,
  icon,
  roadmap,
}: PlannedModuleProps) {
  const t = useGeoWiseStore((s) => s.t);
  const lang = useGeoWiseStore((s) => s.lang);

  return (
    <div className="flex flex-col h-full min-h-0">
      <ModuleHeader
        moduleId={moduleId}
        titleKey={titleKey}
        subtitleKey={subtitleKey ?? "common.comingSoon"}
        icon={icon}
        actions={
          <Badge variant="secondary" className="gap-1.5">
            <Clock className="size-3" />
            {t("common.comingSoon")}
          </Badge>
        }
      />
      <ModuleBody>
        <Card className="border-dashed bg-muted/20 p-8 md:p-12">
          <div className="max-w-2xl mx-auto text-center">
            <div className="grid place-items-center size-16 mx-auto rounded-2xl bg-primary/10 ring-1 ring-primary/20 text-primary mb-4">
              <Construction className="size-8" />
            </div>
            <h2 className="text-xl font-semibold mb-2">
              {lang === "ar"
                ? "هذه الوحدة قيد التطوير ضمن خارطة طريق الإصدارات القادمة"
                : "This module is on the roadmap for an upcoming release."}
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              {lang === "ar"
                ? "وفقًا لقواعد التطوير: لا تُقدَّم أي وظيفة كأنها مكتملة دون اختبار. يتم هنا عرض النطاق المُخطط للوحدة بصورة واضحة دون محاكاة لأي منطق أعمال."
                : "Per development rules: no functionality is presented as complete without testing. The planned scope is shown below without simulated business logic."}
            </p>

            <div className="text-start bg-background border rounded-lg p-5">
              <div className="flex items-center gap-2 mb-3">
                <Wrench className="size-4 text-primary" />
                <span className="text-sm font-semibold">
                  {lang === "ar" ? "نطاق الإصدار القادم" : "Planned scope"}
                </span>
              </div>
              <ul className="space-y-2 text-sm">
                {roadmap.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="mt-1.5 size-1.5 rounded-full bg-primary shrink-0" />
                    <span className="text-muted-foreground">
                      {lang === "ar" ? item.ar : item.en}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      </ModuleBody>
    </div>
  );
}
