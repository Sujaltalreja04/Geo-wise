"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

const DashboardModule = dynamic(
  () =>
    import("@/components/modules/dashboard-module").then(
      (m) => m.DashboardModule
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

export default function DashboardPage() {
  return <DashboardModule />;
}
