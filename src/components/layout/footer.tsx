"use client";

import { ShieldCheck, Lock } from "lucide-react";
import { useGeoWiseStore } from "@/stores/app-store";

export function Footer() {
  const t = useGeoWiseStore((s) => s.t);
  const lang = useGeoWiseStore((s) => s.lang);

  return (
    <footer className="mt-auto border-t bg-background/95 backdrop-blur">
      <div className="px-4 md:px-6 py-3 flex flex-col sm:flex-row items-start sm:items-center gap-2 text-[0.7rem] text-muted-foreground">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="inline-flex items-center gap-1.5 font-medium text-foreground/80">
            <ShieldCheck className="size-3.5 text-primary" />
            {lang === "ar" ? "بيانات حكومية مقيّدة" : "Restricted Government Data"}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Lock className="size-3" />
            {t("footer.classified")}
          </span>
        </div>
        <div className="sm:ms-auto flex items-center gap-3">
          <span className="hidden sm:inline">
            {lang === "ar" ? "© ١٤٤٧هـ / ٢٠٢٦م" : "© 1447H / 2026G"}
          </span>
          <span className="font-medium">{t("footer.version")}</span>
        </div>
      </div>
    </footer>
  );
}
