"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

const PredictiveModule = dynamic(
  () => import("@/components/modules/predictive-module").then((m) => m.PredictiveModule),
  {
    ssr: false,
    loading: () => (
      <div className="flex-1 flex items-center justify-center p-12">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    ),
  }
);

export default function PredictivePage() {
  return <PredictiveModule />;
}
