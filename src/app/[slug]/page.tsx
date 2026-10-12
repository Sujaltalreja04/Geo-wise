"use client";

import * as React from "react";
import { notFound, useParams } from "next/navigation";
import { ROADMAPS } from "@/lib/roadmaps";
import { PlannedModule } from "@/components/modules/planned-module";

export default function PlannedSlugPage() {
  const params = useParams();
  const slug =
    typeof params?.slug === "string"
      ? params.slug
      : Array.isArray(params?.slug)
      ? params?.slug[0]
      : "";

  const roadmap = slug ? ROADMAPS[slug] : null;

  if (!roadmap) {
    notFound();
  }

  return (
    <PlannedModule
      moduleId={roadmap.moduleId}
      titleKey={roadmap.titleKey}
      icon={roadmap.icon}
      roadmap={roadmap.items}
    />
  );
}
