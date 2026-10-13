"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

const ComplianceModule = dynamic(
  () => import("@/components/modules/compliance-module").then((m) => m.ComplianceModule),
  {
    ssr: false,
    loading: () => (
      <div className="flex-1 flex items-center justify-center p-12">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    ),
  }
);

export default function CompliancePage() {
  return <ComplianceModule />;
}
