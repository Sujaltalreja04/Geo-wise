"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

const ReportsModule = dynamic(
  () =>
    import("@/components/modules/reports-module").then(
      (m) => m.ReportsModule
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex-1 flex items-center justify-center p-12">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    ),
  }
);

export default function ReportsPage() {
  return <ReportsModule />;
}
