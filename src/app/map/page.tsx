"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

const MapWorkspace = dynamic(
  () => import("@/components/map/map-workspace").then((m) => m.MapWorkspace),
  {
    ssr: false,
    loading: () => (
      <div className="flex-1 flex items-center justify-center p-12 bg-background">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    ),
  }
);

export default function MapPage() {
  return (
    <div className="w-full h-full min-h-0 flex-1 relative overflow-hidden">
      <MapWorkspace />
    </div>
  );
}
