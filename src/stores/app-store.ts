"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Lang } from "@/lib/i18n";
import { translate, type DictKey } from "@/lib/i18n";

export type ModuleId =
  | "dashboard"
  | "map"
  | "catalog"
  | "analysis"
  | "ingestion"
  | "imagery"
  | "detections"
  | "predictive"
  | "rules"
  | "monitoring"
  | "cases"
  | "assistant"
  | "reports"
  | "collaboration"
  | "audit"
  | "admin"
  | "api"
  | "notifications"
  | "ops"
  | "onboarding";

/** A mock authenticated user for the MVP. */
export interface CurrentUser {
  id: string;
  name: string;
  nameAr: string;
  email: string;
  role: "analyst" | "inspector" | "supervisor" | "administrator";
  tenantId: string;
  tenantName: string;
  tenantNameAr: string;
  permissions: string[];
}

interface GeoWiseState {
  lang: Lang;
  setLang: (lang: Lang) => void;
  toggleLang: () => void;

  activeModule: ModuleId;
  setActiveModule: (m: ModuleId) => void;

  /** Currently selected dataset id (for cross-module context). */
  selectedDatasetId: string | null;
  setSelectedDatasetId: (id: string | null) => void;

  /** Currently selected feature on the map (for the inspector). */
  selectedFeatureId: string | null;
  setSelectedFeatureId: (id: string | null) => void;

  user: CurrentUser;

  /** Convenience translator bound to current lang. */
  t: (key: DictKey) => string;
}

const DEMO_USER: CurrentUser = {
  id: "u-001",
  name: "Khalid Al-Otaibi",
  nameAr: "خالد العتيبي",
  email: "k.otaibi@momrah.gov.sa",
  role: "supervisor",
  tenantId: "t-momrah",
  tenantName: "Ministry of Municipalities & Housing",
  tenantNameAr: "وزارة الشؤون البلدية والقروية والإسكان",
  permissions: [
    "dataset:read",
    "dataset:write",
    "analysis:run",
    "case:read",
    "case:write",
    "detection:review",
    "assistant:query",
    "audit:read",
    "admin:read",
  ],
};

export const useGeoWiseStore = create<GeoWiseState>()(
  persist(
    (set, get) => ({
      lang: "ar",
      setLang: (lang) => set({ lang }),
      toggleLang: () => set({ lang: get().lang === "ar" ? "en" : "ar" }),

      activeModule: "dashboard",
      setActiveModule: (activeModule) => set({ activeModule }),

      selectedDatasetId: null,
      setSelectedDatasetId: (selectedDatasetId) => set({ selectedDatasetId }),

      selectedFeatureId: null,
      setSelectedFeatureId: (selectedFeatureId) => set({ selectedFeatureId }),

      user: DEMO_USER,

      t: (key) => translate(key, get().lang),
    }),
    {
      name: "geowise-mvp",
      partialize: (s) => ({ lang: s.lang, activeModule: s.activeModule }),
    }
  )
);

/** Hook returning a translator bound to the current language. */
export function useT() {
  const lang = useGeoWiseStore((s) => s.lang);
  return (key: DictKey) => translate(key, lang);
}
