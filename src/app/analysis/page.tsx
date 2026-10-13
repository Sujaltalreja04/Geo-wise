"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import { AssessmentDetailModule } from "@/components/modules/assessment-detail-module";

export default function AnalysisPage() {
  return (
    <div className="container mx-auto p-4 md:p-6 max-w-7xl">
      <React.Suspense
        fallback={
          <div className="flex items-center justify-center p-12">
            <Loader2 className="size-6 animate-spin text-primary" />
          </div>
        }
      >
        <AssessmentDetailModule />
      </React.Suspense>
    </div>
  );
}
