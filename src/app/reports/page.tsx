"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import { SpatialAssessmentReportViewer } from "@/components/modules/spatial-assessment-report";

export default function ReportsPage() {
  return (
    <div className="container mx-auto p-4 md:p-6 max-w-7xl">
      <React.Suspense
        fallback={
          <div className="flex items-center justify-center p-12">
            <Loader2 className="size-6 animate-spin text-primary" />
          </div>
        }
      >
        <SpatialAssessmentReportViewer />
      </React.Suspense>
    </div>
  );
}
